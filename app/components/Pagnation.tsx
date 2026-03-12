"use client"

import { useState, useEffect, ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginatedSectionProps<T> {
    title: string;
    titleColor?: string;
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    emptyMessage: string;
    extraNode?: ReactNode;
    itemsPerPage?: number;
    gridClassName?: string;
}

export default function PaginatedSection<T>({ 
    title, 
    titleColor = "text-black", 
    items, 
    renderItem, 
    emptyMessage, 
    extraNode = null,
    itemsPerPage = 5,
    gridClassName = "space-y-4",

}: PaginatedSectionProps<T>) {
    
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [items]);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="mb-12">
            <h2 className={`text-[16px] mb-4 font-black uppercase tracking-[0.2em] ${titleColor}`}>
                {title}
            </h2>

            {items.length === 0 ? (
                <p className="text-gray-500">{emptyMessage}</p>
            ) : (
                <div className={gridClassName}>
                    {currentItems.map((item, index) => renderItem(item, index))}
                    {}
                    {extraNode && currentPage === totalPages && extraNode}
                </div>
            )}

            {}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <span className="text-sm font-medium text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}