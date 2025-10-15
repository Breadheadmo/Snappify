import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Track: React.FC = () => {
  const [tracking, setTracking] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = tracking.trim();
    if (!value) return;
    navigate(`/track/${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-xl bg-white rounded-xl shadow p-6 border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Track your order</h1>
        <p className="text-gray-600 mb-6">Enter your tracking number to view the latest status.</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Tracking number"
            className="flex-1 theme-input"
          />
          <button type="submit" className="theme-button-primary">Track</button>
        </div>
      </form>
    </div>
  );
};

export default Track;

