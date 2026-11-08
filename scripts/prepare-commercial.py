"""Create an isolated commercial source directory. Never ship the personal build."""
from pathlib import Path
import sys,shutil
root=Path(__file__).resolve().parents[1]
out=Path(sys.argv[1]).resolve()
if out==root or out in root.parents: raise SystemExit('Output must be separate from source')
out.mkdir(parents=True,exist_ok=True)
for name in ['index.html','rental-local-data.js','rental-optimization.js','bank-simulator.js','landlord-tools.js','rental-management.js','client-guidance.js','property-readiness.js','first-use.js','client-experience.js','client-simplicity.js','client-journey.js']:
    shutil.copy2(root/name,out/name)
p=out/'index.html';s=p.read_text()
assert "const IMMOPTIMA_BUILD_CHANNEL='personal-test';" in s
s=s.replace("const IMMOPTIMA_BUILD_CHANNEL='personal-test';","const IMMOPTIMA_BUILD_CHANNEL='commercial';")
# Remove the personal bypass altogether, even if a JS constant were overwritten.
s=s.replace("IMMOPTIMA_BUILD_CHANNEL==='personal-test'",'false').replace("IMMOPTIMA_BUILD_CHANNEL!=='personal-test'",'true')
s=s.replace('Test multi-biens','Découverte gratuite').replace('Multi-biens débloqué pour les essais · aucun abonnement requis.','Un bien gratuit · multi-biens avec abonnement actif.').replace('commercial-badge">TEST','commercial-badge">FREE')
s=s.replace('Version de test sans limite commerciale de logements et sans abonnement. Importez votre sauvegarde depuis Plus → Importer pour vérifier votre patrimoine complet, puis ajoutez ou modifiez vos biens.','Gérez un logement gratuitement. L’ajout ou l’import de plusieurs biens nécessite un abonnement actif, vérifié sur votre compte.')
assert "personal-test" not in s
p.write_text(s)
print('Commercial sources prepared: personal bypass removed; server access required.')
