'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
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
  CirculationDetailView,
} from './views';

// Main App
export default function Home() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [circulationDetailId, setCirculationDetailId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

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
      case 'circulations':
      case 'circulations-today': return (
        <CirculationsView 
          mode="today" 
          onNavigate={(id) => setCirculationDetailId(id)} 
        />
      );
      case 'circulations-settings': return (
        <CirculationsView 
          mode="settings" 
          onNavigate={(id) => setCirculationDetailId(id)} 
        />
      );
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
    <div className="flex h-screen" style={{ background: 'transparent', fontFamily: 'var(--font-sans)' }}>
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block fixed left-0 top-0 h-screen z-40">
        <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} onCollapseChange={setSidebarCollapsed} />
      </div>
      
      {/* Main Content - with padding for sidebar on desktop */}
      <main 
        className="flex-1 overflow-auto pb-16 md:pb-0" 
        style={{ 
          backgroundColor: 'var(--color-bg)',
          marginLeft: sidebarCollapsed ? '4rem' : '13rem',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {renderContent()}
      </main>
      
      {/* Mobile Bottom Nav - hidden on desktop */}
      <BottomNav activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      
      {/* Circulation Detail Modal */}
      {circulationDetailId && (
        <CirculationDetailView
          id={circulationDetailId}
          onClose={() => setCirculationDetailId(null)}
        />
      )}
    </div>
  );
}
