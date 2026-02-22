'use client';

import { Button, Input } from '@/components/ui';

export interface DataBackupSettingsProps {
  autoBackup: boolean;
  backupPath: string;
  onAutoBackupChange: (value: boolean) => void;
  onBackupPathChange: (value: string) => void;
}

export function DataBackupSettings({
  autoBackup,
  backupPath,
  onAutoBackupChange,
  onBackupPathChange,
}: DataBackupSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="font-medium">自动备份</div>
          <div className="text-sm text-gray-500">每次打开应用时自动备份</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={autoBackup}
            onChange={(e) => onAutoBackupChange(e.target.checked)}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">备份路径</label>
        <div className="flex gap-2">
          <Input 
            value={backupPath}
            onChange={(e) => onBackupPathChange(e.target.value)}
            placeholder="选择备份目录..."
            className="flex-1"
          />
          <Button variant="secondary">浏览</Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1">
          导出数据 (JSON)
        </Button>
        <Button variant="secondary" className="flex-1">
          导入数据
        </Button>
      </div>
    </div>
  );
}
