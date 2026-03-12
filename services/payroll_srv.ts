import { API } from "@/api/api";
import { PayrollItem, PayrollDetail } from "@/api/types";

// ── API response shapes ──

interface APIPayroll {
    payslip_id: string;
    start_date: string;
    end_date: string;
    employee_id: string;
    employee_name: string;
    hours_worked: number;
    gross: string;
    net_amount: string;
    issued_at: string;
    is_released: boolean;
}

interface APIPayrollDetail extends APIPayroll {
    deductions: number[];
    penalties: number[];
    additionals: number[];
    deductions_count: number;
    penalties_count: number;
    additionals_count: number;
    total_deductions: number;
    total_penalties: number;
    total_additionals: number;
}

// ── Mappers ──

function mapPayroll(p: APIPayroll): PayrollItem {
    return {
        payslipId: p.payslip_id,
        startDate: p.start_date,
        endDate: p.end_date,
        employeeId: p.employee_id,
        employeeName: p.employee_name,
        hoursWorked: p.hours_worked,
        gross: parseFloat(p.gross),
        netAmount: parseFloat(p.net_amount),
        issuedAt: p.issued_at,
        isReleased: p.is_released,
    };
}

function mapPayrollDetail(p: APIPayrollDetail): PayrollDetail {
    return {
        ...mapPayroll(p),
        deductions: p.deductions || [],
        penalties: p.penalties || [],
        additionals: p.additionals || [],
        deductionsCount: p.deductions_count,
        penaltiesCount: p.penalties_count,
        additionalsCount: p.additionals_count,
        totalDeductions: p.total_deductions,
        totalPenalties: p.total_penalties,
        totalAdditionals: p.total_additionals,
    };
}

// ── Service ──

export const PayrollService = {
    async getPayrolls(): Promise<PayrollItem[]> {
        const response = await API.get<APIPayroll[] | { results: APIPayroll[] }>("/payroll/");
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        return data.map(mapPayroll);
    },

    async getPayrollById(payslipId: string): Promise<PayrollDetail> {
        const response = await API.get<APIPayrollDetail>(`/payroll/${payslipId}/`);
        return mapPayrollDetail(response.data);
    },

    async getPayrollsByEmployee(employeeId: string): Promise<PayrollItem[]> {
        const all = await this.getPayrolls();
        return all
            .filter((p) => p.employeeId === employeeId)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    },
};
