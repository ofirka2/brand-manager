import React, { useState } from 'react';
import { Plus, Palette, Edit2, Trash2, FolderOpen, DollarSign, Target, Eye } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Brand } from '../types';
import CreateBrandModal from './CreateBrandModal';
import BrandDetailModal from './BrandDetailModal';

export default function Brands() {
  const { state, dispatch } = useProject();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);

  const handleDeleteBrand = (brandId: string) => {
    const projectsCount = state.projects.filter(p => p.brandId === brandId).length;
    
    if (projectsCount > 0) {
      if (!confirm(`This brand has ${projectsCount} project(s). Deleting the brand will also delete all associated projects. Are you sure?`)) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to delete this brand?')) {
        return;
      }
    }
    
    dispatch({ type: 'DELETE_BRAND', payload: brandId });
  };

  const BrandCard = ({ brand }: { brand: Brand }) => {
    const projectsCount = state.projects.filter(p => p.brandId === brand.id).length;
    const tasksCount = state.projects
      .filter(p => p.brandId === brand.id)
      .reduce((total, project) => total + project.tasks.length, 0);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div 
          className="h-24 relative cursor-pointer"
          style={{ 
            background: `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.secondaryColor} 100%)` 
          }}
          onClick={() => setSelectedBrand(brand)}
        >
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBrand(brand);
              }}
              className="p-1 text-white hover:text-gray-200 transition-colors bg-black bg-opacity-20 rounded"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBrandToEdit(brand);
              }}
              className="p-1 text-white hover:text-gray-200 transition-colors bg-black bg-opacity-20 rounded"
              title="Edit Brand"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteBrand(brand.id);
              }}
              className="p-1 text-white hover:text-red-200 transition-colors bg-black bg-opacity-20 rounded"
              title="Delete Brand"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute bottom-3 left-3">
            <button
              onClick={() => setSelectedBrand(brand)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <h3 className="text-lg font-semibold">{brand.name}</h3>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: brand.accentColor }}
            ></div>
            <button
              onClick={() => setSelectedBrand(brand)}
              className="text-gray-600 hover:text-gray-900 transition-colors text-left"
            >
              <p>{brand.description}</p>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Budget</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                ${brand.budget.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Sales Goal</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                ${brand.salesGoal.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FolderOpen className="h-4 w-4" />
                <span>{projectsCount} projects</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{tasksCount} tasks</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-gray-500 font-medium">Brand Colors</div>
            <div className="flex space-x-2">
              <div 
                className="w-6 h-6 rounded border border-gray-200"
                style={{ backgroundColor: brand.primaryColor }}
                title="Primary Color"
              ></div>
              <div 
                className="w-6 h-6 rounded border border-gray-200"
                style={{ backgroundColor: brand.secondaryColor }}
                title="Secondary Color"
              ></div>
              <div 
                className="w-6 h-6 rounded border border-gray-200"
                style={{ backgroundColor: brand.accentColor }}
                title="Accent Color"
              ></div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setSelectedBrand(brand)}
              className="w-full text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: brand.primaryColor }}
            >
              View Details
            </button>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Created: {new Date(brand.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Brands</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Brand</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Palette className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">About Brands</h3>
            <p className="text-sm text-blue-700 mt-1">
              Brands help organize your projects by client, company, or product line. Each brand has its own color scheme,
              budget allocation, and sales targets that will be applied to all projects under that brand, ensuring visual 
              consistency and financial tracking across your portfolio. Click on any brand to view detailed analytics.
            </p>
          </div>
        </div>
      </div>

      {state.brands.length === 0 ? (
        <div className="text-center py-12">
          <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No brands yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first brand to organize projects by client, company, or product line with budget and sales tracking.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.brands.map(brand => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateBrandModal
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {brandToEdit && (
        <CreateBrandModal
          brand={brandToEdit}
          onClose={() => setBrandToEdit(null)}
        />
      )}

      {selectedBrand && (
        <BrandDetailModal
          brand={selectedBrand}
          onClose={() => setSelectedBrand(null)}
        />
      )}
    </div>
  );
}