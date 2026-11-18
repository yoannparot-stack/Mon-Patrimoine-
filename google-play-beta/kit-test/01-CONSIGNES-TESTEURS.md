# ImmOptima — parcours de test

Dossier préparé le 18 novembre 2026. À remettre après ouverture effective du canal de test et vérification des services annoncés. Ce document n'envoie aucune invitation et ne démarre aucun délai Google Play.

## Avant de commencer

- Utilisez le compte Google inscrit au test pour le Play Store. Une APK personnelle débloquée n'est pas la version client à tester.
- Utilisez des données fictives. N'importez pas votre patrimoine réel dans une procédure de test de suppression.
- Notez la version affichée dans Mon compte, votre modèle de téléphone et la version Android. N'envoyez aucun mot de passe ni code de connexion.
- L'offre testée doit annoncer clairement ce qui est disponible. Une fonction serveur non mise en service ne doit pas être déclarée testée avec succès.

## 1. Obtenir un premier bilan en quelques minutes

Choisissez Découverte, puis ajoutez un logement fictif. Nom : « Logement de démonstration ». Détenteur : « Bailleur fictif ». Adresse : « Adresse fictive pour test ».

| Montant | Valeur |
|---|---:|
| Loyer mensuel hors charges | 650 € |
| Mensualité de crédit déclarée | 400 € |
| Charges propriétaire mensuelles non récupérables | 40 € |
| Taxe foncière annuelle | 600 € |
| Assurance propriétaire mensuelle | 15 € |
| Autres dépenses mensuelles | 20 € |

Résultat attendu : **125 € par mois, estimés avant impôts**. Les 30 € de charges locatives utilisés plus loin sont distincts des 40 € de charges propriétaire ci-dessus.

Vérifiez aussi qu'une taxe foncière laissée inconnue reste signalée : aucun total complet ne doit être inventé. Fermez le parcours puis reprenez-le : les brouillons doivent rester compréhensibles. Le parcours rapide ne doit pas créer un deuxième crédit.

## 2. Préparer une quittance

1. Dans le dossier du logement, renseignez « Bailleur fictif », « Adresse fictive bailleur », « Locataire fictif », « Adresse fictive logement », puis enregistrez le dossier.
2. Pour le mois en cours, saisissez 650 € de loyer HC, 30 € de charges et 680 € réellement encaissés fictivement, avec la date du jour et la confirmation d'encaissement.
3. Préparez la quittance : les coordonnées, la période et les montants doivent correspondre à la saisie. Testez l'enregistrement en PDF sur votre appareil, sans envoi à un locataire réel.
4. Sur une autre période fictive, un paiement de 400 € sur 680 € dus doit produire un **reçu partiel**, avec 280 € restant dus, jamais une quittance intégrale.
5. Pour tester la correction V49 : enregistrez un paiement avec un dossier encore incomplet, complétez ensuite le dossier et préparez la quittance. L'application doit demander confirmation avant d'actualiser les coordonnées de ce paiement. Refuser doit conserver ses anciennes données.
6. S'il manque une coordonnée, touchez son indication rouge : le bon champ doit s'ouvrir. Les éléments de la liste des diagnostics ne sont pas tous des prérequis à la quittance.

## 3. Sauvegarder et récupérer

Exportez un fichier fictif, vérifiez sa présence et réimportez-le. Testez l'annulation du sélecteur et un fichier invalide : aucun faux succès ni écrasement des données ne doit être constaté. Consultez également les copies de récupération disponibles.

La sauvegarde du compte, le fichier Google Drive choisi et l'export local sont différents. La restauration sur un deuxième appareil et la sauvegarde réelle du compte doivent être organisées séparément avec un compte de test autorisé. Une simple date affichée ne suffit pas comme preuve de récupération.

## 4. Comprendre les offres

- Découverte : un logement et le bilan gratuit. Vérifiez le premier encaissement/quittance de découverte proposé dans la version.
- Essai : 90 jours pour un seul bien, à compter de l'activation volontaire confirmée par le service, sans abonnement automatique.
- Consulter l'offre ou cliquer sur Premium ne doit pas acheter ni activer un essai.
- Le deuxième bien client reste soumis à un droit actif vérifié ; une sauvegarde ou une préférence locale ne doit pas suffire.
- Les achats sont désactivés dans la bêta gratuite préparée. Les tests Google Play Billing sont un parcours distinct, réservé aux comptes de licence configurés.

## 5. Retour, lisibilité et aide

Sur les pages principales et les formulaires : bouton Retour Android, lisibilité, absence de texte coupé, clavier, champs obligatoires, liens rouges et barre d'aide. Vérifiez que l'aide permet de retrouver crédit, loyer, quittance et sauvegarde.

## 6. Retour d'expérience

Écrivez à **immoptima12@gmail.com** avec la version, l'étape, le résultat attendu et le résultat observé. Masquez noms, adresses, montants privés et identifiants dans les captures. Une capture de données fictives suffit généralement.

Question finale : « Quelle action vous a été utile dès le premier bien, et qu'est-ce qui vous empêcherait de revenir le mois prochain ? »
