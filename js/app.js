// Smart Personal Dashboard - Main Application
class SmartDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedData();
        this.updateClock();
        this.initializeTheme();
        this.loadWeather();
        this.showWelcomeMessage();
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Weather refresh
        document.getElementById('refreshWeather').addEventListener('click', () => this.loadWeather());
        
        // Tasks
        document.getElementById('addTaskBtn').addEventListener('click', () => this.showAddTaskForm());
        document.getElementById('saveTaskBtn').addEventListener('click', () => this.saveTask());
        document.getElementById('cancelTaskBtn').addEventListener('click', () => this.hideAddTaskForm());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveTask();
        });
        
        // Notes
        document.getElementById('saveNotesBtn').addEventListener('click', () => this.saveNotes());
        document.getElementById('notesTextarea').addEventListener('input', () => this.handleNotesInput());
        
        // Calculator
        document.querySelectorAll('.calc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCalculatorInput(e.target.dataset.value));
        });
        document.getElementById('clearCalc').addEventListener('click', () => this.clearCalculator());
        
        // Timer
        document.getElementById('startTimerBtn').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimerBtn').addEventListener('click', () => this.pauseTimer());
        document.getElementById('resetTimerBtn').addEventListener('click', () => this.resetTimer());
        
        // Settings
        document.getElementById('updateLocationBtn').addEventListener('click', () => this.updateWeatherLocation());
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.setTheme(e.target.dataset.theme));
        });
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => this.importData());
        document.getElementById('importFileInput').addEventListener('change', (e) => this.handleImportFile(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        const root = document.documentElement;
        const themeIcon = document.querySelector('.theme-icon');
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }
        
        root.setAttribute('data-theme', theme);
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        
        // Update active theme option
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === (localStorage.getItem('dashboard-theme') || 'light')) {
                btn.classList.add('active');
            }
        });
        
        localStorage.setItem('dashboard-theme', localStorage.getItem('dashboard-theme') || theme);
        this.showToast('Theme updated successfully', 'success');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('dashboard-theme', newTheme);
        this.setTheme(newTheme);
    }

    // Clock Functionality
    updateClock() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: true,
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit'
            });
            document.getElementById('currentTime').textContent = timeString;
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }

    // Weather Functionality
    async loadWeather() {
        const weatherData = document.getElementById('weatherData');
        const weatherLoading = document.getElementById('weatherLoading');
        const weatherError = document.getElementById('weatherError');
        
        // Hide all states
        weatherData.style.display = 'none';
        weatherError.style.display = 'none';
        weatherLoading.style.display = 'block';
        
        try {
            const location = localStorage.getItem('weather-location') || 'New York';
            
            // Mock weather data (in a real app, you'd call a weather API)
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
            
            const mockWeatherData = this.generateMockWeatherData(location);
            
            document.getElementById('temperature').textContent = `${mockWeatherData.temperature}°F`;
            document.getElementById('weatherDescription').textContent = mockWeatherData.description;
            document.getElementById('feelsLike').textContent = `${mockWeatherData.feelsLike}°F`;
            document.getElementById('humidity').textContent = `${mockWeatherData.humidity}%`;
            document.getElementById('location').textContent = mockWeatherData.location;
            
            weatherLoading.style.display = 'none';
            weatherData.style.display = 'block';
            
        } catch (error) {
            console.error('Weather loading failed:', error);
            weatherLoading.style.display = 'none';
            weatherError.style.display = 'block';
            this.showToast('Failed to load weather data', 'error');
        }
    }

    generateMockWeatherData(location) {
        const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
        const baseTemp = Math.floor(Math.random() * 40) + 50; // 50-90°F
        
        return {
            temperature: baseTemp,
            feelsLike: baseTemp + Math.floor(Math.random() * 10) - 5,
            humidity: Math.floor(Math.random() * 60) + 30, // 30-90%
            description: conditions[Math.floor(Math.random() * conditions.length)],
            location: location
        };
    }

    updateWeatherLocation() {
        const locationInput = document.getElementById('locationInput');
        const location = locationInput.value.trim();
        
        if (location) {
            localStorage.setItem('weather-location', location);
            locationInput.value = '';
            this.loadWeather();
            this.showToast('Weather location updated', 'success');
        } else {
            this.showToast('Please enter a valid location', 'warning');
        }
    }

    // Tasks Functionality
    showAddTaskForm() {
        document.getElementById('addTaskForm').style.display = 'block';
        document.getElementById('taskInput').focus();
    }

    hideAddTaskForm() {
        document.getElementById('addTaskForm').style.display = 'none';
        document.getElementById('taskInput').value = '';
    }

    saveTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();
        
        if (taskText) {
            const tasks = this.getTasks();
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            this.saveTasks(tasks);
            this.renderTasks();
            this.hideAddTaskForm();
            this.showToast('Task added successfully', 'success');
        } else {
            this.showToast('Please enter a task description', 'warning');
        }
    }

    getTasks() {
        return JSON.parse(localStorage.getItem('dashboard-tasks') || '[]');
    }

    saveTasks(tasks) {
        localStorage.setItem('dashboard-tasks', JSON.stringify(tasks));
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const tasks = this.getTasks();
        
        if (tasks.length === 0) {
            tasksList.innerHTML = '<div class="empty-state">No tasks yet. Add one above!</div>';
            return;
        }
        
        tasksList.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="dashboard.toggleTask(${task.id})"
                >
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="task-delete" onclick="dashboard.deleteTask(${task.id})">✕</button>
            </div>
        `).join('');
    }

    toggleTask(taskId) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks(tasks);
            this.renderTasks();
            this.showToast(task.completed ? 'Task completed!' : 'Task reopened', 'success');
        }
    }

    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        this.saveTasks(filteredTasks);
        this.renderTasks();
        this.showToast('Task deleted', 'info');
    }

    // Notes Functionality
    saveNotes() {
        const notesTextarea = document.getElementById('notesTextarea');
        const notesContent = notesTextarea.value;
        
        localStorage.setItem('dashboard-notes', notesContent);
        this.updateNotesStatus('Notes saved successfully ✓');
        this.showToast('Notes saved', 'success');
    }

    handleNotesInput() {
        this.updateNotesStatus('Unsaved changes...');
    }

    updateNotesStatus(message) {
        document.getElementById('notesStatus').textContent = message;
        setTimeout(() => {
            document.getElementById('notesStatus').textContent = '';
        }, 3000);
    }

    // Calculator Functionality
    initCalculator() {
        this.calculatorState = {
            display: '0',
            previousValue: null,
            operation: null,
            waitingForInput: false
        };
        this.updateCalculatorDisplay();
    }

    handleCalculatorInput(value) {
        if (!this.calculatorState) this.initCalculator();
        
        const { display, previousValue, operation, waitingForInput } = this.calculatorState;
        
        if (value >= '0' && value <= '9') {
            this.handleNumberInput(value);
        } else if (value === '.') {
            this.handleDecimalInput();
        } else if (['+', '-', '*', '/'].includes(value)) {
            this.handleOperatorInput(value);
        } else if (value === '=') {
            this.handleEqualsInput();
        } else if (value === 'C') {
            this.clearCalculator();
        } else if (value === '±') {
            this.handleSignToggle();
        } else if (value === '%') {
            this.handlePercentage();
        }
    }

    handleNumberInput(number) {
        const { display, waitingForInput } = this.calculatorState;
        
        if (waitingForInput || display === '0') {
            this.calculatorState.display = number;
            this.calculatorState.waitingForInput = false;
        } else {
            this.calculatorState.display = display + number;
        }
        
        this.updateCalculatorDisplay();
    }

    handleDecimalInput() {
        const { display, waitingForInput } = this.calculatorState;
        
        if (waitingForInput) {
            this.calculatorState.display = '0.';
            this.calculatorState.waitingForInput = false;
        } else if (display.indexOf('.') === -1) {
            this.calculatorState.display = display + '.';
        }
        
        this.updateCalculatorDisplay();
    }

    handleOperatorInput(operator) {
        const { display, previousValue, operation } = this.calculatorState;
        const inputValue = parseFloat(display);
        
        if (previousValue === null) {
            this.calculatorState.previousValue = inputValue;
        } else if (operation) {
            const currentValue = this.calculate(previousValue, inputValue, operation);
            this.calculatorState.display = String(currentValue);
            this.calculatorState.previousValue = currentValue;
            this.updateCalculatorDisplay();
        }
        
        this.calculatorState.waitingForInput = true;
        this.calculatorState.operation = operator;
    }

    handleEqualsInput() {
        const { display, previousValue, operation } = this.calculatorState;
        const inputValue = parseFloat(display);
        
        if (previousValue !== null && operation) {
            const result = this.calculate(previousValue, inputValue, operation);
            this.calculatorState.display = String(result);
            this.calculatorState.previousValue = null;
            this.calculatorState.operation = null;
            this.calculatorState.waitingForInput = true;
            this.updateCalculatorDisplay();
        }
    }

    handleSignToggle() {
        const { display } = this.calculatorState;
        if (display !== '0') {
            this.calculatorState.display = display.startsWith('-') 
                ? display.substring(1) 
                : '-' + display;
            this.updateCalculatorDisplay();
        }
    }

    handlePercentage() {
        const { display } = this.calculatorState;
        const value = parseFloat(display);
        this.calculatorState.display = String(value / 100);
        this.updateCalculatorDisplay();
    }

    calculate(firstValue, secondValue, operation) {
        switch (operation) {
            case '+': return firstValue + secondValue;
            case '-': return firstValue - secondValue;
            case '*': return firstValue * secondValue;
            case '/': return secondValue !== 0 ? firstValue / secondValue : 0;
            default: return secondValue;
        }
    }

    clearCalculator() {
        this.initCalculator();
    }

    updateCalculatorDisplay() {
        const display = this.calculatorState.display;
        document.getElementById('calcDisplay').textContent = display.length > 12 
            ? parseFloat(display).toExponential(6) 
            : display;
    }

    // Timer Functionality
    initTimer() {
        this.timerState = {
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
            isRunning: false,
            intervalId: null
        };
    }

    startTimer() {
        if (!this.timerState) this.initTimer();
        
        const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
        const totalSeconds = minutes * 60 + seconds;
        
        if (totalSeconds <= 0) {
            this.showToast('Please set a valid time', 'warning');
            return;
        }
        
        this.timerState.totalSeconds = totalSeconds;
        this.timerState.isRunning = true;
        
        document.getElementById('startTimerBtn').style.display = 'none';
        document.getElementById('pauseTimerBtn').style.display = 'inline-block';
        
        this.timerState.intervalId = setInterval(() => {
            this.timerState.totalSeconds--;
            this.updateTimerDisplay();
            
            if (this.timerState.totalSeconds <= 0) {
                this.timerFinished();
            }
        }, 1000);
        
        this.updateTimerStatus('Timer running...');
    }

    pauseTimer() {
        if (this.timerState && this.timerState.isRunning) {
            clearInterval(this.timerState.intervalId);
            this.timerState.isRunning = false;
            
            document.getElementById('startTimerBtn').style.display = 'inline-block';
            document.getElementById('pauseTimerBtn').style.display = 'none';
            
            this.updateTimerStatus('Timer paused');
        }
    }

    resetTimer() {
        if (this.timerState) {
            clearInterval(this.timerState.intervalId);
            this.initTimer();
            
            document.getElementById('startTimerBtn').style.display = 'inline-block';
            document.getElementById('pauseTimerBtn').style.display = 'none';
            document.getElementById('timerDisplay').textContent = '00:00';
            
            this.updateTimerStatus('Timer reset');
        }
    }

    timerFinished() {
        this.resetTimer();
        this.updateTimerStatus('⏰ Time\'s up!');
        this.showToast('Timer finished!', 'success');
        
        // Play notification sound (if available)
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeATl+zPLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DoumUeAQ==');
            audio.play().catch(() => {}); // Ignore errors if audio can't play
        } catch (e) {}
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerState.totalSeconds / 60);
        const seconds = this.timerState.totalSeconds % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = display;
    }

    updateTimerStatus(status) {
        document.getElementById('timerStatus').textContent = status;
    }

    // Data Management
    exportData() {
        const data = {
            tasks: this.getTasks(),
            notes: localStorage.getItem('dashboard-notes') || '',
            theme: localStorage.getItem('dashboard-theme') || 'light',
            weatherLocation: localStorage.getItem('weather-location') || 'New York',
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully', 'success');
    }

    importData() {
        document.getElementById('importFileInput').click();
    }

    handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.tasks) {
                    this.saveTasks(data.tasks);
                    this.renderTasks();
                }
                
                if (data.notes) {
                    localStorage.setItem('dashboard-notes', data.notes);
                    document.getElementById('notesTextarea').value = data.notes;
                }
                
                if (data.theme) {
                    localStorage.setItem('dashboard-theme', data.theme);
                    this.setTheme(data.theme);
                }
                
                if (data.weatherLocation) {
                    localStorage.setItem('weather-location', data.weatherLocation);
                }
                
                this.showToast('Data imported successfully', 'success');
                
            } catch (error) {
                console.error('Import failed:', error);
                this.showToast('Failed to import data. Invalid file format.', 'error');
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }

    // Load saved data on initialization
    loadSavedData() {
        // Load notes
        const savedNotes = localStorage.getItem('dashboard-notes');
        if (savedNotes) {
            document.getElementById('notesTextarea').value = savedNotes;
        }
        
        // Load tasks
        this.renderTasks();
        
        // Load weather location
        const savedLocation = localStorage.getItem('weather-location');
        if (savedLocation) {
            document.getElementById('locationInput').placeholder = `Current: ${savedLocation}`;
        }
        
        // Initialize calculator
        this.initCalculator();
        
        // Initialize timer
        this.initTimer();
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    this.saveNotes();
                    break;
                case 'n':
                    event.preventDefault();
                    this.showAddTaskForm();
                    break;
                case 'r':
                    event.preventDefault();
                    this.loadWeather();
                    break;
                case 't':
                    event.preventDefault();
                    this.toggleTheme();
                    break;
            }
        }
        
        if (event.key === 'Escape') {
            this.hideAddTaskForm();
        }
    }

    // Toast notifications
    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        }[type] || 'ℹ️';
        
        toast.innerHTML = `<span>${icon}</span><span>${this.escapeHtml(message)}</span>`;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // Welcome message
    showWelcomeMessage() {
        setTimeout(() => {
            this.showToast('Welcome to your Smart Dashboard! 🚀', 'success', 4000);
        }, 1000);
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new SmartDashboard();
});

// Service Worker Registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}