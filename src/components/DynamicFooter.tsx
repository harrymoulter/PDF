import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github, Mail, Globe } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { FooterLink, AppView, ToolId } from '../types';

interface DynamicFooterProps {
  onViewChange?: (view: AppView) => void;
  onSelectTool?: (toolId: ToolId) => void;
}

export function DynamicFooter({ onViewChange, onSelectTool }: DynamicFooterProps) {
  const { settings } = useSettings();
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFooterLinks = async () => {
      console.log('🔍 [Footer] Fetching navigation links for footer from DB...');
      try {
        const { data, error } = await supabase
          .from('navigation_links')
          .select('*')
          .eq('location', 'footer')
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          console.warn('⚠️ [Footer] No footer links found in DB.');
          setFooterLinks([]);
        } else {
          setFooterLinks(data);
        }
      } catch (err) {
        console.error('❌ [Footer] Critical fetch error:', err);
        setFooterLinks([]);
      }
    };

    fetchFooterLinks();

    const handleNavUpdate = () => {
      console.log('🔄 [Footer] Navigation update detected, re-fetching...');
      fetchFooterLinks();
    };
    
    window.addEventListener('navigation-updated', handleNavUpdate);
    return () => window.removeEventListener('navigation-updated', handleNavUpdate);
  }, []);

  const companyLinks = footerLinks.filter(i => i.section === 'company');
  const legalLinks = footerLinks.filter(i => i.section === 'legal');
  const quickLinks = footerLinks.filter(i => i.section === 'quick');

  console.log('🏗️ [Footer] Rendering Sections:', {
    company: companyLinks.length,
    legal: legalLinks.length,
    navigation: quickLinks.length,
    total: footerLinks.length
  });

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    // If it's a full URL or mailto, let default behavior handle it
    if (url.startsWith('http') || url.startsWith('mailto:')) return;

    e.preventDefault();
    console.log(`🔗 [Footer] Navigating to: ${url}`);
    navigate(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8 px-4 md:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
             {settings?.logo_url ? (
               <img src={settings.logo_url} alt={`${settings?.site_title || 'SmartPDF'} Logo`} className="h-10 w-auto object-contain" />
             ) : (
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center p-2 shadow-sm">
                   <Globe className="text-white" aria-hidden="true" />
                </div>
             )}
             <span className="font-outfit font-black text-xl tracking-tight text-slate-900">{settings?.site_title || 'SmartPDF'}</span>
          </div>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {settings?.tagline || "The world's most powerful free local PDF intelligence toolkit. Private, secure, and AI-powered."}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4">
             {/* Dynamic social links would go here if they were in the DB. 
                 Removing static ones to comply with 'No static links' rule. */}
          </div>
        </div>

        {[
          { title: 'Company', items: companyLinks },
          { title: 'Legal', items: legalLinks },
          { title: 'Navigation', items: quickLinks }
        ].map((col, i) => (
          <div key={i} className="text-center md:text-left">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">{col.title}</h4>
            <ul className="space-y-4">
               {col.items.length > 0 ? col.items.map((item) => (
                 <li key={item.id}>
                   <a 
                     href={item.url}
                     onClick={(e) => handleLinkClick(e, item.url)}
                     className="text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors"
                   >
                     {item.name}
                   </a>
                 </li>
               )) : (
                 <li className="text-slate-300 text-xs italic">No links added yet</li>
               )}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-50 gap-4">
        <div className="flex items-center gap-6">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             © {new Date().getFullYear()} {settings?.site_title || 'SmartPDF'}. All rights reserved.
           </p>
           <div className="w-px h-4 bg-slate-100" />
           <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">v1.2.0 Stable</p>
        </div>
      </div>
    </footer>
  );
}
