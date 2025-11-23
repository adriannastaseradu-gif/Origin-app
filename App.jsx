import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Circle, Loader2 } from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  where
} from 'firebase/firestore';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  // Get user ID on mount - always use localStorage for consistency
  useEffect(() => {
    // First, try to get stored user ID
    let storedUserId = localStorage.getItem('telegram_user_id');
    
    // If no stored ID, try to get Telegram user ID
    if (!storedUserId && window.Telegram && window.Telegram.WebApp) {
      try {
        const tg = window.Telegram.WebApp;
        tg.ready();
        
        // Try multiple ways to get Telegram user ID
        const telegramUserId = 
          tg.initDataUnsafe?.user?.id || 
          tg.initDataUnsafe?.user_id ||
          tg.initData?.user?.id ||
          (tg.initData ? JSON.parse(new URLSearchParams(tg.initData).get('user') || '{}')?.id : null);
        
        if (telegramUserId) {
          storedUserId = `telegram_${telegramUserId}`;
          localStorage.setItem('telegram_user_id', storedUserId);
          console.log('Using Telegram user ID:', telegramUserId);
        }
      } catch (error) {
        console.warn('Error getting Telegram user ID:', error);
      }
    }
    
    // If still no ID, generate a new one
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('telegram_user_id', storedUserId);
      console.log('Generated new user ID:', storedUserId);
    }
    
    // Always use the stored ID for consistency
    setUserId(storedUserId);
    setLoading(false);
    console.log('Current user ID:', storedUserId);
  }, []);

  // Load tasks from Firestore in real-time
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    // Create a query for tasks filtered by userId
    // Start with simple query (no orderBy) to avoid index requirement
    console.log('Setting up Firestore listener for userId:', userId);
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasksData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          tasksData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
          });
        });
        // Sort by createdAt descending (newest first) in case orderBy didn't work
        tasksData.sort((a, b) => b.createdAt - a.createdAt);
        setTasks(tasksData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        
        // Check if it's an index error
        if (error.code === 'failed-precondition') {
          setError('Firestore index needed. Check console for link to create it.');
          console.error('Index required. Create index for: userId (Ascending), createdAt (Descending)');
        } else {
          setError(`Failed to load tasks: ${error.message}. Check Firebase configuration.`);
        }
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [userId]);

  // Add new task
  const addTask = async () => {
    if (!newTask.trim() || !userId) {
      console.warn('Cannot add task: newTask=', newTask, 'userId=', userId);
      return;
    }

    try {
      setError(null);
      const taskData = {
        text: newTask.trim(),
        completed: false,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      console.log('Adding task with userId:', userId);
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      console.log('Task added successfully with ID:', docRef.id);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
      setError(`Failed to add task: ${error.message}. Please try again.`);
    }
  };

  // Toggle task completion
  const toggleTask = async (id) => {
    if (!userId) return;

    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, {
        completed: !task.completed,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    if (!userId) return;

    try {
      const taskRef = doc(db, 'tasks', id);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
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

  // Loading state
  if (loading || !userId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading Task Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <h1 className="text-2xl font-semibold text-center text-gray-900">Task Manager</h1>
        <p className="text-sm text-gray-500 text-center mt-1">
          {activeCount} active, {completedCount} completed
        </p>
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && userId && (
          <div className="mt-2 text-xs text-gray-400 text-center">
            User ID: {userId.substring(0, 20)}...
          </div>
        )}
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
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
            disabled={!userId || loading}
            className="flex-1 bg-gray-50 text-gray-900 placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={addTask}
            disabled={!newTask.trim() || !userId || loading}
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
