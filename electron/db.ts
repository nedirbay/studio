import { ipcMain, app } from "electron";
import path from "path";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

let db: any;

export function setupDatabase() {
  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "studio.db");

  // Ensure directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  db = new Database(dbPath);
  console.log(`Database connected at ${dbPath}`);

  initSchema();
  setupHandlers();
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      social_links TEXT,
      relatives TEXT,
      birth_date DATETIME,
      type TEXT CHECK(type IN ('lead', 'client')) DEFAULT 'lead',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    -- ... other tables ...
  `);

  // Migration for birth_date (safe add)
  try {
    db.exec("ALTER TABLE clients ADD COLUMN birth_date DATETIME");
  } catch (e) {
    // Ignore if column exists
  }
}

function setupHandlers() {
  // --- Clients ---
  ipcMain.handle("get-clients", () => {
    return db.prepare("SELECT * FROM clients ORDER BY created_at DESC").all();
  });

  ipcMain.handle("create-client", (_, client) => {
    const stmt = db.prepare(
      "INSERT INTO clients (name, phone, email, social_links, relatives, birth_date, type) VALUES (@name, @phone, @email, @social_links, @relatives, @birth_date, @type)",
    );
    const info = stmt.run(client);
    return { id: info.lastInsertRowid, ...client };
  });

  // Get Client Financials
  ipcMain.handle("get-client-financials", (_, clientId) => {
    // Sum of income from transactions linked to projects of this client
    const stmt = db.prepare(`
      SELECT SUM(t.amount) as total_paid
      FROM transactions t
      JOIN projects p ON t.project_id = p.id
      WHERE p.client_id = ? AND t.type = 'income'
    `);
    const result = stmt.get(clientId);
    return result ? result.total_paid || 0 : 0;
  });

  // Mock Contract Generation
  ipcMain.handle("generate-contract", (_, client) => {
    console.log("Generating contract for", client.name);
    // In a real app, this would use pdfkit or similar
    return { success: true, message: "Contract generated (Mock)" };
  });

  // --- Projects ---
  ipcMain.handle("get-projects", () => {
    return db.prepare("SELECT * FROM projects ORDER BY date DESC").all();
  });

  ipcMain.handle("create-project", (_, project) => {
    const stmt = db.prepare(
      "INSERT INTO projects (client_id, name, type, date, status, golden_hour, notes) VALUES (@client_id, @name, @type, @date, @status, @golden_hour, @notes)",
    );
    const info = stmt.run(project);
    return { id: info.lastInsertRowid, ...project };
  });

  ipcMain.handle("get-project", (_, id) => {
    return db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  });

  // --- Tasks (Kanban) ---
  ipcMain.handle("get-tasks", (_, projectId) => {
    if (projectId) {
      return db
        .prepare(
          "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at ASC",
        )
        .all(projectId);
    }
    return db.prepare("SELECT * FROM tasks ORDER BY created_at ASC").all();
  });

  ipcMain.handle("create-task", (_, task) => {
    const stmt = db.prepare(
      "INSERT INTO tasks (project_id, title, status, due_time) VALUES (@project_id, @title, @status, @due_time)",
    );
    const info = stmt.run(task);
    return { id: info.lastInsertRowid, ...task };
  });

  ipcMain.handle("update-task-status", (_, { id, status }) => {
    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, id);
    return { success: true };
  });

  // --- Finance ---
  ipcMain.handle("get-transactions", () => {
    return db.prepare("SELECT * FROM transactions ORDER BY date DESC").all();
  });

  ipcMain.handle("create-transaction", (_, transaction) => {
    const stmt = db.prepare(
      "INSERT INTO transactions (project_id, type, amount, category, date, description) VALUES (@project_id, @type, @amount, @category, @date, @description)",
    );
    const info = stmt.run(transaction);
    return { id: info.lastInsertRowid, ...transaction };
  });

  // --- Inventory ---
  ipcMain.handle("get-equipment", () => {
    return db.prepare("SELECT * FROM equipment ORDER BY name ASC").all();
  });

  ipcMain.handle("create-equipment", (_, item) => {
    const stmt = db.prepare(
      "INSERT INTO equipment (name, serial_number, purchase_date, condition, status) VALUES (@name, @serial_number, @purchase_date, @condition, @status)",
    );
    const info = stmt.run(item);
    return { id: info.lastInsertRowid, ...item };
  });

  // --- Team ---
  ipcMain.handle("get-team-members", () => {
    return db.prepare("SELECT * FROM team_members ORDER BY name ASC").all();
  });

  ipcMain.handle("create-team-member", (_, member) => {
    const stmt = db.prepare(
      "INSERT INTO team_members (name, role, phone, skills, rating) VALUES (@name, @role, @phone, @skills, @rating)",
    );
    const info = stmt.run(member);
    return { id: info.lastInsertRowid, ...member };
  });
}
