# Correction des quittances et accès aux champs — V47

16 novembre 2026. Données de vérification fictives uniquement.

## Problème corrigé

Un paiement enregistré avant la complétion du dossier conservait une copie incomplète des coordonnées. La préparation d'une quittance utilisait cette copie plutôt que les informations du dossier complété.

Si la copie historique est complète, elle reste utilisée et n'est pas remplacée par le locataire actuel. Si elle est incomplète et le dossier complet, une confirmation présente les coordonnées à utiliser pour ce paiement. Seule la copie de coordonnées de cet encaissement est actualisée ; les montants, dates et autres périodes sont préservés. Un refus ou un échec d'enregistrement ne produit aucun document.

## Guidage

Les erreurs de coordonnées listent uniquement les champs absents et proposent des boutons rouges. Chaque bouton ouvre le dossier du même logement, amène le champ à l'écran et lui donne le focus. Les erreurs de montant, date et confirmation d'encaissement disposent d'un accès direct au champ de paiement concerné. Les saisies non enregistrées sont préservées lors d'un déplacement dans le même formulaire ; les confirmations de sortie existantes s'appliquent entre formulaires.

## Vérification prévue dans la compilation

- Reproduire une copie d'identité incomplète puis compléter et enregistrer le dossier.
- Refuser puis accepter l'actualisation d'une seule période.
- Simuler un échec d'enregistrement : retour aux données précédentes et aucun aperçu.
- Préserver l'identité d'un ancien locataire, les autres périodes, le second logement et les crédits.
- Vérifier les boutons de correction, le focus, les formats mobiles et les ponts Android texte/PDF.

La préparation technique n'est pas une confirmation de tests réussis : consulter les résultats de l'exécution associée au commit. APK personnelle prévue V47 ; bundle de préparation bêta V48. Aucun déploiement Firebase, compte réel, paiement ou envoi n'est nécessaire pour ces vérifications.

Les validations de l’aide générale proposent également des boutons rouges dans le résumé des erreurs et sous les champs concernés. Les boutons ouvrent les sections repliées avant de cibler le champ, sans modifier la saisie.

## Résultats obtenus

La revue ciblée est réussie : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/43958448225
La compilation et toutes ses vérifications sont réussies : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/43959456919

Le scénario du paiement antérieur à la complétion des coordonnées, les refus d'actualisation, le retour aux données précédentes après échec de stockage, les identités historiques, les liens rouges et les ponts texte/PDF passent dans Chromium avec des données fictives. Les suites de non-régression, les règles Firestore sur émulateur, les 30 tests serveur simulés et les contrôles du bundle bêta V48 passent.

L'APK personnelle V47 compilée et signée passe les parcours natifs sur Android 14/API34 et Android 16/API36 : navigation, Retour, saisies et conservation des données. La réparation d'identité est spécifiquement couverte dans Chromium ; aucun compte réel, envoi de quittance, paiement ou suppression réelle n'a été utilisé. Le certificat personnel reste identique à V45.

Source de la compilation : 06efe9f8409ecc2dce50ab7bea9f75eec25c8384.
APK V47, dans une archive ZIP de téléchargement : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/43959456919/artifacts/14273213481
Après sauvegarde, installer l'APK extraite par-dessus la version personnelle existante, sans désinstaller.
