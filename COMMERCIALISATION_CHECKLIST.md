# ImmOptima — Contrôles avant commercialisation

Statut : préparation technique, **pas encore prêt pour publication publique**.

## Déjà validé
- Compilation, tests JavaScript, signature et dépôt d'APK de test par GitHub Actions.
- Installation Android et affichage du menu de sauvegarde à trois choix confirmés sur téléphone.
- Export visible dans Google Drive confirmé sur téléphone, avec choix explicite du dossier.
- Sauvegarde locale et import JSON disponibles.

## Contrôles bloquants avant publication
- [ ] Vérifier sur appareil l'import d'un fichier de test et la conservation des données existantes en cas de fichier invalide.
- [ ] Vérifier les sauvegardes sur un deuxième appareil et un nouveau téléphone.
- [ ] Vérifier les échecs et annulations du sélecteur Android ; ne jamais afficher un faux succès.
- [ ] Définir et tester une politique de sauvegarde/restauration des données avant mise à jour.
- [ ] Confirmer la conservation du certificat de signature et établir la signature Play Store définitive.
- [ ] Définir la fiche Google Play, les captures d'écran, la catégorie et le support utilisateur.
- [ ] Publier une politique de confidentialité exacte : données immobilières/financières, stockage local, partage volontaire par sélecteur Android, copies privées Google si activées, droits des utilisateurs.
- [ ] Compléter la déclaration « Sécurité des données » et vérifier toutes les autorisations Google utilisées.
- [ ] Définir et tester les limitations gratuites et l'abonnement Premium (Google Play Billing, droit de rétractation/conditions applicables).
- [ ] Effectuer un test fermé avec plusieurs appareils et profils, puis une revue des crashes et de l'accessibilité.

## Important : Google Drive
Le bouton « Sur Google » utilise le sélecteur Android et crée un fichier visible uniquement **après** choix d'un dossier et validation par l'utilisateur. Il ne garantit pas à lui seul que le fichier a été créé : l'utilisateur doit contrôler la présence du fichier dans Drive.

L'option avancée « sauvegarde automatique privée » est distincte : elle utilise l'espace Google Drive `appDataFolder`, non visible dans l'interface Drive. Les données JSON ne sont pas chiffrées de bout en bout par ImmOptima. Ne pas prétendre le contraire.

## Sécurité
- Ne jamais écraser `Mon_Patrimoine_V24_Optimisation_CONTROLEE-3.html`.
- Ne jamais publier de clés, tokens OAuth, certificats privés ou fichiers réels de patrimoine dans GitHub.
- Les données de test doivent être fictives.
- Ne pas considérer une compilation réussie comme une validation fonctionnelle sur Android.
