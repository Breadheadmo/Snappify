import React, { useState, useEffect } from 'react';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';

interface ProductFormData {
  colors: string[];
  models: string[];
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
  // State for selected image files
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  // State for selected image files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    colors: [''],
    models: [''],
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

  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
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
      const token = localStorage.getItem('token');
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/categories/admin/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/products/brands')
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.map((cat: any) => ({ _id: cat._id, name: cat.name })));
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
          colors: product.colors?.length ? product.colors : [''],
          models: product.models?.length ? product.models : [''],
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

    // Prepare FormData for file upload
    const form = new FormData();
    form.append('colors', JSON.stringify(formData.colors.filter(c => c.trim() !== '')));
    form.append('models', JSON.stringify(formData.models.filter(m => m.trim() !== '')));
    form.append('name', formData.name);
    form.append('price', String(formData.price));
    form.append('originalPrice', String(formData.originalPrice));
    form.append('description', formData.description);
    form.append('brand', formData.brand);
    form.append('category', formData.category);
    form.append('countInStock', String(formData.countInStock));
    form.append('weight', formData.weight);
    form.append('dimensions', formData.dimensions);
    form.append('warranty', formData.warranty);
    form.append('features', JSON.stringify(formData.features.filter(f => f.trim() !== '')));
    form.append('tags', JSON.stringify(formData.tags.filter(t => t.trim() !== '')));
    form.append('specifications', JSON.stringify(formData.specifications));

    // Append image files (as array)
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        form.append('images[]', file);
      });
    }

    const url = isEditMode ? `/api/products/${id}` : '/api/products';
    const method = isEditMode ? 'PUT' : 'POST';
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
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
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayItem = (field: keyof Pick<ProductFormData, 'images' | 'features' | 'tags'>, index: number) => {
    if ((formData[field] as string[]).length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((_, i) => i !== index)
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

      {/* Error/Success Messages */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {formError && <ErrorMessage message={formError} className="mb-4" />}
        {formSuccess && <div className="mb-4 text-green-600 font-semibold">{formSuccess}</div>}
        {submitLoading && <LoadingSpinner />}
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
                <div className="relative">
                  <input
                    type="text"
                    list="brands-list"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Type or select a brand"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <datalist id="brands-list">
                    {brands.map(brand => (
                      <option key={brand} value={brand} />
                    ))}
                  </datalist>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Type a new brand name or select from existing brands
                </p>
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
                    <option key={category._id} value={category.name}>{category.name}</option>
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
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={e => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                setSelectedFiles(prev => [...prev, ...files]);
                setFormData(prev => ({
                  ...prev,
                  images: [...prev.images, ...files.map(file => URL.createObjectURL(file))]
                }));
              }}
              className="mb-4"
            />
            {/* Preview selected images */}
            <div className="flex flex-wrap gap-4">
              {selectedFiles && selectedFiles.length > 0 && selectedFiles.map((file: File, idx: number) => (
                <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFiles((prev: File[]) => prev.filter((_, i) => i !== idx));
                      setFormData(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== idx)
                      }));
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded px-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          {/* Colors */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Colors</h3>
            {formData.colors.map((color, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  placeholder="Color (e.g. Black, Blue, Red)"
                  value={color}
                  onChange={(e) => handleArrayChange('colors' as any, index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.colors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('colors' as any, index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('colors' as any)}
              className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
            >
              Add Color
            </button>
          </div>
          {/* Models (for chargers and screen protectors) */}
          {(formData.category.toLowerCase().includes('charger') || formData.category.toLowerCase().includes('screen protector')) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Phone Models</h3>
              {formData.models.map((model, index) => (
                <div key={index} className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    placeholder="Phone Model (e.g. iPhone 14 Pro)"
                    value={model}
                    onChange={(e) => handleArrayChange('models' as any, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.models.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('models' as any, index)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('models' as any)}
                className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
              >
                Add Model
              </button>
            </div>
          )}
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
