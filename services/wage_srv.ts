import { API } from "@/api/api";
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

export interface APISalary{
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
    mapAPISalaryToSalary(data: APISalary): Salary {
        return {
            id: data.id,
            name: data.name,
            description: data.description || '',
            amount: data.amount,
            releaseType: data.release_type,
            base: data.base,
            updatedAt: data.updated_at,
        };
    },

    async getSalary(): Promise<Salary[]> {
        try {
            const response = await API.get<APISalary[] | { results: APISalary[] }>('/rules/salary-base/');
            const salariesData: APISalary[] = Array.isArray(response.data) ? response.data : (response.data.results || []);

            return salariesData.map(salary => this.mapAPISalaryToSalary(salary));
        } catch (err) {
            console.error('Error fetching salaries:', err);
            return [];
        }
    },

    async createSalary(payload: Omit<Salary, 'id' | 'updatedAt'>): Promise<Salary | undefined> {
        try {
            const body = {
                name: payload.name,
                description: payload.description,
                amount: payload.amount,
                release_type: payload.releaseType,
                base: payload.base,
            };

            const response = await API.post<APISalary>('/rules/salary-base/', body);
            const data = response.data;
            
            return {
                id: data.id,
                name: data.name,
                description: data.description || '',
                amount: data.amount,
                releaseType: data.release_type,
                base: data.base,
                updatedAt: data.updated_at,
            };
        } catch (err) {
            console.error('Error creating salary:', err);
            return undefined;
        }
    },

    async getSalaryId(id:string) : Promise<Salary | undefined> {
        try {
            const response = await API.get<APISalary>(`/rules/salary-base/${id}/`);
            const salary = response.data;
            
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

    async deleteSalary(id: string): Promise<boolean> {
        try {
            await API.delete(`/rules/salary-base/${id}/`);
            return true;
        } catch (err) {
            console.error(`Error deleting salary with id ${id}:`, err);
            return false;
        }
    },

    async updateSalary(id: string, payload: Partial<Salary>): Promise<Salary | undefined> {
        try {
            const body: any = {};
            if (payload.name) body.name = payload.name;
            if (payload.description) body.description = payload.description;
            if (payload.amount !== undefined) body.amount = payload.amount;
            if (payload.releaseType) body.release_type = payload.releaseType;
            if (payload.base) body.base = payload.base;

            const response = await API.patch<APISalary>(`/rules/salary-base/${id}/`, body);
            const data = response.data;

            return {
                id: data.id,
                name: data.name,
                description: data.description || '',
                amount: data.amount,
                releaseType: data.release_type,
                base: data.base,
                updatedAt: data.updated_at,
            };
        } catch (err) {
            console.error(`Error updating salary with id ${id}:`, err);
            return undefined;
        }
    },

    async getDeduction() : Promise<Deduction[]> {
        try {
            const response = await API.get<APIDeduction[] | { results: APIDeduction[] }>('/rules/deductions/');
            const deducData : APIDeduction[] = Array.isArray(response.data) ? response.data : (response.data.results || []);
            
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

    async createDeduction(payload: Omit<Deduction, 'id' | 'updatedAt'>): Promise<Deduction | undefined> {
        try {
            const body = {
                name: payload.name,
                description: payload.description,
                amount: payload.amount,
                deduction_on: payload.deductionOn,
                method: payload.method,
                rate: payload.rate,
                value: payload.value,
            };

            const response = await API.post<APIDeduction>('/rules/deductions/', body);
            const data = response.data;
            
            return {
                id : data.id,
                name : data.name,
                description : data.description || '',
                amount : data.amount,
                deductionOn: data.deduction_on,
                method: data.method,
                rate: data.rate,
                value: data.value,
                updatedAt: data.updated_at,
            };
        } catch (err) {
            console.error('Error creating deduction:', err);
            return undefined;
        }
    },

    async getDeductionId(id:string) : Promise<Deduction | undefined> {
        try {
            const response = await API.get<APIDeduction>(`/rules/deductions/${id}/`);
            const deduction = response.data;
            
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

    async deleteDeduction(id: string): Promise<boolean> {
        try {
            await API.delete(`/rules/deductions/${id}/`);
            return true;
        } catch (err) {
            console.error(`Error deleting deduction with id ${id}:`, err);
            return false;
        }
    },

    async updateDeduction(id: string, payload: Partial<Deduction>): Promise<Deduction | undefined> {
        try {
            const body: any = {};
            if (payload.name) body.name = payload.name;
            if (payload.description) body.description = payload.description;
            if (payload.amount !== undefined) body.amount = payload.amount;
            if (payload.deductionOn !== undefined) body.deduction_on = payload.deductionOn;
            if (payload.method) body.method = payload.method;
            if (payload.rate) body.rate = payload.rate;
            if (payload.value) body.value = payload.value;

            const response = await API.patch<APIDeduction>(`/rules/deductions/${id}/`, body);
            const data = response.data;

            return {
                id : data.id,
                name : data.name,
                description : data.description || '',
                amount : data.amount,
                deductionOn: data.deduction_on,
                method: data.method,
                rate: data.rate,
                value: data.value,
                updatedAt: data.updated_at,
            };
        } catch (err) {
            console.error(`Error updating deduction with id ${id}:`, err);
            return undefined;
        }
    },

    async getPenalty() : Promise<Penalty[]> {
        try {
            const response = await API.get<APIPenalty[] | { results: APIPenalty[] }>('/rules/penalties/');
            const penaData : APIPenalty[] = Array.isArray(response.data) ? response.data : (response.data.results || []);
            
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

    async createPenalty(payload: Omit<Penalty, 'id' | 'updatedAt'>): Promise<Penalty | undefined> {
        try {
            const body = {
                name: payload.name,
                description: payload.description,
                amount: payload.amount,
                method: payload.method,
                rate: payload.rate,
                value: payload.value,
            };

            const response = await API.post<APIPenalty>('/rules/penalties/', body);
            const data = response.data;
            
            return {
                id : data.id,
                name : data.name,
                description : data.description || '',
                amount : data.amount,
                method: data.method,
                rate: data.rate,
                value: data.value,
                updatedAt: data.updated_at,
            };
        } catch (err) {
            console.error('Error creating penalty:', err);
            return undefined;
        }
    },  

    async getPenaltyId(id:string) : Promise<Penalty | undefined> {
        try {
            const response = await API.get<APIPenalty>(`/rules/penalties/${id}/`);
            const penalty = response.data;
            
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

    async deletePenalty(id: string): Promise<boolean> {
        try {
            await API.delete(`/rules/penalties/${id}/`);
            return true;
        } catch (err) {
            console.error(`Error deleting penalty with id ${id}:`, err);
            return false;
        }
    },

    async updatePenalty(id: string, payload: Partial<Penalty>): Promise<Penalty | undefined> {
        try {
            const body: any = {};
            if (payload.name) body.name = payload.name;
            if (payload.description) body.description = payload.description;
            if (payload.amount !== undefined) body.amount = payload.amount;
            if (payload.method) body.method = payload.method;
            if (payload.rate) body.rate = payload.rate;
            if (payload.value) body.value = payload.value;

            const response = await API.patch<APIPenalty>(`/rules/penalties/${id}/`, body);
            const data = response.data;

            return {
                id : data.id,
                name : data.name,
                description : data.description || '',
                amount : data.amount,
                method : data.method,
                rate : data.rate,
                value : data.value,
                updatedAt : data.updated_at,
            };
        } catch (err) {
            console.error(`Error updating penalty with id ${id}:`, err);
            return undefined;
        }
    },

    async getAdditional() : Promise<Additional[]> {
        try {
            const response = await API.get<APIAdditional[] | { results: APIAdditional[] }>('/rules/additionals/');
            const addData : APIAdditional[] = Array.isArray(response.data) ? response.data : (response.data.results || []);
            
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

    async createAdditional(payload: Omit<Additional, 'id' | 'updatedAt'>): Promise<Additional | undefined> {
        try {
            const body = {
                name: payload.name,
                description: payload.description,
                amount: payload.amount,
                method: payload.method,
                rate: payload.rate,
                value: payload.value,
                duration: payload.duration,
                frequency: payload.frequency,
            };

            const response = await API.post<APIAdditional>('/rules/additionals/', body);
            const data = response.data;
            
            return {
                id : data.id,
                name : data.name,
                description : data.description || '',
                amount : data.amount,
                method : data.method,
                rate : data.rate,
                value : data.value,
                duration : data.duration,
                frequency : data.frequency,
                updatedAt : data.updated_at,
            };
        } catch (err) {
            console.error('Error creating additional:', err);
            return undefined;
        }
    },

    async getAdditionalId(id:string) : Promise<Additional | undefined> {
        try {
            const response = await API.get<APIAdditional>(`/rules/additionals/${id}/`);
            const additional = response.data;
            
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

    async deleteAdditional(id: string): Promise<boolean> {
        try {
            await API.delete(`/rules/additionals/${id}/`);
            return true;
        } catch (err) {
            console.error(`Error deleting additional with id ${id}:`, err);
            return false;
        }
    },

    async updateAdditional(id: string, payload: Partial<Additional>): Promise<Additional | undefined> {
        try {
            const body: any = {};
            if (payload.name) body.name = payload.name;
            if (payload.description) body.description = payload.description;
            if (payload.amount !== undefined) body.amount = payload.amount;
            if (payload.method) body.method = payload.method;
            if (payload.rate) body.rate = payload.rate;
            if (payload.value) body.value = payload.value;
            if (payload.duration) body.duration = payload.duration;
            if (payload.frequency) body.frequency = payload.frequency;

            const response = await API.patch<APIAdditional>(`/rules/additionals/${id}/`, body);
            const data = response.data;

            return {
                id : data.id,
                name : data.name,
                description : data.description || '',
                amount : data.amount,
                method : data.method,
                rate : data.rate,
                value : data.value,
                duration : data.duration,
                frequency : data.frequency,
                updatedAt : data.updated_at,
            };
        } catch (err) {
            console.error(`Error updating additional with id ${id}:`, err);
            return undefined;
        }
    },

}