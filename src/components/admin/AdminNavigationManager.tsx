import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, MoveUp, MoveDown, Menu as MenuIcon, Loader2, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { NavItem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminNavigationManager() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [menuType, setMenuType] = useState('header');
  const [linkType, setLinkType] = useState<NavItem['link_type']>('Internal Page');

  useEffect(() => {
    fetchNav();
  }, []);

  const fetchNav = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('navigation')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching navigation:', error);
        setNavItems([]);
      } else {
        setNavItems(data || []);
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

    const navData = {
      name,
      url,
      menu_type: menuType,
      link_type: linkType,
      order_index: id ? navItems.find(l => l.id === id)?.order_index : navItems.length,
    };

    try {
      if (id) {
        const { error } = await supabase.from('navigation').update(navData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('navigation').insert([navData]);
        if (error) throw error;
      }

      setName('');
      setUrl('');
      setMenuType('header');
      setLinkType('Internal Page');
      setIsAdding(false);
      setEditingId(null);
      fetchNav();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const { error } = await supabase.from('navigation').delete().eq('id', id);
      if (error) throw error;
      fetchNav();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEdit = (item: NavItem) => {
    setName(item.name);
    setUrl(item.url);
    setMenuType(item.menu_type);
    setLinkType(item.link_type);
    setEditingId(item.id!);
    setIsAdding(false);
  };

  const menuTypes = [
    { id: 'header', label: 'Main Header' },
    { id: 'footer_top', label: 'Footer Top Links' },
    { id: 'sidebar', label: 'User Sidebar' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Navigation Manager</h2>
          <p className="text-xs text-slate-500 font-medium">Manage header menu and other navigational structures.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all"
        >
          <Plus size={14} />
          Add Menu Item
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border-2 border-slate-900 rounded-[2rem] p-8 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tools"
                  className="w-full bg-slate-50 border-none h-12 px-5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">URL / Route Path</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. /pdf-tools"
                  className="w-full bg-slate-50 border-none h-12 px-5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Menu Location</label>
                <select
                  value={menuType}
                  onChange={(e) => setMenuType(e.target.value)}
                  className="w-full bg-slate-50 border-none h-12 px-5 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-200 appearance-none"
                >
                  {menuTypes.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Link Type</label>
                <div className="flex bg-slate-50 p-1 rounded-xl">
                  {['Internal Page', 'External URL'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setLinkType(t as NavItem['link_type'])}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                        linkType === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 text-xs font-black uppercase tracking-widest text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Add Item
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {menuTypes.map((menu) => (
          <div key={menu.id} className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{menu.label}</h3>
              <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-lg font-black">
                {navItems.filter(i => i.menu_type === menu.id).length}
              </span>
            </div>

            <div className="space-y-2">
              {navItems.filter(i => i.menu_type === menu.id).map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                >
                  {editingId === item.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border-none h-10 px-4 rounded-xl text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-slate-50 border-none h-10 px-4 rounded-xl text-xs font-bold"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(item.id)} className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-[10px] font-black uppercase">Save</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-[10px] font-black uppercase">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-400 group-hover:text-indigo-600 rounded-lg transition-colors">
                          <LinkIcon size={14} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{item.url}</span>
                            {item.link_type === 'External URL' && <ExternalLink size={8} className="text-slate-400" />}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => startEdit(item)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(item.id!)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {navItems.filter(i => i.menu_type === menu.id).length === 0 && (
                <div className="bg-slate-50/50 border border-dashed border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                  <MenuIcon size={24} className="text-slate-200 mb-2" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Items</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
