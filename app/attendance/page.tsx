"use client";

import { useEffect, useState, useMemo } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Coffee,
    ShieldAlert,
    Timer,
    LogIn,
    LogOut,
    Search,
    Pencil,
    X,
    Save,
    Loader2,
} from "lucide-react";
import Loading from "@/app/components/ui/Loading";
import SearchInput from "@/app/components/ui/SearchInput";
import PaginatedSection from "@/app/components/Pagnation";
import { AttendanceService } from "@/services/attendance_srv";
import { SitesService } from "@/services/sites_srv";
import { DailyTimeRecord, DTRStatus, LeaveType, ExcuseType, Site } from "@/api/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const statusColors: Record<string, { bg: string; text: string }> = {
    present: { bg: "bg-green-100", text: "text-green-700" },
    late: { bg: "bg-yellow-100", text: "text-yellow-700" },
    waiting: { bg: "bg-gray-100", text: "text-gray-500" },
    leave: { bg: "bg-blue-100", text: "text-blue-700" },
    excuse: { bg: "bg-purple-100", text: "text-purple-700" },
};

function formatTime(t: string | null) {
    if (!t) return "--:--";
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

function pad(n: number) { return n.toString().padStart(2, "0"); }

export default function AttendancePage() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string>(
        `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    );

    const [records, setRecords] = useState<DailyTimeRecord[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [siteFilter, setSiteFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [editingRecord, setEditingRecord] = useState<DailyTimeRecord | null>(null);

    // Fetch sites once
    useEffect(() => {
        SitesService.getSites().then(setSites).catch(console.error);
    }, []);

    // Fetch DTR records by selected date
    useEffect(() => {
        if (!selectedDate) return;
        const fetchRecords = async () => {
            try {
                setIsLoading(true);
                const data = await AttendanceService.getAttendanceByDate(selectedDate);
                setRecords(data);
            } catch (err) {
                console.error("Failed to fetch attendance:", err);
                setRecords([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecords();
    }, [selectedDate]);

    // ── Calendar logic ──
    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const cells: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
        return cells;
    }, [currentMonth, currentYear]);

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
        else setCurrentMonth(currentMonth - 1);
    };

    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
        else setCurrentMonth(currentMonth + 1);
    };

    const handleDayClick = (day: number) => {
        const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
        setSelectedDate(dateStr);
    };

    const selectedDay = selectedDate ? parseInt(selectedDate.split("-")[2]) : null;
    const isSelectedMonth =
        selectedDate &&
        parseInt(selectedDate.split("-")[0]) === currentYear &&
        parseInt(selectedDate.split("-")[1]) === currentMonth + 1;

    // ── Filtering ──
    const q = search.toLowerCase();

    // We filter records client-side by employee name and site
    // Since DTR doesn't have site directly, we rely on search for employee name
    const filtered = records.filter((r) => {
        const nameMatch = r.employeeName.toLowerCase().includes(q);
        const statusMatch = !statusFilter || r.status === statusFilter;
        return nameMatch && statusMatch;
    });

    // ── Overview stats ──
    const presentCount = filtered.filter((r) => r.status === "present").length;
    const lateCount = filtered.filter((r) => r.status === "late").length;
    const leaveCount = filtered.filter((r) => r.status === "leave").length;
    const excuseCount = filtered.filter((r) => r.status === "excuse").length;
    const absentCount = filtered.filter((r) => r.status === "waiting").length;
    const totalLateMinutes = filtered.reduce((sum, r) => sum + (r.minsLate || 0), 0);

    const handleSaveEdit = async (updated: DailyTimeRecord) => {
        setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        setEditingRecord(null);
    };

    const overviewStats = [
        { label: "Present", value: presentCount, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
        { label: "Late", value: lateCount, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
        { label: "On Leave", value: leaveCount, icon: Coffee, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Excuse", value: excuseCount, icon: ShieldAlert, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Absent", value: absentCount, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
        { label: "Late Mins", value: totalLateMinutes, icon: Timer, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    return (
        <div className="p-8 space-y-4">
            {/* Header */}
            <div>
                <p className="text-2xl uppercase font-black tracking-wide">Attendance</p>
                <p className="text-gray-500">
                    Daily time records overview — select a date to view
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                {/* Calendar */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-fit">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <h3 className="font-black text-gray-800">
                            {MONTHS[currentMonth]} {currentYear}
                        </h3>
                        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Day labels */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {DAYS.map((d) => (
                            <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => {
                            if (day === null) return <div key={`empty-${idx}`} />;
                            const isSelected = isSelectedMonth && day === selectedDay;
                            const isToday =
                                day === today.getDate() &&
                                currentMonth === today.getMonth() &&
                                currentYear === today.getFullYear();

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-semibold transition-all
                                        ${isSelected
                                            ? "bg-[#03045e] text-white shadow-md"
                                            : isToday
                                            ? "bg-blue-50 text-blue-700 font-black ring-2 ring-blue-200"
                                            : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-4 text-center text-sm text-gray-500">
                        Selected: <span className="font-bold text-gray-800">
                            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                        </span>
                    </div>
                </div>

                {/* Right panel */}
                <div className="space-y-4">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                        {overviewStats.map((s) => (
                            <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-3`}>
                                <s.icon className={`w-6 h-6 ${s.color}`} />
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{s.label}</p>
                                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Search & Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <SearchInput value={search} onChange={setSearch} placeholder="Search by employee name..." />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 outline-none focus:ring-2 focus:ring-[#03045e]"
                        >
                            <option value="">All Statuses</option>
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                            <option value="waiting">Absent</option>
                            <option value="leave">On Leave</option>
                            <option value="excuse">Excuse</option>
                        </select>
                        <select
                            value={siteFilter}
                            onChange={(e) => setSiteFilter(e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 outline-none focus:ring-2 focus:ring-[#03045e]"
                        >
                            <option value="">All Sites</option>
                            {sites
                                .filter((s) => !s.isArchived)
                                .map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                        </select>
                    </div>

                    {/* Records */}
                    {isLoading ? (
                        <Loading message="Fetching records..." />
                    ) : (
                        <PaginatedSection
                            title={`Records — ${new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                            items={filtered}
                            itemsPerPage={10}
                            emptyMessage="No attendance records for this date."
                            renderItem={(record: DailyTimeRecord) => {
                                const cfg = statusColors[record.status] || statusColors.waiting;
                                return (
                                    <li key={record.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-10 h-10 rounded-full bg-[#03045e] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                    {record.employeeName
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-900 truncate">{record.employeeName}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${cfg.bg} ${cfg.text}`}>
                                                            {record.status}
                                                        </span>
                                                        {record.minsLate && record.minsLate > 0 && (
                                                            <span className="text-xs text-red-500 font-semibold">{record.minsLate} min late</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Time entries */}
                                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                                <TimeCell label="AM In" value={formatTime(record.timeinAm)} icon={<LogIn className="w-3 h-3 text-blue-500" />} />
                                                <TimeCell label="AM Out" value={formatTime(record.timeoutAm)} icon={<LogOut className="w-3 h-3 text-orange-500" />} />
                                                <TimeCell label="PM In" value={formatTime(record.timeinPm)} icon={<LogIn className="w-3 h-3 text-blue-500" />} />
                                                <TimeCell label="PM Out" value={formatTime(record.timeoutPm)} icon={<LogOut className="w-3 h-3 text-orange-500" />} />
                                            </div>

                                            <div className="flex gap-2 text-center text-xs shrink-0">
                                                <div className="bg-gray-50 rounded-lg px-3 py-2">
                                                    <p className="text-gray-400">Hours</p>
                                                    <p className="font-black text-gray-800">{(record.amHours + record.pmHours).toFixed(1)}</p>
                                                </div>
                                                <div className="bg-green-50 rounded-lg px-3 py-2">
                                                    <p className="text-gray-400">OT</p>
                                                    <p className="font-black text-green-700">{record.overtime.toFixed(1)}</p>
                                                </div>
                                            </div>

                                            {/* Edit button */}
                                            <button
                                                onClick={() => setEditingRecord(record)}
                                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#03045e] shrink-0"
                                                title="Edit record"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </li>
                                );
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingRecord && (
                <EditDTRModal
                    record={editingRecord}
                    onClose={() => setEditingRecord(null)}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
    );
}

interface EditDTRModalProps {
    record: DailyTimeRecord;
    onClose: () => void;
    onSave: (updated: DailyTimeRecord) => void;
}

function EditDTRModal({ record, onClose, onSave }: EditDTRModalProps) {
    const [status, setStatus] = useState<DTRStatus>(record.status);
    const [timeinAm, setTimeinAm] = useState(record.timeinAm || "");
    const [timeoutAm, setTimeoutAm] = useState(record.timeoutAm || "");
    const [timeinPm, setTimeinPm] = useState(record.timeinPm || "");
    const [timeoutPm, setTimeoutPm] = useState(record.timeoutPm || "");
    const [leaveType, setLeaveType] = useState<LeaveType | "">(record.leaveType || "");
    const [excuseType, setExcuseType] = useState<ExcuseType | "">(record.excuseType || "");
    const [note, setNote] = useState(record.note || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const payload: Record<string, unknown> = {
                status,
                timein_am: timeinAm || null,
                timeout_am: timeoutAm || null,
                timein_pm: timeinPm || null,
                timeout_pm: timeoutPm || null,
                leave_type: status === "leave" ? (leaveType || null) : null,
                excuse_type: status === "excuse" ? (excuseType || null) : null,
                note: note || null,
            };
            const updated = await AttendanceService.updateDTR(record.id, payload as any);
            onSave(updated);
        } catch (err: any) {
            console.error("Failed to update DTR:", err);
            setError(err?.response?.data?.detail || "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-[#03045e] transition-all";
    const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-black text-gray-900">Edit Record</h2>
                        <p className="text-sm text-gray-500">{record.employeeName} — {record.today}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    {/* Status */}
                    <div>
                        <label className={labelClass}>Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as DTRStatus)}
                            className={inputClass}
                        >
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                            <option value="waiting">Absent</option>
                            <option value="leave">On Leave</option>
                            <option value="excuse">Excuse</option>
                        </select>
                    </div>

                    {/* Time In/Out Grid */}
                    <div>
                        <p className={labelClass}>Time In / Out</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-0.5">AM In</label>
                                <input
                                    type="time"
                                    value={timeinAm}
                                    onChange={(e) => setTimeinAm(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-0.5">AM Out</label>
                                <input
                                    type="time"
                                    value={timeoutAm}
                                    onChange={(e) => setTimeoutAm(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-0.5">PM In</label>
                                <input
                                    type="time"
                                    value={timeinPm}
                                    onChange={(e) => setTimeinPm(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-0.5">PM Out</label>
                                <input
                                    type="time"
                                    value={timeoutPm}
                                    onChange={(e) => setTimeoutPm(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Leave Type (shown when status is leave) */}
                    {status === "leave" && (
                        <div>
                            <label className={labelClass}>Leave Type</label>
                            <select
                                value={leaveType}
                                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                                className={inputClass}
                            >
                                <option value="">Select...</option>
                                <option value="wp">With Pay</option>
                                <option value="wop">Without Pay</option>
                            </select>
                        </div>
                    )}

                    {/* Excuse Type (shown when status is excuse) */}
                    {status === "excuse" && (
                        <div>
                            <label className={labelClass}>Excuse Type</label>
                            <select
                                value={excuseType}
                                onChange={(e) => setExcuseType(e.target.value as ExcuseType)}
                                className={inputClass}
                            >
                                <option value="">Select...</option>
                                <option value="medical">Medical</option>
                                <option value="personal">Personal</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    )}

                    {/* Note */}
                    <div>
                        <label className={labelClass}>Note</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder="Optional note..."
                            className={inputClass + " resize-none"}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-600 font-semibold bg-red-50 rounded-lg px-3 py-2">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#03045e] hover:bg-[#020344] rounded-lg transition-colors disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function TimeCell({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="bg-gray-50 rounded-lg px-2 py-1.5">
            <div className="flex justify-center mb-0.5">{icon}</div>
            <p className="text-gray-400">{label}</p>
            <p className="font-bold text-gray-700">{value}</p>
        </div>
    );
}
