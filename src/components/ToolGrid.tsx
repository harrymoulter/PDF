import React from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { ToolId, ToolDef } from '../types';
import { PDF_TOOLS } from '../constants';
import { cn } from '../lib/utils';

interface ToolGridProps {
  onSelect: (id: ToolId) => void;
  filter?: 'utility' | 'ai';
}

export function ToolGrid({ onSelect, filter }: ToolGridProps) {
  const filteredTools = filter 
    ? PDF_TOOLS.filter(t => t.category === filter)
    : PDF_TOOLS;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 p-4 md:p-8">
      {filteredTools.map((tool, index) => {
        const Icon = (Icons as any)[tool.icon] || Icons.FileText;
        return (
          <motion.a
            key={tool.id}
            href={`/tool/${tool.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={(e) => {
              e.preventDefault();
              onSelect(tool.id);
            }}
            className="group relative flex flex-col items-start p-6 md:p-8 bg-white border border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all text-left overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/[0.02] to-purple-500/5" />
             <div className={cn(
              "relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 md:mb-6 text-white transition-transform group-hover:scale-110 group-hover:rotate-3",
              tool.color
            )}>
              <Icon size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
            </div>
            <h3 className="relative z-10 text-lg md:text-xl font-bold text-slate-900 mb-2">{tool.name}</h3>
            <p className="relative z-10 text-xs md:text-sm text-slate-500 leading-relaxed">
              {tool.description}
            </p>
            <div className="relative z-10 mt-6 md:mt-8 flex items-center text-blue-600 font-bold text-[10px] md:text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Open Tool <Icons.ChevronRight size={14} className="ml-1" />
            </div>
          </motion.a>
        );
      })}
    </div>
  );
}
