# ImmOptima — refonte des six écrans et audit des calculs

Branche de travail : `feature/immoptima-step3-brand-ux`.
Référence protégée : `backup/aspect-d-origine-2026-10-27`, SHA initial `c4fab83a5895dba8ebc3a6d4bc76ee2f8a302a87`. Aucune modification de cette branche ni de main.

## Interface

Les six vues reprennent les cartes pastel vert/bleu/violet/orange, la jauge de patrimoine net, les indicateurs, les graphiques avec valeurs finales, les sélecteurs de période et la navigation Dashboard / Biens / Banque / Marché / Plus. Les onze destinations existantes restent accessibles par Plus, avec les anciens modes de lecture, les sauvegardes et l'import.

Les onglets sélectionnent réellement les données et vues. Les légendes masquent/affichent les séries, les points donnent leur date et valeur. Les données manquantes produisent une explication plutôt qu'une courbe inventée. La fiche bien accepte une photo enregistrée avec le bien et incluse dans l'export et la synchronisation, sous réserve de la limite de taille Firebase existante.

## Définitions financières vérifiées

- Patrimoine net immobilier : valeur retenue des biens sélectionnés moins CRD des crédits liés. Les actifs financiers et crédits non liés restent dans les vues globales existantes.
- Coût d'acquisition : achat + notaire + travaux + mobilier + autres frais.
- Rendement brut : loyers HC annuels / coût d'acquisition.
- Charges propriétaires mensuelles : charges non récupérables + taxe foncière / 12 + PNO + autres dépenses.
- Rendement net : (loyers HC - charges propriétaires) × 12 / coût d'acquisition, avant crédit et fiscalité.
- Cash-flow net : loyers HC - charges propriétaires - mensualités avec assurance, avant fiscalité.
- Les provisions récupérables sont neutres : elles financent des dépenses locatives et ne sont plus comptées comme un bénéfice.
- Capital remboursé : somme des différences positives entre capital initial et CRD.
- Projection : capital recalculé mois par mois depuis le solde précédent ; assurance exclue du remboursement du capital. Les achats futurs sont modélisés avec une dette supplémentaire constante, faute de conditions de financement renseignées.
- Les mensualités calculées utilisent l'annuité à taux fixe, y compris le taux nul ; les mensualités connues et les assurances sont prises en compte séparément.

Corrections complémentaires : saisie des milliers et décimales dans la synthèse bancaire, modification d'une mensualité totale répartie entre plusieurs prêts, possibilité d'une mensualité explicitement nulle, préservation des champs supplémentaires et de la photo lors d'une modification.

## Historique

Les relevés réels restent datés et ne sont pas déplacés à aujourd'hui. Les doublons de dates sont résolus pour le tracé. Les données actuelles sont ajoutées comme point actuel. L'historique reconstruit est en pointillés : prix d'achat maintenu dans le passé, amortissement théorique, loyers et charges actuels supposés constants. Il ne constitue pas une estimation de marché passée.

Les anciens relevés de revenus/rendements ne sont pas mélangés à la nouvelle formule ; ils restent dans la sauvegarde. Les nouveaux relevés portent `calculationVersion: 2` et comprennent les composantes des calculs et les mesures par bien.

## Vérification reproductible

- `node tests/finance.cjs` : identités financières, provisions récupérables, rendements, filtres, annuités, assurance, taux nul, amortissement daté, projection évolutive, saisies bancaires, cas négatifs et sans historique.
- `node tests/ui.cjs` avec Playwright : six captures du rendu réel Chromium, onglets, périodes, légendes, points, modification d'un bien, ajout de photo, persistance après rechargement, export/import avec copie de secours, refus d'un import invalide, CSV bancaire, mise en page d'impression et largeurs 320/360/393/430/800 px.
- Contrôles existants : `qa_android.js`, `qa_google_drive_migration.js`, `qa_firebase_preflight.js`, `qa_portfolio_sync.js`, `qa_cloud_sync_gate.js`.
- Compilation Android et signature persistante dans GitHub Actions. Le package reste `com.immoptima.app`, code de version 8.
- `tests/android-ui.cjs` : installation de l'APK, captures depuis le framebuffer Android, interactions et retour natif, rechargement et conservation du stockage WebView. Le débogage WebView est réservé aux APK débogables.

Les captures de validation utilisent exclusivement un portefeuille fictif isolé. Aucune donnée de démonstration n'est ajoutée au premier lancement de l'application livrée.

## Vérifications nécessitant encore le téléphone du propriétaire

Connexion Google avec le compte réel, échanges Firebase entre deux appareils, restauration réelle depuis Drive, sélecteur Android de destination/partage et dialogue d'impression PDF. Les chemins existants sont conservés et leurs gardes sont testées, mais les contrôles automatisés ne remplacent pas ces essais avec un compte authentifié.

Installer en mise à jour de l'application ImmOptima existante ; ne pas désinstaller pour préserver le stockage local. La signature persistante est utilisée pour permettre la mise à jour. L'ancienne application portant un autre package reste distincte.

## Correctif après essais sur téléphone

Le dashboard graphique adapte sa hauteur à l’espace réellement disponible entre l’en-tête et la navigation. Les quatre cartes restent visibles sur une page ; le style validé est conservé. Des tests vérifient les petits écrans 320 × 568 et 360 × 640, les formats courants et la visibilité des textes.

La croissance annuelle n’est calculée qu’à partir d’au moins un an calendaire d’historique. Une hausse de 45 000 à 50 000 € en un jour conserve son gain de 5 000 € et son évolution de 11,1 %, mais affiche « — » pour la croissance annuelle. Les valeurs longues peuvent se répartir dans leur carte sans élargir l’écran. Code de version Android : 9.

## Analyses sur une page — version 10

Les quatre analyses (richesse, revenus, performance, diagnostic) adaptent la hauteur du graphique à l’espace restant pour afficher dès l’ouverture les onglets, indicateurs, graphique, statistiques et le volet « Comprendre les calculs et les données » fermé. L’ouverture du volet autorise la croissance et le défilement de la page. Sa fermeture remet la vue entière en place. Le tracé SVG est recalculé en hauteur pour préserver la lisibilité des dates et des montants. Les vues de détail et comparatifs longs restent consultables sans couper leurs données.

## Liste Biens — version 12

La liste B validée affiche plusieurs cartes successives avec valeur, patrimoine net, cash-flow brut/crédit/net, loyer HC et rendement net. Le coût d’acquisition, le CRD, le rendement brut, le consensus et la tendance de marché restent accessibles sous « Autres indicateurs ». La présentation ne change aucune formule ni aucun enregistrement. Le bandeau découverte se déplie pour conserver son texte complet.

Le menu de chaque carte donne accès à Modifier et Supprimer ; le retour natif referme ce menu. « Voir le bien » et le nom ouvrent la fiche existante. Tests des actions, de la liste avec trois biens, des champs longs et des petites largeurs. La nouvelle apparence des analyses individuelles attend la validation des maquettes A/B/C ; elle n’est pas intégrée dans cette version.

## Fiche individuelle A et libellés — version 13

Photo compacte (ou pictogramme si absente), identité, valeur, indicateurs et graphique adaptatif. Les quatre onglets Vue globale / Financement / Loyers / Récap affichent le volet « Comprendre les calculs et les données » fermé dans le viewport. L’ouverture du volet autorise le défilement ; sa fermeture restaure l’écran initial. Les crédits liés et leurs boutons Modifier restent dans les explications de Financement ; les notes et métadonnées complètes restent accessibles dans les explications. Photo, sauvegardes et formules conservées.

« Ma richesse » devient « Mon patrimoine net » sur le dashboard et son analyse. « Détail » devient « Récap » dans les analyses et la fiche bien. Tests des quatre onglets sur cinq viewports, courbes, périodes, points, cas sans dates, actions des prêts et comportement natif Android.

## Banque C — version 14

Synthèse pastel, fiches de biens dépliables et formulaire de modification avec loyers mensuels/annuels recalculés dans les deux sens. Les crédits incluent l’assurance. Modifier uniquement les métadonnées ne remplace pas une mensualité calculée par une mensualité forcée. Les saisies conservent leur précision.

Fiches et explications fermées : synthèse, total et aide dans le viewport. Pour de nombreux biens, seule la liste centrale défile verticalement. Ouvrir une fiche ou les explications autorise l’allongement de la page. Aucun tableau horizontal à l’écran. Le tableau complet reste réservé à l’impression ; tous les biens figurent dans le CSV et le PDF.

Vérifications : cinq viewports, état vide, 11 biens, noms et identifiants longs, édition et persistance, total des exports, impression A4 paysage, interactions tactiles et retour Android. Le dialogue final de sauvegarde PDF reste à confirmer sur le téléphone du propriétaire.

## Banque / Financement et exports — version 15

L’entrée Financement est retirée de Plus. Les anciens liens sont redirigés vers Banque et le bloc Financements. Les formulaires et enregistrements de crédits sont uniques ; plusieurs crédits par bien et les crédits non rattachés sont conservés. Présentation verticale des crédits, ajout/modification/suppression directement dans Banque.

PDF : choix Synthèse, Détail ou Synthèse + détail. La synthèse présente les charges propriétaire et le cash-flow avant fiscalité ; le détail affiche taxe foncière annuelle, charges non récupérables mensuelles, PNO, autres dépenses, valeurs, CRD, assurances et échéances théoriques des prêts. NR distingue les champs absents de zéro. Les totaux locatifs excluent les crédits non rattachés, listés dans le détail. Montants à deux décimales.

Tests : redirection des anciens accès, dix destinations dans Plus, CRUD des crédits et prêt à taux zéro, persistance, mise à jour croisée, formats PDF et données manquantes. Les dialogues finaux d’enregistrement/partage restent à confirmer sur le téléphone.
