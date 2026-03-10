"use client"

import { useRouter } from "next/navigation";
import { CirclePlus, ArrowLeft, PhilippinePeso } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { useEffect, useState } from "react";

export default function NewWagePage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        salary : "",
        timeinAmBase : "07:30",
        timeinPmBase : "13:00",
        timeoutAmBase : "11:30",
        timeoutPmBase : "17:00",
        maximumOvertime : "",
        minimumOvertime : "",
    });

    useEffect(() => {
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const inputClasses = "bg-white w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#03045e] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 transition-colors";
    
    return (
        <div className="space-y-4 md:px-16 py-8">
            <div className="flex justify-start w-full">
                <Button variant="ghost" onClick={() =>router.back()} className="gap-4">
                    <ArrowLeft className="h-6 w-6" /> 
                    <p className='font-bold text-lg'> Back to Wages Library </p>
                </Button>
            </div>

            <div className="flex flex-col max-w-[96vw] md:max-w-[48rem] rounded-md shadow-md mx-auto overflow-hidden">
                <div className="flex items-center gap-4 bg-[#03045e] p-8 text-white">
                    <div className="p-4 border-2 border-green-200 rounded-lg">
                        <CirclePlus className="w-6 h-6 text-green-200" />
                    </div>
                    <div>
                        <h2 className="text-2xl uppercase font-black"> Define New Job Role </h2>
                        <p> Create a job blueprint and assign initial pay logic. </p>
                    </div>
                </div>
                <div className='bg-white p-8 space-y-4'>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold"> Job Name </label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="e.g., Software Engineer" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-semibold"> Detailed Description </label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className={inputClasses} placeholder="Explain the logic and criteria for this job..." rows={3} />
                    </div>

                    <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-4">
                        <h2 className="text-lg uppercase font-black">Financial Foundation </h2>
                        <div>
                            <p className="font-semibold"> Initial Base Salary </p>
                            <p className="text-sm text-gray-500"> Set the starting salary for this job role. This can be adjusted later based company policies. </p>
                        </div>

                        <select name="salary" value={formData.salary} onChange={handleChange} className={inputClasses}>
                            <option value="">Select Salary Configuration</option>
                            {/* Dynamically populate salary options from API */}
                        </select>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-4">
                        <h2 className="text-lg uppercase font-black"> Standard Work Hours (Base Shift) </h2>
                        <p className="text-sm text-gray-500"> Define the standard work hours for this job role. This will be used as the baseline for calculating overtime and other time-based rules. </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-200 p-4 py-8 rounded-lg">
                                <p className="font-semibold uppercase text-center"> AM Session </p>
                                <div className="flex gap-4 mt-4">
                                    <div className="w-full"> 
                                        <p className="text-sm uppercase"> Time-In</p>
                                        <input type="time" name="timeinAmBase" value={formData.timeinAmBase} onChange={handleChange} className={inputClasses} placeholder="Start Time" />
                                    </div>

                                    <div className="w-full">
                                        <p className="text-sm uppercase"> Time-Out </p>
                                        <input type="time" name="timeoutAmBase" value={formData.timeoutAmBase} onChange={handleChange} className={inputClasses} placeholder="End Time" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-200 p-4 py-8 rounded-lg">
                                <p className="font-semibold uppercase text-center"> PM Session </p>
                                <div className="flex gap-4 mt-4">
                                    <div className="w-full"> 
                                        <p className="text-sm uppercase"> Time-In</p>
                                        <input type="time" name="timeinPmBase" value={formData.timeinPmBase} onChange={handleChange} className={inputClasses} placeholder="Start Time" />
                                    </div>

                                    <div className="w-full">
                                        <p className="text-sm uppercase"> Time-Out </p>
                                        <input type="time" name="timeoutPmBase" value={formData.timeoutPmBase} onChange={handleChange} className={inputClasses} placeholder="End Time" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-4">
                        <h2 className="text-lg uppercase font-black"> Overtime Parameters </h2>
                        <p className="text-sm text-gray-500"> Set the thresholds for overtime eligibility. This will determine how much overtime an employee can work and how it is calculated based on the base shift defined above. </p>

                        <div className="flex flex-col md:flex-row md:gap-8">
                            <div className="w-full">
                                <p className="text-sm uppercase"> Maximum Overtime Hours Per Day </p>
                                <input type="number" name="maximumOvertime" value={formData.maximumOvertime} onChange={handleChange} className={inputClasses} placeholder="e.g., 4" />
                            </div>

                            <div className="w-full">
                                <p className="text-sm uppercase"> Minimum Overtime Hours Per Day </p>
                                <input type="number" name="minimumOvertime" value={formData.minimumOvertime} onChange={handleChange} className={inputClasses} placeholder="e.g., 1" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t-2 border-dashed border-gray-200 pt-4">
                        <Button variant="solid" className="col-span-2 gap-2">
                            Create Job Role
                        </Button>
                        <Button variant="outline" className="col-span-1">
                            Dicard
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}