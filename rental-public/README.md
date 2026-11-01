# Collecte gratuite : moteur multi-source et validation des éditeurs

## État réel

**Moteur de collecte et de comparaison développé et testé ; aucune source client activée.** Ce module est indépendant de Yanport, de Firebase Functions et de tout abonnement fournisseur. Il s’exécute avec Node 22 ; il n’est pas encore branché au bouton de collecte de l’APK V19. La V19 conserve ses fonctions et son connecteur existants.

Le manque actuel est une source d’annonces à la fois récente, suffisamment documentée et réutilisable dans l’application. Une page publique, un résultat de moteur de recherche ou un `robots.txt` permissif ne constitue pas à lui seul une autorisation de réutilisation commerciale.

Le registre `sources.json` distingue les sites restreints, les flux à l’étude et les futurs flux approuvés. Aucun site restreint n’est interrogé par le collecteur. Aucun fournisseur payant n’a été souscrit. Aucune annonce réelle ou donnée personnelle d’annonceur n’est versionnée.

## Contrôle réel du 1er novembre 2026

Voir `source-audit-2026-11-01.json` pour l’heure UTC et les résultats du programme sur les vrais flux. Ce fichier contient des compteurs et des périodes, pas des annonces.

| Source examinée | Résultat | Activation client |
| --- | --- | --- |
| Citya | CGU limitant l’usage au cadre personnel et privé, réutilisation commerciale à faire autoriser | Non |
| PAP | CGU excluant extraction et indexation hors usage strictement personnel | Non |
| leboncoin | Collecte robotisée conditionnée à une autorisation préalable | Non |
| Lucilia B. Immobilier | Flux RSS réel : 982 entrées, dont 347 candidates en location après filtrage du titre et du contenu ; dates de publication toutes au 8 novembre 2025 lors du contrôle. Le statut actuel de chaque bien n’est pas confirmé par cette date de flux | Non |
| Passetonannonce | Flux de syndication accessible, mais dates remontant à 1999 et présence de contenus mal classés. Aucune référence récente exploitable retenue | Non |

Il s’agit d’un échantillon de sources examinées, pas d’une preuve qu’aucune source gratuite exploitable n’existe. Les données ANIL et OLL déjà intégrées restent disponibles comme repères statistiques ; elles ne sont pas présentées comme des annonces actuelles meublées.

Sources primaires consultées :

- [CGU Citya](https://www.citya.com/conditions-generales-utilisation)
- [CGU PAP](https://www.pap.fr/groupe/cgu)
- [Conditions leboncoin](https://www.leboncoin.fr/dc/cgv_pro)
- [Flux annoncé par Lucilia B.](https://www.lucilia-b-immobilier.fr/asp/contact.asp) et [RSS](https://www.lucilia-b-immobilier.fr/rss.xml)
- [Syndication Passetonannonce](https://www.passetonannonce.com/rss.html)
- [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html), qui distingue les règles d’exploration des droits d’accès/réutilisation

## Fonctionnement livré

1. Vérification de l’approbation de chaque source avant tout appel de collecte.
2. Consultation du `robots.txt` puis du flux déclaré, sans exploration de liens et sans redirection. L’agent se présente sous le nom `ImmOptimaRental`.
3. Requêtes limitées à l’URL du flux : ni adresse du client, ni revenus, ni crédits ni loyers personnels ne sont transmis aux éditeurs.
4. Réponses plafonnées, délai de 15 secondes par requête, refus des DTD/entités XML, prise en charge des flux RSS UTF-8 et ISO-8859-1 pour leur audit.
5. Pour la collecte client, lecture de flux structurés `immoptima-json-v1` approuvés. Chaque annonce doit déclarer : transaction locative, disponibilité, mois/EUR, nu/meublé, longue durée, absence de colocation, commune INSEE, pièces, surface, HC ou CC avec charges chiffrées et publication.
6. L’heure de consultation est générée par le collecteur ; elle ne remplace jamais la publication. Publication de moins de 90 jours et observation de moins de 24 heures.
7. Même commune, mêmes pièces et type, surface ±25 %. Le rapprochement est au niveau de la commune : aucune précision de quartier ou distance de 3 km n’est inventée en l’absence de coordonnées.
8. Déduplication par URL canonique et profil conservateur mode/commune/pièces/surface/loyer. Ce rapprochement peut fusionner deux vrais logements très similaires : le compte est volontairement prudent et ne garantit pas une identification parfaite des biens.
9. Retrait des loyers/m² atypiques. Au moins trois références retenues pour une cible : médiane des HC/m² × surface, arrondie à 5 €. Sinon, cible absente.
10. Restitution séparée des éditeurs consultés, éditeurs ayant fourni des références retenues, liens, dates et motifs de rejet. Les erreurs d’un éditeur n’empêchent pas l’examen des autres.

Les RSS ordinaires ne fournissent souvent ni charges détaillées, ni mode de location fiable, ni statut actif. L’audit RSS n’en déduit pas ces champs par défaut. Leur conversion nécessite un adaptateur validé sur les vrais champs du flux de l’éditeur ; le collecteur n’accepte actuellement que le format structuré ci-dessous pour produire un comparatif.

## Utilisation technique

```sh
cd rental-public
npm ci --ignore-scripts
npm test
npm run audit:sources
```

Collecte approuvée : `node collect.cjs`, avec une requête JSON sur l’entrée standard contenant `mode` (`nu` ou `meuble`), `surface`, `rooms`, `family` (`appartement` ou `maison`) et `communeCode`. Avec le registre actuel, le résultat indique zéro source activée et aucune cible ; c’est l’état attendu, pas une simulation de réussite.

Les tests ne consultent aucun fournisseur et utilisent des réponses fictives clairement identifiées. L’audit réel est une commande distincte, lancée explicitement par l’opérateur ; aucune collecte périodique ou en arrière-plan n’a été créée.

## Comment activer gratuitement une agence partenaire

Une agence peut fournir gratuitement un flux des loyers affichés sur ses biens disponibles, sans photo, descriptif commercial ni coordonnées de personne. Le flux peut être hébergé comme fichier JSON statique HTTPS et actualisé par l’agence. L’accord doit couvrir le calcul d’indicateurs dans ImmOptima, l’attribution, la conservation, les sauvegardes et la restitution des références. Son caractère gratuit doit être confirmé par l’éditeur ; ce dépôt ne suppose pas l’accord d’une agence.

Un enregistrement technique fictif :

```json
{
  "schemaVersion": 1,
  "records": [{
    "url": "https://agency.example/annonce/EXEMPLE-FICTIF",
    "datePublished": "2026-11-01",
    "active": true,
    "transaction": "rent",
    "period": "month",
    "currency": "EUR",
    "mode": "meuble",
    "lease": "long-term",
    "shared": false,
    "family": "appartement",
    "communeCode": "37261",
    "rooms": 1,
    "surface": 30,
    "rentHC": 550
  }]
}
```

`rentCC` et `charges` peuvent remplacer `rentHC` si les deux montants sont explicites. Les champs manquants restent inconnus. Le domaine de l’annonce doit appartenir à la liste de domaines approuvés pour cet éditeur. Le flux doit contenir uniquement les logements actuellement proposés ; les biens retirés doivent en disparaître.

Après accord et validation : ajouter la source au registre avec son format, URL, domaines et `permission` (`status: approved`, référence de l’accord dans `evidence`, date `reviewedAt`), puis passer `state` à `approved` et `enabled` à `true`. Vérifier manuellement les annonces retenues et les rejets sur une collecte réelle Nu et Meublé avant de brancher le moteur dans une prochaine version Android. Une entrée de test ne doit jamais être activée en production.

L’intégration Android pourra lire ces flux approuvés sans compte Yanport ni Firebase Blaze ; ce branchement reste à réaliser et à tester une fois le premier flux utilisable obtenu. Aucune promesse d’accès automatique à tous les sites ou de couverture nationale n’est faite.

## Validation de cette livraison

Neuf groupes de tests réussis avec Node 22 dans [GitHub Actions, exécution 41342886982](https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/41342886982). Les vérifications locales des calculs financiers, du comparatif locatif, du connecteur V19 et des callbacks/sauvegardes ont également réussi. Le code Android et son APK ne sont pas modifiés par cette livraison ; aucune nouvelle compilation Android n’est revendiquée.
