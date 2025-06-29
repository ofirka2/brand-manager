import React from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Brands from './components/Brands';
import Projects from './components/Projects';
import GanttChart from './components/GanttChart';
import Templates from './components/Templates';
import Settings from './components/Settings';

function AppContent() {
  const { state } = useProject();

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'brands':
        return <Brands />;
      case 'projects':
        return <Projects />;
      case 'gantt':
        return <GanttChart />;
      case 'templates':
        return <Templates />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;