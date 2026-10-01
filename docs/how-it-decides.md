# Comment la décision est prise

Classe les facteurs d’émission ADEME candidats pour un libellé d’activité ou de dépense.

Le code normalise la source et applique d’abord le cas déterministe documenté dans `src/index.mjs`. Pour les autres dossiers, Jev choisit la catégorie la plus prudente. Une confiance inférieure à `0.8` marque le résultat pour revue humaine.

Les démonstrations ne contiennent que des probabilités synthétiques. Constituez un corpus français annoté, mesurez les erreurs par catégorie et fixez vos propres seuils avant un usage opérationnel.
