"use client";

import { useState, useRef } from "react";
import { ArrowLeft, CirclePlus, Image, ImageUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Button from "@/app/components/ui/Button";
import { inputClasses } from "@/app/components/ui/styles";
import { SitesService } from "@/services/sites_srv";


export default function NewSitePage(){
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        if (!formData.name.trim()) {
            toast.error("Site name is required.");
            return;
        }

        const createAction = async () => {
            return await SitesService.createSite({
                name: formData.name,
                description: formData.description,
                address: formData.address,
                image: imageFile || undefined,
            });
        };

        toast.promise(createAction(), {
            loading: "Registering site...",
            success: () => {
                router.push("/sites");
                router.refresh();
                return <b>Site registered successfully!</b>;
            },
            error: <b>Failed to register site. Please check your inputs.</b>,
        });
    };

    return (
        <div className="space-y-4 md:px-16 py-8">
            <Button variant="ghost" className="flex items-center gap-4" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5 cursor-pointer" />
                <h2 className="font-bold text-lg"> Back to Sites Library </h2>
            </Button>

            <div className="flex flex-col max-w-[96vw] md:max-w-[48rem] rounded-md shadow-md mx-auto overflow-hidden">
                <div className="flex gap-4 p-8 items-center bg-[#03045e]">
                    <div className="p-4 border-2 border-green-200 rounded-lg">
                        <CirclePlus className="text-green-200 w-6 h-6" />
                    </div>
                    <div className="text-white">
                        <p className="text-2xl font-black uppercase"> Register Site </p>
                        <p> Define a new physical location for operations and attendance. </p>
                    </div>
                </div>

                <div className="p-8 bg-white space-y-4">
                    <div className="flex flex-col gap-2">
                        <p> Site Reference Photo </p>
                        <div 
                            className="flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-xl py-24 cursor-pointer overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover max-h-48" />
                            ) : (
                                <>
                                    <Image className="w-16 h-16 text-gray-200" />
                                    <p className="text-gray-500">No photo uploaded</p>
                                </>
                            )}
                        </div>
                        <p className="text-sm text-gray-500"> Capture the main entrance or structural overview for identity verification. </p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageChange} 
                        />
                        <Button variant="outline" className="gap-4 px-8 mt-2 w-full" onClick={() => fileInputRef.current?.click()}>
                            <ImageUp className="w-5 h-5" />
                            Upload
                        </Button>
                    </div>

                    <div className="flex flex-col border-t-2 border-gray-200 border-dashed pt-4 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold"> Site Name </label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Main Office (Alijis)" className={inputClasses} />
                            <p className="text-xs text-gray-500"> A unique identifier for internal mapping. </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold"> Physical Address </label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="e.g., 123 Main Street, City..." className={inputClasses} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold"> Site Purpose & Details </label>
                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Briefly describe the operation scope and purpose of the location..." className={inputClasses} rows={5} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 border-t-2 border-gray-200 border-dashed pt-4 gap-4">
                        <Button variant="solid" className="md:col-span-2" onClick={handleSubmit}> Register Site </Button>
                        <Button variant="outline" className="md:col-span-1" onClick={() => router.back()}> Cancel </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}