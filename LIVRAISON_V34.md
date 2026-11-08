# ImmOptima V34 — version personnelle de test

## Livrable du 8 novembre 2026

- APK : `ImmOptima-Test-v34.apk`, 7 386 957 octets.
- Source applicative et compilation : `e78fa3a628aa24299fab7fb3582dca7d9f2fd532`.
- Exécution : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/42471957526
- SHA-256 APK : `0cd735c330e2a2af1c81b9384f581cf828592feae0c0260aa3c3bcc3f6f006dc`.
- Certificat SHA-256 : `fed154b7a4201230dabe6c08d1365d471d62464dbbc596ca37c383479cbbee35`, même identité que V33.
- Identifiant `com.immoptima.app`, versionCode 34 ; version personnelle débloquée.
- Identité octet par octet contrôlée pour les ressources embarquées index.html, solo-landlord.js et rental-management.js.

## Évolutions

Premier bilan guidé en trois étapes, montants inconnus distingués de zéro, premier encaissement et première quittance de découverte ; offre Premium dès le premier logement. Essai de 90 jours mono-bien avec activation explicite et date de fin visible, lié au compte par un horodatage serveur immuable. Échéances consultables dans l’application et récapitulatif annuel des encaissements saisis. Multi-biens réservé à un abonnement actif pour les clients, y compris à l’import ; usage personnel débloqué.

## Vérification

Construction, signature, suites JavaScript et navigateur réussies. APK installée : suites Android 14/API 34 et Android 16/API 36 réussies (jobs 128705251207 et 128705251279).

L’audit cloud de cette exécution a échoué sur la sonde d’essai après activation. Reproduction locale : l’émulateur réutilisait l’heure antérieure du flux de lecture, plus ancienne que l’activation ; des lectures avec de nouveaux contextes authentifiés réussissent. Le test utilise désormais un contexte indépendant pour chaque sonde. Toute la suite locale des règles passe : activation immuable, dates futures et expirées refusées, isolation des comptes, multi-biens exclu de l’essai, droits administrateur et abonnement contrôlés. Les règles de production n’ont pas été assouplies ni modifiées. Une erreur de guillemet dans la restitution du statut du job est aussi corrigée.

Ces ajustements concernent les tests et le workflow ; ils ne changent pas l’APK livrée. Aucune règle n’a été déployée en production dans cette livraison. Avant ouverture aux clients, déployer les règles après revue et vérifier le parcours natif complet sur un compte client réel, notamment activation immédiate, reconnexion, réimport et expiration ; les tests du navigateur utilisent un pont natif simulé.

## Retour côté client

Le bilan donne un premier résultat utile avec un seul logement. Le suivi mensuel, les quittances et les échéances rendent ensuite l’usage régulier compréhensible. Les 90 jours permettent d’évaluer l’utilité sur plusieurs mois. La volonté de payer reste à confirmer avec des utilisateurs extérieurs ; il n’y a pas de rapprochement bancaire automatique, de notification hors application ni de paiement intégré dans cette version.

## Étapes finales

1. Installer en mise à jour après sauvegarde et tester avec le patrimoine réel.
2. Déployer et valider l’essai sur un compte client réel ; tester les droits mono/multi-biens et la conservation des données à expiration.
3. Intégrer et tester la souscription Google Play, restauration d’achat, renouvellement, résiliation et contrôle serveur des droits.
4. Finaliser les documents commerciaux et de confidentialité, la suppression du compte et les informations requises pour la publication.
5. Effectuer un test fermé avec des bailleurs extérieurs, corriger les blocages, préparer la fiche Google Play et publier la version commerciale.

La référence V24 et main restent intactes.
