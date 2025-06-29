import { Project, Task } from '../types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function calculateProjectProgress(project: Project): number {
  if (project.tasks.length === 0) return 0;
  const completedTasks = project.tasks.filter(task => task.status === 'Completed').length;
  return Math.round((completedTasks / project.tasks.length) * 100);
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => {
    const deadline = new Date(task.deadline);
    return deadline < new Date() && task.status !== 'Completed';
  });
}

export function getTasksByPriority(tasks: Task[], priority: string): Task[] {
  return tasks.filter(task => task.priority === priority);
}

export function sortTasksByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}

export function getBrandColors(): string[] {
  return [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
  ];
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Urgent':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'High':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Medium':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Under Review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Not Started':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}