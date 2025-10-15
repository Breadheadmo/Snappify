"use client";

import * as React from 'react';
import { useState } from 'react';
import { LogIn, Lock, Mail, User } from 'lucide-react';

type SignUpData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Props = {
  onSignUp: (data: SignUpData) => Promise<void> | void;
  loading?: boolean;
  error?: string;
  toLoginHref?: string;
};

export const CleanMinimalSignUp: React.FC<Props> = ({ onSignUp, loading, error, toLoginHref = '/login' }) => {
  const [form, setForm] = useState<SignUpData>({ firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '' });
  const [localErr, setLocalErr] = useState('');

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const submit = async () => {
    if (!form.firstName || !form.lastName || !form.username || !form.email || !form.password || !form.confirmPassword) {
      setLocalErr('Please complete all fields.');
      return;
    }
    if (!validateEmail(form.email)) {
      setLocalErr('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setLocalErr('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setLocalErr('Passwords do not match.');
      return;
    }
    setLocalErr('');
    try {
      await onSignUp(form);
    } catch (e: any) {
      setLocalErr(e?.message || 'Failed to sign up.');
    }
  };

  const err = error || localErr;

  const inputCls = 'w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm';

  return (
    <div className="min-h-[100svh] w-full flex items-center justify-center bg-white px-4 py-8 sm:py-12">
      <div className="w-full max-w-md sm:max-w-lg bg-gradient-to-b from-sky-50/50 to-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100 text-black">
        <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white mb-6 shadow-lg">
          <LogIn className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-center">Create your account</h2>
        <p className="text-gray-500 text-xs sm:text-sm mb-6 text-center">Join Snappify for a better shopping experience</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><User className="w-4 h-4" /></span>
            <input placeholder="First name" className={inputCls} value={form.firstName} onChange={(e)=>setForm({...form, firstName: e.target.value})} />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><User className="w-4 h-4" /></span>
            <input placeholder="Last name" className={inputCls} value={form.lastName} onChange={(e)=>setForm({...form, lastName: e.target.value})} />
          </div>
        </div>
        <div className="w-full flex flex-col gap-3 mb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><User className="w-4 h-4" /></span>
            <input placeholder="Username" className={inputCls} value={form.username} onChange={(e)=>setForm({...form, username: e.target.value})} autoComplete="username" />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="w-4 h-4" /></span>
            <input placeholder="Email" type="email" className={inputCls} value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} autoComplete="email" />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="w-4 h-4" /></span>
            <input placeholder="Password" type="password" className={inputCls} value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} autoComplete="new-password" />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="w-4 h-4" /></span>
            <input placeholder="Confirm password" type="password" className={inputCls} value={form.confirmPassword} onChange={(e)=>setForm({...form, confirmPassword: e.target.value})} autoComplete="new-password" />
          </div>
          {err && <div className="text-sm text-red-500">{err}</div>}
        </div>
        <button onClick={submit} disabled={loading} className="w-full bg-gradient-to-b from-gray-700 to-gray-900 text-white font-medium py-2 sm:py-3 rounded-xl shadow hover:brightness-105 transition mb-2 disabled:opacity-60">{loading ? 'Creating account…' : 'Create account'}</button>
        <p className="text-sm text-gray-500 text-center">Already have an account? <a href={toLoginHref} className="underline">Sign in</a></p>
      </div>
    </div>
  );
};

export default CleanMinimalSignUp;
