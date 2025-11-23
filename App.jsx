import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Circle } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('telegram-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('telegram-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Add new task
  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks([task, ...tasks]);
      setNewTask('');
    }
  };

  // Toggle task completion
  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Counts
  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <h1 className="text-2xl font-semibold text-center text-gray-900">Task Manager</h1>
        <p className="text-sm text-gray-500 text-center mt-1">
          {activeCount} active, {completedCount} completed
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            filter === 'active'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            filter === 'completed'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Task List */}
      <div className="pb-24">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Circle size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">
              {filter === 'all'
                ? "No tasks yet. Add one below!"
                : filter === 'active'
                ? "No active tasks!"
                : "No completed tasks!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="px-4 py-4 bg-white hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300 hover:border-blue-600'
                  }`}
                >
                  {task.completed && <Check size={14} className="text-white" />}
                </button>

                {/* Task Text */}
                <div
                  className={`flex-1 ${
                    task.completed
                      ? 'text-gray-400 line-through'
                      : 'text-gray-900'
                  }`}
                >
                  {task.text}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Input (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-inset-bottom shadow-lg">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task..."
            className="flex-1 bg-gray-50 text-gray-900 placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
          <button
            onClick={addTask}
            disabled={!newTask.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
