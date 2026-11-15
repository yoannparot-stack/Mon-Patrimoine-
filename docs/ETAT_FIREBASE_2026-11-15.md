# ImmOptima — vérification Firebase en console

15 novembre 2026. Accès au projet réel confirmé par session Google authentifiée. Cette note ne contient ni jeton, ni identifiant utilisateur individuel, ni données patrimoniales.

## Modifications enregistrées

- Nom public du projet : `ImmOptima`, auparavant `project-ImmOptima`.
- Pseudo de l’application Android actuelle : `ImmOptima Android`, package `com.immoptima.app`. Son identifiant Firebase correspond à la configuration embarquée des sources.

## Constatations

- Forfait Spark, présenté sans frais par la console ; aucune mise à niveau ou facturation activée.
- Google est un fournisseur Authentication activé.
- Les domaines Firebase par défaut du projet sont déjà autorisés pour les redirections de connexion ; aucun domaine supplémentaire ajouté.
- Firestore `(default)` : emplacement `eur3`. Ce constat ne permet pas de généraliser cette localisation à tous les services Google.
- Dernières règles publiées visibles : 26 octobre 2026. Elles isolent les sauvegardes par compte mais ne comportent pas encore les règles de l’essai, des droits multi-biens et du verrou de suppression préparées depuis.
- Seule la collection racine `users` est visible lors de l’inspection ; aucun document d’accès personnel multi-biens n’a été créé pendant cette vérification.
- Le conflit SHA-1 concerne l’ancienne application `com.monpatrimoine.app.test132` : Firebase signale un client OAuth 2.0 associé à la même combinaison package/empreinte dans un autre projet. L’application actuelle n’affiche pas ce conflit sur sa ligne de certificat une fois chargée. Aucune empreinte, aucun client OAuth ni aucune ancienne application supprimés.
- L’adresse dédiée d’assistance n’est pas proposée par le sélecteur actuel. Aucune autorisation IAM ni délégation ajoutée pour rendre cette adresse sélectionnable.
- Hosting présente la procédure initiale avec déploiement par CLI. Son assistant a été consulté ; aucune page ni version de site déployée et aucune mise en service annoncée.

## Préparé, non appliqué

Les règles `cloud/firestore.rules` sont placées dans l’éditeur de la console au statut **modifications non publiées**. Le bouton Publier n’a pas été actionné. Le formulaire préparatoire du droit personnel utilise un document `accountAccess/<compte-du-titulaire>` avec `owner: true` ; le bouton Enregistrer n’a pas été actionné.

Ordre nécessaire après confirmation des changements d’accès :

1. Enregistrer et vérifier le droit du compte personnel actuellement identifié dans Authentication. Il porte uniquement sur les droits fonctionnels ImmOptima et n’est pas une délégation IAM.
2. Publier les règles préparées, qui empêchent l’auto-attribution de droits multi-biens, encadrent l’activation de l’essai et bloquent les accès pendant une suppression.
3. Contrôler la sauvegarde personnelle multi-biens et un compte client mono-bien, puis l’activation volontaire de son essai. Les tests sur émulateur déjà passés ne remplacent pas cette validation réelle.

Cette paire de changements modifie les droits d’accès du service et nécessite une confirmation au moment de l’application. Ne pas publier la restriction multi-biens avant d’avoir préservé l’accès personnel du titulaire.

Les autres points restent ouverts : identité et coordonnées d’éditeur, choix du type de compte Play après réponse du support, données contractuelles et durées de conservation, pages publiques, déploiement et suppression réelle sur compte jetable. Aucun achat, paiement, déploiement de fonctions ni suppression réelle réalisé.
