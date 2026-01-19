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
  getClientFinancials: (clientId: number): Promise<number> =>
    window.ipcRenderer.invoke("get-client-financials", clientId),
  generateContract: (
    client: Client,
  ): Promise<{ success: boolean; message: string }> =>
    window.ipcRenderer.invoke("generate-contract", client),

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
    task: Omit<ProjectTask, "id" | "created_at" | "checklist">,
  ): Promise<ProjectTask> => window.ipcRenderer.invoke("create-task", task),
  updateTaskStatus: (
    id: number,
    status: string,
  ): Promise<{ success: boolean }> =>
    window.ipcRenderer.invoke("update-task-status", { id, status }),
  addChecklistItem: (taskId: number, text: string) =>
    window.ipcRenderer.invoke("add-checklist-item", { taskId, text }),
  toggleChecklistItem: (itemId: number, isCompleted: boolean) =>
    window.ipcRenderer.invoke("toggle-checklist-item", { itemId, isCompleted }),
  launchSoftware: (name: string) =>
    window.ipcRenderer.invoke("launch-software", name),

  // --- Finance ---
  getTransactions: (): Promise<Transaction[]> =>
    window.ipcRenderer.invoke("get-transactions"),
  getFinanceStats: (): Promise<{
    income: number;
    expense: number;
    net: number;
  }> => window.ipcRenderer.invoke("get-finance-stats"),
  createTransaction: (
    transaction: Omit<Transaction, "id" | "created_at">,
  ): Promise<Transaction> =>
    window.ipcRenderer.invoke("create-transaction", transaction),
  generateInvoice: (projectId: number) =>
    window.ipcRenderer.invoke("generate-invoice", projectId),

  // --- Inventory ---
  getEquipment: (): Promise<Equipment[]> =>
    window.ipcRenderer.invoke("get-equipment"),
  createEquipment: (
    item: Omit<Equipment, "id" | "created_at" | "shutter_count">,
  ): Promise<Equipment> => window.ipcRenderer.invoke("create-equipment", item),
  checkOutEquipment: (equipmentId: number, memberId: number) =>
    window.ipcRenderer.invoke("check-out-equipment", { equipmentId, memberId }),
  checkInEquipment: (equipmentId: number) =>
    window.ipcRenderer.invoke("check-in-equipment", { equipmentId }),
  updateShutterCount: (equipmentId: number, count: number) =>
    window.ipcRenderer.invoke("update-shutter-count", { equipmentId, count }),

  // --- Team ---
  getTeamMembers: (): Promise<TeamMember[]> =>
    window.ipcRenderer.invoke("get-team-members"),
  createTeamMember: (
    member: Omit<TeamMember, "id" | "created_at">,
  ): Promise<TeamMember> =>
    window.ipcRenderer.invoke("create-team-member", member),
};
