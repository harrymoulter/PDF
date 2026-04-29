import { PDFDocument, rgb, degrees } from 'pdf-lib';

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  return await mergedPdf.save();
}

export async function splitPdf(file: File, ranges: string): Promise<Uint8Array[]> {
  const bytes = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(bytes);
  const results: Uint8Array[] = [];
  
  // Basic range parser: e.g. "1-2, 4, 6-10"
  const rangeStrings = ranges.split(',').map(s => s.trim());
  
  for (const range of rangeStrings) {
    const subPdf = await PDFDocument.create();
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(n => parseInt(n) - 1);
      const indices = [];
      for (let i = start; i <= end; i++) indices.push(i);
      const pages = await subPdf.copyPages(srcPdf, indices);
      pages.forEach(p => subPdf.addPage(p));
    } else {
      const idx = parseInt(range) - 1;
      const [page] = await subPdf.copyPages(srcPdf, [idx]);
      subPdf.addPage(page);
    }
    results.push(await subPdf.save());
  }
  
  return results;
}

export async function organizePdf(
  file: File, 
  operations: { pageIndex: number; action: 'rotate' | 'delete' | 'move'; targetIndex?: number; rotation?: number }[]
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  
  // Sort operations to handle deletions/moves correctly if we were doing them sequentially
  // But simpler: just create a new PDF and copy pages with modifications
  const newPdf = await PDFDocument.create();
  const pageCount = pdf.getPageCount();
  
  const pageMap = Array.from({ length: pageCount }, (_, i) => ({
    originalIndex: i,
    keep: true,
    rotation: 0
  }));
  
  // Apply operations to our map
  for (const op of operations) {
    if (op.action === 'delete') {
      pageMap[op.pageIndex].keep = false;
    } else if (op.action === 'rotate') {
      pageMap[op.pageIndex].rotation = (pageMap[op.pageIndex].rotation + (op.rotation || 90)) % 360;
    }
  }
  
  // Copy active pages
  for (const item of pageMap) {
    if (item.keep) {
      const [page] = await newPdf.copyPages(pdf, [item.originalIndex]);
      if (item.rotation !== 0) {
        page.setRotation(degrees(item.rotation));
      }
      newPdf.addPage(page);
    }
  }
  
  return await newPdf.save();
}

/**
 * Removes pages that are visually empty.
 * Heuristic: checks if text content is minimal (via pdf.js) or if page has no objects.
 * Simple implementation here focuses on removing pages with no content streams or very small ones.
 */
export async function cleanPdf(file: File): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const newPdf = await PDFDocument.create();
  
  const indices = pdf.getPageIndices();
  const pagesToKeep: number[] = [];

  for (const index of indices) {
    const page = pdf.getPage(index);
    // Rough check: if there are no operators in the content stream, it's likely empty
    // This is a naive check; a more advanced one would render it or check for images/text
    const contentStream = (page.node as any).Contents();
    if (contentStream) {
      pagesToKeep.push(index);
    }
  }

  if (pagesToKeep.length === 0) {
    // If all pages seem empty, keep at least one
    pagesToKeep.push(0);
  }

  const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);
  copiedPages.forEach(p => newPdf.addPage(p));
  
  return await newPdf.save();
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const isPng = file.type === 'image/png';
    const image = isPng 
      ? await pdfDoc.embedPng(bytes) 
      : await pdfDoc.embedJpg(bytes);
    
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  
  return await pdfDoc.save();
}

export function downloadBlob(data: Uint8Array, fileName: string, type: string) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
