import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ProjectTemplate, Task } from '../types';
import { generateId } from '../utils/projectUtils';

interface CreateTemplateModalProps {
  template?: ProjectTemplate | null;
  onClose: () => void;
}

export default function CreateTemplateModal({ template, onClose }: CreateTemplateModalProps) {
  const { dispatch } = useProject();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [tasks, setTasks] = useState<Omit<Task, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>[]>([]);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
      });
      setTasks(template.tasks);
    }
  }, [template]);

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        subject: '',
        description: '',
        deadline: '',
        contact: {
          name: '',
          role: '',
          email: '',
        },
        priority: 'Medium',
        category: 'Development',
        status: 'Not Started',
      },
    ]);
  };

  const updateTask = (index: number, field: string, value: any) => {
    const updatedTasks = [...tasks];
    if (field.startsWith('contact.')) {
      const contactField = field.split('.')[1];
      updatedTasks[index] = {
        ...updatedTasks[index],
        contact: {
          ...updatedTasks[index].contact,
          [contactField]: value,
        },
      };
    } else {
      updatedTasks[index] = {
        ...updatedTasks[index],
        [field]: value,
      };
    }
    setTasks(updatedTasks);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData: ProjectTemplate = {
      id: template?.id || generateId(),
      name: formData.name,
      description: formData.description,
      tasks,
      createdAt: template?.createdAt || new Date().toISOString(),
    };

    if (template) {
      // Update existing template
      dispatch({ type: 'SET_TEMPLATES', payload: [] }); // This would need proper update logic
    } else {
      dispatch({ type: 'ADD_TEMPLATE', payload: templateData });
    }

    onClose();
  };

  const categories = ['Development', 'Design', 'Marketing', 'Research', 'Testing', 'Documentation', 'Meeting', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter template name"
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
                placeholder="Brief description of the template"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Template Tasks</h3>
              <button
                type="button"
                onClick={addTask}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Task {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={task.subject}
                        onChange={(e) => updateTask(index, 'subject', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Task subject"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={task.description}
                        onChange={(e) => updateTask(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Task description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(index, 'priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        {priorities.map(priority => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={task.category}
                        onChange={(e) => updateTask(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={task.contact.name}
                        onChange={(e) => updateTask(index, 'contact.name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Contact name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Role
                      </label>
                      <input
                        type="text"
                        value={task.contact.role}
                        onChange={(e) => updateTask(index, 'contact.role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Contact role"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={task.contact.email}
                        onChange={(e) => updateTask(index, 'contact.email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Contact email"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks added yet. Click "Add Task" to create template tasks.</p>
                </div>
              )}
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}