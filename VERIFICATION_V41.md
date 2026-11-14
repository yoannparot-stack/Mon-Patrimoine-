# ImmOptima V41 — préparation des étapes 2 et 3

## Résultat

Parcours dédié de suppression du compte dans Mon compte, page Web de confirmation Google, traitement serveur récursif et suivi reçue/en cours/terminée. Effacement du téléphone, exports/Drive et résiliation Google Play restent distincts. L’activation est désactivée ; aucun compte réel n’est supprimé.

Les CGU, confidentialité et conditions d’abonnement passent en version 2026-11-14-v2. Les deux tarifs 3,99 €/mois et 39,99 €/an sont cohérents avec l’interface. Pages Web générées depuis la source commune. Informations d’éditeur, inventaire des données et procédure de déploiement documentés dans docs/.

## Contrôles

Source finale : a290ff510c5fe3ce5983c2f30225fb5c5ae9f271.
Exécution finale : 43587052757 ; contrôle indépendant des règles : 43586247938.

- 30 tests serveur réussis : identité récente, confirmation et activation, refus d’un UID arbitraire, suppression récursive isolée, reprise après panne, purge et facturation bloquée pendant la suppression.
- Règles Firestore sur émulateur : isolation des comptes et blocage des anciens accès propriétaire pendant la suppression.
- Sept suites navigateur réussies, sans erreur d’exécution signalée. Procédure externe testée sur identité et API fictives : aucune demande avant confirmation, statut en cours distinct du succès, aucun jeton conservé dans localStorage par le code.
- Suites de l’APK installée réussies sur Android 14 et 16 : rendu du nouvel écran, titre, Retour physique et conservation des données. Captures relues.

La première passe Android 16 a été interceptée par le dialogue système Quickstep. Sur Android 14, l’écran était correct mais l’OCR a lu « contrdle » ; seul le repère de test a été corrigé, avec assertion directe du titre. L’APK des deux compilations est identique octet pour octet.

## Fichier

ImmOptima-Test-v41.apk ; com.immoptima.app ; versionCode 41 ; 7 957 974 octets.
SHA-256 : 8d8d02bcf5c1d5aa23ed1f80967aeeff33f10a7875ae8477ba66f188fd5dd556.
Six modules embarqués comparés ; configurations de suppression et de paiement désactivées.
Certificat conservé : fed154b7a4201230dabe6c08d1365d471d62464dbbc596ca37c383479cbbee35.
Sauvegarder puis installer par-dessus V40 sans désinstaller.

## Limites et suites

Aucun déploiement de production, aucun achat, aucune suppression réelle et aucun service facturé activés. Le fonctionnement serveur et Web est testé sur simulations ; une validation de bout en bout sur compte jetable après déploiement reste nécessaire. L’URL et Google Auth Web, les coûts, les règles, les fonctions et les pages doivent être configurés et vérifiés ensemble avant activation.

Les mentions d’éditeur, coordonnées professionnelles, médiation applicable, régions/destinataires contractuels, durées de journaux/sauvegardes et transferts restent à confirmer. Ne pas activer deletionVerified/approvedForPublication avant ces vérifications. L’APK personnelle débloquée n’est pas le binaire commercial à publier.
