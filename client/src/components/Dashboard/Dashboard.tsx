import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  MessageCircle,
  Cloud,
  TrendingUp,
  Clock,
  Calendar,
  Target,
} from 'lucide-react';
import { taskAPI, weatherAPI, analyticsAPI } from '../../services/api';
import { Task, WeatherData, AnalyticsData } from '../../types';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tasksRes, weatherRes, analyticsRes] = await Promise.all([
          taskAPI.getTasks(),
          weatherAPI.getCurrent(),
          analyticsAPI.getOverview(),
        ]);

        setTasks(tasksRes.data.tasks || []);
        setWeather(weatherRes.data.weather || null);
        setAnalytics(analyticsRes.data.overview || null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const urgentTasks = tasks.filter(task => 
    task.priority === 'high' && task.status !== 'completed'
  ).slice(0, 3);

  const completedToday = tasks.filter(task => {
    const today = new Date().toDateString();
    const taskDate = new Date(task.updated_at).toDateString();
    return task.status === 'completed' && today === taskDate;
  }).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-full"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, John! 👋
            </h1>
            <p className="text-purple-100 text-lg">
              You have {tasks.filter(t => t.status === 'pending').length} pending tasks and {completedToday} completed today.
            </p>
          </div>
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="absolute top-4 right-4 text-6xl opacity-20"
          >
            ✨
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={analytics?.tasks.total_tasks || 0}
          icon={CheckSquare}
          color="from-blue-500 to-cyan-500"
          change="+12%"
        />
        <StatCard
          title="Completed Today"
          value={completedToday}
          icon={Target}
          color="from-green-500 to-emerald-500"
          change="+8%"
        />
        <StatCard
          title="Productivity Score"
          value={`${analytics?.productivity.score || 0}%`}
          icon={TrendingUp}
          color="from-purple-500 to-pink-500"
          change="+15%"
        />
        <StatCard
          title="Active Chats"
          value={analytics?.chat.total_messages || 0}
          icon={MessageCircle}
          color="from-orange-500 to-red-500"
          change="+5%"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Overview */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Urgent Tasks
              </h2>
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <div className="space-y-4">
              {urgentTasks.length > 0 ? (
                urgentTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border-l-4 border-red-500"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No urgent tasks! Great job! 🎉</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Weather & Quick Actions */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Weather Widget */}
          {weather && (
            <div className="bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-30"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Cloud className="w-8 h-8" />
                  <span className="text-sm opacity-90">{weather.location}</span>
                </div>
                <div className="text-4xl font-bold mb-2">
                  {Math.round(weather.temperature)}°C
                </div>
                <div className="text-lg opacity-90 mb-4">
                  {weather.condition}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="opacity-75">Humidity</span>
                    <div className="font-semibold">{weather.humidity}%</div>
                  </div>
                  <div>
                    <span className="opacity-75">Wind</span>
                    <div className="font-semibold">{weather.windSpeed} km/h</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <QuickActionButton
                icon={CheckSquare}
                label="Add New Task"
                color="from-green-500 to-emerald-500"
                onClick={() => {/* Handle action */}}
              />
              <QuickActionButton
                icon={MessageCircle}
                label="Start AI Chat"
                color="from-blue-500 to-cyan-500"
                onClick={() => {/* Handle action */}}
              />
              <QuickActionButton
                icon={Calendar}
                label="View Calendar"
                color="from-purple-500 to-pink-500"
                onClick={() => {/* Handle action */}}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// StatCard component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, change }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-green-600 dark:text-green-400 mt-1">{change}</p>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

// QuickActionButton component
interface QuickActionButtonProps {
  icon: React.ElementType;
  label: string;
  color: string;
  onClick: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon: Icon, label, color, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
  >
    <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <span className="text-gray-900 dark:text-white font-medium">{label}</span>
  </motion.button>
);

export default Dashboard;