# Suppression du compte — préparation technique V41

Aucun déploiement, aucune suppression réelle et aucune facturation n’ont été activés. La suppression est implémentée dans les sources et doit être éprouvée sur un compte jetable avant mise en service.

## Parcours

Mon compte → Données et confidentialité → Supprimer mon compte ouvre une explication dans la charte validée. Elle distingue compte, données cloud, copies locales/Drive/exports et abonnement Google Play. La page Web est ensuite ouverte dans le navigateur externe, sans jeton dans l’URL. L’utilisateur choisit le compte Google concerné ; l’identité est affichée avant case de confirmation et saisie de SUPPRIMER. La même page reste utilisable sans réinstaller l’application.

La demande HTTP accepte seulement l’identifiant prouvé par le jeton Firebase ; aucun UID, chemin ou e-mail choisi dans le corps n’est accepté. Authentification récente de moins de cinq minutes, vérification de révocation, confirmation et activation serveur sont nécessaires avant création de la demande. Les appels GET de suivi ne déclenchent pas de suppression. Un ancien jeton encore signé peut consulter uniquement le statut de sa propre demande pendant son traitement, même après révocation.

## Données concernées et protection des anciennes sessions

`accountDeletions/{uid}` est un verrou inaccessible aux clients. Les règles Firestore bloquent immédiatement les lectures/écritures, droits et essais du compte concerné dès l’enregistrement de la demande. Les transactions serveur de facturation et de quota tiennent aussi compte du verrou ; l’acquittement d’un achat ne recrée pas un document effacé.

Le traitement désactive le compte, révoque les sessions, efface récursivement `users/{uid}` (sous-collections incluses), `accountAccess/{uid}`, `rentalAccess/{uid}`, `rentalTrials/{uid}`, les références `playPurchases` liées et les compteurs quotidiens hachés récents, puis supprime Authentication. Il n’efface ni un autre compte ni les documents de configuration communs. Un échec laisse une demande en attente de reprise, jamais une fausse confirmation. Les demandes sont reprises par déclencheur Firestore et tâche toutes les 15 minutes, limitée à 20 demandes par passage ; surveiller les demandes durablement en attente et dimensionner avant ouverture.

Après succès, le suivi minimal ne contient que statut et dates dans le document identifié par UID. Il reste 24 heures pour bloquer les jetons encore émis, puis est purgé par la tâche périodique. Les compteurs expirés sont aussi purgés. Une durée de conservation distincte doit être confirmée pour les journaux et sauvegardes des prestataires ; ne pas promettre leur effacement instantané. Un abonnement actif Google Play n’est ni résilié ni remboursé automatiquement par ce traitement.

Les fichiers locaux, brouillons et copies déjà exportées restent sur leurs supports ; l’utilisateur peut exporter puis effacer les données de l’appareil depuis les réglages. La suppression serveur ne prétend pas effacer à distance un téléphone hors ligne. Elle ne supprime pas le compte Google.

## Activation à réaliser après validation

1. Confirmer le projet, les coûts, les accès administrateur et les informations d’éditeur. Cloud Functions, déclencheur Firestore et tâche planifiée nécessitent la configuration de facturation adaptée ; aucune activation automatique ici.
2. Enregistrer/configurer une application Web Firebase pour le même projet, activer le fournisseur Google et autoriser le domaine d’hébergement. Les SDK Web ne sont chargés qu’au clic sur la connexion ; session de la page en mémoire, sans Analytics ni stockage du jeton par le code applicatif.
3. Déployer les nouvelles règles et les seules fonctions de suppression nécessaires, ainsi que leurs permissions. Ne pas activer la collecte payante ni les achats pour effectuer ce déploiement. Les règles bloquantes doivent être en place AVANT d’autoriser une demande.
4. Déployer les pages `public-account` avec la réécriture `/api/account-deletion` vers `accountDeletion`. Elles incluent les CGU, confidentialité et abonnement régénérés depuis la source canonique. Compléter les textes avant publication commerciale. Le fichier `firebase.json` décrit la préparation ; ne pas écraser un autre hébergement existant sans vérifier le site cible.
5. Activer `deletionService/config.enabled` et `public-account/account-services.json.deletionEnabled` seulement sur le canal de validation prévu. Configurer l’URL HTTPS réelle dans `account-deletion/config.json`, sans jeton ni identifiant dans l’URL, puis produire la version Android correspondante.
6. Tester sur compte jetable : sous-collections, droits/essai, références d’achat fictives, autre compte conservé, doublon, panne/reprise, refus de recréation avec une ancienne session, résultat confirmé et purge différée. Vérifier le compte supprimé dans Authentication et Firestore ainsi que la page hors application.
7. Après ces vérifications réelles, renseigner `legal-content.js` avec les URL et `deletionVerified`, puis régénérer les pages. La configuration légale et les achats restent bloqués tant que les autres éléments ne sont pas finalisés.

## Validation avant accès clients

- Tester la page sur un navigateur de téléphone réel ; choix du bon compte, annulation de connexion, compte différent de celui de l’application, absence de réseau et expiration du jeton.
- Expliquer comment contacter l’assistance si une demande reste en attente au-delà du délai annoncé par l’éditeur.
- Vérifier la résiliation depuis Google Play séparément, sans bloquer la suppression sur la possession d’un abonnement ou l’installation de l’app.
- Compléter la déclaration Sécurité des données après inventaire final des services réellement déployés.

Références : https://support.google.com/googleplay/android-developer/answer/13327111 ; https://firebase.google.com/docs/firestore/manage-data/delete-data ; https://firebase.google.com/docs/auth/admin/manage-users ; https://firebase.google.com/docs/auth/admin/manage-sessions ; https://www.cnil.fr/fr/recommandations-applications-mobiles.
