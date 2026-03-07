import { API_URL_BASE } from "@/api/api";
import { 
    Salary,
    Deduction,
    Penalty,
    Additional,
    ReleaseType, 
    BaseLine, 
    Method,
    Rate,
} from '@/api/types';

interface APISalary{
    id : string,
    name : string,
    description? : string,
    amount : number,
    release_type : ReleaseType,
    base: BaseLine,
    updated_at : string,
}

interface APIDeduction {
    id : string,
    name : string,
    description : string,
    amount : number,
    deduction_on : number,
    method : Method,
    rate : Rate,
    updated_at : string, 
}

interface APIPenalty {
    id : string,
    name : string,
    description : string,
    amount : number,
    method : Method,
    rate : Rate,
    updated_at : string,
}

interface APIAdditional {
    id : string,
    name : string,
    description : string,
    amount : number,
    method : Method,
    rate : Rate,
    value : number,
    duration : number,
    frequency : ReleaseType,
    updated_at : string,
}

export const WageService = {
    async getSalary(): Promise<Salary[]> {
        try {
            const response = await fetch(`${API_URL_BASE}/rules/salary-base/`, {
                method: 'GET',
                headers: {
                'Accept': 'application/json',
                },
            });

            if (!response.ok) throw new Error(`Failed to fetch salaries: ${response.statusText}`);

            const data = await response.json();
            const salariesData: APISalary[] = Array.isArray(data) ? data : (data.results || []);

            return salariesData.map((salary : APISalary): Salary => ({
                id : salary.id,
                name : salary.name,
                description : salary.description || '',
                amount : salary.amount,
                releaseType : salary.release_type,
                base : salary.base,
                updatedAt : salary.updated_at,
            }));
        } catch (err) {
            console.error('Error fetching salaries:', err);
            return [];
        }
    },

    async getDeduction() : Promise<Deduction[]> {
        try {
            const response = await fetch(`${API_URL_BASE}/rules/deductions/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) throw new Error(`Failed to fetch deductions: ${response.statusText}`);

            const data = await response.json();
            const deducData : APIDeduction[] = Array.isArray(data) ? data : (data.results || []);
            
            return deducData.map((deduc : APIDeduction): Deduction => ({
                id : deduc.id,
                name : deduc.name,
                description : deduc.description || '',
                amount : deduc.amount,
                deductionOn: deduc.deduction_on,
                method: deduc.method,
                rate: deduc.rate,
                updatedAt: deduc.updated_at,
            }));
        } catch (err) {
            console.error('Error fetching deductions: ', err);
            return []
        }
    },

    async getPenalty() : Promise<Penalty[]> {
        try {
            const response = await fetch(`${API_URL_BASE}/rules/penalties/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) throw new Error(`Failed to fetch penalties: ${response.statusText}`);

            const data = await response.json();
            const penaData : APIPenalty[] = Array.isArray(data) ? data : (data.results || []);
            
            return penaData.map((pena : APIPenalty): Penalty => ({
                id : pena.id,
                name : pena.name,
                description : pena.description || '',
                amount : pena.amount,
                method: pena.method,
                rate: pena.rate,
                updatedAt: pena.updated_at,
            }));
        } catch (err) {
            console.error('Error fetching penalties: ', err);
            return []
        }
    },

    async getAdditional() : Promise<Additional[]> {
        try {
            const response = await fetch(`${API_URL_BASE}/rules/additionals/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) throw new Error(`Failed to fetch additionals: ${response.statusText}`);

            const data = await response.json();
            const addData : APIAdditional[] = Array.isArray(data) ? data : (data.results || []);
            
            return addData.map((add : APIAdditional): Additional => ({
                id : add.id,
                name : add.name,
                description : add.description || '',
                amount : add.amount,
                method : add.method,
                rate : add.rate,
                value : add.value,
                duration : add.duration,
                frequency : add.frequency,
                updatedAt : add.updated_at,
            }));
        } catch (err) {
            console.error('Error fetching additionals: ', err);
            return []
        }
    }

}