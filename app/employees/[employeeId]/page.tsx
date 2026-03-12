"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    ArrowLeft,
    Clock,
    User,
    FolderKanban,
    Calendar,
    Briefcase,
    Mail,
    MapPin,
    Timer,
    Coffee,
    LogIn,
    LogOut,
} from "lucide-react";
import Button from "@/app/components/ui/Button";
import Loading from "@/app/components/ui/Loading";
import SearchInput from "@/app/components/ui/SearchInput";
import PaginatedSection from "@/app/components/Pagnation";
import { EmployeesService } from "@/services/employees_srv";
import { EmployeeDetail, DailyTimeRecord } from "@/api/types";

const statusColors: Record<string, { bg: string; text: string }> = {
    present: { bg: "bg-green-100", text: "text-green-700" },
    late: { bg: "bg-yellow-100", text: "text-yellow-700" },
    waiting: { bg: "bg-gray-100", text: "text-gray-500" },
    leave: { bg: "bg-blue-100", text: "text-blue-700" },
    excuse: { bg: "bg-purple-100", text: "text-purple-700" },
};

function formatTime(t: string | null) {
    if (!t) return "--:--";
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

export default function EmployeeDetailPage() {
    const router = useRouter();
    const params = useParams();
    const employeeId = params.employeeId as string;

    const [isLoading, setIsLoading] = useState(true);
    const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
    const [activeTab, setActiveTab] = useState<"dtr" | "info" | "projects">("dtr");
    const [dtrSearch, setDtrSearch] = useState("");

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                setIsLoading(true);
                const data = await EmployeesService.getEmployeeById(employeeId);
                setEmployee(data);
            } catch (error) {
                console.error("Error fetching employee:", error);
                toast.error("Failed to load employee data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployee();
    }, [employeeId]);

    if (isLoading) return <Loading message="Loading employee data..." />;
    if (!employee) return <div className="p-8 text-red-500">Employee not found.</div>;

    const q = dtrSearch.toLowerCase();
    const filteredRecords = employee.timeRecords.filter(
        (r) =>
            r.today.includes(q) ||
            r.status.toLowerCase().includes(q)
    );

    const sortedRecords = [...filteredRecords].sort(
        (a, b) => new Date(b.today).getTime() - new Date(a.today).getTime()
    );

    const tabs = [
        { id: "dtr", label: "Time Records", icon: Clock },
        { id: "info", label: "Information", icon: User },
        { id: "projects", label: "Sites & Projects", icon: FolderKanban },
    ] as const;

    return (
        <div className="p-8 space-y-4">
            {/* Header */}
            <div className="flex justify-start w-full">
                <Button variant="ghost" onClick={() => router.back()} className="gap-4">
                    <ArrowLeft className="h-6 w-6" />
                    <p className="font-bold text-lg">Back to Employees</p>
                </Button>
            </div>

            {/* Hero */}
            <div className="flex flex-col md:flex-row items-center gap-6 bg-[#03045e] text-white rounded-xl p-8">
                {employee.image ? (
                    <img
                        src={employee.image}
                        alt={employee.fullName}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-black">
                        {employee.firstName[0]}{employee.lastName[0]}
                    </div>
                )}
                <div className="text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-black uppercase">
                        {employee.firstName} {employee.lastName}
                    </h1>
                    <p className="text-white/70 text-lg">{employee.jobTitle || "No position"}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-white/60">
                        {employee.email && (
                            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {employee.email}</span>
                        )}
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> Joined {new Date(employee.joinedAt).toLocaleDateString()}
                        </span>
                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${employee.isActive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                            {employee.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                            activeTab === tab.id
                                ? "bg-[#03045e] border-[#03045e] text-white"
                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* DTR Tab */}
            {activeTab === "dtr" && (
                <div className="space-y-3">
                    <SearchInput value={dtrSearch} onChange={setDtrSearch} placeholder="Search by date or status..." />
                    <PaginatedSection
                        title="Daily Time Records"
                        items={sortedRecords}
                        itemsPerPage={10}
                        emptyMessage="No time records found."
                        renderItem={(record: DailyTimeRecord) => {
                            const cfg = statusColors[record.status] || statusColors.waiting;
                            return (
                                <li key={record.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        {/* Date & Status */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center bg-gray-50 rounded-lg px-3 py-2 min-w-[60px]">
                                                <span className="text-xs text-gray-400 uppercase">
                                                    {new Date(record.today).toLocaleDateString("en-US", { weekday: "short" })}
                                                </span>
                                                <span className="text-lg font-black text-gray-800">
                                                    {new Date(record.today).getDate()}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(record.today).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                                </span>
                                            </div>
                                            <div>
                                                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full uppercase ${cfg.bg} ${cfg.text}`}>
                                                    {record.status}
                                                </span>
                                                {record.minsLate && record.minsLate > 0 && (
                                                    <p className="text-xs text-red-500 mt-1 font-semibold">{record.minsLate} min(s) late</p>
                                                )}
                                                {record.note && (
                                                    <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{record.note}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Time entries */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                                            <div className="bg-blue-50 rounded-lg px-3 py-2">
                                                <LogIn className="w-3.5 h-3.5 mx-auto text-blue-500 mb-1" />
                                                <p className="text-gray-400">AM In</p>
                                                <p className="font-bold text-gray-700">{formatTime(record.timeinAm)}</p>
                                            </div>
                                            <div className="bg-orange-50 rounded-lg px-3 py-2">
                                                <LogOut className="w-3.5 h-3.5 mx-auto text-orange-500 mb-1" />
                                                <p className="text-gray-400">AM Out</p>
                                                <p className="font-bold text-gray-700">{formatTime(record.timeoutAm)}</p>
                                            </div>
                                            <div className="bg-blue-50 rounded-lg px-3 py-2">
                                                <LogIn className="w-3.5 h-3.5 mx-auto text-blue-500 mb-1" />
                                                <p className="text-gray-400">PM In</p>
                                                <p className="font-bold text-gray-700">{formatTime(record.timeinPm)}</p>
                                            </div>
                                            <div className="bg-orange-50 rounded-lg px-3 py-2">
                                                <LogOut className="w-3.5 h-3.5 mx-auto text-orange-500 mb-1" />
                                                <p className="text-gray-400">PM Out</p>
                                                <p className="font-bold text-gray-700">{formatTime(record.timeoutPm)}</p>
                                            </div>
                                        </div>

                                        {/* Hours summary */}
                                        <div className="flex gap-3 text-center text-xs shrink-0">
                                            <div className="bg-gray-50 rounded-lg px-3 py-2">
                                                <Timer className="w-3.5 h-3.5 mx-auto text-gray-400 mb-1" />
                                                <p className="text-gray-400">Hours</p>
                                                <p className="font-black text-gray-800">{(record.amHours + record.pmHours).toFixed(1)}h</p>
                                            </div>
                                            <div className="bg-green-50 rounded-lg px-3 py-2">
                                                <Coffee className="w-3.5 h-3.5 mx-auto text-green-500 mb-1" />
                                                <p className="text-gray-400">OT</p>
                                                <p className="font-black text-green-700">{record.overtime.toFixed(1)}h</p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        }}
                    />
                </div>
            )}

            {/* Info Tab */}
            {activeTab === "info" && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
                    <h2 className="text-lg font-black text-gray-800 uppercase">Employee Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoField label="Full Name" value={`${employee.firstName} ${employee.lastName}`} icon={<User className="w-4 h-4" />} />
                        <InfoField label="Email" value={employee.email || "Not provided"} icon={<Mail className="w-4 h-4" />} />
                        <InfoField label="Job Title" value={employee.jobTitle || "Not assigned"} icon={<Briefcase className="w-4 h-4" />} />
                        <InfoField label="Employee ID" value={employee.id} icon={<User className="w-4 h-4" />} />
                        <InfoField label="Date Joined" value={new Date(employee.joinedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} icon={<Calendar className="w-4 h-4" />} />
                        <InfoField label="Status" value={employee.isActive ? "Active" : "Inactive"} icon={<User className="w-4 h-4" />} />
                    </div>

                    {/* Job Details */}
                    {employee.jobDetails && (
                        <div className="border-t border-dashed border-gray-200 pt-6 space-y-4">
                            <h3 className="font-bold text-gray-700">Job Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoField label="Job Name" value={employee.jobDetails.name} />
                                <InfoField label="Description" value={employee.jobDetails.description} />
                                {employee.jobDetails.salary && (
                                    <>
                                        <InfoField label="Salary" value={`₱${employee.jobDetails.salary.amount.toLocaleString()}`} />
                                        <InfoField label="Release Type" value={employee.jobDetails.salary.releaseType} />
                                    </>
                                )}
                                <InfoField label="AM Schedule" value={`${formatTime(employee.jobDetails.timeinAmBase)} - ${formatTime(employee.jobDetails.timeoutAmBase)}`} />
                                <InfoField label="PM Schedule" value={`${formatTime(employee.jobDetails.timeinPmBase)} - ${formatTime(employee.jobDetails.timeoutPmBase)}`} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Projects Tab */}
            {activeTab === "projects" && (
                <div className="space-y-4">
                    {employee.sites.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
                            <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                            <p className="font-semibold">Not assigned to any site</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {employee.sites.map((site) => (
                                <div
                                    key={site.siteId}
                                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => router.push(`/sites/${site.siteId}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-[#03045e]/10 rounded-lg">
                                            <MapPin className="w-5 h-5 text-[#03045e]" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{site.name}</h3>
                                            <p className="text-xs text-gray-400">Tap to view site details</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function InfoField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            {icon && <div className="mt-0.5 text-gray-400">{icon}</div>}
            <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">{label}</p>
                <p className="text-gray-800 font-semibold">{value}</p>
            </div>
        </div>
    );
}
