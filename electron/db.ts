import { ipcMain, app } from "electron";
import path from "path";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

let db: any;

export function setupDatabase() {
  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "todo.db");

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
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT CHECK(status IN ('todo', 'inprogress', 'completed')) DEFAULT 'todo',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  /* Migration for existing databases: try to add the column if it doesn't exist */
  try {
    db.prepare("ALTER TABLE tasks ADD COLUMN due_time TEXT").run();
  } catch (error) {
    // Column likely exists or other error we can ignore for now in dev
  }
}

function setupHandlers() {
  ipcMain.handle("get-projects", () => {
    console.log("IPC: get-projects called");
    try {
      const result = db
        .prepare("SELECT * FROM projects ORDER BY created_at DESC")
        .all();
      // Sanitize: convert all to plain strings/numbers to avoid serialization issues
      const sanitized = result.map((row: any) => ({
        id: Number(row.id), // Force number
        name: String(row.name),
        created_at: String(row.created_at),
      }));
      console.log("IPC: get-projects returning:", JSON.stringify(sanitized));
      return sanitized;
    } catch (err) {
      console.error("IPC: get-projects failed:", err);
      throw err;
    }
  });

  ipcMain.handle("create-project", (_, name: string) => {
    console.log("IPC: create-project called", name);
    const stmt = db.prepare("INSERT INTO projects (name) VALUES (?)");
    const info = stmt.run(name);
    return {
      id: info.lastInsertRowid,
      name,
      created_at: new Date().toISOString(),
    };
  });

  ipcMain.handle("delete-project", (_, id: number) => {
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    return { success: true };
  });

  ipcMain.handle("get-tasks", (_, projectId: number) => {
    return db
      .prepare(
        "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at ASC",
      )
      .all(projectId);
  });

  ipcMain.handle(
    "create-task",
    (
      _,
      {
        projectId,
        title,
        due_time,
      }: { projectId: number; title: string; due_time?: string },
    ) => {
      const stmt = db.prepare(
        "INSERT INTO tasks (project_id, title, due_time) VALUES (?, ?, ?)",
      );
      const info = stmt.run(projectId, title, due_time || null);
      return {
        id: info.lastInsertRowid,
        project_id: projectId,
        title,
        due_time,
        status: "todo",
      };
    },
  );

  ipcMain.handle(
    "update-task-status",
    (_, { taskId, status }: { taskId: number; status: string }) => {
      db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(
        status,
        taskId,
      );
      return { success: true };
    },
  );

  ipcMain.handle("delete-task", (_, taskId: number) => {
    db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);
    return { success: true };
  });
}
