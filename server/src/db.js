import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'expenses.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    monthly_budget REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
  );

  CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
`);

const categoryCount = db.prepare('SELECT COUNT(*) AS count FROM categories').get();
if (categoryCount.count === 0) {
  const insert = db.prepare(
    'INSERT INTO categories (name, monthly_budget) VALUES (?, ?)'
  );
  insert.run('Office Supplies', 500);
  insert.run('Travel', 2000);
  insert.run('Software', 1000);
  insert.run('Meals', 800);
}

export default db;
