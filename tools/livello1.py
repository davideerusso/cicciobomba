"""Livelli: il 1 definitivo (Isola degli Ananas) e, in fondo, il 2 (Abisso). y come nel gioco: la riga di terra è y=2.
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
P.put(7, 35, 'B')                                       # oltre il buco: sul percorso del peso farebbe volare via Matteo mentre spinge
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

# ---------- MONDO 2: ABISSO ----------
# Una sola mappa a U, sott'acqua: si cade nel pozzo di sinistra, si passa dal fondo e si risale nuotando in quello di destra.
# Caratteri in più: S partenza, F uscita verso il boss, ~ pelo dell'acqua, * riccio di mare, u corrente che spinge su,
# m medusa, V buio della grotta; f è il pesce ed e il granchietto.
SY = 112
P = Pezzo('abisso', 88, 124)
P.blocco(0, 2, 87, SY)
P.blocco(2, 3, 25, SY, ' '); P.blocco(34, 3, 57, SY, ' '); P.blocco(26, 3, 33, 9, ' ')
P.blocco(0, SY + 1, 1, 124); P.blocco(26, SY + 1, 33, SY + 10)
P.put(SY + 5, 13, 'S'); P.put(SY, 5, '~')
def metti(t, *pos):
    for x, y in pos: P.put(y, x, t)
# la caduta
metti('c', (13, 110), (13, 107), (13, 104))
P.blocco(2, 99, 8, 100); P.blocco(19, 99, 25, 100); metti('f', (13, 95))
P.blocco(10, 89, 17, 90); metti('*', (13, 91)); metti('c', (5, 93), (22, 93), (5, 90), (22, 90))
P.blocco(2, 79, 15, 80); metti('f', (20, 75)); metti('c', (20, 84), (20, 81))
P.blocco(9, 71, 25, 72); metti('*', (10, 73), (14, 73)); metti('c', (5, 74), (5, 70))
P.blocco(2, 60, 9, 61); P.blocco(16, 60, 25, 61); P.fila(61, 10, 15, 'C'); metti('c', (12, 65), (13, 65))
P.blocco(2, 38, 9, 59); P.blocco(18, 38, 25, 59)
metti('*', (10, 54), (17, 50), (10, 46), (17, 42)); metti('m', (13, 48)); metti('c', (14, 56), (13, 44))
metti('f', (7, 33), (19, 30), (11, 26)); metti('*', (13, 34), (6, 28), (21, 24)); metti('c', (14, 31), (8, 24), (18, 21))
P.blocco(26, 28, 27, 31, 'X'); P.blocco(28, 28, 31, 31, ' '); metti('H', (30, 30)); metti('c', (29, 29), (31, 29))
P.blocco(2, 14, 10, 15); P.blocco(17, 14, 25, 15); P.fila(15, 11, 16, 'C'); metti('c', (13, 18), (14, 18))
metti('f', (14, 7)); metti('c', (8, 5), (20, 5), (24, 7)); metti('*', (30, 9))
# la risalita
P.blocco(52, 3, 54, 20, 'u'); metti('c', (53, 12), (53, 16), (45, 6), (40, 8))
P.blocco(34, 16, 46, 17); metti('f', (41, 12)); metti('*', (46, 18))
P.blocco(47, 26, 57, 27); metti('f', (41, 22)); metti('c', (40, 24), (40, 28), (44, 31)); metti('*', (47, 28), (36, 21))
P.blocco(34, 34, 50, 35); metti('f', (54, 31)); metti('c', (54, 37), (54, 34))
P.blocco(34, 42, 41, 62); P.blocco(50, 42, 57, 62); P.blocco(45, 42, 46, 50, 'u')
metti('*', (42, 54), (49, 50), (42, 46), (49, 58)); metti('m', (46, 53), (44, 59)); metti('c', (45, 52), (46, 56))
P.blocco(34, 74, 46, 75); metti('f', (40, 68), (52, 71)); metti('*', (47, 76), (38, 66)); metti('c', (52, 66), (52, 70), (52, 74), (52, 78))
P.blocco(47, 84, 57, 85); metti('m', (40, 82)); metti('H', (36, 79)); metti('*', (38, 78), (38, 81), (41, 78)); metti('c', (43, 84), (43, 88))
P.blocco(36, 90, 38, 104, 'u'); metti('c', (37, 94), (37, 98), (37, 102))
metti('f', (47, 94), (50, 103)); metti('m', (53, 98)); metti('*', (44, 90), (48, 99), (42, 104), (54, 92)); metti('c', (46, 108), (50, 108), (54, 108))
P.put(SY, 40, ' ')
# la spiaggia e la grotta del boss
metti('e', (66, SY + 1), (75, SY + 1)); metti('c', (62, SY + 2), (63, SY + 2), (70, SY + 3), (71, SY + 3)); metti('H', (73, SY + 4))
P.blocco(79, SY + 4, 87, SY + 10); P.blocco(85, SY + 1, 87, SY + 3); P.blocco(80, SY + 1, 84, SY + 3, 'V'); P.put(SY + 1, 81, 'F')
P.fine()

if __name__ == '__main__':
    if '--scrivi' in sys.argv:   # rimette i pezzi e FINTI dentro game.js
        import os, re
        js = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'game.js')
        nomi = [t.strip().split(':')[0] for t in PEZZI]
        L = open(js, encoding='utf-8').read().split('\n')
        L = [l for l in L if not re.match(r'^\s?(' + '|'.join(nomi) + r'):\[', l)]
        i = [k for k, l in enumerate(L) if l.startswith('const PEZZI={')]; assert len(i) == 1
        L[i[0] + 1:i[0] + 1] = PEZZI
        i = [k for k, l in enumerate(L) if l.startswith('const FINTI=')]; assert len(i) == 1
        L[i[0]] = 'const FINTI=' + json.dumps(FINTI, separators=(',', ':')) + ';'
        open(js, 'w', encoding='utf-8').write('\n'.join(L))
        print('scritto in game.js:', ', '.join(nomi))
    else:                        # disegna i pezzi a schermo per controllarli
        for t in PEZZI:
            print('\n' + t.split(':')[0].strip())
            for r in t[t.index('[') + 1:-2].split('","'):
                print('|' + r.strip('"') + '|')
