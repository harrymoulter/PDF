import { supabase } from './supabase';

const DEFAULT_PAGES = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    meta_title: 'Privacy Policy | SmartPDF - Secure Online PDF Tools',
    meta_description: 'Read the SmartPDF Privacy Policy. Learn how we protect your data, ensure secure PDF processing, and maintain your privacy.',
    keywords: 'privacy policy, smartpdf, secure pdf, data protection, online tools',
    content: `
      <h2>1. Privacy-First Commitment</h2>
      <p>At SmartPDF, we treat your documents with the highest level of confidentiality. Our platform is built on modern privacy standards, ensuring that your data remains your data.</p>
      <h2>2. No Permanent Storage</h2>
      <p>We do not store your files permanently. Most operations happen entirely within your browser's memory. For tools that require server-side computing, files are encrypted and automatically deleted immediately after processing is complete.</p>
      <h2>3. Data Usage</h2>
      <p>We do not sell, rent, or trade your personal information or document data with third parties. We only collect minimal usage statistics to improve our service.</p>
    `,
    category: 'legal'
  },
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    meta_title: 'Terms & Conditions | SmartPDF - PDF Master AI',
    meta_description: 'Review the SmartPDF Terms and Conditions. Understand your rights and responsibilities when using our professional PDF tools.',
    keywords: 'terms and conditions, legal, smartpdf, user agreement',
    content: `
      <h2>1. Acceptance of Terms</h2>
      <p>By using SmartPDF, you agree to comply with these terms of service and all applicable regulations. If you do not agree, you are prohibited from using the service.</p>
      <h2>2. Usage Restrictions</h2>
      <p>You may not use SmartPDF for any illegal activities or to process copyrighted material without authorization. We provide tools for personal and professional productivity only.</p>
      <h2>3. Disclaimer of Liability</h2>
      <p>SmartPDF is provided "as is" without any guarantees. We are not liable for any data loss or errors that may occur during document processing.</p>
    `,
    category: 'legal'
  },
  {
    slug: 'security',
    title: 'Security',
    meta_title: 'Security & Encryption | SmartPDF - Privacy First PDF',
    meta_description: 'Discover how SmartPDF keeps your documents secure using enterprise-grade encryption and local browser-side processing.',
    keywords: 'pdf security, encryption, browser-side processing, secure documents, privacy',
    content: `
      <h2>State-of-the-Art Protection</h2>
      <p>Your security is the foundation of SmartPDF. We employ industry-leading protocols to safeguard your documents.</p>
      <ul>
        <li><strong>Local Browser Processing:</strong> Wherever possible, your files never leave your computer.</li>
        <li><strong>256-bit Encryption:</strong> All server-side data transfers are protected with enterprise-grade SSL/TLS.</li>
        <li><strong>Automated Purging:</strong> Our systems automatically wipe temporary processing caches every few minutes.</li>
      </ul>
    `,
    category: 'legal'
  },
  {
    slug: 'about',
    title: 'About Us',
    meta_title: 'About SmartPDF | The Future of Online PDF Tools',
    meta_description: 'Learn about the mission behind SmartPDF. We build privacy-focused, AI-powered PDF tools that run entirely in your browser.',
    keywords: 'about smartpdf, browser-based tools, webpdf, local ai pdf',
    content: `
      <h2>Modern PDF Solutions</h2>
      <p>SmartPDF is a free online platform dedicated to making PDF tasks fast, secure, and accessible to everyone. We believe that professional tools shouldn't come at the cost of your privacy.</p>
      <p>Our focus is on simplicity, efficiency, and leveraging cutting-edge technology to process documents directly in the browser.</p>
    `,
    category: 'company'
  },
  {
    slug: 'contact',
    title: 'Contact Us',
    meta_title: 'Contact Us | SmartPDF Support & Feedback',
    meta_description: 'Need help or have questions? Contact the SmartPDF team for support, feature requests, or general inquiries.',
    keywords: 'contact smartpdf, support, help desk, feedback',
    content: `
      <h2>Support & Feedback</h2>
      <p>Have a question or a suggestion for a new feature? Our team is eager to hear from you. We strive to respond to all inquiries within 24 hours.</p>
      <div class="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 my-8">
        <p class="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-2 text-indigo-600">Email Support</p>
        <a href="mailto:support@smartpdf.ai" class="text-xl font-bold text-indigo-600 hover:underline">support@smartpdf.ai</a>
      </div>
    `,
    category: 'company'
  },
  {
    slug: 'blog',
    title: 'SmartPDF Blog',
    meta_title: 'SmartPDF Blog | PDF Tips & AI Updates',
    meta_description: 'Stay updated with the latest from SmartPDF. Tips for PDF productivity, security updates, and AI breakthroughs.',
    keywords: 'pdf blog, productivity tips, smartpdf updates, ai news',
    content: `
      <h2>Insights & Tutorials</h2>
      <p>Welcome to the SmartPDF Blog. Here, we share tips for maximizing your productivity and stay on top of the latest document management trends.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
        <div class="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
          <p class="text-xs font-bold text-slate-400 mb-2">Coming Soon</p>
          <h4 class="text-lg font-black text-slate-900 mb-2">10 Tips for Better PDF Security</h4>
          <p class="text-sm text-slate-500">Learn how to protect your sensitive data when using online tools.</p>
        </div>
        <div class="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
          <p class="text-xs font-bold text-slate-400 mb-2">Coming Soon</p>
          <h4 class="text-lg font-black text-slate-900 mb-2">AI and the Future of Documents</h4>
          <p class="text-sm text-slate-500">How machine learning is changing the way we interact with PDFs.</p>
        </div>
      </div>
    `,
    category: 'company'
  },
  // Quick Links / SEO Pages
  {
    slug: 'compress-pdf',
    title: 'Compress PDF Online',
    meta_title: 'Compress PDF Online | Shrink PDF File Size - SmartPDF',
    meta_description: 'Reduce PDF file size without losing quality. Our online tool is fast, secure, and processes files entirely in your browser.',
    keywords: 'compress pdf, shrink pdf size, pdf optimization, small pdf',
    content: `
      <h2>Optimize Your PDF Files</h2>
      <p>Compression is essential for sending large documents via email or uploading them to web portals. Our tool shrinks file sizes while maintaining professional visual quality.</p>
      <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 my-8">
        <h3 class="mt-0">Ready to shrink your PDF?</h3>
        <p>Our compression engine runs locally in your browser, ensuring your private documents never leave your machine.</p>
        <a href="/tool/compress" class="inline-block px-8 py-3 bg-indigo-600 text-white !text-white no-underline rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Open Compress Tool</a>
      </div>
      <h3>Secure Browser-Only Compression</h3>
      <p>Unlike other tools, SmartPDF uses your local machine's power to optimize documents, keeping your data private.</p>
    `,
    category: 'quick'
  },
  {
    slug: 'pdf-to-word',
    title: 'Convert PDF to Word',
    meta_title: 'Convert PDF to Word Online | PDF to DOCX - SmartPDF',
    meta_description: 'Transform your PDF documents into editable Microsoft Word files with high accuracy and complete layout preservation.',
    keywords: 'pdf to word, convert pdf to docx, editable pdf, pdf converter',
    content: `
      <h2>Accurate PDF to Word Conversion</h2>
      <p>Tired of manually retyping documents? Our AI-powered converter preserves headers, footers, tables, and formatting so you can start editing immediately in Word.</p>
      <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 my-8">
        <h3 class="mt-0">Start Converting</h3>
        <p>Turn your static PDF files into editable DOCX format using our advanced extraction engine.</p>
        <a href="/tool/smart" class="inline-block px-8 py-3 bg-indigo-600 text-white !text-white no-underline rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Open AI Converter</a>
      </div>
      <p>Fast, secure, and professional conversion at your fingertips.</p>
    `,
    category: 'quick'
  },
  {
    slug: 'pdf-to-excel',
    title: 'Convert PDF to Excel',
    meta_title: 'Convert PDF to Excel Online | Extract Tables - SmartPDF',
    meta_description: 'Easily convert PDF tables and data into Microsoft Excel spreadsheets for advanced data analysis and reporting.',
    keywords: 'pdf to excel, pdf to xlsx, extract pdf tables, data extraction',
    content: `
      <h2>Extract Tables with Precision</h2>
      <p>Stop copy-pasting rows of data. Our tool identifies tables within your PDF and converts them into structured XLSX files, perfect for data analysts and financial professionals.</p>
      <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 my-8">
        <h3 class="mt-0">Extract Data Now</h3>
        <p>Our extraction tool handles complex layouts and maintains data types during the conversion to Excel.</p>
        <a href="/tool/extract" class="inline-block px-8 py-3 bg-indigo-600 text-white !text-white no-underline rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Open Table Extractor</a>
      </div>
    `,
    category: 'quick'
  },
  {
    slug: 'merge-pdf',
    title: 'Merge PDF Documents',
    meta_title: 'Merge PDF Online | Combine Multiple PDFs - SmartPDF',
    meta_description: 'Combine multiple PDF files into one single document in seconds. Easy drag-and-drop ordering for perfect results.',
    keywords: 'merge pdf, combine pdf, join pdf files, merge documents',
    content: `
      <h2>Organize Your Files</h2>
      <p>Merging is the simplest way to keep your reports and documents organized. Combine any number of PDF files into a single document in just two clicks.</p>
      <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 my-8">
        <h3 class="mt-0">Combine Your Files</h3>
        <p>Merge unlimited documents without file size restrictions. Everything happens in your browser.</p>
        <a href="/tool/merge" class="inline-block px-8 py-3 bg-indigo-600 text-white !text-white no-underline rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Open Merge Tool</a>
      </div>
    `,
    category: 'quick'
  },
  {
    slug: 'split-pdf',
    title: 'Split PDF Online',
    meta_title: 'Split PDF Online | Separate PDF Pages - SmartPDF',
    meta_description: 'Separate individual pages or extract specific ranges from any PDF document into several smaller files.',
    keywords: 'split pdf, extract pdf pages, divide pdf, cut pdf',
    content: `
      <h2>Extract Exactly What You Need</h2>
      <p>Don't need the whole document? Use our split tool to extract specific pages or break a large file into multiple smaller PDFs. Fast and extremely simple to use.</p>
      <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 my-8">
        <h3 class="mt-0">Split Your PDF</h3>
        <p>Extract specific pages or ranges. Preview pages before splitting for 100% accuracy.</p>
        <a href="/tool/split" class="inline-block px-8 py-3 bg-indigo-600 text-white !text-white no-underline rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Open Split Tool</a>
      </div>
    `,
    category: 'quick'
  },
  {
    slug: 'pdf-to-jpg',
    title: 'Convert PDF to JPG',
    meta_title: 'PDF to JPG Online | Convert PDF Pages to Images - SmartPDF',
    meta_description: 'Convert your PDF pages into high-quality JPG images. Perfect for sharing on social media or using in presentation slides.',
    keywords: 'pdf to jpg, pdf to image, convert pdf to jpeg',
    content: `
      <h2>PDF Pages to High-Res Images</h2>
      <p>Need to turn a PDF page into a visual asset? Our converter generates high-resolution JPG images from every page of your document, ready for download.</p>
      <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 my-8">
        <h3 class="mt-0">Convert to Images</h3>
        <p>Preserve image quality and resolution when converting PDF pages to JPG format.</p>
        <a href="/tool/image-to-pdf" class="inline-block px-8 py-3 bg-indigo-600 text-white !text-white no-underline rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Open Image Tools</a>
      </div>
    `,
    category: 'quick'
  },
  {
    slug: 'jpg-to-pdf',
    title: 'Convert JPG to PDF',
    meta_title: 'JPG to PDF Online | Turn Images into PDF - SmartPDF',
    meta_description: 'Convert your images and photos into a professional PDF document. Support for JPG, PNG, and more.',
    keywords: 'jpg to pdf, image to pdf, create pdf from images',
    content: `
      <h2>Create PDFs from Your Photos</h2>
      <p>Convert scanned documents or photos into a clean PDF. Simply upload your images, arrange them, and download your consolidated PDF file.</p>
      <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 my-8">
        <h3 class="mt-0">Turn Photos to PDF</h3>
        <p>Simply drag and drop your JPG or PNG files to create a beautiful, standardized PDF document.</p>
        <a href="/tool/image-to-pdf" class="inline-block px-8 py-3 bg-indigo-600 text-white !text-white no-underline rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Open JPG to PDF</a>
      </div>
    `,
    category: 'quick'
  },
  {
    slug: 'extract-data',
    title: 'Extract Data from PDF',
    meta_title: 'AI PDF Data Extraction | Smart Data Parser - SmartPDF',
    meta_description: 'Use advanced AI to extract key data points, figures, and text from any PDF document without manual typing.',
    keywords: 'extract pdf data, ai pdf extraction, smart pdf parser',
    content: `
      <h2>Smart AI Data Parsing</h2>
      <p>Leverage the power of AI to understand your documents. Extract invoices, names, dates, and totals automatically with our intelligent data extraction engine.</p>
      <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 my-8">
        <h3 class="mt-0">Extract with Intelligence</h3>
        <p>Let AI handle the tedious data entry. Extract schema-based data from your documents in seconds.</p>
        <a href="/tool/smart" class="inline-block px-8 py-3 bg-indigo-600 text-white !text-white no-underline rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">Open AI Assistant</a>
      </div>
    `,
    category: 'quick'
  }
];

export async function syncCmsContent() {
  console.log('🚀 [CMS Sync] Starting Content Synchronization...');

  // 0. Verify connection first
  try {
    const { data: connectionTest, error: connError } = await supabase.from('pages').select('id').limit(1);
    if (connError) {
      console.error('❌ [CMS Sync] Database connection check failed. Tables might be missing or URL/Key is incorrect:', connError);
      return;
    }
    console.log('✅ [CMS Sync] Database connection verified.');
  } catch (err) {
    console.error('💥 [CMS Sync] Fatal error during connection test:', err);
    return;
  }

  // Identify identity
  let user = null;
  try {
    const { data: authData } = await supabase.auth.getUser();
    user = authData?.user;
    console.log('👤 [CMS Sync] Running as:', user?.email || 'Anonymous');
  } catch (authErr) {
    console.warn('⚠️ [CMS Sync] Could not identify user during sync:', authErr);
  }

  for (const page of DEFAULT_PAGES) {
    try {
      console.log(`🔍 [CMS Sync] Checking page: ${page.slug}`);
      // 1. Check if page exists
      const { data: existingPage, error: fetchError } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', page.slug)
        .maybeSingle();

      if (fetchError) {
        console.error(`❌ [CMS Sync] Fetch error for ${page.slug}:`, fetchError);
        continue;
      }

      // 2. Upsert page (Insert if missing, Update if system page to ensure SEO/Content sync)
      if (!existingPage) {
        console.log(`📝 [CMS Sync] Creating page ${page.slug}...`);
        const { error: insertError } = await supabase
          .from('pages')
          .insert([{
            slug: page.slug,
            title: page.title,
            content: page.content,
            meta_title: page.meta_title,
            meta_description: page.meta_description,
            keywords: page.keywords,
            is_system_page: true,
            is_published: true
          }]);

        if (insertError) {
          console.error(`❌ [CMS Sync] Insert error for ${page.slug}:`, insertError);
        } else {
          console.log(`✅ [CMS Sync] Successfully created ${page.slug}`);
        }
      } else if (existingPage.is_system_page) {
        console.log(`🔄 [CMS Sync] Patching meta for existing system page: ${page.slug}`);
        // Ensure system pages have correct meta/content if they were somehow altered or missing
        const { error: updateError } = await supabase
          .from('pages')
          .update({
            meta_title: existingPage.meta_title || page.meta_title,
            meta_description: existingPage.meta_description || page.meta_description,
            keywords: existingPage.keywords || page.keywords,
            is_system_page: true
          })
          .eq('id', existingPage.id);
        
        if (updateError) {
           console.error(`❌ [CMS Sync] Update error for ${page.slug}:`, updateError);
        }
      }

      // 3. Auto-sync with consolidated navigation table (navigation_links)
      console.log(`🔗 [CMS Sync] Syncing consolidated nav link for: ${page.slug}`);
      const navTable = 'navigation_links';
      
      const determineMenuType = (category: string) => {
        if (category === 'company') return 'footer_1';
        if (category === 'legal') return 'footer_2';
        return 'footer_3';
      };

      const menuType = determineMenuType(page.category);

      const { data: existingNL, error: nlFetchError } = await supabase
        .from(navTable)
        .select('id')
        .eq('url', `/${page.slug}`)
        .eq('menu_type', menuType)
        .maybeSingle();

      if (!nlFetchError && !existingNL) {
        console.log(`📌 [CMS Sync] Adding missing ${menuType} link for ${page.slug}`);
        await supabase
          .from(navTable)
          .insert([{
            name: page.title,
            url: `/${page.slug}`,
            menu_type: menuType,
            order_index: DEFAULT_PAGES.indexOf(page),
            link_type: 'Internal Page'
          }]);
        
        // Also add to header if it's a primary company or quick link
        if (page.category === 'company' || page.category === 'quick') {
             await supabase.from(navTable).insert([{
                name: page.title,
                url: `/${page.slug}`,
                menu_type: 'header',
                order_index: DEFAULT_PAGES.indexOf(page),
                link_type: 'Internal Page'
             }]);
        }
      }

      // Legacy support for footer_links
      const { data: existingLink } = await supabase
        .from('footer_links')
        .select('id')
        .eq('url', `/${page.slug}`)
        .maybeSingle();

      if (!existingLink) {
        await supabase
          .from('footer_links')
          .insert([{
            name: page.title,
            url: `/${page.slug}`,
            section: page.category,
            order_index: DEFAULT_PAGES.indexOf(page)
          }]);
      }
    } catch (err) {
      console.error(`💥 [CMS Sync] Unhandled error during ${page.slug} sync:`, err);
    }
  }

  // Final check for orphaned tool links or missing defaults
  try {
    console.log('🛠️ [CMS Sync] Checking Quick Links integrity...');
    const { data: currentLinks, error: linksError } = await supabase.from('footer_links').select('url');
    if (linksError) throw linksError;

    const urls = currentLinks?.map(l => l.url) || [];
    
    const toolLinks = [
       { name: 'Compress PDF', url: '/tool/compress', section: 'quick', order_index: 10 },
       { name: 'Merge PDF', url: '/tool/merge', section: 'quick', order_index: 11 },
       { name: 'Split PDF', url: '/tool/split', section: 'quick', order_index: 12 },
       { name: 'OCR PDF', url: '/tool/ocr', section: 'quick', order_index: 13 },
    ];

    const toInsert = toolLinks.filter(tl => !urls.includes(tl.url));
    if (toInsert.length > 0) {
      console.log(`✨ [CMS Sync] Registering ${toInsert.length} missing default quick links`);
      const { error: batchError } = await supabase.from('footer_links').insert(toInsert);
      if (batchError) console.error('❌ [CMS Sync] Quick links batch insert failed:', batchError);
    }
  } catch (err) {
    console.error('❌ [CMS Sync] Error in tool links sync phase:', err);
  }

  console.log('🏁 [CMS Sync] Default pages sync complete. Starting global pages backfill...');

  // Goal 6: Backfill ALL existing pages from 'pages' table into 'footer_links'
  try {
    const { data: allPages, error: pagesFetchError } = await supabase.from('pages').select('id, title, slug');
    if (pagesFetchError) throw pagesFetchError;

    const { data: existingLinks, error: linksFetchError } = await supabase.from('footer_links').select('url');
    if (linksFetchError) throw linksFetchError;

    const existingUrls = new Set(existingLinks?.map(l => l.url) || []);
    const pagesToBackfill = allPages?.filter(p => !existingUrls.has(`/${p.slug}`)) || [];

    if (pagesToBackfill.length > 0) {
      console.log(`📦 [CMS Sync] Backfilling ${pagesToBackfill.length} missing page links to footer`);
      
      const backfillData = pagesToBackfill.map(page => {
        let section = 'quick';
        const slug = page.slug?.toLowerCase() || '';
        if (['about', 'contact', 'blog', 'about-us', 'contact-us'].includes(slug)) {
          section = 'company';
        } else if (['privacy-policy', 'terms', 'security', 'terms-of-service', 'cookie-policy', 'cookies'].includes(slug)) {
          section = 'legal';
        }

        return {
          name: page.title,
          url: `/${page.slug}`,
          section: section,
          order_index: 20 // Default high index for backfilled
        };
      });

      const { error: backfillError } = await supabase.from('footer_links').insert(backfillData);
      if (backfillError) console.error('❌ [CMS Sync] Backfill error:', backfillError);
      else console.log('✅ [CMS Sync] Backfill completed.');
    }
  } catch (err) {
    console.error('❌ [CMS Sync] Failed to backfill pages:', err);
  }

  console.log('🏁 [CMS Sync] Content synchronization complete.');
}
