import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Calendar, User, AlertCircle } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Project, Task } from '../types';
import { calculateProjectProgress, getPriorityColor, getStatusColor } from '../utils/projectUtils';
import { formatDate, isOverdue } from '../utils/dateUtils';
import CreateTaskModal from './CreateTaskModal';

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const { state, dispatch } = useProject();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const progress = calculateProjectProgress(project);
  const overdueTasks = project.tasks.filter(task => isOverdue(task.deadline) && task.status !== 'Completed');
  const brand = state.brands.find(b => b.id === project.brandId);

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      dispatch({ type: 'DELETE_TASK', payload: { projectId: project.id, taskId } });
    }
  };

  const TaskRow = ({ task }: { task: Task }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-medium text-gray-900">{task.subject}</h4>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            {isOverdue(task.deadline) && task.status !== 'Completed' && (
              <span className="flex items-center space-x-1 text-red-600 text-xs">
                <AlertCircle className="h-3 w-3" />
                <span>Overdue</span>
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Due: {formatDate(task.deadline)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{task.contact.name}</span>
            </div>
            <span className="bg-gray-100 px-2 py-1 rounded text-xs">{task.category}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedTask(task)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
        {brand && (
          <div 
            className="h-3"
            style={{ 
              background: `linear-gradient(90deg, ${brand.primaryColor} 0%, ${brand.secondaryColor} 100%)` 
            }}
          ></div>
        )}
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {brand && (
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: brand.accentColor }}></div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
              {brand && <p className="text-sm text-gray-600">{brand.name}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">{project.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{project.tasks.length}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {project.tasks.filter(t => t.status === 'Completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Project Progress</span>
                <span className="text-sm font-bold text-gray-900">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: brand?.primaryColor || '#3B82F6'
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
            <button
              onClick={() => setShowCreateTask(true)}
              className="text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors flex items-center space-x-2"
              style={{ backgroundColor: brand?.primaryColor || '#3B82F6' }}
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-3">
            {project.tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tasks yet. Create your first task to get started.</p>
              </div>
            ) : (
              project.tasks.map(task => (
                <TaskRow key={task.id} task={task} />
              ))
            )}
          </div>
        </div>

        {showCreateTask && (
          <CreateTaskModal
            projectId={project.id}
            task={selectedTask}
            onClose={() => {
              setShowCreateTask(false);
              setSelectedTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
}