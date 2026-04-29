import React from 'react';
import { motion, Reorder } from 'motion/react';
import { Upload, X, Image as ImageIcon, Plus, ArrowRight, Download } from 'lucide-react';
import { imagesToPdf, downloadBlob } from '../../lib/pdfManipulation';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { ResultLock } from '../ResultLock';
import { trackAction } from '../../lib/history';
import { Check } from 'lucide-react';

export function ImageToPdfTool() {
  const { user } = useAuth();
  const [files, setFiles] = React.useState<File[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [result, setResult] = React.useState<{ blob: Uint8Array; name: string } | null>(null);

  // Track service selection
  React.useEffect(() => {
    trackAction(user?.id, 'image-to-pdf', 'service_init', 0, 'completed');
  }, []);

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
      setResult(null);
      newFiles.forEach((f: File) => trackAction(user?.id, 'image-to-pdf', f.name, f.size, 'uploaded'));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setResult(null);
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    trackAction(user?.id, 'image-to-pdf', `${files.length} images`, totalSize, 'processed');

    try {
      const pdf = await imagesToPdf(files);
      const res = { blob: pdf, name: 'converted.pdf' };
      setResult(res);
      
      if (!user) {
        trackAction(undefined, 'image-to-pdf', `${files.length} images`, totalSize, 'locked');
      } else {
        trackAction(user.id, 'image-to-pdf', `${files.length} images`, totalSize, 'completed');
        downloadBlob(pdf, res.name, 'application/pdf');
      }
    } catch (error) {
      console.error(error);
      trackAction(user?.id, 'image-to-pdf', `${files.length} images`, totalSize, 'failed');
      alert('Failed to convert images');
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
        <h2 className="text-4xl font-black text-slate-900 mb-4">Image to PDF</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Convert JPG, PNG, and other images to PDF in seconds. 
          Combine all your images into a single sorted document.
        </p>
      </div>

      {files.length === 0 ? (
        <label className="group flex flex-col items-center justify-center w-full h-[400px] border-3 border-dashed border-slate-200 rounded-3xl hover:border-emerald-500 hover:bg-slate-50 transition-all cursor-pointer">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
            <ImageIcon size={32} />
          </div>
          <p className="text-2xl font-bold text-slate-800">Select Images</p>
          <input type="file" multiple accept="image/*" className="hidden" onChange={onFileUpload} />
        </label>
      ) : (
        <div className="space-y-8">
           <Reorder.Group axis="y" values={files} onReorder={setFiles} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file, idx) => (
                <Reorder.Item key={file.name + idx} value={file}>
                  <div className="relative group bg-white border border-slate-200 p-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                    <button 
                      onClick={() => removeFile(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm z-10"
                    >
                      <X size={14} />
                    </button>
                    <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                    <p className="mt-2 text-[10px] font-bold text-slate-400 truncate px-1">{file.name}</p>
                  </div>
                </Reorder.Item>
              ))}
              <label className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-500 cursor-pointer">
                <Plus size={24} />
                <input type="file" multiple accept="image/*" className="hidden" onChange={onFileUpload} />
              </label>
           </Reorder.Group>

           <div className="flex justify-center mt-8">
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-white font-black text-xl shadow-xl shadow-emerald-500/30 transition-all flex items-center gap-3 active:scale-95 disabled:bg-slate-300"
            >
              {isProcessing ? 'Converting...' : (result ? 'Convert Again' : 'Convert to PDF')}
              <Download size={24} />
            </button>
          </div>

          {result && (
             <ResultLock isResultReady={!!result}>
                <div className="mt-8 p-8 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm border-4 border-emerald-100">
                     <Check size={40} strokeWidth={3} />
                   </div>
                   <div className="text-center">
                     <h3 className="text-2xl font-black text-slate-900">Conversion Complete!</h3>
                     <p className="text-slate-500 font-medium">All your images have been combined into a high-quality PDF.</p>
                   </div>
                   <button 
                      onClick={handleDownload}
                      className="w-full max-w-sm h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98]"
                   >
                      <Download size={24} />
                      DOWNLOAD PDF DOCUMENT
                   </button>
                </div>
             </ResultLock>
           )}
        </div>
      )}
    </div>
  );
}
