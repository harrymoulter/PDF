import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Code2, Play, AlertTriangle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CustomCode {
  id: 'header' | 'body' | 'footer';
  content: string;
  is_enabled: boolean;
}

export function AdminCodes() {
  const [codes, setCodes] = useState<CustomCode[]>([
    { id: 'header', content: '', is_enabled: false },
    { id: 'body', content: '', is_enabled: false },
    { id: 'footer', content: '', is_enabled: false },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase.from('custom_codes').select('*');
      if (error && error.code !== '42P01') throw error;
      
      if (data && data.length > 0) {
        const merged = codes.map(c => {
          const remote = data.find(r => r.id === c.id);
          return remote ? remote : c;
        });
        setCodes(merged);
      }
    } catch (err) {
      console.error('Error fetching custom codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: string) => {
    const code = codes.find(c => c.id === id);
    if (!code) return;
    
    setSaving(true);
    setStatus(null);
    try {
      const { error } = await supabase
        .from('custom_codes')
        .upsert(code);
      
      if (error) throw error;
      setStatus({ type: 'success', msg: `${id.toUpperCase()} script saved successfully.` });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  const updateCode = (id: string, updates: Partial<CustomCode>) => {
    setCodes(codes.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Code Injection</h2>
        <p className="text-slate-500 font-medium italic">Paste custom HTML/JS snippets to be injected globally</p>
      </header>

      {status && (
        <div className={cn(
          "p-4 rounded-2xl flex items-center gap-3 font-bold text-sm",
          status.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        )}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {status.msg}
        </div>
      )}

      <div className="space-y-6">
        {codes.map((code) => (
          <div key={code.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
                  <Code2 size={16} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">{code.id} Scripts</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Injects into &lt;{code.id}&gt; tag</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors group-hover:text-slate-600">Enabled</span>
                  <div 
                    onClick={() => updateCode(code.id, { is_enabled: !code.is_enabled })}
                    className={cn(
                      "w-10 h-5 rounded-full transition-all relative p-1",
                      code.is_enabled ? "bg-green-500" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "w-3 h-3 bg-white rounded-full transition-all shadow-sm",
                      code.is_enabled ? "translate-x-5" : "translate-x-0"
                    )} />
                  </div>
                </label>
                <button 
                  onClick={() => handleSave(code.id)}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/10 flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl relative">
                <textarea 
                  value={code.content}
                  onChange={(e) => updateCode(code.id, { content: e.target.value })}
                  spellCheck={false}
                  className="w-full h-40 bg-transparent border-none text-indigo-400 font-mono text-sm focus:ring-0 resize-none p-0"
                  placeholder={`<!-- Paste your ${code.id} scripts here... -->`}
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
                <Info size={18} className="shrink-0 mt-0.5" />
                <p className="text-xs font-medium">
                  <strong>Security Note:</strong> Be careful with custom code. These scripts will execute with the same privileges as your application. Only paste trusted snippets (Analytics, Trackers, etc).
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
