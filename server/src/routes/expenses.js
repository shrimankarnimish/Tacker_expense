import { Router } from 'express';
import db from '../db.js';
import {
  parseDateRange,
  parsePagination,
  validateExpenseBody,
} from '../validation.js';

const router = Router();

function getExpenseById(id) {
  return db
    .prepare(
      `SELECT e.id, e.amount, e.description, e.category_id, e.date, e.created_at, e.updated_at,
              c.name AS category_name
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       WHERE e.id = ?`
    )
    .get(id);
}

router.get('/', (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const { startDate, endDate, errors } = parseDateRange(req.query);
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;

  if (categoryId !== null && (!Number.isInteger(categoryId) || categoryId <= 0)) {
    return res.status(400).json({ errors: ['categoryId must be a positive integer'] });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const conditions = [];
  const params = [];

  if (categoryId) {
    conditions.push('e.category_id = ?');
    params.push(categoryId);
  }

  if (startDate) {
    conditions.push('e.date >= ?');
    params.push(startDate);
  }

  if (endDate) {
    conditions.push('e.date <= ?');
    params.push(endDate);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRow = db
    .prepare(`SELECT COUNT(*) AS total FROM expenses e ${whereClause}`)
    .get(...params);

  const expenses = db
    .prepare(
      `SELECT e.id, e.amount, e.description, e.category_id, e.date, e.created_at, e.updated_at,
              c.name AS category_name
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       ${whereClause}
       ORDER BY e.date DESC, e.id DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  res.json({
    data: expenses,
    pagination: {
      page,
      limit,
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / limit) || 1,
    },
  });
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ errors: ['Invalid expense id'] });
  }

  const expense = getExpenseById(id);
  if (!expense) {
    return res.status(404).json({ errors: ['Expense not found'] });
  }

  res.json(expense);
});

router.post('/', (req, res) => {
  const errors = validateExpenseBody(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const category = db
    .prepare('SELECT id FROM categories WHERE id = ?')
    .get(Number(req.body.category_id));

  if (!category) {
    return res.status(400).json({ errors: ['category_id does not exist'] });
  }

  const result = db
    .prepare(
      `INSERT INTO expenses (amount, description, category_id, date)
       VALUES (?, ?, ?, ?)`
    )
    .run(
      Number(req.body.amount),
      req.body.description.trim(),
      Number(req.body.category_id),
      req.body.date
    );

  res.status(201).json(getExpenseById(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ errors: ['Invalid expense id'] });
  }

  const existing = db.prepare('SELECT id FROM expenses WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ errors: ['Expense not found'] });
  }

  const errors = validateExpenseBody(req.body, { partial: false });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const category = db
    .prepare('SELECT id FROM categories WHERE id = ?')
    .get(Number(req.body.category_id));

  if (!category) {
    return res.status(400).json({ errors: ['category_id does not exist'] });
  }

  db.prepare(
    `UPDATE expenses
     SET amount = ?, description = ?, category_id = ?, date = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    Number(req.body.amount),
    req.body.description.trim(),
    Number(req.body.category_id),
    req.body.date,
    id
  );

  res.json(getExpenseById(id));
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ errors: ['Invalid expense id'] });
  }

  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ errors: ['Expense not found'] });
  }

  res.status(204).send();
});

export default router;
