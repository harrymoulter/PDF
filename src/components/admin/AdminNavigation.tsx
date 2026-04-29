import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, NavigationIcon, ChevronDown, ChevronUp, Save, Loader2, Link as LinkIcon, Globe, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { NavItem } from '../../types';

export function AdminNavigation() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'header' | 'footer'>('header');

  useEffect(() => {
    fetchNavItems();
  }, []);

  const fetchNavItems = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_links')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      setNavItems(data || []);
    } catch (err) {
      console.error('Error fetching nav items:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (location: string, section?: string) => {
    const newItems = [...navItems];
    const itemsInGroup = newItems.filter(i => i.location === location && i.section === section);
    newItems.push({
      id: 'temp-' + Math.random().toString(36).substr(2, 9),
      name: 'New Link',
      url: '/',
      order_index: itemsInGroup.length,
      location,
      section: section || null,
      link_type: 'Internal Page'
    } as any);
    setNavItems(newItems);
  };

  const removeItem = (id: string) => {
    setNavItems(navItems.filter(i => i.id !== id));
  };

  const updateItem = (id: string, updates: any) => {
    setNavItems(navItems.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const item = navItems.find(i => i.id === id);
    if (!item) return;

    const itemsOfSameGroup = navItems
      .filter(i => i.location === item.location && i.section === item.section)
      .sort((a, b) => a.order_index - b.order_index);
    
    const index = itemsOfSameGroup.findIndex(i => i.id === id);
    if (direction === 'up' && index > 0) {
      const prev = itemsOfSameGroup[index - 1];
      const current = itemsOfSameGroup[index];
      setNavItems(navItems.map(i => {
        if (i.id === current.id) return { ...i, order_index: prev.order_index };
        if (i.id === prev.id) return { ...i, order_index: current.order_index };
        return i;
      }));
    } else if (direction === 'down' && index < itemsOfSameGroup.length - 1) {
      const next = itemsOfSameGroup[index + 1];
      const current = itemsOfSameGroup[index];
      setNavItems(navItems.map(i => {
        if (i.id === current.id) return { ...i, order_index: next.order_index };
        if (i.id === next.id) return { ...i, order_index: current.order_index };
        return i;
      }));
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    console.log('💾 [AdminNav] Starting clean save operation...');
    try {
      const payload = navItems.map((item) => {
        const data: any = {
          name: item.name,
          url: item.url,
          location: item.location,
          section: item.section,
          order_index: item.order_index
        };

        if (item.id && !item.id.startsWith('temp-')) {
          data.id = item.id;
        }
        return data;
      });

      // Pure cleanup and insert
      console.log('📝 [AdminNav] Rebuilding navigation_links table...');
      const { error: deleteError } = await supabase.from('navigation_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (deleteError) throw deleteError;

      if (payload.length > 0) {
        const { error: insertError } = await supabase.from('navigation_links').insert(payload);
        if (insertError) throw insertError;
      }
      
      console.log('✅ [AdminNav] Navigation rebuilt successfully.');
      window.dispatchEvent(new CustomEvent('navigation-updated'));
      
      fetchNavItems();
      alert('Navigation updated successfully!');
    } catch (err: any) {
      console.error('💥 [AdminNav] Save error:', err);
      alert('Error saving navigation: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderMenuList = (location: string, section: string | null, title: string) => {
    const items = navItems
      .filter(i => i.location === location && i.section === section)
      .sort((a, b) => a.order_index - b.order_index);
    
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest flex items-center gap-2">
            <NavigationIcon size={16} className="text-red-600" /> {title}
          </h4>
          <button 
            onClick={() => addItem(location, section || undefined)}
            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveItem(item.id!, 'up')} className="text-slate-300 hover:text-slate-600 p-0.5"><ChevronUp size={14} /></button>
                    <button onClick={() => moveItem(item.id!, 'down')} className="text-slate-300 hover:text-slate-600 p-0.5"><ChevronDown size={14} /></button>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Label</label>
                      <input 
                        value={item.name}
                        onChange={(e) => updateItem(item.id!, { name: e.target.value })}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold focus:ring-2 focus:ring-red-500/20"
                        placeholder="Link Name"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">URL / Path</label>
                      <input 
                        value={item.url}
                        onChange={(e) => updateItem(item.id!, { url: e.target.value })}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono text-slate-500 focus:ring-2 focus:ring-red-500/20"
                        placeholder="/page/about"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => removeItem(item.id!)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-4 pl-8 border-t border-slate-100 pt-2">
                   <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Link Type:</span>
                      <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
                        {['Internal Page', 'External URL'].map((t) => (
                          <button
                            key={t}
                            onClick={() => updateItem(item.id!, { link_type: t as any })}
                            className={cn(
                              "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                              item.link_type === t ? "bg-red-600 text-white" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                   </div>
                   <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest ml-auto">
                      {item.link_type === 'External URL' ? <Globe size={10} /> : <MapPin size={10} />}
                      {item.link_type}
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
               <LinkIcon size={24} className="text-slate-200 mx-auto mb-2" />
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Empty Menu</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Navigation Manager</h2>
          <p className="text-slate-500 font-medium italic">Configure header and footer structure</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={saving}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Structure
        </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
         <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
           <MapPin size={18} className="text-red-500" /> Structure Preview
         </h3>
         <div className="flex flex-col gap-6">
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
               <div className="flex justify-between items-center px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm mb-4">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center p-1.5"><div className="w-full h-full border-2 border-white rounded-sm"/></div>
                  <div className="flex gap-4">
                     {navItems.filter(i => i.location === 'header').slice(0, 4).map(i => (
                        <div key={i.id} className="text-[8px] font-black uppercase text-slate-400">{i.name}</div>
                     ))}
                     {navItems.filter(i => i.location === 'header').length === 0 && <div className="text-[8px] font-black uppercase text-slate-200 italic">Header links appear here</div>}
                  </div>
                  <div className="w-6 h-6 bg-slate-100 rounded-full"/>
               </div>
               <p className="text-[8px] font-black uppercase text-slate-400 text-center">Header Navigation Preview</p>
            </div>

            <div className="border border-slate-100 rounded-2xl p-6 bg-slate-900">
               <div className="grid grid-cols-3 gap-8">
                  {['company', 'legal', 'quick'].map(sec => (
                     <div key={sec} className="space-y-2">
                        <div className="w-12 h-1 bg-slate-700 rounded-full mb-3"/>
                        {navItems.filter(i => i.location === 'footer' && i.section === sec).slice(0, 3).map(i => (
                           <div key={i.id} className="text-[7px] font-bold text-slate-500">{i.name}</div>
                        ))}
                        {navItems.filter(i => i.location === 'footer' && i.section === sec).length === 0 && <div className="text-[7px] text-slate-700 italic">{sec}</div>}
                     </div>
                  ))}
               </div>
               <p className="text-[8px] font-black uppercase text-slate-600 text-center mt-6 border-t border-slate-800 pt-4">Footer Columns Preview</p>
            </div>
         </div>
      </div>

      <div className="flex gap-4 p-1 bg-slate-200/50 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('header')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'header' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Header Navigation
        </button>
        <button 
          onClick={() => setActiveTab('footer')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'footer' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Footer Columns
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {activeTab === 'header' ? (
          <div className="lg:col-span-12">
            {renderMenuList('header', null, 'Primary Header Menu')}
          </div>
        ) : (
          <>
            <div className="lg:col-span-4">
              {renderMenuList('footer', 'company', 'Column 1: Company')}
            </div>
            <div className="lg:col-span-4">
              {renderMenuList('footer', 'legal', 'Column 2: Legal')}
            </div>
            <div className="lg:col-span-4">
              {renderMenuList('footer', 'quick', 'Column 3: Quick Links')}
            </div>
          </>
        )}
      </div>

      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-red-500 shrink-0">
          <Info size={20} />
        </div>
        <div className="text-xs">
          <h4 className="font-black text-slate-900 uppercase tracking-widest mb-1">Manager Instructions</h4>
          <p className="text-slate-500 leading-relaxed font-medium">
            Changes made here are local until you click <strong>Save Structure</strong>. Use external URLs for social links or external resources. Use internal paths (e.g. <code>/page/terms</code>) for dynamically created pages.
          </p>
        </div>
      </div>
    </div>
  );
}

function Info(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
