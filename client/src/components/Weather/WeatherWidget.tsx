import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Thermometer } from 'lucide-react';
import { weatherAPI } from '../../services/api';
import { WeatherData, WeatherForecast } from '../../types';

const WeatherWidget: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      const [currentRes, forecastRes] = await Promise.all([
        weatherAPI.getCurrent(),
        weatherAPI.getForecast(),
      ]);

      setCurrentWeather(currentRes.data.weather);
      setForecast(forecastRes.data.forecast || []);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-12 h-12 text-yellow-500" />;
      case 'rainy':
      case 'rain':
        return <CloudRain className="w-12 h-12 text-blue-500" />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="w-12 h-12 text-gray-500" />;
      default:
        return <Cloud className="w-12 h-12 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Weather Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Stay updated with current conditions and forecasts
        </p>
      </div>

      {/* Current Weather */}
      {currentWeather && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{currentWeather.location}</h2>
                  <p className="text-blue-100">Current Conditions</p>
                </div>
                {getWeatherIcon(currentWeather.condition)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="text-6xl font-bold mb-2">
                    {Math.round(currentWeather.temperature)}°C
                  </div>
                  <div className="text-xl text-blue-100 mb-4">
                    {currentWeather.condition}
                  </div>
                  <div className="text-sm text-blue-200">
                    Feels like {Math.round(currentWeather.temperature + 2)}°C
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <Droplets className="w-5 h-5 mr-2" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <div className="text-2xl font-bold">{currentWeather.humidity}%</div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <Wind className="w-5 h-5 mr-2" />
                      <span className="text-sm">Wind</span>
                    </div>
                    <div className="text-2xl font-bold">{currentWeather.windSpeed} km/h</div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <Thermometer className="w-5 h-5 mr-2" />
                      <span className="text-sm">Pressure</span>
                    </div>
                    <div className="text-2xl font-bold">{currentWeather.pressure} hPa</div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center mb-2">
                      <Eye className="w-5 h-5 mr-2" />
                      <span className="text-sm">Visibility</span>
                    </div>
                    <div className="text-2xl font-bold">{currentWeather.visibility} km</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          5-Day Forecast
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center"
            >
              <div className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {day.day}
              </div>
              <div className="flex justify-center mb-4">
                {getWeatherIcon(day.condition)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {day.condition}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-900 dark:text-white">
                  {Math.round(day.high)}°
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {Math.round(day.low)}°
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center text-xs text-blue-600 dark:text-blue-400">
                  <Droplets className="w-3 h-3 mr-1" />
                  {Math.round(day.precipitation)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Weather Alerts
          </h4>
          <div className="space-y-3">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <div className="flex items-center mb-2">
                <Sun className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800 dark:text-yellow-300">UV Advisory</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                High UV index expected between 11 AM - 3 PM. Use sunscreen.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Air Quality
          </h4>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 dark:text-gray-400">AQI</span>
            <span className="text-2xl font-bold text-green-600">42</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div className="bg-green-500 h-2 rounded-full w-1/3"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Good - Air quality is satisfactory
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default WeatherWidget;