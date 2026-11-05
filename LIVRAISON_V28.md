# ImmOptima V28 — saisie accompagnée et analyses à compléter

Source Android : `dd67572fdec32e3f9ead72c9970907188149b85f`.
Branche personnelle : `personal/immoptima-access-v25`. Version Android : 28.

## Comportement

Les champs utiles aux analyses portent un astérisque accompagné d’une légende. Le nom et le détenteur permettent toujours de conserver un brouillon. Les étoiles ne transforment pas tous les champs en conditions d’enregistrement.

Le parcours guidé comporte quatre étapes : identification du logement ; investissement et date d’acquisition ; revenus et dépenses ; situation du crédit. Chaque champ explique son utilité. Les erreurs sont affichées en rouge. Le bouton Retour revient à l’étape précédente et conserve les saisies. Un crédit peut ensuite être saisi avec un parcours lié au bien.

Le premier récapitulatif distingue la valeur retenue personnellement du cash-flow avant fiscalité. Le cash-flow n’y est calculé que lorsque les dépenses et la situation du crédit sont connues. Une recherche de marché reste nécessaire pour obtenir des comparatifs externes ; saisir l’adresse ne constitue pas une estimation automatique.

La fiche propose un détail des informations manquantes pour le marché, les loyers, le rendement, les courbes et le cash-flow. Une recherche de marché sans adresse, type ou surface ouvre une explication rouge et un accès à la saisie guidée. Les autres onglets restent accessibles.

Les champs omis sont distingués des zéros explicitement renseignés. La réouverture d’un brouillon conserve les champs manquants vides. Le nombre de pièces déjà renseigné dans les paramètres locatifs est repris. Pièces et DPE ne sont pas imposés dans le parcours d’un parking ou d’un terrain.

Le tutoriel est facultatif et peut être relancé depuis Plus → Aide et tutoriel. Le parcours peut aussi être lancé depuis le formulaire du bien avec « Me guider étape par étape ».

## Contrôles

La vérification automatisée est attachée à :
https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/41991470551

Les tests couvrent les dépendances entre champs et analyses, les zéros explicites, dates invalides, crédit absent ou non lié, un parcours complet de bien puis de crédit, le récapitulatif chiffré, la reprise d’un brouillon, les erreurs rouges, les profils de parking et le retour Android. Les contrôles existants de calculs, sauvegardes, droits d’accès, baux, IRL, quittances et affichage mobile sont également exécutés.

## Périmètre

Cette APK conserve le canal personnel de test autorisé, sans abonnement pour le propriétaire du projet. Les règles commerciales et le traitement des sauvegardes multi-biens ne sont pas modifiés. Les mécanismes de paiement et la mise en production ne sont pas activés par cette livraison.

## Livraison vérifiée

Résultat final : compilation, contrôles JavaScript, régressions du navigateur et tests de l’APK installée sur émulateur Android API 34 réussis. Les captures utilisent uniquement des données fictives de vérification.

APK : `ImmOptima-Test-v28.apk` — 7 341 616 octets.
SHA-256 : `f4ebaa56181fa92f95413db73be4a5ea68d6d8a0e1670820e85af791026019f0`.
Les trois nouveaux/actualisés modules de guidage contenus dans l’APK ont été comparés octet par octet aux sources. Le certificat de test persistant est conservé.

La vérification de l’aide contrôle désormais l’accès à la fin du contenu sur petits et grands écrans ; elle n’impose pas de débordement lorsque tout le texte tient dans la fenêtre.
