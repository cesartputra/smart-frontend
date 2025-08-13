// src/components/common/NavigationCard.jsx
import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const NavigationCard = memo(({ 
    to,
    icon: Icon, 
    title, 
    description, 
    color = 'green',
    onClick,
    disabled = false,
    external = false,
    className = ''
}) => {
    const navigate = useNavigate();

    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        indigo: 'bg-indigo-100 text-indigo-600'
    };

    const handleClick = () => {
        if (disabled) return;
        
        if (onClick) {
        onClick();
        } else if (to) {
        if (external) {
            window.open(to, '_blank');
        } else {
            navigate(to);
        }
        }
    };

    // Jika menggunakan Link untuk internal navigation
    if (to && !external && !onClick) {
        return (
        <Link 
            to={to}
            className={`block p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        >
            <div className="flex items-center justify-between">
            <div className="flex items-center">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${colorClasses[color] || colorClasses.green} group-hover:scale-105 transition-transform duration-200`}>
                <Icon className="h-5 w-5" />
                </div>
                <div>
                <h4 className="font-medium text-gray-900 group-hover:text-gray-700">
                    {title}
                </h4>
                <p className="text-sm text-gray-500 group-hover:text-gray-600">
                    {description}
                </p>
                </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
        </Link>
        );
    }

    // Jika menggunakan button untuk custom onClick atau external link
    return (
        <button 
        onClick={handleClick}
        disabled={disabled}
        className={`w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        >
        <div className="flex items-center justify-between">
            <div className="flex items-center">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${colorClasses[color] || colorClasses.green} group-hover:scale-105 transition-transform duration-200`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <h4 className="font-medium text-gray-900 group-hover:text-gray-700">
                {title}
                </h4>
                <p className="text-sm text-gray-500 group-hover:text-gray-600">
                {description}
                </p>
            </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
        </div>
        </button>
    );
});

NavigationCard.displayName = 'NavigationCard';

export default NavigationCard;