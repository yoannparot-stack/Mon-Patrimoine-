# Étude d’un accès individuel, sans quota API commun

## Contrainte utilisateur

Le quota gratuit de 50 annonces sur 30 jours de ChercherTrouver porte sur tout le compte fournisseur. Une clé ImmOptima commune ne convient donc pas à l’ensemble des clients. Cette piste de production est écartée ; il ne faut plus demander à l’utilisateur de créer une clé commune pour cet objectif.

## Architecture distincte examinée

Chaque client disposerait de **son propre compte fournisseur**, et autoriserait ImmOptima à le consulter pour son analyse personnelle. Le quota serait alors celui de ce compte distinct. Il ne deviendrait pas automatiquement un quota par client simplement en créant une clé par utilisateur sur le même compte : le compte fournisseur doit réellement être personnel et distinct.

Le connecteur personnel MCP documenté par l’éditeur utilise OAuth. Il fournit un précédent technique pour une consultation sous l’identité de l’utilisateur, plutôt que sous celle d’une entreprise commune. Cela ne dispense pas de valider l’usage prévu dans ImmOptima, les conditions du fournisseur et les données reçues. La documentation pour assistants ne doit pas être présentée comme une garantie générale autorisant toute intégration mobile.

Cette option ajoute une connexion et éventuellement une inscription externe. Elle doit être acceptée comme choix de parcours client avant d’être imposée dans l’APK. Elle n’offre pas un accès illimité : chaque utilisateur reste soumis aux limites de son propre compte, y compris 50 annonces sur 30 jours pour l’offre Découverte. Les données et quotas ne seraient ni regroupés ni utilisés pour alimenter un catalogue commun. Aucun compte fournisseur client n’a été créé dans le cadre de ces vérifications.

## Contrôles techniques réellement réalisés le 1er novembre 2026

- Découverte publique OAuth et ressource MCP : réponses HTTP 200.
- Serveur déclarant les flux authorization code et refresh token, PKCE S256 et l’authentification de client public `none`.
- URI de retour mobile personnalisée refusée par le fournisseur ; aucune tentative de contournement.
- Enregistrement logiciel natif via une URI locale de retour, mécanisme distinct de redirection native : HTTP 201, avec `token_endpoint_auth_method: none`. L’identifiant logiciel public est conservé dans `oauth-preflight-2026-11-01.json`. Aucune clé API ni secret d’enregistrement n’est publié.
- Aucun utilisateur connecté, aucun code d’autorisation échangé, aucun jeton utilisateur obtenu, aucune annonce authentifiée consultée et aucun abonnement facturable ouvert.

Il s’agit d’un **précontrôle de compatibilité**, pas d’une connexion Android opérationnelle. Le navigateur, le retour local, les jetons, la reconnexion et les réponses réelles des outils restent à implémenter et vérifier après choix du parcours et validation de l’usage.

## Conditions de réalisation

1. Confirmer que la connexion externe de chaque client est acceptable pour le produit.
2. Valider l’usage de consultation personnelle envisagé et obtenir un premier compte de test appartenant à l’utilisateur, sans réutiliser un compte central pour tous les clients.
3. Implémenter le parcours d’autorisation dans le navigateur externe, avec état aléatoire, PKCE et un retour local limité à l’appareil ; stocker les jetons chiffrés côté Android, liés au compte ImmOptima. Un client public ne doit pas dépendre d’un secret partagé dans l’APK.
4. Consulter les schémas des outils MCP sous cette autorisation et vérifier les données réelles de location nue et meublée, les charges, les dates et les limites. Les paramètres REST du connecteur à clé commune ne sont pas automatiquement ceux des outils MCP.
5. Tester au moins deux comptes distincts pour confirmer l’isolation et les compteurs, la révocation, l’expiration, le retour navigateur et les erreurs. Ne pas annoncer « quota par client » sur la seule base de la prévalidation OAuth.
6. N’activer la fonction cliente qu’après ces essais. Les fonctions de patrimoine et de sauvegarde existantes doivent rester indépendantes de cette connexion.

Sources primaires : [connexion personnelle documentée](https://cherchertrouver.immo/connecteur-ia), [règles de quota et licence](https://cherchertrouver.immo/cgv), [métadonnées OAuth publiques](https://cherchertrouver.immo/.well-known/oauth-authorization-server), [ressource OAuth protégée](https://cherchertrouver.immo/.well-known/oauth-protected-resource).
