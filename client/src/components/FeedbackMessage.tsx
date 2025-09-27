import React from 'react';

interface FeedbackMessageProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  className?: string;
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({ message, type = 'info', className }) => {
  const color =
    type === 'error' ? 'bg-red-100 text-red-700 border-red-300' :
    type === 'success' ? 'bg-green-100 text-green-700 border-green-300' :
    'bg-blue-100 text-blue-700 border-blue-300';

  return (
    <div className={`border rounded px-4 py-2 mb-2 font-semibold ${color} ${className || ''}`}>{message}</div>
  );
};

export default FeedbackMessage;
