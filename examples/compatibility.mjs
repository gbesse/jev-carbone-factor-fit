// Synthetic metadata only; zero network calls and no claimed ADEME factor values.
import assert from 'node:assert/strict';
import { matchEmissionFactor } from '../src/index.mjs';
const lang = process.argv[2] ?? 'fr';
const message = {
  fr: 'Exemple synthétique : rejet sans appel, puis revue obligatoire des métadonnées incomplètes.',
  en: 'Synthetic example: rejection without a call, then mandatory review of incomplete metadata.',
  es: 'Ejemplo sintético: rechazo sin llamada y revisión obligatoria de metadatos incompletos.',
};
if (!Object.hasOwn(message, lang)) throw Error('fr / en / es');
const record = {
  id: 'synthetic-activity',
  text: 'FR : consommation fictive / EN: fictional consumption / ES: consumo ficticio',
  source: { url: 'https://example.test/synthetic', date: '2026-10-14', license: 'synthetic' },
  compatibility: { activityUnit: 'kWh', geography: 'FR', year: 2026, scope: 'combustion' },
  candidates: [
    {
      id: 'synthetic-kg',
      activityUnit: 'kg',
      geographies: ['FR'],
      validFrom: 2025,
      validTo: 2027,
      scope: 'combustion',
    },
  ],
};
let calls = 0;
const provider = {
  async decide(request) {
    calls++;
    assert.equal(request.state.candidates.length, 1);
    return {
      answers: {
        decision: {
          type: 'choice',
          choice: 'exact_fit',
          probabilities: { exact_fit: 0.99, plausible_fit: 0.01, weak_fit: 0, no_candidate: 0 },
          confidence: 0.99,
        },
      },
    };
  },
};
const rejected = await matchEmissionFactor(record, provider, { lang });
assert.equal(calls, 0);
assert.equal(rejected.decision, 'no_candidate');
const incomplete = await matchEmissionFactor(
  { ...record, candidates: [{ id: 'synthetic-unknown' }] },
  provider,
  { lang },
);
assert.equal(calls, 1);
assert.equal(incomplete.review, true);
assert.equal(incomplete.decision, 'plausible_fit');
assert.equal(incomplete.probability, null);
console.log(
  JSON.stringify(
    { message: message[lang], synthetic: true, paid_requests: 0, rejected, incomplete },
    null,
    2,
  ),
);
