// Vérifier les deux côtés de la limite de revue humaine avec des probabilités synthétiques.
import assert from "node:assert/strict";
import {matchEmissionFactor} from "../src/index.mjs";
import {createFakeProvider} from "../src/jev.mjs";

const dossier = {id: "seuil-1", text: "Transport fictif avec distance et mode déclarés.", source: {url: "https://example.test/facteur", date: "2026-10-06"}};
const results = [];
for (const confidence of [0.79, 0.80]) {
  const provider = createFakeProvider(() => ({model: "jev-1.13.0", answers: {decision: {type: "choice", choice: "plausible_fit", probabilities: {exact_fit: 0.05, plausible_fit: 0.8, weak_fit: 0.1, no_candidate: 0.05}, confidence}}, usage: {input_tokens: 50, output_tokens: 0}}));
  const result = await matchEmissionFactor(dossier, provider);
  assert.equal(result.review, confidence < 0.8);
  results.push({confidence, review: result.review});
}
console.log(JSON.stringify({source: "fixture synthétique ; aucun appel Jev", results}, null, 2));
