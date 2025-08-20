import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface AccountSettingsFormProps {
  onSubmit: (data: {
    notifications: boolean;
    language: string;
    currency: string;
  }) => Promise<void>;
  initialData: {
    notifications: boolean;
    language: string;
    currency: string;
  };
}

export default function AccountSettingsForm({ onSubmit, initialData }: AccountSettingsFormProps) {
  const [notifications, setNotifications] = useState(initialData.notifications);
  const [language, setLanguage] = useState(initialData.language);
  const [currency, setCurrency] = useState(initialData.currency);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }
  ];

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onSubmit({ notifications, language, currency });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="notifications"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
            Enable email notifications
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
          Language
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
          Currency
        </label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          {currencies.map((curr) => (
            <option key={curr.code} value={curr.code}>
              {curr.code} ({curr.symbol})
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        {isLoading ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
}
