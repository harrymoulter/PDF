import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Search, 
  FileText, 
  Zap, 
  Database,
  Loader2,
  Download,
  AlertCircle,
  Tag,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Globe
} from 'lucide-react';
import { FileUploader } from '../FileUploader';
import { ResultLock } from '../ResultLock';
import { QueueProcessor } from '../../lib/queueProcessor';
import { ProcessingState } from '../../types';
import { semanticSearch, classifyAndSummarize, SmartProcessResult } from '../../lib/smartProcessor';
import { cn } from '../../lib/utils';
import { exportToCSV } from '../../lib/exportUtils';
import { trackAction } from '../../lib/history';
import { localExtractEntities, localSummarize, localClassify, localDetectLanguage } from '../../lib/localExtraction';
import { exportToJSON, exportToText } from '../../lib/exportUtils';
import { ToolId } from '../../types';

import { useAuth } from '../../contexts/AuthContext';

interface SmartAIToolProps {
  toolId?: ToolId;
}

export function SmartAITool({ toolId = 'smart' }: SmartAIToolProps) {
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [smartResults, setSmartResults] = useState<{
    classification: string;
    summary: string;
    entities: { 
      emails: string[], 
      phones: string[], 
      addresses: string[],
      links: string[],
      dates: string[],
      names: string[]
    };
    language: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeProcessor, setActiveProcessor] = useState<QueueProcessor | null>(null);
  const [fullText, setFullText] = useState('');

  const navigateToSection = (sectionId: string, query?: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      
      // Visual feedback
      element.classList.add('ring-4', 'ring-indigo-500/50', 'ring-offset-4', 'scale-[1.01]');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-indigo-500/50', 'ring-offset-4', 'scale-[1.01]');
      }, 2000);

      // Special handling for search
      if (sectionId === 'ai-tools-section') {
        if (query) setSearchQuery(query);
        const input = document.getElementById('ai-search-input') as HTMLInputElement;
        if (input) {
          setTimeout(() => {
            input.focus();
            if (query) {
               handleSearch();
            }
          }, 800);
        }
      }
    } else {
      alert(`Section "${sectionId}" is currently unavailable. Please upload a document first to generate AI insights.`);
    }
  };

  const handleProgress = useCallback((state: ProcessingState) => {
    setProcessingState(state);
    
    // Aggregate full text for search
    const text = state.pages
      .filter(p => p.status === 'completed')
      .map(p => p.rawText)
      .join('\n\n');
    setFullText(text);
  }, []);

  const { user, openLogin } = useAuth();

  // Track service selection
  useEffect(() => {
    trackAction(user?.id, toolId || 'smart-ai', 'service_init', 0, 'completed');
  }, [toolId]);

  const handleFileSelect = async (file: File) => {
    setSmartResults(null);
    setSearchResults([]);
    trackAction(user?.id, toolId || 'smart-ai', file.name, file.size, 'uploaded');
    const processor = new QueueProcessor(file.name, handleProgress);
    setActiveProcessor(processor);
    trackAction(user?.id, toolId || 'smart-ai', file.name, file.size, 'processed');

    try {
      await processor.start(file);
      if (!user) {
        trackAction(undefined, toolId || 'smart-ai', file.name, file.size, 'locked');
      } else {
        trackAction(user.id, toolId || 'smart-ai', file.name, file.size, 'completed');
      }
    } catch (e) {
      trackAction(user?.id, toolId || 'smart-ai', file.name, file.size, 'failed');
    } finally {
      setActiveProcessor(null);
    }
  };

  // Automated Smart Analysis
  useEffect(() => {
    if (processingState?.processedPages && processingState.processedPages >= 1 && !smartResults && processingState.status !== 'error') {
       const runInitialAnalysis = async () => {
         try {
           const firstFewPagesText = processingState.pages
             .filter(p => p.status === 'completed')
             .slice(0, 3)
             .map(p => p.rawText)
             .join('\n');
           
           if (firstFewPagesText.length > 100) {
              const analysis = await classifyAndSummarize(firstFewPagesText);
              setSmartResults(analysis);
           }
         } catch (e) {
           console.error("Smart analysis failed", e);
         }
       };
       runInitialAnalysis();
    }
  }, [processingState?.processedPages, smartResults]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !fullText) return;
    setIsSearching(true);
    try {
      const results = await semanticSearch(fullText, searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExportInsights = () => {
    if (!smartResults || !processingState) return;
    
    if (toolId === 'pdf-to-json') {
      exportToJSON(smartResults, `${processingState.fileName}_structure.json`);
    } else if (toolId === 'extractor-pro') {
      exportToJSON(smartResults.entities, `${processingState.fileName}_entities.json`);
    } else {
      const data = [
        { Category: 'Classification', Value: smartResults.classification },
        { Category: 'Summary', Value: smartResults.summary },
        { Category: 'Language', Value: smartResults.language },
        { Category: 'Emails', Value: smartResults.entities.emails.join(', ') },
        { Category: 'Phones', Value: smartResults.entities.phones.join(', ') },
        { Category: 'Addresses', Value: smartResults.entities.addresses.join(', ') },
        { Category: 'Links', Value: smartResults.entities.links.join(', ') },
        { Category: 'Dates', Value: smartResults.entities.dates.join(', ') },
        { Category: 'Names', Value: smartResults.entities.names.join(', ') },
      ];
      exportToCSV(data, ['Category', 'Value'], `${processingState.fileName}_insights.csv`);
    }
  };

  const isIdle = !processingState;
  const isProcessing = processingState?.status === 'analyzing' || processingState?.status === 'processing';

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles size={14} /> AI Powered
        </div>
        <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Smart Intelligence</h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Deep reasoning for your documents. Summarize, classify, extract entities, 
          and search content using natural language.
        </p>
      </div>

      {isIdle ? (
        <div className="space-y-16">
          <FileUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Tag, title: "Classification", desc: "Auto-detects Invoices, CVs, Contracts, and more." },
              { icon: BookOpen, title: "Summarization", desc: "Instant executive summaries of complex reports." },
              { icon: Search, title: "Semantic Search", desc: "Ask questions about your PDF in plain English." },
              { icon: Globe, title: "RTL Support", desc: "Automatic language detection and direction handling." }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <item.icon size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 space-y-6">
             <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 truncate max-w-xs">{processingState.fileName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                        isProcessing ? "bg-indigo-100 text-indigo-600 animate-pulse" : "bg-green-100 text-green-600"
                      )}>
                        {isProcessing ? (processingState.currentAction || 'Analyzing Content') : 'Processing Ready'}
                      </span>
                      <span className="text-xs text-slate-400">{processingState.processedPages} / {processingState.totalPages} Pages</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {isProcessing ? (
                    <button onClick={() => activeProcessor?.stop()} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-all">
                      Stop
                    </button>
                  ) : (
                    <button onClick={() => setProcessingState(null)} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm">
                      Upload New
                    </button>
                  )}
                </div>
             </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <ResultLock isResultReady={!!smartResults}>
               <AnimatePresence mode="wait">
                {smartResults ? (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl space-y-10"
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="px-4 py-2 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2">
                         <Tag size={16} /> {smartResults.classification}
                      </div>
                      <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm flex items-center gap-2">
                         <Globe size={16} /> {smartResults.language}
                      </div>
                    </div>

                    <div id="summary-section" className="space-y-4">
                      <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                         <BookOpen className="text-indigo-600" size={24} /> 
                         Executive Summary
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-lg">
                         {smartResults.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                      <div id="email-section" className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-[0.2em]">
                          <Mail size={12} /> Emails
                        </h4>
                        <div className="flex flex-col gap-1.5">
                          {smartResults.entities.emails.length > 0 ? smartResults.entities.emails.map((e, i) => (
                             <span key={i} className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1 rounded-lg w-fit">{e}</span>
                          )) : <span className="text-xs text-slate-400 italic">None detected</span>}
                        </div>
                      </div>
                      <div id="contact-section" className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-[0.2em]">
                          <Phone size={12} /> Contact
                        </h4>
                        <div className="flex flex-col gap-1.5">
                          {smartResults.entities.phones.length > 0 ? smartResults.entities.phones.map((p, i) => (
                             <span key={i} className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1 rounded-lg w-fit">{p}</span>
                          )) : <span className="text-xs text-slate-400 italic">None detected</span>}
                        </div>
                      </div>
                      <div id="location-section" className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-[0.2em]">
                          <MapPin size={12} /> Locations
                        </h4>
                        <div className="flex flex-col gap-1.5">
                          {smartResults.entities.addresses.length > 0 ? smartResults.entities.addresses.map((a, i) => (
                             <span key={i} className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1 rounded-lg w-fit">{a}</span>
                          )) : <span className="text-xs text-slate-400 italic">None detected</span>}
                        </div>
                      </div>
                      <div id="links-section" className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-[0.2em]">
                          <Globe size={12} /> Links
                        </h4>
                        <div className="flex flex-col gap-1.5">
                          {smartResults.entities.links.length > 0 ? smartResults.entities.links.map((l, i) => (
                             <a key={i} href={l} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit truncate max-w-full hover:underline">{l}</a>
                          )) : <span className="text-xs text-slate-400 italic">None detected</span>}
                        </div>
                      </div>
                      <div id="dates-section" className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-[0.2em]">
                           <Database size={12} /> Dates
                        </h4>
                        <div className="flex flex-col gap-1.5">
                          {smartResults.entities.dates.length > 0 ? smartResults.entities.dates.map((d, i) => (
                             <span key={i} className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1 rounded-lg w-fit">{d}</span>
                          )) : <span className="text-xs text-slate-400 italic">None detected</span>}
                        </div>
                      </div>
                      <div id="names-section" className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-[0.2em]">
                           <Zap size={12} /> Key Names
                        </h4>
                        <div className="flex flex-col gap-1.5">
                          {smartResults.entities.names.length > 0 ? smartResults.entities.names.map((n, i) => (
                             <span key={i} className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1 rounded-lg w-fit">{n}</span>
                          )) : <span className="text-xs text-slate-400 italic">None detected</span>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white/50 border border-dashed border-slate-200 rounded-[2.5rem] p-24 text-center space-y-4"
                  >
                     <Loader2 className="w-12 h-12 text-indigo-300 animate-spin mx-auto" />
                     <p className="font-bold text-slate-400">Performing Deep Document Analysis...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </ResultLock>

            <div id="ai-tools-section" className="bg-slate-900 rounded-[2.5rem] p-8 space-y-6 shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-3 mb-2">
                 <Search className="text-indigo-400" />
                 <h3 className="text-xl font-black text-white">Semantic AI Search</h3>
              </div>
              <div className="relative">
                <input 
                  id="ai-search-input"
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ask a question about the document..."
                  className="w-full bg-white/10 border border-white/10 h-16 pl-6 pr-32 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching || !fullText}
                  className="absolute right-2 top-2 h-12 px-6 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:bg-slate-700 transition-all"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={18} />}
                  Search
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                 <AnimatePresence>
                   {searchResults.map((result, i) => (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.1 }}
                       className="p-4 bg-white/5 border border-white/5 rounded-xl text-indigo-100 text-sm leading-relaxed"
                     >
                       "{result}"
                     </motion.div>
                   ))}
                 </AnimatePresence>
                 {!isSearching && searchResults.length === 0 && searchQuery && (
                   <div className="text-center py-8 text-white/20 text-xs italic tracking-widest uppercase font-bold">No exact matches found</div>
                 )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                   <Zap size={18} className="text-yellow-500" /> AI Questions
                </h4>
                <div className="flex flex-col gap-2 mb-6">
                   {[
                     "Summarize the key findings",
                     "What is the total amount?",
                     "Extract all dates",
                     "Identify the signatory"
                   ].map((suggest) => (
                     <button 
                        key={suggest}
                        onClick={() => navigateToSection('ai-tools-section', suggest)}
                        className="text-left px-4 py-3 bg-slate-50 hover:bg-indigo-50 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                     >
                       {suggest}
                     </button>
                   ))}
                </div>

                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                   <Search size={18} className="text-indigo-500" /> Navigation
                </h4>
                <div className="flex flex-col gap-2">
                   {[
                     { label: "Summarizer", id: "summary-section" },
                     { label: "Extract Emails", id: "email-section" },
                     { label: "Extract Contacts", id: "contact-section" },
                     { label: "Locations/Addresses", id: "location-section" },
                   ].map((item) => (
                     <button 
                        key={item.id}
                        onClick={() => navigateToSection(item.id)}
                        className="text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
                     >
                       {item.label}
                     </button>
                   ))}
                </div>
             </div>

             <div className="bg-indigo-900 rounded-[2rem] p-6 text-white space-y-4">
                <Database size={32} className="text-indigo-400" />
                <h4 className="font-bold text-lg">AI Ready</h4>
                <p className="text-indigo-200 text-sm leading-relaxed">
                   The results gathered are available for structured export. Turn your searches into insights immediately.
                </p>
                <button 
                  onClick={handleExportInsights}
                  disabled={!smartResults}
                  className="w-full py-4 bg-white text-indigo-900 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={18} /> Export JSON Insight
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
