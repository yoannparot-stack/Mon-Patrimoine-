# ImmOptima — réponses préparées pour Google Play

15 novembre 2026. Brouillon à vérifier contre le binaire et les services effectivement activés. Aucune déclaration n’a été envoyée. Le compte Play Console n’est pas encore créé. Les paramètres distants ne sont pas déduits des seuls fichiers sources.

## Fiche et contenu

| Champ | Proposition / état |
|---|---|
| Nom de l’application | ImmOptima ; conserver le nom cohérent avec l’icône et les captures |
| Désignation publique souhaitée | ImmOptima (patrimoine), communiquée par le titulaire ; ne remplace pas son identité légale |
| Type | Application |
| Catégorie | Finance proposée, à confirmer selon le formulaire et la réponse du support Google |
| Assistance / confidentialité | immoptima12@gmail.com |
| Public cible | Adultes ; application non conçue pour les enfants. Ne pas inventer la classification IARC : compléter le questionnaire réel |
| Publicité | Aucune régie publicitaire intégrée dans les sources contrôlées ; vérifier les dépendances du binaire final |
| Accès à l’application | Fonctions locales sans connexion ; compte Google requis pour sauvegarde du compte, essai et droits. Renseigner les instructions d’examen réellement utilisables avant envoi |
| Paiements bêta | Désactivés. Pas d’achat automatique ni de conversion de l’essai en abonnement |
| Confidentialité et suppression | Pages préparées ; URL publique et suppression réelle non encore validées. Ne pas fournir un chemin local ou une URL fictive à Google |

## Sécurité des données — inventaire de réponses, pas déclaration soumise

Le stockage limité à l’appareil ne constitue pas, à lui seul, une collecte hors appareil. En revanche, la connexion, les sauvegardes, les services de marché et leurs SDK doivent être décrits. Le caractère facultatif se détermine pour chaque type et chaque parcours ; ne pas cocher globalement « aucune donnée collectée ».

| Type de données à examiner dans le formulaire | Flux observé / condition | Finalités proposées | Points à confirmer |
|---|---|---|---|
| Identifiants utilisateur et adresse e-mail | Connexion Google/Firebase ; UID transmis avec les requêtes Firestore et fonctions | Gestion du compte, fonctionnalité, sécurité/prévention des abus | Champs effectivement renvoyés par la connexion et données techniques du SDK |
| Nom, adresse et informations personnelles saisies | Données de propriétaires/locataires et adresses des biens contenues dans la sauvegarde autorisée ; noms/adresses dans les documents exportés | Fonctionnalité demandée et sauvegarde | Sous-types exacts du formulaire ; rôles du bailleur et de l’éditeur pour les données de tiers |
| Informations financières | Valeurs, loyers, épargne, charges, crédits et paiements déclarés ; copie Firestore si autorisée | Bilan, suivi et sauvegarde | Distinguer les sous-types « autres informations financières », historique d’achat et informations de paiement ; aucun numéro de carte recueilli par ImmOptima |
| Photos | Photo facultative du bien incluse dans la sauvegarde JSON et donc dans la copie du compte si autorisée | Fonctionnalité et sauvegarde | Ne pas omettre « Photos » au motif que l’application n’ouvre pas directement la caméra |
| Fichiers, documents et autre contenu utilisateur | Notes et champs libres dans les données ; exports/imports et documents selon les actions choisies | Fonctionnalité, import/export | Distinguer ce qui reste sur l’appareil, le contenu réellement synchronisé et le partage demandé par l’utilisateur |
| Adresse / coordonnées géographiques du bien | Géocodage, recherches DVF et analyses immobilières ; comparaison fournisseur si configurée | Fonctionnalité d’analyse de marché | Ce sont les caractéristiques d’un bien, pas une permission GPS. Vérifier les catégories de localisation applicables selon les données réellement envoyées ; ne pas déclarer automatiquement « aucune localisation » |
| Données techniques | IP, user-agent, identifiant de l’application et informations SDK selon Firebase Auth et services réseau | Sécurité et fonctionnement | Catégories Android exactes, données éphémères, durées fournisseur et configuration effective |
| Historique d’achat / droits | Prévu pour la future facturation, désactivée dans la bêta | Gestion de l’abonnement et prévention de fraude | Ne déclarer le flux commercial comme actif qu’après configuration ; reprendre le formulaire lors de son activation |

### Collecte, partage et sécurité

- **Collecte** : oui pour les données qui quittent l’appareil dans les fonctions connectées ; certaines sont facultatives. Même une collecte uniquement par un SDK doit être examinée.
- **Partage** : traiter séparément les transferts à un sous-traitant agissant pour l’éditeur, les actions de partage demandées par l’utilisateur et les destinataires poursuivant leurs propres finalités. Google prévoit des exceptions précises à la notion de partage dans ce formulaire ; ne pas conclure « aucun partage » sans vérifier contrats et flux.
- **Chiffrement en transit** : les URL des sources sont HTTPS ; vérifier le trafic du binaire final, les redirections et chaque service avant de cocher la réponse. Aucun chiffrement de bout en bout ni audit indépendant n’est revendiqué.
- **Suppression du compte** : interface et service préparés ; réponse affirmative seulement après déploiement, test réel et URL publique utilisable. Le simple bouton d’effacement local ne suffit pas.
- **Identifiants publicitaires, contacts, SMS, microphone et caméra** : pas de collecte/permission ajoutée pour ces usages dans les sources vérifiées. L’accès à une photo choisie ne signifie pas accès global à la photothèque. Recontrôler le manifeste fusionné du binaire final.

## Fonctionnalités financières

Préparer une déclaration décrivant exactement : suivi patrimonial saisi manuellement, bilan, simulations, estimation immobilière, pistes indicatives d’optimisation. L’application ne fournit pas de prêts, n’envoie pas de dossiers à des prêteurs, n’exécute pas d’investissement, ne détient pas de fonds et ne connecte pas les mouvements bancaires.

Ne pas cocher « aucune fonctionnalité financière » par défaut. Choisir les rubriques disponibles qui décrivent ces fonctions ; la qualification définitive et le type de compte restent soumis au retour du support, ticket **2-7512000042027**. Aucun agrément ni service de conseil réglementé n’est revendiqué.

## Accès pour l’examinateur

1. Installer la version bêta, ouvrir « Découverte » et créer un bien fictif sans achat.
2. Utiliser le scénario du kit testeurs : loyer 650 €, crédit 400 €, charges propriétaire 40 €, taxe annuelle 600 €, PNO 15 €, autres frais 20 € → solde mensuel estimé avant impôts : 125 €.
3. Vérifier l’export/import local sans compte.
4. Documenter la connexion Google et l’accès aux fonctions liées au compte une fois leur fonctionnement réel vérifié. Ne fournir ni compte personnel du titulaire ni mot de passe partagé. Tout accès spécial destiné à Google doit être limité à un environnement de revue et documenté ; aucun contournement personnel ne doit être livré.
5. Vérifier que l’examinateur peut accéder aux fonctions annoncées sans payer et sans blocage non expliqué. Si une fonction n’est pas opérationnelle, ne pas la présenter comme disponible dans la version déposée.

## Sources officielles consultées le 15 novembre 2026

- https://support.google.com/googleplay/android-developer/answer/10787469?hl=fr
- https://support.google.com/googleplay/android-developer/answer/13327111?hl=fr
- https://support.google.com/googleplay/android-developer/answer/13849271?hl=en
- https://firebase.google.com/docs/android/play-data-disclosure?hl=fr
- https://support.google.com/googleplay/android-developer/answer/9866151?hl=fr
- https://www.cnil.fr/fr/passer-laction/rgpd-exemples-de-mentions-dinformation
