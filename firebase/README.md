# ImmOptima — service de comptes à configurer

Aucun service cloud n'est créé par le simple dépôt de ces fichiers. Le projet Firebase doit être créé et possédé par l'éditeur d'ImmOptima.

## Mise en route
1. Créer un projet Firebase ImmOptima, vérifier région, quotas, facturation et propriété du projet.
2. Activer Firebase Authentication (e-mail/mot de passe et/ou connexion Google selon validation produit).
3. Créer Cloud Firestore et **déployer** `firestore.rules` avant tout stockage de patrimoine.
4. Configurer le projet Android de production et les empreintes SHA du certificat de signature ; éviter d'utiliser l'identifiant de test comme application définitive.
5. Ajouter les paramètres publics de projet dans une configuration de build dédiée ; ne jamais mettre de clé de service, jeton d'accès, mot de passe ou clé privée dans GitHub.
6. Exécuter des tests d'accès intercomptes avec Firebase Emulator Suite, puis des tests réels de récupération sur deux appareils.
7. Développer et valider la migration des patrimoines locaux vers le cloud avec copie préalable, gestion de conflits et consentement.
8. Prévoir la suppression des comptes et données, l'export et la politique de confidentialité.

## Sécurité
- Les règles Firestore proposées refusent tout par défaut et autorisent seulement l'accès au document du propriétaire authentifié. Elles ne sont **pas déployées**.
- Les règles ne remplacent pas les tests, les contrôles de taille, les quotas, la validation métier ni les mesures RGPD.
- La sauvegarde Google Drive visible reste facultative et indépendante.
- Ne jamais présenter une APK sans backend et authentification configurés comme une APK avec comptes fonctionnels.
