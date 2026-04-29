import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Globe, Image as ImageIcon, Layout, Type } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { SiteSettings } from '../../types';

export function AdminSiteSettings() {
  const { settings: initialSettings, refreshSettings } = useSettings();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          site_title: settings.site_title,
          tagline: settings.tagline,
          logo_url: settings.logo_url,
          favicon_url: settings.favicon_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);
      
      if (error) throw error;
      
      await refreshSettings();
      alert('Settings updated successfully!');
    } catch (err: any) {
      alert('Error saving settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="p-20 flex justify-center items-center">
        <Loader2 className="animate-spin text-slate-300" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Site Branding</h2>
          <p className="text-slate-500 font-medium italic">Configure your platform's identity</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* General Info */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Type size={18} className="text-indigo-500" /> Identity
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Site Title</label>
                <input 
                  required
                  value={settings.site_title}
                  onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                  className="w-full bg-slate-50 border-none px-6 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Tagline / Motto</label>
                <textarea 
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full bg-slate-50 border-none px-6 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 h-24 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Visual Assets */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2">
              <ImageIcon size={18} className="text-indigo-500" /> Branding Assets
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Logo URL</label>
                <input 
                  value={settings.logo_url || ''}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  className="w-full bg-slate-50 border-none px-6 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Favicon URL</label>
                <input 
                  value={settings.favicon_url || ''}
                  onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                  className="w-full bg-slate-50 border-none px-6 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 overflow-hidden relative group">
           <div className="absolute top-4 right-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">Header Preview</div>
           <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md max-w-sm">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-8 w-auto object-contain" />
              ) : (
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center p-2">
                  <Globe className="text-white" />
                </div>
              )}
              <div>
                 <p className="font-outfit font-black text-white text-lg leading-tight">{settings.site_title}</p>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{settings.tagline}</p>
              </div>
           </div>
        </div>

        <div className="flex justify-end">
          <button 
            disabled={saving}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Update Branding'}
          </button>
        </div>
      </form>
    </div>
  );
}
