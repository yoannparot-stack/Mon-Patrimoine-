"""Build an isolated, non-purchasing client source package. Never deploys anything."""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
FILES = ['index.html','rental-local-data.js','rental-optimization.js','bank-simulator.js','document-design.js','landlord-tools.js','rental-management.js','client-guidance.js','property-readiness.js','first-use.js','client-experience.js','client-simplicity.js','client-journey.js','solo-landlord.js','help-search.js','play-billing.js','account-ui.js','account-deletion-ui.js','presentation-ui.js','legal-content.js','legal-ui.js','offer-design.js']

def prepare(output, channel):
    if channel not in ('commercial', 'beta'):
        raise ValueError('Unknown client channel')
    out = Path(output).resolve()
    if out == ROOT or out in ROOT.parents or (out.is_relative_to(ROOT) and out.parent != ROOT):
        raise ValueError('Output must be separate from source directories')
    if out.exists() and (not out.is_dir() or any(out.iterdir())):
        raise ValueError('Output must be empty; choose a new directory')
    # Validate and transform everything before touching the output directory.
    contents = {name: (ROOT / name).read_text() for name in FILES}
    marker = "const IMMOPTIMA_BUILD_CHANNEL='personal-test';"
    if contents['index.html'].count(marker) != 1:
        raise ValueError('Expected exactly one personal source channel')
    contents['index.html'] = contents['index.html'].replace(marker, f"const IMMOPTIMA_BUILD_CHANNEL='{channel}';")
    for name, text in contents.items():
        text = text.replace("IMMOPTIMA_BUILD_CHANNEL==='personal-test'", 'false').replace("IMMOPTIMA_BUILD_CHANNEL!=='personal-test'", 'true')
        if 'personal-test' in text:
            raise ValueError('Unexpected personal branch remains in ' + name)
        contents[name] = text
    html = contents['index.html']
    html = html.replace('Version personnelle · accès débloqué','Un bien gratuit · suivi Premium en essai 90 jours')
    html = html.replace('Test multi-biens','Découverte gratuite').replace('Multi-biens débloqué pour les essais · aucun abonnement requis.','Un bien gratuit · multi-biens avec abonnement actif.').replace('commercial-badge">TEST','commercial-badge">FREE')
    html = html.replace('Version de test sans limite commerciale de logements et sans abonnement. Importez votre sauvegarde depuis Plus → Importer pour vérifier votre patrimoine complet, puis ajoutez ou modifiez vos biens.','Gérez un logement gratuitement. L’ajout ou l’import de plusieurs biens nécessite un abonnement actif, vérifié sur votre compte.')
    html = html.replace('// Internal validation build: no purchase or subscription required.','// Client build: no personal bypass; verified access required.')
    if channel == 'beta':
        html = html.replace('ImmOptima · version de test V55','ImmOptima · bêta fermée V56')
        html = html.replace('</body>', '<script src="beta-info.js" defer></script>\n</body>')
        contents['beta-info.js'] = (ROOT / 'beta-info.js').read_text()
        contents['account-ui.js'] = contents['account-ui.js'].replace('Offre Premium · prix et conditions dans Google Play','Bêta gratuite · futurs tarifs à titre indicatif')
    else:
        html = html.replace('ImmOptima · version de test V55','ImmOptima · préparation client')
    contents['index.html'] = html
    for name, source in [('play-billing.json', 'billing/play-billing.json'), ('account-deletion.json', 'account-deletion/config.json')]:
        config = json.loads((ROOT / source).read_text())
        if config.get('enabled') is not False:
            raise ValueError('Prepared clients must keep purchases/deletion disabled: ' + source)
        contents[name] = json.dumps(config, ensure_ascii=False) + '\n'
    for asset in re.findall(r'<script\b[^>]*\bsrc=[\"\x27]([^\"\x27]+)', html):
        if asset not in contents:
            raise ValueError('Missing or unapproved script asset: ' + asset)
    hashes = {name: hashlib.sha256(text.encode()).hexdigest() for name, text in contents.items()}
    contents['client-build.json'] = json.dumps({'channel':channel,'personalBypass':False,'purchasesEnabled':False,'deletionEnabled':False,'deployed':False,'assets':hashes}, ensure_ascii=False, indent=2) + '\n'
    if channel == 'beta':
        contents['beta-build.json'] = json.dumps({'channel':'beta','versionCode':56,'packageName':'com.immoptima.app','purchasesEnabled':False,'personalBypass':False,'trialDays':90,'trialScope':'one-property','activation':'explicit authenticated server activation','playUploaded':False,'publicRelease':False,'requiresRealAccountValidation':True,'requiresPublisherAndPolicyCompletion':True}, ensure_ascii=False, indent=2) + '\n'
    out.mkdir(parents=True, exist_ok=True)
    for name, text in contents.items():
        (out / name).write_text(text)
    return out
