import React, { useMemo } from 'react';
import { AlertTriangle, Calendar, CheckCircle, Clock, TrendingUp, Palette, DollarSign, Target } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Task } from '../types';
import { isOverdue, getDaysUntilDeadline, getTasksByDeadline } from '../utils/dateUtils';
import { calculateProjectProgress, getOverdueTasks, sortTasksByDeadline, getPriorityColor, getStatusColor } from '../utils/projectUtils';
import TaskFilters from './TaskFilters';

export default function Dashboard() {
  const { state } = useProject();

  const allTasks = useMemo(() => {
    return state.projects.flatMap(project => {
      const brand = state.brands.find(b => b.id === project.brandId);
      return project.tasks.map(task => ({ 
        ...task, 
        projectName: project.name, 
        brandName: brand?.name || 'Unknown Brand',
        brandColor: brand?.primaryColor || '#3B82F6'
      }));
    });
  }, [state.projects, state.brands]);

  const filteredTasks = useMemo(() => {
    let filtered = [...allTasks];

    if (state.filters.priority.length > 0) {
      filtered = filtered.filter(task => state.filters.priority.includes(task.priority));
    }
    if (state.filters.status.length > 0) {
      filtered = filtered.filter(task => state.filters.status.includes(task.status));
    }
    if (state.filters.category.length > 0) {
      filtered = filtered.filter(task => state.filters.category.includes(task.category));
    }
    if (state.filters.brand.length > 0) {
      filtered = filtered.filter(task => {
        const project = state.projects.find(p => p.id === task.projectId);
        const brand = state.brands.find(b => b.id === project?.brandId);
        return brand && state.filters.brand.includes(brand.name);
      });
    }
    if (state.filters.dateRange) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.deadline);
        const startDate = new Date(state.filters.dateRange!.start);
        const endDate = new Date(state.filters.dateRange!.end);
        return taskDate >= startDate && taskDate <= endDate;
      });
    }

    return sortTasksByDeadline(filtered);
  }, [allTasks, state.filters, state.projects, state.brands]);

  const stats = useMemo(() => {
    const overdueTasks = getOverdueTasks(allTasks);
    const upcomingTasks7Days = getTasksByDeadline(allTasks, 7);
    const upcomingTasks30Days = getTasksByDeadline(allTasks, 30);
    const completedTasks = allTasks.filter(task => task.status === 'Completed');
    
    return {
      total: allTasks.length,
      overdue: overdueTasks.length,
      upcoming7Days: upcomingTasks7Days.length,
      upcoming30Days: upcomingTasks30Days.length,
      completed: completedTasks.length,
      completionRate: allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0,
    };
  }, [allTasks]);

  const brandStats = useMemo(() => {
    return state.brands.map(brand => {
      const brandProjects = state.projects.filter(p => p.brandId === brand.id);
      const brandTasks = brandProjects.flatMap(p => p.tasks);
      const completedTasks = brandTasks.filter(t => t.status === 'Completed');
      
      return {
        ...brand,
        projectsCount: brandProjects.length,
        tasksCount: brandTasks.length,
        completedTasks: completedTasks.length,
        completionRate: brandTasks.length > 0 ? Math.round((completedTasks.length / brandTasks.length) * 100) : 0,
      };
    });
  }, [state.brands, state.projects]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={CheckCircle}
          color="bg-blue-500"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          color="bg-red-500"
        />
        <StatCard
          title="Due in 7 Days"
          value={stats.upcoming7Days}
          icon={Calendar}
          color="bg-orange-500"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={TrendingUp}
          color="bg-green-500"
          subtitle={`${stats.completed} of ${stats.total} completed`}
        />
      </div>

      {/* Brand Overview */}
      {state.brands.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandStats.map(brand => (
              <div key={brand.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: brand.primaryColor }}
                  ></div>
                  <h4 className="font-medium text-gray-900">{brand.name}</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">${brand.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600">${brand.salesGoal.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {brand.projectsCount} projects • {brand.tasksCount} tasks
                </div>
                
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs font-medium text-gray-900">{brand.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${brand.completionRate}%`,
                      backgroundColor: brand.primaryColor
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
        <div className="space-y-4">
          {state.projects.map(project => {
            const progress = calculateProjectProgress(project);
            const brand = state.brands.find(b => b.id === project.brandId);
            return (
              <div key={project.id} className="flex items-center space-x-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand?.primaryColor || '#3B82F6' }}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{project.name}</span>
                      {brand && <span className="text-xs text-gray-500 ml-2">({brand.name})</span>}
                    </div>
                    <span className="text-sm text-gray-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: brand?.primaryColor || '#3B82F6'
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{project.tasks.length} tasks</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Filters */}
      <TaskFilters />

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Tasks</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredTasks.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No tasks match your current filters.
            </div>
          ) : (
            filteredTasks.map(task => {
              const daysUntil = getDaysUntilDeadline(task.deadline);
              const overdue = isOverdue(task.deadline);
              
              return (
                <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: (task as any).brandColor }}></div>
                        <h4 className="text-lg font-medium text-gray-900">{task.subject}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{task.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{(task as any).projectName}</span>
                        <span>•</span>
                        <span>{(task as any).brandName}</span>
                        <span>•</span>
                        <span>{task.category}</span>
                        <span>•</span>
                        <span>{task.contact.name} ({task.contact.role})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center space-x-2 ${overdue ? 'text-red-600' : daysUntil <= 7 ? 'text-orange-600' : 'text-gray-600'}`}>
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {overdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}