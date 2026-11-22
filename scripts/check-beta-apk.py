"""Validate the signed client APK against its prepared source manifest."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import zipfile

apk, prepared, aapt = map(Path, sys.argv[1:])
manifest = json.loads((prepared / 'client-build.json').read_text())
assert manifest['channel'] == 'beta' and manifest['personalBypass'] is False
with zipfile.ZipFile(apk) as z:
    for name, digest in manifest['assets'].items():
        assert hashlib.sha256(z.read('assets/' + name)).hexdigest() == digest, name
    assert json.loads(z.read('assets/client-build.json')) == manifest
    for name in z.namelist():
        if name.startswith('assets/') and name.endswith(('.js', '.html')):
            assert b'personal-test' not in z.read(name), name
    for name in ('play-billing.json', 'account-deletion.json'):
        assert json.loads(z.read('assets/' + name))['enabled'] is False
badging = subprocess.check_output([str(aapt), 'dump', 'badging', str(apk)], text=True)
assert "package: name='com.immoptima.app' versionCode='52'" in badging
assert 'application-debuggable' not in badging
result = {'versionCode': 52, 'packageName': 'com.immoptima.app',
          'debuggable': False, 'preparedAssetsVerified': len(manifest['assets']),
          'purchasesEnabled': False, 'personalBypass': False,
          'sha256': hashlib.sha256(apk.read_bytes()).hexdigest(),
          'realGoogleAccountTested': False, 'playInstallTested': False}
(apk.parent / 'client-apk-checks.json').write_text(json.dumps(result, indent=2) + '\n')
print('PASS signed client APK: exact beta assets, release manifest, disabled purchases')
