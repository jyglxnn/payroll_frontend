"use client";

import { Search } from "lucide-react";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchInput({ value, onChange, placeholder = "Search...", className = "" }: SearchInputProps) {
    return (
        <div className={`flex items-center gap-2 w-full bg-white border border-gray-300 rounded-lg px-4 py-2 ${className}`}>
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
                type="text"
                placeholder={placeholder}
                className="w-full outline-none text-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
