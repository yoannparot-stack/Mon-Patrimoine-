# ImmOptima — ce qui peut être finalisé et ce qui nécessite le titulaire

18 novembre 2026. Aucune facturation, mise en ligne, invitation, création de compte Play ou suppression réelle n'a été effectuée par ce dossier.

## Préparation réalisée

Audit des droits côté client ; refus des réponses expirées ou incohérentes ; préparation séparée des clients et du déblocage personnel ; tests de droits et de conservation des données ; compilation V49/V50 et tests Android 14/16 réussis ; dossier Google Play, kit testeurs, pages préparatoires et contrôle de complétude.

## Décisions et accès encore nécessaires

| Sujet | Information ou action exacte attendue | Pourquoi la préparation ne suffit pas |
|---|---|---|
| Connexion Google | Se connecter au projet Firebase et à Play Console par un parcours sécurisé ; ne transmettre aucun mot de passe dans le chat | La session présentée le 18 novembre n'est pas connectée |
| Statut de commercialisation | Confirmer le statut et l'identité utilisés pour vendre, puis les mentions légalement nécessaires | Le statut descriptif actuel concerne une bêta gratuite sans vente |
| Coordonnées publiques | Résoudre les obligations applicables et la protection souhaitée de l'adresse/téléphone personnels | L'assistance par e-mail ne dispense pas des mentions légales ou Google |
| Conservation et contrats | Valider les durées réellement tenables, le suivi de la boîte mail, les contrats et garanties fournisseur | Les délais préparés dans le code ne décrivent pas les journaux et copies du fournisseur |
| Compte Play | Confirmer le type adapté et le retour du support ; procéder aux vérifications, accords et frais Google | La fiche et un AAB ne créent pas le compte ni l'autorisation de vendre |
| Test réel | Compte jetable autorisé et accès à deux téléphones pour connexion, sauvegarde, restauration et suppression | Les tests automatisés emploient des identités/transport fictifs |
| Paiements | Choix d'hébergement et budget, produits, compte de paiement et vérification serveur | Le paiement à l'usage éventuel ne doit pas être activé implicitement |
| Testeurs | Volontaires confirmés et leurs comptes Google inscrits au canal | Aucun testeur ni durée de test ne peut être inventé |

## Pages : préparation et publication sont distinctes

Le paquet statique contient Conditions d'utilisation, Confidentialité, Abonnement, Assistance et Suppression par e-mail, dans l'identité ImmOptima. Il ne charge pas de service automatique de suppression dans la variante bêta.

Exécuter `node scripts/publication-preflight.cjs beta` affiche les éléments incomplets. Ce contrôle de texte ne certifie pas les services réels. Tant qu'il signale des blocages et que les procédures ne sont pas testées, ne pas utiliser les pages comme déclarations définitives.

Après finalisation, le déploiement statique devra utiliser uniquement Hosting pour le site déjà associé, avec la configuration préparée ; ne pas lancer un déploiement général incluant Functions. Vérifier ensuite les URL HTTPS depuis une session sans connexion et les liens intégrés à l'application. Les fonctions serveur et l'activation des achats restent une opération séparée.

## Sources officielles revérifiées le 18 novembre

- Tests et accès à la production : https://support.google.com/googleplay/android-developer/answer/14151465
- Compte personnel/organisation : https://support.google.com/googleplay/android-developer/answer/13634885
- Données et SDK : https://support.google.com/googleplay/android-developer/answer/10787469
- Demande de suppression dans l'application et sur le Web : https://support.google.com/googleplay/android-developer/answer/13327111
- Spark, Blaze et Cloud Functions : https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
