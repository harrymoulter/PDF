import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

import { Helmet } from 'react-helmet-async';

interface Page {
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
}

export function DynamicPage({ slug, onBack }: { slug: string, onBack: () => void }) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('title, content, meta_title, meta_description, keywords')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      
      if (error) throw error;
      setPage(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Content...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-xl w-full text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/10"
          >
            <AlertCircle size={40} />
          </motion.div>
          
          <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">404</h1>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Page Not Found</h2>
          <p className="text-slate-500 mb-12 text-lg font-medium leading-relaxed">
            The page you are looking for doesn't exist, has been moved, or is currently being updated. 
            Check the URL or return to our tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onBack}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:-translate-y-1 active:translate-y-0"
            >
              Return to Tools
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
            >
              Go to Home
            </button>
          </div>

          <div className="mt-16 pt-16 border-t border-slate-100 grid grid-cols-2 gap-8 text-left">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Popular Tools</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/tool/compress')} className="text-xs font-bold text-slate-600 hover:text-indigo-600">Compress PDF</button></li>
                <li><button onClick={() => navigate('/tool/merge')} className="text-xs font-bold text-slate-600 hover:text-indigo-600">Merge PDF</button></li>
                <li><button onClick={() => navigate('/tool/ocr')} className="text-xs font-bold text-slate-600 hover:text-indigo-600">OCR Documents</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Site Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/privacy-policy')} className="text-xs font-bold text-slate-600 hover:text-indigo-600">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="text-xs font-bold text-slate-600 hover:text-indigo-600">Terms of Service</button></li>
                <li><button onClick={() => navigate('/contact')} className="text-xs font-bold text-slate-600 hover:text-indigo-600">Support</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.meta_title || `${page.title} | SmartPDF`}</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
        {page.keywords && <meta name="keywords" content={page.keywords} />}
        <link rel="canonical" href={window.location.origin + '/' + slug} />
      </Helmet>

      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8">
         <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors mb-8"
        >
          <ChevronLeft size={14} /> Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm"
        >
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-8">{page.title}</h1>
          <div className="w-20 h-1.5 bg-indigo-600 rounded-full mb-12" />
          
          <div 
            className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </motion.div>
      </div>
    </>
  );
}
