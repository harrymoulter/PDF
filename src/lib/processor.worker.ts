import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Setup Worker environment
let tesseractWorker: Tesseract.Worker | null = null;

async function getTesseractWorker() {
  if (!tesseractWorker) {
    tesseractWorker = await Tesseract.createWorker('eng', 1);
  }
  return tesseractWorker;
}

self.onmessage = async (e: MessageEvent) => {
  const { type, pageData, pageNum, scale = 2 } = e.data;

  if (type === 'PROCESS_PAGE') {
    try {
      // Re-initialize PDF.js in worker if needed or proxy the data
      // For simplicity in this worker, we assume we receive a viewport-rendered image or the text-layer data
      // Actually, it's better to pass the text layer directly if extracted on main thread, 
      // or if passing binary, do OCR here.
      
      if (e.data.imageData) {
        const worker = await getTesseractWorker();
        const { data: { text } } = await worker.recognize(e.data.imageData);
        self.postMessage({ type: 'RESULT', pageNum, text, success: true });
      }
    } catch (err: any) {
      self.postMessage({ type: 'RESULT', pageNum, error: err.message, success: false });
    }
  }
};
