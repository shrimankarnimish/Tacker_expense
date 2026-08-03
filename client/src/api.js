const BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();
  if (!response.ok) {
    const message = data.errors?.join(', ') || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export const api = {
  getCategories: () => request('/categories'),
  createCategory: (body) =>
    request('/categories', { method: 'POST', body: JSON.stringify(body) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  getExpenses: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value);
      }
    });
    const qs = query.toString();
    return request(`/expenses${qs ? `?${qs}` : ''}`);
  },
  createExpense: (body) =>
    request('/expenses', { method: 'POST', body: JSON.stringify(body) }),
  updateExpense: (id, body) =>
    request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),

  getSummary: () => request('/summary'),
};

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
