import { API, MEDIA_URL_BASE } from "@/api/api";
import {
    Employee,
    EmployeeDetail,
    EmployeeSite,
    DailyTimeRecord,
    DTRStatus,
    LeaveType,
    ExcuseType,
} from "@/api/types";
import { WageService, APISalary } from "./wage_srv";

// ── API response shapes ──

interface APIEmployeeSite {
    site_id: string;
    name: string;
}

interface APIEmployee {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    image: string | null;
    job: string;
    job_title: string;
    job_details: {
        job_id: string;
        name: string;
        description: string;
        salary: APISalary | null;
        timein_am_base: string;
        timein_pm_base: string;
        timeout_am_base: string;
        timeout_pm_base: string;
        maximum_overtime: number;
        minimum_overtime: number;
        updated_at: string;
    } | null;
    sites: APIEmployeeSite[];
    is_active: boolean;
    joined_at: string;
    updated_at: string;
}

interface APIDailyTimeRecord {
    id: number;
    employee: string;
    employee_name: string;
    today: string;
    timein_am: string | null;
    timeout_am: string | null;
    timein_pm: string | null;
    timeout_pm: string | null;
    status: DTRStatus;
    leave_type: LeaveType | null;
    excuse_type: ExcuseType | null;
    note: string | null;
    mins_late: number | null;
    am_hours: string;
    pm_hours: string;
    overtime: string;
    updated_at: string;
}

interface APIEmployeeDetail extends APIEmployee {
    time_records: APIDailyTimeRecord[];
    full_name: string;
}

// ── Mappers ──

function mapDTR(d: APIDailyTimeRecord): DailyTimeRecord {
    return {
        id: d.id,
        employeeId: d.employee,
        employeeName: d.employee_name,
        today: d.today,
        timeinAm: d.timein_am,
        timeoutAm: d.timeout_am,
        timeinPm: d.timein_pm,
        timeoutPm: d.timeout_pm,
        status: d.status,
        leaveType: d.leave_type,
        excuseType: d.excuse_type,
        note: d.note,
        minsLate: d.mins_late,
        amHours: parseFloat(d.am_hours),
        pmHours: parseFloat(d.pm_hours),
        overtime: parseFloat(d.overtime),
        updatedAt: d.updated_at,
    };
}

function mapEmployee(e: APIEmployee): Employee {
    return {
        id: e.employee_id,
        firstName: e.first_name,
        lastName: e.last_name,
        email: e.email,
        image: e.image ? (e.image.startsWith("http") ? e.image : `${MEDIA_URL_BASE}/${e.image}`) : "",
        jobTitle: e.job_title || e.job_details?.name || "",
        jobDetails: e.job_details
            ? {
                  id: e.job_details.job_id,
                  name: e.job_details.name,
                  description: e.job_details.description,
                  salary: e.job_details.salary ? WageService.mapAPISalaryToSalary(e.job_details.salary) : null,
                  timeinAmBase: e.job_details.timein_am_base,
                  timeinPmBase: e.job_details.timein_pm_base,
                  timeoutAmBase: e.job_details.timeout_am_base,
                  timeoutPmBase: e.job_details.timeout_pm_base,
                  maximumOvertime: e.job_details.maximum_overtime,
                  minimumOvertime: e.job_details.minimum_overtime,
                  updatedAt: e.job_details.updated_at,
              }
            : null,
        sites: (e.sites || []).map((s) => ({ siteId: s.site_id, name: s.name })),
        isActive: e.is_active,
        joinedAt: e.joined_at,
        updatedAt: e.updated_at,
    };
}

function mapEmployeeDetail(e: APIEmployeeDetail): EmployeeDetail {
    const base = mapEmployee(e);
    return {
        ...base,
        fullName: e.full_name,
        timeRecords: (e.time_records || []).map(mapDTR),
    };
}

// ── Service ──

export const EmployeesService = {
    async getEmployees(): Promise<Employee[]> {
        const response = await API.get<APIEmployee[] | { results: APIEmployee[] }>("/employees/");
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        return data.map(mapEmployee);
    },

    async getEmployeeById(employeeId: string): Promise<EmployeeDetail> {
        const response = await API.get<APIEmployeeDetail>(`/employees/${employeeId}/`);
        return mapEmployeeDetail(response.data);
    },

    async createEmployee(payload: {
        first_name: string;
        last_name: string;
        email?: string;
        job: string;
        joined_at: string;
        image?: File;
    }): Promise<Employee> {
        const formData = new FormData();
        formData.append("first_name", payload.first_name);
        formData.append("last_name", payload.last_name);
        if (payload.email) formData.append("email", payload.email);
        formData.append("job", payload.job);
        formData.append("joined_at", payload.joined_at);
        if (payload.image) formData.append("image", payload.image);

        const response = await API.post<APIEmployee>("/employees/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return mapEmployee(response.data);
    },

    async updateEmployee(
        employeeId: string,
        payload: Record<string, unknown>
    ): Promise<Employee> {
        const hasFile = payload.image instanceof File;
        let response;

        if (hasFile) {
            const formData = new FormData();
            Object.entries(payload).forEach(([key, val]) => {
                if (val instanceof File) formData.append(key, val);
                else if (val !== undefined && val !== null) formData.append(key, String(val));
            });
            response = await API.patch<APIEmployee>(`/employees/${employeeId}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        } else {
            response = await API.patch<APIEmployee>(`/employees/${employeeId}/`, payload);
        }
        return mapEmployee(response.data);
    },

    async deleteEmployee(employeeId: string): Promise<boolean> {
        await API.delete(`/employees/${employeeId}/`);
        return true;
    },

    mapDTR,
};
