"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, MapPin, Receipt, CalendarDays, Briefcase, Scale, Menu, X } from "lucide-react";

const links = [
    { href: "/employees", label: "Employees", icon: Users },
    { href: "/sites", label: "Sites", icon: MapPin },
    { href: "/wages", label: "Wages", icon: Briefcase },
    { href: "/rules", label: "Rules", icon: Scale },
    { href: "/attendance", label: "Attendance", icon: CalendarDays },
    { href: "/payroll", label: "Payroll", icon: Receipt },
];

const Navbar = () => {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [sidebarOpen]);

    return (
        <>
            <nav className="bg-[#03045e] text-white px-6 py-3 shadow-md">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-lg font-black tracking-tight whitespace-nowrap">WARLEN</Link>

                    {/* Desktop links */}
                    <ul className="hidden md:flex items-center gap-1">
                        {links.map((link) => {
                            const isActive = pathname.startsWith(link.href);
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                                            isActive
                                                ? "bg-white/20 text-white"
                                                : "text-white/60 hover:text-white hover:bg-white/10"
                                        }`}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Burger button (mobile) */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            {/* ═══ Mobile sidebar overlay ═══ */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />

                    {/* Sidebar panel */}
                    <div className="absolute top-0 left-0 h-full w-72 bg-[#03045e] shadow-2xl flex flex-col animate-slide-in">
                        {/* Sidebar header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                            <Link href="/" className="text-xl font-black tracking-tight">WARLEN</Link>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Sidebar links */}
                        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                            {links.map((link) => {
                                const isActive = pathname.startsWith(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                            isActive
                                                ? "bg-white/20 text-white"
                                                : "text-white/60 hover:text-white hover:bg-white/10"
                                        }`}
                                    >
                                        <link.icon className="w-5 h-5" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Sidebar footer */}
                        <div className="px-6 py-4 border-t border-white/10">
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Warlen Payroll System</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;