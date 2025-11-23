import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Circle, Loader2, User, Mail, Phone, Building, Edit, X, Save, LogOut, Users, Activity, BarChart3 } from 'lucide-react';
import { supabase } from './supabase';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('contacts'); // 'contacts', 'activities', 'dashboard'
  const [contacts, setContacts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'lead', 'prospect', 'customer'
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Form states
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'lead',
    notes: ''
  });
  const [activityForm, setActivityForm] = useState({
    type: 'note',
    description: '',
    contact_id: null
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

  // Check if user is logged in
  useEffect(() => {
    checkUser();
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadData();
      }
    });
  }, []);

  // Load data when user is logged in
  useEffect(() => {
    if (user) {
      loadData();
      // Set up real-time subscriptions
      const contactsChannel = supabase
        .channel('contacts-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
          loadContacts();
        })
        .subscribe();

      const activitiesChannel = supabase
        .channel('activities-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
          loadActivities();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(contactsChannel);
        supabase.removeChannel(activitiesChannel);
      };
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    setLoading(false);
  };

  const loadData = async () => {
    await Promise.all([loadContacts(), loadActivities()]);
  };

  const loadContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading contacts:', error);
    } else {
      setContacts(data || []);
    }
  };

  const loadActivities = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        contacts(name),
        profiles:user_id(email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading activities:', error);
    } else {
      setActivities(data || []);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login failed: ' + error.message);
    } else {
      setUser(data.user);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert('Sign up failed: ' + error.message);
    } else {
      alert('Account created! Please check your email to verify your account.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        ...contactForm,
        created_by: user.id
      }])
      .select();

    if (error) {
      alert('Error adding contact: ' + error.message);
    } else {
      setShowAddContact(false);
      setContactForm({ name: '', email: '', phone: '', company: '', status: 'lead', notes: '' });
      loadContacts();
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('contacts')
      .update(contactForm)
      .eq('id', editingContact.id);

    if (error) {
      alert('Error updating contact: ' + error.message);
    } else {
      setEditingContact(null);
      setContactForm({ name: '', email: '', phone: '', company: '', status: 'lead', notes: '' });
      loadContacts();
    }
  };

  const handleDeleteContact = async (id) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting contact: ' + error.message);
    } else {
      loadContacts();
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('activities')
      .insert([{
        ...activityForm,
        user_id: user.id
      }]);

    if (error) {
      alert('Error adding activity: ' + error.message);
    } else {
      setShowAddActivity(false);
      setActivityForm({ type: 'note', description: '', contact_id: null });
      setSelectedContact(null);
      loadActivities();
      loadContacts();
    }
  };

  const startEditContact = (contact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      status: contact.status,
      notes: contact.notes || ''
    });
  };

  const startAddActivity = (contact) => {
    setSelectedContact(contact);
    setActivityForm({
      type: 'note',
      description: '',
      contact_id: contact.id
    });
    setShowAddActivity(true);
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesFilter = filter === 'all' || contact.status === filter;
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Statistics
  const stats = {
    totalContacts: contacts.length,
    leads: contacts.filter(c => c.status === 'lead').length,
    prospects: contacts.filter(c => c.status === 'prospect').length,
    customers: contacts.filter(c => c.status === 'customer').length,
    recentActivities: activities.length
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
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">CRM Login</h1>
          {window.Telegram && window.Telegram.WebApp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800 text-center">
              📱 Running in Telegram
            </div>
          )}
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <form onSubmit={handleLogin} className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  placeholder="Password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Login
              </button>
            </form>

            <div className="text-center text-sm text-gray-500 mb-4">or</div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (New Account)</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  placeholder="Min 6 characters"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">CRM System</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut size={16} />
              Logout
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
              onClick={() => setView('contacts')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                view === 'contacts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              Contacts ({contacts.length})
            </button>
            <button
              onClick={() => setView('activities')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                view === 'activities'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Activity size={16} className="inline mr-2" />
              Activities ({activities.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {view === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Contacts</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalContacts}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Leads</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.leads}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Prospects</div>
              <div className="text-3xl font-bold text-blue-600">{stats.prospects}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Customers</div>
              <div className="text-3xl font-bold text-green-600">{stats.customers}</div>
            </div>
          </div>
        )}

        {view === 'contacts' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('lead')}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      filter === 'lead' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Leads
                  </button>
                  <button
                    onClick={() => setFilter('prospect')}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      filter === 'prospect' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Prospects
                  </button>
                  <button
                    onClick={() => setFilter('customer')}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      filter === 'customer' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Customers
                  </button>
                </div>
                <button
                  onClick={() => setShowAddContact(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Contact
                </button>
              </div>
            </div>

            {/* Contacts List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {filteredContacts.length === 0 ? (
                <div className="p-12 text-center">
                  <Circle size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No contacts found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredContacts.map(contact => (
                    <div key={contact.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              contact.status === 'lead' ? 'bg-yellow-100 text-yellow-800' :
                              contact.status === 'prospect' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {contact.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {contact.email && (
                              <div className="flex items-center gap-1">
                                <Mail size={14} />
                                {contact.email}
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-1">
                                <Phone size={14} />
                                {contact.phone}
                              </div>
                            )}
                            {contact.company && (
                              <div className="flex items-center gap-1">
                                <Building size={14} />
                                {contact.company}
                              </div>
                            )}
                          </div>
                          {contact.notes && (
                            <p className="text-sm text-gray-500 mt-2">{contact.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startAddActivity(contact)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Add Activity"
                          >
                            <Activity size={18} />
                          </button>
                          <button
                            onClick={() => startEditContact(contact)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'activities' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {activities.length === 0 ? (
              <div className="p-12 text-center">
                <Activity size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No activities yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {activities.map(activity => (
                  <div key={activity.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'call' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'email' ? 'bg-green-100 text-green-600' :
                        activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Activity size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 capitalize">{activity.type}</span>
                          {activity.contacts && (
                            <span className="text-sm text-gray-500">• {activity.contacts.name}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Contact</h2>
              <button onClick={() => setShowAddContact(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={contactForm.status}
                  onChange={(e) => setContactForm({...contactForm, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="lead">Lead</option>
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({...contactForm, notes: e.target.value})}
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
                  Add Contact
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Contact</h2>
              <button onClick={() => setEditingContact(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={contactForm.status}
                  onChange={(e) => setContactForm({...contactForm, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="lead">Lead</option>
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({...contactForm, notes: e.target.value})}
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
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Activity</h2>
              <button onClick={() => setShowAddActivity(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            {selectedContact && (
              <p className="text-sm text-gray-600 mb-4">For: <strong>{selectedContact.name}</strong></p>
            )}
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({...activityForm, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  placeholder="What happened?"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Add Activity
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddActivity(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

