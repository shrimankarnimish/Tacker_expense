import { useEffect, useState } from 'react';
import { api, formatCurrency } from '../api';

export default function Summary({ refreshKey }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setLoading(true);
      setError('');

      try {
        const data = await api.getSummary();
        if (!cancelled) {
          setSummary(data);
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

    loadSummary();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading && !summary) {
    return (
      <div className="panel">
        <h2>Monthly Summary</h2>
        <p className="muted">Loading summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <h2>Monthly Summary</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="panel">
      <h2>Monthly Summary</h2>
      <p className="muted">
        Current period: {summary.period.startDate} to {summary.period.endDate}
      </p>
      <p>
        <strong>Grand total:</strong> {formatCurrency(summary.grandTotal)}
      </p>

      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Total Spend</th>
            <th>Monthly Budget</th>
            <th>Remaining</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {summary.categories.map((row) => (
            <tr key={row.id} className={row.over_budget ? 'over-budget' : ''}>
              <td>{row.name}</td>
              <td>{formatCurrency(row.total_spend)}</td>
              <td>
                {row.monthly_budget === null ? '—' : formatCurrency(row.monthly_budget)}
              </td>
              <td>
                {row.budget_remaining === null
                  ? '—'
                  : formatCurrency(row.budget_remaining)}
              </td>
              <td>
                {row.monthly_budget === null ? (
                  <span className="muted">No budget set</span>
                ) : row.over_budget ? (
                  <span className="badge warn">Over budget</span>
                ) : (
                  <span className="badge ok">Within budget</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
