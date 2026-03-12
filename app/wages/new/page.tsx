"use client"

import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CirclePlus, ArrowLeft, PhilippinePeso } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { useEffect, useState } from "react";
import { WageService } from "@/services/wage_srv";
import { JobsService } from "@/services/jobs_srv";
import { Salary } from "@/api/types";
import { inputClasses } from "@/app/components/ui/styles";

export default function NewWagePage() {
    const router = useRouter();
    const [salaries, setSalaries] = useState<Salary[]>([]);

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
        const fetchSalaries = async () => {
            try {
                const data = await WageService.getSalary();
                setSalaries(data);
            } catch (error) {
                console.error("Failed to load salary configurations", error);
            }
        };
        fetchSalaries();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const selectedSalary = salaries.find((s) => String(s.id) === String(formData.salary));

        if (!selectedSalary) {
            toast.error("Please select a valid salary configuration.");
            return; 
        }

        const createJobAction = async () => {
            try {
                let result;

                result = await JobsService.createJob({
                    name: formData.name,
                    description: formData.description,
                    salary: selectedSalary,
                    timeinAmBase: formData.timeinAmBase,
                    timeoutAmBase: formData.timeoutAmBase,
                    timeinPmBase: formData.timeinPmBase,
                    timeoutPmBase: formData.timeoutPmBase,
                    maximumOvertime: parseInt(formData.maximumOvertime),
                    minimumOvertime: parseInt(formData.minimumOvertime),
                });
                return result;
            } catch (error) {
                console.error("Failed to create job role", error);
                throw error;
            }
        };

        toast.promise(createJobAction(), {
            loading: 'Saving job...',
            success: () => {
                router.push("/wages");
                router.refresh();
                return <b>Job created successfully!</b>;
            },
            error: <b>Could not save the job. Please check your inputs.</b>,
        });
    };

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
                            <option value="" disabled>Select Salary Configuration</option>
                            {salaries.map((salary) => (
                                <option key={salary.id} value={salary.id}>
                                    {salary.name} - ₱{salary.amount.toLocaleString()} per {salary.base.replace("daily", "day").replace("ly", "")} release {salary.releaseType}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-4">
                        <h2 className="text-lg uppercase font-black"> Standard Work Hours (Base Shift) </h2>
                        <p className="text-sm text-gray-500"> Define the standard work hours for this job role. This will be used as the baseline for calculating overtime and other time-based rules. </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-200 p-4 rounded-lg">
                                <p className="font-semibold uppercase text-center"> AM Session </p>
                                <div className="flex gap-4 mt-4">
                                    <div className="w-full"> 
                                        <p className="text-sm uppercase text-center tracker-widest"> Time-In</p>
                                        <input type="time" name="timeinAmBase" value={formData.timeinAmBase} onChange={handleChange} className={inputClasses} placeholder="Start Time" />
                                    </div>

                                    <div className="w-full">
                                        <p className="text-sm uppercase text-center tracker-widest"> Time-Out </p>
                                        <input type="time" name="timeoutAmBase" value={formData.timeoutAmBase} onChange={handleChange} className={inputClasses} placeholder="End Time" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-200 p-4 rounded-lg">
                                <p className="font-semibold uppercase text-center"> PM Session </p>
                                <div className="flex gap-4 mt-4">
                                    <div className="w-full"> 
                                        <p className="text-sm uppercase text-center tracker-widest"> Time-In</p>
                                        <input type="time" name="timeinPmBase" value={formData.timeinPmBase} onChange={handleChange} className={inputClasses} placeholder="Start Time" />
                                    </div>

                                    <div className="w-full">
                                        <p className="text-sm uppercase text-center tracker-widest"> Time-Out </p>
                                        <input type="time" name="timeoutPmBase" value={formData.timeoutPmBase} onChange={handleChange} className={inputClasses} placeholder="End Time" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-4">
                        <h2 className="text-lg uppercase font-black"> Overtime Parameters </h2>
                        <p className="text-sm text-gray-500"> Set the thresholds for overtime eligibility. This will determine how much overtime an employee can work and how it is calculated based on the base shift defined above. </p>

                        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
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
                        <Button variant="solid" className="col-span-2 gap-2" onClick={handleSubmit}>
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