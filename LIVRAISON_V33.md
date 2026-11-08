# ImmOptima — V33 personnelle de test

## Intégrations

- Démarrage selon l’objectif : suivre les loyers, préparer un dossier bancaire ou renseigner tout le patrimoine. Les étapes et champs initiaux suivent cet objectif ; le brouillon conserve l’étape après rechargement.
- Langage courant : solde mensuel avant impôts, loyer hors charges, repère estimé.
- Bloc « Ce mois-ci » : encaissements renseignés et saisies à vérifier, ouverture du logement et du mois exacts, quittance facultative lorsque les conditions sont réunies.
- Une saisie absente ne devient jamais un impayé. Une déclaration d’encaissement ne vaut pas vérification bancaire ; les identités historiques ne sont pas remplacées silencieusement.
- Présentation des bénéfices multi-biens et aperçu fictif sans modification du patrimoine. Aucun changement des droits personnels ou des restrictions commerciales.
- Retours courts après enregistrement réussi ; préparation à l’écran d’un document distinguée de son téléchargement ou de sa transmission.
- Adaptation du tableau de bord aux écrans courts conservant les quatre cartes et la navigation.

## Source et APK

- Branche : `personal/immoptima-access-v25` ; aucune modification de main ou de la référence V24.
- Source applicative : `f5105dc039c9b39eb30db708952d8b58646f69c7`. Ajustement du démarrage du test Android uniquement : `354d7f46e9d26803d53ad42e0df4d336e49f706e`.
- Exécution finale : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/42467413664
- L’APK de cette exécution est strictement identique, octet par octet, à celle compilée sur la source applicative précédente.
- Fichier : `ImmOptima-Test-v33.apk` ; 7 370 504 octets.
- Package : `com.immoptima.app` ; versionCode 33. Le versionName technique reste `1.3.2-preview`.
- SHA-256 APK : `32a36deda6445327e1342980839fcc846689d8366f23baf560f44c283667107e`.
- Certificat SHA-256 : `fed154b7a4201230dabe6c08d1365d471d62464dbbc596ca37c383479cbbee35`, identique à V32.
- Vérification octet par octet des ressources embarquées : index.html, client-journey.js, first-use.js, client-simplicity.js, client-experience.js, rental-management.js, rental-optimization.js, property-readiness.js.
- Installation attendue en mise à jour de V32, sans désinstallation. Faire une sauvegarde préalable du patrimoine réel.

## Vérifications

- Quinze suites JavaScript locales réussies ; neuf tests des fonctions cloud réussis.
- Trois suites sur Chromium mobile réussies, sans erreur JavaScript : régressions générales, simplification, nouveau parcours client.
- Parcours réel dans le navigateur avec données fictives : patrimoine vide sans détenteur, création du bailleur et du premier bien, objectif loyers, interruption/reprise, dossier locatif, encaissement, suivi mensuel et aperçu de quittance ; objectif bancaire ; aperçu multi-biens vérifié sans mutation des données.
- Régressions générales : cinq largeurs de 320 à 800 px, sauvegarde/import et rollback, calculs/crédits, formulaires, documents, navigation et accès.
- Captures des nouveaux écrans inspectées visuellement : choix de l’objectif, suivi mensuel renseigné et explication multi-biens ; tableau de bord contrôlé.
- Audit des règles cloud et des restrictions d’abonnement réussi sur émulateur, sans écriture en production.
- Android 14 / API 34 et Android 16 / API 36 : suites réussies sur l’APK installée lors de l’exécution finale, construction et audit cloud également réussis.
- Les deux premiers essais API 36 ont échoué lors d’une recréation de l’activité par l’émulateur : le contrôle pilotait un WebView devenu masqué tandis que l’écran affichait le nouveau tableau de bord. Journaux et capture examinés ; le démarrage du test attend la stabilisation de la configuration initiale de l’émulateur et exige cinq secondes de cible native attachée, visible et de dimensions stables avant injection des données fictives. Le focus DOM, absent avant le premier toucher sur certains WebView, ne constitue pas le critère de disponibilité. Les contrôles d’interaction et de capture restent inchangés ; aucun échec utilisateur n’est masqué par une reconnexion en cours de parcours.

Les suites Android contrôlent le rendu de l’APK, la navigation native, le bouton Retour et la confirmation avant fermeture, la persistance et les régressions existantes. Les nouveaux parcours métier sont couverts par les trois suites navigateur ; il ne s’agit pas d’une étude d’utilisabilité sur des téléphones physiques.

## Avis du point de vue client

L’application aide davantage à accomplir une première tâche au lieu d’imposer une fiche complète d’emblée. Le suivi mensuel rend l’usage récurrent visible. La consolidation du patrimoine, les financements et les documents locatifs forment un ensemble utile pour plusieurs biens.

L’effort principal reste l’entrée des données réelles et la confirmation des encaissements : il n’existe pas de rapprochement bancaire automatique. Pour un seul logement stable, le paiement peut rester difficile à justifier. Pour plusieurs biens et un usage régulier, la centralisation apporte une valeur plus tangible ; cela reste à confronter à de vrais utilisateurs et à un prix réel.

La version personnelle reste gratuite et débloquée. Les contrôles commerciaux exigent un abonnement actif pour le multi-biens, y compris à l’import ; le véritable parcours de paiement, renouvellement et résiliation n’est pas intégré ni validé. Les estimations locatives demeurent indicatives ; cette version n’active aucun nouveau flux d’annonces en direct.

La priorité suivante est un essai avec le patrimoine réel, puis quelques utilisateurs extérieurs, sans ajouter de nouvelles fonctions avant ces retours.
