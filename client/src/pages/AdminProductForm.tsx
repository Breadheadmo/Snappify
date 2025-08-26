import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';

interface ProductFormData {
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  images: string[];
  brand: string;
  category: string;
  countInStock: number;
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  weight: string;
  dimensions: string;
  warranty: string;
}

const AdminProductForm: React.FC = () => {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    originalPrice: 0,
    description: '',
    images: [''],
    brand: '',
    category: '',
    countInStock: 0,
    features: [''],
    specifications: {},
    tags: [''],
    weight: '',
    dimensions: '',
    warranty: ''
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchDropdownData();
      if (isEditMode && id) {
        fetchProduct(id);
      }
    }
  }, [isEditMode, id, isAuthenticated, user]);

  // Show loading spinner while auth state is loading
  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen"><span>Loading...</span></div>;
  }
  // Redirect if not admin
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const fetchDropdownData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/products/categories'),
        fetch('/api/products/brands')
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const product = await response.json();
        setFormData({
          name: product.name || '',
          price: product.price || 0,
          originalPrice: product.originalPrice || 0,
          description: product.description || '',
          images: product.images?.length ? product.images : [''],
          brand: product.brand || '',
          category: product.category || '',
          countInStock: product.countInStock || 0,
          features: product.features?.length ? product.features : [''],
          specifications: product.specifications || {},
          tags: product.tags?.length ? product.tags : [''],
          weight: product.weight || '',
          dimensions: product.dimensions || '',
          warranty: product.warranty || ''
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    // Validate required fields
    const requiredFields = [
      formData.name,
      formData.brand,
      formData.category,
      formData.description,
      formData.price,
      formData.countInStock
    ];
    if (requiredFields.some(field => field === '' || field === undefined || field === null)) {
      alert('Please fill in all required fields.');
      setSubmitLoading(false);
      return;
    }

    // Ensure images is a non-empty array of strings
    const images = formData.images.filter(img => img.trim() !== '');
    if (images.length === 0) {
      images.push('https://via.placeholder.com/650x650');
    }

    // Clean up data before sending
    const cleanedData = {
      ...formData,
      images: images,
      features: formData.features.filter(f => f.trim() !== ''),
      tags: formData.tags.filter(t => t.trim() !== ''),
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      countInStock: Number(formData.countInStock),
    };

    const url = isEditMode ? `/api/products/${id}` : '/api/products';
    const method = isEditMode ? 'PUT' : 'POST';
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedData)
      });

      if (response.ok) {
        navigate('/admin/products');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleArrayChange = (field: keyof Pick<ProductFormData, 'images' | 'features' | 'tags'>, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: keyof Pick<ProductFormData, 'images' | 'features' | 'tags'>) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: keyof Pick<ProductFormData, 'images' | 'features' | 'tags'>, index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim()
        }
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/admin/products" className="text-blue-600 hover:text-blue-800">
                ← Back to Products
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.countInStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, countInStock: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
            {formData.images.map((image, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="url"
                  placeholder="Image URL"
                  value={image}
                  onChange={(e) => handleArrayChange('images', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('images', index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('images')}
              className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
            >
              Add Image
            </button>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  placeholder="Feature"
                  value={feature}
                  onChange={(e) => handleArrayChange('features', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('features', index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('features')}
              className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
            >
              Add Feature
            </button>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
            
            {/* Add new specification */}
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                placeholder="Specification name"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Specification value"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addSpecification}
                className="px-4 py-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200"
              >
                Add
              </button>
            </div>

            {/* Existing specifications */}
            {Object.entries(formData.specifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex-1">
                  <span className="font-medium">{key}:</span> {value}
                </div>
                <button
                  type="button"
                  onClick={() => removeSpecification(key)}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1.5kg"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions
                </label>
                <input
                  type="text"
                  placeholder="e.g., 10x15x20 cm"
                  value={formData.dimensions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1 year"
                  value={formData.warranty}
                  onChange={(e) => setFormData(prev => ({ ...prev, warranty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  placeholder="Tag"
                  value={tag}
                  onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.tags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('tags', index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('tags')}
              className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
            >
              Add Tag
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link
              to="/admin/products"
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitLoading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
