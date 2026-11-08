# ImmOptima V37 — cohérence des écrans et fenêtres

La référence reste le rendu validé : Dashboard avec frise C, Biens avec liste B et fiche A, Banque/Marché/Optimisation dans leurs présentations existantes, Épargne en cartes et Mon compte B.

## Intervention

- Mon offre reprend le bandeau, les textes, les trois repères Bilan / Optimisation / Gestion et le comparatif Découverte / Premium approuvés. Les commandes et les liens juridiques restent accessibles quand le contenu doit défiler sur un petit écran.
- La carte Premium ouvre un écran de formules distinct. Le clic et le choix d’une formule ne déclenchent pas un achat. Les prix sont exclusivement ceux renvoyés par Google Play. Les achats restent désactivés ; les informations juridiques incomplètes ne permettent pas d’activer la commande.
- Les fenêtres de sauvegarde, d’aide, de parcours, de suivi et de menus partagent les détails de présentation : cartes blanches, titres bleu nuit, actions bleues, arrondis et cibles tactiles cohérents. Les analyses et fiches plein écran gardent leur structure spécifique.
- Les textes CGU, confidentialité et abonnement sont versionnés, consultables hors ligne et enregistrables en HTML. Ils sont accessibles avant la connexion initiale, depuis Mon compte et depuis les offres. Le lecteur se ferme avant la fenêtre située derrière ; lecture et export ne valent pas acceptation.

## Périmètre du contrôle

| Écran ou fenêtre | Référence et contrôle |
|---|---|
| Dashboard et ses quatre analyses | Frise C, indicateurs lisibles, petits écrans et Retour |
| Biens, fiches et formulaires | Liste B / fiche A, parcours, champs manquants et saisies conservées |
| Banque et financements | Synthèse, crédits, simulateur et export |
| Marché et Optimisation | Cartes, scénarios, sources et explications repliables |
| Épargne | Cartes, actions visibles, modification et montants |
| Mon bilan, Historique, Projection | Accès depuis les menus et absence de régression dans la suite générale |
| Mon compte | Statuts, sauvegardes, personnalisation et informations juridiques |
| Mon offre et formules Premium | Nouveau rendu, petits formats, absence d’achat à l’ouverture, retour à l’offre |
| Documents et outils bailleur | Bail, IRL, loyers, quittances et récapitulatif annuel |
| Aide, menus, sauvegardes et restauration | Lisibilité des commandes et Retour |
| CGU / Confidentialité / Abonnement | Textes préparatoires, lecture, export, focus et Retour |

## Résultats navigateur

Les six suites passent sur le contenu V37 : régressions générales, simplicité, parcours client, mono-bien, navigation/compte et nouvelle offre/juridique. Aucun échec ni erreur d’exécution n’est signalé par ces suites. Les nouveaux écrans ont été vérifiés à 320 × 568, 393 × 851 et 430 × 932 ; la suite générale inclut également 360 et 800 pixels de largeur.

Captures relues : huit onglets principaux, Historique, Projection, aide/recherche, tutoriel, Mon compte personnel / essai / Premium, suivi mensuel, offre, formules et confidentialité. Ces captures utilisent uniquement des données fictives. Historique affiche maintenant des cartes mobiles avec brut / dettes / net ; Projection regroupe ses hypothèses sur deux colonnes. Les formules et textes longs gardent leurs commandes accessibles grâce au défilement.

Les captures de marché « Non analysé » et d’épargne vide correspondent aux états de test, sans résultat inventé. Les essais de paiement emploient un transport simulé ; les prix de test ne sont pas des tarifs commerciaux.

## Résultats Android et APK

L’APK installée passe les suites sur Android 14 (API 34, exécution 42527953942) et Android 16 (API 36, exécution 42528393476). Les contrôles incluent le rendu réel, le toucher natif, le Retour physique, les fenêtres de l’offre et du juridique, les sauvegardes et la conservation des données fictives. Le texte exact du bandeau est contrôlé dans le DOM et le titre visible par OCR. Le harnais reconnaît uniquement le dialogue connu du lanceur système de l’émulateur pour reprendre une touche interceptée ; il n’ignore ni erreur de l’application ni clic incorrect.

APK : ImmOptima-Test-v37.apk ; paquet com.immoptima.app ; versionCode 37 ; 7 761 146 octets. Source applicative e1ed0c6379f125e1f61d572f9fdf6e7eb601bcdf, compilation 42527208445. Les corrections ultérieures concernent uniquement les tests et leurs workflows.

SHA-256 : c7a52e2aa7b65acc91a3c21549507674d06272727c60fe827d057c39c49b715d.

Le contenu embarqué correspond aux dix fichiers principaux vérifiés. Le certificat est celui de V36, empreinte SHA-256 fed154b7a4201230dabe6c08d1365d471d62464dbbc596ca37c383479cbbee35. Le paiement reste désactivé dans la configuration embarquée. Installation par-dessus V36 après sauvegarde, sans désinstallation.

## Limites de publication

Les textes sont des projets adaptés aux fonctions inspectées ; ils ne sont pas déclarés prêts à la commercialisation. Identité et coordonnées de l’éditeur, hébergement et transferts, durées de conservation, médiateur, pages publiques et suppression effective du compte restent à finaliser. Aucune identité, adresse d’assistance ni adhésion à un médiateur n’est inventée. Aucun achat réel Google Play ni étude auprès de vrais clients n’a été effectué.
