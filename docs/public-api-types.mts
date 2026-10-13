// Objectif : vérifier que les types publics sont importables.
import { activityCase, matchEmissionFactor } from "../src/index.mjs";
const dossier = activityCase({
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
});
void matchEmissionFactor(dossier, { decide: async () => ({}) });

import { screenFactorCandidates } from "../src/index.mjs";
const metadata = screenFactorCandidates({ compatibility: { activityUnit: "kWh", geography: "FR", year: 2026, scope: "combustion" }, candidates: [{ id: "synthetic", geographies: ["FR"] }] });
const reasons: string[] = metadata.receipt.rejected.flatMap((row) => row.reasons);
void reasons;
