import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Project, Task, ProjectTemplate, NotificationSettings, FilterOptions, UserSettings } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface ProjectState {
  projects: Project[];
  templates: ProjectTemplate[];
  userSettings: UserSettings;
  notifications: NotificationSettings;
  filters: FilterOptions;
  selectedProject: string | null;
  currentView: 'dashboard' | 'projects' | 'templates' | 'settings';
}

type ProjectAction =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_TASK'; payload: { projectId: string; task: Task } }
  | { type: 'UPDATE_TASK'; payload: { projectId: string; task: Task } }
  | { type: 'DELETE_TASK'; payload: { projectId: string; taskId: string } }
  | { type: 'SET_TEMPLATES'; payload: ProjectTemplate[] }
  | { type: 'ADD_TEMPLATE'; payload: ProjectTemplate }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'SET_USER_SETTINGS'; payload: UserSettings }
  | { type: 'SET_NOTIFICATIONS'; payload: NotificationSettings }
  | { type: 'SET_FILTERS'; payload: FilterOptions }
  | { type: 'SET_SELECTED_PROJECT'; payload: string | null }
  | { type: 'SET_CURRENT_VIEW'; payload: ProjectState['currentView'] };

const initialState: ProjectState = {
  projects: [],
  templates: [],
  userSettings: {
    name: '',
    email: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  notifications: {
    enabled: true,
    triggers: {
      sevenDays: true,
      threeDays: true,
      oneDay: true,
      overdue: true,
    },
    escalation: true,
  },
  filters: {
    priority: [],
    status: [],
    category: [],
    dateRange: null,
  },
  selectedProject: null,
  currentView: 'dashboard',
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        selectedProject: state.selectedProject === action.payload ? null : state.selectedProject,
      };
    case 'ADD_TASK':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, tasks: [...p.tasks, action.payload.task] }
            : p
        ),
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                tasks: p.tasks.map(t => t.id === action.payload.task.id ? action.payload.task : t),
              }
            : p
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, tasks: p.tasks.filter(t => t.id !== action.payload.taskId) }
            : p
        ),
      };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.payload] };
    case 'DELETE_TEMPLATE':
      return { ...state, templates: state.templates.filter(t => t.id !== action.payload) };
    case 'SET_USER_SETTINGS':
      return { ...state, userSettings: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_SELECTED_PROJECT':
      return { ...state, selectedProject: action.payload };
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    default:
      return state;
  }
}

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
} | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  useEffect(() => {
    const savedProjects = loadFromStorage('projects');
    const savedTemplates = loadFromStorage('templates');
    const savedUserSettings = loadFromStorage('userSettings');
    const savedNotifications = loadFromStorage('notifications');

    if (savedProjects) {
      dispatch({ type: 'SET_PROJECTS', payload: savedProjects });
    }
    if (savedTemplates) {
      dispatch({ type: 'SET_TEMPLATES', payload: savedTemplates });
    }
    if (savedUserSettings) {
      dispatch({ type: 'SET_USER_SETTINGS', payload: savedUserSettings });
    }
    if (savedNotifications) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: savedNotifications });
    }
  }, []);

  useEffect(() => {
    saveToStorage('projects', state.projects);
  }, [state.projects]);

  useEffect(() => {
    saveToStorage('templates', state.templates);
  }, [state.templates]);

  useEffect(() => {
    saveToStorage('userSettings', state.userSettings);
  }, [state.userSettings]);

  useEffect(() => {
    saveToStorage('notifications', state.notifications);
  }, [state.notifications]);

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}