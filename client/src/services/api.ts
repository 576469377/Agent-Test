import axios from 'axios';
import { Task, ChatMessage, WeatherData, WeatherForecast, AnalyticsData } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Task API
export const taskAPI = {
  getTasks: () => api.get<{ success: boolean; tasks: Task[] }>('/tasks'),
  createTask: (task: Partial<Task>) => api.post<{ success: boolean; task: Task }>('/tasks', task),
  updateTask: (id: number, task: Partial<Task>) => api.put<{ success: boolean; task: Task }>(`/tasks/${id}`, task),
  deleteTask: (id: number) => api.delete<{ success: boolean }>(`/tasks/${id}`),
  getTaskStats: () => api.get<{ success: boolean; stats: any; summary: any }>('/tasks/stats'),
};

// Chat API
export const chatAPI = {
  getHistory: () => api.get<{ success: boolean; messages: ChatMessage[] }>('/chat/history'),
  sendMessage: (message: string) => api.post<{ 
    success: boolean; 
    userMessage: ChatMessage; 
    aiResponse: ChatMessage 
  }>('/chat/message', { message }),
  clearHistory: () => api.delete<{ success: boolean }>('/chat/history'),
  getStats: () => api.get<{ success: boolean; stats: any }>('/chat/stats'),
};

// Weather API
export const weatherAPI = {
  getCurrent: () => api.get<{ success: boolean; weather: WeatherData }>('/weather/current'),
  getForecast: () => api.get<{ success: boolean; forecast: WeatherForecast[] }>('/weather/forecast'),
  getHourly: () => api.get<{ success: boolean; hourly: any[] }>('/weather/hourly'),
  getAlerts: () => api.get<{ success: boolean; alerts: any[] }>('/weather/alerts'),
  getLocation: (city: string) => api.get<{ success: boolean; weather: WeatherData }>(`/weather/location/${city}`),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get<{ success: boolean; overview: AnalyticsData }>('/analytics/overview'),
  getTaskTrends: (period?: string) => api.get<{ success: boolean; trends: any[] }>(`/analytics/tasks/trends?period=${period || '7d'}`),
  getActivityHeatmap: () => api.get<{ success: boolean; heatmap: any[] }>('/analytics/activity/heatmap'),
  getPerformance: () => api.get<{ success: boolean; performance: any }>('/analytics/performance'),
  logEvent: (eventType: string, eventData?: any) => api.post<{ success: boolean }>('/analytics/event', { event_type: eventType, event_data: eventData }),
  exportData: (format?: string) => api.get<{ success: boolean; data: any }>(`/analytics/export?format=${format || 'json'}`),
};

// Health check
export const healthAPI = {
  check: () => api.get<{ status: string; timestamp: string; uptime: number; version: string }>('/health'),
};

export default api;