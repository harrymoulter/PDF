import { ToolDef } from './types';

export const PDF_TOOLS: ToolDef[] = [
  {
    id: 'merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one easily.',
    icon: 'Merge',
    color: 'bg-red-500',
    category: 'utility'
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Separate one page or a whole range for easy conversion.',
    icon: 'Scissors',
    color: 'bg-blue-500',
    category: 'utility'
  },
  {
    id: 'smart',
    name: 'Research AI Agent',
    description: 'Free AI-powered PDF summary and smart semantic document search.',
    icon: 'Sparkles',
    color: 'bg-indigo-600',
    category: 'ai'
  },
  {
    id: 'assistant',
    name: 'AI PDF Assistant',
    description: 'Summarize content and explain complex sections instantly.',
    icon: 'MessageSquare',
    color: 'bg-indigo-500',
    category: 'ai'
  },
  {
    id: 'extractor-pro',
    name: 'Data Extractor Pro',
    description: 'Bulk extract emails, phones, dates, and links to JSON.',
    icon: 'ScanSearch',
    color: 'bg-cyan-500',
    category: 'ai'
  },
  {
    id: 'pdf-to-json',
    name: 'PDF to JSON',
    description: 'Convert document structure into a clean JSON format.',
    icon: 'Code',
    color: 'bg-violet-600',
    category: 'ai'
  },
  {
    id: 'cleaner',
    name: 'PDF Cleaner',
    description: 'Optimize PDF, remove empty pages, and fix structure.',
    icon: 'Eraser',
    color: 'bg-rose-500',
    category: 'utility'
  },
  {
    id: 'extract',
    name: 'Table Extractor',
    description: 'AI-powered extraction of tables and structured data.',
    icon: 'Database',
    color: 'bg-purple-500',
    category: 'ai'
  },
  {
    id: 'invoice',
    name: 'Invoice AI',
    description: 'Extract items, totals, and vendors from invoices automatically.',
    icon: 'Receipt',
    color: 'bg-orange-600',
    category: 'ai'
  },
  {
    id: 'resume',
    name: 'Resume Parser',
    description: 'Extract skills, experience, and contact info from CVs.',
    icon: 'UserCircle',
    color: 'bg-emerald-600',
    category: 'ai'
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce file size while optimizing for maximal PDF quality.',
    icon: 'Minimize2',
    color: 'bg-orange-500',
    category: 'utility'
  },
  {
    id: 'organize',
    name: 'Organize PDF',
    description: 'Sort, add, delete and rotate PDF pages of your document.',
    icon: 'Layout',
    color: 'bg-pink-500',
    category: 'utility'
  },
  {
    id: 'ocr',
    name: 'Free OCR Scanner',
    description: 'Convert scanned PDFs to text locally using high-precision OCR.',
    icon: 'Zap',
    color: 'bg-yellow-500',
    category: 'utility'
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert images to high-quality PDF docs.',
    icon: 'Image',
    color: 'bg-emerald-500',
    category: 'utility'
  },
  {
    id: 'viewer',
    name: 'PDF Viewer',
    description: 'A fast, lightweight PDF reader and navigator.',
    icon: 'Eye',
    color: 'bg-slate-700',
    category: 'utility'
  },
  {
    id: 'translate',
    name: 'AI Translator',
    description: 'Translate document text while preserving logical structure.',
    icon: 'Languages',
    color: 'bg-blue-600',
    category: 'ai'
  }
];
