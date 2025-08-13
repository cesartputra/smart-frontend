// src/components/common/NavigationCard.jsx - Enhanced dengan badge support
import React from 'react';
import { Link } from 'react-router-dom';

const NavigationCard = ({ 
    to, 
    icon: Icon, 
    title, 
    description, 
    color = 'blue',
    badge = null,
    badgeColor = 'red',
    onClick,
    disabled = false,
    className = ''
}) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        orange: 'bg-orange-100 text-orange-600',
        purple: 'bg-purple-100 text-purple-600',
        red: 'bg-red-100 text-red-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        indigo: 'bg-indigo-100 text-indigo-600'
    };

    const badgeColorClasses = {
        red: 'bg-red-500 text-white',
        orange: 'bg-orange-500 text-white',
        green: 'bg-green-500 text-white',
        blue: 'bg-blue-500 text-white',
        purple: 'bg-purple-500 text-white',
        yellow: 'bg-yellow-500 text-white'
    };

    const content = (
        <div className={`p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 relative ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
        } ${className}`}>
            <div className="flex items-center">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${colorClasses[color] || colorClasses.blue}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{title}</h4>
                        {badge !== null && badge > 0 && (
                            <span className={`inline-flex items-center justify-center h-5 w-5 text-xs font-bold rounded-full ${
                                badgeColorClasses[badgeColor] || badgeColorClasses.red
                            }`}>
                                {badge > 99 ? '99+' : badge}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
            </div>
            
            {/* Pulse animation untuk urgent notifications */}
            {badge !== null && badge > 0 && badgeColor === 'orange' && (
                <div className="absolute top-2 right-2">
                    <div className="h-2 w-2 bg-orange-400 rounded-full animate-pulse"></div>
                </div>
            )}
        </div>
    );

    if (to && !disabled) {
        return (
            <Link to={to} className="block">
                {content}
            </Link>
        );
    }

    return (
        <div onClick={!disabled ? onClick : undefined}>
            {content}
        </div>
    );
};

export default NavigationCard;