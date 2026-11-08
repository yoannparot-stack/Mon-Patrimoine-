# Épargne — modifications préparées le 8 novembre 2026

## Présentation

Titre Épargne, bouton Ajouter, total déclaré en tête et cartes de comptes/placements : nom, catégorie, établissement, valeur, note repliable, actions Modifier et Supprimer entièrement accessibles. La table nécessitant un défilement horizontal est remplacée. Boutons de 44 px minimum ; libellés longs pouvant revenir à la ligne.

Autres dettes est un bloc replié, avec résumé du capital déclaré, note facultative et explication contre le double comptage des crédits immobiliers. Les données et identifiants existants sont conservés.

## Fiabilité

Une valeur absente est distinguée de zéro dans le total de l’écran. Le total et le nombre de comptes sont calculés depuis les actifs enregistrés. Les valeurs restent déclaratives, sans cours ni connexion bancaire automatiques. Un nom vide ou une valeur absente, négative ou non finie est refusé. Les centimes et le zéro explicite sont acceptés. Les métadonnées additionnelles et catégories importées sont conservées lors d’une modification. Annulation de suppression et retour aux données précédentes en cas d’échec d’enregistrement vérifiés.

Suites réussies : savings, finance, client-experience, property-readiness, client-simplicity et audit-regressions. Le test savings vérifie notamment les totaux, la distinction absent/zéro, les caractères spéciaux, les saisies invalides, les métadonnées, les confirmations et le rollback.

## Point de vue client

Le total est immédiatement identifiable, chaque montant appartient à un compte clairement nommé et les actions ne sont plus coupées. La distinction entre valeur patrimoniale et somme disponible reste nécessaire : aucun total de disponibilité n’a été ajouté, car la catégorie seule ne permet pas de garantir qu’un placement peut être retiré sans délai ni risque.

Le contrôle visuel dans un navigateur reste à faire : Chromium local ne démarre pas dans cet environnement, le navigateur distant ne peut joindre le serveur local, et le téléchargement du navigateur de test n’aboutit pas. Ces résultats ne constituent pas une validation sur téléphone.

## Livraison

Modifications conservées dans le dépôt local avec celles du guidage dans Biens. Pas d’envoi GitHub ni de génération d’APK pendant les essais utilisateur. V34 déjà livrée reste inchangée.
