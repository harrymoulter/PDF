import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AppView } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { AdDisplay } from './AdDisplay';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface DynamicNavItem {
  id: string;
  name: string;
  url: string;
}

export function Sidebar({ isOpen, onClose }: Partial<SidebarProps>) {
  const { isAdmin, user, signOut, setIsAuthModalOpen, setAuthModalView } = useAuth();
  const { settings } = useSettings();
  const [dynamicLinks, setDynamicLinks] = useState<DynamicNavItem[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const openLogin = () => {
    setAuthModalView('login');
    setIsAuthModalOpen(true);
    onClose();
  };

  const openSignup = () => {
    setAuthModalView('signup');
    setIsAuthModalOpen(true);
    onClose();
  };

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('navigation_links')
          .select('*')
          .eq('location', 'header')
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        setDynamicLinks(data || []);
      } catch (err) {
        console.error('Error fetching dynamic sidebar links:', err);
      }
    };
    fetchLinks();

    const handleUpdate = () => fetchLinks();
    window.addEventListener('navigation-updated', handleUpdate);
    return () => window.removeEventListener('navigation-updated', handleUpdate);
  }, []);

  const navigate = useNavigate();

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    // If it is an internal relative link
    if (url.startsWith('/')) {
       e.preventDefault();
       console.log(`🔗 [Sidebar] Navigating to: ${url}`);
       navigate(url);
    }
    onClose?.();
  };

  return (
    <aside className={cn(
      "w-64 h-screen bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 transform lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt={`${settings?.site_title || 'SmartPDF'} Logo`} className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center p-2 shadow-lg shadow-red-500/20">
                <Icons.FileText className="text-white w-full h-full" aria-hidden="true" />
              </div>
            )}
            <span className="font-outfit font-black text-xl tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis">
              {settings?.site_title || 'SmartPDF'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Close Sidebar"
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Global Search inside Sidebar */}
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Search tools..."
            className="w-full bg-slate-800/50 border border-slate-700/50 h-10 pl-10 pr-4 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
          />
          <Icons.Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        <AdDisplay position="Sidebar Top" className="mb-4 px-2" />
        
        {dynamicLinks.length > 0 ? (
          <>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-2">Main Menu</p>
            {dynamicLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                onClick={(e) => handleLinkClick(e, link.url)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
                  location.pathname === link.url 
                    ? "bg-red-600/10 text-red-500 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]" 
                    : "hover:bg-white/5 hover:text-white"
                )}
              >
                <Icons.Link size={18} className={location.pathname === link.url ? "text-red-500" : "text-slate-400"} />
                {link.name}
              </a>
            ))}
          </>
        ) : (
          <div className="px-4 py-8 text-center border border-dashed border-slate-800 rounded-2xl">
             <Icons.Navigation size={24} className="text-slate-700 mx-auto mb-2" />
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">
               No navigation items.<br/>Add links in Admin Panel.
             </p>
          </div>
        )}
        
        {user ? (
          <div className="pt-8 mt-8 border-t border-slate-800/50">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">My Account</p>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                <Icons.User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">
                  {user.email?.split('@')[0]}
                </p>
                <button 
                  onClick={() => {
                    signOut();
                    onClose();
                  }}
                  className="text-[10px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors mt-0.5"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-8 mt-8 border-t border-slate-800/50 flex flex-col gap-2 px-2">
            <button 
              onClick={openLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
            >
              Sign In
            </button>
            <button 
              onClick={openSignup}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
            >
              Get Started Free
            </button>
          </div>
        )}
        <AdDisplay position="Sidebar Bottom" className="mt-8 px-2" />
      </nav>
    </aside>
  );
}
