#!/usr/bin/env bash
set -euo pipefail
umask 077
REPO="yoannparot-stack/Mon-Patrimoine-"
BRANCH="test-v1.3.2-reprise-2026-10-11"
[ "$(git branch --show-current)" = "$BRANCH" ] || { echo "ERREUR: selectionne d'abord la branche $BRANCH"; exit 1; }
command -v keytool >/dev/null || { echo "Java/keytool absent"; exit 1; }
command -v gh >/dev/null || { echo "GitHub CLI (gh) absent"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "GitHub CLI non connecte. Executer gh auth login."; exit 1; }
BACKUP="$HOME/immoptima-signing-backup"
mkdir -p "$BACKUP"
chmod 700 "$BACKUP"
KEYSTORE="$BACKUP/immoptima-test-signing.jks"
CREDS="$BACKUP/immoptima-test-credentials.txt"
if [ -e "$KEYSTORE" ] || [ -e "$CREDS" ]; then echo "Sauvegarde deja presente : $BACKUP. Aucun remplacement."; exit 1; fi
STORE_PASS="$(openssl rand -hex 24)"
KEY_PASS="$STORE_PASS"
ALIAS="immoptima-test"
keytool -genkeypair -v -keystore "$KEYSTORE" -storetype PKCS12 -alias "$ALIAS" -keyalg RSA -keysize 3072 -validity 3650 -storepass "$STORE_PASS" -keypass "$KEY_PASS" -dname "CN=ImmOptima Test, OU=Android, O=ImmOptima, C=FR" >/dev/null 2>&1
printf 'IMMOPTIMA_STORE_PASSWORD=%s\nIMMOPTIMA_KEY_ALIAS=%s\nIMMOPTIMA_KEY_PASSWORD=%s\n' "$STORE_PASS" "$ALIAS" "$KEY_PASS" > "$CREDS"
chmod 600 "$KEYSTORE" "$CREDS"
echo "Enregistrement des 4 secrets GitHub..."
base64 -w0 "$KEYSTORE" | gh secret set IMMOPTIMA_KEYSTORE_BASE64 -R "$REPO"
printf '%s' "$STORE_PASS" | gh secret set IMMOPTIMA_STORE_PASSWORD -R "$REPO"
printf '%s' "$ALIAS" | gh secret set IMMOPTIMA_KEY_ALIAS -R "$REPO"
printf '%s' "$KEY_PASS" | gh secret set IMMOPTIMA_KEY_PASSWORD -R "$REPO"
echo "SECRETS ENREGISTRES. Empreinte publique du certificat :"
keytool -list -v -keystore "$KEYSTORE" -storepass "$STORE_PASS" -alias "$ALIAS" | grep -E 'SHA1:|SHA256:'
echo "IMPORTANT : telecharge les DEUX fichiers du dossier $BACKUP sur un stockage prive et sur, puis supprime les copies du Codespace. Ne partage jamais ces fichiers dans le chat ou le depot."
