import React, { useState } from 'react';
import { Plus, Search, FolderOpen, Calendar, Users, MoreHorizontal, Palette } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Project } from '../types';
import { calculateProjectProgress } from '../utils/projectUtils';
import CreateProjectModal from './CreateProjectModal';
import ProjectDetailModal from './ProjectDetailModal';

export default function Projects() {
  const { state, dispatch } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = state.projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ProjectCard = ({ project }: { project: Project }) => {
    const progress = calculateProjectProgress(project);
    const completedTasks = project.tasks.filter(task => task.status === 'Completed').length;
    const overdueTasks = project.tasks.filter(task => {
      const deadline = new Date(task.deadline);
      return deadline < new Date() && task.status !== 'Completed';
    }).length;

    const brand = state.brands.find(b => b.id === project.brandId);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {brand && (
          <div 
            className="h-3"
            style={{ 
              background: `linear-gradient(90deg, ${brand.primaryColor} 0%, ${brand.secondaryColor} 100%)` 
            }}
          ></div>
        )}
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {brand && (
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: brand.accentColor }}
                ></div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                {brand && (
                  <p className="text-sm text-gray-500">{brand.name}</p>
                )}
              </div>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <p className="text-gray-600 mb-4">{project.description}</p>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Progress</span>
              <span className="text-sm font-medium text-gray-900">{progress}%</span>
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

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <FolderOpen className="h-4 w-4" />
                  <span>{project.tasks.length} tasks</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{completedTasks} completed</span>
                </div>
              </div>
              {overdueTasks > 0 && (
                <span className="text-red-600 font-medium">{overdueTasks} overdue</span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setSelectedProject(project)}
              className="w-full text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: brand?.primaryColor || '#3B82F6' }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {state.brands.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Palette className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">No brands available</p>
              <p className="text-sm text-yellow-700 mt-1">
                You need to create at least one brand before creating projects. 
                <button 
                  onClick={() => dispatch({ type: 'SET_CURRENT_VIEW', payload: 'brands' })}
                  className="underline hover:no-underline ml-1"
                >
                  Go to Brands section
                </button> to get started.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {state.projects.length === 0 ? 'No projects yet' : 'No projects match your search'}
          </h3>
          <p className="text-gray-600 mb-4">
            {state.projects.length === 0 
              ? 'Create your first project to get started with task management.'
              : 'Try adjusting your search terms or create a new project.'
            }
          </p>
          {state.brands.length > 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}