# ImmOptima — configuration Firebase Android (branche isolée)

Projet Firebase : `immoptima-6af3b`.

## Unique opération Firebase requise du propriétaire
Dans Firebase > Paramètres du projet > Vos applications > Ajouter une application Android :

1. Identifiant du package : **`com.immoptima.app`** (respecter exactement la casse).
2. Ajouter l'empreinte SHA-1 de la signature de test : `F7:B9:DC:CA:F0:74:1F:D7:CE:D1:D3:D6:94:F3:4C:8A:50:EE:72:28`.
3. Ajouter l'empreinte SHA-256 : `FE:D1:54:B7:A4:20:12:30:DA:BE:6C:08:D1:36:5D:47:1D:62:46:4D:BB:C5:96:CA:37:C3:83:47:9C:BB:EE:35`.
4. Télécharger **le nouveau** `google-services.json`, puis le transmettre dans la conversation (pas de clé de compte de service).
5. Si Firebase affiche encore un conflit d'empreinte, ne rien supprimer : transmettre uniquement le message d'erreur.

Ne pas modifier ni supprimer l'application Firebase `com.monpatrimoine.app.test132`. Ne pas désinstaller l'APK existante. Le nouveau package possède un stockage local Android distinct : sauvegarder le patrimoine dans l'ancienne application et tester l'import avant toute migration.

## Ce qui reste à réaliser côté code
- Intégration SDK Firebase Authentication Android et connexion Google native, sans exposer les jetons au JavaScript non fiable.
- Configuration Gradle Firebase avec le fichier correspondant **au nouveau package**.
- Firestore : tester les règles avec l'émulateur, déployer avec l'autorisation du propriétaire, puis vérifier l'isolation des comptes.
- Ajouter un écran de consentement à la récupération, un traitement des conflits et une déconnexion.
- Tests réels sur deux appareils, y compris le fonctionnement hors ligne et les sauvegardes existantes.

## Contrôle de livraison
Aucun compte client ne doit être annoncé fonctionnel avant validation de l'authentification, du stockage, de la restauration et de la déconnexion sur appareils réels.
