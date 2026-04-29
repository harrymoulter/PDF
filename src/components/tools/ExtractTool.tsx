import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  AlertCircle, 
  FileText, 
  LayoutGrid, 
  Zap, 
  Database,
  Loader2,
  Trash2,
  Download,
  FileDown
} from 'lucide-react';
import { FileUploader } from '../FileUploader';
import { DataTable } from '../DataTable';
import { ResultLock } from '../ResultLock';
import { QueueProcessor } from '../../lib/queueProcessor';
import { ProcessingState } from '../../types';
import { ExtractedTable } from '../../lib/smartProcessor';
import { cn } from '../../lib/utils';
import { exportToExcel, exportToCSV } from '../../lib/exportUtils';
import { trackAction } from '../../lib/history';

import { useAuth } from '../../contexts/AuthContext';

export function ExtractTool() {
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [extractedTables, setExtractedTables] = useState<ExtractedTable[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeProcessor, setActiveProcessor] = useState<QueueProcessor | null>(null);

  const handleExportExcel = () => {
    if (extractedTables.length === 0) return;
    exportToExcel(extractedTables, `${processingState?.fileName || 'extract'}_data.xlsx`);
  };

  const handleExportCSV = () => {
    if (extractedTables.length === 0) return;
    // Export first table or flattened list for CSV
    exportToCSV(extractedTables[0].rows, extractedTables[0].headers, `${processingState?.fileName || 'extract'}.csv`);
  };

  const handleProgress = useCallback((state: ProcessingState) => {
    setProcessingState(state);
    const tables = state.pages
      .filter(p => p.status === 'completed')
      .flatMap(p => p.tables);
    
    const aggregated: ExtractedTable[] = [];
    tables.forEach(newTable => {
      const existing = aggregated.find(t => 
        t.headers.length === newTable.headers.length && 
        t.headers.every((h, i) => h === newTable.headers[i])
      );
      if (existing) {
        existing.rows = [...existing.rows, ...newTable.rows];
      } else {
        aggregated.push({ ...newTable });
      }
    });
    setExtractedTables(aggregated);
  }, []);

  const { user, openLogin } = useAuth();

  // Track service selection
  React.useEffect(() => {
    trackAction(user?.id, 'extract', 'service_init', 0, 'completed');
  }, []);

  const handleFileSelect = async (file: File) => {
    setError(null);
    trackAction(user?.id, 'extract', file.name, file.size, 'uploaded');
    const processor = new QueueProcessor(file.name, handleProgress);
    setActiveProcessor(processor);
    trackAction(user?.id, 'extract', file.name, file.size, 'processed');

    try {
      await processor.start(file);
      if (!user) {
        trackAction(undefined, 'extract', file.name, file.size, 'locked');
      } else {
        trackAction(user.id, 'extract', file.name, file.size, 'completed');
      }
    } catch (e) {
      trackAction(user?.id, 'extract', file.name, file.size, 'failed');
    } finally {
      setActiveProcessor(null);
    }
  };

  const handleCancel = () => {
    if (activeProcessor) {
      activeProcessor.stop();
      setActiveProcessor(null);
    }
  };

  const isIdle = !processingState;
  const isProcessing = processingState?.status === 'analyzing' || processingState?.status === 'processing';
  const total = processingState?.totalPages || 0;
  const current = processingState?.processedPages || 0;
  const rawProgress = total > 0 ? (current / total) * 100 : 0;
  const safeProgress = Math.min(100, Math.max(0, isNaN(rawProgress) ? 0 : rawProgress));

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">AI Data Extraction</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Turn complex PDFs into structured data. Extract tables, keys, and values 
          with high-precision AI models.
        </p>
      </div>

      {isIdle ? (
        <div className="space-y-16">
          <FileUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "OCR Powered", desc: "Extract values even from scanned blurry images or photos." },
              { icon: Database, title: "Structured Output", desc: "Get clean JSON, CSV or Excel ready table structures." },
              { icon: FileSpreadsheet, title: "Batch Logic", desc: "Processes page-by-page to handle massive 500MB documents." }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <item.icon size={20} />
                </div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
           <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 truncate max-w-xs">{processingState.fileName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                      isProcessing ? "bg-blue-100 text-blue-600 animate-pulse" : "bg-green-100 text-green-600"
                    )}>
                      {isProcessing ? (processingState.currentAction || 'Processing') : 'Completed'}
                    </span>
                    <span className="text-xs text-slate-400">Page {current} of {total}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!isProcessing && extractedTables.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleExportExcel}
                      className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-emerald-100 transition-all"
                    >
                      <FileDown size={14} /> Excel Export
                    </button>
                    <button 
                      onClick={handleExportCSV}
                      className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-100 transition-all border border-slate-100"
                    >
                      <Download size={14} /> CSV
                    </button>
                  </div>
                )}
                {isProcessing ? (
                  <button onClick={handleCancel} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-all">
                    Cancel
                  </button>
                ) : (
                  <button onClick={() => setProcessingState(null)} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm">
                    New Extraction
                  </button>
                )}
              </div>
           </div>

           {isProcessing && (
             <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2">
                {processingState.pages.map((p) => (
                  <div 
                    key={p.id}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      p.status === 'completed' ? "bg-green-500" :
                      p.status === 'processing' ? "bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(147,51,234,0.3)]" :
                      p.status === 'error' ? "bg-red-500" : "bg-slate-100"
                    )}
                  />
                ))}
             </div>
           )}

           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <ResultLock isResultReady={!isProcessing && extractedTables.length > 0}>
               <DataTable 
                  tables={extractedTables}
                  onUpdateTable={(i, t) => {
                    const next = [...extractedTables];
                    next[i] = t;
                    setExtractedTables(next);
                  }}
                  onRemoveTable={(i) => setExtractedTables(extractedTables.filter((_, idx) => idx !== i))}
                />
             </ResultLock>
           </div>
        </div>
      )}
    </div>
  );
}
