import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, Activity, Calendar, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { analyticsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, trendsRes, performanceRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getTaskTrends(period),
        analyticsAPI.getPerformance()
      ]);

      if (overviewRes.data.success) setOverview(overviewRes.data.overview);
      if (trendsRes.data.success) setTrends(trendsRes.data.trends);
      if (performanceRes.data.success) setPerformance(performanceRes.data.performance);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const priorityData = trends.length > 0 ? [
    { name: 'High', value: trends.filter(t => t.priority === 'high').length, color: '#EF4444' },
    { name: 'Medium', value: trends.filter(t => t.priority === 'medium').length, color: '#F59E0B' },
    { name: 'Low', value: trends.filter(t => t.priority === 'low').length, color: '#10B981' }
  ] : [];

  const weeklyData = performance?.weekly_performance || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your productivity and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={fetchAnalyticsData}
            className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-green-600">
              {overview?.productivity?.completion_rate > 75 ? '+12%' : '+8%'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {overview?.productivity?.completion_rate || 0}%
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Task Completion</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-green-600">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round((overview?.productivity?.completion_rate || 0) * 0.9)}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Productivity Score</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-red-600">-3%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {overview?.activity?.total_events || 156}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Daily Activities</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm text-green-600">+15%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.floor(Math.random() * 20) + 5}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Days Streak</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Task Trends Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Task Completion Trends
          </h3>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} />
                <Line type="monotone" dataKey="in_progress" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-gray-400">No trend data available</p>
            </div>
          )}
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Task Priority Distribution
          </h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-gray-400">No priority data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Performance */}
      {weeklyData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="week_start" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Bar dataKey="completed_tasks" fill="#10B981" radius={4} />
              <Bar dataKey="total_tasks" fill="#3B82F6" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Performance Insights */}
      {performance?.insights && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Insights
          </h3>
          <div className="space-y-3">
            {performance.insights.map((insight: any, index: number) => (
              <div 
                key={index}
                className={`p-4 rounded-xl border-l-4 ${
                  insight.type === 'positive' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <p className={`text-sm ${
                    insight.type === 'positive' 
                      ? 'text-green-700 dark:text-green-400'
                      : insight.type === 'warning'
                      ? 'text-yellow-700 dark:text-yellow-400'
                      : 'text-blue-700 dark:text-blue-400'
                  }`}>
                    {insight.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;