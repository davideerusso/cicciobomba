"use strict";
addEventListener("error",e=>{const t=document.getElementById("erroreT");if(t&&e.message&&document.getElementById("gioco")){t.hidden=false;t.textContent="Si è verificato un errore: "+e.message+". Ricarica la pagina.";}});
(function(){
const $=id=>document.getElementById(id);
/* ogni immagine del gioco finisce in IMMAGINI: Gioca aspetta che siano tutte caricate, se no con la rete lenta all'inizio mancano caselle, nemici e Matteo */
const IMMAGINI=[],Image=function(){const i=new window.Image();IMMAGINI.push(i);return i;};
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, rnd=(a,b)=>a+Math.random()*(b-a);
const riduci=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- ORIENTAMENTO ---------- */
const SC={W:innerWidth,H:innerHeight,rot:false};
function orienta(){
 const f=document.activeElement;if(f&&f.tagName==='INPUT'&&f.type==='text')return;
 const a=innerWidth,b=innerHeight,el=$('schermo');SC.rot=b>a;SC.W=Math.max(a,b);SC.H=Math.min(a,b);
 el.classList.toggle('ruotato',SC.rot);el.style.width=SC.W+'px';el.style.height=SC.H+'px';
}
orienta();
const puntoX=e=>SC.rot?e.clientY:e.clientX,puntoY=e=>SC.rot?innerWidth-e.clientX:e.clientY;
/* ---------- SALVATAGGIO ---------- */
const CHIAVE='rotolamici-v1';
const COLORI=['#3a3029','#3fb6a8','#e8655a','#6d8df0','#b56fd6','#7cc04b','#f08a3c','#e96fa6'];
let S={mappa:0,qui:0,fatti:[],record:0,gettoni:0,consigli:[],skin:['classica'],amici:[{nome:'Matteo',colore:COLORI[0],skin:'classica',foto:null}],sel:0,audio:true};
try{const v=JSON.parse(localStorage.getItem(CHIAVE));if(v&&v.amici&&v.amici.length)S=Object.assign(S,v);}catch(e){}
S.amici.forEach(a=>{if(a.skin!=='classica')a.skin='classica';});S.sel=0; /* le altre skin e la scelta degli amici non ci sono più: rotola sempre Matteo */
S.amici.forEach(a=>{if(['#f2b632','#62cf4a','#ffb27a','#f05a58','#b05a2c'].includes(a.colore))a.colore=COLORI[0];});
function salva(){try{localStorage.setItem(CHIAVE,JSON.stringify(S));}catch(e){}}

/* ---------- MONDI E TAPPE ---------- */
const MONDI=[
 {nome:'Isola degli Ananas',cielo:['#ffe382','#27a39b'],legno:'#f4bd3c',vena:'#a96c10',bordo:'#3f9e3a',nebbia:'#1f8f7d',tema:'ananas',kit:'sand',fondo:'ananas_nuovo',retro:'cielo',liquido:'water',decor:['erbananas','grass','rock'],nemico:'pera',volo:'uccellino'},
 {nome:'Abisso Salato',cielo:['#7fd4f7','#0a205c'],legno:'#f0c877',vena:'#a96c10',bordo:'#3f9e3a',nebbia:'#1f8f7d',tema:'mare',kit:'sand',fondo:'ananas_nuovo',liquido:'water',decor:[],nemico:'granchio',volo:'pesce',acqua:true},
];
const BOSS=[
 {nome:'Ananassone',r:1.1,terra:true,vita:6,scatto:14,stordito:1.8,colore:'#f4bd3c',corona:true},
 {nome:'Lele Volley',r:.72,terra:true,vita:6,scatto:15,stordito:1.1,colore:'#d98a55',palla:true},
];
/* ---------- KIT GRAFICO E SONORO (Kenney, New Platformer Pack, licenza CC0) ---------- */
const KIT=new Image();KIT.src='assets/kit.webp';
const KMAP={"terrain_sand_block":[2,2],"terrain_sand_block_top":[102,2],"terrain_sand_block_top_left":[202,2],"terrain_sand_block_top_right":[302,2],"terrain_sand_block_left":[402,2],"terrain_sand_block_right":[502,2],"terrain_sand_block_center":[602,2],"terrain_sand_block_bottom":[702,2],"terrain_sand_block_bottom_left":[802,2],"terrain_sand_block_bottom_right":[902,2],"terrain_sand_horizontal_left":[2,102],"terrain_sand_horizontal_middle":[102,102],"terrain_sand_horizontal_right":[202,102],"terrain_sand_vertical_top":[302,102],"terrain_sand_vertical_middle":[402,102],"terrain_sand_vertical_bottom":[502,102],"terrain_sand_cloud_left":[602,102],"terrain_sand_cloud_middle":[702,102],"terrain_sand_cloud_right":[802,102],"terrain_sand_ramp_short_b":[902,102],"terrain_purple_block":[2,202],"terrain_purple_block_top":[102,202],"terrain_purple_block_top_left":[202,202],"terrain_purple_block_top_right":[302,202],"terrain_purple_block_left":[402,202],"terrain_purple_block_right":[502,202],"terrain_purple_block_center":[602,202],"terrain_purple_block_bottom":[702,202],"terrain_purple_block_bottom_left":[802,202],"terrain_purple_block_bottom_right":[902,202],"terrain_purple_horizontal_left":[2,302],"terrain_purple_horizontal_middle":[102,302],"terrain_purple_horizontal_right":[202,302],"terrain_purple_vertical_top":[302,302],"terrain_purple_vertical_middle":[402,302],"terrain_purple_vertical_bottom":[502,302],"terrain_purple_cloud_left":[602,302],"terrain_purple_cloud_middle":[702,302],"terrain_purple_cloud_right":[802,302],"terrain_purple_ramp_short_b":[902,302],"terrain_stone_block":[2,402],"terrain_stone_block_top":[102,402],"terrain_stone_block_top_left":[202,402],"terrain_stone_block_top_right":[302,402],"terrain_stone_block_left":[402,402],"terrain_stone_block_right":[502,402],"terrain_stone_block_center":[602,402],"terrain_stone_block_bottom":[702,402],"terrain_stone_block_bottom_left":[802,402],"terrain_stone_block_bottom_right":[902,402],"terrain_stone_horizontal_left":[2,502],"terrain_stone_horizontal_middle":[102,502],"terrain_stone_horizontal_right":[202,502],"terrain_stone_vertical_top":[302,502],"terrain_stone_vertical_middle":[402,502],"terrain_stone_vertical_bottom":[502,502],"terrain_stone_cloud_left":[602,502],"terrain_stone_cloud_middle":[702,502],"terrain_stone_cloud_right":[802,502],"terrain_stone_ramp_short_b":[902,502],"bomb":[2,602],"bomb_active":[102,602],"bush":[202,602],"grass":[302,602],"grass_purple":[402,602],"mushroom_red":[502,602],"mushroom_brown":[602,602],"rock":[702,602],"fence":[802,602],"sign_right":[902,602],"sign_exit":[2,702],"flag_green_a":[102,702],"flag_green_b":[202,702],"door_closed":[302,702],"door_closed_top":[402,702],"door_open":[502,702],"door_open_top":[602,702],"coin_gold":[702,702],"coin_gold_side":[802,702],"heart":[902,702],"gem_blue":[2,802],"star":[102,802],"spring":[202,802],"spring_out":[302,802],"spikes":[402,802],"block_exclamation":[502,802],"block_strong_danger":[602,802],"fireball":[702,802],"lava":[802,802],"lava_top":[902,802],"lava_top_low":[2,902],"water":[102,902],"water_top":[202,902],"water_top_low":[302,902],"hud_heart":[402,902],"hud_coin":[502,902],"cactus":[602,902],"slime_normal_walk_a":[702,902],"slime_normal_walk_b":[802,902],"slime_fire_walk_a":[902,902],"slime_fire_walk_b":[2,1002],"slime_spike_walk_a":[102,1002],"slime_spike_walk_b":[202,1002],"bee_a":[302,1002],"bee_b":[402,1002],"fly_a":[502,1002],"fly_b":[602,1002]};
const FONDI={};[['clouds','assets/fondi/clouds.webp'],['color_hills','assets/fondi/color_hills.webp'],['ananas_lontano','assets/fondi/ananas_lontano.webp'],['ananas_ponti','assets/fondi/ananas_ponti.webp'],['ananas_nuovo','assets/fondi/ananas_nuovo.webp'],['cielo_nuvole','assets/fondi/cielo_nuvole.webp']].forEach(a=>{const i=new Image();i.src=a[1];FONDI[a[0]]=i;});
const SUONI={"magic":'assets/suoni/magic.mp3',"coin":'assets/suoni/coin.mp3',"jump":'assets/suoni/jump.mp3',"hurt":'assets/suoni/hurt.mp3',"disappear":'assets/suoni/disappear.mp3',"bump":'assets/suoni/bump.mp3',"throw":'assets/suoni/throw.mp3',"jump-high":'assets/suoni/jump-high.mp3',"gem":'assets/suoni/gem.mp3'};
const KIT2=new Image();KIT2.src='assets/kit2.webp'; /* altri pezzi del kit: pulsante, lucchetto, peso, mattoni, blocco che crolla */
Object.assign(KMAP,{"switch_blue":[2,2,2],"switch_blue_pressed":[102,2,2],"lock_blue":[202,2,2],"weight":[302,2,2],"bricks_brown":[402,2,2],"block_idle":[502,2,2],"block_fall":[602,2,2],"block_rest":[702,2,2]});
/* nomi delle caselle del terreno: indici nell'atlante del paesaggio */
const PIX={block:0,horizontal_left:1,horizontal_middle:2,horizontal_right:3,vertical_top:4,vertical_middle:5,vertical_bottom:6,block_top_left:7,block_top:8,block_top_right:9,block_left:10,block_center:11,block_right:12,block_bottom_left:13,block_bottom:14,block_bottom_right:15,cloud_left:1,cloud_middle:2,cloud_right:3};
/* il terreno del mondo 1 è il paesaggio ananas dell'utente: caselle da 68 nello stesso ordine di PIX, l'ultima è la rampa che scende */
const ERBANAN=new Image();ERBANAN.src='assets/erbananas.webp'; /* il ciuffo d'ananas dell'utente al posto del cespuglio nel mondo 1 */
/* in grandezza vera, alla scala delle caselle da 68 del paesaggio: così il bordo scuro è spesso come quello del pavimento */
function ciuffo(c,x,y,ts){const w=ERBANAN.width*ts/68,h=ERBANAN.height*ts/68;if(w)c.drawImage(ERBANAN,x-w/2,y-h,w,h);}
const PAES=new Image();PAES.src='assets/paesaggio.webp';const PAES_RAMPA=16,PAES_SOTTO=17,PAES_BORDO={m:18,g:19,v:20},PAES_UNIONE=21,PAES_COLONNA=22,PAES_LATO_COLONNA=23,PAES_GROTTA={fondo:24,pav:25,base:26,muro:27,muroPav:28,pavMuro:29,muroBase:30,cielo:31,angolo:32,angoloS:33,muroS:34,muroFondo:35,pavFondo:36,pavFine:37,muroPavS:38,muroBaseS:39,baseBordo:40,pavBordo:41}; /* 17: la terra sotto una rampa a scalini, con la buccia della rampa dopo nell'angolo; 18-20: dove il piano finisce a sinistra, ai piedi di un muro più alto (m), con un gradino in giù (g) o sul vuoto (v); a destra si capovolgono, il bordo sul vuoto al contrario; 21: il muro accanto al bordo sul vuoto, dove le due linee si uniscono; 22: sotto una colonna, con il piano che arriva dai due lati; 23: il piano ai lati di quella colonna, senza l'uncino; 24-29: la grotta, sfondo, pavimento, la casella sotto il pavimento che torna gialla, il muro a sinistra (a destra si capovolge), e l'angolo: il muro alla quota del pavimento, la prima casella di pavimento accanto al muro e (30) il muro sotto, dove la sfumatura gira; 31: l'interno sotto il soffitto */
/* nella sala del boss il terreno è più marrone, per stare bene con la sala del trono: una copia del foglio moltiplicata per SALA_TINTA */
const SALA_TINTA='#d9a578';let PAES_SALA=null;
function paesSala(){if(PAES_SALA||!PAES.complete||!PAES.width)return PAES_SALA;const k=document.createElement('canvas');k.width=PAES.width;k.height=PAES.height;const c=k.getContext('2d');c.drawImage(PAES,0,0);c.globalCompositeOperation='multiply';c.fillStyle=SALA_TINTA;c.fillRect(0,0,k.width,k.height);c.globalCompositeOperation='destination-in';c.drawImage(PAES,0,0);return PAES_SALA=k;}
function paes(c,i,x,y,w,h,flip,capo){const s=c.imageSmoothingEnabled,im=G.modo==='2d'&&M&&M.boss&&paesSala()||PAES;c.imageSmoothingEnabled=false;if(flip||capo){c.save();c.translate(flip?x+w:x,capo?y+h:y);c.scale(flip?-1:1,capo?-1:1);c.drawImage(im,i*68,0,68,68,0,0,w,h);c.restore();}else c.drawImage(im,i*68,0,68,68,x,y,w,h);c.imageSmoothingEnabled=s;}
function sp(c,n,x,y,w,h,flip){if(n.startsWith('terrain_sand_')&&PAES.complete){const t=n.slice(13);if(t==='ramp_short_b'){paes(c,PAES_RAMPA,x,y,w,h,flip);return;}if(t in PIX){paes(c,PIX[t],x,y,w,h);return;}}
 const q=KMAP[n],im=q&&q[2]?KIT2:KIT;if(!q||!im.complete)return;if(flip){c.save();c.translate(x+w,y);c.scale(-1,1);c.drawImage(im,q[0],q[1],96,96,0,0,w,h);c.restore();}else c.drawImage(im,q[0],q[1],96,96,x,y,w,h);}
const ANAN=document.createElement('canvas');ANAN.width=ANAN.height=96;(function(){const c=ANAN.getContext('2d'),o='#2b2b3a';c.lineWidth=6;c.lineJoin='round';c.strokeStyle=o;c.fillStyle='#39b86b';
 [-2,-1,0,1,2].forEach(f=>{c.beginPath();c.moveTo(38,36);c.lineTo(48+f*13,6+Math.abs(f)*8);c.lineTo(58,36);c.closePath();c.stroke();c.fill();});
 c.fillStyle='#f6c445';c.beginPath();c.ellipse(48,62,26,31,0,0,6.3);c.stroke();c.fill();c.save();c.clip();c.strokeStyle='#c98a1e';c.lineWidth=3;c.beginPath();for(let k=-3;k<=3;k++){c.moveTo(48+k*16-34,28);c.lineTo(48+k*16+34,96);c.moveTo(48+k*16+34,28);c.lineTo(48+k*16-34,96);}c.stroke();c.restore();})();
const PIZZA=new Image();PIZZA.src='assets/pizza.webp';
const ICONE={};function icona(n){if(!ICONE[n]&&KIT.complete){const c=document.createElement('canvas');c.width=c.height=64;sp(c.getContext('2d'),n,0,0,64,64);ICONE[n]=c.toDataURL();}return ICONE[n]||'';}
/* ---------- PERSONAGGIO: riga 0 fermo, riga 1 camminata, riga 2 si chiude (0-2) e rotola (3-6) ---------- */
const VITE_INFINITE=false; /* per le prove: true per non perdere mai cuori */
const FOGLIO=new Image();FOGLIO.src='assets/personaggio.webp';
const FOGLIO2=new Image();FOGLIO2.src='assets/personaggio2.webp'; /* riga 0 girata, 1 camminata, 2 corsa, 3 salto (0-4) e mazza (5-7) */
const CELLA2=200;
const FOGLIO3=new Image();FOGLIO3.src='assets/personaggio3.webp'; /* Matteo stanco, celle come FOGLIO2: riga 0 fermo che suda (0,1,7), 1 cammina, 2 corre, 3 riposa (3 si asciuga, 4-5 in ginocchio) */
let stancoVis=false;
/* il Matteo nuovo disegnato dall'utente, con i suoi fogli (una riga di celle, rivolto a destra). Gli amici con colore, skin o foto tengono il disegno di prima */
const FOGLISPR={};
for(const [n,src] of [['stanco','assets/matteo_stanco.webp'],['fermo','assets/matteo_fermo.webp'],['salto','assets/matteo_salto.webp'],['palla','assets/matteo_palla.webp'],['passi','assets/matteo_cammina.webp'],['grasso','assets/matteo_grasso.webp'],['telefono','assets/matteo_telefono.webp'],['sedere','assets/matteo_sedere.webp']]){FOGLISPR[n]=new Image();FOGLISPR[n].src=src;}
/* i disegni sono di tre quarti, il piede dietro sta più in alto: si abbassa lo sprite di SPR_PIEDI raggi perché poggino tutti e due */
const SPR_GIRO=1.51; /* la palla ruota davvero: un giro ogni 3,8 caselle, la circonferenza del disegno (p.rot va a metà velocità e il raggio disegnato è 1,3 volte quello vero) */
const SPR_ATTESA=1.5; /* fermandosi resta com'è per questi secondi, poi gira fino a dritto e si apre; se riparte continua da lì */
const SPR_PIEDI=.13,SPR_K=3.8/122; /* Matteo in piedi è alto 3,8 raggi: più grande dell'urto, che resta quello di prima */
function fogSpr(c,im,cw,ch,oy,kr,x,yPiedi,r,f,verso,W,ang){
 if(!im||!im.complete)return;const k=r*kr;c.save();c.translate(x,yPiedi+r*SPR_PIEDI);if(ang)c.rotate(ang);c.scale(verso*(1-W*.6),1+W);c.drawImage(im,f*cw,0,cw,ch,-cw/2*k,-oy*k,cw*k,ch*k);c.restore();
}
/* stanco: nei 2 s di riposo si piega, ansima e si rialza; e va da 0 a 1. I fotogrammi 8 e 11 sono in piedi in mezzo a quelli piegati: non si usano */
const SPR_STANCO=[0,1,2,3,4,5,6,7,9,10,12,13,14,15];
function stancoSpr(c,x,yPiedi,r,e,verso,ang){fogSpr(c,FOGLISPR.stanco,130,126,126,SPR_K,x,yPiedi,r,SPR_STANCO[Math.min(SPR_STANCO.length-1,Math.floor(e*SPR_STANCO.length))],verso,0,ang);}
/* fermo: una posa sola che respira con W; i 4 fotogrammi del foglio non combaciano e cambiandoli si vedevano gli scatti */
function fermoSpr(c,x,yPiedi,r,verso,W,ang){fogSpr(c,FOGLISPR.fermo,130,126,126,SPR_K,x,yPiedi,r,0,verso,W,ang);}
/* salto, 10 fotogrammi, piedi a terra a y=165: 1-3 sale, 4 punto alto, 5-6 cade, 7-9 atterra */
function saltoSpr(c,x,yPiedi,r,f,verso,W,ang){fogSpr(c,FOGLISPR.salto,170,200,165,SPR_K,x,yPiedi,r,f,verso,W,ang);}
/* rotola, 14 fotogrammi: 1-4 si chiude, 10-12 si riapre; la palla è il 9, quello senza la testa, che ruota di continuo (gelSpr) */
function apreSpr(c,x,yPiedi,r,f,verso,W,ang){fogSpr(c,FOGLISPR.palla,80,80,80,3.35/75,x,yPiedi,r,f,verso,W,ang);}
/* raggio dell'urto: da super grasso è il cerchio della pancia disegnata. Cresce solo se c'è posto, tenendo fermi i piedi; altrimenti riprova al passo dopo */
const R_NORMALE=.46,R_GRASSO=.74;
function aggRaggio(p){const v=G.carica>=1&&matteoNuovo()?R_GRASSO:R_NORMALE;if(p.R===v)return;const d=v-p.R;if(d<0){p.R=v;p.y+=d;p.py+=d;return;}
 const q={x:p.x,y:p.y+d,px:p.x,py:p.y+d,vx:0,vy:0};urta(q,v);if(Math.hypot(q.x-p.x,q.y-p.y-d)>.12)return;p.R=v;p.x=q.x;p.y=q.y;p.px=q.x;p.py=q.y;}
/* il Matteo normale, senza colore, skin o foto: usa i fogli nuovi */
function matteoNuovo(){const a=amico();return !a._img&&a.colore===COLORI[0]&&a.skin==='classica';}
/* fermandosi la palla finisce di girare fino a dritto: kg è la velocità del giro, T la durata. Se manca quasi un giro intero torna un poco indietro */
function giroFine(p,kg,T,ri){const e=clamp((p.animT-ri)/T,0,1),q=1-(1-e)*(1-e),a0=-(p.rotF||0)*kg,d=p.dirF||1;let re=((-d*a0)%6.2832+6.2832)%6.2832;if(re>4.5)re-=6.2832;return a0+d*re*q;}
/* palla del Matteo super grasso: il fotogramma 6 di grasso, con pancia, braccia e gambe, che gira tutto intero attorno al cerchio della pancia, centro (83; 82,2), raggio 50,9. Grande come la palla normale a carica piena */
function gPallaGira(c,x,yPiedi,r,gi,W){const im=FOGLISPR.grasso,k=r*SPR_K;if(!im||!im.complete)return;c.save();c.translate(x,yPiedi);c.scale(1-W*.3,1+W*.4);c.translate(0,-50.9*k);c.rotate(gi);c.drawImage(im,6*170,0,170,140,-83*k,-82.2*k,170*k,140*k);c.restore();}
/* grasso, 9 fotogrammi: 0-3 mangia, 5 e 4 la pancia cresce, 6 gonfio al massimo (al posto della bomba), 7-8 si sgonfia */
function grassoSpr(c,x,yPiedi,r,f,verso,W,ang){fogSpr(c,FOGLISPR.grasso,170,140,140,SPR_K,x,yPiedi,r,f,verso,W,ang);}
/* passi, 21 fotogrammi: 0-5 corre, 6-9 cammina, 10-20 si gira per noia. Scelti dal foglio dell'utente e messi in ordine perché braccia e gambe si alternino */
function passiSpr(c,x,yPiedi,r,f,verso,W,ang){fogSpr(c,FOGLISPR.passi,130,126,126,SPR_K,x,yPiedi,r,f,verso,W,ang);}
/* attesa col telefono (paesaggio/matteo_telefono_originale.png, alla scala di matteo_fermo): 0 fermo, 1 lo tiene, 2 lo lancia, 3 lo riprende, 4 lo guarda.
   Dopo 5 s fermo lo prende e poi lo lancia e lo riprende di continuo, finché Matteo non si muove */
/* bolla del Matteo nuovo (paesaggio/matteo_sedere_originale.webp, alla scala di matteo_fermo, celle 140x150 appoggiate in basso): invece della bolla di sapone gli si gonfia il sedere.
   0 salta, 1-3 il sedere cresce, 4-6 è una palla e galleggia */
function sedereSpr(c,x,yPiedi,r,t,verso,W){const f=t<.06?0:t<.12?1:t<.18?2:t<.25?3:[4,5,6,5][Math.floor((t-.25)*12)%4];fogSpr(c,FOGLISPR.sedere,140,150,147,SPR_K,x,yPiedi,r,f,verso,W,0);}
function telefonoSpr(c,x,yPiedi,r,t,verso,W,ang){const u=(t-.3)%.9,f=t<.3?1:u<.28?2:u<.52?3:4; /* un giro ogni 0,9 s: a 1,15 andava a scatti */fogSpr(c,FOGLISPR.telefono,130,126,126,SPR_K,x,yPiedi,r,f,verso,W,ang);}
/* ---------- PROVA ANIMAZIONI (?prova=1): sagome segnaposto con nome dello stato, fotogramma e tempo d'uso ---------- */
const PROVA=/[?&]prova\b/.test(location.search),USO={},POSE={fermo:[4,3,'#7fb0d8'],noia:[8,5,'#7fb0d8'],cammina:[8,10,'#6fc27a'],corre:[8,16,'#3fa04c'],stacco:[2,12,'#e8c84a'],sale:[2,8,'#e8c84a'],punta:[1,1,'#f0a830'],cade:[2,8,'#e08a20'],atterra:[2,12,'#c96a18'],chiude:[3,15,'#b48ae0'],rotola:[8,0,'#8a5ad0'],apre:[3,15,'#b48ae0'],scatto:[4,14,'#e0503c'],bolla:[2,8,'#5ad0e0'],colpito:[2,8,'#ff6060'],schianto:[3,10,'#ff3030'],riposo:[4,3,'#999999'],'stanco fermo':[3,3,'#b0b0a0'],'stanco cammina':[8,8,'#a0b090'],'stanco corre':[8,12,'#90a080']};
function statoProva(p,n){
 if(p.stanco>0)return 'riposo';if(p.inv>.9)return 'colpito';if(p.inv>0&&p.vx*p.vx>30&&n)return 'schianto';if(p.bolla>0)return 'bolla';if(p.scatto>0)return 'scatto';
 if(p.rotola)return p.anim==='chiude'&&p.animT<.2?'chiude':'rotola';if(p.anim==='apre'&&p.animT<.2)return 'apre';if(p.atterra>0)return 'atterra';
 if(!n)return p.vy>6?'stacco':p.vy>2.5?'sale':p.vy<-2.5?'cade':'punta';
 const st=G.carica<1&&G.fiato<FIATO_SCATTO,v=Math.abs(p.vx);if(v<.25)return st?'stanco fermo':p.fermoT>5?'noia':'fermo';return (st?'stanco ':'')+(v>2.3?'corre':'cammina');
}
function disegnaProva(c,x,pie,r,p,n,ang){
 const s=statoProva(p,n),[nf,fps,col]=POSE[s],u=USO[s]||(USO[s]={t:0,volte:0}),dt=G.t-(disegnaProva.t||0);if(dt>0&&dt<.2)u.t+=dt;if(disegnaProva.s!==s)u.volte++;disegnaProva.s=s;disegnaProva.t=G.t;
 const giro=(p.rot%6.2832+6.2832)%6.2832,f=s==='rotola'?Math.floor(giro/6.2832*nf)%nf:/cammina|corre/.test(s)?Math.floor(p.passi)%nf:Math.floor(G.t*fps)%nf,a=f/nf*6.2832,b=G.carica>=1;
 const q=(o)=>Object.assign({inc:0,gamba:0,gs:0,bra:.3,bw:1,bh:.9,y:0,tesa:0},o),F=Math.sin(a);
 const P=s==='cammina'?q({gamba:F*.45,bra:.2+F*.4}):s==='corre'?q({gamba:F*.9,inc:.25,bra:1+F*.6}):s==='noia'?q({tesa:F*.3,bh:.9+F*.03}):s==='fermo'?q({bh:.9+F*.03}):s==='stacco'?q({bh:.72,bw:1.15,gs:-.3}):s==='sale'?q({bh:1,bw:.9,bra:2.6,gs:-.2}):s==='punta'?q({bw:1.1,bra:1.8,gs:-.35}):s==='cade'?q({bra:2.8+F*.2,gamba:.2}):s==='atterra'?q({bh:.6,bw:1.3,gs:-.4,bra:1.2}):s==='scatto'?q({inc:.75,bw:1.2,bra:-.6,gamba:.5+F*.2}):s==='bolla'?q({bw:1.35,bh:1.25,bra:1.6,gs:-.45,y:r*.12}):s==='colpito'?q({inc:-.5,bra:2.4,gamba:-.5}):s==='schianto'?q({inc:-.9,bw:.7,bh:1.15,bra:2}):s==='riposo'?q({gs:-.6,tesa:.5,inc:.15,bra:.1,bh:.82+F*.04}):s==='stanco fermo'?q({tesa:.45,inc:.15,bh:.86+F*.03,bra:.05}):s==='stanco cammina'?q({gamba:F*.3,tesa:.4,inc:.2,bra:.05}):s==='stanco corre'?q({gamba:F*.6,tesa:.35,inc:.35,bra:.4}):q({});
 c.save();c.translate(x,pie);if(ang)c.rotate(ang);c.scale(p.verso*(1-p.W*.6),1+p.W);c.lineCap='round';c.lineJoin='round';const tinta=b?'#e0442c':col;c.fillStyle=tinta;c.strokeStyle='#22222a';c.lineWidth=Math.max(2,r*.09);
 const palla=s==='rotola'||s==='chiude'||s==='apre',ch=s==='rotola'?1:s==='chiude'?(f+1)/nf:1-(f+1)/nf;
 if(palla&&ch>.6){c.translate(0,-r);c.rotate(s==='rotola'?p.rot:ch);c.beginPath();c.arc(0,0,r,0,6.3);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(r*.5,-r*.25,r*.2,0,6.3);c.fill();c.stroke();c.beginPath();c.moveTo(-r,0);c.lineTo(r*.2,0);c.stroke();}
 else{const lin=(x0,y0,x1,y1)=>{c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();},ly=r*(.55+P.gs),h=r*(1.05+P.gs*.5);
  c.lineWidth=r*.32;c.strokeStyle='#22222a';lin(-r*.3,-ly-P.y,-r*.3-P.gamba*r*.6,-P.y);lin(r*.3,-ly-P.y,r*.3+P.gamba*r*.6,-P.y);
  c.translate(0,-h-P.y);c.rotate(P.inc);lin(-r*.75*P.bw,-r*.1,-r*.75*P.bw-Math.cos(P.bra)*r*.1-r*.3,r*.45-Math.sin(P.bra)*r*.95);lin(r*.75*P.bw,-r*.1,r*.75*P.bw+Math.cos(P.bra)*r*.1+r*.3,r*.45-Math.sin(P.bra)*r*.95);
  c.lineWidth=Math.max(2,r*.09);c.beginPath();c.ellipse(0,0,r*P.bw*.9,r*P.bh,0,0,6.3);c.fill();c.stroke();c.fillStyle='#f2d0a8';c.beginPath();c.arc(r*(.1+P.tesa*.5),-r*P.bh-r*(.3-P.tesa*.4),r*.48,0,6.3);c.fill();c.stroke();c.fillStyle='#22222a';c.beginPath();c.arc(r*(.33+P.tesa*.5),-r*P.bh-r*(.35-P.tesa*.4),r*.08,0,6.3);c.fill();}
 c.restore();
 const et=`${b?'bomba ':''}${s} ${f+1}/${nf}`;c.save();c.font=`bold ${Math.max(12,r*.55)}px sans-serif`;c.textAlign='center';c.lineJoin='round';c.lineWidth=4;c.strokeStyle='#000';c.fillStyle='#fff';c.strokeText(et,x,pie-r*3.2);c.fillText(et,x,pie-r*3.2);c.restore();
}
function elencoProva(c,W){
 const r=Object.entries(USO).sort((a,b)=>b[1].t-a[1].t);c.save();c.font='bold 11px sans-serif';c.textAlign='right';c.lineWidth=3;c.lineJoin='round';c.strokeStyle='#000';c.fillStyle='#fff';r.forEach(([s,u],i)=>{const t=`${s}: ${u.t.toFixed(1)}s, ${u.volte} volte`;c.strokeText(t,W-8,84+i*13);c.fillText(t,W-8,84+i*13);});c.restore();
}
const CELLA=270,PALLA_L=185,PALLA_H=[174,178,164,162],TINTE={};
function foglioAmico(im){
 im=im||FOGLIO;const col=amico().colore,k=col+(im===FOGLIO?'a':im===FOGLIO2?'b':'c');if(col===COLORI[0]||!im.complete)return im;
 if(!TINTE[k]){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='color';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation='destination-in';x.drawImage(im,0,0);TINTE[k]=c;}
 return TINTE[k];
}
const FUMO=new Image();FUMO.src='assets/fumo.webp'; /* 6 fotogrammi da 300x225 */
function disegnaFumo(c,xRetro,yTerra,alt,verso,e){if(!FUMO.complete||e<0||e>=1)return;const f=Math.min(5,Math.floor(e*6)),w=alt*4/3;c.save();c.translate(xRetro,yTerra);c.scale(-verso,1);c.globalAlpha=(e>.75?(1-e)*4:1)*.5;c.drawImage(FUMO,f*300,0,300,225,0,-alt*.9,w,alt);c.restore();}
const POLV=new Image();POLV.src='assets/polvere.webp'; /* 10 fotogrammi da 184 */
function disegnaPolvere(c,x,yTerra,z,e){if(!POLV.complete||e<0||e>=1)return;const f=Math.min(9,Math.floor(e*10));c.save();c.globalAlpha=.45;c.drawImage(POLV,f*184,0,184,184,x-z/2,yTerra-z*.82,z,z);c.restore();}
const BOMBA=new Image();BOMBA.src='assets/bomba.webp'; /* Matteo carico al massimo: 37 fotogrammi da 160 in righe da 10, corpo di raggio 40 centrato in (80,98) */
const ESPL=new Image();ESPL.src='assets/esplosione.webp'; /* 8 fotogrammi da 200 */
function disegnaEspl(c,x,y,raggio,e){if(!ESPL.complete||e<0||e>=1)return;const f=Math.min(7,Math.floor(e*8)),z=raggio*2*100/68;c.drawImage(ESPL,f*200,0,200,200,x-z/2,y-z/2,z,z);}
/* fotogrammi: 0-8 si gira, 18 lampo scuro, 19-28 cammina, 34 colpito, 35 in fiamme, 36 fermo */
function disegnaBomba(c,x,yPiedi,r,f,verso,W,ang,rot){
 if(!BOMBA.complete)return;const R=r*1.1,k=R/40;c.save();c.translate(x,yPiedi);if(ang)c.rotate(ang);c.scale(verso*(1-W*.6),1+W);c.translate(0,-R);if(rot)c.rotate(rot);
 c.drawImage(BOMBA,f%10*160,Math.floor(f/10)*160,160,160,-80*k,-98*k,160*k,160*k);c.restore();
}
function disegnaCamm(c,x,yPiedi,r,col,riga,verso,W,ang){
 const st=FOGLIO3.complete&&(stancoVis===2&&riga===3||stancoVis&&riga<=2),im=st?FOGLIO3:FOGLIO2;if(!im.complete)return;if(st&&riga<3)col=riga===0?[0,1,0,7][col%4]:col%8;const lato=CELLA2*r*2.55/197;c.save();c.translate(x,yPiedi);if(ang)c.rotate(ang);c.scale(verso*(1-W*.6),1+W);
 c.drawImage(foglioAmico(im),col*CELLA2,riga*CELLA2,CELLA2,CELLA2,-lato/2,-lato*.975,lato,lato);c.restore();
}
function disegnaPasso(c,x,yPiedi,r,col,riga,verso,W,ang){
 if(!FOGLIO.complete)return;const lato=CELLA*r*2/PALLA_L;c.save();c.translate(x,yPiedi);if(ang)c.rotate(ang);c.scale(verso*(1-W*.6),1+W);
 c.drawImage(foglioAmico(),col*CELLA,riga*CELLA,CELLA,CELLA,-lato/2,-lato*.97,lato,lato);c.restore();
}
/* palla di gelatina con gli sprite: come disegnaSlime si allunga con la velocità, si schiaccia con W e ondeggia; lo sprite si disegna a strisce orizzontali, ognuna larga e spostata per conto suo */
function gelSpr(c,x,yPiedi,r,col,verso,W,vx,vy,t,n,gi){
 const FM=FOGLISPR.palla;if(!FM||!FM.complete)return;const k=r*2.6/60*(1+.22*G.carica),sp=Math.hypot(vx,vy),al=Math.min(.13,sp*.011),fi=Math.atan2(-vy,vx),am=.02+Math.min(.04,sp*.0035)+Math.min(.05,Math.abs(W)*.28),sw=1-W*.7,sh=1+W*.7,s=sh*Math.hypot((1+al)*Math.sin(fi),(1-al)*Math.cos(fi)),h=30*k,nx=n?n.x:0,ny=n?n.y:1;
 c.save();c.translate(x-nx*r+nx*h*s,yPiedi-r+ny*r-ny*h*s);c.rotate(fi);c.scale(1+al,1-al);c.rotate(-fi);c.scale(sw*verso,sh);c.rotate(gi);
 for(let i=10;i<80;i++){const a=Math.asin(clamp((i+.5-47.8)/30,-1,1)),w=1+am*Math.sin(3*a+t*5)+am*.5*Math.sin(5*a-t*7),o=am*r*.45*Math.sin(2*a+t*6);c.drawImage(FM,col*80,i,80,1,-40.4*k*w+o,(i-47.8)*k,80*k*w,k+.6);}
 c.restore();
}
/* bolla di sapone iridescente: e è la trasparenza, ts la misura di una casella per lo spessore del bordo */
function bollaSapone(c,bx,by,rb,e,ts){c.save();c.globalAlpha=e;const g=c.createRadialGradient(bx-rb*.3,by-rb*.35,rb*.1,bx,by,rb);g.addColorStop(0,'rgba(255,255,255,.28)');g.addColorStop(.7,'rgba(170,225,255,.10)');g.addColorStop(1,'rgba(200,170,255,.25)');c.fillStyle=g;c.beginPath();c.arc(bx,by,rb,0,6.3);c.fill();
 c.lineWidth=Math.max(2,ts*.07);c.strokeStyle=`hsla(${G.t*240%360},85%,72%,.75)`;c.stroke();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=Math.max(2,ts*.06);c.beginPath();c.arc(bx,by,rb*.78,3.6,4.4);c.stroke();c.restore();}
function disegnaPalla(c,x,y,r,rot,W,aTerra,foto){
 if(!FOGLIO.complete)return;const lato=CELLA*r*2/PALLA_L,sq=aTerra?.04:0,giro=((rot%6.2832)+6.2832)%6.2832,q=foto?3:Math.floor(giro/1.5708)%4,cy=(CELLA*.97-PALLA_H[q]/2)/CELLA*lato;
 c.save();c.translate(x,y+sq*r);c.scale(1+sq-W*.6,1-sq+W);c.rotate(rot);
 c.drawImage(foglioAmico(),(3+q)*CELLA,2*CELLA,CELLA,CELLA,-lato/2,-cy,lato,lato);
 if(foto){const m=Math.min(foto.width,foto.height),g=r*.74;c.save();c.beginPath();c.arc(0,0,g,0,6.3);c.clip();c.drawImage(foto,(foto.width-m)/2,(foto.height-m)/2,m,m,-g,-g,g*2,g*2);c.restore();c.lineWidth=Math.max(2,r*.08);c.strokeStyle='#14100c';c.beginPath();c.arc(0,0,g,0,6.3);c.stroke();}
 c.restore();
}
/* ---------- SKIN ---------- */
const SKIN=[
 {id:'classica',nome:'Classica',costo:0} /* le altre palle (anguria, pallone, biglia, basket, pianeta, oro) l'utente le ha tolte: i loro disegni restano in dipingiSkin */
];
function dipingiSkin(c,w,h,id,colore){
 c.save();
 const fascia=(col,y,a)=>{c.fillStyle=col;c.fillRect(0,y,w,a);};
 if(id==='classica'){c.fillStyle=colore;c.fillRect(0,0,w,h);c.fillStyle='#ffffff2e';[[.62,.8,.07],[.3,.82,.05]].forEach(b=>{c.beginPath();c.arc(b[0]*w,b[1]*h,b[2]*h*1.6,0,6.3);c.fill();});c.fillStyle='#ffd3b0';c.beginPath();c.moveTo(0,0);c.lineTo(0,h*.2);for(let i=0;i<=24;i++)c.lineTo(i/24*w,h*(.2+(i%2?.09:0)));c.lineTo(w,0);c.fill();}
 else if(id==='anguria'){c.fillStyle='#4f9e3a';c.fillRect(0,0,w,h);c.fillStyle='#1f5c2a';for(let i=0;i<12;i++){const x=i/12*w;c.beginPath();c.moveTo(x,0);for(let y=0;y<=h;y+=8)c.lineTo(x+Math.sin(y*.04+i)*w*.012+(y/h>.5?1:0),y);for(let y=h;y>=0;y-=8)c.lineTo(x+w*.03+Math.sin(y*.04+i)*w*.012,y);c.fill();}}
 else if(id==='pallone'){c.fillStyle='#fbf7ee';c.fillRect(0,0,w,h);c.fillStyle='#1c1c22';for(let r=0;r<4;r++)for(let i=0;i<6;i++){const x=(i+(r%2)*.5)/6*w,y=(r+.5)/4*h;c.beginPath();for(let k=0;k<5;k++){const a=k/5*6.283-1.57;c[k?'lineTo':'moveTo'](x+Math.cos(a)*w*.045,y+Math.sin(a)*h*.08);}c.fill();}}
 else if(id==='biglia'){c.fillStyle='#2a6fd6';c.fillRect(0,0,w,h);c.lineWidth=h*.03;for(let i=0;i<9;i++){c.strokeStyle=['#ffffffaa','#7fe0ff99','#113a8a99'][i%3];c.beginPath();for(let x=0;x<=w;x+=10){const y=h*(.1+i*.1)+Math.sin(x/w*12.57+i)*h*.09;c[x?'lineTo':'moveTo'](x,y);}c.stroke();}}
 else if(id==='basket'){c.fillStyle='#e8762b';c.fillRect(0,0,w,h);c.strokeStyle='#2a1a10';c.lineWidth=h*.018;for(let i=0;i<4;i++){const x=i/4*w;c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}c.beginPath();c.moveTo(0,h/2);c.lineTo(w,h/2);c.stroke();}
 else if(id==='pianeta'){c.fillStyle='#2f64c9';c.fillRect(0,0,w,h);c.fillStyle='#57b05a';let sd=7;const r=()=>(sd=sd*16807%2147483647)/2147483647;for(let i=0;i<26;i++){c.beginPath();c.ellipse(r()*w,r()*h,w*(.02+r()*.05),h*(.03+r()*.07),r()*3,0,6.3);c.fill();}c.fillStyle='#ffffffcc';c.fillRect(0,0,w,h*.07);c.fillRect(0,h*.93,w,h*.07);}
 else if(id==='oro'){const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#fff0a8');g.addColorStop(.5,'#e8b52c');g.addColorStop(1,'#a9740f');c.fillStyle=g;c.fillRect(0,0,w,h);}
 c.restore();
}
function dipingiPalla(cv,amico,skinId){
 const w=cv.width,h=cv.height,c=cv.getContext('2d');c.clearRect(0,0,w,h);
 dipingiSkin(c,w,h,skinId,amico.colore);
 const cx=w/2,cy=h/2;
 const dalDisegno=!amico._img&&amico.colore===COLORI[0]&&skinId==='classica'&&FOGLIO.complete&&FOGLIO.naturalWidth;
 if(dalDisegno){c.fillStyle='#3b2a20';c.fillRect(0,0,w,h*.5);c.fillStyle='#2a2421';c.fillRect(0,h*.5,w,h*.5);const q=h*1.05;c.drawImage(FOGLIO,4*CELLA,2*CELLA,CELLA,CELLA,cx-q/2,cy-q*.62,q,q);}
 else if(amico._img){
  const r=h*.3;c.save();c.beginPath();c.ellipse(cx,cy,r,r*1.05,0,0,6.3);c.closePath();c.clip();
  const im=amico._img,q=Math.min(im.width,im.height);c.drawImage(im,(im.width-q)/2,(im.height-q)/2,q,q,cx-r,cy-r*1.05,r*2,r*2.1);c.restore();
  c.lineWidth=h*.012;c.strokeStyle='#fff4df';c.beginPath();c.ellipse(cx,cy,r,r*1.05,0,0,6.3);c.stroke();
 }else{
  [-.1,.12].forEach(k=>{c.fillStyle='#fff';c.beginPath();c.ellipse(cx+k*h,cy-h*.05,h*.05,h*.065,0,0,6.3);c.fill();c.strokeStyle='#2a1a10';c.lineWidth=h*.008;c.stroke();c.fillStyle='#14100c';c.beginPath();c.arc(cx+k*h,cy-h*.045,h*.024,0,6.3);c.fill();});
 }
 c.font=`${Math.round(h*.13)}px "Bowlby One","Arial Black",sans-serif`;c.textAlign='center';c.textBaseline='middle';
 [0,w].forEach(x=>{c.lineWidth=h*.022;c.strokeStyle='#2a1a10';c.strokeText(amico.nome,x,cy);c.fillStyle='#fff4df';c.fillText(amico.nome,x,cy);});
}
function caricaFoto(a,dopo){if(!a.foto||a._img){dopo&&dopo();return;}const i=new Image();i.onload=()=>{a._img=i;dopo&&dopo();};i.src=a.foto;}

/* ---------- PALLA DIPINTA (skin e foto) ---------- */
const cvPalla=document.createElement('canvas');cvPalla.width=1024;cvPalla.height=512;
function amico(){return S.amici[S.sel]||S.amici[0];}
function vestiPalla(){const a=amico();caricaFoto(a,()=>{dipingiPalla(cvPalla,a,a.skin);});}

/* ---------- AUDIO ---------- */
let AC=null;
const BUF={};
function audioOn(){if(AC||!S.audio)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();
 Object.keys(SUONI).forEach(n=>{fetch(SUONI[n]).then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b,d=>{BUF[n]=d;},()=>{})).catch(()=>{});});}catch(e){}}
function sfx(n){if(!AC||!S.audio||!BUF[n])return false;try{const o=AC.createBufferSource(),g=AC.createGain();o.buffer=BUF[n];g.gain.value=.5;o.connect(g);g.connect(AC.destination);o.start();return true;}catch(e){return false;}}
function suono(f,d,tipo,vol,f2){if(!AC||!S.audio)return;try{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=tipo||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(vol||.12,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d);}catch(e){}}
function vibra(ms){try{navigator.vibrate&&navigator.vibrate(ms);}catch(e){}}

/* ---------- STATO ---------- */
const G={carica:0,stato:'menu',modo:'menu',t:0,mondo:0,cuori:3,gettoni:0,uccisi:0,tempo:0,avanz:0,scossa:0};

/* ---------- COMANDI ---------- */
/* solo pulsanti: le frecce sotto il pollice sinistro, scatto e salto sotto il destro */
const IN={tx:0,dir:0};
const tasti={};const puntatori=new Map();
/* la bolla: Matteo vibra e galleggia leggero per un attimo; una volta per salto e costa un po' di fiato */
function bolla(){
 const p=P2;if(G.stato!=='gioco'||p.stanco>0||p.bollaUsata||p.bolla>0)return;if(!usaFiato(FIATO_BOLLA))return;
 p.bolla=.85;p.bollaUsata=true;if(!p.rotola)p.rot=0;p.rotola=true;p.ultimoSuolo=null;p.coyote=0;p.vy=Math.max(p.vy,2.3);p.y+=.04;vibra([15,25,15,25,15]);suono(700,.35,'sine',.07,1100);suono(950,.25,'triangle',.04,1500);
 if(!G.dettaBolla){G.dettaBolla=true;consiglio('bolla2','Bolla! Premendo salto mentre sei in aria Matteo galleggia per un attimo');}
}
/* salto: a terra salta, in aria fluttua. Se non può fluttuare (bolla già usata o poco fiato) il tocco resta in memoria e salta appena tocca terra: senza fiato non si deve fermare a mezz'aria */
function azione(lato){if(G.stato==='ora'){if(lato<0){G.stato='gioco';$('avviso').hidden=true;$('tScatto').classList.remove('ora');scatta2();}return;}if(G.stato!=='gioco')return;const p=P2;if(inAcqua()){if(lato<0)scattoGiu();else bracciata();return;}if(lato<0){scatta2();return;}if(p.stanco>0)return;
 if(p.coyote>0||p.bollaUsata||p.bolla>0||(G.carica<1&&G.fiato<FIATO_BOLLA))p.buf=.13;else bolla();}
/* vale tutto lo schermo: ogni dito prende il pulsante più vicino della sua metà, così non si sbaglia guardando il gioco */
const tocchi=$('tocchi'),FRECCE=['tSin','tDes'],AZIONI=['tScatto','tSalto'];
function zonaTocco(x,y){let z=null,d=1e9;for(const id of x<SC.W/2?FRECCE:AZIONI){const t=$(id),q=Math.hypot(x-t.offsetLeft-t.offsetWidth/2,y-t.offsetTop-t.offsetHeight/2);if(q<d){d=q;z=id;}}return z;}
function aggTasti(){let d=0;const su=new Set();for(const p of puntatori.values()){su.add(p.z);if(p.z==='tSin')d=-1;else if(p.z==='tDes')d=1;}IN.dir=d;IN.salto=su.has('tSalto');FRECCE.concat(AZIONI).forEach(i=>$(i).classList.toggle('premuto',su.has(i)));} /* due frecce insieme: vince l'ultima premuta */
tocchi.addEventListener('pointerdown',e=>{e.preventDefault();try{tocchi.setPointerCapture(e.pointerId);}catch(x){}
 const z=zonaTocco(puntoX(e),puntoY(e));puntatori.set(e.pointerId,{z});aggTasti();if(z==='tScatto')azione(-1);else if(z==='tSalto')azione(1);
});
/* strisciando da una freccia all'altra si cambia verso senza staccare il dito */
tocchi.addEventListener('pointermove',e=>{const p=puntatori.get(e.pointerId);if(!p||!FRECCE.includes(p.z))return;const z=zonaTocco(puntoX(e),puntoY(e));if(z!==p.z&&FRECCE.includes(z)){p.z=z;aggTasti();}});
function suFine(e){if(puntatori.delete(e.pointerId))aggTasti();}
tocchi.addEventListener('pointerup',suFine);tocchi.addEventListener('pointercancel',suFine);tocchi.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;
 if(G.modo==='mappa'&&!G.guida){const k=e.code;if(k==='ArrowRight'||k==='ArrowDown'||k==='KeyD')vaiA(MP.meta+1);else if(k==='ArrowLeft'||k==='ArrowUp'||k==='KeyA')vaiA(MP.meta-1);else if((k==='Enter'||k==='Space')&&!e.repeat){e.preventDefault();giocaQui(false);}else if(k==='KeyB'&&!e.repeat)giocaQui(true);else if(k==='Escape')vaiMenu();return;}
 if(G.stato==='consiglio'){if(e.code==='ArrowRight'||e.code==='Enter'||e.code==='Space'){e.preventDefault();if(!e.repeat)chiudiConsiglio();}return;}
 tasti[e.code]=true;
 if(e.code==='Space'){e.preventDefault();if(!e.repeat)azione(1);}
 if((e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyX')&&!e.repeat)azione(-1);
 if(e.code==='Escape'&&G.stato==='gioco')pausa();
});
addEventListener('keyup',e=>{tasti[e.code]=false;});
/* se la finestra perde il fuoco il rilascio non arriva: senza questo il pulsante resterebbe premuto */
function mollaComandi(){for(const k in tasti)tasti[k]=false;puntatori.clear();aggTasti();}
addEventListener('blur',mollaComandi);
function leggiInput(dt){const kx=(tasti.ArrowRight||tasti.KeyD?1:0)-(tasti.ArrowLeft||tasti.KeyA?1:0);IN.tx=lerp(IN.tx,kx||IN.dir,1-Math.exp(-dt*18));}

/* ---------- CUORI ---------- */
const MAXC=3; /* cuori alla partenza: quelli raccolti si sommano, senza tetto */
function togliCuore(){if(VITE_INFINITE)return;G.cuori--;hud();if(G.cuori<=0)fine(false);}

/* ---------- CORSA 2D ---------- */
const PEZZI={
 approdo:["                                                          ","                                                          ","                           cccc                           ","                           ----                           ","                       ccc             ccc                ","                                                          ","                   e       e  ^^     e                    ","              ###############################       cc    ","              ##                      c                   ","    ccc      ###      ccccccc  H    ccccc        ^^  r !! ","##########   #############################################"],
 magazzino:["                                                              ","                                                              ","                                          D                   ","     #########                            D                   ","     #                                    D                   ","     # cccc                               D                   ","     #  cccc            ccccccc           D                   ","     #########------------------          D                   ","         f            f                   D                   ","                                          D                   ","         COC                       B      D                   ","     #############xxxxxxxxxx####  ###     D                   ","                                          D                   ","                                          D                   ","   B    e       e   ^^  e   r   PP        D  ccccc  e   e !!  ","##############################################################"],
 crollo:["                                                            ","                                                            ","                                                            ","                                                            ","                                             ccecc          ","                                         --#########        ","   Hcc                                     X       #        ","  ----        f           f            --- X       #        ","                                           X ccccc #        ","                                    ---    X       #        ","         c c c c c   c c c c c c           X H c c #  !!! e ","########xxxxxxxxxxx  xxxxxxxxxxxx###########################"],
 scalata:["                                            ","                                            ","                                            ","####                        ccccc cccc      ","####                       -------####      ","####                              ####      ","####                  ----        ####      ","# c               cc              ####      ","#Hc              xxxx             ####      ","####-----                         ####      ","####        ----                  ####      ","####     f       cc               ####      ","####            xxxx              ####      ","                                  ####      ","           ----                   ####      ","       cc                         ####      ","      ----                        ####      ","              e         r   ^^^   ####  ^^ e","############################################"],
 artiglieria:["                                                      ","                                                      ","                                                      ","                                                      ","                                                      ","                     ccc                 ccccc        ","                   ------               -------       ","                                                      ","                     cc                         ##  ##","                      g                cccBcc   ##H ##","                C   ####          cc  --------        ","       g cc   ----- ####        g                     ","      ###   C       ####       ###  C      #          ","   e  ###  CC  e    #### er ^^ ### CCC   B #  e   e   ","######################################################"],
 valanga:["                                                                      ","                                                                      ","                                                                      ","                                                                      ","                                                                      ","             c                                                        ","          ######%                                                     ","          #######%                                                    ","          ########% c                                     #####       ","        B #########% e C                                  X   #       ","    ####################%                              -- X   #       ","    #####################% eC     c    c      c           Xccc#       ","    #########################%                      --    X   #       ","  B ##########################%  e C e  e C e  e C e      XH c#   e   ","######################################################################"],
 abisso:["##                                                                      ","##                                                                      ","##                        ########                                      ","##                        ########                                      ","##                        ########                                      ","##                        ########                                      ","##                        ########                                      ","##                        ########                                      ","##                        ########                                      ","##                        ########                               cH     ","##  S                     ########                            cc        ","#############        #############                                   F  ","#############   ~    #############                        ##############","#############        #############                        ##############","#############c       #############                        ##############","##                        ########                        ##############","##                        ########            c   c   c   ##############","##           c            ########                        ##############","##                        ########                        ##############","##                        ########                        ##############","##           c            ########  uuu   *               ##############","##                        ########  uuu           f       ##############","##                        ########  ucu                   ##############","##                        ########  uuu                   ##############","#########          ###############  uuu                   ##############","#########          ###############  uuu         *         ##############","##                        ########  ucu              m    ##############","##                        ########  uuu                   ##############","##                        ########  uuu                   ##############","##           f            ########  uuu                   ##############","##                        ########  ucu        f          ##############","##   c                c   ########  uuu                   ##############","##                        ########  uuu               *   ##############","##           *            ########  uuu                   ##############","##   c    ########    c   ########  uuu     *             ##############","##        ########        ########                        ##############","##                        ########         c              ##############","##                        ########                        ##############","##                        ########                        ##############","##                        ########             #########################","##                  c     ########         c   #########################","##                        ########                        ##############","##                        ########      m                 ##############","##                  c     ########    *                   ##############","################          ########                        ##############","################          ########  H                     ##############","##                        ########    *  *          c     ##############","##                        ########                        ##############","##                        ########             *          ##############","##                  f     #####################           ##############","##   c                    #####################     c     ##############","##        *   *           ########                        ##############","##       #########################                        ##############","##       #########################                  f     ##############","##   c                    ########                  c     ##############","##                        ########                        ##############","##                        ########      f                 ##############","##                        ########                        ##############","##                        ########    *             c     ##############","##          cc            ########                        ##############","##                        ########                        ##############","##                        ########                        ##############","##                        ################        ######################","##########        ########################        ######################","##########        ########################        ######################","##########        ########################  m     ######################","##########        ########################       *######################","##########CCCCCCCC########################        ######################","##########    c   ########################    c   ######################","##########        ########################        ######################","##########*       ########################*       ######################","##########        ########################    m   ######################","##########        ########################   c    ######################","##########        ########################        ######################","##########       *########################   uu  *######################","##########        ########################   uu   ######################","##########   m    ########################   uu   ######################","##########        ########################   uu   ######################","##########*       ########################*  uu   ######################","##########        ########################   uu   ######################","##########   c    ########################   uu   ######################","##########        ########################   uu   ######################","##########       *########################   uu   ######################","##########        ################                        ##############","##########        ################                        ##############","##########        ################                        ##############","##########        ################                        ##############","##                        ########                    c   ##############","##                        ########                        ##############","##                        #########################       ##############","##           *            #########################   c   ##############","##     f                  ########                        ##############","##                        ########                        ##############","##            c           XX    ##          c         f   ##############","##                 f      XX  H ##                        ##############","##                        XX c c##                        ##############","##    *                   XX    ##      c      *          ##############","##                        ########             #########################","##         f              ########             #########################","##                        ########                        ##############","##      c            *    ########      c                 ##############","##                        ########                        ##############","##                        ########       f                ##############","##                c       ########  *                     ##############","##                        ########                  uuu   ##############","##                        ########                  uuu   ##############","##           cc           ########            *     uuu   ##############","##                        #####################     uuu   ##############","##                        #####################     ucu   ##############","###########CCCCCC#################                  uuu   ##############","###########      #################                  uuu   ##############","##                        ########                  uuu   ##############","##                        ########       f          ucu   ##############","##                        ########                  uuu   ##############","##                        ########                  uuu   ##############","##                            *                     uuu   ##############","##                                      c           uuu   ##############","##            f         c                           uuu   ##############","##                                           c      uuu   ##############","##      c           c                               uuu   ##############","##                                                  uuu   ##############","##                                                  uuu   ##############","########################################################################"],
};
/* pareti finte: rettangoli [x0,y0,x1,y1] in caselle del pezzo; sembrano terra ma si attraversano */
const FINTI={"approdo":[[16,3,44,4]],"magazzino":[[6,11,13,13]],"scalata":[[1,12,3,13]],"artiglieria":[[40,3,43,4],[50,7,51,8]]};
const CORSE=[
 ['approdo','magazzino','crollo','scalata','artiglieria','valanga'],
 ['abisso'],
];
const ALTO=20;
let M=null;
const ctx2=$('d2').getContext('2d');
const V={W:0,H:0,dpr:1,ts:35,cx:0,cy:8,ts0:35,dir:1,la:0,attesa:0,py:3,sp:null,sf:[]};
function misure2d(){V.W=SC.W;V.H=SC.H;V.dpr=Math.min(devicePixelRatio||1,2);const c=$('d2');c.width=V.W*V.dpr;c.height=V.H*V.dpr;V.ts0=Math.max(28,Math.min(V.W,V.H)/9.5);V.ts=V.ts0;}
function suRidimensiona(){orienta();misure2d();}
addEventListener('resize',suRidimensiona);addEventListener('orientationchange',()=>setTimeout(suRidimensiona,200));
document.addEventListener('focusout',()=>setTimeout(suRidimensiona,250));
function costruisci(i,lista){
 const acqua=MONDI[i].acqua,nr=acqua?PEZZI[CORSE[i][0]].length+2:ALTO,g=[];for(let y=0;y<nr;y++)g.push([]);
 const m={i,g,w:0,oggetti:[],nemici:[],colpi:[],spine:{},fine:0,gusci:[],pesi:[],pulsanti:[],porte:[],crolli:{},pezzi:0,nomi:[],finti:[],fintoSet:new Set()};
 const riga=(y,x,t)=>{g[y][x]=t;};
 const pezzo=(rows)=>{
  const n=rows.length,w=rows[0].length,base=m.w;
  for(let r=0;r<n;r++){const y=2+(n-1-r);for(let q=0;q<w;q++){const t=rows[r][q]||' ',x=base+q;
   if(t==='S')m.start={x,y};else if(t==='F')m.fine=x;else if(t==='~')m.livello=y+.3;else if(t==='m')m.nemici.push({tipo:'m',x,y,y0:y,vivo:true,fase:x});
   else if(t==='c'||t==='H')m.oggetti.push({tipo:t,x,y,fase:x});
   else if(t==='e')m.nemici.push({tipo:'e',x,y:y-.1,px:x,py:y,vx:1.5,vy:0,vivo:true,fase:x});
   else if(t==='r')m.nemici.push({tipo:'r',x,y,px:x,py:y,vx:0,vy:0,vivo:true,fase:x});
   else if(t==='f')m.nemici.push({tipo:'f',x,y,x0:x,y0:y,vivo:true,fase:x});
   else if(t==='g'){m.nemici.push({tipo:'g',x,y,vivo:true,t:1+q%3,fase:x});}
   else if(t==='^'||t==='!'){riga(y,x,t);m.spine[y+'_'+x]={t,s:1,fase:x*.8};}
   else if(t==='O')m.pesi.push({x,y:y+.1,x0:x,y0:y+.1,px:x,py:y,vx:0,vy:0,suolo:null});
   else if(t==='P'){riga(y,x,'P');m.pulsanti.push({x,y,g:m.pezzi,giu:false});}
   else if(t==='D'){riga(y,x,'D');m.porte.push({x,y,g:m.pezzi});}
   else if(t==='x'||t==='y'){riga(y,x,t);m.crolli[y+'_'+x]={x,y,t:-1,via:0,c:t};}
   else if(t!==' ')riga(y,x,t);
   if(r===n-1&&t==='#'){riga(1,x,'#');riga(0,x,'#');}
  }}
  m.w+=w;m.pezzi++;
 };
 /* il mare è una sola mappa a U: S partenza, F uscita, ~ pelo dell'acqua. Fuori dalla griglia ci sono i muri */
 if(acqua){pezzo(PEZZI[CORSE[i][0]]);for(let y=0;y<nr;y++)for(let x=0;x<m.w;x++)if(g[y][x]===undefined)g[y][x]=' ';m.acqua=true;m.decor=[];m.alghe=[];const fy=Math.floor(m.livello);let s=m.fine;while(g[fy][s-1]==='#')s--;m.spiaggia=s;
  for(let y=2;y<fy;y++)for(let x=0;x<m.w;x++)if(g[y][x]==='#'&&g[y+1][x]===' '){const h=((x*2654435761+y*40503)>>>0)>>>7;if(h%5<2)m.alghe.push({x,y,t:[0,0,2,3,4][(h>>>4)%5],f:x*1.3});}
  return m;}
 pezzo(["          ","##########"]);
 m.start={x:3,y:2.97};
 (lista||CORSE[i]).forEach(n=>{m.nomi.push({x:m.w,n});(FINTI[n]||[]).forEach(f=>{const r=[m.w+f[0],f[1],m.w+f[2],f[3]];m.finti.push(r);for(let y=r[1];y<=r[3];y++)for(let x=r[0];x<=r[2];x++)m.fintoSet.add(y+'_'+x);});pezzo(PEZZI[n]);});
 pezzo(["                ","                ","################"]);
 m.fine=m.w-6;
 for(let y=0;y<ALTO;y++)for(let x=0;x<m.w;x++)if(g[y][x]===undefined)g[y][x]=' ';
 const dc=MONDI[i].decor;m.decor=[];for(let x=1;x<m.fine-6;x++){ /* niente decori davanti al castello */const h=(x*2654435761>>>0)>>>7;if(h%7<2&&g[2][x]==='#'&&g[3][x]===' '&&!m.oggetti.some(o=>o.x===x&&o.y===3)){let n=dc[(h>>>3)%dc.length],dx=0;if(n==='erbananas'){/* il ciuffo è largo più di 3 caselle: deve stare tutto sul piano, se no rientra un po' a sinistra, o diventa erba */const r=213/68/2,su=v=>{for(let k=Math.floor(x+v-r+.5);k<=Math.floor(x+v+r+.5);k++)if(g[2][k]!=='#'||(g[3][k]||' ')!==' ')return false;return true;};dx=[0,-.5,-1,-1.5,-2,.5,1].find(su);if(dx===undefined){n='grass';dx=0;}}m.decor.push({x,dx,n});}}
 /* le casette: solo sul pavimento principale, su un tratto pieno per tutta la larghezza e a cielo aperto (libero per 10 caselle sopra, niente stanze chiuse), lontano dalle pareti finte, a 20 caselle una dall'altra; lì niente ciuffi */
 m.case=[];{let ult=-99,q=0;for(let x=12;x<m.fine-16;x++){if(x-ult<20)continue;const t=q%3,mw=Math.ceil(CASE_R[t][2]*CASA_K/2)+1;let ok=true;for(let k=x-mw;k<=x+mw&&ok;k++){if(g[2][k]!=='#')ok=false;for(let j=3;j<=12&&ok;j++)if((g[j][k]||' ')!==' '||m.fintoSet.has(j+'_'+k))ok=false;}if(!ok)continue;m.case.push({x,t});m.decor=m.decor.filter(d=>Math.abs(d.x-x)>mw+2);ult=x;q++;}}
 m.fg=[];for(let x=6,n=0;x<m.w*PRIMO_PAR+30;x+=14+((x*2654435761>>>0)>>>9)%12)m.fg.push({x,t:PRIMO_BASSI[n++%PRIMO_BASSI.length]}); /* x nello strato del primo piano, che scorre più veloce del gioco */
 /* liane e festoni solo dove per un bel tratto non si può salire, così la telecamera non si alza e la loro cima tagliata resta fuori dallo schermo */
 {const alto=x=>{for(let k=x-10;k<=x+10;k++)for(let y=3;y<ALTO;y++){const t=g[y][k]||' ';if(y>3?t!==' '&&t!=='^'&&t!=='!':t==='B')return true;}return false;};for(let x=4,n=0;x<m.w;x++)if(!alto(x)){m.fg.push({x:x*PRIMO_PAR,t:PRIMO_PENDONO[n++%PRIMO_PENDONO.length]});x+=8;}}
 for(let x=30,n=0;x<m.w*PRIMO_PAR2+30;x+=60+((x*2654435761>>>0)>>>9)%34)m.fg.push({x,t:n++%PRIMO_SCURI.length,s:1}); /* quelle scure: poche, ancora più vicine */
 return m;
}
const cel=(x,y)=>{const r=M.g[y];if(!r)return M.boss&&!M.boss.cfg.palla&&y>0&&(x===0||x===M.w-1)?'#':' ';if(M.acqua&&(x<0||(x>=M.w&&y<=Math.floor(M.livello))))return'#'; /* a destra continua solo il pavimento, sopra è aperto */if(M.boss&&M.boss.cfg.palla&&y<=1&&(x<0||x>=M.w))return'#'; /* nella stanza del mare il pavimento continua oltre lo schermo */return r[x]||' ';}; /* sopra la sala del boss i muri continuano all'infinito, così non se ne vede la fine */
const pieno=t=>t==='#'||t==='C'||t==='D'||t==='x'||t==='y'||t==='X';
function urta(o,R){
 o.suolo=null;
 const cx=Math.round(o.x),cy=Math.round(o.y);
 for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++){
  const t=cel(x,y);if(t===' ')continue;let nx=0,ny=0,pen=0;
  if(pieno(t)){const qx=clamp(o.x,x-.5,x+.5),qy=clamp(o.y,y-.5,y+.5),dx=o.x-qx,dy=o.y-qy,d=Math.hypot(dx,dy);if(d>=R||d<1e-6)continue;nx=dx/d;ny=dy/d;pen=R-d;}
  else if(t==='-'){const top=y+.5;if(o.vy>0||o.py-R<top-.14||Math.abs(o.x-x)>.5||o.y-R>top)continue;nx=0;ny=1;pen=top-(o.y-R);}
  else if(t==='/'||t==='%'){const s=t==='/'?1:-1,n=[-s*.7071,.7071],ax=x-s*.5,ay=y-.5,sd=(o.x-ax)*n[0]+(o.y-ay)*n[1];if(sd>=R||sd<-.7)continue;const k=((o.x-ax)*s+(o.y-ay))/1.41421;if(k<-.05||k>1.5)continue;nx=n[0];ny=n[1];pen=R-sd;}
  else continue;
  o.x+=nx*pen;o.y+=ny*pen;const vn=o.vx*nx+o.vy*ny;if(vn<0){o.vx-=vn*nx;o.vy-=vn*ny;}
  if(ny>.35)o.suolo={x:nx,y:ny};
  o.urtoX=Math.abs(nx)>.8?nx:o.urtoX;
 }
}
const P2={x:0,y:0,px:0,py:0,vx:0,vy:0,R:.46,suolo:null,ultimoSuolo:null,verso:1,rotola:false,carica:0,passi:0,anim:'',animT:9,atterra:0,fermoT:0,coyote:0,buf:0,scatto:0,cd:0,inv:0,rot:0,W:0,Wv:0,sx:0,sy:0,sicuro:0};
const goo=[];
function schizzi2(x,y,n,colore,f){for(let i=0;i<n&&goo.length<130;i++)goo.push({x,y,vx:rnd(-1,1)*f,vy:rnd(.1,1.2)*f,v:rnd(.3,.75),c:colore,r:rnd(.05,.13)});}
const polveri=[];function polvere(){const p=P2;polveri.push({x:p.x,y:p.y-p.R,t:G.t});if(polveri.length>4)polveri.shift();}
const fumi=[];function sbuffo(){const p=P2;fumi.push({x:p.x-p.verso*p.R*.6,y:p.y-p.R,v:p.verso,t:G.t});if(fumi.length>6)fumi.shift();}
/* il fiato: lo scatto lo consuma, si ricarica da solo e con la pizza; a secco Matteo si ferma a riposare */
const FIATO_SCATTO=.3,FIATO_BOLLA=.25;
function aggFiato(){const f=$('fiatoB');if(f){f.style.width=(G.fiato*100)+'%';$('fiato').classList.toggle('basso',G.fiato<FIATO_SCATTO);}}
function usaFiato(q){if(P2.stanco>0)return false;if(G.carica>=1)return true; /* da bomba non si stanca */if(G.fiato<q){senzaFiato();return false;}G.fiato-=q;G.fiatoT=2;aggFiato();return true;}
function senzaFiato(){const p=P2;p.stanco=2;p.rotola=false;p.vx=0;p.carica=0;p.scatto=0;p.buf=0;suono(260,.5,'sine',.08,140);vibra(40);if(!G.dettoFiato){G.dettoFiato=true;consiglio('fiato','Senza fiato! Matteo è grasso: riposa 2 secondi. Mangia la pizza per riprendere fiato',2600);}}
function scatta2(){if(P2.cd>0||!usaFiato(FIATO_SCATTO))return;if(inVolley()){P2.volT=.36;P2.volTipo=P2.ultimoSuolo?0:1;}const d=Math.abs(IN.tx)>.15?Math.sign(IN.tx):P2.verso;P2.verso=d;P2.catena=Math.abs(P2.vx)>=8?2:1;P2.vS=Math.max(11,Math.abs(P2.vx)+3);P2.vyS=Math.max(P2.vy,0);P2.scatto=.24;P2.cd=1.1;P2.Wv-=7;if(P2.ultimoSuolo)sbuffo();sfx('throw')||suono(220,.18,'sawtooth',.1,800);vibra(15);$('tScatto').classList.remove('pronto');}
function colpito2(nx,spina){
 if(P2.inv>0||G.stato!=='gioco')return;
 /* se è una bomba, le spine e i nemici con le spine la fanno esplodere: niente cuore perso */
 if(G.carica>=1&&spina){esplodi();P2.inv=Math.max(P2.inv,1);return;}
 P2.inv=1.5;P2.vx=nx*6;P2.vy=6;P2.Wv+=8;
 togliCuore();sfx('hurt')||suono(150,.25,'square',.1,70);vibra(60);schizzi2(P2.x,P2.y,12,'#d8432e',5);
}
function raccogli(o){
 if(o.tipo==='c'){P2.mangia=.5;P2.Wv-=3;G.gettoni++;$('gett').textContent=G.gettoni;G.fiato=Math.min(1,(G.fiato||0)+.25);G.carica=Math.min(1,G.carica+.08);aggBarra();if(G.carica>=.25&&!G.avvisato){G.avvisato=true;consiglio('esplosivo','Sei esplosivo: cadi da molto in alto o sbatti forte!',2600);}sfx('coin')||suono(880,.09,'triangle',.08,1320);}
 else if(o.tipo==='H'){G.cuori++;hud();sfx('gem')||suono(520,.3,'sine',.12,1040);avviso('+1 cuore',900);schizzi2(o.x,o.y,12,'#d8432e',4);}
 else if(o.tipo==='Z'){G.carica=Math.min(1,G.carica+.4);aggBarra();sfx('magic')||suono(300,.3,'square',.08,600);avviso('Esplosione più forte',900);}
}
function rompiCassa(x,y){combo();M.g[y][x]=' ';M._mb=null; /* i bordi dei muri si rimisurano: dove c'era la cassa ora può esserci uno spigolo */const k=(x*7+y*3)%5,t=['H','c','c','Z','c','c'][(x*7+y*3)%6];schizzi2(x,y,16,'#c28a48',5);sfx('disappear')||suono(200,.15,'square',.09,90);
 if(t==='c')for(let j=0;j<3;j++)M.oggetti.push({tipo:'c',x:x-.6+j*.6,y:y+.2,fase:x+j});else M.oggetti.push({tipo:t,x,y,fase:x});}
/* il peso: scivola dove inclini il telefono e Matteo lo può spingere; sul pulsante apre la porta */
const PESO_R=.5,PESO_M=4.5;
function passoPesi(h){
 const p=P2;
 for(const a of M.pesi){if(Math.abs(a.x-p.x)>24)continue;
  const su=!!a.suolo;a.spinto=Math.max(0,(a.spinto||0)-h);a.vx*=Math.exp(-(su?(a.spinto>0?.9:6):.1)*h);a.vx=clamp(a.vx,-4,4);a.vy-=(su&&a.suolo.y<.95?10:20)*h; /* si muove solo se Matteo lo spinge: a.spinto dura un attimo dopo il contatto, poi l'attrito lo ferma */
  a.px=a.x;a.py=a.y;a.x+=a.vx*h;a.y+=a.vy*h;urta(a,PESO_R);
  const dx=a.x-p.x,dy=a.y-p.y,d=Math.hypot(dx,dy),min=p.R+PESO_R;
  /* sopra il peso Matteo poggia su una cima piatta, come le casse: col cerchio tra il peso e la cassa restava una conca dove si incastrava */
  if(Math.abs(dx)<PESO_R+p.R*.7&&p.y>a.y+.2&&p.y-p.R<a.y+PESO_R){p.y=a.y+PESO_R+p.R;if(p.vy<a.vy)p.vy=a.vy;p.suolo={x:0,y:1};}
  else if(d<min&&d>1e-6){const nx=dx/d,ny=dy/d,pen=min-d;
   if(ny<-.5){p.x-=nx*pen;p.y-=ny*pen;const vn=(p.vx-a.vx)*nx+(p.vy-a.vy)*ny;if(vn>0){p.vx-=vn*nx;p.vy-=vn*ny;}p.suolo={x:-nx,y:-ny};}
   else{if(Math.abs(nx)>.5)a.spinto=.12;const q=1.6/(1.6+PESO_M);p.x-=nx*pen*(1-q);p.y-=ny*pen*(1-q);a.x+=nx*pen*q;a.y+=Math.min(0,ny*pen*q);
    const vr=(a.vx-p.vx)*nx+(a.vy-p.vy)*ny;if(vr<0){const j=-1.05*vr/(1/1.6+1/PESO_M);a.vx=clamp(a.vx+j*nx/PESO_M,-4,4);a.vy+=Math.min(0,j*ny/PESO_M);p.vx-=j*nx/1.6;p.vy-=j*ny/1.6;}}}
  if(a.y<-4){a.x=a.x0;a.y=a.y0+.5;a.vx=a.vy=0;schizzi2(a.x,a.y,10,'#c9c9d4',4);suono(500,.3,'sine',.08,200);avviso('Il peso è caduto: è tornato al suo posto',1800);}
  /* le assi che crollano le fa cadere solo Matteo: il peso le deve poter attraversare mentre lo spingi */
  for(const k of M.pulsanti)if(!k.giu&&Math.abs(a.x-k.x)<.8&&a.y>k.y-.6&&a.y<k.y+1.4)premi(k);
 }
}
function premi(k){
 for(const q of M.pulsanti)if(q.g===k.g)q.giu=true;let n=0;for(const q of M.porte)if(q.g===k.g&&M.g[q.y][q.x]==='D'){M.g[q.y][q.x]=' ';schizzi2(q.x,q.y,5,'#7fb8ff',4);n++;}
 sfx('magic')||suono(440,.3,'triangle',.1,880);vibra(40);if(n)avviso('La porta si è aperta!',1800);
}
/* blocchi che crollano: mezzo secondo dopo che ci sali cadono, e tornano dopo quattro secondi */
function calpesta(x,yPiedi){const r=Math.round(yPiedi-.3);for(const dx of[-.35,0,.35]){const q=Math.round(x+dx),k=M.crolli[r+'_'+q];if(k&&k.t<0&&M.g[r][q]===k.c){k.t=0;if(k.c==='x')suono(300,.08,'square',.05,200);}}}
function passoCrolli(dt){
 const p=P2;
 for(const key in M.crolli){const k=M.crolli[key];
  if(M.g[k.y][k.x]===k.c){if(k.t>=0){k.t+=dt;if(k.t>(k.c==='y'?.8:.5)){M.g[k.y][k.x]=' ';k.via=0;schizzi2(k.x,k.y,8,'#c28a48',4);suono(160,.15,'square',.07,70);}}}
  else{k.via+=dt;const libero=Math.hypot(p.x-k.x,p.y-k.y)>1.2&&(M.pesi||[]).every(a=>Math.hypot(a.x-k.x,a.y-k.y)>1.2);if(k.via>4&&libero){M.g[k.y][k.x]=k.c;k.t=-1;}}}
}
/* muri crepati: solo l'esplosione li apre */
function rompiCrepa(x,y){M.g[y][x]=' ';M._mb=null;schizzi2(x,y,10,'#b0643a',6);if(!M.dettaCrepa){M.dettaCrepa=true;avviso('Muro aperto: dentro c’è una stanza segreta!',2200);}}
/* combo: nemici e casse travolti uno dopo l'altro valgono di più */
function combo(){if(P2.slancio>0)P2.slancio=Math.max(P2.slancio,.8);G.combo=G.comboT>0?(G.combo||0)+1:1;G.comboT=1.5;if(G.combo>=2){G.gettoni+=G.combo;$('gett').textContent=G.gettoni;G.comboV={n:G.combo,t:G.t};suono(400+G.combo*90,.12,'triangle',.09,800+G.combo*120);}}
const AIUTI={magazzino:'Il peso apre la porta se cade sul pulsante: rompi le casse con lo scatto e spingilo',crollo:'Il ponte crolla appena ci sali: non fermarti!',valanga:'Lanciati giù per la discesa: a tutta velocità travolgi nemici e casse'};
function passo2d(h){
 const p=P2;{const bo=G.carica>=1;if(bo&&!p.eraBomba)p.gonfioT=.45;if(!bo&&p.eraBomba)p.sgonfiaT=.6;p.eraBomba=bo;if(!bo)p.gFermo=false;p.gonfioT=Math.max(0,(p.gonfioT||0)-h);if(p.ultimoSuolo&&p.vy<=.5){p.boomAria=false;p.sgonfiaT=Math.max(0,(p.sgonfiaT||0)-h);}if(bo)p.mangia=0;else if(!p.rotola&&p.ultimoSuolo&&!(p.anim==='apre'&&p.animT<SPR_ATTESA))p.mangia=Math.max(0,(p.mangia||0)-h);}p.cd=Math.max(0,p.cd-h);if(p.cd===0)$('tScatto').classList.add('pronto');p.inv=Math.max(0,p.inv-h);p.buf=Math.max(0,p.buf-h);p.coyote=Math.max(0,p.coyote-h);
 if(p.stanco>0){p.stanco-=h;p.rotola=false;p.carica=0;p.vx=0;if(p.stanco<=0){p.stanco=0;G.fiato=Math.max(G.fiato,.4);}}else{G.fiatoT=Math.max(0,(G.fiatoT||0)-h);if(G.fiatoT<=0)G.fiato=Math.min(1,(G.fiato||0)+.07*h);} /* Matteo è grasso: riprende fiato piano, solo dopo 2 secondi senza scatti */
 const tx=p.stanco>0?0:IN.tx;if(Math.abs(tx)>.08)p.verso=Math.sign(tx);
 aggRaggio(p);p.px=p.x;p.py=p.y;const vy0=p.vy;
 if(M.acqua&&p.y<M.livello){nuoto(h,tx);return;}if(p.inAcqua){p.inAcqua=false;schizzi2(p.x,M.livello,16,'#d8f4ff',6);}
 p.animT+=h;const su0=!!p.ultimoSuolo;
 if(su0&&!(p.stanco>0)&&G.carica<1&&G.fiato<FIATO_SCATTO&&p.scatto<=0)senzaFiato(); /* da stanco si ferma e riposa, non cammina */
 p.carica=Math.abs(tx)>.3?p.carica+h:0;
 if(!p.rotola&&!(p.stanco>0)&&(p.gFermo||(p.anim==='apre'&&p.animT<SPR_ATTESA))&&matteoNuovo()&&(p.carica>.15||Math.abs(p.vx)>1.3||p.scatto>0)){p.rot=p.rotF;p.rotola=true;p.anim='';p.animT=9;p.gFermo=false;}
 else if(!p.rotola&&!(p.stanco>0)&&(p.carica>.15||Math.abs(p.vx)>3||p.scatto>0)){p.rot=0;p.rotola=true;p.anim='chiude';p.animT=p.scatto>0?.1:0;p.Wv-=6;}
 else if(p.rotola&&su0&&Math.abs(p.vx)<1.2&&Math.abs(tx)<.25&&p.scatto<=0){p.rotF=p.rot;p.dirF=p.vx<0?-1:1;p.gFermo=G.carica>=1;p.rotola=false;p.anim='apre';p.animT=0;p.carica=0;p.Wv+=matteoNuovo()?1.5:4;}
 if(inVolley()){p.rotola=false;p.anim='';}
 /* durante lo scatto non cade, ma la salita frena come sempre e gli urti non la aumentano: niente salti più alti né arrampicate sugli spigoli */
 if(p.scatto>0){p.scatto-=h;p.vx=p.verso*(p.vS||11);p.vyS=Math.max(0,Math.min(p.vy,p.vyS||0)-20*h);p.vy=p.vyS;if(p.scatto<=0)p.vx*=.6;
  const q=Math.round(p.x+p.verso*.8),r=Math.round(p.y);if(cel(q,r)==='C')rompiCassa(q,r);}
 else{
  /* in pendenza accelera la gravità: inclinare in discesa aggiunge poco, in salita aiuta a salire */
  const su=su0,n=p.ultimoSuolo,pend=su&&n.y<.95,giu=pend?Math.sign(n.x):0;p.vx+=tx*(!p.rotola?16:pend?(Math.sign(tx)===giu?6:24):su?30:15)*h;
  /* lanciato da una discesa conserva la velocità: niente freno né tetto finché dura lo slancio */
  const k=Math.exp(-(p.slancio>0?.15:pend?.6:Math.abs(tx)<.1&&su?3.2:su?1.4:.2)*h);p.vx*=k;const tetto=p.rotola?5.5+Math.max(0,Math.abs(tx)-.5)*12:inVolley()?5.2:3.4;if(Math.abs(p.vx)>tetto&&!(p.slancio>0))p.vx=lerp(p.vx,Math.sign(p.vx)*tetto,1-Math.exp(-h*8));
  if(p.bolla>0){p.bolla-=h;p.vy+=(2.3-p.vy)*Math.min(1,h*5);p.vx*=Math.exp(-.6*h);}else p.vy-=(pend?14:20)*h;
 }
 p.x+=p.vx*h;p.y+=p.vy*h;p.x=Math.max(p.R,p.x);
 const n0=p.ultimoSuolo;if(n0&&n0.y<.95&&Math.sign(n0.x)===Math.sign(p.vx)&&Math.abs(p.vx)>6&&p.rotola)p.slancio=1.1;else if(p.slancio>0)p.slancio=Math.abs(p.vx)<4?0:p.slancio-h;
 if(p.slancio>0){const q=Math.round(p.x+Math.sign(p.vx)*.8),r=Math.round(p.y);if(cel(q,r)==='C')rompiCassa(q,r);}
 const vx0=p.vx;p.urtoX=0;urta(p,p.R);
 if(M.boss&&M.boss.cfg.palla){p.volT=Math.max(0,(p.volT||0)-h);const q=clamp(p.x,CAMPO_S+p.R,RETE-p.R);if(q!==p.x){if((q-p.x)*p.vx<0)p.vx=0;p.x=q;}} /* né la rete né il bordo sinistro invisibile si passano, nemmeno saltando */
 /* in discesa resta attaccato alla rampa invece di decollare */
 if(!p.suolo&&p.ultimoSuolo&&p.vy<=1&&p.scatto<=0)for(let d=.04;d<=.45;d+=.04){const q={x:p.x,y:p.y-d,px:p.x,py:p.py,vx:0,vy:0};urta(q,p.R);if(q.suolo){const n=q.suolo,v=Math.hypot(p.vx,p.vy),dir=Math.sign(p.vx*n.y-p.vy*n.x)||1;p.y=q.y;p.suolo=n;p.vx=n.y*v*dir;p.vy=-n.x*v*dir;break;}}
 if(M.pesi)passoPesi(h);if(p.suolo&&M.crolli)calpesta(p.x,p.y-p.R);
 if(p.urtoX&&Math.abs(vx0)>=7&&Math.abs(p.vx)<Math.abs(vx0)*.5)botto();
 if(p.suolo&&!p.ultimoSuolo&&vy0<-12)botto();
 if(p.suolo&&!p.ultimoSuolo&&vy0<-4)p.atterra=.2;p.atterra=Math.max(0,p.atterra-h);p.fermoT=p.suolo&&Math.abs(p.vx)<.25&&!p.rotola?p.fermoT+h:0;if(p.fermoT>6.3&&!(matteoNuovo()&&G.carica<=.6))p.fermoT=0; /* il Matteo nuovo continua col telefono finché non si muove */
 if(p.suolo){p.bollaUsata=false;if(p.bolla>0&&p.suolo.y>.5&&p.vy<=0)p.bolla=0;if(vy0<-7&&!p.ultimoSuolo){p.Wv-=Math.min(14,-vy0*.9);suono(120,.08,'sine',.08);}p.coyote=.1;
  const q=Math.round(p.x),r=Math.round(p.y-p.R-.3);if(p.suolo.y>.9&&cel(q,r)==='#'&&cel(q-1,r)==='#'&&cel(q+1,r)==='#'){p.sx=q;p.sy=r+1.2;}}
 /* cadendo da un punto più alto fa un rimbalzino */
 if(p.suolo&&!p.ultimoSuolo&&vy0<-10.5&&p.vy<=0){p.vy=Math.min(-vy0*.22,3);p.y+=.02;p.suolo=null;}
 p.ultimoSuolo=p.suolo;
 if(p.buf>0&&p.coyote>0){polvere();p.vy=9.6;p.coyote=0;p.buf=0;p.ultimoSuolo=null;p.Wv+=7;sfx('jump')||suono(330,.14,'triangle',.11,660);}
 const bq=Math.round(p.x),br=Math.round(p.y-p.R+.1);
 if(cel(bq,br)==='B'&&p.vy<=.1){M.molla={k:br+'_'+bq,t:G.t};polvere();p.vy=14;p.ultimoSuolo=null;p.y=br+.1+p.R;p.Wv+=11;sfx('jump-high')||suono(260,.3,'square',.08,900);}
 for(const dx of[-p.R*.6,p.R*.6]){const q=Math.round(p.x+dx),r=Math.round(p.y-p.R+.15),t=cel(q,r);
  if((t==='^'||t==='!')&&M.spine[r+'_'+q].s>.55)colpito2(-Math.sign(p.vx||1),true);}
 const w=clamp(p.W,-.5,.5);p.Wv+=(-160*p.W-11*p.Wv)*h;p.W+=p.Wv*h;p.W=w===p.W?p.W:clamp(p.W,-.5,.5);
 p.rot-=p.vx*h/R_NORMALE*.5;if(!p.rotola&&(p.gFermo||(p.anim==='apre'&&p.animT<SPR_ATTESA)))p.rotF=p.rot; /* finché scivola la palla continua a girare */
 p.passi+=Math.abs(p.vx)*h*4.6;
 if(p.ultimoSuolo&&Math.abs(p.vx)<.7&&!matteoNuovo()){const q=Math.atan2(Math.sin(p.rot),Math.cos(p.rot));p.rot-=q*Math.min(1,h*12);}
 if(p.y<-4){togliCuore();if(G.stato==='gioco'){p.x=p.sx||M.start.x;p.y=(p.sy||M.start.y)+1;p.vx=p.vy=0;p.inv=1.6;p.scatto=0;suono(500,.4,'sine',.1,90);}}
 if(!M.boss){const d=M.fine+.6-p.x,ap=d<6&&d>-3?1:0;if(ap&&!M.portaSuono){M.portaSuono=true;sfx('door')||suono(140,.5,'sawtooth',.06,70);}M.porta=lerp(M.porta||0,ap,1-Math.exp(-h*3));} /* la porta del castello si apre quando Matteo si avvicina */
 if(M.uscita&&p.x>M.w-.2&&G.stato==='gioco'){G.stato='velo';dissolvi(()=>entraCorsa(M.i+1));}
 if(!M.boss&&p.x>M.fine&&G.stato==='gioco'){G.stato='velo';dissolvi(()=>M.prova?finisciProva():entraBoss(M.i));}
}
function passoOggetti(dt){
 const p=P2;aggFiato();G.comboT=Math.max(0,(G.comboT||0)-dt);if(M.crolli)passoCrolli(dt);
 for(const q of M.nomi||[])if(!q.detto&&p.x>q.x+1.5&&AIUTI[q.n]){q.detto=true;consiglio('pezzo_'+q.n,AIUTI[q.n],3800);}
 if(!M.boss&&!M.dettaCrepa&&!M.vistaCrepa&&cel(Math.round(p.x+p.verso*1.2),Math.round(p.y))==='X'){M.vistaCrepa=true;consiglio('crepa','Muro crepato: si apre solo con l’esplosione. Mangia pizza e sbattici contro forte',3000);}
 for(let i=M.oggetti.length-1;i>=0;i--){const o=M.oggetti[i];if((Math.abs(o.x-p.x)<.75&&Math.abs(o.y-p.y)<.8)||distMatteo(o.x,o.y)<.9){raccogli(o);M.oggetti.splice(i,1);}}
 for(const k in M.spine){const a=M.spine[k];if(a.t==='!'){const on=Math.sin(G.t*1.4+a.fase)>0;a.s=lerp(a.s,on?1:.1,1-Math.exp(-dt*12));}}
}
function uccidi2(n){combo();n.vivo=false;G.uccisi++;G.gettoni+=2;$('gett').textContent=G.gettoni;if(n.tipo==='e'||n.tipo==='f')n.morto=G.t; /* la pera e l'uccellino fanno vedere un attimo che sono stati colpiti */
 if(n.tipo==='m')schizzi2(n.x,n.y,10,'#ff9ed2',4);if(n.tipo==='e'&&['pera','granchio'].includes(MONDI[M.i||0].nemico))M.oggetti.push({tipo:'c',x:n.x,y:n.cade?2:n.y+.1,fase:n.x}); /* la pera lascia una pizza; se muore in aria, la pizza sta a terra */
 sfx('bump')||suono(180,.2,'square',.1,60);vibra(25);}
function passoNemici2(dt){
 const p=P2;
 for(const n of M.nemici){if(!n.vivo||Math.abs(n.x-V.cx)>22)continue;n.fase+=dt;
  if(n.tipo==='e'&&n.cade){n.vy-=20*dt;n.y+=n.vy*dt;if(n.y<=1.9){n.y=1.9;n.cade=false;n.alza=G.t;}} /* atterrata resta seduta un attimo e si rialza */
  else if(n.tipo==='e'&&n.alza&&G.t-n.alza<.6){}
  else if(n.tipo==='e'){n.x+=n.vx*dt;const d=Math.sign(n.vx),av=Math.round(n.x+d*.5),r=Math.round(n.y);if(pieno(cel(av,r))||!(pieno(cel(av,r-1))||cel(av,r-1)==='-'))n.vx*=-1;}
  else if(n.tipo==='r'){const d=p.x-n.x;n.vx=lerp(n.vx,Math.abs(d)<9?Math.sign(d)*2.3:0,1-Math.exp(-dt*2.5));n.vy-=26*dt;n.px=n.x;n.py=n.y;n.x+=n.vx*dt;n.y+=n.vy*dt;urta(n,.42);if(n.y<-4){n.vivo=false;G.uccisi++;}}
  else if(n.tipo==='m'){n.y=n.y0+Math.sin(n.fase*.9)*1.6;}
  else if(n.tipo==='f'){n.x=n.x0+Math.sin(n.fase*.8)*2.4;n.y=n.y0+Math.sin(n.fase*1.7)*.8;}
  else if(n.tipo==='g'){n.t-=dt;if(n.t<=0&&Math.abs(n.x-p.x)<10){n.t=3;const d=Math.sign(p.x-n.x)||-1;M.colpi.push({x:n.x+d*.6,y:n.y,vx:d*4.5,v:3.6});suono(300,.12,'square',.05,120);}}
  const d=distMatteo(n.x,n.y),rn=n.tipo==='r'?.45:.42;
  if(d<p.R+rn){
   /* si ricontrolla per ogni nemico: lo scatto può essere finito su quello prima */
   const forte=p.scatto>0||p.slancio>0;
   if(forte){const colpo=p.scatto>0;uccidi2(n);
    /* lo scatto elimina tutti i nemici nel blocco del primo (due blocchi se slanciato): slanciato va avanti, lento rimbalza indietro */
    if(colpo){const v=Math.sign(p.vx)||p.verso,raggio=p.catena||1;p.cd=Math.min(p.cd,.3);
     for(const o of M.nemici)if(o.vivo&&Math.abs(o.y-n.y)<1.2&&(o.x-n.x)*v>-.6&&(o.x-n.x)*v<raggio+.5)uccidi2(o);
     if(raggio<2){p.scatto=0;p.vx=-v*2.5;p.vy=Math.max(p.vy,3.5);p.ultimoSuolo=null;}p.inv=Math.max(p.inv,.25);}}
   /* saltandogli in testa muore, tranne i nemici con le spine (r) e i blocchi che sparano (g) */
   else if(!inAcqua()&&(n.tipo==='e'||n.tipo==='f')&&p.vy<0&&p.y>n.y+.35){uccidi2(n);p.vy=7;p.Wv+=7;p.ultimoSuolo=null;}
   else colpito2(Math.sign(p.x-n.x)||1,n.tipo==='r');
  }
 }
 for(let i=M.colpi.length-1;i>=0;i--){const c=M.colpi[i];if(c.palla){c.vy-=(c.g||PALLA_G)*dt; /* con la gravità in proporzione la curva resta uguale, solo percorsa più in fretta */c.rot+=c.vx*dt*1.4;if(c.y<PALLA_Y&&c.vy<0){c.y=PALLA_Y;c.vy=-c.vy*.55;c.vx*=.8;c.rimb++;suono(180,.1,'sine',.09,90);if(c.rimb>1){M.colpi.splice(i,1);continue;}}}c.x+=c.vx*dt;c.y+=(c.vy||0)*dt;c.v-=dt;if(c.v<0||(c.palla?'#C'.includes(cel(Math.round(c.x),Math.round(c.y))):pieno(cel(Math.round(c.x),Math.round(c.y))))){M.colpi.splice(i,1);continue;}if(c.palla&&c.rinvio){const b=M.boss,m=c.mani;if(b&&b.vita>0&&(m?Math.hypot(c.x-m.x,c.y-m.y)<.35||(c.vy<0&&c.y<m.y&&Math.abs(c.x-m.x)<.7):Math.hypot(c.x-b.x,c.y-b.y)<b.r+.6)){M.colpi.splice(i,1);palloneAlBoss(b,c);}continue;}if(c.palla&&M.tut===2&&distMatteo(c.x,c.y,true)<1.4){M.tut=3;p.cd=0;G.fiato=Math.max(G.fiato,.5);G.stato='ora';avviso('ORA! Premi SCATTO',600000);$('tScatto').classList.add('pronto','ora');return;} /* il tutorial ferma il gioco quando la palla è a portata */
  if(c.palla&&p.scatto>0&&distMatteo(c.x,c.y,true)<1.5){ribatti(c);continue;}if(distMatteo(c.x,c.y)<(c.palla?p.R+.4:.7)&&p.scatto<=0)colpito2(Math.sign(c.vx)||1); /* la palla fa male finché è in gioco, anche dopo il primo rimbalzo: si tocca solo con lo scatto */}
 passoGoo(dt);
}
function passoGoo(dt){for(let i=goo.length-1;i>=0;i--){const q=goo[i];q.v-=dt;q.vy-=(M.acqua&&q.y<M.livello?-4:16)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.v<=0)goo.splice(i,1);}}
function disegnaSlime(c,x,y,r,rot,st){
 const N=30,pts=[],t=st.t,sp=Math.hypot(st.vx,st.vy),fi=Math.atan2(st.vy,st.vx),al=Math.min(.2,sp*.016),n=st.n,ox=n?-n.x*.14*r:0,oy=n?-n.y*.14*r:0;
 for(let i=0;i<N;i++){const a=i/N*6.2832;
  let k=1+st.W*Math.cos(2*(a-1.5708))+al*Math.cos(2*(a-fi))+(.02+sp*.003)*Math.sin(3*a+t*5)+.012*Math.sin(5*a-t*7);
  let px=Math.cos(a)*k*r,py=Math.sin(a)*k*r;
  if(n){const dn=-(px*n.x+py*n.y),lim=r*.86;if(dn>lim){const e=dn-lim;px+=n.x*e;py+=n.y*e;const tg=px*n.y-py*n.x,sg=Math.sign(tg)||1;px+=n.y*sg*e*.45;py+=-n.x*sg*e*.45;}}
  pts.push([x+ox+px,y-oy-py]);}
 const pa=new Path2D();c.save();
 for(let i=0;i<N;i++){const a=pts[i],b=pts[(i+1)%N],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;if(i===0)pa.moveTo(mx,my);else pa.quadraticCurveTo(a[0],a[1],mx,my);}
 pa.quadraticCurveTo(pts[0][0],pts[0][1],(pts[0][0]+pts[1][0])/2,(pts[0][1]+pts[1][1])/2);pa.closePath();
 const col=amico().colore;
 c.save();c.clip(pa);c.fillStyle=col;c.fillRect(x-r*2,y-r*2,r*4,r*4);
 c.translate(x+ox,y-oy);c.save();c.rotate(rot);c.globalAlpha=.97;if(st.disegno&&FOGLIO.complete){
  const giro=((rot%6.2832)+6.2832)%6.2832,q=st.foto?3:Math.floor(giro/1.5708)%4,lato=CELLA*r*2.3/PALLA_L,ry=(CELLA*.97-PALLA_H[q]/2)/CELLA*lato;c.globalAlpha=1;
  c.drawImage(foglioAmico(),(3+q)*CELLA,2*CELLA,CELLA,CELLA,-lato/2,-ry,lato,lato);
  if(st.foto){const m=Math.min(st.foto.width,st.foto.height),g=r*.74;c.save();c.beginPath();c.arc(0,0,g,0,6.3);c.clip();c.drawImage(st.foto,(st.foto.width-m)/2,(st.foto.height-m)/2,m,m,-g,-g,g*2,g*2);c.restore();c.lineWidth=Math.max(2,r*.08);c.strokeStyle='#14100c';c.beginPath();c.arc(0,0,g,0,6.3);c.stroke();}
 }else c.drawImage(cvPalla,256,0,512,512,-r*1.08,-r*1.08,r*2.16,r*2.16);c.restore();
 const g=c.createRadialGradient(-r*.25,-r*.35,r*.2,0,0,r*1.15);g.addColorStop(0,'#ffffff30');g.addColorStop(.6,'#ffffff00');g.addColorStop(1,'#00000055');c.fillStyle=g;c.fillRect(-r*2,-r*2,r*4,r*4);
 c.fillStyle='#ffffffb0';c.beginPath();c.ellipse(-r*.38,-r*.5,r*.2,r*.12,-.6,0,6.3);c.fill();c.beginPath();c.arc(-r*.08,-r*.66,r*.05,0,6.3);c.fill();
 c.restore();c.lineWidth=Math.max(2,r*.09);c.strokeStyle='#2a1a10cc';c.stroke(pa);
 c.restore();
}
function cuoreP(c,x,y,s){c.beginPath();c.moveTo(x,y+s*.55);c.bezierCurveTo(x-s*1.1,y-s*.2,x-s*.55,y-s*.95,x,y-s*.35);c.bezierCurveTo(x+s*.55,y-s*.95,x+s*1.1,y-s*.2,x,y+s*.55);c.fill();}
/* gli oggetti dell'utente per il primo piano del mondo 1: in due file, quella dietro più piccola e più lenta, messi a caso (ma sempre uguali) e ripetuti, anche sovrapposti */
const OGG=new Image();OGG.src='assets/fondi/oggetti.webp';const OGGM={albero:[0,0,446,405],palma:[448,0,233,198],rossa:[683,0,154,148],aiuola:[839,0,231,189],sasso:[1072,0,69,50],ananas1:[1231,0,154,206],ananas2:[1387,0,128,166],ananas3:[1517,0,117,194],cespo:[1636,0,125,117],cespo2:[1763,0,110,93],sassi:[1875,0,108,63],sassi2:[1985,0,131,87]};
function filaOgg(seme,nomi,n,pass){let r=seme;const rn=()=>(r=r*16807%2147483647)/2147483647,L=[];let x=0;for(let i=0;i<n;i++){const k=nomi[Math.floor(rn()*nomi.length)],w=OGGM[k][2];L.push({k,x,f:rn()<.5});x+=w*(pass[0]+rn()*pass[1]);}return{L,per:x};}
const FILE_OGG=[filaOgg(7,['ananas1','ananas2','ananas3','palma','palma','cespo','cespo2','rossa','albero'],40,[.35,.45]),filaOgg(91,['ananas1','ananas2','ananas3','aiuola','aiuola','sassi','sassi2','sasso','cespo','cespo2','rossa','palma','albero'],40,[.45,.55])];
function filaOggetti(c,fi,par,k){if(!OGG.complete||!OGG.width)return;const per=fi.per*k,o=((V.cx*V.ts0*par)%per+per)%per;for(let b=-per;b<V.W+per;b+=per)for(const it of fi.L){const m=OGGM[it.k],w=m[2]*k,h=m[3]*k,x=b+it.x*k-o;if(x>V.W||x+w<0)continue;if(it.f){c.save();c.translate(x+w,V.H-h);c.scale(-1,1);c.drawImage(OGG,m[0],m[1],m[2],m[3],0,0,w,h);c.restore();}else c.drawImage(OGG,m[0],m[1],m[2],m[3],x,V.H-h,w,h);}}
/* il primo piano del mondo 1: l'utente l'ha disegnato perché i bordi si attacchino, quindi le copie stanno una dopo l'altra, sovrapposte di un pixel dell'immagine perché non resti una fessura */
function stratoPonti(c,f,par,y,h){const k=h/f.height,pe=(f.width-1)*k,w=f.width*k,o=((V.cx*V.ts0*par)%pe+pe)%pe;for(let x=-o-pe;x<V.W;x+=pe)if(x+w>0)c.drawImage(f,x,y,w,h);}
/* uno strato del fondale largo quanto l'immagine, ripetuto e specchiato una volta sì e una no perché i bordi non si raccordano; con dritto ricomincia sempre uguale */
function strato(c,f,par,y,h,dritto){const b=2,sw=f.width-2*b,w=h*sw/f.height,pe=dritto?w:2*w,o=((V.cx*V.ts0*par)%pe+pe)%pe; /* senza le due colonne di bordo e con 3 px di sovrapposizione, se no tra una copia e l'altra resta una riga chiara */
 for(let i=0,x=-o;x<V.W;i++,x+=w){x=Math.floor(x);if(i%2&&!dritto){c.save();c.translate(x+w+3,y);c.scale(-1,1);c.drawImage(f,b,0,sw,f.height,0,0,w+3,h);c.restore();}else c.drawImage(f,b,0,sw,f.height,x,y,w+3,h);}}
/* la sala del trono di Ananassone, disegnata dall'utente: ferma e grande quanto lo schermo, appoggiata in basso */
const SALA=new Image();SALA.src='assets/sala_ananas.webp';
/* le tre casette dell'utente (paesaggio/casette_originale.jpg, scontornate, a metà grandezza e velate appena, molto meno del fondale): solo da guardare, attaccate al terreno ma dietro al gioco.
   CASE_R rettangoli nel foglio, CASE_B riga della base (sotto ci sono solo radici e ombra), alte 8 caselle quella in mezzo */
/* il primo piano, vicinissimo alla camera: piante dai fogli dell'utente (paesaggio/primopiano_originale.webp e primopiano2_originale.webp), che nascono sotto il bordo dello schermo e scorrono più veloci del gioco.
   PRIMO_R rettangoli nel foglio: 0-1 felci, 2 cespuglio, 3-4 sassi, 5 palma, 6 ciuffone, 7 tronco e 8 radici (non si usano: l'utente non li vuole), 9 liane, 10-11 cespugli a punta, 12 erbetta, 13-14 festoni (il 13 non si usa: si vede il taglio; il 14 è alzato perché i tagli restino fuori dallo schermo), 15 sasso, 16 sassetti. PRIMO_CESPI gruppi di [pezzo, dx in caselle, scala, capovolto, dy in caselle (per quelli che pendono, quanto salgono oltre il bordo), 1 se pende dall'alto]: palma e ciuffone hanno un lato tagliato dritto e le radici la cima, che vanno coperti da un'altra pianta */
const PRIMO=new Image();PRIMO.src='assets/primopiano.webp';const PRIMO_R=[[2,76,146,107],[150,87,131,96],[283,87,131,96],[416,99,123,84],[541,93,122,90],[665,2,225,181],[892,3,166,180],[1060,15,323,168],[1385,25,234,158],[1621,4,221,179],[1844,38,151,145],[1997,58,120,125],[2119,111,104,72],[2225,109,273,74],[2500,50,328,133],[2830,98,100,85],[2932,135,61,48]],PRIMO_K=1/36,PRIMO_PAR=1.55,PRIMO_TINTA='#a3b8ab';
const PRIMO_CESPI=[[[5,-.3,.66,0],[2,-2.7,.8,0],[1,2,.8,0]],[[6,.1,.68,0],[1,2.1,.85,1],[3,-2.5,.8,0]],[[14,0,.6,0,1,1]],[[10,0,.72,0],[16,2.4,1,0]],[[9,0,.62,0,0,1]],[[0,0,.95,1],[4,2.9,.8,0]],[[11,0,.85,0],[15,-2.3,.9,1]],[[2,0,.95,0],[3,-2.6,.8,1],[12,2.5,.9,1]],[[9,0,.55,1,0,1]]];
let PRIMO_T=null;function primoTinto(){if(PRIMO_T||!PRIMO.complete||!PRIMO.width)return PRIMO_T;const k=document.createElement('canvas');k.width=PRIMO.width;k.height=PRIMO.height;const c=k.getContext('2d');c.drawImage(PRIMO,0,0);c.globalCompositeOperation='multiply';c.fillStyle=PRIMO_TINTA;c.fillRect(0,0,k.width,k.height);c.globalCompositeOperation='destination-in';c.drawImage(PRIMO,0,0);return PRIMO_T=k;}
/* ogni tanto una pianta ancora più vicina alla camera: più scura, più grande e sfocata. La sfocatura si prepara una volta sola, rimpicciolendo e ingrandendo su tele nascoste: ctx.filter sul telefono (Safari) non c'è */
const PRIMO_PENDONO=PRIMO_CESPI.map((c,i)=>c[0][5]?i:-1).filter(i=>i>=0),PRIMO_BASSI=PRIMO_CESPI.map((c,i)=>c[0][5]?-1:i).filter(i=>i>=0);
const PRIMO_SCURI=[[[5,0,.95,0],[2,-3.6,1.2,0]],[[10,0,1.15,0]],[[1,0,1.45,1]],[[11,0,1.3,0]],[[2,0,1.4,0]]],PRIMO_PAR2=2.1,PRIMO_BUIO='#22352c',PRIMO_PAD=30,PRIMO_SF={};
function primoSfocato(t){if(PRIMO_SF[t])return PRIMO_SF[t];const q=PRIMO_R[t],w=q[2]+PRIMO_PAD*2,h=q[3]+PRIMO_PAD*2,tela=(a,b,im)=>{const k=document.createElement('canvas');k.width=Math.max(1,Math.round(a));k.height=Math.max(1,Math.round(b));const c=k.getContext('2d');c.imageSmoothingQuality='high';if(im)c.drawImage(im,0,0,k.width,k.height);return k;};
 const b=tela(w,h),c=b.getContext('2d');c.drawImage(PRIMO,q[0],q[1],q[2],q[3],PRIMO_PAD,PRIMO_PAD,q[2],q[3]);c.globalCompositeOperation='source-atop';c.globalAlpha=.68;c.fillStyle=PRIMO_BUIO;c.fillRect(0,0,w,h);
 let m=b;for(const f of [4,3])m=tela(w/2,h/2,tela(w/f,h/f,m));return PRIMO_SF[t]=m;}
const CASETTE=new Image();CASETTE.src='assets/casette.webp';const CASE_R=[[0,56,271,453],[275,0,343,509],[622,121,273,388]],CASE_B=[435,498,375],CASA_K=8/509;
const CASTELLO=new Image();CASTELLO.src='assets/castello.webp'; /* scontornato da paesaggio/castello_originale.png; la porta è a 252 px dal bordo sinistro e la sua soglia a 538 px dall'alto: sotto ci sono solo le radici */
function fondale(c,m){if(m.acqua){fondaleMare(c);return;}if(G.modo==='2d'&&M&&M.boss&&M.i===0&&SALA.complete){const k=Math.max(V.W/SALA.width,V.H/SALA.height),w=SALA.width*k,h=SALA.height*k;c.drawImage(SALA,(V.W-w)/2,V.H-h,w,h);return;}const h=Math.max(V.H*.66,200),w=h,f=FONDI[m.fondo],nv=FONDI.clouds,r=m.retro&&FONDI[m.retro];c.fillStyle='#c4e2ff';c.fillRect(0,0,V.W,V.H);
 if(m.retro==='cielo'){const hn=V.H*.38,nu=FONDI.cielo_nuvole,gr=c.createLinearGradient(0,hn,0,V.H);gr.addColorStop(0,'#87dcfa');gr.addColorStop(1,'#d0f8ff');c.fillStyle='#87dcfa';c.fillRect(0,0,V.W,hn);c.fillStyle=gr;c.fillRect(0,hn-1,V.W,V.H-hn+1);if(nu.complete&&nu.width)strato(c,nu,.04,0,hn);if(f.complete&&f.width)strato(c,f,.1,V.H*.08,V.H*.92,true);return;} /* gli ananas si ripetono dritti, senza specchio */
 if(r){if(r.complete&&r.width)strato(c,r,.05,0,V.H);if(m.oggetti){const k=V.H/434;filaOggetti(c,FILE_OGG[0],.14,k*.85);filaOggetti(c,FILE_OGG[1],.24,k*1.25);}else if(f.complete&&f.width)strato(c,f,.2,V.H-h,h);return;}
 if(nv.complete){const o=((V.cx*V.ts0*.1)%w+w)%w;for(let x=-o;x<V.W;x+=w)c.drawImage(nv,x,V.H-2*h+1,w+1,h);}
 if(f.complete){const o=((V.cx*V.ts0*.2)%w+w)%w;for(let x=-o;x<V.W;x+=w)c.drawImage(f,x,V.H-h,w+1,h);}}
function solidoK(x,y){if(y<0)return cel(x,0)==='#';const t=cel(x,y);return t==='#'||t==='/'||t==='%'||t==='y'||!!(M.fintoSet&&M.fintoSet.has(y+'_'+x));}
function nomeTile(x,y,k){
 const u=solidoK(x,y+1),d=y<=0||solidoK(x,y-1),l=solidoK(x-1,y),r=solidoK(x+1,y);let n;
 if(!u&&!d)n=l&&r?'horizontal_middle':l?'horizontal_right':r?'horizontal_left':'block';
 else if(!l&&!r)n=!u?'vertical_top':!d?'vertical_bottom':'vertical_middle';
 else if(!u)n=l&&r?'block_top':l?'block_top_right':'block_top_left';
 else if(!d)n=l&&r?'block_bottom':l?'block_bottom_right':'block_bottom_left';
 else n=l&&r?'block_center':l?'block_right':'block_left';
 return 'terrain_'+k+'_'+n;
}
/* com'è il lato del piano in x,y: [m|g|v, -1 sinistra|1 destra], o null se i lati continuano o finiscono tutti e due */
function latoPiano(x,y){const muro=(i,j)=>solidoK(i,j)&&!'/%'.includes(cel(i,j)),caso=d=>muro(x+d,y)&&muro(x+d,y+1)?'m':solidoK(x+d,y)?null:solidoK(x+d,y-1)?'g':'v',l=caso(-1),r=caso(1);
 /* il bordo sul vuoto (v) solo se dall'altra parte c'è un muro, dove l'uncino si attacca: sui piani larghi il vuoto ha lo stesso pezzo del gradino */
 if(l&&r){if(l==='m'&&r!=='m')return[r,1];if(r==='m'&&l!=='m')return[l,-1];return l==='m'?[l,-1]:null;}return l?[l==='v'?'g':l,-1]:r?[r==='v'?'g':r,1]:null;}
/* il piano in x,y arriva al muro che sta dal lato -d: finisce lì (m) o finisce sul vuoto dal lato d (v) */
function pianoAlMuro(x,y,d){if(cel(x,y)!=='#'||solidoK(x,y+1)||!(y<=0||solidoK(x,y-1)))return null;const b=latoPiano(x,y);return!b?null:b[0]==='v'&&b[1]===d?'v':b[0]==='m'&&b[1]===-d?'m':null;}
const colonna=(x,y)=>!!(pianoAlMuro(x-1,y,-1)&&pianoAlMuro(x+1,y,1));
/* colpito: Matteo resta visibile e pulsa di un rosso leggero. Si ridisegna su un livello a parte per colorare solo lui */
const ROSSO=document.createElement('canvas');
function tingiRosso(c,pg,a){const w=c.canvas.width,h=c.canvas.height;if(ROSSO.width!==w||ROSSO.height!==h){ROSSO.width=w;ROSSO.height=h;}const k=ROSSO.getContext('2d');k.setTransform(1,0,0,1,0,0);k.clearRect(0,0,w,h);k.setTransform(c.getTransform());pg(k);k.setTransform(1,0,0,1,0,0);k.globalCompositeOperation='source-atop';k.globalAlpha=a===undefined?.06+.16*(.5+.5*Math.sin(G.t*28)):a;k.fillStyle='#ff1010';k.fillRect(0,0,w,h);k.globalAlpha=1;k.globalCompositeOperation='source-over';c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(ROSSO,0,0);c.restore();}
function disegna2d(){
 const c=ctx2,m=MONDI[M.i],ts=V.ts,W=V.W,H=V.H,p=P2,k=m.kit,k0=k;
 c.setTransform(V.dpr,0,0,V.dpr,0,0);fondale(c,m);if(G.scossa>0)c.translate(rnd(-5,5)*G.scossa*2,rnd(-5,5)*G.scossa*2);
 const sx=x=>(x-V.cx)*ts+W/2,sy=y=>H/2-(y-V.cy)*ts,mz=ts+.8,lento=Math.floor(G.t*3)%2,veloce=Math.floor(G.t*7)%2;
 const tb=k==='sand'&&M.boss&&!m.acqua,tn=k==='sand'&&!M.boss&&!m.acqua,c0=Math.floor(V.cx-W/2/ts)-1,c1=Math.ceil(V.cx+W/2/ts)+1,y0=Math.floor(V.cy-H/2/ts)-1,y1=Math.ceil(V.cy+H/2/ts)+1;
 if(CASETTE.complete)for(const h of M.case||[]){if(h.x<c0-4||h.x>c1+4)continue;const q=CASE_R[h.t],k=ts*CASA_K;c.drawImage(CASETTE,q[0],q[1],q[2],q[3],sx(h.x)-q[2]*k/2,sy(2.3)-CASE_B[h.t]*k,q[2]*k,q[3]*k);} /* la base affonda un po' nel pavimento */
 if(m.acqua&&!M.boss)mareDavanti(c,sx,sy,ts,c0,c1,y0,y1);
 for(const d of M.decor){if(d.x<c0-3||d.x>c1+3||tn)continue; /* col terreno nuovo niente decori del kit (erba, ciuffi vecchi, sassi): non erano nel suo stile */const a=sx(d.x)-ts/2,b=sy(3)-ts/2;if(d.n==='ananas')c.drawImage(ANAN,a,b,ts,ts);else if(d.n==='erbananas')ciuffo(c,sx(d.x+d.dx),sy(2.5),ts);else sp(c,d.n,a,b,ts,ts);}
 if(!M.boss&&!m.acqua){sp(c,'sign_right',sx(M.start.x+2)-ts/2,sy(3)-ts/2,ts,ts);
 /* il castello-ananas dell'utente: la sua porta, a M.fine, porta nella stanza del boss */
 if(CASTELLO.complete){const k=9.5*ts/CASTELLO.height,ox=sx(M.fine+.6)-252*k,oy=sy(2.4)-538*k,X=v=>ox+v*k,Y=v=>oy+v*k,a=M.porta||0;c.drawImage(CASTELLO,ox,oy,CASTELLO.width*k,CASTELLO.height*k);
  /* i due battenti (212-254 e 254-295, dall'alto 405 alla soglia 537) girano verso dentro e dietro c'è il buio */
  if(a>.01){c.save();c.beginPath();c.moveTo(X(212),Y(537));c.lineTo(X(212),Y(445));c.ellipse(X(253.5),Y(445),41.5*k,36*k,0,Math.PI,0);c.lineTo(X(295),Y(537));c.closePath();c.clip();c.fillStyle='#140c06';c.fillRect(X(210),Y(400),87*k,140*k);
   const l=42*k*(1-a*.8);c.drawImage(CASTELLO,212,405,42,132,X(212),Y(405),l,132*k);c.drawImage(CASTELLO,254,405,41,132,X(295)-l,Y(405),l,132*k);c.fillStyle='rgba(20,12,6,'+(a*.45)+')';c.fillRect(X(212),Y(405),l,132*k);c.fillRect(X(295)-l,Y(405),l,132*k);c.restore();}}}
 for(const f of M.finti||[]){if(f[2]<c0||f[0]>c1)continue;if(tn&&grottaFondo(c,sx,sy,f))continue;for(let y=f[1];y<=f[3];y++)for(let x=f[0];x<=f[2];x++)if(!pieno(cel(x,y))){const a=sx(x)-ts/2,b=sy(y)-ts/2;paes(c,pieno(cel(x,y+1))?PAES_GROTTA.cielo:PAES_GROTTA.fondo,a,b,mz,mz);}}
 if(m.acqua&&!M.boss)ripiani(c,sx,sy);
 if(tn){c.save();clipFinti(c,sx,sy,c0,c1,true);terraBuccia(c,sx,sy,c0,c1,y0,y1);c.restore();} /* sotto le pareti finte la terra la disegnano loro, con la loro trasparenza */ /* prima delle caselle: ricci e correnti, che sono caselle, restano davanti alla roccia */
 for(let y=Math.max(y0,-20);y<=y1;y++)for(let x=c0;x<=c1;x++){const a=sx(x)-ts/2,b=sy(y)-ts/2;
  if(y<=0&&cel(x,0)!=='#'){if(M.boss&&(x<0||x>=M.w))continue;sp(c,m.liquido+(y===0?(lento?'_top':'_top_low'):''),a,b,mz,mz);continue;}
  const t=y<0?'#':cel(x,y);if(t===' ')continue;if(m.acqua&&mareCasella(c,t,x,y,a,b,mz,ts))continue;if(tb&&t==='#'&&salaCasella(c,x,y,a,b,mz))continue;if(tn&&'#y/%-'.includes(t))continue; /* il terreno nuovo lo disegna terraBuccia, prima delle caselle */
  if(t==='#'){const r=cel(x,y+1),su=!solidoK(x,y+1);let bordo;if(k==='sand'&&PAES.complete&&((r==='%'&&'%#'.includes(cel(x+1,y)))||(r==='/'&&'/#'.includes(cel(x-1,y)))))paes(c,PAES_SOTTO,a,b,mz,mz,r==='/');
  else if(k==='sand'&&PAES.complete&&!su&&colonna(x,y))paes(c,PAES_COLONNA,a,b,mz,mz);
  else if(k==='sand'&&PAES.complete&&!su&&(bordo=[-1,1].find(d=>pianoAlMuro(x+d,y,d)==='v')))paes(c,PAES_UNIONE,a,b,mz,mz,bordo>0);
  else if(k==='sand'&&PAES.complete&&su&&(y<=0||solidoK(x,y-1))&&(bordo=latoPiano(x,y)))paes(c,bordo[0]==='m'&&colonna(x+bordo[1],y)?PAES_LATO_COLONNA:PAES_BORDO[bordo[0]],a,b,mz,mz,(bordo[1]>0)!==(bordo[0]==='v'));else sp(c,nomeTile(x,y,k),a,b,mz,mz);}
  else if(t==='C'){if(!((tb||tn)&&salaPezzo(c,SALA_CASSA,0,0,939,980,a,b,mz)))sp(c,'block_exclamation',a,b,mz,mz);}
  else if(t==='D')sp(c,'lock_blue',a,b,mz,mz);
  else if(t==='X')sp(c,'bricks_brown',a,b,mz,mz);
  else if(t==='P'){const k=M.pulsanti.find(q=>q.x===x&&q.y===y);sp(c,k&&k.giu?'switch_blue_pressed':'switch_blue',a,b,mz,mz);}
  else if(t==='y'){const k=M.crolli[y+'_'+x],tr=k&&k.t>.4?rnd(-1.5,1.5):0;sp(c,nomeTile(x,y,k0),a+tr,b,mz,mz);}
  else if(t==='x'){const k=M.crolli[y+'_'+x],tr=k&&k.t>=0?rnd(-2,2):0;if(!((tb||tn)&&salaBlocco(c,k&&k.t>=0?(k.t<.25?1:2):0,a+tr,b,mz)))sp(c,k&&k.t>=0?'block_fall':'block_idle',a+tr,b,mz,mz);}
  else if(t==='-'){const l=cel(x-1,y)==='-',r=cel(x+1,y)==='-';sp(c,'terrain_'+k+'_cloud_'+(l&&r?'middle':l?'right':r?'left':'middle'),a,b,mz,mz);}
  else if(t==='/')sp(c,'terrain_'+k+'_ramp_short_b',a,b,mz,mz,true);
  else if(t==='%')sp(c,'terrain_'+k+'_ramp_short_b',a,b,mz,mz);
  else if(t==='B'){const su=M.molla&&M.molla.k===y+'_'+x&&G.t-M.molla.t<.25;if(!((tb||tn)&&salaPezzo(c,SALA_MOLLA,su?991:0,0,982,852,a,b,mz)))sp(c,su?'spring_out':'spring',a,b,mz,mz);}
  else if(t==='^'||t==='!'){const s=M.spine[y+'_'+x].s;if(tn&&PUNTE.im.complete&&PUNTE.im.width){const kp=ts*(V.dpr||1)/195,tp=muroPronto(PUNTE,kp),h=ts*.85*s*PUNTE_H/205,i=t==='!'?398:0;c.drawImage(tp,i*.5*kp,0,195*kp,PUNTE_H*kp,a,b+ts-h,ts+.6,h);}else sp(c,'spikes',a,b+ts*(1-s),mz,mz*s);}
 }
 if(m.acqua&&!M.boss)bordiMuri(c,sx,sy,c0,c1,y0,y1);
 for(const key in M.crolli||{}){const k=M.crolli[key];if(k.c==='x'&&M.g[k.y][k.x]!=='x'&&k.via>3.3&&k.x>=c0&&k.x<=c1){c.globalAlpha=.35;if(!((tb||tn)&&salaBlocco(c,0,sx(k.x)-ts/2,sy(k.y)-ts/2,mz)))sp(c,'block_rest',sx(k.x)-ts/2,sy(k.y)-ts/2,mz,mz);c.globalAlpha=1;}}
 for(const a of M.pesi||[]){if(a.x<c0-2||a.x>c1+2)continue;const z=ts*1.15;sp(c,'weight',sx(a.x)-z/2,sy(a.y-PESO_R)-z*.98,z,z);}
 for(const o of M.oggetti){if(o.x<c0-1||o.x>c1+1)continue;const a=sx(o.x)-ts/2,b=sy(o.y+Math.sin(G.t*3+o.fase)*.08)-ts/2;
  if(o.tipo==='c'){c.drawImage(PIZZA,a+ts*.03,b+ts*.03,ts*.94,ts*.94);}
  else sp(c,o.tipo==='H'?'heart':'bomb',a,b,ts,ts);}
 for(const n of M.nemici){if((!n.vivo&&!(n.morto&&(n.tipo==='f'?G.t-n.morto<.7:G.t-n.morto<.3)))||n.x<c0-1||n.x>c1+1)continue;const a=sx(n.x),b=sy(n.y),z=ts*1.1,pas=Math.floor(G.t*7+n.fase)%2?'_a':'_b';
  if(n.tipo==='e'){const pie=n.cade?sy(n.y-.4):sy(Math.round(n.y+.1)-.5),q=Math.sin(G.t*12+n.fase),dv=n.vx>0?1:-1;
   if(m.nemico==='granchio'){c.save();if(!n.vivo)c.globalAlpha=Math.max(0,(.3-(G.t-n.morto))/.3);granchio(c,a,pie,ts*.5,dv<0,n.vivo?0:1);c.restore();}
   else if(m.nemico==='pera'&&PERA.complete){const hh=ts*1.3;if(!n.vivo){const t=G.t-n.morto;c.save();c.globalAlpha=t>.12?Math.max(0,(.3-t)/.18):1;disegnaPera(c,4,a,pie,hh,dv<0);c.restore();} /* colpita: occhi strizzati e sparisce */
    else if(n.cade)disegnaPera(c,5,a,pie,hh,dv<0); /* cade dall'alto seduta */
    else if(n.alza&&G.t-n.alza<.6)disegnaPera(c,G.t-n.alza<.3?6:7,a,pie,hh,dv<0); /* atterrata, poi si rialza */
    else disegnaPera(c,Math.floor(G.t*8+n.fase)%4,a,pie,hh,dv<0);} /* il foglio guarda a destra */
   else sp(c,m.nemico+'_walk'+pas,a-z/2,pie-z,z,z,dv>0);}
  else if(n.tipo==='r')sp(c,'slime_spike_walk'+pas,a-z/2,b+ts*.45-z,z,z,n.vx>0);
  else if(n.tipo==='f'){const fl=Math.cos(n.fase*.8)<0,hh=ts*1.25; /* il foglio guarda a destra: si gira quando va a sinistra */
   if(m.volo==='pesce'){const t=n.vivo?0:G.t-n.morto;c.save();c.globalAlpha=t>.4?Math.max(0,(.7-t)/.3):1;pesce(c,a,b-t*t*ts*5,ts*.42,fl,!n.vivo);c.restore();}
   else if(m.volo==='uccellino'&&UCC.complete){if(!n.vivo){const t=G.t-n.morto,q=Math.max(0,t-.15);c.save();c.globalAlpha=t>.5?Math.max(0,(.7-t)/.2):1;disegnaUcc(c,t<.15?4:5,a,b+q*q*ts*16,hh,fl);c.restore();} /* colpito: occhi sgranati, poi cade a pancia in su */
    else disegnaUcc(c,Math.floor(G.t*10+n.fase)%4,a,b,hh,fl);}
   else sp(c,m.volo+pas,a-z/2,b-z/2,z,z,Math.cos(n.fase*.8)>0);}
  else if(n.tipo==='m')medusa(c,a,b,ts*.48,n.fase);
  else if(n.tipo==='g')sp(c,'block_strong_danger',a-ts/2,b-ts/2,mz,mz);
 }
 if(M.intro&&M.i===0){c.fillStyle='#140c06';c.fillRect(sx(0)-ts/2,sy(4)-ts/2,ts+1,ts*3);}disegnaBoss(c,sx,sy,ts);if(M.uscita)frecciaUscita(c,sx,sy,ts);if(G.stato==='pronti'&&M.boss&&M.boss.cfg.palla&&!M.intro&&G.pronti<SFIDA_T)fumetto(c,sx,sy,ts,SFIDA,Math.min(1,(SFIDA_T-G.pronti)/.18));if(M.boss&&M.boss.frase>0&&M.boss.vita>0)fumetto(c,sx,sy,ts,FRASE_6,Math.min(1,(FRASE_T-M.boss.frase)/.18));
 for(const q of M.colpi){if(q.palla){if(!q.rimb&&!q.rinvio){const rr=ts*(.5+.06*Math.sin(G.t*12));c.save();c.globalAlpha=.5;c.strokeStyle='#ff3b2e';c.lineWidth=Math.max(2,ts*.1);c.beginPath();c.arc(sx(q.tx),sy(q.ty),rr,0,6.3);c.stroke();c.globalAlpha=.18;c.fillStyle='#ff3b2e';c.fill();c.restore();}c.save();c.translate(sx(q.x),sy(q.y));c.rotate(q.rot);c.drawImage(PALLA_IMG,-ts*.45,-ts*.45,ts*.9,ts*.9);c.restore();}else sp(c,'fireball',sx(q.x)-ts*.4,sy(q.y)-ts*.4,ts*.8,ts*.8,q.vx>0);}
 for(const f of polveri)disegnaPolvere(c,sx(f.x),sy(f.y),ts*1.9,(G.t-f.t)/.45);
 for(const f of fumi)disegnaFumo(c,sx(f.x),sy(f.y),ts*1.2,f.v,(G.t-f.t)/.55);
 if(G.carica>=MIN_BOTTO){const k=.15+G.carica*.45+.08*Math.sin(G.t*12),rg=p.R*ts*2.2,cx=sx(p.x),cy=sy(p.y),gr=c.createRadialGradient(cx,cy,p.R*ts*.5,cx,cy,rg);gr.addColorStop(0,`rgba(255,90,20,${k})`);gr.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=gr;c.beginPath();c.arc(cx,cy,rg,0,6.3);c.fill();}
 c.save();if(p.bolla>0&&!riduci)c.translate(rnd(-1.6,1.6),rnd(-1.6,1.6));
 const pg=c=>{const op={t:G.t,W:p.W,vx:p.vx,vy:p.vy,n:p.ultimoSuolo};
  const n=p.ultimoSuolo,pie=sy(p.y-p.R),ang=n?Math.atan2(n.x,n.y):0,am=amico(),nuovo=matteoNuovo(),r=R_NORMALE*ts*1.02*(nuovo&&G.carica>=1&&p.bolla>0?1+.25*Math.min(1,(.85-p.bolla)/.15):1); /* da bomba, nella bolla, cresce tutto un po' */
  stancoVis=G.carica>=1?0:p.stanco>0?2:G.fiato<FIATO_SCATTO?1:0;
  if(PROVA)disegnaProva(c,sx(p.x),pie,r,p,n,ang);
  else if(nuovo&&stancoVis===2)stancoSpr(c,sx(p.x),pie,r,1-p.stanco/2,p.verso,ang);
  else if(stancoVis===2)disegnaCamm(c,sx(p.x),pie,r,p.stanco<.35?3:4+Math.floor(G.t*3)%2,3,p.verso,0,ang);
  else if(inVolley())disegnaMatteoVolley(c,sx(p.x),pie,ts,p,n);
  else if(nuovo&&p.bolla>0&&G.carica<1)sedereSpr(c,sx(p.x),pie,r,.85-p.bolla,p.verso,p.W);
  else if(nuovo&&G.carica>=1){const gt=p.gonfioT||0,dd=Math.abs(p.vx);
   if(gt>0&&!p.rotola)grassoSpr(c,sx(p.x),pie,r,gt>.3?5:gt>.15?4:6,p.verso,p.W,ang);
   else if(p.rotola)gPallaGira(c,sx(p.x),pie,r,-p.rot*1.24,p.W);
   else if(p.gFermo)gPallaGira(c,sx(p.x),pie,r,-p.rotF*1.24,p.W+Math.sin(G.t*2.5)*.02); /* fermandosi resta com'è, girato, finché non riparte */
   else if(!n)grassoSpr(c,sx(p.x),pie,r,6,p.verso,p.W,0);
   else grassoSpr(c,sx(p.x),pie,r,6,p.verso,dd<.25?p.W+Math.sin(G.t*2.5)*.025:p.W,ang+(dd<.25?0:Math.sin(p.passi*.8)*.1));}
  else if(G.carica>=1){const fr=p.inv>0?34:G.t%1.3<.09?18:p.rotola?0:!n?(p.vy<-7?35:19):Math.abs(p.vx)<.25?(p.fermoT>5?Math.floor((p.fermoT-5)*7)%9:36):19+Math.floor(p.passi)%10;
   disegnaBomba(c,sx(p.x),pie,r,fr,p.rotola?1:p.verso,p.W,p.rotola?0:ang,p.rotola?-p.rot*2:0);}
  else if(!nuovo&&p.rotola&&!(p.anim==='chiude'&&p.animT<.2)){
   op.disegno=am.skin==='classica'||!!am.foto;op.foto=am._img;disegnaSlime(c,sx(p.x),sy(p.y),r,-p.rot,op);}
  else{
   if(nuovo&&p.boomAria)saltoSpr(c,sx(p.x),pie,r,p.vy>6?1:p.vy>3?2:p.vy>1?3:p.vy>-1.5?4:p.vy>-5?5:6,p.verso,0,0); /* sbalzato dall'esplosione: vola con le pose del salto e si sgonfia atterrando */
   else if(nuovo&&n&&!p.rotola&&(p.sgonfiaT||0)>0)grassoSpr(c,sx(p.x),pie,r,p.sgonfiaT>.3?7:8,p.verso,p.W,ang);
   else if(nuovo&&p.rotola){if(p.anim==='chiude'&&p.animT<.2)apreSpr(c,sx(p.x),pie,r,1+Math.min(3,Math.floor(p.animT/.05)),p.verso,p.W,ang);else gelSpr(c,sx(p.x),pie,r,9,1,p.W,p.vx,p.vy,G.t,n,-p.rot*SPR_GIRO);}
   else if(nuovo&&p.anim==='apre'&&p.animT<SPR_ATTESA+.47){const t=p.animT-SPR_ATTESA;if(t<.27)gelSpr(c,sx(p.x),pie,r,9,1,p.W,0,0,G.t,n,giroFine(p,SPR_GIRO,.27,SPR_ATTESA));else apreSpr(c,sx(p.x),pie,r,10+Math.min(2,Math.floor((t-.27)/.067)),p.verso,p.W,ang);}
   else if(p.rotola)disegnaPasso(c,sx(p.x),pie,r,Math.min(2,Math.floor(p.animT/.067)),2,p.verso,p.W,ang);
   else if(p.anim==='apre'&&p.animT<.2)disegnaPasso(c,sx(p.x),pie,r,p.animT<.1?2:1,2,p.verso,p.W,ang);
   else if(nuovo&&n&&p.atterra<=0&&(p.mangia||0)>0)grassoSpr(c,sx(p.x),pie,r,Math.min(3,Math.floor((.5-p.mangia)/.125)),p.verso,p.W,ang);
   else if(nuovo&&p.atterra>0)saltoSpr(c,sx(p.x),pie,r,p.atterra>.13?7:p.atterra>.07?8:9,p.verso,p.W,ang);
   else if(nuovo&&!n)saltoSpr(c,sx(p.x),pie,r,p.vy>6?1:p.vy>3?2:p.vy>1?3:p.vy>-1.5?4:p.vy>-5?5:6,p.verso,p.W,0);
   else if(p.atterra>0)disegnaCamm(c,sx(p.x),pie,r,4,3,p.verso,p.W,ang);
   else if(!n)disegnaCamm(c,sx(p.x),pie,r,p.vy>2.5?1:p.vy<-2.5?3:2,3,p.verso,p.W,0);
   else if(nuovo&&G.carica>.6&&Math.abs(p.vx)>=.25)grassoSpr(c,sx(p.x),pie,r,G.carica>.85?4:5,p.verso,p.W,ang+Math.sin(p.passi*.8)*.08);
   else if(nuovo&&Math.abs(p.vx)>=.25){const q=Math.floor(p.passi*.6);passiSpr(c,sx(p.x),pie,r,Math.abs(p.vx)>2.3?q%6:6+q%4,p.verso,p.W,ang);}
   else if(nuovo&&Math.abs(p.vx)<.25){if(G.carica>.6)grassoSpr(c,sx(p.x),pie,r,G.carica>.85?4:5,p.verso,p.W+Math.sin(G.t*1.96)*.02,ang);else if(p.fermoT>5)telefonoSpr(c,sx(p.x),pie,r,p.fermoT-5,p.verso,p.W,ang);else fermoSpr(c,sx(p.x),pie,r,p.verso,p.W+Math.sin(G.t*1.96)*.02,ang);}
   else if(Math.abs(p.vx)<.25){const col=p.fermoT>5?Math.floor((p.fermoT-5)*8)%10:[0,1,2,1][Math.floor(G.t*1.5)%4];disegnaCamm(c,sx(p.x),pie,r,col,0,p.verso,p.W+Math.sin(G.t*3)*.01,ang);}
   else disegnaCamm(c,sx(p.x),pie,r,Math.floor(p.passi)%10,Math.abs(p.vx)>2.3?2:1,p.verso,p.W,ang);
   }};
 pg(c);{if(p.inv>0)tingiRosso(c,pg);else if(G.carica>=1&&matteoNuovo())tingiRosso(c,pg,.03+.1*(.5+.5*Math.sin(G.t*7)));}
 stancoVis=0;c.restore();if(PROVA)elencoProva(c,c.canvas.clientWidth||c.canvas.width);
 if(p.bolla>0&&!matteoNuovo())bollaSapone(c,sx(p.x),sy(p.y),p.R*ts*(1.75+.06*Math.sin(G.t*9)),Math.min(1,p.bolla/.25),ts);
 if(G.boom){const e=(G.t-G.boom.t)/.55;if(e<1)disegnaEspl(c,sx(G.boom.x),sy(G.boom.y),G.boom.r*ts,e);else G.boom=null;}
 for(const f of M.finti||[]){if(f[2]<c0||f[0]>c1)continue;const dentro=p.x>f[0]-.7&&p.x<f[2]+.7&&p.y>f[1]-.7&&p.y<f[3]+.7;f.a=lerp(f.a===undefined?1:f.a,dentro?.05:1,.15);
  const g=clamp((1-f.a)/.7,0,1);if(g>.01&&tn)grottaBordo(c,sx,sy,f,g);else if(g>.01){c.globalAlpha=g;/* pavimento con sotto la casella che torna gialla; il soffitto resta giallo; i muri ai lati solo se la grotta ha il pavimento: nei tunnel aperti sotto si vede solo l'interno */
   const gr=(x,y,i,capo,flip)=>{if(pieno(cel(x,y)))paes(c,i,sx(x)-ts/2,sy(y)-ts/2,mz,mz,flip,capo);};let pav=false;for(let x=f[0];x<=f[2];x++)pav=pav||pieno(cel(x,f[1]-1));if(pav)for(let y=f[1];y<=f[3];y++){const al=y===f[3]&&pieno(cel(f[0],y+1)),ar=y===f[3]&&pieno(cel(f[2],y+1)),sl=!pieno(cel(f[0]-2,y)),sr=!pieno(cel(f[2]+2,y));gr(f[0]-1,y,al?(sl?PAES_GROTTA.angoloS:PAES_GROTTA.angolo):sl?PAES_GROTTA.muroS:PAES_GROTTA.muro);gr(f[2]+1,y,ar?(sr?PAES_GROTTA.angoloS:PAES_GROTTA.angolo):sr?PAES_GROTTA.muroS:PAES_GROTTA.muro,false,true);}const ms=pav&&pieno(cel(f[0]-1,f[1])),md=pav&&pieno(cel(f[2]+1,f[1]));if(ms){gr(f[0]-1,f[1]-1,!pieno(cel(f[0]-1,f[1]-2))?PAES_GROTTA.muroFondo:pieno(cel(f[0]-2,f[1]-1))?PAES_GROTTA.muroPav:PAES_GROTTA.muroPavS);gr(f[0]-1,f[1]-2,pieno(cel(f[0]-2,f[1]-2))?PAES_GROTTA.muroBase:PAES_GROTTA.muroBaseS);}if(md){gr(f[2]+1,f[1]-1,!pieno(cel(f[2]+1,f[1]-2))?PAES_GROTTA.muroFondo:pieno(cel(f[2]+2,f[1]-1))?PAES_GROTTA.muroPav:PAES_GROTTA.muroPavS,false,true);gr(f[2]+1,f[1]-2,pieno(cel(f[2]+2,f[1]-2))?PAES_GROTTA.muroBase:PAES_GROTTA.muroBaseS,false,true);}
   for(let x=f[0];x<=f[2];x++){if(pieno(cel(x,f[1]-1))){const ang=x===f[0]&&ms?1:x===f[2]&&md?-1:0;const vu=!pieno(cel(x,f[1]-2)),fi=ang?0:!pieno(cel(x+1,f[1]-1))?1:!pieno(cel(x-1,f[1]-1))?-1:0;gr(x,f[1]-1,ang?PAES_GROTTA.pavMuro:fi?(vu?PAES_GROTTA.pavFine:PAES_GROTTA.pavBordo):vu?PAES_GROTTA.pavFondo:PAES_GROTTA.pav,false,ang<0||fi<0);const bd=!pieno(cel(x+1,f[1]-2)),bs=!pieno(cel(x-1,f[1]-2));gr(x,f[1]-2,bd||bs?PAES_GROTTA.baseBordo:PAES_GROTTA.base,false,!bd&&bs);}}}
  c.globalAlpha=f.a;
  if(tn){c.save();clipFinti(c,sx,sy,c0,c1,false,f);terraBuccia(c,sx,sy,c0,c1,y0,y1);c.restore();}
  else for(let y=f[1];y<=f[3];y++)for(let x=f[0];x<=f[2];x++)if(!pieno(cel(x,y)))sp(c,nomeTile(x,y,k),sx(x)-ts/2,sy(y)-ts/2,mz,mz);c.globalAlpha=1;}
 /* il primo piano: sopra a tutto, a quota fissa: quando la telecamera sale resta giù e lo si ritrova scendendo. Quelli che pendono stanno solo dove la telecamera non sale */
 if(M.fg&&!M.boss&&primoTinto()){const im=PRIMO_T,t0=V.ts0,base=V.H+t0*.55,sal=Math.max(0,V.cy-centroY())*t0;for(const d of M.fg){const par=d.s?PRIMO_PAR2:PRIMO_PAR,cespi=(d.s?PRIMO_SCURI:PRIMO_CESPI)[d.t],xs=V.W/2+(d.x-V.cx*par)*t0;if(xs<-t0*10||xs>V.W+t0*10)continue;for(const u of cespi){const q=PRIMO_R[u[0]],k=t0*PRIMO_K*u[2],w=q[2]*k,h=q[3]*k,dy=(u[4]||0)*t0;c.save();c.translate(xs+u[1]*t0,u[5]?-t0*.2-dy:base-dy+sal*par);if(u[3])c.scale(-1,1);if(d.s){const P=PRIMO_PAD*k;c.drawImage(primoSfocato(u[0]),-w/2-P,-h-P,w+P*2,h+P*2);}else c.drawImage(im,q[0],q[1],q[2],q[3],-w/2,u[5]?0:-h,w,h);c.restore();}}}
 if(M.acqua&&!M.boss){sabbiaSotto(c,sx,sy,ts);primoMare(c,sx,sy);}
 if(G.comboV&&G.t-G.comboV.t<.9){const e=(G.t-G.comboV.t)/.9,z=ts*(.9+Math.min(1,e*6)*.35+G.comboV.n*.04);c.save();c.globalAlpha=1-e*e;c.font=`400 ${z}px "Bowlby One","Arial Black",sans-serif`;c.textAlign='center';c.lineWidth=z*.16;c.strokeStyle='#2a1a10';c.fillStyle='#f6c445';const tx=sx(p.x),ty=sy(p.y+1.6+e*1.2);c.strokeText('x'+G.comboV.n,tx,ty);c.fillText('x'+G.comboV.n,tx,ty);c.restore();}
 if(p.slancio>0&&!riduci){c.strokeStyle='#ffffffaa';c.lineWidth=3;for(let i=0;i<3;i++){const yy=sy(p.y-.3+i*.3),xx=sx(p.x-Math.sign(p.vx)*(.8+i*.25));c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-Math.sign(p.vx)*ts*(.6+i*.2),yy);c.stroke();}}
 for(const q of goo){c.fillStyle=q.c;c.globalAlpha=clamp(q.v*2.4,0,1);c.beginPath();c.arc(sx(q.x),sy(q.y),q.r*ts,0,6.3);c.fill();}c.globalAlpha=1;
}
/* il fondo del menu segue il livello più avanti che si è aperto sulla mappa: gli ananas del livello 1 (cielo, ananas coi ponti e la buccia nuova coi ciuffi, come nella corsa) o la spiaggia della Baia d'Oriente del livello 2 (il fondale col mare e la sabbia col suo bordo). Il terreno scorre piano */
function disegnaMenu(dt){
 const c=ctx2,ts=V.ts,W=V.W,H=V.H,dpr=V.dpr||1,base=H*.86,liv=Math.max(0,...LUOGHI.filter((l,i)=>i<=(S.mappa|0)&&l.liv!=null).map(l=>l.liv));if(!riduci)V.cx+=dt*.5;
 c.setTransform(dpr,0,0,dpr,0,0);
 if(liv>=1){c.fillStyle='#3d7f93';c.fillRect(0,0,W,H);if(!fondaleBaia(c,W,H,H*.6))fondale(c,MONDI[0]);
  if(SABBIA.complete&&SABBIA.width){const p=murTex(c,MAT_SABBIA,Math.round(SABBIA_TEX*ts*dpr));p.setTransform(new DOMMatrix([1/dpr,0,0,1/dpr,-V.cx*ts,base]));c.fillStyle=p;c.fillRect(0,base,W,H-base);}else{c.fillStyle='#e9b46a';c.fillRect(0,base,W,H-base);}
  const P=BORDO_SAB;if(P.im.complete&&P.im.width){const kd=Math.round(ts*dpr)/BORDO_C,tb=muroPronto(P,kd),k=ts/BORDO_C,L=BORDO_W*k,o=((V.cx*ts)%L+L)%L;for(let x=-o;x<W;x+=L)c.drawImage(tb,BORDO_A*kd,0,BORDO_W*kd,P.im.height*kd,x,base-BORDO_SU*k,L+.6,P.im.height*k);}
  return;}
 fondale(c,MONDI[0]);
 if(!BUCCIA.complete||!BUCCIA.width){c.fillStyle='#c98a2e';c.fillRect(0,base,W,H-base);return;}
 const p=murTex(c,MAT_BUCCIA,Math.round(BUCCIA_TEX*ts*dpr));p.setTransform(new DOMMatrix([1/dpr,0,0,1/dpr,-V.cx*ts,base]));c.fillStyle=p;c.fillRect(0,base,W,H-base);
 c.fillStyle=BUCCIA_LINEA;c.fillRect(0,base-1,W,Math.max(1.5,ts*.035)+1);
 if(!CIUFFI.im.complete||!CIUFFI.im.width)return;const kd=CIUFFI_Z*ts*dpr/CIUFFI_K,tc=muroPronto(CIUFFI,kd),k=CIUFFI_K*kd,x0=Math.floor(V.cx)-1; /* i ciuffi come sulle cime della corsa: su metà delle caselle, scelti dalla posizione */
 for(let x=x0;x<x0+W/ts+3;x++){const h=Math.imul(x*73856093^7*19349663,2654435761)>>>0;if(h%100>=50)continue;const q=CIUFFI_R[(h>>>8)%CIUFFI_R.length],w=q[2]*CIUFFI_Z*ts,hh=q[3]*CIUFFI_Z*ts,X=(x+.5-V.cx+((h>>>16)%100/100-.5)*.5)*ts;c.drawImage(tc,q[0]*k,q[1]*k,q[2]*k,q[3]*k,X-w/2,base-hh+ts*.015,w,hh);}
}

/* ---------- MARE (mondo 2): caselle, creature e fondale disegnati nel codice. Le caselle sono provvisorie: per metterne altre basta cambiare mareTile ---------- */
const ACQ_G=7,ACQ_CADE=5.5,ACQ_SU=6.2,ACQ_BRACC=4.2,ACQ_BALZO=10.2,ACQ_SCATTO=16,ACQ_MEZZO=30;
const inAcqua=()=>!!(M&&M.acqua&&P2.y<M.livello);
/* una bracciata verso l'alto; vicino al pelo dell'acqua diventa un balzo che porta fuori */
function bracciata(){const p=P2;if((p.br||0)>0)return;p.br=.26;if(p.y>M.livello-1.1){p.vy=ACQ_BALZO;schizzi2(p.x,M.livello,14,'#d8f4ff',5);suono(300,.2,'sine',.09,700);}else{p.vy=clamp(p.vy+ACQ_BRACC,3.6,ACQ_SU);schizzi2(p.x,p.y-p.R,3,'#d8f4ffcc',1.4);suono(420,.1,'sine',.05,640);}p.Wv+=5;}
function scattoGiu(){const p=P2;if(p.cd>0)return;p.scatto=.26;p.cd=.55;p.catena=2;p.vy=-ACQ_SCATTO;p.Wv-=7;p.rotola=true;p.anim='';p.animT=9;sfx('throw')||suono(220,.18,'sawtooth',.1,800);vibra(15);$('tScatto').classList.remove('pronto');}
/* sott'acqua Matteo cade da solo: le frecce lo spostano, SALTO nuota su (tenendolo premuto continua), SCATTO lo spara in basso. Il fiato non si consuma */
function nuoto(h,tx){
 const p=P2,vy0=p.vy;p.stanco=0;p.bolla=0;p.bollaUsata=false;p.buf=0;p.coyote=0;p.carica=0;p.fermoT=0;p.boomAria=false;p.br=Math.max(0,(p.br||0)-h);p.animT+=h;
 if(!p.inAcqua){p.inAcqua=true;schizzi2(p.x,M.livello,22,'#d8f4ff',6);suono(180,.3,'sine',.1,60);p.vy=Math.max(p.vy,-7);p.vx*=.6;if(!M.iniziato){M.iniziato=true;banner(MONDI[M.i].nome);}}
 if(G.stato==='gioco'){consiglio('nuoto','Sott’acqua Matteo cade da solo. SALTO nuota verso l’alto, SCATTO lo spara in basso: rompe le casse ed elimina pesci e meduse');}
 G.fiatoT=Math.max(0,(G.fiatoT||0)-h);if(G.fiatoT<=0)G.fiato=Math.min(1,(G.fiato||0)+.07*h);
 if(p.scatto>0){p.scatto-=h;p.vy=-ACQ_SCATTO;p.rot+=22*h;for(const dx of[-.35,0,.35]){const q=Math.round(p.x+dx),r=Math.round(p.y-.9);if(cel(q,r)==='C')rompiCassa(q,r);}if(p.scatto<=0)p.vy=-ACQ_CADE*1.3;}
 else{p.vy-=ACQ_G*h;if(p.vy<-ACQ_CADE)p.vy=lerp(p.vy,-ACQ_CADE,1-Math.exp(-h*6));if(IN.salto||tasti.Space)bracciata();if(cel(Math.round(p.x),Math.round(p.y))==='u')p.vy=Math.min(p.vy+20*h,7);}
 p.rotola=p.scatto>0;p.anim='';
 p.vx+=tx*24*h;p.vx*=Math.exp(-(Math.abs(tx)<.1?3:.6)*h);p.vx=clamp(p.vx,-6.5,6.5);
 const vx1=p.vx;p.x+=p.vx*h;p.y+=p.vy*h;p.urtoX=0;urta(p,p.R);
 if(p.urtoX&&Math.abs(vx1)>=3&&[-.4,0,.4].some(d=>cel(Math.round(p.x-p.urtoX*.9),Math.round(p.y+d))==='X'))botto(); /* sott'acqua lo scatto va solo in basso: i muri crepati esplodono nuotandoci contro con slancio, se si è carichi */
 if(p.suolo&&vy0<-12){p.scatto=0;botto();}
 const cx=Math.round(p.x),cy=Math.round(p.y);for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++)if(cel(x,y)==='*'&&distMatteo(x,y)<p.R+.34)colpito2(Math.sign(p.x-x)||1,true);
 if(!M.fondo&&p.y<11&&G.stato==='gioco'){M.fondo=true;avviso('Sei sul fondo: vai a destra e risali!',2400);consiglio('risali','Sei arrivato in fondo! Vai a destra e risali nuotando: tieni premuto SALTO, le correnti ti aiutano');}
 p.Wv+=(-160*p.W-11*p.Wv)*h;p.W=clamp(p.W+p.Wv*h,-.5,.5);p.passi+=Math.abs(p.vx)*h*4.6;p.ultimoSuolo=null;
}
const telaM=(w,h)=>{const k=document.createElement('canvas');k.width=w;k.height=h;return k;},rnMare=s=>{let r=s;return()=>(r=r*16807%2147483647)/2147483647;};
const MARE_L=68,MARE_C={},MARE_PAL=[{base:'#6d5a96',ombra:'#57477f',chiaro:'#8a76b4',crosta:'#ff8a7a',crostaC:'#ffc9ae',linea:'#1f1740'}];
const maschera=(x,y)=>(solidoK(x,y+1)?1:0)|(solidoK(x+1,y)?2:0)|(solidoK(x,y-1)?4:0)|(solidoK(x-1,y)?8:0);
/* mk: quali vicini sono pieni (1 sopra, 2 destra, 4 sotto, 8 sinistra); v variante; pal palette */
function mareTile(mk,v,pal){const k=pal+'_'+mk+'_'+v;if(MARE_C[k])return MARE_C[k];const L=MARE_L,C=telaM(L,L),c=C.getContext('2d'),P=MARE_PAL[pal],su=mk&1,de=mk&2,gi=mk&4,si=mk&8,e=3,x0=si?-12:e,x1=de?L+12:L-e,y0=su?-12:e,y1=gi?L+12:L-e,R=[!su&&!si,!su&&!de,!gi&&!de,!gi&&!si].map(b=>b?16:0),r=rnMare(mk*31+v*7+pal*5+11);
 const via=()=>{c.beginPath();c.moveTo(x0+R[0],y0);c.arcTo(x1,y0,x1,y1,R[1]);c.arcTo(x1,y1,x0,y1,R[2]);c.arcTo(x0,y1,x0,y0,R[3]);c.arcTo(x0,y0,x1,y0,R[0]);c.closePath();};
 c.save();via();c.fillStyle=P.base;c.fill();c.clip();for(let i=0;i<9;i++){c.fillStyle=i%2?P.ombra:P.chiaro;c.beginPath();c.ellipse(r()*L,r()*L,4+r()*9,3+r()*6,r()*3,0,6.3);c.fill();}
 if(!gi){c.fillStyle=P.ombra;c.fillRect(0,L-11,L,11);}
 if(!su){const onda=(a,b)=>{c.beginPath();c.moveTo(-2,-2);c.lineTo(L+2,-2);for(let i=L+2;i>=-2;i-=4)c.lineTo(i,a+b*Math.sin(i/L*12.566));c.closePath();c.fill();};c.fillStyle=P.crosta;onda(16,3);c.fillStyle=P.crostaC;onda(8,2);}
 c.restore();via();c.lineWidth=6;c.strokeStyle=P.linea;c.stroke();return MARE_C[k]=C;}
function mareSpr(n){if(MARE_C[n])return MARE_C[n];const S=120,C=telaM(S,S),c=C.getContext('2d');c.lineCap=c.lineJoin='round';
 if(n==='riccio'){const o='#2a1236';c.translate(60,60);for(const[col,ag]of[[o,7],['#ff5a6e',0]]){c.fillStyle=col;c.beginPath();for(let i=0;i<28;i++){const a=i/28*6.283,q=i%2?30+ag*.5:54+ag*.5;c[i?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q);}c.closePath();c.fill();}c.fillStyle='#7a2a6c';c.strokeStyle=o;c.lineWidth=5;c.beginPath();c.arc(0,0,27,0,6.3);c.fill();c.stroke();c.fillStyle='#fff';[-1,1].forEach(j=>{c.beginPath();c.arc(j*11,-3,7,0,6.3);c.fill();});c.fillStyle=o;[-1,1].forEach(j=>{c.beginPath();c.arc(j*10,-2,3.4,0,6.3);c.fill();});}
 else if(n==='spugna'){const r=rnMare(77),b=[];for(let i=0;i<9;i++)b.push([30+r()*60,70+r()*40,13+r()*11]);for(const[col,ag]of[['#1f4a3a',5],['#7fd6a0',0]]){c.fillStyle=col;for(const q of b){c.beginPath();c.arc(q[0],q[1],q[2]+ag,0,6.3);c.fill();}}c.fillStyle='#2f8a68';for(const q of b){c.beginPath();c.arc(q[0],q[1],3,0,6.3);c.fill();}}
 else{const r=rnMare(n==='corallo0'?23:51),seg=[],ram=(x,y,a,l,d)=>{const X=x+Math.cos(a)*l,Y=y+Math.sin(a)*l;seg.push([x,y,X,Y,d]);if(d>0){ram(X,Y,a-.35-r()*.3,l*.76,d-1);ram(X,Y,a+.35+r()*.3,l*.76,d-1);}};ram(60,118,-1.57,28,3);const col=n==='corallo0'?'#ff6f8f':'#ffb347';for(const[k,ag]of[['#4a1730',7],[col,0]]){c.strokeStyle=k;for(const q of seg){c.lineWidth=q[4]*3+5+ag;c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[2],q[3]);c.stroke();}}}
 return MARE_C[n]=C;}
/* la sabbia dell'utente (parte 1, fondi/sabbia.jpg, cucita ai bordi perché si ripeta senza giunture): una trama ancorata al livello, larga SABBIA_TEX caselle, che riempie le caselle di sabbia della spiaggia e della stanza di Lele.
   In cima il bordo della parte 2 (fondi/sabbia_bordo.png, a metà grandezza, 230 px per casella): prima lo spigolo arrotondato verso il vuoto (a destra a specchio), poi la striscia, presa tra due cuciture di Gemini e cucita ai capi, che si ripete ogni BORDO_W px partendo dall'inizio del tratto, così si attacca all'angolo; il contorno sta BORDO_SU px sotto il bordo dell'immagine */
const SABBIA=new Image();SABBIA.src='assets/fondi/sabbia.jpg';const MAT_SABBIA={tex:SABBIA},SABBIA_TEX=4,SABBIA_LINEA='#2a1608';
const BORDO_SAB={im:new Image()},SPIGOLO_SAB={im:new Image()};BORDO_SAB.im.src='assets/fondi/sabbia_bordo.png';SPIGOLO_SAB.im.src='assets/fondi/sabbia_spigolo.png';const BORDO_A=235,BORDO_W=1240,BORDO_SU=47,BORDO_C=230,SPIGOLO_SU=62,SPIGOLO_N=2; /* lo spigolo arrotondato (parte 3, fondi/sabbia_spigolo.png) l'utente l'ha potuto scaricare solo piccolo: ingrandito 3 volte, tagliato sotto la curva, largo SPIGOLO_N caselle */
function bordoSabbia(c,x,y,a,b,z){const P=BORDO_SAB,Q=SPIGOLO_SAB;if(!P.im.complete||!P.im.width||!Q.im.complete||!Q.im.width)return;const dpr=V.dpr||1,kd=Math.round(z*dpr)/BORDO_C,t=muroPronto(P,kd),H=P.im.height,k=z/BORDO_C,cima=(i,j)=>solidoK(i,j)&&!solidoK(i,j+1);
 let x0=x,x1=x;while(x0>x-60&&cima(x0-1,y))x0--;while(x1<x+60&&cima(x1+1,y))x1++;const vs=!solidoK(x0-1,y),vd=!solidoK(x1+1,y),n=x1-x0+1,ns=vs?Math.min(SPIGOLO_N,Math.floor(n/2)):0,nd=vd?Math.min(SPIGOLO_N,Math.floor(n/2)):0;
 if(x-x0<ns||x1-x<nd){const qd=Math.round(z*dpr)/(Q.im.width/SPIGOLO_N),tq=muroPronto(Q,qd),w=Q.im.width/SPIGOLO_N,i=x-x0<ns?x-x0:x1-x,yy=b-SPIGOLO_SU/w*z,hh=Q.im.height/w*z;c.save();if(x-x0>=ns){c.translate(2*a+z,0);c.scale(-1,1);}c.drawImage(tq,i*w*qd,0,w*qd,Q.im.height*qd,a,yy,z+.6,hh);c.restore();return;}
 const fs=!cima(x0-1,y),fd=!cima(x1+1,y),o=fs?x0+ns:fd?x1-nd+1:0,u=((x-o)*BORDO_C%BORDO_W+BORDO_W)%BORDO_W, /* la striscia parte dallo spigolo; se il tratto non finisce (pavimento della stanza di Lele) è agganciata al livello: misurandola da x-60 ogni casella ripeteva lo stesso pezzo */r=Math.min(BORDO_C,BORDO_W-u),yy=b-BORDO_SU*k,hh=H*k,pz=(u,w,X,W)=>c.drawImage(t,u*kd,0,w*kd,H*kd,X,yy,W,hh);
 pz(BORDO_A+u,r,a,r*k+.6);if(r<BORDO_C)pz(BORDO_A,BORDO_C-r,a+r*k,(BORDO_C-r)*k+.6);}
/* dove la sabbia della spiaggia poggia sulla roccia: invece della riga dritta, la sabbia scende sulla roccia con un bordo ondulato e il contorno scuro (disegnato dopo le caselle, se no la roccia lo copriva; lì non passa nessuno) */
function sabbiaSotto(c,sx,sy,ts){if(M.boss||!SABBIA.complete||!SABBIA.width)return;const y=Math.ceil(M.livello-2);let x0=M.spiaggia;while(x0<M.w&&!(cel(x0,y)==='#'&&cel(x0,y-1)==='#'))x0++;let x1=x0;while(x1+1<M.w&&cel(x1+1,y)==='#'&&cel(x1+1,y-1)==='#')x1++;if(x0>=M.w)return;
 const A=Math.max(sx(x0-.5),-4),B=Math.min(sx(x1+.5)+ts*3,V.W+4),Y=sy(y-.5);if(B<A||Y>V.H+ts||Y<-ts)return;const dpr=V.dpr||1,p=murTex(c,MAT_SABBIA,Math.round(SABBIA_TEX*ts*dpr)),L=sx(x0-.5),
 d=X=>{const u=(X-L)/ts;return ts*Math.min(1,u*2)*(.22+.1*Math.sin(u*2.1+.7)+.07*Math.sin(u*5.3)+.04*Math.sin(u*11.7));},q=new Path2D();q.moveTo(A,Y-1);for(let X=A;X<=B;X+=2)q.lineTo(X,Y+d(X));q.lineTo(B,Y-1);q.closePath();
 p.setTransform(new DOMMatrix([1/dpr,0,0,1/dpr,(-.5-V.cx)*ts+V.W/2,V.H/2-(.5-V.cy)*ts]));c.fillStyle=p;c.fill(q);c.fillStyle='#8a4f1e55';c.save();c.clip(q);c.beginPath();for(let X=A;X<=B;X+=2)c.lineTo(X,Y+d(X)-ts*.1);c.lineTo(B,Y+ts);c.lineTo(A,Y+ts);c.fill();c.restore();
 c.beginPath();for(let X=A;X<=B;X+=2)c.lineTo(X,Y+d(X));c.lineWidth=Math.max(2,ts*.05);c.strokeStyle=SABBIA_LINEA;c.lineJoin='round';c.stroke();}
function sabbia(c,x,y,a,b,z){if(!SABBIA.complete||!SABBIA.width){c.fillStyle='#e9b46a';c.fillRect(a,b,z,z);return;}const ts=V.ts,dpr=V.dpr||1,p=murTex(c,MAT_SABBIA,Math.round(SABBIA_TEX*ts*dpr)),lw=Math.max(2,z*.05);p.setTransform(new DOMMatrix([1/dpr,0,0,1/dpr,(-.5-V.cx)*ts+V.W/2,V.H/2-(.5-V.cy)*ts]));const su=!solidoK(x,y+1),g=su&&(!solidoK(x-1,y)||!solidoK(x+1,y))?.62*z:0; /* nella casella d'angolo la trama parte sotto il bordo, se no riempiva lo smusso */
 c.fillStyle=p;c.fillRect(a,b+g,z+.6,z+.6-g);c.fillStyle=SABBIA_LINEA;if(!solidoK(x-1,y))c.fillRect(a,b+g,lw,z+.6-g);if(!solidoK(x+1,y))c.fillRect(a+z-lw,b+g,lw,z+.6-g);if(su)bordoSabbia(c,x,y,a,b,z);}
/* i muri sott'acqua, col loro materiale (MAT_MARE: tex, n, rientro, px, pezzi B, cella, ap; le funzioni lo prendono come parametro): la roccia dell'utente (un quadrato che si ripete senza giunture, MURO_TEX caselle di lato), ancorata al livello e preparata una volta alla grandezza vera sullo schermo, così resta nitida. Verso l'acqua i bordi li disegna bordiMuri */
const MURO=new Image();MURO.src='assets/fondi/muro_roccia.jpg';const MURO_TEX=6,MURO_RIENTRO=.45,MURO_RACCORDO=.75;
function murTex(c,Mt,n){if(!Mt.pat||Mt.pat.n!==n){let m=Mt.tex;const tela=(w)=>{const k=document.createElement('canvas');k.width=k.height=w;const g=k.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';return k;};while(m.width/2>n){const t=tela(m.width/2);t.getContext('2d').drawImage(m,0,0,t.width,t.width);m=t;}const k=tela(n);k.getContext('2d').drawImage(m,0,0,n,n);Mt.pat={n,p:c.createPattern(k,'repeat')};}return Mt.pat.p;}
function muroMare(c,x,y,a,b,z,Mt){Mt=Mt||MAT_MARE;const ts=V.ts,dpr=V.dpr||1,n=Math.round(Mt.n*ts*dpr);if(!Mt.tex.complete||!Mt.tex.width){c.fillStyle=Mt.fondo;c.fillRect(a,b,z,z);return;}
 const p=murTex(c,Mt,n);
 const ap=Mt.ap,su=ap(x,y+1),gi=ap(x,y-1),si=ap(x-1,y),de=ap(x+1,y);const sp=(u,v)=>Mt.cella(u,v)&&(ap(u,v+1)||ap(u,v-1))&&(ap(u-1,v)||ap(u+1,v));if(sp(x,y)||((su||gi)&&(sp(x-1,y)||sp(x+1,y)))||((si||de)&&(sp(x,y-1)||sp(x,y+1))))return; /* lo spigolo e le caselle accanto le copre il pezzo dello spigolo: il riempimento quadrato spuntava fuori dalla curva */
 const r=ts*Mt.rientro,a2=a+(si?r:0),b2=b+(su?r:0),w2=z-(si?r:0)-(de?r:0),h2=z-(su?r:0)-(gi?r:0);if(w2<=0||h2<=0)return; /* lungo i bordi aperti si ferma prima: la forma la danno le strisce */
 p.setTransform(new DOMMatrix([1/dpr,0,0,1/dpr,(-.5-V.cx)*ts+V.W/2,V.H/2-(.5-V.cy)*ts]));c.fillStyle=p;c.fillRect(a2,b2,w2,h2);
}
/* i bordi dei muri sott'acqua, dai pezzi dell'utente fatti con Gemini, con la stessa roccia di muro_roccia. Ogni spigolo e le strisce accanto vengono dalla stessa immagine e si continuano pixel per pixel: dal pezzo 4 lo spigolo in alto, la cima alla sua sinistra e il fianco sotto; dal pezzo 5 lo spigolo in basso, il sotto alla sua sinistra e il fianco sopra. Le strisce si ripetono ogni P pixel e sono agganciate allo spigolo (a sinistra tutto a specchio): presi da immagini diverse, sovrapposti sembravano due pezzi. Nei file una casella è MURO_PX pixel; bordo è dove sta la linea del bordo, x e y quella degli spigoli */
const MURO_PX=85,MURO_B={cima:{bordo:60,P:500},sotto:{bordo:153,P:500},fianco_su:{bordo:257,P:500},fianco_giu:{bordo:315,P:500},spigolo_su:{x:257,y:60},spigolo_giu:{x:315,y:217}};for(const k in MURO_B){MURO_B[k].im=new Image();}MURO_B.cima.im.src='assets/fondi/muro_cima.png';MURO_B.sotto.im.src='assets/fondi/muro_sotto.png';MURO_B.fianco_su.im.src='assets/fondi/muro_fianco_su.png';MURO_B.fianco_giu.im.src='assets/fondi/muro_fianco_giu.png';MURO_B.spigolo_su.im.src='assets/fondi/muro_spigolo_su.png';MURO_B.spigolo_giu.im.src='assets/fondi/muro_spigolo_giu.png';
const MAT_MARE={id:'_mb',tex:MURO,n:MURO_TEX,rientro:MURO_RIENTRO,raccordo:MURO_RACCORDO,linea:'#121a2e',fondo:'#24344f',px:MURO_PX,B:MURO_B,cella:(x,y)=>muroCella(x,y),ap:(x,y)=>!pieno(cel(x,y))};
function muroCella(x,y){return cel(x,y)==='#'&&!(x<26&&y>=M.livello-3)&&!(y>=M.livello-2&&x>=M.spiaggia)&&!ripianiMare().s.has(x+','+y);}
function muroPronto(p,kd){if(p.t&&p.kd===kd)return p.t;const f=p.im,tela=(a,b)=>{const k=document.createElement('canvas');k.width=Math.max(1,Math.round(a));k.height=Math.max(1,Math.round(b));const g=k.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';return k;};let m=f;while(m.width/2>f.width*kd){const t=tela(m.width/2,m.height/2);t.getContext('2d').drawImage(m,0,0,t.width,t.height);m=t;}const t=tela(f.width*kd,f.height*kd);t.getContext('2d').drawImage(m,0,0,t.width,t.height);p.kd=kd;return p.t=t;}
/* i tratti dritti dei bordi, misurati una volta per mappa: cima e sotto in orizzontale (con gli spigoli alle due estremità, se il muro lì finisce), fianchi in verticale */
function tratti(Mt){if(M[Mt.id])return M[Mt.id];const W=Mt.cella,ap=Mt.ap,T={o:[],v:[]};
 for(const lato of[1,-1])for(let y=Mt.y0||0;y<M.g.length;y++){let x=0;while(x<M.w){if(!(W(x,y)&&ap(x,y+lato))){x++;continue;}const x0=x;while(x<M.w&&W(x,y)&&ap(x,y+lato))x++;let t=3;for(let u=x0;u<x;u++){let n=1;while(n<3&&W(u,y-lato*n))n++;t=Math.min(t,n);}T.o.push({lato,y,x0,x1:x-1,s:ap(x0-1,y),d:ap(x,y),t});}}
 for(const lato of[1,-1])for(let x=0;x<M.w;x++){let y=Mt.y0||0;while(y<M.g.length){if(!(W(x,y)&&ap(x+lato,y))){y++;continue;}const y0=y;while(y<M.g.length&&W(x,y)&&ap(x+lato,y))y++;let t=3;for(let v=y0;v<y;v++){let n=1;while(n<3&&W(x-lato*n,v))n++;t=Math.min(t,n);}T.v.push({lato,x,y0,y1:y-1,su:ap(x,y),giu:ap(x,y0-1),t});}}
 return M[Mt.id]=T;}
function bordiMuri(c,sx,sy,c0,c1,y0,y1,Mt){Mt=Mt||MAT_MARE;const MURO_B=Mt.B,MURO_PX=Mt.px;for(const k in MURO_B){const f=MURO_B[k].im;if(!f.complete||!f.width)return;}const ts=V.ts,dpr=V.dpr||1,k=ts/MURO_PX,kd=k*dpr,T=tratti(Mt),Wv=V.W,Hv=V.H,inf=1e5;
 const im=n=>muroPronto(MURO_B[n],kd);
 /* in orizzontale: X0 è il bordo dove sta lo spigolo, d=1 a destra e -1 a sinistra (a specchio), il tratto va da lo a 0 caselle (verso l'interno è negativo) */
 const oriz=(su,X0,d,Y,lo,sp,tk)=>{const ct=()=>{if(tk<2){c.beginPath();if(su)c.rect(-inf,-inf,2*inf,sy(Y-tk/2)+inf);else c.rect(-inf,sy(Y+tk/2),2*inf,inf);c.clip();}}; /* dove il muro è spesso una casella sola ognuna delle due strisce arriva a metà: se no la polpa sfumata usciva dall'altra parte, o copriva la buccia di là */const S=MURO_B[su?'cima':'sotto'],C=MURO_B[su?'spigolo_su':'spigolo_giu'],ts2=im(su?'cima':'sotto'),tc=im(su?'spigolo_su':'spigolo_giu'),yb=sy(Y)-S.bordo*k,xc=sp?-C.x/MURO_PX:0,Pt=S.P/MURO_PX;
  c.save();c.translate(sx(X0),0);c.scale(d,1);ct();c.beginPath();c.rect(lo*ts,-inf,(xc-lo)*ts,2*inf);c.clip();for(let n=0;xc-n*Pt>lo;n++)c.drawImage(ts2,(xc-(n+1)*Pt)*ts,yb,Pt*ts,ts2.height/dpr);c.restore();
  if(sp){c.save();c.translate(sx(X0),0);c.scale(d,1);ct();c.beginPath();c.rect(lo*ts,-inf,inf,2*inf);c.clip();c.drawImage(tc,-C.x*k,sy(Y)-C.y*k,tc.width/dpr,tc.height/dpr);c.restore();}};
 /* in verticale: dall'alto (Ya, con lo spigolo in alto se sa) e dal basso (Yb, con quello in basso se sb), divisi a metà se ci sono tutti e due */
 const vert=(X0,d,Ya,Yb,sa,sb,tk)=>{const A=MURO_B.fianco_su,B=MURO_B.fianco_giu,ta=im('fianco_su'),tb=im('fianco_giu'),Pa=A.P/MURO_PX,Pb=B.P/MURO_PX,ca=sa?(MURO_B.spigolo_su.im.height-MURO_B.spigolo_su.y)/MURO_PX:0,cb=sb?(MURO_B.spigolo_giu.y)/MURO_PX:0,mid=sa&&sb?(Ya+Yb)/2:sb?Ya:Yb;
  c.save();c.translate(sx(X0),0);c.scale(d,1);if(tk<2){c.beginPath();c.rect(-tk*ts/2,-inf,inf,2*inf);c.clip();}
  if(mid<Ya-ca){const top=sy(Ya-ca),bot=sy(mid);c.save();c.beginPath();c.rect(-inf,top,2*inf,bot-top);c.clip();for(let yy=top;yy<bot;yy+=Pa*ts)c.drawImage(ta,-A.bordo*k,yy,ta.width/dpr,Pa*ts);c.restore();}
  if(mid>Yb+cb){const bot=sy(Yb+cb),top=sy(mid);c.save();c.beginPath();c.rect(-inf,top,2*inf,bot-top);c.clip();for(let yy=bot;yy>top;yy-=Pb*ts)c.drawImage(tb,-B.bordo*k,yy-Pb*ts,tb.width/dpr,Pb*ts);c.restore();}
  c.restore();};
 for(const r of T.v){if(r.x<c0-6||r.x>c1+6||r.y1<y0-6||r.y0>y1+6)continue;vert(r.x+r.lato*.5,r.lato,r.y1+.5,r.y0-.5,r.su,r.giu,r.t);}
 /* gli angoli rientranti (acqua con muro su due lati vicini): un raccordo curvo di roccia, col contorno scuro come nei disegni dell'utente */
 if(Mt.raccordo&&Mt.tex.complete&&Mt.tex.width){const pt=murTex(c,Mt,Math.round(Mt.n*ts*dpr));pt.setTransform(new DOMMatrix([1/dpr,0,0,1/dpr,(-.5-V.cx)*ts+V.W/2,V.H/2-(.5-V.cy)*ts]));const R=ts*Mt.raccordo;
  for(let y=y0;y<=y1;y++)for(let x=c0;x<=c1;x++){if(!Mt.ap(x,y))continue;for(const[dx,dy]of[[-1,1],[1,1],[-1,-1],[1,-1]]){const mc=(u,v)=>Mt.cella(u,v)||cel(u,v)==='C';if(!mc(x+dx,y)||!mc(x,y+dy)||!(Mt.cella(x+dx,y)||Mt.cella(x,y+dy)))continue; /* anche contro le casse, finché ci sono */const X=sx(x+dx*.5),Y=sy(y+dy*.5),ux=-dx,uy=dy; /* l'angolo, e le direzioni verso l'interno della casella d'acqua */
   c.beginPath();c.moveTo(X,Y);c.lineTo(X+ux*R,Y);c.quadraticCurveTo(X,Y,X,Y+uy*R);c.closePath();c.fillStyle=pt;c.fill();
   c.beginPath();c.moveTo(X+ux*R,Y);c.quadraticCurveTo(X,Y,X,Y+uy*R);c.lineWidth=Math.max(1.5,ts*.05);c.strokeStyle=Mt.linea;c.stroke();}}}
 for(const r of T.o){if(r.x1<c0-6||r.x0>c1+6||r.y<y0-6||r.y>y1+6)continue;const su=r.lato>0,Y=r.y+(su?.5:-.5),Xl=r.x0-.5,Xr=r.x1+.5,mid=r.s&&r.d?(Xl+Xr)/2:r.s?Xr:Xl;
  if(r.d||!r.s)oriz(su,Xr,1,Y,mid-Xr,r.d,r.t);if(r.s)oriz(su,Xl,-1,Y,-(mid-Xl),true,r.t);}}
/* il terreno del mondo 1: la buccia d'ananas vista da fuori (parte 1 dell'utente, fondi/terra_buccia.jpg: 4x4 squame, larghe 0,75 caselle: una per casella sembravano enormi, mezza si confondevano con gli ananas del fondale), ritagliata dalla forma del terreno come nelle parti 2-4: spigoli arrotondati (BUCCIA_R), rampe in diagonale, contorno scuro. La trama è ancorata al livello così ogni piano taglia le squame alla stessa altezza dei disegni (BUCCIA_ORG). Sopra, i ciuffi di foglie ritagliati dalle due parti 2 (fondi/terra_ciuffi.png, rettangoli CIUFFI_R in pixel dell'originale; disegnati grandi CIUFFI_Z: a grandezza vera rispetto alle squame erano puntini, a 1/150 troppo grandi; i rettangoli finiscono all'ultima riga piena, e la base affonda un po' nella buccia, se no sembravano staccati). Le piattaforme sospese (-) sono pillole alte una casella */
const BUCCIA=new Image();BUCCIA.src='assets/fondi/terra_buccia.jpg';const MAT_BUCCIA={tex:BUCCIA},BUCCIA_ORG=[.326,.708],BUCCIA_TEX=3,BUCCIA_R=.5,BUCCIA_LINEA='#170c05';
const CIUFFI={im:new Image()};CIUFFI.im.src='assets/fondi/terra_ciuffi.png';const CIUFFI_R=[[0,110,191,104],[199,110,201,104],[408,130,161,84],[577,170,111,44],[696,180,81,34],[785,0,331,214],[1124,80,230,134],[1362,130,151,84],[1521,150,101,64]],CIUFFI_K=1135/1622,CIUFFI_Z=1/240,RADICI_Z=1/240;
/* sotto i bordi le radici e le foglie che pendono, ritagliate dalla parte 3 (paesaggio/buccia_spigolo_giu_originale.jpg, fondi/terra_radici.png a 0,7, RADICI_R in pixel dell'originale, appese per la cima) */
/* le teste verdi (paesaggio/corone_originale.jpg, fondi/terra_corone.png a metà, CORONE_R in pixel dell'originale): una sola, in mezzo, sopra i blocchi e le colonne (cime larghe da 2 a 9 caselle che finiscono sul vuoto ai due lati: i tratti di pavimento tra casse e molle non contano), più grande sui blocchi più larghi; lì niente ciuffi */
const CORONE={im:new Image()};CORONE.im.src='assets/fondi/terra_corone.png';const CORONE_R=[[0,0,641,711],[649,238,411,473],[1068,490,497,221]],CORONE_K=787/1573,CORONE_Z=1/290;
/* le punte (^ e, più scure, quelle che rientrano !): una spina della buccia per casella, dalla parte dell'utente (paesaggio/punte_originale.jpg, fondi/terra_punte.png a metà). La basetta sotto (dalla riga PUNTE_H in giù) all'utente non piaceva: si disegna solo il cono, appoggiato al terreno */
const PUNTE_H=170,PUNTE={im:new Image()};PUNTE.im.src='assets/fondi/terra_punte.png';
const RADICI={im:new Image()};RADICI.im.src='assets/fondi/terra_radici.png';const RADICI_R=[[71,0,175,259],[314,0,195,197],[517,0,155,105],[680,0,206,126]],RADICI_K=626/894;
function terraCella(x,y){const t=y<0?(cel(x,0)==='#'?'#':' '):cel(x,y);return t==='#'||t==='y'||!!(M.fintoSet&&M.fintoSet.has(y+'_'+x));}
function terraBuccia(c,sx,sy,c0,c1,y0,y1){if(!BUCCIA.complete||!BUCCIA.width)return;const ts=V.ts,dpr=V.dpr||1,p=murTex(c,MAT_BUCCIA,Math.round(BUCCIA_TEX*ts*dpr)),r=BUCCIA_R*ts,F=new Path2D(),O=new Path2D(),aria=(x,y)=>!solidoK(x,y),sopra=[],sotto=[];
 p.setTransform(new DOMMatrix([1/dpr,0,0,1/dpr,(BUCCIA_ORG[0]-V.cx)*ts+V.W/2,V.H/2-(BUCCIA_ORG[1]-V.cy)*ts]));
 const tratto=(x1,y1,x2,y2)=>{O.moveTo(x1,y1);O.lineTo(x2,y2);},curva=(x1,y1,cx,cy,x2,y2)=>{O.moveTo(x1,y1);O.arcTo(cx,cy,x2,y2,r);};
 for(let y=Math.max(y0,-20);y<=y1;y++)for(let x=c0;x<=c1;x++){const t=y<0?(cel(x,0)==='#'?'#':' '):cel(x,y),a=sx(x)-ts/2,b=sy(y)-ts/2,d=a+ts,e=b+ts;
  if(t==='%'||t==='/'){const s=t==='%',u=s?a:d,v=s?d:a;F.moveTo(u,b);F.lineTo(v,e);F.lineTo(u,e);F.closePath();tratto(u,b,v,e);if(aria(x+(s?-1:1),y))tratto(u,b,u,e);if(aria(x,y-1))tratto(a,e,d,e);sopra.push([x,y,1]);continue;} /* la rampa: un triangolo, col contorno sulla diagonale */
  if(!terraCella(x,y))continue;
  const su=aria(x,y+1),gi=aria(x,y-1),si=aria(x-1,y),de=aria(x+1,y),tl=su&&si?r:0,tr=su&&de?r:0,br=gi&&de?r:0,bl=gi&&si?r:0;
  F.moveTo(a+tl,b);F.lineTo(d-tr,b);if(tr)F.arcTo(d,b,d,b+tr,tr);F.lineTo(d,e-br);if(br)F.arcTo(d,e,d-br,e,br);F.lineTo(a+bl,e);if(bl)F.arcTo(a,e,a,e-bl,bl);F.lineTo(a,b+tl);if(tl)F.arcTo(a,b,a+tl,b,tl);F.closePath();
  if(su){tratto(a+tl,b,d-tr,b);if(!tl&&!tr)sopra.push([x,y,0]);}if(gi){tratto(a+bl,e,d-br,e);if(!bl&&!br&&y>0)sotto.push([x,y]);}if(si)tratto(a,b+tl,a,e-bl);if(de)tratto(d,b+tr,d,e-br);
  if(tr)curva(d-tr,b,d,b,d,b+tr);if(br)curva(d,e-br,d,e,d-br,e);if(bl)curva(a+bl,e,a,e,a,e-bl);if(tl)curva(a,b+tl,a,b,a+tl,b);}
 /* le piattaforme sospese: pillole alte una casella; contro un muro di terra il capo è dritto ed entra nel muro */
 for(let y=Math.max(y0,0);y<=y1;y++)for(let x=c0-8;x<=c1+8;x++){if(cel(x,y)!=='-'||cel(x-1,y)==='-')continue;let x1=x;while(cel(x1+1,y)==='-')x1++;const ms=solidoK(x-1,y),md=solidoK(x1+1,y),h=ts/2,a=sx(x-.5)-(ms?.3*ts:0),d=sx(x1+.5)+(md?.3*ts:0),b=sy(y+.5),e=b+ts,rs=ms?0:h,rd=md?0:h;
  for(const P of[F,O]){P.moveTo(a+rs,b);P.lineTo(d-rd,b);if(rd)P.arc(d-rd,b+h,h,-Math.PI/2,Math.PI/2);else if(P===F)P.lineTo(d,e);else P.moveTo(d,e);P.lineTo(a+rs,e);if(rs)P.arc(a+rs,b+h,h,Math.PI/2,Math.PI*1.5);else if(P===F)P.lineTo(a,b);if(P===F)P.closePath();}
  for(let u=x+(ms?0:1);u<=x1-(md?0:1);u++){sopra.push([u,y,0]);sotto.push([u,y]);}x=x1;}
 c.fillStyle=p;c.fill(F);c.lineWidth=Math.max(1.5,ts*.035);c.lineCap='round';c.strokeStyle=BUCCIA_LINEA;c.stroke(O);
const coro=new Set();if(CORONE.im.complete&&CORONE.im.width){const kc=CORONE_Z*ts*dpr/CORONE_K,tco=muroPronto(CORONE,kc),k3=CORONE_K*kc,cc=(x,y)=>terraCella(x,y)&&aria(x,y+1);
  for(let y=Math.max(y0-3,0);y<=y1;y++)for(let x=c0-6;x<=c1+6;x++){if(!cc(x,y)||cc(x-1,y))continue;let n=0;while(cc(x+n,y))n++;if(n>=2&&n<=9&&!solidoK(x-1,y)&&!solidoK(x+n,y)){const q=CORONE_R[n<=2?2:n<=4?1:0],w=q[2]*CORONE_Z*ts,hh=q[3]*CORONE_Z*ts;c.drawImage(tco,q[0]*k3,q[1]*k3,q[2]*k3,q[3]*k3,sx(x+(n-1)/2)-w/2,sy(y+.5)-hh+ts*.04,w,hh);for(let u=x;u<x+n;u++)coro.add(u+','+y);}x+=n-1;}}
 /* i ciuffi: su metà delle caselle di cima, scelti dalla posizione (sempre gli stessi); sulle rampe a metà della diagonale */
 if(!CIUFFI.im.complete||!CIUFFI.im.width)return;const kd=CIUFFI_Z*ts*dpr/CIUFFI_K,tc=muroPronto(CIUFFI,kd),k=CIUFFI_K*kd; /* il foglio è a 0,7 dell'originale e si prepara alla grandezza vera sullo schermo */
 for(const[x,y,dg]of sopra){if(coro.has(x+','+y))continue;const h=Math.imul(x*73856093^y*19349663,2654435761)>>>0;if(h%100>=50)continue;const q=CIUFFI_R[(h>>>8)%CIUFFI_R.length],w=q[2]*CIUFFI_Z*ts,hh=q[3]*CIUFFI_Z*ts,X=sx(x+(dg?0:((h>>>16)%100/100-.5)*.5)),Y=(dg?sy(y):sy(y+.5))+ts*.015;
  c.drawImage(tc,q[0]*k,q[1]*k,q[2]*k,q[3]*k,X-w/2,Y-hh,w,hh);}
 if(!RADICI.im.complete||!RADICI.im.width)return;const kr=RADICI_Z*ts*dpr/RADICI_K,tr=muroPronto(RADICI,kr),k2=RADICI_K*kr;
 for(const[x,y]of sotto){const h=Math.imul(x*83492791^y*2971215073,2654435761)>>>0;if(h%100>=30)continue;const q=RADICI_R[(h>>>8)%RADICI_R.length],w=q[2]*RADICI_Z*ts,hh=q[3]*RADICI_Z*ts,X=sx(x+((h>>>16)%100/100-.5)*.5),Y=sy(y-.5)-ts*.02;
  c.drawImage(tr,q[0]*k2,q[1]*k2,q[2]*k2,q[3]*k2,X-w/2,Y,w,hh);}}
/* la sala di Ananassone: pavimento e muri fatti dall'utente con Gemini (paesaggio/sala_pavimento_originale.jpg e sala_muro_originale.jpg, resi ripetibili con un taglio di errore minimo). Il pavimento sta sotto il piano, alto SALA_ALTO caselle, e si ripete in orizzontale; più giù il suo colore. I muri ai lati sono una colonna larga una casella che si ripete in verticale, poggiata sul pavimento. Si riempiono casella per casella con un motivo ancorato alla sala, così i varchi nei muri restano giusti */
const SALA_PAV={im:new Image()},SALA_MURO={im:new Image()};SALA_PAV.im.src='assets/fondi/sala_pavimento.jpg';SALA_MURO.im.src='assets/fondi/sala_muro.jpg';const SALA_ALTO=2.5,SALA_FONDO='#5a3519';
function salaPiano(){if(M._sp!==undefined)return M._sp;const x=Math.floor(M.w/2);let y=0;while(cel(x,y+1)==='#')y++;return M._sp=y;}
function salaMotivo(c,P,kd){if(!P.pat||P.pk!==kd){P.pat=c.createPattern(muroPronto(P,kd),'repeat');P.pk=kd;}return P.pat;}
function salaCasella(c,x,y,a,b,z){const ts=V.ts,dpr=V.dpr||1,yp=salaPiano(),muro=y>yp,P=muro?SALA_MURO:SALA_PAV;if(!P.im.complete||!P.im.width)return false;
 if(muro){const kd=ts*dpr/P.im.width,p=salaMotivo(c,P,kd),h=P.im.height*kd/dpr;p.setTransform(new DOMMatrix([1/dpr,0,0,1/dpr,sx2(x-.5),sy2(yp+.5)-h]));c.fillStyle=p;c.fillRect(a,b,z,z);return true;}
 const kd=SALA_ALTO*ts*dpr/P.im.height,p=salaMotivo(c,P,kd),top=sy2(yp+.5);c.fillStyle=SALA_FONDO;c.fillRect(a,b,z,z);p.setTransform(new DOMMatrix([1/dpr,0,0,1/dpr,sx2(-.5),top]));c.fillStyle=p;const y0=Math.max(b,top),y1=Math.min(b+z,top+SALA_ALTO*ts);if(y1>y0)c.fillRect(a,y0,z,y1-y0);return true;}
/* i blocchi che crollano della sala e di tutta la corsa del mondo 1 (x): pietra con l'ananas scolpito, dalla parte 3 dell'utente (paesaggio/sala_blocco_originale.jpg, fondi/sala_blocchi.png a metà): intero, con una crepa appena ci sale Matteo e sbriciolato poco prima di cadere; quando torna, l'ombra è quello intero */
const SALA_BLOC={im:new Image()};SALA_BLOC.im.src='assets/fondi/sala_blocchi.png';
function salaBlocco(c,i,a,b,z){const P=SALA_BLOC;if(!P.im.complete||!P.im.width)return false;const k=P.im.width/1641,kd=z*(V.dpr||1)/(541*k),t=muroPronto(P,kd),q=k*kd;c.drawImage(t,i*547*q,0,541*q,556*q,a,b,z,z*556/541);return true;}
/* la cassa (C) e la molla (B) della sala e di tutta la corsa del mondo 1, dalle parti 4 e 5 dell'utente (paesaggio/sala_cassa_originale.jpg e sala_molla_originale.jpg; fondi/sala_cassa.png e sala_molla.png a 0,4): larghe una casella e appoggiate in fondo alla casella; la molla è schiacciata nel quarto di secondo dopo il salto */
const SALA_CASSA={im:new Image()},SALA_MOLLA={im:new Image()};SALA_CASSA.im.src='assets/fondi/sala_cassa.png';SALA_MOLLA.im.src='assets/fondi/sala_molla.png';SALA_CASSA.W=939;SALA_MOLLA.W=1982;
function salaPezzo(c,P,x,y,w,h,a,b,z){if(!P.im.complete||!P.im.width)return false;const k=P.im.width/P.W,kd=z*(V.dpr||1)/(w*k),t=muroPronto(P,kd),q=k*kd,hh=z*h/w;c.drawImage(t,x*q,y*q,w*q,h*q,a,b+z-hh,z,hh);return true;}
const sx2=x=>(x-V.cx)*V.ts+V.W/2,sy2=y=>V.H/2-(y-V.cy)*V.ts;
/* le grotte dietro le pareti finte, dalla parte 6 dell'utente (paesaggio/grotta_polpa_originale.jpg): un buco scavato nella polpa. Nelle caselle vuote il fondo (fondi/grotta_fondo.jpg, la polpa di prima scurita); intorno, solo nella terra (nelle caselle vuote copriva Matteo, che si disegna prima), una fascia di polpa col bordo scuro e le gocce, larga GROTTA_D caselle e chiusa da un contorno, che compare solo entrando. I pezzi (fondi/grotta_bordi.png a 0,3, GROTTA_P in pixel dell'originale, dove una casella è 500: x, y, larghezza, altezza e il punto dello spigolo o del bordo) sono gli angoli in alto e in basso a sinistra del buco, il soffitto e il pavimento accanto, e le pareti sotto e sopra gli angoli; a destra a specchio. Le strisce sono agganciate agli angoli, come i muri sott'acqua */
const GROTTA={im:new Image()},GROTTA_FONDO=new Image();GROTTA.im.src='assets/fondi/grotta_bordi.png';GROTTA_FONDO.src='assets/fondi/grotta_fondo.jpg';const MAT_GROTTA={tex:GROTTA_FONDO},GROTTA_K=953/3176,GROTTA_D=.62,GROTTA_P={ang_su:[0,0,580,480,330,330],ang_giu:[586,0,580,480,330,150],cielo:[1172,0,500,490,250,330],pavimento:[1678,0,500,490,250,160],lato_su:[2184,0,490,200,330,150],lato_giu:[2680,0,490,200,330,150]};
const vuotoF=(f,x,y)=>x>=f[0]&&x<=f[2]&&y>=f[1]&&y<=f[3]&&!pieno(cel(x,y));
function grottaFondo(c,sx,sy,f){if(!GROTTA_FONDO.complete||!GROTTA_FONDO.width)return false;const ts=V.ts,dpr=V.dpr||1,p=murTex(c,MAT_GROTTA,Math.round(GROTTA_FONDO.width/150*ts*dpr));p.setTransform(new DOMMatrix([1/dpr,0,0,1/dpr,(-.5-V.cx)*ts+V.W/2,V.H/2-(.5-V.cy)*ts]));c.fillStyle=p;
 const r=BUCCIA_R*ts,a=(x,y)=>!solidoK(x,y);c.beginPath();for(let y=f[1];y<=f[3];y++)for(let x=f[0];x<=f[2];x++)if(vuotoF(f,x,y)){const su=a(x,y+1),gi=a(x,y-1),si=a(x-1,y),de=a(x+1,y);c.roundRect(sx(x)-ts/2,sy(y)-ts/2,ts+.8,ts+.8,[su&&si?r:0,su&&de?r:0,gi&&de?r:0,gi&&si?r:0]);}c.fill();return true;} /* con gli spigoli arrotondati come la buccia sopra: se no il loro angolo spuntava fuori dalla curva */
function grottaBordo(c,sx,sy,f,al){if(!GROTTA.im.complete||!GROTTA.im.width)return;const ts=V.ts,dpr=V.dpr||1,k=ts/500,tc=muroPronto(GROTTA,ts*dpr/500/GROTTA_K),kk=ts*dpr/500,inf=1e5,Vd=(x,y)=>vuotoF(f,x,y),S=(x,y)=>solidoK(x,y)&&!Vd(x,y),pz=(n,X,Y)=>{const q=GROTTA_P[n];c.drawImage(tc,q[0]*kk,q[1]*kk,q[2]*kk,q[3]*kk,X,Y,q[2]*k+.7,q[3]*k+.7);}; /* sovrapposti di un pelo, se no tra un pezzo e l'altro restava una riga */
 const Z=new Path2D(),fascia=D=>{const P=new Path2D();for(let y=f[1];y<=f[3];y++)for(let x=f[0];x<=f[2];x++)if(Vd(x,y))P.roundRect(sx(x)-ts/2-D*ts,sy(y)-ts/2-D*ts,ts*(1+2*D),ts*(1+2*D),D*ts);return P;};
 for(let y=f[1]-2;y<=f[3]+2;y++)for(let x=f[0]-2;x<=f[2]+2;x++)if(S(x,y))Z.rect(sx(x)-ts/2,sy(y)-ts/2,ts+.5,ts+.5);
 /* dove la grotta si apre sull'aria aperta la fascia finisce dritta sul bordo della parete finta: se no il contorno girava attorno al vuoto e restava un pezzo nero */
 let A=-inf,Bx=inf,T0=-inf,B0=inf;for(let y=f[1];y<=f[3];y++){if(Vd(f[0],y)&&!solidoK(f[0]-1,y))A=sx(f[0]-.5);if(Vd(f[2],y)&&!solidoK(f[2]+1,y))Bx=sx(f[2]+.5);}for(let x=f[0];x<=f[2];x++){if(Vd(x,f[3])&&!solidoK(x,f[3]+1))T0=sy(f[3]+.5);if(Vd(x,f[1])&&!solidoK(x,f[1]-1))B0=sy(f[1]-.5);}
 c.save();c.beginPath();c.rect(Math.max(A,-1e4),Math.max(T0,-1e4),Math.min(Bx,1e4)-Math.max(A,-1e4),Math.min(B0,1e4)-Math.max(T0,-1e4));c.clip();c.globalAlpha=al;c.clip(Z);c.fillStyle=BUCCIA_LINEA;c.fill(fascia(GROTTA_D+Math.max(1.5,ts*.035)/ts));c.clip(fascia(GROTTA_D));
 /* le pareti: dall'angolo in alto in giù e da quello in basso in su, divise a metà se ci sono tutti e due */
 for(const d of[1,-1])for(let x=f[0];x<=f[2];x++){let y=f[1];while(y<=f[3]){if(!(Vd(x,y)&&S(x-d,y))){y++;continue;}const y0=y;while(y<=f[3]&&Vd(x,y)&&S(x-d,y))y++;const y1=y-1,su=S(x,y1+1),gi=S(x,y0-1),T=sy(y1+.5),B=sy(y0-.5),mid=su&&gi?(T+B)/2:su||!gi?B:T;
  c.save();c.translate(sx(x-d*.5),0);c.scale(d,1);
  const tratto=(A,Bb,v0,dv,n)=>{if(Bb<=A)return;c.save();c.beginPath();c.rect(-inf,A,2*inf,Bb-A);c.clip();for(let v=v0;dv>0?v<Bb:v+200*k>A;v+=dv)pz(n,-330*k,v);c.restore();};
  if(su||!gi)tratto(T,mid,su?T+150*k:T,200*k,'lato_su');if(gi)tratto(mid,B,B-350*k,-200*k,'lato_giu');
  c.restore();}}
 /* soffitto e pavimento, con gli angoli */
 for(const su of[1,-1])for(let y=f[1];y<=f[3];y++){let x=f[0];while(x<=f[2]){if(!(Vd(x,y)&&S(x,y+su))){x++;continue;}const x0=x;while(x<=f[2]&&Vd(x,y)&&S(x,y+su))x++;const x1=x-1,s=S(x0-1,y),d=S(x1+1,y),L=sx(x0-.5),Rr=sx(x1+.5),mid=s&&d?(L+Rr)/2:s?Rr:d?L:Rr,Y=sy(y+su*.5),n=su>0?'cielo':'pavimento',an=su>0?'ang_su':'ang_giu',q=GROTTA_P[n],a=GROTTA_P[an];
  for(const[X0,dd,ang,lun]of[[L,1,s,mid-L],[Rr,-1,d,Rr-mid]]){if(lun<=0)continue;c.save();c.translate(X0,Y);c.scale(dd,1);c.beginPath();c.rect(ang?-inf:0,-inf,(ang?inf:0)+lun+.5,2*inf);c.clip();for(let u=ang?q[4]*k:0;u<lun;u+=q[2]*k)pz(n,u,-q[5]*k);if(ang)pz(an,-a[4]*k,-a[5]*k);c.restore();}}}
 c.restore();}
/* le pareti finte: nel disegno normale si salta quello che c'è sopra di loro (fuori), poi si ridisegna lì con la loro trasparenza (dentro) */
function clipFinti(c,sx,sy,c0,c1,fuori,f){const ts=V.ts;c.beginPath();if(fuori)c.rect(-10,-10,V.W+20,V.H+20);for(const g of f?[f]:M.finti||[]){if(g[2]<c0-1||g[0]>c1+1)continue;for(let y=g[1];y<=g[3];y++)for(let x=g[0];x<=g[2];x++)if(!pieno(cel(x,y))){const m=fuori?0:.6;c.rect(sx(x)-ts/2-m,sy(y)-ts/2-m,ts+2*m,ts+2*m);}}c.clip(fuori?'evenodd':'nonzero');} /* dentro, un pelo più larga: sul taglio tra le due restava una riga chiara */
function mareCasella(c,t,x,y,a,b,z,ts){
 if(t==='#'&&!M.boss&&ripianiMare().s.has(x+','+y))return true; /* i ripiani li disegna ripiani() */
 if(t==='#'&&!M.boss&&x<26&&y>=M.livello-3)return false; /* la terra prima del tuffo è ancora l'isola degli ananas: la disegna il codice del mondo 1 */
 if(t==='#'){if(M.boss||(y>=M.livello-2&&x>=M.spiaggia))sabbia(c,x,y,a,b,z);else muroMare(c,x,y,a,b,z);return true;}
 if(t==='*'){const k=ts*(1.08+.05*Math.sin(G.t*3+x+y));c.drawImage(mareSpr('riccio'),a+ts/2-k/2,b+ts/2-k/2,k,k);return true;}
 if(t==='u'){c.strokeStyle='#ffffff99';c.lineWidth=Math.max(1,ts*.04);for(let i=0;i<2;i++){const u=(G.t*1.4+i*.5+(x*.37+y*.61))%1;c.beginPath();c.arc(a+ts*(.3+.4*Math.sin(x+i*2)*.5+.2),b+ts*(1-u),ts*.07*(1+u),0,6.3);c.stroke();}return true;}
 return false;}
/* la porta alla fine della spiaggia: il portale con l'insegna dell'utente (fondi/baia_portale.png, da paesaggio/baia_portale_originale.jpg, a metà grandezza, PORTALE_PX px per casella) e due battenti (fondi/baia_battente.png, quello a destra a specchio) che girano verso dentro quando Matteo si avvicina, con il buio dietro; da lì si entra da Lele */
const PORTALE={im:new Image()},BATTENTE={im:new Image()};PORTALE.im.src='assets/fondi/baia_portale.png';BATTENTE.im.src='assets/fondi/baia_battente.png';const PORTALE_PX=145,PORTALE_VANO=[182,592,231],PORTALE_GIU=.12;
function portaBaia(c,sx,sy,ts){const X=sx(M.fine),Y=sy(Math.floor(M.livello)+.5);if(X<-ts*5||X>V.W+ts*5||!PORTALE.im.complete||!PORTALE.im.width||!BATTENTE.im.complete)return;const a=M.porta||0,dpr=V.dpr||1,k=ts/PORTALE_PX,iw=PORTALE.im.width,ih=PORTALE.im.height,x0=X-iw/2*k,y0=Y+PORTALE_GIU*ts-ih*k,l=x0+PORTALE_VANO[0]*k,r=x0+PORTALE_VANO[1]*k,t=y0+PORTALE_VANO[2]*k-ts*.05,L=(r-l)/2,b=L*(1-a*.82),bt=muroPronto(BATTENTE,Math.round(L*dpr)/BATTENTE.im.width);
 c.fillStyle='#140c06';c.fillRect(l,t,r-l,Y-t);if(b>1){c.drawImage(bt,l,t,b,Y-t);c.save();c.translate(r,0);c.scale(-1,1);c.drawImage(bt,0,t,b,Y-t);c.restore();}
 c.drawImage(muroPronto(PORTALE,Math.round(k*dpr*1000)/1000),x0,y0,iw*k,ih*k);}
function mareDavanti(c,sx,sy,ts,c0,c1,y0,y1){
 const ys=sy(M.livello),W=V.W;
 if(ys>-14&&ys<V.H+14){const on=x=>ys+Math.sin(x*.03+G.t*2)*3+Math.sin(x*.011-G.t)*2;c.beginPath();c.moveTo(0,on(0));for(let x=8;x<=W+8;x+=8)c.lineTo(x,on(x));c.lineWidth=3;c.strokeStyle='#ffffffd8';c.stroke();c.lineTo(W+8,ys+14);c.lineTo(0,ys+14);c.closePath();c.fillStyle='#ffffff30';c.fill();}
 for(const d of M.alghe){if(d.x<c0-2||d.x>c1+2||d.y<y0-4||d.y>y1+1)continue;const a=sx(d.x),b=sy(d.y+.5);
  if(d.t===0){c.lineCap='round';for(const[k,ag]of[['#123f33',ts*.2],['#3fc27f',ts*.1]]){c.strokeStyle=k;c.lineWidth=ag;for(const j of[-.22,.05,.28]){const h=ts*(1.25+Math.abs(j)*1.5),o=Math.sin(G.t*1.5+d.f+j*5)*ts*.26;c.beginPath();c.moveTo(a+j*ts,b);c.quadraticCurveTo(a+j*ts-o,b-h*.55,a+j*ts+o,b-h);c.stroke();}}}
  else{const k=ts*(d.t===4?1.1:1.45);c.drawImage(mareSpr(['','','corallo0','corallo1','spugna'][d.t]),a-k/2,b-k*.97,k,k);}}
 sp(c,'sign_right',sx(M.spiaggia+3)-ts/2,sy(Math.floor(M.livello)+1)-ts/2,ts,ts);sp(c,'sign_right',sx(9)-ts/2,sy(Math.floor(M.livello)+2)-ts/2,ts,ts);ciuffo(c,sx(5.5),sy(Math.floor(M.livello)+1.5),ts);ciuffo(c,sx(23),sy(Math.floor(M.livello)+1.5),ts);portaBaia(c,sx,sy,ts);
}
const SPIAGGIA=new Image();SPIAGGIA.src='assets/spiaggia_boss.webp'; /* il fondale dell'utente per la stanza del boss del mare: fermo, grande quanto lo schermo, centrato in modo che l'orizzonte stia sopra il pavimento */
/* il fondale sott'acqua dell'utente: una sola immagine alta, dalla superficie alle rovine, che scorre con la profondità. Più larga dello schermo, così non si ripete */
const FONDO_MARE=new Image();FONDO_MARE.src='assets/fondi/mare.jpg';
/* i lati sott'acqua: tre moduli di roccia dell'utente affiancati in un foglio, che si impilano senza giunture; davanti al fondale, dietro al gioco, scorrono un po' più piano del gioco. A destra gli stessi a specchio, in un altro ordine e sfalsati */
const MARE_LATI=new Image();MARE_LATI.src='assets/fondi/mare_lati.png';const LATI_ALTO=14,LATI_PAR=.6,LATI_DENTRO=.25;
/* la cima delle colonne di roccia (dell'utente, sfumata in fondo nella roccia dei moduli): la sua base sta LATI_CIMA caselle sotto il pelo dell'acqua, contando lo scorrimento più lento, così la punta resta sott'acqua anche dalla spiaggia; sotto si impilano i moduli */
const MARE_CIMA=new Image();MARE_CIMA.src='assets/fondi/mare_lati_cima.png';const LATI_CIMA=8.3;
/* il primo piano sott'acqua: coralli, alghe e rocce dell'utente, sopra a tutto, col taglio fuori, scuriti verso il blu (PMARE_BUIO) */
const PRIMO_MARE=new Image();PRIMO_MARE.src='assets/fondi/primo_mare.png';const PRIMO_MARE2=new Image();PRIMO_MARE2.src='assets/fondi/primo_mare_gruppi.png';const PMARE_IM=[PRIMO_MARE,PRIMO_MARE2];
/* x, y, larghezza, altezza, foglio. Nel primo i pezzi singoli, nel secondo i gruppi: mensole di roccia piene di coralli e alghe, più grandi (PMARE_GRUPPO) e scelti una volta su due */
const PMARE_R=[[0,0,450,263,0],[456,0,442,265,0],[904,0,452,175,0],[1362,0,447,213,0],[1815,0,459,206,0],[2280,0,366,199,0],[2652,0,385,239,0],[3043,0,286,233,0]],PMARE_G=[[0,0,631,515,1],[637,0,712,497,1]],PMARE_LUNGO=4.5,PMARE_GRUPPO=5.8,PMARE_SFOCA=2.5,PMARE_BUIO='#0a1a33',PMARE_SCURO=.5,PMARE_SF=new Map();
/* ogni pezzo si prepara una volta alla grandezza vera sullo schermo (w x h in pixel del telefono), rimpicciolito a metà per volta con lo smusso alto (il gioco disegna senza smussare, e rimpicciolito al volo veniva seghettato), poi scurito verso il blu (scuro) e, se serve, sfocato di r pixel con una sfocatura vera, pixel per pixel (rimpicciolire e ingrandire impastava tutto). Si tengono in memoria per pezzo e grandezza */
function sfocaTela(k,r){if(r<1)return;const c=k.getContext('2d'),W=k.width,H=k.height,d=c.getImageData(0,0,W,H),a=d.data,t=new Float32Array(a.length),pre=new Float32Array(a.length);
 for(let i=0;i<a.length;i+=4){const al=a[i+3]/255;pre[i]=a[i]*al;pre[i+1]=a[i+1]*al;pre[i+2]=a[i+2]*al;pre[i+3]=a[i+3];} /* colori premoltiplicati: niente aloni scuri ai bordi */
 const passa=(src,dst,dx,dy,n,m)=>{for(let j=0;j<m;j++){const s=new Float32Array(4);let q=0;for(let k2=-r;k2<=r;k2++){const u=Math.min(n-1,Math.max(0,k2)),o=(dx?(j*W+u):(u*W+j))*4;for(let z=0;z<4;z++)s[z]+=src[o+z];}
  for(let i=0;i<n;i++){const o=(dx?(j*W+i):(i*W+j))*4;for(let z=0;z<4;z++)dst[o+z]=s[z]/(2*r+1);const ia=Math.min(n-1,i+r+1),ib=Math.max(0,i-r),oa=(dx?(j*W+ia):(ia*W+j))*4,ob=(dx?(j*W+ib):(ib*W+j))*4;for(let z=0;z<4;z++)s[z]+=src[oa+z]-src[ob+z];}}};
 for(let v=0;v<2;v++){passa(pre,t,1,0,W,H);passa(t,pre,0,1,H,W);}
 for(let i=0;i<a.length;i+=4){const al=pre[i+3];a[i+3]=al;if(al>0){const f=255/al;a[i]=pre[i]*f;a[i+1]=pre[i+1]*f;a[i+2]=pre[i+2]*f;}}c.putImageData(d,0,0);}
function primoMarePronto(q,w,h,scuro=PMARE_SCURO,r=0){w=Math.round(w);h=Math.round(h);const n=PMARE_IM.indexOf(PMARE_IM[q[4]])+'|'+q[0]+'|'+w+'x'+h+'|'+scuro+'|'+r;if(PMARE_SF.has(n))return PMARE_SF.get(n);const tela=(a,b)=>{const k=document.createElement('canvas');k.width=Math.max(1,Math.round(a));k.height=Math.max(1,Math.round(b));const c=k.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';return k;};
 let m=tela(q[2],q[3]);m.getContext('2d').drawImage(PMARE_IM[q[4]],q[0],q[1],q[2],q[3],0,0,q[2],q[3]);while(m.width/2>w){const t=tela(m.width/2,m.height/2);t.getContext('2d').drawImage(m,0,0,t.width,t.height);m=t;}
 const P=r*3,b=tela(w+P*2,h+P*2),c=b.getContext('2d');c.drawImage(m,P,P,w,h);if(scuro>0){c.globalCompositeOperation='source-atop';c.globalAlpha=scuro;c.fillStyle=PMARE_BUIO;c.fillRect(0,0,b.width,b.height);}sfocaTela(b,r);b.pad=P;PMARE_SF.set(n,b);return b;}
/* i ripiani a mezz'aria sott'acqua, al posto delle caselle: una fila di terra spessa al massimo 2 caselle (RIP_FILE: i muri sono più alti, il pavimento in fondo è di 3), attaccata a un muro di terra (le casse non contano) o sospesa. Si disegnano coi pezzi dell'utente: la punta in fondo e il centro ripetuto fino dentro il muro (a destra a specchio, i sospesi con due punte), senza allungare niente; il piano della roccia sta sulla cima delle caselle */
const RIP_C={im:new Image()},RIP_P={im:new Image()};RIP_C.im.src='assets/fondi/ripiano_centro.png';RIP_P.im.src='assets/fondi/ripiano_punta.png';const RIP_PX=85,RIP_PIANO=225,RIP_FILE=2;
/* sui ripiani corti (fino a RIP_CORTA caselle) restano le mensole del primo piano, che lì quasi non si allungano: t è il piano della roccia nel disegno, tip dove finisce, bot il fondo */
const RIP_VECCHI=[{q:PMARE_R[4],t:55,tip:452,bot:179},{q:PMARE_R[5],t:85,tip:361,bot:188},{q:PMARE_G[0],t:205,tip:608,bot:442},{q:PMARE_G[1],t:235,tip:690,bot:467}],RIP_CORTA=9,RIP_SPESSO=3; /* i ripiani sono a pezzi fatti con Gemini: il centro si ripete, la punta chiude; RIP_PIANO è la riga del piano nei due file, una casella è RIP_PX pixel */
function ripianiMare(){if(M._rip)return M._rip;const s=new Set(),L=[],lv=M.livello,alto=(x,y)=>{let a=y,b=y;while(cel(x,a+1)==='#')a++;while(cel(x,b-1)==='#')b--;return[b,a];},ok=(x,y)=>{if(cel(x,y)!=='#'||(x<26&&y>=lv-3)||(y>=lv-2&&x>=M.spiaggia))return null;const[b,a]=alto(x,y);return a-b<RIP_FILE&&a===y&&b>0?b:null;};
 for(let y=1;y<lv;y++)for(let x=0;x<M.w;x++){if(ok(x,y)===null)continue;let x1=x,bo=y;while(ok(x1+1,y)!==null)x1++;for(let u=x;u<=x1;u++){const b=ok(u,y);bo=Math.min(bo,b);for(let v=b;v<=y;v++)s.add(u+','+v);}
  if(x1>x){const h=Math.imul(x*131+y*977,2654435761)>>>0;L.push({x0:x,x1,y,b:bo,s:cel(x-1,y)==='#',d:cel(x1+1,y)==='#',p:x1-x+1<=RIP_CORTA?RIP_VECCHI[(x1-x>=6?2:0)+((h>>>9)&1)]:null});}else for(let v=bo;v<=y;v++)s.delete(x+','+v);x=x1;}
 return M._rip={s,L};}
function ripiani(c,sx,sy){const ts=V.ts,dpr=V.dpr||1,k=ts/RIP_PX,kd=k*dpr,e=.4;if(!RIP_C.im.complete||!RIP_C.im.width||!RIP_P.im.complete||!RIP_P.im.width)return;const tc=muroPronto(RIP_C,kd),tp=muroPronto(RIP_P,kd),cw=RIP_C.im.width/RIP_PX,pw=RIP_P.im.width/RIP_PX,h=tc.height/dpr;
 /* mezzo ripiano: X0 è dove sta la punta, d il verso (1 punta a destra), lo quanto va indietro (caselle, negativo); la punta in fondo, il centro ripetuto fino a lo */
 const mezzo=(X0,d,lo,Y)=>{const y0=sy(Y)-RIP_PIANO*k;c.save();c.translate(sx(X0),0);c.scale(d,1);c.beginPath();c.rect(lo*ts,-1e5,-lo*ts+ts,2e5);c.clip();for(let n=0;-pw-n*cw>lo;n++)c.drawImage(tc,(-pw-(n+1)*cw)*ts,y0,cw*ts,h);c.drawImage(tp,-pw*ts,y0,pw*ts,h);c.restore();};
 for(const r of ripianiMare().L){const X0=sx(r.x0-.5),X1=sx(r.x1+.5);if(X1<-ts*3||X0>V.W+ts*3)continue;const Y=r.y+.5,yy=sy(Y);if(yy>V.H+ts*4||yy<-ts*8)continue;const a=r.x0-.5,b=r.x1+.5;
  if(r.p){const P=r.p,q=P.q,un=!r.s&&!r.d,Lp=(un?(r.x1-r.x0+1)/2:r.x1-r.x0+1+e)*ts,kx=Lp/P.tip,ky=Math.min(kx,RIP_SPESSO*ts/(P.bot-P.t)),w=q[2]*kx,hh=q[3]*ky,im=primoMarePronto(q,w*dpr,hh*dpr,0),y0=yy-P.t*ky; /* la mensola vecchia */
   const metti=(x,fl)=>{c.save();c.translate(x,0);if(fl)c.scale(-1,1);c.drawImage(im,0,y0,w,hh);c.restore();};if(un){const xc=(X0+X1)/2;metti(xc,0);metti(xc,1);}else if(r.s)metti(X0-e*ts,0);else metti(X1+e*ts,1);continue;}
  if(!r.s&&!r.d){const m=(a+b)/2;mezzo(b,1,m-b,Y);mezzo(a,-1,-(m-a),Y);}else if(r.s)mezzo(b,1,a-e-b,Y);else mezzo(a,-1,-(b+e-a),Y);}}
/* fermi nel livello, sul lato sinistro: il taglio sta sul bordo sinistro del pozzo di sinistra, che sott'acqua è il bordo dello schermo, uno ogni PMARE_OGNI caselle di profondità. Scorrono come i muri: non seguono la telecamera, e se si va lontano non si vedono. Scuriti verso il blu */
const PMARE_OGNI=12;
function primoMare(c,sx,sy){if(!PRIMO_MARE.complete||!PRIMO_MARE.width||!PRIMO_MARE2.complete||!PRIMO_MARE2.width)return;const W=V.W,H=V.H,ts=V.ts,ys=sy(M.livello),dpr=V.dpr||1,pz=pozziMare(),X=sx(pz.c[0]-pz.w/2);if(ys>=H||X>W)return;c.save();c.beginPath();c.rect(0,Math.max(0,ys),W,H);c.clip();
 for(let j=1;j*PMARE_OGNI<M.livello-2;j++){const h=Math.imul(j+11,2654435761)>>>0,gr=j%2,L=gr?PMARE_G:PMARE_R,q=L[(h>>>8)%L.length],k=(gr?PMARE_GRUPPO:PMARE_LUNGO)*ts/(gr?q[2]:450),w=q[2]*k,hh=q[3]*k,Y=sy(M.livello-j*PMARE_OGNI+((h>>>16)%5)-2);
  if(Y+hh<0||Y-hh>H||X+w<0)continue;const im=primoMarePronto(q,w*dpr,hh*dpr,PMARE_SCURO,Math.round(PMARE_SFOCA*dpr)),Pd=im.pad/dpr;c.drawImage(im,X-ts*.15-Pd,Y-hh/2-Pd,w+Pd*2,hh+Pd*2);}
 c.restore();}
/* sott'acqua più è lontano più è scuro (nel livello 1 invece si schiarisce): il fondale velato di FONDO_VELO verso FONDO_BUIO e coi colori al FONDO_SAT, i lati di LATI_VELO. Le tele si preparano una volta sola */
const FONDO_BUIO='#0a1f45',FONDO_VELO=.32,FONDO_SAT=.82,LATI_VELO=.14,VELATI=new Map();
function velato(im,a,sat){if(!im.complete||!im.width)return null;const v=VELATI.get(im)||{},n=a+'|'+sat;VELATI.set(im,v);if(v[n])return v[n];const k=document.createElement('canvas');k.width=im.width;k.height=im.height;const c=k.getContext('2d');c.drawImage(im,0,0);if(sat<1){c.globalCompositeOperation='saturation';c.globalAlpha=1-sat;c.fillStyle='#808080';c.fillRect(0,0,k.width,k.height);}c.globalCompositeOperation='source-atop';c.globalAlpha=a;c.fillStyle=FONDO_BUIO;c.fillRect(0,0,k.width,k.height);c.globalAlpha=1;c.globalCompositeOperation='destination-in';c.drawImage(im,0,0);return v[n]=k;}
function latiMare(c,W,H,ts){const f=velato(MARE_LATI,LATI_VELO,1),g=velato(MARE_CIMA,LATI_VELO,1);if(!f||!g)return;const mw=f.width/3,mh=LATI_ALTO*ts,lw=mh*mw/f.height,x0=-lw*LATI_DENTRO,ch=lw*g.height/g.width;
 for(const d of[0,1]){const yc=H/2-(M.livello-LATI_CIMA-V.cy)*ts*LATI_PAR+(d?ts*.8:0);if(yc>H+ch)continue;c.save();if(d){c.translate(W,0);c.scale(-1,1);}
  c.drawImage(g,x0,yc-ch,lw,ch+1);for(let k=Math.max(0,Math.floor(-yc/mh));yc+k*mh<H;k++){const m=(k+d)%3;c.drawImage(f,m*mw,0,mw,f.height,x0,yc+k*mh,lw,mh+1);}c.restore();}}
/* i pozzi dell'Abisso, misurati sulla mappa poco sotto il pelo dell'acqua: centri (c), larghezza del più largo (w) e quota della galleria in fondo che li unisce (g: sotto, la camera segue Matteo da un pozzo all'altro) */
function pozziMare(){if(M._pz)return M._pz;const r=Math.floor(M.livello)-3,c=[];let w=1,x=0;while(x<M.w){if(pieno(cel(x,r))){x++;continue;}const a=x;while(x<M.w&&!pieno(cel(x,r)))x++;if(x-a>=6){c.push((a+x-1)/2);w=Math.max(w,x-a);}}
 let g=1;if(c.length>1){const m=Math.round((c[0]+c[1])/2);while(g<r&&pieno(cel(m,g)))g++;while(g<r&&!pieno(cel(m,g)))g++;}return M._pz={c:c.length?c:[M.w/2],w,g};}
/* sopra l'acqua, dalla parte della spiaggia: il fondale dell'utente (fondi/spiaggia_fondale.jpg, da paesaggio/spiaggia_fondale_originale.jpg) con la costa e il mare, fermo, largo quanto lo schermo, con l'orizzonte (BAIA_ORIZ dell'altezza) sul pelo dell'acqua del gioco; sopra, se avanza spazio, il colore del cielo in cima */
const FONDO_BAIA=new Image();FONDO_BAIA.src='assets/fondi/spiaggia_fondale.jpg';const BAIA_ORIZ=.772,BAIA_CIELO='rgb(158,187,187)';
function fondaleBaia(c,W,H,ys){const f=FONDO_BAIA;if(!f.complete||!f.width)return false;const k=Math.max(W/f.width,ys/(BAIA_ORIZ*f.height)),w=f.width*k,h=f.height*k,y0=ys-BAIA_ORIZ*h;if(y0>0){c.fillStyle=BAIA_CIELO;c.fillRect(0,0,W,y0+1);}c.drawImage(f,(W-w)/2,y0,w,h);return true;}
function fondaleMare(c){const W=V.W,H=V.H,ts=V.ts,gr=(y0,y1,a,b)=>{const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g;};
 if(M.boss&&SPIAGGIA.complete&&SPIAGGIA.width){const k=Math.max(W/SPIAGGIA.width,H/SPIAGGIA.height),w=SPIAGGIA.width*k,h=SPIAGGIA.height*k;c.drawImage(SPIAGGIA,(W-w)/2,(H-h)/2,w,h);return;}
 if(M.boss){c.fillStyle=gr(0,H*.62,'#6fd0f5','#d9f5ff');c.fillRect(0,0,W,H*.63);c.fillStyle='#fff3bd';c.beginPath();c.arc(W*.8,H*.2,H*.09,0,6.3);c.fill();c.fillStyle='#ffffffd0';[[.2,.17,.11],[.32,.2,.08],[.58,.12,.09]].forEach(q=>{c.beginPath();c.ellipse(W*q[0],H*q[1],W*q[2],H*.035,0,0,6.3);c.fill();});c.fillStyle=gr(H*.62,H*.8,'#3cc0d8','#2a8fc0');c.fillRect(0,H*.62,W,H*.2);c.fillStyle='#f7dea3';c.fillRect(0,H*.8,W,H*.2);return;}
 const lv=M.livello,ys=H/2-(lv-V.cy)*ts,col=y=>{const d=clamp((lv-(V.cy+(H/2-y)/ts))/lv,0,1),q=[70+(10-70)*d,205+(32-205)*d,230+(92-230)*d].map(Math.round);return'rgb('+q+')';};
 if(ys>0){if(V.cx<ACQ_MEZZO)fondale(c,MONDI[0]);else if(!fondaleBaia(c,W,H,ys)){c.fillStyle=gr(0,Math.max(1,ys),'#7fd4f7','#dff6ff');c.fillRect(0,0,W,ys+1);}} /* sopra la pozza si vede ancora il fondale degli ananas */
 if(ys<H){const a=Math.max(0,ys);c.fillStyle=gr(a,H,col(a),col(H));c.fillRect(0,a,W,H-a);
  c.save();c.beginPath();c.rect(0,a,W,H-a);c.clip();const f=velato(FONDO_MARE,FONDO_VELO,FONDO_SAT);if(f){const w=W,h=w*f.height/f.width,dp=clamp((lv-V.cy)/(lv-(H/ts/2-.9)),0,1);c.drawImage(f,-(w-W)*clamp(V.cx/M.w,0,1),(1-dp)*Math.max(0,ys)+dp*(H-h),w,h);}latiMare(c,W,H,ts);
  c.globalAlpha=.5;c.strokeStyle='#e6fbff';c.lineWidth=1.5;for(let i=0;i<22;i++){const y=H-((G.t*(26+i%5*7)+i*97)%(H+20)),x=(i*137.5+Math.sin(G.t+i)*9)%W;if(y>a){c.beginPath();c.arc(x,y,2+i%4,0,6.3);c.stroke();}}c.restore();}}
/* le creature del mare: disegnate nel codice, guardano a destra */
function pesce(c,x,y,s,flip,morto){const o='#3a1d10',t=G.t*10;c.save();c.translate(x,y);if(flip)c.scale(-1,1);if(morto)c.rotate(3.14);c.lineWidth=Math.max(2,s*.11);c.lineJoin='round';c.strokeStyle=o;c.fillStyle='#e0562e';const co=Math.sin(t)*s*.25;c.beginPath();c.moveTo(-s*.75,0);c.lineTo(-s*1.4,-s*.55+co);c.lineTo(-s*1.25,co);c.lineTo(-s*1.4,s*.55+co);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(-s*.25,-s*.55);c.lineTo(s*.05,-s*1.05);c.lineTo(s*.35,-s*.55);c.closePath();c.fill();c.stroke();c.fillStyle='#ffb23e';c.beginPath();c.ellipse(0,0,s,s*.68,0,0,6.3);c.fill();c.stroke();c.save();c.clip();c.fillStyle='#e0562e';[-.45,0].forEach(q=>c.fillRect(q*s,-s,s*.2,s*2));c.restore();c.fillStyle='#fff';c.beginPath();c.arc(s*.52,-s*.14,s*.24,0,6.3);c.fill();c.stroke();c.fillStyle=o;c.beginPath();c.arc(s*.58,-s*.12,s*.1,0,6.3);c.fill();c.beginPath();c.moveTo(s*.26,-s*.46);c.lineTo(s*.8,-s*.28);c.stroke();c.restore();}
function medusa(c,x,y,s,f){const o='#6a1e5f';c.save();c.translate(x,y);c.lineCap='round';for(const[k,w]of[[o,s*.3],['#ffc4e4',s*.15]]){c.strokeStyle=k;c.lineWidth=w;for(let j=-1;j<=1;j+=.667){const a=j*s*.6;c.beginPath();c.moveTo(a,0);c.quadraticCurveTo(a+Math.sin(f*3+j*3)*s*.4,s*.7,a+Math.sin(f*3+j*3+1)*s*.3,s*1.25);c.stroke();}}c.fillStyle='#ff9ed2';c.strokeStyle=o;c.lineWidth=Math.max(2,s*.12);const q=1+Math.sin(f*3)*.07;c.beginPath();c.ellipse(0,0,s*q,s*.88/q,0,3.1416,0);c.closePath();c.fill();c.stroke();c.fillStyle=o;[-1,1].forEach(j=>{c.beginPath();c.arc(j*s*.34,-s*.3,s*.11,0,6.3);c.fill();});c.restore();}
/* st: 0 cammina, 1 colpito, 2 stordito, 3 carica, 4 pugno. s è mezza larghezza del guscio, p i piedi */
function granchio(c,x,p,s,flip,st){const o='#3a1410',t=G.t,pas=st===3?t*26:st===2||st===1?0:t*9,cy=-s*.66+(st===3?Math.sin(t*30)*s*.03:0),lw=Math.max(2,s*.1),col='#e4532f',chiaro='#ff9a63';c.save();c.translate(x,p);if(flip)c.scale(-1,1);c.lineCap=c.lineJoin='round';
 for(const[k,w]of[[o,lw*2.1],[col,lw*.9]]){c.strokeStyle=k;c.lineWidth=w;for(const j of[-1,1])for(let i=0;i<3;i++){const hx=j*s*(.55+i*.14),fx=j*s*(1+i*.2)+Math.sin(pas+i*2+j)*s*.1;c.beginPath();c.moveTo(hx,cy+s*.2);c.quadraticCurveTo(fx+j*s*.1,cy-s*.1,fx,-lw*.3);c.stroke();}}
 c.lineWidth=lw;c.strokeStyle=o;const al=st===4?-s*.9:st===3?-s*.05:st===2?s*.1:-s*.4+Math.sin(t*4)*s*.08;for(const j of[-1,1]){c.fillStyle=col;const X=j*s*1.32,Y=cy+al;c.lineWidth=lw*1.8;c.beginPath();c.moveTo(j*s*.8,cy);c.lineTo(X,Y+s*.35);c.stroke();c.lineWidth=lw;c.beginPath();c.ellipse(X,Y,s*.42,s*.36,0,0,6.3);c.fill();c.stroke();c.beginPath();c.moveTo(X+j*s*.42,Y-s*.05);c.lineTo(X+j*s*.05,Y);c.stroke();}
 c.fillStyle=col;c.beginPath();c.ellipse(0,cy,s,s*.66,0,0,6.3);c.fill();c.stroke();c.fillStyle=chiaro;c.beginPath();c.ellipse(-s*.25,cy-s*.3,s*.34,s*.14,-.2,0,6.3);c.fill();
 for(const j of[-1,1]){const X=j*s*.34,Y=cy-s*1;c.lineWidth=lw*1.3;c.beginPath();c.moveTo(j*s*.3,cy-s*.55);c.lineTo(X,Y);c.stroke();c.lineWidth=lw;c.fillStyle='#fff';c.beginPath();c.arc(X,Y,s*.22,0,6.3);c.fill();c.stroke();c.fillStyle=o;if(st===1||st===2){c.beginPath();c.moveTo(X-s*.12,Y-s*.1);c.lineTo(X+s*.12,Y+s*.1);c.moveTo(X+s*.12,Y-s*.1);c.lineTo(X-s*.12,Y+s*.1);c.stroke();}else{c.beginPath();c.arc(X+s*.06,Y,s*.1,0,6.3);c.fill();}}
 c.lineWidth=lw;c.beginPath();if(st===2||st===1)c.arc(0,cy+s*.35,s*.18,3.5,5.9);else{c.moveTo(-s*.25,cy+s*.2);c.lineTo(s*.25,cy+s*.2);}c.stroke();c.restore();}

/* ---------- BOSS 2D SU PIÙ PIANI: si lancia, sbatte, resta stordito ---------- */
const ARENE=[
 ["#                  #","#                  #","#                  #","#       c  c       #","# c   c x  x c   c #","# x   x      x   x #","#                  #","#      C    C      #","#   B  Cc  cC  B   #","####################","####################"],
 ["                    ","                    ","                    ","                    ","                    ","   c   c            ","                    ","     c              ","                    ","####################","####################"],
];
/* Ananassone con la corazza, disegnato dall'utente: fotogrammi da 231x166 in righe da 8, guarda a destra. 0-3 fermo, 4-11 corre, 9 a testa bassa per la mira, 12-13 pugno, 14-16 stordito, 17-20 cade sconfitto. z è l'altezza da fermo */
/* la pera triste dell'utente, nemico base del mondo 1 (paesaggio/nemico_pera_originale.png): fotogrammi da 70x94 che guardano a destra, centro a 33, piedi a 92. 0-3 cammina, 4 colpita, 5 cade dall'alto, 6 atterrata, 7 si rialza */
const PERA=new Image();PERA.src='assets/nemico_pera.webp';
/* l'uccellino dell'utente, nemico che vola del mondo 1 al posto dell'ape (paesaggio/nemico_uccellino_originale.jpg): fotogrammi da 170x174 che guardano a destra, centrati sul corpo (86, 80), alto 139 in volo. 0-3 sbatte le ali, 4 colpito, 5 cade a pancia in su */
const UCC=new Image();UCC.src='assets/nemico_uccellino.webp';
function disegnaUcc(c,f,x,y,h,flip){if(!UCC.complete)return false;const k=h/139,s=c.imageSmoothingEnabled;c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.imageSmoothingEnabled=false;c.drawImage(UCC,f*170,0,170,174,-86*k,-80*k,170*k,174*k);c.imageSmoothingEnabled=s;c.restore();return true;}
function disegnaPera(c,f,x,y,h,flip){if(!PERA.complete)return false;const k=h/92,s=c.imageSmoothingEnabled;c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.imageSmoothingEnabled=false;c.drawImage(PERA,f*70,0,70,94,-33*k,-92*k,70*k,94*k);c.imageSmoothingEnabled=s;c.restore();return true;}
const ANAS=new Image();ANAS.src='assets/boss_ananassone.webp';const ANW=231,ANH=166,ANX=116,ANY=164;
function disegnaAnanas(c,f,z,verso,piedi){if(!ANAS.complete)return false;const k=z/160,oy=piedi?ANY:90;c.save();if(verso<0)c.scale(-1,1);c.drawImage(ANAS,f%8*ANW,Math.floor(f/8)*ANH,ANW,ANH,-ANX*k,-oy*k,ANW*k,ANH*k);c.restore();return true;}
const BOSPR=[0].map(n=>{const k=document.createElement('canvas');k.width=k.height=240;const c=k.getContext('2d'),o='#2b2b3a';c.lineWidth=10;c.lineJoin='round';c.strokeStyle=o;
 if(n===0)c.drawImage(ANAN,0,0,240,240);
 const ey=150;c.fillStyle='#fff';c.lineWidth=5;[-1,1].forEach(j=>{c.beginPath();c.arc(120+j*30,ey,18,0,6.3);c.fill();c.stroke();c.fillStyle=o;c.beginPath();c.arc(120+j*24,ey+3,8,0,6.3);c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(120+j*52,ey-24);c.lineTo(120+j*10,ey-10);c.lineWidth=8;c.stroke();c.lineWidth=5;});
 return k;});
function costruisciArena(i){
 const r=ARENE[i],H=r.length,W=r[0].length,g=[];for(let y=0;y<H;y++)g.push([]);
 const m={i,g,w:W,alto:H,oggetti:[],nemici:[],colpi:[],spine:{},crolli:{},fine:Infinity,decor:[],posti:[],start:{x:2.5,y:2.97}};
 for(let q=0;q<H;q++)for(let x=0;x<W;x++){const y=H-1-q,t=r[q][x]||' ';if(t==='c'){m.oggetti.push({tipo:'c',x,y,fase:x});g[y][x]=' ';}else g[y][x]=t;if(t==='C')(m.casse=m.casse||[]).push({x,y});if(t==='^'||t==='!')m.spine[y+'_'+x]={t,s:1,fase:x*.8};if(t==='x')m.crolli[y+'_'+x]={x,y,t:-1,via:0,c:t};}
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(g[y][x]===' '&&(g[y-1][x]==='#'||g[y-1][x]==='-'))m.posti.push({x,y});
 const c=BOSS[i];m.boss={cfg:c,sp:BOSPR[i],x:W/2,y:c.terra?(c.r||.95)+1.5:9,r:c.r||.95,vita:c.vita,stato:'fermo',t:2,dx:1,dy:0,vy:0,lampo:0,colpi:0,lung:0};
 if(c.palla){m.boss.x=m.boss.meta=14.5;m.posti=m.posti.filter(q=>q.x<RETE-1);}
 return m;
}
function colpisciBoss(b){
 b.vita--;b.colpi++;b.lampo=.3;G.scossa=riduci?0:.45;schizzi2(b.x,b.y,30,b.cfg.colore,8);sfx('hurt')||suono(70,.5,'sawtooth',.14,40);vibra(90);$('bossHp').style.width=(b.vita/b.cfg.vita*100)+'%';
 if(b.vita<=0){b.tm=G.t;b.lampo=0;b.stato='fermo';b.cammina=0;schizzi2(b.x,b.y,70,'#f6c445',10);G.gettoni+=30;$('gett').textContent=G.gettoni;if(G.stato==='gioco'){G.stato='sconfitto';G.finT=b.cfg.palla?2.3:1.1;}return;}
 b.stato='fermo';b.t=b.cfg.terra?.6:1.5;dopoStordito(b);
}
function dopoStordito(b){
 const c=b.cfg,p=P2;rimettiCasse(b);
 if((c.palla?b.colpi>=3&&!b.cuore:b.colpi%(c.terra?3:2)===1)&&!M.oggetti.some(o=>o.tipo==='H')){b.cuore=true; /* con Lele un cuore solo in tutta la partita, a metà */const q=M.posti[Math.floor(Math.random()*M.posti.length)];M.oggetti.push({tipo:'H',x:q.x,y:q.y,fase:0});}
}
/* dove si fermerà il lancio: stessi controlli dell'urto in passoBoss */
function arrivoBoss(b){if(b.cfg.terra){const l=b.dx>0?M.w-.5-b.r:.5+b.r;let x=b.x;while((l-x)*b.dx>0&&!cassaBoss(Math.round(x+b.dx*b.r)))x+=b.dx*.1;return{x:x+b.dx*b.r,y:b.y};}let x=b.x,y=b.y;for(let i=0;i<400;i++){if(pieno(cel(Math.round(x+b.dx*b.r),Math.round(y+b.dy*b.r)))||pieno(cel(Math.round(x+b.dx*b.r),Math.round(y)))||pieno(cel(Math.round(x),Math.round(y+b.dy*b.r)))||y<b.r+1.5)break;x+=b.dx*.08;y+=b.dy*.08;}return{x:x+b.dx*b.r,y:Math.max(y,b.r+1.5)+b.dy*b.r};}
function raggioBoss(b){let l=1;while(l<40&&!pieno(cel(Math.round(b.x+b.dx*l),Math.round(b.y+b.dy*l))))l+=.25;return l;}
/* le colonne di casse della stanza di Ananassone: alte due, sul pavimento */
const cassaBoss=q=>cel(q,2)==='C'||cel(q,3)==='C';
function rimettiCasse(b){if(!M.casse)return;M.casse.forEach(q=>{if(Math.abs(q.x-b.x)>b.r+.6&&Math.hypot(q.x-P2.x,q.y-P2.y)>1.2)M.g[q.y][q.x]='C';});}
/* il boss sta sempre su un piano: cade finché non tocca terra o un'asse. Con cfg.terra non si stacca mai dal pavimento */
function cadeBoss(b,dt){if(b.cfg.terra){b.y=b.r+1.5;b.vy=0;b.aTerra=true;return;}b.vy-=20*dt;const ny=b.y+b.vy*dt,gx=Math.round(b.x),py=Math.round(ny-b.r),t=cel(gx,py);b.aTerra=false;
 if((t==='#'||t==='-')&&b.vy<=0&&b.y-b.r>=py+.3){b.y=py+.5+b.r;b.vy=0;b.aTerra=true;}else b.y=ny;
 if(b.y<b.r+1.5){b.y=b.r+1.5;b.vy=0;b.aTerra=true;}}
/* tra un attacco e l'altro: Ananassone non si riposa quasi mai */
const pausaBoss=b=>b.cfg.terra?rnd(.3,.7):rnd(1,1.7);
/* il pugno di Ananassone: fa tremare tutto e dall'alto cade una pera nemica in giro per la stanza */
function pugnoBoss(b){G.scossa=riduci?0:.45;vibra(90);sfx('hurt')||suono(70,.5,'sawtooth',.14,40);if(M.nemici.filter(q=>q.vivo).length>=4)return;let x;do{x=2+Math.floor(Math.random()*(M.w-4));}while(cassaBoss(x)||Math.abs(x-P2.x)<1.5);M.nemici.push({tipo:'e',x,y:9,px:x,py:9,vx:Math.sign(P2.x-x)*2.2||2.2,vy:0,vivo:true,fase:x,cade:true});}
/* il boss del mare, disegnato dall'utente (paesaggio/boss_pallavolo_originale.png): 5 fotogrammi da 240x434 che guardano a destra, centro a 120, piedi a 431. 0-1 alza la palla, 2 schiaccia, 3 accovacciato, 4 in guardia */
const BPAL=new Image();BPAL.src='assets/boss_pallavolo.png';
const BRIC=new Image();BRIC.src='assets/boss_ricezione.png'; /* quando riceve (paesaggio/boss_ricezione_originale.png): 3 fotogrammi da 300x339 nell'ordine 5, 6, 7 di disegnaSchiacc, disegnati più piccoli nel foglio dell'utente, quindi ingranditi di 1,32 */
const BSTO=new Image();BSTO.src='assets/boss_stordito.png'; /* stordito (paesaggio/boss_stordito_originale.png): 4 fotogrammi da 260x254 nell'ordine 8-11 di disegnaSchiacc, ingranditi di 1,35: 8 colpito in faccia, 9 si tiene il naso, 10 e 11 intontito, con le stelle già disegnate */
const BSCH=new Image();BSCH.src='assets/boss_schiacciata.png'; /* la schiacciata (paesaggio/boss_schiacciata_originale.png): 4 fotogrammi da 240x254 nell'ordine 12-15 di disegnaSchiacc, ingranditi di 1,45: 12 e 13 carica in volo, 14 colpisce, 15 riatterra */
const BKO=new Image();BKO.src='assets/boss_sconfitto.png'; /* sconfitto (paesaggio/boss_sconfitto_originale.png): 4 fotogrammi da 280x254 nell'ordine 16-19 di disegnaSchiacc, ingranditi di 1,4: 16 cade, 17 a terra sudato, 18 dorme, 19 KO */
const BPAS=new Image();BPAS.src='assets/boss_passi.png'; /* i passettini (paesaggio/boss_passi_originale.png): 4 fotogrammi da 242x254 allineati sulla testa, nell'ordine 20-23 di disegnaSchiacc, ingranditi di 1,3 */
/* prova: nella stanza di Lele Volley Matteo resta in piedi, guarda la rete e usa le pose da pallavolo dell'utente. Con false torna alle animazioni di prima */
const MATTEO_VOLLEY=false,inVolley=()=>MATTEO_VOLLEY&&!!(M&&M.boss&&M.boss.cfg.palla)&&matteoNuovo();
const MV_R=new Image();MV_R.src='assets/matteo_volley_ricezione.png';const MV_S=new Image();MV_S.src='assets/matteo_volley_schiaccia.png';const MV_B=[438,442,489,281,278,282,288]; /* 0-2 bagher, lampo, allungato (celle da 440); 3-6 carica, carica alta, colpo, in guardia (celle da 300); MV_B i piedi */
function disegnaMatteoVolley(c,x,pie,ts,p,n){const t=p.volT||0,mosso=n&&Math.abs(p.vx)>.4,f=t>0?(p.volTipo?(t>.3?4:t>.1?5:n?6:5):(t>.3?0:t>.12?1:2)):!n?(p.vy>0?4:3):6,r=f<3,im=r?MV_R:MV_S,k=ts*(r?.00505:.00758),C=r?440:300,i=r?f:f-3;if(!im.complete)return;c.save();c.translate(x,pie-(mosso?Math.abs(Math.sin(G.t*11))*ts*.06:0));if(mosso)c.rotate(Math.sin(G.t*11)*.05);else if(f===6){const q=Math.sin(G.t*2.6);c.scale(1-.012*q,1+.028*q);}c.drawImage(im,i*C,0,C,572,-C/2*k,-MV_B[f]*k,C*k,572*k);c.restore();}
function disegnaSchiacc(c,f,ts,v){if(f>19){if(!BPAS.complete)return;const k=1.3*3.2*BZ*ts/310,b=[251,254,251,251][f-20];c.save();if(v<0)c.scale(-1,1);c.drawImage(BPAS,(f-20)*242,0,242,254,-121*k,-b*k,242*k,254*k);c.restore();return;}if(f>15){if(!BKO.complete)return;const k=1.4*3.2*BZ*ts/310,b=[222,212,201,220][f-16]; /* b è la riga su cui poggia il corpo, non il punto più basso: un piede o il braccio affondano nel pavimento, così a terra non sembra sospeso */c.save();if(v<0)c.scale(-1,1);c.drawImage(BKO,(f-16)*280,0,280,254,-140*k,-b*k,280*k,254*k);c.restore();return;}if(f>11){if(!BSCH.complete)return;const k=1.45*3.2*BZ*ts/310,b=[248,244,248,252][f-12];c.save();if(v<0)c.scale(-1,1);c.drawImage(BSCH,(f-12)*240,0,240,254,-120*k,-b*k,240*k,254*k);c.restore();return;}if(f>7){if(!BSTO.complete)return;const k=1.35*3.2*BZ*ts/310,b=[245,254,251,254][f-8];c.save();if(v<0)c.scale(-1,1);c.drawImage(BSTO,(f-8)*260,0,260,254,-130*k,-b*k,260*k,254*k);c.restore();return;}if(f>4){if(!BRIC.complete)return;const k=1.32*3.2*BZ*ts/310,b=[282,285,320][f-5];c.save();if(v<0)c.scale(-1,1);c.drawImage(BRIC,(f-5)*300,0,300,339,-150*k,-b*k,300*k,339*k);c.restore();return;}if(!BPAL.complete)return;const k=3.2*BZ*ts/310;c.save();if(v<0)c.scale(-1,1);c.drawImage(BPAL,f*240,0,240,434,-120*k,-426*k,240*k,434*k);c.restore();}
/* Lele Volley batte a pallavolo: alza la palla e la schiaccia dove sta andando Matteo. Rimbalza una volta e sparisce; le casse la fermano */
const PALLA_IMG=new Image();PALLA_IMG.src='assets/palla.png'; /* la palla dell'utente (paesaggio/palla_originale.png), scontornata e quadrata: si fa ruotare dal suo centro */
const BATT_T=1.5,PALLA_G=16,PALLA_Y=1.95,RETE=9.5,CAMPO_S=.5,BZ=2.08/3.2; /* BZ: quanto è rimpicciolito il boss rispetto ai suoi fogli; RETE: Matteo a sinistra, il boss a destra */
/* non sempre addosso a Matteo: una volta su tre sì, le altre a 2-5 caselle da lui, dentro la sua metà campo */
/* allunga il volo quanto basta perché la palla passi sopra la rete e non attraverso */
function alzaTiro(x0,y0,tx,ty,T){const f=(RETE-x0)/(tx-x0);if(!(f>0&&f<1))return T;for(let i=0;i<40;i++){const t=f*T,y=y0+(ty-y0+.5*PALLA_G*T*T)/T*t-.5*PALLA_G*t*t;if(y>=5.5)break;T+=.03;}return T;}
/* quanto dista un punto da Matteo: in palla è un cerchio, in piedi conta tutta la sua altezza, testa compresa. Con sempre vale l'altezza anche durante lo scatto, per ribattere */
function distMatteo(x,y,sempre){const p=P2;if(p.rotola&&!sempre)return Math.hypot(x-p.x,y-p.y);const su=p.y-p.R+1.45;return Math.hypot(x-p.x,y-clamp(y,p.y,su));}
function miraPalla(p){const base=p.x+p.vx*.35,o=Math.random()<.3?0:rnd(2,5)*(Math.random()<.5?-1:1);let t=base+o;if(t<1.5||t>RETE-.6)t=base-o;return clamp(t,1.5,RETE-.6);}
/* la palla tra l'arrivo e la schiacciata, in coordinate del mondo e senza fermarsi: arriva (dall'alto alla prima battuta, o dalla ribattuta di Matteo con la sua velocità) fino al bagher (PALLA_BAG), rimbalza e sale in parabola fino alla mano della schiacciata (dove parte battuta). Prima era disegnata a pezzi dentro la posa: sul bagher si fermava e poi ripartiva */
const PALLA_BAG=1.15;function pallaMano(b){const t=b.t,v=Math.sign(b.dx)||1,P=b.pa||{},fy=b.y-b.r,cx=b.x+v*1.55*BZ,cy=fy+1.68*BZ;
 if(t>PALLA_BAG){const D=Math.max(.05,(P.t0||BATT_T)-PALLA_BAG),s=clamp(1-(t-PALLA_BAG)/D,0,1),s2=s*s,s3=s2*s,h0=2*s3-3*s2+1,h1=s3-2*s2+s,h2=-2*s3+3*s2,h3=s3-s2,p0x=P.x==null?cx+v*.4:P.x,p0y=P.x==null?cy+4.5:P.y,v0x=P.x==null?0:P.vx,v0y=P.x==null?-8:P.vy,v1x=P.x==null?0:P.vx*.2,v1y=P.x==null?-17:-6;return{x:h0*p0x+h1*D*v0x+h2*cx+h3*D*v1x,y:h0*p0y+h1*D*v0y+h2*cy+h3*D*v1y};}
 const D=PALLA_BAG-.5,e=Math.min(D,PALLA_BAG-t),ex=b.x+v*.92,ey=fy+3.4,vx=(ex-cx)/D,vy=(ey-cy+.5*PALLA_G*D*D)/D;return{x:cx+vx*e,y:cy+vy*e-.5*PALLA_G*e*e};}
function battuta(b){const p=P2,v=b.dx,sc=b.sc||0,x0=b.x+v*.92,y0=b.y-b.r+3.4,tx=M.tut===2?clamp(p.x+p.vx*.35,1.5,RETE-.6):miraPalla(p),ty=Math.max(p.y,PALLA_Y),T=alzaTiro(x0,y0,tx,ty,clamp(Math.abs(tx-x0)/11,.6,1.1)*(b.forte?.78:1)*(1-.07*sc)),w=velFase(b);M.colpi.push({palla:true,g:PALLA_G*w*w,x:x0,y:y0,vx:(tx-x0)/T*w,vy:(ty-y0+.5*PALLA_G*T*T)/T*w,v:3.2,rot:0,rimb:0,tx,ty,sc});sfx('throw')||suono(240,.16,'square',.1,120);G.scossa=riduci?0:.12;}
/* lo scatto vicino alla palla la ribatte verso il boss: se va a segno costa zero fiato */
/* se Lele riceverà (lo scambio non è finito) la palla va alle sue mani, dove fa il bagher, e la ricezione parte lì: mirata al corpo arrivava prima all'altezza della testa e sembrava prenderla in faccia */
function maniBoss(b){const v=Math.sign(P2.x-b.x)||-1;return{x:b.x+v*1.55*BZ,y:b.y-b.r+1.68*BZ};}
function ribatti(c){const b=M.boss;c.sc=(c.sc||0)+1;const ri=c.sc<=b.cfg.vita-b.vita,m=ri?maniBoss(b):{x:b.x,y:b.y},T=alzaTiro(c.x,c.y,m.x,m.y,clamp(Math.abs(m.x-c.x)/9,.9,1.2));c.rinvio=true;c.rimb=0;c.mani=ri?m:null;{const w=velFase(b);c.g=PALLA_G*w*w;c.vx=(m.x-c.x)/T*w;c.vy=(m.y-c.y+.5*PALLA_G*T*T)/T*w;}c.v=3;G.fiato=Math.min(1,G.fiato+FIATO_SCATTO);G.fiatoT=0;aggFiato();P2.cd=.2;P2.Wv+=6;schizzi2(c.x,c.y,10,'#fff3bd',5);sfx('bump')||suono(520,.12,'square',.1,260);vibra(30);G.scossa=riduci?0:.1;}
/* la palla ribattuta arriva al boss: ogni vita persa allunga lo scambio di una ribattuta (da 1 con tutte le vite a 6 all'ultima); prima di allora la riceve e rilancia */
function palloneAlBoss(b,c){const serve=b.cfg.vita-b.vita;if(c.sc<=serve){b.stato='battuta';b.t=PALLA_BAG+.22;b.pa={x:c.x,y:c.y,vx:c.vx,vy:c.vy,t0:b.t};b.fatto=false;b.ricevuta=false;b.sc=c.sc;b.forte=false;avviso('Scambio '+c.sc+' di '+(serve+1),1200);return;}colpisciBoss(b);if(b.vita>0){b.stato='stordito';b.t=b.cfg.stordito;}if(M.tut===3){M.tut=0;consiglio('lele_3','Colpito! Solo ribattendo la palla con lo SCATTO gli fai male. A ogni vita persa lo scambio si allunga: lui riceve e rilancia, tu continua a ribattere. Se la palla ti tocca senza scatto perdi un cuore.');}}
/* la rete dell'utente (fondi/rete.png, da paesaggio/rete_originale.jpg): il palo e la rete, che nel disegno è vista di fronte; qui si guarda di lato, quindi se ne vede solo una fetta larga RETE_FETTA caselle attorno al palo, alla grandezza vera (schiacciata non si vedeva) */
const RETE_IMG={im:new Image()},RETE_FETTA=1;RETE_IMG.im.src='assets/fondi/rete.png';
function reteVolley(c,sx,sy,ts){const P=RETE_IMG;if(!P.im.complete||!P.im.width)return;const x=sx(RETE),yb=sy(1.5),yt=sy(5)-ts*.15,k=(yb-yt)/P.im.height,dpr=V.dpr||1,t=muroPronto(P,Math.round(k*dpr*1000)/1000),f=t.width/P.im.width,pw=59*k,nw=ts*RETE_FETTA;
 c.drawImage(t,93*f,52*f,nw/k*f,230*f,x-nw/2,yt+52*k,nw,230*k);c.drawImage(t,11*f,0,59*f,P.im.height*f,x-pw/2,yt,pw,yb-yt);}
function passoBoss(dt){
 const b=M.boss,p=P2;if(!b||b.vita<=0)return;if(M.tut===1){M.tut=2;consiglio('lele_1','Lele schiaccia dove vedi il cerchio rosso. Mettiti lì sotto e preparati a ribattere la palla!');return;}b.t-=dt*velFase(b);b.frase=Math.max(0,(b.frase||0)-dt);b.lampo=Math.max(0,b.lampo-dt);
 const dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy)||1;
 if(b.stato==='fermo'){cadeBoss(b,dt);const mx=b.cfg.palla?b.meta-b.x:dx,v=Math.abs(mx)>(b.cfg.palla?.2:.6)&&!(b.cfg.palla&&M.colpi.some(c=>c.rinvio))?Math.sign(mx):0;b.cammina=0;
  if(b.aTerra&&v&&(b.cfg.terra?!cassaBoss(Math.round(b.x+v*(b.r+.15))):!pieno(cel(Math.round(b.x+v*(b.r+.15)),Math.round(b.y))))){b.x=clamp(b.x+v*(b.cfg.terra?3:1.4)*dt*velFase(b),b.cfg.palla?RETE+2:1.5+b.r,M.w-1.5-b.r);b.cammina=v;}
  if(b.t<=0&&b.aTerra&&!(b.cfg.palla&&M.colpi.length)){b.az=(b.az||0)+1;if(b.cfg.palla){b.stato='battuta';b.t=BATT_T;b.pa=null;b.fatto=false;b.ricevuta=false;b.sc=0;b.forte=b.az%3===0;}else if(b.cfg.terra&&b.az%3===0&&b.vita<=b.cfg.vita/2){b.stato='pugno';b.t=.9;b.fatto=false;}else{b.stato='mira';b.t=b.cfg.terra?.8:1.1;}}}
 else if(b.stato==='battuta'){cadeBoss(b,dt);b.dx=Math.sign(dx)||b.dx;if(b.t<PALLA_BAG&&!b.ricevuta){b.ricevuta=true;suono(260,.12,'sine',.1,130);}if(b.t<.5&&!b.fatto){b.fatto=true;battuta(b);}if(b.t<=0){b.stato='fermo';b.t=pausaBoss(b);b.meta=rnd(RETE+2,M.w-1.5-b.r);}}
 else if(b.stato==='pugno'){cadeBoss(b,dt);if(b.t<.45&&!b.fatto){b.fatto=true;pugnoBoss(b);}if(b.t<=0){b.stato='fermo';b.t=pausaBoss(b);}}
 else if(b.stato==='mira'){cadeBoss(b,dt);if(b.t>.25&&b.cfg.terra){b.dx=Math.sign(dx)||b.dx;b.dy=0;}else if(b.t>.25){/* punta ai piedi di Matteo, non al centro: sullo stesso piano il lancio resta dritto invece di finire subito contro terra */const h=Math.max(p.y-p.R+b.r,b.r+1.5)-b.y,a=Math.abs(h)<.3?0:h,l=Math.hypot(dx,a);if(l){b.dx=dx/l;b.dy=a/l;}}b.lung=raggioBoss(b);b.arrivo=arrivoBoss(b);if(b.t<=0){b.stato='carica';b.tc=G.t;sfx('throw')||suono(110,.4,'sawtooth',.1,330);}}
 else if(b.stato==='carica'&&b.cfg.terra){b.x+=b.dx*b.cfg.scatto*dt; /* corre dritto sul pavimento: si ferma contro il muro o sfondando una colonna di casse */
  const q=Math.round(b.x+b.dx*b.r),cs=cassaBoss(q);if(cs)[2,3].forEach(y=>{if(cel(q,y)==='C'){M.g[y][q]=' ';schizzi2(q,y,16,'#c28a48',5);}});
  if(cs||b.x<.5+b.r||b.x>M.w-.5-b.r){b.x=clamp(b.x,.5+b.r,M.w-.5-b.r);b.stato='stordito';b.t=b.cfg.stordito;schizzi2(b.x+b.dx*b.r,b.y,20,'#f6c445',6);suono(90,.35,'square',.13,50);vibra(70);G.scossa=riduci?0:.45;avviso('Stordito: scattagli addosso!',1300);}}
 else if(b.stato==='carica'){b.x+=b.dx*b.cfg.scatto*dt;b.y+=b.dy*b.cfg.scatto*dt;
  const qx=Math.round(b.x+b.dx*b.r),qy=Math.round(b.y+b.dy*b.r);
  if(pieno(cel(qx,qy))||pieno(cel(Math.round(b.x+b.dx*b.r),Math.round(b.y)))||pieno(cel(Math.round(b.x),Math.round(b.y+b.dy*b.r)))||b.y<b.r+1.5){b.stato='stordito';b.t=b.cfg.stordito;b.vy=0;b.x-=b.dx*.3;b.y=Math.max(b.y-b.dy*.3,b.r+1.5);schizzi2(b.x,b.y,20,'#f6c445',6);suono(90,.35,'square',.13,50);vibra(70);G.scossa=riduci?0:.45;avviso('Stordito: scattagli addosso!',1300);}}
 else if(b.stato==='stordito'){ /* cade sul piano sotto, così lo raggiungi */
  cadeBoss(b,dt);
  if(b.t<=0){b.stato='fermo';b.t=pausaBoss(b);dopoStordito(b);if(b.cfg.palla&&b.vita===1&&!b.detta){b.detta=true;b.frase=FRASE_T;b.t=FRASE_T*velFase(b);}}}
 if(G.stato==='gioco'&&distMatteo(b.x,b.y)<p.R+b.r){const nx=Math.sign(dx)||1;
  if(b.stato==='stordito'){if(p.scatto>0){p.scatto=0;p.vx=nx*7;p.vy=5;p.ultimoSuolo=null;p.cd=.25;colpisciBoss(b);}}
  else if(Math.abs(p.vx)>=6.5&&G.carica>=MIN_BOTTO)esplodi();
  else if(p.scatto>0){p.scatto=0;p.vx=nx*7;p.vy=4;p.ultimoSuolo=null;sfx('bump')||suono(1200,.12,'square',.08,800);avviso('Corazza dura! Aspetta che si stordisca',1500);}
  else colpito2(nx);}
}
function disegnaBoss(c,sx,sy,ts){
 const b=M.boss;if(!b||(b.vita<=0&&G.stato!=='sconfitto'&&M.i!==1&&!M.uscita))return;const a=sx(b.x),q=sy(b.y),z=b.r*ts*2.9;if(M.i===1)reteVolley(c,sx,sy,ts);
 /* mentre prende la mira, un cerchio rosso segna il punto dove atterrerà */
 if(b.stato==='mira'&&b.arrivo){const gx=sx(b.arrivo.x),gy=sy(b.arrivo.y),rr=ts*(.5+.06*Math.sin(G.t*12));c.save();c.globalAlpha=.5;c.strokeStyle='#ff3b2e';c.lineWidth=Math.max(2,ts*.1);c.beginPath();c.arc(gx,gy,rr,0,6.3);c.stroke();c.globalAlpha=.18;c.fillStyle='#ff3b2e';c.fill();c.restore();}
 c.save();c.translate(a+(b.stato==='mira'?rnd(-2,2):0),q);
 if(M.i===0&&ANAS.complete){const p=P2,v=b.stato==='carica'||b.stato==='mira'?Math.sign(b.dx)||1:Math.sign(p.x-b.x)||1;
  const f=b.vita<=0?17+Math.min(3,Math.floor((G.t-b.tm)*7)):b.stato==='carica'?4+Math.floor(G.t*26)%8:b.stato==='pugno'?(b.t>.45?12:13):b.stato==='mira'?(b.t>.45?0:9):b.stato==='stordito'?14+Math.floor(G.t*5)%3:b.cammina?4+Math.floor(G.t*10)%8:0;
  c.translate(0,b.r*ts);if(b.lampo>0&&Math.floor(G.t*24)%2)c.globalAlpha=.35;
  /* da fermo una sola posa (la 0, la più dritta): il respiro lo fa il codice, gonfiandolo e sgonfiandolo appena dai piedi */
  if(f===0&&b.vita>0&&(b.stato==='fermo'||(b.stato==='mira'&&b.t>.45))){const r=Math.sin(G.t*2.6);c.scale(1-.012*r,1+.028*r);}
  disegnaAnanas(c,f,z,v,true);c.restore();}
 else if(M.i===1){const v=b.stato==='carica'||b.stato==='mira'||b.stato==='battuta'?Math.sign(b.dx)||1:Math.sign(P2.x-b.x)||1,t=b.t,bt=b.stato==='battuta',corre=b.stato==='carica'||(b.stato==='fermo'&&b.cammina),vel=b.stato==='carica'?22:9;
  const hop=bt?(t>1.02?0:t>.5?Math.sin((1.02-t)/.52*1.57)*3.69:t>.32?3.69:t>.06?3.69*(t-.06)/.26:0):0,el=b.cfg.stordito-t,f=b.vita<=0?16+(G.t-b.tm<.3?0:G.t-b.tm<.8?1:G.t-b.tm<1.5?2:3):b.lampo>0?8:bt?(t>1.2?5:t>1.02?6:t>.86?7:t>.68?12:t>.5?13:t>.32?14:15):b.stato==='stordito'?(el<.16?8:el<.4?9:10+Math.floor((el-.4)*3)%2):corre?20+Math.floor(G.t*9)%4:4; /* riceve col bagher (5, 6), si allunga (7), salta fino alla palla caricando il colpo (12, 13), la colpisce davanti a sé (14), riatterra (15) */
  c.translate(0,b.r*ts-hop*BZ*ts-(corre?Math.abs(Math.sin(G.t*vel))*ts*.04:0));if(b.lampo>0&&Math.floor(G.t*24)%2)c.globalAlpha=.35;
  if(b.vita<=0){}else if(f===10||f===11)c.rotate(Math.sin(G.t*3.5)*.03);else if(corre)c.rotate(Math.sin(G.t*vel)*.025);else if(f===4){const r=Math.sin(G.t*2.6);c.scale(1-.012*r,1+.028*r);}
  disegnaSchiacc(c,f,ts,v);c.restore();if(bt&&!b.fatto){const k=ts*.9,q=pallaMano(b);c.save();c.translate(sx(q.x),sy(q.y));c.rotate(-G.t*8);c.drawImage(PALLA_IMG,-k/2,-k/2,k,k);c.restore();}}
 else{
 if(b.stato==='carica')c.rotate(Math.sin(G.t*30)*.25);else if(b.stato==='stordito')c.rotate(.28*Math.sin(G.t*7));else c.translate(0,Math.sin(G.t*3)*ts*.1);
 if(b.lampo>0&&Math.floor(G.t*24)%2)c.globalAlpha=.35;if(b.stato==='stordito')c.filter='saturate(.45) brightness(1.15)';
 c.drawImage(b.sp,-z/2,-z/2,z,z);c.restore();}
 if(b.stato==='stordito'&&M.i!==1&&!(M.i===0&&ANAS.complete)){c.fillStyle='#f6c445';c.strokeStyle='#2b2b3a';c.lineWidth=2;for(let i=0;i<5;i++){const u=G.t*5+i*1.257,px=a+Math.cos(u)*ts*1.2,py=q-z*.42+Math.sin(u)*ts*.3;c.beginPath();c.arc(px,py,ts*.17,0,6.3);c.fill();c.stroke();}}
}

/* ---------- LA BOMBA: il cibo carica, una caduta alta o uno schianto fanno esplodere ---------- */
const MIN_BOTTO=.25;
function aggBarra(){$('caricaB').style.width=(G.carica*100)+'%';$('carica').classList.toggle('piena',G.carica>=1);const i=icona(G.carica>=MIN_BOTTO?'bomb_active':'bomb');if(i)$('icBomba').src=i;}
function botto(){if(G.carica>=MIN_BOTTO&&G.stato==='gioco')esplodi();}
function esplodi(){
 const f=G.carica;vibra(150);sfx('disappear');suono(70,.6,'sawtooth',.16,30);
 const l=$('lampo');l.classList.add('on');requestAnimationFrame(()=>requestAnimationFrame(()=>l.classList.remove('on')));
 {const p=P2,R=2.5+f*4;G.boom={x:p.x,y:p.y,t:G.t,r:R};
  M.nemici.forEach(n=>{if(n.vivo&&Math.hypot(n.x-p.x,n.y-p.y)<R)uccidi2(n);});M.colpi=M.colpi.filter(q=>Math.hypot(q.x-p.x,q.y-p.y)>=R);
  const q=Math.ceil(R);for(let y=Math.round(p.y)-q;y<=Math.round(p.y)+q;y++)for(let x=Math.round(p.x)-q;x<=Math.round(p.x)+q;x++)if(cel(x,y)==='C'&&Math.hypot(x-p.x,y-p.y)<R)rompiCassa(x,y);else if(cel(x,y)==='X'&&Math.hypot(x-p.x,y-p.y)<R+.6)rompiCrepa(x,y);
  schizzi2(p.x,p.y,50,'#ffb13a',9);schizzi2(p.x,p.y,30,'#d8432e',7);p.vy=Math.max(p.vy,8);p.Wv+=12;p.ultimoSuolo=null;p.inv=Math.max(p.inv,.6);p.boomAria=true;
 const b=M.boss;if(b&&b.vita>0&&!b.cfg.palla&&Math.hypot(b.x-p.x,b.y-p.y)<R+b.r){if(b.stato==='stordito')colpisciBoss(b);else{b.stato='stordito';b.t=b.cfg.stordito;b.vy=0;avviso('Boss stordito: scattagli addosso!',1400);}}
 }
 G.carica=0;aggBarra();
}

/* ---------- GUIDA: cinque pagine con scenette animate ---------- */
const GUIDA=[
 {t:'Nei livelli',c:['Frecce a sinistra: rotoli','Doppia freccia su: salti','Fulmine: scatti e travolgi i nemici'],f:[gFrecce,gSalto,gScatto]},
 {t:'La bolla',c:['Premi di nuovo salto in aria: galleggi','Salto e bolla: arrivi più in alto','Una per salto, e costa fiato'],f:[gBolla,gAlto,gBollaFiato]},
 {t:'Il fiato',c:['Scattare consuma il fiato','Senza fiato si ferma a riposare','La pizza ridà fiato'],f:[gFiatoScatto,gFiatoRiposo,gFiatoPizza]},
 {t:'Mangia e ingrassa',c:['Mangia: ingrassi e ti carichi','Da gonfio, cadi dall\'alto: BOOM','Da gonfio, schiantati veloce: BOOM'],f:[gCibo,gCaduta,gSchianto]},
 {t:'I boss',c:['Carica: saltagli sopra','Dietro le casse: le sfonda e si stordisce','Stordito: scattagli addosso'],f:[gLancio,gSbatte,gColpo]}
];
const GW=300,GH=180,GS=GH-40,GR=19,GZ=.72;
let gPag=0,gDopo=null;
/* Matteo nelle scenette: i fogli nuovi, per gli amici il disegno di prima. riga 0 fermo, 1 cammina, 2 corre, 3 salto */
function gCamm(c,x,y,r,col,riga,verso,W,ang){if(!matteoNuovo())return disegnaCamm(c,x,y,r,col,riga,verso,W,ang);if(riga===0)fermoSpr(c,x,y,r,verso,W,ang);else if(riga===3)saltoSpr(c,x,y,r,[8,1,4,6,7][col]||4,verso,W,ang);else passiSpr(c,x,y,r,riga===2?col%6:6+col%4,verso,W,ang);}
function gPalla(c,x,y,r,rot,W,aTerra){if(!matteoNuovo())return disegnaPalla(c,x,y,r,rot,W,aTerra);gelSpr(c,x,y+r,r,9,1,0,0,0,G.t,null,rot);}
function gGonfio(c,x,y,r,rot){if(!matteoNuovo())return disegnaPalla(c,x,y,r,rot,0,true);gPallaGira(c,x,y+r,r,rot,0);}
/* il cielo e gli ananas della corsa. Con z la scena si allontana, per stare in proporzione con salti alti e boss: il centro resta 0..GW e il pavimento resta in basso */
function gCielo(c){const gr=c.createLinearGradient(0,0,0,GS);gr.addColorStop(0,'#87dcfa');gr.addColorStop(1,'#d0f8ff');c.fillStyle=gr;c.fillRect(0,0,GW,GH);const n=FONDI.cielo_nuvole,p=FONDI.ananas_ponti;if(n&&n.complete&&n.width)c.drawImage(n,0,0,GW,Math.min(60,GW*n.height/n.width));if(p&&p.complete&&p.width){const h=GW*p.height/p.width;c.drawImage(p,0,GS+14-h,GW,h);c.fillStyle='#aee9fb73';c.fillRect(0,0,GW,GS);}}
function gLontano(c,z){c.translate(0,GH*(1-z));c.scale(z,z);c.translate((GW/z-GW)/2,0);}
function gFondo(c,z){gCielo(c);if(z)gLontano(c,z);const m=z?(GW/z-GW)/2:0;for(let x=-m;x<GW+m;x+=40)sp(c,'terrain_sand_block_top',x,GS,41,41);}
/* per disegnare pulsanti e barre a grandezza vera anche nelle scene allontanate */
function gVero(c,f){c.save();c.setTransform(2,0,0,2,0,0);f();c.restore();}
/* i pulsanti nelle scenette: con il testo, o una freccia se d è -1 o 1 */
function gTasto(c,x,y,t,acceso,d){const r=16;c.save();c.translate(x,y);c.fillStyle=acceso?'#1c163acc':'#1c163a59';c.beginPath();if(d)c.roundRect(d<0?-27:-1,-r,28,r*2,d<0?[9,0,0,9]:[0,9,9,0]);else c.arc(0,0,r,0,6.3);c.fill();if(acceso&&!d){c.strokeStyle='#ffd52e';c.lineWidth=2;c.stroke();}c.strokeStyle='#fff';c.lineWidth=1.8;c.lineCap=c.lineJoin='round';c.beginPath();
 if(d){c.translate(d*13,0);c.scale(d,1);c.moveTo(-1,-7);c.lineTo(7,0);c.lineTo(-1,7);c.moveTo(7,0);c.lineTo(-1,0);c.moveTo(-4,0);c.lineTo(-8,0);}
 else if(t==='SALTO'){c.moveTo(-7,0);c.lineTo(0,-7);c.lineTo(7,0);c.moveTo(-5,6);c.lineTo(0,1);c.lineTo(5,6);}
 else{c.moveTo(2,-10);c.lineTo(-6,2);c.lineTo(0,2);c.lineTo(-1,10);c.lineTo(7,-2);c.lineTo(1,-2);c.closePath();}c.stroke();c.restore();}
function gBoom(c,x,y,e,R){if(e<0||e>1)return;disegnaEspl(c,x,y,R,e);c.fillStyle='#d8432e';c.font='400 26px "Bowlby One","Arial Black",sans-serif';c.textAlign='center';c.textBaseline='middle';if(e<.7){c.lineWidth=5;c.strokeStyle='#fff';c.strokeText('BOOM',x,y-34);c.fillText('BOOM',x,y-34);}}
function gBarra(c,v){sp(c,v>=.25?'bomb_active':'bomb',8,6,24,24);c.fillStyle='#fff';c.strokeStyle='#2b2b3a';c.lineWidth=2.5;c.beginPath();c.roundRect(34,12,86,12,6);c.fill();c.stroke();c.fillStyle='#d8432e';c.beginPath();c.roundRect(35,13,84*v,10,5);c.fill();}
function gFrecce(c,t){gFondo(c);const a=t*6.283-.5,v=Math.cos(a);gTasto(c,GW/2-1,36,'',v<0,-1);gTasto(c,GW/2+1,36,'',v>=0,1);const x=GW/2+Math.sin(a)*105;gPalla(c,x,GS-GR,GR,x/GR*.8,0,true);}
function gSalto(c,t){gFondo(c);const x=30+t*250,o=clamp((x-105)/90,0,1),u=4*o*(1-o);sp(c,'spikes',130,GS-41,41,41);gTasto(c,GW/2,30,'SALTO',o>0&&o<.25);
 const g=o>0&&o<1;disegnaPolvere(c,105,GS,70,o/.5);gCamm(c,x,GS-u*62,GR,g?(o<.5?1:3):Math.floor(t*40)%10,g?3:1,1,0,0);}
/* la pera viene incontro, lo scatto la elimina e lascia una pizza, come nel gioco */
function gScatto(c,t){gFondo(c);const col=t>.32&&t<.45,e=(t-.44)/.11;gTasto(c,GW/2,30,'SCATTO',col);
 if(t>.55)c.drawImage(PIZZA,212,GS-42,34,34);
 if(e<1){c.save();if(e>0)c.globalAlpha=1-e*.7;disegnaPera(c,e>0?4:Math.floor(t*16)%4,229,GS,50,true);c.restore();}gBoom2(c,229,GS-22,(t-.44)/.25);
 disegnaFumo(c,84,GS,38,1,(t-.32)/.5);if(t<.32)gCamm(c,30+t*150,GS,GR,Math.floor(t*40)%10,1,1,0,0);else{const x=78+Math.min(1,(t-.32)/.2)*170;gPalla(c,x,GS-GR,GR,x*.09,0,true);}}
/* salta e, a mezz'aria, preme di nuovo */
function gFluttua(c,x,y,s,verso,e){if(matteoNuovo())sedereSpr(c,x,y,GR,s,verso,0);else{gCamm(c,x,y,GR,2,3,verso,0,0);bollaSapone(c,x,y-GR,GR*1.75,e,12);}}
function gBolla(c,t){gFondo(c,GZ);gVero(c,()=>gTasto(c,56,30,'SALTO',(t>.08&&t<.16)||(t>.3&&t<.38)));
 const su=clamp((t-.1)/.25,0,1),giu=clamp((t-.75)/.2,0,1),y=GS-(Math.sin(su*1.5708)*94+clamp((t-.32)/.43,0,1)*46)*(1-giu*giu),dent=t>.32&&t<.75,va=su>0&&giu<1,x=GW/2+(dent?Math.sin(t*90)*1.5:0);
 if(dent)gFluttua(c,x,y,(t-.32)*2.8,1,Math.min(1,(.75-t)/.08));else gCamm(c,x,y,GR,va?2:0,va?3:0,1,0,0);}
function gBollaFiato(c,t){gFondo(c,GZ);const on=t>.3&&t<.72,u=clamp(t/.9,0,1),x=10+u*280,y=GS-Math.sin(u*3.1416)*120;gVero(c,()=>gBarraFiato(c,t<.3?.9:.9-.25*clamp((t-.3)/.08,0,1),false));
 if(on)gFluttua(c,x,y,(t-.3)*2.8,1,Math.min(1,(.72-t)/.08));else gCamm(c,x,y,GR,u>0&&u<1?2:0,u>0&&u<1?3:0,1,0,0);}
/* salto e poi bolla: arriva su un ripiano che col salto da solo non prende */
function gAlto(c,t){gFondo(c,GZ);const ty=17;sp(c,'terrain_sand_horizontal_left',190,ty,41,41);sp(c,'terrain_sand_horizontal_middle',231,ty,41,41);sp(c,'terrain_sand_horizontal_right',272,ty,41,41);
 const u=clamp((t-.08)/.62,0,1),x=40+u*190,y=GS-(GS-ty)*Math.sin(u*1.5708),bol=u>.35&&u<.97,va=u>0&&u<1;gVero(c,()=>gTasto(c,56,30,'SALTO',(u>0&&u<.1)||(u>.35&&u<.45)));
 if(bol)gFluttua(c,x,y,(u-.35)*1.74,1,Math.min(1,(.97-u)/.08));else gCamm(c,x,y,GR,va?2:0,va?3:0,1,0,0);}
function gBoom2(c,x,y,e){if(e<0||e>1)return;c.fillStyle=`rgba(255,255,255,${1-e})`;for(let i=0;i<8;i++){const a=i*.785,r=8+e*30;c.beginPath();c.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,5*(1-e)+1,0,6.3);c.fill();}}
function gCibo(c,t){gFondo(c);const px=[110,170,230],x=30+t*250;let n=0;px.forEach((q,i)=>{if(x<q)c.drawImage(PIZZA,q-17,GS-42,34,34);else n++;});gBarra(c,n/3*.99);const mg=px.some(q=>x>=q&&x<q+16);if(matteoNuovo()&&mg)grassoSpr(c,x,GS,GR,Math.floor(t*40)%4,1,0,0);else if(matteoNuovo()&&n>0)grassoSpr(c,x,GS,GR,[5,4,6][n-1],1,0,Math.sin(x*.12)*.08);else gCamm(c,x,GS,GR,Math.floor(t*40)%10,1,1,0,0);}
/* dopo il BOOM vola, atterra e si sgonfia, come nel gioco */
function gRicade(c,x,boom,verso){if(boom<.9)gCamm(c,x,GS-Math.sin(clamp(boom,0,1)*3.14)*46,GR,boom<.5?1:3,3,verso,0,0);else if(matteoNuovo()&&boom<1.3)grassoSpr(c,x,GS,GR,boom<1.1?7:8,verso,0,0);else gCamm(c,x,GS,GR,0,0,verso,0,0);}
function gCaduta(c,t){gFondo(c,GZ);for(let i=0;i<3;i++)sp(c,'terrain_sand_horizontal_middle',i*41-40,46,41,41);const pr=t<.25?t/.25:1,fall=clamp((t-.25)/.25,0,1),x=20+pr*90,boom=(t-.5)/.32;gVero(c,()=>gBarra(c,boom>=0?0:.9));
 const y=t<.25?46-GR:46-GR+(GS-GR-(46-GR))*fall*fall;if(boom<0)gGonfio(c,x,y,GR,x*.08);else if(boom>.05)gRicade(c,x,boom,1);gBoom(c,x,GS-20,boom,70);}
function gSchianto(c,t){gFondo(c);for(let i=0;i<3;i++)sp(c,'terrain_sand_block_center',GW-40,GS-40*(i+1),41,41);const a=clamp(t/.5,0,1),x=20+a*a*(GW-80),boom=(t-.5)/.32;gBarra(c,boom>=0?0:.9);
 const bx=boom>=0?GW-60-clamp(boom,0,1)*70:x;if(boom<0)gGonfio(c,bx,GS-GR,GR,bx*.09);else gRicade(c,bx,boom,-1);if(boom<0)for(let i=1;i<4;i++){c.strokeStyle='#2b2b3a66';c.lineWidth=2;c.beginPath();c.moveTo(x-GR-i*9,GS-8-i*8);c.lineTo(x-GR-i*20,GS-8-i*8);c.stroke();}gBoom(c,GW-50,GS-24,boom,66);}
function gBarraFiato(c,v,poco){c.fillStyle='#2b2b3a';c.font='800 11px "Baloo 2",sans-serif';c.textAlign='left';c.textBaseline='middle';c.fillText('fiato',8,18);c.fillStyle='#fff';c.strokeStyle='#2b2b3a';c.lineWidth=2.5;c.beginPath();c.roundRect(38,12,92,12,6);c.fill();c.stroke();c.fillStyle=poco?'#d8432e':'#3a9bd8';c.beginPath();c.roundRect(39,13,Math.max(0,90*v),10,5);c.fill();}
function gFiatoScatto(c,t){gFondo(c);const ni=Math.floor(t*3),u=t*3-ni,v=1-.3*(ni+clamp(u/.3,0,1));gBarraFiato(c,v,v<.3);const xs=30+t*230,sc=u<.3;disegnaFumo(c,xs-34,GS,34,1,u/.5);if(sc)gPalla(c,xs,GS-GR,GR,xs*.09,0,true);else gCamm(c,xs,GS,GR,Math.floor(t*40)%10,1,1,0,0);}
function gFiatoRiposo(c,t){gFondo(c);gBarraFiato(c,t>.9?.4:.03,t<=.9);if(matteoNuovo())stancoSpr(c,GW/2,GS,GR,t,1,0);else disegnaCamm(c,GW/2,GS,GR,4+Math.floor(t*12)%2,3,1,0,0);}
function gFiatoPizza(c,t){gFondo(c);const px=[120,200],x=30+t*240;let n=0;px.forEach(q=>{if(x<q)c.drawImage(PIZZA,q-17,GS-42,34,34);else n++;});gBarraFiato(c,.15+n*.25,n===0);const mg=px.some(q=>x>=q&&x<q+24);if(matteoNuovo()&&mg)grassoSpr(c,x,GS,GR,1+Math.floor(t*30)%3,1,0,0);else gCamm(c,x,GS,GR,Math.floor(t*40)%10,1,1,0,0);}
/* la sala del trono, con il pavimento più marrone e Matteo e il boss nelle loro proporzioni vere */
function gStanza(c){if(SALA.complete&&SALA.width){const k=Math.max(GW/SALA.width,GH/SALA.height),w=SALA.width*k,h=SALA.height*k;c.drawImage(SALA,(GW-w)/2,GH-h,w,h);}else gCielo(c);gLontano(c,GZ);const m=(GW/GZ-GW)/2,s=c.imageSmoothingEnabled,im=paesSala()||PAES;c.imageSmoothingEnabled=false;for(let x=-m;x<GW+m;x+=40)c.drawImage(im,PIX.block_top*68,0,68,68,x,GS,41,41);c.imageSmoothingEnabled=s;}
function gCasse(c,x){for(let i=0;i<3;i++)sp(c,'block_exclamation',x,GS-41*(i+1),41,41);}
function gBossS(c,x,f,v){c.save();c.translate(x,GS);disegnaAnanas(c,f,126,v||1,true);c.restore();}
/* prende la mira, il cerchio rosso dice dove arriva, e Matteo gli salta sopra */
function gLancio(c,t){gStanza(c);const mz=t<.3,e=clamp((t-.3)/.35,0,1),x=30+e*240;if(mz){c.save();c.globalAlpha=.5;c.strokeStyle='#ff3b2e';c.lineWidth=4;c.beginPath();c.arc(270,GS-30,20,0,6.3);c.stroke();c.globalAlpha=.18;c.fillStyle='#ff3b2e';c.fill();c.restore();}
 gBossS(c,x+(mz&&t>.15?rnd(-1.5,1.5):0),mz?(t<.15?0:9):e<1?4+Math.floor(t*70)%8:0,1);const j=clamp((t-.33)/.22,0,1),va=j>0&&j<1;gCamm(c,190-j*130,GS-Math.sin(j*3.14)*104,GR,va?2:0,va?3:0,-1,0,0);if(va)gVero(c,()=>gTasto(c,GW-56,30,'SALTO',j<.3));}
/* dietro alle casse: il boss le sfonda e resta stordito */
function gSbatte(c,t){gStanza(c);const e=clamp(t/.3,0,1),x=10+e*145,hit=t>.3;if(!hit)gCasse(c,205);gCamm(c,295,GS,GR,0,0,-1,0,0);gBossS(c,x,hit?14+Math.floor(t*14)%3:4+Math.floor(t*70)%8,1);for(let i=0;i<3;i++)gBoom2(c,225,GS-20-i*41,(t-.3)/.3);}
function gColpo(c,t){gStanza(c);const e=clamp((t-.25)/.2,0,1),x=-30+e*195,hit=t>.45;c.save();if(hit&&t<.6&&Math.floor(t*60)%2)c.globalAlpha=.35;gBossS(c,235,14+Math.floor(t*14)%3,-1);c.restore();gPalla(c,hit?165-(t-.45)*120:x,GS-GR,GR,x*.09,0,true);if(e>0&&!hit)disegnaFumo(c,x-34,GS,38,1,e);gBoom2(c,190,GS-40,(t-.45)/.3);
 gVero(c,()=>{if(!hit)gTasto(c,GW/2,32,'SCATTO',t>.15&&t<.3);c.fillStyle='#fff';c.strokeStyle='#2b2b3a';c.lineWidth=2.5;c.beginPath();c.roundRect(90,8,120,12,6);c.fill();c.stroke();c.fillStyle='#d8432e';c.beginPath();c.roundRect(91,9,118*(hit?2:3)/6,10,5);c.fill();});}
function disegnaGuida(){const r=riduci?.42:null;GUIDA[gPag].f.forEach((f,i)=>{const cv=$('gc'+i),c=cv.getContext('2d');c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,GW,GH);f(c,r===null?((G.t/ (2.8))%1):r);});}
function apriGuida(dopo){gPag=0;gDopo=dopo;G.guida=true;mostra('sGuida');pagGuida();}
function pagGuida(){const g=GUIDA[gPag];$('gTit').textContent=g.t;g.c.forEach((x,i)=>$('gt'+i).textContent=x);$('gNum').textContent=(gPag+1)+' / '+GUIDA.length;$('gAvanti').textContent=gPag<GUIDA.length-1?'Avanti':(gDopo?'Gioca':'Ho capito');}
function chiudiGuida(){G.guida=false;S.guidaVista=4;salva();const d=gDopo;gDopo=null;if(d)d();else mostra('sMenu');}
$('gAvanti').onclick=()=>{if(gPag<GUIDA.length-1){gPag++;pagGuida();}else chiudiGuida();};
$('gSalta').onclick=chiudiGuida;

/* ---------- MAPPA DEL SALENTO: i livelli sono paesi, si sceglie dove andare ---------- */
/* il fondo è la mappa in pixel art dell'utente fatta con Gemini (fondi/mappa_salento.jpg, da paesaggio/mappa_salento_originale.jpg): un Salento più o meno, con la spiaggia sullo Ionio a sinistra e le scogliere sull'Adriatico a destra. I paesi non stanno dove sono davvero, ma più o meno lì, sui prati liberi. Sopra il codice disegna strade, pastiglie (gialle, rosse se battute, grigie col lucchetto se chiuse), paesi, Matteo e le nuvole che passano. I paesi sono ancora quelli provvisori disegnati nel codice (PAESI) */
const LUOGHI=[ /* liv: il livello che si gioca lì (indice di MONDI e BOSS); senza liv è ancora chiuso */
 {nome:'Galugnananas',x:390,y:330,liv:0,dis:'galugnananas'}, /* il paese delle ananas; x e y in pixel della mappa */
 {nome:"Torre dell'Orso",x:1120,y:560,liv:1,dis:'orsoAbisso'},
 {nome:'Otranto',x:1090,y:1150,dis:'otranto'},
 {nome:'Santa Maria di Leuca',x:1040,y:1730,dis:'leuca'},
 {nome:'Gallipoli',x:560,y:1230,dis:'gallipoli'},
];
const CURVE=[.12,-.18,.2,-.16]; /* quanto piega la strada tra un paese e il successivo */
const MAPPA=new Image();MAPPA.src='assets/fondi/mappa_salento.jpg';const MAPPA_W=1493,MAPPA_H=2000,MAPPA_ZOOM=1.15,MAPPA_U=4.5; /* la mappa è un po' più larga dello schermo: si scorre anche di lato. Paesi, pastiglie e Matteo sono grandi in proporzione alla mappa (u = MAPPA_U pixel della mappa), non allo schermo: su uno schermo grande erano giganteschi */
const zoomMappa=()=>Math.max(V.W/MAPPA_W*MAPPA_ZOOM,V.H/MAPPA_H); /* si rifà a ogni fotogramma: se la finestra cambia grandezza la mappa la copre sempre tutta */
/* strade: curve tra un paese e l'altro, misurate per camminarci sopra a velocità costante */
function puntoStrada(i,t){const a=LUOGHI[i],b=LUOGHI[i+1],k=CURVE[i]||0,mx=(a.x+b.x)/2-(b.y-a.y)*k,my=(a.y+b.y)/2+(b.x-a.x)*k,u=1-t;return{x:u*u*a.x+2*u*t*mx+t*t*b.x,y:u*u*a.y+2*u*t*my+t*t*b.y};}
const LSTRADA=LUOGHI.slice(1).map((_,i)=>{let L=0,p=puntoStrada(i,0);for(let s=1;s<=24;s++){const q=puntoStrada(i,s/24);L+=Math.hypot(q.x-p.x,q.y-p.y);p=q;}return L;});
/* le nuvole che passano sopra la mappa: sparse una volta sola, sempre uguali (generatore con seme) */
let semeM=7;const rndM=()=>(semeM=(semeM*16807)%2147483647)/2147483647;
const NUVOLE=[];for(let n=0;n<7;n++)NUVOLE.push({x:rndM()*MAPPA_W,y:rndM()*MAPPA_H,s:.8+rndM()*.6});
/* le miniature dei paesi arrivano da Gemini su fondo magenta: il magenta si toglie una volta sola quando servono (fondi/paese_*.jpg, ritagliate e rimpicciolite dagli originali in paesaggio/) */
/* per ogni miniatura: alta h (in centesimi dello schermo) e il punto del disegno (fx, fy, in frazioni) che va sulla pastiglia: il prato davanti alla porta, la sabbia della spiaggetta */
const PAESE_GAL={im:new Image(),h:46,fx:.5,fy:.65},PAESE_ORSO={im:new Image(),h:42,fx:.35,fy:.66,sfuma:110};PAESE_GAL.im.src='assets/fondi/paese_galugnananas.jpg';PAESE_ORSO.im.src='assets/fondi/paese_orso.jpg';
function miniatura(c,p,x,y,u){const t=senzaMagenta(p.im,p.sfuma);if(!t)return;const h=p.h*u,w=h*t.width/t.height,s=c.imageSmoothingEnabled;c.imageSmoothingEnabled=true;c.drawImage(t,x-w*p.fx,y-h*p.fy,w,h);c.imageSmoothingEnabled=s;}
function senzaMagenta(im,sfuma){if(im._t)return im._t;if(!im.complete||!im.width)return null;const o=document.createElement('canvas');o.width=im.width;o.height=im.height;const q=o.getContext('2d');q.drawImage(im,0,0);let d;try{d=q.getImageData(0,0,o.width,o.height);}catch(e){return im._t=o;}const p=d.data;
 for(let i=0;i<p.length;i+=4){const m=Math.min(p[i],p[i+2])-p[i+1];if(m>20){p[i+3]=Math.round(255*clamp(1-(m-20)/70,0,1));p[i]-=m*.8;p[i+2]-=m*.8;}} /* dove il magenta si mescola al bordo resta un po' di colore, senza la sbavatura rosa */
 if(sfuma){ /* l'acqua si fa trasparente piano piano verso l'esterno (distanza dal fondo, a due passate), così il mare della miniatura continua in quello della mappa; la roccia e la sabbia restano piene */
  const W=o.width,H=o.height,D=new Float32Array(W*H);for(let i=0;i<W*H;i++)D[i]=p[i*4+3]<128?0:1e9;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!D[i])continue;let v=D[i];if(x)v=Math.min(v,D[i-1]+1);if(y)v=Math.min(v,D[i-W]+1);if(x&&y)v=Math.min(v,D[i-W-1]+1.414);if(y&&x<W-1)v=Math.min(v,D[i-W+1]+1.414);if(!x||!y||x===W-1||y===H-1)v=Math.min(v,1);D[i]=v;}
  for(let y=H-1;y>=0;y--)for(let x=W-1;x>=0;x--){const i=y*W+x;let v=D[i];if(x<W-1)v=Math.min(v,D[i+1]+1);if(y<H-1)v=Math.min(v,D[i+W]+1);if(x<W-1&&y<H-1)v=Math.min(v,D[i+W+1]+1.414);if(y<H-1&&x)v=Math.min(v,D[i+W-1]+1.414);D[i]=v;}
  for(let i=0;i<W*H;i++){const j=i*4,acqua=clamp((p[j+2]-p[j]-5)/30,0,1);if(!acqua)continue;const k=clamp(D[i]/sfuma,0,1),a=k*k*(3-2*k);p[j+3]*=1-acqua*(1-a);}} /* solo dove il blu supera il rosso, cioè nell'acqua */
 q.putImageData(d,0,0);return im._t=o;}
const MP={pos:0,meta:0,cx:0,cy:0,libero:0,verso:1,passi:0,dopo:null};
function quiMappa(){return Math.round(MP.pos);}
/* --- disegni dei paesi: u è un centesimo dell'altezza dello schermo, (x,y) il piede del disegno --- */
const INK='#2b2a33';
function forma(c,pts,col,lw){c.beginPath();pts.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.fillStyle=col;c.fill();c.lineWidth=lw;c.strokeStyle=INK;c.stroke();}
function rett(c,x,y,w,h,col,lw){c.fillStyle=col;c.fillRect(x,y,w,h);c.lineWidth=lw;c.strokeStyle=INK;c.strokeRect(x,y,w,h);}
function merli(c,x,y,w,u,n,col,lw){const m=w/(n*2-1);for(let i=0;i<n;i++)rett(c,x+i*2*m,y-u*1.6,m,u*1.6,col,lw);}
function cilindro(c,x,y,w,h,col,ombra,lw){const r=w/2;c.beginPath();c.moveTo(x-r,y-h);c.lineTo(x-r,y);c.ellipse(x,y,r,r*.32,0,Math.PI,0,true);c.lineTo(x+r,y-h);c.closePath();c.fillStyle=col;c.fill();c.save();c.clip();c.fillStyle=ombra;c.fillRect(x+r*.35,y-h,r,h+r);c.restore();c.lineWidth=lw;c.strokeStyle=INK;c.stroke();}
function ombraPaese(c,x,y,w,u){c.fillStyle='#00000030';c.beginPath();c.ellipse(x+u*1.5,y+u*.4,w,w*.22,0,0,7);c.fill();}
const PAESI={
 /* Galugnananas (Galugnano), il paese delle ananas: la miniatura dell'utente fatta con Gemini (castello-ananas, ananas giganti e ponti di corda su un'isoletta di roccia), con il prato davanti alla porta sulla pastiglia */
 galugnananas(c,x,y,u){miniatura(c,PAESE_GAL,x,y+3.6*u,u);},
 /* Torre dell'Orso, il livello del mare: la miniatura dell'utente, una baia a forma di C aperta a destra (roccia chiara, spiaggetta con la rete, l'acqua che esce verso il mare e sfuma in quello della mappa); la pastiglia sta sulla sabbia in basso, verso l'acqua, non sul campo da pallavolo, che copriva */
 orsoAbisso(c,x,y,u){miniatura(c,PAESE_ORSO,x,y+3.6*u,u);},
 lecce(c,x,y,u){const lw=u*.45,P='#f2d79e',S='#d9b06a';ombraPaese(c,x,y,u*22,u);
  forma(c,[[x+14*u,y],[x+18*u,y-2.4*u],[x+18*u,y-14*u],[x+14*u,y-12*u]],S,lw); /* fianco in ombra */
  rett(c,x-14*u,y-12*u,28*u,12*u,P,lw);for(let i=-3;i<=3;i++){if(!i)continue;rett(c,x+i*4*u-.8*u,y-11*u,1.6*u,10*u,'#fbe9c0',lw*.6);}
  c.beginPath();c.moveTo(x-3*u,y);c.lineTo(x-3*u,y-6*u);c.arc(x,y-6*u,3*u,Math.PI,0);c.lineTo(x+3*u,y);c.closePath();c.fillStyle='#6b4a2e';c.fill();c.lineWidth=lw;c.strokeStyle=INK;c.stroke();
  rett(c,x-15*u,y-14*u,30*u,2*u,S,lw);for(let i=0;i<9;i++)rett(c,x-13.6*u+i*3.3*u,y-13.6*u,.8*u,1.2*u,'#fbe9c0',lw*.4);
  rett(c,x-10*u,y-25*u,20*u,11*u,P,lw);
  c.beginPath();c.arc(x,y-19.5*u,4.2*u,0,7);c.fillStyle=S;c.fill();c.stroke();c.beginPath();for(let i=0;i<12;i++){const a=i*Math.PI/6;c.moveTo(x,y-19.5*u);c.lineTo(x+Math.cos(a)*4.2*u,y-19.5*u+Math.sin(a)*4.2*u);}c.lineWidth=lw*.5;c.stroke();c.beginPath();c.arc(x,y-19.5*u,1.4*u,0,7);c.fillStyle='#fbe9c0';c.fill();c.lineWidth=lw;c.stroke();
  forma(c,[[x-11*u,y-25*u],[x-4*u,y-29*u],[x,y-31.5*u],[x+4*u,y-29*u],[x+11*u,y-25*u]],P,lw);c.beginPath();c.arc(x,y-31.8*u,1*u,0,7);c.fillStyle=S;c.fill();c.stroke();
  /* la colonna di Sant'Oronzo */const cx=x+24*u;ombraPaese(c,cx,y,u*4,u);rett(c,cx-3*u,y-4*u,6*u,4*u,S,lw);rett(c,cx-1.2*u,y-27*u,2.4*u,23*u,P,lw);rett(c,cx-2.2*u,y-28.5*u,4.4*u,1.6*u,S,lw);c.beginPath();c.arc(cx,y-30.6*u,1.3*u,0,7);c.fillStyle='#7d8c96';c.fill();c.stroke();rett(c,cx-1*u,y-29.6*u,2*u,1.4*u,'#7d8c96',lw*.6);},
 orso(c,x,y,u){const lw=u*.45,P='#ead29b',S='#c9a565';ombraPaese(c,x,y,u*10,u);
  forma(c,[[x-8*u,y],[x+8*u,y],[x+6*u,y-20*u],[x-6*u,y-20*u]],P,lw);forma(c,[[x+3*u,y],[x+8*u,y],[x+6*u,y-20*u],[x+2.4*u,y-20*u]],S,lw);
  rett(c,x-7.2*u,y-22.5*u,14.4*u,2.5*u,P,lw);merli(c,x-7.2*u,y-22.5*u,14.4*u,u,4,P,lw);
  c.beginPath();c.moveTo(x-1.4*u,y-12*u);c.lineTo(x-1.4*u,y-15*u);c.arc(x,y-15*u,1.4*u,Math.PI,0);c.lineTo(x+1.4*u,y-12*u);c.closePath();c.fillStyle='#3a2c3a';c.fill();c.stroke();
  rett(c,x-2.2*u,y-5*u,4.4*u,5*u,'#6b4a2e',lw);
  /* un ombrellone e una barchetta sulla spiaggia accanto */const bx=x+13*u;c.lineWidth=lw;c.strokeStyle=INK;c.beginPath();c.moveTo(bx,y);c.lineTo(bx,y-8*u);c.stroke();forma(c,[[bx-5*u,y-7*u],[bx,y-10*u],[bx+5*u,y-7*u]],'#e8524a',lw);},
 sorelle(c,x,y,u){const lw=u*.45;for(const[dx,h,w]of[[-5,13,7],[5,10,6]]){const sx=x+dx*u;c.fillStyle='#ffffffaa';c.beginPath();c.ellipse(sx,y,w*u*.9,w*u*.28,0,0,7);c.fill();
  c.beginPath();c.moveTo(sx-w/2*u,y);c.bezierCurveTo(sx-w/2*u,y-h*.6*u,sx-w*.4*u,y-h*u,sx,y-h*u);c.bezierCurveTo(sx+w*.4*u,y-h*u,sx+w/2*u,y-h*.6*u,sx+w/2*u,y);c.closePath();c.fillStyle='#e8c88a';c.fill();c.save();c.clip();c.fillStyle='#c79b5b';c.fillRect(sx+w*.12*u,y-h*u,w*u,h*u);c.restore();c.lineWidth=lw;c.strokeStyle=INK;c.stroke();
  c.beginPath();c.ellipse(sx,y-h*u+.6*u,w*.32*u,1.2*u,0,0,7);c.fillStyle='#6fae3f';c.fill();c.stroke();}},
 otranto(c,x,y,u){const lw=u*.45,P='#dcbc80',S='#b8935a';ombraPaese(c,x,y,u*22,u);
  rett(c,x-15*u,y-11*u,30*u,11*u,P,lw);merli(c,x-15*u,y-11*u,30*u,u,7,P,lw);
  for(const dx of[-15,15]){cilindro(c,x+dx*u,y+.5*u,9*u,15*u,P,S,lw);merli(c,x+dx*u-4.5*u,y-14.5*u,9*u,u,3,P,lw);}
  rett(c,x-4*u,y-17*u,8*u,17*u,P,lw);merli(c,x-4*u,y-17*u,8*u,u,3,P,lw);
  c.beginPath();c.moveTo(x-2.4*u,y);c.lineTo(x-2.4*u,y-5*u);c.arc(x,y-5*u,2.4*u,Math.PI,0);c.lineTo(x+2.4*u,y);c.closePath();c.fillStyle='#3a2c3a';c.fill();c.stroke();
  rett(c,x-.8*u,y-13*u,1.6*u,3*u,'#3a2c3a',lw*.6);
  /* bandiera */c.beginPath();c.moveTo(x,y-18.6*u);c.lineTo(x,y-25*u);c.stroke();const o=Math.sin(G.t*4)*.6*u;forma(c,[[x,y-25*u],[x+5*u,y-24*u+o],[x,y-22*u]],'#e8524a',lw*.7);},
 leuca(c,x,y,u){const lw=u*.45;ombraPaese(c,x,y,u*14,u);
  rett(c,x-11*u,y-7*u,22*u,7*u,'#f4ecd7',lw);forma(c,[[x-12*u,y-7*u],[x-9*u,y-10*u],[x+9*u,y-10*u],[x+12*u,y-7*u]],'#c75d3c',lw);for(const dx of[-7,7])rett(c,x+dx*u-1.2*u,y-5*u,2.4*u,2.6*u,'#5b7fa6',lw*.6);
  forma(c,[[x-3.6*u,y-9*u],[x+3.6*u,y-9*u],[x+2.6*u,y-34*u],[x-2.6*u,y-34*u]],'#fbf8ee',lw);c.fillStyle='#dcd6c4';c.beginPath();c.moveTo(x+1.2*u,y-9*u);c.lineTo(x+3.6*u,y-9*u);c.lineTo(x+2.6*u,y-34*u);c.lineTo(x+1*u,y-34*u);c.fill();for(const k of[16,25])rett(c,x-3.2*u+k*.04*u,y-k*u,6.4*u-k*.08*u,2*u,'#e8524a',lw*.6); /* fianco in ombra e due fasce rosse */
  c.beginPath();c.moveTo(x-3.6*u,y-9*u);c.lineTo(x-2.6*u,y-34*u);c.lineTo(x+2.6*u,y-34*u);c.lineTo(x+3.6*u,y-9*u);c.lineWidth=lw;c.strokeStyle=INK;c.stroke();
  rett(c,x-4*u,y-35.4*u,8*u,1.6*u,INK,lw);const acceso=.5+.5*Math.sin(G.t*3);rett(c,x-2.4*u,y-39.4*u,4.8*u,4*u,`rgb(255,${200+40*acceso|0},${80*acceso|0})`,lw);
  c.beginPath();c.moveTo(x-3*u,y-39.4*u);c.quadraticCurveTo(x,y-43*u,x+3*u,y-39.4*u);c.closePath();c.fillStyle='#e8524a';c.fill();c.stroke();
  c.save();c.globalAlpha=.18+.12*acceso;c.fillStyle='#fff3a0';const a=G.t*1.4,L=26*u;c.beginPath();c.moveTo(x,y-37.4*u);c.lineTo(x+Math.cos(a)*L,y-37.4*u+Math.sin(a)*L*.25-3*u);c.lineTo(x+Math.cos(a)*L,y-37.4*u+Math.sin(a)*L*.25+3*u);c.closePath();c.fill();c.restore();},
 gallipoli(c,x,y,u){const lw=u*.45,P='#dcc08a',S='#b89a62';ombraPaese(c,x,y,u*20,u);
  for(const[dx,h,w]of[[-16,9,7],[-10,12,6],[10,10,7],[16,7,6]])rett(c,x+dx*u-w/2*u,y-h*u,w*u,h*u,'#f7f3ea',lw);
  c.beginPath();c.arc(x-10*u,y-12*u,3*u,Math.PI,0);c.fillStyle='#e9c86a';c.fill();c.lineWidth=lw;c.strokeStyle=INK;c.stroke();
  cilindro(c,x,y+.5*u,18*u,11*u,P,S,lw);merli(c,x-9*u,y-10.5*u,18*u,u,5,P,lw);
  rett(c,x-1.6*u,y-4*u,3.2*u,4*u,'#3a2c3a',lw*.7);for(const dx of[-6,5])rett(c,x+dx*u,y-8*u,1.4*u,2*u,'#3a2c3a',lw*.5);},
};
/* --- il resto della mappa --- */
function pastiglia(c,x,y,u,stato,sel){const lw=u*.45,w=4.6*u,h=2.4*u,col=stato==='chiuso'?'#a7a7ad':stato==='fatto'?'#e8524a':'#f6c445';
 c.fillStyle=INK;c.beginPath();c.ellipse(x,y+1.1*u,w+lw/2,h+lw/2,0,0,7);c.fill();c.fillStyle=stato==='chiuso'?'#6e6e74':stato==='fatto'?'#a8302b':'#c48a17';c.beginPath();c.ellipse(x,y+1*u,w,h,0,0,7);c.fill();
 c.fillStyle=col;c.beginPath();c.ellipse(x,y,w,h,0,0,7);c.fill();c.lineWidth=lw;c.strokeStyle=INK;c.stroke();c.fillStyle='#ffffff88';c.beginPath();c.ellipse(x-1.4*u,y-.7*u,1.6*u,.6*u,0,0,7);c.fill();
 if(stato==='chiuso'){rett(c,x-1.2*u,y-.9*u,2.4*u,1.8*u,'#e9e9ee',lw*.5);c.beginPath();c.arc(x,y-.9*u,.8*u,Math.PI,0);c.lineWidth=lw*.6;c.stroke();}
 if(sel){c.save();c.globalAlpha=.5+.5*Math.sin(G.t*6);c.lineWidth=u*.6;c.strokeStyle='#fff';c.beginPath();c.ellipse(x,y,w+2*u,h+1.4*u,0,0,7);c.stroke();c.restore();}}
function statoLuogo(i){const l=LUOGHI[i];if(i>(S.mappa|0)||l.liv==null)return'chiuso';return(S.fatti||[]).includes(l.liv)?'fatto':'aperto';}
function scritta(c,t,x,y,z,col){c.font=`400 ${z}px "Bowlby One","Arial Black",sans-serif`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=z*.28;c.strokeStyle=INK;c.strokeText(t,x,y);c.fillStyle=col||'#fff';c.fillText(t,x,y);}
function puntoMatteo(){const i=Math.min(Math.floor(MP.pos),LUOGHI.length-2);return puntoStrada(i,MP.pos-i);}
function passoMappa(dt){
 if(Math.abs(MP.meta-MP.pos)>1e-4){const i=MP.meta>MP.pos?Math.floor(MP.pos+1e-6):Math.ceil(MP.pos-1e-6)-1,v=320*dt/LSTRADA[i],d=Math.sign(MP.meta-MP.pos);MP.pos=d>0?Math.min(MP.meta,MP.pos+v):Math.max(MP.meta,MP.pos-v);MP.passi+=dt;
  const p=puntoStrada(i,MP.pos-i),q=puntoStrada(i,clamp(MP.pos-i+d*.02,0,1));if(Math.abs(q.x-p.x)>.5)MP.verso=Math.sign(q.x-p.x);
  if(Math.abs(MP.meta-MP.pos)<1e-4){MP.pos=MP.meta;S.qui=MP.meta;salva();cartaMappa();suono(520,.12,'triangle',.06,780);if(MP.dopo){const f=MP.dopo;MP.dopo=null;f();}}}
 const m=puntoMatteo(),z=MP.z,W2=V.W/z/2,H2=V.H/z/2;MP.libero=Math.max(0,MP.libero-dt);
 if(!MP.libero){MP.cx=lerp(MP.cx,m.x,1-Math.exp(-dt*3));MP.cy=lerp(MP.cy,m.y-40,1-Math.exp(-dt*3));}
 MP.cx=clamp(MP.cx,W2,Math.max(W2,MAPPA_W-W2));MP.cy=clamp(MP.cy,H2,Math.max(H2,MAPPA_H-H2));
 for(const n of NUVOLE){n.x+=dt*14;if(n.x>MAPPA_W+300)n.x=-300;}
}
/* la mappa si prepara una volta alla grandezza vera sullo schermo, con lo smusso: rimpicciolita al volo senza smussare veniva seghettata */
function mappaPronta(z){if(!MAPPA.complete||!MAPPA.width)return null;const k=z*V.dpr,w=Math.round(MAPPA_W*k),h=Math.round(MAPPA_H*k);if(MP.tela&&MP.tela.width===w&&MP.tela.height===h)return MP.tela;
 const o=document.createElement('canvas');o.width=w;o.height=h;const q=o.getContext('2d');q.imageSmoothingEnabled=true;q.imageSmoothingQuality='high';q.drawImage(MAPPA,0,0,w,h);MP.tela=o;return o;}
function disegnaMappa(dt){
 MP.z=zoomMappa();passoMappa(dt);const c=ctx2,z=MP.z,u=z*MAPPA_U,uS=Math.min(V.H,V.W/2)/100,W=V.W,H=V.H,sx=x=>(x-MP.cx)*z+W/2,sy=y=>(y-MP.cy)*z+H/2,vede=(x,y,m)=>sx(x)>-m&&sx(x)<W+m&&sy(y)>-m&&sy(y)<H+m*1.6;
 c.setTransform(V.dpr,0,0,V.dpr,0,0);c.fillStyle='#2c5f86';c.fillRect(0,0,W,H);const tm=mappaPronta(z);if(tm)c.drawImage(tm,sx(0),sy(0),MAPPA_W*z,MAPPA_H*z);
 /* strade: quelle aperte piene, quelle ancora chiuse tratteggiate */
 c.lineCap='round';for(let i=0;i<LUOGHI.length-1;i++){const aperta=i+1<=(S.mappa|0);c.beginPath();for(let s=0;s<=24;s++){const q=puntoStrada(i,s/24);s?c.lineTo(sx(q.x),sy(q.y)):c.moveTo(sx(q.x),sy(q.y));}
  if(aperta){c.lineWidth=u*2.2;c.strokeStyle='#5b4630';c.stroke();c.lineWidth=u*1.3;c.strokeStyle='#e6d3a0';c.stroke();}else{c.setLineDash([u*1.6,u*1.6]);c.lineWidth=u*.8;c.strokeStyle='#fff6dcb0';c.stroke();c.setLineDash([]);}}
 /* tutto quello che sta in piedi si disegna dal fondo verso chi guarda */
 const cose=[];
 LUOGHI.forEach((l,i)=>{if(vede(l.x,l.y,40*u))cose.push({y:l.y-5,f:()=>PAESI[l.dis](c,sx(l.x),sy(l.y)-3.6*u,u)});});
 cose.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
 const sel=quiMappa();LUOGHI.forEach((l,i)=>{pastiglia(c,sx(l.x),sy(l.y)+.6*u,u,statoLuogo(i),i===MP.meta&&Math.abs(MP.pos-MP.meta)<1e-4);scritta(c,l.nome,sx(l.x),sy(l.y)+3.4*u+uS*1.8,uS*2.6);});
 /* Matteo che cammina sulla strada */
 const m=puntoMatteo(),mx=sx(m.x),my=sy(m.y)+.2*u,r=10*u/3.8,va=Math.abs(MP.meta-MP.pos)>1e-4;c.fillStyle='#00000040';c.beginPath();c.ellipse(mx,my,r*.9,r*.28,0,0,7);c.fill();
 if(va)passiSpr(c,mx,my,r,6+Math.floor(MP.passi*8)%4,MP.verso,0,0);else fermoSpr(c,mx,my,r,MP.verso,Math.sin(G.t*3)*.015,0);
 /* nuvole sopra a tutto, con la loro ombra */
 for(const n of NUVOLE){if(!vede(n.x,n.y,120))continue;const x=sx(n.x),y=sy(n.y),s=n.s*u;c.fillStyle='#0000001f';c.beginPath();c.ellipse(x+2*s,y+9*s,9*s,2.2*s,0,0,7);c.fill();
  const pal=[[-4.5,0,3.2],[0,-2,4.4],[4.5,0,3.4],[0,1,3.4]];c.fillStyle='#d5e6f2';pal.forEach(([a,b,r])=>{c.beginPath();c.arc(x+a*s,y+b*s+.8*s,r*s,0,7);c.fill();});c.fillStyle='#fff';pal.forEach(([a,b,r])=>{c.beginPath();c.arc(x+a*s,y+b*s,r*s,0,7);c.fill();});}
 c.save();c.globalAlpha=.55;scritta(c,'Mare Adriatico',sx(1180),sy(170),uS*3.2,'#d8ecff');scritta(c,'Mar Ionio',sx(230),sy(1420),uS*3.2,'#d8ecff');c.restore();
}
/* il riquadro in basso: il paese dove sta Matteo, il suo livello e Gioca */
function cartaMappa(){const i=quiMappa(),l=LUOGHI[i],st=statoLuogo(i),b=$('mGioca');$('mNome').textContent=l.nome;
 $('mLivello').textContent=l.liv==null?'Prossimamente…':'Livello '+(l.liv+1)+' · '+MONDI[l.liv].nome+' · boss '+BOSS[l.liv].nome+(st==='fatto'?' ✓':'');b.disabled=l.liv==null||i>(S.mappa|0);b.hidden=l.liv==null;const f=st==='fatto';b.textContent=f?'Livello':'Gioca';$('mBoss').hidden=!f;}
function vaiMappa(avanza){V.ts=V.ts0;G.stato='mappa';G.modo='mappa';G.guida=false;giocoUI(false);$('grande').hidden=true;$('avviso').hidden=true;mostra('sMappa');MP.z=zoomMappa();
 const q=clamp(S.qui|0,0,S.mappa|0);MP.pos=MP.meta=q;const m=puntoMatteo();MP.cx=m.x;MP.cy=m.y;MP.libero=0;MP.dopo=null;cartaMappa();
 if(avanza&&q<(S.mappa|0))setTimeout(()=>{if(G.modo==='mappa')vaiA(S.mappa|0);},700); /* dopo aver battuto un boss Matteo va da solo al paese dopo */}
function vaiA(i){i=clamp(i,0,S.mappa|0);if(i===MP.meta&&Math.abs(MP.pos-i)<1e-4)return false;MP.meta=i;MP.libero=0;return true;}
/* nei paesi già battuti si può rigiocare tutto il livello o affrontare solo il boss (G.soloBoss: perdendo si riprova solo lui) */
function giocaQui(soloBoss){const i=quiMappa(),l=LUOGHI[i];if(Math.abs(MP.pos-MP.meta)>1e-4||l.liv==null||i>(S.mappa|0))return;if(soloBoss&&statoLuogo(i)!=='fatto')return;audioOn();bloccaOrizzontale();dissolvi(()=>gioca(l.liv,soloBoss===true));}
function gioca(liv,soloBoss){iniziaRun(null,liv);G.soloBoss=soloBoss;if(soloBoss)entraBoss(liv);}
function tocco(x,y){const z=MP.z,u=z*MAPPA_U,sx=a=>(a-MP.cx)*z+V.W/2,sy=b=>(b-MP.cy)*z+V.H/2;let best=-1;
 LUOGHI.forEach((l,i)=>{const px=sx(l.x),py=sy(l.y);if(Math.abs(x-px)<16*u&&y>py-40*u&&y<py+9*u)best=i;});if(best<0)return;
 if(best>(S.mappa|0)){avviso(LUOGHI[best].liv==null?'Prossimamente!':'Prima batti il boss di '+LUOGHI[best-1].nome,1800);return;}
 if(!vaiA(best))giocaQui();}
{const sm=$('sMappa');let giu=null;
 sm.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;giu={x:puntoX(e),y:puntoY(e),cx:MP.cx,cy:MP.cy,mosso:false};try{sm.setPointerCapture(e.pointerId);}catch(x){}});
 sm.addEventListener('pointermove',e=>{if(!giu)return;const dx=puntoX(e)-giu.x,dy=puntoY(e)-giu.y;if(Math.hypot(dx,dy)>10)giu.mosso=true;if(giu.mosso){MP.libero=4;MP.cx=giu.cx-dx/MP.z;MP.cy=giu.cy-dy/MP.z;}});
 sm.addEventListener('pointerup',e=>{if(giu&&!giu.mosso)tocco(puntoX(e),puntoY(e));giu=null;});sm.addEventListener('pointercancel',()=>giu=null);}
/* ---------- FLUSSO ---------- */
const sezioni=['sMappa','sMenu','sAmici','sPausa','sFine','sGuida','sConsiglio'];
function mostra(id){sezioni.forEach(s=>$(s).hidden=s!==id);}
function hud(){const n=Math.max(0,G.cuori);const cu=$('cuori');cu.textContent='';for(let i=0;i<(VITE_INFINITE?1:n);i++){const m=document.createElement('img');m.src=icona('hud_heart');m.alt='';cu.append(m);}if(VITE_INFINITE)cu.append(' ∞');$('icMoneta').src=PIZZA.src;$('cuori').setAttribute('aria-label',n+' cuori');}
let tAvv=0;function avviso(t,ms){const a=$('avviso');a.textContent=t;a.hidden=false;clearTimeout(tAvv);tAvv=setTimeout(()=>a.hidden=true,ms||2000);}
/* le spiegazioni compaiono una volta sola, la prima volta che ci si arriva: fermano il gioco in un riquadro e si va avanti con la freccia; poi (S.consigli) non compaiono più */
function consiglio(k,t){S.consigli=S.consigli||[];if(S.consigli.includes(k)||G.stato!=='gioco')return;S.consigli.push(k);salva();mollaComandi();$('avviso').hidden=true;G.stato='consiglio';$('consTesto').textContent=t;mostra('sConsiglio');}
function chiudiConsiglio(){if(G.stato!=='consiglio')return;mollaComandi();mostra('');G.stato='gioco';}
function giocoUI(on){['hud','tocchi','comandi'].forEach(i=>$(i).hidden=!on);}
function dissolvi(fn){G.stato='velo';$('velo').classList.add('on');setTimeout(()=>{fn();$('velo').classList.remove('on');},380);}
function banner(t){$('grande').textContent=t;$('grande').hidden=false;$('avviso').hidden=true;G.pronti=1.4;G.stato='pronti';}
/* con ?livello=2 nell'indirizzo la partita parte da lì, per provare un mondo da solo */
const QS=new URLSearchParams(location.search),BOSS_SUBITO=QS.has('boss'),PARTENZA=Math.min(Math.max(0,(parseInt(QS.get('livello'))||parseInt(QS.get('boss'))||1)-1),MONDI.length-1); /* con ?boss=2 si entra subito nella stanza del boss */
function iniziaRun(prova,liv){const L=typeof liv==='number'?liv:PARTENZA;Object.assign(G,{soloBoss:false,fiato:1,dettoFiato:false,carica:0,avvisato:false,base:0,cuori:MAXC,gettoni:0,uccisi:0,tempo:0,avanz:0,scossa:0,jelly:0,visti:G.visti||0});mostra('');giocoUI(true);hud();aggBarra();$('gett').textContent='0';entraCorsa(Array.isArray(prova)?0:L,Array.isArray(prova)?prova:null);if(BOSS_SUBITO&&!Array.isArray(prova)&&typeof liv!=='number')entraBoss(PARTENZA);sveglia();}
function entraCorsa(i,prova){
 G.modo='2d';G.mondo=i;M=costruisci(i,prova);M.prova=!!prova;goo.length=0;fumi.length=0;polveri.length=0;G.combo=0;G.comboT=0;
 G.fiato=1;Object.assign(P2,{R:R_NORMALE,boomAria:false,gFermo:false,eraBomba:G.carica>=1,gonfioT:0,sgonfiaT:0,mangia:0,stanco:0,slancio:0,x:M.start.x,y:M.start.y,px:M.start.x,py:M.start.y,vx:0,vy:0,scatto:0,cd:0,inv:0,W:0,Wv:0,sx:M.start.x,sy:M.start.y,verso:1,ultimoSuolo:{x:0,y:1},rotola:false,carica:0,atterra:0,fermoT:0});
 V.dir=1;V.la=2;V.attesa=0;V.py=P2.y;V.ts=V.ts0;V.cx=P2.x+2;V.cy=centroY();if(M.acqua){V.cx=Math.max(P2.x,V.W/V.ts0/2-.6);V.cy=M.livello+V.H/V.ts0/2-2.6;}$('bossBox').hidden=true;$('nomeTappa').textContent=amico().nome+' · Mondo '+(i+1);$('tScatto').classList.add('pronto');
 if(M.acqua){G.stato='gioco';$('grande').hidden=true;}else banner(prova?'Nuova tappa':MONDI[i].nome); /* il mare comincia quando ci si butta nella pozza: il titolo compare lì */
 if(!prova&&i===0)setTimeout(()=>{if(G.modo==='2d'&&G.stato==='gioco'&&G.mondo===0)consiglio('mangia','Mangia per caricare l\u2019esplosione. Le casse si rompono con lo scatto.',3400);},2200);
}
function finisciProva(){incassa();vaiMenu();avviso('Tappa finita!',2600);}
const INTRO_DA=-1.6,INTRO_T=.95;
/* prima del via Lele lancia la sua sfida in un fumetto */
const SFIDA_T=2.2,SFIDA=['Mena Babbu,','sciucamu!'],FRASE_6=['Prendi questo','Cicciobomba!'],FRASE_T=2;
/* nelle ultime due fasi Lele fa tutto più in fretta: alla 5 (2 vite) poco, alla 6 (l'ultima) un po' di più */
const velFase=b=>b.cfg.palla?(b.vita===2?1.12:b.vita===1?1.3:1):1;
function fumetto(c,sx,sy,ts,righe,e){const b=M.boss,z=ts*.46,x0=sx(b.x),y0=sy(b.y-b.r+3.2*BZ+.35);c.save();c.font=`400 ${z}px "Bowlby One","Arial Black",sans-serif`;const w=Math.max(...righe.map(t=>c.measureText(t).width))+z*1.6,h=z*righe.length*1.25+z*1.1,x=clamp(x0-w/2,8,V.W-w-8),y=y0-h-ts*.45;c.translate(x0,y0);c.scale(e,e);c.translate(-x0,-y0);c.lineJoin='round';c.lineWidth=Math.max(3,ts*.09);c.strokeStyle='#2a1a10';c.fillStyle='#fffdf2';const r=z*.7;c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.lineTo(x0+ts*.1,y+h);c.lineTo(x0,y0);c.lineTo(x0-ts*.42,y+h);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();c.stroke();c.fill();c.fillStyle='#2a1a10';c.textAlign='center';c.textBaseline='middle';righe.forEach((t,i)=>c.fillText(t,x+w/2,y+z*.55+z*1.25*(i+.5)));c.restore();}
function introBoss(dt){const p=P2,x0=M.start.x;M.introT+=dt;const u=Math.min(1,M.introT/INTRO_T),nx=INTRO_DA+(x0-INTRO_DA)*(1-(1-u)*(1-u)),dx=nx-p.x;p.x=p.px=nx;p.vx=dx/Math.max(dt,.001);p.rot-=dx/R_NORMALE*.5;p.passi+=dx*4.6;
 if(u>=1){M.intro=false;p.vx=0;p.rotF=p.rot;p.dirF=1;p.gFermo=false;p.rotola=false;p.anim='apre';p.animT=SPR_ATTESA;polvere(); /* arrivato si alza subito: niente attesa in palla */if(!M.boss.cfg.palla)[2,3,4].forEach(y=>M.g[y][0]='#');}}
function entraBoss(i){
 M=costruisciArena(i);G.fiato=1;P2.stanco=0;goo.length=0;fumi.length=0;polveri.length=0;G.scossa=0;
 Object.assign(P2,{R:R_NORMALE,gFermo:false,x:M.start.x,y:M.start.y,px:M.start.x,py:M.start.y,vx:0,vy:0,scatto:0,cd:0,inv:0,W:0,Wv:0,sx:M.start.x,sy:M.start.y,verso:1,ultimoSuolo:{x:0,y:1},rotola:false,carica:0,atterra:0,fermoT:0});
 $('bossBox').hidden=false;$('bossNome').textContent=BOSS[i].nome;$('bossHp').style.width='100%';$('nomeTappa').textContent='';
 /* si entra rotolando da sinistra; nella stanza con i muri si apre un varco che si richiude dietro a Matteo */
 M.intro=true;M.introT=0;Object.assign(P2,{x:INTRO_DA,px:INTRO_DA,y:1.5+P2.R,py:1.5+P2.R,rotola:true,anim:'',animT:9,rot:0});if(!BOSS[i].palla)[2,3,4].forEach(y=>M.g[y][0]=' ');
 banner(BOSS[i].nome);if(BOSS[i].palla){G.pronti+=SFIDA_T;M.tut=(S.consigli||[]).includes('lele_3')?0:1;} /* il tutorial di Lele: una volta sola */
 if(i===0)setTimeout(()=>{if(M.boss&&G.stato==='gioco')consiglio('boss','Schiva la carica: se sbatte è stordito. Mettiti dietro le casse!',3800);},1700);
}
/* battuto il boss si resta nella stanza, con lui a terra: si apre un'uscita a destra e una freccia la indica; fuori c'è la pozza del mondo dopo */
function apriUscita(){M.uscita=true;G.stato='gioco';M.nemici.forEach(n=>n.vivo=false);[2,3,4].forEach(y=>M.g[y][M.w-1]=' ');(M.casse||[]).forEach(q=>{if(M.g[q.y][q.x]==='C'){M.g[q.y][q.x]=' ';schizzi2(q.x,q.y,10,'#c28a48',5);}});$('bossBox').hidden=true;sfx('door')||suono(140,.5,'sawtooth',.06,70);avviso('La porta è aperta: vai avanti!',2400);}
function frecciaUscita(c,sx,sy,ts){c.fillStyle='#140c06';c.fillRect(sx(M.w-1)-ts/2,sy(4)-ts/2,ts+1,ts*3);const x=sx(M.w-3.4)+Math.sin(G.t*6)*ts*.22,y=sy(3.4),L=ts*1.15,A=ts*.34;c.beginPath();c.moveTo(x-L/2,y-A/2);c.lineTo(x+L*.02,y-A/2);c.lineTo(x+L*.02,y-A*1.25);c.lineTo(x+L/2+A*.5,y);c.lineTo(x+L*.02,y+A*1.25);c.lineTo(x+L*.02,y+A/2);c.lineTo(x-L/2,y+A/2);c.closePath();c.lineJoin='round';c.lineWidth=Math.max(3,ts*.13);c.strokeStyle='#2a1a10';c.stroke();c.fillStyle='#f6c445';c.fill();}
/* ogni livello sta da solo: battuto il boss si torna alla mappa e si apre il paese dopo (l'uscita verso la pozza, apriUscita, non si usa più) */
function dopoBoss(){G.base=G.avanz;G.cuori++;hud();fine(true);}
function sblocca(liv){S.fatti=S.fatti||[];if(!S.fatti.includes(liv))S.fatti.push(liv);const i=LUOGHI.findIndex(l=>l.liv===liv);if(i>=0){S.mappa=Math.max(S.mappa|0,Math.min(i+1,LUOGHI.length-1));S.qui=i;}salva();}
let lucchetto=null;async function sveglia(){try{if(navigator.wakeLock&&!lucchetto){lucchetto=await navigator.wakeLock.request('screen');lucchetto.addEventListener('release',()=>lucchetto=null);}}catch(e){}}
function metri(){return Math.round(G.avanz);}
function incassa(){S.gettoni+=G.gettoni;G.gettoni=0;if(metri()>S.record)S.record=metri();salva();}
function vaiMenu(){V.ts=V.ts0;G.stato='menu';G.modo='menu';giocoUI(false);$('grande').hidden=true;$('avviso').hidden=true;mostra('sMenu');const r=$('record');r.hidden=!S.record;r.textContent='Record: '+S.record+' metri';}
function pausa(){mollaComandi();if(G.stato!=='gioco')return;G.stato='pausa';mostra('sPausa');}
function fine(vinto){
 if(G.stato==='esito'||G.stato==='fineAtt')return;G.stato='fineAtt';G.finT=vinto?.9:.6;G.esito={vinto,gett:G.gettoni,m:metri()};if(vinto)sblocca(G.mondo);incassa();suono(vinto?523:196,.5,'triangle',.13,vinto?1046:98);
}
function mostraFine(){
 const e=G.esito;giocoUI(false);G.stato='esito';
 $('fineTitolo').textContent=e.vinto?'Hai battuto '+BOSS[G.mondo].nome+'!':'Fine della corsa';
 const t=Math.round(G.tempo),mm=Math.floor(t/60),ss=String(t%60).padStart(2,'0');
 $('fineTesto').textContent=`${amico().nome} ha rotolato per ${e.m} metri in ${mm}:${ss}, ha eliminato ${G.uccisi===1?'1 nemico':G.uccisi+' nemici'} e ha mangiato ${e.gett} bocconi.`+(e.vinto?'':' Riprova il livello dall’inizio.');
 const b=$('bAvanti'),l=G.mondo;b.textContent=e.vinto?'Mappa':'Riprova';const sb=!!G.soloBoss;b.onclick=e.vinto?()=>vaiMappa(true):()=>gioca(l,sb);$('bTappe').hidden=e.vinto;mostra('sFine');
}

/* ---------- MENU ---------- */
$('logo').src='assets/logo.webp';
function anteprima(a,skin){const cv=document.createElement('canvas');cv.width=320;cv.height=160;dipingiPalla(cv,a,skin);const o=document.createElement('canvas');o.width=o.height=112;o.getContext('2d').drawImage(cv,80,0,160,160,0,0,112,112);return o;}
/* nelle anteprime Matteo (senza foto e col colore di partenza) non è una palla: lancia il telefono come quando aspetta fermo */
const ANTE=[];function anteMatteo(){const o=document.createElement('canvas');o.width=o.height=112;o.className='matteo';ANTE.push(o);if(!giraAnte.va){giraAnte.va=1;requestAnimationFrame(giraAnte);}return o;}
function giraAnte(){if($('sAmici').hidden||!ANTE.length){ANTE.length=0;giraAnte.va=0;return;}const im=FOGLISPR.telefono,u=(performance.now()/1000)%.9,f=u<.28?2:u<.52?3:4,k=112/126;
 ANTE.forEach(o=>{const c=o.getContext('2d');c.clearRect(0,0,112,112);if(im.complete)c.drawImage(im,f*130,0,130,126,(112-130*k)/2,0,130*k,112);});requestAnimationFrame(giraAnte);}
const eMatteo=f=>!f.foto&&f.colore===COLORI[0];
function disegnaAmici(){ANTE.length=0; /* la schermata ha solo le skin: niente lista amici, foto o pulsanti */
 const l=$('listaSkin');l.textContent='';const f=amico();
 SKIN.forEach(k=>{const b=document.createElement('button'),ha=S.skin.includes(k.id);b.className='scelta'+(f.skin===k.id?' attiva':'');const s=document.createElement('span');s.textContent=k.nome;const c=document.createElement('i');c.textContent=ha?(f.skin===k.id?'Indossata':'Tua'):k.costo+' bocconi';b.append(eMatteo(f)&&k.id==='classica'?anteMatteo():anteprima(f,k.id),s,c);
  b.onclick=()=>{if(!ha){if(S.gettoni<k.costo){c.textContent='Ne servono '+(k.costo-S.gettoni);return;}S.gettoni-=k.costo;S.skin.push(k.id);suono(660,.25,'triangle',.1,1320);}f.skin=k.id;salva();vestiPalla();disegnaAmici();};l.append(b);});
 $('saldo').textContent=S.gettoni;
}
async function bloccaOrizzontale(){try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();await screen.orientation.lock('landscape');}catch(e){}}
/* finché le immagini non sono arrivate Gioca è spento e dice Caricamento…; dopo 20 s si accende comunque */
(function attendi(t0){const b=$('bGioca'),n=IMMAGINI.filter(i=>!i.complete).length;if(n&&performance.now()-t0<20000){b.disabled=true;b.classList.add('carica');b.textContent='Caricamento…';setTimeout(()=>attendi(t0),150);}else{b.disabled=false;b.classList.remove('carica');b.textContent='Gioca';if(PARTENZA||BOSS_SUBITO)setTimeout(()=>iniziaRun(),0);}})(performance.now()); /* con ?livello=2 si entra subito nel livello, senza menu; l'audio si accende al primo tocco */
if(PARTENZA||BOSS_SUBITO)['pointerdown','keydown'].forEach(e=>addEventListener(e,()=>audioOn(),{once:true}));
/* il browser concede lo schermo intero solo dopo un tocco: nei link diretti non c'è Gioca, quindi si entra al primo tocco. Serve pointerup, sul telefono pointerdown non basta */
if(PARTENZA||BOSS_SUBITO)addEventListener('pointerup',()=>bloccaOrizzontale(),{once:true});
$('bGioca').onclick=()=>{audioOn();bloccaOrizzontale();if((S.guidaVista|0)>=4||PARTENZA||BOSS_SUBITO)vaiMappa();else apriGuida(()=>vaiMappa());};
$('mGioca').onclick=()=>giocaQui(false);$('mBoss').onclick=()=>giocaQui(true);$('mMenu').onclick=()=>vaiMenu();
$('bGuida').onclick=()=>{audioOn();apriGuida(null);};
$('bAmici').onclick=()=>{audioOn();disegnaAmici();mostra('sAmici');};
$('amiciChiudi').onclick=()=>mostra('sMenu');
$('pausa').onclick=pausa;
$('consAvanti').onclick=chiudiConsiglio;
$('bRiprendi').onclick=()=>{mostra('');G.stato='gioco';};
$('bEsci').onclick=()=>{incassa();vaiMappa();};
$('bAudio').onclick=()=>{S.audio=!S.audio;$('bAudio').textContent='Audio: '+(S.audio?'sì':'no');audioOn();salva();};
$('bAudio').textContent='Audio: '+(S.audio?'sì':'no');
$('bTappe').onclick=()=>vaiMappa();
document.addEventListener('visibilitychange',()=>{if(document.hidden)pausa();else{lucchetto=null;if(G.stato==='gioco'||G.stato==='pausa')sveglia();}});

/* ---------- CICLO ---------- */
function centroY(){return V.H/V.ts/2-.3;} /* il pavimento resta sempre in basso a vista, con poca terra sotto ma le onde dell'acqua nei fossi ancora visibili */
function telecamera2d(dt){
 const p=P2;
 if(M.boss){ /* ferma: tutta la stanza sta nello schermo, così il boss si vede sempre. Vicina come nella corsa, se la larghezza lo permette */
  V.ts=Math.min(V.ts0,V.W/M.w);V.cx=(M.w-1)/2;V.cy=V.H/V.ts/2-.9;return;} /* ferma anche in verticale: saltando la visuale non si sposta */
 if(M.acqua){const ac=p.y<M.livello,riva=ac&&M.iniziato&&p.x>ACQ_MEZZO&&p.y>M.livello-7,fuori=!ac&&(p.x>=M.spiaggia-3||!M.iniziato)||riva, /* riva: risalendo nel pozzo di destra, vicino al pelo dell'acqua, la camera si avvicina e mostra la spiaggia, se no non si capiva dove saltare */pz=pozziMare();V.ts=lerp(V.ts,fuori?V.ts0:Math.min(V.ts0,V.W/pz.w),1-Math.exp(-dt*4));const H2=V.H/V.ts/2,W2=V.W/V.ts/2; /* sott'acqua la camera si allontana finché un pozzo è largo quanto lo schermo, e non scorre di lato */ /* guarda dove si sta andando: in basso nella caduta, in alto nella risalita, e sulla spiaggia tiene il terreno in basso */
  V.cy=lerp(V.cy,Math.max(riva?Math.min(M.livello+H2-2.6,p.y+H2-1.6):fuori?M.livello+H2-2.6:p.y+(ac&&p.x<ACQ_MEZZO?-2.4:ac?2.2:-2),H2-.9),1-Math.exp(-dt*6));V.cx=lerp(V.cx,riva?clamp(Math.max(p.x,M.spiaggia+3-W2),W2-.6,M.w-W2+.6):fuori?clamp(p.x,W2-.6,M.w-W2+.6):p.y<pz.g?clamp(p.x,pz.c[0],pz.c[pz.c.length-1]):pz.c.reduce((m,c)=>Math.abs(c-p.x)<Math.abs(m-p.x)?c:m),1-Math.exp(-dt*6));return;}
 /* cambia lato solo se il personaggio va davvero dall'altra parte per un attimo */
 const d=Math.abs(p.vx)>1?Math.sign(p.vx):V.dir;V.attesa=d!==V.dir?V.attesa+dt:0;if(V.attesa>.7){V.dir=d;V.attesa=0;}
 const meta=V.dir*(Math.min(V.W/V.ts*.16,3)+Math.abs(p.vx)*.3),max=(1.5+Math.abs(p.vx)*.35)*dt;V.la+=clamp(meta-V.la,-max,max);
 V.cx=lerp(V.cx,p.x+V.la,1-Math.exp(-dt*3.5));V.cx=Math.max(V.cx,V.W/V.ts/2-1);
 /* in verticale segue il piano su cui poggia, non ogni salto */
 if(p.ultimoSuolo)V.py=p.y;else if(p.y>V.py+3.2)V.py=p.y-3.2;else if(p.y<V.py-1.5)V.py=p.y+1.5;
 /* niente zoom, l'utente non lo vuole: sui piani alti la telecamera sale, solo di quanto serve perché Matteo resti in vista */
 V.ts=V.ts0;V.cy=lerp(V.cy,centroY()+Math.max(0,V.py-4.5),1-Math.exp(-dt*5));
}
let ult=performance.now();
function ciclo(ora){
 requestAnimationFrame(ciclo);
 const dt=Math.min(.033,(ora-ult)/1000||.016);ult=ora;
 if(G.stato==='pausa')return;
 G.t+=dt;
 if(G.modo==='menu'){if(G.guida)disegnaGuida();else disegnaMenu(dt);return;}
 if(G.modo==='mappa'){if(G.guida)disegnaGuida();else disegnaMappa(dt);return;}
 leggiInput(dt);
 if(G.stato==='pronti'&&M&&M.boss){if(M.intro)introBoss(dt);else P2.animT+=dt;}
 if(G.stato==='pronti'&&M&&M.boss&&M.boss.cfg.palla&&G.pronti<SFIDA_T)$('grande').hidden=true;
 if(G.stato==='pronti'){G.pronti-=dt;if(G.pronti<=0){G.stato='gioco';$('grande').hidden=true;}}
 if(G.stato!=='gioco')passoGoo(dt); /* le scintille finiscono di cadere anche quando il gioco è fermo */
 if(G.stato==='sconfitto'){G.finT-=dt;if(M.boss)cadeBoss(M.boss,dt);if(G.finT<=0){G.stato='velo';dopoBoss();}}
 if(G.stato==='fineAtt'){G.finT-=dt;if(G.finT<=0)mostraFine();}
 if(G.stato==='gioco')G.tempo+=dt;
 G.scossa=Math.max(0,G.scossa-dt);
 if(G.stato==='gioco'){const ps=5;for(let i=0;i<ps&&G.stato==='gioco';i++)passo2d(dt/ps);
  passoOggetti(dt);passoNemici2(dt);if(M.boss)passoBoss(dt);
  if(!M.boss){if(M.acqua)M.perc=Math.max(M.perc||0,P2.x<ACQ_MEZZO?M.livello-P2.y:M.livello+P2.y+Math.max(0,P2.x-M.spiaggia));G.avanz=(G.base||0)+(M.acqua?M.perc:Math.max(0,P2.x-M.start.x));}}
 telecamera2d(dt);disegna2d();
}
misure2d();vestiPalla();vaiMenu();
FOGLIO.addEventListener('load',()=>{vestiPalla();});KIT.addEventListener('load',hud);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(vestiPalla);
requestAnimationFrame(ciclo);
window.__rotolamici={vaiMappa,MP,LUOGHI,S,ribatti,maniBoss,azione,G,P2,V,get M(){return M},iniziaRun,entraBoss,entraCorsa,IN,PEZZI,ARENE,USO};
})();
