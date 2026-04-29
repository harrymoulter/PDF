import React from 'react';
import { motion } from 'motion/react';
import { Upload, X, Scissors, ArrowRight, Download, FileText } from 'lucide-react';
import { splitPdf, downloadBlob } from '../../lib/pdfManipulation';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { ResultLock } from '../ResultLock';
import { trackAction } from '../../lib/history';
import { Check } from 'lucide-react';

export function SplitTool() {
  const { user } = useAuth();
  const [file, setFile] = React.useState<File | null>(null);
  const [range, setRange] = React.useState('1');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [results, setResults] = React.useState<{ blob: Uint8Array; name: string }[] | null>(null);

  // Track service selection
  React.useEffect(() => {
    trackAction(user?.id, 'split', 'service_init', 0, 'completed');
  }, []);

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      setResults(null);
      trackAction(user?.id, 'split', uploadedFile.name, uploadedFile.size, 'uploaded');
    }
  };

  const handleSplit = async () => {
    if (!file || !range) return;
    setIsProcessing(true);
    setResults(null);
    trackAction(user?.id, 'split', file.name, file.size, 'processed');

    try {
      const dataResults = await splitPdf(file, range);
      const formattedResults = dataResults.map((data, idx) => ({
        blob: data,
        name: `split_${idx + 1}_${file.name}`
      }));
      
      setResults(formattedResults);
      
      if (!user) {
        trackAction(undefined, 'split', file.name, file.size, 'locked');
      } else {
        trackAction(user.id, 'split', file.name, file.size, 'completed');
        formattedResults.forEach(res => {
          downloadBlob(res.blob, res.name, 'application/pdf');
        });
      }
    } catch (error) {
      console.error(error);
      trackAction(user?.id, 'split', file.name, file.size, 'failed');
      alert('Failed to split PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = () => {
    if (results) {
      results.forEach(res => {
        downloadBlob(res.blob, res.name, 'application/pdf');
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-4">Split PDF</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Extract specific pages or ranges from your PDF. 
          Example: "1, 2-4, 7"
        </p>
      </div>

      {!file ? (
        <label className="group flex flex-col items-center justify-center w-full h-[300px] border-3 border-dashed border-slate-200 rounded-3xl hover:border-blue-500 hover:bg-slate-50 transition-all cursor-pointer">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
            <Scissors size={32} />
          </div>
          <p className="text-2xl font-bold text-slate-800">Select PDF file</p>
          <input type="file" accept=".pdf" className="hidden" onChange={onFileUpload} />
        </label>
      ) : (
        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm space-y-8 animate-in fade-in zoom-in-95 duration-300">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => setFile(null)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg">
                <X size={20} />
              </button>
           </div>

           <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Pages to extract</label>
              <input 
                type="text" 
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder='e.g. 1-3, 5, 10'
                className="w-full bg-slate-50 border border-slate-200 h-14 px-6 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all"
              />
              <p className="text-xs text-slate-400">Use commas for separate pages and dashes for ranges. Every range results in a separate file.</p>
           </div>

           <div className="pt-4">
             <button
                onClick={handleSplit}
                disabled={isProcessing || !range}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-black text-xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-slate-300"
              >
                {isProcessing ? 'Splitting...' : (results ? 'Re-split' : 'Split and Download')}
                <ArrowRight size={24} />
              </button>
           </div>

           {results && (
             <ResultLock isResultReady={!!results}>
                <div className="mt-8 p-8 bg-blue-50 rounded-[2rem] border-2 border-blue-100 flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border-4 border-blue-100">
                     <Check size={40} strokeWidth={3} />
                   </div>
                   <div className="text-center">
                     <h3 className="text-2xl font-black text-slate-900">Split Complete!</h3>
                     <p className="text-slate-500 font-medium">Your PDF has been split into {results.length} files.</p>
                   </div>
                   <button 
                      onClick={handleDownloadAll}
                      className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98]"
                   >
                      <Download size={24} />
                      DOWNLOAD ALL ({results.length} FILES)
                   </button>
                </div>
             </ResultLock>
           )}
        </div>
      )}
    </div>
  );
}
