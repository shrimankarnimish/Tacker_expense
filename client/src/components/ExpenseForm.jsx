import { useState } from 'react';
import { api, todayIso } from '../api';

const emptyForm = {
  amount: '',
  description: '',
  category_id: '',
  date: todayIso(),
};

export default function ExpenseForm({ categories, onSaved, editing, onCancelEdit }) {
  const [form, setForm] = useState(editing || emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(editing?.id);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        amount: Number(form.amount),
        description: form.description,
        category_id: Number(form.category_id),
        date: form.date,
      };

      if (isEditing) {
        await api.updateExpense(editing.id, payload);
      } else {
        await api.createExpense(payload);
      }

      setForm(emptyForm);
      onSaved?.();
      onCancelEdit?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (categories.length === 0) {
    return (
      <div className="panel">
        <h2>{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
        <p className="muted">Create at least one category before adding expenses.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Amount
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </label>
        <label>
          Description
          <input
            type="text"
            required
            maxLength={500}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label>
          Category
          <select
            required
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
        <div className="actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Expense' : 'Add Expense'}
          </button>
          {isEditing && (
            <button type="button" className="secondary" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
