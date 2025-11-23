import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Circle, Loader2, User, Mail, Phone, Building, Edit, X, Save, LogOut, Users, BarChart3, ListTodo, Calendar, Flag, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from './supabase';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('clients'); // 'clients', 'dashboard'
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clientStatuses, setClientStatuses] = useState([]);
  const [customStatuses, setCustomStatuses] = useState([]);
  const [draggedClient, setDraggedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Filter by client status
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showManageStatuses, setShowManageStatuses] = useState(false);
  const [showManageClientStatuses, setShowManageClientStatuses] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [expandedClients, setExpandedClients] = useState(new Set());

  // Form states
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    status: ''
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    client_id: null
  });
  const [newStatusForm, setNewStatusForm] = useState({
    name: '',
    color: '#6B7280'
  });
  const [newClientStatusForm, setNewClientStatusForm] = useState({
    name: '',
    color: '#6B7280'
  });
  const [editingStatus, setEditingStatus] = useState(null);
  const [editingClientStatus, setEditingClientStatus] = useState(null);
  const [editStatusForm, setEditStatusForm] = useState({
    name: '',
    color: '#6B7280'
  });
  const [editClientStatusForm, setEditClientStatusForm] = useState({
    name: '',
    color: '#6B7280'
  });

  // Initialize Telegram WebApp if available
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand(); // Expand to full screen
      // Set theme colors to match Telegram
      tg.setHeaderColor('#ffffff');
      tg.setBackgroundColor('#f9fafb');
    }
  }, []);

  // Authenticate with Telegram
  useEffect(() => {
    authenticateWithTelegram();
  }, []);

  const authenticateWithTelegram = async () => {
    setLoading(true);
    
    // Check if running in Telegram
    if (window.Telegram && window.Telegram.WebApp) {
      try {
        const tg = window.Telegram.WebApp;
        tg.ready();
        
        const telegramUser = tg.initDataUnsafe?.user;
        
        if (telegramUser && telegramUser.id) {
          // Find or create user profile
          const { data: existingProfile, error: findError } = await supabase
            .from('profiles')
            .select('*')
            .eq('telegram_id', telegramUser.id)
            .single();

          if (findError && findError.code === 'PGRST116') {
            // User doesn't exist, create new profile
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{
                telegram_id: telegramUser.id,
                telegram_username: telegramUser.username || null,
                first_name: telegramUser.first_name || null,
                last_name: telegramUser.last_name || null
              }])
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
        setLoading(false);
        return;
      }
      
            setUser(newProfile);
            setLoading(false);
          } else if (findError) {
            console.error('Error finding profile:', findError);
            setLoading(false);
          } else {
            // Update profile with latest Telegram info
            await supabase
              .from('profiles')
              .update({
                telegram_username: telegramUser.username || existingProfile.telegram_username,
                first_name: telegramUser.first_name || existingProfile.first_name,
                last_name: telegramUser.last_name || existingProfile.last_name
              })
              .eq('id', existingProfile.id);

            setUser(existingProfile);
            setLoading(false);
          }
        } else {
          // Not in Telegram or no user data
          setLoading(false);
        }
      } catch (error) {
        console.error('Error authenticating with Telegram:', error);
        setLoading(false);
      }
    } else {
      // Not in Telegram - show message
      setLoading(false);
    }
  };

  // Load data when user is logged in
  useEffect(() => {
    if (user) {
      initializeDefaultStatuses();
      initializeDefaultClientStatuses();
      loadData();
      // Set up real-time subscriptions
      const clientsChannel = supabase
        .channel('clients-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
          loadClients();
        })
        .subscribe();

      const tasksChannel = supabase
        .channel('tasks-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
          loadTasks();
        })
        .subscribe();

      const clientStatusesChannel = supabase
        .channel('client-statuses-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'client_statuses' }, () => {
          loadClientStatuses();
        })
        .subscribe();

      const statusesChannel = supabase
        .channel('statuses-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_statuses' }, () => {
          loadCustomStatuses();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(clientsChannel);
        supabase.removeChannel(tasksChannel);
        supabase.removeChannel(clientStatusesChannel);
        supabase.removeChannel(statusesChannel);
      };
    }
  }, [user]);


  const loadData = async () => {
    await Promise.all([loadClients(), loadTasks(), loadClientStatuses(), loadCustomStatuses()]);
  };

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Eroare la încărcarea proiectelor:', error);
          } else {
      setClients(data || []);
    }
  };

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tasks:', error);
          } else {
      setTasks(data || []);
    }
  };

  const handleMoveTask = async (taskId, direction) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const clientTasks = tasks.filter(t => t.client_id === task.client_id).sort((a, b) => a.display_order - b.display_order);
    const currentIndex = clientTasks.findIndex(t => t.id === taskId);
    
    if (direction === 'up' && currentIndex > 0) {
      const targetTask = clientTasks[currentIndex - 1];
      const tempOrder = task.display_order;
      
      // Swap orders
      await supabase
        .from('tasks')
        .update({ display_order: targetTask.display_order })
        .eq('id', taskId);
      
      await supabase
        .from('tasks')
        .update({ display_order: tempOrder })
        .eq('id', targetTask.id);
      
      loadTasks();
    } else if (direction === 'down' && currentIndex < clientTasks.length - 1) {
      const targetTask = clientTasks[currentIndex + 1];
      const tempOrder = task.display_order;
      
      // Swap orders
      await supabase
        .from('tasks')
        .update({ display_order: targetTask.display_order })
        .eq('id', taskId);
      
      await supabase
        .from('tasks')
        .update({ display_order: tempOrder })
        .eq('id', targetTask.id);
      
      loadTasks();
    }
  };

  const loadClientStatuses = async () => {
    const { data, error } = await supabase
      .from('client_statuses')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading client statuses:', error);
    } else {
      setClientStatuses(data || []);
    }
  };

  const loadCustomStatuses = async () => {
    const { data, error } = await supabase
      .from('custom_statuses')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading custom statuses:', error);
          } else {
      setCustomStatuses(data || []);
    }
  };

  const handleLogout = () => {
    setUser(null);
    // Clear any stored data if needed
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert('Eroare: Utilizatorul nu este autentificat. Te rugăm să reîncarci aplicația.');
      return;
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        ...clientForm,
        created_by: user.id
      }])
      .select();

    if (error) {
      alert('Eroare la adăugarea clientului: ' + error.message);
      } else {
      setShowAddClient(false);
      setClientForm({ name: '', email: '', phone: '', company: '', notes: '', status: '' });
      loadClients();
    }
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('clients')
      .update(clientForm)
      .eq('id', editingClient.id);

    if (error) {
      alert('Eroare la actualizarea clientului: ' + error.message);
    } else {
      setEditingClient(null);
      setClientForm({ name: '', email: '', phone: '', company: '', notes: '', status: '' });
      loadClients();
    }
  };

  const handleDeleteClient = async (id) => {
    if (!confirm('Ești sigur că vrei să ștergi acest client?')) return;

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Eroare la ștergerea clientului: ' + error.message);
          } else {
      loadClients();
    }
  };

  const startEditClient = (client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      notes: client.notes || '',
      status: client.status || ''
    });
  };

  const startAddTask = (client) => {
    setSelectedClient(client);
    setTaskForm({
      title: '',
      description: '',
      status: customStatuses.length > 0 ? customStatuses[0].name : 'pending',
      priority: 'medium',
      due_date: '',
      client_id: client.id
    });
    setShowAddTask(true);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert('Eroare: Utilizatorul nu este autentificat.');
      return;
    }
    
    // Ensure user exists in profiles table, if not, create it
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    // Get max display_order for this client's tasks
    const clientTasks = tasks.filter(t => t.client_id === selectedClient.id);
    const maxOrder = clientTasks.length > 0 
      ? Math.max(...clientTasks.map(t => t.display_order || 0))
      : -1;
    
    // Build task data
    const taskData = {
      ...taskForm,
      client_id: selectedClient.id,
      due_date: taskForm.due_date || null,
      display_order: maxOrder + 1
    };
    
    // Only set created_by if profile exists
    if (existingProfile) {
      taskData.created_by = user.id;
          } else {
      // Try to create profile if it doesn't exist
      const { error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          telegram_id: user.telegram_id,
          telegram_username: user.telegram_username,
          first_name: user.first_name,
          last_name: user.last_name
        }]);
      
      if (!createError) {
        // Profile was created successfully, now we can set created_by
        taskData.created_by = user.id;
      }
      // If profile creation failed, created_by will be NULL (which is allowed)
    }
    
    const { error } = await supabase
      .from('tasks')
      .insert([taskData]);

    if (error) {
      alert('Eroare la adăugarea sarcinii: ' + error.message);
    } else {
      setShowAddTask(false);
      setTaskForm({ title: '', description: '', status: 'pending', priority: 'medium', due_date: '', client_id: null });
      setSelectedClient(null);
      loadTasks();
    }
  };

  const handleUpdateTask = async (task) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date || null,
        completed: task.completed
      })
      .eq('id', task.id);

    if (error) {
      alert('Eroare la actualizarea sarcinii: ' + error.message);
    } else {
      loadTasks();
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm('Ești sigur că vrei să ștergi această sarcină?')) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Eroare la ștergerea sarcinii: ' + error.message);
      } else {
      loadTasks();
    }
  };

  const handleToggleTaskComplete = async (task) => {
    await handleUpdateTask({ ...task, completed: !task.completed });
  };

  const handleAddCustomStatus = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert('Eroare: Utilizatorul nu este autentificat.');
      return;
    }
    
    // Check if status name already exists
    const { data: existing } = await supabase
      .from('custom_statuses')
      .select('id')
      .eq('name', newStatusForm.name)
      .eq('created_by', user.id)
      .single();

    if (existing) {
      alert('Un status cu acest nume există deja!');
      return;
    }
    
    // Check if user exists in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    // Build status data
    const statusData = {
      name: newStatusForm.name,
      color: newStatusForm.color
    };
    
    // Only set created_by if profile exists
    if (existingProfile) {
      statusData.created_by = user.id;
    } else {
      // Try to create profile if it doesn't exist
      const { error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          telegram_id: user.telegram_id,
          telegram_username: user.telegram_username,
          first_name: user.first_name,
          last_name: user.last_name
        }]);
      
      if (!createError) {
        // Profile was created successfully, now we can set created_by
        statusData.created_by = user.id;
      }
      // If profile creation failed, created_by will be NULL (which is allowed)
    }
    
    const { error } = await supabase
      .from('custom_statuses')
      .insert([statusData]);

    if (error) {
      alert('Eroare la adăugarea statusului: ' + error.message);
      } else {
      setNewStatusForm({ name: '', color: '#6B7280' });
      loadCustomStatuses();
    }
  };

  const handleUpdateCustomStatus = async (e) => {
    e.preventDefault();
    if (!editingStatus) return;

    // Check if new name conflicts with another status
    const { data: existing } = await supabase
      .from('custom_statuses')
      .select('id')
      .eq('name', editStatusForm.name)
      .eq('created_by', user.id)
      .neq('id', editingStatus.id)
      .single();

    if (existing) {
      alert('Un status cu acest nume există deja!');
      return;
    }
    
    const { error } = await supabase
      .from('custom_statuses')
      .update({
        name: editStatusForm.name,
        color: editStatusForm.color
      })
      .eq('id', editingStatus.id);

    if (error) {
      alert('Eroare la actualizarea statusului: ' + error.message);
    } else {
      setEditingStatus(null);
      setEditStatusForm({ name: '', color: '#6B7280' });
      loadCustomStatuses();
    }
  };

  const handleDeleteCustomStatus = async (id) => {
    if (!confirm('Ești sigur? Sarcinile care folosesc acest status vor trebui actualizate.')) return;

    const { error } = await supabase
      .from('custom_statuses')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Eroare la ștergerea statusului: ' + error.message);
    } else {
      loadCustomStatuses();
    }
  };

  const startEditStatus = (status) => {
    setEditingStatus(status);
    setEditStatusForm({
      name: status.name,
      color: status.color
    });
  };

  // Client Status Management Functions
  const handleAddClientStatus = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      alert('Eroare: Utilizatorul nu este autentificat.');
      return;
    }
    
    // Check if status name already exists
    const { data: existing } = await supabase
      .from('client_statuses')
      .select('id')
      .eq('name', newClientStatusForm.name)
      .eq('created_by', user.id)
      .single();

    if (existing) {
      alert('Un status cu acest nume există deja!');
      return;
    }
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    // Build status data
    const statusData = {
      name: newClientStatusForm.name,
      color: newClientStatusForm.color
    };
    
    // Only set created_by if profile exists
    if (existingProfile) {
      statusData.created_by = user.id;
    } else {
      // Try to create profile if it doesn't exist
      const { error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          telegram_id: user.telegram_id || 0,
          telegram_username: user.telegram_username || null,
          first_name: user.first_name || null,
          last_name: user.last_name || null
        }]);
      
      if (!createError) {
        statusData.created_by = user.id;
      }
    }
    
    const { error } = await supabase
      .from('client_statuses')
      .insert([statusData]);

    if (error) {
      alert('Eroare la adăugarea statusului: ' + error.message);
    } else {
      setNewClientStatusForm({ name: '', color: '#6B7280' });
      loadClientStatuses();
    }
  };

  const handleUpdateClientStatus = async (e) => {
    e.preventDefault();
    if (!editingClientStatus) return;

    // Check if new name conflicts with another status
    const { data: existing } = await supabase
      .from('client_statuses')
      .select('id')
      .eq('name', editClientStatusForm.name)
      .eq('created_by', user.id)
      .neq('id', editingClientStatus.id)
      .single();

    if (existing) {
      alert('Un status cu acest nume există deja!');
      return;
    }
    
    const { error } = await supabase
      .from('client_statuses')
      .update({
        name: editClientStatusForm.name,
        color: editClientStatusForm.color
      })
      .eq('id', editingClientStatus.id);

    if (error) {
      alert('Eroare la actualizarea statusului: ' + error.message);
    } else {
      setEditingClientStatus(null);
      setEditClientStatusForm({ name: '', color: '#6B7280' });
      loadClientStatuses();
    }
  };

  const handleDeleteClientStatus = async (id) => {
    if (!confirm('Ești sigur? Clienții care folosesc acest status vor trebui actualizați.')) return;

    const { error } = await supabase
      .from('client_statuses')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Eroare la ștergerea statusului: ' + error.message);
    } else {
      loadClientStatuses();
    }
  };

  const startEditClientStatus = (status) => {
    setEditingClientStatus(status);
    setEditClientStatusForm({
      name: status.name,
      color: status.color
    });
  };

  const toggleClientExpansion = (clientId) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  // Get tasks for a client (sorted by display_order)
  const getClientTasks = (clientId) => {
    return tasks
      .filter(task => task.client_id === clientId)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  };

  // Get all available statuses (default + custom)
  const getAllStatuses = () => {
    // Only return custom statuses from database
    return customStatuses;
  };

  // Initialize default client statuses if they don't exist
  const initializeDefaultClientStatuses = async () => {
    if (!user || !user.id) return;

    const defaultClientStatuses = [
      { name: 'Lead', color: '#3B82F6' },
      { name: 'Prospect', color: '#F59E0B' },
      { name: 'Client', color: '#10B981' },
      { name: 'Inactiv', color: '#6B7280' }
    ];

    for (const status of defaultClientStatuses) {
      // Check if status already exists
      const { data: existing } = await supabase
        .from('client_statuses')
        .select('id')
        .eq('name', status.name)
        .eq('created_by', user.id)
        .single();

      if (!existing) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        const statusData = {
          name: status.name,
          color: status.color
        };
        
        if (existingProfile) {
          statusData.created_by = user.id;
        } else {
          // Try to create profile if it doesn't exist
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              telegram_id: user.telegram_id || 0,
              telegram_username: user.telegram_username || null,
              first_name: user.first_name || null,
              last_name: user.last_name || null
            }]);
          
          if (!createError) {
            statusData.created_by = user.id;
          }
        }
        
        await supabase
          .from('client_statuses')
          .insert([statusData]);
      }
    }

    loadClientStatuses();
  };

  // Initialize default statuses if they don't exist
  const initializeDefaultStatuses = async () => {
    if (!user || !user.id) return;

    const defaultStatuses = [
      { name: 'pending', color: '#F59E0B' },
      { name: 'in-progress', color: '#3B82F6' },
      { name: 'completed', color: '#10B981' },
      { name: 'cancelled', color: '#EF4444' }
    ];

    for (const status of defaultStatuses) {
      // Check if status already exists
      const { data: existing } = await supabase
        .from('custom_statuses')
        .select('id')
        .eq('name', status.name)
        .eq('created_by', user.id)
        .single();

      if (!existing) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        const statusData = {
          name: status.name,
          color: status.color
        };
        
        if (existingProfile) {
          statusData.created_by = user.id;
        } else {
          // Try to create profile if it doesn't exist
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              telegram_id: user.telegram_id || 0,
              telegram_username: user.telegram_username || null,
              first_name: user.first_name || null,
              last_name: user.last_name || null
            }]);
          
          if (!createError) {
            statusData.created_by = user.id;
          }
        }
        
        await supabase
          .from('custom_statuses')
          .insert([statusData]);
      }
    }

    loadCustomStatuses();
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchTerm || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || !statusFilter || client.status === statusFilter || (!client.status && statusFilter === 'none');
    return matchesSearch && matchesStatus;
  });

  const handleDragStart = (e, client) => {
    setDraggedClient(client);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetClient) => {
    e.preventDefault();
    if (!draggedClient || draggedClient.id === targetClient.id) {
      setDraggedClient(null);
      return;
    }

    const draggedIndex = clients.findIndex(c => c.id === draggedClient.id);
    const targetIndex = clients.findIndex(c => c.id === targetClient.id);
    
    const newClients = [...clients];
    const [removed] = newClients.splice(draggedIndex, 1);
    newClients.splice(targetIndex, 0, removed);

    // Update display_order for all clients
    const updates = newClients.map((client, index) => ({
      id: client.id,
      display_order: index
    }));

    // Update in database
    for (const update of updates) {
      await supabase
        .from('clients')
        .update({ display_order: update.display_order })
        .eq('id', update.id);
    }

    setClients(newClients);
    setDraggedClient(null);
  };

  // Statistics
  const stats = {
    totalClients: clients.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Sistem CRM</h1>
          {window.Telegram && window.Telegram.WebApp ? (
            <div>
              <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
              <p className="text-gray-600">Autentificare cu Telegram...</p>
              <p className="text-sm text-gray-500 mt-2">Te rugăm să aștepți în timp ce configurăm contul tău.</p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800 mb-2">⚠️ Această aplicație necesită Telegram</p>
              <p className="text-sm text-yellow-700">
                Te rugăm să deschizi această aplicație din Telegram pentru a folosi sistemul CRM.
              </p>
        </div>
      )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Sistem CRM</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.first_name || user.telegram_username || `Utilizator ${user.telegram_id}`}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut size={16} />
              Deconectare
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
      <button 
              onClick={() => setView('dashboard')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                view === 'dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={16} className="inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setView('clients')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                view === 'clients'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              Proiecte ({clients.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {view === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Proiecte</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalClients}</div>
            </div>
        </div>
      )}

        {view === 'clients' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Caută proiecte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="all">Toate Statusurile</option>
                  <option value="none">Fără Status</option>
                  {clientStatuses.map(status => (
                    <option key={status.id} value={status.name}>{status.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowManageClientStatuses(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                  title="Gestionează Statusuri Clienți"
                >
                  <Flag size={16} className="rounded-xl" />
                  Statusuri Clienți
      </button>
                <button
                  onClick={() => setShowManageStatuses(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                  title="Gestionează Statusuri Sarcini"
                >
                  <Flag size={16} className="rounded-xl" />
                  Statusuri Sarcini
                </button>
                <button 
                  onClick={() => setShowAddClient(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <Plus size={16} className="rounded-xl" />
                  Adaugă Client
                </button>
        </div>
      </div>

            {/* Clients List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {filteredClients.length === 0 ? (
                <div className="p-12 text-center">
                  <Circle size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nu s-au găsit proiecte</p>
      </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredClients.map(client => {
                    const clientTasks = getClientTasks(client.id);
                    const isExpanded = expandedClients.has(client.id);
                    const statuses = getAllStatuses();
                    
                    return (
                      <div 
                        key={client.id} 
                        className="border-b border-gray-200 last:border-0 cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, client)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, client)}
                      >
                        <div className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <GripVertical size={16} className="text-gray-400 cursor-move rounded-xl" />
      <button 
                                  onClick={() => toggleClientExpansion(client.id)}
                                  className="text-gray-400 hover:text-gray-600 rounded-xl"
                                >
                                  {isExpanded ? '▼' : '▶'}
                                </button>
                                <h3 className="font-semibold text-gray-900">{client.name}</h3>
                                {client.status && (() => {
                                  const clientStatus = clientStatuses.find(s => s.name === client.status);
                                  return clientStatus ? (
                                    <span 
                                      className="px-2 py-1 text-xs text-white rounded-xl"
                                      style={{ backgroundColor: clientStatus.color }}
                                    >
                                      {client.status}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-xl">
                                      {client.status}
                                    </span>
                                  );
                                })()}
                                {clientTasks.length > 0 && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-xl">
                                    {clientTasks.length} task{clientTasks.length !== 1 ? 's' : ''}
                                  </span>
                                )}
    </div>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                {client.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail size={14} />
                                    {client.email}
                                  </div>
                                )}
                                {client.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone size={14} />
                                    {client.phone}
                                  </div>
                                )}
                                {client.company && (
                                  <div className="flex items-center gap-1">
                                    <Building size={14} />
                                    {client.company}
                                  </div>
                                )}
                              </div>
                              {client.notes && (
                                <p className="text-sm text-gray-500 mt-2">{client.notes}</p>
                              )}
                            </div>
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => startEditClient(client)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                title="Editează Detalii Client"
                              >
                                <Edit size={18} />
      </button>
      </div>
    </div>
      </div>

                        {/* Tasks Section */}
                        {isExpanded && (
                          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                <ListTodo size={16} className="rounded-xl" />
                                Sarcini ({clientTasks.length})
                              </h4>
      <button 
                                onClick={() => startAddTask(client)}
                                className="p-2 text-purple-600 hover:text-purple-700 rounded-xl hover:bg-purple-50 transition-colors"
                                title="Adaugă Sarcină"
                              >
                                <Plus size={16} className="rounded-xl" />
                              </button>
                            </div>
                            
                            {clientTasks.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-4">Nu există sarcini încă. Adaugă una mai sus!</p>
                            ) : (
                              <div className="space-y-2">
                                {clientTasks.map((task, index) => {
                                  const status = statuses.find(s => s.name === task.status) || { name: task.status, color: '#6B7280' };
                                  const priorityColors = {
                                    low: 'text-gray-500',
                                    medium: 'text-yellow-600',
                                    high: 'text-red-600'
                                  };
                                  
    return (
                                    <div key={task.id} className={`bg-white rounded-xl p-3 border border-gray-200 ${task.completed ? 'opacity-60' : ''}`}>
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2 flex-1">
                                          <button
                                            onClick={() => handleToggleTaskComplete(task)}
                                            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-xl border-2 flex items-center justify-center transition-all ${
                                              task.completed
                                                ? 'bg-green-600 border-green-600'
                                                : 'border-gray-300 hover:border-green-600'
                                            }`}
                                          >
                                            {task.completed && <Check size={12} className="text-white rounded-xl" />}
                                          </button>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                              <h5 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                                {task.title}
                                              </h5>
                                              <span
                                                className="px-2 py-0.5 text-xs rounded-xl text-white"
                                                style={{ backgroundColor: status.color }}
                                              >
                                                {status.name}
                                              </span>
                                              <span className={`text-xs ${priorityColors[task.priority] || 'text-gray-500'}`}>
                                                <Flag size={12} className="inline rounded-xl" /> {task.priority}
                                              </span>
        </div>
                                            {task.description && (
                                              <p className="text-sm text-gray-600 mb-1">{task.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                              {task.due_date && (
                                                <span className="flex items-center gap-1">
                                                  <Calendar size={12} />
                                                  {new Date(task.due_date).toLocaleDateString()}
                                                </span>
                                              )}
                                              <span>{new Date(task.created_at).toLocaleDateString()}</span>
      </div>
                                          </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <button
                                            onClick={() => handleMoveTask(task.id, 'up')}
                                            disabled={index === 0}
                                            className={`p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors ${
                                              index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                                            }`}
                                            title="Mută sus"
                                          >
                                            <ChevronUp size={14} />
                                          </button>
                                          <button
                                            onClick={() => handleMoveTask(task.id, 'down')}
                                            disabled={index === clientTasks.length - 1}
                                            className={`p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors ${
                                              index === clientTasks.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                                            }`}
                                            title="Mută jos"
                                          >
                                            <ChevronDown size={14} />
                                          </button>
                                        </div>
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => {
                                              const newStatus = prompt('Enter new status:', task.status);
                                              if (newStatus) {
                                                handleUpdateTask({ ...task, status: newStatus });
                                              }
                                            }}
                                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                            title="Schimbă Status"
                                          >
                                            <Edit size={14} />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Șterge"
                                          >
                                            <Trash2 size={14} />
      </button>
                                        </div>
      </div>
    </div>
  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Client</h2>
              <button onClick={() => setShowAddClient(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={clientForm.company}
                  onChange={(e) => setClientForm({...clientForm, company: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={clientForm.status || ''}
                  onChange={(e) => setClientForm({...clientForm, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="">Fără Status</option>
                  {clientStatuses.map(status => (
                    <option key={status.id} value={status.name}>{status.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({...clientForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Add Client
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Client</h2>
              <button onClick={() => setEditingClient(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={clientForm.company}
                  onChange={(e) => setClientForm({...clientForm, company: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={clientForm.status || ''}
                  onChange={(e) => setClientForm({...clientForm, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="">Fără Status</option>
                  {clientStatuses.map(status => (
                    <option key={status.id} value={status.name}>{status.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({...clientForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Adaugă Client</h2>
              <button onClick={() => setShowAddClient(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nume *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Companie</label>
                <input
                  type="text"
                  value={clientForm.company}
                  onChange={(e) => setClientForm({...clientForm, company: e.target.value})}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({...clientForm, notes: e.target.value})}
                  onKeyDown={(e) => e.stopPropagation()}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2"
                >
                  <Save size={16} className="rounded-xl" />
                  Adaugă Client
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Adaugă Sarcină</h2>
              <button onClick={() => setShowAddTask(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            {selectedClient && (
              <p className="text-sm text-gray-600 mb-4">Pentru: <strong>{selectedClient.name}</strong></p>
            )}
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titlu *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                  placeholder="Titlul sarcinii"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                  placeholder="Detalii despre sarcină"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                >
                  {getAllStatuses().map(status => (
                    <option key={status.name} value={status.name}>{status.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioritate</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                >
                  <option value="low">Scăzută</option>
                  <option value="medium">Medie</option>
                  <option value="high">Ridicată</option>
                </select>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Finalizării</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 rounded-xl" size={18} />
                  <input
                    type="datetime-local"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Selectează data și ora pentru finalizarea sarcinii</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Save size={16} className="rounded-xl" />
                  Adaugă Sarcină
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Client Statuses Modal */}
      {showManageClientStatuses && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Gestionează Statusuri Clienți</h2>
              <button onClick={() => { setShowManageClientStatuses(false); setEditingClientStatus(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            {!editingClientStatus ? (
              <>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Adaugă Status Nou</h3>
                  <form onSubmit={handleAddClientStatus} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nume Status *</label>
                      <input
                        type="text"
                        required
                        value={newClientStatusForm.name}
                        onChange={(e) => setNewClientStatusForm({...newClientStatusForm, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                        placeholder="ex: Lead, Prospect, Client"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Culoare</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={newClientStatusForm.color}
                          onChange={(e) => setNewClientStatusForm({...newClientStatusForm, color: e.target.value})}
                          className="w-16 h-10 border border-gray-300 rounded-xl cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newClientStatusForm.color}
                          onChange={(e) => setNewClientStatusForm({...newClientStatusForm, color: e.target.value})}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                          placeholder="#6B7280"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
                    >
                      Adaugă Status
                    </button>
                  </form>
                </div>

                {clientStatuses.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Statusuri Existente</h3>
                    <div className="space-y-2">
                      {clientStatuses.map(status => (
                        <div key={status.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-xl" style={{ backgroundColor: status.color }}></div>
                            <span className="text-sm font-medium text-gray-900">{status.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditClientStatus(status)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="Editează"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClientStatus(status.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              title="Șterge"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Editează Status</h3>
                <form onSubmit={handleUpdateClientStatus} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nume Status *</label>
                    <input
                      type="text"
                      required
                      value={editClientStatusForm.name}
                      onChange={(e) => setEditClientStatusForm({...editClientStatusForm, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                      placeholder="Nume status"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Culoare</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editClientStatusForm.color}
                        onChange={(e) => setEditClientStatusForm({...editClientStatusForm, color: e.target.value})}
                        className="w-16 h-10 border border-gray-300 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editClientStatusForm.color}
                        onChange={(e) => setEditClientStatusForm({...editClientStatusForm, color: e.target.value})}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                        placeholder="#6B7280"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
                    >
                      Salvează Modificările
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingClientStatus(null); setEditClientStatusForm({ name: '', color: '#6B7280' }); }}
                      className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                    >
                      Anulează
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manage Statuses Modal */}
      {showManageStatuses && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Gestionează Statusuri Sarcini</h2>
              <button onClick={() => { setShowManageStatuses(false); setEditingStatus(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            {!editingStatus ? (
              <>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Adaugă Status Nou</h3>
                  <form onSubmit={handleAddCustomStatus} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nume Status *</label>
                      <input
                        type="text"
                        required
                        value={newStatusForm.name}
                        onChange={(e) => setNewStatusForm({...newStatusForm, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                        placeholder="ex: În așteptare, Blocat"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Culoare</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={newStatusForm.color}
                          onChange={(e) => setNewStatusForm({...newStatusForm, color: e.target.value})}
                          className="w-16 h-10 border border-gray-300 rounded-xl cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newStatusForm.color}
                          onChange={(e) => setNewStatusForm({...newStatusForm, color: e.target.value})}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                          placeholder="#6B7280"
                        />
        </div>
      </div>
                    <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
                    >
                      Adaugă Status
                    </button>
                  </form>
                </div>

                {customStatuses.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Statusuri Existente</h3>
                    <div className="space-y-2">
                      {customStatuses.map(status => (
                        <div key={status.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-xl" style={{ backgroundColor: status.color }}></div>
                            <span className="text-sm font-medium text-gray-900">{status.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditStatus(status)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="Editează"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomStatus(status.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              title="Șterge"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Editează Status</h3>
                <form onSubmit={handleUpdateCustomStatus} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nume Status *</label>
                    <input
                      type="text"
                      required
                      value={editStatusForm.name}
                      onChange={(e) => setEditStatusForm({...editStatusForm, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                      placeholder="Nume status"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Culoare</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editStatusForm.color}
                        onChange={(e) => setEditStatusForm({...editStatusForm, color: e.target.value})}
                        className="w-16 h-10 border border-gray-300 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editStatusForm.color}
                        onChange={(e) => setEditStatusForm({...editStatusForm, color: e.target.value})}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                        placeholder="#6B7280"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
                    >
                      Salvează Modificările
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingStatus(null); setEditStatusForm({ name: '', color: '#6B7280' }); }}
                      className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                    >
                      Anulează
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

