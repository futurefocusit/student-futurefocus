import React from 'react';
import { FaSpinner } from 'react-icons/fa';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', fullScreen = false, text }) => {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50'
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <FaSpinner className={`${getSize()} animate-spin text-blue-600`} />
        {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
      </div>
    </div>
  );
};

export default Loader;
