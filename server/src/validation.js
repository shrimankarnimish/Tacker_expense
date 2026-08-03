const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validateCategoryBody(body, { partial = false } = {}) {
  const errors = [];
  const { name, monthly_budget } = body ?? {};

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('name is required and must be a non-empty string');
    } else if (name.trim().length > 100) {
      errors.push('name must be 100 characters or fewer');
    }
  }

  if (monthly_budget !== undefined && monthly_budget !== null && monthly_budget !== '') {
    const budget = Number(monthly_budget);
    if (Number.isNaN(budget) || budget < 0) {
      errors.push('monthly_budget must be a non-negative number or null');
    }
  }

  return errors;
}

export function validateExpenseBody(body, { partial = false } = {}) {
  const errors = [];
  const { amount, description, category_id, date } = body ?? {};

  if (!partial || amount !== undefined) {
    const value = Number(amount);
    if (amount === undefined || amount === null || amount === '') {
      errors.push('amount is required');
    } else if (Number.isNaN(value) || value <= 0) {
      errors.push('amount must be a positive number');
    }
  }

  if (!partial || description !== undefined) {
    if (typeof description !== 'string' || description.trim().length === 0) {
      errors.push('description is required and must be a non-empty string');
    } else if (description.trim().length > 500) {
      errors.push('description must be 500 characters or fewer');
    }
  }

  if (!partial || category_id !== undefined) {
    const id = Number(category_id);
    if (category_id === undefined || category_id === null || category_id === '') {
      errors.push('category_id is required');
    } else if (!Number.isInteger(id) || id <= 0) {
      errors.push('category_id must be a positive integer');
    }
  }

  if (!partial || date !== undefined) {
    if (typeof date !== 'string' || !ISO_DATE.test(date)) {
      errors.push('date is required and must be in YYYY-MM-DD format');
    } else {
      const parsed = new Date(`${date}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        errors.push('date must be a valid calendar date');
      }
    }
  }

  return errors;
}

export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function parseDateRange(query) {
  const { startDate, endDate } = query;
  const errors = [];

  if (startDate !== undefined && startDate !== '') {
    if (typeof startDate !== 'string' || !ISO_DATE.test(startDate)) {
      errors.push('startDate must be in YYYY-MM-DD format');
    }
  }

  if (endDate !== undefined && endDate !== '') {
    if (typeof endDate !== 'string' || !ISO_DATE.test(endDate)) {
      errors.push('endDate must be in YYYY-MM-DD format');
    }
  }

  if (
    startDate &&
    endDate &&
    ISO_DATE.test(startDate) &&
    ISO_DATE.test(endDate) &&
    startDate > endDate
  ) {
    errors.push('startDate must be on or before endDate');
  }

  return { startDate: startDate || null, endDate: endDate || null, errors };
}
