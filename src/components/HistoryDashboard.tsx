import React, { useEffect, useState } from 'react';
import { History, Search, Filter, Calendar, FileText, CheckCircle2, XCircle, Trash2, Loader2, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserHistory } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export function HistoryDashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState<UserHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [clearing, setClearing] = useState(false);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (err: any) {
      console.error('Error fetching history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleClearHistory = async () => {
    if (!user || !window.confirm('Are you sure you want to clear your history?')) return;
    setClearing(true);
    try {
      const { error } = await supabase
        .from('user_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setHistory([]);
    } catch (err: any) {
      alert('Failed to clear history: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.action_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'all' || item.action_type === filterAction;
    return matchesSearch && matchesFilter;
  });

  const getUniqueActions = (): string[] => {
    const actions = new Set<string>();
    history.forEach(h => actions.add(h.action_type));
    return ['all', ...Array.from(actions)];
  };

  const uniqueActions = getUniqueActions();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSize = (size: string | number) => {
    const n = Number(size);
    if (isNaN(n) || n === 0) return 'N/A';
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Operation History</h1>
          <p className="text-slate-500 mt-2 font-medium">Track your recent PDF operations and tools usage.</p>
        </div>
        <button 
          onClick={handleClearHistory}
          disabled={clearing || history.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
        >
          {clearing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Clear History
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search by filename or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-none h-11 pl-10 pr-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-200 transition-all"
          />
          <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
        </div>
        <div className="flex gap-4">
          <div className="relative">
             <select 
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-slate-50 border-none h-11 pl-10 pr-8 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-slate-200 transition-all appearance-none cursor-pointer"
            >
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </option>
              ))}
            </select>
            <Filter className="absolute left-3 top-3.5 text-slate-400" size={16} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Retrieving History...</p>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">File Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filteredHistory.map((item) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                            {getActionIcon(item.action_type)}
                          </div>
                          <span className="font-bold text-slate-900 capitalize">{item.action_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 max-w-[200px] md:max-w-md">
                          <FileText size={14} className="text-slate-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-600 truncate">{item.file_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          item.result_status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {item.result_status === 'success' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {item.result_status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-500">{formatSize(item.file_size)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{formatDate(item.created_at)}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-2">
              <History size={32} />
            </div>
            <h3 className="font-black text-slate-900">No Operations Found</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              {searchTerm || filterAction !== 'all' 
                ? "No history matches your current filters." 
                : "You have not performed any operations yet. Start by using one of our tools!"}
            </p>
            {(searchTerm || filterAction !== 'all') && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterAction('all'); }}
                className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-2 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
          <Calendar size={20} />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900">Privacy First</h4>
          <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
            Your operation history is only visible to you. We do not store the actual content of your files, only the metadata of the task performed for your tracking purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

function getActionIcon(type: string) {
  // Simple helper to return icons based on action type
  return <FileText size={16} />;
}
