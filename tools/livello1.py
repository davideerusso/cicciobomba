"""Livello 1 definitivo (Isola degli Ananas). y come nel gioco: la riga di terra è y=2.
Caratteri: # terra, - asse attraversabile, / % rampe, B molla, C cassa, ^ spine, ! spine a tempo,
c pizza, H cuore, e nemico, r riccio, f mosca, g cannone,
O peso, P pulsante, D porta, x blocco che crolla, y botola (sembra terra), X muro crepato.
Le pareti finte (sembrano terra, si attraversano) sono rettangoli in FINTI."""
import sys, json

PEZZI, FINTI = [], {}

class Pezzo:
    def __init__(s, nome, W, ytop):
        s.nome, s.W, s.ytop = nome, W, ytop
        s.g = [[' '] * W for _ in range(ytop - 1)]
        s.finti = []
    def put(s, y, x, t): s.g[s.ytop - y][x] = t
    def fila(s, y, x0, x1, t):
        for x in range(x0, x1 + 1): s.put(y, x, t)
    def col(s, x, y0, y1, t):
        for y in range(y0, y1 + 1): s.put(y, x, t)
    def blocco(s, x0, y0, x1, y1, t='#'):
        for y in range(y0, y1 + 1): s.fila(y, x0, x1, t)
    def finto(s, x0, y0, x1, y1): s.finti.append([x0, y0, x1, y1])
    def fine(s):
        PEZZI.append(f' {s.nome}:[' + ','.join('"' + ''.join(r) + '"' for r in s.g) + '],')
        if s.finti: FINTI[s.nome] = s.finti
        return s

def scendi(P, x0, ytop, n):   # rampa giù verso destra di n caselle, piena sotto
    for i in range(n):
        x, yt = x0 + i, ytop - i
        for y in range(2, yt): P.put(y, x, '#')
        P.put(yt, x, '%')

def sali(P, x0, ybase, n):    # rampa su verso destra di n caselle, piena sotto
    for i in range(n):
        x, yt = x0 + i, ybase + i
        for y in range(2, yt): P.put(y, x, '#')
        P.put(yt, x, '/')

# 1. APPRODO: un altopiano con un tunnel nascosto sotto, poi ricci e spine
P = Pezzo('approdo', 58, 12)
P.fila(2, 0, 9, '#'); P.put(3, 5, 'e')
P.fila(3, 4, 6, 'c')                                    # (la pizza sta in aria sopra al nemico)
# fosso di 3, poi un gradino e l'altopiano alto 5.5
P.blocco(13, 2, 13, 3)
P.blocco(14, 2, 44, 5)
P.blocco(16, 3, 44, 4, ' ')                             # il tunnel...
P.finto(16, 3, 44, 4)                                   # ...coperto da terra finta, e si esce dal lato destro
P.fila(3, 22, 28, 'c'); P.put(3, 31, 'H'); P.fila(3, 36, 40, 'c'); P.put(4, 38, 'c')
P.put(6, 19, 'e'); P.put(6, 27, 'e'); P.put(6, 37, 'e')
P.fila(6, 30, 31, '^')
P.fila(8, 23, 25, 'c'); P.fila(8, 39, 41, 'c')
P.fila(9, 27, 30, '-'); P.fila(10, 27, 30, 'c'); P.put(10, 29, 'c')     # in alto: salto e bolla
P.fila(2, 45, 57, '#')
P.fila(3, 49, 50, '^'); P.put(3, 53, 'r'); P.fila(5, 52, 53, 'c')
P.fila(3, 55, 56, '!')
P.fine()

# 2. MAGAZZINO: due piani; il peso va portato sul pulsante per aprire la porta
P = Pezzo('magazzino', 62, 17)
P.fila(2, 0, 61, '#')
P.put(3, 3, 'B')
P.fila(6, 5, 36, '#')                                   # piano di sopra
P.put(7, 10, 'O'); P.put(7, 9, 'C'); P.put(7, 11, 'C')   # il peso è chiuso tra due casse da rompere
P.fila(6, 18, 27, 'x')                                  # assi che crollano: il peso, se va piano, cade di sotto
P.put(6, 32, ' '); P.put(6, 33, ' ')                    # buco sopra il pulsante
P.put(3, 32, 'P'); P.put(3, 33, 'P')
P.put(7, 30, 'B')
P.put(9, 22, 'f'); P.put(9, 9, 'f')                     # mosche sopra il piano
for x in (8, 16, 24): P.put(3, x, 'e')                  # corridoio pieno
P.put(3, 28, 'r'); P.fila(3, 20, 21, '^')
P.fila(10, 14, 31, '-')                                 # mensola alta
P.fila(11, 24, 30, 'c')
P.blocco(5, 10, 13, 10); P.blocco(5, 14, 13, 14); P.col(5, 11, 13, '#')   # stanza nascosta a sinistra della mensola
P.col(13, 11, 13, ' '); P.finto(6, 11, 13, 13)          # la parete destra è finta
P.put(11, 8, 'c'); P.fila(11, 9, 11, 'c'); P.fila(12, 7, 10, 'c')
P.col(42, 3, 15, 'D')                                   # porta alta
P.fila(3, 45, 49, 'c'); P.put(3, 52, 'e'); P.put(3, 56, 'e')
P.fila(3, 58, 59, '!')
P.fine()

# 3. CROLLO: ponte che crolla con un buco in mezzo, mosche, poi la pista verso il muro crepato
P = Pezzo('crollo', 60, 13)
P.fila(2, 0, 7, '#'); P.fila(2, 33, 59, '#')
P.fila(2, 8, 18, 'x'); P.fila(2, 21, 32, 'x')           # ponte rotto in mezzo: si salta
for x in range(9, 32, 2):
    if x not in (19, 20): P.put(3, x, 'c')
P.put(6, 14, 'f'); P.put(6, 26, 'f')
P.fila(4, 36, 38, '-'); P.fila(6, 39, 41, '-'); P.fila(8, 41, 42, '-')
P.col(43, 3, 7, 'X'); P.fila(8, 43, 51, '#'); P.col(51, 3, 7, '#')
P.put(3, 45, 'H'); P.put(3, 47, 'c'); P.fila(5, 45, 49, 'c'); P.put(3, 49, 'c')
P.fila(9, 45, 49, 'c'); P.put(9, 47, 'e')
P.fila(3, 54, 56, '!'); P.put(3, 58, 'e')
P.fila(6, 2, 5, '-'); P.put(7, 3, 'H'); P.fila(7, 4, 5, 'c')          # in alto: ci si arriva solo con salto e bolla
P.fine()

# 3b. BURRONE: fosso largo con l'altra sponda alta; salto, scatto e bolla non bastano, serve il lancio
P = Pezzo('burrone', 47, 14)
P.fila(2, 0, 12, '#'); P.fila(3, 5, 7, 'c')             # pizza per il fiato del lancio
P.blocco(25, 2, 40, 8)                                  # sponda alta 6 caselle oltre 12 di vuoto
scendi(P, 41, 8, 6)
P.fila(9, 27, 33, 'c'); P.put(9, 36, 'e')
P.fine()

# 4. TORRE: si sale a zigzag tra assi e blocchi che crollano; in cima si va a destra
P = Pezzo('scalata', 44, 20)
P.fila(2, 0, 43, '#')
P.blocco(34, 3, 37, 16)                                 # muro alto: si passa solo dall'alto
P.blocco(0, 8, 3, 17)                                   # pilastro a sinistra con la stanza dentro
P.blocco(1, 12, 2, 13, ' '); P.col(3, 12, 13, ' '); P.finto(1, 12, 3, 13)
P.put(12, 1, 'H'); P.put(13, 2, 'c'); P.put(12, 2, 'c')
P.fila(4, 6, 9, '-'); P.fila(6, 11, 14, '-'); P.fila(8, 16, 19, 'x'); P.fila(10, 12, 15, '-')
P.fila(11, 4, 8, '-')                                   # davanti alla parete finta
P.fila(12, 17, 20, 'x'); P.fila(14, 22, 25, '-'); P.fila(16, 27, 33, '-')
P.put(9, 9, 'f'); P.put(13, 18, 'f'); P.put(17, 30, 'f')
P.fila(5, 7, 8, 'c'); P.fila(9, 17, 18, 'c'); P.fila(13, 18, 19, 'c'); P.fila(17, 28, 32, 'c')
P.put(3, 14, 'e'); P.put(3, 24, 'r'); P.fila(3, 28, 30, '^')
P.fila(17, 34, 37, 'c')
P.fila(3, 40, 41, '^'); P.put(3, 43, 'e')
P.fine()

# 5. CANNONI: casse e cannoni su più piani; una molla nascosta porta a un tesoro in cielo
P = Pezzo('artiglieria', 54, 16)
P.fila(2, 0, 53, '#')
P.blocco(6, 3, 8, 4); P.put(5, 7, 'g')
P.put(3, 11, 'C'); P.put(3, 12, 'C'); P.put(4, 12, 'C')
P.fila(5, 14, 18, '-'); P.put(6, 16, 'C')
P.blocco(20, 3, 23, 6); P.put(7, 22, 'g')
P.fila(10, 19, 24, '-'); P.put(11, 21, 'c'); P.fila(11, 22, 23, 'c')    # in alto: salto e bolla
P.put(3, 26, 'r'); P.fila(3, 28, 29, '^')
P.blocco(31, 3, 33, 4); P.put(5, 32, 'g')
P.fila(3, 35, 37, 'C'); P.fila(4, 36, 36, 'C')
P.blocco(41, 3, 42, 4, ' '); P.put(3, 41, 'B'); P.finto(40, 3, 43, 4); P.blocco(40, 3, 40, 4); P.blocco(43, 3, 43, 4)
P.col(40, 3, 4, ' ')                                    # si entra da sinistra nella terra finta e c'è la molla
P.fila(6, 38, 45, '-'); P.fila(7, 39, 44, 'c')
P.put(7, 42, 'B')                                       # seconda molla sulla mensola
P.fila(10, 40, 46, '-'); P.put(11, 43, 'c'); P.fila(11, 41, 42, 'c'); P.fila(11, 44, 45, 'c')
for x in (3, 15, 25, 46, 50): P.put(3, x, 'e')
P.blocco(48, 7, 53, 8); P.blocco(50, 7, 51, 8, ' '); P.finto(50, 7, 51, 8); P.put(7, 50, 'H')
P.fila(5, 9, 10, 'c'); P.fila(8, 21, 22, 'c'); P.fila(6, 34, 35, 'c')
P.fine()

# 6. VALANGA: su con le molle, giù per i gradoni travolgendo tutto; in fondo il muro crepato
P = Pezzo('valanga', 70, 16)
P.fila(2, 0, 69, '#')
P.put(3, 2, 'B'); P.put(3, 5, 'e')
P.blocco(4, 3, 9, 6); P.put(7, 8, 'B')
P.blocco(10, 3, 15, 10); P.put(11, 13, 'c')
scendi(P, 16, 10, 4)
P.blocco(20, 3, 23, 6); P.put(7, 21, 'e'); P.put(7, 23, 'C'); P.put(8, 20, 'c')
scendi(P, 24, 6, 2)
P.blocco(26, 3, 28, 4); P.put(5, 27, 'e'); P.put(5, 28, 'C')
scendi(P, 29, 4, 2)
for x in (33, 37, 40, 44, 47, 51): P.put(3, x, 'e')
for x in (35, 42, 49): P.put(3, x, 'C')
for x in (34, 39, 46): P.put(5, x, 'c')
P.col(58, 3, 7, 'X'); P.fila(8, 58, 62, '#'); P.col(62, 3, 7, '#')
P.put(3, 59, 'H'); P.put(3, 61, 'c'); P.fila(5, 59, 61, 'c')
P.fila(4, 52, 53, '-'); P.fila(6, 55, 56, '-')
P.put(3, 66, 'e')
P.fine()

if __name__ == '__main__':
    if '--scrivi' in sys.argv:   # rimette i pezzi e FINTI dentro game.js
        import os, re
        js = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'game.js')
        nomi = [t.strip().split(':')[0] for t in PEZZI]
        L = open(js, encoding='utf-8').read().split('\n')
        L = [l for l in L if not re.match(r'^\s?(' + '|'.join(nomi) + r'):\[', l)]
        i = [k for k, l in enumerate(L) if l.startswith(' gradini:[')]; assert len(i) == 1
        L[i[0]:i[0]] = PEZZI
        i = [k for k, l in enumerate(L) if l.startswith('const FINTI=')]; assert len(i) == 1
        L[i[0]] = 'const FINTI=' + json.dumps(FINTI, separators=(',', ':')) + ';'
        open(js, 'w', encoding='utf-8').write('\n'.join(L))
        print('scritto in game.js:', ', '.join(nomi))
    else:                        # disegna i pezzi a schermo per controllarli
        for t in PEZZI:
            print('\n' + t.split(':')[0].strip())
            for r in t[t.index('[') + 1:-2].split('","'):
                print('|' + r.strip('"') + '|')
