import test from 'node:test';
import assert from 'node:assert/strict';
import { matchEmissionFactor, screenFactorCandidates } from '../src/index.mjs';
const source = { url: 'https://example.test/synthetic', date: '2026-10-14', license: 'synthetic' };
const candidate = {
  id: 'synthetic-fr-kwh',
  activityUnit: 'kWh',
  geographies: ['FR'],
  validFrom: 2025,
  validTo: 2027,
  scope: 'combustion',
  source,
};
const record = {
  id: 'synthetic',
  text: 'FR : dossier fictif / EN: fictional record / ES: registro ficticio',
  source,
  compatibility: { activityUnit: 'kWh', geography: 'FR', year: 2026, scope: 'combustion' },
  candidates: [candidate],
};
const response = (choice = 'exact_fit') => ({
  answers: {
    decision: { type: 'choice', choice, probabilities: Object.fromEntries(['exact_fit', 'plausible_fit', 'weak_fit', 'no_candidate'].map(key=>[key,key===choice?.toString()?0.99:0.01/3])), confidence: 0.99 },
  },
});
test('reject all known mismatches before calling provider', async () => {
  const cases = [
    { activityUnit: 'kg' },
    { geographies: ['DE'] },
    { validTo: 2024, validFrom: 2020 },
    { scope: 'lifecycle' },
  ];
  for (const change of cases) {
    const input = { ...record, candidates: [{ ...candidate, ...change }] };
    const out = await matchEmissionFactor(input, {
      decide() {
        throw Error('unexpected network');
      },
    });
    assert.equal(out.decision, 'no_candidate');
    assert.equal(out.review, true);
    assert.equal(out.deterministic, true);
    assert.equal(out.compatibility.rejected.length, 1);
  }
});
test('provider sees only eligible candidates; original data and provenance preserved', async () => {
  const input = structuredClone(record);
  input.candidates.push({
    ...candidate,
    id: 'rejected',
    activityUnit: 'kg',
    text: 'private rejected sentinel',
  });
  const snapshot = JSON.stringify(input);
  const out = await matchEmissionFactor(input, {
    async decide(request) {
      assert.deepEqual(request.state.candidates, [candidate]);
      assert.equal(request.state.source.license, 'synthetic');
      assert.equal(JSON.stringify(request).includes('private rejected sentinel'), false);
      return response();
    },
  });
  assert.equal(out.review, false);
  assert.deepEqual(out.compatibility.eligibleIds, [candidate.id]);
  assert.equal(JSON.stringify(input), snapshot);
});
test('missing metadata cannot become an exact match at high semantic confidence', async () => {
  for (const key of ['activityUnit', 'geographies', 'validFrom', 'validTo', 'scope', 'source']) {
    const incomplete = { ...candidate };
    delete incomplete[key];
    const out = await matchEmissionFactor(
      { ...record, candidates: [incomplete] },
      {
        async decide() {
          return response();
        },
      },
    );
    assert.equal(out.review, true);
    assert.equal(out.decision, 'plausible_fit');
    assert.equal(out.probability, null);
    assert.deepEqual(out.semanticDecision, { decision: 'exact_fit', probability: 0.99 });
    assert.equal(out.compatibility.missingMetadata.length, 1);
  }
});
test('known validity boundary binds even if the other is absent', () => {
  const out = screenFactorCandidates({
    ...record,
    candidates: [{ ...candidate, validFrom: null, validTo: 2025 }],
  });
  assert.equal(out.candidates.length, 0);
  assert.deepEqual(out.receipt.rejected[0].reasons, ['year_outside_validity']);
});
test('all declared geographies and validity endpoints accepted without inference', () => {
  const out = screenFactorCandidates({
    ...record,
    candidates: [{ ...candidate, geographies: ['DE', 'FR'], validFrom: 2026, validTo: 2026 }],
  });
  assert.equal(out.candidates.length, 1);
  assert.equal(
    screenFactorCandidates({ ...record, candidates: [{ ...candidate, geographies: ['EU'] }] })
      .candidates.length,
    0,
  );
});
test('multiple mismatches have a complete code receipt', () => {
  const out = screenFactorCandidates({
    ...record,
    candidates: [
      {
        ...candidate,
        activityUnit: 'kg',
        scope: 'lifecycle',
        geographies: ['US'],
        validFrom: 2027,
      },
    ],
  });
  assert.deepEqual(out.receipt.rejected[0].reasons, [
    'activityUnit_mismatch',
    'scope_mismatch',
    'geography_mismatch',
    'year_outside_validity',
  ]);
});
test('malformed metadata fails before provider use', async () => {
  const inputs = [
    { ...record, compatibility: null },
    { ...record, compatibility: { ...record.compatibility, year: '2026' } },
    { ...record, candidates: undefined },
    { ...record, candidates: [null] },
    { ...record, candidates: [candidate, candidate] },
    ...[
      { validFrom: '2025' },
      { geographies: 'FR' },
      { geographies: [] },
      { validFrom: 2028 },
      { source: { url: 'file:///secret', date: '2026-10-14' } },
    ].map((change) => ({ ...record, candidates: [{ ...candidate, ...change }] })),
  ];
  for (const input of inputs)
    await assert.rejects(
      matchEmissionFactor(input, {
        decide() {
          throw Error('network');
        },
      }),
      /compatibility/,
    );
});
test('localized prompts preserve user-authored data', async () => {
  const prompts = [];
  for (const lang of ['fr', 'en', 'es']) {
    await matchEmissionFactor(
      record,
      {
        async decide(request) {
          assert.equal(request.state.text, record.text);
          prompts.push(request.questions.decision.instructions);
          return response();
        },
      },
      { lang },
    );
  }
  assert.equal(new Set(prompts).size, 3);
  await assert.rejects(matchEmissionFactor(record, null, { lang: 'de' }), /fr, en, es/);
});
test('a plausible result remains human-reviewed when metadata is missing', async () => {
  const out = await matchEmissionFactor(
    { ...record, candidates: [{ id: 'unknown' }] },
    {
      async decide() {
        return response('plausible_fit');
      },
    },
  );
  assert.equal(out.review, true);
  assert.equal(out.probability, 0.99);
});

test('asynchronous assessment uses snapshotted data after caller mutations', async () => {
 const input=structuredClone(record);let release,entered;
 const ready=new Promise(resolve=>{entered=resolve;}),gate=new Promise(resolve=>{release=resolve;});
 const result=matchEmissionFactor(input,{async decide(request){entered();await gate;
  assert.equal(request.state.candidates[0].activityUnit,'kWh');
  assert.equal(request.state.compatibility.year,2026);return response();}});
 await ready;input.candidates[0].activityUnit='kg';input.compatibility.year=2030;release();
 const out=await result;assert.equal(out.review,false);assert.equal(out.compatibility.constraints.year,2026);
 assert.equal(input.candidates[0].activityUnit,'kg');
});
test('screened candidates and constraints cannot mutate the caller source',()=>{
 const input=structuredClone(record),out=screenFactorCandidates(input);
 out.candidates[0].geographies.push('US');out.receipt.constraints.year=2030;
 assert.deepEqual(input.candidates[0].geographies,['FR']);assert.equal(input.compatibility.year,2026);
});
test('uncopyable dossier blocks before provider call',async()=>{
 const input={...record,uncopyable:()=>{}};
 await assert.rejects(matchEmissionFactor(input,{decide(){throw Error('must not call');}}),/copiable/);
});
