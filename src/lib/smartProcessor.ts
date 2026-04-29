import { 
  localClassify, 
  localExtractEntities, 
  localSummarize, 
  localDetectLanguage,
  localExtractTables 
} from './localExtraction';

export interface ExtractedTable {
  tableName?: string;
  headers: string[];
  rows: Record<string, string | number>[];
  documentType?: string;
}

export interface SmartProcessResult {
  classification: string;
  summary: string;
  entities: Record<string, string[]>;
  language: string;
}

/**
 * Intelligent local document processing logic.
 * Uses local regex-based heuristics for summary, classification and entity extraction.
 */
export async function classifyAndSummarize(rawText: string): Promise<SmartProcessResult> {
  // Simulate delay for smooth UI feel without blocking
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    classification: localClassify(rawText),
    summary: localSummarize(rawText),
    entities: localExtractEntities(rawText),
    language: localDetectLanguage(rawText)
  };
}

export async function semanticSearch(rawText: string, query: string): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const q = query.toLowerCase();
  const sentences = rawText.split(/[.!?\n]/).filter(s => s.trim().length > 0);
  return sentences.filter(s => s.toLowerCase().includes(q)).slice(0, 5);
}

export async function extractStructuredData(rawText: string, fileName: string): Promise<ExtractedTable[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (!rawText.trim()) {
    throw new Error("No readable text found in document.");
  }

  return localExtractTables(rawText);
}

