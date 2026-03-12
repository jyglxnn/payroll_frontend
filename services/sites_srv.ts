import { API, MEDIA_URL_BASE } from "@/api/api";
import { Site, Project, ProjectStatus, SiteProject, ProjectSite, SiteEmployee } from "@/api/types";

// ── API response shapes (snake_case from Django) ──

interface APISiteProject {
    project_id: string;
    name: string;
    started_at: string;
    ended_at: string;
    status: ProjectStatus;
}

interface APISiteEmployee {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    image: string;
    job_title: string;
    is_active: boolean;
}

interface APISite {
    site_id: string;
    name: string;
    image: string;
    description: string;
    address: string;
    is_archive: boolean;
    project_count: number;
    employee_count: number;
    projects?: APISiteProject[];
    employees?: APISiteEmployee[];
    created_at: string;
    updated_at: string;
}

interface APIProjectSite {
    site_id: string;
    name: string;
    address: string;
}

interface APIProject {
    project_id: string;
    name: string;
    description: string;
    sites: APIProjectSite[];
    site_names: string[];
    status: ProjectStatus;
    started_at: string;
    ended_at: string;
    team_count: number;
    updated_at: string;
}

// ── Mappers ──

function mapSiteProject(p: APISiteProject): SiteProject {
    return {
        projectId: p.project_id,
        name: p.name,
        startedAt: p.started_at,
        endedAt: p.ended_at,
        status: p.status,
    };
}

function mapSiteEmployee(e: APISiteEmployee): SiteEmployee {
    return {
        employeeId: e.employee_id,
        firstName: e.first_name,
        lastName: e.last_name,
        email: e.email || "",
        image: e.image ? (e.image.startsWith("http") ? e.image : `${MEDIA_URL_BASE}/${e.image}`) : "",
        jobTitle: e.job_title || "",
        isActive: e.is_active,
    };
}

function mapSite(data: APISite): Site {
    return {
        id: data.site_id,
        name: data.name,
        image: data.image ? (data.image.startsWith("http") ? data.image : `${MEDIA_URL_BASE}/${data.image}`) : "",
        description: data.description,
        address: data.address,
        isArchived: data.is_archive,
        projectCount: data.project_count ?? 0,
        employeeCount: data.employee_count ?? 0,
        projects: (data.projects ?? []).map(mapSiteProject),
        employees: (data.employees ?? []).map(mapSiteEmployee),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
}

function mapProjectSite(s: APIProjectSite): ProjectSite {
    return {
        siteId: s.site_id,
        name: s.name,
        address: s.address,
    };
}

function mapProject(data: APIProject): Project {
    return {
        id: data.project_id,
        name: data.name,
        description: data.description,
        sites: (data.sites ?? []).map(mapProjectSite),
        siteNames: data.site_names ?? [],
        status: data.status,
        startedAt: data.started_at,
        endedAt: data.ended_at,
        teamCount: data.team_count ?? 0,
        updatedAt: data.updated_at,
    };
}

// ── Sites Service ──

export const SitesService = {
    async getSites(): Promise<Site[]> {
        try {
            const response = await API.get<APISite[] | { results: APISite[] }>("/sites/");
            const data: APISite[] = Array.isArray(response.data) ? response.data : (response.data.results || []);
            return data.map(mapSite);
        } catch (err) {
            console.error("Error fetching sites:", err);
            return [];
        }
    },

    async getSiteById(siteId: string): Promise<Site> {
        const response = await API.get<APISite>(`/sites/${siteId}/`);
        return mapSite(response.data);
    },

    async createSite(payload: { name: string; description: string; address: string; image?: File }): Promise<Site> {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("description", payload.description);
        formData.append("address", payload.address);
        if (payload.image) {
            formData.append("image", payload.image);
        }

        const response = await API.post<APISite>("/sites/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return mapSite(response.data);
    },

    async updateSite(siteId: string, payload: { name?: string; description?: string; address?: string; image?: File; is_archive?: boolean }): Promise<Site> {
        const formData = new FormData();
        if (payload.name !== undefined) formData.append("name", payload.name);
        if (payload.description !== undefined) formData.append("description", payload.description);
        if (payload.address !== undefined) formData.append("address", payload.address);
        if (payload.is_archive !== undefined) formData.append("is_archive", String(payload.is_archive));
        if (payload.image) formData.append("image", payload.image);

        const response = await API.patch<APISite>(`/sites/${siteId}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return mapSite(response.data);
    },

    async deleteSite(siteId: string): Promise<boolean> {
        try {
            await API.delete(`/sites/${siteId}/`);
            return true;
        } catch (err) {
            console.error("Error deleting site:", err);
            return false;
        }
    },
};

// ── Projects Service ──

export const ProjectsService = {
    async getProjects(): Promise<Project[]> {
        try {
            const response = await API.get<APIProject[] | { results: APIProject[] }>("/sites/projects/");
            const data: APIProject[] = Array.isArray(response.data) ? response.data : (response.data.results || []);
            return data.map(mapProject);
        } catch (err) {
            console.error("Error fetching projects:", err);
            return [];
        }
    },

    async getProjectById(projectId: string): Promise<Project> {
        const response = await API.get<APIProject>(`/sites/projects/${projectId}/`);
        return mapProject(response.data);
    },

    async createProject(payload: { name: string; description: string; sites: string[]; started_at: string; ended_at: string; status?: ProjectStatus }): Promise<Project> {
        const body = {
            name: payload.name,
            description: payload.description,
            sites: payload.sites,
            started_at: payload.started_at,
            ended_at: payload.ended_at,
            status: payload.status ?? "Pending",
        };
        const response = await API.post<APIProject>("/sites/projects/", body);
        return mapProject(response.data);
    },

    async updateProject(projectId: string, payload: { name?: string; description?: string; sites?: string[]; started_at?: string; ended_at?: string; status?: ProjectStatus }): Promise<Project> {
        const body: Record<string, unknown> = {};
        if (payload.name !== undefined) body.name = payload.name;
        if (payload.description !== undefined) body.description = payload.description;
        if (payload.sites !== undefined) body.sites = payload.sites;
        if (payload.started_at !== undefined) body.started_at = payload.started_at;
        if (payload.ended_at !== undefined) body.ended_at = payload.ended_at;
        if (payload.status !== undefined) body.status = payload.status;

        const response = await API.patch<APIProject>(`/sites/projects/${projectId}/`, body);
        return mapProject(response.data);
    },

    async deleteProject(projectId: string): Promise<boolean> {
        try {
            await API.delete(`/sites/projects/${projectId}/`);
            return true;
        } catch (err) {
            console.error("Error deleting project:", err);
            return false;
        }
    },
};
