// Objectif : vérifier la normalisation, la règle déterministe et les décisions sémantiques.
import test from "node:test";
import assert from "node:assert/strict";
import { activityCase, matchEmissionFactor } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const casLimite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-09-27"
  },
  "candidates": []
};
const casPrincipal = {
  "id": "exemple-1",
  "text": "Facture de 420 litres de gazole non routier consommé par un engin de chantier en France.",
  "source": {
    "url": "https://example.test/source-publique",
    "date": "2026-09-25"
  },
  "details": {
    "territoire": "Commune Exemple",
    "origine": "donnée synthétique"
  }
};
const casÀRevoir = {
  "id": "revue-1",
  "text": "Prestation logistique européenne facturée au colis, sans distance ni mode de transport détaillé.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-09-26"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};
test("exige une source", () => assert.throws(() => activityCase({ id: "x", text: "y" }), /source/));
test("applique le cas limite sans appel Jev", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  assert.equal((await matchEmissionFactor(casLimite, provider)).decision, "no_candidate");
  assert.equal(provider.calls, 0);
});
test("classe un dossier sourcé avec une confiance suffisante", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "exact_fit", probabilities: {
  "exact_fit": 0.82,
  "plausible_fit": 0.06,
  "weak_fit": 0.06,
  "no_candidate": 0.06
}, confidence: 0.82 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await matchEmissionFactor(casPrincipal, provider);
  assert.equal(résultat.decision, "exact_fit");
  assert.equal(résultat.review, false);
  assert.equal(provider.calls, 1);
});
test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "plausible_fit", probabilities: {
  "exact_fit": 0.16,
  "plausible_fit": 0.52,
  "weak_fit": 0.16,
  "no_candidate": 0.16
}, confidence: 0.62 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await matchEmissionFactor(casÀRevoir, provider);
  assert.equal(résultat.decision, "plausible_fit");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
  assert.equal(provider.calls, 1);
});
test("rejette une catégorie inventée ou une probabilité hors contrat", async () => {
  for (const [choice, probability] of [["invented", 0.9], ["exact_fit", 1.2]]) {
    const provider = createFakeProvider(() => ({ answers: { decision: { choice, probabilities: { [choice]: probability }, confidence: 0.9 } } }));
    await assert.rejects(matchEmissionFactor(casPrincipal, provider), /Réponse Jev invalide/);
  }
});
