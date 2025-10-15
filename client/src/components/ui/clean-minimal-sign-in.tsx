"use client";

import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Lock, Mail } from "lucide-react";

type SignInProps = {
  onSignIn: (email: string, password: string) => Promise<void> | void;
  loading?: boolean;
  error?: string;
  forgotHref?: string;
  signUpHref?: string;
};

export const SignIn2: React.FC<SignInProps> = ({ 
  onSignIn, 
  loading, 
  error, 
  forgotHref = "/request-reset",
  signUpHref = "/signup"
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localErr, setLocalErr] = useState<string>("");

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSignIn = async () => {
    if (!email || !password) {
      setLocalErr("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setLocalErr("Please enter a valid email address.");
      return;
    }
    setLocalErr("");
    try {
      await onSignIn(email, password);
    } catch (e: any) {
      setLocalErr(e?.message || "Failed to sign in");
    }
  };

  const finalError = error || localErr;

  return (
    <div className="min-h-[100svh] w-full flex items-center justify-center bg-white px-4 py-8 sm:py-12">
      <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-sky-50/50 to-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col items-center border border-blue-100 text-black">
        <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white mb-6 shadow-lg">
          <LogIn className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-center">Sign in with email</h2>
        <p className="text-gray-500 text-xs sm:text-sm mb-6 text-center">Welcome back to Snappify</p>
        <div className="w-full flex flex-col gap-3 mb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              placeholder="Password"
              type="password"
              value={password}
              className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="w-full flex justify-between items-center">
            {finalError && <div className="text-sm text-red-500 text-left">{finalError}</div>}
            <a href={forgotHref} className="text-xs hover:underline font-medium ml-auto">Forgot password?</a>
          </div>
        </div>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-gradient-to-b from-gray-700 to-gray-900 text-white font-medium py-2 sm:py-3 rounded-xl shadow hover:brightness-105 cursor-pointer transition mb-4 mt-2 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Get Started'}
        </button>
        
        {/* Sign Up Link */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to={signUpHref} className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="flex items-center w-full my-2">
          <div className="flex-grow border-t border-dashed border-gray-200"></div>
          <span className="mx-2 text-xs text-gray-400">Or sign in with</span>
          <div className="flex-grow border-t border-dashed border-gray-200"></div>
        </div>
        <div className="flex gap-3 w-full justify-center mt-2">
          <button className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 transition grow" aria-label="Sign in with Google">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
          </button>
          <button className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 transition grow" aria-label="Sign in with Facebook">
            <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook" className="w-6 h-6" />
          </button>
          <button className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 transition grow" aria-label="Sign in with Apple">
            <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn2;