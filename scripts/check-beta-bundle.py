"""Inspect the built release manifest and actual AAB payload; no Play upload."""
from pathlib import Path
import sys,json,zipfile,xml.etree.ElementTree as E
root,out=map(Path,sys.argv[1:]);ns='{http://schemas.android.com/apk/res/android}'
paths=list((root/'app/build/intermediates/merged_manifests/release').rglob('AndroidManifest.xml'))
assert paths,'Missing merged release manifest'
m=E.parse(paths[0]).getroot();assert m.attrib[ns+'versionCode']=='42'
assert m.attrib['package']=='com.immoptima.app'
assert m.find('application').attrib.get(ns+'debuggable','false')=='false'
with zipfile.ZipFile(out/'ImmOptima-Beta-Google-Play-v42.aab') as z:
 h=z.read('base/assets/index.html').decode();assert "IMMOPTIMA_BUILD_CHANNEL='beta'" in h;assert 'personal-test' not in h
 assert not json.loads(z.read('base/assets/play-billing.json'))['enabled']
 assert not json.loads(z.read('base/assets/account-deletion.json'))['enabled']
 for n in z.namelist():
  if n.startswith('base/assets/') and n.endswith('.js'):assert b'personal-test' not in z.read(n),n
(out/'release-checks.json').write_text(json.dumps({'versionCode':42,'packageName':'com.immoptima.app','debuggable':False,'bundleAssetsChecked':True,'purchasesEnabled':False,'playUploaded':False,'realPlayInstallTested':False},indent=2)+'\n')
print('PASS release manifest, beta assets and disabled purchases in actual AAB')
