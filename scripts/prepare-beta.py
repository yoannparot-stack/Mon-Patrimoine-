"""Prepare isolated, no-purchase beta sources; never modify the personal application."""
from pathlib import Path
import subprocess,sys,json
root=Path(__file__).resolve().parents[1];out=Path(sys.argv[1]).resolve()
subprocess.run([sys.executable,str(root/'scripts/prepare-commercial.py'),str(out)],check=True)
for p in out.glob('*.js'):
 s=p.read_text();s=s.replace("IMMOPTIMA_BUILD_CHANNEL==='personal-test'",'false').replace("IMMOPTIMA_BUILD_CHANNEL!=='personal-test'",'true')
 if p.name=='account-ui.js':s=s.replace('Offre Premium · prix et conditions dans Google Play','Bêta gratuite · futurs tarifs à titre indicatif')
 p.write_text(s)
p=out/'index.html';s=p.read_text().replace("const IMMOPTIMA_BUILD_CHANNEL='commercial';","const IMMOPTIMA_BUILD_CHANNEL='beta';")
s=s.replace('// Internal validation build: no purchase or subscription required.','// Closed beta: no personal bypass; explicit server trial and single-property scope retained.')
s=s.replace('ImmOptima · version de test V41','ImmOptima · bêta fermée V42')
s=s.replace('</body>','<script src="beta-info.js" defer></script>\n</body>');p.write_text(s)
(out/'beta-info.js').write_bytes((root/'beta-info.js').read_bytes())
for name,src in [('play-billing.json',root/'billing/play-billing.json'),('account-deletion.json',root/'account-deletion/config.json')]:
 cfg=json.loads(src.read_text());assert cfg['enabled'] is False,'Beta preparation must not enable any paid/deletion service';(out/name).write_text(json.dumps(cfg,ensure_ascii=False)+'\n')
for p in [out/'index.html',*out.glob('*.js')]:assert 'personal-test' not in p.read_text(),str(p)
metadata={'channel':'beta','versionCode':42,'packageName':'com.immoptima.app','purchasesEnabled':False,'personalBypass':False,'trialDays':90,'trialScope':'one-property','activation':'explicit authenticated server activation','playUploaded':False,'publicRelease':False,'requiresRealAccountValidation':True,'requiresPublisherAndPolicyCompletion':True}
(out/'beta-build.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
print('Isolated beta prepared: no personal bypass, no purchase, server-verified access retained.')
