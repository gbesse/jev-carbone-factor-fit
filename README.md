# Jev Carbone Factor Fit

**Classe les facteurs d’émission ADEME candidats pour un libellé d’activité ou de dépense.**

[![Tests](https://github.com/gbesse/jev-carbone-factor-fit/actions/workflows/test.yml/badge.svg)](https://github.com/gbesse/jev-carbone-factor-fit/actions/workflows/test.yml) [MIT](LICENSE) · Node.js 22+ · v0.2.0 · Documentation française

Jev Carbone Factor Fit transforme un rapprochement de facteur carbone sourcé en une catégorie explicite et révisable. Le dépôt sépare les règles vérifiables en code de la comparaison sémantique confiée à Jev.

## Démarrage rapide

```sh
git clone https://github.com/gbesse/jev-carbone-factor-fit.git
cd jev-carbone-factor-fit
npm install
npm run demo
```

Les trois démonstrations utilisent uniquement des données et probabilités synthétiques. Elles n’effectuent aucun appel réseau et ne mesurent pas la qualité réelle de Jev.

## Exemple exécutable

Le scénario principal aboutit à **`correspondance_exacte`**. Une assertion fait échouer la commande si le contrat change. Le code complet se trouve dans [`examples/demo.mjs`](examples/demo.mjs).

```sh
npm run demo:principal
```

### Cas limite déterministe

[`examples/cas-limite.mjs`](examples/cas-limite.mjs) exerce une règle métier avant tout appel sémantique.

```sh
npm run demo:limite
```

Résultat attendu : **`aucun_candidat`**, avec zéro appel Jev.

### Décision incertaine à revoir

`node examples/seuil-confiance.mjs` compare les confiances synthétiques `0.79` et `0.80` : la première exige une revue, la seconde non. / This offline example checks both sides of the human-review threshold. / Este ejemplo sin conexión comprueba ambos lados del umbral de revisión humana.

[`examples/revue-humaine.mjs`](examples/revue-humaine.mjs) simule un dossier incomplet. Une confiance de `0.62` doit produire `review: true` afin que l’incertitude reste visible.

```sh
npm run demo:revue
```

Résultat attendu : **`correspondance_plausible`**, avec `revue humaine : true`. `npm run demo` exécute les trois scénarios.

## Utilisation de la bibliothèque

Importez `matchEmissionFactor` depuis `@gbesse/jev-carbone-factor-fit`. Fournissez `createJevClient()` depuis l’export `./jev`, ou `createFakeProvider()` pour les tests hors ligne.

## Frontière de décision

Classe les facteurs d’émission ADEME candidats pour un libellé d’activité ou de dépense. La sortie sert à ordonner ou préparer une revue humaine. Elle ne constitue ni une décision administrative, ni un avis juridique, médical ou environnemental, ni une garantie d’éligibilité ou de conformité.

Les identifiants, dates, valeurs exactes, calculs, géométries, filtres et cas incontestables restent traités par du code ordinaire. La question et les critères envoyés à Jev sont versionnés dans [`src/index.mjs`](src/index.mjs).

## Source publique

- [API Base Carbone](https://www.data.gouv.fr/dataservices/api-base-carbone)

Conservez l’identifiant amont, l’URL, la date de récupération, le millésime et la licence de chaque donnée. Vérifiez le schéma et les conditions de réutilisation auprès du producteur avant ingestion.

## Appels Jev réels

Les appels réels sont facultatifs et payants. Le client valide le modèle et les probabilités, refuse les redirections, limite les nouvelles tentatives aux erreurs réseau et HTTP 429/529, puis bloque une requête dépassant une estimation prudente de 24 000 jetons.

```sh
TYPESAFE_API_KEY=... node scripts/live-smoke.mjs
```

N’envoyez jamais de secret, de donnée personnelle ni de dossier sensible non expurgé. Calibrez les seuils sur un corpus français annoté avant tout usage opérationnel.

## Parcours comparatif

`npm run demo:parcours` produit un rapport JSON partageable pour **jev-carbone-factor-fit** : le scénario principal et la frontière déterministe, ainsi que la revue humaine. Chaque scénario garde sa sortie propre et échoue si son assertion ne passe plus. Les données et probabilités sont synthétiques ; aucun appel Jev n’est effectué.

Cette vue permet de comparer rapidement les chemins de décision et de choisir quel exemple adapter à vos propres données sourcées.

## Validation

```sh
npm run check
npm run typecheck
npm test
npm run demo
```

La CI exécute ces vérifications sous Node.js 22 et 24.

Projet indépendant, sans affiliation avec TypeSafe AI, data.gouv.fr ni l’administration française. Consultez la [documentation de l’API Jev](https://docs.typesafe.ai/api) et les [limites du modèle](https://docs.typesafe.ai/model-jaggedness/jev-1.13).

## October 2026 improvement · Amélioration d’octobre 2026 · Mejora de octubre de 2026

An unknown decision or a probability/confidence outside [0,1] now raises an error instead of producing a misleading factor match. Run `npm test` offline.

Une décision inconnue ou une probabilité/confiance hors de [0,1] provoque désormais une erreur plutôt qu’un rapprochement trompeur. Lancez `npm test` hors ligne.

Una decisión desconocida o una probabilidad/confianza fuera de [0,1] ahora provoca un error en vez de una correspondencia engañosa. Ejecute `npm test` sin conexión.

## Contrôle d’adoption · Adoption check · Comprobación de adopción

[Français : essayer un cas concret](examples/adoption-check.md) · [English: try a concrete case](examples/adoption-check.md) · [Español: pruebe un caso concreto](examples/adoption-check.md).

## Compatibilité explicite / Explicit compatibility / Compatibilidad explícita

FR : `compatibility` filtre les unités, périmètres, territoires et périodes incompatibles avant tout appel. Des métadonnées manquantes imposent une revue même avec une confiance élevée. [Contrat et exemple](docs/compatibility.md).

EN: `compatibility` filters incompatible units, scopes, geographies and periods before any call. Missing metadata forces review even at high confidence. [Contract and example](docs/compatibility.md).

ES: `compatibility` filtra unidades, alcances, territorios y períodos incompatibles antes de llamar. Metadatos ausentes exigen revisión incluso con confianza alta. [Contrato y ejemplo](docs/compatibility.md).


FR : Une réponse sémantique doit déclarer `type: choice`, exactement les quatre probabilités attendues, finies et comprises entre 0 et 1, une somme à 0,001 près de 1 et un choix de probabilité maximale (ex æquo autorisés). Une distribution invalide échoue au lieu de produire un rapprochement. Cela vérifie le contrat, pas la calibration ni l’exactitude du facteur ; les règles de compatibilité et la revue humaine restent nécessaires.

EN: A semantic answer must declare `type: choice`, exactly the four expected finite probabilities between 0 and 1, a sum within 0.001 of 1, and a highest-probability choice (ties allowed). Invalid distributions fail instead of yielding a match. This checks the contract, not calibration or factor correctness; compatibility rules and human review remain necessary.

ES: La respuesta semántica debe declarar `type: choice`, exactamente las cuatro probabilidades previstas, finitas entre 0 y 1, una suma a menos de 0,001 de 1 y una opción de probabilidad máxima (se permiten empates). Una distribución inválida falla sin producir una correspondencia. Esto valida el contrato, no la calibración ni la exactitud del factor; siguen siendo necesarias las reglas de compatibilidad y la revisión humana.

## Dates de sources / Source dates / Fechas de fuentes

**FR.** Les dates de provenance sont maintenant vérifiées dans le calendrier : `2026-02-30` ne devient plus silencieusement une date de mars. Formats admis : `YYYY-MM-DD` (minuit UTC) ou horodatage ISO avec secondes et fuseau explicite, avec au plus trois décimales de seconde. Une date de dossier invalide arrête le traitement avant Jev. Une date de candidat invalide reste une métadonnée inconnue : elle impose la revue et empêche `exact_fit`, même à confiance maximale. Les textes et métadonnées de l’utilisateur ne sont pas corrigés automatiquement.

**EN.** Provenance dates are calendar-checked: `2026-02-30` no longer silently rolls into March. Accepted forms: `YYYY-MM-DD` (UTC midnight) or an ISO timestamp with seconds and explicit timezone, up to three fractional-second digits. Invalid activity provenance stops before Jev. Invalid candidate dates remain unknown metadata: review is required and `exact_fit` is blocked even at maximum confidence. User text and metadata are not automatically repaired.

**ES.** Se validan fechas de procedencia en el calendario: `2026-02-30` ya no pasa silenciosamente a marzo. Formatos: `YYYY-MM-DD` (medianoche UTC) o fecha y hora ISO con segundos y zona explícita, hasta tres decimales de segundo. Una fecha inválida del registro detiene el proceso antes de Jev. Fechas inválidas de candidatos siguen siendo metadatos desconocidos: exigen revisión e impiden `exact_fit` incluso con confianza máxima. No se reparan automáticamente textos ni metadatos del usuario.
