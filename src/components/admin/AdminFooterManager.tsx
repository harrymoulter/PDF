import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, MoveUp, MoveDown, Globe, Loader2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FooterLink, FooterSection } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminFooterManager() {
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [section, setSection] = useState<FooterSection>('company');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        // If table doesn't exist, we might need to handle it or it's created via migration
        // For now we'll just log and set empty
        console.error('Error fetching footer links:', error);
        setLinks([]);
      } else {
        setLinks(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id?: string) => {
    if (!name || !url) return;
    setSaving(true);

    const linkData = {
      name,
      url,
      section,
      order_index: id ? links.find(l => l.id === id)?.order_index : links.length,
    };

    try {
      if (id) {
        const { error } = await supabase.from('footer_links').update(linkData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('footer_links').insert([linkData]);
        if (error) throw error;
      }

      setName('');
      setUrl('');
      setSection('company');
      setIsAdding(false);
      setEditingId(null);
      fetchLinks();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      const { error } = await supabase.from('footer_links').delete().eq('id', id);
      if (error) throw error;
      fetchLinks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEdit = (link: FooterLink) => {
    setName(link.name);
    setUrl(link.url);
    setSection(link.section);
    setEditingId(link.id);
    setIsAdding(false);
  };

  const sections: FooterSection[] = ['company', 'legal', 'quick'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Footer Manager</h2>
          <p className="text-xs text-slate-500 font-medium">Control dynamic links in the website footer.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all"
        >
          <Plus size={14} />
          Add Link
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Link Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. About Us"
                  className="w-full bg-slate-50 border-none h-11 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">URL / Route</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. /page/about-us"
                  className="w-full bg-slate-50 border-none h-11 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Section</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value as FooterSection)}
                  className="w-full bg-slate-50 border-none h-11 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-slate-200 appearance-none"
                >
                  <option value="company">Company</option>
                  <option value="legal">Legal</option>
                  <option value="quick">Navigation</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Create Link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {sections.map((colName) => (
          <div key={colName} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {colName === 'quick' ? 'Navigation' : colName}
              </span>
              <span className="bg-slate-100 text-slate-600 text-[8px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center font-bold">
                {links.filter(l => l.section === colName).length}
              </span>
            </div>

            <div className="space-y-3">
              {links.filter(l => l.section === colName).map((link) => (
                <div 
                  key={link.id}
                  className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all group"
                >
                  {editingId === link.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border-none h-9 px-3 rounded-lg text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-slate-50 border-none h-9 px-3 rounded-lg text-xs font-bold"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(link.id)} className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-[10px] font-black uppercase">Save</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-[10px] font-black uppercase">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{link.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <LinkIcon size={10} className="text-slate-400" />
                          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{link.url}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(link)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(link.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {links.filter(l => l.section === colName).length === 0 && (
                <div className="bg-slate-50/50 border border-dashed border-slate-200 p-8 rounded-xl flex flex-col items-center justify-center text-center">
                  <Globe size={20} className="text-slate-300 mb-2" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Links</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
