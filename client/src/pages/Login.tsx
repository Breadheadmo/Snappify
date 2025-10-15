import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SignIn2 from '../components/ui/clean-minimal-sign-in';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignIn = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    try {
      const loginData = await login(email, password);
      if (loginData.user?.isAdmin) navigate('/admin');
      else navigate('/');
    } catch (e: any) {
      setError(e?.message || 'Failed to login. Please try again.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return <SignIn2 onSignIn={handleSignIn} loading={loading} error={error} forgotHref="/request-reset" />;
}
