import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, RotateCw, Trash2, Download, FileText } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { organizePdf, cleanPdf, downloadBlob } from '../../lib/pdfManipulation';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { trackAction } from '../../lib/history';
import { ResultLock } from '../ResultLock';
import { Check, Sparkles, Eraser } from 'lucide-react';
import { ToolId } from '../../types';

// pdf-js worker setup
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
}

interface PageItem {
  id: string;
  index: number;
  thumbnail: string;
  rotation: number;
  deleted: boolean;
}

interface OrganizeToolProps {
  toolId?: ToolId;
}

export function OrganizeTool({ toolId }: OrganizeToolProps) {
  const { user } = useAuth();
  const [file, setFile] = React.useState<File | null>(null);
  const [pages, setPages] = React.useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [loadingPages, setLoadingPages] = React.useState(false);
  const [result, setResult] = React.useState<{ blob: Uint8Array; name: string } | null>(null);

  const isCleaner = toolId === 'cleaner';

  const currentTool = isCleaner ? 'cleaner' : 'organize';

  // Track service selection
  React.useEffect(() => {
    trackAction(user?.id, currentTool, 'service_init', 0, 'completed');
  }, [currentTool]);

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setResult(null);
      setLoadingPages(true);
      trackAction(user?.id, currentTool, uploadedFile.name, uploadedFile.size, 'uploaded');
      try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const pageItems: PageItem[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
          pageItems.push({
            id: Math.random().toString(36).substr(2, 9),
            index: i - 1,
            thumbnail: canvas.toDataURL(),
            rotation: 0,
            deleted: false
          });
        }
        setPages(pageItems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPages(false);
      }
    }
  };

  const rotatePage = (id: string) => {
    setPages(pages.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
    setResult(null);
  };

  const deletePage = (id: string) => {
    setPages(pages.map(p => p.id === id ? { ...p, deleted: !p.deleted } : p));
    setResult(null);
  };

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);
    trackAction(user?.id, currentTool, file.name, file.size, 'processed');

    try {
      let resBlob: Uint8Array;
      let resName: string;

      if (isCleaner) {
        resBlob = await cleanPdf(file);
        resName = `cleaned_${file.name}`;
      } else {
        const operations = pages.map(p => ({
          pageIndex: p.index,
          action: p.deleted ? 'delete' as const : 'rotate' as const,
          rotation: p.rotation
        }));
        resBlob = await organizePdf(file, operations);
        resName = `organized_${file.name}`;
      }

      const res = { blob: resBlob, name: resName };
      setResult(res);
      
      if (!user) {
        trackAction(undefined, currentTool, file.name, file.size, 'locked');
      } else {
        trackAction(user.id, currentTool, file.name, file.size, 'completed');
        downloadBlob(resBlob, res.name, 'application/pdf');
      }
    } catch (error) {
      console.error(error);
      trackAction(user?.id, currentTool, file.name, file.size, 'failed');
      alert('Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadBlob(result.blob, result.name, 'application/pdf');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
       <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-4">{isCleaner ? 'PDF Cleaner' : 'Organize PDF'}</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          {isCleaner 
            ? 'Automatically remove empty pages and optimize your PDF file structure locally.' 
            : 'Sort, rotate or delete pages from your PDF. Everything stays private in your browser.'}
        </p>
      </div>

      {!file ? (
        <label className={cn(
          "flex flex-col items-center justify-center w-full h-[400px] border-3 border-dashed rounded-3xl transition-all cursor-pointer group",
          isCleaner ? "border-slate-200 hover:border-emerald-500 hover:bg-slate-50" : "border-slate-200 hover:border-pink-500 hover:bg-slate-50"
        )}>
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
            isCleaner ? "bg-emerald-100 text-emerald-600" : "bg-pink-100 text-pink-600"
          )}>
            {isCleaner ? <Eraser size={32} /> : <RotateCw size={32} />}
          </div>
          <p className="text-2xl font-bold text-slate-800">Select PDF to {isCleaner ? 'Clean' : 'Organize'}</p>
          <input type="file" accept=".pdf" className="hidden" onChange={onFileUpload} />
        </label>
      ) : (
        <div className="space-y-8">
           {loadingPages ? (
             <div className="text-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="font-bold text-slate-700">Loading pages...</p>
             </div>
           ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {pages.map((page, idx) => (
                <div 
                  key={page.id}
                  className={cn(
                    "relative group bg-white p-2 rounded-xl border-2 transition-all",
                    page.deleted ? "opacity-40 grayscale border-red-200" : "hover:border-pink-500 border-slate-100 shadow-sm"
                  )}
                >
                  <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => rotatePage(page.id)}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:text-pink-500 transition-colors"
                    >
                      <RotateCw size={14} />
                    </button>
                    <button 
                      onClick={() => deletePage(page.id)}
                      className={cn(
                        "p-1.5 bg-white border shadow-sm rounded-lg transition-colors",
                        page.deleted ? "text-red-500 border-red-500" : "border-slate-200 hover:text-red-500"
                      )}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div 
                    className="aspect-[1/1.4] bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center transition-transform"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  >
                    <img src={page.thumbnail} className="max-w-full max-h-full object-contain" alt={`Page ${idx + 1}`} />
                  </div>
                  
                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
           )}

            <div className="sticky bottom-8 flex justify-center flex-col items-center gap-8">
             <button
                onClick={handleApply}
                disabled={isProcessing || loadingPages}
                className={cn(
                  "h-16 px-12 rounded-2xl text-white font-black text-xl shadow-xl transition-all flex items-center gap-3 active:scale-95",
                  isCleaner ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30" : "bg-pink-600 hover:bg-pink-700 shadow-pink-500/30"
                )}
              >
                {isProcessing ? 'Processing...' : (result ? (isCleaner ? 'Clean Again' : 'Apply Again') : (isCleaner ? 'Clean & Download' : 'Download Organized PDF'))}
                {isCleaner ? <Sparkles size={24} /> : <Download size={24} />}
              </button>

              {result && (
                <div className={cn(
                  "w-full max-w-2xl bg-white/80 backdrop-blur-xl p-2 rounded-[2.5rem] shadow-2xl border animate-in fade-in slide-in-from-bottom-8 duration-700",
                  isCleaner ? "border-emerald-100" : "border-pink-100"
                )}>
                  <ResultLock isResultReady={!!result}>
                      <div className="p-8 flex flex-col items-center gap-6">
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center shadow-sm border-4 border-white",
                          isCleaner ? "bg-emerald-50 text-emerald-600" : "bg-pink-50 text-pink-600"
                        )}>
                          <Check size={40} strokeWidth={3} />
                        </div>
                        <div className="text-center">
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            {isCleaner ? 'Cleaning Complete!' : 'Organization Complete!'}
                          </h3>
                          <p className="text-slate-500 font-medium mt-1">
                            {isCleaner ? 'Empty pages removed and file optimized.' : 'Your document is now perfectly organized.'}
                          </p>
                        </div>
                        <button 
                            onClick={handleDownload}
                            className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98]"
                        >
                            <Download size={24} />
                            DOWNLOAD {isCleaner ? 'CLEANED' : 'ORGANIZED'} PDF
                        </button>
                      </div>
                  </ResultLock>
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
}
