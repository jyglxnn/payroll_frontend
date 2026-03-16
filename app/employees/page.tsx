"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Search, UserPlus, Mail, MapPin, Briefcase } from "lucide-react";
import Button from "@/app/components/ui/Button";
import Loading from "@/app/components/ui/Loading";
import SearchInput from "@/app/components/ui/SearchInput";
import PaginatedSection from "@/app/components/Pagnation";
import { EmployeesService } from "@/services/employees_srv";
import { Employee } from "@/api/types";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setIsLoading(true);
                const data = await EmployeesService.getEmployees();
                setEmployees(data);
            } catch (err) {
                console.error("Failed to fetch employees:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    if (isLoading) return <Loading message="Loading employees..." />;

    const q = search.toLowerCase();
    const filtered = employees
        .filter((e) => (showInactive ? !e.isActive : e.isActive))
        .filter(
            (e) =>
                e.firstName.toLowerCase().includes(q) ||
                e.lastName.toLowerCase().includes(q) ||
                e.jobTitle.toLowerCase().includes(q) ||
                e.email?.toLowerCase().includes(q) ||
                e.sites.some((s) => s.name.toLowerCase().includes(q))
        );

    const activeCount = employees.filter((e) => e.isActive).length;
    const inactiveCount = employees.filter((e) => !e.isActive).length;

    return (
        <div className="p-8 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-2xl uppercase font-black tracking-wide">Employees</p>
                    <p className="text-gray-500">
                        {activeCount} active {inactiveCount > 0 && `· ${inactiveCount} inactive`}
                    </p>
                </div>
                <Link href="/employees/new">
                    <Button variant="solid" className="gap-2 p-4">
                        <UserPlus className="w-5 h-5" />
                        <span className="hidden lg:block">Add Employee</span>
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <SearchInput value={search} onChange={setSearch} placeholder="Search by name, job, email, or site..." />
                </div>
                <button
                    onClick={() => setShowInactive(!showInactive)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                        showInactive
                            ? "bg-gray-700 border-gray-700 text-white"
                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
                    }`}
                >
                    {showInactive ? "Showing Inactive" : "Show Inactive"}
                </button>
            </div>

            {/* List */}
            <PaginatedSection
                title={showInactive ? "Inactive Employees" : "Active Employees"}
                items={filtered}
                itemsPerPage={10}
                emptyMessage="No employees found."
                renderItem={(emp: Employee) => (
                    <li key={emp.id}>
                        <Link
                            href={`/employees/${emp.id}`}
                            className="flex items-center justify-between border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
                        >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                {emp.image ? (
                                    <img
                                        src={emp.image}
                                        alt={`${emp.firstName} ${emp.lastName}`}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-[#03045e] flex items-center justify-center text-white font-black text-lg">
                                        {emp.firstName[0]}
                                        {emp.lastName[0]}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">
                                        {emp.firstName} {emp.lastName}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Briefcase className="w-3 h-3" /> {emp.jobTitle || "No job assigned"}
                                        </span>
                                        {emp.email && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Mail className="w-3 h-3" /> {emp.email}
                                            </span>
                                        )}
                                        {emp.sites.length > 0 && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <MapPin className="w-3 h-3" /> {emp.sites.map((s) => s.name).join(", ")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="shrink-0 ml-3">
                                <span
                                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                                        emp.isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    {emp.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </Link>
                    </li>
                )}
            />
        </div>
    );
}
