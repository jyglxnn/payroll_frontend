import { API } from "@/api/api";
import { Attendance, DailyTimeRecord, DTRStatus } from "@/api/types";
import { EmployeesService } from "./employees_srv";

// ── API response shapes ──

interface APIAttendanceDTR {
    id: number;
    employee: string;
    employee_name: string;
    today: string;
    timein_am: string | null;
    timeout_am: string | null;
    timein_pm: string | null;
    timeout_pm: string | null;
    status: DTRStatus;
    leave_type: string | null;
    excuse_type: string | null;
    note: string | null;
    mins_late: number | null;
    am_hours: string;
    pm_hours: string;
    overtime: string;
    updated_at: string;
}

interface APIAttendance {
    attendance_id: string;
    today: string;
    site: string | null;
    site_name: string;
    dtr_count: number;
    DTR: APIAttendanceDTR[];
    updated_at: string;
}

// ── Mapper ──

function mapAttendance(a: APIAttendance): Attendance {
    return {
        attendanceId: a.attendance_id,
        today: a.today,
        siteId: a.site,
        siteName: a.site_name,
        dtrCount: a.dtr_count,
        dtrRecords: (a.DTR || []).map((d) => EmployeesService.mapDTR(d as any)),
        updatedAt: a.updated_at,
    };
}

// ── Service ──

export const AttendanceService = {
    async getAttendances(): Promise<Attendance[]> {
        const response = await API.get<APIAttendance[] | { results: APIAttendance[] }>("/attendance/");
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        return data.map(mapAttendance);
    },

    async getAttendanceByDate(date: string): Promise<DailyTimeRecord[]> {
        const response = await API.get<APIAttendanceDTR[]>(`/attendance/?date=${date}`);
        const data = Array.isArray(response.data) ? response.data : [];
        return data.map((d) => EmployeesService.mapDTR(d as any));
    },

    async getAttendanceById(attendanceId: string): Promise<Attendance> {
        const response = await API.get<APIAttendance>(`/attendance/${attendanceId}/`);
        return mapAttendance(response.data);
    },
};
