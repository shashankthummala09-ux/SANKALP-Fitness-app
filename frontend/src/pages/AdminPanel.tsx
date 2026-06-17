import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Dumbbell, Activity, Plus, Trash2, Edit3, Save, X, Phone, 
  Award, DollarSign, Search, Shield, ChevronDown, ChevronUp, MapPin, 
  Star, Calendar, UserCheck, AlertCircle, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLoginAt: string | null;
  isAdmin: boolean;
}

interface TrainerData {
  id: string;
  gymId: string;
  name: string;
  phone: string;
  specialization: string;
  fee: number;
  experience: number;
}

interface GymData {
  id: string;
  name: string;
  city: string;
  address: string;
  fee: number;
  rating: number;
  amenities: string[];
  trainers: TrainerData[];
}

interface ActivityLogData {
  id: string;
  action: string;
  details: string;
  loggedAt: string;
}

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Tabs: 'users' | 'gyms' | 'logs'
  const [activeTab, setActiveTab] = useState<'users' | 'gyms' | 'logs'>('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data states
  const [users, setUsers] = useState<UserData[]>([]);
  const [gyms, setGyms] = useState<GymData[]>([]);
  const [logs, setLogs] = useState<ActivityLogData[]>([]);

  // Search states
  const [searchUser, setSearchUser] = useState('');
  const [searchGym, setSearchGym] = useState('');
  const [searchLog, setSearchLog] = useState('');

  // Gym expansion state (gym ID -> boolean)
  const [expandedGyms, setExpandedGyms] = useState<Record<string, boolean>>({});

  // Gym Modal / Form States
  const [isGymModalOpen, setIsGymModalOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<GymData | null>(null);
  const [gymForm, setGymForm] = useState({
    name: '',
    city: '',
    address: '',
    fee: '',
    amenities: ''
  });

  // Trainer Modal / Form States
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<TrainerData | null>(null);
  const [selectedGymId, setSelectedGymId] = useState('');
  const [trainerForm, setTrainerForm] = useState({
    name: '',
    phone: '',
    specialization: '',
    fee: '',
    experience: ''
  });

  // Redirect non-admins immediately (defense-in-depth)
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/dashboard');
      if (res.data) {
        setUsers(res.data.users || []);
        setGyms(res.data.gyms || []);
        setLogs(res.data.activityLogs || []);
      }
    } catch (err: any) {
      console.error('Error loading admin details:', err);
      setError(err.response?.data?.error || 'Failed to fetch admin dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show status toasts/banners temporarily
  const triggerToast = (msg: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    }
  };

  // Gym Operations
  const handleGymSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymForm.name || !gymForm.city || !gymForm.address || !gymForm.fee) {
      triggerToast('All fields except amenities are required.', false);
      return;
    }

    const payload = {
      name: gymForm.name,
      city: gymForm.city,
      address: gymForm.address,
      fee: parseFloat(gymForm.fee),
      amenities: gymForm.amenities.split(',').map(x => x.trim()).filter(Boolean)
    };

    try {
      if (editingGym) {
        const res = await api.put(`/api/admin/gyms/${editingGym.id}`, payload);
        if (res.data) {
          triggerToast('Gym updated successfully.');
          setEditingGym(null);
        }
      } else {
        const res = await api.post('/api/admin/gyms', payload);
        if (res.data) {
          triggerToast('New gym created successfully.');
        }
      }
      setIsGymModalOpen(false);
      resetGymForm();
      fetchDashboardData();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || 'Failed to save gym.', false);
    }
  };

  const handleEditGym = (gym: GymData) => {
    setEditingGym(gym);
    setGymForm({
      name: gym.name,
      city: gym.city,
      address: gym.address,
      fee: gym.fee.toString(),
      amenities: gym.amenities.join(', ')
    });
    setIsGymModalOpen(true);
  };

  const handleDeleteGym = async (gymId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also remove associated trainer links.`)) {
      return;
    }

    try {
      await api.delete(`/api/admin/gyms/${gymId}`);
      triggerToast('Gym deleted successfully.');
      fetchDashboardData();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || 'Failed to delete gym.', false);
    }
  };

  const resetGymForm = () => {
    setGymForm({ name: '', city: '', address: '', fee: '', amenities: '' });
    setEditingGym(null);
  };

  // Trainer Operations
  const handleTrainerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerForm.name || !trainerForm.phone || !trainerForm.specialization || !trainerForm.fee || !trainerForm.experience) {
      triggerToast('All trainer fields are required.', false);
      return;
    }

    const payload = {
      gymId: selectedGymId,
      name: trainerForm.name,
      phone: trainerForm.phone,
      specialization: trainerForm.specialization,
      fee: parseFloat(trainerForm.fee),
      experience: parseInt(trainerForm.experience)
    };

    try {
      if (editingTrainer) {
        const res = await api.put(`/api/admin/trainers/${editingTrainer.id}`, payload);
        if (res.data) {
          triggerToast('Trainer details updated successfully.');
        }
      } else {
        const res = await api.post('/api/admin/trainers', payload);
        if (res.data) {
          triggerToast('New trainer registered successfully.');
        }
      }
      setIsTrainerModalOpen(false);
      resetTrainerForm();
      fetchDashboardData();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || 'Failed to save trainer.', false);
    }
  };

  const handleAddTrainerClick = (gymId: string) => {
    setSelectedGymId(gymId);
    setEditingTrainer(null);
    setIsTrainerModalOpen(true);
  };

  const handleEditTrainer = (trainer: TrainerData) => {
    setEditingTrainer(trainer);
    setSelectedGymId(trainer.gymId);
    setTrainerForm({
      name: trainer.name,
      phone: trainer.phone,
      specialization: trainer.specialization,
      fee: trainer.fee.toString(),
      experience: trainer.experience.toString()
    });
    setIsTrainerModalOpen(true);
  };

  const handleDeleteTrainer = async (trainerId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove trainer "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/admin/trainers/${trainerId}`);
      triggerToast('Trainer deleted successfully.');
      fetchDashboardData();
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || 'Failed to delete trainer.', false);
    }
  };

  const resetTrainerForm = () => {
    setTrainerForm({ name: '', phone: '', specialization: '', fee: '', experience: '' });
    setSelectedGymId('');
    setEditingTrainer(null);
  };

  const toggleGymExpand = (gymId: string) => {
    setExpandedGyms(prev => ({ ...prev, [gymId]: !prev[gymId] }));
  };

  // Filtering lists
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredGyms = gyms.filter(g => 
    g.name.toLowerCase().includes(searchGym.toLowerCase()) || 
    g.city.toLowerCase().includes(searchGym.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchLog.toLowerCase()) || 
    l.details.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative min-h-[calc(100vh-4rem)]">
      {/* Background Blurs */}
      <div className="absolute top-10 left-10 -z-10 h-80 w-80 rounded-full bg-[#FF6B00]/5 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 -z-10 h-80 w-80 rounded-full bg-brand-secondary/5 blur-3xl"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#FF6B00] mb-1">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Administrator Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SANKALP Admin Console</h1>
        </div>
        <button 
          onClick={fetchDashboardData} 
          disabled={loading}
          className="btn-secondary flex items-center gap-2 py-2 px-4 text-xs font-semibold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Message Notifications */}
      {successMsg && (
        <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-400">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex border-b border-white/10 mb-8 gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === 'users' 
              ? 'border-[#FF6B00] text-[#FF6B00]' 
              : 'border-transparent text-[#8A8A8A] hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          Registered Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('gyms')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === 'gyms' 
              ? 'border-[#FF6B00] text-[#FF6B00]' 
              : 'border-transparent text-[#8A8A8A] hover:text-white'
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          Manage Gyms & Trainers ({gyms.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === 'logs' 
              ? 'border-[#FF6B00] text-[#FF6B00]' 
              : 'border-transparent text-[#8A8A8A] hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4" />
          Activity Audit Log
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Dumbbell className="h-10 w-10 text-[#FF6B00] animate-spin mb-4" />
          <span className="text-sm text-[#8A8A8A]">Fetching system records...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* TAB 1: USERS LIST */}
          {activeTab === 'users' && (
            <div className="glass-panel p-6 shadow-2xl border border-white/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-white">System Registered Users</h2>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A8A8A]" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="glass-input w-full !pl-10 text-sm py-2"
                  />
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-[#8A8A8A] text-sm">
                  No users found matching "{searchUser}".
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider">
                        <th className="pb-3 pr-4">User Details</th>
                        <th className="pb-3 pr-4">Sign Up Date</th>
                        <th className="pb-3 pr-4">Last Login</th>
                        <th className="pb-3 pr-4 text-right">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-all">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-[#FF6B00] flex items-center justify-center font-bold text-sm">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{u.name}</div>
                                <div className="text-xs text-[#8A8A8A]">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-[#8A8A8A]">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(u.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-[#8A8A8A]">
                            {u.lastLoginAt ? (
                              <div className="text-xs">
                                {new Date(u.lastLoginAt).toLocaleString()}
                              </div>
                            ) : (
                              <span className="text-xs italic text-white/40">Never logged in</span>
                            )}
                          </td>
                          <td className="py-4 pr-4 text-right">
                            {u.isAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30">
                                <UserCheck className="h-3 w-3" /> Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-[#8A8A8A] border border-white/5">
                                User
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE GYMS & TRAINERS */}
          {activeTab === 'gyms' && (
            <div className="space-y-6">
              {/* Gym controls */}
              <div className="glass-panel p-6 shadow-2xl border border-white/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Gym Locations Database</h2>
                    <p className="text-xs text-[#8A8A8A]">Add, update, or remove fitness centers and register certified trainers.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-center">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A8A8A]" />
                      <input
                        type="text"
                        placeholder="Search by gym name or city..."
                        value={searchGym}
                        onChange={(e) => setSearchGym(e.target.value)}
                        className="glass-input w-full !pl-10 text-sm py-2"
                      />
                    </div>
                    <button
                      onClick={() => {
                        resetGymForm();
                        setIsGymModalOpen(true);
                      }}
                      className="btn-primary w-full sm:w-auto py-2 px-4 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Add New Gym
                    </button>
                  </div>
                </div>
              </div>

              {/* Gyms Listings */}
              {filteredGyms.length === 0 ? (
                <div className="glass-panel p-12 text-center text-[#8A8A8A] text-sm border border-white/10">
                  No gyms matching search term.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredGyms.map((gym) => {
                    const isExpanded = !!expandedGyms[gym.id];
                    return (
                      <div key={gym.id} className="glass-panel overflow-hidden border border-white/10 hover:border-white/20 transition-all shadow-xl">
                        {/* Gym Head Section */}
                        <div className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/[0.01]">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2.5">
                              <h3 className="text-xl font-bold text-white">{gym.name}</h3>
                              <span className="text-xs px-2 py-0.5 rounded bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 font-medium">
                                {gym.city}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#8A8A8A]">
                              <span className="flex items-center gap-1 text-[#8A8A8A]">
                                <MapPin className="h-3.5 w-3.5" />
                                {gym.address}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                {gym.fee} INR / month
                              </span>
                              <span className="flex items-center gap-1 text-yellow-500">
                                <Star className="h-3.5 w-3.5 fill-yellow-500" />
                                {gym.rating.toFixed(1)} / 5.0
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {gym.amenities.map((amenity, idx) => (
                                <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[#8A8A8A]">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Action Controls */}
                          <div className="flex items-center gap-2.5 self-stretch lg:self-auto justify-end border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                            <button
                              onClick={() => handleAddTrainerClick(gym.id)}
                              className="btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center gap-1 hover:border-[#FF6B00]/30 hover:text-white"
                            >
                              <Plus className="h-3.5 w-3.5" /> Trainer
                            </button>
                            <button
                              onClick={() => handleEditGym(gym)}
                              className="btn-secondary p-2 hover:text-white"
                              title="Edit Gym"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGym(gym.id, gym.name)}
                              className="btn-secondary p-2 text-red-500 hover:bg-red-500/10"
                              title="Delete Gym"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => toggleGymExpand(gym.id)}
                              className="btn-secondary p-2 text-white/80"
                              title={isExpanded ? 'Collapse Trainers' : 'Expand Trainers'}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Trainers Section */}
                        {isExpanded && (
                          <div className="border-t border-white/10 bg-black/20 p-6 space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-bold text-white tracking-wide uppercase">
                                Registered Trainers ({gym.trainers?.length || 0})
                              </h4>
                            </div>

                            {!gym.trainers || gym.trainers.length === 0 ? (
                              <div className="text-center py-6 text-xs text-[#8A8A8A] italic">
                                No trainers associated with this gym yet. Click "+ Trainer" to register.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {gym.trainers.map((trainer) => (
                                  <div key={trainer.id} className="bg-brand-card/50 border border-white/5 rounded-xl p-4 flex justify-between items-start hover:border-white/10 transition-all">
                                    <div className="space-y-1.5">
                                      <div className="font-semibold text-white">{trainer.name}</div>
                                      <div className="text-xs text-[#8A8A8A] flex items-center gap-1">
                                        <Award className="h-3 w-3 text-[#FF6B00]" />
                                        <span>{trainer.specialization} • {trainer.experience} yrs exp</span>
                                      </div>
                                      <div className="text-xs text-[#8A8A8A] flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        <span>{trainer.phone}</span>
                                      </div>
                                      <div className="text-xs text-[#FF6B00] font-medium">
                                        Fee: {trainer.fee} INR / month
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleEditTrainer(trainer)}
                                        className="p-1.5 hover:bg-white/5 rounded text-[#8A8A8A] hover:text-white"
                                        title="Edit Trainer"
                                      >
                                        <Edit3 className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTrainer(trainer.id, trainer.name)}
                                        className="p-1.5 hover:bg-red-500/10 rounded text-red-500"
                                        title="Remove Trainer"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
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
          )}

          {/* TAB 3: ACTIVITY LOGS */}
          {activeTab === 'logs' && (
            <div className="glass-panel p-6 shadow-2xl border border-white/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Global System Activity Log</h2>
                  <p className="text-xs text-[#8A8A8A]">Audit log capturing registration signups, logins, and logged workout metrics.</p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A8A8A]" />
                  <input
                    type="text"
                    placeholder="Search logs by action or details..."
                    value={searchLog}
                    onChange={(e) => setSearchLog(e.target.value)}
                    className="glass-input w-full !pl-10 text-sm py-2"
                  />
                </div>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-[#8A8A8A] text-sm">
                  No system logs found matching "{searchLog}".
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredLogs.map((log) => {
                    // Custom action pill colors
                    let badgeColor = 'bg-white/5 text-[#8A8A8A] border-white/10';
                    if (log.action === 'SIGNUP') badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                    if (log.action === 'LOGIN') badgeColor = 'bg-green-500/10 text-green-400 border-green-500/20';
                    if (log.action === 'WORKOUT_LOGGED') badgeColor = 'bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20';
                    if (log.action.includes('CREATED')) badgeColor = 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30';
                    if (log.action.includes('DELETED')) badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';

                    return (
                      <div key={log.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeColor}`}>
                            {log.action}
                          </span>
                          <p className="text-sm text-white">{log.details}</p>
                        </div>
                        <span className="text-xs text-[#8A8A8A] shrink-0 font-medium">
                          {new Date(log.loggedAt).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* GYM MODAL POPUP */}
      {isGymModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-white/10 p-5 bg-white/[0.02]">
              <h3 className="text-lg font-bold text-white">
                {editingGym ? `Edit Gym: ${editingGym.name}` : 'Register New Gym Location'}
              </h3>
              <button onClick={() => setIsGymModalOpen(false)} className="text-[#8A8A8A] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGymSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#8A8A8A] uppercase">Gym Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golds Gym Premium"
                  value={gymForm.name}
                  onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })}
                  className="glass-input w-full text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#8A8A8A] uppercase">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad"
                    value={gymForm.city}
                    onChange={(e) => setGymForm({ ...gymForm, city: e.target.value })}
                    className="glass-input w-full text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#8A8A8A] uppercase">Monthly Fee (INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1500"
                    value={gymForm.fee}
                    onChange={(e) => setGymForm({ ...gymForm, fee: e.target.value })}
                    className="glass-input w-full text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#8A8A8A] uppercase">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. H.No 12-4, Madhapur Metro"
                  value={gymForm.address}
                  onChange={(e) => setGymForm({ ...gymForm, address: e.target.value })}
                  className="glass-input w-full text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#8A8A8A] uppercase">
                  Amenities <span className="text-[10px] text-white/40 normal-case">(comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cardio, Free Weights, Steam Bath, Parking"
                  value={gymForm.amenities}
                  onChange={(e) => setGymForm({ ...gymForm, amenities: e.target.value })}
                  className="glass-input w-full text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsGymModalOpen(false)}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm py-2 px-6 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Gym
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRAINER MODAL POPUP */}
      {isTrainerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-white/10 p-5 bg-white/[0.02]">
              <h3 className="text-lg font-bold text-white">
                {editingTrainer ? `Edit Trainer: ${editingTrainer.name}` : 'Register Certified Trainer'}
              </h3>
              <button onClick={() => setIsTrainerModalOpen(false)} className="text-[#8A8A8A] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTrainerSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#8A8A8A] uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coach Ramesh Kumar"
                  value={trainerForm.name}
                  onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                  className="glass-input w-full text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#8A8A8A] uppercase">Contact Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={trainerForm.phone}
                    onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })}
                    className="glass-input w-full text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#8A8A8A] uppercase">Monthly Fee (INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 2500"
                    value={trainerForm.fee}
                    onChange={(e) => setTrainerForm({ ...trainerForm, fee: e.target.value })}
                    className="glass-input w-full text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#8A8A8A] uppercase">Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weight Loss, Bodybuilding"
                    value={trainerForm.specialization}
                    onChange={(e) => setTrainerForm({ ...trainerForm, specialization: e.target.value })}
                    className="glass-input w-full text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#8A8A8A] uppercase">Years of Experience</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 5"
                    value={trainerForm.experience}
                    onChange={(e) => setTrainerForm({ ...trainerForm, experience: e.target.value })}
                    className="glass-input w-full text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsTrainerModalOpen(false)}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm py-2 px-6 flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
