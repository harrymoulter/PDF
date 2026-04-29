import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

// Initialize PDF.js worker using internal package URL for stability in sandbox
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

let tesseractWorker: Tesseract.Worker | null = null;

// Simple in-memory cache for OCR results
const ocrCache = new Map<string, string>();

function getCacheKey(fileName: string, identifier: string | number) {
  return `${fileName}-${identifier}`;
}

async function getTesseractWorker() {
  if (!tesseractWorker) {
    // Using multiple workers or just ensuring one is ready
    tesseractWorker = await Tesseract.createWorker('eng', 1);
  }
  return tesseractWorker;
}

export async function getPdfDocument(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
}

export async function extractPdfPageText(pdf: any, pageNum: number, onProgress?: (msg: string) => void, fileName?: string): Promise<string> {
  // Check cache first if fileName is provided
  if (fileName) {
    const cached = ocrCache.get(getCacheKey(fileName, pageNum));
    if (cached) return cached;
  }

  let page;
  let attempts = 0;
  const MAX_ATTEMPTS = 3;

  while (attempts < MAX_ATTEMPTS) {
    try {
      page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      let pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      // Attempt OCR only if very little text is found (< 50 chars)
      if (pageText.trim().length < 50) {
        onProgress?.(`Page ${pageNum}: Low text density, scanning visual layer...`);
        // Yield to allow UI to update before heavy OCR
        await new Promise(resolve => setTimeout(resolve, 30));
        const ocrText = await processPdfPageWithOcr(page, onProgress);
        
        // Use OCR result only if it provides significantly more text (50% more)
        if (ocrText.trim().length > pageText.trim().length * 1.5) {
          pageText = ocrText;
        }
      }
      
      // Cache the result
      if (fileName) {
        ocrCache.set(getCacheKey(fileName, pageNum), pageText);
      }

      // CRITICAL: Explicitly cleanup page objects
      page.cleanup();
      return pageText;
    } catch (err) {
      attempts++;
      console.warn(`Attempt ${attempts} failed for page ${pageNum}:`, err);
      if (attempts >= MAX_ATTEMPTS) {
        return `[Extraction failed for Page ${pageNum}]`;
      }
      // Exponential backoff for retries
      await new Promise(resolve => setTimeout(resolve, 200 * attempts));
    } finally {
      // Ensure we don't leak memory even on failure
      if (page) {
        page.cleanup();
      }
    }
  }
  return '';
}

export async function processFile(file: File, onProgress?: (msg: string) => void): Promise<string[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  onProgress?.(`Detecting ${extension?.toUpperCase()} content...`);

  try {
    if (extension === 'pdf') {
      const pdf = await getPdfDocument(file);
      const totalPages = pdf.numPages;
      onProgress?.(`Starting extraction from ${totalPages} pages...`);

      const chunks: string[] = [];
      
      for (let i = 1; i <= totalPages; i++) {
        onProgress?.(`Reading page ${i} of ${totalPages}...`);
        const pageText = await extractPdfPageText(pdf, i, (msg) => {
          onProgress?.(msg);
        }, file.name);
        chunks.push(pageText);
        
        // Give UI thread a significant chance to breathe (Prevent UI lag)
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      // Memory cleanup
      await pdf.destroy();
      
      const hasAnyText = chunks.some(c => c.trim().length > 0 && !c.includes('[Error processing page'));
      if (!hasAnyText) {
        throw new Error("No readable text found in the document.");
      }

      return chunks;
    }
    
    let text = '';
    switch (extension) {
      case 'docx':
        text = await processDocx(file);
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'bmp':
      case 'webp':
        // Check cache for images too
        const cachedImg = ocrCache.get(getCacheKey(file.name, 'img'));
        if (cachedImg) return [cachedImg];

        text = await processImage(file, onProgress);
        ocrCache.set(getCacheKey(file.name, 'img'), text);
        break;
      case 'txt':
        text = await processText(file);
        break;
      default:
        throw new Error(`Unsupported file type: .${extension}`);
    }

    if (!text.trim()) {
      throw new Error("The document could not be read or appears to be empty.");
    }
    return [text];
  } catch (err: any) {
    console.error(`Processing error:`, err);
    throw new Error(err.message || 'Failed to read the file.');
  }
}

async function processPdfPageWithOcr(page: any, onProgress?: (msg: string) => void): Promise<string> {
  // Optimization: Use a balanced scale. 1.5-2.0 is usually enough for OCR.
  const viewport = page.getViewport({ scale: 1.5 }); 
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  // Further Optimization: Limit maximum dimensions to prevent memory crashes
  let width = viewport.width;
  let height = viewport.height;
  const maxDim = 2000;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width *= ratio;
    height *= ratio;
  }

  canvas.width = width;
  canvas.height = height;

  if (!context) throw new Error("Could not create canvas context");

  // Re-scale the viewport to fit the new dimensions
  const scaledViewport = page.getViewport({ scale: (width / viewport.width) * 1.5 });

  await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
  
  // Use jpeg for slightly faster data transfer / smaller size if quality is high
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  
  const worker = await getTesseractWorker();

  const result = await worker.recognize(dataUrl);
  return result.data.text;
}

async function processDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function processImage(file: File, onProgress?: (msg: string) => void): Promise<string> {
  onProgress?.("Initializing OCR engine...");
  const worker = await getTesseractWorker();
  
  const result = await worker.recognize(file);
  // Do not terminate to allow reuse
  
  if (!result.data.text.trim()) {
    throw new Error("No text could be found in the image. Please ensure the image is clear and contains readable text.");
  }

  return result.data.text;
}

async function processText(file: File): Promise<string> {
  return await file.text();
}
