// Calendar-valid ISO source dates; never normalize an impossible day into another month.
export function canonicalSourceDate(value) {
  if (typeof value !== 'string') return null;
  const pattern = /^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d))?$/;
  if (!pattern.test(value)) return null;
  const day = value.slice(0, 10), midnight = new Date(day + 'T00:00:00.000Z');
  if (!Number.isFinite(midnight.valueOf()) || midnight.toISOString().slice(0, 10) !== day) return null;
  const date = new Date(value);
  return Number.isFinite(date.valueOf()) ? date.toISOString() : null;
}
