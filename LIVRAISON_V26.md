# ImmOptima — V26 personnelle de test

Deux modules ajoutés dans Biens et dans les actions de chaque logement :

- Dossier logement : identité bailleur/locataire, pièces déclarées disponibles/à vérifier/sans objet, préparation de l'inventaire mobilier et notes. Aucun fichier de diagnostic n'est attaché ni produit automatiquement. Aucun agenda ni rubrique de règles locales n'est ajouté.
- Loyers / quittances : montant cumulé réellement encaissé par mois et confirmation explicite, historique modifiable, quittance pour paiement intégral, reçu pour paiement partiel, aucune pièce pour zéro paiement, export texte et PDF A4 portrait. Identité conservée dans l'encaissement pour éviter d'utiliser automatiquement un nouveau locataire dans un document historique. Aucun envoi automatique. Aide à la régularisation des provisions ; forfait exclu.

Ces données sont enregistrées avec le bien et incluses dans les sauvegardes existantes. Elles ne modifient pas les loyers contractuels ni les calculs de financement et d'optimisation. Les documents sont à relire avant remise.

Accès personnel gratuit multi-biens, contrôles commerciaux et bouton Retour repris des travaux V24/V25. Le générateur de sources commerciales supprime la dérogation personnelle. L'intégration des achats réels, le provisionnement propriétaire et le déploiement des règles restent des étapes de préparation commerciale distinctes : cet APK est personnel et ne doit pas être distribué comme version commerciale.

Sources contrôlées le 04/11/2026 : Service Public F35247, F33463, F34769, F947. Les modèles restent distincts de la trame de bail nu/meublé.

Tests : `tests/rental-management.cjs`, suites IRL/finances/accès, extension des parcours navigateur et Android (dossier, paiement confirmé, reçu/quittance, impression, rechargement et sauvegarde). Les résultats de compilation et d'émulateur doivent être vérifiés avant remise de l'APK.

## Validation finale

Compilation signée et essais navigateur + Android API 34 réussis : run GitHub 41886348626, source be06752b8a65bc383e82a2da2f5e52093c34fe75. Les règles Firestore ont passé le run d’émulateur 41884846580 ; elles ne sont pas déployées en production par ces tests.

Contrôles réels : génération d’un reçu partiel et d’une quittance, PDF A4 portrait sur une page, conservation du dossier et des encaissements après sauvegarde/import et rechargement, bouton Retour natif, vérifications des fonctions existantes. Données d’essai entièrement fictives. Les fichiers HTML et JavaScript contenus dans l’APK correspondent aux sources vérifiées.

APK personnel livré : ImmOptima-Test-v26.apk, 7 325 022 octets, SHA-256 3e2d97e8a1c2b6444879412ac8b0c29b1ee1447a05456e34eb51284a64fe1aca. Même identifiant Android et certificat persistant que les versions de test précédentes. Le contrôle sur le téléphone de l’utilisateur reste à effectuer.
