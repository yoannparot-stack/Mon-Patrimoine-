# ImmOptima — V26 personnelle de test

Deux modules ajoutés dans Biens et dans les actions de chaque logement :

- Dossier logement : identité bailleur/locataire, pièces déclarées disponibles/à vérifier/sans objet, préparation de l'inventaire mobilier et notes. Aucun fichier de diagnostic n'est attaché ni produit automatiquement. Aucun agenda ni rubrique de règles locales n'est ajouté.
- Loyers / quittances : montant cumulé réellement encaissé par mois et confirmation explicite, historique modifiable, quittance pour paiement intégral, reçu pour paiement partiel, aucune pièce pour zéro paiement, export texte et PDF A4 portrait. Identité conservée dans l'encaissement pour éviter d'utiliser automatiquement un nouveau locataire dans un document historique. Aucun envoi automatique. Aide à la régularisation des provisions ; forfait exclu.

Ces données sont enregistrées avec le bien et incluses dans les sauvegardes existantes. Elles ne modifient pas les loyers contractuels ni les calculs de financement et d'optimisation. Les documents sont à relire avant remise.

Accès personnel gratuit multi-biens, contrôles commerciaux et bouton Retour repris des travaux V24/V25. Le générateur de sources commerciales supprime la dérogation personnelle. L'intégration des achats réels, le provisionnement propriétaire et le déploiement des règles restent des étapes de préparation commerciale distinctes : cet APK est personnel et ne doit pas être distribué comme version commerciale.

Sources contrôlées le 04/11/2026 : Service Public F35247, F33463, F34769, F947. Les modèles restent distincts de la trame de bail nu/meublé.

Tests : `tests/rental-management.cjs`, suites IRL/finances/accès, extension des parcours navigateur et Android (dossier, paiement confirmé, reçu/quittance, impression, rechargement et sauvegarde). Les résultats de compilation et d'émulateur doivent être vérifiés avant remise de l'APK.
