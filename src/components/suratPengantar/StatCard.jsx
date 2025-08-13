// src/components/suratPengantar/StatCard.jsx
import React, { memo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = memo(({ 
    title, 
    value, 
    icon: Icon, 
    color = 'blue', 
    trend, 
    trendValue,
    onClick,
    loading = false,
    className = ''
}) => {
    const colorClasses = {
        blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        value: 'text-blue-600'
        },
        green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        value: 'text-green-600'
        },
        yellow: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        value: 'text-yellow-600'
        },
        red: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        value: 'text-red-600'
        },
        purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        value: 'text-purple-600'
        },
        indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        value: 'text-indigo-600'
        },
        orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        value: 'text-orange-600'
        }
    };

    const getTrendIcon = () => {
        switch (trend) {
        case 'up':
            return <TrendingUp className="h-4 w-4 text-green-600" />;
        case 'down':
            return <TrendingDown className="h-4 w-4 text-red-600" />;
        default:
            return <Minus className="h-4 w-4 text-gray-400" />;
        }
    };

    const getTrendColor = () => {
        switch (trend) {
        case 'up':
            return 'text-green-600';
        case 'down':
            return 'text-red-600';
        default:
            return 'text-gray-500';
        }
    };

    const cardClass = onClick ? 'cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200' : '';
    const currentColor = colorClasses[color] || colorClasses.blue;

    if (loading) {
        return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
            <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
        </div>
        );
    }

    return (
        <div 
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${cardClass} ${className}`}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
        >
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 leading-tight">{title}</h3>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${currentColor.bg}`}>
            <Icon className={`h-5 w-5 ${currentColor.text}`} />
            </div>
        </div>
        
        <div className="flex items-end justify-between">
            <div className="flex-1">
            <p className={`text-2xl font-bold ${currentColor.value} leading-none`}>
                {value}
            </p>
            </div>
            
            {(trend || trendValue) && (
            <div className={`flex items-center text-sm ml-4 ${getTrendColor()}`}>
                {trend && getTrendIcon()}
                {trendValue && (
                <span className="font-medium ml-1">{trendValue}</span>
                )}
            </div>
            )}
        </div>

        {(trend || trendValue) && (
            <div className="mt-2">
            <p className="text-xs text-gray-500">
                dari periode sebelumnya
            </p>
            </div>
        )}
        </div>
    );
});

StatCard.displayName = 'StatCard';

export default StatCard;