import React from 'react';
import { FieldState } from '../utils/validation';

interface FormInputProps {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  fieldState: FieldState;
  onChange: (value: string) => void;
  onBlur?: () => void;
  autoComplete?: string;
  required?: boolean;
  className?: string;
  roundedTop?: boolean;
  roundedBottom?: boolean;
  icon?: React.ReactNode;
  maxLength?: number;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type,
  placeholder,
  fieldState,
  onChange,
  onBlur,
  autoComplete,
  required = true,
  className = '',
  roundedTop = false,
  roundedBottom = false,
  icon,
  maxLength
}) => {
  const showError = fieldState.touched && fieldState.error;
  
  const inputClasses = `
    appearance-none 
    relative 
    block 
    w-full 
    px-3 
    ${icon ? 'pl-10' : 'pl-3'} 
    py-2 
    border 
    ${showError ? 'border-red-500 ring-red-500' : 'border-gray-300'} 
    placeholder-gray-500 
    text-gray-900 
    ${roundedTop ? 'rounded-t-md' : ''} 
    ${roundedBottom ? 'rounded-b-md' : ''} 
    ${!roundedTop && !roundedBottom ? 'rounded-md' : ''}
    focus:outline-none 
    focus:ring-2 
    ${showError ? 'focus:ring-red-500' : 'focus:ring-primary-500'} 
    focus:border-transparent 
    focus:z-10 
    sm:text-sm
    ${className}
  `;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={fieldState.value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={inputClasses}
          maxLength={maxLength}
        />
      </div>
      {showError && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {fieldState.error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
