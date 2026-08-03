# Engineering Notes

## 1. Which parts did you build with AI assistance, and where did you have to correct or rewrite what it produced?

Most of the project scaffolding, API route structure, React component layout, and validation logic were generated with AI assistance (Cursor). I reviewed and adjusted:

- **Category deletion behavior:** Ensured `ON DELETE RESTRICT` at the database level plus an explicit pre-delete count check, so the API returns a clear 409 message instead of a raw SQLite error.
- **Summary query:** Verified the SQL uses `LEFT JOIN` + `GROUP BY` with a date filter for the current month, so categories with zero spend still appear.
- **ExpenseForm editing flow:** Kept edit UI as a separate mounted form in the list view to avoid state sync bugs between add and edit modes.
- **Pagination defaults:** Set server-side limit (20, max 100) rather than loading all rows client-side.

## 2. Briefly describe your database schema and one tradeoff you made in designing it.

**Schema:**

- `categories` — `id`, `name` (unique), `monthly_budget` (nullable), `created_at`
- `expenses` — `id`, `amount`, `description`, `category_id` (FK → categories), `date`, `created_at`, `updated_at`

Indexes on `expenses.category_id` and `expenses.date` support filtering and summary aggregation.

**Tradeoff:** Categories store a single optional `monthly_budget` rather than a separate `budgets` table with history per month. This keeps the schema simple for a single-team MVP, but changing a budget mid-month retroactively affects how "over budget" is calculated for that month.

## 3. What would break first if this app had to handle ~1,000,000 expenses, and what would you change?

**What breaks first:**

- **Unfiltered or wide date-range list queries** — even with pagination, large offset values (`OFFSET 500000`) become slow.
- **Summary aggregation over huge tables** — monthly `GROUP BY` scans many rows without partitioning.
- **SQLite write concurrency** — a single-file DB becomes a bottleneck under heavy concurrent writes.

**Changes:**

- Move to PostgreSQL (or another server DB) with connection pooling.
- Replace offset pagination with **keyset (cursor) pagination** on `(date, id)`.
- Add composite indexes like `(category_id, date)` and consider **monthly rollup/materialized summary tables**.
- Partition or archive old expenses by month/year.

## 4. What did you deliberately simplify or leave out given the time limit, and why?

- **No authentication** — per the brief; single shared team assumed.
- **No category edit endpoint** — only create/delete; avoids partial-update edge cases for now.
- **No expense reassignment UI when deleting categories** — user must delete expenses first; keeps deletion rules explicit.
- **Minimal styling** — functional layout only, as styling is not evaluated.
- **Monthly summary only for current calendar month** — no custom period picker on the summary tab (expense list still supports date filters).
- **No automated tests** — manual verification via dev servers; tests would be the next addition for production readiness.
