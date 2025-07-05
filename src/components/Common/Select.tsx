import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${className}`}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;