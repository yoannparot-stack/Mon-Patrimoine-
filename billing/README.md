# Google Play — préparation désactivée

Produit proposé `immoptima_premium`, formules `mensuel` et `annuel`, package `com.immoptima.app`. Les identifiants doivent être créés dans Play Console ; ils ne sont pas annoncés comme existants. La configuration native est `enabled:false`, et la fonction serveur exige aussi `billingService/config.enabled:true`. Aucun déploiement ni achat réel n’est effectué.

Le projet natif inclut Billing 8.3.0. Le serveur utilise les identifiants par défaut du service, jamais une clé incorporée. Les règles Firestore refusent aux clients l’accès à billingService et playPurchases, ainsi que l’écriture d’accountAccess. Le compte est lié par SHA-256 du UID Firebase fourni comme obfuscatedAccountId. Les prix viennent de Google Play ; seuls les plans mensuel/P1M et annuel/P1Y sans offre promotionnelle sont proposés dans cette première préparation.

Avant activation : revue du code, compilation Android, tests des nouvelles interfaces, déploiement approuvé, configuration API Publisher et Pub/Sub, budget Firebase, test réel avec un UID commercial et compte de licence. Tester activation d’essai immédiatement après lecture antérieure, réimport, expiration, isolement, achat en attente/annulé/approuvé, restauration, relance après fermeture, renouvellement, remboursement, résiliation, suspension et notifications désordonnées. Valider notamment les transactions en présence d’achats concurrents et le rejeu de jetons liés.

L’expiration provient de Google. Active, grace period et canceled non expiré permettent l’accès ; pending, paused, on hold et expired ne le permettent pas. Le serveur accuse réception des achats admissibles ; les échecs doivent être repris par restauration/événements/rapprochement. Les événements inconnus ne sont pas associés automatiquement à un UID. Aucune clé, aucun jeton ni donnée d’achat n’est journalisé.

L’APK personnelle ne valide pas le fonctionnement des droits commerciaux et ne doit pas être publiée. Le module prépare le paiement, il n’est pas certifié prêt pour la production.
