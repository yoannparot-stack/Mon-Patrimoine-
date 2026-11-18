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

## Préparation isolée et transportable — 16 novembre 2026

Le générateur refuse désormais un dossier de sortie non vide : un ancien fichier de suppression automatique ne doit pas rester dans une variante manuelle. Il refuse également une destination située dans les pages sources, y compris via un lien symbolique. Le refus conserve les fichiers existants.

La configuration statique utilise un chemin relatif au dossier préparé ; le paquet peut ainsi être déplacé avant revue. Les métadonnées de préparation et les configurations Firebase sont exclues des fichiers à servir. Aucun déploiement n'est effectué.

Le contrôle `node scripts/check-static-beta.cjs` vérifie le contenu du paquet, les cibles locales des liens, l'absence de scripts/formulaires actifs, le lien de suppression par e-mail, le déplacement du paquet et les refus sans modification des sources. Ces contrôles ne valident ni les mentions légales manquantes, ni une demande ou une suppression réelle.

## Contrôle opérateur en lecture seule — 18 novembre 2026

Un contrôle séparé, `scripts/audit-account-deletion.cjs`, inventorie les données résiduelles d'un UID exact. Il ne supprime rien, n'écrit aucun document, ne modifie aucune règle et ne crée aucun droit. Il n'est pas embarqué dans l'APK. Son rapport ne contient ni contenu du patrimoine, ni adresse e-mail, ni jeton d'achat.

Dans un environnement administrateur déjà autorisé, avec les dépendances `functions` installées et une identité Application Default Credentials appropriée :

```sh
node scripts/audit-account-deletion.cjs --project immoptima-6af3b --uid IDENTIFIANT_EXACT_VERIFIE
```

La connexion au navigateur Firebase ne connecte pas ce programme. Ne pas récupérer de cookie ni transmettre de clé privée dans le chat ou le dépôt pour l'exécuter. Les autorisations nécessaires doivent être organisées séparément ; aucune nouvelle identité administrateur n'est créée par cet outil. Les lectures consomment les quotas du projet.

Le contrôle vérifie Authentication, les documents et sous-collections de `users`, `accountAccess`, `rentalAccess` et `rentalTrials`, une éventuelle référence d'achat liée au même UID, quatre jours de compteurs hachés et le marqueur de traitement. La recherche de descendants utilise `listDocuments`, qui inclut les parents absents ayant des sous-collections. Un budget de documents interrompt le contrôle si la cible est trop volumineuse ; une erreur ou une interruption n'est jamais traduite en résultat positif.

- `RESIDUAL_DATA_FOUND` : au moins un élément contrôlé reste présent. Ce résultat est attendu avant suppression.
- `INCONCLUSIVE_NO_COMPLETION_MARKER` : absence de données dans le périmètre, mais pas de preuve locale d'une demande terminée ; ne pas confirmer une suppression au demandeur sur cette seule base.
- `NO_RESIDUAL_IN_CHECKED_SCOPE` : absence dans le seul périmètre contrôlé et marqueur terminé présent. Ce n'est pas une certification de suppression de toutes copies externes ou d'anciens journaux.

Même dans le dernier cas, `oldSessionsVerified` et `readyForPublication` restent faux. Tester séparément les anciennes sessions, l'identité du demandeur, le processus d'assistance, la conservation des traces et les copies gérées par les prestataires. Les anciens compteurs hors de la fenêtre ne sont pas certifiés absents. Le marqueur minimal de sécurité ne doit pas être purgé prématurément.

Les six tests avec transports et comptes fictifs couvrent les descendants orphelins, les références indirectes, les erreurs, le budget, le mauvais projet et la préservation des autres comptes. Ils ne constituent pas une exécution sur Firebase réel.

Référence SDK : https://docs.cloud.google.com/nodejs/docs/reference/firestore/latest/firestore/collectionreference ; erreurs Authentication : https://firebase.google.com/docs/auth/admin/errors.
