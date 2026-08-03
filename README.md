# Team Expense Tracker

A full-stack app for logging shared team expenses, organizing them by category, and viewing monthly spending summaries with budget alerts.

## Tech Stack

- **Backend:** Node.js, Express, SQLite (`better-sqlite3`)
- **Frontend:** React (Vite)
- **Database:** SQLite with relational schema (`categories`, `expenses`)

## Features

- Add, edit, and delete expenses (amount, description, category, date)
- Filter expenses by category and/or date range
- Paginated expense list (20 per page, max 100)
- Create and list categories with optional monthly budgets
- Summary view with SQL-aggregated totals per category
- Categories over their monthly budget are clearly flagged
- Server-side validation for all inputs

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm

## Setup

```bash
# From the project root
npm run install:all
```

## Run Locally

Start both the API server and React dev server:

```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3001

Or run them separately:

```bash
npm run dev:server   # API on port 3001
npm run dev:client   # UI on port 5173
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create a category |
| DELETE | `/api/categories/:id` | Delete a category (blocked if expenses exist) |
| GET | `/api/expenses` | List expenses (supports `categoryId`, `startDate`, `endDate`, `page`, `limit`) |
| POST | `/api/expenses` | Create an expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |
| GET | `/api/summary` | Monthly spend totals per category (SQL aggregation) |

## Database

SQLite database file: `server/data/expenses.db` (created automatically on first run).

Seed categories are inserted on first startup: Office Supplies, Travel, Software, Meals.

## Category Deletion Policy

Categories with existing expenses **cannot** be deleted. The API returns `409 Conflict` with a message explaining how many expenses still reference the category. Delete or reassign those expenses first.

## Project Structure

```
team-expense-tracker/
├── client/          # React frontend
├── server/          # Express API + SQLite
├── README.md
└── NOTES.md         # Engineering reflection answers
```

## Production Build

```bash
npm run build --prefix client
npm start --prefix server
```

Serve the built client separately or add static file hosting to the Express server as needed.
