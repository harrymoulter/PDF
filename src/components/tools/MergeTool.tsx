import React from 'react';
import { motion, Reorder } from 'motion/react';
import { Upload, X, FileText, Plus, ArrowRight } from 'lucide-react';
import { mergePdfs, downloadBlob } from '../../lib/pdfManipulation';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { ResultLock } from '../ResultLock';
import { trackAction } from '../../lib/history';
import { Check, Download } from 'lucide-react';

export function MergeTool() {
  const { user } = useAuth();
  const [files, setFiles] = React.useState<File[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [result, setResult] = React.useState<{ blob: Uint8Array; name: string } | null>(null);

  // Track service selection
  React.useEffect(() => {
    trackAction(user?.id, 'merge', 'service_init', 0, 'completed');
  }, []);

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
      setResult(null);
      newFiles.forEach((f: File) => trackAction(user?.id, 'merge', f.name, f.size, 'uploaded'));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setResult(null);
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    trackAction(user?.id, 'merge', `${files.length} files`, totalSize, 'processed');

    try {
      const mergedPdf = await mergePdfs(files);
      const res = { blob: mergedPdf, name: 'merged.pdf' };
      setResult(res);
      
      if (!user) {
        trackAction(undefined, 'merge', `${files.length} files`, totalSize, 'locked');
      } else {
        trackAction(user.id, 'merge', `${files.length} files`, totalSize, 'completed');
        downloadBlob(mergedPdf, res.name, 'application/pdf');
      }
    } catch (error) {
      console.error(error);
      trackAction(user?.id, 'merge', `${files.length} files`, totalSize, 'failed');
      alert('Failed to merge PDFs');
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
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-4">Merge PDF files</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Combine multiple PDFs into one document in seconds. 
          Drag and drop to change the order of your files.
        </p>
      </div>

      {files.length === 0 ? (
        <label 
          className={cn(
            "relative group flex flex-col items-center justify-center w-full h-[400px] border-3 border-dashed rounded-3xl transition-all cursor-pointer",
            dragActive ? "border-red-500 bg-red-50" : "border-slate-200 hover:border-red-500 hover:bg-slate-50"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files) setFiles(Array.from(e.dataTransfer.files)); }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <p className="text-2xl font-bold text-slate-800">Select PDF files</p>
          <p className="text-slate-500 mt-2">or drop PDFs here</p>
          <input type="file" multiple accept=".pdf" className="hidden" onChange={onFileUpload} />
        </label>
      ) : (
        <div className="flex flex-col gap-8">
          <Reorder.Group axis="y" values={files} onReorder={setFiles} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file, idx) => (
              <Reorder.Item key={file.name + idx} value={file}>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 cursor-grab active:cursor-grabbing">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    onClick={() => removeFile(idx)}
                    className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>
              </Reorder.Item>
            ))}
            <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center text-slate-400 hover:border-red-500 hover:text-red-500 cursor-pointer transition-all">
              <Plus size={20} />
              <input type="file" multiple accept=".pdf" className="hidden" onChange={onFileUpload} />
            </label>
          </Reorder.Group>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleMerge}
              disabled={isProcessing || files.length < 2}
              className={cn(
                "h-16 px-12 rounded-2xl text-white font-black text-xl shadow-xl shadow-red-500/30 transition-all flex items-center gap-3",
                isProcessing || files.length < 2 ? "bg-slate-300 shadow-none cursor-not-allowed" : "bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95"
              )}
            >
              {isProcessing ? 'Merging...' : (result ? 'Merge Again' : 'Merge PDF')}
              <ArrowRight size={24} />
            </button>
          </div>

          {result && (
             <ResultLock isResultReady={!!result}>
                <div className="mt-8 p-8 bg-red-50 rounded-[2rem] border-2 border-red-100 flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm border-4 border-red-100">
                     <Check size={40} strokeWidth={3} />
                   </div>
                   <div className="text-center">
                     <h3 className="text-2xl font-black text-slate-900">Merge Complete!</h3>
                     <p className="text-slate-500 font-medium">All your PDF files have been combined into one.</p>
                   </div>
                   <button 
                      onClick={handleDownload}
                      className="w-full max-w-sm h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98]"
                   >
                      <Download size={24} />
                      DOWNLOAD MERGED PDF
                   </button>
                </div>
             </ResultLock>
           )}
        </div>
      )}
    </div>
  );
}
