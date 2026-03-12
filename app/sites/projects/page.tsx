"use client";

import { useEffect, useState } from "react";
import { Plus, FolderKanban, Search, Building2 } from "lucide-react";
import { Project } from "@/api/types";
import { ProjectsService } from "@/services/sites_srv";
import PaginatedSection from "@/app/components/Pagnation";
import Loading from "@/app/components/ui/Loading";
import Link from "next/link";
import Button from "@/app/components/ui/Button";

const statusColors: Record<string, string> = {
    Pending: "text-gray-700 bg-gray-100",
    Ongoing: "text-blue-700 bg-blue-100",
    Done: "text-green-700 bg-green-100",
    Hold: "text-yellow-700 bg-yellow-100",
    Archive: "text-red-700 bg-red-100",
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await ProjectsService.getProjects();
                setProjects(data);
            } catch (error) {
                console.error("Failed to load projects", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.name.toLowerCase().includes(search.toLowerCase()) ||
            project.description.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return <Loading message="Loading projects..." />;
    }

    return (
        <div className="p-8 space-y-2">
            <div className="flex justify-between items-center gap-8">
                <div>
                    <h2 className="text-2xl uppercase font-black tracking-wide"> Projects </h2>
                    <p>Manage and track all ongoing and upcoming projects.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/sites">
                        <Button variant="outline" className="gap-4 px-8">
                            <Building2 className="w-5 h-5" /> Sites
                        </Button>
                    </Link>
                    <Link href="/sites/projects/new">
                        <Button variant="solid" className="flex items-center gap-4 px-8">
                            <Plus /> <span className="hidden md:block">New Project</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2 w-full bg-white border border-gray-300 rounded-lg px-4 py-2">
                    <Search className="w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#03045e]"
                >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Done">Done</option>
                    <option value="Hold">Hold</option>
                    <option value="Archive">Archive</option>
                </select>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="flex p-8 border-2 border-dashed bg-white shadow-md rounded-lg border-gray-300">
                    <div className="flex py-24 gap-2 w-full justify-center">
                        <FolderKanban /> No Projects Found
                    </div>
                </div>
            ) : (
                <PaginatedSection
                    title=""
                    items={filteredProjects}
                    emptyMessage=""
                    itemsPerPage={6}
                    gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    renderItem={(project: Project, index: number) => (
                        <Link key={project.id} href={`/sites/projects/${project.id}`}>
                            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg duration-500 cursor-pointer">
                                <div className="bg-[#03045e] p-1" />
                                <div className="p-6 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-gray-100 p-3 rounded-lg">
                                            <FolderKanban className="w-5 h-5" />
                                        </div>
                                        <span className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${statusColors[project.status] || statusColors.Pending}`}>
                                            {project.status}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-black">{project.name}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                                    </div>

                                    <div className="bg-gray-50 border rounded-lg p-3 space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Start</span>
                                            <span>{new Date(project.startedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">End</span>
                                            <span>{new Date(project.endedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>{project.siteNames?.join(", ") || "No sites"}</span>
                                        <span>{project.teamCount} members</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}
                />
            )}
        </div>
    );
}
