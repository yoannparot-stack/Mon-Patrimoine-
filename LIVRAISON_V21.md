# ImmOptima V21 — Banque / simulateur de prêt

## Fonction ajoutée

Le bouton « Simuler un prêt » est accessible dans Banque → Financements. Il ne crée pas de troisième onglet. La simulation est indépendante du patrimoine : aucun enregistrement automatique de crédit, aucune modification des biens ou crédits existants. « Préparer ce crédit » ouvre le formulaire existant prérempli ; le client doit le vérifier et l’enregistrer.

Prêt amortissable à taux fixe : montant, durée, taux nominal et assurance annuelle modifiables, mensualité assurée, intérêts, assurance cumulée et coût incluant les frais comptants. Calcul au centime, dernière échéance ajustée. Les frais comptants ne sont pas financés. Assurance constante sur le capital initial, quotité totale saisie. Les comparaisons 15/20/25 ans maintiennent le même taux et ne prétendent pas reproduire des offres bancaires. Aucun TAEG approximatif n’est affiché.

Le repère embarqué est 3,32 %, Banque de France, nouveaux crédits à l’habitat hors renégociations toutes durées et tous profils : mois d’août 2026, publié le 6 octobre 2026, vérifié le 2 novembre 2026. Ce n’est pas un taux personnalisé ni une donnée du jour. Sa date reste visible ; il ne se met pas automatiquement à jour. Un avertissement dans les explications indique son ancienneté après 90 jours.

Source : https://www.banque-france.fr/fr/statistiques/credit/credits-aux-particuliers-2026-08

Le contrôle financier existant a aussi révélé un écart lié au passage heure d’été/hiver dans le calcul de croissance annualisée. La durée est maintenant calculée sur les jours calendaires UTC, sans dérive d’une heure. Les historiques de moins d’un an restent exclus.

## Collecte réelle : blocage externe confirmé

La collecte d’annonces réelles n’est pas activée. Le contrôle du 2 novembre 2026 confirme que le service Firebase répond HTTP 404 et qu’aucun accès fournisseur ou de déploiement n’est disponible dans l’environnement vérifié. Aucune source n’a été activée, aucun abonnement souscrit, aucun paiement engagé. Voir rental-public/activation-check-2026-11-02.json.

La nouvelle source examinée, icitoo, réserve elle aussi l’extraction répétée et systématique à un accord écrit (CGU article 11). Elle n’est donc pas activée. Une recherche manuelle dans la conversation ne constituerait pas un collecteur accessible aux clients. Les repères ANIL/OLL restent distincts des annonces actuelles et ne comblent pas la couverture meublée.

Pour l’activation : accès éditeur dimensionné pour tous les clients, service authentifié déployé, puis vérification de vraies annonces actives sur plusieurs communes et contrôle nu/meublé/HC/CC. Le gratuit partagé limité à 50 annonces par mois et le compte fournisseur imposé aux clients restent écartés.

## Vérifications

- Six tests de calcul du simulateur réussis localement : formule indépendante, amortissement, taux zéro, assurance, frais, arrondis, limites, entrées invalides et comparaison des durées.
- 35 tests des moteurs serveur/sources réussis ; contrats et calculs locatifs existants réussis.
- Tests financiers existants réussis, y compris la croissance annualisée corrigée.
- Compilation Android et régression navigateur réussies. Le simulateur replié tient sur les formats 360 × 740 et 393 × 851 contrôlés ; préparation sans enregistrement et retour depuis les explications vérifiés.
- Interface Android installée : tests réussis sur émulateur API 34 / Android 14, 1080 × 2400, avec vrais clics tactiles, contrôle des captures par OCR, retour, conservation du patrimoine, persistance après rechargement et accès aux fonctions existantes. Capture réelle du simulateur : `19-simulateur-pret.png`.
- Le banc de test conserve désormais le lanceur Android et un démarrage unique de l’activité. Les tentatives précédentes sur API 35 puis API 34, avec le lanceur désactivé, n’avaient pas validé les écrans : le framebuffer restait sur un ancien écran alors que le DOM avait changé. Le contrôle API 34 passe après cette modification ; cela ne prouve pas à lui seul la cause exacte des échecs précédents. API 35 après ce correctif reste à revalider.
- À vérifier sur téléphone réel : rendu avec les paramètres d’affichage du client, connexion Google et sauvegarde dans son compte réel. Les essais automatisés utilisent un patrimoine synthétique sans compte utilisateur réel.
- Commit applicatif : `4526404d3216f43e7ec9a79698b749c1773346d7`.
- CI : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/41501977623
- APK versionCode 21 ; SHA-256 `8738607e4de3e6beb7af2941b7b86f8f7594ab2d77351fc5b0b2774e789e7a37`.

Branche de travail : feature/immoptima-step3-brand-ux. La branche de sauvegarde d’origine et main ne sont pas modifiées.
