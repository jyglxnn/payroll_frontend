"use client"

import { ButtonHTMLAttributes, ReactNode } from "react"


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "solid" | "warn" | "outline" | "ghost";
    children: ReactNode;
}

export default function Button({ 
    variant = "solid",
    className = "", 
    children, 
    ...props 
}: ButtonProps) {
    
    const baseStyles = "inline-flex items-center justify-center px-4 py-4 text-sm font-bold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        solid: "bg-[#03045e] text-white hover:bg-[#03045e]/64 shadow-sm",
        outline: "bg-transparent text-[#03045e] border-2 border-[#03045e] hover:bg-[#03045e]/10",
        ghost: "bg-transparent text-[#03045e] hover:bg-[#03045e]/10",
        warn: "bg-red-600 text-white hover:bg-red-700 border border-red-700 shadow-sm",
    };

    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}