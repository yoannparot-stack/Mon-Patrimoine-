# ImmOptima V20 — comparatif locatif HC / CC

## Statut à lire avant installation

Cette version prépare et intègre le premier avis locatif dans Android. **La collecte automatique d’annonces réelles n’est pas opérationnelle.** Aucune source d’annonces de production n’est activée et aucun abonnement n’a été souscrit. L’essai GitHub du 1er novembre 2026 confirme l’absence de clé fournisseur configurée ; le service Firebase `rentalComparables` répond HTTP 404. La V20 ne doit pas être présentée comme une fonction de recherche Leboncoin prête pour les clients.

Les sources ANIL/OLL restent des repères statistiques distincts. Les annonces synthétiques utilisées pour les vérifications ne sont jamais intégrées aux données clientes ou chargées au lancement de l’application. Les captures de comparaison CC portent la mention « Données de test ».

## Modifications intégrées

- Fourchettes HC et CC séparées, y compris lorsque le détail des charges est inconnu ; offres tout compris distinguées.
- Aucune déduction de charges supposées ni majoration forfaitaire pour le meublé. Un repère CC ne calcule aucun gain HC.
- Contrôles des références, du segment du logement, des dates, des doublons, des montants et des sources ; au moins trois références par plage.
- Calcul descriptif partagé entre les adaptateurs, sans appel à une IA sur les contenus des annonces.
- Bouton d’actualisation du comparatif, préservation des hypothèses non enregistrées, affichage explicite des erreurs.
- Retour Android : repli des rubriques ouvertes avant fermeture du comparatif ; contrôle des rubriques imbriquées.
- Conservation dans les sauvegardes, exclusion des résultats expirés, d’un autre compte ou d’un bien dont les caractéristiques ont changé.
- Contrôle des montants reçus dans Android par recalcul depuis les références, avant affichage.
- Références conservées sans duplication HC/CC et échantillon borné, avec conservation de la médiane ; test de sauvegarde de onze biens après analyse de cent candidats par mode.

## Validation

Commit applicatif : `5428ae42b788e5a6382f465fd97aa661d3f0f69d`.

- 35 tests serveur et sources publiques réussis.
- Tests des calculs financiers, collecte cliente et contrat serveur/client CC réussis, sur données synthétiques.
- Régression navigateur mobile réussie : interactions, sauvegardes, cloisonnement des comptes, champs financiers préservés et comparaison fermée sur une page aux formats testés.
- Compilation, installation et tests d’interface Android réussis sur émulateur API 35 (1080 × 2400) : navigation tactile, retour, rubriques repliables, persistance après rechargement et accès aux fonctions existantes. Capture réelle du comparatif conservée avec la mention « Données de test ».
- Identité Android : `com.immoptima.app`, versionCode `20`, versionName `1.3.2-preview`.
- Certificat de test identique à la V19 : SHA-256 `fed154b7a4201230dabe6c08d1365d471d62464dbbc596ca37c383479cbbee35`.
- APK SHA-256 : `c435d00eccf072a610bceeac48e20d902ebbee1391b3e2ad020029ae9e5e9cdf`.

Vérifications : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/41405947011 et https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/41405946924.

## Ce qui reste nécessaire pour une activation cliente

1. Un accès éditeur à des annonces réutilisables et adapté au volume des clients, ou un accord de collecte de sources pertinentes. Aucun compte externe ne doit être imposé aux clients ImmOptima.
2. Un service authentifié effectivement déployé avec cet accès, des quotas et un budget maîtrisés. Le développement du traitement des résultats ne remplace pas ce déploiement.
3. Des essais sur des annonces réellement récupérées : disponibilité, charges HC/CC, location nue/meublée, longue durée, doublons, fraîcheur et couverture de plusieurs secteurs.
4. Une vérification sur téléphone personnel de la connexion et des sauvegardes dans le compte réel ; les tests automatisés ne se connectent pas au compte du propriétaire de l’application.

L’APK est une préversion de test, pas une version de commercialisation. La branche de sauvegarde d’origine n’est pas modifiée.
