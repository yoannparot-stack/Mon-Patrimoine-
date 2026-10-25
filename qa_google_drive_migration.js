// Guardrails for the ImmOptima Google Drive migration.
// Runs without credentials, Android devices or network access.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html','utf8');
const native = fs.readFileSync('android-print-patch.py','utf8');
const workflow = fs.readFileSync('.github/workflows/build.yml','utf8');
function check(name, fn) { fn(); console.log('PASS: '+name); }
check('existing local/email/cloud backup options retained', () => {
  for (const key of ["exportData('local')","exportData('email')","backupDirectDrive()"]) assert.ok(html.includes(key),key);
});
check('existing file import retained', () => {
  assert.match(html,/function importData\(e\)/);
  assert.match(html,/file\.size>10\*1024\*1024/);
  assert.match(html,/Sauvegarde importée avec succès/);
});
check('Android native share and PDF paths retained', () => {
  assert.match(native,/public void shareFile\(/);
  assert.match(native,/public void printBankSummary\(/);
});
check('test package matches configured Google OAuth Android client', () => {
  assert.match(workflow,/com\.immoptima\.app/);
});
check('CI requires persistent signing secrets', () => {
  for(const key of ['IMMOPTIMA_KEYSTORE_BASE64','IMMOPTIMA_STORE_PASSWORD','IMMOPTIMA_KEY_ALIAS','IMMOPTIMA_KEY_PASSWORD']) assert.ok(workflow.includes(key),key);
  assert.match(workflow,/Persistent signing credentials verified/);
});
check('no fake Google connected or Drive saved success states', () => {
  assert.doesNotMatch(html,/Google Drive (?:connecté|sauvegardé) avec succès/i);
});
check('visible Google backup uses document picker with explicit destination', () => {
 assert.match(html,/function backupDirectDrive\(/);
 assert.match(html,/exportVisibleDrive\(\);/);
 assert.match(html,/function exportVisibleDrive\(/);
 assert.match(html,/AndroidBridge\.saveFile\(JSON\.stringify\(db,null,2\),filename,'application\/json'\)/);
 assert.match(html,/Choisissez Google Drive et un dossier/);
});
const drivePatch = fs.readFileSync('android-drive-patch.py','utf8');
check('native Google Drive access is least privilege', () => {
  assert.match(drivePatch,/drive\.appdata/);
  assert.match(drivePatch,/appDataFolder/);
  assert.match(drivePatch,/getAccessToken/);
  assert.doesNotMatch(drivePatch,/JavascriptInterface public void .*Token/);
});
console.log('ImmOptima backup migration regression checks completed.');

check('optional onboarding matches approved Google design', () => {
 assert.match(html,/Sauvegarder sur Google Drive/);
 assert.match(html,/Utiliser sans sauvegarde Google/);
 assert.match(html,/immoptima_welcome_v1/);
});
check('private restore is explicit and validates all primary collections', () => {
 assert.match(html,/function immoptimaRestoreFromDriveBase64\(/);
 assert.match(html,/Dernière confirmation : remplacer votre patrimoine actuel/);
 assert.match(html,/\['properties','loans','assets'\]/);
 assert.match(drivePatch,/private void downloadDriveBackup\(/);
 assert.match(drivePatch,/private void listDriveBackups\(/);
 assert.match(drivePatch,/readDrive\(in,10\*1024\*1024\)/);
});
check('automatic backup requires opt-in and does not trigger during restoration', () => {
 assert.match(html,/immoptima_auto_google_v1/);
 assert.match(html,/now-last<86400000/);
 assert.match(html,/function save\(\)\{localStorage\.setItem\(KEY,JSON\.stringify\(db\)\); renderAll\(\); immoptimaMaybeAutoBackup\(\);\}/);
 assert.match(html,/immoptima_pre_restore_v1/);
});

check('local pre-restore recovery is accessible and guarded', () => {
 assert.match(html,/function immoptimaRecoverBeforeRestore\(/);
 assert.doesNotMatch(html,/>↩️ Annuler la dernière restauration<\/button>/);
 assert.match(html,/immoptima_pre_restore_v1/);
 assert.match(html,/Rétablir le patrimoine enregistré juste avant la dernière restauration Google/);
});

check('simplified customer-facing backup menu', () => {
 const menu=html.slice(html.indexOf('id="backupChoices"'),html.indexOf('class="commercial-banner'));
 assert.match(menu,/Sur mon téléphone/);
 assert.match(menu,/Par e-mail/);
 assert.match(menu,/Sur Google/);
 assert.doesNotMatch(menu,/Restaurer depuis Google|Annuler la dernière restauration|Sur le cloud/);
 assert.match(menu,/<details/);
});

check('visible Drive filenames do not collide across same-day saves', () => {
 assert.match(html,/ImmOptima_patrimoine_/);
 assert.match(html,/toISOString\(\)\.replace\(\/\[:\.\]\/g,'-'\)/);
});
check('Google onboarding uses the visible document picker', () => {
 assert.match(html,/typeof window\.AndroidBridge\.saveFile==='function'\)\{\s*backupDirectDrive\(\)/);
});

check('visible and private Google backups are clearly distinguished', () => {
 assert.match(html,/Sauvegarde automatique privée \(invisible dans Drive\)/);
 assert.match(html,/Ces copies ne sont pas visibles dans Google Drive/);
 assert.match(html,/Pour une copie visible, utilisez/);
});

check('JSON import preserves previous portfolio and does not trigger private auto-backup', () => {
 assert.match(html,/immoptima_pre_import_v1/);
 assert.match(html,/localStorage\.setItem\(KEY,JSON\.stringify\(db\)\);renderAll\(\);alert\('Sauvegarde importée avec succès/);
});

check('JSON import requires explicit user approval before replacing portfolio', () => {
 assert.match(html,/confirm\('Importer cette sauvegarde et remplacer le patrimoine actuel/);
 assert.match(html,/immoptima_pre_import_v1/);
});

check('onboarding does not misrepresent Drive file export as account login', () => {
 assert.match(html,/Connexion Google en version de test/);
 assert.doesNotMatch(html,/Continuer avec Google/);
});

check('future account is not falsely represented as active', () => {
 assert.match(html,/vos données restent sur cet appareil/);
 assert.doesNotMatch(html,/Compte ImmOptima connecté avec succès/);
});

check('account onboarding cannot silently impersonate a working online identity', () => {
 assert.match(html,/IMMOPTIMA_ACCOUNT_STATUS='authentication_preview'/);
 assert.match(html,/Se connecter à ImmOptima/);
 assert.match(html,/La synchronisation n’est pas encore active/);
 assert.match(html,/welcomeAccountInfo/);
 assert.match(html,/Sauvegarder sur Google Drive/);
 assert.match(html,/Utiliser sans sauvegarde Google/);
});

check('Firebase security rules are deny-by-default and scoped to owner', () => {
 const rules=fs.readFileSync('firebase/firestore.rules','utf8');
 assert.match(rules,/allow read, write: if false/);
 assert.match(rules,/request\.auth\.uid == uid/);
 assert.match(rules,/docId == "current"/);
 assert.doesNotMatch(rules,/allow read, write: if true/);
});
