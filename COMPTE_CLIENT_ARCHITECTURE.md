# ImmOptima — Compte client et sauvegardes (plan d'implémentation)

## Décision produit
- L'application reste utilisable sans compte, en local.
- Un **compte ImmOptima** (e-mail + authentification sécurisée, éventuellement Google Sign-In) sert à identifier l'utilisateur, à retrouver ses données sur un autre appareil et à associer ses droits Premium.
- La **sauvegarde Google Drive visible** reste une action volontaire et indépendante du compte ImmOptima.
- Ne pas afficher de fausse connexion ni de fausse synchronisation. Tant que le serveur n'existe pas, ne pas activer un écran de connexion client fictif.

## Architecture recommandée (à valider avant déploiement)
1. Fournisseur d'identité managé (ex. Firebase Authentication) avec connexion par e-mail et éventuellement Google. Aucun mot de passe stocké dans la WebView ni dans le dépôt.
2. Base de données par utilisateur (ex. Firestore) avec règles d'accès strictes par UID, contrôles de quota et audit de sécurité. Prévoir les coûts et les limites.
3. Chiffrement TLS en transit et chiffrement côté service au repos ; évaluer un chiffrement applicatif de bout en bout avant toute promesse marketing. Les sauvegardes JSON visibles dans Drive ne sont **pas** chiffrées par ImmOptima actuellement.
4. Stockage local et synchronisation explicitement contrôlée : migrations de schéma, version du patrimoine, journal de modifications, gestion des conflits et mode hors ligne.
5. Au premier lien d'un compte avec un patrimoine local existant : proposer **fusion / conserver local / utiliser cloud** seulement après implémentation et tests complets, avec sauvegarde préalable. Ne jamais écraser silencieusement.
6. Supprimer le compte et exporter les données conformément aux exigences applicables ; journaliser les erreurs sans données financières personnelles.
7. Associer les droits Premium aux achats Google Play Billing vérifiés côté serveur ; ne pas débloquer le Premium à partir d'un simple indicateur local modifiable.

## Conditions préalables à l'APK avec compte opérationnel
- Création d'un projet cloud et configuration de la facturation/quotas par le propriétaire.
- Validation des identifiants de l'application Android définitive, certificat de signature, configuration OAuth et fournisseurs de connexion.
- Déploiement d'un backend et de règles de sécurité avec tests d'isolation intercomptes.
- Politique de confidentialité, suppression du compte, gestion des consentements et vérification RGPD.
- Tests réels : première connexion, déconnexion, changement de téléphone, perte de réseau, récupération, conflit et suppression de compte.

## Plan par étapes
- Phase A (réalisée) : documenter l'architecture, préserver le mode hors ligne et la sauvegarde Google Drive visible, corriger les messages d'accueil.
- Phase B : configurer le fournisseur et le backend, développer le parcours de connexion et de création de compte, tests de sécurité automatisés.
- Phase C : synchronisation avec résolution de conflits, migration des données existantes, tests sur deux appareils.
- Phase D : gestion des abonnements Premium, tests fermés et préparation de l'APK/AAB de publication.

## Limites actuelles
**Aucun compte ImmOptima opérationnel, aucune synchronisation cloud multi-appareils et aucun backend de comptes n'est encore déployé.** Une APK compilée sans ces éléments ne saurait les remplacer. Les éléments nécessitant l'accès au projet cloud du propriétaire ne doivent pas être simulés.
