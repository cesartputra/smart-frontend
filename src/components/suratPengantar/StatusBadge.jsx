// src/components/suratPengantar/StatusBadge.jsx
import React, { memo } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const StatusBadge = memo(({ status, size = 'sm' }) => {
    const statusConfig = {
        'DRAFT': {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Clock,
        text: 'Draft'
        },
        'SUBMITTED': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock,
        text: 'Diajukan'
        },
        'RT_APPROVED': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle,
        text: 'Menunggu RW'
        },
        'COMPLETED': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        text: 'Selesai'
        },
        'REJECTED': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        text: 'Ditolak'
        }
    };

    const config = statusConfig[status] || statusConfig['DRAFT'];
    const Icon = config.icon;
    
    const sizeClasses = {
        xs: 'px-2 py-0.5 text-xs',
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-sm'
    };

    const iconSizes = {
        xs: 'h-2.5 w-2.5',
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5'
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}>
        <Icon className={`mr-1 ${iconSizes[size]}`} />
        {config.text}
        </span>
    );
    });

    StatusBadge.displayName = 'StatusBadge';

    // src/components/suratPengantar/StatCard.jsx
    import React, { memo } from 'react';

    const StatCard = memo(({ 
    title, 
    value, 
    icon: Icon, 
    color = 'blue', 
    trend, 
    trendValue,
    onClick,
    loading = false
    }) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        yellow: 'text-yellow-600 bg-yellow-50',
        red: 'text-red-600 bg-red-50',
        purple: 'text-purple-600 bg-purple-50',
        indigo: 'text-indigo-600 bg-indigo-50'
    };

    const cardClass = onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : '';

    if (loading) {
        return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
        </div>
        );
    }

    return (
        <div 
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${cardClass}`}
        onClick={onClick}
        >
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
            </div>
        </div>
        
        <div className="flex items-baseline justify-between">
            <p className={`text-2xl font-bold ${color === 'blue' ? 'text-blue-600' : 
                        color === 'green' ? 'text-green-600' :
                        color === 'yellow' ? 'text-yellow-600' :
                        color === 'red' ? 'text-red-600' :
                        color === 'purple' ? 'text-purple-600' :
                        'text-indigo-600'}`}>
            {value}
            </p>
            
            {trend && (
            <div className={`flex items-center text-sm ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-gray-500'
            }`}>
                {trendValue && (
                <span className="font-medium">{trendValue}</span>
                )}
            </div>
            )}
        </div>
        </div>
    );
    });

    StatCard.displayName = 'StatCard';

    // src/components/suratPengantar/DataTable.jsx
    import React, { memo, useMemo } from 'react';
    import { ChevronLeft, ChevronRight } from 'lucide-react';

    const DataTable = memo(({ 
    columns, 
    data = [], 
    loading = false,
    pagination,
    onPageChange,
    emptyMessage = "Tidak ada data",
    emptyIcon: EmptyIcon
    }) => {
    const memoizedRows = useMemo(() => {
        return data.map((row, index) => (
        <tr key={row.id || index} className="hover:bg-gray-50 transition-colors duration-150">
            {columns.map((column, colIndex) => (
            <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                {column.render ? column.render(row) : row[column.key]}
            </td>
            ))}
        </tr>
        ));
    }, [data, columns]);

    if (loading) {
        return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="animate-pulse">
            <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4 border-b border-gray-200">
                <div className="flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                </div>
                </div>
            ))}
            </div>
        </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {data.length === 0 ? (
            <div className="text-center py-12">
            {EmptyIcon && <EmptyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
                {emptyMessage}
            </h3>
            </div>
        ) : (
            <>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    {columns.map((column, index) => (
                        <th 
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                        {column.title}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {memoizedRows}
                </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => onPageChange(Math.max(1, pagination.currentPage - 1))}
                        disabled={pagination.currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sebelumnya
                    </button>
                    <button
                        onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Selanjutnya
                    </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                        Menampilkan{' '}
                        <span className="font-medium">
                            {((pagination.currentPage - 1) * (pagination.limit || 10)) + 1}
                        </span>{' '}
                        sampai{' '}
                        <span className="font-medium">
                            {Math.min(pagination.currentPage * (pagination.limit || 10), pagination.total)}
                        </span>{' '}
                        dari{' '}
                        <span className="font-medium">{pagination.total}</span>{' '}
                        hasil
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                            onClick={() => onPageChange(Math.max(1, pagination.currentPage - 1))}
                            disabled={pagination.currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pagination.currentPage === pageNum
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {pageNum}
                            </button>
                            );
                        })}

                        <button
                            onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                        </nav>
                    </div>
                    </div>
                </div>
                </div>
            )}
            </>
        )}
        </div>
    );
});

DataTable.displayName = 'DataTable';

export { StatusBadge, StatCard, DataTable };