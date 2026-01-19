import type {
  Client,
  Project,
  ProjectTask,
  Transaction,
  Equipment,
  TeamMember,
} from "../types/models";

export const api = {
  // --- Clients ---
  getClients: (): Promise<Client[]> => window.ipcRenderer.invoke("get-clients"),
  createClient: (client: Omit<Client, "id" | "created_at">): Promise<Client> =>
    window.ipcRenderer.invoke("create-client", client),

  // --- Projects ---
  getProjects: (): Promise<Project[]> =>
    window.ipcRenderer.invoke("get-projects"),
  getProject: (id: number): Promise<Project> =>
    window.ipcRenderer.invoke("get-project", id),
  createProject: (
    project: Omit<Project, "id" | "created_at">,
  ): Promise<Project> => window.ipcRenderer.invoke("create-project", project),

  // --- Tasks ---
  getTasks: (projectId?: number): Promise<ProjectTask[]> =>
    window.ipcRenderer.invoke("get-tasks", projectId),
  createTask: (
    task: Omit<ProjectTask, "id" | "created_at">,
  ): Promise<ProjectTask> => window.ipcRenderer.invoke("create-task", task),
  updateTaskStatus: (
    id: number,
    status: string,
  ): Promise<{ success: boolean }> =>
    window.ipcRenderer.invoke("update-task-status", { id, status }), // Note: check backend arg name

  // --- Finance ---
  getTransactions: (): Promise<Transaction[]> =>
    window.ipcRenderer.invoke("get-transactions"),
  createTransaction: (
    transaction: Omit<Transaction, "id" | "created_at">,
  ): Promise<Transaction> =>
    window.ipcRenderer.invoke("create-transaction", transaction),

  // --- Inventory ---
  getEquipment: (): Promise<Equipment[]> =>
    window.ipcRenderer.invoke("get-equipment"),
  createEquipment: (
    item: Omit<Equipment, "id" | "created_at">,
  ): Promise<Equipment> => window.ipcRenderer.invoke("create-equipment", item),

  // --- Team ---
  getTeamMembers: (): Promise<TeamMember[]> =>
    window.ipcRenderer.invoke("get-team-members"),
  createTeamMember: (
    member: Omit<TeamMember, "id" | "created_at">,
  ): Promise<TeamMember> =>
    window.ipcRenderer.invoke("create-team-member", member),
};
