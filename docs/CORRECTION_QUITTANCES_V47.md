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
