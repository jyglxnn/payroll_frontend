"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, Edit, Users } from "lucide-react";
import Button from "@/app/components/ui/Button";
import Loading from "@/app/components/ui/Loading";
import { SitesService, ProjectsService } from "@/services/sites_srv";
import { Site, Project, ProjectStatus } from "@/api/types";
import { inputClasses } from "@/app/components/ui/styles";

const statusColors: Record<string, string> = {
    Pending: "text-gray-700 bg-gray-100",
    Ongoing: "text-blue-700 bg-blue-100",
    Done: "text-green-700 bg-green-100",
    Hold: "text-yellow-700 bg-yellow-100",
    Archive: "text-red-700 bg-red-100",
};

export default function ProjectDetailPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.projectId as string;

    const [isLoading, setIsLoading] = useState(true);
    const [project, setProject] = useState<Project | null>(null);
    const [allSites, setAllSites] = useState<Site[]>([]);
    const [selectedSites, setSelectedSites] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startedAt: "",
        endedAt: "",
        status: "Pending" as ProjectStatus,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSite = (siteId: string) => {
        setSelectedSites((prev) =>
            prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
        );
    };

    const formatDateTimeLocal = (isoString: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toISOString().slice(0, 16);
    };

    const handleUpdate = async () => {
        if (!formData.name.trim()) {
            toast.error("Project name is required.");
            return;
        }

        toast.promise(
            ProjectsService.updateProject(projectId, {
                name: formData.name,
                description: formData.description,
                sites: selectedSites,
                started_at: new Date(formData.startedAt).toISOString(),
                ended_at: new Date(formData.endedAt).toISOString(),
                status: formData.status,
            }),
            {
                loading: "Saving changes...",
                success: () => {
                    router.push("/sites/projects");
                    router.refresh();
                    return <b>Project updated successfully!</b>;
                },
                error: <b>Failed to update project. Please try again.</b>,
            }
        );
    };

    const handleDelete = () => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <span className="font-semibold text-gray-800">
                    Are you sure you want to delete this project?
                </span>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss()}
                        className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss();
                            await executeDelete();
                        }}
                        className="px-3 py-1 text-sm font-bold bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), {
            duration: 10000,
            position: "top-center",
            style: { border: "1px solid #ff0000", padding: "16px" },
        });
    };

    const executeDelete = async () => {
        const deletePromise = ProjectsService.deleteProject(projectId);

        toast.promise(deletePromise, {
            loading: "Deleting project...",
            success: "Project deleted successfully.",
            error: "Failed to delete project.",
        });

        try {
            const success = await deletePromise;
            if (success) {
                setTimeout(() => {
                    router.push("/sites/projects");
                    router.refresh();
                }, 1000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [projectData, sitesData] = await Promise.all([
                    ProjectsService.getProjectById(projectId),
                    SitesService.getSites(),
                ]);
                setProject(projectData);
                setAllSites(sitesData.filter(s => !s.isArchived));
                setSelectedSites(projectData.sites.map(s => s.siteId));
                setFormData({
                    name: projectData.name,
                    description: projectData.description,
                    startedAt: formatDateTimeLocal(projectData.startedAt),
                    endedAt: formatDateTimeLocal(projectData.endedAt),
                    status: projectData.status,
                });
            } catch (error) {
                console.error("Error fetching project:", error);
                toast.error("Failed to load project data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

    if (isLoading) {
        return <Loading message="Loading project data..." />;
    }

    return (
        <div className="space-y-4 md:px-16 py-8">
            <div className="flex justify-start w-full">
                <Button variant="ghost" onClick={() => router.back()} className="gap-4">
                    <ArrowLeft className="h-6 w-6" />
                    <p className="font-bold text-lg"> Back to Projects </p>
                </Button>
            </div>

            <div className="flex flex-col max-w-[96vw] md:max-w-[48rem] rounded-md shadow-md mx-auto overflow-hidden">
                <div className="flex items-center gap-4 bg-[#03045e] p-8 text-white">
                    <div className="p-4 border-2 border-green-200 rounded-lg">
                        <Edit className="w-6 h-6 text-green-200" />
                    </div>
                    <div>
                        <h2 className="text-2xl uppercase font-black"> Configure Project </h2>
                        <p> Update project details, timeline, and site assignments. </p>
                    </div>
                </div>

                <div className="bg-white p-8 space-y-4">
                    {/* Status + Stats */}
                    {project && (
                        <div className="flex gap-8 pb-4 border-b-2 border-dashed border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4" /> {project.teamCount} Team Members
                            </div>
                            <span className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${statusColors[project.status] || statusColors.Pending}`}>
                                {project.status}
                            </span>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="font-semibold"> Project Name </label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Building Renovation Phase 1" className={inputClasses} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-semibold"> Description </label>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the scope and objectives..." className={inputClasses} rows={4} />
                    </div>

                    <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-4">
                        <h2 className="text-lg uppercase font-black"> Timeline </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold"> Start Date </label>
                                <input type="datetime-local" name="startedAt" value={formData.startedAt} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold"> End Date </label>
                                <input type="datetime-local" name="endedAt" value={formData.endedAt} onChange={handleChange} className={inputClasses} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold"> Status </label>
                            <select name="status" value={formData.status} onChange={handleChange} className={inputClasses}>
                                <option value="Pending">Pending</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Hold">Hold</option>
                                <option value="Done">Done</option>
                                <option value="Archive">Archive</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-4">
                        <h2 className="text-lg uppercase font-black"> Assign Sites </h2>
                        <p className="text-sm text-gray-500"> Select which sites this project is associated with. </p>

                        {allSites.length === 0 ? (
                            <p className="text-gray-400 text-sm">No active sites available.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {allSites.map((site) => (
                                    <div
                                        key={site.id}
                                        onClick={() => toggleSite(site.id)}
                                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                            selectedSites.includes(site.id)
                                                ? "border-[#03045e] bg-[#03045e]/5"
                                                : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                            selectedSites.includes(site.id) ? "border-[#03045e] bg-[#03045e]" : "border-gray-300"
                                        }`}>
                                            {selectedSites.includes(site.id) && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{site.name}</p>
                                            <p className="text-xs text-gray-500">{site.address || "No address"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t-2 border-dashed border-gray-200 pt-4">
                        <Button variant="solid" className="col-span-1" onClick={handleUpdate}>
                            Update Project
                        </Button>
                        <Button variant="outline" className="col-span-1" onClick={() => router.back()}>
                            Discard
                        </Button>
                        <Button variant="warn" className="col-span-1" onClick={handleDelete}>
                            Delete
                        </Button>
                        <Button variant="outline" className="col-span-1" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
