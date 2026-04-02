import React from 'react';
import { Flame } from 'lucide-react';

export default function PriorityBadge({ priority }) {
    const p = (priority || 'medium').toLowerCase();
    
    if (p === 'critical') {
        return (
            <span className="flex items-center gap-1.5 text-red-700 font-bold text-xs bg-red-100 px-2.5 py-1 rounded-full w-max border border-red-200">
                <Flame size={14} className="text-red-600" /> Critical
            </span>
        );
    }
    if (p === 'high') {
        return (
            <span className="flex items-center gap-1.5 text-amber-700 font-bold text-xs bg-amber-100 px-2.5 py-1 rounded-full w-max border border-amber-200">
                High
            </span>
        );
    }
    if (p === 'medium') {
        return (
            <span className="flex items-center gap-1.5 text-blue-700 font-bold text-xs bg-blue-100 px-2.5 py-1 rounded-full w-max border border-blue-200">
                Medium
            </span>
        );
    }
    
    return (
        <span className="flex items-center gap-1.5 text-gray-600 font-bold text-xs bg-gray-100 px-2.5 py-1 rounded-full w-max border border-gray-200">
            Low
        </span>
    );
}
