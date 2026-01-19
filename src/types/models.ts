export interface Client {
  id: number;
  name: string;
  phone: string;
  email?: string;
  social_links?: string; // JSON string
  relatives?: string; // JSON string
  birth_date?: string;
  type: "lead" | "client";
  created_at: string;
}

export interface Project {
  id: number;
  client_id?: number;
  name: string;
  type: string; // wedding, love_story, etc.
  date: string;
  status: "new" | "shooting" | "editing" | "review" | "done";
  golden_hour?: string;
  notes?: string;
  created_at: string;
}

export interface ChecklistItem {
  id: number;
  task_id: number;
  text: string;
  is_completed: boolean;
}

export interface ProjectTask {
  id: number;
  project_id: number;
  title: string;
  status: "todo" | "inprogress" | "completed";
  due_time?: string;
  checklist?: ChecklistItem[];
  created_at: string;
}

export interface Transaction {
  id: number;
  project_id?: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  description?: string;
  created_at: string;
}

export interface Equipment {
  id: number;
  name: string;
  serial_number?: string;
  purchase_date?: string;
  condition: string;
  shutter_count: number;
  max_shutter_life: number;
  status: "available" | "in-use" | "repair";
  checked_out_to?: number; // team_member_id
  checked_out_date?: string;
  created_at: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  phone?: string;
  skills?: string;
  rating?: number;
  created_at: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end?: string;
  type: string;
  project_id?: number;
  created_at: string;
}
