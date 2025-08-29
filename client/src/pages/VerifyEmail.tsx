import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setMessage('');
    const res = await fetch(`/api/auth/verify-email/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    setMessage(data.message || 'Email verified successfully.');
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow text-center">
      <h2 className="text-xl font-bold mb-4">Email Verification</h2>
      <button onClick={handleVerify} className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify Email'}
      </button>
      {message && <div className="mt-4 text-green-600">{message}</div>}
    </div>
  );
};

export default VerifyEmail;
