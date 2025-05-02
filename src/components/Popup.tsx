import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

interface PopupProps {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    onClose: () => void;
    duration?: number;
}

const Popup: React.FC<PopupProps> = ({ type, message, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="text-green-500" />;
            case 'error':
                return <FaTimesCircle className="text-red-500" />;
            case 'info':
                return <FaInfoCircle className="text-blue-500" />;
            case 'warning':
                return <FaExclamationTriangle className="text-yellow-500" />;
            default:
                return null;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50';
            case 'error':
                return 'bg-red-50';
            case 'info':
                return 'bg-blue-50';
            case 'warning':
                return 'bg-yellow-50';
            default:
                return 'bg-gray-50';
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success':
                return 'border-green-200';
            case 'error':
                return 'border-red-200';
            case 'info':
                return 'border-blue-200';
            case 'warning':
                return 'border-yellow-200';
            default:
                return 'border-gray-200';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`${getBgColor()} ${getBorderColor()} border rounded-lg shadow-lg p-4 max-w-sm`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0 text-xl mr-3">
                        {getIcon()}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <span className="sr-only">Close</span>
                        <FaTimesCircle className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup; 