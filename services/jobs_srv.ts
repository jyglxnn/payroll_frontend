import { API } from "@/api/api";
import { Salary, Job } from "@/api/types";
import { WageService, APISalary } from "./wage_srv";
import { get } from "http";

interface APIJobs {
    job_id : string,
    name : string,
    description : string,
    salary : APISalary,
    timein_am_base : string,
    timein_pm_base : string,
    timeout_am_base : string,
    timeout_pm_base : string,
    maximum_overtime : number,
    minimum_overtime : number,
    updated_at : string,
}

export const JobsService = {
    async getJobs() : Promise<Job[]> {
        try {  
            const response = await API.get<APIJobs[] | { results: APIJobs[] }>('/employees/jobs/');
            const jobsData: APIJobs[] = Array.isArray(response.data) ? response.data : (response.data.results || []);
            
            return jobsData.map((data) => ({
                id : data.job_id,
                name : data.name,
                description : data.description,
                salary : WageService.mapAPISalaryToSalary(data.salary),
                timeinAmBase : data.timein_am_base,
                timeinPmBase : data.timein_pm_base,
                timeoutAmBase : data.timeout_am_base,
                timeoutPmBase : data.timeout_pm_base,
                maximumOvertime : data.maximum_overtime,
                mimimumOvertime : data.minimum_overtime,
                updatedAt : data.updated_at,
            }));

        } catch (error) {
            console.error("Error fetching jobs:", error);
            throw error;
        }
    },

    async createJob(jobData: Omit<Job, 'id' | 'updatedAt'>) : Promise<Job> {
        try {
            const payload = {
                name : jobData.name,
                description : jobData.description,
                salary_id : jobData.salary.id,
                timein_am_base : jobData.timeinAmBase,
                timein_pm_base : jobData.timeinPmBase,
                timeout_am_base : jobData.timeoutAmBase,
                timeout_pm_base : jobData.timeoutPmBase,
                maximum_overtime : jobData.maximumOvertime,
                minimum_overtime : jobData.mimimumOvertime,
            };
            const response = await API.post<APIJobs>('/employees/jobs/', payload);
            const data = response.data;
            return {
                id : data.job_id,
                name : data.name,
                description : data.description,
                salary : WageService.mapAPISalaryToSalary(data.salary),
                timeinAmBase : data.timein_am_base,
                timeinPmBase : data.timein_pm_base,
                timeoutAmBase : data.timeout_am_base,
                timeoutPmBase : data.timeout_pm_base,
                maximumOvertime : data.maximum_overtime,
                mimimumOvertime : data.minimum_overtime,
                updatedAt : data.updated_at,
            };
        } catch (error) {
            console.error("Error creating job:", error);
            throw error;
        }
    },

    async getJobById(jobId: string) : Promise<Job> {
        try {
            const response = await API.get<APIJobs>(`/employees/jobs/${jobId}/`);
            const data = response.data;
            return {
                id : data.job_id,
                name : data.name,
                description : data.description,
                salary : WageService.mapAPISalaryToSalary(data.salary),
                timeinAmBase : data.timein_am_base,
                timeinPmBase : data.timein_pm_base,
                timeoutAmBase : data.timeout_am_base,
                timeoutPmBase : data.timeout_pm_base,
                maximumOvertime : data.maximum_overtime,
                mimimumOvertime : data.minimum_overtime,
                updatedAt : data.updated_at,
            };
        } catch (error) {
            console.error("Error fetching job by ID:", error);
            throw error;
        }
    },

    async updateJob(jobId: string, jobData: Omit<Job, 'id' | 'updatedAt'>) : Promise<Job> {
        try {
            const payload = {
                name : jobData.name,
                description : jobData.description,
                salary_id : jobData.salary.id,
                timein_am_base : jobData.timeinAmBase,
                timein_pm_base : jobData.timeinPmBase,
                timeout_am_base : jobData.timeoutAmBase,
                timeout_pm_base : jobData.timeoutPmBase,
                maximum_overtime : jobData.maximumOvertime,
                minimum_overtime : jobData.mimimumOvertime,
            };
            const response = await API.put<APIJobs>(`/employees/jobs/${jobId}/`, payload);
            const data = response.data;
            return {
                id : data.job_id,
                name : data.name,
                description : data.description,
                salary : WageService.mapAPISalaryToSalary(data.salary),
                timeinAmBase : data.timein_am_base,
                timeinPmBase : data.timein_pm_base,
                timeoutAmBase : data.timeout_am_base,
                timeoutPmBase : data.timeout_pm_base,
                maximumOvertime : data.maximum_overtime,
                mimimumOvertime : data.minimum_overtime,
                updatedAt : data.updated_at,
            };
        } catch (error) {
            console.error("Error updating job:", error);
            throw error;
        }
    },

    async deleteJob(jobId: string) : Promise<void> {
        try {
            await API.delete(`/employees/jobs/${jobId}/`);
        } catch (error) {
            console.error("Error deleting job:", error);
            throw error;
        }
    },
};