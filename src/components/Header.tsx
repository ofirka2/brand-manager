import React from 'react';
import { LayoutDashboard, FolderOpen, BookTemplate as FileTemplate, Settings, Bell, Palette, BarChart3 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export default function Header() {
  const { state, dispatch } = useProject();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'brands', label: 'Brands', icon: Palette },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'gantt', label: 'Gantt Chart', icon: BarChart3 },
    { id: 'templates', label: 'Templates', icon: FileTemplate },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">ProjectFlow</h1>
          </div>
          
          <nav className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: item.id as any })}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    state.currentView === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}