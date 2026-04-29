import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit2, Eye, FileCode, Loader2, Save, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Page {
  id?: string;
  title: string;
  slug: string;
  content: string;
  is_published: boolean;
  is_system_page?: boolean;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  created_at?: string;
}

export function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>({
    title: '',
    slug: '',
    content: '',
    is_published: true,
    meta_title: '',
    meta_description: '',
    keywords: ''
  });
  const [saving, setSaving] = useState(false);
  const [showSEO, setShowSEO] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    console.log('📡 [AdminPages] Fetching all pages from Supabase...');
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ [AdminPages] Fetch failed:', error);
        throw error;
      }
      
      console.log(`✅ [AdminPages] Retrieved ${data?.length || 0} pages.`);
      setPages(data || []);
    } catch (err: any) {
      console.error('💥 [AdminPages] Critical fetch error:', err);
      // Removed alert to avoid blocking UI, using console for debug as requested
    } finally {
      setLoading(false);
    }
  };

  const generateSEO = () => {
    const brand = 'SmartPDF';
    const title = currentPage.title.trim();
    if (!title) {
        console.warn('⚠️ [AdminPages] Cannot generate SEO without a title.');
        return;
    }

    console.log(`🧠 [AdminPages] Generating SEO for: ${title}`);
    const metaTitle = `${title} | ${brand} - Secure Online PDF Tools`.slice(0, 60);
    
    // Improved description generation
    const contentPreview = currentPage.content
      .replace(/<[^>]*>?/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const metaDesc = contentPreview 
      ? contentPreview.slice(0, 150) + '...'
      : `Access ${title} on ${brand}. Professional-grade, secure PDF tools processed entirely in your browser for maximum privacy.`;
    
    // Contextual keywords
    const keywords = [
      title.toLowerCase(),
      brand.toLowerCase(),
      'pdf tools',
      'secure pdf',
      'online pdf editor',
      'privacy tools',
      'no upload pdf'
    ].join(', ');

    setCurrentPage({
      ...currentPage,
      meta_title: metaTitle,
      meta_description: metaDesc,
      keywords: keywords,
      slug: currentPage.id ? currentPage.slug : generateSlug(title)
    });
    setShowSEO(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    console.log('💾 [AdminPages] Attempting to save page...');
    
    try {
      // Ensure slug is clean
      const finalPage = { ...currentPage, slug: generateSlug(currentPage.slug || currentPage.title) };
      console.log('📄 [AdminPages] Page data:', finalPage);

      if (currentPage.id) {
        console.log(`📝 [AdminPages] Updating existing page: ${currentPage.id}`);
        const { error } = await supabase
          .from('pages')
          .update(finalPage)
          .eq('id', currentPage.id);
        if (error) {
            console.error('❌ [AdminPages] Update failed:', error);
            throw error;
        }
      } else {
        console.log('📝 [AdminPages] Inserting new page...');
        const { error } = await supabase
          .from('pages')
          .insert([finalPage]);
        if (error) {
            console.error('❌ [AdminPages] Insert failed:', error);
            throw error;
        }
      }

      console.log('🔗 [AdminPages] Syncing footer link...');
      
      const determineSection = (slug: string) => {
        const s = slug.toLowerCase();
        if (['about', 'contact', 'blog', 'about-us', 'contact-us'].includes(s)) return 'footer_1';
        if (['privacy-policy', 'terms', 'security', 'terms-of-service', 'cookie-policy', 'cookies'].includes(s)) return 'footer_2';
        return 'footer_3';
      };

      const section = determineSection(finalPage.slug);
      
      const navItem = {
        name: finalPage.title,
        url: `/${finalPage.slug}`,
        menu_type: section,
        link_type: 'Internal Page'
      };

      // Upsert into navigation_links (Our new source of truth)
      const { data: existingNav, error: navFetchError } = await supabase
        .from('navigation_links')
        .select('id')
        .eq('url', `/${finalPage.slug}`)
        .maybeSingle();

      if (!navFetchError) {
        if (existingNav) {
          await supabase.from('navigation_links').update(navItem).eq('id', existingNav.id);
        } else {
          await supabase.from('navigation_links').insert([{ ...navItem, order_index: 0 }]);
        }
      }

      // Backward compatibility: also sync footer_links
      const legacySection = section === 'footer_1' ? 'company' : section === 'footer_2' ? 'legal' : 'quick';
      const { data: existingFL } = await supabase.from('footer_links').select('id').eq('url', `/${finalPage.slug}`).maybeSingle();
      if (existingFL) {
        await supabase.from('footer_links').update({ name: finalPage.title, url: `/${finalPage.slug}`, section: legacySection }).eq('id', existingFL.id);
      } else {
        await supabase.from('footer_links').insert([{ name: finalPage.title, url: `/${finalPage.slug}`, section: legacySection, order_index: 0 }]);
      }

      // Also sync Header if it's a company or quick page
      if (section === 'footer_1' || section === 'footer_3') {
        const headerNav = { ...navItem, menu_type: 'header' };
        const { data: existingH } = await supabase.from('navigation_links').select('id').eq('url', `/${finalPage.slug}`).eq('menu_type', 'header').maybeSingle();
        if (existingH) {
           await supabase.from('navigation_links').update(headerNav).eq('id', existingH.id);
        } else {
           await supabase.from('navigation_links').insert([{ ...headerNav, order_index: 0 }]);
        }
      }

      console.log('✅ [AdminPages] Save & Sync completed. Dispatching update event.');
      window.dispatchEvent(new CustomEvent('navigation-updated'));
      setIsModalOpen(false);
      fetchPages();
      setCurrentPage({ title: '', slug: '', content: '', is_published: true, meta_title: '', meta_description: '', keywords: '' });
      setShowSEO(false);
    } catch (err: any) {
      console.error('💥 [AdminPages] Save operation failed:', err);
      alert('Error saving page: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Delete this page? This will break any existing links.')) return;
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchPages();
    } catch (err: any) {
      alert('Error deleting page: ' + err.message);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Pages Manager</h2>
          <p className="text-slate-500 font-medium italic">Create and manage dynamic CMS components</p>
        </div>
        <button 
          onClick={() => {
            setCurrentPage({ title: '', slug: '', content: '', is_published: true, meta_title: '', meta_description: '', keywords: '' });
            setIsModalOpen(true);
            setShowSEO(false);
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} /> Add New Page
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={40} /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Title</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">URL / Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileCode size={16} />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{page.title}</span>
                        {page.is_system_page && (
                          <span className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter">System Page</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]">
                        <Globe size={12} className="text-slate-300" />
                        /{page.slug}
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${page.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {page.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all"
                        title="View Page"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setCurrentPage(page);
                          setIsModalOpen(true);
                          setShowSEO(!!(page.meta_title || page.meta_description));
                        }}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deletePage(page.id!)}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">No pages created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Page Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-white rounded-[2.5rem] p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900">{currentPage.id ? 'Edit Page' : 'Create New Page'}</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={currentPage.is_published}
                      onChange={(e) => setCurrentPage({ ...currentPage, is_published: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-600">Published</span>
                  </label>
                  <button 
                    type="button"
                    onClick={generateSEO}
                    className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-100 transition-all"
                  >
                    <Save size={14} /> Auto-Gen SEO
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Page Title</label>
                    <input 
                      required
                      value={currentPage.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setCurrentPage({ 
                          ...currentPage, 
                          title, 
                          slug: currentPage.id ? currentPage.slug : generateSlug(title) 
                        });
                      }}
                      className="w-full bg-slate-50 border-none px-6 py-3 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="e.g. Terms of Service"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Slug (URL Path)</label>
                    <input 
                      required
                      value={currentPage.slug}
                      onChange={(e) => setCurrentPage({ ...currentPage, slug: generateSlug(e.target.value) })}
                      className="w-full bg-slate-50 border-none px-6 py-3 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="e.g. terms-of-service"
                    />
                  </div>
                </div>

                {/* SEO Section */}
                <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setShowSEO(!showSEO)}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"
                  >
                    SEO Metadata Settings {showSEO ? '(Hide)' : '(Show)'}
                  </button>
                  {showSEO && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Meta Title</label>
                          <input 
                            value={currentPage.meta_title || ''}
                            onChange={(e) => setCurrentPage({ ...currentPage, meta_title: e.target.value })}
                            className="w-full bg-white border border-slate-100 px-6 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="SEO Title (max 60 chars)"
                            maxLength={60}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Keywords</label>
                          <input 
                            value={currentPage.keywords || ''}
                            onChange={(e) => setCurrentPage({ ...currentPage, keywords: e.target.value })}
                            className="w-full bg-white border border-slate-100 px-6 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="comma-separated-keywords"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Meta Description</label>
                        <textarea 
                          value={currentPage.meta_description || ''}
                          onChange={(e) => setCurrentPage({ ...currentPage, meta_description: e.target.value })}
                          className="w-full bg-white border border-slate-100 px-6 py-2 rounded-xl text-xs font-medium h-20 focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="Search engine description (max 155 chars)"
                          maxLength={155}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Page Content (HTML/Markdown)</label>
                  <textarea 
                    required
                    value={currentPage.content}
                    onChange={(e) => setCurrentPage({ ...currentPage, content: e.target.value })}
                    className="w-full bg-slate-100 border-none px-6 py-4 rounded-2xl text-sm font-mono min-h-[250px] focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Enter page content here..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={saving}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save & Sync'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
