import { ExtractedTable } from './smartProcessor';

export function localClassify(text: string): string {
  const t = text.toLowerCase();
  // Invoice detection: common keywords
  if (/invoice|bill to|purchase order|due date|total amount|tax id|vat/i.test(t)) return 'Invoice';
  // CV detection: common keywords
  if (/resume|curriculum vitae|experience|education|skills|certifications|projects/i.test(t)) return 'Resume';
  // Contract detection: common keywords
  if (/contract|agreement|terms and conditions|liability|indemnity|governing law/i.test(t)) return 'Contract';
  // Report detection: common keywords
  if (/report|summary|analysis|conclusion|overview|findings/i.test(t)) return 'Report';
  return 'Other';
}

export function localExtractEntities(text: string): Record<string, string[]> {
  const emailRegex = /[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/g;
  const addressRegex = /\d{1,5}\s+[a-zA-Z0-9\s.,]{10,50}(?:\d{5}|[A-Z]{2})/g; // Very basic address regex
  const linkRegex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
  const dateRegex = /\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})|(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2})|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/gi;
  
  // Basic Name Detection (Title Case sequences of 2-3 words)
  const nameHeuristicRegex = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2}\b/g;

  // Advanced Phone Detection Logic
  const extractPhones = (input: string): string[] => {
    const phones: string[] = [];
    
    // 1. Broad detection of potential numeric sequences including separators
    // Matches patterns that look like phone numbers (digits with spaces, dots, dashes, parentheses)
    const potentialPatterns = input.match(/(?:\+?\d[\d\s.\-()]{6,25}\d)/g) || [];
    
    potentialPatterns.forEach(pattern => {
      // 2. Normalize: Remove all common separators
      // Keep leading plus if it exists. 
      const isLeadingPlus = pattern.startsWith('+');
      const digitsOnly = pattern.replace(/[^\d]/g, '');
      const cleaned = isLeadingPlus ? '+' + digitsOnly : digitsOnly;
      
      // 3. Validation Rules
      const numericLength = cleaned.replace('+', '').length;
      
      // Rule: Digit count between 8 and 15
      if (numericLength >= 8 && numericLength <= 15) {
        // Rule: Start validation
        const startsWithValidPrefix = 
          cleaned.startsWith('+') || 
          cleaned.startsWith('00') ||
          cleaned.startsWith('06') || 
          cleaned.startsWith('07') || 
          cleaned.startsWith('05');
          
        if (startsWithValidPrefix) {
          phones.push(cleaned);
        } else {
          // Rule: Context check - check surroundings for keywords
          // This is useful for numbers that don't start with standard prefixes but have labels
          const index = input.indexOf(pattern);
          const precedingText = input.substring(Math.max(0, index - 30), index).toLowerCase();
          const contextKeywords = ['phone', 'tel', 'mobile', 'contact', 'gsm', 'call', 'téléphone'];
          
          if (contextKeywords.some(key => precedingText.includes(key))) {
            phones.push(cleaned);
          }
        }
      }
    });
    
    return Array.from(new Set(phones));
  };

  return {
    emails: Array.from(new Set(text.match(emailRegex) || [])),
    phones: extractPhones(text),
    addresses: Array.from(new Set(text.match(addressRegex) || [])),
    links: Array.from(new Set(text.match(linkRegex) || [])),
    dates: Array.from(new Set(text.match(dateRegex) || [])),
    names: Array.from(new Set(text.match(nameHeuristicRegex) || [])).filter(n => !/January|February|March|April|May|June|July|August|September|October|November|December/i.test(n))
  };
}

export function localSummarize(text: string): string {
  const sentences = text.split(/[.!?\n]/).map(s => s.trim()).filter(s => s.length > 30);
  if (sentences.length === 0) return "General extracted content from the document.";
  
  // Pick the first few significant sentences
  return sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '.');
}

export function localDetectLanguage(text: string): string {
  // Simple word count based detection for common languages
  const commonWords: Record<string, string[]> = {
    'English': ['the', 'and', 'with', 'for'],
    'French': ['le', 'la', 'les', 'et', 'dans'],
    'Spanish': ['el', 'la', 'los', 'y', 'en'],
    'German': ['der', 'die', 'das', 'und', 'mit']
  };

  const words = text.toLowerCase().split(/\s+/);
  let bestLang = 'English';
  let maxCount = 0;

  for (const [lang, list] of Object.entries(commonWords)) {
    const count = words.filter(w => list.includes(w)).length;
    if (count > maxCount) {
      maxCount = count;
      bestLang = lang;
    }
  }

  return bestLang;
}

export function localExtractTables(text: string): ExtractedTable[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const tables: ExtractedTable[] = [];

  // Categorize based on content context
  const docType = localClassify(text);

  if (docType === 'Invoice') {
    // Try to extract line items
    const lineItemsArray = lines.filter(l => 
      /\d+\.?\d*/.test(l) && // contains some digits
      /(\d+[.,]\d{2})/.test(l) // looks like price
    );
    
    if (lineItemsArray.length > 0) {
      tables.push({
        tableName: "Detected Line Items",
        headers: ["Description", "Amount"],
        rows: lineItemsArray.map(l => {
          const amountMatch = l.match(/(\d+[.,]\d{2})/);
          const amount = amountMatch ? amountMatch[0] : '';
          const desc = l.replace(amount, '').trim();
          return { "Description": desc, "Amount": amount };
        }),
        documentType: 'invoice'
      });
    }
  }

  if (docType === 'Resume') {
    const sections = text.split(/(Experience|Education|Skills|Projects)/i);
    const resumeRows = [];
    for (let i = 1; i < sections.length; i += 2) {
      resumeRows.push({
        "Section": sections[i],
        "Content Preview": (sections[i + 1] || '').substring(0, 150).trim() + '...'
      });
    }
    
    if (resumeRows.length > 0) {
      tables.push({
        tableName: "Resume Components",
        headers: ["Section", "Content Preview"],
        rows: resumeRows,
        documentType: 'resume'
      });
    }
  }

  // Generic table detection (Grid detector)
  const potentialTables: string[][] = [];
  let currentGroup: string[] = [];

  for (const line of lines) {
    const parts = line.split(/\s{3,}|\t|\|/).filter(p => p.trim().length > 0);
    if (parts.length >= 2) {
      currentGroup.push(line);
    } else {
      if (currentGroup.length >= 3) potentialTables.push([...currentGroup]);
      currentGroup = [];
    }
  }
  if (currentGroup.length >= 3) potentialTables.push(currentGroup);

  potentialTables.forEach((group, idx) => {
    const rows = group.map(line => {
      return line.split(/\s{3,}|\t|\|/).filter(p => p.trim().length > 0);
    });

    const maxCols = Math.max(...rows.map(r => r.length));
    const headers = Array.from({ length: maxCols }, (_, i) => rows[0][i] || `Col ${i + 1}`);

    const tableRows = rows.slice(1).map(r => {
      const rowObj: Record<string, string> = {};
      headers.forEach((h, i) => {
        rowObj[h] = r[i] || '';
      });
      return rowObj;
    });

    tables.push({
      tableName: `Structured Table ${idx + 1}`,
      headers,
      rows: tableRows
    });
  });

  // Final Fallback
  if (tables.length === 0) {
    tables.push({
      tableName: "Document Text Data",
      headers: ["Lines"],
      rows: lines.slice(0, 50).map(l => ({ "Lines": l }))
    });
  }

  return tables;
}
