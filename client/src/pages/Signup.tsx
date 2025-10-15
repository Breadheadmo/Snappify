import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CleanMinimalSignUp from '../components/ui/clean-minimal-sign-up';

export default function Signup() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSignUp = async (data: { firstName: string; lastName: string; username: string; email: string; password: string; confirmPassword: string; }) => {
    setError('');
    setLoading(true);
    try {
      await register(data.username, data.email, data.password, data.firstName, data.lastName);
      navigate('/');
    } catch (e: any) {
      setError(e?.message || 'Failed to create account');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return <CleanMinimalSignUp onSignUp={handleSignUp} loading={loading} error={error} toLoginHref="/login" />;
}
