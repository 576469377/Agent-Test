const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get dashboard analytics overview
router.get('/overview', async (req, res) => {
  try {
    // Task analytics
    const taskStats = await db.get(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN due_date < datetime('now') AND status != 'completed' THEN 1 END) as overdue_tasks
      FROM tasks 
      WHERE user_id = ?
    `, [1]);

    // Chat analytics
    const chatStats = await db.get(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN type = 'user' THEN 1 END) as user_messages,
        COUNT(CASE WHEN type = 'ai' THEN 1 END) as ai_responses
      FROM chat_messages 
      WHERE user_id = ?
    `, [1]);

    // Activity analytics (last 7 days)
    const activityData = await db.all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as activity_count,
        event_type
      FROM analytics 
      WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
      GROUP BY DATE(created_at), event_type
      ORDER BY date DESC
    `, [1]);

    // Productivity score calculation
    const completionRate = taskStats.total_tasks > 0 ? 
      Math.round((taskStats.completed_tasks / taskStats.total_tasks) * 100) : 0;
    
    const productivityScore = Math.max(0, Math.min(100, 
      completionRate * 0.6 + 
      (taskStats.overdue_tasks === 0 ? 40 : Math.max(0, 40 - taskStats.overdue_tasks * 10))
    ));

    res.json({
      success: true,
      overview: {
        tasks: taskStats,
        chat: chatStats,
        productivity: {
          score: productivityScore,
          completion_rate: completionRate,
          trend: completionRate > 75 ? 'excellent' : completionRate > 50 ? 'good' : 'needs_improvement'
        },
        activity: activityData
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics overview' });
  }
});

// Get task completion trends
router.get('/tasks/trends', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case '24h':
        dateFilter = "datetime('now', '-1 day')";
        break;
      case '7d':
        dateFilter = "datetime('now', '-7 days')";
        break;
      case '30d':
        dateFilter = "datetime('now', '-30 days')";
        break;
      default:
        dateFilter = "datetime('now', '-7 days')";
    }

    const trends = await db.all(`
      SELECT 
        DATE(updated_at) as date,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress
      FROM tasks 
      WHERE user_id = ? AND updated_at >= ${dateFilter}
      GROUP BY DATE(updated_at)
      ORDER BY date ASC
    `, [1]);

    // Priority distribution
    const priorityStats = await db.all(`
      SELECT 
        priority,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
      FROM tasks 
      WHERE user_id = ?
      GROUP BY priority
    `, [1]);

    res.json({
      success: true,
      trends,
      priority_distribution: priorityStats,
      period,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching task trends:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch task trends' });
  }
});

// Get activity heatmap data
router.get('/activity/heatmap', async (req, res) => {
  try {
    const heatmapData = await db.all(`
      SELECT 
        DATE(created_at) as date,
        CAST(strftime('%H', created_at) AS INTEGER) as hour,
        COUNT(*) as activity_count
      FROM analytics 
      WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
      GROUP BY DATE(created_at), CAST(strftime('%H', created_at) AS INTEGER)
      ORDER BY date DESC, hour ASC
    `, [1]);

    // Generate synthetic heatmap data for demo purposes
    const syntheticData = [];
    const now = new Date();
    for (let d = 29; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];
      
      for (let h = 0; h < 24; h++) {
        const activity = Math.floor(Math.random() * 20);
        if (activity > 5) { // Only include hours with some activity
          syntheticData.push({
            date: dateStr,
            hour: h,
            activity_count: activity
          });
        }
      }
    }

    res.json({
      success: true,
      heatmap: [...heatmapData, ...syntheticData].slice(0, 200), // Limit to reasonable amount
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching activity heatmap:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity heatmap' });
  }
});

// Get performance metrics
router.get('/performance', async (req, res) => {
  try {
    // Average task completion time
    const completionMetrics = await db.all(`
      SELECT 
        priority,
        AVG(JULIANDAY(updated_at) - JULIANDAY(created_at)) as avg_completion_days,
        COUNT(*) as total_completed
      FROM tasks 
      WHERE user_id = ? AND status = 'completed'
      GROUP BY priority
    `, [1]);

    // Weekly performance comparison
    const weeklyPerformance = await db.all(`
      SELECT 
        strftime('%W', created_at) as week,
        strftime('%Y', created_at) as year,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(*) as total
      FROM tasks 
      WHERE user_id = ? AND created_at >= datetime('now', '-8 weeks')
      GROUP BY strftime('%Y-%W', created_at)
      ORDER BY year DESC, week DESC
      LIMIT 8
    `, [1]);

    // Generate performance insights
    const insights = [];
    
    if (completionMetrics.length > 0) {
      const avgCompletionTime = completionMetrics.reduce((sum, metric) => 
        sum + (metric.avg_completion_days || 0), 0) / completionMetrics.length;
      
      if (avgCompletionTime < 2) {
        insights.push({
          type: 'positive',
          message: 'Great job! You complete tasks quickly on average.',
          icon: '🚀'
        });
      } else if (avgCompletionTime > 5) {
        insights.push({
          type: 'suggestion',
          message: 'Consider breaking down larger tasks into smaller, manageable chunks.',
          icon: '💡'
        });
      }
    }

    // Check for overdue tasks
    const overdueTasks = await db.get(`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE user_id = ? AND due_date < datetime('now') AND status != 'completed'
    `, [1]);

    if (overdueTasks.count > 0) {
      insights.push({
        type: 'warning',
        message: `You have ${overdueTasks.count} overdue task${overdueTasks.count > 1 ? 's' : ''}. Consider prioritizing them.`,
        icon: '⚠️'
      });
    } else {
      insights.push({
        type: 'positive',
        message: 'Excellent! No overdue tasks. Keep up the great work!',
        icon: '✅'
      });
    }

    res.json({
      success: true,
      performance: {
        completion_metrics: completionMetrics,
        weekly_performance: weeklyPerformance.reverse(),
        insights
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch performance metrics' });
  }
});

// Log analytics event
router.post('/event', async (req, res) => {
  try {
    const { event_type, event_data } = req.body;
    
    if (!event_type) {
      return res.status(400).json({ success: false, message: 'Event type is required' });
    }

    await db.run(`
      INSERT INTO analytics (user_id, event_type, event_data)
      VALUES (?, ?, ?)
    `, [1, event_type, JSON.stringify(event_data || {})]);

    res.json({ success: true, message: 'Event logged successfully' });
  } catch (error) {
    console.error('Error logging analytics event:', error);
    res.status(500).json({ success: false, message: 'Failed to log event' });
  }
});

// Export analytics data
router.get('/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const data = {
      tasks: await db.all('SELECT * FROM tasks WHERE user_id = ?', [1]),
      chat_messages: await db.all('SELECT * FROM chat_messages WHERE user_id = ?', [1]),
      analytics: await db.all('SELECT * FROM analytics WHERE user_id = ?', [1]),
      exported_at: new Date().toISOString()
    };

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      let csv = 'Type,Date,Data\n';
      data.tasks.forEach(task => {
        csv += `Task,"${task.created_at}","${task.title}"\n`;
      });
      data.chat_messages.forEach(msg => {
        csv += `Chat,"${msg.created_at}","${msg.message.replace(/"/g, '""')}"\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.csv"');
      res.send(csv);
    } else {
      res.json({ success: true, data });
    }
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
});

module.exports = router;