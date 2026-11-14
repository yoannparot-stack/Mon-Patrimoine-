# ImmOptima — inventaire préparatoire des données et des responsabilités

Version du 14 novembre 2026. Cet inventaire décrit les sources préparées ; il ne prouve ni un déploiement ni la configuration contractuelle d’un prestataire. Les informations manquantes empêchent de déclarer les documents définitifs.

| Traitement | Données utiles | Destination | Finalité / base à documenter | Conservation |
|---|---|---|---|---|
| Fonctions locales | Biens, adresses, montants, épargne, crédits, détenteurs, historique ; données de locataires et documents si saisis | Appareil et stockage WebView | Service demandé ; responsabilité du bailleur pour les données de tiers à préciser | Jusqu’à effacement/remplacement ; brouillons et copies de récupération distincts |
| Connexion | UID Firebase, e-mail et données de connexion Google | Google/Firebase Authentication | Compte et sécurité ; modalités contractuelles à confirmer | Durée du compte et inactivité à arrêter ; suppression préparée du compte Auth |
| Sauvegarde du compte | Copie du patrimoine, révision et métadonnées | Firestore du projet configuré | Sauvegarde facultative avec autorisation distincte | Durée active/inactive et copies fournisseur à définir ; effacement récursif préparé |
| Exports et Drive | Patrimoine JSON, PDF, documents choisis | Fournisseur de fichiers/Drive/messagerie sélectionné par l’utilisateur | Export/partage demandé ; expliquer les destinataires choisis | Fichiers externes gérés séparément par l’utilisateur |
| Analyses de marché | Adresse/coordonnées et caractéristiques immobilières utiles | Services publics et service de comparaison si configuré | Analyse demandée, information sur les actualisations ; base applicable à confirmer | Cache local selon les modules ; journaux fournisseurs à vérifier |
| Essai | UID, date d’activation serveur | Firestore | Exécution de l’essai demandé ; prévenir les activations répétées sur le même compte | 90 jours d’essai ; durée de conservation du dossier après essai à définir |
| Achat futur | UID, jeton d’achat, produit, état et échéance | Google Play et vérification serveur | Gestion de l’abonnement ; obligations comptables à distinguer | Pas d’achat réel activé ; durées après fin à arrêter avant commercialisation |
| Suppression préparée | UID dans le chemin, statut et dates ; aucun contenu patrimonial ni e-mail dans le suivi | Fonction serveur / Firestore | Exécution de la demande et protection contre les anciens jetons | En attente jusqu’à exécution ; suivi minimal 24 h après succès, puis purge périodique |
| Quotas techniques | Compteurs agrégés, empreinte quotidienne de UID+jour, dates | Firestore | Prévention des abus et maîtrise des appels fournisseur | Échéance technique 3 jours, purge périodique préparée ; pas de patrimoine dans ces compteurs |

## Vérifications complémentaires avant publication

- Confirmer les régions, entités contractantes, sous-traitants et transferts effectifs ; ne pas annoncer « tout en France » ou « aucun transfert » sans preuve.
- Fixer et justifier les durées des comptes inactifs, des journaux et sauvegardes du fournisseur ; distinguer la suppression dans la base active et les copies techniques du prestataire.
- Inventorier les permissions du binaire commercial effectivement distribué et leur caractère obligatoire/facultatif. La page de suppression ne demande pas le patrimoine ; son SDK d’authentification est chargé au clic de connexion, sans Analytics.
- Définir l’assistance, la procédure d’exercice des droits et le traitement des demandes de tiers dont les données ont été saisies par un bailleur.
- Vérifier le rôle de l’éditeur et celui du client bailleur pour ces données de locataires, ainsi que les engagements nécessaires ; ne pas prétendre que la simple saisie autorise tous les traitements.
- Compléter la déclaration Google Play Sécurité des données depuis la configuration finale, sans copier automatiquement cette table comme une déclaration déjà validée.

Sources de contrôle : code local de l’application, ponts Android Auth/Cloud/Drive/Billing, règles Firestore, fonctions serveur et https://www.cnil.fr/fr/recommandations-applications-mobiles.
