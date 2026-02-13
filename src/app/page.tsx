'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard, TodosView, StatisticsView, SettingsView } from './views';

// Plans View - TODO: Extract to views/PlansView.tsx
function PlansView() {
  return <div className="p-6"><h2 className="text-2xl font-semibold">Plans</h2><p>Plans view component needs to be extracted.</p></div>;
}

// Targets View - TODO: Extract to views/TargetsView.tsx  
function TargetsView() {
  return <div className="p-6"><h2 className="text-2xl font-semibold">Targets</h2><p>Targets view component needs to be extracted.</p></div>;
}

// Milestones View - TODO: Extract to views/MilestonesView.tsx
function MilestonesView() {
  return <div className="p-6"><h2 className="text-2xl font-semibold">Milestones</h2><p>Milestones view component needs to be extracted.</p></div>;
}

// Views View - TODO: Extract to views/ViewsView.tsx
function ViewsView() {
  return <div className="p-6"><h2 className="text-2xl font-semibold">Views</h2><p>Views view component needs to be extracted.</p></div>;
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
