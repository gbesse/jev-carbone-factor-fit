// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from 'node:fs/promises';
import { screenFactorCandidates } from './compatibility.mjs';
export { screenFactorCandidates } from './compatibility.mjs';
export const DECISIONS = Object.freeze({
  exact_fit: 'correspondance_exacte',
  plausible_fit: 'correspondance_plausible',
  weak_fit: 'correspondance_faible',
  no_candidate: 'aucun_candidat',
});
const CRITERIA = Object.freeze({
  exact_fit: 'correspondance exacte',
  plausible_fit: 'correspondance plausible',
  weak_fit: 'correspondance faible',
  no_candidate: 'aucun candidat',
});
export function activityCase(input) {
  try { input = structuredClone(input); }
  catch { throw new TypeError('Dossier non copiable / Record cannot be snapshotted / No se puede copiar el registro'); }
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date)
    throw new TypeError(
      'Le dossier exige id, text, source.url et source.date / Record requires id, text, source.url and source.date / El registro exige id, text, source.url y source.date',
    );
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf()))
    throw new TypeError(
      'source.date doit être une date ISO valide / source.date must be a valid ISO date / source.date debe ser una fecha ISO válida',
    );
  return {
    ...input,
    id: String(input.id),
    text: String(input.text).trim(),
    source: { ...input.source, url: String(input.source.url), date: date.toISOString() },
  };
}
const INSTRUCTIONS = {
  fr: 'Analysez ce rapprochement de facteur carbone à partir des seuls éléments sourcés. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni droit applicable, ni garantie. Les candidats rejetés par le code sont absents. Toute métadonnée inconnue interdit une correspondance exacte. Aucun facteur individuel n’est sélectionné par cette question.',
  en: 'Assess this emission-factor match using only sourced evidence. Choose the most cautious category. Invent no facts, applicable law or guarantees. Candidates rejected by code are absent. Unknown metadata rules out an exact match. This question does not select an individual factor.',
  es: 'Evalúe la correspondencia de factores de emisión usando solo pruebas documentadas. Elija la categoría más prudente. No invente hechos, normativa ni garantías. Los candidatos rechazados por el código están ausentes. Metadatos desconocidos impiden una coincidencia exacta. Esta pregunta no selecciona un factor individual.',
};
const LOCAL_CRITERIA = {
  fr: CRITERIA,
  en: {
    exact_fit: 'exact match',
    plausible_fit: 'plausible match',
    weak_fit: 'weak match',
    no_candidate: 'no candidate',
  },
  es: {
    exact_fit: 'coincidencia exacta',
    plausible_fit: 'coincidencia plausible',
    weak_fit: 'coincidencia débil',
    no_candidate: 'ningún candidato',
  },
};
const RESPONSE_ERROR =
  'Réponse Jev invalide : catégorie, probabilité ou confiance hors contrat / Invalid Jev response: category, probability or confidence out of contract / Respuesta Jev inválida: categoría, probabilidad o confianza fuera del contrato';
export async function matchEmissionFactor(input, provider, { lang = 'fr' } = {}) {
  if (!Object.hasOwn(INSTRUCTIONS, lang))
    throw new TypeError('Langue invalide / Invalid language / Idioma inválido: fr, en, es');
  const record = activityCase(input);
  let compatibility;
  let candidates = record.candidates;
  if (record.compatibility !== undefined) {
    const screened = screenFactorCandidates(record);
    compatibility = screened.receipt;
    candidates = screened.candidates;
  }
  if (Array.isArray(candidates) && candidates.length === 0)
    return {
      decision: 'no_candidate',
      label: DECISIONS.no_candidate,
      probability: 1,
      review: Boolean(compatibility),
      deterministic: true,
      ...(compatibility ? { compatibility, reason: 'no_compatible_candidate' } : {}),
    };
  // Only eligible candidates are sent in the candidates field; the receipt stays local.
  const state = compatibility ? { ...record, candidates } : record;
  const response = await provider.decide({
    state,
    questions: {
      decision: {
        type: 'choice',
        instructions: INSTRUCTIONS[lang],
        criteria: { ...LOCAL_CRITERIA[lang] },
      },
    },
  });
  const answer = response?.answers?.decision;
  const probabilities = answer?.probabilities;
  const keys = Object.keys(DECISIONS);
  const distributionValid = probabilities && typeof probabilities === 'object' && !Array.isArray(probabilities) && Object.keys(probabilities).length === keys.length && keys.every(key => Object.hasOwn(probabilities, key) && Number.isFinite(probabilities[key]) && probabilities[key] >= 0 && probabilities[key] <= 1) && Math.abs(keys.reduce((sum, key) => sum + probabilities[key], 0) - 1) <= 0.001;
  const probability = probabilities?.[answer?.choice];
  if (
    answer?.type !== 'choice' ||
    !distributionValid ||
    !Object.hasOwn(DECISIONS, answer?.choice) ||
    keys.some(key => probabilities[key] > probability) ||
    !Number.isFinite(probability) ||
    probability < 0 ||
    probability > 1 ||
    !Number.isFinite(answer.confidence) ||
    answer.confidence < 0 ||
    answer.confidence > 1
  ) {
    throw new TypeError(RESPONSE_ERROR);
  }
  const downgraded = compatibility?.requiresReview && answer.choice === 'exact_fit';
  const decision = downgraded ? 'plausible_fit' : answer.choice;
  return {
    decision,
    label: DECISIONS[decision],
    // Do not relabel the model's probability as probability of a code-adjusted category.
    probability: downgraded ? null : probability,
    confidence: answer.confidence,
    review: Boolean(compatibility?.requiresReview) || answer.confidence < 0.8,
    deterministic: false,
    usage: response.usage,
    ...(compatibility ? { compatibility } : {}),
    ...(downgraded
      ? {
          reason: 'incomplete_metadata',
          semanticDecision: { decision: answer.choice, probability },
        }
      : {}),
  };
}
export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error('Usage : jev-carbone-factor-fit <dossier.json>');
  const dossier = activityCase(JSON.parse(await readFile(argv[0], 'utf8')));
  io.log(
    JSON.stringify(
      {
        dossier,
        prochaineÉtape:
          'Transmettez ce dossier à matchEmissionFactor avec un fournisseur Jev configuré.',
      },
      null,
      2,
    ),
  );
}
