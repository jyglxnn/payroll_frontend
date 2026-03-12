"use client";

import { useEffect, useState } from "react";
import { Plus, Building2, Search, MapPin, Layers, Users, FolderKanban, Settings2 } from "lucide-react";
import { Site } from "@/api/types";
import { SitesService } from "@/services/sites_srv";
import PaginatedSection from "@/app/components/Pagnation";
import Loading from "@/app/components/ui/Loading";
import Link from "next/link";
import Button from "../components/ui/Button";
import { MEDIA_URL_BASE } from "@/api/api";

export default function SitesPage(){
    const [sites, setSites] = useState<Site[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showArchived, setShowArchived] = useState(false);

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const data = await SitesService.getSites();
                setSites(data);
            } catch (error) {
                console.error("Failed to load sites", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSites();
    }, []);

    const filteredSites = sites.filter((site) => {
        const matchesSearch = site.name.toLowerCase().includes(search.toLowerCase()) || site.address?.toLowerCase().includes(search.toLowerCase());
        const matchesArchive = showArchived ? site.isArchived : !site.isArchived;
        return matchesSearch && matchesArchive;
    });

    const activeSites = sites.filter(s => !s.isArchived);
    const archivedSites = sites.filter(s => s.isArchived);

    const bagdesClass = "text-xs font-semibold uppercase tracking-wide px-4 py-1 rounded-full absolute bottom-2 right-2";

    if (isLoading) {
        return <Loading message="Loading sites library..." />;
    }

    return (
        <div className="p-8 space-y-2">
            <div className="flex justify-between items-center gap-8">
                <div> 
                    <h2 className="text-2xl uppercase font-black tracking-wide"> Sites & Projects Library </h2>
                    <p>Organize work locations and track ongoing project timelines.</p>
                </div>

                <div className="flex gap-4">
                    <Button variant={showArchived ? "solid" : "outline"} className="px-8 gap-4" onClick={() => setShowArchived(!showArchived)}> <Layers /> {showArchived ? "Active" : "Archive"} </Button>
                    <Link href="/sites/new">
                        <Button variant="solid" className="flex items-center gap-4 px-8"> <Plus /> <span className="hidden md:block">Register Site</span> </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 w-full">
                <div className="space-y-2 w-full">
                    <div className="flex items-center gap-2 w-full bg-white border border-gray-300 rounded-lg px-4 py-2">
                        <Search className="w-5 h-5"/>
                        <input 
                            type="text" 
                            placeholder={showArchived ? "Search archived sites..." : "Search active sites registered..."} 
                            className="w-full outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {filteredSites.length === 0 ? (
                        <div className="flex p-8 border-2 border-dashed bg-white shadow-md rounded-lg border-gray-300">
                            <div className="flex py-24 gap-2 w-full justify-center"> <Building2 /> No Sites Found </div>
                        </div> 
                    ) : (
                        <PaginatedSection 
                            title=""
                            items={filteredSites}
                            emptyMessage=""
                            itemsPerPage={9}
                            gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            renderItem={(site: Site, index: number) => (
                                <Link key={site.id} href={`/sites/${site.id}`}>
                                    <div className="flex flex-col gap-4 rounded-lg justify-center overflow-hidden hover:shadow-lg duration-500 cursor-pointer bg-white shadow-md">
                                        <div className="relative bg-gray-300 w-full h-[24vh] overflow-hidden"> 
                                            {site.image && (
                                                <img src={site.image} alt={site.name} className="w-full h-full object-cover" />
                                            )}
                                            <div className={`${bagdesClass} ${site.isArchived ? "text-red-700 bg-red-200" : "text-green-700 bg-green-200"}`}> 
                                                {site.isArchived ? "archived" : "active"} 
                                            </div>
                                        </div>
                                        <div className="px-4 pb-4">
                                            <p className="text-lg font-bold"> {site.name} </p>
                                            <div className="flex gap-2 items-center text-sm text-gray-500">
                                                <MapPin className="w-4 h-4" /> {site.address || "No address"}
                                            </div>
                                            <p className="mt-4 text-sm text-gray-600 line-clamp-2"> {site.description} </p>
                                            <div className="flex gap-4 mt-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {site.employeeCount}</div>
                                                <div className="flex items-center gap-1"><FolderKanban className="w-4 h-4" /> {site.projectCount}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        />
                    )}
                    
                </div>

                <div className="p-8 bg-[#03045e] text-white shadow-md rounded-md lg:w-[32vw] h-max">
                    <p className="tracker-widest font-black uppercase tracking-[0.2em]"> Operational Status </p>
                    <div className="mt-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-300"> Active Sites </p>
                            <p className="text-2xl font-black"> {activeSites.length} </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-300"> Archived Sites </p>
                            <p className="text-2xl font-black"> {archivedSites.length} </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-300"> Total Sites </p>
                            <p className="text-2xl font-black"> {sites.length} </p>
                        </div>
                        <div className="border-t border-gray-500 pt-4 mt-4">
                            <Link href="/sites/projects">
                                <Button variant="outline" className="w-full gap-4 text-white border-white hover:bg-white/10">
                                    <FolderKanban className="w-5 h-5"/> View Projects
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>    
    )
}