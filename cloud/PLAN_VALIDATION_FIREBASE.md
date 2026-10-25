# ImmOptima — validation Firebase avant activation

Ce plan est **préparatoire**. Aucun test cloud réel n'est considéré comme réussi tant que l'émulateur et deux appareils n'ont pas été testés. Ne jamais importer les données immobilières réelles dans les tests.

## Identité Android
- APK de test conservée : `com.monpatrimoine.app.test132`. Ne pas changer l'ID de cette APK ni désinstaller celle contenant les données.
- Identité candidate de commercialisation : `com.immoptima.app` ; elle nécessite **une nouvelle application Android dans Firebase** et son propre `google-services.json`.
- Vérifier la disponibilité de l'identifiant et la signature Google Play avant publication.
- La signature de test existante ne correspond pas nécessairement à la signature Google Play.

## Scénarios bloquants (Firebase Emulator Suite)
1. Sans connexion : refus de lire, créer, modifier ou supprimer le portefeuille.
2. Utilisateur A : création de `users/A/portfolios/current` avec `revision=1` et `updatedAt=request.time` autorisée.
3. Utilisateur B : lecture et écriture de `users/A/portfolios/current` refusées.
4. Utilisateur A : création initiale à la révision 2 refusée.
5. Utilisateur A : mise à jour révision N vers N+1 autorisée ; N vers N+2 ou N refusée.
6. Toute suppression du portefeuille depuis l'application refusée, en attendant un parcours dédié de suppression de compte.
7. Écriture sans `settings`, `properties`, `loans` ou `assets` refusée.
8. Import local : fichier malformé, trop volumineux, ou incompatible refusé sans écraser les données.
9. Sur second appareil : aucune restauration sans consentement explicite.
10. Conflit entre deux appareils : aucune écriture automatique avant choix explicite.

## Mise en service
- Activer Firebase Authentication Google pour le **nouveau package**, avec empreintes SHA adéquates et client OAuth Android correctement créé.
- Exécuter les tests d'émulateur ; ne déployer les règles qu'après réussite.
- Intégrer un pont Android natif minimal et authentifié ; aucune clé privée dans le dépôt.
- Vérifier la connexion, déconnexion, sauvegarde, récupération, restauration et conflits sur deux appareils.
- Mettre en place export et suppression de compte conforme aux exigences de confidentialité avant publication.

## Limites connues
- `cloud/portfolio-sync-core.js` est actuellement **indépendant** de l'application et de Firebase. Il ne sauvegarde rien à distance.
- `cloud/firestore.rules` est un fichier source **non déployé**.
- Les tests JavaScript et la compilation APK ne remplacent pas les tests de règles avec l'émulateur Firebase.
- La suppression de compte n'est pas implémentée : ne pas lancer de comptes clients réels avant sa réalisation.
