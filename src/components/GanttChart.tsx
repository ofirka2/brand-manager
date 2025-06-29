import React, { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Filter, Eye } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Task } from '../types';
import { formatDate, getDaysUntilDeadline } from '../utils/dateUtils';
import { getPriorityColor, getStatusColor } from '../utils/projectUtils';

interface GanttTask extends Task {
  projectName: string;
  brandName: string;
  brandColor: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  position: number;
  width: number;
}

export default function GanttChart() {
  const { state } = useProject();
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const ganttTasks = useMemo(() => {
    let allTasks = state.projects.flatMap(project => {
      const brand = state.brands.find(b => b.id === project.brandId);
      return project.tasks.map(task => ({
        ...task,
        projectName: project.name,
        brandName: brand?.name || 'Unknown Brand',
        brandColor: brand?.primaryColor || '#3B82F6',
      }));
    });

    // Apply filters
    if (selectedBrand) {
      allTasks = allTasks.filter(task => task.brandName === selectedBrand);
    }
    if (selectedProject) {
      const project = state.projects.find(p => p.name === selectedProject);
      if (project) {
        allTasks = allTasks.filter(task => task.projectId === project.id);
      }
    }

    // Calculate timeline data
    const today = new Date();
    const earliestDate = new Date(Math.min(...allTasks.map(task => new Date(task.createdAt).getTime())));
    const latestDate = new Date(Math.max(...allTasks.map(task => new Date(task.deadline).getTime())));
    
    // Extend timeline by 1 month on each side
    const timelineStart = new Date(earliestDate);
    timelineStart.setMonth(timelineStart.getMonth() - 1);
    const timelineEnd = new Date(latestDate);
    timelineEnd.setMonth(timelineEnd.getMonth() + 1);
    
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));

    return allTasks.map(task => {
      const taskStart = new Date(task.createdAt);
      const taskEnd = new Date(task.deadline);
      const taskDuration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));
      const position = Math.ceil((taskStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
      const width = Math.max(taskDuration, 1); // Minimum 1 day width

      return {
        ...task,
        startDate: taskStart,
        endDate: taskEnd,
        duration: taskDuration,
        position: (position / totalDays) * 100,
        width: (width / totalDays) * 100,
      } as GanttTask;
    }).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [state.projects, state.brands, selectedBrand, selectedProject]);

  const timelineMonths = useMemo(() => {
    if (ganttTasks.length === 0) return [];
    
    const start = new Date(Math.min(...ganttTasks.map(task => task.startDate.getTime())));
    const end = new Date(Math.max(...ganttTasks.map(task => task.endDate.getTime())));
    
    start.setMonth(start.getMonth() - 1);
    end.setMonth(end.getMonth() + 1);
    
    const months = [];
    const current = new Date(start);
    current.setDate(1);
    
    while (current <= end) {
      months.push({
        date: new Date(current),
        label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      });
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  }, [ganttTasks]);

  const TaskBar = ({ task }: { task: GanttTask }) => {
    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'Completed';
    const isCompleted = task.status === 'Completed';
    
    return (
      <div
        className={`absolute h-6 rounded-sm border-l-4 flex items-center px-2 text-xs font-medium text-white shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
          isCompleted ? 'opacity-75' : ''
        }`}
        style={{
          left: `${task.position}%`,
          width: `${Math.max(task.width, 8)}%`,
          backgroundColor: isOverdue ? '#EF4444' : task.brandColor,
          borderLeftColor: isCompleted ? '#10B981' : isOverdue ? '#DC2626' : task.brandColor,
        }}
        title={`${task.subject} - ${task.projectName} (${formatDate(task.deadline)})`}
      >
        <span className="truncate">{task.subject}</span>
      </div>
    );
  };

  const projects = [...new Set(state.projects.map(p => p.name))];
  const brands = [...new Set(state.brands.map(b => b.name))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gantt Chart</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>
      </div>

      {ganttTasks.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks to display</h3>
          <p className="text-gray-600">
            {state.projects.length === 0 
              ? 'Create projects and tasks to see them in the Gantt chart.'
              : 'No tasks match your current filters.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Timeline Header */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              <div className="w-80 px-4 py-3 border-r border-gray-200">
                <h3 className="font-semibold text-gray-900">Task</h3>
              </div>
              <div className="flex-1 relative">
                <div className="flex h-12">
                  {timelineMonths.map((month, index) => (
                    <div
                      key={index}
                      className="flex-1 border-r border-gray-200 px-2 py-3 text-center text-sm font-medium text-gray-700"
                    >
                      {month.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gantt Rows */}
          <div className="max-h-96 overflow-y-auto">
            {ganttTasks.map((task, index) => (
              <div key={task.id} className={`flex border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="w-80 px-4 py-3 border-r border-gray-200">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: task.brandColor }}
                      ></div>
                      <h4 className="font-medium text-gray-900 text-sm truncate">{task.subject}</h4>
                    </div>
                    <div className="text-xs text-gray-600">
                      {task.projectName} • {task.brandName}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative py-3">
                  <TaskBar task={task} />
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                  <span className="text-gray-600">On Track</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                  <span className="text-gray-600">Overdue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-sm opacity-75"></div>
                  <span className="text-gray-600">Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-l-4 border-green-500 bg-gray-200 rounded-sm"></div>
                  <span className="text-gray-600">Completed Task</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Showing {ganttTasks.length} task{ganttTasks.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Summary */}
      {ganttTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{ganttTasks.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {ganttTasks.filter(t => t.status === 'Completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {ganttTasks.filter(t => t.status === 'In Progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">
              {ganttTasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'Completed').length}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
        </div>
      )}
    </div>
  );
}