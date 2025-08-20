import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, CheckSquare, Clock, AlertCircle, MoreHorizontal, Trash2, PlayCircle } from 'lucide-react';
import { taskAPI } from '../../services/api';
import { Task } from '../../types';
import toast from 'react-hot-toast';
import TaskModal from './TaskModal';
import ConfirmDialog from '../Common/ConfirmDialog';
import LoadingSpinner from '../Common/LoadingSpinner';
import Notification from '../Common/Notification';

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; task: Task | null }>({
    isOpen: false,
    task: null
  });
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [overdueNotification, setOverdueNotification] = useState<{
    isVisible: boolean;
    count: number;
  }>({ isVisible: false, count: 0 });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getTasks();
      const fetchedTasks = response.data.tasks || [];
      setTasks(fetchedTasks);
      
      // Check for overdue tasks
      const now = new Date();
      const overdueTasks = fetchedTasks.filter(task => 
        task.status !== 'completed' && 
        new Date(task.due_date) < now
      );
      
      if (overdueTasks.length > 0) {
        setOverdueNotification({ isVisible: true, count: overdueTasks.length });
      }
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const response = await taskAPI.createTask(taskData);
      if (response.data.success) {
        setTasks(prev => [response.data.task, ...prev]);
        toast.success('Task created successfully!');
      }
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return;
    
    try {
      const response = await taskAPI.updateTask(editingTask.id, taskData);
      if (response.data.success) {
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id ? response.data.task : task
        ));
        toast.success('Task updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskAPI.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const confirmDeleteTask = (task: Task) => {
    setDeleteConfirm({ isOpen: true, task });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.task) {
      handleDeleteTask(deleteConfirm.task.id);
    }
    setDeleteConfirm({ isOpen: false, task: null });
  };

  const toggleTaskSelection = (taskId: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const selectAllTasks = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return;
    
    try {
      await Promise.all(Array.from(selectedTasks).map(id => taskAPI.deleteTask(id)));
      setTasks(prev => prev.filter(task => !selectedTasks.has(task.id)));
      setSelectedTasks(new Set());
      setBulkActionMode(false);
      toast.success(`${selectedTasks.size} tasks deleted successfully!`);
    } catch (error) {
      toast.error('Failed to delete some tasks');
    }
  };

  const handleBulkStatusUpdate = async (status: 'pending' | 'in-progress' | 'completed') => {
    if (selectedTasks.size === 0) return;
    
    try {
      await Promise.all(Array.from(selectedTasks).map(id => taskAPI.updateTask(id, { status })));
      setTasks(prev => prev.map(task => 
        selectedTasks.has(task.id) ? { ...task, status } : task
      ));
      setSelectedTasks(new Set());
      setBulkActionMode(false);
      toast.success(`${selectedTasks.size} tasks updated successfully!`);
    } catch (error) {
      toast.error('Failed to update some tasks');
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleModalSave = (taskData: Partial<Task>) => {
    if (editingTask) {
      handleUpdateTask(taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  const updateTaskStatus = async (id: number, status: 'pending' | 'in-progress' | 'completed') => {
    try {
      const response = await taskAPI.updateTask(id, { status });
      if (response.data.success) {
        setTasks(prev => prev.map(task => 
          task.id === id ? { ...task, status } : task
        ));
        toast.success('Task status updated!');
      }
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckSquare className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const isTaskOverdue = (task: Task) => {
    return task.status !== 'completed' && new Date(task.due_date) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" text="Loading tasks..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Task Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Organize and track your tasks efficiently
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setBulkActionMode(!bulkActionMode)}
            className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              bulkActionMode 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            {bulkActionMode ? 'Exit Bulk' : 'Bulk Actions'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </motion.button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkActionMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-400">
                <input
                  type="checkbox"
                  checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                  onChange={selectAllTasks}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                Select All ({selectedTasks.size} selected)
              </label>
            </div>
            {selectedTasks.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkStatusUpdate('in-progress')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <PlayCircle className="w-4 h-4" />
                  Start
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('completed')}
                  className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <CheckSquare className="w-4 h-4" />
                  Complete
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border transition-shadow ${
              isTaskOverdue(task) 
                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' 
                : 'border-gray-200 dark:border-gray-700'
            } ${!bulkActionMode ? 'cursor-pointer hover:shadow-xl' : ''}`}
            onClick={() => !bulkActionMode && openEditModal(task)}
          >
            <div className="flex items-start justify-between">
              {bulkActionMode && (
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.id)}
                  onChange={() => toggleTaskSelection(task.id)}
                  className="mt-1 mr-4 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(task.status)}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {task.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {task.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className={isTaskOverdue(task) ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                    {isTaskOverdue(task) && ' (Overdue)'}
                  </span>
                  <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {task.status !== 'completed' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTaskStatus(task.id, task.status === 'pending' ? 'in-progress' : 'completed');
                    }}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      task.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {task.status === 'pending' ? 'Start' : 'Complete'}
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDeleteTask(task);
                  }}
                  className="px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-400 dark:text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Create your first task to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleModalSave}
        task={editingTask}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, task: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteConfirm.task?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Overdue Tasks Notification */}
      <Notification
        type="warning"
        title="Overdue Tasks Detected"
        message={`You have ${overdueNotification.count} task${overdueNotification.count > 1 ? 's' : ''} that ${overdueNotification.count > 1 ? 'are' : 'is'} past ${overdueNotification.count > 1 ? 'their' : 'its'} due date. Consider updating ${overdueNotification.count > 1 ? 'them' : 'it'} or extending the deadline.`}
        isVisible={overdueNotification.isVisible}
        onClose={() => setOverdueNotification({ isVisible: false, count: 0 })}
        autoClose={false}
      />
    </div>
  );
};

export default TaskManager;