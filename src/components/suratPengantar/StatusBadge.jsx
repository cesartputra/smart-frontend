// src/components/suratPengantar/StatusBadge.jsx
import React, { memo } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';

const StatusBadge = memo(({ status, size = 'sm', variant = 'default' }) => {
    const statusConfig = {
        'DRAFT': {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: FileText,
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

    // Variant styling
    const variantClasses = {
        default: `border ${config.color}`,
        solid: config.color.replace('100', '500').replace('800', 'white'),
        minimal: config.color.replace('100', '50').replace('border-', ''),
        outline: `border-2 bg-white ${config.color.replace('bg-', 'border-').replace('100', '300')}`
    };

    return (
        <span 
        className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
        title={`Status: ${config.text}`}
        >
        <Icon className={`mr-1 ${iconSizes[size]}`} />
        {config.text}
        </span>
    );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;