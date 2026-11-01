# Collecte locative Nu / Meublé — V19

**Orientation du 1er novembre 2026 après la V19 :** recherche d’une collecte sans fournisseur payant. Un moteur indépendant, ses tests et le contrôle réel des premières sources sont disponibles dans [`rental-public/README.md`](rental-public/README.md). Aucune source gratuite client n’est encore activée ; ce moteur n’est pas encore raccordé au bouton Android. Les instructions Yanport ci-dessous décrivent le connecteur V19 conservé et ne constituent pas une demande de souscription.

## État et périmètre

Le code de collecte est intégré à l’APK et le service Firebase est fourni dans `functions/`. **La collecte réelle n’est pas activée tant qu’un accès fournisseur Yanport autorisé et le service déployé ne sont pas disponibles.** L’APK signale cet état et ne simule pas des annonces réelles. Les bases publiques ANIL/OLL et les références personnelles restent utilisables.

Yanport a été retenu pour son API de biens et d’annonces ; aucune promesse de consulter « tous les sites » n’est faite. Les sites effectivement couverts, les droits de restitution, de conservation pendant 24 h, de sauvegarde et d’export des références doivent être inclus dans le contrat fournisseur avant activation. Aucun compte fournisseur n’a été créé, aucun abonnement souscrit ni déploiement facturable lancé.

Sources techniques : [OpenAPI officielle](https://github.com/yanport/yanport-api-doc), [offre API Yanport](https://www.yanport.com/solutions/fournisseur-donnees-immobilieres/api), [fonctions HTTP Firebase](https://firebase.google.com/docs/functions/http-events), [secrets Firebase](https://firebase.google.com/docs/functions/config-env).

## Parcours utilisateur

Dans Plus → Optimisation, « Analyser les loyers » conserve la recherche publique et tente la collecte Nu / Meublé pour chaque logement locatif. Dans une fiche → Sources et références, « Collecter Nu / Meublé » permet de réactualiser ce seul logement. Un compte ImmOptima connecté et un accès activé sont nécessaires. Les états déconnecté, non configuré, non autorisé, quota, fournisseur indisponible et résultat expiré sont explicites.

Les annonces sont affichées avec lien, date, surface, loyer HC et origine. Les références personnelles restent séparées et modifiables. Les résultats automatiques ne sont jamais présentés comme « vérifiés par vous ». Ni le loyer actuel, ni les prêts, ni les dépenses enregistrées ne sont remplacés.

## Règles du rapprochement

- Requêtes fournisseur séparées Nu / Meublé, mobilier explicitement vrai/faux, location active, appartement ou maison.
- Même commune et code postal, localisation exploitable à moins de 3 km, même nombre de pièces et surface ±25 %.
- Première publication depuis moins de 90 jours. La période affichée correspond aux dates des annonces retenues, pas à une période de baux signés.
- Durée longue explicitement identifiable dans la description. Rejet conservateur de saisonnier, tourisme, courte durée, colocation, mobilité, bail étudiant et durée non confirmée. Cette règle peut écarter de vraies locations annuelles mal documentées.
- HC explicite ou CC moins charges explicitement chiffrées ; pas de charges manquantes assimilées à zéro. Rejet des montants incohérents.
- Déduplication par identifiant, identifiant agrégé, URL et empreinte conservatrice du logement. Les rapprochements par empreinte peuvent fusionner des annonces proches ; ils ne garantissent pas une absence absolue de doublons.
- Exclusion des loyers/m² trop atypiques : écart à la médiane supérieur au maximum de 30 % de cette médiane et trois écarts absolus médians.
- Au moins 3 logements distincts pour proposer une cible. Cible = médiane des HC/m² × surface du logement, arrondie à 5 €. Dans le comparatif, la fourchette affiche les bornes des références retenues ; l’API fournit aussi les quartiles à des fins de contrôle. Ce sont des loyers annoncés et un indicateur de marché, sans garantie de location ni autorisation d’augmenter un bail.
- Échantillon plafonné à 100 résultats par mode, triés par proximité dans le code postal demandé ; mention explicite si tronqué. Pas de pagination payante sans limite ni d’élargissement silencieux aux communes voisines.
- Validité d’une collecte : 24 h, même compte et mêmes caractéristiques. Un échec ne remplace pas les derniers résultats ; ils restent utilisables jusqu’à leur échéance, puis n’alimentent plus la cible. Les références personnelles gardent leur règle existante de 180 jours.

Les hypothèses de vacance, mobilier, travaux et surcoûts restent modifiables. Les gains positifs exclus par DPE F/G et les résidences principales suivent les règles existantes. Le traitement fiscal n’est pas ajouté à la simulation.

## Activation par le propriétaire du projet

Le déploiement doit être réalisé dans le projet Firebase existant **immoptima-6af3b**, par son administrateur, avec la facturation Cloud Functions et les autorisations appropriées. Le fournisseur facture ses appels selon son contrat. Ne jamais saisir le JWT dans le code, l’APK, un fichier versionné ou une conversation.

1. Obtenir auprès de Yanport le droit d’utiliser `/properties` pour Nu / Meublé, les sites couverts, le schéma réel et les conditions de redistribution/conservation.
2. Dans `functions/`, exécuter `npm ci` puis `npm test` avec Node 22.
3. À la racine : `firebase login`, puis `firebase functions:secrets:set YANPORT_TOKEN --project immoptima-6af3b`. Saisir le JWT uniquement dans l’invite sécurisée de la CLI.
4. Déployer uniquement cette fonction : `firebase deploy --only functions:rental --project immoptima-6af3b`. Ne pas modifier les autres services ou règles sans besoin.
5. Depuis la console administrateur Firestore, créer `rentalService/config` avec `enabled: false`, `dailyProviderCalls: 20`, `dailyCollectionsPerUser: 2`. Les quotas sont conservateurs : chaque collecte réserve au maximum 4 appels fournisseur ; aucune remise de quota en cas de réponse vide ou d’échec.
6. Créer `rentalAccess/UID_DU_COMPTE_TEST` avec `enabled: true`. Ces collections sont interdites aux SDK clients par les règles actuelles ; seul l’administrateur doit les écrire. Ne jamais accorder des droits clients sur celles-ci.
7. Après validation du contrat, passer `rentalService/config.enabled` à `true` pour l’essai du seul compte autorisé. L’endpoint attendu, fixé dans Android, est `https://europe-west1-immoptima-6af3b.cloudfunctions.net/rentalComparables`.
8. Faire une collecte réelle sur une adresse test Nu et Meublé, comparer chaque champ reçu avec les annonces, vérifier les exclusions et les prélèvements fournisseur. Valider en particulier la sérialisation des filtres GET documentés (`furnished`, `zipCodes`, `marketingTypes`, `roomCounts`, etc.). Une évolution ou particularité du schéma fournisseur doit être corrigée dans l’adaptateur avant ouverture aux clients.
9. Vérifier révocation de connexion, changement de compte, compte sans droit, plafonds et extinction du service. En cas de problème, remettre `enabled: false` ; l’APK conserve les autres fonctions.
10. Étendre les comptes autorisés et budgets seulement après cet essai. Configurer une politique TTL Firestore sur `rentalQuota.expiresAt` pour supprimer les compteurs anciens ; ils ne contiennent ni annonces ni adresse. Envisager App Check/attestation et des alertes budgétaires pour une ouverture publique ; cette V19 exige déjà un compte et une autorisation administrateur explicite.

## Données et sécurité

Seuls coordonnées, commune, code postal, surface, pièces et type sont envoyés au service. Les détenteurs, montants de prêts, revenus et loyers du client ne le sont pas. Le jeton Firebase est utilisé uniquement dans le transport HTTPS natif ; le JWT fournisseur reste dans Secret Manager. Aucune URL serveur configurable depuis JavaScript ; redirections refusées, délais et tailles de réponses limités.

Le serveur vérifie le jeton Firebase et sa révocation, l’accès nominatif, un verrou par compte et des quotas transactionnels par compte/jour et globaux/jour. Il ne journalise ni annonces, ni adresses, ni jetons et ne stocke que des compteurs administratifs. Android conserve les références dans les données locales de l’application et leur sauvegarde habituelle : les droits fournisseur doivent donc couvrir ce parcours. Les références expirées cessent d’être utilisées mais restent conservées localement jusqu’à remplacement ou suppression des données.

## Vérifications et limites

Les tests automatisés couvrent l’adaptateur sur réponses de test conformes au schéma officiel, les calculs, les filtres, les erreurs fournisseur, les limites, les contrôles d’accès et l’intégration JS. Ils ne prouvent ni les droits du contrat, ni la disponibilité d’annonces réelles, ni leur couverture exhaustive. L’essai fournisseur réel, le déploiement et les autorisations de production restent nécessaires avant de présenter la collecte comme active. Aucune annonce de test ne doit être distribuée comme une annonce réellement collectée.
