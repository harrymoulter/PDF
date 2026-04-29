import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  useNavigate, 
  useLocation, 
  useParams,
  Navigate
} from 'react-router-dom';
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
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { syncCmsContent } from './lib/cmsSync';
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/outfit/800.css";

export default function App() {
  return (
    <SettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingsProvider>
  );
}

function ToolRenderer() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();

  if (!toolId) return <Navigate to="/" />;

  const renderTool = () => {
    switch (toolId) {
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
        return <SmartAITool toolId={toolId as ToolId} />;
      case 'cleaner':
        return <OrganizeTool toolId="cleaner" />;
      default: return <ExtractTool />;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-4 md:px-8 pt-4 md:pt-8">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors mb-4"
        >
          <ChevronLeft size={14} /> Back
        </button>
      </div>
      {renderTool()}
    </div>
  );
}

function PageRenderer() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  if (!slug) return <Navigate to="/" />;
  
  // Reserved system routes that should handle their own rendering via explicit Route
  const reserved = ['admin', 'account', 'history', 'pdf-tools', 'ai-tools', 'tool'];
  if (reserved.includes(slug)) return null;

  return <DynamicPage slug={slug} onBack={() => navigate('/')} />;
}

function AppContent() {
  const { 
    loading, 
    isAdmin, 
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalView,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    console.log("🚀 [Router] Current route:", location.pathname);
    // Run CMS sync on startup
    syncCmsContent();
  }, [location.pathname]);

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

  const handleViewChange = (view: AppView) => {
    setIsSidebarOpen(false);
    if (view === 'dashboard') navigate('/');
    else navigate(`/${view}`);
  };

  const handleToolSelect = (id: ToolId) => {
    navigate(`/tool/${id}`);
  };

  const getCurrentView = (): AppView => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path === '/admin') return 'admin';
    if (path === '/account') return 'account';
    if (path === '/history') return 'history';
    if (path === '/pdf-tools') return 'pdf-tools';
    if (path === '/ai-tools') return 'ai-tools';
    return 'dashboard';
  };

  const currentView = getCurrentView();

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex selection:bg-red-500 selection:text-white font-inter overflow-x-hidden">
      <SEO title={settings?.site_title} description={settings?.site_description} />
      <CodeInjection />
      
      <Sidebar 
        currentView={currentView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onViewChange={handleViewChange} 
      />

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
          onViewChange={handleViewChange}
          onSelectTool={handleToolSelect}
          onSidebarToggle={() => setIsSidebarOpen(true)}
        />
        
        <AdDisplay position="After Header" className="mt-4" />

        <div className="flex-1 mb-20">
          <Routes>
            <Route path="/" element={<Dashboard onSelectTool={handleToolSelect} />} />
            <Route path="/admin" element={isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="/history" element={<HistoryDashboard />} />
            <Route path="/pdf-tools" element={
              <div className="p-8">
                <h2 className="text-3xl font-black text-slate-900 mb-8">PDF Utilities</h2>
                <ToolGrid onSelect={handleToolSelect} filter="utility" />
              </div>
            } />
            <Route path="/ai-tools" element={
              <div className="p-8">
                <h2 className="text-3xl font-black text-slate-900 mb-8">AI Intelligence</h2>
                <ToolGrid onSelect={handleToolSelect} filter="ai" />
              </div>
            } />
            <Route path="/tool/:toolId" element={<ToolRenderer />} />
            <Route path="/:slug" element={<PageRenderer />} />
          </Routes>
        </div>

        <AdDisplay position="Before Footer" className="mb-8" />
        <DynamicFooter onViewChange={handleViewChange} onSelectTool={handleToolSelect} />
      
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialView={authModalView}
        />
      </main>
    </div>
  );
}
