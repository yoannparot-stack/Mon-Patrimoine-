# Comparatif locatif directement dans ImmOptima

Étude documentaire vérifiée le 1er novembre 2026. Aucun fournisseur connecté, aucune annonce authentifiée reçue, aucune dépense engagée. L’APK V19 reste inchangé. Les offres commerciales sont susceptibles d’évoluer.

## Exigence produit

Le client utilise seulement son compte ImmOptima. Il n’a pas à rechercher des annonces, créer un compte externe ou fournir une clé fournisseur. ImmOptima porte l’accès professionnel, la sélection des références et la comparaison. Les résultats nu et meublé restent séparés. Pas de majoration forfaitaire du nu pour prétendre avoir observé le meublé.

## Solutions concrètes

| Solution | Coût publié | Apport | Limite à lever |
| --- | --- | --- | --- |
| Stream Estate à l’usage | 0,01 € par item, sans engagement minimum ; taxes en sus sauf indication contraire dans les conditions | Annonces locatives, filtres géographiques, mobilier et charges documentés en v1 ; usage dans les applications et analyses dérivées explicitement prévu | Clé opérateur et échantillon réel nécessaires ; confirmer version active, sémantique HC/CC, données manquantes, fraîcheur et définition exacte de l’item facturé |
| ChercherTrouver professionnel | 12 € TTC/mois : 1 000 annonces, maximum 200/jour ; 30 € TTC/mois : 5 000 annonces, maximum 500/jour | Accès centralisé à des annonces et descriptions ; connecteur de test déjà développé | Les quotas restent communs mais deviennent dimensionnés ; vérifier couverture et reconnaissance fiable du nu/meublé/HC dans les descriptions ; le pilote actuel refuse volontairement les offres payantes |
| ANIL + OLL | Données ouvertes gratuites, sans compte client externe | Socle statistique et contrôle de cohérence ; mécanismes déjà présents dans l’app | Ni catalogue d’annonces actuelles ni comparatif national meublé ; ANIL est une estimation CC pour un bien type nu ; millésime et périmètre à afficher |

Stream Estate propose aussi un programme sous conditions d’éligibilité : 15 000 items/mois pendant trois mois gratuits, puis offre à choisir. Ce n’est pas une gratuité durable ni une admission acquise. Yanport reste une alternative à plus fort budget : offre publiée à partir de 200 € HT/mois, connecteur existant côté Firebase mais non activé.

Pillr a également été examiné : son endpoint de loyer reprend la Carte des loyers ANIL. Payer cet endpoint ne résout pas le manque d’annonces actuelles meublées. Estimatiz concerne les ventes DVF, et non les loyers. Ces services ne sont pas retenus pour combler artificiellement ce manque.

## Dimensionnement indicatif, pas un devis

- Stream Estate : 20 items facturés × 0,01 € = 0,20 € hors taxes ; 100 collectes identiques sans cache = 20 € hors taxes de données. Ce calcul porte sur les items reçus/facturés, pas sur les seules références finalement retenues. Une seconde recherche, des rejets ou une facturation d’endpoint différente peuvent augmenter le coût. Hébergement et autres frais exclus.
- ChercherTrouver : avec 20 annonces nouvelles consommées par collecte, 1 000 annonces correspondent arithmétiquement à 50 collectes, sous réserve du plafond quotidien. Une collecte n’est pas un client : un client peut posséder plusieurs biens et relancer l’analyse. L’absence de double comptage d’une annonce déjà reçue peut réduire la consommation, sans garantie.
- Un plafond de dépense doit bloquer les nouvelles acquisitions quand il est atteint, sans afficher un ancien résultat comme nouvellement vérifié. Aucun paiement ou abonnement ne découle de cette étude.

## Vérifications techniques et conditions d’intégration

L’OpenAPI public Stream Estate v1 a été téléchargé et analysé (107 136 octets). Il expose `transactionType`, `furnished`, `rentalCharges`, `surfaceMin/Max`, `roomMin/Max`, les codes INSEE, les dates, le statut expiré et les liens sources. La présence d’un schéma n’établit pas la qualité réelle de chaque annonce. La seule présence de `rentalCharges` ne prouve pas si `price` est HC ou CC ; vérifier avant toute soustraction.

La documentation v2 décrit une recherche `POST /properties`, un modèle et une clé distincts de la v1. Certains indicateurs sont encore annoncés à venir et les pages ne sont pas toutes synchronisées. Ne pas programmer le nouveau connecteur à partir du seul exemple marketing v1 et ne pas annoncer une compatibilité v2 non vérifiée.

Les conditions Stream Estate autorisent l’affichage aux utilisateurs directs, les analyses dérivées et le cache strictement nécessaire, sous restrictions : pas de revente de flux brut, base concurrente ou conservation excessive. Ne pas transmettre le contenu des annonces à un LLM tiers. Privilégier un calcul statistique déterministe local au service.

Pour les deux fournisseurs, la prochaine validation utile est un essai authentifié sur de vraies annonces à Tours et sur plusieurs zones, comparé aux annonces sources : statut actif, date réellement observée, longue durée, mobilier explicite, charges et HC, localisation suffisamment précise, doublons et valeurs aberrantes. Un faux booléen ou un zéro par défaut ne vaut pas preuve. Ne pas annoncer une analyse réussie si un mode manque de références.

L’accès professionnel doit rester côté service, jamais dans l’APK. Un hébergement sans Firebase Blaze est techniquement possible, par exemple un relais Cloudflare Workers, mais aucun compte ni déploiement de ce type n’est disponible ou effectué ici. Protéger le relais avec l’identité ImmOptima, plafonds de requêtes et budget global ; pas d’API publique permettant de dépenser la clé.

## Recommandation

Tester en priorité Stream Estate à l’usage pour éviter un gros abonnement initial et profiter de champs structurés, sous réserve de validation réelle. Conserver ChercherTrouver professionnel comme alternative économique si ses descriptions donnent assez de références exploitables. Conserver ANIL/OLL comme socle gratuit et contrôle distinct, sans les présenter comme des annonces du jour. Aucun accès gratuit national complet nu + meublé n’a été vérifié au cours de cette recherche.

## Sources primaires

- https://stream.estate/pricing
- https://stream.estate/pricing/startup-plan
- https://stream.estate/terms
- https://stream.estate/legal/aup
- https://docs.stream.estate/api-reference/openapi.json
- https://docs.stream.estate/api-reference/endpoint/properties/get_collection
- https://next.docs.stream.estate/fr/docs/migration
- https://cherchertrouver.immo/api
- https://cherchertrouver.immo/cgv
- https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2025
- https://www.observatoires-des-loyers.org/comment-faire-pour/comment-acceder-aux-resultats-en-open-data
- https://pillr.fr/data/docs/reference/territoire
- https://www.estimatiz.fr/conditions-api
- https://www.yanport.com/tarifs/api
