# ImmOptima V36 — Dashboard C et Mon compte B

Version personnelle de test. Paquet `com.immoptima.app`, versionCode `36`.

## Changements

- Une frise compacte réunit deux accès distincts : « À compléter » en bleu et « Ce mois-ci » en vert. Les indicateurs du Dashboard restent inchangés ; les petits formats disposent d’un espacement adapté.
- Mon compte reprend la proposition B : abonnement en haut, accès personnel explicite, sauvegardes directement accessibles et réglages secondaires repliés.
- L’état affiché distingue accès personnel, propriétaire, abonnement vérifié, essai, essai terminé et accès à vérifier. Une réponse liée à un autre compte n’est pas affichée comme un accès acquis.
- La confirmation et la date d’une sauvegarde concernent le compte connecté. Les actions Sauvegarder, Vérifier et Restaurer restent accessibles.
- L’aide en pied de page réapparaît après navigation, même si un champ de l’ancienne page gardait le focus.
- Les liens « Mon compte » des présentations d’offre ouvrent la page du compte. Le bouton Retour ferme l’écran d’abonnement avant une rubrique située derrière lui.

## Vérification et livraison

Les cinq suites navigateur passent sans erreur d’exécution signalée : régressions générales, simplicité, parcours client, suivi mono-bien et navigation/compte. Les tests des règles cloud passent. Les vérifications de l’APK installée passent sur émulateurs Android 14 (API 34, tâche 128853698316) et Android 16 (API 36, tâche 128853698365). Elles incluent les deux accès de la frise, le Retour dans le parcours guidé, Mon compte B, les sauvegardes, l’aide visible après navigation et la conservation des données. Les captures finales ont été relues visuellement.

Source de l’application : `1cffddd1a461bf92eeb5e5279719bdde6c25a31a`. Exécution GitHub Actions : `42520520537`.

Binaire : `ImmOptima-Test-v36.apk`, 7 744 561 octets. SHA-256 : `99ef02ec98fd5ca343c094c38043fd9ba6a0efec6297274e4236199bfe466e90`.

Certificat SHA-256 : `fed154b7a4201230dabe6c08d1365d471d62464dbbc596ca37c383479cbbee35`, identique à V35. Installer par-dessus V35 après sauvegarde, sans désinstaller. Le contenu embarqué correspond aux sources, la configuration de paiement est désactivée.

## Limites

L’accès personnel reste débloqué. Aucun achat réel Google Play n’a été effectué ; le paiement reste désactivé. Les tests d’abonnement utilisent des réponses natives simulées, distinctes des tests des règles cloud. Aucun déploiement de service payant ni changement de compte Google Play n’est effectué par cette mise à jour.

La relecture du parcours porte sur la compréhension de l’offre, la visibilité des actions et la conservation des données ; elle ne remplace pas une étude auprès de clients réels.
