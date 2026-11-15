# ImmOptima — vérification Firebase en console

15 novembre 2026. Accès au projet réel confirmé par session Google authentifiée. Cette note ne contient ni jeton, ni identifiant utilisateur individuel, ni données patrimoniales.

## Modifications enregistrées

- Nom public du projet : `ImmOptima`, auparavant `project-ImmOptima`.
- Pseudo de l’application Android actuelle : `ImmOptima Android`, package `com.immoptima.app`. Son identifiant Firebase correspond à la configuration embarquée des sources.

## Constatations lors de la première inspection

- Forfait Spark, présenté sans frais par la console ; aucune mise à niveau ou facturation activée.
- Google est un fournisseur Authentication activé.
- Les domaines Firebase par défaut du projet sont déjà autorisés pour les redirections de connexion ; aucun domaine supplémentaire ajouté.
- Firestore `(default)` : emplacement `eur3`. Ce constat ne permet pas de généraliser cette localisation à tous les services Google.
- Dernières règles publiées visibles : 26 octobre 2026. Elles isolent les sauvegardes par compte mais ne comportent pas encore les règles de l’essai, des droits multi-biens et du verrou de suppression préparées depuis.
- Seule la collection racine `users` est visible lors de l’inspection ; aucun document d’accès personnel multi-biens n’a été créé pendant cette vérification.
- Le conflit SHA-1 concerne l’ancienne application `com.monpatrimoine.app.test132` : Firebase signale un client OAuth 2.0 associé à la même combinaison package/empreinte dans un autre projet. L’application actuelle n’affiche pas ce conflit sur sa ligne de certificat une fois chargée. Aucune empreinte, aucun client OAuth ni aucune ancienne application supprimés.
- L’adresse dédiée d’assistance n’est pas proposée par le sélecteur actuel. Aucune autorisation IAM ni délégation ajoutée pour rendre cette adresse sélectionnable.
- Hosting présente la procédure initiale avec déploiement par CLI. Son assistant a été consulté ; aucune page ni version de site déployée et aucune mise en service annoncée.

## Brouillon avant confirmation

Les règles `cloud/firestore.rules` sont placées dans l’éditeur de la console au statut **modifications non publiées**. Le bouton Publier n’a pas été actionné. Le formulaire préparatoire du droit personnel utilise un document `accountAccess/<compte-du-titulaire>` avec `owner: true` ; le bouton Enregistrer n’a pas été actionné.

## Modifications appliquées après confirmation explicite

Le titulaire a confirmé l’enregistrement du droit personnel multi-biens et la publication des règles. Le document `accountAccess/<compte-du-titulaire>` contient maintenant `owner: true` (booléen), vérifié dans la console avant publication des règles. Ce droit conserve l’accès fonctionnel personnel ; aucun rôle IAM, accès à un autre patrimoine ni abonnement Google Play n’est attribué.

Les règles préparées ont ensuite été publiées. La console affiche une nouvelle version active datée du 15 novembre 2026, avec étoile de publication, et ne présente plus le brouillon comme non publié. Les règles encadrent l’essai mono-bien de 90 jours, empêchent l’auto-attribution des droits multi-biens, isolent les sauvegardes et préparent le verrou de suppression.

## Contrôles effectués dans le simulateur Firebase

- Lecture du document d’accès personnel en simulant l’identité du titulaire : **autorisée**.
- Lecture du même document en simulant un autre identifiant de compte : **refusée**, résultat attendu.
- Ces simulations utilisent les règles publiées et le droit enregistré. Elles n’activent pas un nouvel essai et ne créent pas de compte client.

Le forfait Spark est conservé. Aucun paiement, abonnement, mise à niveau, déploiement de fonctions ou suppression réelle n’a été déclenché. Aucun contenu patrimonial existant n’a été modifié.

## Restant à vérifier et finaliser

Un aller-retour réel depuis l’application reste nécessaire pour certifier la sauvegarde personnelle multi-biens après cette publication ; les simulations de lecture ne le remplacent pas. Le parcours client mono-bien et l’activation volontaire réelle de l’essai restent aussi à contrôler.

Les autres points restent ouverts : identité et coordonnées d’éditeur, choix du type de compte Play après réponse du support, données contractuelles et durées de conservation, pages publiques, mise en service de la suppression et test réel sur compte jetable. La publication des règles ne rend pas à elle seule la suppression automatique opérationnelle.

## Suite — application Web et identité de l’éditeur

Le titulaire confirme explicitement **Yoann Parot** comme responsable. Ce nom est renseigné dans les textes préparatoires, avec le statut descriptif de personne physique pour une bêta gratuite sans vente activée. Aucune adresse ni aucun téléphone personnels ne sont repris automatiquement. Les informations commerciales restent distinctes.

L’application Web **ImmOptima — Compte et confidentialité** est enregistrée, ID `1:1056446883177:web:ca1947b17570eed196c9f8`, puis associée au site Hosting `immoptima-6af3b`. L’association est vérifiée dans la console. Aucune version de site n’est déployée. L’extrait Analytics proposé par défaut par la console n’est pas intégré aux pages.

Une variante statique de demande de suppression par e-mail et sa procédure de traitement sont préparées pour conserver Spark pendant la bêta. Elle ne déclenche ni effacement ni envoi automatique. Google Play mentionne cette possibilité, mais le suivi de la boîte, la vérification d’identité, le délai, l’effacement effectif et les durées doivent être validés avant de la déclarer disponible. Les configurations Android et serveur de suppression restent désactivées. Voir `SUPPRESSION_BETA_SANS_FUNCTIONS.md`.
