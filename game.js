"use strict";
addEventListener("error",e=>{const t=document.getElementById("erroreT");if(t&&e.message&&document.getElementById("gioco")){t.hidden=false;t.textContent="Si è verificato un errore: "+e.message+". Ricarica la pagina.";}});
(function(){
const $=id=>document.getElementById(id);
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
let S={record:0,gettoni:0,skin:['classica'],amici:[{nome:'Matteo',colore:COLORI[0],skin:'classica',foto:null}],sel:0,sens:1,audio:true};
try{const v=JSON.parse(localStorage.getItem(CHIAVE));if(v&&v.amici&&v.amici.length)S=Object.assign(S,v);}catch(e){}
S.amici.forEach(a=>{if(['#f2b632','#62cf4a','#ffb27a','#f05a58','#b05a2c'].includes(a.colore))a.colore=COLORI[0];});
function salva(){try{localStorage.setItem(CHIAVE,JSON.stringify(S));}catch(e){}}

/* ---------- MONDI E TAPPE ---------- */
const MONDI=[
 {nome:'Isola degli Ananas',cielo:['#ffe382','#27a39b'],legno:'#f4bd3c',vena:'#a96c10',bordo:'#3f9e3a',nebbia:'#1f8f7d',tema:'ananas',kit:'sand',fondo:'color_hills',liquido:'water',decor:['erbananas','grass','rock'],nemico:'ananas',volo:'bee'},
 {nome:'Bosco dei Funghi',cielo:['#9a7bdc','#2b2360'],legno:'#b07a47',vena:'#83522b',bordo:'#f0b429',nebbia:'#5c4a9a',kit:'purple',fondo:'color_mushrooms',liquido:'water',decor:['mushroom_red','mushroom_brown','grass_purple','bush'],nemico:'slime_normal',volo:'fly'},
 {nome:'Fornace di Pietra',cielo:['#ff9a55','#5a1330'],legno:'#6a4c42',vena:'#46302a',bordo:'#37c4b8',nebbia:'#a23a3a',kit:'stone',fondo:'color_desert',liquido:'lava',decor:['rock','cactus','fence'],nemico:'slime_fire',volo:'fly'}
];
const BOSS=[
 {nome:'Ananassone',vita:3,scatto:7,stordito:2.6,colore:'#f4bd3c',corona:true},
 {nome:'Regina Trivella',vita:4,scatto:8.5,stordito:2.3,colore:'#7d4bc9',pioggia:true},
 {nome:'Re Birillo',vita:5,scatto:9.5,stordito:2,colore:'#e08a1e',pioggia:true,raggiera:true,servi:true}
];
/* ---------- KIT GRAFICO E SONORO (Kenney, New Platformer Pack, licenza CC0) ---------- */
const KIT=new Image();KIT.src='assets/kit.webp';
const KMAP={"terrain_sand_block":[2,2],"terrain_sand_block_top":[102,2],"terrain_sand_block_top_left":[202,2],"terrain_sand_block_top_right":[302,2],"terrain_sand_block_left":[402,2],"terrain_sand_block_right":[502,2],"terrain_sand_block_center":[602,2],"terrain_sand_block_bottom":[702,2],"terrain_sand_block_bottom_left":[802,2],"terrain_sand_block_bottom_right":[902,2],"terrain_sand_horizontal_left":[2,102],"terrain_sand_horizontal_middle":[102,102],"terrain_sand_horizontal_right":[202,102],"terrain_sand_vertical_top":[302,102],"terrain_sand_vertical_middle":[402,102],"terrain_sand_vertical_bottom":[502,102],"terrain_sand_cloud_left":[602,102],"terrain_sand_cloud_middle":[702,102],"terrain_sand_cloud_right":[802,102],"terrain_sand_ramp_short_b":[902,102],"terrain_purple_block":[2,202],"terrain_purple_block_top":[102,202],"terrain_purple_block_top_left":[202,202],"terrain_purple_block_top_right":[302,202],"terrain_purple_block_left":[402,202],"terrain_purple_block_right":[502,202],"terrain_purple_block_center":[602,202],"terrain_purple_block_bottom":[702,202],"terrain_purple_block_bottom_left":[802,202],"terrain_purple_block_bottom_right":[902,202],"terrain_purple_horizontal_left":[2,302],"terrain_purple_horizontal_middle":[102,302],"terrain_purple_horizontal_right":[202,302],"terrain_purple_vertical_top":[302,302],"terrain_purple_vertical_middle":[402,302],"terrain_purple_vertical_bottom":[502,302],"terrain_purple_cloud_left":[602,302],"terrain_purple_cloud_middle":[702,302],"terrain_purple_cloud_right":[802,302],"terrain_purple_ramp_short_b":[902,302],"terrain_stone_block":[2,402],"terrain_stone_block_top":[102,402],"terrain_stone_block_top_left":[202,402],"terrain_stone_block_top_right":[302,402],"terrain_stone_block_left":[402,402],"terrain_stone_block_right":[502,402],"terrain_stone_block_center":[602,402],"terrain_stone_block_bottom":[702,402],"terrain_stone_block_bottom_left":[802,402],"terrain_stone_block_bottom_right":[902,402],"terrain_stone_horizontal_left":[2,502],"terrain_stone_horizontal_middle":[102,502],"terrain_stone_horizontal_right":[202,502],"terrain_stone_vertical_top":[302,502],"terrain_stone_vertical_middle":[402,502],"terrain_stone_vertical_bottom":[502,502],"terrain_stone_cloud_left":[602,502],"terrain_stone_cloud_middle":[702,502],"terrain_stone_cloud_right":[802,502],"terrain_stone_ramp_short_b":[902,502],"bomb":[2,602],"bomb_active":[102,602],"bush":[202,602],"grass":[302,602],"grass_purple":[402,602],"mushroom_red":[502,602],"mushroom_brown":[602,602],"rock":[702,602],"fence":[802,602],"sign_right":[902,602],"sign_exit":[2,702],"flag_green_a":[102,702],"flag_green_b":[202,702],"door_closed":[302,702],"door_closed_top":[402,702],"door_open":[502,702],"door_open_top":[602,702],"coin_gold":[702,702],"coin_gold_side":[802,702],"heart":[902,702],"gem_blue":[2,802],"star":[102,802],"spring":[202,802],"spring_out":[302,802],"spikes":[402,802],"block_exclamation":[502,802],"block_strong_danger":[602,802],"fireball":[702,802],"lava":[802,802],"lava_top":[902,802],"lava_top_low":[2,902],"water":[102,902],"water_top":[202,902],"water_top_low":[302,902],"hud_heart":[402,902],"hud_coin":[502,902],"cactus":[602,902],"slime_normal_walk_a":[702,902],"slime_normal_walk_b":[802,902],"slime_fire_walk_a":[902,902],"slime_fire_walk_b":[2,1002],"slime_spike_walk_a":[102,1002],"slime_spike_walk_b":[202,1002],"bee_a":[302,1002],"bee_b":[402,1002],"fly_a":[502,1002],"fly_b":[602,1002]};
const FONDI={};[['clouds','assets/fondi/clouds.webp'],['color_hills','assets/fondi/color_hills.webp'],['color_mushrooms','assets/fondi/color_mushrooms.webp'],['color_desert','assets/fondi/color_desert.webp']].forEach(a=>{const i=new Image();i.src=a[1];FONDI[a[0]]=i;});
const SUONI={"magic":'assets/suoni/magic.mp3',"coin":'assets/suoni/coin.mp3',"jump":'assets/suoni/jump.mp3',"hurt":'assets/suoni/hurt.mp3',"disappear":'assets/suoni/disappear.mp3',"bump":'assets/suoni/bump.mp3',"throw":'assets/suoni/throw.mp3',"jump-high":'assets/suoni/jump-high.mp3',"gem":'assets/suoni/gem.mp3'};
const KIT2=new Image();KIT2.src='assets/kit2.webp'; /* altri pezzi del kit: pulsante, lucchetto, peso, mattoni, blocco che crolla */
Object.assign(KMAP,{"switch_blue":[2,2,2],"switch_blue_pressed":[102,2,2],"lock_blue":[202,2,2],"weight":[302,2,2],"bricks_brown":[402,2,2],"block_idle":[502,2,2],"block_fall":[602,2,2],"block_rest":[702,2,2]});
/* nomi delle caselle del terreno: indici nell'atlante del paesaggio */
const PIX={block:0,horizontal_left:1,horizontal_middle:2,horizontal_right:3,vertical_top:4,vertical_middle:5,vertical_bottom:6,block_top_left:7,block_top:8,block_top_right:9,block_left:10,block_center:11,block_right:12,block_bottom_left:13,block_bottom:14,block_bottom_right:15,cloud_left:1,cloud_middle:2,cloud_right:3};
/* il terreno del mondo 1 è il paesaggio ananas dell'utente: caselle da 68 nello stesso ordine di PIX, l'ultima è la rampa che scende */
const ERBANAN=new Image();ERBANAN.src='assets/erbananas.webp'; /* il ciuffo d'ananas dell'utente al posto del cespuglio nel mondo 1 */
/* in grandezza vera, alla scala delle caselle da 68 del paesaggio: così il bordo scuro è spesso come quello del pavimento */
function ciuffo(c,x,y,ts){const w=ERBANAN.width*ts/68,h=ERBANAN.height*ts/68;if(w)c.drawImage(ERBANAN,x-w/2,y-h,w,h);}
const PAES=new Image();PAES.src='assets/paesaggio.webp';const PAES_RAMPA=16,PAES_SOTTO=17,PAES_BORDO={m:18,g:19,v:20},PAES_UNIONE=21,PAES_COLONNA=22,PAES_LATO_COLONNA=23,PAES_GROTTA={fondo:24,pav:25,base:26,muro:27,muroPav:28,pavMuro:29,muroBase:30,cielo:31,angolo:32}; /* 17: la terra sotto una rampa a scalini, con la buccia della rampa dopo nell'angolo; 18-20: dove il piano finisce a sinistra, ai piedi di un muro più alto (m), con un gradino in giù (g) o sul vuoto (v); a destra si capovolgono, il bordo sul vuoto al contrario; 21: il muro accanto al bordo sul vuoto, dove le due linee si uniscono; 22: sotto una colonna, con il piano che arriva dai due lati; 23: il piano ai lati di quella colonna, senza l'uncino; 24-29: la grotta, sfondo, pavimento, la casella sotto il pavimento che torna gialla, il muro a sinistra (a destra si capovolge), e l'angolo: il muro alla quota del pavimento, la prima casella di pavimento accanto al muro e (30) il muro sotto, dove la sfumatura gira; 31: l'interno sotto il soffitto */
function paes(c,i,x,y,w,h,flip,capo){const s=c.imageSmoothingEnabled;c.imageSmoothingEnabled=false;if(flip||capo){c.save();c.translate(flip?x+w:x,capo?y+h:y);c.scale(flip?-1:1,capo?-1:1);c.drawImage(PAES,i*68,0,68,68,0,0,w,h);c.restore();}else c.drawImage(PAES,i*68,0,68,68,x,y,w,h);c.imageSmoothingEnabled=s;}
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
 {id:'classica',nome:'Classica',costo:0},{id:'anguria',nome:'Anguria',costo:60},{id:'pallone',nome:'Pallone',costo:90},
 {id:'biglia',nome:'Biglia',costo:130},{id:'basket',nome:'Basket',costo:170},{id:'pianeta',nome:'Pianeta',costo:230},
 {id:'oro',nome:'Oro',costo:400,metallo:.85,ruvido:.25}
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
function vestiPalla(){const a=amico();caricaFoto(a,()=>{dipingiPalla(cvPalla,a,a.skin);});$('chi').textContent=a.nome;}

/* ---------- AUDIO ---------- */
let AC=null;
const BUF={};
function audioOn(){if(AC||!S.audio)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();
 Object.keys(SUONI).forEach(n=>{fetch(SUONI[n]).then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b,d=>{BUF[n]=d;},()=>{})).catch(()=>{});});}catch(e){}}
function sfx(n){if(!AC||!S.audio||!BUF[n])return false;try{const o=AC.createBufferSource(),g=AC.createGain();o.buffer=BUF[n];g.gain.value=.5;o.connect(g);g.connect(AC.destination);o.start();return true;}catch(e){return false;}}
function suono(f,d,tipo,vol,f2){if(!AC||!S.audio)return;try{const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=tipo||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(vol||.12,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d);}catch(e){}}
function vibra(ms){try{navigator.vibrate&&navigator.vibrate(ms);}catch(e){}}

/* ---------- STATO ---------- */
const G={carica:0,stato:'menu',modo:'menu',t:0,mondo:0,cuori:3,gettoni:0,uccisi:0,tempo:0,scudo:false,stella:0,avanz:0,scossa:0};

/* ---------- COMANDI ---------- */
const IN={tx:0,tz:0,tiltX:0,tiltZ:0,tiltOn:false,ricevuto:false,stickX:0,stickZ:0};
const tasti={};const puntatori=new Map();let stickId=null;
function suOrient(e){
 if(e.beta==null||e.gamma==null)return;IN.ricevuto=true;
 const an=SC.rot?90:(screen.orientation&&screen.orientation.angle)||window.orientation||0,g=e.gamma,b=e.beta;let x=g,y=b;
 if(an===90){x=b;y=-g;}else if(an===-90||an===270){x=-b;y=g;}else if(an===180){x=-g;y=-b;}
  const zm=v=>Math.abs(v)<.8?0:v-Math.sign(v)*.8;IN.tiltX=clamp(zm(x)/8,-1,1);IN.tiltZ=clamp(zm(-y)/8,-1,1); /* assoluto: telefono in piano = piano dritto */
}
/* il lancio: un colpo secco del telefono verso un lato lancia Matteo da quella parte */
const SC_LANCIO=15;let gLento=null,ultLancio=0,picchi=[],ultPicco=0,vPicco=null,ultBolla=0,lancioIn=null;
function suMoto(e){
 let a=e.acceleration;if(!a||a.x==null){const r=e.accelerationIncludingGravity;if(!r||r.x==null)return;gLento=gLento?{x:gLento.x*.9+r.x*.1,y:gLento.y*.9+r.y*.1}:{x:r.x,y:r.y};a={x:r.x-gLento.x,y:r.y-gLento.y};}
 const an=SC.rot?90:(screen.orientation&&screen.orientation.angle)||window.orientation||0;
 const lato=an===90?-a.y:an===-90||an===270?a.y:an===180?-a.x:a.x; /* accelerazione verso destra dello schermo */
 const ora=performance.now(),az=a.z||0,forza=Math.hypot(a.x,a.y,az);
 /* scossone: conta solo i picchi che cambiano verso (avanti e indietro); un colpo secco ne fa due o tre, uno scossone di più */
 if(forza>9){if(!vPicco||(a.x*vPicco.x+a.y*vPicco.y+az*vPicco.z<0&&ora-ultPicco>60)){picchi.push(ora);ultPicco=ora;}vPicco={x:a.x,y:a.y,z:az};}
 picchi=picchi.filter(t=>ora-t<800);if(!picchi.length)vPicco=null;
 if(picchi.length>=5&&ora-ultBolla>900){ultBolla=ora;picchi.length=0;vPicco=null;lancioIn=null;bolla();return;}
 /* colpo secco da un lato: lancio appena il telefono si ferma, se intanto non è diventato uno scossone; mai subito dopo una bolla */
 if(Math.abs(lato)>SC_LANCIO&&ora-ultLancio>700&&ora-ultBolla>700&&!lancioIn)lancioIn={d:Math.sign(lato),t:ora,calmo:0};
 if(lancioIn){if(forza>6)lancioIn.calmo=0;else if(!lancioIn.calmo)lancioIn.calmo=ora;
  if(lancioIn.calmo&&ora-lancioIn.calmo>100){if(picchi.length<5){ultLancio=ora;lancio(lancioIn.d);}lancioIn=null;}else if(ora-lancioIn.t>700)lancioIn=null;} /* se non si ferma è uno scossone: niente lancio */
}
/* la bolla: Matteo vibra e galleggia leggero per un attimo; una volta per salto e costa un po' di fiato */
function bolla(){
 const p=P2;if(G.stato!=='gioco'||p.stanco>0||p.bollaUsata||p.bolla>0)return;if(!usaFiato(.25))return;
 p.bolla=.85;p.bollaUsata=true;p.rotola=true;p.ultimoSuolo=null;p.coyote=0;p.vy=Math.max(p.vy,2.3);p.y+=.04;vibra([15,25,15,25,15]);suono(700,.35,'sine',.07,1100);suono(950,.25,'triangle',.04,1500);
 if(!G.dettaBolla){G.dettaBolla=true;avviso('Bolla! Scuotendo il telefono Matteo galleggia per un attimo',2200);}
}
/* il lancio è una cannonata: deve passare fossi dove salto, scatto e bolla insieme non arrivano */
const LANCIO_VX=15,LANCIO_VY=16.5,LANCIO_T=1.6;
function lancio(d){
 const p=P2;if(G.stato!=='gioco'||!(p.coyote>0||p.ultimoSuolo)||!usaFiato(FIATO_LANCIO))return;
 p.vy=LANCIO_VY;p.vx=d*LANCIO_VX;p.lancio=LANCIO_T;p.verso=d;p.rotola=true;p.coyote=0;p.ultimoSuolo=null;p.y+=.05;p.Wv+=10;polvere();sfx('jump-high')||suono(260,.3,'square',.08,900);vibra(30);
 if(!G.lanciato){G.lanciato=true;avviso('Lancio!',900);}
}
let provato=false;
async function chiediSensori(){
 if(provato)return;provato=true;
 try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function'){const dm=window.DeviceMotionEvent&&typeof DeviceMotionEvent.requestPermission==='function'?DeviceMotionEvent.requestPermission().catch(()=>'no'):null;const r=await DeviceOrientationEvent.requestPermission();if(dm)await dm;if(r!=='granted')return note();}}catch(e){return note();}
 if(!window.DeviceOrientationEvent)return note();
 addEventListener('deviceorientation',suOrient);addEventListener('devicemotion',suMoto);
 setTimeout(()=>{if(IN.ricevuto){IN.tiltOn=true;aggComandi();}else note();},900);
}
function note(){IN.tiltOn=false;aggComandi();}
function aggComandi(){
 $('aSin').textContent='SCATTO';
 if(!IN.tiltOn&&provato)$('noteComandi').textContent='Sensori non disponibili qui: trascina il dito per inclinare il piano, tocca a destra per saltare e a sinistra per scattare.';
 else if(IN.tiltOn)$('noteComandi').textContent='Inclinazione attiva. Tocca a destra per saltare, a sinistra per scattare. Dai un colpo secco al telefono verso un lato per lanciare Matteo, scuotilo per farlo galleggiare.';
}
function azione(lato){if(G.stato!=='gioco'||(P2.stanco>0&&lato>0))return;if(lato<0)scatta2();else P2.buf=.13;}
const tocchi=$('tocchi');
tocchi.addEventListener('pointerdown',e=>{e.preventDefault();try{tocchi.setPointerCapture(e.pointerId);}catch(x){}
 const lato=puntoX(e)<SC.W/2?-1:1;
 if(IN.tiltOn){azione(lato);return;}
 puntatori.set(e.pointerId,{sx:puntoX(e),sy:puntoY(e),t:performance.now(),mosso:false,lato});
});
tocchi.addEventListener('pointermove',e=>{const p=puntatori.get(e.pointerId);if(!p)return;const dx=puntoX(e)-p.sx,dy=puntoY(e)-p.sy;
 if(!p.mosso&&Math.hypot(dx,dy)>12&&stickId===null){p.mosso=true;stickId=e.pointerId;const s=$('stick');s.style.left=p.sx+'px';s.style.top=p.sy+'px';s.hidden=false;}
 if(stickId===e.pointerId){const k=52,x=clamp(dx/k,-1,1),y=clamp(dy/k,-1,1);IN.stickX=x;IN.stickZ=-y;$('stickP').style.transform=`translate(${x*33}px,${y*33}px)`;}
});
function suFine(e){const p=puntatori.get(e.pointerId);if(!p)return;puntatori.delete(e.pointerId);
 if(stickId===e.pointerId){stickId=null;IN.stickX=IN.stickZ=0;$('stick').hidden=true;$('stickP').style.transform='';}
 else if(!p.mosso&&e.type==='pointerup'&&performance.now()-p.t<320)azione(p.lato);}
tocchi.addEventListener('pointerup',suFine);tocchi.addEventListener('pointercancel',suFine);
addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;tasti[e.code]=true;
 if(e.code==='Space'){e.preventDefault();if(!e.repeat)azione(1);}
 if((e.code==='KeyQ'||e.code==='KeyE')&&!e.repeat)lancio(e.code==='KeyE'?1:-1);
 if(e.code==='KeyB'&&!e.repeat)bolla();
 if((e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyX')&&!e.repeat)azione(-1);
 if(e.code==='Escape'&&G.stato==='gioco')pausa();
});
addEventListener('keyup',e=>{tasti[e.code]=false;});
function leggiInput(dt){
 let kx=(tasti.ArrowRight||tasti.KeyD?1:0)-(tasti.ArrowLeft||tasti.KeyA?1:0),kz=(tasti.ArrowUp||tasti.KeyW?1:0)-(tasti.ArrowDown||tasti.KeyS?1:0);
 let tx=kx||IN.stickX,tz=kz||IN.stickZ;
 if(!kx&&!kz&&IN.tiltOn){tx=IN.tiltX*S.sens;tz=IN.tiltZ*S.sens;}
 else{tx*=S.sens;tz*=S.sens;}
 const k=1-Math.exp(-dt*(IN.tiltOn?18:9));IN.tx=lerp(IN.tx,clamp(tx,-1,1),k);IN.tz=lerp(IN.tz,clamp(tz,-1,1),k);
}

/* ---------- CUORI ---------- */
const MAXC=3; /* cuori alla partenza: quelli raccolti si sommano, senza tetto */
function togliCuore(){if(VITE_INFINITE)return;G.cuori--;hud();if(G.cuori<=0)fine(false);}

/* ---------- CORSA 2D ---------- */
const PEZZI={
 prato:["                    ","      c c c         ","     -----          ","                    ","  c        e    c   ","####################"],
 buca:["         c c        ","        -----       ","                    ","  c   c       c     ","#######   ###   ####"],
 spine:["            U       ","          -----     ","   c  c        c    ","  ---- ---          ","                    ","      ^^^      ^^   ","####################"],
 collina:["                       ","        c c c c        ","                       ","        /#####%        ","       /#######%       ","      /#########%      ","     /###########%     ","#######################"],
 duePiani:["      c   c   H         ","     e                  ","  /###################  "," /#                     ","/#     c  c  c  c       ","#    e        ^    e    ","########################"],
 torre:["           H            ","        ------          ","                        ","  c  ------      ------ ","                        ","  ------   ------       ","                     C  ","    B            e      ","########################"],
 fosso:["        c c c           ","                        ","   f          f         ","                        ","  B                     ","######    #####    #####"],
 cannoni:["                        ","  c   c    T            ","  ---------             ","                  g     ","         e        #     ","############ ###########"],
 tempo:["      c   c   c         ","                        ","    !!!   !!!   !!!     ","########################"],
 casse:["        C  C            ","       -----            ","   C              C     ","          e             ","########################"],
 isole:[" c     c    c    H       ","                         ","####  ###  ###  ###  ####"],
 ricci:["       c    c           ","      -------           ","                        ","   r          r         ","###########   ##########"],
 sciame:["    f       f      f    ","                        ","  c    c  H    c    c   ","  ------- ---- -------  ","                        ","     e        ^^^       ","########################"],
intreccio:["                                                    ","                                        D           ","                                        D           ","                                        D           ","                       cccccc           D           ","                      --------          D           ","                                        D           ","                                        D           ","           O  /%          B             D           ","     ##############xxxxx######  ###     D           ","                                        D           ","                                        D           ","   B    c   c   e    c   ce   PP        D  cccc  e  ","####################################################"],
 approdo:["                                                          ","                                                          ","                           ccUc                           ","                           ----                           ","                       ccc             ccc                ","                                                          ","                   e       e  ^^     e                    ","              ###############################       cc    ","              ##                      c                   ","    ccc      ###      ccccccc  H    ccccc        ^^  r !! ","##########   #############################################"],
 magazzino:["                                                              ","                                                              ","                                          D                   ","     #########                            D                   ","     #                                    D                   ","     # cccc                               D                   ","     #  Tccc            ccccccc           D                   ","     #########------------------          D                   ","         f            f                   D                   ","                                          D                   ","         COC                  B           D                   ","     #############xxxxxxxxxx####  ###     D                   ","                                          D                   ","                                          D                   ","   B    e       e   ^^  e   r   PP        D  ccccc  e   e !!  ","##############################################################"],
 crollo:["                                                            ","                                                            ","                                                            ","                                                            ","                                             ccecc          ","                                         --#########        ","   Hcc                                     X       #        ","  ----        f           f            --- X       #        ","                                           X ccccc #        ","                                    ---    X       #        ","         c c c c c   c c c c c c           X H U T #  !!! e ","########xxxxxxxxxxx  xxxxxxxxxxxx###########################"],
 burrone:["                                               ","                                               ","                                               ","                                               ","                                               ","                           ccccccc  e          ","                         ################%     ","                         #################%    ","                         ##################%   ","                         ###################%  ","                         ####################% ","     ccc                 #####################%","#############            ######################"],
 scalata:["                                            ","                                            ","                                            ","####                        ccccc cccc      ","####                       -------####      ","####                              ####      ","####                  ----        ####      ","# c               cc              ####      ","#Hc              xxxx             ####      ","####-----                         ####      ","####        ----                  ####      ","####     f       cc               ####      ","####            xxxx              ####      ","                                  ####      ","           ----                   ####      ","       cc                         ####      ","      ----                        ####      ","              e         r   ^^^   ####  ^^ e","############################################"],
 artiglieria:["                                                      ","                                                      ","                                                      ","                                                      ","                                                      ","                     Tcc                 ccTcc        ","                   ------               -------       ","                                                      ","                     cc                         ##  ##","                      g                cccBcc   ##H ##","                C   ####          cc  --------        ","       g cc   ----- ####        g                     ","      ###   C       ####       ###  C      #          ","   e  ###  CC  e    #### er ^^ ### CCC   B #  e   e   ","######################################################"],
 valanga:["                                                                      ","                                                                      ","                                                                      ","                                                                      ","                                                                      ","             c                                                        ","          ######%                                                     ","          #######%                                                    ","          ########% c                                     #####       ","        B #########% e C                                  X   #       ","    ####################%                              -- X   #       ","    #####################% eC     c    c      c           Xccc#       ","    #########################%                      --    X   #       ","  B ##########################%  e C e  e C e  e C e      XH T#   e   ","######################################################################"],
 gradini:["                 c c    ","               #####    ","            ###         ","    c   ###       f     ","     ###                ","  ###            ^^     ","########################"]
};
/* pareti finte: rettangoli [x0,y0,x1,y1] in caselle del pezzo; sembrano terra ma si attraversano */
const FINTI={"approdo":[[16,3,44,4]],"magazzino":[[6,11,13,13]],"scalata":[[1,12,3,13]],"artiglieria":[[40,3,43,4],[50,7,51,8]]};
const CORSE=[
 ['approdo','magazzino','crollo','burrone','scalata','artiglieria','valanga'],
 ['duePiani','tempo','ricci','torre','fosso','casse','cannoni','gradini','buca','tempo','duePiani','sciame','isole'],
 ['cannoni','ricci','isole','tempo','fosso','sciame','gradini','cannoni','torre','ricci','tempo','duePiani','isole','fosso']
];
const ALTO=20;
let M=null;
const ctx2=$('d2').getContext('2d');
const V={W:0,H:0,dpr:1,ts:35,cx:0,cy:8,ts0:35,zoom:1,dir:1,la:0,attesa:0,py:3,sp:null,sf:[]};
function misure2d(){V.W=SC.W;V.H=SC.H;V.dpr=Math.min(devicePixelRatio||1,2);const c=$('d2');c.width=V.W*V.dpr;c.height=V.H*V.dpr;V.ts0=Math.max(28,Math.min(V.W,V.H)/9.5);V.ts=V.ts0*(V.zoom||1);}
function suRidimensiona(){orienta();misure2d();}
addEventListener('resize',suRidimensiona);addEventListener('orientationchange',()=>setTimeout(suRidimensiona,200));
document.addEventListener('focusout',()=>setTimeout(suRidimensiona,250));
function costruisci(i,lista){
 const g=[];for(let y=0;y<ALTO;y++)g.push([]);
 const m={i,g,w:0,oggetti:[],nemici:[],colpi:[],spine:{},fine:0,gusci:[],pesi:[],pulsanti:[],porte:[],crolli:{},pezzi:0,nomi:[],finti:[],fintoSet:new Set()};
 const riga=(y,x,t)=>{g[y][x]=t;};
 const pezzo=(rows)=>{
  const n=rows.length,w=rows[0].length,base=m.w;
  for(let r=0;r<n;r++){const y=2+(n-1-r);for(let q=0;q<w;q++){const t=rows[r][q]||' ',x=base+q;
   if(t==='c'||t==='H'||t==='U'||t==='T')m.oggetti.push({tipo:t,x,y,fase:x});
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
 pezzo(["          ","##########"]);
 m.start={x:3,y:2.97};
 (lista||CORSE[i]).forEach(n=>{m.nomi.push({x:m.w,n});(FINTI[n]||[]).forEach(f=>{const r=[m.w+f[0],f[1],m.w+f[2],f[3]];m.finti.push(r);for(let y=r[1];y<=r[3];y++)for(let x=r[0];x<=r[2];x++)m.fintoSet.add(y+'_'+x);});pezzo(PEZZI[n]);});
 pezzo(["                ","                ","################"]);
 m.fine=m.w-6;
 for(let y=0;y<ALTO;y++)for(let x=0;x<m.w;x++)if(g[y][x]===undefined)g[y][x]=' ';
 const dc=MONDI[i].decor;m.decor=[];for(let x=1;x<m.w-8;x++){const h=(x*2654435761>>>0)>>>7;if(h%7<2&&g[2][x]==='#'&&g[3][x]===' '&&!m.oggetti.some(o=>o.x===x&&o.y===3)){let n=dc[(h>>>3)%dc.length],dx=0;if(n==='erbananas'){/* il ciuffo è largo più di 3 caselle: deve stare tutto sul piano, se no rientra un po' a sinistra, o diventa erba */const r=213/68/2,su=v=>{for(let k=Math.floor(x+v-r+.5);k<=Math.floor(x+v+r+.5);k++)if(g[2][k]!=='#'||(g[3][k]||' ')!==' ')return false;return true;};dx=[0,-.5,-1,-1.5,-2,.5,1].find(su);if(dx===undefined){n='grass';dx=0;}}m.decor.push({x,dx,n});}}
 return m;
}
const cel=(x,y)=>{const r=M.g[y];return r?(r[x]||' '):' ';};
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
const FIATO_SCATTO=.3,FIATO_LANCIO=.2;
function aggFiato(){const f=$('fiatoB');if(f){f.style.width=(G.fiato*100)+'%';$('fiato').classList.toggle('basso',G.fiato<FIATO_SCATTO);}}
function usaFiato(q){if(P2.stanco>0)return false;if(G.carica>=1)return true; /* da bomba non si stanca */if(G.fiato<q){senzaFiato();return false;}G.fiato-=q;G.fiatoT=2;aggFiato();return true;}
function senzaFiato(){const p=P2;p.stanco=2;p.rotola=false;p.vx=0;p.carica=0;p.scatto=0;p.buf=0;suono(260,.5,'sine',.08,140);vibra(40);if(!G.dettoFiato){G.dettoFiato=true;avviso('Senza fiato! Matteo è grasso: riposa 2 secondi. Mangia la pizza per riprendere fiato',2600);}}
function scatta2(){if(P2.cd>0||!usaFiato(FIATO_SCATTO))return;const d=Math.abs(IN.tx)>.15?Math.sign(IN.tx):P2.verso;P2.verso=d;P2.catena=Math.abs(P2.vx)>=8?2:1;P2.vS=Math.max(11,Math.abs(P2.vx)+3);P2.vyS=Math.max(P2.vy,0);P2.scatto=.24;P2.cd=1.1;P2.Wv-=7;if(P2.ultimoSuolo)sbuffo();sfx('throw')||suono(220,.18,'sawtooth',.1,800);vibra(15);$('aSin').classList.remove('pronto');}
function colpito2(nx,spina){
 if(P2.inv>0||G.stella>0||G.stato!=='gioco')return;
 /* se è una bomba, le spine e i nemici con le spine la fanno esplodere: niente cuore perso */
 if(G.carica>=1&&spina){esplodi();P2.inv=Math.max(P2.inv,1);return;}
 P2.inv=1.5;P2.vx=nx*6;P2.vy=6;P2.Wv+=8;
 if(G.scudo){G.scudo=false;suono(900,.25,'triangle',.1,300);schizzi2(P2.x,P2.y,16,'#7fe0ff',5);avviso('Scudo rotto',900);return;}
 togliCuore();sfx('hurt')||suono(150,.25,'square',.1,70);vibra(60);schizzi2(P2.x,P2.y,12,'#d8432e',5);
}
function raccogli(o){
 if(o.tipo==='c'){G.gettoni++;$('gett').textContent=G.gettoni;G.fiato=Math.min(1,(G.fiato||0)+.25);G.carica=Math.min(1,G.carica+.08);aggBarra();if(G.carica>=.25&&!G.avvisato){G.avvisato=true;avviso('Sei esplosivo: cadi da molto in alto o sbatti forte!',2600);}sfx('coin')||suono(880,.09,'triangle',.08,1320);}
 else if(o.tipo==='H'){G.cuori++;hud();sfx('gem')||suono(520,.3,'sine',.12,1040);avviso('+1 cuore',900);schizzi2(o.x,o.y,12,'#d8432e',4);}
 else if(o.tipo==='U'){G.scudo=true;sfx('magic')||suono(440,.3,'triangle',.1,880);avviso('Scudo: para il prossimo colpo',1400);}
 else if(o.tipo==='Z'){G.carica=Math.min(1,G.carica+.4);aggBarra();sfx('magic')||suono(300,.3,'square',.08,600);avviso('Esplosione più forte',900);}
 else if(o.tipo==='T'){G.stella=7;sfx('magic')||suono(660,.5,'square',.08,1320);avviso('Stella: travolgi tutto per 7 secondi',1600);}
}
function rompiCassa(x,y){combo();M.g[y][x]=' ';const k=(x*7+y*3)%5,t=['H','c','U','Z','c','T'][(x*7+y*3)%6];schizzi2(x,y,16,'#c28a48',5);sfx('disappear')||suono(200,.15,'square',.09,90);
 if(t==='c')for(let j=0;j<3;j++)M.oggetti.push({tipo:'c',x:x-.6+j*.6,y:y+.2,fase:x+j});else M.oggetti.push({tipo:t,x,y,fase:x});}
/* il peso: scivola dove inclini il telefono e Matteo lo può spingere; sul pulsante apre la porta */
const PESO_R=.5,PESO_M=4.5;
function passoPesi(h){
 const p=P2;
 for(const a of M.pesi){if(Math.abs(a.x-p.x)>24)continue;
  const su=!!a.suolo;a.vx+=IN.tx*(su?5:2)*h;a.vx*=Math.exp(-(su?(Math.abs(IN.tx)<.1?3:.9):.1)*h);a.vx=clamp(a.vx,-4,4);a.vy-=(su&&a.suolo.y<.95?10:20)*h; /* in pendenza Matteo riesce a spingerlo su, l'inclinazione da sola no */
  a.px=a.x;a.py=a.y;a.x+=a.vx*h;a.y+=a.vy*h;urta(a,PESO_R);
  const dx=a.x-p.x,dy=a.y-p.y,d=Math.hypot(dx,dy),min=p.R+PESO_R;
  if(d<min&&d>1e-6){const nx=dx/d,ny=dy/d,pen=min-d;
   if(ny<-.5){p.x-=nx*pen;p.y-=ny*pen;const vn=(p.vx-a.vx)*nx+(p.vy-a.vy)*ny;if(vn>0){p.vx-=vn*nx;p.vy-=vn*ny;}p.suolo={x:-nx,y:-ny};}
   else{const q=1.6/(1.6+PESO_M);p.x-=nx*pen*(1-q);p.y-=ny*pen*(1-q);a.x+=nx*pen*q;a.y+=Math.min(0,ny*pen*q);
    const vr=(a.vx-p.vx)*nx+(a.vy-p.vy)*ny;if(vr<0){const j=-1.05*vr/(1/1.6+1/PESO_M);a.vx=clamp(a.vx+j*nx/PESO_M,-4,4);a.vy+=Math.min(0,j*ny/PESO_M);p.vx-=j*nx/1.6;p.vy-=j*ny/1.6;}}}
  if(a.y<-4){a.x=a.x0;a.y=a.y0+.5;a.vx=a.vy=0;schizzi2(a.x,a.y,10,'#c9c9d4',4);suono(500,.3,'sine',.08,200);avviso('Il peso è caduto: è tornato al suo posto',1800);}
  if(a.suolo)calpesta(a.x,a.y-PESO_R);
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
  else{k.via+=dt;const libero=Math.hypot(p.x-k.x,p.y-k.y)>1.2&&M.pesi.every(a=>Math.hypot(a.x-k.x,a.y-k.y)>1.2);if(k.via>4&&libero){M.g[k.y][k.x]=k.c;k.t=-1;}}}
}
/* muri crepati: solo l'esplosione li apre */
function rompiCrepa(x,y){M.g[y][x]=' ';schizzi2(x,y,10,'#b0643a',6);if(!M.dettaCrepa){M.dettaCrepa=true;avviso('Muro aperto: dentro c’è una stanza segreta!',2200);}}
/* combo: nemici e casse travolti uno dopo l'altro valgono di più */
function combo(){if(P2.slancio>0)P2.slancio=Math.max(P2.slancio,.8);G.combo=G.comboT>0?(G.combo||0)+1:1;G.comboT=1.5;if(G.combo>=2){G.gettoni+=G.combo;$('gett').textContent=G.gettoni;G.comboV={n:G.combo,t:G.t};suono(400+G.combo*90,.12,'triangle',.09,800+G.combo*120);}}
const AIUTI={burrone:'Fosso troppo largo e sponda troppo alta: dai un colpo secco al telefono verso destra per lanciare Matteo',magazzino:'Il peso apre la porta se cade sul pulsante: rompi le casse con lo scatto per liberarlo',crollo:'Il ponte crolla appena ci sali: non fermarti!',valanga:'Lanciati giù per la discesa: a tutta velocità travolgi nemici e casse'};
function passo2d(h){
 const p=P2;p.cd=Math.max(0,p.cd-h);if(p.cd===0)$('aSin').classList.add('pronto');p.inv=Math.max(0,p.inv-h);p.buf=Math.max(0,p.buf-h);p.coyote=Math.max(0,p.coyote-h);
 if(p.stanco>0){p.stanco-=h;p.rotola=false;p.carica=0;p.vx=0;if(p.stanco<=0){p.stanco=0;G.fiato=Math.max(G.fiato,.4);}}else{G.fiatoT=Math.max(0,(G.fiatoT||0)-h);if(G.fiatoT<=0)G.fiato=Math.min(1,(G.fiato||0)+.07*h);} /* Matteo è grasso: riprende fiato piano, solo dopo 2 secondi senza scatti */
 const tx=p.stanco>0?0:IN.tx;if(Math.abs(tx)>.08)p.verso=Math.sign(tx);
 p.px=p.x;p.py=p.y;const vy0=p.vy;
 p.animT+=h;const su0=!!p.ultimoSuolo;
 p.carica=Math.abs(tx)>.3?p.carica+h:0;
 if(!p.rotola&&!(p.stanco>0)&&(p.carica>.15||Math.abs(p.vx)>3||p.scatto>0)){p.rotola=true;p.anim='chiude';p.animT=p.scatto>0?.1:0;p.Wv-=6;}
 else if(p.rotola&&su0&&Math.abs(p.vx)<1.2&&Math.abs(tx)<.25&&p.scatto<=0){p.rotola=false;p.anim='apre';p.animT=0;p.carica=0;p.Wv+=4;}
 /* durante lo scatto non cade, ma la salita frena come sempre e gli urti non la aumentano: niente salti più alti né arrampicate sugli spigoli */
 if(p.scatto>0){p.scatto-=h;p.vx=p.verso*(p.vS||11);p.vyS=Math.max(0,Math.min(p.vy,p.vyS||0)-20*h);p.vy=p.vyS;if(p.scatto<=0)p.vx*=.6;
  const q=Math.round(p.x+p.verso*.8),r=Math.round(p.y);if(cel(q,r)==='C')rompiCassa(q,r);}
 else{
  /* in pendenza accelera la gravità: inclinare in discesa aggiunge poco, in salita aiuta a salire */
  const su=su0,n=p.ultimoSuolo,pend=su&&n.y<.95,giu=pend?Math.sign(n.x):0;p.vx+=tx*(!p.rotola?16:pend?(Math.sign(tx)===giu?6:24):su?30:15)*h;
  /* lanciato da una discesa conserva la velocità: niente freno né tetto finché dura lo slancio */
  const k=Math.exp(-(p.slancio>0||p.lancio>0?.15:pend?.6:Math.abs(tx)<.1&&su?3.2:su?1.4:.2)*h);p.vx*=k;const tetto=p.rotola?5.5+Math.max(0,Math.abs(tx)-.5)*12:3.4;if(Math.abs(p.vx)>tetto&&!(p.slancio>0)&&!(p.lancio>0))p.vx=lerp(p.vx,Math.sign(p.vx)*tetto,1-Math.exp(-h*8));
  if(p.bolla>0){p.bolla-=h;p.vy+=(2.3-p.vy)*Math.min(1,h*5);p.vx*=Math.exp(-.6*h);}else p.vy-=(pend?14:20)*h;
 }
 p.x+=p.vx*h;p.y+=p.vy*h;p.x=Math.max(p.R,p.x);
 p.lancio=Math.max(0,(p.lancio||0)-h);
 const n0=p.ultimoSuolo;if(n0&&n0.y<.95&&Math.sign(n0.x)===Math.sign(p.vx)&&Math.abs(p.vx)>6&&p.rotola)p.slancio=1.1;else if(p.slancio>0)p.slancio=Math.abs(p.vx)<4?0:p.slancio-h;
 if(p.slancio>0){const q=Math.round(p.x+Math.sign(p.vx)*.8),r=Math.round(p.y);if(cel(q,r)==='C')rompiCassa(q,r);}
 const vx0=p.vx;p.urtoX=0;urta(p,p.R);
 /* in discesa resta attaccato alla rampa invece di decollare */
 if(!p.suolo&&p.ultimoSuolo&&p.vy<=1&&p.scatto<=0)for(let d=.04;d<=.45;d+=.04){const q={x:p.x,y:p.y-d,px:p.x,py:p.py,vx:0,vy:0};urta(q,p.R);if(q.suolo){const n=q.suolo,v=Math.hypot(p.vx,p.vy),dir=Math.sign(p.vx*n.y-p.vy*n.x)||1;p.y=q.y;p.suolo=n;p.vx=n.y*v*dir;p.vy=-n.x*v*dir;break;}}
 if(M.pesi)passoPesi(h);if(p.suolo&&M.crolli)calpesta(p.x,p.y-p.R);
 if(p.urtoX&&Math.abs(vx0)>=7&&Math.abs(p.vx)<Math.abs(vx0)*.5)botto();
 if(p.suolo&&!p.ultimoSuolo&&vy0<-12)botto();
 if(p.suolo&&!p.ultimoSuolo&&vy0<-4)p.atterra=.2;p.atterra=Math.max(0,p.atterra-h);p.fermoT=p.suolo&&Math.abs(p.vx)<.25&&!p.rotola?p.fermoT+h:0;if(p.fermoT>6.3)p.fermoT=0;
 if(p.suolo){p.bollaUsata=false;if(p.lancio<LANCIO_T-.15)p.lancio=0;if(p.bolla>0&&p.suolo.y>.5&&p.vy<=0)p.bolla=0;if(vy0<-7&&!p.ultimoSuolo){p.Wv-=Math.min(14,-vy0*.9);suono(120,.08,'sine',.08);}p.coyote=.1;
  const q=Math.round(p.x),r=Math.round(p.y-p.R-.3);if(p.suolo.y>.9&&cel(q,r)==='#'&&cel(q-1,r)==='#'&&cel(q+1,r)==='#'){p.sx=q;p.sy=r+1.2;}}
 /* cadendo da un punto più alto fa un rimbalzino */
 if(p.suolo&&!p.ultimoSuolo&&vy0<-10.5&&p.vy<=0){p.vy=Math.min(-vy0*.22,3);p.y+=.02;p.suolo=null;}
 p.ultimoSuolo=p.suolo;
 if(p.buf>0&&p.coyote>0){polvere();p.vy=9.6;p.coyote=0;p.buf=0;p.ultimoSuolo=null;p.Wv+=7;sfx('jump')||suono(330,.14,'triangle',.11,660);}
 const bq=Math.round(p.x),br=Math.round(p.y-p.R+.1);
 if(cel(bq,br)==='B'&&p.vy<=.1){M.molla={k:br+'_'+bq,t:G.t};polvere();p.vy=14;p.ultimoSuolo=null;p.y=br+.1+p.R;p.Wv+=11;sfx('jump-high')||suono(260,.3,'square',.08,900);}
 for(const dx of[-.28,.28]){const q=Math.round(p.x+dx),r=Math.round(p.y-p.R+.15),t=cel(q,r);
  if((t==='^'||t==='!')&&M.spine[r+'_'+q].s>.55)colpito2(-Math.sign(p.vx||1),true);}
 const w=clamp(p.W,-.5,.5);p.Wv+=(-160*p.W-11*p.Wv)*h;p.W+=p.Wv*h;p.W=w===p.W?p.W:clamp(p.W,-.5,.5);
 p.rot-=p.vx*h/p.R*.5;p.passi+=Math.abs(p.vx)*h*4.6;
 if(p.ultimoSuolo&&Math.abs(p.vx)<.7){const q=Math.atan2(Math.sin(p.rot),Math.cos(p.rot));p.rot-=q*Math.min(1,h*12);}
 if(p.y<-4){togliCuore();if(G.stato==='gioco'){p.x=p.sx||M.start.x;p.y=(p.sy||M.start.y)+1;p.vx=p.vy=0;p.inv=1.6;p.scatto=0;suono(500,.4,'sine',.1,90);}}
 if(!M.boss&&p.x>M.fine&&G.stato==='gioco'){G.stato='velo';dissolvi(()=>M.prova?finisciProva():entraBoss(M.i));}
}
function passoOggetti(dt){
 const p=P2;aggFiato();G.comboT=Math.max(0,(G.comboT||0)-dt);if(M.crolli)passoCrolli(dt);
 for(const q of M.nomi||[])if(!q.detto&&p.x>q.x+1.5&&AIUTI[q.n]){q.detto=true;avviso(AIUTI[q.n],3800);}
 if(!M.boss&&!M.dettaCrepa&&!M.vistaCrepa&&cel(Math.round(p.x+p.verso*1.2),Math.round(p.y))==='X'){M.vistaCrepa=true;avviso('Muro crepato: si apre solo con l’esplosione. Mangia pizza e sbattici contro forte',3000);}
 for(let i=M.oggetti.length-1;i>=0;i--){const o=M.oggetti[i];if(Math.abs(o.x-p.x)<.75&&Math.abs(o.y-p.y)<.8){raccogli(o);M.oggetti.splice(i,1);}}
 for(const k in M.spine){const a=M.spine[k];if(a.t==='!'){const on=Math.sin(G.t*1.4+a.fase)>0;a.s=lerp(a.s,on?1:.1,1-Math.exp(-dt*12));}}
}
function uccidi2(n){combo();n.vivo=false;G.uccisi++;G.gettoni+=2;$('gett').textContent=G.gettoni;sfx('bump')||suono(180,.2,'square',.1,60);vibra(25);}
function passoNemici2(dt){
 const p=P2;
 for(const n of M.nemici){if(!n.vivo||Math.abs(n.x-V.cx)>22)continue;n.fase+=dt;
  if(n.tipo==='e'){n.x+=n.vx*dt;const d=Math.sign(n.vx),av=Math.round(n.x+d*.5),r=Math.round(n.y);if(pieno(cel(av,r))||!(pieno(cel(av,r-1))||cel(av,r-1)==='-'))n.vx*=-1;}
  else if(n.tipo==='r'){const d=p.x-n.x;n.vx=lerp(n.vx,Math.abs(d)<9?Math.sign(d)*2.3:0,1-Math.exp(-dt*2.5));n.vy-=26*dt;n.px=n.x;n.py=n.y;n.x+=n.vx*dt;n.y+=n.vy*dt;urta(n,.42);if(n.y<-4){n.vivo=false;G.uccisi++;}}
  else if(n.tipo==='f'){n.x=n.x0+Math.sin(n.fase*.8)*2.4;n.y=n.y0+Math.sin(n.fase*1.7)*.8;}
  else if(n.tipo==='g'){n.t-=dt;if(n.t<=0&&Math.abs(n.x-p.x)<10){n.t=3;const d=Math.sign(p.x-n.x)||-1;M.colpi.push({x:n.x+d*.6,y:n.y,vx:d*4.5,v:3.6});suono(300,.12,'square',.05,120);}}
  const d=Math.hypot(p.x-n.x,p.y-n.y),rn=n.tipo==='r'?.45:.42;
  if(d<p.R+rn){
   /* si ricontrolla per ogni nemico: lo scatto può essere finito su quello prima */
   const forte=p.scatto>0||G.stella>0||p.slancio>0;
   if(forte){const colpo=p.scatto>0&&G.stella<=0;uccidi2(n);
    /* lo scatto elimina tutti i nemici nel blocco del primo (due blocchi se slanciato): slanciato va avanti, lento rimbalza indietro */
    if(colpo){const v=Math.sign(p.vx)||p.verso,raggio=p.catena||1;p.cd=Math.min(p.cd,.3);
     for(const o of M.nemici)if(o.vivo&&Math.abs(o.y-n.y)<1.2&&(o.x-n.x)*v>-.6&&(o.x-n.x)*v<raggio+.5)uccidi2(o);
     if(raggio<2){p.scatto=0;p.vx=-v*2.5;p.vy=Math.max(p.vy,3.5);p.ultimoSuolo=null;}p.inv=Math.max(p.inv,.25);}}
   /* saltandogli in testa muore, tranne i nemici con le spine (r) e i blocchi che sparano (g) */
   else if((n.tipo==='e'||n.tipo==='f')&&p.vy<0&&p.y>n.y+.35){uccidi2(n);p.vy=7;p.Wv+=7;p.ultimoSuolo=null;}
   else colpito2(Math.sign(p.x-n.x)||1,n.tipo==='r');
  }
 }
 for(let i=M.colpi.length-1;i>=0;i--){const c=M.colpi[i];c.x+=c.vx*dt;c.y+=(c.vy||0)*dt;c.v-=dt;if(c.v<0||pieno(cel(Math.round(c.x),Math.round(c.y)))){M.colpi.splice(i,1);continue;}if(Math.abs(c.x-p.x)<.55&&Math.abs(c.y-p.y)<.5&&p.scatto<=0)colpito2(Math.sign(c.vx)||1);}
 for(let i=goo.length-1;i>=0;i--){const q=goo[i];q.v-=dt;q.vy-=16*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.v<=0)goo.splice(i,1);}
}
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
 if(st.stella>0){c.strokeStyle=`hsl(${t*400%360},95%,62%)`;c.lineWidth=r*.2;c.stroke(pa);}
 if(st.scudo){c.strokeStyle='#7fe0ffcc';c.lineWidth=3;c.beginPath();c.arc(x,y,r*1.42,0,6.3);c.stroke();}
 c.restore();
}
function cuoreP(c,x,y,s){c.beginPath();c.moveTo(x,y+s*.55);c.bezierCurveTo(x-s*1.1,y-s*.2,x-s*.55,y-s*.95,x,y-s*.35);c.bezierCurveTo(x+s*.55,y-s*.95,x+s*1.1,y-s*.2,x,y+s*.55);c.fill();}
function fondale(c,m){const h=Math.max(V.H*.66,200),w=h,f=FONDI[m.fondo],nv=FONDI.clouds;c.fillStyle='#c4e2ff';c.fillRect(0,0,V.W,V.H);
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
function disegna2d(){
 const c=ctx2,m=MONDI[M.i],ts=V.ts,W=V.W,H=V.H,p=P2,k=m.kit,k0=k;
 c.setTransform(V.dpr,0,0,V.dpr,0,0);fondale(c,m);if(G.scossa>0)c.translate(rnd(-5,5)*G.scossa*2,rnd(-5,5)*G.scossa*2);
 const sx=x=>(x-V.cx)*ts+W/2,sy=y=>H/2-(y-V.cy)*ts,mz=ts+.8,lento=Math.floor(G.t*3)%2,veloce=Math.floor(G.t*7)%2;
 const c0=Math.floor(V.cx-W/2/ts)-1,c1=Math.ceil(V.cx+W/2/ts)+1,y0=Math.floor(V.cy-H/2/ts)-1,y1=Math.ceil(V.cy+H/2/ts)+1;
 for(const d of M.decor){if(d.x<c0-3||d.x>c1+3)continue;const a=sx(d.x)-ts/2,b=sy(3)-ts/2;if(d.n==='ananas')c.drawImage(ANAN,a,b,ts,ts);else if(d.n==='erbananas')ciuffo(c,sx(d.x+d.dx),sy(2.5),ts);else sp(c,d.n,a,b,ts,ts);}
 if(!M.boss){sp(c,'sign_right',sx(M.start.x+2)-ts/2,sy(3)-ts/2,ts,ts);sp(c,'sign_exit',sx(M.fine-3)-ts/2,sy(3)-ts/2,ts,ts);
 sp(c,'door_open',sx(M.fine+1)-ts*.8,sy(3)-ts*1.1,ts*1.6,ts*1.6);sp(c,'door_open_top',sx(M.fine+1)-ts*.8,sy(4)-ts*1.1,ts*1.6,ts*1.6);}
 for(const f of M.finti||[]){if(f[2]<c0||f[0]>c1)continue;for(let y=f[1];y<=f[3];y++)for(let x=f[0];x<=f[2];x++)if(!pieno(cel(x,y))){const a=sx(x)-ts/2,b=sy(y)-ts/2;paes(c,pieno(cel(x,y+1))?PAES_GROTTA.cielo:PAES_GROTTA.fondo,a,b,mz,mz);}}
 for(let y=Math.max(y0,-20);y<=y1;y++)for(let x=c0;x<=c1;x++){const a=sx(x)-ts/2,b=sy(y)-ts/2;
  if(y<=0&&cel(x,0)!=='#'){if(M.boss&&(x<0||x>=M.w))continue;sp(c,m.liquido+(y===0?(lento?'_top':'_top_low'):''),a,b,mz,mz);continue;}
  const t=y<0?'#':cel(x,y);if(t===' ')continue;
  if(t==='#'){const r=cel(x,y+1),su=!solidoK(x,y+1);let bordo;if(k==='sand'&&PAES.complete&&((r==='%'&&'%#'.includes(cel(x+1,y)))||(r==='/'&&'/#'.includes(cel(x-1,y)))))paes(c,PAES_SOTTO,a,b,mz,mz,r==='/');
  else if(k==='sand'&&PAES.complete&&!su&&colonna(x,y))paes(c,PAES_COLONNA,a,b,mz,mz);
  else if(k==='sand'&&PAES.complete&&!su&&(bordo=[-1,1].find(d=>pianoAlMuro(x+d,y,d)==='v')))paes(c,PAES_UNIONE,a,b,mz,mz,bordo>0);
  else if(k==='sand'&&PAES.complete&&su&&(y<=0||solidoK(x,y-1))&&(bordo=latoPiano(x,y)))paes(c,bordo[0]==='m'&&colonna(x+bordo[1],y)?PAES_LATO_COLONNA:PAES_BORDO[bordo[0]],a,b,mz,mz,(bordo[1]>0)!==(bordo[0]==='v'));else sp(c,nomeTile(x,y,k),a,b,mz,mz);}
  else if(t==='C')sp(c,'block_exclamation',a,b,mz,mz);
  else if(t==='D')sp(c,'lock_blue',a,b,mz,mz);
  else if(t==='X')sp(c,'bricks_brown',a,b,mz,mz);
  else if(t==='P'){const k=M.pulsanti.find(q=>q.x===x&&q.y===y);sp(c,k&&k.giu?'switch_blue_pressed':'switch_blue',a,b,mz,mz);}
  else if(t==='y'){const k=M.crolli[y+'_'+x],tr=k&&k.t>.4?rnd(-1.5,1.5):0;sp(c,nomeTile(x,y,k0),a+tr,b,mz,mz);}
  else if(t==='x'){const k=M.crolli[y+'_'+x],tr=k&&k.t>=0?rnd(-2,2):0;sp(c,k&&k.t>=0?'block_fall':'block_idle',a+tr,b,mz,mz);}
  else if(t==='-'){const l=cel(x-1,y)==='-',r=cel(x+1,y)==='-';sp(c,'terrain_'+k+'_cloud_'+(l&&r?'middle':l?'right':r?'left':'middle'),a,b,mz,mz);}
  else if(t==='/')sp(c,'terrain_'+k+'_ramp_short_b',a,b,mz,mz,true);
  else if(t==='%')sp(c,'terrain_'+k+'_ramp_short_b',a,b,mz,mz);
  else if(t==='B')sp(c,M.molla&&M.molla.k===y+'_'+x&&G.t-M.molla.t<.25?'spring_out':'spring',a,b,mz,mz);
  else if(t==='^'||t==='!'){const s=M.spine[y+'_'+x].s;sp(c,'spikes',a,b+ts*(1-s),mz,mz*s);}
 }
 for(const key in M.crolli||{}){const k=M.crolli[key];if(k.c==='x'&&M.g[k.y][k.x]!=='x'&&k.via>3.3&&k.x>=c0&&k.x<=c1){c.globalAlpha=.35;sp(c,'block_rest',sx(k.x)-ts/2,sy(k.y)-ts/2,mz,mz);c.globalAlpha=1;}}
 for(const a of M.pesi||[]){if(a.x<c0-2||a.x>c1+2)continue;const z=ts*1.15;sp(c,'weight',sx(a.x)-z/2,sy(a.y-PESO_R)-z*.98,z,z);}
 for(const o of M.oggetti){if(o.x<c0-1||o.x>c1+1)continue;const a=sx(o.x)-ts/2,b=sy(o.y+Math.sin(G.t*3+o.fase)*.08)-ts/2;
  if(o.tipo==='c'){c.drawImage(PIZZA,a+ts*.03,b+ts*.03,ts*.94,ts*.94);}
  else sp(c,o.tipo==='H'?'heart':o.tipo==='U'?'gem_blue':o.tipo==='Z'?'bomb':'star',a,b,ts,ts);}
 for(const n of M.nemici){if(!n.vivo||n.x<c0-1||n.x>c1+1)continue;const a=sx(n.x),b=sy(n.y),z=ts*1.1,pas=Math.floor(G.t*7+n.fase)%2?'_a':'_b';
  if(n.tipo==='e'){const pie=sy(Math.round(n.y+.1)-.5),q=Math.sin(G.t*12+n.fase),dv=n.vx>0?1:-1;
   if(m.nemico==='ananas'&&NEMICO.complete){const hh=ts*1.3,ww=hh*NEMICO.width/NEMICO.height,sal=Math.abs(q)*ts*.08,s=c.imageSmoothingEnabled;c.save();c.translate(a,pie-sal);c.rotate(q*.08);if(dv>0)c.scale(-1,1);c.imageSmoothingEnabled=false;c.drawImage(NEMICO,-ww/2,-hh,ww,hh);c.imageSmoothingEnabled=s;c.restore();}
   else sp(c,m.nemico+'_walk'+pas,a-z/2,pie-z,z,z,dv>0);}
  else if(n.tipo==='r')sp(c,'slime_spike_walk'+pas,a-z/2,b+ts*.45-z,z,z,n.vx>0);
  else if(n.tipo==='f')sp(c,m.volo+pas,a-z/2,b-z/2,z,z,Math.cos(n.fase*.8)>0);
  else if(n.tipo==='g')sp(c,'block_strong_danger',a-ts/2,b-ts/2,mz,mz);
 }
 disegnaBoss(c,sx,sy,ts);
 for(const q of M.colpi)sp(c,'fireball',sx(q.x)-ts*.4,sy(q.y)-ts*.4,ts*.8,ts*.8,q.vx>0);
 for(const f of polveri)disegnaPolvere(c,sx(f.x),sy(f.y),ts*1.9,(G.t-f.t)/.45);
 for(const f of fumi)disegnaFumo(c,sx(f.x),sy(f.y),ts*1.2,f.v,(G.t-f.t)/.55);
 if(G.carica>=MIN_BOTTO){const k=.15+G.carica*.45+.08*Math.sin(G.t*12),rg=p.R*ts*2.2,cx=sx(p.x),cy=sy(p.y),gr=c.createRadialGradient(cx,cy,p.R*ts*.5,cx,cy,rg);gr.addColorStop(0,`rgba(255,90,20,${k})`);gr.addColorStop(1,'rgba(255,90,20,0)');c.fillStyle=gr;c.beginPath();c.arc(cx,cy,rg,0,6.3);c.fill();}
 c.save();if(p.bolla>0&&!riduci)c.translate(rnd(-1.6,1.6),rnd(-1.6,1.6));
 if(!(p.inv>0&&Math.floor(G.t*14)%2===0)){const op={t:G.t,W:p.W,vx:p.vx,vy:p.vy,n:p.ultimoSuolo,stella:G.stella,scudo:G.scudo};
  const n=p.ultimoSuolo,r=p.R*ts*1.02,pie=sy(p.y-p.R),ang=n?Math.atan2(n.x,n.y):0,am=amico();
  stancoVis=G.carica>=1?0:p.stanco>0?2:G.fiato<FIATO_SCATTO?1:0;
  if(stancoVis===2)disegnaCamm(c,sx(p.x),pie,r,p.stanco<.35?3:4+Math.floor(G.t*3)%2,3,p.verso,0,ang);
  else if(G.carica>=1){const fr=p.inv>0?34:G.t%1.3<.09?18:p.rotola?0:!n?(p.vy<-7?35:19):Math.abs(p.vx)<.25?(p.fermoT>5?Math.floor((p.fermoT-5)*7)%9:36):19+Math.floor(p.passi)%10;
   disegnaBomba(c,sx(p.x),pie,r,fr,p.rotola?1:p.verso,p.W,p.rotola?0:ang,p.rotola?-p.rot*2:0);
   if(G.scudo){c.strokeStyle='#7fe0ffcc';c.lineWidth=3;c.beginPath();c.arc(sx(p.x),pie-r*1.1,r*1.5,0,6.3);c.stroke();}}
  else if(p.rotola&&!(p.anim==='chiude'&&p.animT<.2)){
   op.disegno=am.skin==='classica'||!!am.foto;op.foto=am._img;disegnaSlime(c,sx(p.x),sy(p.y),r,-p.rot,op);}
  else{
   if(p.rotola)disegnaPasso(c,sx(p.x),pie,r,Math.min(2,Math.floor(p.animT/.067)),2,p.verso,p.W,ang);
   else if(p.anim==='apre'&&p.animT<.2)disegnaPasso(c,sx(p.x),pie,r,p.animT<.1?2:1,2,p.verso,p.W,ang);
   else if(p.atterra>0)disegnaCamm(c,sx(p.x),pie,r,4,3,p.verso,p.W,ang);
   else if(!n)disegnaCamm(c,sx(p.x),pie,r,p.vy>2.5?1:p.vy<-2.5?3:2,3,p.verso,p.W,0);
   else if(Math.abs(p.vx)<.25){const col=p.fermoT>5?Math.floor((p.fermoT-5)*8)%10:[0,1,2,1][Math.floor(G.t*1.5)%4];disegnaCamm(c,sx(p.x),pie,r,col,0,p.verso,p.W+Math.sin(G.t*3)*.01,ang);}
   else disegnaCamm(c,sx(p.x),pie,r,Math.floor(p.passi)%10,Math.abs(p.vx)>2.3?2:1,p.verso,p.W,ang);
   if(G.scudo){c.strokeStyle='#7fe0ffcc';c.lineWidth=3;c.beginPath();c.arc(sx(p.x),sy(p.y),p.R*ts*1.5,0,6.3);c.stroke();}
   if(G.stella>0){c.strokeStyle=`hsl(${G.t*400%360},95%,62%)`;c.lineWidth=3;c.beginPath();c.arc(sx(p.x),sy(p.y),p.R*ts*1.3,0,6.3);c.stroke();}}}
 stancoVis=0;c.restore();
 if(p.bolla>0)bollaSapone(c,sx(p.x),sy(p.y),p.R*ts*(1.75+.06*Math.sin(G.t*9)),Math.min(1,p.bolla/.25),ts);
 if(G.boom){const e=(G.t-G.boom.t)/.55;if(e<1)disegnaEspl(c,sx(G.boom.x),sy(G.boom.y),G.boom.r*ts,e);else G.boom=null;}
 for(const f of M.finti||[]){if(f[2]<c0||f[0]>c1)continue;const dentro=p.x>f[0]-.7&&p.x<f[2]+.7&&p.y>f[1]-.7&&p.y<f[3]+.7;f.a=lerp(f.a===undefined?1:f.a,dentro?.05:1,.15);
  const g=clamp((1-f.a)/.7,0,1);if(g>.01){c.globalAlpha=g;/* pavimento con sotto la casella che torna gialla; il soffitto resta giallo; i muri ai lati solo se la grotta ha il pavimento: nei tunnel aperti sotto si vede solo l'interno */
   const gr=(x,y,i,capo,flip)=>{if(pieno(cel(x,y)))paes(c,i,sx(x)-ts/2,sy(y)-ts/2,mz,mz,flip,capo);};let pav=false;for(let x=f[0];x<=f[2];x++)pav=pav||pieno(cel(x,f[1]-1));if(pav)for(let y=f[1];y<=f[3];y++){const al=y===f[3]&&pieno(cel(f[0],y+1)),ar=y===f[3]&&pieno(cel(f[2],y+1));gr(f[0]-1,y,al?PAES_GROTTA.angolo:PAES_GROTTA.muro);gr(f[2]+1,y,ar?PAES_GROTTA.angolo:PAES_GROTTA.muro,false,true);}const ms=pav&&pieno(cel(f[0]-1,f[1])),md=pav&&pieno(cel(f[2]+1,f[1]));if(ms){gr(f[0]-1,f[1]-1,PAES_GROTTA.muroPav);gr(f[0]-1,f[1]-2,PAES_GROTTA.muroBase);}if(md){gr(f[2]+1,f[1]-1,PAES_GROTTA.muroPav,false,true);gr(f[2]+1,f[1]-2,PAES_GROTTA.muroBase,false,true);}
   for(let x=f[0];x<=f[2];x++){if(pieno(cel(x,f[1]-1))){const ang=x===f[0]&&ms?1:x===f[2]&&md?-1:0;gr(x,f[1]-1,ang?PAES_GROTTA.pavMuro:PAES_GROTTA.pav,false,ang<0);gr(x,f[1]-2,PAES_GROTTA.base);}}}
  c.globalAlpha=f.a;
  for(let y=f[1];y<=f[3];y++)for(let x=f[0];x<=f[2];x++)if(!pieno(cel(x,y)))sp(c,nomeTile(x,y,k),sx(x)-ts/2,sy(y)-ts/2,mz,mz);c.globalAlpha=1;}
 if(G.comboV&&G.t-G.comboV.t<.9){const e=(G.t-G.comboV.t)/.9,z=ts*(.9+Math.min(1,e*6)*.35+G.comboV.n*.04);c.save();c.globalAlpha=1-e*e;c.font=`400 ${z}px "Bowlby One","Arial Black",sans-serif`;c.textAlign='center';c.lineWidth=z*.16;c.strokeStyle='#2a1a10';c.fillStyle='#f6c445';const tx=sx(p.x),ty=sy(p.y+1.6+e*1.2);c.strokeText('x'+G.comboV.n,tx,ty);c.fillText('x'+G.comboV.n,tx,ty);c.restore();}
 if(p.slancio>0&&!riduci){c.strokeStyle='#ffffffaa';c.lineWidth=3;for(let i=0;i<3;i++){const yy=sy(p.y-.3+i*.3),xx=sx(p.x-Math.sign(p.vx)*(.8+i*.25));c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-Math.sign(p.vx)*ts*(.6+i*.2),yy);c.stroke();}}
 for(const q of goo){c.fillStyle=q.c;c.globalAlpha=clamp(q.v*2.4,0,1);c.beginPath();c.arc(sx(q.x),sy(q.y),q.r*ts,0,6.3);c.fill();}c.globalAlpha=1;
}
const M0={W:0,Wv:0,t:0};
function disegnaMenu(dt){
 const c=ctx2,m=MONDI[0],ts=V.ts,W=V.W,H=V.H;V.cx+=dt*.5;
 c.setTransform(V.dpr,0,0,V.dpr,0,0);fondale(c,m);
 const r=Math.min(W*.15,H*.2),base=H*.84,cols=Math.ceil(W/ts)+1;
 c.drawImage(ANAN,W*.04,base-ts*1.3,ts*1.3,ts*1.3);ciuffo(c,W*.41+ts/2,base,ts);
 for(let y=0;y*ts<H-base+ts;y++)for(let i=0;i<cols;i++)sp(c,'terrain_sand_block_'+(y?'center':'top'),i*ts,base+y*ts,ts+.8,ts+.8);
 M0.t+=dt;if(!riduci&&(M0.t>2.4)){M0.t=0;M0.Wv+=5;}
 M0.Wv+=(-120*M0.W-7*M0.Wv)*dt;M0.W+=M0.Wv*dt;
 disegnaCamm(c,W*.25,base+2,r*.9,riduci?0:Math.floor(G.t*5)%10,0,1,M0.W,0);
}

/* ---------- BOSS 2D SU PIÙ PIANI: si lancia, sbatte, resta stordito ---------- */
const ARENE=[
 ["############################","#                          #","#        c    c    c       #","#     ----------------     #","#                          #","#                          #","#      B            B      #","#--------          --------#","#                          #","#                          #","#                          #","#    B    c      c    B    #","############################","############################"],
 ["############################","#                          #","#   c                  c   #","#-------      c     -------#","#         ----------       #","#                          #","#      B            B      #","#-------            -------#","#         ----------       #","#             c            #","#                          #","#   B  c            c  B   #","###########      ###########","###########      ###########"],
 ["############################","#                          #","#            c             #","#      --------------      #","#  c                    c  #","#-----                -----#","#        B        B        #","#     --------------       #","#                          #","#---                    ---#","#                          #","#  c     B         B    c  #","######   ##########   ######","######   ##########   ######"]
];
/* Ananassone disegnato: fotogrammi da 192x204 in righe da 8, guarda a destra. 0-7 si gira, 8-15 cammina, 16-23 corre, 25 arrabbiato, 29-30 mazza alzata, 31 mazza calata nel lancio, 32-34 stordito */
const NEMICO=new Image();NEMICO.src='assets/nemico_ananas.webp'; /* l'ananas arrabbiato del foglio Pineapple Tiles, nemico del mondo 1 */
const ANAS=new Image();ANAS.src='assets/boss_ananas.webp';
function disegnaAnanas(c,f,z,verso,piedi){if(!ANAS.complete)return false;const k=z/185,oy=piedi?195:118;c.save();if(verso<0)c.scale(-1,1);c.drawImage(ANAS,f%8*192,Math.floor(f/8)*204,192,204,-96*k,-oy*k,192*k,204*k);c.restore();return true;}
const BOSPR=[0,1,2].map(n=>{const k=document.createElement('canvas');k.width=k.height=240;const c=k.getContext('2d'),o='#2b2b3a';c.lineWidth=10;c.lineJoin='round';c.strokeStyle=o;
 if(n===0)c.drawImage(ANAN,0,0,240,240);
 else if(n===1){c.fillStyle='#7d4bc9';c.beginPath();c.moveTo(30,92);c.lineTo(210,92);c.lineTo(120,232);c.closePath();c.fill();c.stroke();c.save();c.clip();c.strokeStyle='#b58cf0';c.lineWidth=10;for(let i=0;i<6;i++){c.beginPath();c.moveTo(0,100+i*28);c.lineTo(240,130+i*28);c.stroke();}c.restore();c.fillStyle='#fff4df';c.beginPath();c.ellipse(120,86,96,20,0,0,6.3);c.fill();c.stroke();c.fillStyle='#7d4bc9';c.fillRect(108,16,24,56);c.strokeRect(108,16,24,56);}
 else{c.fillStyle='#fff4df';c.beginPath();c.moveTo(120,16);c.bezierCurveTo(165,16,160,86,146,104);c.bezierCurveTo(190,150,190,232,120,232);c.bezierCurveTo(50,232,50,150,94,104);c.bezierCurveTo(80,86,75,16,120,16);c.fill();c.stroke();c.fillStyle='#d8432e';c.fillRect(88,96,64,16);c.strokeRect(88,96,64,16);c.fillStyle='#f6c445';c.beginPath();c.moveTo(86,34);c.lineTo(92,4);c.lineTo(106,20);c.lineTo(120,0);c.lineTo(134,20);c.lineTo(148,4);c.lineTo(154,34);c.closePath();c.fill();c.stroke();}
 const ey=n===0?150:n===1?122:150;c.fillStyle='#fff';c.lineWidth=5;[-1,1].forEach(j=>{c.beginPath();c.arc(120+j*30,ey,18,0,6.3);c.fill();c.stroke();c.fillStyle=o;c.beginPath();c.arc(120+j*24,ey+3,8,0,6.3);c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(120+j*52,ey-24);c.lineTo(120+j*10,ey-10);c.lineWidth=8;c.stroke();c.lineWidth=5;});
 return k;});
function costruisciArena(i){
 const r=ARENE[i],H=r.length,W=r[0].length,g=[];for(let y=0;y<H;y++)g.push([]);
 const m={i,g,w:W,alto:H,oggetti:[],nemici:[],colpi:[],spine:{},fine:Infinity,decor:[],posti:[],start:{x:3,y:2.97}};
 for(let q=0;q<H;q++)for(let x=0;x<W;x++){const y=H-1-q,t=r[q][x]||' ';if(t==='c'){m.oggetti.push({tipo:'c',x,y,fase:x});g[y][x]=' ';}else g[y][x]=t;}
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(g[y][x]===' '&&(g[y-1][x]==='#'||g[y-1][x]==='-'))m.posti.push({x,y});
 const c=BOSS[i];m.boss={cfg:c,sp:BOSPR[i],x:W/2,y:9,r:.95,vita:c.vita,stato:'fermo',t:2,dx:1,dy:0,vy:0,lampo:0,colpi:0,lung:0};
 return m;
}
function colpisciBoss(b){
 b.vita--;b.colpi++;b.lampo=.3;G.scossa=riduci?0:.45;schizzi2(b.x,b.y,30,b.cfg.colore,8);sfx('hurt')||suono(70,.5,'sawtooth',.14,40);vibra(90);$('bossHp').style.width=(b.vita/b.cfg.vita*100)+'%';
 if(b.vita<=0){schizzi2(b.x,b.y,70,'#f6c445',10);G.gettoni+=30;$('gett').textContent=G.gettoni;if(G.stato==='gioco'){G.stato='sconfitto';G.finT=1.1;}return;}
 b.stato='fermo';b.t=1.5;dopoStordito(b);
}
function dopoStordito(b){
 const c=b.cfg,p=P2;
 if(b.colpi%2===1&&!M.oggetti.some(o=>o.tipo==='H')){const q=M.posti[Math.floor(Math.random()*M.posti.length)];M.oggetti.push({tipo:'H',x:q.x,y:q.y,fase:0});}
 if(c.pioggia)for(let i=0;i<4;i++)M.colpi.push({x:clamp(p.x+rnd(-6,6),2,M.w-3),y:12+i*1.5,vx:0,vy:-4.5,v:6});
 if(c.raggiera){for(let i=0;i<10;i++){const a=i/10*6.283;M.colpi.push({x:b.x,y:b.y,vx:Math.cos(a)*3.4,vy:Math.sin(a)*3.4,v:6.5});}suono(420,.3,'sawtooth',.08,180);}
 if(c.servi&&M.nemici.filter(n=>n.vivo).length<3)M.nemici.push({tipo:'r',x:b.x,y:b.y,px:b.x,py:b.y,vx:0,vy:0,vivo:true,fase:0});
}
/* dove si fermerà il lancio: stessi controlli dell'urto in passoBoss */
function arrivoBoss(b){let x=b.x,y=b.y;for(let i=0;i<400;i++){if(pieno(cel(Math.round(x+b.dx*b.r),Math.round(y+b.dy*b.r)))||pieno(cel(Math.round(x+b.dx*b.r),Math.round(y)))||pieno(cel(Math.round(x),Math.round(y+b.dy*b.r)))||y<b.r+1.5)break;x+=b.dx*.08;y+=b.dy*.08;}return{x:x+b.dx*b.r,y:Math.max(y,b.r+1.5)+b.dy*b.r};}
function raggioBoss(b){let l=1;while(l<40&&!pieno(cel(Math.round(b.x+b.dx*l),Math.round(b.y+b.dy*l))))l+=.25;return l;}
/* il boss sta sempre su un piano: cade finché non tocca terra o un'asse */
function cadeBoss(b,dt){b.vy-=20*dt;const ny=b.y+b.vy*dt,gx=Math.round(b.x),py=Math.round(ny-b.r),t=cel(gx,py);b.aTerra=false;
 if((t==='#'||t==='-')&&b.vy<=0&&b.y-b.r>=py+.3){b.y=py+.5+b.r;b.vy=0;b.aTerra=true;}else b.y=ny;
 if(b.y<b.r+1.5){b.y=b.r+1.5;b.vy=0;b.aTerra=true;}}
function passoBoss(dt){
 const b=M.boss,p=P2;if(!b||b.vita<=0)return;b.t-=dt;b.lampo=Math.max(0,b.lampo-dt);
 const dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy)||1;
 if(b.stato==='fermo'){cadeBoss(b,dt);const v=Math.abs(dx)>.6?Math.sign(dx):0;b.cammina=0;
  if(b.aTerra&&v&&!pieno(cel(Math.round(b.x+v*(b.r+.15)),Math.round(b.y)))){b.x=clamp(b.x+v*1.4*dt,1.5+b.r,M.w-1.5-b.r);b.cammina=v;}
  if(b.t<=0&&b.aTerra){b.stato='mira';b.t=1.1;}}
 else if(b.stato==='mira'){cadeBoss(b,dt);if(b.t>.25){b.dx=dx/d;b.dy=dy/d;}b.lung=raggioBoss(b);b.arrivo=arrivoBoss(b);if(b.t<=0){b.stato='carica';b.tc=G.t;sfx('throw')||suono(110,.4,'sawtooth',.1,330);}}
 else if(b.stato==='carica'){b.x+=b.dx*b.cfg.scatto*dt;b.y+=b.dy*b.cfg.scatto*dt;
  const qx=Math.round(b.x+b.dx*b.r),qy=Math.round(b.y+b.dy*b.r);
  if(pieno(cel(qx,qy))||pieno(cel(Math.round(b.x+b.dx*b.r),Math.round(b.y)))||pieno(cel(Math.round(b.x),Math.round(b.y+b.dy*b.r)))||b.y<b.r+1.5){b.stato='stordito';b.t=b.cfg.stordito;b.vy=0;b.x-=b.dx*.3;b.y=Math.max(b.y-b.dy*.3,b.r+1.5);schizzi2(b.x,b.y,20,'#f6c445',6);suono(90,.35,'square',.13,50);vibra(70);G.scossa=riduci?0:.45;avviso('Stordito: scattagli addosso!',1300);}}
 else if(b.stato==='stordito'){ /* cade sul piano sotto, così lo raggiungi */
  cadeBoss(b,dt);
  if(b.t<=0){b.stato='fermo';b.t=rnd(1,1.7);dopoStordito(b);}}
 if(G.stato==='gioco'&&d<p.R+b.r){const nx=Math.sign(dx)||1;
  if(b.stato==='stordito'){if(p.scatto>0){p.scatto=0;p.vx=nx*7;p.vy=5;p.ultimoSuolo=null;p.cd=.25;colpisciBoss(b);}}
  else if(Math.abs(p.vx)>=6.5&&G.carica>=MIN_BOTTO)esplodi();
  else if(p.scatto>0){p.scatto=0;p.vx=nx*7;p.vy=4;p.ultimoSuolo=null;sfx('bump')||suono(1200,.12,'square',.08,800);avviso('Corazza dura! Aspetta che si stordisca',1500);}
  else colpito2(nx);}
}
function disegnaBoss(c,sx,sy,ts){
 const b=M.boss;if(!b||b.vita<=0)return;const a=sx(b.x),q=sy(b.y),z=b.r*ts*2.9;
 /* mentre prende la mira, un cerchio rosso segna il punto dove atterrerà */
 if(b.stato==='mira'&&b.arrivo){const gx=sx(b.arrivo.x),gy=sy(b.arrivo.y),rr=ts*(.5+.06*Math.sin(G.t*12));c.save();c.globalAlpha=.5;c.strokeStyle='#ff3b2e';c.lineWidth=Math.max(2,ts*.1);c.beginPath();c.arc(gx,gy,rr,0,6.3);c.stroke();c.globalAlpha=.18;c.fillStyle='#ff3b2e';c.fill();c.restore();}
 c.save();c.translate(a+(b.stato==='mira'?rnd(-2,2):0),q);
 if(M.i===0&&ANAS.complete){const p=P2,v=b.stato==='carica'||b.stato==='mira'?Math.sign(b.dx)||1:Math.sign(p.x-b.x)||1;
  const f=b.stato==='carica'?(G.t-(b.tc||0)<.08?30:31):b.stato==='mira'?(b.t>.75?25:b.t>.6?29:30):b.stato==='stordito'?32+Math.floor(G.t*5)%3:b.cammina?8+Math.floor(G.t*8)%8:24;
  c.translate(0,b.r*ts);if(b.lampo>0&&Math.floor(G.t*24)%2)c.globalAlpha=.35;
  disegnaAnanas(c,f,z,v,true);c.restore();}
 else{
 if(b.stato==='carica')c.rotate(Math.sin(G.t*30)*.25);else if(b.stato==='stordito')c.rotate(.28*Math.sin(G.t*7));else c.translate(0,Math.sin(G.t*3)*ts*.1);
 if(b.lampo>0&&Math.floor(G.t*24)%2)c.globalAlpha=.35;if(b.stato==='stordito')c.filter='saturate(.45) brightness(1.15)';
 c.drawImage(b.sp,-z/2,-z/2,z,z);c.restore();}
 if(b.stato==='stordito'&&!(M.i===0&&ANAS.complete)){c.fillStyle='#f6c445';c.strokeStyle='#2b2b3a';c.lineWidth=2;for(let i=0;i<5;i++){const u=G.t*5+i*1.257,px=a+Math.cos(u)*ts*1.2,py=q-z*.42+Math.sin(u)*ts*.3;c.beginPath();c.arc(px,py,ts*.17,0,6.3);c.fill();c.stroke();}}
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
  schizzi2(p.x,p.y,50,'#ffb13a',9);schizzi2(p.x,p.y,30,'#d8432e',7);p.vy=Math.max(p.vy,8);p.Wv+=12;p.ultimoSuolo=null;p.inv=Math.max(p.inv,.6);
 const b=M.boss;if(b&&b.vita>0&&Math.hypot(b.x-p.x,b.y-p.y)<R+b.r){if(b.stato==='stordito')colpisciBoss(b);else{b.stato='stordito';b.t=b.cfg.stordito;b.vy=0;avviso('Boss stordito: scattagli addosso!',1400);}}
 }
 G.carica=0;aggBarra();
}

/* ---------- GUIDA: quattro pagine con scenette animate ---------- */
const GUIDA=[
 {t:'Nei livelli',c:['Inclina per rotolare','Tocca a destra: salti','Tocca a sinistra: scatti e travolgi i nemici'],f:[gInclina,gSalto,gScatto]},
 {t:'Muovi il telefono',c:['Scuoti il telefono: galleggi in una bolla','Colpo secco di lato: lanci Matteo','Salto e bolla: arrivi più in alto'],f:[gBolla,gSpinta,gAlto]},
 {t:'La bomba',c:['Mangia: ti carichi','Cadi da molto in alto: BOOM','Schiantati veloce: BOOM'],f:[gCibo,gCaduta,gSchianto]},
 {t:'I boss',c:['Si lancia su di te: schivalo','Se sbatte resta stordito','Scattagli addosso'],f:[gLancio,gSbatte,gColpo]}
];
const GW=300,GH=180,GS=GH-40,GR=19;
let gPag=0,gDopo=null;
function gFondo(c){c.fillStyle='#c4e2ff';c.fillRect(0,0,GW,GH);for(let i=0;i<8;i++){sp(c,'terrain_sand_block_top',i*40,GS,41,41);}}
function gTelefono(c,x,y,ang,lato,acceso){
 const w=104,h=50;c.save();c.translate(x,y);c.rotate(ang);c.fillStyle='#2b2b3a';c.beginPath();c.roundRect(-w/2-4,-h/2-4,w+8,h+8,8);c.fill();c.fillStyle='#e8f4ff';c.fillRect(-w/2,-h/2,w,h);
 if(lato){c.fillStyle=acceso?'#d8432e':'#d8432e55';c.fillRect(lato<0?-w/2:0,-h/2,w/2,h);c.fillStyle='#fff';c.font='800 11px "Baloo 2",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(lato<0?'SCATTO':'SALTO',lato*w/4,0);}
 c.restore();
}
function gBoom(c,x,y,e,R){if(e<0||e>1)return;disegnaEspl(c,x,y,R,e);c.fillStyle='#d8432e';c.font='400 26px "Bowlby One","Arial Black",sans-serif';c.textAlign='center';c.textBaseline='middle';if(e<.7){c.lineWidth=5;c.strokeStyle='#fff';c.strokeText('BOOM',x,y-34);c.fillText('BOOM',x,y-34);}}
function gBarra(c,v){sp(c,v>=.25?'bomb_active':'bomb',8,6,24,24);c.fillStyle='#fff';c.strokeStyle='#2b2b3a';c.lineWidth=2.5;c.beginPath();c.roundRect(34,12,86,12,6);c.fill();c.stroke();c.fillStyle='#d8432e';c.beginPath();c.roundRect(35,13,84*v,10,5);c.fill();}
function gInclina(c,t){gFondo(c);const s=Math.sin(t*6.283);gTelefono(c,GW/2,40,s*.3);const x=GW/2+Math.sin(t*6.283-.5)*105;disegnaPalla(c,x,GS-GR,GR,x/GR*.8,0,true);}
function gSalto(c,t){gFondo(c);const x=30+t*250,o=clamp((x-105)/90,0,1),u=4*o*(1-o);sp(c,'spikes',135,GS-34,34,34);gTelefono(c,GW/2,36,0,1,o>0&&o<.25);
 const g=o>0&&o<1;disegnaPolvere(c,105,GS,70,o/.5);disegnaCamm(c,x,GS-u*62,GR,g?(o<.5?1:3):Math.floor(t*40)%10,g?3:1,1,0,0);}
function gScatto(c,t){gFondo(c);const col=t>.32&&t<.45;gTelefono(c,GW/2,36,0,-1,col);const via=t>.44,e=(t-.44)/.25;
 if(!via){if(NEMICO.complete)c.drawImage(NEMICO,229-15,GS-52,30,52);else c.drawImage(ANAN,205,GS-46,48,48);}gBoom2(c,229,GS-22,e);
 disegnaFumo(c,84,GS,38,1,(t-.32)/.5);if(t<.32)disegnaCamm(c,30+t*150,GS,GR,Math.floor(t*40)%10,1,1,0,0);else{const x=78+Math.min(1,(t-.32)/.2)*170;disegnaPalla(c,x,GS-GR,GR,x*.09,0,true);}}
function gBolla(c,t){gFondo(c);const sc=t>.08&&t<.42;gTelefono(c,72+(sc?Math.sin(t*160)*7:0),36,sc?Math.sin(t*130)*.08:0);
 const su=clamp((t-.2)/.45,0,1),giu=clamp((t-.75)/.2,0,1),y=GS-Math.sin(su*1.5708)*62*(1-giu*giu),dent=t>.2&&t<.75,j=dent?Math.sin(t*90)*1.5:0;
 disegnaCamm(c,205+j,y,GR,dent?2:0,dent?3:0,1,0,0);if(dent)bollaSapone(c,205,y-GR,GR*1.75,Math.min(1,(.75-t)/.08),12);}
/* il telefono scatta di lato e Matteo vola da quella parte */
function gSpinta(c,t){gFondo(c);const e=t<.15?0:t<.22?(t-.15)/.07:Math.max(0,1-(t-.22)/.15);gTelefono(c,64+e*26,36,e*.12);
 const u=clamp((t-.22)/.45,0,1),x=60+u*190,vola=u>0&&u<1,y=GS-GR-4*u*(1-u)*52;
 if(vola)for(let i=1;i<4;i++){c.strokeStyle='#2b2b3a55';c.lineWidth=2;c.beginPath();c.moveTo(x-GR-i*8,y-6+i*5);c.lineTo(x-GR-i*8-14,y-6+i*5);c.stroke();}
 disegnaPalla(c,x,y,GR,x*.09,0,!vola);}
/* salto e poi bolla: arriva su un ripiano che col salto da solo non prende */
function gAlto(c,t){gFondo(c);const ty=58;sp(c,'terrain_sand_horizontal_left',185,ty,35,35);sp(c,'terrain_sand_horizontal_middle',220,ty,35,35);sp(c,'terrain_sand_horizontal_right',255,ty,35,35);
 const u=clamp((t-.08)/.62,0,1),x=60+u*170,y=GS-(GS-ty)*Math.sin(u*1.5708),bol=u>.35&&u<.97;
 disegnaCamm(c,x,y,GR,u>0&&u<1?2:0,u>0&&u<1?3:0,1,0,0);if(bol)bollaSapone(c,x,y-GR,GR*1.75,Math.min(1,(.97-u)/.08),12);
 c.fillStyle='#2b2b3a';c.font='800 11px "Baloo 2",sans-serif';c.textAlign='right';c.textBaseline='middle';if(u>0&&u<=.35)c.fillText('salto',x-GR*1.3,y-GR);else if(bol)c.fillText('bolla',x-GR*2,y-GR);}
function gBoom2(c,x,y,e){if(e<0||e>1)return;c.fillStyle=`rgba(255,255,255,${1-e})`;for(let i=0;i<8;i++){const a=i*.785,r=8+e*30;c.beginPath();c.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,5*(1-e)+1,0,6.3);c.fill();}}
function gCibo(c,t){gFondo(c);const px=[110,170,230],x=30+t*250;let n=0;px.forEach((q,i)=>{if(x<q)c.drawImage(PIZZA,q-17,GS-42,34,34);else n++;});gBarra(c,n/3*.9);disegnaCamm(c,x,GS,GR,Math.floor(t*40)%10,1,1,0,0);}
function gCaduta(c,t){gFondo(c);for(let i=0;i<3;i++)sp(c,'terrain_sand_horizontal_middle',i*34,46,35,35);const pr=t<.25?t/.25:1,fall=clamp((t-.25)/.25,0,1),x=20+pr*90,boom=(t-.5)/.32;gBarra(c,boom>=0?0:.9);
 const y=t<.25?46-GR:46-GR+(GS-GR-(46-GR))*fall*fall;if(boom<0||boom>.05)disegnaPalla(c,x,boom>=0?GS-GR-Math.sin(clamp(boom,0,1)*3.14)*30:y,GR,x*.08,0,boom>=0);gBoom(c,x,GS-20,boom,70);}
function gSchianto(c,t){gFondo(c);for(let i=0;i<3;i++)sp(c,'terrain_sand_block_center',GW-40,GS-40*(i+1),41,41);const a=clamp(t/.5,0,1),x=20+a*a*(GW-80),boom=(t-.5)/.32;gBarra(c,boom>=0?0:.9);
 const bx=boom>=0?GW-60-clamp(boom,0,1)*70:x;disegnaPalla(c,bx,GS-GR,GR,bx*.09,0,true);if(boom<0)for(let i=1;i<4;i++){c.strokeStyle='#2b2b3a66';c.lineWidth=2;c.beginPath();c.moveTo(x-GR-i*9,GS-8-i*8);c.lineTo(x-GR-i*20,GS-8-i*8);c.stroke();}gBoom(c,GW-50,GS-24,boom,66);}
function gStanza(c){gFondo(c);for(let i=0;i<5;i++)sp(c,'terrain_sand_cloud_middle',20+i*34,62,35,35);for(let i=0;i<5;i++)sp(c,'block_exclamation',GW-22,GS-22*(i+1),23,23);}
function gBossS(c,x,y,st,t){const z=70;c.save();c.translate(x,y);if(!disegnaAnanas(c,st?32+Math.floor(t*12)%3:16+Math.floor(t*16)%8,z,1)){if(st)c.rotate(.25*Math.sin(t*30));c.drawImage(BOSPR[0],-z/2,-z/2,z,z);}c.restore();if(st){c.fillStyle='#f6c445';c.strokeStyle='#2b2b3a';c.lineWidth=1.5;for(let i=0;i<5;i++){const a=t*20+i*1.257;c.beginPath();c.arc(x+Math.cos(a)*30,y-30+Math.sin(a)*8,4.5,0,6.3);c.fill();c.stroke();}}}
function gLancio(c,t){gStanza(c);const e=clamp((t-.3)/.3,0,1),x=60+e*180,y=40+e*(GS-70),mz=t<.3;if(mz){c.save();c.globalAlpha=.5;c.strokeStyle='#ff3b2e';c.lineWidth=3;c.beginPath();c.arc(240,GS-30,14,0,6.3);c.stroke();c.globalAlpha=.18;c.fillStyle='#ff3b2e';c.fill();c.restore();}gBossS(c,x+(mz?rnd(-1,1):0),y,false,t);const j=clamp((t-.22)/.3,0,1);disegnaCamm(c,190-j*90,GS-Math.sin(j*3.14)*46,GR,j>0&&j<1?2:0,3,-1,0,0);}
function gSbatte(c,t){gStanza(c);const e=clamp(t/.3,0,1),x=70+e*165,hit=t>.3,y=hit?Math.min(GS-34,80+(t-.3)*400):80;gBossS(c,x,y,hit,t);gBoom2(c,GW-34,80,(t-.3)/.3);disegnaCamm(c,50,GS,GR,0,0,1,0,0);}
function gColpo(c,t){gStanza(c);const e=clamp((t-.25)/.2,0,1),x=30+e*165,hit=t>.45;gBossS(c,235,GS-34,hit?0:t+.5,t);if(!hit)gTelefono(c,GW/2,30,0,-1,t>.15&&t<.3);disegnaPalla(c,hit?195-(t-.45)*120:x,GS-GR,GR,x*.09,0,true);gBoom2(c,212,GS-30,(t-.45)/.3);
 const q=hit?2:3;c.strokeStyle='#2b2b3a';c.lineWidth=2;for(let i=0;i<3;i++){c.fillStyle=i<q?'#d8432e':'#ffffff88';c.beginPath();c.roundRect(112+i*28,8,24,10,4);c.fill();c.stroke();}}
function disegnaGuida(){const r=riduci?.42:null;GUIDA[gPag].f.forEach((f,i)=>{const cv=$('gc'+i),c=cv.getContext('2d');c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,GW,GH);f(c,r===null?((G.t/ (2.8))%1):r);});}
function apriGuida(dopo){gPag=0;gDopo=dopo;G.guida=true;mostra('sGuida');pagGuida();}
function pagGuida(){const g=GUIDA[gPag];$('gTit').textContent=g.t;g.c.forEach((x,i)=>$('gt'+i).textContent=x);$('gNum').textContent=(gPag+1)+' / '+GUIDA.length;$('gAvanti').textContent=gPag<GUIDA.length-1?'Avanti':(gDopo?'Gioca':'Ho capito');}
function chiudiGuida(){G.guida=false;S.guidaVista=2;salva();const d=gDopo;gDopo=null;if(d)d();else mostra('sMenu');}
$('gAvanti').onclick=()=>{if(gPag<GUIDA.length-1){gPag++;pagGuida();}else chiudiGuida();};
$('gSalta').onclick=chiudiGuida;

/* ---------- FLUSSO ---------- */
const sezioni=['sMenu','sAmici','sPausa','sFine','sGuida'];
function mostra(id){sezioni.forEach(s=>$(s).hidden=s!==id);}
function hud(){const n=Math.max(0,G.cuori);const cu=$('cuori');cu.textContent='';for(let i=0;i<(VITE_INFINITE?1:n);i++){const m=document.createElement('img');m.src=icona('hud_heart');m.alt='';cu.append(m);}if(VITE_INFINITE)cu.append(' ∞');$('icMoneta').src=PIZZA.src;$('cuori').setAttribute('aria-label',n+' cuori');}
let tAvv=0;function avviso(t,ms){const a=$('avviso');a.textContent=t;a.hidden=false;clearTimeout(tAvv);tAvv=setTimeout(()=>a.hidden=true,ms||2000);}
function giocoUI(on){['hud','tocchi','aSin','aDes'].forEach(i=>$(i).hidden=!on);}
function dissolvi(fn){G.stato='velo';$('velo').classList.add('on');setTimeout(()=>{fn();$('velo').classList.remove('on');},380);}
function banner(t){$('grande').textContent=t;$('grande').hidden=false;$('avviso').hidden=true;G.pronti=1.4;G.stato='pronti';}
function iniziaRun(prova){Object.assign(G,{fiato:1,dettoFiato:false,carica:0,avvisato:false,base:0,cuori:MAXC,gettoni:0,uccisi:0,tempo:0,scudo:false,stella:0,avanz:0,scossa:0,jelly:0,visti:G.visti||0});mostra('');giocoUI(true);hud();aggBarra();$('gett').textContent='0';entraCorsa(0,Array.isArray(prova)?prova:null);sveglia();}
function entraCorsa(i,prova){
 G.modo='2d';G.mondo=i;M=costruisci(i,prova);M.prova=!!prova;goo.length=0;fumi.length=0;polveri.length=0;G.combo=0;G.comboT=0;
 G.fiato=1;Object.assign(P2,{stanco:0,slancio:0,x:M.start.x,y:M.start.y,px:M.start.x,py:M.start.y,vx:0,vy:0,scatto:0,cd:0,inv:0,W:0,Wv:0,sx:M.start.x,sy:M.start.y,verso:1,ultimoSuolo:{x:0,y:1},rotola:false,carica:0,atterra:0,fermoT:0});
 V.dir=1;V.la=2;V.attesa=0;V.py=P2.y;V.zoom=1;V.ts=V.ts0;V.cx=P2.x+2;V.cy=centroY();$('bossBox').hidden=true;$('nomeTappa').textContent=amico().nome+' · Mondo '+(i+1);$('aSin').classList.add('pronto');
 banner(prova?'Nuova tappa':MONDI[i].nome);
 if(!prova&&i===0)setTimeout(()=>{if(G.modo==='2d'&&G.stato==='gioco'&&G.mondo===0)avviso('Mangia per caricare l\u2019esplosione. Le casse si rompono con lo scatto.',3400);},2200);
}
function finisciProva(){incassa();vaiMenu();avviso('Tappa finita!',2600);}
function entraBoss(i){
 M=costruisciArena(i);G.fiato=1;P2.stanco=0;goo.length=0;fumi.length=0;polveri.length=0;G.scossa=0;
 Object.assign(P2,{x:M.start.x,y:M.start.y,px:M.start.x,py:M.start.y,vx:0,vy:0,scatto:0,cd:0,inv:0,W:0,Wv:0,sx:M.start.x,sy:M.start.y,verso:1,ultimoSuolo:{x:0,y:1},rotola:false,carica:0,atterra:0,fermoT:0});
 $('bossBox').hidden=false;$('bossNome').textContent=BOSS[i].nome;$('bossHp').style.width='100%';$('nomeTappa').textContent='';
 banner(BOSS[i].nome);
 if(i===0)setTimeout(()=>{if(M.boss&&G.stato==='gioco')avviso('Schiva il lancio: quando sbatte è stordito. Le molle portano ai piani alti.',3800);},1700);
}
function dopoBoss(){const i=G.mondo;G.base=G.avanz;G.cuori++;hud();if(i>=MONDI.length-1){fine(true);return;}dissolvi(()=>entraCorsa(i+1));}
let lucchetto=null;async function sveglia(){try{if(navigator.wakeLock&&!lucchetto){lucchetto=await navigator.wakeLock.request('screen');lucchetto.addEventListener('release',()=>lucchetto=null);}}catch(e){}}
function metri(){return Math.round(G.avanz);}
function incassa(){S.gettoni+=G.gettoni;G.gettoni=0;if(metri()>S.record)S.record=metri();salva();}
function vaiMenu(){V.zoom=1;V.ts=V.ts0;G.stato='menu';G.modo='menu';giocoUI(false);$('grande').hidden=true;$('avviso').hidden=true;$('stick').hidden=true;mostra('sMenu');const r=$('record');r.hidden=!S.record;r.textContent='Record: '+S.record+' metri';}
function pausa(){if(G.stato!=='gioco')return;G.stato='pausa';$('sens').value=S.sens;mostra('sPausa');}
function fine(vinto){
 if(G.stato==='esito'||G.stato==='fineAtt')return;G.stato='fineAtt';G.finT=vinto?.9:.6;G.esito={vinto,gett:G.gettoni,m:metri()};incassa();suono(vinto?523:196,.5,'triangle',.13,vinto?1046:98);
}
function mostraFine(){
 const e=G.esito;giocoUI(false);G.stato='esito';
 $('fineTitolo').textContent=e.vinto?'Hai battuto Re Birillo!':'Fine della corsa';
 const t=Math.round(G.tempo),mm=Math.floor(t/60),ss=String(t%60).padStart(2,'0');
 $('fineTesto').textContent=`${amico().nome} ha rotolato per ${e.m} metri in ${mm}:${ss}, ha eliminato ${G.uccisi===1?'1 nemico':G.uccisi+' nemici'} e ha mangiato ${e.gett} bocconi.`+(e.vinto?'':' Si riparte dall’inizio.');
 const b=$('bAvanti');b.textContent=e.vinto?'Gioca ancora':'Ricomincia';b.onclick=iniziaRun;mostra('sFine');
}

/* ---------- MENU ---------- */
function anteprima(a,skin){const cv=document.createElement('canvas');cv.width=320;cv.height=160;dipingiPalla(cv,a,skin);const o=document.createElement('canvas');o.width=o.height=112;o.getContext('2d').drawImage(cv,80,0,160,160,0,0,112,112);return o;}
function disegnaAmici(){const a=$('listaAmici');a.textContent='';
 S.amici.forEach((f,i)=>{const b=document.createElement('button');b.className='scelta'+(i===S.sel?' attiva':'');const s=document.createElement('span');s.textContent=f.nome;b.append(anteprima(f,f.skin),s);b.onclick=()=>{S.sel=i;salva();vestiPalla();disegnaAmici();};a.append(b);caricaFoto(f,()=>{if(f._img&&!f._v){f._v=1;disegnaAmici();}});});
 const l=$('listaSkin');l.textContent='';const f=amico();
 SKIN.forEach(k=>{const b=document.createElement('button'),ha=S.skin.includes(k.id);b.className='scelta'+(f.skin===k.id?' attiva':'');const s=document.createElement('span');s.textContent=k.nome;const c=document.createElement('i');c.textContent=ha?(f.skin===k.id?'Indossata':'Tua'):k.costo+' bocconi';b.append(anteprima(f,k.id),s,c);
  b.onclick=()=>{if(!ha){if(S.gettoni<k.costo){c.textContent='Ne servono '+(k.costo-S.gettoni);return;}S.gettoni-=k.costo;S.skin.push(k.id);suono(660,.25,'triangle',.1,1320);}f.skin=k.id;salva();vestiPalla();disegnaAmici();};l.append(b);});
 $('saldo').textContent=S.gettoni;$('togliAmico').hidden=S.sel===0;$('togliFoto').hidden=!f.foto;$('togliFoto').textContent='Togli la foto di '+f.nome;$('fotoTesto').textContent=(f.foto?'Cambia la foto di ':'Metti la foto di ')+f.nome;
}
async function bloccaOrizzontale(){try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();await screen.orientation.lock('landscape');}catch(e){}}
$('bGioca').onclick=()=>{audioOn();chiediSensori();bloccaOrizzontale();if((S.guidaVista|0)>=2)iniziaRun();else apriGuida(iniziaRun);};
$('bGuida').onclick=()=>{audioOn();apriGuida(null);};
$('bAmici').onclick=()=>{audioOn();disegnaAmici();mostra('sAmici');};
$('amiciChiudi').onclick=()=>mostra('sMenu');
$('nuovoAmico').addEventListener('submit',e=>{e.preventDefault();const n=$('nomeNuovo').value.trim();if(!n)return;S.amici.push({nome:n,colore:COLORI[S.amici.length%COLORI.length],skin:'classica',foto:null});S.sel=S.amici.length-1;$('nomeNuovo').value='';$('nomeNuovo').blur();salva();vestiPalla();disegnaAmici();});
$('togliAmico').onclick=()=>{if(S.sel===0)return;S.amici.splice(S.sel,1);S.sel=0;salva();vestiPalla();disegnaAmici();};
$('togliFoto').onclick=()=>{const a=amico();a.foto=null;a._img=null;a._v=0;salva();vestiPalla();disegnaAmici();};
$('foto').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{const c=document.createElement('canvas'),q=Math.min(im.width,im.height);c.width=c.height=320;c.getContext('2d').drawImage(im,(im.width-q)/2,(im.height-q)/2,q,q,0,0,320,320);const a=amico();a.foto=c.toDataURL('image/jpeg',.8);a._img=null;a._v=0;URL.revokeObjectURL(u);salva();vestiPalla();disegnaAmici();};im.src=u;e.target.value='';});
$('pausa').onclick=pausa;
$('bRiprendi').onclick=()=>{mostra('');G.stato='gioco';};
$('bEsci').onclick=()=>{incassa();vaiMenu();};
$('sens').addEventListener('input',e=>{S.sens=+e.target.value;salva();});
$('bAudio').onclick=()=>{S.audio=!S.audio;$('bAudio').textContent='Audio: '+(S.audio?'sì':'no');audioOn();salva();};
$('bAudio').textContent='Audio: '+(S.audio?'sì':'no');
$('bTappe').onclick=vaiMenu;
document.addEventListener('visibilitychange',()=>{if(document.hidden)pausa();else{lucchetto=null;if(G.stato==='gioco'||G.stato==='pausa')sveglia();}});

/* ---------- CICLO ---------- */
function centroY(){return V.H/V.ts/2-1.6;} /* il pavimento resta sempre in basso a vista */
function telecamera2d(dt){
 const p=P2;
 if(M.boss){V.ts=Math.min(V.W/(M.w+.5),(V.H-56)/(M.alto+.6));V.cx=(M.w-1)/2;V.cy=V.H/V.ts/2-.9;return;}
 /* cambia lato solo se il personaggio va davvero dall'altra parte per un attimo */
 const d=Math.abs(p.vx)>1?Math.sign(p.vx):V.dir;V.attesa=d!==V.dir?V.attesa+dt:0;if(V.attesa>.7){V.dir=d;V.attesa=0;}
 const meta=V.dir*(Math.min(V.W/V.ts*.16,3)+Math.abs(p.vx)*.3),max=(1.5+Math.abs(p.vx)*.35)*dt;V.la+=clamp(meta-V.la,-max,max);
 V.cx=lerp(V.cx,p.x+V.la,1-Math.exp(-dt*3.5));V.cx=Math.max(V.cx,V.W/V.ts/2-1);
 /* in verticale segue il piano su cui poggia, non ogni salto */
 if(p.ultimoSuolo)V.py=p.y;else if(p.y>V.py+3.2)V.py=p.y-3.2;else if(p.y<V.py-1.5)V.py=p.y+1.5;
 /* sui piani alti allarga la vista invece di salire, così i mostri a terra restano visibili */
 const visBase=V.H/V.ts0,serve=clamp((V.py+4.1)/.77,visBase,Math.max(visBase,18)),z=visBase/(V.py>4.2?serve:visBase);
 V.zoom=lerp(V.zoom,z,1-Math.exp(-dt*1.6));V.ts=V.ts0*V.zoom;V.cy=centroY();
}
let ult=performance.now();
function ciclo(ora){
 requestAnimationFrame(ciclo);
 const dt=Math.min(.033,(ora-ult)/1000||.016);ult=ora;
 if(G.stato==='pausa')return;
 G.t+=dt;
 if(G.modo==='menu'){if(G.guida)disegnaGuida();else disegnaMenu(dt);return;}
 leggiInput(dt);
 if(G.stato==='pronti'){G.pronti-=dt;if(G.pronti<=0){G.stato='gioco';$('grande').hidden=true;}}
 if(G.stato==='sconfitto'){G.finT-=dt;if(G.finT<=0){G.stato='velo';dopoBoss();}}
 if(G.stato==='fineAtt'){G.finT-=dt;if(G.finT<=0)mostraFine();}
 if(G.stato==='gioco')G.tempo+=dt;
 G.scossa=Math.max(0,G.scossa-dt);
 if(G.stato==='gioco'){const ps=5;for(let i=0;i<ps&&G.stato==='gioco';i++)passo2d(dt/ps);
  passoOggetti(dt);passoNemici2(dt);if(M.boss)passoBoss(dt);G.stella=Math.max(0,G.stella-dt);
  if(!M.boss)G.avanz=(G.base||0)+Math.max(0,P2.x-M.start.x);}
 telecamera2d(dt);disegna2d();
}
misure2d();vestiPalla();vaiMenu();
FOGLIO.addEventListener('load',()=>{vestiPalla();});KIT.addEventListener('load',hud);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(vestiPalla);
requestAnimationFrame(ciclo);
window.__rotolamici={suOrient,suMoto,G,P2,V,get M(){return M},iniziaRun,entraBoss,entraCorsa,IN,PEZZI,ARENE};
})();
