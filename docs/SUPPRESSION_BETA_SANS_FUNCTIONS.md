# ImmOptima — variante de suppression manuelle pendant la bêta

15 novembre 2026. Variante préparatoire pour conserver le forfait Spark : page statique et demande à l’assistance, sans Cloud Functions ni tâche planifiée déployées. Aucune demande réelle n’a été envoyée et aucun compte n’a été supprimé.

Google Play prévoit qu’une ressource Web de suppression puisse proposer un e-mail de service client ou un formulaire. Cela exige une procédure effective : un simple bouton e-mail ne prouve pas que le compte et ses données seront effacés. Référence : https://support.google.com/googleplay/android-developer/answer/13327111?hl=fr, rubrique sur les exigences de la ressource Web.

## Parcours proposé

La page `public-account/suppression-beta.html` explique les données concernées et permet de préparer un e-mail à **immoptima12@gmail.com**, sans envoyer de message automatiquement. Le demandeur l’envoie de préférence depuis l’adresse de son compte ImmOptima. Le bouton, l’envoi du message, l’accusé de réception et la suppression effective sont distingués. Aucun patrimoine, mot de passe ou document d’identité n’est demandé par défaut.

Le délai à annoncer, le suivi de la boîte d’assistance et la conservation des échanges sont à valider avant mise en service. La suppression n’est pas subordonnée à une souscription, à la réinstallation de l’application ou à une résiliation préalable.

## Procédure opérateur à tester avant ouverture

1. Enregistrer la demande dans un suivi privé ; ne pas placer d’adresse ou d’identifiant individuel dans le dépôt public. Vérifier l’identité du demandeur et le compte exact dans Authentication. Ne jamais traiter une adresse donnée par un tiers comme une autorisation suffisante.
2. Après confirmation de la demande, préparer le verrou `accountDeletions/<UID exact>` avec `status: pending`. Les règles publiées bloquent les anciens accès à ce compte. Vérifier l’effet du verrou avant toute suppression. Désactiver le compte dans Authentication pour empêcher de nouvelles connexions pendant l’opération.
3. Après vérification du compte et confirmation explicite de l’action irréversible, supprimer **uniquement** ses données : `users/<UID>` et sous-collections, `accountAccess/<UID>`, `rentalAccess/<UID>`, `rentalTrials/<UID>`, références `playPurchases` portant ce même UID, compteurs techniques individuels connus. Préserver les autres comptes et les configurations communes. Les suppressions ne sont pas exécutées par ce document.
4. La suppression d’un document depuis la console Firestore inclut ses données imbriquées selon la documentation Firebase ; une suppression isolée par SDK ne le fait pas automatiquement. Vérifier l’absence de sous-collections restantes et de références indirectes. Référence : https://firebase.google.com/docs/firestore/manage-data/delete-data, section Console.
5. Supprimer ensuite le compte Authentication après vérification des données effacées. Ne jamais supprimer le compte Google. Une erreur laisse la demande en cours et nécessite une reprise ; elle ne justifie pas une confirmation de succès.
6. Après succès, le marqueur minimal de suppression bloque les anciennes sessions pendant au moins 24 heures. Sa purge exige une action opérateur distincte, après contrôle du délai et des anciennes sessions. Aucun passage automatique toutes les quinze minutes n’est annoncé dans cette variante. Prévoir et tester la purge des compteurs expirés et des autres traces selon les durées réellement retenues.
7. Confirmer au demandeur seulement ce qui a été vérifié. Expliquer que ses exports, fichiers Drive, copies locales, justificatifs détenus par Google et éventuel renouvellement Google Play restent distincts. Les durées des journaux ou copies gérées par Google doivent être renseignées à partir des contrats et réglages réels.

Si une automatisation est utilisée pour ce traitement, reprendre le moteur `functions/account-deletion-core.cjs`, déjà testé avec identité et stockage fictifs, sans retirer les vérifications d’identité ou de cible. Ne pas lancer de script administrateur sur le compte personnel de l’éditeur pour valider cette procédure.

## Mise en ligne statique à préparer

`node scripts/prepare-beta-account.cjs <répertoire distinct>` prépare les pages pour revue et une configuration Hosting **sans réécriture vers une fonction**. Ce script ne déploie rien. Le site Firebase associé à l’application Web est `immoptima-6af3b` ; l’association est vérifiée en console et n’équivaut pas à une publication.

Les politiques copiées gardent leur statut préparatoire et décrivent la variante manuelle : pas de confirmation automatique du serveur ni de tâche de purge annoncée. Les durées, le délai et la procédure effective doivent encore être validés avant publication : ne pas utiliser ce paquet comme dossier définitif à déposer chez Google.

L’application et la configuration Android conservent le lien de suppression désactivé. Après publication et test réel de la variante choisie, renseigner la bonne URL. Le texte de la fenêtre Android décrit maintenant le traitement manuel ; son accès reste désactivé jusqu’à ces vérifications. Ne pas présenter une confirmation Google automatisée alors que l’utilisateur passe par e-mail.

## Vérification de bout en bout restant nécessaire

Sur un compte client jetable : demande depuis la bonne adresse, contrôle d’identité, verrou et refus des anciennes sessions, suppression de toutes les données liées, autre compte préservé, confirmation exacte, puis purge du marqueur après délai. Aucun résultat positif ne doit être déclaré sur la seule base d’un lien `mailto:` ou de tests de navigateur.

Les opérations Firestore restent soumises aux quotas et conditions du projet. Conserver Spark évite d’activer la facturation des fonctions ; cela ne constitue pas une promesse de capacité illimitée.

## Coordonnées et assistance

Le titulaire a communiqué séparément des coordonnées personnelles avec une restriction d’usage aux obligations vérifiées. Elles ne sont pas recopiées dans le dépôt public, les captures ou les exports préparatoires. Le support reste exclusivement par e-mail. Cela ne vaut pas exemption des mentions légalement requises pour l’édition professionnelle, ni des informations vérifiées et affichées par Google. Références vérifiées le 15 novembre 2026 : article 1-1 de la LCEN ; aide Google Play 13628312. Les coordonnées doivent être intégrées uniquement au périmètre légal nécessaire, après examen de la version réellement publiée.

Dans Mon compte, l’action d’assistance ouvre le composeur Android vers l’adresse dédiée avec un objet générique. Elle ne remplit aucun patrimoine, identifiant ou diagnostic et n’envoie pas le message. Si aucune messagerie n’est installée, l’application affiche l’adresse à utiliser ailleurs. Cette action ne crée ni demande de suppression ni abonnement.
