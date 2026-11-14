# ImmOptima — informations nécessaires avant publication

Préparation du 14 novembre 2026. Aucune identité ni adresse personnelle n’a été réutilisée automatiquement. Les textes intégrés et les pages exportées restent préparatoires.

## À fournir par l’éditeur

- Statut retenu pour commercialiser : personne physique/entreprise, forme juridique le cas échéant.
- Identité ou dénomination publique de l’éditeur ; identification professionnelle applicable (SIREN/SIRET, registre et TVA selon la situation).
- Adresse professionnelle à publier, téléphone professionnel et responsable de publication.
- Adresse d’assistance et de confidentialité opérationnelle ; ne pas fournir de mot de passe.
- Pays de commercialisation ; tarifs validés : 3,99 €/mois et 39,99 €/an.
- Médiateur compétent et coordonnées après mise en place effective du dispositif, selon le statut et l’offre.

## À vérifier dans les services avant de compléter les textes

- Projet et régions réellement utilisés pour Authentication, Firestore, fonctions et hébergement Web ; entité contractante et sous-traitants.
- Durées des comptes inactifs, journaux, sauvegardes gérées par Google, essais et achats. Ne pas déduire une durée des seules valeurs de TTL prévues dans le code.
- Transferts hors UE et garanties contractuelles réellement applicables.
- URL publique de confidentialité et URL publique de suppression après déploiement effectif.
- Modalités de rétractation, formulaire et assistance/remboursements adaptés à la souscription proposée ; relecture juridique avant publication.

## Ce qui est déjà décrit dans la V41 préparée

- Données locales, sauvegardes du compte, Google Drive et exports distingués.
- Authentification Google facultative pour les fonctions locales et nécessaire à celles liées au compte ; sauvegarde cloud soumise à autorisation distincte.
- Sources de marché, destinations techniques et absence de collecte automatique des mouvements bancaires.
- Essai de 90 jours mono-bien avec activation explicite, sans conversion automatique ; multi-biens client soumis à accès vérifié.
- Prix mensuel et annuel cohérents avec les cartes visuelles ; prix de vente effectifs confirmés par Google Play lors de l’activation future.
- Suppression du compte distincte des fichiers exportés et de la résiliation Google Play ; aucune suppression annoncée comme terminée avant confirmation serveur.

Les valeurs définitives se renseignent dans `legal-content.js` après validation. `node scripts/export-legal.cjs public-account` régénère les trois pages depuis la même source que l’application. `publication-readiness.json` conserve le blocage tant que les informations et vérifications manquent. Ne pas passer `approvedForPublication` ou `deletionVerified` à vrai sur la seule base des tests simulés.
