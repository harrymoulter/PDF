import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  FileText, 
  History, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  Database,
  Search,
  Sparkles
} from 'lucide-react';
import { ToolId } from '../types';
import { PDF_TOOLS } from '../constants';
import { cn } from '../lib/utils';
import { AdDisplay } from './AdDisplay';

interface DashboardProps {
  onSelectTool: (id: ToolId) => void;
}

export function Dashboard({ onSelectTool }: DashboardProps) {
  const stats = [
    { label: 'Files Processed', value: '1,284', icon: FileText, color: 'text-blue-500' },
    { label: 'AI Extractions', value: '452', icon: Database, color: 'text-purple-500' },
    { label: 'Time Saved', value: '12h', icon: Zap, color: 'text-yellow-500' },
    { label: 'Accuracy', value: '99.8%', icon: TrendingUp, color: 'text-green-500' },
  ];

  const recentFiles = [
    { name: 'invoice_2024_03.pdf', type: 'Invoice', date: '2 hours ago', status: 'Extracted' },
    { name: 'contract_draft_final.pdf', type: 'Contract', date: '5 hours ago', status: 'Summarized' },
    { name: 'resume_technical_lead.pdf', type: 'CV/Resume', date: 'Yesterday', status: 'Analyzed' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 md:space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Free AI PDF Tools & OCR.</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Extract data, summarize documents, and manage your PDF files 100% free and locally.</p>
        </div>
        <button 
          onClick={() => onSelectTool('smart')}
          className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} /> Start Free AI Parsing
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 p-4 md:p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-3 md:mb-4", stat.color)}>
              <stat.icon size={18} className="md:w-5 md:h-5" />
            </div>
            <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl md:text-3xl font-black text-slate-900 mt-0.5 md:mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <AdDisplay position="Inside Content" className="my-8" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
              <History className="text-red-500" size={20} /> Recent Activity
            </h3>
            <button className="text-sm font-bold text-red-500 hover:underline">View All</button>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-widest">Document</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-widest">Type</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentFiles.map((file, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <FileText className="text-slate-400 group-hover:text-red-500" size={18} />
                           <span className="font-bold text-slate-900 truncate max-w-[150px] md:max-w-none">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{file.type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 italic">{file.status}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">{file.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={20} /> Quick AI
            </h3>
            <div className="grid grid-cols-1 gap-4">
               {PDF_TOOLS.filter(t => t.category === 'ai').slice(0, 3).map((tool) => (
                 <button 
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
                 >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform", tool.color)}>
                       <Sparkles size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{tool.name}</p>
                      <p className="text-xs text-slate-400 truncate w-40">{tool.description}</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                 </button>
               ))}
            </div>

            <div className="bg-indigo-900 rounded-3xl p-6 text-white relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
               <Sparkles className="text-indigo-400 mb-4" size={32} />
               <h4 className="text-lg font-black mb-2">Power Search</h4>
               <p className="text-indigo-200 text-sm leading-relaxed mb-4">
                  Find any information inside your document library using natural language processing.
               </p>
               <div className="relative">
                 <input 
                  type="text" 
                  placeholder="Ask anything..."
                  className="w-full bg-white/10 border border-white/20 h-10 px-4 rounded-xl text-sm text-white placeholder:text-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                 />
                 <Search className="absolute right-3 top-2.5 text-indigo-400" size={14} />
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
