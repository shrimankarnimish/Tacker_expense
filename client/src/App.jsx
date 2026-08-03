import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import CategoryManager from './components/CategoryManager';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';

const TABS = [
  { id: 'expenses', label: 'Expenses' },
  { id: 'categories', label: 'Categories' },
  { id: 'summary', label: 'Summary' },
];

export default function App() {
  const [tab, setTab] = useState('expenses');
  const [categories, setCategories] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');

  const refreshCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories, refreshKey]);

  const triggerRefresh = () => setRefreshKey((value) => value + 1);

  return (
    <div>
      <h1>Team Expense Tracker</h1>
      <p className="subtitle">Log shared team expenses, manage categories, and track budgets.</p>

      {error && <div className="error">{error}</div>}

      <div className="tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'active' : ''}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'expenses' && (
        <>
          <ExpenseForm
            categories={categories}
            onSaved={() => {
              triggerRefresh();
            }}
          />
          <ExpenseList
            categories={categories}
            refreshKey={refreshKey}
            onChanged={triggerRefresh}
          />
        </>
      )}

      {tab === 'categories' && (
        <CategoryManager
          categories={categories}
          onChanged={() => {
            triggerRefresh();
          }}
        />
      )}

      {tab === 'summary' && <Summary refreshKey={refreshKey} />}
    </div>
  );
}
