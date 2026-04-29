import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ToolGrid } from './components/ToolGrid';
import { AdminPanel } from './components/AdminPanel';
import { ExtractTool } from './components/tools/ExtractTool';
import { MergeTool } from './components/tools/MergeTool';
import { OrganizeTool } from './components/tools/OrganizeTool';
import { SplitTool } from './components/tools/SplitTool';
import { ImageToPdfTool } from './components/tools/ImageToPdfTool';
import { CompressTool } from './components/tools/CompressTool';
import { OCRTool } from './components/tools/OCRTool';
import { SmartAITool } from './components/tools/SmartAITool';
import { ViewerTool } from './components/tools/ViewerTool';
import { AuthForm } from './components/AuthForm';
import { AuthModal } from './components/AuthModal';
import { AccountSettings } from './components/AccountSettings';
import { HistoryDashboard } from './components/HistoryDashboard';
import { DynamicPage } from './components/DynamicPage';
import { CodeInjection } from './components/CodeInjection';
import { DynamicFooter } from './components/DynamicFooter';
import { DynamicHeader } from './components/DynamicHeader';
import { AdDisplay } from './components/AdDisplay';
import { SEO } from './components/SEO';
import { ToolId, AppView } from './types';
import { Search, User, Bell, ChevronLeft, LogOut, Loader2, LogIn, UserPlus, Menu } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { syncCmsContent } from './lib/cmsSync';
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/outfit/800.css";

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

function AppContent() {
  const { 
    user, 
    loading, 
    isAdmin, 
    profile,
    signOut,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalView,
    openLogin,
    openSignup
  } = useAuth();
  const { settings } = useSettings();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pageSlug, setPageSlug] = useState<string | null>(null);

  useEffect(() => {
    // Run CMS sync on startup
    console.log('🏁 [App] Initializing CMS Synchronization...');
    syncCmsContent().then(() => {
      console.log('🏁 [App] CMS Synchronization finished.');
    });

    const handleNavigation = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setCurrentView('admin');
        setActiveTool(null);
        setPageSlug(null);
      } else if (path.startsWith('/tool/')) {
        const toolId = path.split('/tool/')[1] as ToolId;
        setActiveTool(toolId);
        setCurrentView('dashboard');
        setPageSlug(null);
      } else if (path === '/' || path === '') {
        setActiveTool(null);
        setPageSlug(null);
        setCurrentView('dashboard');
      } else {
        // Any other path is treated as a dynamic page slug
        const slug = path.startsWith('/') ? path.slice(1) : path;
        
        // List of strictly reserved frontend views
        const reservedPaths = ['pdf-tools', 'ai-tools', 'recent', 'settings', 'account', 'history'];
        
        if (reservedPaths.includes(slug)) {
          setCurrentView(slug as AppView);
          setActiveTool(null);
          setPageSlug(null);
        } else if (slug) {
          // If it's not a reserved view, it's a dynamic slug from CMS
          console.log(`🌐 [Navigation] Routing to dynamic page slug: ${slug}`);
          setPageSlug(slug);
          setActiveTool(null);
        }
      }
    };

    handleNavigation();
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Session...</p>
        </div>
      </div>
    );
  }

  const handleToolSelect = (id: ToolId) => {
    setActiveTool(id);
    setPageSlug(null);
    window.history.pushState({ toolId: id }, '', `/tool/${id}`);
  };

  const renderContent = () => {
    if (pageSlug) {
      return <DynamicPage slug={pageSlug} onBack={() => {
        setPageSlug(null);
        window.history.pushState({}, '', '/');
      }} />;
    }

    if (activeTool) {
      switch (activeTool) {
        case 'extract': return <ExtractTool />;
        case 'smart': return <SmartAITool toolId="smart" />;
        case 'merge': return <MergeTool />;
        case 'organize': return <OrganizeTool />;
        case 'split': return <SplitTool />;
        case 'image-to-pdf': return <ImageToPdfTool />;
        case 'compress': return <CompressTool />;
        case 'ocr': return <OCRTool />;
        case 'viewer': return <ViewerTool />;
        case 'assistant':
        case 'invoice': 
        case 'resume': 
        case 'translate': 
        case 'extractor-pro':
        case 'pdf-to-json':
          return <SmartAITool toolId={activeTool} />;
        case 'cleaner':
          return <OrganizeTool toolId="cleaner" />;
        default: return <ExtractTool />;
      }
    }

    switch (currentView) {
      case 'admin':
        return isAdmin ? <AdminPanel /> : <Dashboard onSelectTool={handleToolSelect} />;
      case 'account':
        return <AccountSettings />;
      case 'history':
        return <HistoryDashboard />;
      case 'dashboard':
        return <Dashboard onSelectTool={handleToolSelect} />;
      case 'pdf-tools':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-black text-slate-900 mb-8">PDF Utilities</h2>
            <ToolGrid onSelect={handleToolSelect} filter="utility" />
          </div>
        );
      case 'ai-tools':
        return (
          <div className="p-8">
            <h2 className="text-3xl font-black text-slate-900 mb-8">AI Intelligence</h2>
            <ToolGrid onSelect={handleToolSelect} filter="ai" />
          </div>
        );
      case 'recent':
        return <Dashboard onSelectTool={handleToolSelect} />;
      default:
        return <Dashboard onSelectTool={handleToolSelect} />;
    }
  };

  const getSEOMetadata = () => {
    if (pageSlug) return null; // Let DynamicPage handle its own SEO
    
    if (activeTool) {
      const toolTitles: Record<string, string> = {
        'extract': 'Data Extraction Tool - PDF Table & Text Extractor',
        'smart': 'Smart AI PDF Assistant - Chat & Analyze Documents',
        'merge': 'Merge PDF Files - Combine Multiple PDFs Online',
        'organize': 'Organize PDF Pages - Reorder, Rotate & Delete',
        'split': 'Split PDF - Extract Pages from PDF Online',
        'image-to-pdf': 'Image to PDF Converter - JPG, PNG to PDF',
        'compress': 'Compress PDF - Reduce PDF File Size Free',
        'ocr': 'OCR PDF - Convert Scanned PDF to Searchable Text',
        'viewer': 'PDF Viewer - Read and Annotate PDFs Online',
        'invoice': 'AI Invoice Extractor - Automate Invoice Processing',
        'resume': 'AI Resume Analyzer - Extract Skills from Resumes',
        'translate': 'PDF Translator - Translate Documents with AI'
      };
      return { title: toolTitles[activeTool] || 'PDF Tool' };
    }

    switch (currentView) {
      case 'admin': return { title: 'Admin Dashboard', description: 'Internal admin panel for SmartPDF' };
      case 'pdf-tools': return { title: 'PDF Utilities & Tools', description: 'Comprehensive set of free browser-based PDF utilities' };
      case 'ai-tools': return { title: 'AI-Powered PDF Tools', description: 'Next-generation AI analysis for your PDF documents' };
      default: return {};
    }
  };

  const seoMetadata = getSEOMetadata();

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex selection:bg-red-500 selection:text-white font-inter overflow-x-hidden">
      {seoMetadata && <SEO {...seoMetadata} />}
      <CodeInjection />
      <Sidebar 
        currentView={currentView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onViewChange={(view) => {
          setCurrentView(view);
          setActiveTool(null);
          setPageSlug(null);
          setIsSidebarOpen(false);
          window.history.pushState({}, '', view === 'dashboard' ? '/' : `/${view}`);
        }} 
      />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <main className="flex-1 lg:ml-64 min-h-screen relative overflow-x-hidden flex flex-col">
        <DynamicHeader 
          currentView={currentView}
          onViewChange={setCurrentView}
          onSelectTool={handleToolSelect}
          onSidebarToggle={() => setIsSidebarOpen(true)}
        />
        
        <AdDisplay position="After Header" className="mt-4" />

        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-20 px-0 md:px-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool || currentView || pageSlug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTool && (
                <div className="px-4 md:px-8 pt-4 md:pt-8">
                  <button 
                    onClick={() => {
                        setActiveTool(null);
                        window.history.pushState({}, '', '/');
                    }}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors mb-4"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                </div>
              )}
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <AdDisplay position="Before Footer" className="mb-8" />
        <DynamicFooter onViewChange={setCurrentView} onSelectTool={handleToolSelect} />
      
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialView={authModalView}
        />
      </main>
    </div>
  );
}

