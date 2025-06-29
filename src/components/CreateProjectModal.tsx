import React, { useState } from 'react';
import { X, BookTemplate as FileTemplate, Eye, Palette } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Project, ProjectTemplate } from '../types';
import { generateId } from '../utils/projectUtils';

interface CreateProjectModalProps {
  onClose: () => void;
}

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const { state, dispatch } = useProject();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brandId: '',
    templateId: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = state.templates.find(t => t.id === templateId);
    setFormData({ ...formData, templateId });
    setSelectedTemplate(template || null);
    
    // Auto-fill project name and description from template if they're empty
    if (template && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: generateId(),
      name: formData.name,
      description: formData.description,
      brandId: formData.brandId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [],
    };

    // If using a template, add template tasks
    if (formData.templateId && selectedTemplate) {
      newProject.tasks = selectedTemplate.tasks.map(task => ({
        ...task,
        id: generateId(),
        projectId: newProject.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Set deadline to empty string since templates don't have specific dates
        deadline: '',
      }));
    }

    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    onClose();
  };

  const TemplateCard = ({ template, isSelected }: { template: ProjectTemplate; isSelected: boolean }) => (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={() => handleTemplateSelect(template.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <FileTemplate className="h-4 w-4 text-blue-600" />
          <h4 className="font-medium text-gray-900">{template.name}</h4>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTemplate(template);
            setShowTemplatePreview(true);
          }}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
      <div className="text-xs text-gray-500">
        {template.tasks.length} task{template.tasks.length !== 1 ? 's' : ''}
      </div>
    </div>
  );

  const TemplatePreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Template Preview</h3>
          <button
            onClick={() => setShowTemplatePreview(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {selectedTemplate && (
          <div className="p-6">
            <div className="mb-4">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedTemplate.name}</h4>
              <p className="text-gray-600">{selectedTemplate.description}</p>
            </div>
            
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Tasks ({selectedTemplate.tasks.length})</h5>
              {selectedTemplate.tasks.map((task, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h6 className="font-medium text-gray-900">{task.subject}</h6>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {task.priority}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  <div className="text-xs text-gray-500">
                    Contact: {task.contact.name} ({task.contact.role})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const selectedBrand = state.brands.find(b => b.id === formData.brandId);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Brand Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Brand <span className="text-red-500">*</span>
              </label>
              {state.brands.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Palette className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">No brands available</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        You need to create at least one brand before creating a project. 
                        Go to the Brands section to create your first brand.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {state.brands.map(brand => (
                    <div
                      key={brand.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.brandId === brand.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setFormData({ ...formData, brandId: brand.id })}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: brand.primaryColor }}
                        ></div>
                        <h4 className="font-medium text-gray-900">{brand.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{brand.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedBrand && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Palette className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-green-900 font-medium">Brand Selected: {selectedBrand.name}</p>
                      <p className="text-green-700">
                        This project will use the brand's color scheme and be organized under this brand.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Template Selection */}
            {state.templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Template (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      !formData.templateId
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleTemplateSelect('')}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-4 h-4 rounded border-2 border-gray-400"></div>
                      <h4 className="font-medium text-gray-900">Start from Scratch</h4>
                    </div>
                    <p className="text-sm text-gray-600">Create an empty project without any pre-defined tasks</p>
                  </div>
                  
                  {state.templates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={formData.templateId === template.id}
                    />
                  ))}
                </div>
                
                {selectedTemplate && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <FileTemplate className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-green-900 font-medium">Template Selected: {selectedTemplate.name}</p>
                        <p className="text-green-700">
                          This will create {selectedTemplate.tasks.length} task{selectedTemplate.tasks.length !== 1 ? 's' : ''} in your new project.
                          You can modify deadlines and details after creation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief project description"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.brandId || state.brands.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>

      {showTemplatePreview && <TemplatePreviewModal />}
    </>
  );
}