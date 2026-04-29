import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Calendar, Trash2, ArrowUpCircle, ArrowDownCircle, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: nextRole })
        .eq('id', userId);
      
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: nextRole } : u));
    } catch (err: any) {
      alert('Error updating role: ' + err.message);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.username && u.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Registered Users</h2>
          <p className="text-slate-500 font-medium">Manage user roles and system access</p>
        </div>

        <div className="relative max-w-xs w-full">
          <input 
            type="text"
            placeholder="Search email or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 h-10 pl-10 pr-4 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 italic text-slate-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <div className="p-12 bg-red-50 text-red-600 rounded-3xl border border-red-100 text-center">
          <p className="font-bold">Error loading user profiles</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{user.username || 'Anonymous'}</span>
                          <span className="text-xs text-slate-500 font-medium">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <Calendar size={14} />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          user.role === 'admin' 
                            ? 'bg-indigo-50 text-indigo-600' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => toggleRole(user.id, user.role)}
                            title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                          >
                            {user.role === 'admin' ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                          </button>
                          <button 
                            onClick={() => deleteUser(user.id)}
                            title="Delete User"
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-slate-400 italic">
              No users found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
