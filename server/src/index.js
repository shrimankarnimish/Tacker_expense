import cors from 'cors';
import express from 'express';
import categoriesRouter from './routes/categories.js';
import expensesRouter from './routes/expenses.js';
import summaryRouter from './routes/summary.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/categories', categoriesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/summary', summaryRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ errors: ['Internal server error'] });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
