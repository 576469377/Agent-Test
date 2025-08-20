# Smart Personal Dashboard 📊

A beautiful, modern web-based personal dashboard featuring weather information, task management, note-taking, calculator, timer, and customizable themes.

## Features

### 🌤️ Weather Widget
- Real-time weather information (mock data for demo)
- Customizable location
- Temperature, humidity, and conditions display

### ✅ Task Management
- Add, complete, and delete tasks
- Local storage persistence
- Clean, intuitive interface

### 📝 Quick Notes
- Rich text area for notes and ideas
- Auto-save functionality
- Local storage persistence

### 🧮 Calculator
- Full-featured calculator
- Standard arithmetic operations
- Memory functions and percentage calculations

### ⏰ Timer
- Customizable countdown timer
- Start, pause, and reset functionality
- Audio notification when timer completes

### ⚙️ Settings & Customization
- Light/Dark/Auto theme options
- Weather location configuration
- Data export/import functionality

## Technologies Used

- **HTML5** - Semantic markup and modern web standards
- **CSS3** - Modern styling with CSS Grid, Flexbox, and custom properties
- **JavaScript (ES6+)** - Modern JavaScript with classes and modules
- **Local Storage API** - Data persistence
- **Progressive Web App** - Installable with offline capabilities
- **Service Worker** - Caching and offline functionality

## Getting Started

1. Clone this repository
2. Open `index.html` in a modern web browser
3. Enjoy your personal dashboard!

### For Development

No build process required! This is a vanilla JavaScript application that runs directly in the browser.

For local development with live reloading, you can use any simple HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

## Keyboard Shortcuts

- `Ctrl/Cmd + S` - Save notes
- `Ctrl/Cmd + N` - Add new task
- `Ctrl/Cmd + R` - Refresh weather
- `Ctrl/Cmd + T` - Toggle theme
- `Esc` - Close task form

## PWA Features

This dashboard can be installed as a Progressive Web App:

1. Open the dashboard in Chrome/Edge
2. Click the install button in the address bar
3. The app will be installed and can be used offline

## Browser Compatibility

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+

## Data Privacy

All data is stored locally in your browser using localStorage. No data is sent to external servers (except for weather data when implemented with a real API).

## Responsive Design

The dashboard is fully responsive and works great on:
- 🖥️ Desktop computers
- 💻 Laptops
- 📱 Tablets
- 📱 Mobile phones

## Contributing

This project demonstrates modern web development practices and can be extended with additional features:

- Integration with real weather APIs
- Cloud synchronization
- Additional widgets (calendar, habits tracker, etc.)
- Enhanced theming options
- Voice commands
- Notifications

## License

MIT License - feel free to use this project as a starting point for your own dashboard!

---

Built with ❤️ using modern web technologies to showcase AI-powered development capabilities.
