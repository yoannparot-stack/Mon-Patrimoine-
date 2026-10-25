# Déploiement du compte ImmOptima — prérequis obligatoires

**Projet Firebase déclaré par le propriétaire : `immoptima-6af3b`. État : non déployé.** Les fichiers de sécurité sont préparatoires ; ils ne créent pas de compte et ne rendent pas l'APK synchronisée.

## Action du propriétaire
Créer un projet Firebase **appartenant à ImmOptima** dans la console Firebase et activer Authentication (e-mail, et éventuellement Google) ainsi que Firestore en mode verrouillé. Configurer les informations de facturation et d'usage du projet selon les besoins. Définir l'identifiant Android final et enregistrer les empreintes SHA-1/SHA-256 du certificat utilisé. Les accès d'administration doivent rester chez le propriétaire ; **ne jamais envoyer de compte administrateur, mot de passe, clé privée ou fichier de compte de service dans ce dépôt ou dans le chat**.

## Travaux techniques restants avant la mise en service
- Associer l'application Android au projet Firebase et intégrer un SDK d'authentification adapté à la WebView ou une interface Android native. Ne pas faire transiter des mots de passe via une interface JS non sécurisée.
- Déployer et tester les règles `cloud/firestore.rules` avec l'émulateur Firebase : propriétaire autorisé, autre utilisateur refusé, utilisateur non connecté refusé.
- Implémenter la création de compte, vérification d'e-mail, réinitialisation de mot de passe, déconnexion et suppression de compte.
- Implémenter la sauvegarde/restauration synchronisée du patrimoine avec révisions, conflits, migrations et récupération hors ligne. Firestore limite la taille des documents : prévoir une stratégie de découpage ou un autre stockage avant production.
- Vérifier le RGPD, les données collectées, la durée de conservation, les exports et la suppression des données.
- Tester sur deux téléphones réels et avec les identifiants de signature Android définitifs.

## Critère de livraison
Ne pas annoncer « compte ImmOptima opérationnel » tant qu'une inscription réelle, une connexion, une déconnexion et une récupération du patrimoine sur un second appareil n'ont pas été testées avec succès.

## Projet cible
- ID de projet communiqué : `immoptima-6af3b`.
- Cet identifiant n'est pas un secret ; il ne confirme ni l'activation d'Authentication, ni la création de Firestore, ni l'association de l'application Android.
- Pour associer l'application Android, enregistrer son nom de package définitif et fournir les fichiers de configuration via un canal approprié. Ne jamais publier de clés de compte de service.
