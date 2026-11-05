# ImmOptima — audit approfondi et version V29

Date : 5 novembre 2026. Périmètre : application personnelle Android et sources de sa version commerciale. La V24 de référence et la branche principale sont conservées.

## Conclusion

L’audit a confirmé des défauts dans des cas que les tests existants ne couvraient pas. Les corrections portent en priorité sur la fiabilité des montants, la conservation des saisies et la compréhension des résultats. Une fiche incomplète doit être identifiable ; un zéro explicitement saisi doit rester un zéro.

## Défauts corrigés

| Cas vérifié | Avant | Correction |
|---|---|---|
| Centimes et surfaces précises | Des pas de saisie trop grossiers bloquaient 12,50 €, 19,15 m² ou un capital restant dû avec des centimes. | Saisie au centime et au centième de m² dans les fiches concernées ; nombre de pièces conservé entier. |
| Assurance fixe à 0 € | Le taux d’assurance pouvait reprendre la priorité ; 0 € devenait 41,67 € sur 100 000 € à 0,50 %. | Le montant fixe explicitement saisi a priorité, même à 0 €. Les anciennes sauvegardes sans ce choix explicite conservent leur interprétation. |
| Mensualité totale à 0 € ou assurance déjà incluse | Le guidage pouvait demander encore un financement ou une assurance séparée malgré une mensualité connue. | La mensualité totale saisie est reconnue ; les données d’amortissement restent nécessaires aux courbes et au capital restant dû. |
| Modification depuis Banque | Une valeur nouvellement saisie pouvait rester marquée manquante et être effacée à la réouverture de la fiche. | Les modifications de loyers, charges, crédit et pièces actualisent aussi l’état de complétude. |
| Crédit créé depuis la synthèse bancaire | Le capital restant dû inconnu était initialisé à 0 et pouvait paraître renseigné. | Seule la mensualité connue est marquée renseignée ; le capital reste à compléter. |
| Parking, terrain ou local dans le marché | Ils pouvaient être envoyés vers le comparatif d’appartements. | Le comparatif de logements est réservé aux appartements et maisons ; les autres types sont identifiés et ignorés lors d’une actualisation globale. |
| Fiche en brouillon | Les zéros internes pouvaient paraître être des résultats établis. | Les montants inconnus sont affichés « — » sur la carte ; badge et bouton « Compléter » ; résultats provisoires signalés dans le tableau de bord. |
| Stockage plein ou indisponible | Une fiche pouvait être fermée avant la réussite de l’écriture, sans explication visible. | Alerte, formulaire conservé, modifications du formulaire annulées en mémoire en cas d’échec et nouvelle tentative possible sans doublon. |
| Double validation pendant un contrôle d’accès | Deux soumissions pouvaient créer deux biens. | Une seule soumission est traitée tant que la précédente est en cours. |
| Sauvegarde mal formée | La vérification des collections était trop superficielle. | Contrôle des identifiants, doublons, types de montants, nombres non finis et principales listes imbriquées, avant remplacement, dans les parcours fichier, Google, récupération et cloud. |
| Identifiant contenant des guillemets | Certains formulaires et boutons incorporaient directement cet identifiant dans leur code de clic. | Utilisation d’attributs échappés et lecture de leurs valeurs, pour conserver l’identifiant comme donnée. |
| Échec pendant une restauration cloud | Une erreur pouvait laisser le candidat chargé actif en mémoire. | Rétablissement du patrimoine précédent et de l’état de synchronisation, avec un état d’erreur visible. |
| Fermeture d’un parcours guidé | Son état de navigation pouvait subsister après disparition du formulaire. | La fermeture nettoie cet état ; le bouton Retour reprend son fonctionnement normal. |
| Résultat négatif dans le récapitulatif guidé | Le montant pouvait rester présenté en vert. | Le cash-flow négatif est affiché en rouge. |
| Valeurs négatives ou fiche supprimée pendant l’édition | Des données incohérentes pouvaient être acceptées ou provoquer une erreur. | Bornes sur les champs financiers du prêt et des actifs, calculs défensifs et contrôle de l’existence de la fiche. |

## Approche visuelle retenue

- **Biens :** « Valeur retenue » décrit désormais précisément la valeur choisie par l’utilisateur. Une fiche incomplète affiche un repère orange discret et un accès direct à sa complétion. La présentation compacte des biens déjà renseignés est conservée.
- **Marché :** les types de biens non adaptés au comparatif sont indiqués clairement et leur bouton de recherche est désactivé.
- **Guidage :** le focus suit le titre de la nouvelle étape ; le récapitulatif respecte le signe du cash-flow.
- **Banque, dashboard et optimisation :** conservation de la structure visuelle validée ; contrôles de lisibilité, de largeur et d’accès aux aides. Une refonte complète n’est pas nécessaire pour ces corrections.

## Vérifications fonctionnelles

Les contrôles portent sur les calculs de revenus et rendement, charges récupérables, mensualités avec et sans assurance, intérêts nuls, capital restant dû, historique daté, filtres par détenteur, ajout/modification/suppression, export et réimport, simulation locative, baux, IRL, quittances, paiement partiel, droits multi-biens et changement de compte.

Nouveaux scénarios : stockage refusé puis nouvelle tentative, double soumission, import de doublons, identifiants contenant des guillemets, modification d’un brouillon depuis Banque, zéro d’assurance fixe, prêt incomplet, parking hors comparatif et nettoyage du bouton Retour après fermeture du guide.

La sauvegarde fictive complète V26 fournie précédemment a également été passée au nouveau validateur sans modification de son contenu.

Les règles Firestore sont testées en émulateur, avec comptes distincts et droits d’accès différents. Ces contrôles n’écrivent pas dans la base de production.

## Informations immobilières vérifiées

Les indices IRL intégrés ont été rapprochés de la publication INSEE du 15 octobre 2026. Le troisième trimestre 2026 est bien à 148,06 sur le continent, 145,21 dans les DOM concernés et 143,80 en Corse.

Source primaire : https://www.insee.fr/fr/statistiques/9081853

Les tests de bail et d’IRL vérifient les règles implémentées et la génération des documents ; ils ne constituent pas une certification juridique de chaque futur bail réel.

## Points restant à vérifier en situation réelle

- Mise à jour sur votre téléphone avec votre sauvegarde personnelle, sans désinstallation préalable.
- Sélection effective d’un dossier Google Drive, annulation et réimport depuis ce dossier ; la présence et la restitution réelles du fichier relèvent de ce parcours sur appareil.
- Réponses actuelles des services externes de marché selon la couverture de l’adresse. Les tests automatiques du marché utilisent des réponses contrôlées ; ils ne garantissent pas l’existence de comparables pour chaque bien.
- Facturation réelle, renouvellement et expiration d’un abonnement commercial avant publication. L’accès personnel sans abonnement est conservé ; l’audit ne met pas la facturation en service et ne déploie pas de règles de production.

## Priorités suivantes

1. Tester la version avec votre portefeuille complet et relever les écarts de montants ou de champs manquants.
2. Observer un nouvel utilisateur créer son premier bien sans assistance : repérer les hésitations avant d’ajouter des fonctions.
3. Préparer la validation commerciale réelle des abonnements, puis les essais sur plusieurs téléphones et versions d’Android.

## Résultats de livraison

Sources de la version V29 : `8d38750bf330e98f7b8345b9a2b857ea838365bb`.

Vérifications : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/42110637486

Calculs, contrôles d’accès, parseurs de sources locatives, règles Firestore en émulateur et régressions du navigateur réussis. Cinq largeurs vérifiées : 320, 360, 393, 430 et 800 pixels ; aucune erreur JavaScript relevée par la suite du navigateur.

APK compilée et signée avec le certificat de test persistant : `ImmOptima-Test-v29.apk`.

Empreinte SHA-256 : `150624edcfe0266799649edeafe2f1e30b7406cfeb25ec27b81db67ec929af36`.

Les modules de guidage et d’optimisation présents dans l’APK ont été comparés octet par octet aux sources. Le canal personnel sans abonnement est vérifié dans le binaire.

Contrôle final réussi : APK installée sur émulateur Android API 34, navigation native, bouton Retour, persistance, fiches incomplètes et saisie de 19,15 m² / 12,50 € vérifiés. La compilation, les tests du navigateur et le contrôle des règles Firestore en émulateur sont également réussis.
