# FR — Contraintes avant comparaison sémantique

Ajoutez `compatibility: { activityUnit: "kWh", geography: "FR", year: 2026, scope: "combustion" }` et une liste `candidates`. `screenFactorCandidates` filtre les incompatibilités **déclarées** avant `matchEmissionFactor` : unité d’activité et périmètre identiques, territoire explicitement présent dans `geographies`, année dans les bornes inclusives `validFrom` / `validTo`. Les périodes doivent exprimer la validité documentée, pas simplement l’année de publication du facteur. Une borne connue reste contraignante si l’autre manque.

Chaque candidat exige un `id` unique. Métadonnées possibles : `activityUnit`, `geographies`, `validFrom`, `validTo`, `scope`, `source: { url, date, ... }`. Une incompatibilité connue exclut le candidat du champ `candidates` envoyé au fournisseur. Le reçu `compatibility` conserve identifiants et raisons, pas les valeurs de facteurs. Aucun candidat admissible donne `no_candidate` sans appel, avec revue humaine requise. `probability: 1` décrit alors la règle de code, pas une certitude environnementale. Les données supplémentaires que vous fournissez restent dans le dossier : ne dupliquez pas de candidats rejetés dans d’autres champs.

Les données absentes ne sont pas considérées compatibles : elles imposent `review: true`. Si le modèle répond `exact_fit` malgré des métadonnées manquantes, le code borne la décision à `plausible_fit`, conserve la décision et probabilité initiales dans `semanticDecision`, et met `probability: null` pour la catégorie ajustée. Une confiance élevée ne lève jamais cette revue. Les identifiants et textes utilisateur sont conservés ; `{ lang: "fr" | "en" | "es" }` choisit seulement les instructions générées. Le fournisseur classe un **ensemble**, sans sélectionner un facteur individuel ni calculer d’émissions.

```sh
node examples/compatibility.mjs fr
```

C’est un contrat d’adaptation explicite, pas un parseur du schéma ADEME. Pas de conversion kg/litre ou kWh PCI/PCS, pas d’inférence UE→France, pas de calcul d’incertitude, ni de garantie de conformité. Sans `compatibility`, le chemin historique demeure ; aucun contrôle de métadonnées n’est alors revendiqué. Les exemples et probabilités sont synthétiques. Traduisez les champs source vers ce contrat uniquement après examen de leur documentation et de leur licence.

La [méthodologie ADEME](https://bilans-ges.ademe.fr/docutheque/methodologieV5.pdf) demande un facteur cohérent avec les données d’activité. Le [guide cosmétique](https://bilans-ges.ademe.fr/docutheque/Guide-Sectoriel-Cosmetique.ext) précise le choix selon l’unité d’énergie ; le [guide FNTP](https://base-carbone.ademe.fr/docutheque/Guides%20Sectoriels%20MAJ%20V5/Guides%20sectoriels/guide%20sectoriel%20FNTP.pdf) distingue représentativités temporelle, technologique et géographique. Notre garde est une interprétation logicielle prudente de ces dimensions, pas une procédure ADEME officielle.

# EN — Constraints before semantic comparison

Add `compatibility: { activityUnit: "kWh", geography: "FR", year: 2026, scope: "combustion" }` and a `candidates` list. `screenFactorCandidates` filters **declared** incompatibilities before `matchEmissionFactor`: identical activity unit and scope, geography explicitly listed in `geographies`, year within inclusive `validFrom` / `validTo` boundaries. Periods must describe documented validity, not merely a factor's publication year. A known boundary remains binding when the other is absent.

Each candidate requires a unique `id`. Optional metadata: `activityUnit`, `geographies`, `validFrom`, `validTo`, `scope`, `source: { url, date, ... }`. Known mismatches remove the candidate from the `candidates` field sent to the provider. The `compatibility` receipt preserves IDs and reasons rather than factor values. No eligible candidate returns `no_candidate` without a call and requires human review. Here `probability: 1` describes a code rule, not environmental certainty. Additional user fields stay in the record: do not duplicate rejected candidates elsewhere.

Missing data is not treated as compatible: it forces `review: true`. If the model returns `exact_fit` with missing metadata, code caps the decision at `plausible_fit`, preserves the original decision and probability in `semanticDecision`, and sets `probability: null` for the adjusted category. High confidence cannot remove review. User IDs and text are preserved; `{ lang: "fr" | "en" | "es" }` only selects generated instructions. The provider classifies a **set**, without choosing an individual factor or computing emissions.

```sh
node examples/compatibility.mjs en
```

This is an explicit adapter contract, not an ADEME schema parser. No kg/litre or lower/higher heating value conversion, EU→France inference, uncertainty calculation or compliance guarantee. Without `compatibility`, the legacy path remains and claims no metadata checks. Examples and probabilities are synthetic. Map source fields only after reviewing their documentation and license.

[ADEME methodology](https://bilans-ges.ademe.fr/docutheque/methodologieV5.pdf) calls for a factor consistent with activity data. The [cosmetics guide](https://bilans-ges.ademe.fr/docutheque/Guide-Sectoriel-Cosmetique.ext) specifies selection by energy unit; the [FNTP guide](https://base-carbone.ademe.fr/docutheque/Guides%20Sectoriels%20MAJ%20V5/Guides%20sectoriels/guide%20sectoriel%20FNTP.pdf) distinguishes temporal, technological and geographical representativeness. Our guard is a cautious software interpretation, not an official ADEME procedure.

# ES — Restricciones antes de la comparación semántica

Añada `compatibility: { activityUnit: "kWh", geography: "FR", year: 2026, scope: "combustion" }` y una lista `candidates`. `screenFactorCandidates` filtra incompatibilidades **declaradas** antes de `matchEmissionFactor`: unidad de actividad y alcance idénticos, territorio explícito en `geographies`, año dentro de los límites inclusivos `validFrom` / `validTo`. Los períodos expresan validez documentada, no solo el año de publicación del factor. Un límite conocido sigue siendo vinculante aunque falte el otro.

Cada candidato requiere un `id` único. Metadatos opcionales: `activityUnit`, `geographies`, `validFrom`, `validTo`, `scope`, `source: { url, date, ... }`. Una incompatibilidad elimina el candidato del campo `candidates` enviado al proveedor. El recibo `compatibility` conserva identificadores y motivos, no valores de factores. Sin candidatos admisibles devuelve `no_candidate` sin llamada y exige revisión humana. Aquí `probability: 1` describe una regla de código, no certeza ambiental. Los demás campos del usuario permanecen: no duplique candidatos rechazados en ellos.

Los datos ausentes no se consideran compatibles: fuerzan `review: true`. Si el modelo devuelve `exact_fit` con metadatos ausentes, el código limita la decisión a `plausible_fit`, conserva la decisión y probabilidad originales en `semanticDecision` y usa `probability: null` para la categoría ajustada. Una confianza alta no elimina la revisión. Se conservan identificadores y textos del usuario; `{ lang: "fr" | "en" | "es" }` solo elige instrucciones generadas. El proveedor clasifica un **conjunto**, sin elegir un factor individual ni calcular emisiones.

```sh
node examples/compatibility.mjs es
```

Es un contrato de adaptación explícito, no un parser ADEME. Sin conversión kg/litro o poder calorífico inferior/superior, inferencia UE→Francia, cálculo de incertidumbre ni garantía de conformidad. Sin `compatibility`, permanece el camino anterior sin reivindicar controles de metadatos. Ejemplos y probabilidades sintéticos. Adapte campos fuente tras revisar documentación y licencia.

La [metodología ADEME](https://bilans-ges.ademe.fr/docutheque/methodologieV5.pdf) exige coherencia del factor con los datos de actividad. La [guía cosmética](https://bilans-ges.ademe.fr/docutheque/Guide-Sectoriel-Cosmetique.ext) precisa la unidad energética; la [guía FNTP](https://base-carbone.ademe.fr/docutheque/Guides%20Sectoriels%20MAJ%20V5/Guides%20sectoriels/guide%20sectoriel%20FNTP.pdf) distingue representatividad temporal, tecnológica y geográfica. La guarda es una interpretación prudente en software, no un procedimiento oficial ADEME.

## Snapshot / Instantané / Instantánea

EN: `activityCase` and `screenFactorCandidates` now return detached snapshots. Changing the caller’s candidates or target while a provider is awaiting cannot alter the screened assessment. `receipt.constraints` preserves the exact unit, geography, year and scope used by the code. It records declared metadata; it does not authenticate ADEME data, select a factor, convert units or prove an emissions calculation. Custom providers remain responsible for evaluating the supplied snapshot correctly.

FR : `activityCase` et `screenFactorCandidates` renvoient désormais des instantanés détachés. Une modification des candidats ou de la cible pendant l’attente fournisseur ne change plus l’évaluation filtrée. `receipt.constraints` conserve exactement l’unité, la géographie, l’année et le périmètre utilisés par le code. Il décrit les métadonnées déclarées ; il n’authentifie pas des données ADEME, ne sélectionne aucun facteur, ne convertit pas d’unité et ne prouve aucun calcul d’émissions. Un fournisseur personnalisé reste responsable d’évaluer correctement l’instantané fourni.

ES: `activityCase` y `screenFactorCandidates` devuelven instantáneas separadas. Cambiar candidatos u objetivo durante la espera del proveedor no altera la evaluación filtrada. `receipt.constraints` conserva unidad, geografía, año y alcance exactos usados por el código. Registra metadatos declarados; no autentica datos ADEME, selecciona factores, convierte unidades ni demuestra cálculos de emisiones. Un proveedor personalizado sigue siendo responsable de evaluar correctamente la instantánea.
