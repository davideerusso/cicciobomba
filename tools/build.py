"""Ricompone il gioco in un solo file HTML: dist/cicciobomba.html.

Mette dentro style.css, game.js e tutti i file di assets/ come data URI,
così il file si apre anche con un doppio clic e si può mandare a chiunque.
Uso: python3 tools/build.py
"""
import base64, os, re

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIPI = {'.webp': 'image/webp', '.png': 'image/png', '.mp3': 'audio/mpeg'}


def leggi(rel):
    with open(os.path.join(RADICE, rel), encoding='utf-8') as f:
        return f.read()


def data_uri(m):
    rel = m.group(2)
    tipo = TIPI[os.path.splitext(rel)[1]]
    with open(os.path.join(RADICE, rel), 'rb') as f:
        b64 = base64.b64encode(f.read()).decode()
    return f"{m.group(1)}data:{tipo};base64,{b64}{m.group(1)}"


html = leggi('index.html')
js = re.sub(r"(['\"])(assets/[\w./-]+)\1", data_uri, leggi('game.js'))
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + leggi('style.css') + '</style>')
html = html.replace('<script src="game.js"></script>', '<script>\n' + js + '</script>')
assert 'assets/' not in js and 'game.js' not in html and 'style.css' not in html

os.makedirs(os.path.join(RADICE, 'dist'), exist_ok=True)
uscita = os.path.join(RADICE, 'dist', 'cicciobomba.html')
with open(uscita, 'w', encoding='utf-8') as f:
    f.write(html)
print(f'{uscita} ({os.path.getsize(uscita) // 1024} KB)')
