const express = require('express');
const router = express.Router();
const axios = require('axios');

// Mock weather data (in a real app, you'd use a weather API like OpenWeatherMap)
const mockWeatherData = {
  current: {
    location: "San Francisco, CA",
    temperature: 22,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    pressure: 1013,
    visibility: 10,
    uvIndex: 6,
    icon: "partly-cloudy"
  },
  forecast: [
    {
      day: "Today",
      high: 24,
      low: 18,
      condition: "Partly Cloudy",
      icon: "partly-cloudy",
      precipitation: 10
    },
    {
      day: "Tomorrow",
      high: 26,
      low: 19,
      condition: "Sunny",
      icon: "sunny",
      precipitation: 0
    },
    {
      day: "Thursday",
      high: 23,
      low: 17,
      condition: "Cloudy",
      icon: "cloudy",
      precipitation: 20
    },
    {
      day: "Friday",
      high: 21,
      low: 15,
      condition: "Rainy",
      icon: "rainy",
      precipitation: 80
    },
    {
      day: "Saturday",
      high: 25,
      low: 18,
      condition: "Sunny",
      icon: "sunny",
      precipitation: 5
    }
  ],
  hourly: Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    temperature: 18 + Math.random() * 8,
    condition: i % 4 === 0 ? "Rainy" : i % 3 === 0 ? "Cloudy" : "Sunny",
    precipitation: Math.random() * 100
  }))
};

// Get current weather
router.get('/current', async (req, res) => {
  try {
    // Add some randomness to make it feel more realistic
    const currentWeather = {
      ...mockWeatherData.current,
      temperature: mockWeatherData.current.temperature + (Math.random() - 0.5) * 4,
      humidity: Math.max(30, Math.min(90, mockWeatherData.current.humidity + (Math.random() - 0.5) * 20)),
      windSpeed: Math.max(0, mockWeatherData.current.windSpeed + (Math.random() - 0.5) * 8),
      lastUpdated: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      weather: currentWeather,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch weather data' });
  }
});

// Get weather forecast
router.get('/forecast', async (req, res) => {
  try {
    // Add some randomness to forecast temperatures
    const forecast = mockWeatherData.forecast.map(day => ({
      ...day,
      high: day.high + (Math.random() - 0.5) * 4,
      low: day.low + (Math.random() - 0.5) * 4,
      precipitation: Math.max(0, Math.min(100, day.precipitation + (Math.random() - 0.5) * 20))
    }));

    res.json({ 
      success: true, 
      forecast,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch weather forecast' });
  }
});

// Get hourly weather
router.get('/hourly', async (req, res) => {
  try {
    const hourly = mockWeatherData.hourly.map(hour => ({
      ...hour,
      temperature: Math.round((hour.temperature + (Math.random() - 0.5) * 3) * 10) / 10
    }));

    res.json({ 
      success: true, 
      hourly,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching hourly weather:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hourly weather' });
  }
});

// Get weather for specific location (mock endpoint)
router.get('/location/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    // Mock different weather for different cities
    const cityWeather = {
      ...mockWeatherData.current,
      location: city,
      temperature: mockWeatherData.current.temperature + (Math.random() - 0.5) * 10,
      condition: ["Sunny", "Partly Cloudy", "Cloudy", "Rainy"][Math.floor(Math.random() * 4)],
      lastUpdated: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      weather: cityWeather,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching weather for location:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch weather for location' });
  }
});

// Get weather alerts (mock data)
router.get('/alerts', async (req, res) => {
  try {
    const alerts = [
      {
        id: 1,
        type: "warning",
        title: "High UV Index Alert",
        description: "UV index will reach dangerous levels between 11 AM and 3 PM. Wear sunscreen and limit outdoor exposure.",
        severity: "moderate",
        expires: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours from now
      },
      {
        id: 2,
        type: "watch",
        title: "Air Quality Advisory",
        description: "Moderate air quality expected due to local wildfires. Sensitive individuals should limit outdoor activities.",
        severity: "minor",
        expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours from now
      }
    ];

    res.json({ 
      success: true, 
      alerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch weather alerts' });
  }
});

module.exports = router;