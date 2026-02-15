'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui';
import { exportData, importData, ExportData, ImportMode, ImportResult } from '@/lib/api';

// Icons as simple SVG components
const ExportIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const ImportIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

interface ImportModeOption {
  value: ImportMode;
  label: string;
  description: string;
}

const importModes: ImportModeOption[] = [
  { value: 'merge', label: '合并', description: '跳过重复数据' },
  { value: 'replace', label: '替换', description: '清空后导入' },
  { value: 'update', label: '更新', description: '存在则更新' },
];

export function ImportExportView() {
  const [mode, setMode] = useState<ImportMode>('update');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    setMessage(null);
    try {
      const data = await exportData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plan-todos-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: `导出成功！共 ${data.data.todos.length + data.data.tasks.length + data.data.plans.length} 条数据` });
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: `导出失败: ${e instanceof Error ? e.message : String(e)}` });
    }
    setExporting(false);
  }

  async function handleImport(file: File) {
    setImporting(true);
    setMessage(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;
      const result = await importData(data, mode) as ImportResult;
      
      if (result.errors && result.errors.length > 0) {
        setMessage({ type: 'error', text: `导入完成: ${result.imported} 条, 跳过: ${result.skipped} 条, 错误: ${result.errors.length} 个` });
      } else {
        setMessage({ type: 'success', text: `导入完成: ${result.imported} 条, 跳过: ${result.skipped} 条` });
      }
      
      // Reload the page to refresh data
      if (result.imported > 0) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: `导入失败: ${e instanceof Error ? e.message : String(e)}` });
    }
    setImporting(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
            <ExportIcon />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">导出数据</h3>
            <p className="text-sm text-gray-500 mb-3">将所有数据导出为 JSON 文件，可用于备份或迁移</p>
            
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <InfoIcon />
              <span>导出包含: Todos, Tasks, Plans, Targets, Steps, Milestones, Tags, Settings</span>
            </div>
            
            <Button 
              onClick={handleExport} 
              disabled={exporting}
              variant="secondary"
              className="gap-2"
            >
              <ExportIcon />
              {exporting ? '导出中...' : '导出数据'}
            </Button>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <ImportIcon />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">导入数据</h3>
            <p className="text-sm text-gray-500 mb-3">从 JSON 备份文件恢复数据</p>
            
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])}
              className="hidden"
            />
            
            {/* Import Mode Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">导入模式:</label>
              <div className="grid grid-cols-3 gap-2">
                {importModes.map(m => (
                  <label 
                    key={m.value}
                    className={`relative flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      mode === m.value 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="importMode"
                        checked={mode === m.value}
                        onChange={() => setMode(m.value)}
                        className="sr-only"
                      />
                      <span className={`text-sm font-medium ${mode === m.value ? 'text-teal-700' : 'text-gray-700'}`}>
                        {m.label}
                      </span>
                      {mode === m.value && (
                        <div className="ml-auto text-teal-500">
                          <CheckIcon />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{m.description}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button 
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="gap-2"
            >
              <ImportIcon />
              {importing ? '导入中...' : '选择文件导入'}
            </Button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-start gap-2 p-4 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex-shrink-0 mt-0.5">
            {message.type === 'success' ? <CheckIcon /> : <AlertIcon />}
          </div>
          <div>{message.text}</div>
        </div>
      )}
    </div>
  );
}
