import React from 'react';
import { Filter, X } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export default function TaskFilters() {
  const { state, dispatch } = useProject();

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const statuses = ['Not Started', 'In Progress', 'Under Review', 'Completed'];
  const categories = ['Development', 'Design', 'Marketing', 'Research', 'Testing', 'Documentation', 'Meeting', 'Other'];

  const toggleFilter = (filterType: 'priority' | 'status' | 'category', value: string) => {
    const currentFilters = state.filters[filterType];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(f => f !== value)
      : [...currentFilters, value];

    dispatch({
      type: 'SET_FILTERS',
      payload: {
        ...state.filters,
        [filterType]: newFilters,
      },
    });
  };

  const clearAllFilters = () => {
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        priority: [],
        status: [],
        category: [],
        dateRange: null,
      },
    });
  };

  const hasActiveFilters = 
    state.filters.priority.length > 0 ||
    state.filters.status.length > 0 ||
    state.filters.category.length > 0 ||
    state.filters.dateRange !== null;

  const FilterGroup = ({ title, options, filterType, activeFilters }: any) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{title}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option: string) => (
          <button
            key={option}
            onClick={() => toggleFilter(filterType, option)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              activeFilters.includes(option)
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FilterGroup
          title="Priority"
          options={priorities}
          filterType="priority"
          activeFilters={state.filters.priority}
        />
        <FilterGroup
          title="Status"
          options={statuses}
          filterType="status"
          activeFilters={state.filters.status}
        />
        <FilterGroup
          title="Category"
          options={categories}
          filterType="category"
          activeFilters={state.filters.category}
        />
      </div>
    </div>
  );
}