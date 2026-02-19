'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { 
  Dashboard, 
  TodosView, 
  PlansView, 
  TargetsView, 
  MilestonesView, 
  ViewsView, 
  StatisticsView, 
  SettingsView,
  SettingsGeneralView,
  SettingsChannelsView,
  SettingsDailySummaryView,
  SettingsAboutView,
  SettingsTagsView,
  CirculationsView,
} from './views';

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
      case 'circulations-today': return <CirculationsView mode="today" />;
      case 'circulations-settings': return <CirculationsView mode="settings" />;
      case 'statistics': return <StatisticsView />;
      case 'settings': return <SettingsGeneralView />;
      case 'settings-general': return <SettingsGeneralView />;
      case 'settings-tags': return <SettingsTagsView />;
      case 'settings-channels': return <SettingsChannelsView />;
      case 'settings-daily-summary': return <SettingsDailySummaryView />;
      case 'settings-about': return <SettingsAboutView />;
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
