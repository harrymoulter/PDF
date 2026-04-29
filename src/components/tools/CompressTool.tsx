import React from 'react';
import { motion } from 'motion/react';
import { Upload, X, Minimize2, ArrowRight, Download, FileText, Check } from 'lucide-react';
import { downloadBlob } from '../../lib/pdfManipulation';
import { cn } from '../../lib/utils';
import { PDFDocument } from 'pdf-lib';

import { useAuth } from '../../contexts/AuthContext';
import { ResultLock } from '../ResultLock';
import { trackAction } from '../../lib/history';

export function CompressTool() {
  const { user } = useAuth();
  const [file, setFile] = React.useState<File | null>(null);
  const [level, setLevel] = React.useState<'low' | 'medium' | 'high'>('medium');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [result, setResult] = React.useState<{ blob: Uint8Array; name: string } | null>(null);

  // Track service selection
  React.useEffect(() => {
    trackAction(user?.id, 'compress', 'service_init', 0, 'completed');
  }, []);

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      setResult(null);
      trackAction(user?.id, 'compress', uploadedFile.name, uploadedFile.size, 'uploaded');
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);
    trackAction(user?.id, 'compress', file.name, file.size, 'processed');

    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
      
      const res = { blob: compressedBytes, name: `compressed_${file.name}` };
      setResult(res);
      
      if (!user) {
        trackAction(undefined, 'compress', file.name, file.size, 'locked');
      } else {
        trackAction(user.id, 'compress', file.name, file.size, 'completed');
        // Auto-download for logged in users
        downloadBlob(compressedBytes, res.name, 'application/pdf');
      }
    } catch (error) {
      console.error(error);
      trackAction(user?.id, 'compress', file.name, file.size, 'failed');
      alert('Failed to compress PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      trackAction(user?.id, 'compress', result.name, result.blob.length, 'completed');
      downloadBlob(result.blob, result.name, 'application/pdf');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-4">Compress PDF</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Reduce the file size of your PDF while keeping the best possible quality.
        </p>
      </div>

      {!file ? (
        <label className="group flex flex-col items-center justify-center w-full h-[300px] border-3 border-dashed border-slate-200 rounded-3xl hover:border-orange-500 hover:bg-slate-50 transition-all cursor-pointer">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
            <Minimize2 size={32} />
          </div>
          <p className="text-2xl font-bold text-slate-800">Select PDF file</p>
          <input type="file" accept=".pdf" className="hidden" onChange={onFileUpload} />
        </label>
      ) : (
        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm space-y-8 animate-in fade-in zoom-in-95 duration-300">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-400">Current: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => setFile(null)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg">
                <X size={20} />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'low', label: 'Less Compression', sub: 'High Quality', desc: 'Slightly smaller file size' },
                { id: 'medium', label: 'Recommended', sub: 'Good Quality', desc: 'Best balance of size and quality' },
                { id: 'high', label: 'Extreme', sub: 'Lower Quality', desc: 'Maximum file size reduction' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLevel(item.id as any)}
                  className={cn(
                    "flex flex-col items-start p-6 rounded-2xl border-2 transition-all text-left relative",
                    level === item.id ? "border-orange-500 bg-orange-50/50" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  {level === item.id && (
                    <div className="absolute top-4 right-4 text-orange-600">
                      <Check size={20} />
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.sub}</span>
                  <p className="font-bold text-slate-900 mt-1">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-2">{item.desc}</p>
                </button>
              ))}
           </div>

           <div className="pt-4">
             <button
                onClick={handleCompress}
                disabled={isProcessing}
                className="w-full h-16 bg-orange-600 hover:bg-orange-700 rounded-2xl text-white font-black text-xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isProcessing ? 'Compressing...' : (result ? 'Re-compress' : 'Compress and Download')}
                <ArrowRight size={24} />
              </button>
           </div>

           {result && (
             <ResultLock isResultReady={!!result}>
                <div className="mt-8 p-8 bg-green-50 rounded-[2rem] border-2 border-green-100 flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm border-4 border-green-100">
                     <Check size={40} strokeWidth={3} />
                   </div>
                   <div className="text-center">
                     <h3 className="text-2xl font-black text-slate-900">Compression Complete!</h3>
                     <p className="text-slate-500 font-medium">Your file has been optimized and is ready.</p>
                   </div>
                   <button 
                      onClick={handleDownload}
                      className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98]"
                   >
                      <Download size={24} />
                      DOWNLOAD COMPRESSED PDF
                   </button>
                </div>
             </ResultLock>
           )}
        </div>
      )}
    </div>
  );
}
