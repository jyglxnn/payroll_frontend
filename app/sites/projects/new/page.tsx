"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, CirclePlus } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { SitesService, ProjectsService } from "@/services/sites_srv";
import { Site, ProjectStatus } from "@/api/types";
import { inputClasses } from "@/app/components/ui/styles";

export default function NewProjectPage() {
    const router = useRouter();
    const [sites, setSites] = useState<Site[]>([]);
    const [selectedSites, setSelectedSites] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startedAt: "",
        endedAt: "",
        status: "Pending" as ProjectStatus,
    });

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const data = await SitesService.getSites();
                setSites(data.filter(s => !s.isArchived));
            } catch (error) {
                console.error("Failed to load sites", error);
            }
        };
        fetchSites();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSite = (siteId: string) => {
        setSelectedSites((prev) =>
            prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
        );
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error("Project name is required.");
            return;
        }
        if (!formData.startedAt || !formData.endedAt) {
            toast.error("Start and end dates are required.");
            return;
        }

        const createAction = async () => {
            return await ProjectsService.createProject({
                name: formData.name,
                description: formData.description,
                sites: selectedSites,
                started_at: new Date(formData.startedAt).toISOString(),
                ended_at: new Date(formData.endedAt).toISOString(),
                status: formData.status,
            });
        };

        toast.promise(createAction(), {
            loading: "Creating project...",
            success: () => {
                router.push("/sites/projects");
                router.refresh();
                return <b>Project created successfully!</b>;
            },
            error: <b>Failed to create project. Please check your inputs.</b>,
        });
    };

    return (
        <div className="space-y-4 md:px-16 py-8">
            <Button variant="ghost" className="flex items-center gap-4" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5 cursor-pointer" />
                <h2 className="font-bold text-lg"> Back to Projects </h2>
            </Button>

            <div className="flex flex-col max-w-[96vw] md:max-w-[48rem] rounded-md shadow-md mx-auto overflow-hidden">
                <div className="flex gap-4 p-8 items-center bg-[#03045e]">
                    <div className="p-4 border-2 border-green-200 rounded-lg">
                        <CirclePlus className="text-green-200 w-6 h-6" />
                    </div>
                    <div className="text-white">
                        <p className="text-2xl font-black uppercase"> New Project </p>
                        <p> Define a new project with timelines and assigned sites. </p>
                    </div>
                </div>

                <div className="p-8 bg-white space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold"> Project Name </label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Building Renovation Phase 1" className={inputClasses} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-semibold"> Description </label>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the scope and objectives of this project..." className={inputClasses} rows={4} />
                    </div>

                    <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-4">
                        <h2 className="text-lg uppercase font-black"> Timeline </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold"> Start Date </label>
                                <input type="date" name="startedAt" value={formData.startedAt} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold"> End Date </label>
                                <input type="date" name="endedAt" value={formData.endedAt} onChange={handleChange} className={inputClasses} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold"> Status </label>
                            <select name="status" value={formData.status} onChange={handleChange} className={inputClasses}>
                                <option value="Pending">Pending</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Hold">Hold</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-4">
                        <h2 className="text-lg uppercase font-black"> Assign Sites </h2>
                        <p className="text-sm text-gray-500"> Select which sites this project is associated with. </p>

                        {sites.length === 0 ? (
                            <p className="text-gray-400 text-sm">No active sites available.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {sites.map((site) => (
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

                    <div className="grid grid-cols-1 md:grid-cols-3 border-t-2 border-gray-200 border-dashed pt-4 gap-4">
                        <Button variant="solid" className="md:col-span-2" onClick={handleSubmit}> Create Project </Button>
                        <Button variant="outline" className="md:col-span-1" onClick={() => router.back()}> Cancel </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
