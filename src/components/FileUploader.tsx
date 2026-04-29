import React, { useRef, useState } from 'react';
import { Upload, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function FileUploader({ onFileSelect, isProcessing }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300",
          "flex flex-col items-center justify-center p-12 text-center",
          isDragging 
            ? "border-blue-500 bg-blue-500/5" 
            : "border-white/10 hover:border-white/20 hover:bg-white/5",
          isProcessing && "pointer-events-none opacity-60"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/2 to-purple-500/10 transition-opacity" />
        
        <div className="relative space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-900">
              {isProcessing ? "Processing Document..." : "Drop your document here"}
            </h3>
            <p className="text-sm text-slate-500">
              PDF, Word, Images, or Text files
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-slate-400">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <FileText className="w-3.5 h-3.5" />
              PDF / .DOCX
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <ImageIcon className="w-3.5 h-3.5" />
              IMG / SCAN
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.jpg,.jpeg,.png,.bmp,.webp,.txt"
          onChange={handleChange}
        />
      </div>
    </motion.div>
  );
}
