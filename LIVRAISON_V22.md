# ImmOptima V22 — repère nu local et simulation meublée

## Fonctions

- Recherche à la demande des repères publics depuis la comparaison d’un bien ; analyse globale existante conservée.
- Scénario meublé calculé à partir du nu HC avec +10 % par défaut, explicitement affiché comme une hypothèse nationale. Pourcentage personnel modifiable ; champ vide pour rétablir le réglage automatique. Les références meublées comparables et les cibles personnelles restent prioritaires.
- Affinement du repère nu par les trois secteurs OLL Tours Métropole lorsque le géocodage est précis et qu’un segment statistique suffisant existe. Repli communal ou d’agglomération ailleurs. Le coefficient meublé n’est pas automatiquement différent d’un quartier à l’autre : aucun écart meublé local n’est validé.
- Sources, millésimes, méthode et hypothèses consultables. La simulation conserve les charges, surcoûts, mobilier et vacance distincts. Elle ne modifie pas les loyers réels, les crédits ou la valeur des biens.
- Recherche publique indépendante de la connexion et du fournisseur d’annonces non activé. Aucun abonnement engagé, aucun quota applicatif par client ajouté. Les services publics peuvent être temporairement indisponibles ou limiter leur débit.

Méthode et provenance : `RENTAL_MODEL_V22.md`.

## Contrôles locaux réussis

Calculs locatifs et financiers, référence nu/meublé prioritaire, 0/10/15/20 % de majoration, projection de trois secteurs publics, coût/vacance/retour, DPE F/G, champs manquants, modification des caractéristiques, données anciennes, sauvegarde/restauration des paramètres et valeurs réelles conservées. Contrôles de synchronisation, migrations Drive et précontrôles Firebase réussis. Les 35 tests des moteurs serveur/sources et les six tests du simulateur de prêt restent réussis. Le repli OLL en cas de panne ANIL est vérifié sans connexion ni appel fournisseur. Les deux API publiques testées répondent HTTP 200 avec les en-têtes CORS nécessaires à la WebView.

Requête officielle OLL testée en direct pour le segment Tours / Appartement / Appart 1P : une ligne exploitable, 2776 observations, médiane 15 €/m² HC, surface moyenne 27 m². Licences des statistiques OLL et géométries IGN vérifiées (Licence Ouverte 2.0).

## Validation finale

Compilation et tests navigateur de la version finale réussis. Tests tactiles sur APK installé réussis : Android 14 / API 34, 1080 × 2400. Modification à +20 %, enregistrement, rechargement et retour Android vérifiés ; comparaison repliée sur une page aux formats navigateur 360 × 740 et 393 × 851 et sur la WebView native contrôlée. Captures réelles : `20-modele-meuble-10.png` et `21-modele-meuble-20.png`. Les captures utilisent un patrimoine fictif et les statistiques publiques OLL 2025 ; elles ne représentent pas le patrimoine d’un client.

Le premier essai tactile a échoué car le banc de test touchait le bouton d’enregistrement situé hors de l’écran après déploiement du formulaire. Le test fait désormais défiler ce bouton et vérifie que ses coordonnées sont visibles avant de simuler le toucher. La version finale passe ce parcours. Les contrôles antérieurs de régression du dashboard, des biens, de la banque, du simulateur, du marché et des sauvegardes restent réussis.

APK : versionCode 22, versionName 1.3.2-preview, package com.immoptima.app. SHA-256 : `fef9340aa8138059cf75e043b6e5fe8bff89c7ef9c4d90ad204f37569998ef24`. Identité de signature conservée : `fed154b7a4201230dabe6c08d1365d471d62464dbbc596ca37c383479cbbee35`. Les deux fichiers JavaScript locatifs embarqués ont été comparés octet par octet aux sources validées.

Commit applicatif : `dca3c287850371f661c33c201f421a4213465413`. CI : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/41718974072

## Vérifications à effectuer sur téléphone réel

- Localisation exacte d’une adresse et sélection du secteur, puis repli correct hors couverture ou si le géocodage est approximatif. Le contrôle automatique de l’environnement a refusé l’envoi d’une adresse précise au géocodeur ; les secteurs ont été testés avec des points intérieurs aux géométries publiques, sans adresse de client envoyée.
- Connexion et sauvegarde Google dans le compte réel du client ; les tests automatisés emploient des données isolées.
- Réglages particuliers de taille de police, clavier et version Android du téléphone. La version de test ne constitue pas encore une publication Play Store.

Branche de travail : `feature/immoptima-step3-brand-ux`. Branche d’origine `backup/aspect-d-origine-2026-10-27` vérifiée inchangée à `c4fab83a5895dba8ebc3a6d4bc76ee2f8a302a87`.
