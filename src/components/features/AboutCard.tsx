'use client';

import packageJson from '../../../package.json';

export function AboutCard() {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">应用名称</span>
        <span className="font-medium">Plan Todos</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">版本</span>
        <span className="font-medium">{packageJson.version}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">构建</span>
        <span className="font-medium">Tauri + Next.js</span>
      </div>
    </div>
  );
}
