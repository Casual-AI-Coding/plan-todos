'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui';
import { exportData, importData, ExportData, ImportMode, ImportResult } from '@/lib/api';

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
      setMessage({ type: 'success', text: '导出成功' });
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
    <div className="space-y-4">
      {/* Export Section */}
      <div>
        <h3 className="font-medium mb-2" style={{ color: '#134E4A' }}>导出数据</h3>
        <p className="text-sm text-gray-500 mb-3">导出所有数据为 JSON 文件</p>
        <Button 
          onClick={handleExport} 
          disabled={exporting}
          variant="secondary"
        >
          {exporting ? '导出中...' : '导出数据 (JSON)'}
        </Button>
      </div>

      {/* Import Section */}
      <div>
        <h3 className="font-medium mb-2" style={{ color: '#134E4A' }}>导入数据</h3>
        <p className="text-sm text-gray-500 mb-3">从 JSON 文件恢复数据</p>
        
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])}
          className="hidden"
        />
        
        <div className="space-y-2 mb-3">
          <label className="block text-sm text-gray-600">导入模式:</label>
          <div className="flex gap-4">
            {(['merge', 'replace', 'update'] as ImportMode[]).map(m => (
              <label key={m} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={mode === m}
                  onChange={() => setMode(m)}
                  className="accent-teal-500"
                />
                <span className="text-sm">
                  {m === 'merge' ? '合并 (跳过重复)' : m === 'replace' ? '替换 (清空后导入)' : '更新 (存在则更新)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Button 
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
        >
          {importing ? '导入中...' : '选择文件导入'}
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
