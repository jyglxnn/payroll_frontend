"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    ArrowLeft,
    MapPin,
    Users,
    Briefcase,
    Calendar,
    Plus,
    Archive,
    RotateCcw,
    Edit,
    Search,
    FolderKanban,
    Timer,
    CheckSquare,
    AlertTriangle,
    Clock,
} from "lucide-react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import Loading from "@/app/components/ui/Loading";
import { SitesService } from "@/services/sites_srv";
import { Site } from "@/api/types";

const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    Pending: { color: "text-gray-700", bg: "bg-gray-100", icon: <Clock className="w-3 h-3" /> },
    Ongoing: { color: "text-blue-700", bg: "bg-blue-100", icon: <Timer className="w-3 h-3" /> },
    Done: { color: "text-green-700", bg: "bg-green-100", icon: <CheckSquare className="w-3 h-3" /> },
    Hold: { color: "text-yellow-700", bg: "bg-yellow-100", icon: <AlertTriangle className="w-3 h-3" /> },
    Archive: { color: "text-red-700", bg: "bg-red-100", icon: <Archive className="w-3 h-3" /> },
};

export default function SiteDetailPage() {
    const router = useRouter();
    const params = useParams();
    const siteId = params.siteId as string;

    const [isLoading, setIsLoading] = useState(true);
    const [site, setSite] = useState<Site | null>(null);
    const [activeTab, setActiveTab] = useState<"projects" | "employees">("employees");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchSite = async () => {
            try {
                setIsLoading(true);
                const data = await SitesService.getSiteById(siteId);
                setSite(data);
            } catch (error) {
                console.error("Error fetching site:", error);
                toast.error("Failed to load site data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSite();
    }, [siteId]);

    const handleArchiveToggle = async () => {
        if (!site) return;
        const newStatus = !site.isArchived;

        toast.promise(
            SitesService.updateSite(siteId, { is_archive: newStatus }),
            {
                loading: newStatus ? "Archiving site..." : "Restoring site...",
                success: () => {
                    router.push("/sites");
                    router.refresh();
                    return <b>Site {newStatus ? "archived" : "restored"} successfully!</b>;
                },
                error: <b>Failed to update site status.</b>,
            }
        );
    };

    if (isLoading) {
        return <Loading message="Loading site details..." />;
    }

    if (!site) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <p className="text-gray-500">Site record not found.</p>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const filteredEmployees = (site.employees || []).filter((emp) =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        emp.jobTitle?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredProjects = (site.projects || []).filter((proj) =>
        proj.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10 px-4 md:px-8 py-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Sites
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 text-xs font-bold" onClick={handleArchiveToggle}>
                        {site.isArchived ? (
                            <><RotateCcw className="h-4 w-4" /> Reactivate Site</>
                        ) : (
                            <><Archive className="h-4 w-4" /> Archive Site</>
                        )}
                    </Button>
                    {!site.isArchived && (
                        <Link href={`/sites/${siteId}/edit`}>
                            <Button variant="solid" className="gap-2 text-xs font-bold">
                                <Edit className="h-4 w-4" /> Edit Details
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Hero Banner */}
            <div className={`bg-[#03045e] text-white rounded-2xl shadow-xl overflow-hidden relative min-h-[280px] flex flex-col justify-end ${site.isArchived ? "grayscale" : ""}`}>
                {site.image && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={site.image}
                            alt={site.name}
                            className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#03045e] via-[#03045e]/60 to-transparent" />
                    </div>
                )}

                <div className="p-10 relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="bg-green-200 text-[#03045e] font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-full">
                            {site.isArchived ? "Historic Site Profile" : "Work Site Profile"}
                        </span>
                        <span className="border border-white/20 text-white uppercase text-[10px] tracking-widest px-3 py-1 rounded-full">
                            {site.isArchived ? "Archived" : "Active Site"}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight uppercase">{site.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm font-medium">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" /> {site.address || "No address set"}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-white/30" />
                        <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" /> {site.employeeCount} Employees
                        </span>
                        <span className="h-1 w-1 rounded-full bg-white/30" />
                        <span className="flex items-center gap-1.5">
                            <FolderKanban className="h-4 w-4" /> {site.projectCount} Projects
                        </span>
                    </div>
                    {site.description && (
                        <p className="text-white/70 text-sm max-w-2xl font-medium leading-relaxed mt-2">
                            {site.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white border rounded-lg p-1 w-max">
                <button
                    onClick={() => { setActiveTab("employees"); setSearch(""); }}
                    className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
                        activeTab === "employees"
                            ? "bg-[#03045e] text-white"
                            : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                    <Users className="h-3.5 w-3.5" /> Employees ({site.employeeCount})
                </button>
                <button
                    onClick={() => { setActiveTab("projects"); setSearch(""); }}
                    className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
                        activeTab === "projects"
                            ? "bg-[#03045e] text-white"
                            : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                    <Briefcase className="h-3.5 w-3.5" /> Projects ({site.projectCount})
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 w-full max-w-md bg-white border border-gray-300 rounded-lg px-4 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder={activeTab === "employees" ? "Search employees..." : "Search projects..."}
                    className="w-full outline-none text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Employees Tab */}
            {activeTab === "employees" && (
                <div className="space-y-4">
                    {filteredEmployees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
                            <Users className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-sm font-medium text-gray-500 mb-4">
                                No employees assigned to this site yet.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="text-left text-xs font-bold uppercase tracking-widest text-gray-500 px-6 py-3">Employee</th>
                                        <th className="text-left text-xs font-bold uppercase tracking-widest text-gray-500 px-6 py-3">Job Title</th>
                                        <th className="text-left text-xs font-bold uppercase tracking-widest text-gray-500 px-6 py-3">Email</th>
                                        <th className="text-left text-xs font-bold uppercase tracking-widest text-gray-500 px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.employeeId} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-[#03045e] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                                                    </div>
                                                    <span className="font-semibold text-sm">{emp.firstName} {emp.lastName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{emp.jobTitle || "—"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{emp.email || "—"}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${
                                                    emp.isActive ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                                                }`}>
                                                    {emp.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Projects Tab */}
            {activeTab === "projects" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.length > 0 ? (
                            <>
                                {filteredProjects.map((proj) => {
                                    const cfg = statusConfig[proj.status] || statusConfig.Pending;
                                    return (
                                        <div key={proj.projectId} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all group">
                                            <div className="h-1.5 bg-[#03045e] w-full" />
                                            <div className="p-6 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-full flex items-center gap-1 ${cfg.color} ${cfg.bg}`}>
                                                        {cfg.icon} {proj.status}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" /> {new Date(proj.endedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-black leading-tight">{proj.name}</h3>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(proj.startedAt).toLocaleDateString()} — {new Date(proj.endedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {!site.isArchived && (
                                    <Link
                                        href="/sites/projects/new"
                                        className="flex flex-col items-center justify-center min-h-[180px] rounded-xl border-2 border-dashed border-gray-300 hover:border-[#03045e]/30 hover:bg-gray-50 transition-all group"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Plus className="h-5 w-5 text-[#03045e]" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            Draft New Project
                                        </span>
                                    </Link>
                                )}
                            </>
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
                                <p className="text-sm font-medium text-gray-500 mb-4">
                                    No projects assigned to this site yet.
                                </p>
                                {!site.isArchived && (
                                    <Link href="/sites/projects/new">
                                        <Button variant="solid" className="gap-2 text-xs">
                                            <Plus className="h-4 w-4" /> Create First Project
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
