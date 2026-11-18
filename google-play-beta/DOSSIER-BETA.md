# ImmOptima — préparation du test Google Play

Mise à jour du 18 novembre 2026 : préparation technique V50 compilée et contrôlée. État de création du compte Play non confirmé dans cette session ; aucun dépôt en Console, invitation ou achat effectué pendant cet audit.

## Fiche de présentation proposée

Nom : ImmOptima

Description courte : Vos biens, vos loyers et votre épargne réunis pour piloter votre patrimoine.

Description :
ImmOptima réunit vos biens immobiliers, votre épargne, vos loyers, vos crédits et vos documents dans un même espace. Retrouvez un bilan clair pour mieux piloter votre patrimoine et identifier des pistes d’optimisation à partir de vos données.

Renseignez vos biens progressivement, consultez vos indicateurs et préparez votre suivi locatif. Un parcours guidé vous accompagne dès la première ouverture. Les projections sont indicatives et reposent sur les hypothèses saisies ; elles ne prédisent pas les résultats futurs.

Cette bêta est gratuite et réservée aux personnes invitées. Aucun paiement ni abonnement automatique n’est déclenché. Le suivi Premium d’un bien peut faire l’objet d’un essai de 90 jours, uniquement après connexion et activation explicite confirmée par le serveur. Les tarifs affichés de 3,99 € par mois et 39,99 € par an présentent l’offre future ; l’achat n’est pas disponible dans cette bêta. Le multi-biens nécessite des droits vérifiés et n’est pas débloqué par le simple choix d’une offre.

Notes de version :
Première préparation de bêta fermée : découverte guidée, bilan patrimonial, suivi locatif et paramètres du compte. Paiements désactivés. Merci de signaler les difficultés rencontrées et les éléments peu clairs.

## Déroulement à préparer

1. Créer/vérifier le compte Play Console avec son propriétaire. Le type de compte doit correspondre à l’activité et aux fonctionnalités financières déclarées ; ne pas choisir « personnel » par défaut. Le propriétaire intervient pour son identité, les accords et les éventuels frais Google.
2. Commencer par un test interne. Renseigner les informations éditeur, les coordonnées de support, les pages publiques de confidentialité et de suppression du compte. Déployer et tester réellement l’authentification, les droits d’essai, la sauvegarde et la suppression avant de les promettre aux testeurs.
3. Examiner les déclarations Sécurité des données, fonctionnalités financières, contenu, publicité, accès à l’application et classification. Les données saisies et la synchronisation facultative doivent être décrites fidèlement. Les brouillons juridiques existants ne sont pas une validation juridique.
4. Inscrire l’application et vérifier le nom de package définitif com.immoptima.app avant le premier dépôt. Configurer Play App Signing ; enregistrer les empreintes de son certificat dans Firebase/Google pour la connexion Android. La signature du fichier préparé est une candidate d’envoi, pas la confirmation d’une inscription à Play App Signing.
5. Déposer le fichier AAB préparé dans une piste de test, après les vérifications précédentes. Un AAB ne s’installe pas directement comme un APK. La version personnelle reste distincte ; ne pas l’envoyer aux clients.
6. Ajouter uniquement les adresses Google de volontaires confirmés, puis leur fournir le lien d’inscription au test. Aucun contact n’est ajouté par ce dossier. Pour les nouveaux comptes personnels concernés : au moins 12 testeurs inscrits pendant 14 jours consécutifs avant de demander l’accès à la production ; Google examine ensuite la demande.

## Fiche de retour testeur

Utiliser de préférence des données fictives pendant les premiers essais. Ne pas supprimer des données réelles sans export vérifié.

- Première ouverture : comprenez-vous la différence entre découverte, essai et future offre ?
- Premier bilan : arrivez-vous à saisir un bien et comprendre les champs manquants ?
- Navigation : retrouvez-vous vos loyers, crédits, documents et l’aide ?
- Compte : savez-vous où vérifier la sauvegarde et ce que confirme réellement son état ?
- Restauration : un export fictif peut-il être réimporté correctement ?
- Accessibilité : texte lisible, boutons accessibles, aucun débordement sur petit écran ?
- Retour : modèle Android, étape précise, résultat attendu/observé, capture sans données personnelles.

## Points bloquants réels

Connexion et inscription du propriétaire à Play Console ; type de compte à confirmer ; identité et support éditeur ; pages publiques et textes finalisés ; suppression de compte déployée et validée ; vérification sur un vrai compte client ; configuration du certificat Play ; déclarations Console ; dépôt et examen Google. Le paiement commercial et les formalités d’activité restent à traiter séparément avant la commercialisation.

## Références Google

- https://support.google.com/googleplay/android-developer/answer/13634885?hl=fr
- https://support.google.com/googleplay/android-developer/answer/9845334?hl=fr
- https://support.google.com/googleplay/android-developer/answer/14151465?hl=fr
- https://support.google.com/googleplay/android-developer/answer/13849271?hl=fr
- https://support.google.com/googleplay/android-developer/answer/9842756?hl=fr

## Contact dédié confirmé

Assistance, confidentialité et retours des testeurs : **immoptima12@gmail.com**. Adresse communiquée par l’éditeur après création. Aucun e-mail de test n’a été envoyé et la livraison n’est pas certifiée. Ne pas considérer cette adresse comme un changement du propriétaire du compte Play Console.

## Livrables du 18 novembre

- Fiche à reprendre : `FICHE-PLAY-FR.txt` et `FICHE-PLAY-FR.json` (brouillon non soumis).
- Kit de test : `kit-test/01-CONSIGNES-TESTEURS.md`, formulaires CSV vides et modèles de messages non envoyés.
- Pages : paquet statique de revue, non déployé ; contrôler les manques avec `node scripts/publication-preflight.cjs beta`.
- Binaire client préparé : AAB V50 ; APK personnelle V49 réservée au titulaire, exclue du kit testeurs.
- Preuves techniques : compilation, tests navigateur et règles Firestore réussis, APK installé/testé sur émulateurs Android 14 et 16. Source `be483fcc7ea55fde44063f38e048dce6ab1ff4b7`, exécution https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/44259606825.
- Aucun essai de connexion, de restauration ou de suppression sur un vrai compte client n’est certifié par ces tests.

## Orientation du titulaire — nom propre

Commercialisation envisagée en nom propre, sans création de société. Le titulaire refuse explicitement l'ajout d'ImmOptima au SIREN de son activité locative : aucun rattachement ni modification de cette activité à engager. La voie administrative compatible avec l'exercice en nom propre et cette séparation reste à vérifier ; ne pas promettre un deuxième SIREN. Le régime micro reste à confirmer. Ce choix ne vaut ni formalité déposée ni choix automatique d'un compte personnel Play.

La connexion aux consoles est désormais vérifiée. Play affiche l'inscription développeur, laissée en attente du type adapté ; aucun contrat accepté, paiement ou dépôt réalisé. Les préparatifs techniques et essais APK peuvent continuer.
