import { useEffect, useState } from 'react';
import { api, formatCurrency } from '../api';
import ExpenseForm from './ExpenseForm';

export default function ExpenseList({ categories, refreshKey, onChanged }) {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({
    categoryId: '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadExpenses() {
      setLoading(true);
      setError('');

      try {
        const result = await api.getExpenses({
          page,
          limit: pagination.limit,
          categoryId: filters.categoryId || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        });

        if (!cancelled) {
          setExpenses(result.data);
          setPagination(result.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadExpenses();
    return () => {
      cancelled = true;
    };
  }, [page, filters, refreshKey, pagination.limit]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this expense?')) {
      return;
    }

    try {
      await api.deleteExpense(id);
      onChanged?.();
      if (expenses.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      {editing && (
        <ExpenseForm
          categories={categories}
          editing={{
            id: editing.id,
            amount: editing.amount,
            description: editing.description,
            category_id: editing.category_id,
            date: editing.date,
          }}
          onSaved={() => {
            setEditing(null);
            onChanged?.();
          }}
          onCancelEdit={() => setEditing(null)}
        />
      )}

      <div className="panel">
        <h2>Expenses</h2>
        {error && <div className="error">{error}</div>}

        <div className="filters">
          <label>
            Category
            <select
              value={filters.categoryId}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, categoryId: e.target.value });
              }}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            From
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, startDate: e.target.value });
              }}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, endDate: e.target.value });
              }}
            />
          </label>
        </div>

        {loading ? (
          <p className="muted">Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="muted">No expenses match your filters.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.date}</td>
                  <td>{expense.description}</td>
                  <td>{expense.category_name}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setEditing(expense)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDelete(expense.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="pagination">
          <span className="muted">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="actions">
            <button
              type="button"
              className="secondary"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="secondary"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
