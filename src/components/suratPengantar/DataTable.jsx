// src/components/suratPengantar/DataTable.jsx
import React, { memo, useMemo } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

const DataTable = memo(({ 
    columns = [], 
    data = [], 
    loading = false,
    pagination,
    onPageChange,
    emptyMessage = "Tidak ada data",
    emptyDescription = "Belum ada data yang tersedia untuk ditampilkan",
    emptyIcon: EmptyIcon = FileText,
    className = ''
}) => {
    // Memoized rows untuk optimasi performa
    const memoizedRows = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        return data.map((row, index) => (
        <tr key={row.id || index} className="hover:bg-gray-50 transition-colors duration-150">
            {columns.map((column, colIndex) => (
            <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                {column.render ? column.render(row, index) : row[column.key] || '-'}
            </td>
            ))}
        </tr>
        ));
    }, [data, columns]);

    // Loading skeleton
    const LoadingSkeleton = memo(() => (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
        <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-4">
                {columns.map((_, index) => (
                <div key={index} className="h-4 bg-gray-200 rounded flex-1"></div>
                ))}
            </div>
            </div>
            
            {/* Rows skeleton */}
            {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-200">
                <div className="flex space-x-4">
                {columns.map((_, colIndex) => (
                    <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
                ))}
                </div>
            </div>
            ))}
        </div>
        </div>
    ));

    // Empty state
    const EmptyState = memo(() => (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="text-center py-12 px-6">
            <EmptyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
            {emptyMessage}
            </h3>
            <p className="text-gray-500">
            {emptyDescription}
            </p>
        </div>
        </div>
    ));

    // Pagination component
    const Pagination = memo(({ pagination, onPageChange }) => {
        if (!pagination || pagination.totalPages <= 1) return null;

        const { currentPage, totalPages, total, limit = 10 } = pagination;
        const startItem = ((currentPage - 1) * limit) + 1;
        const endItem = Math.min(currentPage * limit, total);

        // Generate page numbers (max 5 pages shown)
        const getPageNumbers = () => {
        const pages = [];
        const maxPages = Math.min(5, totalPages);
        
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxPages - 1);
        
        // Adjust start if we're near the end
        if (endPage - startPage < maxPages - 1) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return pages;
        };

        return (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
            {/* Mobile pagination */}
            <div className="flex-1 flex justify-between sm:hidden">
                <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                Sebelumnya
                </button>
                <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                Selanjutnya
                </button>
            </div>

            {/* Desktop pagination */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                <p className="text-sm text-gray-700">
                    Menampilkan{' '}
                    <span className="font-medium">{startItem}</span>
                    {' '}sampai{' '}
                    <span className="font-medium">{endItem}</span>
                    {' '}dari{' '}
                    <span className="font-medium">{total}</span>
                    {' '}hasil
                </p>
                </div>
                
                <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {/* Previous button */}
                    <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                    <span className="sr-only">Sebelumnya</span>
                    <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Page numbers */}
                    {getPageNumbers().map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                        currentPage === pageNum
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {pageNum}
                    </button>
                    ))}

                    {/* Next button */}
                    <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                    <span className="sr-only">Selanjutnya</span>
                    <ChevronRight className="h-5 w-5" />
                    </button>
                </nav>
                </div>
            </div>
            </div>
        </div>
        );
    });

    // Main render
    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!data || data.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
        {/* Table */}
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                {columns.map((column, index) => (
                    <th 
                    key={column.key || index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: column.width }}
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
        <Pagination pagination={pagination} onPageChange={onPageChange} />
        </div>
    );
});

DataTable.displayName = 'DataTable';

export default DataTable;