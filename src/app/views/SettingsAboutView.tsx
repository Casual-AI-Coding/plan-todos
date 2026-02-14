'use client';

import { Card, Button } from '@/components/ui';

export function SettingsAboutView() {
  const handleCheckUpdate = () => {
    // TODO: Implement update check
    alert('检查更新功能开发中');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6" style={{ color: '#134E4A' }}>
        设置 &gt; 关于
      </h2>
      
      <Card className="mb-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: '#134E4A' }}>
            Plan Todos
          </h3>
          <p className="text-lg text-gray-600 mb-4">v1.0.0</p>
          <p className="text-gray-500">
            本地优先的跨平台任务管理应用
          </p>
        </div>
      </Card>

      <Card className="mb-6">
        <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>技术栈</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">⚡</span>
            <div>
              <div className="font-medium">Tauri (Rust)</div>
              <div className="text-sm text-gray-500">桌面应用框架</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">⚛️</span>
            <div>
              <div className="font-medium">Next.js (React)</div>
              <div className="text-sm text-gray-500">前端框架</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">🗄️</span>
            <div>
              <div className="font-medium">SQLite</div>
              <div className="text-sm text-gray-500">本地数据库</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">🎨</span>
            <div>
              <div className="font-medium">TypeScript</div>
              <div className="text-sm text-gray-500">类型安全</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-medium mb-4" style={{ color: '#134E4A' }}>其他</h3>
        <div className="space-y-3">
          <Button variant="secondary" className="w-full" onClick={handleCheckUpdate}>
            检查更新
          </Button>
        </div>
      </Card>
    </div>
  );
}
