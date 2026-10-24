# ImmOptima — connexion Google et sauvegarde Drive intégrée

## État
Préparation technique uniquement. La connexion Google native n'est PAS activée ni testée.
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
