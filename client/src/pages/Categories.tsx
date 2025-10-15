import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../services/api';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await productApi.getCategories();
        setCategories(res || []);
      } catch (e) {
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading categories...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Categories</h1>
        {categories.length === 0 ? (
          <div className="text-gray-600">No categories available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.sort().map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-6"
              >
                <div className="text-lg font-semibold text-gray-900">{cat}</div>
                <div className="text-gray-600 text-sm">Explore items in {cat}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
