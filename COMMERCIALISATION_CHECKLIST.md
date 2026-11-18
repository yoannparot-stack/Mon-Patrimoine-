# ImmOptima — préparation de la commercialisation

Mise à jour du 18 novembre 2026. Cette liste remplace les états techniques anciens du 25 octobre ; elle sépare les tests simulés et les preuves opérationnelles. Elle ne vaut pas autorisation de mise en vente.

## Préparation technique disponible

- Dernière livraison validée avant cet audit : APK personnelle V47 et bundle bêta V48, Android 14/API34 et Android 16/API36. Voir `docs/CORRECTION_QUITTANCES_V47.md`.
- Audit du 18 novembre : APK personnelle V49 et bundle bêta V50 compilés ; tests navigateur, règles Firestore et APK installé sur émulateurs Android 14/API34 et Android 16/API36 réussis. Exécution : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/44259606825. Ces tests ne remplacent pas les essais des services réels.
- Un bilan gratuit pour un bien, essai mono-bien de 90 jours activé volontairement, absence de conversion automatique ; multi-biens client soumis à droits vérifiés.
- Version personnelle débloquée distincte : ne jamais la déposer pour les clients.
- Préparation des clients isolée, refus des anciens dossiers non vides, retrait des branches personnelles et empreintes des fichiers. Achats et suppression opérationnelle désactivés.
- Tests ajoutés pour refuser les réponses incohérentes d'abonnement et d'essai ; confirmation native et compte doivent correspondre.
- Kit testeurs, fiche française, inventaire des données et pages d'information préparés. Aucun testeur contacté et aucune déclaration Console soumise.

## Avant ouverture d'une bêta client

| Vérification | État réel à établir | Intervention |
|---|---|---|
| Compte Google Play adapté | Type et vérification à confirmer, notamment au regard des fonctions financières | Titulaire et réponse Google |
| Éditeur et textes | Responsable connu ; voie en nom propre sans société choisie ; formalisation EI/régime et mentions, durées et contrats à finaliser | Titulaire avec préparation technique |
| Pages publiques | Préparées ; URL HTTPS réellement publiée et vérifiée nécessaire | Déploiement après finalisation et accès |
| Connexion et essai | Un vrai compte client distinct du propriétaire ; activation unique confirmée | Compte jetable et téléphone |
| Sauvegarde du compte | Consentement, écriture réellement confirmée, restauration sur un deuxième appareil | Deux appareils de test |
| Suppression | Traitement effectif, verrou des anciennes sessions, autres comptes préservés, confirmation exacte | Compte jetable, accès administrateur et confirmation au moment de la suppression |
| Signature Play | Empreintes de la signature distribuée enregistrées et connexion Google vérifiée | Console Play/Firebase |
| Déclarations | Données, SDK, fonctions financières, public cible, contenu et accès examinateur conformes au binaire et aux services actifs | Dossier préparé, envoi à effectuer |
| Test Google Play | Piste interne puis fermée selon les exigences applicables au compte | Vrais volontaires et suivi |

Pour les nouveaux comptes personnels concernés par la règle Google : au moins 12 testeurs inscrits au test fermé pendant 14 jours consécutifs, puis demande d'accès à la production ; l'accès n'est pas automatique. Ce délai est distinct de l'essai produit de 90 jours. Vérification documentaire du 18 novembre 2026 : https://support.google.com/googleplay/android-developer/answer/14151465

## Avant encaissement d'abonnements

- Activité et conditions de vente adaptées au statut retenu, garanties et rétractation ; informations de paiement saisies dans Google par le titulaire.
- Produits Google Play correspondant aux tarifs de présentation validés : 3,99 €/mois et 39,99 €/an. Les prix réellement renvoyés par Play font foi au moment de l'achat.
- Vérification serveur et événements d'abonnement effectivement déployés et surveillés ; choix de l'hébergement et du budget approuvé. Le projet Firebase a été constaté sur Spark le 15 novembre ; aucun passage à Blaze n'est réalisé par les préparatifs.
- Essais Google avec comptes de licence : achat approuvé/annulé/en attente, restauration, relance, renouvellement, résiliation, expiration, suspension, remboursement et notifications tardives ou rejouées.
- Dépôt de la version client, validation Google et décision de lancement du titulaire.

## Protection des données et limites

Assistance uniquement par e-mail : immoptima12@gmail.com. Les coordonnées légales de l'éditeur et celles exigées publiquement par Google sont un sujet distinct du canal d'assistance. Ne jamais recopier des coordonnées personnelles dans le dépôt public sans nécessité vérifiée.

Préserver la référence `Mon_Patrimoine_V24_Optimisation_CONTROLEE-3.html`. Ne jamais ajouter de clé privée, token, fichier réel de patrimoine, liste de testeurs ou capture de compte dans ce dépôt. Les preuves d'essais réels contenant des identifiants restent privées.

Après reconnexion du titulaire le 18 novembre, accès Firebase confirmé : Google activé, droit propriétaire présent, Firestore eur3 et règles actives du 15 novembre. Play ouvre l'inscription développeur ; aucun type de compte choisi. Ces contrôles de console ne certifient pas une sauvegarde, une activation d'essai ou une suppression depuis une vraie application cliente. Voir `docs/MISE_EN_SERVICE_ET_DECISIONS.md` pour la décision d'exercer en nom propre, sans société.
