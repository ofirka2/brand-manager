import React, { useState } from 'react';
import { Plus, BookTemplate as FileTemplate, Copy, Trash2, Edit2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ProjectTemplate } from '../types';
import CreateTemplateModal from './CreateTemplateModal';

export default function Templates() {
  const { state, dispatch } = useProject();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      dispatch({ type: 'DELETE_TEMPLATE', payload: templateId });
    }
  };

  const TemplateCard = ({ template }: { template: ProjectTemplate }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FileTemplate className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedTemplate(template)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteTemplate(template.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{template.description}</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Tasks in template:</span>
          <span className="font-medium text-gray-900">{template.tasks.length}</span>
        </div>

        <div className="space-y-2">
          {template.tasks.slice(0, 3).map((task, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 truncate">{task.subject}</span>
              <span className="text-xs text-gray-500 ml-2">{task.priority}</span>
            </div>
          ))}
          {template.tasks.length > 3 && (
            <div className="text-sm text-gray-500">
              +{template.tasks.length - 3} more tasks
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Created: {new Date(template.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Project Templates</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Template</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileTemplate className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">About Templates</h3>
            <p className="text-sm text-blue-700 mt-1">
              Templates help you quickly create new projects with pre-defined tasks and structures. 
              Create templates for recurring project types to save time and ensure consistency.
            </p>
          </div>
        </div>
      </div>

      {state.templates.length === 0 ? (
        <div className="text-center py-12">
          <FileTemplate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first template to speed up project creation and ensure consistency.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.templates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTemplateModal
          template={selectedTemplate}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
}