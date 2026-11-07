# ImmOptima V32 — accès au bien et avis locatif indicatif

## Intégrations

- Bouton « Gérer le bien » bleu, large et placé sous les informations du logement, avec accès aux outils de location. Adaptation aux écrans courts conservant la place du graphique.
- Fiche Optimisation : loyer actuel HC, repère automatique HC, fourchette estimée et écart brut mensuel. Les cibles personnelles des simulations ne remplacent pas ce repère automatique.
- L’avis est calculable sans saisir de cible, de budget mobilier ou de surcoûts. Le calcul net et le retour sur investissement restent dans la comparaison avancée, avec leurs hypothèses explicites.
- « Sources et méthode » donne accès à l’origine, au millésime et aux limites. Les anciennes références personnelles restent consultables et facultatives.
- Mention courte sur l’onglet et notice complète sous la comparaison : estimation informative, sans expertise, garantie de loyer ni autorisation d’augmentation. Cette notice ne constitue pas une validation juridique de l’application.
- Les données insuffisantes, trop anciennes, non actualisées ou trop éloignées de la surface du logement ne produisent pas une cible automatique présentée comme fiable. Les logements DPE F/G restent exclus du potentiel de hausse.

- Retour natif : raccordement au mécanisme Android 13+ (gestes inclus), conservant la compatibilité avec les versions précédentes. Un premier Retour à l’accueil affiche une invitation ; un second dans les deux secondes demande confirmation (« Rester » / « Quitter ») avant toute fermeture.

## Périmètre des données

L’actualisation à la demande utilise les sources publiques ANIL / OLL disponibles. Les statistiques annuelles ne sont pas présentées comme des annonces en temps réel. Aucun nouveau flux gratuit d’annonces récentes n’est activé par cette version. Le meublé reste une simulation distincte si aucune référence meublée comparable n’est disponible ; aucune majoration locale mesurée n’est inventée.

Le canal personnel gratuit et multi-biens est conservé. Les contrôles commerciaux d’import multi-biens avec abonnement actif ne sont pas assouplis. La V24 de référence et la branche principale ne sont pas modifiées.

## Traçabilité

- Source de l’APK : `19ec063b810d4d7781f90b20e9d908966a4be42c`.
- Arbre source : `0c67d16068ca154b3e64a27e0f37783e95e70064`.
- Compilation et contrôles : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/42389828654
- Package : `com.immoptima.app`, versionCode 32.
- Fichier : `ImmOptima-Test-v32.apk`, 7 358 146 octets.
- SHA-256 : `d70be1105021a5047d68fc32e4e81a1b0aefc0b00357625947365b8977a72f63`.
- Certificat persistant SHA-256 : `fed154b7a4201230dabe6c08d1365d471d62464dbbc596ca37c383479cbbee35`.
- Sept fichiers embarqués comparés octet par octet aux sources, dont HTML, optimisation, saisie accompagnée et gestion locative : conformes.

## Vérifications

Les tests de calculs patrimoniaux et financiers, prêts, données manquantes, IRL, trames de bail, documents locatifs, import/export, accès personnel et abonnement sont réussis. Le résumé ne compte plus zéro opportunité lorsque des avis automatiques positifs existent sans surcoûts renseignés. Les tests ajoutés vérifient notamment l’avis sans surcoûts renseignés, son indépendance d’une cible personnelle et le maintien du blocage DPE.

Les deux suites navigateur sont réussies, sans erreur JavaScript : navigation, formulaires, persistance, sauvegardes, champs rouges, brouillons, recherche, bilan, import, comparaison Nu/Meublé et plusieurs tailles d’écran. Les captures réelles du bouton et du nota ont été inspectées.

L’audit des règles cloud est réussi sur émulateur, avec isolation des comptes et contrôle des abonnements ; aucune écriture de test en production.

Les contrôles complets sur les APK installés sont réussis sur Android API 34 (Android 14) et API 36 (Android 16), écran 1080 × 2400. Les appuis natifs, le Retour dans les fenêtres et formulaires, la persistance, les documents locatifs, le premier appui à l’accueil, la confirmation au deuxième appui et le choix « Rester » ont été vérifiés. La dernière compilation après ajustement de l’attente du test de quittance produit un APK identique octet par octet à celui de cette livraison. Ces contrôles utilisent des portefeuilles fictifs et ne constituent pas un essai sur tous les téléphones physiques ni une mise en service de la facturation commerciale.
