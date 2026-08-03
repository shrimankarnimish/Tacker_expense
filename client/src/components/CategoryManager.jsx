import { useState } from 'react';
import { api, formatCurrency } from '../api';

export default function CategoryManager({ categories, onChanged }) {
  const [name, setName] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.createCategory({
        name,
        monthly_budget: monthlyBudget === '' ? null : Number(monthlyBudget),
      });
      setName('');
      setMonthlyBudget('');
      setMessage('Category created.');
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, categoryName) {
    if (!window.confirm(`Delete category "${categoryName}"?`)) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await api.deleteCategory(id);
      setMessage('Category deleted.');
      onChanged?.();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="panel">
      <h2>Manage Categories</h2>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <form className="inline-form" onSubmit={handleCreate}>
        <label>
          Name
          <input
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Monthly budget (optional)
          <input
            type="number"
            min="0"
            step="0.01"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Add Category'}
        </button>
      </form>

      <table style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Monthly Budget</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>
                {category.monthly_budget === null
                  ? '—'
                  : formatCurrency(category.monthly_budget)}
              </td>
              <td>
                <button
                  type="button"
                  className="danger"
                  onClick={() => handleDelete(category.id, category.name)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
