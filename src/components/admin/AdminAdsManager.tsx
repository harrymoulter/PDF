import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, ToggleLeft, ToggleRight, Layout, Loader2, Megaphone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Ad } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminAdsManager() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [position, setPosition] = useState<Ad['position']>('After Header');
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ads:', error);
        setAds([]);
      } else {
        setAds(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id?: string) => {
    if (!name || !code) return;
    setSaving(true);

    const adData = {
      name,
      code,
      position,
      active
    };

    try {
      if (id) {
        const { error } = await supabase.from('ads').update(adData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ads').insert([adData]);
        if (error) throw error;
      }

      setName('');
      setCode('');
      setPosition('After Header');
      setActive(true);
      setIsAdding(false);
      setEditingId(null);
      fetchAds();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;
    try {
      const { error } = await supabase.from('ads').delete().eq('id', id);
      if (error) throw error;
      fetchAds();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleStatus = async (ad: Ad) => {
    try {
      const { error } = await supabase.from('ads').update({ active: !ad.active }).eq('id', ad.id);
      if (error) throw error;
      fetchAds();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEdit = (ad: Ad) => {
    setName(ad.name);
    setCode(ad.code);
    setPosition(ad.position);
    setActive(ad.active);
    setEditingId(ad.id!);
    setIsAdding(false);
  };

  const positions: Ad['position'][] = ['After Header', 'Before Footer', 'Inside Content', 'Sidebar Top', 'Sidebar Bottom', 'ALL'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Ads Manager</h2>
          <p className="text-xs text-slate-500 font-medium">Inject advertisement codes or HTML custom banners.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all"
        >
          <Plus size={14} />
          Add Advertisement
        </button>
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ad Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Google Ads Header"
                  className="w-full bg-slate-50 border-none h-11 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as Ad['position'])}
                  className="w-full bg-slate-50 border-none h-11 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-200 appearance-none"
                >
                  {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Script / HTML Code</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={5}
                placeholder="Paste your ad code here..."
                className="w-full bg-slate-50 border-none p-4 rounded-xl text-xs font-mono focus:ring-2 focus:ring-slate-200 resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setActive(!active)} className="text-slate-900">
                  {active ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="text-slate-300" />}
                </button>
                <span className="text-xs font-bold text-slate-600">Active Status</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingId || undefined)}
                  disabled={saving}
                  className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {editingId ? 'Update Ad' : 'Publish Ad'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            {!ad.active && <div className="absolute top-0 right-0 p-2 bg-slate-100 text-slate-400 font-black uppercase text-[8px] rounded-bl-xl tracking-tighter">Inactive</div>}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{ad.name}</h4>
                  <span className="bg-slate-50 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{ad.position}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleStatus(ad)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  {ad.active ? <ToggleRight size={18} className="text-emerald-600" /> : <ToggleLeft size={18} className="text-slate-300" />}
                </button>
                <button onClick={() => startEdit(ad)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(ad.id!)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 max-h-[100px] overflow-hidden">
              <code className="text-[10px] text-slate-400 font-mono break-all">{ad.code}</code>
            </div>
          </div>
        ))}
        {ads.length === 0 && !loading && (
          <div className="col-span-full bg-slate-50/50 border border-dashed border-slate-200 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
            <Layout size={32} className="text-slate-200 mb-4" />
            <h3 className="font-bold text-slate-400">No Advertisements Configured</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">Start by adding your first ad slot to monetize your traffic.</p>
          </div>
        )}
      </div>
    </div>
  );
}
