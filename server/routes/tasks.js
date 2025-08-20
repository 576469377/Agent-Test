const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await db.all(`
      SELECT * FROM tasks 
      WHERE user_id = ? 
      ORDER BY 
        CASE status 
          WHEN 'pending' THEN 1 
          WHEN 'in-progress' THEN 2 
          WHEN 'completed' THEN 3 
        END,
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        due_date ASC
    `, [1]); // Using user_id = 1 for demo

    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, priority = 'medium', due_date } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const result = await db.run(`
      INSERT INTO tasks (user_id, title, description, priority, due_date)
      VALUES (?, ?, ?, ?, ?)
    `, [1, title, description, priority, due_date]);

    const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [result.id]);
    
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date } = req.body;

    const result = await db.run(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [title, description, status, priority, due_date, id, 1]);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    
    res.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, 1]);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
});

// Get task statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.all(`
      SELECT 
        status,
        COUNT(*) as count,
        priority,
        COUNT(CASE WHEN due_date < datetime('now') AND status != 'completed' THEN 1 END) as overdue
      FROM tasks 
      WHERE user_id = ?
      GROUP BY status, priority
    `, [1]);

    const summary = await db.get(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN due_date < datetime('now') AND status != 'completed' THEN 1 END) as overdue
      FROM tasks 
      WHERE user_id = ?
    `, [1]);

    res.json({ success: true, stats, summary });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch task statistics' });
  }
});

module.exports = router;