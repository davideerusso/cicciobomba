# Cicciobomba

Gioco per browser pensato per il telefono in orizzontale, pubblicato con GitHub Pages su https://davideerusso.github.io/cicciobomba/ (repo `davideerusso/cicciobomba`, ramo `main`). Matteo (o un amico aggiunto dal menu) ha il corpo rotondo e rotola: tre mondi (Isola degli Ananas, Bosco dei Funghi, Fornace di Pietra) con tappe di corsa 2D e un boss 2D su più piani alla fine di ognuno. Il cibo ("bocconi") carica la bomba: una caduta alta o uno schianto veloce fanno esplodere Matteo. Ci sono skin da comprare con i bocconi e la foto dell'amico da mettere sulla palla.

## File
- `index.html`: solo il markup delle schermate (menu, guida, amici e skin, pausa, fine, HUD).
- `style.css`: lo stile, con i colori come variabili su `:root`.
- `game.js`: tutta la logica, in un unico script classico chiuso in una funzione e diviso in sezioni `/* ---------- NOME ---------- */`: orientamento, salvataggio, mondi e tappe, kit grafico e sonoro, skin, palla dipinta, audio, stato, comandi, cuori, corsa 2D, boss 2D, la bomba, guida, flusso, menu, ciclo.
- `assets/`: `kit.webp` (atlante dei blocchi Kenney, coordinate in `KMAP`), `personaggio.webp` e `personaggio2.webp` (fogli delle animazioni di Matteo), `fumo.webp`, `polvere.webp`, `esplosione.webp`, `pizza.webp`, `bomba.webp` (Matteo carico al massimo: 37 fotogrammi da 160 in righe da 10, mappa in `disegnaBomba`), `fondi/*.webp`, `suoni/*.mp3`.
- `tools/build.py`: ricompone tutto in `dist/cicciobomba.html`, un file unico con le risorse dentro, che si apre con un doppio clic. `dist/` è generata ed esclusa da git: non modificarla a mano.

## Regole
- Testi, nomi di variabili e commenti in italiano. Il codice è compatto (righe lunghe, nomi brevi): mantieni lo stesso stile.
- Grafica e suoni solo CC0 (Kenney, New Platformer Pack) o disegnati nel codice. Un nuovo asset va in `assets/` e si richiama con un percorso scritto per intero tra apici (`'assets/...'`), altrimenti `build.py` non lo mette nel file unico.
- Il salvataggio sta nel `localStorage` con chiave `rotolamici-v1`. Se cambi la struttura di `S`, gestisci i salvataggi vecchi.
- `VITE_INFINITE` in `game.js` è un'impostazione per le prove: con `true` non si perdono cuori.
- Quello che va su `main` finisce subito online su GitHub Pages: si pubblica solo dopo averlo provato.

## Provare il gioco
- Serve un server locale: aperti dal disco, i file separati non caricano le risorse. La configurazione è in `.claude/launch.json`. Da terminale:
  `python3 -m http.server 8765` nella cartella, poi `http://localhost:8765`.
- I sensori di inclinazione funzionano solo su HTTPS (GitHub Pages) o aprendo il file unico sul telefono. Su `http://` in rete locale si gioca trascinando il dito.
- Dopo ogni modifica: aprire il menu, partire con Gioca, controllare che la console non dia errori, e poi rifare il file unico con `python3 tools/build.py`.
- Comandi da tastiera nel browser: frecce per muoversi, spazio per saltare, Shift o X per scattare, Esc per la pausa. Sul telefono si inclina per rotolare e si tocca a destra/sinistra per saltare/scattare.
- `window.__rotolamici` espone `G`, `P2`, `M` e il resto per le prove da console. Con il pannello del browser nascosto `requestAnimationFrame` si ferma e il gioco non avanza: in quel caso si può usare una copia di `index.html` in `dist/` che sostituisce `requestAnimationFrame` con una coda da far avanzare a mano.

## Tappa di prova: La Spremiananas
- Si apre dal pulsante "Prova: Spremiananas" nel menu. Usa solo il pezzo `carico` di `PEZZI` e alla fine torna al menu invece di andare al boss (`M.prova`).
- Caratteri nuovi nei pezzi: `A` ananas da spingere, `K` cesta, `D` cancello. Si collegano tra loro se stanno nello stesso pezzo, e il cancello si apre quando l'ananas entra nella cesta.
- L'ananas rotola con l'inclinazione (`IN.tx`), Matteo lo spinge e l'esplosione lo lancia. Se cade ricompare dove l'hai trovato, senza perdere cuori, e la cesta lo prende solo se arriva piano. Fisica in `passoAnanas`.

## Note
- Il progetto sta su un disco esterno (`/Volumes/TOSHIBA EXT`). I file `._*` li crea macOS e sono esclusi da git.
- Il ramo locale `vecchia-base` contiene il primo prototipo, fatto su una copia vecchia del gioco: non va unito.
