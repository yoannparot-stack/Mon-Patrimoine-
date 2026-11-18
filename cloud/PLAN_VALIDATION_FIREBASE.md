# ImmOptima — validation des services réels

État du 18 novembre 2026. Cette note remplace le plan ancien décrivant l'ancien package de test et un moteur de synchronisation non intégré.

## Configuration connue et limite de vérification

Le package courant est `com.immoptima.app`. Authentication Google et Firestore sont intégrés au pont Android. Le droit personnel et les règles d'accès ont été publiés après confirmation du titulaire le 15 novembre ; les lectures simulées propriétaire/autre identité ont donné les résultats attendus. Firestore a été observé en `eur3`, sans que cela décrive tous les services Google. Le forfait observé était Spark.

Le 18 novembre, la console demande une reconnexion Google. Aucun paramètre distant, rôle, empreinte, utilisateur, règle, sauvegarde ou forfait n'a été modifié par cet audit. La disponibilité opérationnelle ne se déduit pas du code ni des émulateurs.

## Contrôles déjà automatisés

Les tests de règles couvrent l'isolation, les révisions séquentielles, le refus des écritures de droits par le client, l'activation d'essai par horodatage serveur, l'impossibilité de réinitialiser cet essai et le verrou de suppression. Les tests d'import couvrent les routes fichier/Drive/récupération/cloud et le retour aux données précédentes lors d'échecs. Consulter l'exécution de la version exacte pour établir leur réussite.

## Preuves à recueillir sur compte client jetable

| Action | Résultat attendu |
|---|---|
| Connexion Google | Identité du compte de test affichée, sans droit propriétaire hérité |
| Découverte mono-bien | Bilan accessible sans activation automatique de l'essai |
| Essai volontaire | Une date d'activation serveur et une échéance de 90 jours ; reconnexion/import ne la redémarrent pas |
| Deuxième bien sans abonnement | Refus sans perte du premier patrimoine ; export possible |
| Autorisation de sauvegarde | Aucun envoi avant le consentement distinct, succès seulement après confirmation réelle |
| Second appareil | Récupération de la même révision et des données fictives du compte attendu |
| Autre compte | Aucun accès au patrimoine ni à l'essai du premier compte |
| Conflit de révision | Choix explicite et absence d'écrasement silencieux |
| Suppression manuelle | Demande vérifiée, verrou des anciennes sessions, effacement du compte et de ses données liées, autre compte préservé |
| Après suppression | Relecture et réécriture refusées depuis l'ancienne session ; purge du marqueur après le délai applicable vérifiée séparément |

Les confirmations d'effacement portent uniquement sur les données effectivement supprimées. Les exports, copies Drive et données locales restent distincts. La suppression ne touche pas au compte Google et ne résilie pas automatiquement un abonnement Play.

## Ordre de mise en service

1. Rétablir l'accès Google au projet et vérifier les paramètres réels nécessaires aux textes.
2. Finaliser les durées, contrats, coordonnées utiles et procédure d'assistance ; publier ensuite les pages exactes.
3. Organiser un compte client jetable et les deux appareils ; ne jamais utiliser le patrimoine personnel de l'éditeur pour un essai destructif.
4. Exécuter les contrôles et conserver les preuves sans identifiants individuels dans le dépôt public.
5. Pour la vente, mettre en service séparément la vérification Google Play et ses événements, après choix explicite de l'hébergement et de son coût.
