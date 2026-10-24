# ImmOptima — connexion Google et sauvegarde Drive intégrée

## État
Phase de réalisation : la signature et les contrôles de non-régression sont validés. L'authentification Google native et le transfert Drive doivent encore être implémentés et validés sur un appareil Android. Ne jamais présenter les tests CI comme une preuve de connexion réelle.
Les trois sauvegardes manuelles actuelles restent opérationnelles et ne doivent pas être modifiées tant que le nouveau parcours n'est pas validé.

## Configuration externe obligatoire (propriétaire du compte Google)
1. Créer un projet Google Cloud nommé ImmOptima.
2. Configurer Google Auth Platform : marque ImmOptima, adresse d'assistance, audience Externe, compte de test.
3. Activer Google Drive API.
4. Enregistrer un client OAuth Android pour chaque identifiant de package réellement publié et chaque certificat de signature SHA-1 (debug et production sont distincts).
5. Préparer les liens publics vers politique de confidentialité et conditions d'utilisation.
6. Valider l'écran de consentement et la publication avant ouverture aux clients.

## Architecture à développer et tester
- Connexion Google via Credential Manager dans l'activité Android native ; jamais dans WebView.
- Autorisation Drive via AuthorizationClient, scope minimal https://www.googleapis.com/auth/drive.appdata.
- Écriture/lecture uniquement dans appDataFolder, espace Drive privé à l'application.
- Versionnement des sauvegardes, horodatage, taille, empreinte SHA-256, sauvegarde atomique, confirmation avant restauration.
- Indication claire du compte connecté, bouton de déconnexion et révocation d'autorisation.
- Aucun jeton OAuth dans JavaScript, HTML, localStorage, dépôt Git ou logs.
- En cas d'échec réseau, conserver intactes les données locales et les trois méthodes manuelles.
- Tester compte absent, autorisation refusée, réseau coupé, changement de téléphone, conflit, restauration et révocation.

## Points bloquants
Sans accès authentifié au Google Cloud Console du propriétaire, création du projet, consentement et identifiants OAuth ne peuvent être finalisés. Ne jamais simuler une connexion ou afficher une sauvegarde réussie sans accusé de réception de Drive.

Documentation : https://developer.android.com/identity/sign-in/credential-manager-siwg
https://developer.android.com/identity/authorization
https://developers.google.com/workspace/drive/api/guides/appdata

## Décisions de sécurité et d'ergonomie (24 octobre 2026)
- L'espace `appDataFolder` est **invisible** dans l'interface Google Drive. Conserver impérativement l'export manuel de fichiers pour les utilisateurs souhaitant une sauvegarde visible ou portable.
- L'autorisation Drive (`drive.appdata`) est distincte de la connexion au compte Google. Le bouton de sauvegarde ne doit pas prétendre être connecté avant un consentement réel.
- Les jetons OAuth ne transitent jamais dans le JavaScript WebView ni dans les logs. Utiliser l'API Google Identity native.
- Une sauvegarde n'est considérée réussie qu'après réponse HTTP valide de Drive. En cas d'échec, les données locales sont intactes.
- La restauration doit exiger une confirmation explicite et vérifier la structure JSON avant de remplacer les données locales.
- Le simple fait que la compilation CI réussisse ne prouve pas le fonctionnement OAuth sur un téléphone.
