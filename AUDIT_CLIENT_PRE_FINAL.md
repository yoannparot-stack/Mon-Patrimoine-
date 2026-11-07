# ImmOptima — regard client avant la prochaine APK

Revue du 7 novembre 2026. Il s’agit d’une évaluation produit fondée sur des parcours fictifs et des vérifications de rendu, pas d’une étude de clients payants ni d’une mesure de conversion commerciale.

## Intégrations approuvées

- Position du loyer : pouce vert et « Au-dessus du repère » à la place d’un écart brut négatif dans la liste. La référence reste indicative et liée au scénario Nu / Meublé affiché. Les calculs et loyers enregistrés ne sont pas modifiés. Les scénarios sans gain net affichent « Aucun gain simulé » sans les présenter comme un revenu positif.
- Correction : accès au champ précis, explication et encadré rouge ; bouton « Enregistrer la correction » ; après un enregistrement réussi, « Revenir à mon analyse » actualise seulement le bien concerné. Une information encore manquante est signalée avant toute recherche. Le contexte est temporaire, lié au formulaire et au compte ; il n’est pas exporté dans les sauvegardes.
- Estimation indisponible : explication en tête du comparatif, distinguant information à saisir, recherche indisponible et références insuffisamment comparables. Une recherche défaillante n’est pas annoncée comme réussie.
- Sources : résumé avec origine, millésime, date de recherche et limite principale. Méthode complète repliée ; aucun bouton fournisseur non activé proposé par défaut. Les jeux d’essai qui vérifient encore le transport fournisseur l’activent explicitement dans leur seul environnement fictif.

## Parcours simulés

1. Portefeuille vide : accueil, démarrage guidé, nom et détenteur, enregistrement d’un premier brouillon. Les résultats inconnus restent « À compléter ».
2. Bien existant incomplet : clic sur sa surface manquante, saisie de 24 m², enregistrement, retour à l’analyse ; exactement un bien actualisé. Le loyer actuel est préservé.
3. Loyer supérieur au repère : badge lisible, distinction du scénario, fourchette et sources consultables, aucune fausse perte mensuelle annoncée dans le résumé.
4. Références non comparables : cause visible immédiatement, pas de formulaire de bien ouvert à tort, méthode repliée et services externes inactifs absents.
5. Régressions : calculs, prêts, accès personnel et commercial, brouillons, sauvegardes/imports, outils locatifs, documents, banque et navigation existants.

Les réponses utilisées pour le nouveau parcours d’actualisation sont fictives : ce contrôle prouve le parcours et son ciblage, pas une nouvelle couverture réelle des annonces ou des loyers locaux.

## Constat client

| Sujet | Évaluation |
|---|---|
| Compréhension | Les actions précises, le guidage et les données manquantes explicites facilitent la progression. |
| Utilité | La consolidation du patrimoine, les crédits, le dossier bancaire et les documents locatifs forment une proposition cohérente pour plusieurs biens. |
| Friction principale | Une fiche complète exige encore beaucoup de saisie avant d’obtenir toutes les analyses ; le client doit pouvoir avancer sans disposer immédiatement de tous ses documents. |
| Première impression | Après un brouillon ne contenant que nom et détenteur, « Votre bien commence à parler » et « Voir mes résultats » coexistent avec deux indicateurs « À compléter ». Le titre promet plus que le contenu disponible. |
| Densité d’Optimisation | Fourchette, cible, écart, surcoûts, mobilier, vacance et retour sur investissement peuvent dépasser le besoin d’un bailleur venu uniquement vérifier son loyer. |
| Valeur payante | Pour un seul bien stable, l’abonnement peut sembler facultatif. Pour plusieurs biens et un usage récurrent des documents et du suivi, le gain de temps paraît plus défendable ; cela reste une hypothèse à confronter à des utilisateurs extérieurs. |

## Deux finitions proposées, non intégrées sans retour utilisateur

1. Adapter le titre et l’action du premier bilan à ce qui est réellement disponible : « Fiche enregistrée » / « Compléter pour obtenir mes premiers résultats » lorsqu’aucun indicateur utile n’est encore calculable.
2. Présenter le simple avis locatif en premier et ranger budget, surcoûts et retour sur investissement dans un bloc facultatif replié.

La finalisation de l’usage personnel et la commercialisation sont deux jalons. Les contrôles d’accès multi-biens existent ; le véritable parcours d’achat/renouvellement/résiliation n’est pas encore intégré et validé. Cette revue ne doit pas être présentée comme une validation des paiements de production.

## Preuves techniques

- Source fonctionnelle : `ed5432930585b8bff4917cfcfbb1c2d89db5be89` ; vérifications complètes réussies : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/42397317865 (construction, audit cloud, régressions Android API 34 et 36).
- Derniers ajustements de couleur et de texte : `e8a9d87a4caf672365ca13bbd745026c80060dbf` ; deux suites navigateur réussies, aucune erreur JavaScript, captures inspectées : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/42397671280 .
- Le nouveau parcours ciblé de correction / retour est couvert dans le navigateur mobile. Les suites Android citées ci-dessus couvrent les régressions existantes ; elles ne constituent pas une étude d’utilisabilité sur téléphones physiques.
- Aucun nouvel APK n’a été livré pendant cette revue. La génération destinée à l’utilisateur vient après son retour sur cette évaluation, conformément à sa demande.
