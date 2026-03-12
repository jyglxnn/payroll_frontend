"use client"
import { PhilippinePeso, Scissors, TriangleAlert, Coins, Edit, PlusCircle} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Button from "../components/ui/Button"
import PaginatedSection from "../components/Pagnation"
import SearchInput from "../components/ui/SearchInput"
import { WageService } from "@/services/wage_srv"
import { Salary, Deduction, Penalty, Additional } from "@/api/types"
import Loading from "../components/ui/Loading"


export default function RulesPage() {
    const [activeTab, setActiveTab] = useState<'salary' | 'deduction' | 'penalty' | 'additional'>('salary');
    const [salaries, setSalaries] = useState<Salary[]>([]);
    const [deductions, setDeductions] = useState<Deduction[]>([]);
    const [penalties, setPenalties] = useState<Penalty[]>([]);
    const [additionals, setAdditionals] = useState<Additional[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

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

    if (isLoading) {
        return (
            <Loading message="Loading rules library..." />
        );
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    const q = search.toLowerCase();
    const filteredSalaries = salaries.filter(s => s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
    const filteredDeductions = deductions.filter(d => d.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q));
    const filteredPenalties = penalties.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    const filteredAdditionals = additionals.filter(a => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));

    return (
        <div className="p-8 space-y-2">
            <div className="flex justify-between items-center gap-8">
                <div>
                    <p className="text-2xl uppercase font-black tracking-wide"> Rules Library </p>
                    <p> List of all available salary bases, deductions, penalties, and additional payments </p>
                </div>
                <Link href="/rules/new">
                    <Button variant="solid" className="gap-2 p-4">
                        <PlusCircle className="w-5 h-5"/>
                        <span className="hidden lg:block"> Add New Rule</span>
                    </Button>
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 w-[80vw] md:max-w-2xl gap-2">
                {[
                    { id: 'salary', label: 'Salary', icon: PhilippinePeso, color: 'blue' },
                    { id: 'deduction', label: 'Deductions', icon: Scissors, color: 'red' },
                    { id: 'penalty', label: 'Penalties', icon: TriangleAlert, color: 'orange' },
                    { id: 'additional', label: 'Additionals', icon: Coins, color: 'green' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex justify-center items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border-2 ${
                            activeTab === tab.id 
                            ? 'bg-[#03045e] border-slate-900 text-white shadow-sm' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={`Search ${activeTab} rules...`}
            />

            <div className="mt-8">
                {activeTab === 'salary' && (
                    <PaginatedSection 
                        title="Salary Bases"
                        items={filteredSalaries}
                        itemsPerPage={5}
                        emptyMessage="No salary bases found."
                        renderItem={(salary: Salary, index: number) => (
                        <li key={salary.id} className="flex bg-white items-center justify-between border border-gray-200 p-3 md:p-4 rounded-lg shadow-sm">
                            
                            <div className="flex items-center gap-3 min-w-0 flex-1">

                                <div className="p-2 rounded-lg shrink-0 bg-gray-200">
                                    <PhilippinePeso className="w-5 h-5 md:w-6 md:h-6"/> 
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 text-sm md:text-base truncate leading-tight">{salary.name}</h3>
                                    {salary.description && (
                                        <p className="text-xs text-gray-500 truncate hidden sm:block mt-1">{salary.description}</p>
                                    )}
                                </div>
                                
                            </div>
                            <div className="flex items-center gap-2 sm:gap-6 shrink-0 ml-3">
                                <div className="text-right">
                                    <div className="font-black text-sm md:text-lg">₱{salary.amount.toLocaleString()}</div>
                                    <div><span className="text-[10px] md:text-xs uppercase font-bold tracking-tight"> per {salary.base?.replace('daily', 'day').replace('ly', '')}</span></div>
                                </div>

                                <Link href={`/rules/salary/edit/${salary.id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <Edit className="w-4 h-4 md:w-5 md:h-5"/>
                                </Link>
                            </div>
                        </li>
                        )}
                    />
                )}

                {activeTab === 'deduction' && (
                    <PaginatedSection 
                        title="Deductions"
                        items={filteredDeductions}
                        itemsPerPage={5}
                        emptyMessage="No deduction found."
                        renderItem={(deduc: Deduction, index: number) => (
                        <li key={deduc.id} className="flex bg-white items-center justify-between border border-gray-200 p-3 md:p-4 rounded-lg shadow-sm">
                            
                            <div className="flex items-center gap-3 min-w-0 flex-1">

                                <div className="p-4 bg-red-200 rounded-lg">
                                    <Scissors className="w-5 h-5 md:w-6 md:h-6 text-red-700"/> 
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 text-sm md:text-base truncate leading-tight">{deduc.name}</h3>
                                    {deduc.description && (
                                        <p className="text-xs text-gray-500 truncate hidden sm:block mt-1">{deduc.description}</p>
                                    )}
                                </div>
                                
                            </div>
                            <div className="flex items-center gap-2 sm:gap-6 shrink-0 ml-3">
                                <div className="text-right">
                                    <div className="font-black text-sm md:text-lg text-red-700">-₱{deduc.amount.toLocaleString()}</div>
                                    <div><span className="text-[10px] md:text-xs uppercase font-bold tracking-tight"> {deduc.method} </span></div>
                                </div>
                                <Link href={`/rules/deduction/edit/${deduc.id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <Edit className="w-4 h-4 md:w-5 md:h-5"/>
                                </Link>
                            </div>
                        </li>
                        )}
                    />
                )}

                {activeTab === "penalty" && (
                    <PaginatedSection 
                        title="Penalties"
                        items={filteredPenalties}
                        itemsPerPage={5}
                        emptyMessage="No penalties found."
                        renderItem={(pena: Penalty, index: number) => (
                        <li key={pena.id} className="flex bg-white items-center justify-between border border-gray-200 p-3 md:p-4 rounded-lg shadow-sm">
                            
                            <div className="flex items-center gap-3 min-w-0 flex-1">

                                <div className="p-4 bg-red-200 rounded-lg">
                                    <TriangleAlert className="w-5 h-5 md:w-6 md:h-6 text-red-700"/> 
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 text-sm md:text-base truncate leading-tight">{pena.name}</h3>
                                    {pena.description && (
                                        <p className="text-xs text-gray-500 truncate hidden sm:block mt-1">{pena.description}</p>
                                    )}
                                </div>
                                
                            </div>
                            <div className="flex items-center gap-2 sm:gap-6 shrink-0 ml-3">
                                <div className="text-right">
                                    <div className="font-black text-sm md:text-lg text-red-700">-₱{pena.amount.toLocaleString()}</div>
                                    <div><span className="text-[10px] md:text-xs uppercase font-bold tracking-tight"> {pena.method} </span></div>
                                </div>
                                <Link href={`/rules/penalty/edit/${pena.id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <Edit className="w-4 h-4 md:w-5 md:h-5"/>
                                </Link>
                            </div>
                        </li>
                        )}
                    />
                )}

                {activeTab === "additional" && (
                    <PaginatedSection 
                        title="Addittionals"
                        items={filteredAdditionals}
                        itemsPerPage={5}
                        emptyMessage="No additionals found."
                        renderItem={(add: Additional, index: number) => (
                        <li key={add.id} className="flex bg-white items-center justify-between border border-gray-200 p-3 md:p-4 rounded-lg shadow-sm">
                            
                            <div className="flex items-center gap-3 min-w-0 flex-1">

                                <div className="p-4 bg-green-200 rounded-lg">
                                    <Coins className="w-5 h-5 md:w-6 md:h-6 text-green-700"/> 
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 text-sm md:text-base truncate leading-tight">{add.name}</h3>
                                    {add.description && (
                                        <p className="text-xs text-gray-500 truncate hidden sm:block mt-1">{add.description}</p>
                                    )}
                                </div>
                                
                            </div>
                            <div className="flex items-center gap-2 sm:gap-6 shrink-0 ml-3">
                                <div className="text-right">
                                    <div className="font-black text-sm md:text-lg text-green-700">₱{add.amount.toLocaleString()}</div>
                                    <div><span className="text-[10px] md:text-xs uppercase font-bold tracking-tight"> {add.method} </span></div>
                                </div>
                                <Link href={`/rules/additional/edit/${add.id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <Edit className="w-4 h-4 md:w-5 md:h-5"/>
                                </Link>
                            </div>
                        </li>
                        )}
                    />
                )}
            </div>
        </div>
    )
}