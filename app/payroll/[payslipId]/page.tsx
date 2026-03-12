"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
    ArrowLeft,
    Printer,
    User,
    Calendar,
    Timer,
    Hash,
    CheckCircle,
    Clock,
    Briefcase,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import Button from "@/app/components/ui/Button";
import Loading from "@/app/components/ui/Loading";
import { PayrollService } from "@/services/payroll_srv";
import { WageService } from "@/services/wage_srv";
import { PayrollDetail, PayrollItem, Deduction, Penalty, Additional } from "@/api/types";

export default function PayrollDetailPage() {
    const router = useRouter();
    const params = useParams();
    const payslipId = params.payslipId as string;
    const receiptRef = useRef<HTMLDivElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [payroll, setPayroll] = useState<PayrollDetail | null>(null);
    const [history, setHistory] = useState<PayrollItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    const [deductionItems, setDeductionItems] = useState<Deduction[]>([]);
    const [penaltyItems, setPenaltyItems] = useState<Penalty[]>([]);
    const [additionalItems, setAdditionalItems] = useState<Additional[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setIsLoading(true);
                const data = await PayrollService.getPayrollById(payslipId);
                setPayroll(data);

                const [allDeductions, allPenalties, allAdditionals] = await Promise.all([
                    WageService.getDeduction(),
                    WageService.getPenalty(),
                    WageService.getAdditional(),
                ]);

                setDeductionItems(allDeductions.filter((d) => data.deductions.includes(Number(d.id))));
                setPenaltyItems(allPenalties.filter((p) => data.penalties.includes(Number(p.id))));
                setAdditionalItems(allAdditionals.filter((a) => data.additionals.includes(Number(a.id))));

                if (data.employeeId) {
                    const empHistory = await PayrollService.getPayrollsByEmployee(data.employeeId);
                    setHistory(empHistory.filter((h) => h.payslipId !== data.payslipId));
                }
            } catch (error) {
                console.error("Error fetching payroll:", error);
                toast.error("Failed to load payroll data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [payslipId]);

    const handlePrint = () => {
        const content = receiptRef.current;
        if (!content) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Payslip - ${payroll?.payslipId}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
                    .receipt { border: 2px dashed #333; padding: 20px; }
                    .header { text-align: center; border-bottom: 1px dashed #999; padding-bottom: 12px; margin-bottom: 12px; }
                    .header h1 { font-size: 18px; font-weight: 900; letter-spacing: 2px; }
                    .header p { font-size: 11px; color: #666; margin-top: 2px; }
                    .meta { font-size: 11px; margin-bottom: 12px; }
                    .meta-row { display: flex; justify-content: space-between; padding: 2px 0; }
                    .meta-row .label { color: #888; }
                    .divider { border-top: 1px dashed #999; margin: 10px 0; }
                    .divider-thick { border-top: 2px solid #333; margin: 10px 0; }
                    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 6px; }
                    .line-item { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; }
                    .line-item .name { max-width: 60%; }
                    .line-item.deduction .amount { color: #c00; }
                    .line-item.addition .amount { color: #070; }
                    .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; padding: 8px 0; }
                    .footer { text-align: center; font-size: 10px; color: #aaa; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #999; }
                    @media print { body { padding: 0; } .receipt { border: none; } }
                </style>
            </head>
            <body>
                ${content.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
    };

    if (isLoading) return <Loading message="Loading payslip..." />;
    if (!payroll) return <div className="p-8 text-red-500">Payslip not found.</div>;

    const totalDeducted = payroll.totalDeductions + payroll.totalPenalties;

    return (
        <div className="p-8 space-y-4">
            {/* Nav */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()} className="gap-4">
                    <ArrowLeft className="h-6 w-6" />
                    <p className="font-bold text-lg">Back to Payroll</p>
                </Button>
                <Button variant="solid" onClick={handlePrint} className="gap-2 px-6">
                    <Printer className="w-4 h-4" />
                    Print
                </Button>
            </div>

            <div className="max-w-lg mx-auto space-y-6">
                {/* ═══ Receipt ═══ */}
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl overflow-hidden shadow-sm">
                    {/* Printable content */}
                    <div ref={receiptRef} className="hidden">
                        <div className="receipt">
                            <div className="header">
                                <h1>WARLEN INDUSTRIAL</h1>
                                <p>General Construction &amp; Specialty Contractor</p>
                                <p style={{ marginTop: "8px", fontSize: "13px", fontWeight: 700 }}>PAYSLIP</p>
                            </div>
                            <div className="meta">
                                <div className="meta-row"><span className="label">Payslip No.</span><span>{payroll.payslipId}</span></div>
                                <div className="meta-row"><span className="label">Employee</span><span>{payroll.employeeName}</span></div>
                                <div className="meta-row"><span className="label">Period</span><span>{new Date(payroll.startDate).toLocaleDateString()} - {new Date(payroll.endDate).toLocaleDateString()}</span></div>
                                <div className="meta-row"><span className="label">Hours Worked</span><span>{payroll.hoursWorked}h</span></div>
                                <div className="meta-row"><span className="label">Issued</span><span>{new Date(payroll.issuedAt).toLocaleDateString()}</span></div>
                                <div className="meta-row"><span className="label">Status</span><span>{payroll.isReleased ? "RELEASED" : "PENDING"}</span></div>
                            </div>
                            <div className="divider"></div>
                            <div className="section-title">Earnings</div>
                            <div className="line-item"><span>Gross Pay</span><span>₱{payroll.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                            {additionalItems.length > 0 && (
                                <>
                                    <div className="divider"></div>
                                    <div className="section-title">Additionals</div>
                                    {additionalItems.map((a) => (
                                        <div key={a.id} className="line-item addition"><span className="name">{a.name}</span><span className="amount">+₱{a.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    ))}
                                </>
                            )}
                            {deductionItems.length > 0 && (
                                <>
                                    <div className="divider"></div>
                                    <div className="section-title">Deductions</div>
                                    {deductionItems.map((d) => (
                                        <div key={d.id} className="line-item deduction"><span className="name">{d.name}</span><span className="amount">-₱{d.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    ))}
                                </>
                            )}
                            {penaltyItems.length > 0 && (
                                <>
                                    <div className="divider"></div>
                                    <div className="section-title">Penalties</div>
                                    {penaltyItems.map((p) => (
                                        <div key={p.id} className="line-item deduction"><span className="name">{p.name}</span><span className="amount">-₱{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    ))}
                                </>
                            )}
                            <div className="divider-thick"></div>
                            <div className="total-row"><span>NET PAY</span><span>₱{payroll.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                            <div className="footer">
                                <p>This is a system-generated payslip.</p>
                                <p>Warlen Payroll System</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Visual receipt (on-screen) ── */}
                    <div className="bg-[#03045e] px-6 py-5 text-center text-white">
                        <p className="text-xs tracking-[4px] uppercase font-bold text-white/50">Warlen Industrial Sales Corp.</p>
                        <h1 className="text-2xl font-black tracking-wider mt-1">PAYSLIP</h1>
                        <p className="text-white/40 font-mono text-sm mt-1">{payroll.payslipId}</p>
                    </div>

                    {/* Status badge */}
                    <div className="flex justify-center -mt-3">
                        <span className={`px-5 py-1.5 rounded-full text-xs font-black shadow-md ${payroll.isReleased ? "bg-green-500 text-white" : "bg-amber-400 text-amber-900"}`}>
                            {payroll.isReleased ? "✓ RELEASED" : "⏳ PENDING"}
                        </span>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        {/* Meta fields */}
                        <div className="space-y-2.5">
                            <MetaRow icon={<User className="w-4 h-4" />} label="Employee" value={payroll.employeeName} />
                            <MetaRow icon={<Hash className="w-4 h-4" />} label="Employee ID" value={payroll.employeeId} />
                            <MetaRow icon={<Calendar className="w-4 h-4" />} label="Pay Period" value={`${fmtDate(payroll.startDate)} — ${fmtDate(payroll.endDate)}`} />
                            <MetaRow icon={<Timer className="w-4 h-4" />} label="Hours Worked" value={`${payroll.hoursWorked} hours`} />
                            <MetaRow icon={<Calendar className="w-4 h-4" />} label="Date Issued" value={fmtDate(payroll.issuedAt)} />
                        </div>

                        {/* ── Earnings ── */}
                        <div className="border-t border-dashed border-gray-200 pt-4">
                            <SectionLabel>Earnings</SectionLabel>
                            <LineItem label="Gross Pay" amount={payroll.gross} type="neutral" bold />
                        </div>

                        {/* ── Additionals ── */}
                        {additionalItems.length > 0 && (
                            <div className="border-t border-dashed border-gray-200 pt-4">
                                <SectionLabel count={payroll.additionalsCount}>Additionals</SectionLabel>
                                {additionalItems.map((a) => (
                                    <LineItem key={a.id} label={a.name} amount={a.amount} type="add" desc={a.description} />
                                ))}
                                <LineItem label="Subtotal Additionals" amount={payroll.totalAdditionals} type="add" bold />
                            </div>
                        )}

                        {/* ── Deductions ── */}
                        {deductionItems.length > 0 && (
                            <div className="border-t border-dashed border-gray-200 pt-4">
                                <SectionLabel count={payroll.deductionsCount}>Deductions</SectionLabel>
                                {deductionItems.map((d) => (
                                    <LineItem key={d.id} label={d.name} amount={d.amount} type="deduct" desc={d.description} />
                                ))}
                                <LineItem label="Subtotal Deductions" amount={payroll.totalDeductions} type="deduct" bold />
                            </div>
                        )}

                        {/* ── Penalties ── */}
                        {penaltyItems.length > 0 && (
                            <div className="border-t border-dashed border-gray-200 pt-4">
                                <SectionLabel count={payroll.penaltiesCount}>Penalties</SectionLabel>
                                {penaltyItems.map((p) => (
                                    <LineItem key={p.id} label={p.name} amount={p.amount} type="deduct" desc={p.description} />
                                ))}
                                <LineItem label="Subtotal Penalties" amount={payroll.totalPenalties} type="deduct" bold />
                            </div>
                        )}

                        {/* ── Summary ── */}
                        <div className="border-t border-dashed border-gray-200 pt-4 space-y-1 text-sm text-gray-500">
                            <div className="flex justify-between">
                                <span>Gross</span>
                                <span>₱{payroll.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            {payroll.totalAdditionals > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>+ Additionals</span>
                                    <span>+₱{payroll.totalAdditionals.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {totalDeducted > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>− Deductions & Penalties</span>
                                    <span>−₱{totalDeducted.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                        </div>

                        {/* ── Net Pay ── */}
                        <div className="border-t-2 border-gray-800 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-black text-gray-800 uppercase tracking-wide">Net Pay</span>
                                <span className="text-2xl font-black text-[#03045e]">
                                    ₱{payroll.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-dashed border-gray-200 pt-4 text-center text-xs text-gray-400 space-y-0.5">
                            <p>This is a system-generated payslip.</p>
                            <p className="font-semibold">Warlen Payroll System</p>
                        </div>
                    </div>
                </div>

                {/* ═══ Payroll History ═══ */}
                {history.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-[#03045e]" />
                                <div className="text-left">
                                    <h3 className="font-black text-gray-800 uppercase text-sm">Payroll History</h3>
                                    <p className="text-xs text-gray-400">{history.length} previous payslip{history.length !== 1 ? "s" : ""} for {payroll.employeeName}</p>
                                </div>
                            </div>
                            {showHistory ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>

                        {showHistory && (
                            <div className="border-t border-gray-100 divide-y divide-gray-100">
                                {history.map((h) => (
                                    <Link
                                        key={h.payslipId}
                                        href={`/payroll/${h.payslipId}`}
                                        className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`p-2 rounded-lg ${h.isReleased ? "bg-green-50" : "bg-amber-50"}`}>
                                                {h.isReleased
                                                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                                                    : <Clock className="w-4 h-4 text-amber-600" />
                                                }
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate font-mono">{h.payslipId}</p>
                                                <p className="text-xs text-gray-400">
                                                    {fmtDate(h.startDate)} — {fmtDate(h.endDate)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <p className="font-black text-[#03045e]">₱{h.netAmount.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400">{h.hoursWorked}h worked</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Helpers ──

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-400">{icon}</span>
            <span className="text-gray-400 w-28 shrink-0">{label}</span>
            <span className="font-semibold text-gray-800 truncate">{value}</span>
        </div>
    );
}

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
    return (
        <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">{children}</p>
            {count !== undefined && (
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{count}</span>
            )}
        </div>
    );
}

function LineItem({ label, amount, type, bold, desc }: { label: string; amount: number; type: "add" | "deduct" | "neutral"; bold?: boolean; desc?: string }) {
    const prefix = type === "add" ? "+" : type === "deduct" ? "−" : "";
    const color = type === "add" ? "text-green-600" : type === "deduct" ? "text-red-600" : "text-gray-800";

    return (
        <div className={`flex justify-between items-start py-1.5 ${bold ? "border-t border-gray-100 mt-1 pt-2" : ""}`}>
            <div className="min-w-0 flex-1">
                <span className={`text-sm ${bold ? "font-black text-gray-700" : "text-gray-600"}`}>{label}</span>
                {desc && <p className="text-[11px] text-gray-400 truncate">{desc}</p>}
            </div>
            <span className={`text-sm font-bold shrink-0 ml-3 ${color} ${bold ? "font-black" : ""}`}>
                {prefix}₱{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
        </div>
    );
}
