import { Router } from 'express';
import db from '../db.js';

const router = Router();

function currentMonthBounds() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return {
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

router.get('/', (_req, res) => {
  const { startDate, endDate } = currentMonthBounds();

  const summary = db
    .prepare(
      `SELECT
         c.id,
         c.name,
         c.monthly_budget,
         COALESCE(SUM(e.amount), 0) AS total_spend,
         COUNT(e.id) AS expense_count
       FROM categories c
       LEFT JOIN expenses e
         ON e.category_id = c.id
        AND e.date >= ?
        AND e.date <= ?
       GROUP BY c.id, c.name, c.monthly_budget
       ORDER BY c.name ASC`
    )
    .all(startDate, endDate);

  const rows = summary.map((row) => ({
    ...row,
    total_spend: Number(row.total_spend.toFixed(2)),
    over_budget:
      row.monthly_budget !== null && row.total_spend > row.monthly_budget,
    budget_remaining:
      row.monthly_budget === null
        ? null
        : Number((row.monthly_budget - row.total_spend).toFixed(2)),
  }));

  const grandTotal = rows.reduce((sum, row) => sum + row.total_spend, 0);

  res.json({
    period: { startDate, endDate },
    categories: rows,
    grandTotal: Number(grandTotal.toFixed(2)),
  });
});

export default router;
