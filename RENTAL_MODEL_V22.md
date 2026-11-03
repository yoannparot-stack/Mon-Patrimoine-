# ImmOptima V22 — repères nus et simulation meublée

## Comportement livré

« Rechercher » dans la comparaison d’un bien et « Analyser les loyers » utilisent les bases publiques ANIL/OLL. Ils ne déclenchent plus l’appel du fournisseur d’annonces non activé. L’accès fournisseur facultatif reste disponible dans les sources, pour conserver les fonctionnalités existantes. Aucun abonnement n’est engagé et aucun quota par compte n’est ajouté aux repères publics. Les services publics peuvent connaître des indisponibilités et des limites de débit : aucune disponibilité illimitée n’est promise.

Priorité du repère nu : références individuelles comparables, puis secteur OLL validé quand l’adresse est suffisamment localisée, puis projection ANIL communale exploitable, puis OLL de l’agglomération. La projection OLL emploie les quartiles et la médiane en €/m², multipliés par la surface ; elle n’est pas la distribution observée des loyers mensuels pour cette surface exacte. Les seuils applicatifs sont 30 observations, millésime datant de deux ans au plus, et surface à ±30 % de la surface moyenne du segment. Ce dernier seuil est une précaution de simulation, pas une validation statistique. La projection ANIL conserve sa précaution ±25 % du bien type, son contrôle R²/effectif et la déduction de charges explicites. Ses bornes prédictives ne sont pas des quartiles.

Les références meublées comparables existantes restent prioritaires. À défaut, le scénario meublé applique +10 % au repère nu HC, avec un libellé explicite de simulation et une référence à la publication ANIL du 28 octobre 2026. Le pourcentage personnel peut être saisi entre 0 et 50 % ; un champ vide rétablit 10 %. Cette plage de saisie n’est pas une plage d’écarts de marché validés. Une cible personnelle meublée reste prioritaire. Les références meublées CC sans charges détaillées restent distinctes et ne sont pas transformées en cible HC.

Source de l’hypothèse nationale : https://www.anil.org/actualites-evenements/details/nouvelle-etude-de-lanil-lessor-de-la-location-meublee-de-longue-duree-un-facteur-de-recomposition-du-parc-locatif-prive/

Le quartier peut affiner le repère nu. Il ne modifie pas à lui seul les 10 % de majoration : aucun coefficient meublé local n’est validé dans cette version. Le zonage « tendu » et les plafonds légaux ne sont pas utilisés comme des coefficients de marché. L’adresse ne permet pas actuellement une couverture quartier par quartier dans toute la France.

## Affinement territorial réellement embarqué

`rental-local-data.js` inclut les statistiques OLL Tours 2025 de trois secteurs : centre historique de Tours, secteur urbain valorisé et secteur métropolitain abordable. Il contient 18 segments maison/appartement et pièces, et 120 géométries IRIS couvrant les 22 communes du zonage publié. Les géométries ne sont pas des données de clients.

Le géocodeur existant doit retourner une adresse de type `housenumber`, avec un score d’au moins 0,8. Le point doit être dans une géométrie IRIS du code commune attendu et correspondre à un seul secteur OLL. Les IRIS sans correspondance, les communes hors couverture et les adresses approximatives déclenchent le repli communal/agglomération. Les noms de secteur OLL ne sont pas assimilés à des quartiers administratifs ou à une preuve de tension du meublé.

Sources :
- ANIL / Observatoire des loyers du parc privé de la métropole tourangelle, données 2025 : https://www.data.gouv.fr/datasets/resultats-des-observatoires-locaux-des-loyers-par-agglomeration ; archive `https://www.observatoires-des-loyers.org/datagouv/2025/Base_OP_2025_L3700.zip` contenant `Base_OP_2025_L3700.csv` et `L3700Zonage2025.csv`.
- Contours IRIS IGN/INSEE : https://www.data.gouv.fr/datasets/contours-iris-r-2 ; WFS `https://data.geopf.fr/wfs/ows`, couche `STATISTICALUNITS.IRIS:contours_iris`, filtre sur les codes des 22 communes, EPSG:4326, COUNT=1000. Réponse complète : 120 éléments sur 120, HTTP 200 le 03/11/2026, 250287 octets. Coordonnées arrondies à six décimales dans le fichier embarqué.
- Jeux ANIL/OLL et IGN sous Licence Ouverte 2.0, attributions conservées. Licence IGN contrôlée via les métadonnées officielles le 03/11/2026.
- Interprétation des secteurs : https://www.observatoires-des-loyers.org/connaitre-les-loyers/carte-des-niveaux-de-loyers/agglomeration-de-tours et https://www.atu37.fr/ressources/observatoires/observatoire-local-des-loyers/.

Le millésime embarqué est visible dans les sources. Une nouvelle publication nécessite une mise à jour du fichier ; il n’est pas annoncé comme un flux d’annonces du jour. Les métadonnées et tables nationales ANIL/OLL restent recherchées via leurs API existantes. La requête nationale OLL filtrée Tours/Appartement/Appart 1P a été vérifiée en direct : 1 ligne, 2776 observations, médiane 15 €/m², surface moyenne 27 m².

## Vérification et limites

Les tests calculent sur un patrimoine fictif et les statistiques publiques : nu 415 € HC, meublé simulé 455 € HC à +10 %, 500 € à +20 % ; gain après 15 € de surcoûts et un loyer actuel de 300 € : 140 € à +10 %. Trois secteurs, saisie et restauration du pourcentage, données anciennes/incomplètes, priorité des références, DPE F/G, charges, protection des valeurs réelles et allers-retours JSON sont contrôlés.

Les tests du géocodage d’une adresse précise ont été refusés par le contrôle automatique de l’environnement. Les tests de sélection des secteurs emploient des points intérieurs calculés dans les géométries publiques, sans envoi d’adresse de client. Le géocodage complet d’une adresse réelle reste à valider sur téléphone.

Les règles de bail, les plafonds éventuels, la conformité du mobilier, les coûts et la fiscalité restent à vérifier pour décider d’une mise en location. Le loyer réel et les crédits ne sont jamais remplacés par la simulation.
