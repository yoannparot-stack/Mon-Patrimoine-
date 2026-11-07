# ImmOptima V31 — saisie accompagnée et bilan simplifié

Cette livraison regroupe la maquette A « Mon bilan », les quatre améliorations validées et les accès directs aux informations manquantes demandés pendant l’intégration. La V24 de référence et la branche principale restent intactes.

## Intégrations

| Élément retenu | Comportement |
|---|---|
| Mon bilan, maquette A | Remplace Direction patrimoniale dans Plus → Analyses avancées. Trois repères : réserve en mois de crédits, couverture des crédits, dette / valeur des biens ; une action utile ; calculs repliés. Le score sur 10 et les tableaux répétés du Dashboard sont retirés. |
| Recherche de biens | Visible à partir de cinq biens, par nom ou adresse, sans distinction de casse ou d’accent. Compteur, résultat vide et effacement. Les actions restent rattachées au bien filtré. |
| Bilan après import | Nombre de biens, crédits et autres actifs réellement restaurés ; nombre de biens à compléter ; raccourci vers le premier champ utile. La copie locale du patrimoine précédent et les autorisations d’import restent en place. |
| Reprise d’une saisie interrompue | Brouillons locaux séparés du patrimoine enregistré, pour les formulaires de bien et crédit. Reprise explicite, étape guidée conservée. Effacement après enregistrement réussi ; suppression possible. Un brouillon d’une fiche modifiée entre-temps ne remplace pas les nouvelles données. |
| Montants compréhensibles | Unités visibles €/an, €/mois, assurance comprise, hors charges ; exemples courts repliables. Aucun changement de l’unité stockée ou des calculs existants. |
| Informations manquantes cliquables | Raccourcis sur Mon bilan, cartes et fiches de biens, résumé bancaire, alerte du Dashboard, état des analyses et résultat d’enregistrement guidé. Les réserves manquantes et crédits non rattachés ouvrent également le formulaire utile. La destination correspond au bien/crédit et au champ manquant. Encadré rouge, explication locale et disparition du repère après correction valide. |

## Précautions de calcul et de données

- Les informations absentes ne deviennent pas automatiquement des zéros dans Mon bilan. Une valeur manquante affiche « À compléter ».
- « Sans crédit » exige une situation renseignée, et ne se déduit pas simplement d’une liste de crédits vide.
- Les crédits non rattachés empêchent une conclusion immobilière et orientent vers Financements.
- La réserve utilise uniquement Livret A, Épargne et Compte bancaire renseignés ; elle est exprimée en mensualités de crédit, pas en mois de toutes les dépenses.
- La couverture reprend les loyers hors charges et dépenses saisis, avant fiscalité personnelle, sans scénario de vacance. Le détail du calcul est accessible.
- Le ratio dette / valeur porte sur les crédits rattachés aux biens ; il ne mesure pas la capacité d’emprunt du foyer.
- Les brouillons ne sont ni exportés comme biens, ni inclus dans les indicateurs, ni envoyés à la synchronisation du patrimoine. Ils sont isolés par compte/local et ne contiennent pas d’identifiants d’authentification.
- Les règles d’abonnement commercial ne sont pas assouplies : un import multi-biens nécessite toujours un accès valide. Le canal personnel de test reste gratuit et débloqué.

## Vérifications de livraison

Contrôles effectués :

- Parcours existants : calculs patrimoniaux et de crédit, centimes, surfaces, sauvegardes et imports, documents locatifs, simulateur, onglets, aides et bouton Retour.
- Mon bilan : calculs connus, données manquantes, absence confirmée de crédit, épargne explicitement à zéro, périmètre des crédits, affichage sur cinq largeurs et aide repliable.
- Complétion : redirection vers le bon champ et le bon crédit même si un autre bien présente d’autres informations manquantes ; rouge conservé au focus et retiré après correction.
- Brouillons : saisie séparée du patrimoine, reprise après rechargement à la bonne étape, isolation par compte, fiche modifiée entre-temps, stockage plein, nettoyage après enregistrement réussi et refus d’accès sans écrasement d’une autre fiche.
- Recherche : accents, casse, absence de résultat, effacement, ouverture du bon bien et absence de modification des données financières.
- Import : onze biens fictifs, compte exact des fiches à compléter, accès à la surface manquante, remise à zéro de la recherche, annulation et fichier invalide sans remplacement du patrimoine.
- Lisibilité : unités, exemples repliables, suppression du bouton d’enregistrement en double dans le guide, bandeau de reprise adapté aux écrans courts, une seule commande d’effacement de la recherche.

## Résultat final

- Source de l’APK : `2fd5efdbd6c4ace3a6e2378278478747ab68ff00`.
- [Compilation et vérifications complètes réussies](https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/42381371338) : construction APK, audit des règles cloud et test Android.
- Deux suites navigateur réussies ; cinq largeurs (320, 360, 393, 430, 800 px), plus les écrans courts du Dashboard ; aucune erreur JavaScript détectée.
- APK installé sur émulateur Android API 34, 1080 × 2400 : appuis, navigation, Retour natif, formulaires, simulateur, documents locatifs, persistance, reprise après rechargement, Mon bilan, recherche, accès au champ rouge et bilan d’import vérifiés.
- Le test Android et le navigateur utilisent exclusivement un portefeuille fictif. Les règles cloud ont été vérifiées sur émulateurs, sans écriture en production. Ces contrôles ne constituent pas un essai sur tous les téléphones physiques ni une mise en service de la facturation commerciale.
- Package `com.immoptima.app`, versionCode **31**, canal personnel gratuit.
- APK : **7 358 146 octets**, SHA-256 `998659fa2d3c4851f9bd1c0675687628fda4fc285b1e5c2e5e01c4f4f55113e1`.
- Signature persistante, certificat SHA-256 `fed154b7a4201230dabe6c08d1365d471d62464dbbc596ca37c383479cbbee35`.
- Les six modules concernés ont été comparés aux fichiers présents dans l’APK : correspondance octet par octet confirmée. Le chargement du nouveau module et le canal personnel ont également été vérifiés dans le HTML embarqué.

La V31 regroupe les évolutions de V30. L’installation préalable de V30 n’est pas nécessaire.
