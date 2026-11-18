# ImmOptima — ce qui peut être finalisé et ce qui nécessite le titulaire

18 novembre 2026. Aucune facturation, mise en ligne, invitation, création de compte Play ou suppression réelle n'a été effectuée par ce dossier.

## Préparation réalisée

Audit des droits côté client ; refus des réponses expirées ou incohérentes ; préparation séparée des clients et du déblocage personnel ; tests de droits et de conservation des données ; compilation V49/V50 et tests Android 14/16 réussis ; dossier Google Play, kit testeurs, pages préparatoires et contrôle de complétude.

## Décisions et accès encore nécessaires

| Sujet | Information ou action exacte attendue | Pourquoi la préparation ne suffit pas |
|---|---|---|
| Connexion Google | Accès Firebase confirmé après connexion du titulaire ; Play ouvre l'inscription développeur sur le compte connecté | Connexion console acquise ; elle ne certifie pas les parcours de l'application cliente |
| Statut de commercialisation | Voie choisie : activité en nom propre, sans société ; préparer l'entreprise individuelle, régime micro à vérifier selon la situation existante | Choix confirmé, aucune formalité d'immatriculation ou d'ajout d'activité déposée |
| Coordonnées publiques | Résoudre les obligations applicables et la protection souhaitée de l'adresse/téléphone personnels | L'assistance par e-mail ne dispense pas des mentions légales ou Google |
| Conservation et contrats | Valider les durées réellement tenables, le suivi de la boîte mail, les contrats et garanties fournisseur | Les délais préparés dans le code ne décrivent pas les journaux et copies du fournisseur |
| Compte Play | Confirmer le type adapté et le retour du support ; procéder aux vérifications, accords et frais Google | La fiche et un AAB ne créent pas le compte ni l'autorisation de vendre |
| Test réel | Compte jetable autorisé et accès à deux téléphones pour connexion, sauvegarde, restauration et suppression | Les tests automatisés emploient des identités/transport fictifs |
| Paiements | Choix d'hébergement et budget, produits, compte de paiement et vérification serveur | Le paiement à l'usage éventuel ne doit pas être activé implicitement |
| Testeurs | Volontaires confirmés et leurs comptes Google inscrits au canal | Aucun testeur ni durée de test ne peut être inventé |

## Pages : préparation et publication sont distinctes

Le paquet statique contient Conditions d'utilisation, Confidentialité, Abonnement, Assistance et Suppression par e-mail, dans l'identité ImmOptima. Il ne charge pas de service automatique de suppression dans la variante bêta.

Exécuter `node scripts/publication-preflight.cjs beta` affiche les éléments incomplets. Ce contrôle de texte ne certifie pas les services réels. Tant qu'il signale des blocages et que les procédures ne sont pas testées, ne pas utiliser les pages comme déclarations définitives.

Après finalisation, le déploiement statique devra utiliser uniquement Hosting pour le site déjà associé, avec la configuration préparée ; ne pas lancer un déploiement général incluant Functions. Vérifier ensuite les URL HTTPS depuis une session sans connexion et les liens intégrés à l'application. Les fonctions serveur et l'activation des achats restent une opération séparée.

## Sources officielles revérifiées le 18 novembre

- Tests et accès à la production : https://support.google.com/googleplay/android-developer/answer/14151465
- Compte personnel/organisation : https://support.google.com/googleplay/android-developer/answer/13634885
- Données et SDK : https://support.google.com/googleplay/android-developer/answer/10787469
- Demande de suppression dans l'application et sur le Web : https://support.google.com/googleplay/android-developer/answer/13327111
- Spark, Blaze et Cloud Functions : https://firebase.google.com/docs/projects/billing/firebase-pricing-plans

## Décision confirmée : activité en nom propre

Le titulaire choisit de commercialiser ImmOptima en nom propre et ne souhaite pas créer de société. Préparer la voie de l'entreprise individuelle ; ne présumer ni l'éligibilité au régime micro, ni une immatriculation nouvelle, ni le type de compte Play à partir de ce seul choix.

1. Restriction explicite du titulaire : ne pas ajouter ImmOptima au SIREN de son activité locative et ne modifier ni cette activité ni son inscription. Aucune formalité de rattachement n'a été déposée. La voie administrative compatible avec cette séparation et l'exercice en nom propre reste à déterminer : une personne ne peut pas posséder plusieurs entreprises individuelles. Ne pas promettre un deuxième SIREN, ni confondre établissement/SIRET et entreprise/SIREN. La vérification doit porter sur les modalités possibles auprès du guichet unique et des organismes compétents avant tout dépôt ; aucune autorisation de rattachement n'est déduite de la demande de simplification.
2. Décrire l'activité envisagée : édition et exploitation d'une application de suivi patrimonial, accès logiciel par abonnement ; pas de gestion de fonds de tiers, de prêt ou d'exécution d'investissements. Faire confirmer la qualification fiscale/sociale et les interactions avec la location meublée ; ne pas appliquer automatiquement les règles sociales du micro-entrepreneur aux loyers LMNP.
3. Préparer les mentions de l'éditeur en nom propre avec la mention EI lorsqu'applicable et l'identification professionnelle après vérification. Ne pas présenter un statut administratif comme déjà obtenu.
4. Conserver l'assistance exclusivement par immoptima12@gmail.com. Les coordonnées légalement exigées restent distinctes ; ne recopier aucune coordonnée personnelle réservée sans nécessité vérifiée.
5. Garder l'inscription Play en attente de la qualification adaptée ; un entrepreneur individuel n'est pas automatiquement admissible au compte personnel Google. La question des fonctions financières reste à confirmer auprès de Google. Aucune société, aucun compte Play, engagement ou paiement créé par cette décision.
6. Continuer la préparation et les tests APK. Les essais d'achat et la distribution Play devront attendre le compte développeur finalisé.

Sources vérifiées : https://entreprendre.service-public.gouv.fr/vosdroits/F37398 ; https://entreprendre.service-public.gouv.fr/vosdroits/F33339 ; https://support.google.com/googleplay/android-developer/answer/13634885.

## Consoles vérifiées après reconnexion le 18 novembre

Firebase : projet ImmOptima, package com.immoptima.app, empreintes personnelles SHA-1/SHA-256 présentes ; Google est le fournisseur de connexion activé. Droit propriétaire enregistré ; base Firestore en eur3 et règles actives datées du 15 novembre. Aucun identifiant individuel copié ici. Hosting présente encore son démarrage : aucune publication effectuée pendant la vérification. L'adresse d'assistance configurable dans les paramètres du projet propose uniquement le compte propriétaire ; le contact public dédié n'a pas été ajouté en lui accordant des droits administrateur. Play affiche la sélection du type de compte développeur ; aucun type choisi, contrat accepté, frais payés ou AAB déposé.
