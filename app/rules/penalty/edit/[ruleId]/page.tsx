"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Edit } from "lucide-react"
import toast from "react-hot-toast"
import Button from "@/app/components/ui/Button"
import { WageService }  from "@/services/wage_srv"
import { Method, Rate } from "@/api/types"

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
        method: "",
        rate: "",
        value: "" as string | number,
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
        const deletePromise = WageService.deletePenalty(ruleId);
        
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
        const updatePromise = WageService.updatePenalty(ruleId, {
            name: formData.name,
            description: formData.description,
            amount: Number(formData.amount),
            method: formData.method === "" ? undefined : (formData.method as Method),
            rate: formData.rate === "" ? undefined : (formData.rate as Rate),
            value: Number(formData.value),
        });

        toast.promise(
            updatePromise,
            {
                loading: 'Updating...',
                success: "Rule updated successfully.",
                error: "Failed to update rule.",
            }
        );

        try {
            await updatePromise;
            setTimeout(() => {
                router.push("/rules");
            }, 1000);
        } catch (error) {
            console.error(error);
        }
    };   

    const isFixed = formData.method == "fixed";
    const isRate = formData.method == "rate";
    const isAverage = formData.method == "average";
    const isMult = formData.method == "multiplier";

    let methodLabel = "Method value";
    let placeholder = "30";

    if (isRate){
        methodLabel = `Rate /${formData.rate}`;
        placeholder = "e.g., 30";
    } else if (isAverage) {
        methodLabel = "Average number of Months";
        placeholder = "e.g., 3";
    } else if (isMult) {
        methodLabel = "Multiplier Value";
        placeholder = "e.g., 1.5";
    }

    const fetchRuleData = useCallback(async () => {
        if (!ruleId) {
            console.error("No ruleId found in params");
            setIsLoading(false);
            return;
        }
        
        try {
            setIsLoading(true);
            const data = await WageService.getPenaltyId(ruleId);
            
            if (data) {
                setFormData({
                    name: data.name,
                    description: data.description,
                    amount: data.amount,
                    method: data.method,
                    rate: data.rate,
                    value: data.value ?? "",
                });
            }
        } catch (err) {
            console.error("Error fetching rule data:", err);
        } finally {
            setIsLoading(false);
        }
    }, [ruleId]);

    useEffect(() => {
        fetchRuleData();
    }, [fetchRuleData]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center gap-2">
                <svg className="w-8 h-8 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#03045e" strokeWidth="4"> </circle>
                    <path className="opacity-75" fill="#03045e" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p> Loading Salary </p>
            </div>
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

                        <select className={inputClasses} disabled>
                            <option value="penalty">Penalty</option>
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
                    
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold"> Calculation Method </label>
                            <select name="method" value={formData.method} onChange={handleChange} className={inputClasses}>
                                <option value="fixed">Fixed</option>
                                <option value="rate">Rate</option>
                                <option value="average">Average</option>
                                <option value="multiplier">Multiplier</option>
                            </select>
                    </div>

                    <div className={`w-full gap-4 ${isRate ? 'flex' : ''}`}>
                        <div className={`flex-col w-full gap-2 ${isRate ? 'flex' : 'hidden'}`}>
                            <label className="font-semibold"> Rate per </label>
                            <select name="rate" value={formData.rate} onChange={handleChange} className={inputClasses}>
                                <option value="" disabled> Select rate </option>
                                <option value="mins">Minutes</option>
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                                <option value="months">Months</option>
                            </select>
                        </div>

                        <div className={`flex-col gap-2 ${!isFixed ? 'flex' : 'hidden'}`}>
                            <label className="font-semibold"> {methodLabel} </label>
                            <input type="number" name='value' value={formData.value} onChange={handleChange} className={inputClasses} placeholder={placeholder}/>
                        </div>
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