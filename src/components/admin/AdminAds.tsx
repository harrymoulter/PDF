import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit2, Code, Power, PowerOff, Layout, Loader2, Save, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Ad } from '../../types';

export function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<Ad>({
    name: '',
    code: '',
    position: 'After Header',
    active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_placements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAds(data || []);
    } catch (err) {
      console.error('Error fetching ads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!currentAd.code?.trim()) {
        alert('Ad code is required');
        return;
      }

      if (currentAd.id) {
        const { error } = await supabase
          .from('ad_placements')
          .update({
            name: currentAd.name,
            code: currentAd.code,
            position: currentAd.position,
            active: currentAd.active
          })
          .eq('id', currentAd.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ad_placements')
          .insert([{
            name: currentAd.name,
            code: currentAd.code,
            position: currentAd.position,
            active: currentAd.active
          }]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchAds();
      setCurrentAd({ name: '', code: '', position: 'After Header', active: true });
    } catch (err: any) {
      alert('Error saving ad: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (ad: Ad) => {
    if (!ad.id) return;
    try {
      const { error } = await supabase
        .from('ad_placements')
        .update({ active: !ad.active })
        .eq('id', ad.id);
      
      if (error) {
        console.error('Toggle status error:', error);
        throw error;
      }
      
      await fetchAds();
    } catch (err: any) {
      alert('Error toggling status: ' + (err.message || 'Unknown error'));
      console.error('Toggle error details:', err);
    }
  };

  const deleteAd = async (id: string) => {
    if (!id) return;
    if (!confirm('Delete this ad slot?')) return;
    try {
      const { error } = await supabase
        .from('ad_placements')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Delete ad error:', error);
        throw error;
      }
      
      await fetchAds();
    } catch (err: any) {
      alert('Error deleting ad: ' + (err.message || 'Unknown error'));
      console.error('Delete error details:', err);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ads Management</h2>
          <p className="text-slate-500 font-medium italic">Deploy HTML/JS ads to smart positions</p>
        </div>
        <button 
          onClick={() => {
            setCurrentAd({ name: '', code: '', position: 'After Header', active: true });
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} /> New Ad Slot
        </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Layout size={18} className="text-red-500" /> Placement Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 relative aspect-video bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden p-4 flex flex-col gap-2">
            <div className="w-full h-8 bg-white rounded-lg border border-slate-200 flex items-center px-4 justify-between">
               <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-slate-100"/><div className="w-2 h-2 rounded-full bg-slate-100"/></div>
               <div className="w-20 h-2 bg-slate-50 rounded-full"/>
            </div>
            <div className="w-full h-4 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center text-[8px] font-black text-red-500 uppercase tracking-widest">After Header</div>
            <div className="flex-1 flex gap-2">
              <div className="w-16 flex flex-col gap-2">
                <div className="w-full h-12 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center text-[6px] font-black text-red-500 uppercase tracking-widest text-center px-1">Sidebar Top</div>
                <div className="flex-1 bg-white rounded-lg border border-slate-200 p-2 space-y-1">
                  <div className="w-full h-1 bg-slate-100 rounded-full"/>
                  <div className="w-2/3 h-1 bg-slate-100 rounded-full"/>
                </div>
                <div className="w-full h-12 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center text-[6px] font-black text-red-500 uppercase tracking-widest text-center px-1">Sidebar Bottom</div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                  <div className="w-full h-2 bg-slate-100 rounded-full"/>
                  <div className="w-full h-2 bg-slate-100 rounded-full"/>
                  <div className="w-full h-8 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center text-[8px] font-black text-red-400 uppercase tracking-widest">Inside Content</div>
                  <div className="w-full h-2 bg-slate-100 rounded-full"/>
                  <div className="w-2/3 h-2 bg-slate-100 rounded-full"/>
                </div>
              </div>
            </div>
            <div className="w-full h-4 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center text-[8px] font-black text-red-500 uppercase tracking-widest">Before Footer</div>
            <div className="w-full h-10 bg-slate-800 rounded-lg border border-slate-700 flex items-center px-4 justify-between">
               <div className="w-12 h-1.5 bg-slate-600 rounded-full"/>
               <div className="flex gap-2"><div className="w-4 h-1.5 bg-slate-600 rounded-full"/><div className="w-4 h-1.5 bg-slate-600 rounded-full"/></div>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4">
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Rotation System</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">Multiple ads in the same slot will rotate every 15 seconds to maximize exposure.</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">Dynamic Rendering</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">External scripts and HTML snippets are isolated and executed safely via React's contextual fragments.</p>
             </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
      ) : ads.length === 0 ? (
        <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Code size={32} />
          </div>
          <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">No Ad Slots Found</p>
          <p className="text-slate-400 text-sm mt-1">Start by creating your first display advertisement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden group shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-md">{ad.position}</span>
                    </div>
                    <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{ad.name}</h4>
                  </div>
                  <button 
                    onClick={() => toggleStatus(ad)}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      ad.active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
                    )}
                  >
                    {ad.active ? <Power size={18} /> : <PowerOff size={18} />}
                  </button>
                </div>
                
                <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[10px] text-slate-400 h-24 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                  {ad.code}
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center gap-2 border-t border-slate-50 mt-auto">
                <button 
                  onClick={() => {
                    setCurrentAd(ad);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  onClick={() => deleteAd(ad.id!)}
                  className="px-3 py-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ad Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-[2.5rem] p-8 relative shadow-2xl overflow-y-auto max-h-[95vh]"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-6">{currentAd.id ? 'Edit Ad' : 'New Ad Slot'}</h3>
              
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Ad Internal Name</label>
                    <input 
                      required
                      value={currentAd.name}
                      onChange={(e) => setCurrentAd({ ...currentAd, name: e.target.value })}
                      className="w-full bg-slate-50 border-none px-6 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500/20"
                      placeholder="e.g. Google Ads Header Banner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Ad Code (HTML / JS)</label>
                    <textarea 
                      required
                      value={currentAd.code}
                      onChange={(e) => setCurrentAd({ ...currentAd, code: e.target.value })}
                      className="w-full bg-slate-900 text-emerald-400 font-mono px-6 py-4 rounded-2xl text-xs focus:ring-2 focus:ring-red-500/20 h-40 resize-none shadow-inner"
                      placeholder="<script>...</script> or <div class='ad'>...</div>"
                    />
                    <p className="mt-2 text-[9px] text-slate-400 flex items-center gap-1 ml-2">
                       <Code size={10} /> Supports script tags and dynamic execution
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Placement position</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      value={currentAd.position}
                      onChange={(e) => setCurrentAd({ ...currentAd, position: e.target.value as any })}
                      className="w-full bg-slate-50 border-none pl-12 pr-6 py-3 rounded-2xl text-sm font-bold appearance-none focus:ring-2 focus:ring-red-500/20"
                    >
                      <option value="After Header">After Header</option>
                      <option value="Before Footer">Before Footer</option>
                      <option value="Inside Content">Inside Content (Mid Page)</option>
                      <option value="Sidebar Top">Sidebar Top</option>
                      <option value="Sidebar Bottom">Sidebar Bottom</option>
                      <option value="ALL">ALL (Every Slot)</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 pt-6 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={saving}
                    className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                    <Save size={16} /> {saving ? 'Saving...' : 'Deploy Ad Slot'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
