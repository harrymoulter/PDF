import React from 'react';
import { motion } from 'motion/react';
import { Upload, X, Zap, FileText, Download, Loader2 } from 'lucide-react';
import { FileUploader } from '../FileUploader';
import { QueueProcessor } from '../../lib/queueProcessor';
import { ProcessingState } from '../../types';
import { ResultLock } from '../ResultLock';
import { useAuth } from '../../contexts/AuthContext';
import { trackAction } from '../../lib/history';

export function OCRTool() {
  const { user } = useAuth();
  const [processingState, setProcessingState] = React.useState<ProcessingState | null>(null);
  const [result, setResult] = React.useState<string | null>(null);
  const [activeProcessor, setActiveProcessor] = React.useState<QueueProcessor | null>(null);

  // Track service selection
  React.useEffect(() => {
    trackAction(user?.id, 'ocr', 'service_init', 0, 'completed');
  }, []);

  const handleFileSelect = async (file: File) => {
    setResult(null);
    trackAction(user?.id, 'ocr', file.name, file.size, 'uploaded');
    const processor = new QueueProcessor(file.name, (state) => {
      setProcessingState(state);
      
      // Accumulate progressive results
      if (state.status === 'completed' || state.processedPages > 0) {
        const text = state.pages
          .filter(p => p.status === 'completed')
          .map(p => p.rawText)
          .join('\n\n---\n\n');
        setResult(text);
      }
    });
    
    setActiveProcessor(processor);
    trackAction(user?.id, 'ocr', file.name, file.size, 'processed');
    try {
      await processor.start(file);
      if (!user) {
        trackAction(undefined, 'ocr', file.name, file.size, 'locked');
      } else {
        trackAction(user.id, 'ocr', file.name, file.size, 'completed');
      }
    } catch (e) {
      trackAction(user?.id, 'ocr', file.name, file.size, 'failed');
    } finally {
      setActiveProcessor(null);
    }
  };

  const isProcessing = processingState?.status === 'analyzing' || processingState?.status === 'processing';
  const progress = processingState ? (processingState.processedPages / (processingState.totalPages || 1)) : 0;
  const fileName = processingState?.fileName || '';

  const downloadText = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.split('.')[0]}_ocr.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-4">OCR Tool</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Convert images and scanned PDFs into editable text documents. 
          Powered by high-performance browser-side OCR.
        </p>
      </div>

      {!result && !isProcessing ? (
        <FileUploader 
          onFileSelect={handleFileSelect} 
          isProcessing={isProcessing} 
        />
      ) : isProcessing ? (
        <div className="bg-white border border-slate-200 p-12 rounded-[2rem] text-center space-y-6">
           <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto" />
           <p className="text-xl font-bold text-slate-800">Processing Document...</p>
           <div className="max-w-xs mx-auto w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-yellow-500" 
                animate={{ width: `${progress * 100}%` }} 
              />
           </div>
           <p className="text-sm text-slate-400">
             {processingState?.currentAction || "Processing..."}
           </p>
        </div>
      ) : (
        <ResultLock isResultReady={!!result}>
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                      <Zap size={16} />
                   </div>
                   <span className="font-bold text-slate-900">{fileName}</span>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setResult(null)} className="px-4 py-2 text-sm text-slate-500 font-bold hover:text-slate-900 transition-colors">Reset</button>
                   <button onClick={downloadText} className="px-6 py-2 bg-yellow-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-yellow-500/20 hover:scale-105 transition-all flex items-center gap-2">
                      <Download size={16} /> Download .TXT
                   </button>
                </div>
             </div>
             <div className="bg-white border border-slate-200 rounded-[2rem] p-8 min-h-[400px] font-mono text-sm overflow-auto whitespace-pre-wrap text-slate-600 leading-relaxed max-h-[600px] shadow-sm">
                {result}
             </div>
          </div>
        </ResultLock>
      )}
    </div>
  );
}
