'use client';

import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  FileText,
  Table as TableIcon
} from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'motion/react';

export default function ExcelToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
        alert('Please select a valid Excel or CSV file.');
        return;
      }
      setFile(selectedFile);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const wb = XLSX.read(arrayBuffer);
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        setSelectedSheet(wb.SheetNames[0]);
      } catch (error) {
        console.error('Error loading Excel:', error);
        alert('Failed to load Excel file.');
      }
    }
  };

  const convertToPdf = async () => {
    if (!workbook || !selectedSheet) return;
    setIsGenerating(true);

    try {
      const worksheet = workbook.Sheets[selectedSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length === 0) {
        alert('The selected sheet is empty.');
        setIsGenerating(false);
        return;
      }

      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for better table fit
      
      const headers = jsonData[0];
      const body = jsonData.slice(1);

      autoTable(doc, {
        head: [headers],
        body: body,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        margin: { top: 20 },
        didDrawPage: (data) => {
          doc.setFontSize(10);
          doc.text(`Sheet: ${selectedSheet}`, data.settings.margin.left, 10);
        }
      });

      doc.save(`${file?.name.split('.')[0] || 'excel'}.pdf`);
    } catch (error) {
      console.error('Error converting to PDF:', error);
      alert('Failed to convert to PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm font-medium opacity-50">
          <Link href="/" className="hover:underline">Home</Link>
          <ArrowRight size={14} />
          <Link href="/tools" className="hover:underline">Tools</Link>
          <ArrowRight size={14} />
          <span className="">Excel to PDF</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Excel to PDF</h1>
          <p className="mt-4 text-lg text-gray-600 ">
            Convert Excel spreadsheets and CSV files into clean, professional PDF tables.
          </p>
        </div>

        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--border)]  bg-[var(--card)] /50 p-12 text-center transition-all hover:border-black dark:hover:border-white cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={onFileChange}
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
            />
            <div className="mb-4 rounded-2xl bg-[var(--card)]  p-4 shadow-sm group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Select Excel File</h3>
            <p className="mt-2 text-sm text-gray-500 ">
              Drag and drop your .xlsx, .xls, or .csv file here
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)]  bg-[var(--card)]  p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <h4 className="font-bold">{file.name}</h4>
                  <p className="text-sm text-gray-500 ">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button 
                onClick={() => {setFile(null); setWorkbook(null);}}
                className="rounded-full p-2 hover:bg-[var(--card)]  "
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-2xl border border-[var(--border)]  bg-[var(--card)]  p-8 shadow-sm">
              <h3 className="mb-6 text-lg font-bold flex items-center gap-2">
                <TableIcon size={20} className="text-[var(--accent)]" />
                Select Sheet
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {sheetNames.map((name) => (
                  <button 
                    key={name}
                    onClick={() => setSelectedSheet(name)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all truncate ${selectedSheet === name ? 'bg-[var(--accent)] text-white border-indigo-600' : 'bg-[var(--card)]  border-[var(--border)]  hover:border-indigo-600'}`}
                    title={name}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={convertToPdf}
                  disabled={isGenerating || !selectedSheet}
                  className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold shadow-lg transition-all hover:opacity-80 disabled:opacity-40" style={{ background: "var(--accent)", color: "var(--accent-fg)" }} className=" dark:bg-[var(--card)] dark:dark:hover:bg-gray-200 sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Converting to PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      Convert to PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">📊</div>
            <h3 className="mb-2 font-bold">Table Formatting</h3>
            <p className="text-sm text-gray-500 ">Automatically converts your spreadsheet data into clean, readable PDF tables.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold">Private & Secure</h3>
            <p className="text-sm text-gray-500 ">Your data stays in your browser. We never upload your spreadsheets to any server.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">⚡</div>
            <h3 className="mb-2 font-bold">Fast Conversion</h3>
            <p className="text-sm text-gray-500 ">Get your PDF document in seconds, perfectly formatted for printing or sharing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
