
import { getPdfDocument, extractPdfPageText, processFile } from './documentProcessor';
import { extractStructuredData, ExtractedTable } from './smartProcessor';
import { ProcessingState, ProcessingPage } from '../types';

export class QueueProcessor {
  private state: ProcessingState;
  private onProgress: (state: ProcessingState) => void;
  private isProcessing: boolean = false;
  private isCanceled: boolean = false;

  constructor(fileName: string, onProgress: (state: ProcessingState) => void) {
    this.onProgress = onProgress;
    this.state = {
      fileName,
      totalPages: 0,
      processedPages: 0,
      status: 'analyzing',
      pages: []
    };
    this.updateProgress();
  }

  private updateProgress() {
    this.onProgress({ ...this.state });
  }

  public stop() {
    this.isCanceled = true;
    this.state.status = 'error';
    this.updateProgress();
  }

  public async start(file: File) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.isCanceled = false;

    try {
      this.state.status = 'analyzing';
      this.updateProgress();

      const extension = file.name.split('.').pop()?.toLowerCase();
      let pdf: any = null;
      let chunks: string[] = [];

      if (extension === 'pdf') {
        pdf = await getPdfDocument(file);
        this.state.totalPages = pdf.numPages;
        // Initialize empty pages first
        this.state.pages = Array.from({ length: pdf.numPages }, (_, i) => ({
          id: crypto.randomUUID(),
          pageNumber: i + 1,
          status: 'pending',
          rawText: '',
          tables: []
        }));
      } else {
        chunks = await processFile(file);
        this.state.totalPages = chunks.length;
        this.state.pages = chunks.map((chunk, index) => ({
          id: crypto.randomUUID(),
          pageNumber: index + 1,
          status: 'pending',
          rawText: chunk,
          tables: []
        }));
      }

      this.state.status = 'processing';
      this.updateProgress();

      for (let i = 0; i < this.state.pages.length; i++) {
        if (this.isCanceled) break;

        const page = this.state.pages[i];
        page.status = 'processing';
        this.updateProgress();

        let pageSuccess = false;
        let pageAttempts = 0;
        const MAX_PAGE_RETRIES = 2;

        while (!pageSuccess && pageAttempts <= MAX_PAGE_RETRIES) {
          try {
            if (this.isCanceled) break;
            
            // If PDF, extract text for THIS page now (Lazy loading / JIT)
            if (pdf) {
              this.state.currentAction = `Extracting text: Page ${page.pageNumber}...`;
              this.updateProgress();

              page.rawText = await extractPdfPageText(pdf, page.pageNumber, (msg) => {
                this.state.currentAction = msg;
                this.updateProgress();
              }, this.state.fileName);
            }

            if (this.isCanceled) break;

            this.state.currentAction = `Expert analysis: Page ${page.pageNumber}...`;
            this.updateProgress();

            // Process with intelligent extraction
            const result = await extractStructuredData(page.rawText, this.state.fileName);
            
            if (result && result.length > 0) {
              page.tables = result;
            } else {
              page.tables = [{
                tableName: `Captured Text - Page ${page.pageNumber}`,
                headers: ['Content'],
                rows: [{ 'Content': page.rawText }]
              }];
            }
            
            page.status = 'completed';
            pageSuccess = true;
          } catch (error) {
            pageAttempts++;
            console.error(`Page ${page.pageNumber} failure (Attempt ${pageAttempts}):`, error);
            
            if (pageAttempts > MAX_PAGE_RETRIES) {
              page.status = 'error';
              page.error = error instanceof Error ? error.message : 'Persistent extraction failure';
              page.tables = [{
                tableName: `Fallback View - Page ${page.pageNumber}`,
                headers: ['Extracted Text'],
                rows: [{ 'Extracted Text': page.rawText || '[Processing Error]' }]
              }];
            } else {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 500 * pageAttempts));
            }
          }
        }

        this.state.processedPages++;
        this.updateProgress();

        // Proactively yield to UI thread AND avoid hitting rate limits too fast
        // Increased from 150ms to 400ms for better stability with free tier
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      if (this.isCanceled) {
        this.state.status = 'error';
      } else {
        this.state.status = 'completed';
      }
      this.updateProgress();

      // Cleanup large PDF object
      if (pdf) {
        await pdf.destroy();
      }
    } catch (error) {
      if (!this.isCanceled) {
        this.state.status = 'error';
        console.error('Queue Processing failed:', error);
        this.updateProgress();
      }
    } finally {
      this.isProcessing = false;
    }
  }

  public getState() {
    return this.state;
  }
}
