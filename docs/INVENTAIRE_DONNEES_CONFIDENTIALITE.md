# ImmOptima — inventaire préparatoire des données et des responsabilités

Version du 15 novembre 2026. Cet inventaire décrit les sources préparées ; il ne prouve ni un déploiement ni la configuration contractuelle d’un prestataire. Les informations manquantes empêchent de déclarer les documents définitifs.

| Traitement | Données utiles | Destination | Finalité / base à documenter | Conservation |
|---|---|---|---|---|
| Fonctions locales | Biens, adresses, montants, épargne, crédits, détenteurs, historique ; données de locataires, notes, photos de biens et documents si saisis | Appareil et stockage WebView | Service demandé ; responsabilité du bailleur pour les données de tiers à préciser | Jusqu’à effacement/remplacement ; brouillons et copies de récupération distincts |
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

## Complément du 15 novembre

La photo facultative d’un bien est embarquée dans le patrimoine JSON et peut donc quitter l’appareil lors d’une sauvegarde autorisée. Elle doit être examinée comme catégorie Photos dans la déclaration Play. Les SDK Firebase Auth 23.2.1 et Firestore 25.1.4, Google Play Services Auth 21.5.0 et Billing 8.3.0 sont demandés par les scripts Android ; les dépendances transitives et le manifeste fusionné restent à relever sur le binaire final. Le formulaire préparé et ses conditions sont dans `DECLARATIONS_GOOGLE_PLAY.md`. Aucun audit de trafic réel ou audit indépendant de sécurité n’est revendiqué.


## Relevé du binaire client V52 — 22 novembre 2026

Le manifeste release fusionné et l’arbre des dépendances ont été relevés dans la compilation 45054419836 (source applicative 2278d4c625d9d4ef3b5e273c5b471e1d57f2d6ec). Le JSON du manifeste et les dépendances complètes sont joints aux preuves de compilation du kit.

| Permission déclarée | Utilisation à rapprocher des fonctions réelles |
|---|---|
| android.permission.INTERNET | Services réseau de connexion, sauvegarde et fonctions distantes |
| android.permission.ACCESS_NETWORK_STATE | État de connexion réseau des SDK |
| com.android.vending.BILLING | SDK de la future souscription ; la configuration d’achat est désactivée |
| com.google.android.providers.gsf.permission.READ_GSERVICES | Dépendances Google ; ne signifie pas une permission de lecture des comptes bancaires |

La liste ne contient pas de permission caméra, microphone, localisation, contacts, SMS ou lecture étendue des médias. La sélection d’un fichier ou d’une photo par le sélecteur système reste un parcours distinct ; une photo intégrée au patrimoine peut ensuite être transmise dans la sauvegarde autorisée. L’absence de permission générale sur les photos ne permet pas de déclarer qu’aucune photo n’est collectée.

`allowBackup` est explicitement faux dans le manifeste relevé. `usesCleartextTraffic` n’y est pas explicitement défini : ne pas présenter ce relevé seul comme une mesure de trafic ou comme une preuve exhaustive des échanges réseau.

Versions résolues : Firebase Auth 23.2.1, Firestore 25.1.4, Google Play Services Auth 21.5.0 et Billing 8.3.0. Les dépendances transitives figurent dans le fichier complet ; leurs traitements techniques doivent être rapprochés des informations fournisseur. Aucun audit de trafic réel, accord fournisseur ou déclaration Play soumise n’est revendiqué par ce relevé.
