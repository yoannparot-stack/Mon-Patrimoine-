# V25 — accès personnel et multi-biens

## Travail préparé

- Branche de validation personnelle sans paiement : `IMMOPTIMA_BUILD_CHANNEL=personal-test`.
- Préparation commerciale séparée : `python3 scripts/prepare-commercial.py <dossier_distinct>`. Le générateur supprime les dérogations personnelles du HTML produit et rétablit les mentions de l'offre gratuite.
- Import local, Google Drive, récupération de secours et restauration Firebase : contrôle du nombre de biens avant modification des données et des copies de secours.
- Un bien : autorisé sans abonnement. Plusieurs biens : compte propriétaire ou droit actif vérifié depuis le serveur Android/Firebase. Les informations premium/propriétaire figurant dans une sauvegarde ne confèrent aucun droit.
- Ajout et enregistrement d'un bien : même contrôle.
- Droits liés à l'UID Firebase, réponses corrélées à la demande et au compte courant. Erreur, absence de connexion ou changement de compte : refus conservant les données.
- Version commerciale : verrou d'accès si un patrimoine multi-biens préexiste sans droit vérifié ; export et import d'un patrimoine à un bien restent accessibles. Révalidation périodique pendant l'utilisation, expiration contrôlée sans suppression.
- Document `accountAccess/<UID>` non modifiable depuis l'application. Le serveur Firestore refuse les écritures multi-biens sans droit et refuse la lecture du droit expiré en se basant sur son horloge.
- Le compte propriétaire dispose d'un accès gratuit indépendant d'un abonnement. Il doit être provisionné par un administrateur après vérification de son UID. Aucun email ou UID propriétaire supposé n'a été ajouté au code.

## Vérifications effectuées localement

- `tests/access.cjs` : politique actif/expiré/propriétaire ; quatre voies de restauration ; faux droit inclus au fichier ; préservation des données lors d'un refus ; dérogation personnelle ; un bien ; changement de compte ; défaillance du pont Android.
- `tests/landlord.cjs` : IRL et trames nu/meublé.
- `tests/finance.cjs`, `tests/loan-simulator.cjs` : calculs existants.
- `qa_google_drive_migration.js`, `qa_portfolio_sync.js`, `qa_cloud_sync_gate.js` : sauvegarde et synchronisation.
- Syntaxe JavaScript personnelle et commerciale, syntaxe Python des correctifs ; application locale de l'ensemble des correctifs Android et contrôle `qa_android.js` (12 contrôles statiques).
- Tests d'émulateur Firestore étendus aux droits gratuits, actifs, expirés, malformés, propriétaire et tentatives d'auto-attribution.

## Vérifications et activation restant nécessaires

Les nouveaux tests de navigateur, de règles Firestore et d'APK sur émulateur n'ont pas été exécutés pour cette V25. Le navigateur local ne démarre pas dans cet environnement ; les vérifications Android complètes nécessitent la compilation distante.

Le code n'est pas déployé. Le précédent envoi GitHub a été refusé par le contrôle automatique, faute d'autorisation explicite de publication sur le dépôt public. Aucun nouveau contournement ou envoi n'a été tenté.

Avant activation commerciale : vérifier puis provisionner l'UID du propriétaire ; connecter la mise à jour des droits à des achats/renouvellements/révocations vérifiés côté serveur (le paiement n'est pas encore intégré) ; exécuter les tests de sécurité dans l'émulateur ; déployer les règles après ces validations ; compiler l'APK signé et contrôler le téléphone réel. Ne jamais distribuer la version personnelle comme version commerciale.

Aucun nouveau fichier APK n'est livré comme finalisé à ce stade. La V23 demeure le dernier APK livré.
