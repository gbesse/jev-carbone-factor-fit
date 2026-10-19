// Explicit metadata constraints; no unit conversion, geography inference or year guessing.
import { canonicalSourceDate } from './source-date.mjs';
const messages = {
  fr: 'Métadonnées de compatibilité invalides : vérifiez compatibility et candidates.',
  en: 'Invalid compatibility metadata: check compatibility and candidates.',
  es: 'Metadatos de compatibilidad inválidos: compruebe compatibility y candidates.',
};
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const year = (value) => Number.isInteger(value) && value >= 1800 && value <= 3000;
const fail = () => {
  throw new TypeError(Object.values(messages).join(' / '));
};

export function screenFactorCandidates(record) {
  try { record = structuredClone(record); }
  catch { fail(); }
  if (!object(record.compatibility)) fail();
  const target = record.compatibility;
  if (
    !text(target.activityUnit) ||
    !text(target.geography) ||
    !text(target.scope) ||
    !year(target.year)
  )
    fail();
  if (!Array.isArray(record.candidates) || record.candidates.length > 1000) fail();
  const eligible = [],
    rejected = [],
    missing = [],
    ids = new Set();
  for (const candidate of record.candidates) {
    if (!object(candidate) || !text(candidate.id) || ids.has(candidate.id)) fail();
    ids.add(candidate.id);
    const reasons = [],
      unknown = [];
    for (const [key, wanted] of [
      ['activityUnit', target.activityUnit],
      ['scope', target.scope],
    ]) {
      const actual = candidate[key];
      if (actual === undefined || actual === null) unknown.push(key);
      else {
        if (!text(actual)) fail();
        if (actual !== wanted) reasons.push(key + '_mismatch');
      }
    }
    const geography = candidate.geographies;
    if (geography === undefined || geography === null) unknown.push('geographies');
    else {
      if (!Array.isArray(geography) || geography.length === 0 || !geography.every(text)) fail();
      if (!geography.includes(target.geography)) reasons.push('geography_mismatch');
    }
    const { validFrom, validTo } = candidate;
    if ((validFrom != null && !year(validFrom)) || (validTo != null && !year(validTo))) fail();
    if (validFrom != null && validTo != null && validFrom > validTo) fail();
    if (validFrom == null || validTo == null) unknown.push('validity_period');
    // A known boundary remains binding when the other boundary is unknown.
    if (
      (validFrom != null && target.year < validFrom) ||
      (validTo != null && target.year > validTo)
    )
      reasons.push('year_outside_validity');
    const source = candidate.source;
    if (source == null) unknown.push('source');
    else {
      if (!object(source)) fail();
      if (!text(source.url) || canonicalSourceDate(source.date) === null)
        unknown.push('source');
      else {
        let url;
        try {
          url = new URL(source.url);
        } catch {
          fail();
        }
        if (!['https:', 'http:'].includes(url.protocol)) fail();
      }
    }
    if (reasons.length) rejected.push({ id: candidate.id, reasons });
    else {
      eligible.push(candidate);
      if (unknown.length) missing.push({ id: candidate.id, fields: unknown });
    }
  }
  return {
    candidates: eligible,
    receipt: {
      version: 1,
      constraints: {activityUnit: target.activityUnit, geography: target.geography, year: target.year, scope: target.scope},
      eligibleIds: eligible.map((c) => c.id),
      rejected,
      missingMetadata: missing,
      requiresReview: missing.length > 0,
    },
  };
}
