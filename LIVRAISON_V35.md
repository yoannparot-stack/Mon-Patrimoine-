# ImmOptima V35 — livraison personnelle

Version personnelle de test : `com.immoptima.app`, versionCode `35`, versionName `1.3.2-preview`.

## Changements

- Guidage plus visible dans Biens ; rappel plus discret dans le Dashboard.
- Épargne présentée en cartes mobiles, total des valeurs déclarées, actions accessibles, validation et conservation des catégories et notes.
- Recherche d’aide locale par mots-clés en pied de page, avec choix du bien et accès aux pages et formulaires correspondants.
- Préparation Google Play Billing et vérification serveur des abonnements. Paiements désactivés. Déblocage personnel conservé.

## Binaire

`ImmOptima-Test-v35.apk` — 7 740 399 octets.

SHA-256 : `7846165583920c9563533aab4f8fcad1c47c9808c92d3b49eb4003c6ee62ea74`.

Certificat SHA-256 : `fed154b7a4201230dabe6c08d1365d471d62464dbbc596ca37c383479cbbee35`, identique à la V34. Sauvegarder les données puis installer par-dessus la V34, sans désinstallation.

Source de l’application : `28378101bba0efb161eb18852288cb9e08885377`. Les commits suivants renforcent uniquement le banc de vérification Android ; ils ne changent pas l’application.

## Vérification

Les contrôles locaux des calculs, de l’épargne, de la recherche, des imports, des accès et des parcours passent. Les 25 tests des fonctions cloud et les tests des règles Firestore passent. Les cinq suites navigateur de la chaîne de compilation passent, sans erreur d’exécution signalée.

Les vérifications de l’APK installée passent sur émulateurs Android 14 (API 34, exécution 42497129987, tâche 128782596999) et Android 16 (API 36, exécution 42497129987, tâche 128782596950). Elles couvrent notamment la modification et l’enregistrement de l’épargne, la recherche « quittance », le bouton Retour physique et la préservation des données. Le binaire recompilé dans l’exécution 42497129987 a été comparé octet par octet au fichier livré : identique. Les captures d’écran ont été relues visuellement. Ces contrôles utilisent des données fictives et ne remplacent pas une étude auprès de clients réels.

## Limites commerciales

Aucun achat réel Google Play ni notification réelle d’abonnement n’a été testé. Les fonctions serveur ne sont pas déployées et les paiements restent désactivés. Configuration Play Console, validation des accès clients réels, confidentialité et suppression du compte restent nécessaires avant commercialisation. Ne pas publier cette version personnelle débloquée comme version client.
