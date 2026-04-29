import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  type?: string;
  image?: string;
}

export function SEO({ 
  title, 
  description, 
  keywords, 
  canonical, 
  type = 'website',
  image = '/og-image.png'
}: SEOProps) {
  const siteTitle = 'PDFMaster AI';
  const fullTitle = title ? `${title} | ${siteTitle}` : `PDFMaster AI | Free Browser-Based PDF Toolset`;
  const defaultDescription = 'Analyze and extract data from your PDFs for free with our localized AI toolkit. OCR, summarize, and extract emails, phones, and tables safely in your browser.';
  const fullDescription = description || defaultDescription;
  const defaultKeywords = 'free pdf ai, local ocr, extract data from pdf, summarize pdf free, semantic search pdf, free pdf tools';
  const fullKeywords = keywords || defaultKeywords;
  
  const siteUrl = 'https://pdf-master-ai.vercel.app'; // Replace with real production URL if known
  const fullUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      <meta property="og:url" content={fullUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": siteTitle,
          "operatingSystem": "All",
          "applicationCategory": "OfficeApplication",
          "description": defaultDescription,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        })}
      </script>
    </Helmet>
  );
}
