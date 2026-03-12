"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, Edit, ImageUp } from "lucide-react";
import Button from "@/app/components/ui/Button";
import Loading from "@/app/components/ui/Loading";
import { SitesService } from "@/services/sites_srv";
import { Site } from "@/api/types";
import { inputClasses } from "@/app/components/ui/styles";

export default function EditSitePage() {
    const router = useRouter();
    const params = useParams();
    const siteId = params.siteId as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [site, setSite] = useState<Site | null>(null);
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

    const handleUpdate = async () => {
        if (!formData.name.trim()) {
            toast.error("Site name is required.");
            return;
        }

        toast.promise(
            SitesService.updateSite(siteId, {
                name: formData.name,
                description: formData.description,
                address: formData.address,
                image: imageFile || undefined,
            }),
            {
                loading: "Saving changes...",
                success: () => {
                    router.push(`/sites/${siteId}`);
                    router.refresh();
                    return <b>Site updated successfully!</b>;
                },
                error: <b>Failed to update site. Please try again.</b>,
            }
        );
    };

    const handleDelete = () => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <span className="font-semibold text-gray-800">
                    Are you sure you want to delete this site?
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
        const deletePromise = SitesService.deleteSite(siteId);

        toast.promise(deletePromise, {
            loading: "Deleting site...",
            success: "Site deleted successfully.",
            error: "Failed to delete site.",
        });

        try {
            const success = await deletePromise;
            if (success) {
                setTimeout(() => {
                    router.push("/sites");
                    router.refresh();
                }, 1000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchSite = async () => {
            try {
                setIsLoading(true);
                const data = await SitesService.getSiteById(siteId);
                setSite(data);
                setFormData({
                    name: data.name,
                    address: data.address || "",
                    description: data.description || "",
                });
                if (data.image) {
                    setImagePreview(data.image);
                }
            } catch (error) {
                console.error("Error fetching site:", error);
                toast.error("Failed to load site data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSite();
    }, [siteId]);

    if (isLoading) {
        return <Loading message="Loading site data..." />;
    }

    return (
        <div className="space-y-4 md:px-16 py-8">
            <div className="flex justify-start w-full">
                <Button variant="ghost" onClick={() => router.back()} className="gap-4">
                    <ArrowLeft className="h-6 w-6" />
                    <p className="font-bold text-lg"> Back to Site Details </p>
                </Button>
            </div>

            <div className="flex flex-col max-w-[96vw] md:max-w-[48rem] rounded-md shadow-md mx-auto overflow-hidden">
                <div className="flex items-center gap-4 bg-[#03045e] p-8 text-white">
                    <div className="p-4 border-2 border-green-200 rounded-lg">
                        <Edit className="w-6 h-6 text-green-200" />
                    </div>
                    <div>
                        <h2 className="text-2xl uppercase font-black"> Edit Site Details </h2>
                        <p> Update site information, photo, and configuration. </p>
                    </div>
                </div>

                <div className="bg-white p-8 space-y-4">
                    {/* Image */}
                    <div className="flex flex-col gap-2">
                        <p className="font-semibold"> Site Reference Photo </p>
                        <div
                            className="flex flex-col justify-center items-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-auto block" />
                            ) : (
                                <p className="text-gray-500 py-12">No photo uploaded</p>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        <Button variant="outline" className="gap-4 px-8 w-full" onClick={() => fileInputRef.current?.click()}>
                            <ImageUp className="w-5 h-5" /> Change Photo
                        </Button>
                    </div>

                    {/* Form */}
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

                    {/* Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t-2 border-dashed border-gray-200 pt-4">
                        <Button variant="solid" className="col-span-1" onClick={handleUpdate}>
                            Update Site
                        </Button>
                        <Button variant="warn" className="col-span-1" onClick={handleDelete}>
                            Delete
                        </Button>
                        <Button variant="outline" className="col-span-1" onClick={() => router.back()}>
                            Discard
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
