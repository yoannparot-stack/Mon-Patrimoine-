# ImmOptima V39 — accueil validé

## Résultat

Accueil immersif avec titre « Le pilotage complet de votre patrimoine », description validée et trois étapes verticales. La signature « Un seul outil pour tout votre patrimoine » est renforcée sous le logo. L’illustration est embarquée. Le guidage propose immobilier ou épargne, l’import reste disponible, l’exemple est fictif et ne charge aucune donnée dans le patrimoine.

## Vérification

Source applicative : b485d0249a5cbbee38c7c7194c483d2cd138efd6.
Exécution GitHub Actions : 42892432114.

- Six suites navigateur réussies, sans erreur d’exécution signalée. Nouvel accueil contrôlé à 320, 393 et 430 pixels, avec titre, trois étapes, décodage de l’illustration, parcours immobilier / épargne, reprise du brouillon existant, import et liens juridiques avant connexion.
- Lecture de l’exemple : trois onglets, fermeture, retour au guidage ; patrimoine et sauvegarde locale conservés.
- Vérifications de l’APK installée réussies sur Android 14 / API 34 et Android 16 / API 36. Contrôle du toucher natif, du Retour physique et de la conservation des données fictives, y compris l’accueil et l’exemple.
- Calculs, accès, isolation des comptes et règles cloud : contrôles réussis dans la chaîne existante. Aucun compte de production ni achat réel n’est utilisé dans ces tests.

## Fichier

ImmOptima-Test-v39.apk ; paquet com.immoptima.app ; versionCode 39 ; 7 838 970 octets.
SHA-256 : 3bd7666d5531b6bf5637e5c6690d6eb568ff31f0ad70f9eb4845e3f321b50ed0.
Sept fichiers embarqués comparés aux sources attendues ; configuration des achats désactivée.
Certificat identique à V38 : SHA-256 fed154b7a4201230dabe6c08d1365d471d62464dbbc596ca37c383479cbbee35.
Après sauvegarde, installer par-dessus V38 sans désinstaller.

## Limites

Validation sur données fictives et émulateurs, sans étude auprès de clients réels. Paiement, informations définitives de l’éditeur, publication des textes et suppression effective du compte restent à finaliser. La V39 personnelle débloquée n’est pas le binaire commercial à publier sur Google Play.
