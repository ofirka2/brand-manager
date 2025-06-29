import React, { useMemo, useState } from 'react';
import { X, DollarSign, Target, FolderOpen, CheckCircle, AlertTriangle, Calendar, TrendingUp, Users, Clock, Edit2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Brand, Project, Task } from '../types';
import { calculateProjectProgress, getPriorityColor, getStatusColor } from '../utils/projectUtils';
import { formatDate, isOverdue, getDaysUntilDeadline } from '../utils/dateUtils';
import CreateBrandModal from './CreateBrandModal';

interface BrandDetailModalProps {
  brand: Brand;
  onClose: () => void;
}

export default function BrandDetailModal({ brand, onClose }: BrandDetailModalProps) {
  const { state, dispatch } = useProject();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'tasks' | 'analytics'>('overview');

  const brandData = useMemo(() => {
    const brandProjects = state.projects.filter(p => p.brandId === brand.id);
    const allTasks = brandProjects.flatMap(p => p.tasks);
    
    const completedTasks = allTasks.filter(t => t.status === 'Completed');
    const inProgressTasks = allTasks.filter(t => t.status === 'In Progress');
    const overdueTasks = allTasks.filter(t => isOverdue(t.deadline) && t.status !== 'Completed');
    const upcomingTasks = allTasks.filter(t => {
      const days = getDaysUntilDeadline(t.deadline);
      return days >= 0 && days <= 7 && t.status !== 'Completed';
    });

    const totalEstimatedHours = allTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalActualHours = allTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

    const priorityBreakdown = {
      Urgent: allTasks.filter(t => t.priority === 'Urgent').length,
      High: allTasks.filter(t => t.priority === 'High').length,
      Medium: allTasks.filter(t => t.priority === 'Medium').length,
      Low: allTasks.filter(t => t.priority === 'Low').length,
    };

    const categoryBreakdown = allTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completionRate = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;
    const averageProjectProgress = brandProjects.length > 0 
      ? Math.round(brandProjects.reduce((sum, project) => sum + calculateProjectProgress(project), 0) / brandProjects.length)
      : 0;

    return {
      projects: brandProjects,
      allTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      upcomingTasks,
      totalEstimatedHours,
      totalActualHours,
      priorityBreakdown,
      categoryBreakdown,
      completionRate,
      averageProjectProgress,
    };
  }, [state.projects, brand.id]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </div>
  );

  const ProjectCard = ({ project }: { project: Project }) => {
    const progress = calculateProjectProgress(project);
    const overdueTasks = project.tasks.filter(t => isOverdue(t.deadline) && t.status !== 'Completed').length;
    
    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900">{project.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{progress}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                backgroundColor: brand.primaryColor
              }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>{project.tasks.length} tasks</span>
            <span>{project.tasks.filter(t => t.status === 'Completed').length} completed</span>
          </div>
          {overdueTasks > 0 && (
            <span className="text-red-600 font-medium">{overdueTasks} overdue</span>
          )}
        </div>
      </div>
    );
  };

  const TaskRow = ({ task }: { task: Task }) => {
    const project = brandData.projects.find(p => p.id === task.projectId);
    const daysUntil = getDaysUntilDeadline(task.deadline);
    const taskOverdue = isOverdue(task.deadline);
    
    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-medium text-gray-900">{task.subject}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{project?.name}</span>
              <span>•</span>
              <span>{task.category}</span>
              <span>•</span>
              <span>{task.contact.name}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${taskOverdue ? 'text-red-600' : daysUntil <= 7 ? 'text-orange-600' : 'text-gray-600'}`}>
              {taskOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Due: {formatDate(task.deadline)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-screen overflow-y-auto">
          {/* Header with brand colors */}
          <div 
            className="h-4"
            style={{ 
              background: `linear-gradient(90deg, ${brand.primaryColor} 0%, ${brand.secondaryColor} 100%)` 
            }}
          ></div>
          
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: brand.accentColor }}
              ></div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{brand.name}</h2>
                <p className="text-gray-600">{brand.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Budget and Sales Goal Overview */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Budget Allocation</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ${brand.budget.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Total allocated budget for {brand.name}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Sales Target</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ${brand.salesGoal.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Revenue target for {brand.name}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Projects"
                    value={brandData.projects.length}
                    icon={FolderOpen}
                    color="bg-blue-500"
                  />
                  <StatCard
                    title="Total Tasks"
                    value={brandData.allTasks.length}
                    icon={CheckCircle}
                    color="bg-green-500"
                  />
                  <StatCard
                    title="Completion Rate"
                    value={`${brandData.completionRate}%`}
                    icon={TrendingUp}
                    color="bg-purple-500"
                    subtitle={`${brandData.completedTasks.length} of ${brandData.allTasks.length} completed`}
                  />
                  <StatCard
                    title="Overdue Tasks"
                    value={brandData.overdueTasks.length}
                    icon={AlertTriangle}
                    color="bg-red-500"
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Project Progress</h4>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {brandData.averageProjectProgress}%
                    </div>
                    <div className="text-sm text-gray-600">Average across all projects</div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Upcoming Deadlines</h4>
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {brandData.upcomingTasks.length}
                    </div>
                    <div className="text-sm text-gray-600">Due within 7 days</div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Time Tracking</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {brandData.totalEstimatedHours}h
                    </div>
                    <div className="text-sm text-gray-600">
                      Estimated ({brandData.totalActualHours}h actual)
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Recent Tasks</h4>
                  <div className="space-y-3">
                    {brandData.allTasks
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .slice(0, 5)
                      .map(task => (
                        <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: brand.primaryColor }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">{task.subject}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(task.updatedAt)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Projects ({brandData.projects.length})
                  </h3>
                </div>
                
                {brandData.projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>No projects found for this brand.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {brandData.projects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    All Tasks ({brandData.allTasks.length})
                  </h3>
                </div>
                
                {brandData.allTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>No tasks found for this brand.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {brandData.allTasks
                      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                      .map(task => (
                        <TaskRow key={task.id} task={task} />
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Priority Breakdown */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Tasks by Priority</h4>
                    <div className="space-y-3">
                      {Object.entries(brandData.priorityBreakdown).map(([priority, count]) => (
                        <div key={priority} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(priority)}`}>
                              {priority}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Tasks by Category</h4>
                    <div className="space-y-3">
                      {Object.entries(brandData.categoryBreakdown)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 6)
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{category}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{ 
                                    width: `${(count / brandData.allTasks.length) * 100}%`,
                                    backgroundColor: brand.primaryColor
                                  }}
                                ></div>
                              </div>
                              <span className="font-medium text-gray-900 text-sm w-8">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Financial Overview */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Financial Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        ${brand.budget.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Budget</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        ${brand.salesGoal.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Sales Target</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {brand.salesGoal > 0 ? Math.round((brand.salesGoal / brand.budget) * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-600">ROI Target</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <CreateBrandModal
          brand={brand}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}