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
      type TEXT CHECK(type IN ('lead', 'client')) DEFAULT 'lead',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      name TEXT NOT NULL,
      type TEXT,
      date DATETIME,
      status TEXT CHECK(status IN ('new', 'shooting', 'editing', 'review', 'done')) DEFAULT 'new',
      golden_hour TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT CHECK(status IN ('todo', 'inprogress', 'completed')) DEFAULT 'todo',
      due_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      phone TEXT,
      skills TEXT,
      rating INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      serial_number TEXT,
      purchase_date DATETIME,
      condition TEXT,
      status TEXT CHECK(status IN ('available', 'in-use', 'repair')) DEFAULT 'available',
      checked_out_to INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (checked_out_to) REFERENCES team_members(id) ON DELETE SET NULL
    );
  `);
}

function setupHandlers() {
  // --- Clients ---
  ipcMain.handle("get-clients", () => {
    return db.prepare("SELECT * FROM clients ORDER BY created_at DESC").all();
  });

  ipcMain.handle("create-client", (_, client) => {
    const stmt = db.prepare(
      "INSERT INTO clients (name, phone, email, social_links, relatives, type) VALUES (@name, @phone, @email, @social_links, @relatives, @type)",
    );
    const info = stmt.run(client);
    return { id: info.lastInsertRowid, ...client };
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
