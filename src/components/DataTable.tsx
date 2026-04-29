import React from 'react';
import { Download, Copy, FileSpreadsheet, Trash2, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExtractedTable } from '../lib/smartProcessor';
import * as XLSX from 'xlsx';

interface DataTableProps {
  tables: ExtractedTable[];
  onUpdateTable: (index: number, updatedTable: ExtractedTable) => void;
  onRemoveTable: (index: number) => void;
}

export function DataTable({ tables, onUpdateTable, onRemoveTable }: DataTableProps) {
  const [editingCell, setEditingCell] = React.useState<{ tableIdx: number, rowIdx: number, key: string } | null>(null);

  const downloadXLSX = (tableIdx: number) => {
    const table = tables[tableIdx];
    if (!table.rows || table.rows.length === 0) {
      alert("No data to export");
      return;
    }

    // Ensure headers are used in correct order
    const headerRow = table.headers;
    const dataRows = table.rows.map(row => table.headers.map(h => row[h] ?? ""));
    
    const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");
    XLSX.writeFile(wb, `extracted_data_${tableIdx + 1}.xlsx`);
  };

  const copyAsTSV = (tableIdx: number) => {
    const table = tables[tableIdx];
    if (!table.rows || table.rows.length === 0) {
      alert("No data to copy");
      return;
    }

    const headers = table.headers.join('\t');
    const rows = table.rows.map(row => 
      table.headers.map(h => String(row[h] ?? '')).join('\t')
    ).join('\n');
    
    const tsv = `${headers}\n${rows}`;
    navigator.clipboard.writeText(tsv).then(() => {
      alert('Table copied to clipboard. You can now paste (Ctrl+V) directly into Google Sheets.');
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  const copyAsCSV = (tableIdx: number) => {
    const table = tables[tableIdx];
    if (!table.rows || table.rows.length === 0) {
      alert("No data to copy");
      return;
    }

    const headers = table.headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',');
    const rows = table.rows.map(row => 
      table.headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    navigator.clipboard.writeText(csv).then(() => {
      alert('Copied as CSV to clipboard');
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  const handleCellEdit = (tableIdx: number, rowIdx: number, key: string, value: string) => {
    const newTables = [...tables];
    const newRows = [...newTables[tableIdx].rows];
    newRows[rowIdx] = { ...newRows[rowIdx], [key]: value };
    onUpdateTable(tableIdx, { ...newTables[tableIdx], rows: newRows });
  };

  if (tables.length === 0) return null;

  return (
    <div className="space-y-12 mt-12 pb-24">
      {tables.map((table, tableIdx) => (
        <motion.div
          key={tableIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#16161A] rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5">
            <div>
              <h3 className="text-white font-semibold text-lg">
                {table.documentType ? `${table.documentType.toUpperCase().replace('_', ' ')}` : `Detected Table ${tableIdx + 1}`}
              </h3>
              <p className="text-white/40 text-sm">{table.rows.length} rows, {table.headers.length} columns</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyAsTSV(tableIdx)}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600/10 hover:bg-green-600/20 text-green-400 text-xs font-semibold rounded-lg border border-green-500/20 transition-all active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy for Sheets
              </button>
              <button
                onClick={() => downloadXLSX(tableIdx)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-semibold rounded-lg border border-blue-500/20 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                XLSX
              </button>
              <button
                onClick={() => copyAsCSV(tableIdx)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-semibold rounded-lg border border-white/10 transition-all active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                CSV
              </button>
              <button
                onClick={() => onRemoveTable(tableIdx)}
                className="p-2 text-white/40 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  {table.headers.map((header) => (
                    <th key={header} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {table.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-white/[0.02] transition-colors group">
                    {table.headers.map((header) => {
                      const isEditing = editingCell?.tableIdx === tableIdx && editingCell?.rowIdx === rowIdx && editingCell?.key === header;
                      return (
                        <td key={header} className="px-6 py-3 text-sm text-white/80 border-r border-white/5 last:border-r-0 max-w-md">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <textarea
                                autoFocus
                                className="bg-white/10 border border-blue-500 rounded px-2 py-1 outline-none text-white w-full min-h-[60px]"
                                defaultValue={String(row[header] || '')}
                                onBlur={(e) => {
                                  handleCellEdit(tableIdx, rowIdx, header, e.target.value);
                                  setEditingCell(null);
                                }}
                              />
                            </div>
                          ) : (
                            <div 
                              className="relative cursor-text group-hover:bg-white/5 transition-colors p-1 -m-1 rounded whitespace-pre-wrap break-words"
                              onClick={() => setEditingCell({ tableIdx, rowIdx, key: header })}
                            >
                              {String(row[header] || '') || <span className="opacity-20 italic">empty</span>}
                              <Edit2 className="w-3 h-3 absolute right-1 top-1 opacity-0 group-hover:opacity-40" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
