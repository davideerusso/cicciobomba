# Cicciobomba

Gioco per browser pensato per il telefono in orizzontale, pubblicato con GitHub Pages su https://davideerusso.github.io/cicciobomba/ (repo `davideerusso/cicciobomba`, ramo `main`). Matteo (o un amico aggiunto dal menu) ha il corpo rotondo e rotola: tre mondi (Isola degli Ananas, Bosco dei Funghi, Fornace di Pietra) con tappe di corsa 2D e un boss 2D su più piani alla fine di ognuno. Il cibo ("bocconi") carica la bomba: una caduta alta o uno schianto veloce fanno esplodere Matteo. Ci sono skin da comprare con i bocconi e la foto dell'amico da mettere sulla palla.

## File
- `index.html`: solo il markup delle schermate (menu, guida, amici e skin, pausa, fine, HUD).
- `style.css`: lo stile, con i colori come variabili su `:root`.
- `game.js`: tutta la logica, in un unico script classico chiuso in una funzione e diviso in sezioni `/* ---------- NOME ---------- */`: orientamento, salvataggio, mondi e tappe, kit grafico e sonoro, skin, palla dipinta, audio, stato, comandi, cuori, corsa 2D, boss 2D, la bomba, guida, flusso, menu, ciclo.
- `assets/`: `kit.webp` (atlante dei blocchi Kenney, coordinate in `KMAP`), `personaggio.webp`, `personaggio2.webp` e `personaggio3.webp` (fogli delle animazioni di Matteo; il terzo è Matteo stanco, con le stesse celle da 200 del secondo, e se ne usa un solo fotogramma), `fumo.webp`, `polvere.webp`, `esplosione.webp`, `pizza.webp`, `kit2.webp` (altri pezzi del kit), `pixel.webp` (caselle da 18: erba del Pixel Platformer per il terreno del mondo 1 e terra del kit Farm Expansion per le grotte), `bomba.webp` (Matteo carico al massimo: 37 fotogrammi da 160 in righe da 10, mappa in `disegnaBomba`), `boss_ananas.webp` (Ananassone: fotogrammi da 192x204 in righe da 8, 32-34 stordito, mappa in `disegnaAnanas` e `disegnaBoss`; gli altri due boss sono ancora disegnati nel codice in `BOSPR`), `fondi/*.webp`, `suoni/*.mp3`.
- `tools/build.py`: ricompone tutto in `dist/cicciobomba.html`, un file unico con le risorse dentro, che si apre con un doppio clic. `dist/` è generata ed esclusa da git: non modificarla a mano.

## Regole
- Testi, nomi di variabili e commenti in italiano. Il codice è compatto (righe lunghe, nomi brevi): mantieni lo stesso stile.
- Grafica e suoni solo CC0 (Kenney: New Platformer Pack, Pixel Platformer, Pixel Platformer Farm Expansion) o disegnati nel codice. Il terreno del mondo 1 è pixel art: `sp()` disegna i nomi `terrain_sand_*` con le caselle di `pixel.webp` (mappa `PIX`), senza smussare i pixel. Le rampe le disegna `rampaPixel`, perché il kit non ne ha. Un nuovo asset va in `assets/` e si richiama con un percorso scritto per intero tra apici (`'assets/...'`), altrimenti `build.py` non lo mette nel file unico.
- Il salvataggio sta nel `localStorage` con chiave `rotolamici-v1`. Se cambi la struttura di `S`, gestisci i salvataggi vecchi.
- `VITE_INFINITE` in `game.js` è un'impostazione per le prove: con `true` non si perdono cuori. Va lasciata `false`.
- Quello che va su `main` finisce subito online su GitHub Pages: si pubblica solo dopo averlo provato.

## Provare il gioco
- Serve un server locale: aperti dal disco, i file separati non caricano le risorse. La configurazione è in `.claude/launch.json`. Da terminale:
  `python3 -m http.server 8765` nella cartella, poi `http://localhost:8765`.
- I sensori di inclinazione funzionano solo su HTTPS (GitHub Pages) o aprendo il file unico sul telefono. Su `http://` in rete locale si gioca trascinando il dito.
- Dopo ogni modifica: aprire il menu, partire con Gioca, controllare che la console non dia errori, e poi rifare il file unico con `python3 tools/build.py`.
- Comandi da tastiera nel browser: frecce per muoversi, spazio per saltare, Shift o X per scattare, Q/E per il lancio, Esc per la pausa. Sul telefono si inclina per rotolare e si tocca a destra/sinistra per saltare/scattare.
- `window.__rotolamici` espone `G`, `P2`, `M`, `suOrient`, `suMoto` e il resto per le prove da console. Il browser dell'app rifiuta il permesso dei sensori: per provarli si chiamano `suOrient`/`suMoto` con eventi finti. Con il pannello del browser nascosto `requestAnimationFrame` si ferma e il gioco non avanza: in quel caso si può usare una copia di `index.html` in `dist/` che sostituisce `requestAnimationFrame` con una coda da far avanzare a mano. In quella copia aggiungere `?v=` agli indirizzi di `game.js` e `style.css`: il browser dell'app li tiene in memoria e altrimenti si provano le versioni vecchie.

## Livello 1 (Isola degli Ananas)
- Niente ananas decorativi fermi in giro per la mappa (`MONDI[0].decor`): l'utente non li vuole. Gli ananas nemici restano.
- È la prima corsa, `CORSE[0]`: sei pezzi, `approdo`, `magazzino`, `crollo`, `scalata`, `artiglieria` e `valanga`, poi il boss Ananassone. Gli altri mondi usano ancora i pezzi vecchi; attenzione a non riusarne i nomi (`torre`, `cannoni`… ci sono già).
- I pezzi e `FINTI` si generano con `tools/livello1.py`. Lo si cambia lì e poi si lancia `python3 tools/livello1.py --scrivi`; senza argomenti disegna i pezzi a schermo.
- Il livello ha dei segreti che l'utente vuole scoprire da solo: non elencarli e non descriverne la posizione nelle risposte.
- Difficoltà alta voluta: 3 cuori in tutto (`MAXC=3`), niente vite infinite. Se finisci i cuori riparti dall'inizio.
- Caratteri nei pezzi:
  - `O` peso: pesante. Scivola piano dove inclini il telefono e Matteo lo spinge; su una gobba lo porta solo spingendo. Se cade fuori torna al suo posto. Nel magazzino è chiuso tra due casse da rompere.
  - `P` pulsante, `D` porta: quando il peso cade sul pulsante, le porte dello stesso pezzo si aprono per sempre. Matteo da solo non lo preme.
  - `x` blocco che crolla: mezzo secondo dopo che ci sali cade, e torna dopo 4 secondi.
  - `y` botola: sembra terra, ma se ti fermi sopra crolla dopo 0,8 secondi. Per ora nel livello 1 non ce ne sono: l'utente non le voleva dove c'erano.
  - `X` muro crepato: si apre solo con l'esplosione.
  - **Pareti finte** (rettangoli in `FINTI`): si disegnano come terra sopra quello che c'è dietro, si attraversano e sbiadiscono quando Matteo ci entra. Dietro c'è una grotta: sfondo di terra scura; il pavimento è la casella di terra con il bordo in cima, il soffitto la stessa casella capovolta.
- Valide in tutto il gioco:
  - **Slancio:** rotolando giù per una rampa a più di 6 di velocità, Matteo travolge nemici e casse per circa un secondo, e ogni colpo lo rinnova (`p.slancio`). Finché dura non viene frenato e può superare la velocità massima, così basta poca inclinazione.
  - **Combo:** nemici e casse travolti di fila valgono bocconi in più e mostrano "x2", "x3"… (`combo`).
  - **Pendenze:** in pendenza accelera la gravità; inclinare in discesa aggiunge poco, in salita aiuta. In discesa Matteo resta attaccato alla rampa invece di decollare.
  - **Fiato:** la barra sotto i cuori (`G.fiato`, da 0 a 1). Lo scatto costa 0,3 e il lancio 0,2. Matteo è grasso: il fiato si ricarica piano (0,07 al secondo, da vuoto a pieno in 14 s) e solo dopo 2 secondi senza scatti (`G.fiatoT`), mentre ogni pizza dà subito 0,25. Con uno scatto ogni 3 secondi e niente pizza deve stancarsi in una decina di secondi: l'utente lo vuole così. Se scatti senza fiato Matteo si ferma di colpo e riposa per 2 secondi (`p.stanco`): non si muove né salta, poi riparte con 0,4. Finché è una bomba (carica piena) scatti e lanci non consumano fiato. Mentre riposa si disegna solo con un fotogramma, in piedi e sudato (riga 0, colonna 7 di `personaggio3.webp`); l'utente non vuole le altre animazioni da stanco.
  - **Lancio:** un colpo secco del telefono verso un lato (più di 15 m/s² sull'asse orizzontale dello schermo, da `devicemotion`) lancia Matteo da quella parte, se è a terra: salta più in alto del salto normale e vola di lato senza freno per un attimo (`lancio`, `p.lancio`). Da tastiera: Q a sinistra, E a destra.
  - **Ripartenza:** dopo una caduta si riparte solo da terra vera (`#`), mai da un blocco che crolla.
- Gli sprite nuovi vengono dal New Platformer Pack e stanno in `assets/kit2.webp`: pulsante, lucchetto, peso, mattoni e i blocchi con la faccia. `sp()` li disegna quando la voce di `KMAP` ha un terzo valore.
- Misure per disegnare i pezzi: una molla fa salire di circa 4,9 caselle e un salto di circa 2,3; per atterrare su una piattaforma il centro di Matteo deve superarne la cima di 0,46. Ogni salto difficile va provato nel browser.
- Mentre il boss prende la mira, un cerchio rosso tenue segna dove atterrerà (`arrivoBoss`, che rifà gli stessi controlli dell'urto). Niente linea tratteggiata: all'utente sembrava troppo evidente.
- L'arena del boss è un `M` senza i campi dei livelli (`nomi`, `pesi`, `crolli`…): ogni uso di quei campi va protetto. Il boss ha raggio 0,95.
- Per provare dei pezzi a parte da console: `__rotolamici.iniziaRun(['nome',...])` (alla fine torna al menu). La Spremiananas è stata tolta perché non piaceva: non rimetterla.

## Note
- Il progetto sta su un disco esterno (`/Volumes/TOSHIBA EXT`). I file `._*` li crea macOS e sono esclusi da git.
- Il ramo locale `vecchia-base` contiene il primo prototipo, fatto su una copia vecchia del gioco: non va unito.
