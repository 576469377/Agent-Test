import React from 'react';
import { BarChart3, TrendingUp, Activity, Calendar } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your productivity and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-green-600">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">95%</h3>
          <p className="text-gray-600 dark:text-gray-400">Task Completion</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-green-600">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">87</h3>
          <p className="text-gray-600 dark:text-gray-400">Productivity Score</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-red-600">-3%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">156</h3>
          <p className="text-gray-600 dark:text-gray-400">Daily Activities</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm text-green-600">+15%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
          <p className="text-gray-600 dark:text-gray-400">Days Streak</p>
        </div>
      </div>

      <div className="text-center py-20">
        <BarChart3 className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-4">
          Advanced Analytics Coming Soon
        </h3>
        <p className="text-gray-400 dark:text-gray-500 max-w-md mx-auto">
          We're working on detailed charts, graphs, and insights to help you track your productivity and performance over time.
        </p>
      </div>
    </div>
  );
};

export default Analytics;