# ImmOptima — audit de l'étape 2 : synchronisation automatique

## Architecture préparée
- Application Android `com.immoptima.app`, Google Firebase Authentication.
- Firestore `users/{uid}/portfolios/current` avec revision incrémentale, horodatage serveur et transaction atomique.
- Chaque modification locale conserve d'abord le patrimoine sur le téléphone puis marque une file de synchronisation. Écriture cloud temporisée de 1,5 s.
- Mode hors ligne : la copie locale reste utilisable ; en cas d'erreur cloud, aucune donnée locale n'est supprimée.
- Lecture distante via serveur uniquement, avec vérification de l'UID lié à la requête.
- Refus des écrasements silencieux : confirmation obligatoire avant remplacement local, sauvegarde `immoptima_pre_cloud_restore_v1`.
- Protection contre l'écriture obsolète par revision, compte différent, et changements locaux pendant l'envoi.
- Limite de 850 ko par patrimoine (document Firestore 1 Mio) ; découpage requis avant montée en charge.

## Verrou de sécurité — non négociable
`IMMOPTIMA_CLOUD_WRITE_ENABLED=false` dans `index.html`.
**La synchronisation réelle reste désactivée.** Les règles `cloud/firestore.rules` n'ont pas été déployées sur le projet Firebase de production par ce dépôt. Les tests émulateur locaux ne déploient rien.

## Avant d'activer
1. Faire réussir les tests de règles Firestore sur l'émulateur.
2. Déployer `cloud/firestore.rules` sur le projet `immoptima-6af3b` depuis un compte administrateur du propriétaire (jamais de clé de service dans le dépôt).
3. Vérifier dans la console Firebase les règles réellement publiées et leur version.
4. Effectuer un test avec **deux comptes distincts** (accès croisé refusé), puis deux appareils avec le même compte.
5. Tester : nouveau téléphone vide, portefeuille déjà présent, conflit de révision, déconnexion, hors ligne, reconnexion, données volumineuses, changement de compte, restauration annulée, édition pendant transfert.
6. Valider la migration des données existantes avant d'autoriser l'envoi automatique, et proposer une résolution explicite des conflits (aucun écrasement).
7. Une fois validé, activer la synchronisation dans une nouvelle APK de test, pas dans l'application stable.

## Limites identifiées
- Aucune preuve de synchronisation de bout en bout sur deux appareils.
- La gestion interactive des conflits reste à compléter : actuellement l'écriture se suspend en cas de conflit.
- Les données personnelles restent non chiffrées de bout en bout ; Firebase chiffre en transit et au repos, mais ce n'est pas du chiffrement E2E.
- Le stockage en document unique ne convient pas à des patrimoines volumineux.
- La suppression de compte et de toutes les données associées doit être implémentée avant commercialisation.
- Les règles doivent être déployées et contrôlées en production avant tout upload.
