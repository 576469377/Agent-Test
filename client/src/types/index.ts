export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  user_id?: number;
  message: string;
  type: 'user' | 'ai';
  timestamp: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  icon: string;
  lastUpdated?: string;
}

export interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitation: number;
}

export interface AnalyticsData {
  tasks: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    overdue_tasks: number;
  };
  chat: {
    total_messages: number;
    user_messages: number;
    ai_responses: number;
  };
  productivity: {
    score: number;
    completion_rate: number;
    trend: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}