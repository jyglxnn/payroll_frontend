import { Briefcase, Settings2 } from "lucide-react";
import Button from "@/app/components/ui/Button";

export default function WageCard() {
    return (
        <div className="bg-white rounded-lg shadow-md flex flex-col gap-2 overflow-hidden">
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
                    <h3 className="text-lg font-bold"> Software Engineer </h3>
                    <p> Descriptions </p>
                </div>

                <div className="flex justify-between items-center bg-gray-200 border p-2 shadow-md rounded-lg">
                    <p> Base Salary </p>
                    <span> amount </span>
                </div>

                <Button variant='solid' className="w-full gap-4">
                    <Settings2 className="w-5 h-5"/>
                    <span className="hidden md:block"> Configure </span>
                </Button>

            </div>
        </div>
    )
}