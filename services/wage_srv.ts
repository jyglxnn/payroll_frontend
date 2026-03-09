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
import { get } from "http";

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
    value : number,
    updated_at : string, 
}

interface APIPenalty {
    id : string,
    name : string,
    description : string,
    amount : number,
    method : Method,
    rate : Rate,
    value : number,
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

    async getSalaryId(id:string) : Promise<Salary | undefined> {
        try {
            const response = await fetch(`${API_URL_BASE}/rules/salary-base/${id}/`, {
                method: 'GET',
                headers: {
                'Accept': 'application/json',
                },
            });

            if (!response.ok) throw new Error(`Failed to fetch salary with id ${id}: ${response.statusText}`);
            
            const salary : APISalary = await response.json();
            
            return {
                id : salary.id,
                name : salary.name,
                description : salary.description || '',
                amount: salary.amount, 
                releaseType : salary.release_type,
                base : salary.base,
                updatedAt : salary.updated_at,
            };
            
        } catch (err) {
            console.error(`Error fetching salary with id ${id}:`, err);
            return undefined;
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
                value: deduc.value,
                updatedAt: deduc.updated_at,
            }));
        } catch (err) {
            console.error('Error fetching deductions: ', err);
            return []
        }
    },

    async getDeductionId(id:string) : Promise<Deduction | undefined> {
        try {
            const response = await fetch(`${API_URL_BASE}/rules/deductions/${id}/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            
            if (!response.ok) throw new Error(`Failed to fetch deduction with id ${id}: ${response.statusText}`);   
            
            const deduction : APIDeduction= await response.json();
            
            return {
                id : deduction.id,
                name : deduction.name,
                description : deduction.description || '',
                amount : deduction.amount,
                deductionOn: deduction.deduction_on,
                method: deduction.method,
                rate: deduction.rate,
                value: deduction.value,
                updatedAt: deduction.updated_at,
            };
        } catch (err) {
            console.error(`Error fetching deduction with id ${id}:`, err);
            return undefined;
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
                value: pena.value,
                updatedAt: pena.updated_at,
            }));
        } catch (err) {
            console.error('Error fetching penalties: ', err);
            return []
        }
    },

    async getPenaltyId(id:string) : Promise<Penalty | undefined> {
        try {
            const response = await fetch(`${API_URL_BASE}/rules/penalties/${id}/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            
            if (!response.ok) throw new Error(`Failed to fetch penalty with id ${id}: ${response.statusText}`);   
            
            const penalty : APIPenalty= await response.json();
            
            return {
                id : penalty.id,
                name : penalty.name,
                description : penalty.description || '',
                amount : penalty.amount,
                method: penalty.method,
                rate: penalty.rate,
                value: penalty.value,
                updatedAt: penalty.updated_at,
            };
        } catch (err) {
            console.error(`Error fetching penalty with id ${id}:`, err);
            return undefined;
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
    },

    async getAdditionalId(id:string) : Promise<Additional | undefined> {
        try {
            const response = await fetch(`${API_URL_BASE}/rules/additionals/${id}/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }); 

            if (!response.ok) throw new Error(`Failed to fetch additional with id ${id}: ${response.statusText}`);
            
            const additional : APIAdditional = await response.json();
            
            return {
                id : additional.id,
                name : additional.name,
                description : additional.description || '',
                amount : additional.amount,
                method : additional.method,
                rate : additional.rate,
                value : additional.value,
                duration : additional.duration,
                frequency : additional.frequency,
                updatedAt : additional.updated_at,
            };
        } catch (err) {
            console.error(`Error fetching additional with id ${id}:`, err);
            return undefined;
        }
    },

}