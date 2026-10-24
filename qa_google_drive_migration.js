// Guardrails for the ImmOptima Google Drive migration.
// Runs without credentials, Android devices or network access.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html','utf8');
const native = fs.readFileSync('android-print-patch.py','utf8');
const workflow = fs.readFileSync('.github/workflows/build.yml','utf8');
function check(name, fn) { fn(); console.log('PASS: '+name); }
check('existing local/email/cloud backup options retained', () => {
  for (const key of ["exportData('local')","exportData('email')","exportData('cloud')"]) assert.ok(html.includes(key),key);
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
  assert.match(workflow,/com\.monpatrimoine\.app\.test132/);
});
check('CI requires persistent signing secrets', () => {
  for(const key of ['IMMOPTIMA_KEYSTORE_BASE64','IMMOPTIMA_STORE_PASSWORD','IMMOPTIMA_KEY_ALIAS','IMMOPTIMA_KEY_PASSWORD']) assert.ok(workflow.includes(key),key);
  assert.match(workflow,/Persistent signing credentials verified/);
});
check('no fake Google connected or Drive saved success states', () => {
  assert.doesNotMatch(html,/Google Drive (?:connecté|sauvegardé) avec succès/i);
});
console.log('ImmOptima backup migration regression checks completed.');
