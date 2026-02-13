'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard, TodosView, PlansView, TargetsView, MilestonesView, StatisticsView, SettingsView } from './views';

// Views View - TODO: Extract to views/ViewsView.tsx (large component with 4 sub-views)
function ViewsView() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4" style={{ color: '#134E4A' }}>视图查看</h2>
      <div className="text-gray-500">
        <p>ViewsView component contains 4 sub-view renderers (List, Board, Calendar, Gantt)</p>
        <p className="mt-2">This is a large component (~880 lines) that should be further split.</p>
      </div>
    </div>
  );
}

// Main App
export default function Home() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <Dashboard />;
      case 'todos':
      case 'todos-all':
      case 'todos-today':
      case 'todos-upcoming':
      case 'todos-completed': return <TodosView />;
      case 'plans':
      case 'plans-active':
      case 'plans-archived': return <PlansView />;
      case 'goals':
      case 'goals-active':
      case 'goals-completed': return <TargetsView />;
      case 'milestones': return <MilestonesView />;
      case 'views': return <ViewsView />;
      case 'statistics': return <StatisticsView />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F0FDFA', fontFamily: 'Fira Sans, sans-serif' }}>
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
