"""Read-only reproducible audit. No credentials, customer data or paid APIs.
This is research tooling, not a production announcement collector.
"""
import csv
import datetime
import hashlib
import io
import json
from pathlib import Path
import urllib.error
import urllib.request
from urllib.parse import urlsplit
import zipfile

LIMIT = 15_000_000

def read(url):
    parsed = urlsplit(url)
    if parsed.scheme != 'https' or parsed.hostname not in {'www.data.gouv.fr', 'static.data.gouv.fr', 'www.observatoires-des-loyers.org'} or parsed.username or parsed.password:
        raise ValueError('Unapproved research source')
    request = urllib.request.Request(url, headers={'User-Agent': 'ImmOptima-Source-Review/1.0', 'Accept': 'application/json,text/csv,application/zip,text/html'})
    with urllib.request.urlopen(request, timeout=25) as response:
        data = response.read(LIMIT + 1)
        if len(data) > LIMIT:
            raise ValueError('Response exceeds research size limit')
        return data, {'url': url, 'status': response.status, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}

def decode(data):
    try:
        return data.decode('utf-8-sig')
    except UnicodeDecodeError:
        return data.decode('cp1252')

def metadata(slug):
    data, proof = read('https://www.data.gouv.fr/api/1/datasets/' + slug + '/')
    value = json.loads(data)
    if value.get('license') != 'lov2':
        raise ValueError('Unexpected licence: review required')
    return value, proof

def main():
    result = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'paidCalls': 0,
              'sourcesActivated': [], 'researchOnly': True, 'checks': [],
              'conclusion': 'No complete nationwide free furnished/unfurnished live-ad source validated.'}
    national, proof = metadata('resultats-nationaux-des-observatoires-locaux-des-loyers')
    resource = max((r for r in national['resources'] if r['format'].lower() == 'csv'), key=lambda r: r['title'])
    raw, csvproof = read(resource['url'])
    rows = list(csv.DictReader(io.StringIO(decode(raw)), delimiter=';'))
    required = {'loyer_1_quartile', 'loyer_median', 'loyer_3_quartile', 'agglomeration'}
    if not rows or not required.issubset(rows[0]):
        raise ValueError('Unexpected OLL schema')
    tours = [r for r in rows if r['agglomeration'] == 'Agglomération de Tours'
             and r['nombre_pieces_homogene'] == 'Appart 1P' and r['Type_habitat'] == 'Appartement'
             and not r['epoque_construction_homogene'] and not r['anciennete_locataire_homogene']]
    fields = ['Type_habitat', 'Zone_complementaire', 'Data_year', 'loyer_1_quartile', 'loyer_median', 'loyer_3_quartile',
              'loyer_mensuel_1_quartile', 'loyer_mensuel_median', 'loyer_mensuel_3_quartile',
              'surface_moyenne', 'nombre_observations']
    result['checks'].append({'source': 'OLL national', 'metadata': proof, 'csv': csvproof,
                            'licence': national['license'], 'resourceTitle': resource['title'],
                            'records': len(rows), 'agglomerations': len({r['agglomeration'] for r in rows}),
                            'headers': list(rows[0]), 'toursStudioSegments': [{k: r[k] for k in fields} for r in tours],
                            'limit': 'Published OLL statistics exclude furnished housing; do not infer furnished figures.'})
    local, proof = metadata('resultats-des-observatoires-locaux-des-loyers-par-agglomeration')
    resource = max((r for r in local['resources'] if 'Tours' in r['title'] and r['format'].lower() == 'zip'), key=lambda r: r['title'])
    raw, zipproof = read(resource['url'])
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        if sum(i.file_size for i in archive.infolist()) > LIMIT:
            raise ValueError('Expanded archive too large')
        filename = next(n for n in archive.namelist() if n.startswith('Base_OP_') and n.endswith('.csv'))
        headers = next(csv.reader(io.StringIO(decode(archive.read(filename))), delimiter=';'))
    result['checks'].append({'source': 'OLL Tours detailed', 'metadata': proof, 'archive': zipproof,
                            'licence': local['license'], 'resourceTitle': resource['title'], 'headers': headers,
                            'furnishedColumnPresent': any('meubl' in k.lower() or 'type_location' in k.lower() for k in headers)})
    anil, proof = metadata('carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2025')
    resource = next(r for r in anil['resources'] if r['format'].lower() == 'csv' and '1 ou 2' in r['title'])
    raw, csvproof = read(resource['url'])
    rows = list(csv.DictReader(io.StringIO(decode(raw)), delimiter=';'))
    row = next(r for r in rows if r.get('INSEE_C') == '37261')
    result['checks'].append({'source': 'ANIL T1/T2', 'metadata': proof, 'csv': csvproof, 'licence': anil['license'],
                            'communes': len(rows), 'tours': {k: row.get(k) for k in ['INSEE_C', 'LIBGEO', 'loypredm2', 'lwr.IPm2', 'upr.IPm2', 'R2_adj', 'nbobs_com', 'TYPPRED']},
                            'limit': 'Non-furnished reference dwelling of 37 m2, CC; model prediction and interval, not median/quartiles.'})
    destination = Path(__file__).with_name('free-sources-live-audit-2026-11-02.json')
    destination.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'audit': str(destination), 'checks': len(result['checks']), 'records': result['checks'][0]['records'],
                      'toursStudioSegments': result['checks'][0]['toursStudioSegments'], 'conclusion': result['conclusion']}, ensure_ascii=False))

if __name__ == '__main__':
    main()
