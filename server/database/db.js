const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'assistant.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
      } else {
        console.log('✅ Connected to SQLite database');
        this.initTables();
      }
    });
  }

  initTables() {
    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, () => {
      console.log('✅ Users table ready');
    });

    // Tasks table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, () => {
      console.log('✅ Tasks table ready');
    });

    // Chat messages table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        message TEXT NOT NULL,
        response TEXT,
        type TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, () => {
      console.log('✅ Chat messages table ready');
    });

    // Analytics data table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        event_type TEXT NOT NULL,
        event_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, () => {
      console.log('✅ Analytics table ready');
    });

    // Settings table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        theme TEXT DEFAULT 'light',
        notifications BOOLEAN DEFAULT 1,
        timezone TEXT DEFAULT 'UTC',
        language TEXT DEFAULT 'en',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, () => {
      console.log('✅ User settings table ready');
      // Insert demo data after all tables are created
      setTimeout(() => this.insertDemoData(), 100);
    });
  }

  insertDemoData() {
    // Check if demo data already exists
    this.db.get("SELECT COUNT(*) as count FROM tasks", (err, row) => {
      if (err) {
        console.error('Error checking demo data:', err);
        return;
      }

      if (row.count === 0) {
        console.log('🎭 Inserting demo data...');
        
        // Demo tasks
        const demoTasks = [
          {
            title: "Complete project proposal",
            description: "Finalize the Smart Assistant Dashboard proposal with all requirements",
            status: "completed",
            priority: "high",
            due_date: new Date(Date.now() - 86400000).toISOString() // Yesterday
          },
          {
            title: "Review code architecture",
            description: "Analyze the current codebase and suggest improvements",
            status: "in-progress",
            priority: "high",
            due_date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
          },
          {
            title: "Design user interface mockups",
            description: "Create beautiful mockups for the dashboard components",
            status: "pending",
            priority: "medium",
            due_date: new Date(Date.now() + 172800000).toISOString() // Day after tomorrow
          },
          {
            title: "Set up testing framework",
            description: "Implement unit and integration tests for the application",
            status: "pending",
            priority: "medium",
            due_date: new Date(Date.now() + 259200000).toISOString() // 3 days from now
          },
          {
            title: "Deploy to production",
            description: "Configure CI/CD pipeline and deploy to cloud platform",
            status: "pending",
            priority: "low",
            due_date: new Date(Date.now() + 604800000).toISOString() // 1 week from now
          }
        ];

        demoTasks.forEach(task => {
          this.db.run(`
            INSERT INTO tasks (user_id, title, description, status, priority, due_date)
            VALUES (1, ?, ?, ?, ?, ?)
          `, [task.title, task.description, task.status, task.priority, task.due_date]);
        });

        // Demo analytics data
        const eventTypes = ['page_view', 'task_created', 'task_completed', 'chat_message', 'login'];
        for (let i = 0; i < 50; i++) {
          const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const eventData = JSON.stringify({
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            value: Math.floor(Math.random() * 100)
          });
          
          this.db.run(`
            INSERT INTO analytics (user_id, event_type, event_data)
            VALUES (1, ?, ?)
          `, [eventType, eventData]);
        }

        console.log('✅ Demo data inserted successfully');
      }
    });
  }

  // Helper methods for database operations
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database connection closed');
          resolve();
        }
      });
    });
  }
}

const database = new Database();
module.exports = database;