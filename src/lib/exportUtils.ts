import * as XLSX from 'xlsx';
import { ExtractedTable } from './smartProcessor';

export function exportToExcel(tables: ExtractedTable[], fileName: string = 'extracted_data.xlsx') {
  const wb = XLSX.utils.book_new();

  tables.forEach((table, index) => {
    // Generate valid sheet name (max 31 chars, no invalid chars)
    let sheetName = table.tableName || `Sheet ${index + 1}`;
    sheetName = sheetName.replace(/[\\/?*[\]]/g, '').substring(0, 31);
    if (!sheetName.trim()) sheetName = `Table ${index + 1}`;

    // Convert rows to worksheet
    // If rows is [{header1: val1, ...}, ...] it works directly
    const ws = XLSX.utils.json_to_sheet(table.rows, { header: table.headers });
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, fileName);
}

export function exportToJSON(data: any, fileName: string = 'data.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToText(text: string, fileName: string = 'document.txt') {
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToWord(text: string, fileName: string = 'document.doc') {
  // Simple HTML structure that Word recognizes as a document
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Exported Document</title></head>
    <body style="font-family: 'Times New Roman', serif;">
      ${text.split('\n').map(p => `<p>${p}</p>`).join('')}
    </body>
    </html>
  `;
  const blob = new Blob([content], { type: 'application/msword' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToCSV(rows: any[], headers: string[], fileName: string = 'export.csv') {
  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function copyToClipboardTSV(tables: ExtractedTable[]) {
  const tsvParts: string[] = [];
  
  tables.forEach(table => {
    // Add table name as a header
    if (table.tableName) {
      tsvParts.push(`--- ${table.tableName.toUpperCase()} ---`);
    }
    
    // Add column headers
    tsvParts.push(table.headers.join('\t'));
    
    // Add rows
    table.rows.forEach(row => {
      const rowValues = table.headers.map(h => {
        const val = row[h];
        return val === undefined || val === null ? '' : String(val).replace(/\t/g, ' ');
      });
      tsvParts.push(rowValues.join('\t'));
    });
    
    // Add spacing between tables
    tsvParts.push('\n');
  });

  const fullTSV = tsvParts.join('\n');
  navigator.clipboard.writeText(fullTSV).then(() => {
    // We can't easily show a toast from here without props, but the action will succeed
    console.log('Copied to clipboard in TSV format');
  });
}
