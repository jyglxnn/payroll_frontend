"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
    Receipt,
    CheckCircle,
    Clock,
    TrendingUp,
    DollarSign,
    History,
    CalendarDays,
    Users,
} from "lucide-react";
import Loading from "@/app/components/ui/Loading";
import SearchInput from "@/app/components/ui/SearchInput";
import PaginatedSection from "@/app/components/Pagnation";
import { PayrollService } from "@/services/payroll_srv";
import { PayrollItem } from "@/api/types";

type Tab = "payslips" | "history";

export default function PayrollPage() {
    const [payrolls, setPayrolls] = useState<PayrollItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "released" | "pending">("all");
    const [tab, setTab] = useState<Tab>("payslips");

    useEffect(() => {
        const fetchPayrolls = async () => {
            try {
                setIsLoading(true);
                const data = await PayrollService.getPayrolls();
                setPayrolls(data);
            } catch (err) {
                console.error("Failed to fetch payrolls:", err);
                setError("Unable to load payroll data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPayrolls();
    }, []);

    // ── History: group released payrolls by pay-period ──
    const historyGroups = useMemo(() => {
        const released = payrolls
            .filter((p) => p.isReleased)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

        const map = new Map<string, PayrollItem[]>();
        released.forEach((p) => {
            const key = `${p.startDate}|${p.endDate}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(p);
        });

        return Array.from(map.entries()).map(([key, items]) => {
            const [start, end] = key.split("|");
            return {
                key,
                startDate: start,
                endDate: end,
                payslips: items,
                totalNet: items.reduce((s, i) => s + i.netAmount, 0),
                totalGross: items.reduce((s, i) => s + i.gross, 0),
                count: items.length,
            };
        });
    }, [payrolls]);

    if (isLoading) return <Loading message="Loading payroll records..." />;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    const q = search.toLowerCase();
    const filtered = payrolls
        .filter((p) => {
            if (statusFilter === "released") return p.isReleased;
            if (statusFilter === "pending") return !p.isReleased;
            return true;
        })
        .filter(
            (p) =>
                p.employeeName.toLowerCase().includes(q) ||
                p.payslipId.toLowerCase().includes(q) ||
                p.startDate.includes(q) ||
                p.endDate.includes(q)
        );

    const filteredHistory = historyGroups.filter((g) =>
        g.payslips.some(
            (p) =>
                p.employeeName.toLowerCase().includes(q) ||
                p.payslipId.toLowerCase().includes(q) ||
                g.startDate.includes(q) ||
                g.endDate.includes(q)
        )
    );

    const totalGross = payrolls.reduce((sum, p) => sum + p.gross, 0);
    const totalNet = payrolls.reduce((sum, p) => sum + p.netAmount, 0);
    const releasedCount = payrolls.filter((p) => p.isReleased).length;
    const pendingCount = payrolls.filter((p) => !p.isReleased).length;

    const stats = [
        { label: "Total Gross", value: `₱${totalGross.toLocaleString()}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Net", value: `₱${totalNet.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
        { label: "Released", value: releasedCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Pending", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: "payslips", label: "Payslips", icon: Receipt },
        { id: "history", label: "History", icon: History },
    ];

    const fmtDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return (
        <div className="p-8 space-y-4">
            {/* Header */}
            <div>
                <p className="text-2xl uppercase font-black tracking-wide">Payroll</p>
                <p className="text-gray-500">Overview of all payslip records and disbursements</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
                        <s.icon className={`w-8 h-8 ${s.color}`} />
                        <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase">{s.label}</p>
                            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-b-2 transition-all -mb-px ${
                            tab === t.id
                                ? "border-[#03045e] text-[#03045e]"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Filters (shared) */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={tab === "payslips" ? "Search by employee, payslip ID, or date..." : "Search history by employee or date..."}
                    />
                </div>
                {tab === "payslips" && (
                    <div className="flex gap-2">
                        {(["all", "released", "pending"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-2 rounded-full text-sm font-bold border-2 capitalize transition-all ${
                                    statusFilter === s
                                        ? "bg-[#03045e] border-[#03045e] text-white"
                                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ═══ Payslips Tab ═══ */}
            {tab === "payslips" && (
                <PaginatedSection
                    title="Payslips"
                    items={filtered}
                    itemsPerPage={10}
                    emptyMessage="No payroll records found."
                    renderItem={(pay: PayrollItem) => (
                        <li key={pay.payslipId}>
                            <Link
                                href={`/payroll/${pay.payslipId}`}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow gap-3"
                            >
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className={`p-3 rounded-lg ${pay.isReleased ? "bg-green-100" : "bg-amber-100"}`}>
                                        <Receipt className={`w-5 h-5 ${pay.isReleased ? "text-green-700" : "text-amber-700"}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{pay.employeeName}</h3>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                                            <span className="font-mono">{pay.payslipId}</span>
                                            <span>
                                                {new Date(pay.startDate).toLocaleDateString()} — {new Date(pay.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Net Pay</p>
                                        <p className="font-black text-lg text-[#03045e]">₱{pay.netAmount.toLocaleString()}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${pay.isReleased ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                        {pay.isReleased ? "Released" : "Pending"}
                                    </span>
                                </div>
                            </Link>
                        </li>
                    )}
                />
            )}

            {/* ═══ History Tab ═══ */}
            {tab === "history" && (
                <div className="space-y-4">
                    {filteredHistory.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p className="font-semibold">No payroll history found.</p>
                        </div>
                    ) : (
                        filteredHistory.map((group) => (
                            <div key={group.key} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                {/* Period header */}
                                <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#03045e]/10 rounded-lg">
                                            <CalendarDays className="w-5 h-5 text-[#03045e]" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 text-sm">
                                                {fmtDate(group.startDate)} — {fmtDate(group.endDate)}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{group.count} payslip{group.count !== 1 ? "s" : ""}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-5 text-right">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-gray-400">Gross</p>
                                            <p className="font-black text-blue-600">₱{group.totalGross.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-gray-400">Net</p>
                                            <p className="font-black text-[#03045e]">₱{group.totalNet.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Payslips in this period */}
                                <div className="divide-y divide-gray-100">
                                    {group.payslips.map((pay) => (
                                        <Link
                                            key={pay.payslipId}
                                            href={`/payroll/${pay.payslipId}`}
                                            className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2 bg-green-50 rounded-lg">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-800 text-sm truncate">{pay.employeeName}</p>
                                                    <p className="text-xs text-gray-400 font-mono">{pay.payslipId}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-3">
                                                <p className="font-black text-[#03045e]">₱{pay.netAmount.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400">{pay.hoursWorked}h worked</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
