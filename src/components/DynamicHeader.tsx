import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, User, LogOut, LogIn, UserPlus, Menu, Globe, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { NavItem, AppView, ToolId } from '../types';
import { cn } from '../lib/utils';

interface DynamicHeaderProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onSelectTool: (id: ToolId) => void;
  onSidebarToggle: () => void;
}

export function DynamicHeader({ currentView, onViewChange, onSelectTool, onSidebarToggle }: DynamicHeaderProps) {
  const { user, profile, isAdmin, signOut, openLogin, openSignup } = useAuth();
  const { settings } = useSettings();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeaderNav();
    
    // Listen for custom event to re-fetch when admin updates navigation
    const handleNavUpdate = () => {
      console.log('🔄 [Header] Navigation update detected, re-fetching...');
      fetchHeaderNav();
    };
    
    window.addEventListener('navigation-updated', handleNavUpdate);
    return () => window.removeEventListener('navigation-updated', handleNavUpdate);
  }, []);

  const fetchHeaderNav = async () => {
    setLoading(true);
    try {
      // Prioritize navigation_links table if it exists, fallback to navigation
      let table = 'navigation_links';
      
      // We try navigation_links first
      let { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('menu_type', 'header')
        .order('order_index', { ascending: true });
      
      if (error) {
        console.warn(`⚠️ [Header] Failed to fetch from ${table}, trying 'navigation' table...`, error);
        table = 'navigation';
        const { data: navData, error: navError } = await supabase
          .from(table)
          .select('*')
          .eq('menu_type', 'header')
          .order('order_index', { ascending: true });
        
        if (navError) throw navError;
        data = navData;
      }
      
      setNavItems(data || []);
    } catch (err) {
      console.error('❌ [Header] Error fetching navigation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.link_type === 'External URL' || item.url.startsWith('http')) return;
    
    e.preventDefault();
    const url = item.url;
    
    if (url.startsWith('/tool/')) {
      const toolId = url.split('/tool/')[1] as ToolId;
      onSelectTool(toolId);
    } else {
      window.history.pushState({}, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onSidebarToggle}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="lg:hidden flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('dashboard')}>
           {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 w-auto" />
           ) : (
              <span className="font-outfit font-black text-slate-900">{settings?.site_title || 'SmartPDF'}</span>
           )}
        </div>
        
        {/* Dynamic Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 ml-4">
          {loading ? (
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
              <Loader2 size={12} className="animate-spin" />
              Loading Menu...
            </div>
          ) : (
            navItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={(e) => handleLinkClick(e, item)}
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-all hover:text-indigo-600",
                  window.location.pathname === item.url ? "text-indigo-600" : "text-slate-500"
                )}
              >
                {item.name}
              </a>
            ))
          )}
          {navItems.length === 0 && !loading && (
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Welcome to {settings?.site_title || 'SmartPDF'}</span>
          )}
        </nav>

        <div className="flex-1 max-w-md relative hidden sm:block ml-8">
          <input 
            type="text" 
            placeholder="Search tools, extract PDF data..."
            className="w-full bg-slate-50 border-none h-10 pl-10 pr-4 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {user ? (
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => onViewChange('history')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                currentView === 'history' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              History
            </button>
            
            <div className="flex items-center gap-2 md:gap-3 group relative cursor-pointer" onClick={() => onViewChange('account')}>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 leading-none">
                  {profile?.username || user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {isAdmin ? 'Administrator' : 'User'}
                </p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <User size={18} className="md:w-5 md:h-5" />
              </div>

              <button 
                onClick={signOut}
                className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors px-1"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={openLogin}
              className="px-3 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-1 md:gap-2"
            >
              <LogIn size={14} className="md:w-4 md:h-4" />
              <span className="hidden xs:inline">Login</span>
            </button>
            <button 
              onClick={openSignup}
              className="px-3 md:px-6 py-2 md:py-2.5 bg-slate-900 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-1 md:gap-2"
            >
              <UserPlus size={14} className="md:w-4 md:h-4" />
              <span className="hidden xs:inline">Join Free</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
