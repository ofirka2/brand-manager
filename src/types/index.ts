export interface Contact {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface Task {
  id: string;
  projectId: string;
  subject: string;
  description: string;
  deadline: string;
  contact: Contact;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: 'Development' | 'Design' | 'Marketing' | 'Research' | 'Testing' | 'Documentation' | 'Meeting' | 'Other';
  status: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed';
  createdAt: string;
  updatedAt: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  color: string;
  tasks: Task[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  tasks: Omit<Task, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>[];
  createdAt: string;
}

export interface UserSettings {
  name: string;
  email: string;
  timezone: string;
}

export interface NotificationSettings {
  enabled: boolean;
  triggers: {
    sevenDays: boolean;
    threeDays: boolean;
    oneDay: boolean;
    overdue: boolean;
  };
  escalation: boolean;
}

export interface FilterOptions {
  priority: string[];
  status: string[];
  category: string[];
  dateRange: {
    start: string;
    end: string;
  } | null;
}