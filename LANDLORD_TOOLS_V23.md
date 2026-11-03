# ImmOptima V23 — navigation et outils bailleur

Six entrées fixes : Dashboard, Biens, Banque, Marché, Optimisation, Plus. Le doublon Optimisation du menu Plus est retiré ; toutes les pages existantes restent accessibles. La barre est contrôlée entre 320 et 430 px et conserve des cibles tactiles de 44 px au minimum.

Dans Biens : boutons « Indice IRL » et « Préparer un bail », plus accès contextualisé dans le menu de chaque bien. Un sélecteur permet de changer de logement ou de choisir une trame vierge.

## IRL

Valeurs INSEE embarquées et datées : historique 2024–2026 T3 pour métropole hors Corse, Corse et DROM. Source : https://www.insee.fr/fr/statistiques/9081853, publication du 15/10/2026, contrôlée le 03/11/2026. Les indices 2026 T3 sont respectivement 148,06, 143,80 et 145,21. Les valeurs ne s’actualisent pas automatiquement ; l’outil signale l’absence d’un trimestre dans la version et renvoie aux sources officielles. Il ne remplace jamais silencieusement le trimestre du bail par le dernier trimestre publié.

Calcul au centime : loyer HC courant (complément inclus) × nouvel indice / ancien indice du même trimestre et du même territoire. Charges exclues ; aucun loyer enregistré n’est modifié. Conditions : clause confirmée, bail classique, DPE précisé, date du bail en cours/renouvellement/reconduction, échéance annuelle, année cohérente, publication connue à la demande, demande dans l’année de l’échéance, absence de révision déjà indiquée pour cette échéance. Gel F/G selon territoire et date du bail ; bail mobilité et autres régimes exclus du calcul. Prise d’effet à la demande, sans rappel rétroactif. Les paramètres ne sont enregistrés qu’à la demande, avec le bien.

Règles : https://www.service-public.gouv.fr/particuliers/vosdroits/F13723 et https://www.service-public.gouv.fr/particuliers/vosdroits/F1311.

## Projet de bail

Trame de préparation, à compléter et vérifier avant signature, pour location nue ou meublée classique à usage de résidence principale. Les champs inconnus restent marqués. Les diagnostics, la notice et les autres pièces obligatoires ne sont pas générés ; une liste précise rappelle de les joindre. Pas de signature électronique ni d’envoi automatique. Baux mobilité, étudiants de neuf mois, commerciaux, sociaux, conventionnés et colocations à contrats séparés : modèle adapté nécessaire.

Le loyer prérempli vient du loyer réel du bien, pas d’une simulation d’optimisation. Qualité du bailleur à confirmer expressément : personne physique, personne morale ou SCI familiale répondant à l’article 13. Durée standard : nu 3 ans / 6 ans, meublé 1 an. Une SARL de famille n’est pas assimilée à une SCI familiale. Dépôt plafonné à un mois HC en nu et deux mois HC en meublé. Forfait non proposé pour un bail nu individuel. Clauses et mentions : parties, logement et identifiant fiscal, surface, équipements, DPE/énergie, servitude éventuelle, prise d’effet, durée, loyers/charges/paiement, encadrement et précédent locataire, révision éventuelle, travaux, garanties, clause résolutoire avec délai de six semaines dans le cadre légal, honoraires éventuels, annexes et signatures. Le projet ne constitue pas une validation juridique des données ou des plafonds locaux. Les champs conditionnels doivent être complétés ou marqués sans objet après vérification.

Modèles réglementaires contrôlés, applicables depuis le 01/10/2026 :
- Nu : https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000054393995
- Meublé : https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000054393993
- Guide : https://www.service-public.gouv.fr/particuliers/vosdroits/F920

Brouillon enregistré explicitement dans `property.landlordTools`, inclus dans les sauvegardes existantes. Textes temporaires isolés par compte et par bien ; fermeture de la fenêtre et blocage de l’export/enregistrement si le compte change. Pas de nouvelles requêtes réseau dans ces outils. Données des essais et documents d’exemple entièrement fictives.

Exports : texte UTF-8 modifiable et impression PDF A4 portrait. Nouveau pont Android `printLeaseDraft`, indépendant de l’impression bancaire A4 paysage. Le style de page du bail est retiré à la fermeture/fin d’impression pour préserver les exports bancaires. Une trame comportant des champs vides reste marquée PROJET.

## Contrôles

Tests purs IRL et trame : formule INSEE, trois territoires, centimes, trimestre absent, clause, DPE, mobilité, dates, publication, délai et doublon ; durées, dépôts, champs inconnus, avertissement décence et intégrité du patrimoine. Patch d’impression vérifié idempotent avec les deux orientations distinctes. Tests navigateur et Android complétés pour navigation, ouverture, saisie, sauvegarde/rechargement, sauvegarde/import, sécurité du rendu, isolation des brouillons et exports.

La validation finale et les empreintes de l’APK seront consignées après compilation. À vérifier sur téléphone réel : clavier et réglages de police, sélecteur de fichier pour le texte et enregistrement du PDF depuis le dialogue d’impression Android.
