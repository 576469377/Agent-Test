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

// AI Response Generator with different response types
async function generateAIResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

  // Weather-related responses
  if (lowerMessage.includes('weather') || lowerMessage.includes('temperature') || lowerMessage.includes('rain')) {
    const weatherResponses = [
      "🌤️ The weather looks great today! It's partly cloudy with a comfortable temperature of 22°C. Perfect for outdoor activities!",
      "☀️ I checked the weather for you - it's sunny and warm! Don't forget to wear sunscreen if you're going outside.",
      "🌧️ Looks like there might be some rain later today. You might want to bring an umbrella just in case!",
      "🌡️ The temperature is quite pleasant today at 22°C. Great weather for a walk or outdoor lunch!"
    ];
    return weatherResponses[Math.floor(Math.random() * weatherResponses.length)];
  }

  // Task-related responses
  if (lowerMessage.includes('task') || lowerMessage.includes('todo') || lowerMessage.includes('work')) {
    const taskResponses = [
      "📋 I can help you manage your tasks! You currently have several pending tasks. Would you like me to show you the most urgent ones?",
      "✅ Great job on staying productive! I see you've completed some tasks recently. Keep up the good work!",
      "📝 Would you like me to add a new task to your list? Just tell me what you need to do and when it's due.",
      "⏰ You have some tasks coming up soon. Should I send you a reminder or help you prioritize them?"
    ];
    return taskResponses[Math.floor(Math.random() * taskResponses.length)];
  }

  // Time-related responses
  if (lowerMessage.includes('time') || lowerMessage.includes('date') || lowerMessage.includes('schedule')) {
    const timeResponses = [
      "🕐 The current time is " + new Date().toLocaleTimeString() + ". How can I help you plan your day?",
      "📅 Today is " + new Date().toLocaleDateString() + ". Do you have any important events or deadlines coming up?",
      "⏰ I can help you schedule tasks or set reminders. What would you like to plan for?",
      "📆 Your schedule looks manageable today. Would you like me to help you organize your upcoming tasks?"
    ];
    return timeResponses[Math.floor(Math.random() * timeResponses.length)];
  }

  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    const greetingResponses = [
      "👋 Hello! I'm your Smart Personal Assistant. How can I help you today?",
      "😊 Hi there! I'm here to help you manage your tasks, check the weather, and answer any questions you might have.",
      "🌟 Hey! Welcome to your personal dashboard. What would you like to do today?",
      "✨ Hello! I'm ready to assist you with anything you need. Just let me know how I can help!"
    ];
    return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
  }

  // Help-related responses
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return "🤖 I'm your Smart Personal Assistant! Here's what I can help you with:\n\n📋 **Task Management** - Create, update, and track your tasks\n🌤️ **Weather Updates** - Get current weather and forecasts\n💬 **Smart Chat** - Answer questions and provide assistance\n📊 **Analytics** - View your productivity insights\n⚙️ **Settings** - Customize your dashboard experience\n\nJust ask me anything or use the dashboard features!";
  }

  // Default responses for general conversation
  const generalResponses = [
    "🤔 That's interesting! Could you tell me more about that? I'm here to help in any way I can.",
    "💭 I understand what you're saying. Is there something specific you'd like me to help you with?",
    "✨ Thanks for sharing that with me! How can I assist you further?",
    "🎯 I'm processing your message. Would you like me to help you with tasks, weather information, or something else?",
    "💡 That's a great point! Is there any way I can help you take action on that?",
    "🔍 I'm here to help! Could you let me know what specific assistance you're looking for?",
    "🚀 I'm ready to help you be more productive! What would you like to work on today?",
    "🌟 I appreciate you sharing that! Let me know if you need help with organizing tasks, checking weather, or anything else."
  ];

  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

module.exports = router;