"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { CirclePlus, Briefcase, Settings2 } from "lucide-react";
import Button from "@/app/components/ui/Button";
import Loading from "@/app/components/ui/Loading";
import { JobsService } from "@/services/jobs_srv";
import { Job } from "@/api/types";

export default function WagesPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await JobsService.getJobs();
                setJobs(data);
            } catch (error) {
                console.error("Failed to load jobs", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);
    
    if (isLoading) {
        return (
            <Loading message="Loading wages library..." />
        );
    }
    return (
        <div className="p-8 space-y-2">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl uppercase font-black"> Wages Library </h2>
                    <p> List of all available wages and configurations of each salary </p>
                </div>
                <Link href="/jobs/new">
                    <Button className="gap-4">
                        <CirclePlus className="w-5 h-5"/>
                        <span className="hidden md:block"> Add New Wage </span>
                    </Button>
                </Link>
            </div>

            {jobs.length === 0 ? (
                <div className="flex flex-col items-center gap-4 p-8">
                    <Briefcase className="w-10 h-10 text-gray-400" />
                    <p className="text-gray-500"> No jobs found. </p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-white rounded-lg shadow-md flex flex-col gap-2 overflow-hidden">
                            <div className="bg-[#03045e] p-1"> </div>

                            <div className="p-8 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="bg-gray-100 p-4 rounded-lg shrink-0 w-max">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div className="text-right">
                                        <div className="border rounded-full px-4 py-1"> monthly </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold"> {job.name} </h3>
                                    <p> {job.description} </p>
                                </div>

                                <div className="flex justify-between items-center bg-gray-200 border p-2 shadow-md rounded-lg">
                                    <p> Base Salary </p>
                                    <span> {job.salary ? `₱${job.salary.amount}` : "Not Set"} </span>
                                </div>

                                <Button variant='solid' className="w-full gap-4">
                                    <Settings2 className="w-5 h-5"/>
                                    <span className="hidden md:block"> Configure </span>
                                </Button>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}