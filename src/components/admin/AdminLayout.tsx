import React, { useState } from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminUsers } from './AdminUsers';
import { AdminStatistics } from './AdminStatistics';
import { AdminAds } from './AdminAds';
import { AdminCodes } from './AdminCodes';
import { AdminPages } from './AdminPages';
import { AdminNavigation } from './AdminNavigation';
import { AdminSiteSettings } from './AdminSiteSettings';
import AdminFooterManager from './AdminFooterManager';

type AdminSection = 'dashboard' | 'users' | 'statistics' | 'ads' | 'codes' | 'pages' | 'navigation' | 'branding';

export function AdminLayout() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  const menuItems: { id: AdminSection; label: string; icon: keyof typeof Icons }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'statistics', label: 'Statistics', icon: 'BarChart3' },
    { id: 'pages', label: 'Pages', icon: 'FileCode' },
    { id: 'navigation', label: 'Menus & Navigation', icon: 'Menu' },
    { id: 'branding', label: 'Branding', icon: 'Globe' },
    { id: 'ads', label: 'Ads', icon: 'Megaphone' },
    { id: 'codes', label: 'Codes', icon: 'Code2' },
    { id: 'users', label: 'Users', icon: 'Users' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <AdminDashboardOverview />;
      case 'users': return <AdminUsers />;
      case 'statistics': return <AdminStatistics />;
      case 'ads': return <AdminAds />;
      case 'codes': return <AdminCodes />;
      case 'pages': return <AdminPages />;
      case 'navigation': return <AdminNavigation />;
      case 'branding': return <AdminSiteSettings />;
      default: return <AdminDashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-slate-50/50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-20 h-[calc(100vh-80px)]">
        <div className="p-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Admin Control</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = Icons[item.icon] as any;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    activeSection === item.id
                      ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-500/5"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {/* Mobile Nav Overlay (simplified for now) */}
        <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex gap-2 overflow-x-auto scroller-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeSection === item.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
