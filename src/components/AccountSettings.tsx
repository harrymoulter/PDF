import React, { useState } from 'react';
import { User, Lock, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';

export function AccountSettings() {
  const { user, profile } = useAuth();
  const [username, setUsername] = useState(profile?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!username.trim()) {
      setMessage({ type: 'error', text: 'Username cannot be empty' });
      return;
    }

    setUsernameLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Username updated successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
       setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
       return;
    }

    setPasswordLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">My Account</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your profile and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Username Settings */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <User size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Profile Information</h2>
              <p className="text-xs text-slate-400 font-medium">Update your public name</p>
            </div>
          </div>

          <form onSubmit={handleUpdateUsername} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                value={user?.email} 
                disabled 
                className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-500 font-medium cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={usernameLoading}
              className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {usernameLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Update Username
            </button>
          </form>
        </section>

        {/* Password Settings */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Security</h2>
              <p className="text-xs text-slate-400 font-medium">Update your password</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-red-600 text-white p-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {passwordLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              Update Password
            </button>
          </form>
        </section>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-8 right-8 p-4 rounded-2xl shadow-xl flex items-center gap-3 border z-50 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70">✕</button>
        </motion.div>
      )}
    </div>
  );
}
