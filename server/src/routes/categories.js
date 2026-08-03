import { Router } from 'express';
import db from '../db.js';
import { validateCategoryBody } from '../validation.js';

const router = Router();

router.get('/', (_req, res) => {
  const categories = db
    .prepare('SELECT id, name, monthly_budget, created_at FROM categories ORDER BY name ASC')
    .all();
  res.json(categories);
});

router.post('/', (req, res) => {
  const errors = validateCategoryBody(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const name = req.body.name.trim();
  const monthlyBudget =
    req.body.monthly_budget === undefined ||
    req.body.monthly_budget === null ||
    req.body.monthly_budget === ''
      ? null
      : Number(req.body.monthly_budget);

  try {
    const result = db
      .prepare('INSERT INTO categories (name, monthly_budget) VALUES (?, ?)')
      .run(name, monthlyBudget);

    const category = db
      .prepare('SELECT id, name, monthly_budget, created_at FROM categories WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ errors: ['A category with this name already exists'] });
    }
    throw error;
  }
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ errors: ['Invalid category id'] });
  }

  const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ errors: ['Category not found'] });
  }

  const expenseCount = db
    .prepare('SELECT COUNT(*) AS count FROM expenses WHERE category_id = ?')
    .get(id);

  if (expenseCount.count > 0) {
    return res.status(409).json({
      errors: [
        `Cannot delete category: ${expenseCount.count} expense(s) still reference it. Reassign or delete those expenses first.`,
      ],
    });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.status(204).send();
});

export default router;
