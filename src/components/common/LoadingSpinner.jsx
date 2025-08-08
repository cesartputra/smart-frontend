// src/components/common/LoadingSpinner.jsx
const LoadingSpinner = ({ size = 'md', text = 'Memuat...' }) => {
    const sizeClasses = {
        sm: 'loading-sm',
        md: 'loading-md',
        lg: 'loading-lg',
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <span className={`loading loading-spinner ${sizeClasses[size]} text-primary`}></span>
        {text && (
            <p className="text-gray-600 text-sm">{text}</p>
        )}
        </div>
    );
};

export default LoadingSpinner;