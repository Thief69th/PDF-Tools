'use client';

import React, { useState, useRef } from 'react';
import { FileSpreadsheet, X, ArrowRight, Loader2, Download, CheckCircle2, AlertCircle, Sparkles, Table } from 'lucide-react';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js`;

const RENDER_SCALE = 150 / 72;

function fmt(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function renderPdfToImages(file: File, onProgress: (msg: string, pct: number) => void): Promise<string[]> {
  onProgress('Loading PDF…', 5);
  const buf = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: buf }).promise;
  const total = pdfDoc.numPages;
  const images: string[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  for (let i = 1; i <= total; i++) {
    onProgress(`Rendering page ${i} of ${total}…`, 5 + Math.round((i / total) * 40));
    const page = await pdfDoc.getPage(i);
    const vp = page.getViewport({ scale: RENDER_SCALE });
    canvas.width  = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    images.push(canvas.toDataURL('image/jpeg', 0.88).split(',')[1]);
  }
  return images;
}

interface SheetData {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}

interface PreviewData {
  sheets: SheetData[];
  activeSheet: number;
}

export default function PdfToExcelPage() {
  const [file, setFile]       = useState<File | null>(null);
  const [progress, setProgress] = useState<{ msg: string; pct: number } | null>(null);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [pages, setPages]     = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { alert('Please select a PDF file.'); return; }
    setFile(f); setDone(false); setError(null); setProgress(null); setPreview(null); setPages(0);
  };
  const drop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') { setFile(f); setDone(false); setError(null); setPreview(null); }
  };

  const convert = async () => {
    if (!file) return;
    setDone(false); setError(null); setPreview(null);
    setProgress({ msg: 'Starting…', pct: 0 });

    try {
      // Step 1: Render PDF pages to images
      const images = await renderPdfToImages(file, (msg, pct) => setProgress({ msg, pct }));
      setPages(images.length);

      // Step 2: Send to API
      setProgress({ msg: `Sending ${images.length} page(s) to AI…`, pct: 48 });
      const res = await fetch('/api/pdf-to-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: images, fileName: file.name }),
      });

      setProgress({ msg: 'AI is extracting tables…', pct: 70 });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'API error');
      }

      const { sheets } = await res.json() as { sheets: SheetData[] };
      setProgress({ msg: 'Building Excel workbook…', pct: 88 });

      // Step 3: Generate Excel file using xlsx
      const wb = XLSX.utils.book_new();

      for (const sheet of sheets) {
        const wsData = [sheet.headers, ...sheet.rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Style header row
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cellRef = XLSX.utils.encode_cell({ r: 0, c });
          if (ws[cellRef]) {
            ws[cellRef].s = { font: { bold: true }, fill: { fgColor: { rgb: 'E0E0E0' } } };
          }
        }

        // Auto column widths
        const colWidths = sheet.headers.map((h, ci) => {
          const maxLen = Math.max(
            h.length,
            ...sheet.rows.map(r => String(r[ci] ?? '').length)
          );
          return { wch: Math.min(Math.max(maxLen + 2, 8), 50) };
        });
        ws['!cols'] = colWidths;

        const sheetName = sheet.name.slice(0, 31).replace(/[*?:\\/\[\]]/g, '_');
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }

      setProgress({ msg: 'Downloading…', pct: 95 });
      XLSX.writeFile(wb, file.name.replace(/\.pdf$/i, '') + '.xlsx');

      setPreview({ sheets, activeSheet: 0 });
      setDone(true);
      setProgress(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Conversion failed.');
      setProgress(null);
    }
  };

  const activeSheet = preview?.sheets[preview.activeSheet];

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-5xl">

        <nav className="mb-8 flex items-center gap-2 text-sm font-medium opacity-50">
          <Link href="/" className="hover:underline">Home</Link>
          <ArrowRight size={14} />
          <Link href="/tools" className="hover:underline">Tools</Link>
          <ArrowRight size={14} />
          <span>PDF to Excel</span>
        </nav>

        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full mb-4"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <Sparkles size={12} /> AI-Powered
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">PDF to Excel</h1>
          <p className="mt-3 text-base opacity-60 max-w-lg mx-auto">
            Extract tables and data from any PDF. Claude AI identifies every table and converts it into a clean, editable .xlsx spreadsheet.
          </p>
        </div>

        {/* How it works */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { step: '①', label: 'Upload PDF',        desc: 'Pages rendered locally' },
            { step: '②', label: 'Claude extracts',   desc: 'AI finds every table' },
            { step: '③', label: 'Download .xlsx',    desc: 'Opens in Excel or Sheets' },
          ].map((s, i) => (
            <div key={i} className="text-center rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-black mb-1" style={{ color: 'var(--accent)' }}>{s.step}</div>
              <p className="font-bold text-xs">{s.label}</p>
              <p className="text-[11px] opacity-50 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Upload */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={drop} onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-16 text-center cursor-pointer transition-all hover:opacity-70"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <input type="file" ref={fileInputRef} onChange={pick} accept="application/pdf" className="hidden" />
            <div className="mb-4 rounded-2xl p-4" style={{ background: 'var(--accent)' }}>
              <FileSpreadsheet className="h-8 w-8" style={{ color: 'var(--accent-fg)' }} />
            </div>
            <p className="font-bold text-lg">Drop PDF here or click to select</p>
            <p className="mt-2 text-sm opacity-50">Works with invoices, reports, bank statements, data tables</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File info */}
            <div className="flex items-center justify-between rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--accent)' }}>
                  <FileSpreadsheet size={18} style={{ color: 'var(--accent-fg)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs opacity-50">{fmt(file.size)}{pages > 0 ? ` · ${pages} pages` : ''}</p>
                </div>
              </div>
              <button onClick={() => { setFile(null); setDone(false); setError(null); setPreview(null); }} className="p-2 rounded-full opacity-50 hover:opacity-100">
                <X size={16} />
              </button>
            </div>

            {/* Progress */}
            {progress && (
              <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between text-xs mb-2 opacity-60">
                  <span className="font-mono">{progress.msg}</span>
                  <span>{progress.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress.pct}%`, background: 'var(--accent)' }} />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Conversion failed</p>
                  <p className="text-xs opacity-70 mt-0.5">{error}</p>
                  {error.includes('API key') && (
                    <p className="text-xs mt-2 opacity-60">→ Add <code className="font-mono">ANTHROPIC_API_KEY</code> to your <code className="font-mono">.env</code> file</p>
                  )}
                </div>
              </div>
            )}

            {/* Success + Preview */}
            {done && preview && (
              <div>
                <div className="flex items-center gap-3 rounded-xl p-4 font-bold mb-3" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                  <CheckCircle2 size={18} />
                  Excel file downloaded! {preview.sheets.length} sheet(s) extracted.
                </div>

                {/* Sheet tabs + table preview */}
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  {/* Tabs */}
                  <div className="flex overflow-x-auto" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
                    {preview.sheets.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setPreview(p => p ? { ...p, activeSheet: i } : p)}
                        className="px-4 py-2.5 text-xs font-semibold shrink-0 transition-all"
                        style={preview.activeSheet === i
                          ? { background: 'var(--accent)', color: 'var(--accent-fg)' }
                          : { color: 'var(--fg)', opacity: 0.6 }
                        }
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>

                  {/* Table preview */}
                  {activeSheet && (
                    <div className="overflow-auto max-h-64" style={{ background: 'var(--bg)' }}>
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr style={{ background: 'var(--card)' }}>
                            {activeSheet.headers.map((h, i) => (
                              <th key={i} className="px-3 py-2 text-left font-bold" style={{ borderBottom: '1px solid var(--border)', color: 'var(--fg)' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {activeSheet.rows.slice(0, 8).map((row, ri) => (
                            <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}>
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-3 py-1.5" style={{ color: 'var(--fg)', opacity: 0.8 }}>
                                  {String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                          {activeSheet.rows.length > 8 && (
                            <tr>
                              <td colSpan={activeSheet.headers.length} className="px-3 py-2 text-center opacity-40 text-[11px]">
                                … {activeSheet.rows.length - 8} more rows in downloaded file
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Convert button */}
            {!done && (
              <button
                onClick={convert}
                disabled={!!progress}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all disabled:opacity-40 hover:opacity-85"
                style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
              >
                {progress
                  ? <><Loader2 className="h-4 w-4 animate-spin" />{progress.msg}</>
                  : <><Sparkles size={16} />Extract Tables with AI</>
                }
              </button>
            )}

            {done && (
              <button
                onClick={() => { setFile(null); setDone(false); setPreview(null); setPages(0); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold opacity-60 hover:opacity-100"
                style={{ border: '1px solid var(--border)' }}
              >
                Convert another PDF
              </button>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📊', title: 'Table Detection',    desc: 'Claude identifies all tables including merged cells and complex layouts.' },
            { icon: '📋', title: 'Multiple Sheets',    desc: 'Each table gets its own sheet. Headers auto-detected and bolded.' },
            { icon: '🔢', title: 'Smart Numbers',      desc: 'Numbers stay as numbers — not text. Ready for formulas immediately.' },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs opacity-60">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
