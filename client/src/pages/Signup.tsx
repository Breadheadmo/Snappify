import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import FormInput from '../components/FormInput';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  createFieldState, 
  updateFieldState, 
  isFormValid, 
  validateUsername, 
  validateEmail, 
  validatePassword, 
  validateConfirmPassword
} from '../utils/validation';

export default function Signup() {
  const [fields, setFields] = useState({
    username: createFieldState(),
    email: createFieldState(),
    password: createFieldState(),
    confirmPassword: createFieldState()
  });
  
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const updateField = (field: keyof typeof fields, value: string) => {
    let updatedFields = { ...fields };
    
    // Apply the appropriate validator
    switch (field) {
      case 'username':
        updatedFields.username = updateFieldState(fields.username, value, validateUsername);
        break;
      case 'email':
        updatedFields.email = updateFieldState(fields.email, value, validateEmail);
        break;
      case 'password':
        updatedFields.password = updateFieldState(fields.password, value, validatePassword);
        // Also validate confirm password if it's been touched
        if (fields.confirmPassword.touched) {
          updatedFields.confirmPassword = updateFieldState(
            fields.confirmPassword, 
            fields.confirmPassword.value, 
            (confirmPwd) => validateConfirmPassword(value, confirmPwd)
          );
        }
        break;
      case 'confirmPassword':
        updatedFields.confirmPassword = updateFieldState(
          fields.confirmPassword, 
          value, 
          (confirmPwd) => validateConfirmPassword(fields.password.value, confirmPwd)
        );
        break;
    }
    
    setFields(updatedFields);
    setFormTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Mark all fields as touched to show any validation errors
    const touchedFields = Object.keys(fields).reduce((acc, key) => {
      const fieldKey = key as keyof typeof fields;
      return {
        ...acc,
        [fieldKey]: {
          ...fields[fieldKey],
          touched: true
        }
      };
    }, {} as typeof fields);
    
    setFields(touchedFields);
    
    // Check if form is valid
    if (!isFormValid(touchedFields)) {
      setFormError('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      await register(fields.username.value, fields.email.value, fields.password.value);
      navigate('/'); // Redirect to home page after successful registration
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate form validity whenever fields change
  const isValid = isFormValid(fields);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your account
            </Link>
            <div className="mt-4">
              <Link to="/request-reset" className="text-blue-500 hover:underline">Forgot password?</Link>
            </div>
            <div className="mt-2">
              <Link to="/request-email-verification" className="text-blue-500 hover:underline">Verify your email</Link>
            </div>
          </p>
        </div>

        {formError && <ErrorMessage message={formError} className="mb-4" />}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <FormInput
              id="username"
              label="Username"
              type="text"
              placeholder="Choose a username"
              fieldState={fields.username}
              onChange={(value) => updateField('username', value)}
              autoComplete="username"
              icon={<User className="h-5 w-5 text-gray-400" />}
            />
            
            <FormInput
              id="email"
              label="Email address"
              type="email"
              placeholder="Enter your email"
              fieldState={fields.email}
              onChange={(value) => updateField('email', value)}
              autoComplete="email"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />
            
            <div className="relative">
              <FormInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                fieldState={fields.password}
                onChange={(value) => updateField('password', value)}
                autoComplete="new-password"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <FormInput
              id="confirm-password"
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
              fieldState={fields.confirmPassword}
              onChange={(value) => updateField('confirmPassword', value)}
              autoComplete="new-password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />
          </div>

          {formTouched && !isValid && !formError && (
            <p className="text-sm text-yellow-600 mt-2">
              Please complete all required fields correctly.
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </div>
          
          <div className="text-sm text-center">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
