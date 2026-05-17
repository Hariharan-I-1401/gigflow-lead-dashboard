import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    // Automatically dismiss the message after 4 seconds
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-5 right-5 z-50 animate-slideIn">
            <div className={`flex items-center space-x-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 max-w-md ${
                type === 'success' 
                    ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50/95 border-rose-200 text-rose-800'
            }`}>
                {type === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                )}
                <p className="text-sm font-medium pr-4">{message}</p>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;