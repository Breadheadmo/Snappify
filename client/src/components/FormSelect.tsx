import React from 'react';
import { FieldState } from '../utils/validation';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  id: string;
  label: string;
  options: Option[];
  fieldState: FieldState;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  className?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  id,
  label,
  options,
  fieldState,
  onChange,
  onBlur,
  required = true,
  className = ''
}) => {
  const showError = fieldState.touched && fieldState.error;
  
  const selectClasses = `
    mt-1 
    block 
    w-full 
    pl-3 
    pr-10 
    py-2 
    text-base 
    ${showError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} 
    focus:outline-none 
    sm:text-sm 
    rounded-md
    ${className}
  `;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          name={id}
          value={fieldState.value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={selectClasses}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {showError && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {fieldState.error}
        </p>
      )}
    </div>
  );
};

export default FormSelect;
