"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { ArrowLeft, Edit, Loader} from "lucide-react"
import Button from "@/app/components/ui/Button"
import { WageService } from "@/services/wage_srv"
import { BaseLine, ReleaseType } from "@/api/types"
import Loading from "@/app/components/ui/Loading"

const methodOptions = [
    { label: "Fixed", value: "fixed" },
    { label: "Rate", value: "rate" },
    { label: "Average", value: "average" },
    { label: "Multiplier", value: "multiplier" },
]

export default function EditRulePage(){
    const router = useRouter();
    const params = useParams();
    const ruleId = params.ruleId as string;
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        amount: "" as string | number,
        releaseType: "", 
        base: "",
        method: "",
        rate: "",
        value: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDelete = () => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <span className="font-semibold text-gray-800">
                    Are you sure you want to delete this rule?
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
            position: 'top-center',
            style: { border: '1px solid #ff0000', padding: '16px' }
        });
    };

    const executeDelete = async () => {
        const deletePromise = WageService.deleteSalary(ruleId);
        
        toast.promise(
            deletePromise,
            {
                loading: 'Deleting...',
                success: "Rule deleted successfully.",
                error: "Failed to delete rule.",
            }
        );

        try {
            const success = await deletePromise;
            
            if (success) {
                setTimeout(() => {
                    router.push("/rules");
                }, 1000); 
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async () => {
        const payload = {
            name: formData.name,
            description: formData.description,
            amount: Number(formData.amount),
            releaseType: formData.releaseType as ReleaseType,
            base: formData.base as BaseLine,
        };

        toast.promise(
            WageService.updateSalary(ruleId, payload),
            {
                loading: 'Saving changes...',
                success: () => {
                    router.push("/rules");
                    return <b>Rule updated successfully!</b>;
                },
                error: <b>Failed to update rule. Please try again.</b>,
            },
            {
                duration: 3000,
            }
        );
    };

    const fetchRuleData = useCallback(async () => {
        if (!ruleId) {
            console.error("No ruleId found in params");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const data = await WageService.getSalaryId(ruleId);
            
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    name: data.name,
                    description: data.description,
                    amount: data.amount,
                    base: data.base,
                    releaseType: data.releaseType
                }));
            } else {
                console.warn(`No salary found with id ${ruleId}`);
            }

        } catch (error) {
            console.error("Error fetching rule data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [ruleId]);

    useEffect(() => {
        fetchRuleData();
    }, [fetchRuleData]);

    if (isLoading) {
        return (
            <Loading message="Loading rule data..." />
        );
    }
    
    const inputClasses = "w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#03045e] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 transition-colors";


    return(
        <div className="flex flex-col space-y-4 md:px-16 py-8">
            <div className="flex justify-start w-full">
                <Button variant="ghost" onClick={() =>router.back()} className="gap-4">
                    <ArrowLeft className="h-6 w-6" /> 
                    <p className='font-bold text-lg'> Back to Rule Library </p>
                </Button>
            </div>
            
            <div className="flex flex-col max-w-[96vw] md:max-w-[48rem] rounded-md shadow-md mx-auto overflow-hidden">
                <div className="flex gap-2 px-8 py-4 items-center bg-[#03045e]">
                    <div className="p-4 border-2 border-green-200 rounded-lg">
                        <Edit className="text-green-200 w-6 h-6" />
                    </div>
                    <div className="p-4 text-white">
                        <p className="text-2xl font-black uppercase"> Edit Rule </p>
                        <p> Define the logic for salary, deductions, penalties,or additionals.</p>
                    </div>
                </div>
                <div className='bg-white p-8 space-y-4'>
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold"> Rule Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="e.g., Late Penalty" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-semibold"> Detailed Description </label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className={inputClasses} placeholder="Explain the logic and criteria for this rule..." rows={3} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className='font-semibold'> Rule Category </label>

                        <select name="category" className={inputClasses} disabled>
                            <option value=""> Salary Base </option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2 ">
                        <label className="font-semibold"> Amount </label>
                        <input type="number" name="amount" value={formData.amount} onChange={handleChange} className={inputClasses} placeholder="0.00" />
                        {formData.amount && (
                            <p className="text-sm text-gray-500 italic">
                                Equivalent to: ₱{Number(formData.amount).toLocaleString()}
                            </p>
                        )}
                    </div>

                    <div className="flex-col gap-2">
                        <label className="font-semibold"> Salary Base </label>
                        <select name="base" value={formData.base} onChange={handleChange} className={inputClasses}>
                            <option value="" disabled> Select salary base </option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="monthly">Monthly</option>
                            <option value="annually">Annually</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-semibold"> Payment Frequency </label>
                            <select name="releaseType" value={formData.releaseType} onChange={handleChange} className={inputClasses}>
                                <option value="" disabled> Select frequency </option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="semimonthly">Semi-monthly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                    </div>

                    <div className="grid grid-col md:grid-cols-3 bg-white border-dashed border-t-2 border-gray-200 gap-4 py-4">
                        <Button variant="solid" className="col-span-1 disabled={!selectedCategory}" onClick={handleUpdate}> Update Rule Component </Button>
                        <Button variant="warn" className="col-span-1 text-red-700" onClick={handleDelete}> Delete </Button>
                        <Button variant="outline" className="col-span-1" onClick={() =>router.back()}> Discard </Button>
                    </div>
                </div>
            </div>


        </div>
    )
}