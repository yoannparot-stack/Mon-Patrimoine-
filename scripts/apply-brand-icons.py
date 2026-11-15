"""Apply the approved ImmOptima symbol to Android launchers, without raster scaling."""
from pathlib import Path
import sys, xml.etree.ElementTree as ET

repo = Path(__file__).resolve().parents[1]
project = Path(sys.argv[1]).resolve()
manifest = project / 'app/src/main/AndroidManifest.xml'
res = project / 'app/src/main/res'
svg = ET.parse(repo / 'brand/ImmOptima-symbole.svg').getroot()
paths = []
for node in svg:
    if not node.tag.endswith('path'):
        continue
    data = node.attrib['d']
    if node.attrib.get('fill', '').startswith('url('):
        fill = '<aapt:attr name="android:fillColor"><gradient android:type="linear" android:startX="10" android:startY="45" android:endX="98" android:endY="108"><item android:offset="0" android:color="#00C8ED"/><item android:offset="1" android:color="#08DD6B"/></gradient></aapt:attr>'
        paths.append(f'<path android:pathData="{data}">{fill}</path>')
    else:
        paths.append(f'<path android:fillColor="#F5FBFF" android:pathData="{data}"/>')
opening = '<vector xmlns:android="http://schemas.android.com/apk/res/android" xmlns:aapt="http://schemas.android.com/aapt" android:width="108dp" android:height="108dp" android:viewportWidth="110" android:viewportHeight="114">'
legacy = opening + '<path android:fillColor="#06233E" android:pathData="M0,0H110V114H0Z"/>' + '<group android:scaleX="0.88" android:scaleY="0.88" android:translateX="6.6" android:translateY="6.84">' + ''.join(paths) + '</group></vector>'
foreground = opening + '<group android:scaleX="0.60" android:scaleY="0.60" android:translateX="22" android:translateY="22.8">' + ''.join(paths) + '</group></vector>'
monochrome = opening + '<group android:scaleX="0.60" android:scaleY="0.60" android:translateX="22" android:translateY="22.8">' + ''.join(f'<path android:fillColor="#FFFFFFFF" android:pathData="{n.attrib["d"]}"/>' for n in svg if n.tag.endswith('path')) + '</group></vector>'
adaptive = '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/immoptima_launcher_background"/><foreground android:drawable="@drawable/immoptima_launcher_foreground"/>{mono}</adaptive-icon>'
files = {
    'drawable/immoptima_launcher_foreground.xml': foreground,
    'drawable/immoptima_launcher_monochrome.xml': monochrome,
    'values/immoptima_brand.xml': '<resources><color name="immoptima_launcher_background">#06233E</color></resources>',
}
for name in ['ic_launcher', 'ic_launcher_round']:
    files[f'mipmap-anydpi/{name}.xml'] = legacy
    files[f'mipmap-anydpi-v26/{name}.xml'] = adaptive.format(mono='')
    files[f'mipmap-anydpi-v33/{name}.xml'] = adaptive.format(mono='<monochrome android:drawable="@drawable/immoptima_launcher_monochrome"/>')
for name, content in files.items():
    ET.fromstring(content)
    target = res / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text('<?xml version="1.0" encoding="utf-8"?>\n' + content + '\n')
text = manifest.read_text()
import re
text = re.sub(r'\s+android:(?:icon|roundIcon)="[^"]*"', '', text)
text = text.replace('<application ', '<application android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round" ', 1)
ET.fromstring(text)
manifest.write_text(text)
print('Approved ImmOptima launcher resources applied: legacy, adaptive and themed.')
