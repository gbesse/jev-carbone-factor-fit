import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalSourceDate } from '../src/source-date.mjs';
import { activityCase, matchEmissionFactor } from '../src/index.mjs';
const source = { url: 'https://example.test/synthetic', date: '2026-10-14' };
const record = { id: 'synthetic', text: 'Synthetic activity', source, compatibility: { activityUnit: 'kWh', geography: 'FR', year: 2026, scope: 'combustion' }, candidates: [{ id: 'factor', activityUnit: 'kWh', geographies: ['FR'], validFrom: 2025, validTo: 2027, scope: 'combustion', source: { ...source } }] };
test('impossible dates and timezone-free times are not silently normalized', () => {
  for (const value of ['2026-02-30', '2025-02-29', '2026-04-31T10:00:00Z', '2026-10-19T12:00:00', '2026-10-19T24:00:00Z']) assert.equal(canonicalSourceDate(value), null);
  assert.equal(canonicalSourceDate('2024-02-29'), '2024-02-29T00:00:00.000Z');
  assert.equal(canonicalSourceDate('2026-10-19T23:30:00-02:00'), '2026-10-20T01:30:00.000Z');
});
test('invalid activity provenance stops before any semantic request', async () => {
  const input = { ...record, source: { ...source, date: '2026-02-30' } };
  assert.throws(() => activityCase(input), /ISO/);
  await assert.rejects(matchEmissionFactor(input, { decide() { assert.fail('provider must not run'); } }), /ISO/);
});
test('invalid candidate source date preserves uncertainty instead of exact fit', async () => {
  const input = structuredClone(record); input.candidates[0].source.date = '2026-02-30';
  const output = await matchEmissionFactor(input, { async decide() { return { answers: { decision: { type: 'choice', choice: 'exact_fit', confidence: 1, probabilities: { exact_fit: 1, plausible_fit: 0, weak_fit: 0, no_candidate: 0 } } } }; } });
  assert.equal(output.decision, 'plausible_fit'); assert.equal(output.review, true); assert.equal(output.probability, null);
  assert.deepEqual(output.compatibility.missingMetadata[0].fields, ['source']);
  assert.equal(input.candidates[0].source.date, '2026-02-30');
});
