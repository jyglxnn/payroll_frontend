"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, CirclePlus } from "lucide-react"
import Button from "@/app/components/ui/Button"

export default function SalaryNewPage(){
    const router = useRouter();
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
                        <CirclePlus className="text-green-200 w-6 h-6" />
                    </div>
                    <div className="p-4 text-white">
                        <p className="text-2xl font-black uppercase"> Create Rule </p>
                        <p> Define the logic for salary, deductions, penalties,or additionals.</p>
                    </div>
                </div>
                <div className='bg-white'>
                    <div className="flex flex-col gap-4 p-8">
                        <p className='font-semibold'> Rule Category </p>
                    </div>

                    <div className="flex flex-col gap-4 p-8">
                        <p className="font-semibold"> Calculation Method </p>
                    </div>

                    <div className="flex flex-col gap-4 p-8">
                        <p className="font-semibold"> Amount </p>
                    </div>

                    <div className="flex flex-col gap-4 p-8">
                        <p className="font-semibold"> Rule Name</p>
                    </div>

                    <div className="flex flex-col gap-4 p-8">
                        <p className="font-semibold"> Detailed Description </p>
                    </div>

                    <div className="flex flex-col gap-4 p-8">
                        <p className="font-semibold"> Payment Frequency </p>
                    </div>
                </div>
                <div className="grid grid-col md:grid-cols-3 bg-white border-dashed border-t-2 border-gray-200 gap-4 px-8 py-4">
                    <Button variant="solid" className="col-span-1 md:col-span-2"> Create Rule Component </Button>
                    <Button variant="outline" className="col-span-1"> Discard </Button>
                </div>
            </div>


        </div>
    )
}