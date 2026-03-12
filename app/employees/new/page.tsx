"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, UserPlus, ImageUp } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { inputClasses } from "@/app/components/ui/styles";
import { EmployeesService } from "@/services/employees_srv";
import { JobsService } from "@/services/jobs_srv";
import { Job } from "@/api/types";

export default function NewEmployeePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [jobs, setJobs] = useState<Job[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        job: "",
        joinedAt: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        JobsService.getJobs().then(setJobs).catch(console.error);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            toast.error("First and Last name are required.");
            return;
        }
        if (!formData.job) {
            toast.error("Please select a job position.");
            return;
        }

        toast.promise(
            EmployeesService.createEmployee({
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email || undefined,
                job: formData.job,
                joined_at: new Date(formData.joinedAt).toISOString(),
                image: imageFile || undefined,
            }),
            {
                loading: "Creating employee...",
                success: () => {
                    router.push("/employees");
                    router.refresh();
                    return <b>Employee created successfully!</b>;
                },
                error: <b>Failed to create employee. Please check your inputs.</b>,
            }
        );
    };

    return (
        <div className="space-y-4 md:px-16 py-8">
            <div className="flex justify-start w-full">
                <Button variant="ghost" onClick={() => router.back()} className="gap-4">
                    <ArrowLeft className="h-6 w-6" />
                    <p className="font-bold text-lg">Back to Employees</p>
                </Button>
            </div>

            <div className="flex flex-col max-w-[96vw] md:max-w-[48rem] rounded-md shadow-md mx-auto overflow-hidden">
                <div className="flex items-center gap-4 bg-[#03045e] p-8 text-white">
                    <div className="p-4 border-2 border-green-200 rounded-lg">
                        <UserPlus className="w-6 h-6 text-green-200" />
                    </div>
                    <div>
                        <h2 className="text-2xl uppercase font-black">Register Employee</h2>
                        <p>Add a new employee to the payroll system.</p>
                    </div>
                </div>

                <div className="bg-white p-8 space-y-4">
                    {/* Image */}
                    <div className="flex flex-col gap-2">
                        <p className="font-semibold">Profile Photo</p>
                        <div
                            className="flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-auto block" />
                            ) : (
                                <div className="py-12 text-gray-400 text-center">
                                    <ImageUp className="w-10 h-10 mx-auto mb-2" />
                                    <p>Click to upload a photo</p>
                                </div>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>

                    {/* Form */}
                    <div className="flex flex-col border-t-2 border-gray-200 border-dashed pt-4 gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold">First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="e.g., Juan" className={inputClasses} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold">Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="e.g., Dela Cruz" className={inputClasses} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g., juan@email.com" className={inputClasses} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Job Position</label>
                            <select name="job" value={formData.job} onChange={handleChange} className={inputClasses}>
                                <option value="">Select a position...</option>
                                {jobs.map((j) => (
                                    <option key={j.id} value={j.id}>{j.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Date Joined</label>
                            <input type="date" name="joinedAt" value={formData.joinedAt} onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t-2 border-dashed border-gray-200 pt-4">
                        <Button variant="solid" onClick={handleSubmit}>
                            Register Employee
                        </Button>
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
