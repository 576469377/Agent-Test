const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get chat history
router.get('/history', async (req, res) => {
  try {
    const messages = await db.all(`
      SELECT * FROM chat_messages 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [1]);

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
  }
});

// Send a chat message and get AI response
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Save user message
    const userMessageResult = await db.run(`
      INSERT INTO chat_messages (user_id, message, type)
      VALUES (?, ?, 'user')
    `, [1, message.trim()]);

    // Generate AI response
    const aiResponse = await generateAIResponse(message);
    
    // Save AI response
    await db.run(`
      INSERT INTO chat_messages (user_id, message, type)
      VALUES (?, ?, 'ai')
    `, [1, aiResponse]);

    res.json({
      success: true,
      userMessage: {
        id: userMessageResult.id,
        message: message.trim(),
        type: 'user',
        timestamp: new Date().toISOString()
      },
      aiResponse: {
        message: aiResponse,
        type: 'ai',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ success: false, message: 'Failed to process message' });
  }
});

// Clear chat history
router.delete('/history', async (req, res) => {
  try {
    await db.run('DELETE FROM chat_messages WHERE user_id = ?', [1]);
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ success: false, message: 'Failed to clear chat history' });
  }
});

// Get chat statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN type = 'user' THEN 1 END) as user_messages,
        COUNT(CASE WHEN type = 'ai' THEN 1 END) as ai_messages,
        DATE(created_at) as last_chat_date
      FROM chat_messages 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [1]);

    const recentActivity = await db.all(`
      SELECT DATE(created_at) as date, COUNT(*) as message_count
      FROM chat_messages 
      WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [1]);

    res.json({ success: true, stats, recentActivity });
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chat statistics' });
  }
});

// Enhanced AI Response Generator with Task Integration
async function generateAIResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  try {
    // Check for task creation intent
    const taskCreationResult = await handleTaskCreation(message);
    if (taskCreationResult) {
      return taskCreationResult;
    }

    // Check for task management commands
    const taskManagementResult = await handleTaskManagement(message);
    if (taskManagementResult) {
      return taskManagementResult;
    }

    // Get contextual responses based on current task state
    const contextualResponse = await getContextualResponse(message);
    if (contextualResponse) {
      return contextualResponse;
    }

    // Handle specific question types
    if (lowerMessage.includes('weather') || lowerMessage.includes('temperature') || lowerMessage.includes('rain')) {
      return await handleWeatherQuery();
    }

    if (lowerMessage.includes('analytics') || lowerMessage.includes('productivity') || lowerMessage.includes('performance')) {
      return await handleAnalyticsQuery();
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('commands')) {
      return getHelpResponse();
    }

    // Greeting responses with context
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return await getPersonalizedGreeting();
    }

    // Default intelligent responses
    return await getIntelligentResponse(message);

  } catch (error) {
    console.error('Error in AI response generation:', error);
    return "🤖 I encountered an issue processing your request. Please try again or let me know if you need help with specific tasks!";
  }
}

// Handle task creation from natural language
async function handleTaskCreation(message) {
  const lowerMessage = message.toLowerCase();
  
  // Patterns that indicate task creation intent
  const taskCreationPatterns = [
    /(?:create|add|make|new)\s+(?:a\s+)?task/i,
    /(?:remind me to|need to|have to|should)\s+(.+)/i,
    /(?:i need to|i have to|i should)\s+(.+)/i,
    /(?:task:|todo:|add:)\s*(.+)/i
  ];

  for (const pattern of taskCreationPatterns) {
    const match = message.match(pattern);
    if (match) {
      const taskDescription = match[1] || extractTaskFromMessage(message);
      if (taskDescription && taskDescription.length > 3) {
        const taskData = parseTaskDetails(taskDescription);
        
        try {
          const result = await db.run(`
            INSERT INTO tasks (user_id, title, description, priority, due_date)
            VALUES (?, ?, ?, ?, ?)
          `, [1, taskData.title, taskData.description, taskData.priority, taskData.due_date]);

          return `✅ **Task Created Successfully!**\n\n📋 **Title:** ${taskData.title}\n📝 **Description:** ${taskData.description || 'No description'}\n⚡ **Priority:** ${taskData.priority}\n📅 **Due Date:** ${taskData.due_date ? new Date(taskData.due_date).toLocaleDateString() : 'Not set'}\n\nI've added this to your task list. You can view and manage it in the Tasks section!`;
        } catch (error) {
          console.error('Error creating task:', error);
          return "❌ I had trouble creating that task. Please try again or use the Add Task button in the Tasks section.";
        }
      }
    }
  }
  return null;
}

// Handle task management commands
async function handleTaskManagement(message) {
  const lowerMessage = message.toLowerCase();

  // Show current tasks
  if (lowerMessage.includes('show') && (lowerMessage.includes('tasks') || lowerMessage.includes('todo'))) {
    return await showCurrentTasks();
  }

  // Mark task as complete
  const completeMatch = message.match(/(?:complete|finish|done)\s+(?:task\s+)?(.+)/i);
  if (completeMatch) {
    return await completeTaskByName(completeMatch[1]);
  }

  // Show overdue tasks
  if (lowerMessage.includes('overdue') || (lowerMessage.includes('late') && lowerMessage.includes('task'))) {
    return await showOverdueTasks();
  }

  // Show today's tasks
  if (lowerMessage.includes('today') && lowerMessage.includes('task')) {
    return await showTodaysTasks();
  }

  return null;
}

// Get contextual response based on current state
async function getContextualResponse(message) {
  const stats = await getTaskStats();
  const lowerMessage = message.toLowerCase();

  // If user seems stressed or overwhelmed
  if (lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('busy')) {
    if (stats.pending > 5) {
      return `😌 I understand you're feeling overwhelmed. You have ${stats.pending} pending tasks, which can feel like a lot. Here's what I suggest:\n\n1️⃣ **Focus on high-priority tasks first**\n2️⃣ **Break large tasks into smaller ones**\n3️⃣ **Set realistic daily goals**\n\nWould you like me to help you prioritize your most important tasks for today?`;
    } else {
      return `💪 I can see you have ${stats.pending} pending tasks, which is quite manageable! You're doing great. Would you like me to help you organize them by priority?`;
    }
  }

  // Motivational responses based on productivity
  if (lowerMessage.includes('motivation') || lowerMessage.includes('productive')) {
    if (stats.completed_today > 0) {
      return `🎉 You've already completed ${stats.completed_today} task${stats.completed_today > 1 ? 's' : ''} today! That's fantastic progress. Keep this momentum going! 🚀`;
    } else {
      return `🌟 Every great achievement starts with the decision to try. You have ${stats.pending} tasks waiting - how about we tackle one together? Which one feels most important to you right now?`;
    }
  }

  return null;
}

// Show current tasks summary
async function showCurrentTasks() {
  try {
    const tasks = await db.all(`
      SELECT * FROM tasks 
      WHERE user_id = ? AND status != 'completed'
      ORDER BY 
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
        due_date ASC
      LIMIT 5
    `, [1]);

    if (tasks.length === 0) {
      return "🎉 **Amazing!** You have no pending tasks right now. You're all caught up! Time to relax or maybe add some new goals? 😊";
    }

    let response = `📋 **Your Current Tasks** (showing top ${Math.min(tasks.length, 5)}):\n\n`;
    
    tasks.forEach((task, index) => {
      const priority = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
      const dueDate = task.due_date ? ` (Due: ${new Date(task.due_date).toLocaleDateString()})` : '';
      const status = task.status === 'in-progress' ? ' 🔄' : '';
      
      response += `${index + 1}. ${priority} **${task.title}**${status}${dueDate}\n`;
    });

    if (tasks.length >= 5) {
      response += "\n📝 *Showing top 5 tasks. View all in the Tasks section.*";
    }

    response += "\n\n💡 **Tip:** Say 'complete [task name]' to mark a task as done!";
    return response;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return "❌ I had trouble fetching your tasks. Please check the Tasks section.";
  }
}

// Complete task by name
async function completeTaskByName(taskName) {
  try {
    const task = await db.get(`
      SELECT * FROM tasks 
      WHERE user_id = ? AND LOWER(title) LIKE ? AND status != 'completed'
      ORDER BY 
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END
      LIMIT 1
    `, [1, `%${taskName.toLowerCase()}%`]);

    if (!task) {
      return `🤔 I couldn't find a pending task matching "${taskName}". Could you check the exact task name or use the Tasks section to mark it complete?`;
    }

    await db.run(`
      UPDATE tasks 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [task.id]);

    return `🎉 **Excellent work!** I've marked "${task.title}" as completed! \n\n✅ That's another task off your list. You're making great progress! 🚀`;
  } catch (error) {
    console.error('Error completing task:', error);
    return `❌ I had trouble updating that task. Please try using the Tasks section to mark it complete.`;
  }
}

// Show overdue tasks
async function showOverdueTasks() {
  try {
    const overdueTasks = await db.all(`
      SELECT * FROM tasks 
      WHERE user_id = ? AND due_date < datetime('now') AND status != 'completed'
      ORDER BY due_date ASC
    `, [1]);

    if (overdueTasks.length === 0) {
      return "🎉 **Great news!** You have no overdue tasks! You're staying on top of your schedule perfectly. 👏";
    }

    let response = `⚠️ **Overdue Tasks** (${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''}):\n\n`;
    
    overdueTasks.slice(0, 5).forEach((task, index) => {
      const priority = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
      const overdueDays = Math.floor((new Date() - new Date(task.due_date)) / (1000 * 60 * 60 * 24));
      
      response += `${index + 1}. ${priority} **${task.title}** (${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue)\n`;
    });

    response += "\n💡 **Tip:** Consider prioritizing these tasks or adjusting their due dates if needed.";
    return response;
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    return "❌ I had trouble checking your overdue tasks. Please check the Tasks section.";
  }
}

// Show today's tasks
async function showTodaysTasks() {
  try {
    const todaysTasks = await db.all(`
      SELECT * FROM tasks 
      WHERE user_id = ? AND DATE(due_date) = DATE('now') AND status != 'completed'
      ORDER BY 
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END
    `, [1]);

    if (todaysTasks.length === 0) {
      return "📅 **Today's Schedule:** You have no tasks due today! Perfect time to get ahead on tomorrow's work or take a well-deserved break. 😊";
    }

    let response = `📅 **Today's Tasks** (${todaysTasks.length} task${todaysTasks.length > 1 ? 's' : ''}):\n\n`;
    
    todaysTasks.forEach((task, index) => {
      const priority = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
      const status = task.status === 'in-progress' ? ' 🔄' : '';
      
      response += `${index + 1}. ${priority} **${task.title}**${status}\n`;
    });

    response += "\n🎯 **You've got this!** Focus on one task at a time for best results.";
    return response;
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    return "❌ I had trouble fetching today's tasks. Please check the Tasks section.";
  }
}

// Get task statistics
async function getTaskStats() {
  try {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN due_date < datetime('now') AND status != 'completed' THEN 1 END) as overdue,
        COUNT(CASE WHEN DATE(created_at) = DATE('now') AND status = 'completed' THEN 1 END) as completed_today
      FROM tasks 
      WHERE user_id = ?
    `, [1]);
    return stats || { total: 0, completed: 0, pending: 0, in_progress: 0, overdue: 0, completed_today: 0 };
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return { total: 0, completed: 0, pending: 0, in_progress: 0, overdue: 0, completed_today: 0 };
  }
}

// Handle weather queries
async function handleWeatherQuery() {
  return "🌤️ The weather looks great today! It's partly cloudy with a comfortable temperature of 22°C. Perfect for outdoor activities!\n\n💡 **Tip:** Good weather is perfect for outdoor tasks or taking breaks between work!";
}

// Handle analytics queries
async function handleAnalyticsQuery() {
  const stats = await getTaskStats();
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  return `📊 **Your Productivity Snapshot:**\n\n📈 **Completion Rate:** ${completionRate}%\n✅ **Completed:** ${stats.completed} tasks\n🔄 **In Progress:** ${stats.in_progress} tasks\n📋 **Pending:** ${stats.pending} tasks\n⚠️ **Overdue:** ${stats.overdue} tasks\n🎯 **Today:** ${stats.completed_today} completed\n\n${completionRate > 75 ? '🌟 Excellent productivity!' : completionRate > 50 ? '👍 Good progress!' : '💪 You can do better!'}\n\nCheck the Analytics page for detailed insights!`;
}

// Get personalized greeting
async function getPersonalizedGreeting() {
  const stats = await getTaskStats();
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  
  let greeting = `${timeGreeting}! 👋\n\n`;
  
  if (stats.overdue > 0) {
    greeting += `⚠️ You have ${stats.overdue} overdue task${stats.overdue > 1 ? 's' : ''}. Should we tackle those first?`;
  } else if (stats.pending > 0) {
    greeting += `📋 You have ${stats.pending} pending task${stats.pending > 1 ? 's' : ''} waiting. Ready to be productive?`;
  } else {
    greeting += `🎉 All caught up! No pending tasks. Time to set new goals or take a break!`;
  }
  
  return greeting;
}

// Get intelligent response for general messages
async function getIntelligentResponse(message) {
  const stats = await getTaskStats();
  
  const responses = [
    `🤔 I understand. With ${stats.pending} pending tasks, is there something specific you'd like help with?`,
    `💭 Interesting! Speaking of which, you have ${stats.in_progress} task${stats.in_progress !== 1 ? 's' : ''} in progress. Need help prioritizing?`,
    `✨ Thanks for sharing! By the way, you've completed ${stats.completed_today} task${stats.completed_today !== 1 ? 's' : ''} today. How can I help you stay productive?`,
    `🎯 I'm here to help! With your current workload, would you like me to suggest the best next task to focus on?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Enhanced help response
function getHelpResponse() {
  return `🤖 **Smart Assistant Commands & Features:**\n\n📋 **Task Management:**\n• "Create task: [description]" - Add new tasks\n• "Show my tasks" - View current tasks\n• "Complete [task name]" - Mark tasks done\n• "Today's tasks" - See today's schedule\n• "Overdue tasks" - Check overdue items\n\n💬 **Smart Chat:**\n• Ask about productivity and analytics\n• Get motivational tips and insights\n• Natural conversation about your work\n\n🌤️ **Other Features:**\n• Weather updates and forecasts\n• Productivity analytics and trends\n• Personalized recommendations\n\n💡 **Pro Tip:** Just talk naturally! I understand context and can help with almost anything related to your productivity and tasks.`;
}

// Parse task details from natural language
function parseTaskDetails(description) {
  const taskData = {
    title: description,
    description: null,
    priority: 'medium',
    due_date: null
  };

  // Extract priority
  if (/\b(urgent|important|high|critical)\b/i.test(description)) {
    taskData.priority = 'high';
    taskData.title = taskData.title.replace(/\b(urgent|important|high|critical)\b/gi, '').trim();
  } else if (/\b(low|minor|small)\b/i.test(description)) {
    taskData.priority = 'low';
    taskData.title = taskData.title.replace(/\b(low|minor|small)\b/gi, '').trim();
  }

  // Extract due dates
  const datePatterns = [
    /\b(today|tonight)\b/i,
    /\b(tomorrow|tmrw)\b/i,
    /\b(next week|next monday|next tuesday|next wednesday|next thursday|next friday)\b/i,
    /\bin (\d+) days?\b/i,
    /\by (\d{4}-\d{2}-\d{2})\b/i
  ];

  for (const pattern of datePatterns) {
    const match = taskData.title.match(pattern);
    if (match) {
      if (match[0].toLowerCase().includes('today')) {
        taskData.due_date = new Date().toISOString();
      } else if (match[0].toLowerCase().includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        taskData.due_date = tomorrow.toISOString();
      } else if (match[1] && !isNaN(match[1])) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(match[1]));
        taskData.due_date = futureDate.toISOString();
      }
      taskData.title = taskData.title.replace(pattern, '').trim();
      break;
    }
  }

  // Clean up title
  taskData.title = taskData.title
    .replace(/^(to|that i need to|i need to|need to|should|have to|must)\s+/i, '')
    .replace(/[.!]+$/, '')
    .trim();

  // Capitalize first letter
  if (taskData.title) {
    taskData.title = taskData.title.charAt(0).toUpperCase() + taskData.title.slice(1);
  }

  return taskData;
}

// Extract task description from message
function extractTaskFromMessage(message) {
  const cleanMessage = message
    .replace(/^(create|add|make|new)\s+(a\s+)?task\s*/i, '')
    .replace(/^(task:|todo:|add:)\s*/i, '')
    .trim();
  
  return cleanMessage;
}

// New endpoint for AI-assisted task actions
router.post('/task-action', async (req, res) => {
  try {
    const { action, data } = req.body;
    
    switch (action) {
      case 'create':
        const result = await db.run(`
          INSERT INTO tasks (user_id, title, description, priority, due_date)
          VALUES (?, ?, ?, ?, ?)
        `, [1, data.title, data.description, data.priority, data.due_date]);
        
        const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [result.id]);
        res.json({ success: true, task: newTask, message: 'Task created successfully' });
        break;
        
      case 'complete':
        const completedResult = await db.run(`
          UPDATE tasks 
          SET status = 'completed', updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND user_id = ?
        `, [data.taskId, 1]);
        
        if (completedResult.changes > 0) {
          res.json({ success: true, message: 'Task marked as completed' });
        } else {
          res.status(404).json({ success: false, message: 'Task not found' });
        }
        break;
        
      case 'list':
        const tasks = await db.all(`
          SELECT * FROM tasks 
          WHERE user_id = ? AND status != 'completed'
          ORDER BY 
            CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
            due_date ASC
          LIMIT ?
        `, [1, data.limit || 5]);
        
        res.json({ success: true, tasks });
        break;
        
      default:
        res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in AI task action:', error);
    res.status(500).json({ success: false, message: 'Failed to perform task action' });
  }
});

module.exports = router;