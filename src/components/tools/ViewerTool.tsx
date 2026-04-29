import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  X, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize,
  Download,
  FileText,
  Loader2
} from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { trackAction } from '../../lib/history';
import { ResultLock } from '../ResultLock';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
}

export function ViewerTool() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Track service selection
  useEffect(() => {
    trackAction(user?.id, 'viewer', 'service_init', 0, 'completed');
  }, []);

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setIsLoading(true);
      setFile(uploadedFile);
      trackAction(user?.id, 'viewer', uploadedFile.name, uploadedFile.size, 'uploaded');
      try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        trackAction(user?.id, 'viewer', uploadedFile.name, uploadedFile.size, 'processed');
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setPageNumber(1);
        if (!user) {
          trackAction(undefined, 'viewer', uploadedFile.name, uploadedFile.size, 'locked');
        } else {
          trackAction(user.id, 'viewer', uploadedFile.name, uploadedFile.size, 'completed');
        }
      } catch (err) {
        console.error(err);
        trackAction(user?.id, 'viewer', uploadedFile.name, uploadedFile.size, 'failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderPage = async (num: number, currentScale: number) => {
    if (!pdfDoc || !canvasRef.current) return;
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: currentScale });
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')!;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
  };

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNumber, scale);
    }
  }, [pdfDoc, pageNumber, scale]);

  const handleDownload = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 min-h-[calc(100vh-200px)] flex flex-col">
      {!file ? (
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-slate-900 mb-4">PDF Viewer</h2>
                <p className="text-slate-500 max-w-lg mx-auto">
                    A clean and simple way to read, navigate and zoom into your PDF documents.
                </p>
            </div>
            <label className="group flex flex-col items-center justify-center w-full max-w-2xl h-[300px] border-3 border-dashed border-slate-200 rounded-[2.5rem] hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-6 group-hover:scale-110 transition-transform">
                    <Eye size={32} />
                </div>
                <p className="text-2xl font-bold text-slate-800">Choose PDF to View</p>
                <input type="file" accept=".pdf" className="hidden" onChange={onFileUpload} />
            </label>
        </div>
      ) : (
        <div className="flex flex-col gap-6 h-full">
           <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm sticky top-0 z-10 backdrop-blur-md bg-white/90">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <FileText size={20} />
                 </div>
                 <div className="hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Page {pageNumber} of {numPages}</p>
                 </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                 <button 
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                  className="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
                 >
                    <ChevronLeft size={18} />
                 </button>
                 <span className="px-4 text-sm font-black text-slate-700">{pageNumber}</span>
                 <button 
                  onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                  disabled={pageNumber >= numPages}
                  className="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
                 >
                    <ChevronRight size={18} />
                 </button>
              </div>

              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-2">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ZoomOut size={18} /></button>
                    <span className="text-xs font-bold text-slate-400 w-12 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ZoomIn size={18} /></button>
                 </div>
                 {user && (
                   <button onClick={handleDownload} className="p-2.5 bg-slate-900 text-white rounded-xl hover:scale-105 transition-all">
                      <Download size={18} />
                   </button>
                 )}
                 <button onClick={() => setFile(null)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500">
                    <X size={18} />
                 </button>
              </div>
           </div>

           <div className="flex-1 bg-slate-100 rounded-3xl p-8 overflow-auto border border-slate-200 shadow-inner flex justify-center min-h-[600px] relative">
              <ResultLock isResultReady={!!pdfDoc}>
                 <div className="relative">
                    {isLoading && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                         <Loader2 size={40} className="animate-spin text-slate-900" />
                      </div>
                    )}
                    <canvas 
                      ref={canvasRef} 
                      className="shadow-2xl rounded-sm border border-slate-200 bg-white"
                    />
                 </div>
              </ResultLock>
           </div>
        </div>
      )}
    </div>
  );
}
