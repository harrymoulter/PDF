import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { ToolId } from '../types';
import { PDF_TOOLS } from '../constants';

interface NavbarProps {
  currentToolId: ToolId | null;
  onNavigateHome: () => void;
  onOpenTool: (id: ToolId) => void;
}

export function Navbar({ currentToolId, onNavigateHome, onOpenTool }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentTool = PDF_TOOLS.find(t => t.id === currentToolId);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-slate-200">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onNavigateHome}
        >
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center p-1.5 shadow-lg shadow-red-500/20 group-hover:rotate-6 transition-transform">
            <Icons.FileText className="text-white w-full h-full" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">PDF<span className="text-red-600">Master</span></span>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {currentTool && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-700 font-medium text-sm"
              >
                 {React.createElement((Icons as any)[currentTool.icon] || Icons.File, { size: 16 })}
                 {currentTool.name}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="hidden md:flex items-center gap-2 border-l border-slate-200 ml-4 pl-4">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="px-4 py-2 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Icons.Grid size={18} />
              All Tools
              <Icons.ChevronDown size={14} className={isOpen ? 'rotate-180' : ''} />
            </button>
          </div>

          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Icons.User size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 bg-slate-900/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-16 inset-x-0 bg-white border-b border-slate-200 z-50 p-6 shadow-2xl"
            >
              <div className="max-w-screen-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {PDF_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onOpenTool(tool.id);
                      setIsOpen(false);
                    }}
                    className="flex flex-col items-center gap-3 p-4 hover:bg-slate-50 rounded-xl transition-all group"
                  >
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", tool.color)}>
                       {React.createElement((Icons as any)[tool.icon] || Icons.File, { size: 20 })}
                    </div>
                    <span className="text-xs font-bold text-slate-700 text-center">{tool.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
