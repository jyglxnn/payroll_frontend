"use client"
import { PhilippinePeso, Scissors, TriangleAlert, Coins, Edit, PlusCircle} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Button from "../components/ui/Button"
import PaginatedSection from "../components/Pagnation"
import { WageService } from "@/services/wage_srv"
import { Salary, Deduction, Penalty, Additional } from "@/api/types"


export default function RulesPage() {
    const [salaries, setSalaries] = useState<Salary[]>([]);
    const [deductions, setDeductions] = useState<Deduction[]>([]);
    const [penalties, setPenalties] = useState<Penalty[]>([]);
    const [additionals, setAdditionals] = useState<Additional[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const salariesData = await WageService.getSalary();
                const deductionsData = await WageService.getDeduction();
                const penanaltiesData = await WageService.getPenalty();
                const additionalsData = await WageService.getAdditional();
                setSalaries(salariesData);
                setDeductions(deductionsData);
                setPenalties(penanaltiesData);
                setAdditionals(additionalsData);
            } catch (err) {
                console.error('Failed to fetch rules:', err);
                setError('Unable to load Rules at this moment')
            } finally {
                setIsLoading(false);
            }
        };

        fetchRules();
    }, []);

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="p-8 space-y-12">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-2xl uppercase font-black"> Rules Library </p>
                    <p> List of all available salary bases, deductions, penalties, and additional payments </p>
                </div>
                <Link href="/rules/new">
                    <Button variant="solid" className="gap-2 p-4">
                        <PlusCircle className="w-8 h-8"/>
                        <span className="text-lg"> Add New Rule</span>
                    </Button>
                </Link>
            </div>
            {isLoading? (
                <div className="flex w-full justify-center items-center gap-2">
                    <svg className="w-8 h-8 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#03045e" strokeWidth="4"> </circle>
                        <path className="opacity-75" fill="#03045e" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p> Loading rules library... </p>
                </div>
            ) : (
                <>
                <ul className="space-y-4">
                    <PaginatedSection 
                        title="Salary Bases"
                        items={salaries}
                        itemsPerPage={5}
                        emptyMessage="No salary bases found."
                        renderItem={(salary: Salary, index: number) => (
                        <li key={salary.id} className="flex bg-white justify-between items-center border border-gray-200 p-4 rounded-lg shadow-sm">
                            
                            <div className="flex items-center gap-4">

                                <div className="p-4 bg-gray-200 rounded-lg">
                                    <PhilippinePeso className=""/> 
                                </div>

                                <div className="">
                                    <h3 className="text-lg font-semibold text-gray-900">{salary.name}</h3>
                                    {salary.description && (
                                        <p className="text-sm text-gray-600 mb-3">{salary.description}</p>
                                    )}
                                </div>
                                
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col items-end">
                                    <div className="font-black text-lg">₱{salary.amount.toLocaleString()}</div>
                                    <div><span className=""> / {salary.base?.replace('ly', '')}</span></div>
                                </div>

                                <Link href={`/rules/edit/${salary.id}`}>
                                    <Edit className="mx-4"/>
                                </Link>
                            </div>
                        </li>
                        )}
                    />
                </ul>

                <ul className="space-y-4">
                    <PaginatedSection 
                        title="Deductions"
                        items={deductions}
                        itemsPerPage={5}
                        emptyMessage="No deduction found."
                        renderItem={(deduc: Deduction, index: number) => (
                        <li key={deduc.id} className="flex bg-white justify-between items-center border border-gray-200 p-4 rounded-lg shadow-sm">
                            
                            <div className="flex items-center gap-4">

                                <div className="p-4 bg-red-200 rounded-lg">
                                    <Scissors className="text-red-700"/> 
                                </div>

                                <div className="">
                                    <h3 className="text-lg font-semibold text-gray-900">{deduc.name}</h3>
                                    {deduc.description && (
                                        <p className="text-sm text-gray-600 mb-3">{deduc.description}</p>
                                    )}
                                </div>
                                
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col items-end">
                                    <div className="font-black text-red-700 text-lg">-₱{deduc.amount.toLocaleString()}</div>
                                    <div><span className="text-[12px] uppercase text-muted-foreground font-black tracking-tighter"> {deduc.method} </span></div>
                                </div>
                                <Edit className="mx-4"/>
                            </div>
                        </li>
                        )}
                    />
                </ul>

                <ul className="space-y-4">
                    <PaginatedSection 
                        title="Penalties"
                        items={penalties}
                        itemsPerPage={5}
                        emptyMessage="No penalties found."
                        renderItem={(pena: Penalty, index: number) => (
                        <li key={pena.id} className="flex bg-white justify-between items-center border border-gray-200 p-4 rounded-lg shadow-sm">
                            
                            <div className="flex items-center gap-4">

                                <div className="p-4 bg-red-200 rounded-lg">
                                    <TriangleAlert className="text-red-700"/> 
                                </div>

                                <div className="">
                                    <h3 className="text-lg font-semibold text-gray-900">{pena.name}</h3>
                                    {pena.description && (
                                        <p className="text-sm text-gray-600 mb-3">{pena.description}</p>
                                    )}
                                </div>
                                
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col items-end">
                                    <div className="font-black text-red-700 text-lg">-₱{pena.amount.toLocaleString()}</div>
                                    <div><span className="text-[12px] uppercase text-muted-foreground font-black tracking-tighter"> {pena.method} </span></div>
                                </div>
                                <Edit className="mx-4"/>
                            </div>
                        </li>
                        )}
                    />
                </ul>

                <ul className="space-y-4">
                    <PaginatedSection 
                        title="Addittionals"
                        items={additionals}
                        itemsPerPage={5}
                        emptyMessage="No additionals found."
                        renderItem={(add: Additional, index: number) => (
                        <li key={add.id} className="flex bg-white justify-between items-center border border-gray-200 p-4 rounded-lg shadow-sm">
                            
                            <div className="flex items-center gap-4">

                                <div className="p-4 bg-green-200 rounded-lg">
                                    <Coins className="text-green-700"/> 
                                </div>

                                <div className="">
                                    <h3 className="text-lg font-semibold text-gray-900">{add.name}</h3>
                                    {add.description && (
                                        <p className="text-sm text-gray-600 mb-3">{add.description}</p>
                                    )}
                                </div>
                                
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="flex flex-col items-end">
                                    <div className="font-black text-lg">₱{add.amount.toLocaleString()}</div>
                                    <div><span className="text-[12px] uppercase text-muted-foreground font-black tracking-tighter"> {add.method} </span></div>
                                </div>
                                <Edit className="mx-4" />
                            </div>
                        </li>
                        )}
                    />
                </ul>
            </>
            )}
        </div>
    )
}