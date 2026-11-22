#!/usr/bin/env python3
"""Build a private review ZIP; never deploy, contact testers or include an APK."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    'COMMERCIALISATION_CHECKLIST.md', 'cloud/PLAN_VALIDATION_FIREBASE.md',
    'docs/MISE_EN_SERVICE_ET_DECISIONS.md', 'docs/DECLARATIONS_GOOGLE_PLAY.md',
    'docs/INFORMATIONS_EDITEUR_A_COMPLETER.md', 'docs/VALIDATION_EDITEUR_ET_DONNEES.md',
    'google-play-beta/DOSSIER-BETA.md', 'google-play-beta/FICHE-PLAY-FR.json',
    'google-play-beta/FICHE-PLAY-FR.txt',
    'google-play-beta/kit-test/01-CONSIGNES-TESTEURS.md',
    'google-play-beta/kit-test/02-RETOUR-TESTEUR.csv',
    'google-play-beta/kit-test/03-SUIVI-ORGANISATEUR.csv',
    'google-play-beta/kit-test/04-MODELES-MESSAGES.md',
]
EVIDENCE = ['manifest-permissions.json', 'release-checks.json', 'resolved-dependencies.txt', 'beta-build.json']

def build(output, evidence=None):
    output = Path(output).resolve()
    if output.exists():
        raise ValueError('Refusing to overwrite an existing deliverable')
    fiche = json.loads((ROOT / 'google-play-beta/FICHE-PLAY-FR.json').read_text())
    assert len(fiche['name']) <= 30 and len(fiche['shortDescription']) <= 80
    assert len(fiche['fullDescription']) <= 4000 and fiche['purchasesEnabled'] is False
    assert fiche['requiresReviewAgainstSubmittedBinary'] is True
    items = {name: (ROOT / name).read_bytes() for name in FILES}
    with tempfile.TemporaryDirectory(prefix='immoptima-launch-') as temp:
        preview = Path(temp) / 'pages'
        subprocess.run(['node', str(ROOT / 'scripts/prepare-beta-account.cjs'), str(preview)], check=True, capture_output=True)
        readiness = json.loads((preview / 'review-readiness.json').read_text())
        assert readiness['deployed'] is False and readiness['operationalDeletion'] is False
        for p in sorted(preview.iterdir()):
            items['pages-a-relire-non-publiees/' + p.name] = p.read_bytes()
    for scope in ['beta', 'commercial']:
        r = subprocess.run(['node', str(ROOT / 'scripts/publication-preflight.cjs'), scope], capture_output=True, text=True)
        if r.returncode not in (0, 1):
            raise RuntimeError(r.stderr)
        check = json.loads(r.stdout)
        assert check['mayPublish'] is False and check['purchasesEnabled'] is False
        items['controles/preflight-' + scope + '.json'] = r.stdout.encode()
    if evidence:
        for name in EVIDENCE:
            items['preuves-compilation-v52/' + name] = (Path(evidence) / name).read_bytes()
    items['LIRE-EN-PREMIER.md'] = '''# ImmOptima — préparation du lancement, 18 novembre 2026

Ce dossier est destiné au titulaire pour revue. Il ne constitue pas une mise en vente.

1. Lire la checklist et les décisions restantes.
2. Reprendre la fiche Google Play après vérification des fonctions réellement ouvertes.
3. Utiliser le kit testeurs avec des données fictives et de vrais volontaires confirmés.
4. Relire les pages dans le dossier pages-a-relire-non-publiees ; leurs contrôles listent les informations manquantes. Elles ne sont pas déployées.

Les CSV sont des trames, pas des résultats d'essais réels. Aucun message n'a été envoyé. Aucun achat, abonnement, changement de facturation ou compte réel supprimé. Les pages de suppression par e-mail supposent un traitement manuel réellement disponible avant publication.

APK personnelle V51 : réservée au titulaire, exclue de ce kit. AAB client V52 : fourni séparément, préparation Play non installable directement. Aucun fichier de patrimoine ni liste de contacts réelle inclus.

Preuves : source applicative be483fcc7ea55fde44063f38e048dce6ab1ff4b7 ; compilation/tests : https://github.com/yoannparot-stack/Mon-Patrimoine-/actions/runs/44259606825. Les tests automatisés et émulateurs ne certifient pas les services distants ni une procédure réelle de suppression.

Assistance prévue uniquement par e-mail : immoptima12@gmail.com.
'''.encode()
    assert all(not name.endswith(('.apk', '.aab', '.png', '.jpg')) for name in items)
    manifest = {name: hashlib.sha256(data).hexdigest() for name, data in sorted(items.items())}
    items['SHA256.json'] = (json.dumps(manifest, indent=2, ensure_ascii=False) + '\n').encode()
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('xb') as handle:
        with zipfile.ZipFile(handle, 'w', zipfile.ZIP_DEFLATED) as archive:
            for name, data in sorted(items.items()):
                archive.writestr(name, data)
    with zipfile.ZipFile(output) as archive:
        assert all(hashlib.sha256(archive.read(name)).hexdigest() == digest for name, digest in manifest.items())
    return {'file': str(output), 'files': len(items), 'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'published': False}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output')
    parser.add_argument('--evidence')
    args = parser.parse_args()
    print(json.dumps(build(args.output, args.evidence), ensure_ascii=False))
