/* ===== sader.js: CỔNG ĐÁ CỔ + CUỐC + CRYSTAL WORLD + PHÁP SƯ ĐÁ + NHẪN TRĂNG (PHÍM T) =====
   Nạp CUỐI CÙNG trong deadisland.html (sau heroes.js):  <script src="../js/sader.js"></script>
   Bản này đã gộp: 2 loại tinh thể (xanh/tím), map rộng 240, núi khoáng thạch, hàng tinh thể chắn lối hang cổ,
   Pháp sư Đá (nhiệm vụ 10 xanh + 10 tím, cắt cảnh nghi lễ), Nhẫn Trăng Tinh Thể, kỹ năng T. */
(()=>{
if(typeof putIn!=='function'||typeof mineCarts!=='function'||typeof caveLight!=='function'||typeof allPl!=='function'||!window.WORLDS||typeof window.worldTransfer!=='function'||typeof window.abyssAsk!=='function'||typeof window.giveItem!=='function'){console.warn('sader.js: hãy nạp CUỐI CÙNG (sau heroes.js)');return}

/* ---------- Thông số ---------- */
const WC=26,WALL=62,CW0=240,CH0=110,VW=420;
const GX=85,GB=49,GY0=46,GX0=81,GX1=89,CCX=85,CCY=53;
const GPX=GX*T+4,GPY=(GB+1)*T,CPX=CCX*T+4,CPY=CCY*T+4;
const KEY='deadisland:cgate:',SKEY='deadisland:cstone',INV='deadisland:inv1';
const BX=75*T+4,BY=87*T+4;
const GREY=['#6d727c','#8b919b','#4b4f57','#aab0ba'];
const PAL=[['#2fa8e8','#b8ecff','#1470a8','#7ae8ff'],   /* 0 = xanh dương */
           ['#8a63d8','#d8c8ff','#5a38b0','#b8a0ff']];  /* 1 = tím */
const CRATE_R=32;

const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),w,h)};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const bagOf=n=>{try{const I=JSON.parse(localStorage.getItem(INV))||{};return Array.isArray(I[n])?I[n]:[]}catch(_){return[]}};
const hasPick=n=>bagOf(n).includes('pickaxe');
function ensure(){const I=window.ITEMS;if(!I)return;
  if(!I.pickaxe)I.pickaxe={icon:'⛏️',name:'Cuốc',d:'Cuốc đá chắc tay. Lấy từ thùng cuốc trong hang quặng. Dùng đập đá chắn cổng và đào tinh thể. Có thể bấm Cầm.'};
  if(!I.cshard)I.cshard={icon:'🔷',name:'Tinh thể xanh',d:'Tinh thể xanh dương đào từ Crystal World.'};
  if(!I.cshardp)I.cshardp={icon:'🔮',name:'Tinh thể tím',d:'Tinh thể tím đào từ Crystal World.'};
  if(!I.wstone)I.wstone={icon:'💎',name:'Viên đá trong hang cổ',d:'Viên đá pha lê lấy từ hang cổ.'};
  if(!I.moonring)I.moonring={icon:'💍',name:'Nhẫn Trăng Tinh Thể',slot:'ring',d:'Nhẫn kết từ tinh thể xanh và tím. Trang bị vào ô Nhẫn, bấm T để triệu hồi ánh trăng làm tinh thể đâm lên.'}}
ensure();addEventListener('load',ensure);

/* ---------- Icon pixel trong túi đồ ---------- */
const STONE_NAME='Viên đá trong hang cổ';
let STONE=null;
const gemURL=c=>{
  const cv2=document.createElement('canvas');cv2.width=14;cv2.height=22;const g=cv2.getContext('2d');
  const poly=[[7,0],[13,5],[13,16],[7,21],[1,16],[1,5]];
  const inP=(x,y)=>{x+=.5;y+=.5;let r=false;for(let i=0,j=5;i<6;j=i++){const[a,b]=poly[i],[p,q]=poly[j];if((b>y)!==(q>y)&&x<(p-a)*(y-b)/(q-b)+a)r=!r}return r};
  for(let y=0;y<22;y++)for(let x=0;x<14;x++){
    if(!inP(x,y))continue;
    const edge=!inP(x+1,y)||!inP(x-1,y)||!inP(x,y+1)||!inP(x,y-1);
    g.fillStyle=edge?c.o:(y<6&&x<7)?c.h:x<7?c.l:c.d;g.fillRect(x,y,1,1)}
  g.fillStyle='#fff';
  for(let y=6;y<=14;y++){g.fillRect(4,y,1,1);g.fillRect(8,y,1,1)}
  g.fillRect(5,15,3,1);g.fillRect(5,5,1,1);
  return cv2.toDataURL()};
const GEMS={
  'Tinh thể xanh':gemURL({o:'#1a5a8a',l:'#4ab8f0',d:'#2a8ad0',h:'#9ae0ff'}),
  'Tinh thể tím':gemURL({o:'#3a2a7a',l:'#9a7ad8',d:'#6a4ab8',h:'#c8b0f0'})};
const ringURL=(()=>{const c=document.createElement('canvas');c.width=16;c.height=20;const g=c.getContext('2d');
  for(let y=0;y<20;y++)for(let x=0;x<16;x++){const d=Math.hypot((x+.5-8)/6,(y+.5-12)/6.5);
    if(d<=1&&d>.62){g.fillStyle=(d>.9||d<.7)?'#9a9ab8':(y<12&&x<8?'#e6e6fa':'#c8c8e8');g.fillRect(x,y,1,1)}}
  g.fillStyle='#9a9ab8';g.fillRect(5,5,6,3);g.fillStyle='#c8c8e8';g.fillRect(6,5,4,1);
  g.fillStyle='#0a0a60';g.fillRect(6,2,4,3);g.fillStyle='#2030ff';g.fillRect(7,1,2,1);g.fillRect(6,3,1,1);g.fillRect(9,3,1,1);g.fillStyle='#6a8aff';g.fillRect(7,2,1,1);
  return c.toDataURL()})();
window.ICONS=Object.assign(window.ICONS||{},{moonring:ringURL});
const RINGS={'Nhẫn Trăng Tinh Thể':ringURL};
function skinInv(){
  const g=$('invGrid');if(!g)return;
  [...g.children].forEach(s=>{
    const nm=s.getAttribute('aria-label'),src=nm===STONE_NAME?STONE:(GEMS[nm]||RINGS[nm]);
    if(!src||s.querySelector('img'))return;
    [...s.childNodes].forEach(n=>{if(n.nodeType===3)n.remove()});
    const im=new Image();im.src=src;im.alt=nm;
    im.style.cssText='height:88%;width:auto;image-rendering:pixelated;pointer-events:none;display:block';
    s.insertBefore(im,s.firstChild)})}
try{
  fetch('../js/village.js').then(r=>r.text()).then(t=>{
    const m=t.match(/"stone"\s*:\s*"(data:image\/png;base64,[^"]+)"/);
    if(m){STONE=m[1];skinInv()}
  }).catch(()=>{})
}catch(_){}
if($('invGrid'))new MutationObserver(skinInv).observe($('invGrid'),{childList:true});

function label(x,y,t,col){
  cx.save();cx.textAlign='center';cx.font='bold 6px monospace';
  const w=Math.ceil(cx.measureText(t).width)+6,bx=Math.round(x-w/2),by=Math.round(y);
  cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(bx,by,w,9);cx.fillStyle=col||'#ffd23f';cx.fillRect(bx,by+9,w,1);
  cx.fillStyle='#fff';cx.fillText(t,Math.round(x),by+7);cx.restore()}

/* ---------- Hình pixel dựng sẵn ---------- */
const mk=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'));return c};
const disc=(g,c,x,y,r)=>{g.fillStyle=c;for(let j=-r;j<=r;j++){const w=Math.round(Math.sqrt(r*r-j*j));g.fillRect(x-w,y+j,w*2,1)}};
const line=(g,x0,y0,x1,y1)=>{const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++)g.fillRect(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),1,1)};

const GS=mk(96,84,g=>{
  const P=(c,x,y)=>{g.fillStyle=c;g.fillRect(x,y,1,1)},O=48,B=80,BR=['#c4803c','#a8642c','#d89a52','#8c4e22'];
  for(let u=0;u<=74;u++){
    const hw=Math.round(40*Math.sqrt(Math.max(0,1-Math.pow(u/78,2.6))))+(hs(u,7)%3-1);
    const ow=u<=26?13:u<=39?Math.round(Math.sqrt(169-(u-26)*(u-26))):0;
    const rw=u<=26?21:u<=47?Math.round(Math.sqrt(Math.max(0,441-(u-26)*(u-26)))):0;
    for(let x=-hw;x<=hw;x++){
      const ax=Math.abs(x),h=hs(x+99,u*5+3);let c;
      if(ow&&ax<ow)c=u<4?'#171021':'#07050c';
      else if(rw&&ax<rw){
        let id,edge;
        if(u<=26){id=((u/9)|0)*2+(x<0?0:1);edge=u%9===0||ax===ow}
        else{const a=Math.atan2(u-26,x);id=Math.floor((a+3.2)/.5)+40;edge=((a+3.2)%.5)<.09||(ow&&ax===ow)||Math.round(Math.sqrt(x*x+(u-26)*(u-26)))>=20}
        c=edge?'#3a2418':BR[hs(id,5)%4];if(!edge&&h%9===0)c='#e8b068'}
      else{
        c=['#2a2038','#231a30','#33283f'][h%3];if(x>10)c=['#1a1226','#201630'][h%2];
        if((u>50&&h%3<2)||h%17===0)c=['#3f8a2a','#5aa83a','#2f6a1f'][h%3];
        else if(ax>24&&u<36&&h%5<2)c=['#b8703a','#8c4e22'][h%2]}
      if(ax>=hw-1)c='#120a1c';
      P(c,O+x,B-u)}}
  for(let i=0;i<14;i++){const x=40+(hs(i,3)%12),u=hs(i,4)%5;P(i%2?'#2a2038':'#b8703a',O+(i%2?x:-x),B-u)}});
const RB=mk(96,84,g=>{
  [[-8,7,9],[8,8,9],[0,16,10],[-9,24,8],[9,25,8],[0,32,8],[-6,38,6],[6,38,6],[-14,12,5],[14,12,5],[0,4,7]].sort((a,b)=>b[1]-a[1]).forEach(([x,u,r],i)=>{
    const X=48+x,Y=80-u;
    disc(g,'#2a2c33',X,Y+1,r+1);disc(g,'#6d727c',X,Y,r);disc(g,'#8b919b',X-1,Y-2,Math.max(2,r-3));disc(g,'#aab0ba',X-2,Y-3,Math.max(1,r-6));
    g.fillStyle='#4b4f57';g.fillRect(X-r+2,Y+r-2,r*2-3,1);
    if(i%2){g.fillStyle='#4a7a34';g.fillRect(X-2,Y-r,4,1)}});
  g.fillStyle='#2a2c33';line(g,44,50,50,66);line(g,52,44,47,58);line(g,40,66,46,74)});
const mkCir=(col,fill)=>mk(64,64,g=>{
  const C=32,ring=r=>{for(let a=0;a<6.2832;a+=1/r)g.fillRect(Math.round(C+Math.cos(a)*r),Math.round(C+Math.sin(a)*r),1,1)};
  g.fillStyle=fill;for(let j=-30;j<=30;j++){const w=Math.round(Math.sqrt(900-j*j));g.fillRect(C-w,C+j,w*2,1)}
  g.fillStyle=col;ring(30);ring(28);
  for(let i=0;i<16;i++){const a=i*Math.PI/8;g.fillRect(Math.round(C+Math.cos(a)*25)-1,Math.round(C+Math.sin(a)*25)-1,2,2)}
  const st=(ro,ri,rot)=>{const V=[];for(let i=0;i<16;i++){const a=rot+i*Math.PI/8,r=i%2?ri:ro;V.push([C+Math.cos(a)*r,C+Math.sin(a)*r])}
    for(let i=0;i<16;i++){const p=V[i],q=V[(i+1)%16];line(g,p[0],p[1],q[0],q[1])}return V};
  const V=st(23,12,-Math.PI/2);
  for(let i=0;i<16;i+=2){const a=-Math.PI/2+i*Math.PI/8;line(g,V[i][0],V[i][1],C+Math.cos(a)*6,C+Math.sin(a)*6)}
  st(17,9,-Math.PI/2+Math.PI/8);ring(6);ring(4);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;line(g,C,C,C+Math.cos(a)*4,C+Math.sin(a)*4)}});
const CIR0=mkCir('#4aa8c8','rgba(6,10,36,.6)'),CIRL=mkCir('#7cfff0','rgba(0,0,0,0)'),CIRO=mkCir('#ff8ae8','rgba(0,0,0,0)');

/* ---------- Trạng thái ---------- */
let G={open:false,mine:null},D=null,PT=[],MN={},GOT={},hintG=0;
try{GOT=JSON.parse(localStorage.getItem(SKEY))||{}}catch(_){GOT={}}
const saveG=()=>{try{localStorage.setItem(SKEY,JSON.stringify(GOT))}catch(_){}};
const burst=(x,y,fl,n,cols,sp,up)=>{for(let i=0;i<n;i++)PT.push({x:x+rnd(7)-3,y:y+rnd(5)-2,vx:(Math.random()-.5)*sp,vy:-Math.random()*up,l:28+rnd(30),c:cols[rnd(cols.length)],s:1+rnd(2),fl})};
const drawPT=fl=>{PT.forEach(q=>{if(q.fl!==fl)return;cx.globalAlpha=clamp(q.l/15,0,1);R(q.c,q.x,q.y,q.s,q.s)});cx.globalAlpha=1};
function pickSwing(P,tx,t){
  const fc=tx>=P.x?1:-1,p=(t%.4)/.4,ang=-2.2+p*2.0,ox=P.x+fc*4,oy=P.y-9,c=Math.cos(ang),s=Math.sin(ang);
  for(let l=0;l<=13;l++)R('#8a5a2e',ox+fc*c*l,oy+s*l,2,2);
  const hx=ox+fc*c*13,hy=oy+s*13;
  for(let k=-4;k<=4;k++)R(k===0?'#ffffff':'#cfd6e3',hx-s*k,hy+fc*c*k,2,2)}

/* ================= HANG CẤM: CỔNG ĐÁ + TRẬN PHÁP ================= */
function buildGate(){
  const F=FL[6];if(!F||!F.im)return;
  G.open=false;G.mine=null;
  for(let y=42;y<=58;y++)for(let x=76;x<=94;x++){const t=F.im[y][x];if(t>=58&&t<=61)F.im[y][x]=0}
  for(let y=GY0;y<=GB;y++)for(let x=GX0;x<=GX1;x++){F.im[y][x]=1;F.rid[y][x]=0;F.rail.delete(y*IW+x)}
  F.carts=F.carts.filter(c=>!(Math.abs(c[0]-85)<8&&Math.abs(c[1]-45)<8));
  F.lamps=F.lamps.filter(l=>!(l[0]>=76&&l[0]<=94&&l[1]>=38&&l[1]<=48));
  [[78,52],[92,52]].forEach(([x,y])=>{if(!F.lamps.some(l=>l[0]===x&&l[1]===y))F.lamps.push([x,y,1,1])})}
function applyOpen(){const F=FL[6];G.open=true;for(let y=GY0;y<=GB;y++)for(let x=84;x<=86;x++){F.im[y][x]=0;F.rid[y][x]=1}}
function loadGate(){try{if(localStorage.getItem(KEY+seed)==='1')applyOpen()}catch(_){}}
const nearCircle=P=>Math.hypot(P.x-GPX,P.y-(CPY-6))<40;
function gateE(P){
  if(G.mine||G.open)return;
  if(!hasPick(P.pl)){cap('Cổng đá cổ bị một đống đá lớn chặn kín. Cần một chiếc cuốc để đập đá... Cuốc nằm trong các thùng cuốc ở hang than và hang sắt/vàng.');return}
  G.mine={n:P.pl,t:0,d:2.6,hit:0};cap('P'+P.pl+' vung cuốc đập đống đá chắn cổng...')}
function openGate(){
  G.mine=null;applyOpen();try{localStorage.setItem(KEY+seed,'1')}catch(_){}
  burst(GPX,GPY-20,6,70,GREY,4,3);flash=18;shake=Math.max(shake,14);
  cap('Đống đá vỡ vụn! Cổng đá cổ bừng sáng, trận pháp dưới chân bắt đầu xoay. Bước vào cổng để tới Crystal World.')}
function drawGate(){
  if(GPX+60<camX||GPX-60>camX+CW/IS||GPY<camY||GPY-92>camY+CH/IS)return;
  const f=frame,pu=.5+.5*Math.sin(f*.06);
  cx.imageSmoothingEnabled=false;
  cx.drawImage(CIR0,CPX-32,CPY-32);
  cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=G.open?.45+.35*pu:.12+.1*pu;cx.drawImage(G.open?CIRO:CIRL,CPX-32,CPY-32);cx.restore();
  cx.drawImage(GS,GPX-48,GPY-80);
  if(!G.open)cx.drawImage(RB,GPX-48+(G.mine?rnd(3)-1:0),GPY-80);
  else{
    cx.save();cx.beginPath();cx.moveTo(GPX-13,GPY);cx.lineTo(GPX-13,GPY-26);cx.arc(GPX,GPY-26,13,Math.PI,0);cx.lineTo(GPX+13,GPY);cx.closePath();cx.clip();
    cx.globalCompositeOperation='lighter';
    const gr=cx.createRadialGradient(GPX,GPY-18,2,GPX,GPY-18,26);gr.addColorStop(0,'rgba(200,255,250,.9)');gr.addColorStop(.5,'rgba(255,120,220,.5)');gr.addColorStop(1,'rgba(60,200,255,0)');
    cx.fillStyle=gr;cx.fillRect(GPX-14,GPY-42,28,44);
    for(let i=0;i<30;i++){const a=f*.05+i*.7,r=(i*1.1+f*.4)%14;R(i%3?'#e8fffb':'#ff9ae8',GPX+Math.cos(a)*r*.9,GPY-18+Math.sin(a)*r*1.4,2,2)}
    cx.restore()}
  drawPT(6)}
function gateGlow(){
  const P=allPl().find(p=>p.pl===sel&&p.fl===6);
  if(P){const cr=nearCrate(P);if(cr)label(cr.x*T+4,cr.y*T-26,hasPick(sel)?'Đã có cuốc':'E: Lấy cuốc','#ffd23f')}
  if(GPX+80<camX||GPX-80>camX+CW/IS||GPY+60<camY||GPY-92>camY+CH/IS)return;
  cx.save();cx.globalCompositeOperation='lighter';
  let g=cx.createRadialGradient(CPX,CPY,4,CPX,CPY,56);g.addColorStop(0,'rgba(124,255,240,'+(G.open?.5:.16)+')');g.addColorStop(1,'rgba(124,255,240,0)');
  cx.fillStyle=g;cx.fillRect(CPX-56,CPY-56,112,112);
  if(G.open){g=cx.createRadialGradient(GPX,GPY-20,2,GPX,GPY-20,46);g.addColorStop(0,'rgba(255,170,240,.45)');g.addColorStop(1,'rgba(255,170,240,0)');cx.fillStyle=g;cx.fillRect(GPX-46,GPY-66,92,92)}
  cx.restore();
  if(G.mine){const M=allPl().find(p=>p.pl===G.mine.n&&p.fl===6);if(M)pickSwing(M,GPX,G.mine.t)}
  if(P&&nearCircle(P)&&!G.mine)label(GPX,GPY-90,G.open?'Cổng đã mở':'E: Đập đá mở cổng',G.open?'#7cfff0':'#ffd23f')}
const _mc=mineCarts;mineCarts=function(F,a,b,c,d){_mc(F,a,b,c,d);crateDraw(F,a,b,c,d);drawGate()};
const _cl=caveLight;caveLight=function(){_cl();gateGlow()};

/* ================= THÙNG CUỐC TRONG CÁC HANG QUẶNG ================= */
let CR=[];
function buildCrates(){
  const F=FL[6];CR=[];if(!F||!F.im)return;
  const lamp=(x,y)=>F.lamps.some(l=>Math.abs(l[0]-x)<2&&Math.abs(l[1]-y)<2);
  const fine=(x,y)=>{
    if(F.rail.has(y*IW+x)||lamp(x,y))return false;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(F.im[y+j][x+i]!==0||F.rail.has((y+j)*IW+x+i))return false;
    return true};
  [3,4,7,9,10].forEach(id=>{
    const c=[];
    for(let y=3;y<IH-3;y++)for(let x=3;x<IW-3;x++)if(F.rid[y][x]===id&&fine(x,y))c.push([x,y]);
    if(!c.length)return;
    const mx=c.reduce((a,t)=>a+t[0],0)/c.length,my=c.reduce((a,t)=>a+t[1],0)/c.length,
      dm=Math.max(...c.map(t=>Math.hypot(t[0]-mx,t[1]-my))),
      ring=c.filter(t=>{const d=Math.hypot(t[0]-mx,t[1]-my);return d>dm*.3&&d<dm*.65});
    const L=ring.length?ring:c;
    for(let i=0;i<2;i++)for(let k=0;k<40;k++){
      const t=L[hs(id*31+i*7+k,(seed|0)+5)%L.length];
      if(!CR.some(q=>Math.hypot(q.x-t[0],q.y-t[1])<9)){CR.push({x:t[0],y:t[1],room:id});break}}})}
const nearCrate=P=>P.fl===6?CR.find(c=>Math.hypot(P.x-(c.x*T+4),P.y-(c.y*T+4))<CRATE_R):null;
function takePick(n,c){
  ensure();
  if(hasPick(n)){cap('P'+n+' đã có cuốc trong túi rồi.');return}
  if(window.giveItem(n,'pickaxe'))burst(c.x*T+4,c.y*T-6,6,16,['#aab0ba','#ffd23f','#ffffff'],1.6,1.6)}
function crateDraw(F,x0,y0,x1,y1){
  CR.forEach(c=>{
    if(c.x<x0||c.x>x1||c.y<y0||c.y>y1)return;
    const x=c.x*T+4,y=(c.y+1)*T;
    R('rgba(0,0,0,.3)',x-8,y-2,16,3);
    [[-4,-2],[0,0],[4,-2]].forEach(([i,o])=>{
      R('#6b4423',x+i,y-17+o,1,10);R('#8a5a2e',x+i,y-17+o,1,1);
      R('#aab0ba',x+i-3,y-18+o,7,1);R('#6b7078',x+i-3,y-17+o,1,1);R('#6b7078',x+i+3,y-17+o,1,1)});
    R('#3a2410',x-7,y-9,14,9);R('#8a5a2e',x-6,y-8,12,7);R('#b8864f',x-6,y-8,12,1);
    R('#5a3a1e',x-6,y-5,12,1);R('#3a2410',x-1,y-8,1,7);
    R('#aab0ba',x-6,y-8,1,1);R('#aab0ba',x+5,y-8,1,1);R('#aab0ba',x-6,y-2,1,1);R('#aab0ba',x+5,y-2,1,1);
    if(((frame>>3)+c.x)%11===0)R('#fff',x+3,y-18,1,1)})}

/* ================= CRYSTAL WORLD ================= */
const ISLETS=[[10,20],[30,9],[55,5],[100,7],[132,13],[144,40],[5,50],[8,92],[142,86],[22,102],[118,103],[62,105],[92,4],[46,24],[180,12],[225,20],[232,92],[205,104],[170,100]];
function buildCW(){
  const W=CW0,H=CH0,g2=v=>Array.from({length:H},()=>Array(W).fill(v)),im=g2(WALL),rid=g2(0),kd=g2(0);
  const fl=(x,y,k)=>{if(x>1&&y>1&&x<W-2&&y<H-2){im[y][x]=0;rid[y][x]=1;kd[y][x]=k||1}};
  const ell=(a0,b0,rx,ry,k,kk)=>{for(let y=Math.floor(b0-ry*1.3)-1;y<=b0+ry*1.3+1;y++)for(let x=Math.floor(a0-rx*1.3)-1;x<=a0+rx*1.3+1;x++){
    const a=Math.atan2((y+.5-b0)/ry,(x+.5-a0)/rx),q=1+.07*Math.sin(3*a+k)+.05*Math.sin(5*a+2*k)+.03*Math.sin(9*a+k);
    if(Math.hypot((x+.5-a0)/rx,(y+.5-b0)/ry)/q<1)fl(x,y,kk)}};
  const tun=(pts,w)=>{for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i],n=Math.max(1,Math.abs(c-a),Math.abs(d-b));
    for(let j=0;j<=n;j++){const x=a+Math.round((c-a)*j/n),y=b+Math.round((d-b)*j/n);for(let u=-w;u<=w;u++)for(let v=-w;v<=w;v++)fl(x+u,y+v)}}};
  const wat=(a0,b0,rx,ry)=>{for(let y=Math.floor(b0-ry);y<=b0+ry+1;y++)for(let x=Math.floor(a0-rx);x<=a0+rx+1;x++)if(Math.hypot((x+.5-a0)/rx,(y+.5-b0)/ry)<1&&kd[y][x]===1){im[y][x]=WALL;rid[y][x]=0;kd[y][x]=2}};
  ell(75,62,56,36,1);ell(22,70,15,11,2);ell(128,66,15,11,3);ell(28,38,10,8,4);ell(122,36,10,8,5);ell(75,16,14,8,6);
  tun([[30,44],[38,54]],2);tun([[120,42],[112,54]],2);tun([[75,22],[75,46]],2);
  wat(75,57,17,8);wat(122,33,6,3.5);
  for(let y=79;y<=95;y++)for(let x=66;x<=84;x++)if(Math.hypot(x+.5-75.5,y+.5-87.5)<6.8)fl(x,y,3);
  ell(75,16,10,5,7,3);
  tun([[138,66],[168,66]],2);ell(190,66,30,32,2.2,8);ell(197,43,13,7,3.3,9);   /* núi khoáng thạch + đỉnh núi */
  const OBJ=[],used=[];
  const fine=(x,y)=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if((im[y+j]||[])[x+i]!==0)return false;return true};
  const put=(k,x,y,h,w,o)=>{const ob=Object.assign({k,x,y,ax:x*T+4,ay:(y+1)*T,h,w,alive:1,rt:0},o||{});OBJ.push(ob);if(!(o&&o.nb)){im[y][x]=WALL;rid[y][x]=0}return ob};
  for(let y=4;y<H-4;y++)for(let x=4;x<W-4;x++){
    if(kd[y][x]!==1||im[y][x]!==0)continue;
    const h=hs(x*7+3,y*13+5)%1000,h2=hs(x*5+1,y*11+2)%1000;
    if(h>=9&&h2>=4)continue;
    if(!fine(x,y)||Math.hypot(x-75,y-87)<9||(Math.abs(x-75)<=5&&y<52)||(y<30&&Math.hypot((x-75)/16,(y-16)/10)<1.1))continue;
    if(used.some(u=>Math.hypot(u[0]-x,u[1]-y)<3.2))continue;
    used.push([x,y]);
    if(h<9)put('cl',x,y,26,18,{col:hs(x,y)%2});else put('st',x,y,16,8)}
  for(let y=4;y<H-4;y++)for(let x=4;x<W-4;x++)if(kd[y][x]===1&&im[y][x]===0&&hs(x*3+9,y*7+1)%1000<14&&!(Math.abs(x-75)<=3&&y<50))put('sc',x,y,8,8,{nb:1,col:hs(x,y)%2});
  /* quặng trên núi: dùng kind 'cl' + thuộc tính ore */
  for(let y=4;y<H-4;y++)for(let x=150;x<W-4;x++){
    if(kd[y][x]!==8||im[y][x]!==0)continue;
    const h=hs(x*7+3,y*13+5)%1000;
    if(h>=22||!fine(x,y)||Math.hypot(x-197,y-46)<12||(Math.abs(y-66)<=3&&x<178))continue;
    if(used.some(u=>Math.hypot(u[0]-x,u[1]-y)<3.2))continue;
    used.push([x,y]);
    if(h<14)put('cl',x,y,16,12,{col:0,ore:['coal','iron','gold'][hs(x,y)%3]});else put('st',x,y,16,8)}
  [[68,17],[82,17],[70,12],[80,12],[71,23],[79,23]].forEach(([x,y])=>{if(im[y]&&im[y][x]===0)put('pillar',x,y,33,12)});
  put('altar',75,13,40,40);[74,76].forEach(x=>{if(im[13][x]===0){im[13][x]=WALL;rid[13][x]=0}});
  /* hàng tinh thể chắn đường lên hang cổ (2 hàng x 5 ô) */
  [34,35].forEach(y=>{for(let x=73;x<=77;x++)if(im[y][x]===0)put('bar',x,y,28,12,{col:(x+y)&1,ex:1,open:0})});
  try{if(localStorage.getItem('deadisland:cbar:'+seed)==='1')OBJ.forEach(o=>{if(o.k==='bar'){o.open=1;o.ex=0;im[o.y][o.x]=0;rid[o.y][o.x]=1}})}catch(_){}
  /* lều + pháp sư đá trên đỉnh núi */
  for(let d=-1;d<=1;d++){im[41][196+d]=WALL;rid[41][196+d]=0}
  OBJ.push({k:'tent',x:196,y:41,ax:196*T+4,ay:42*T,h:40,w:44});
  put('wiz',196,44,24,10,{nb:1});
  OBJ.sort((a,b)=>a.ay-b.ay);
  FL[WC]={im,rid,RM:[null,{n:'Crystal World',f:['rgba(0,0,0,0)','rgba(0,0,0,0)'],x0:0,y0:0,x1:W-1,y1:H-1,s:1}]};
  D={W,H,im,rid,kd,OBJ}}

function spike(x,by,h,w,p){
  for(let j=0;j<h;j++){const top=h-j,ww=top>w?w:Math.max(1,Math.round(top*.9)),y=by-j;
    R(p[0],x-(ww>>1),y,ww,1);R(p[1],x-(ww>>1),y,Math.max(1,ww>>1),1);R(p[2],x+(ww>>1)-(ww>2?1:0),y,1,1)}
  R('#ffffff',x-1,by-h+1,1,2)}
function tileC(x,y){
  const kd=D.kd,k=kd[y][x],h=hs(x,y),px=x*T,py=y*T,Q=(c,a,b,w,hh)=>R(c,px+a,py+b,w,hh),
    K=(dx,dy)=>{const r=kd[y+dy];return r?(r[x+dx]|0):0};
  if(k===0){
    const s=K(0,1);
    if(!(s||K(0,-1)||K(1,0)||K(-1,0)||K(1,1)||K(-1,1)||K(1,-1)||K(-1,-1)))return;
    if(s){Q(h%2?'#1b2d5e':'#182958',0,0,T,T);Q('#2a4580',0,0,T,1);
      if(h%4===0)Q('#0f1a3c',(h>>3)&5,(h>>6)&5,2,3);
      if(h%17===0){Q('#ff6ec7',(h>>3)&5,2,2,3);Q('#ffc0ea',(h>>3)&5,2,1,1)}
      if(h%19===0)Q('#38d8ff',(h>>4)&5,3,1,3);
      Q('#0c1432',0,T-2,T,2)}
    else{Q('#0e1738',0,0,T,T);if(h%5===0)Q('#16225a',(h>>3)&5,(h>>6)&5,3,2)}
    return}
  if(k===2){
    const w=Math.sin(x*.7+y*.5+frame*.05)+Math.sin(x*.3-y*.8+frame*.035);
    Q(w>.9?'#26e8e0':w<-1?'#0a8cb0':'#12bccd',0,0,T,T);
    if((x*3+y*5+(frame>>3))%9===0)Q('#d8fffa',(h>>3)&5,(h>>6)&5,3,1);
    if(K(0,-1)!==2)Q('#a8fff4',0,0,T,1);if(K(-1,0)!==2)Q('#7cf3e6',0,0,1,T);if(K(1,0)!==2)Q('#7cf3e6',T-1,0,1,T);
    if(h%23===0&&((frame>>4)+h)%3)Q('#ff7ac8',(h>>3)&5,(h>>6)&5,2,1);
    return}
  if(k===8||k===9){
    const hi=y<40;
    Q(k===9?((x+y)&1?'#7d8299':'#757a92'):(h%2?'#4d5270':'#474c68'),0,0,T,T);
    if(h%5===0)Q('#2c304a',(h>>3)&5,(h>>6)&5,3,2);
    if(h%9===0)Q(hi?'#e8eeff':'#8e94b4',(h>>4)&6,(h>>8)&6,2,1);
    if(k===8&&h%23===0)Q(['#ff9ad8','#7ae8ff'][h&1],(h>>3)&6,(h>>6)&6,1,1);
    if(K(0,-1)===0)Q('rgba(0,0,0,.4)',0,0,T,3);
    return}
  Q(k===3?((x+y)&1?'#4a5a8a':'#42527e'):(h%2?'#1f4068':'#1a3a60'),0,0,T,T);
  if(k===3){if(h%5===0)Q('#2a3560',(h>>3)&5,(h>>6)&5,3,1);if(h%11===0)Q('#7cfff0',(h>>4)&5,(h>>8)&5,1,1)}
  else{
    if(h%5===0)Q('#142f54',(h>>3)&7,(h>>6)&7,2,1);
    if(h%9===0)Q('#2c5a8a',(h>>4)&7,(h>>8)&7,2,1);
    if(h%23===0&&((frame>>4)+h)%3)Q('#4fe8ff',(h>>3)&7,(h>>6)&7,1,1);
    if(h%31===0)Q('#ff7ac8',(h>>3)&6,(h>>6)&6,2,1)}
  if(K(0,-1)===0)Q('rgba(0,0,0,.4)',0,0,T,3);
  if(K(0,-1)===2||K(0,1)===2||K(-1,0)===2||K(1,0)===2)Q('rgba(80,255,240,.2)',0,0,T,T)}

function cluster(o,sk){
  const x=o.ax+sk,y=o.ay,p=PAL[o.col],pu=.5+.5*Math.sin(frame*.07+o.x);
  cx.globalAlpha=.12+.08*pu;R(p[3],x-14,y-30,28,28);cx.globalAlpha=1;
  R('rgba(0,0,0,.3)',x-10,y-3,20,4);
  [[0,26,7],[-7,17,5],[7,15,5],[-3,11,4],[11,10,4],[-11,9,3]].forEach(([dx,h,w])=>spike(x+dx,y-2,h,w,p));
  if(((frame>>3)+o.x)%11===0){R('#fff',x+2,y-24,1,3);R('#fff',x+1,y-23,3,1)}}
function drawObj(o){
  const x=o.ax,y=o.ay,f=frame;
  if(o.k==='cl'){
    const s=MN[sel]&&MN[sel].o===o?MN[sel]:null;
    (o.ore?oreRock(o,s?rnd(3)-1:0):cluster(o,s?rnd(3)-1:0));
    if(s){cx.globalAlpha=.8;R('#fff',x-3,y-20,1,6);R('#fff',x-2,y-15,3,1);R('#fff',x+3,y-12,1,5);cx.globalAlpha=1}}
  else if(o.k==='st'){R('rgba(0,0,0,.3)',x-5,y-3,10,3);spike(x,y-2,16,6,['#3a2a5a','#5a4a8a','#1c1230'])}
  else if(o.k==='sc'){const p=PAL[o.col];cx.globalAlpha=.8;spike(x-2,y-1,6,3,p);spike(x+2,y-1,4,2,p);cx.globalAlpha=1}
  else if(o.k==='pillar'){
    R('rgba(0,0,0,.3)',x-7,y-2,14,3);R('#4a5280',x-5,y-30,10,30);R('#6a74a8',x-5,y-30,3,30);R('#2a3058',x+3,y-30,2,30);R('#7a84b8',x-7,y-33,14,3);R('#2a3058',x-7,y-31,14,1);
    cx.globalAlpha=.6+.4*Math.sin(f*.08+o.x);R('#7cfff0',x-1,y-24,2,8);R('#7cfff0',x-3,y-20,6,1);R('#7cfff0',x-1,y-12,2,4);cx.globalAlpha=1}
  else if(o.k==='bar'){
    if(o.ex<=0)return;
    const e=o.ex,p=PAL[o.col];
    R('rgba(0,0,0,.3)',x-9,y-3,18,4);
    cx.globalAlpha=.12+.08*Math.sin(f*.07+o.x);R(p[3],x-14,y-30*e,28,28*e);cx.globalAlpha=1;
    spike(x-4,y-2,Math.round(22*e),7,p);spike(x+4,y-2,Math.round(16*e),6,p);spike(x,y-2,Math.round(30*e),9,p)}
  else if(o.k==='tent')dTent(o);
  else if(o.k==='wiz')dWiz(o);
  else if(o.k==='altar'){
    const got=GOT[sel],s=MN[sel]&&MN[sel].o===o;
    R('rgba(0,0,0,.35)',x-22,y-3,44,5);R('#4a5280',x-20,y-8,40,8);R('#6a74a8',x-20,y-8,40,2);R('#2a3058',x-20,y-1,40,1);
    R('#5a6498',x-13,y-14,26,6);R('#7a84b8',x-13,y-14,26,1);
    cx.globalAlpha=.5+.3*Math.sin(f*.06);for(let i=-16;i<=14;i+=6)R('#7cfff0',x+i,y-5,3,1);cx.globalAlpha=1;
    if(!got){
      cx.globalAlpha=.2+.1*Math.sin(f*.08);R('#ffe9a8',x-20,y-52,40,42);cx.globalAlpha=1;
      const sh=s?rnd(3)-1:0;
      spike(x+sh,y-14,30,10,['#c8b0ff','#ffffff','#7a58d0']);spike(x-7+sh,y-14,18,6,['#e8d8ff','#ffffff','#9a7cff']);spike(x+7+sh,y-14,15,6,['#b8f4ff','#ffffff','#38a8d8']);
      R('#ffd23f',x-1+sh,y-34,2,6);
      for(let a=0;a<6.28;a+=.5)R('#ffe9a8',x+Math.cos(a+f*.03)*17,y-30+Math.sin(a+f*.03)*5,2,1)}
    else{R('#3a3a50',x-6,y-18,4,4);R('#5a5a78',x+1,y-17,5,3);R('#2a2a40',x-2,y-16,3,2)}}}
function target(P){
  if(Math.hypot(P.x-BX,P.y-BY)<30)return{t:'back'};
  const al=D.OBJ.find(o=>o.k==='altar');
  if(al&&Math.hypot(P.x-al.ax,P.y-(al.ay+8))<26)return{t:'altar',o:al};
  let b=null,bd=24;D.OBJ.forEach(o=>{if(o.k!=='cl'||!o.alive)return;const d=Math.hypot(P.x-o.ax,P.y-(o.ay-4));if(d<bd){bd=d;b=o}});
  return b?{t:'cl',o:b}:null}
function drawBack(){
  const vw=CW/IS,vh=CH/IS,f=frame;
  let g=cx.createLinearGradient(0,camY,0,camY+vh);g.addColorStop(0,'#0b1234');g.addColorStop(1,'#1c1458');cx.fillStyle=g;cx.fillRect(camX-2,camY-2,vw+4,vh+4);
  for(let i=0;i<70;i++){cx.globalAlpha=.3+.7*Math.abs(Math.sin(f*.03+i));R(i%4?'#cfe8ff':'#ffb8f0',camX+(hs(i,1)%1000)/1000*vw,camY+(hs(i,2)%1000)/1000*vh,1+(i%7===0),1)}
  cx.globalAlpha=1;
  ISLETS.forEach(([tx,ty],i)=>{const x=tx*T,y=ty*T+Math.sin(f*.02+i)*3;
    if(x<camX-30||x>camX+vw+30||y<camY-30||y>camY+vh+30)return;
    for(let j=0;j<12;j++){const w=Math.round(12*(1-j/13));R(j<2?'#6a5e90':j<7?'#463e6a':'#2a2444',x-w,y+j,w*2,1)}
    spike(x-3,y,12,4,PAL[i%2]);spike(x+3,y,8,3,PAL[(i+1)%2]);
    cx.globalAlpha=.12;R(PAL[i%2][3],x-14,y-14,28,16);cx.globalAlpha=1});
  const x0=Math.max(0,Math.floor(camX/T)-1),y0=Math.max(0,Math.floor(camY/T)-1),x1=Math.min(D.W-1,x0+Math.ceil(vw/T)+3),y1=Math.min(D.H-1,y0+Math.ceil(vh/T)+3);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)tileC(x,y);
  const fx=120*T,fw=5*T,top=19*T,bot=31*T+4;
  if(fx+fw>camX&&fx<camX+vw&&bot>camY&&top<camY+vh){
    cx.globalAlpha=.9;R('#10a8c8',fx,top,fw,bot-top);
    for(let c=0;c<fw;c+=2)for(let yy=top;yy<bot;yy+=5){const o=(yy+f*2+c*7)%24;if(o<10){cx.fillStyle=o<4?'#d8fffa':'#6ff0e0';cx.fillRect(fx+c,yy,2,Math.min(5,bot-yy))}}
    R('#0a6a88',fx,top,2,bot-top);R('#0a6a88',fx+fw-2,top,2,bot-top);
    cx.globalAlpha=.25;for(let i=0;i<8;i++)R('#cffff8',fx-4+((i*9+(f>>1))%(fw+8)),bot-6-((f>>2)+i*3)%8,6,3);cx.globalAlpha=1}
  drawMagicCircle();
  /* trận pháp quay về */
  cx.imageSmoothingEnabled=false;cx.drawImage(CIR0,BX-32,BY-32);
  cx.save();cx.globalCompositeOperation='lighter';
  cx.globalAlpha=.4+.25*Math.sin(f*.06);cx.drawImage(CIRO,BX-32,BY-32);
  g=cx.createLinearGradient(0,BY-70,0,BY);g.addColorStop(0,'rgba(255,170,240,0)');g.addColorStop(1,'rgba(255,170,240,.28)');cx.globalAlpha=1;cx.fillStyle=g;cx.fillRect(BX-8,BY-70,16,70);
  cx.restore();
  const lx=x0*T-40,rx=x1*T+40,ty=y0*T-70,by=y1*T+70;
  D.OBJ.forEach(o=>{if(o.ax<lx||o.ax>rx||o.ay<ty||o.ay>by)return;if(o.k==='cl'&&!o.alive)return;drawObj(o)})}
function drawFront(){
  const L=ins.filter(p=>p.fl===WC),vw=CW/IS,vh=CH/IS,f=frame;
  D.OBJ.forEach(o=>{if(o.k==='sc'||o.h<14||(o.k==='cl'&&!o.alive))return;
    if(L.some(q=>q.y<o.ay-1&&q.y>o.ay-o.h-4&&Math.abs(q.x-o.ax)<o.w/2))drawObj(o)});
  Object.keys(MN).forEach(k=>{const P=L.find(p=>p.pl===+k);if(P)pickSwing(P,MN[k].o.ax,MN[k].t)});
  cx.save();cx.globalCompositeOperation='lighter';
  for(let i=0;i<4;i++){const x=camX+(i+.3)*vw/4+Math.sin(f*.01+i)*6;cx.globalAlpha=.05+.02*Math.sin(f*.02+i);cx.fillStyle='#c8b8ff';
    cx.beginPath();cx.moveTo(x,camY);cx.lineTo(x+26,camY);cx.lineTo(x+26+vh*.5,camY+vh);cx.lineTo(x+vh*.5,camY+vh);cx.closePath();cx.fill()}
  cx.restore();cx.globalAlpha=1;
  for(let i=0;i<16;i++){const t=Math.sin(f*.05+i*1.7);if(t<.6)continue;
    const x=camX+(hs(i,5)%1000)/1000*vw,y=camY+(hs(i,6)%1000)/1000*vh;cx.globalAlpha=(t-.6)*2.2;R('#ffffff',x,y-2,1,5);R('#ffffff',x-2,y,5,1);R(i%2?'#ff9ae8':'#7ae8ff',x,y,1,1)}
  cx.globalAlpha=1;drawPT(WC);
  drawRit();
  {const PW=L.find(p=>p.pl===sel);if(PW&&nearWiz(PW)&&!RIT&&!TK)label(WZX,WZY-48,'E: Nói chuyện với Pháp sư Đá','#c8b0ff')}
  const P=L.find(p=>p.pl===sel);
  if(P&&!MN[sel]){const tg=target(P);
    if(tg){
      if(tg.t==='back')label(BX,BY-44,'E: Quay lại hang','#ff9ae8');
      else if(tg.t==='altar')label(tg.o.ax,tg.o.ay-56,GOT[sel]?'Đã đào viên đá':(hasPick(sel)?'E: Đào viên đá cổ':'Cần cuốc'),GOT[sel]?'#aaa':'#ffe9a8');
      else label(tg.o.ax,tg.o.ay-38,hasPick(sel)?(tg.o.ore?'E: Đào '+ONAME[tg.o.ore]:'E: Đào tinh thể'):'Cần cuốc','#7ae8ff')}}}

/* ---------- Đào ---------- */
function startMine(P,tg){
  if(!hasPick(P.pl)){cap('Bạn cần một chiếc cuốc để đào. Cuốc nằm trong các thùng cuốc ở hang than và hang sắt/vàng của hang cấm.');return}
  if(MN[P.pl])return;
  if(tg.t==='altar'&&GOT[P.pl]){cap('P'+P.pl+' đã đào Viên đá trong hang cổ rồi.');return}
  MN[P.pl]={o:tg.o,t:0,d:tg.t==='altar'?2.6:1.2,k:tg.t,hit:0};
  cap(tg.t==='altar'?'P'+P.pl+' vung cuốc đập vào viên đá cổ phát sáng...':'P'+P.pl+' vung cuốc đào...')}
function finishMine(P,s){
  const n=P.pl,o=s.o;
  if(s.k==='altar'){
    if(window.giveItem(n,'wstone')){GOT[n]=1;saveG();burst(o.ax,o.ay-30,WC,50,['#ffe9a8','#e8d8ff','#ffffff'],3.5,3);flash=10;
      cap('P'+n+' đào được Viên đá trong hang cổ! Mục này sẽ được đánh dấu trong danh sách của Pháp sư.')}
    return}
  o.alive=0;o.rt=40;D.im[o.y][o.x]=0;D.rid[o.y][o.x]=1;
  if(o.ore){addCr(n,o.ore);burst(o.ax,o.ay-10,WC,18,[ORC[o.ore][0],ORC[o.ore][1],'#ffffff'],2.4,2);cap('P'+n+' đào được '+ONAME[o.ore]+'.')}
  else{addCr(n,o.col===1?'p':'b');burst(o.ax,o.ay-12,WC,34,PAL[o.col],3,2.5);cap('P'+n+' đào được tinh thể '+(o.col===1?'tím':'xanh')+'.')}}
function tick(dt){
  moonTick(dt);
  PT.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=.06;q.l--});PT=PT.filter(q=>q.l>0);
  if(G.mine){
    const s=G.mine,P=allPl().find(p=>p.pl===s.n&&p.fl===6);
    if(!P||!nearCircle(P))G.mine=null;
    else{s.t+=dt;const h=Math.floor(s.t/.4);
      if(h>s.hit){s.hit=h;burst(GPX+rnd(21)-10,GPY-20-rnd(16),6,8,GREY,1.6,1.2);shake=Math.max(shake,3)}
      if(s.t>=s.d)openGate()}}
  const SP0=allPl().find(p=>p.pl===sel&&p.fl===6),nr=!!(SP0&&!G.open&&nearCircle(SP0));
  if(nr&&!hintG)cap('Một cổng đá cổ bị đống đá lớn chặn kín, dưới chân có trận pháp mờ nhạt đang phát sáng. Có lẽ cần cuốc để đập đá.');
  hintG=nr?1:0;
  if(G.open&&!trans)ins.forEach(p=>{if(p.pl&&p.fl===6){const tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);if(tx>=84&&tx<=86&&ty<=48)window.worldTransfer(p.pl,'crystal')}});
  if(!D)return;
  Object.keys(MN).forEach(k=>{
    const s=MN[k],P=allPl().find(p=>p.pl===+k&&p.fl===WC);
    if(!P||Math.hypot(P.x-s.o.ax,P.y-(s.o.ay+(s.k==='altar'?8:-4)))>40){delete MN[k];return}
    s.t+=dt;const h=Math.floor(s.t/.4);
    if(h>s.hit){s.hit=h;burst(s.o.ax,s.o.ay-14,WC,6,s.k==='altar'?['#ffe9a8','#ffffff']:PAL[s.o.col],1.6,1.4)}
    if(s.t>=s.d){delete MN[k];finishMine(P,s)}});
  D.OBJ.forEach(o=>{if(o.k==='cl'&&!o.alive){o.rt-=dt;
    if(o.rt<=0&&!allPl().some(p=>p.fl===WC&&Math.hypot(p.x-o.ax,p.y-(o.ay-4))<10)){o.alive=1;D.im[o.y][o.x]=WALL;D.rid[o.y][o.x]=0;burst(o.ax,o.ay-12,WC,10,o.ore?[ORC[o.ore][0],ORC[o.ore][1]]:PAL[o.col],1.5,1.5)}}})}

/* ================= PHÁP SƯ ĐÁ + NHẪN TRĂNG + KỸ NĂNG T ================= */
const CKEY='deadisland:cstack',QKEY='deadisland:cwq',EKEY='deadisland:equip',BKEY='deadisland:cbar:';
const ONAME={coal:'Than',iron:'Sắt',gold:'Vàng'},ORC={coal:['#15161b','#454957'],iron:['#d08a5a','#f4c9a0'],gold:['#ffd23f','#fff3a0']};
const CPX2=204*T+4,CPY2=44*T+4,WZX=196*T+4,WZY=44*T+4,NEED=10,TCD=1;
let CS={},QS={},RIT=null,MC=[],SP=[],TC={},EQC={f:-99,n:0,v:false},crSig='';
try{CS=JSON.parse(localStorage.getItem(CKEY))||{}}catch(_){}
try{QS=JSON.parse(localStorage.getItem(QKEY))||{}}catch(_){}
const saveCS=()=>{try{localStorage.setItem(CKEY,JSON.stringify(CS));localStorage.setItem(QKEY,JSON.stringify(QS))}catch(_){}};
const vF=f=>inside?f===curF:!f;
const crOf=n=>CS[n]||(CS[n]={b:0,p:0,coal:0,iron:0,gold:0});
function addCr(n,k,q){const c=crOf(n);c[k]=(c[k]|0)+(q||1);saveCS();hudCr()}
function packBag(n){
  [['cshard','b'],['cshardp','p']].forEach(([id,k])=>{let c=0;while(c<40&&window.takeItem(n,id))c++;if(c)crOf(n)[k]+=c});
  saveCS();hudCr()}
function hasRing(n){
  if(frame-EQC.f>=10||EQC.n!==n){
    let v=false;try{const E=JSON.parse(localStorage.getItem(EKEY))||{};v=!!(E[n]&&E[n].ring==='moonring')}catch(_){}
    EQC={f:frame,n,v}}
  return EQC.v}

const MIC=document.createElement('canvas');MIC.width=MIC.height=16;
(()=>{const g=MIC.getContext('2d');g.fillStyle='#e4e0ff';g.fillRect(0,0,16,16);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){
    const a=Math.hypot(x+.5-8,y+.5-8)<=7,b=Math.hypot(x+.5-10.5,y+.5-6.5)<=6;
    if(a&&!b){const d=Math.hypot(x+.5-6,y+.5-10);g.fillStyle=d<3?'#5a6ad0':d<5.5?'#3a4a9e':'#262a6a';g.fillRect(x,y,1,1)}}
  g.fillStyle='#5ac8ff';[[3,2],[12,3],[11,11],[2,13],[14,7]].forEach(([x,y])=>g.fillRect(x,y,1,1));
  g.fillStyle='#7cfff0';g.fillRect(9,6,1,1)})();

const sty2=document.createElement('style');
sty2.textContent='#hsT{padding:4px;min-width:0;position:relative}#hsT canvas{width:40px;height:40px;image-rendering:pixelated;display:block}'+
 '#hsT .cd{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 13px monospace;color:#2a2a6a;text-shadow:1px 1px 0 #fff}#hCr{font-size:12px;line-height:1.3;white-space:nowrap}';
document.head.appendChild(sty2);
const hT=document.createElement('div');hT.className='pnl';hT.id='hsT';hT.hidden=true;
const hTi=document.createElement('canvas');hTi.width=hTi.height=16;hTi.getContext('2d').drawImage(MIC,0,0);
const hTc=document.createElement('span');hTc.className='cd';hT.append(hTi,hTc);
const hCr=document.createElement('div');hCr.className='pnl';hCr.id='hCr';hCr.hidden=true;
$('topRow').appendChild(hT);$('topRow').appendChild(hCr);
function hudCr(){
  const c=crOf(sel),any=c.b||c.p||c.coal||c.iron||c.gold,s=sel+'|'+JSON.stringify(c);
  hCr.hidden=!(state==='island'&&any);if(s===crSig)return;crSig=s;
  hCr.innerHTML='🔷 '+c.b+' · 🔮 '+c.p+(c.coal?' · ⚫ '+c.coal:'')+(c.iron?' · 🟠 '+c.iron:'')+(c.gold?' · 🟡 '+c.gold:'')}
setInterval(()=>{
  const ok=state==='island'&&hasRing(sel);hT.hidden=!ok;
  if(ok){const c=TC[sel]||0;hTi.style.filter=c>0?'brightness(.4) saturate(.3)':'none';hTc.textContent=c>0?Math.ceil(c)+'s':'';hT.title='Ánh trăng [T]: tinh thể đâm lên 25-36 sát thương, hồi 1s'}
  if(state==='island')hudCr()},150);

/* ---------- hình vẽ: lều, pháp sư, vòng phép, quặng, nhẫn ---------- */
function oreRock(o,sk){
  const x=o.ax+sk,y=o.ay,C=ORC[o.ore];
  R('rgba(0,0,0,.3)',x-8,y-3,16,4);
  for(let j=0;j<13;j++){const w=Math.round(7*Math.sqrt(Math.max(0,1-Math.pow((j-6)/7,2)))+1);R(j>9?'#8a90a6':j>4?'#666c82':'#434860',x-w,y-2-j,w*2,1)}
  R('#9aa0b8',x-5,y-12,5,1);
  [[-4,-5],[2,-8],[-1,-3],[4,-4],[-3,-9]].forEach(([a,b])=>{R(C[0],x+a,y+b,3,2);R(C[1],x+a,y+b,1,1)});
  if(o.ore==='gold'&&((frame>>3)+o.x)%9===0)R('#fff',x+2,y-9,1,1)}
function dTent(o){
  const x=o.ax,y=o.ay;
  R('rgba(0,0,0,.35)',x-24,y-3,48,5);
  for(let j=0;j<34;j++){const w=Math.round(23*(1-j/34))+1,yy=y-3-j;
    R(j%7===0?'#2a1a44':'#6a46a8',x-w,yy,w,1);R(j%7===0?'#1a0e30':'#432a74',x,yy,w,1)}
  for(let j=0;j<16;j++){const w=Math.round(6*(1-j/18));R('#140a22',x-w,y-3-j,w*2,1)}
  cx.globalAlpha=.5+.2*Math.sin(frame*.1);R('#ffb347',x-1,y-7,3,4);cx.globalAlpha=1;
  R('#6b4423',x,y-46,1,12);R('#c050ff',x+1,y-46,7,4);R('#e8b8ff',x+1,y-46,7,1);
  spike(x,y-33,8,4,PAL[1])}
function dWiz(o){
  const x=o.ax,y=o.ay,f=frame,b=Math.round(Math.sin(f*.05)),cast=!!(RIT&&RIT.t<4.4);
  R('rgba(0,0,0,.3)',x-8,y-2,16,3);
  cx.globalAlpha=.12+.06*Math.sin(f*.08);R('#8a63d8',x-14,y-40,28,40);cx.globalAlpha=1;
  for(let i=0;i<20;i++){const w=Math.round(10-i*.35+(i<3?1:0));
    R(i%5===1?'#2a2158':'#1d1745',x-w,y-2-i,w*2,1);R('#120d2e',x+w-3,y-2-i,3,1)}
  for(let i=-9;i<=9;i+=3)R('#120d2e',x+i,y-2+((i+9)/3&1),2,1);
  R('#8a63d8',x-1,y-18,2,10);
  R('#1d1745',x-4,y-29+b,8,8);R('#1d1745',x-1,y-31+b,3,2);R('#0a0620',x-3,y-27+b,6,5);
  R('#7cfff0',x-2,y-26+b,1,1);R('#7cfff0',x+1,y-26+b,1,1);
  if(cast){R('#1d1745',x+4,y-24,3,3);R('#1d1745',x+6,y-36,2,13);R('#cfc0ff',x+5,y-38,3,2);
    cx.globalAlpha=.7;R('#c8b0ff',x+4,y-42-((f>>1)%4),4,4);cx.globalAlpha=1}
  else{R('#1d1745',x+4,y-20,3,6);R('#6b4423',x+8,y-32,1,30);R('#8a63d8',x+7,y-37,3,5);R('#d8c8ff',x+8,y-37,1,2)}
  label(x,y-50,'Pháp sư Đá','#c8b0ff')}
function drawMagicCircle(){
  const x=CPX2,y=CPY2;if(x<camX-40||x>camX+CW/IS+40||y<camY-40||y>camY+CH/IS+40)return;
  cx.imageSmoothingEnabled=false;cx.drawImage(CIR0,x-32,y-32);
  cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=.18+.12*Math.sin(frame*.06);cx.drawImage(CIRL,x-32,y-32);cx.restore()}
function ringDraw(x,y,s,al){
  cx.save();cx.globalAlpha=al;cx.translate(Math.round(x),Math.round(y));cx.scale(s,s);
  cx.globalCompositeOperation='lighter';cx.globalAlpha=al*(.25+.1*Math.sin(frame*.2));R('#8aa0ff',-10,-12,20,22);
  cx.globalCompositeOperation='source-over';cx.globalAlpha=al;
  for(let a=0;a<6.28;a+=.28)R('#d8d8f4',Math.cos(a)*5-1,Math.sin(a)*5+2,2,2);
  R('#9a9ab8',-3,-3,6,2);R('#0a0a60',-2,-7,4,3);R('#2030ff',-1,-8,2,1);R('#6a8aff',-1,-6,1,1);
  cx.restore()}
function moonBall(x,y,r,al){
  cx.save();cx.globalAlpha=al;cx.globalCompositeOperation='lighter';
  const g=cx.createRadialGradient(x,y,r*.6,x,y,r*3);g.addColorStop(0,'rgba(170,200,255,.5)');g.addColorStop(1,'rgba(170,200,255,0)');
  cx.fillStyle=g;cx.fillRect(x-r*3,y-r*3,r*6,r*6);cx.restore();cx.globalAlpha=al;
  for(let j=-r;j<=r;j++){const w=Math.floor(Math.sqrt(r*r-j*j));R('#f3f6ff',x-w,y+j,w*2,1);if(j>r*.2)R('#cfd8f4',x-w,y+j,Math.max(1,w-2),1)}
  [[-.35,-.25,.22],[.25,.1,.28],[-.1,.45,.18]].forEach(([a,b,c])=>R('#c3cde8',x+a*r,y+b*r,Math.max(2,Math.round(c*r)),Math.max(2,Math.round(c*r*.7))));
  cx.globalAlpha=1}

/* ---------- Pháp sư Đá: hội thoại + nhiệm vụ ---------- */
const nearWiz=P=>P.fl===WC&&Math.hypot(P.x-WZX,P.y-WZY)<34;
function wnode(k,n){
  const q=QS[n]|0,c=crOf(n),ok=c.b>=NEED&&c.p>=NEED,st='Ngươi đang có '+c.b+'/'+NEED+' tinh thể xanh và '+c.p+'/'+NEED+' tinh thể tím.';
  const BK={t:'Quay lại',go:0};
  switch(k){
  case 0:{const o=[{t:'Ngài là ai?',go:1},{t:'Cho ta hỏi về Crystal World',go:2}];
    if(q===0)o.push({t:'Ngài có việc gì cần nhờ không?',go:3});
    else if(q===1)o.push({t:'Về nhiệm vụ đào tinh thể',go:5});
    else if(q===3)o.push({t:'Nhận chiếc nhẫn',act:'ring'});
    else o.push({t:'Hỏi về chiếc nhẫn',go:7});
    o.push({t:'Tạm biệt',end:1});
    return{t:q>=2?'Chiếc nhẫn hợp với ngươi đấy. Cần gì cứ hỏi.':'Hừm... lại có kẻ leo được lên tận đỉnh núi này. Ngươi cần gì?',o}}
  case 1:return{t:'Ta là Pháp sư Đá, sống trên đỉnh núi khoáng thạch này từ trước khi các ngươi tới. Ta nghiên cứu tinh thể của Crystal World, thứ năng lượng ngủ yên trong lòng đá.',o:[BK]};
  case 2:return{t:'Crystal World là mảnh đất nổi giữa trời, tinh thể xanh và tím mọc khắp nơi, phải có cuốc mới đào được. Núi này có than, sắt và vàng. Phía bắc là hang cổ giữ một viên đá, nhưng lối lên bị hàng tinh thể chắn kín.',o:[{t:'Làm sao mở hàng tinh thể chắn lối?',go:4},BK]};
  case 3:return{t:'Có. Hãy đào cho ta '+NEED+' tinh thể xanh và '+NEED+' tinh thể tím. Ta sẽ dùng chúng để tạo ra một thứ hữu ích cho ngươi.',o:[{t:'Ta nhận nhiệm vụ',act:'accept'},{t:'Để sau',go:0}]};
  case 4:return{t:'Hàng tinh thể đó chỉ rút lại khi gặp ánh trăng tinh thể. Ta sẽ chế ra một chiếc nhẫn mang sức mạnh ấy, hãy làm nhiệm vụ của ta rồi sẽ rõ.',o:[BK]};
  case 5:return ok?{t:st+' Đủ rồi! Đưa chúng cho ta.',o:[{t:'Giao tinh thể',act:'turnin'},BK]}
    :{t:st+' Hãy đào thêm bằng cuốc ở các cụm tinh thể quanh hồ.',o:[{t:'Ta sẽ đi đào',end:1},BK]};
  case 6:return{t:'Tốt. Quay lại khi đủ '+NEED+' mỗi loại. Cụm tinh thể mọc lại sau một lúc, đừng lo hết.',o:[{t:'Ta hiểu rồi',end:1}]};
  case 7:return{t:'Nhẫn Trăng Tinh Thể: mở túi (B), chọn nhẫn rồi bấm Trang bị. Sau đó bấm T để triệu hồi mặt trăng, ánh trăng làm tinh thể đâm lên quanh ngươi. Nó cũng rút hàng tinh thể chắn lối hang cổ.',o:[BK]};
  case 8:return{t:'Túi của ngươi đã đầy, ta không đưa nhẫn được. Dọn bớt đồ (phím B) rồi nói chuyện lại với ta.',o:[{t:'Ta hiểu rồi',end:1}]};
  default:return{t:'Cầm lấy chiếc nhẫn. Đeo vào ô Nhẫn rồi bấm T dưới trăng sáng.',o:[{t:'Cảm ơn ngài',end:1}]}}}
function wRender(){
  const n=wnode(TK.node,TK.P.pl),o=$('dO');
  $('dlg').hidden=false;$('dN').textContent='Pháp sư Đá (nói với P'+TK.P.pl+')';$('dT').textContent=n.t;o.innerHTML='';
  n.o.forEach((a,i)=>{const b=document.createElement('button');b.className='btn';b.textContent=(i+1)+'. '+a.t;b.onclick=()=>wPick(a);o.append(b)});
  o.firstChild.focus()}
function wPick(a){
  if(!TK||!TK.wz)return;
  if(a.end){closeTalk();return}
  const n=TK.P.pl;
  if(a.act==='accept'){QS[n]=1;saveCS();TK.node=6}
  else if(a.act==='turnin'){
    const c=crOf(n);if(c.b<NEED||c.p<NEED){TK.node=5;wRender();return}
    c.b-=NEED;c.p-=NEED;saveCS();hudCr();const P=TK.P;TK=null;$('dlg').hidden=true;startRit(P);return}
  else if(a.act==='ring'){
    ensure();
    if(window.giveItem(n,'moonring')){QS[n]=2;saveCS();TK.node=9}else TK.node=8}
  else TK.node=a.go;
  wRender()}
function wOpen(P){packBag(P.pl);TK={P,wz:1,node:0};$('tk').hidden=true;wRender()}
const _closeW=closeTalk;closeTalk=function(){if(TK&&TK.wz){TK=null;$('dlg').hidden=true;return}_closeW()};
const _tkW=tkUI;tkUI=function(){_tkW();
  const e=$('tk'),P=allPl().find(p=>p.pl===sel&&p.fl===WC);
  if(!e||!P||state!=='island'||TK||trans||RIT)return;
  if(nearWiz(P)){e.innerHTML='Bấm <b>E</b> để nói chuyện với Pháp sư Đá';e.hidden=false}};

/* ---------- cắt cảnh: đặt tinh thể xuống vòng phép, nổ đá, hiện nhẫn ---------- */
function startRit(P){
  RIT={n:P.pl,t:0,e:0,cr:Array.from({length:20},(_,i)=>({c:i%2,ph:Math.random()*6.28,dl:i*.06}))};
  cap('Pháp sư Đá đón lấy đống tinh thể và bước tới vòng phép...')}
function tickRit(dt){
  if(!RIT)return;const r=RIT;r.t+=dt;
  if(r.t>1.8&&r.t<4.2&&frame%2===0)burst(CPX2+rnd(41)-20,CPY2+rnd(15)-7,WC,2,PAL[rnd(2)],1,2);
  if(r.t>2.4&&r.t<4.2)shake=Math.max(shake,Math.round((r.t-2.4)*3));
  if(r.t>=4.2&&!r.e){r.e=1;burst(CPX2,CPY2-8,WC,90,GREY.concat(PAL[0],PAL[1]),5,4);flash=22;shake=Math.max(shake,16);cap('ẦM! Đá văng tung tóe giữa vòng phép...')}
  if(r.t>=7.6){
    const n=r.n;RIT=null;ensure();
    if(window.giveItem(n,'moonring')){QS[n]=2;cap('Pháp sư Đá trao cho P'+n+' Nhẫn Trăng Tinh Thể! Mở túi (B), chọn nhẫn rồi bấm Trang bị. Bấm T để dùng.')}
    else{QS[n]=3;cap('Túi đã đầy! Dọn bớt đồ rồi nói chuyện lại với Pháp sư Đá để nhận nhẫn.')}
    saveCS()}}
function drawRit(){
  const r=RIT;if(!r)return;
  const t=r.t,P=allPl().find(p=>p.pl===r.n),gl=clamp((t-1.2)/1.5,0,1)*(t<4.2?1:Math.max(0,1-(t-4.2)/.6));
  cx.save();cx.globalCompositeOperation='lighter';
  cx.translate(CPX2,CPY2);cx.rotate(t*.8);cx.globalAlpha=Math.min(1,.15+.8*gl);cx.drawImage(CIRO,-32,-32);cx.restore();
  if(gl>0){cx.save();cx.globalCompositeOperation='lighter';
    const g=cx.createLinearGradient(0,CPY2-130,0,CPY2);g.addColorStop(0,'rgba(200,160,255,0)');g.addColorStop(1,'rgba(200,160,255,'+(.45*gl).toFixed(3)+')');
    cx.fillStyle=g;cx.fillRect(CPX2-12,CPY2-130,24,130);cx.restore()}
  if(t<4.2)r.cr.forEach(c=>{
    let x,y;
    if(t<1.8){const u=clamp((t-c.dl)/1.2,0,1),e=u*u*(3-2*u),sx=WZX+6,sy=WZY-20;x=sx+(CPX2-sx)*e;y=sy+(CPY2-sy)*e-Math.sin(Math.PI*e)*26}
    else{const q=Math.min(1,(t-1.8)/2.4),a=c.ph+t*(2+q*5),rd=18*(1-q*.7);x=CPX2+Math.cos(a)*rd;y=CPY2-q*36+Math.sin(a)*rd*.5}
    spike(Math.round(x),Math.round(y),7,3,PAL[c.c])});
  if(t>=4.4){
    const q=clamp((t-4.4)/1.8,0,1);let x=CPX2,y=CPY2-q*40;
    if(t>6.2){const u=clamp((t-6.2)/1.4,0,1),e=u*u,tx=P?P.x:CPX2,ty=P?P.y-14:CPY2-40;x=CPX2+(tx-CPX2)*e;y=(CPY2-40)+(ty-(CPY2-40))*e}
    ringDraw(x,y,1+.6*(1-Math.abs(q-.5)),Math.min(1,q*2))}}

/* ---------- kỹ năng T: ánh trăng tinh thể ---------- */
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.key.toLowerCase()!=='t')return;
  if(state!=='island'||TK||trans||RIT)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const n=sel,P=allPl().find(p=>p.pl===n);if(!P||!hasRing(n)||(TC[n]||0)>0)return;
  TC[n]=TCD;MC=MC.filter(c=>c.n!==n);MC.push({n,t:0,d:2,fired:0});
  cap('Mặt trăng tinh thể bay lên, ánh trăng sắp chiếu xuống...')});
function castMoon(P){
  const fl=P.fl|0,arena=(fl===22||fl===23);let k=0;
  for(let i=0;i<18;i++){
    const a=i*2.399+Math.random()*.5,r=16+Math.sqrt((i+1)/18)*88,x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r*.75;
    if(!walk(x,y,P))continue;
    SP.push({n:P.pl,x,y,fl,t:-(k++)*.04,col:i%2,hit:0,arena})}
  if(fl===WC&&D)D.OBJ.forEach(o=>{if(o.k==='bar'&&!o.open&&Math.hypot(P.x-o.ax,P.y-o.ay)<150)SP.push({n:P.pl,x:o.ax,y:o.ay-2,fl,t:-.15,col:o.col,hit:0,bar:o,arena:0})})}
function openBar(o){
  if(o.open)return;o.open=1;D.im[o.y][o.x]=0;D.rid[o.y][o.x]=1;
  if(D.OBJ.filter(q=>q.k==='bar').every(q=>q.open)){
    try{localStorage.setItem(BKEY+seed,'1')}catch(_){}
    cap('Hàng tinh thể chắn lối rút xuống đất! Đường lên hang cổ đã mở.')}}
function moonTick(dt){
  Object.keys(TC).forEach(k=>{if(TC[k]>0)TC[k]-=dt});
  MC.forEach(c=>{c.t+=dt;if(!c.fired&&c.t>=.85){c.fired=1;const P=allPl().find(p=>p.pl===c.n);if(P)castMoon(P)}});
  MC=MC.filter(c=>c.t<c.d);
  SP.forEach(s=>{
    s.t+=dt;
    if(s.t>=.35&&!s.hit){s.hit=1;
      if(s.bar)openBar(s.bar);
      if(s.arena&&window.MONS&&window.holyHurt)window.MONS().slice().forEach(m=>{
        const rr=17+(m.k==='boss'?(m.sky?40:16):0);
        if(Math.hypot(m.x-s.x,m.y-s.y)<rr)window.holyHurt(m,ri(25,36),false,s.n)});
      burst(s.x,s.y-6,s.fl,6,PAL[s.col],1.6,1.6)}});
  SP=SP.filter(s=>s.t<1.5);
  if(D)D.OBJ.forEach(o=>{if(o.k==='bar'&&o.open&&o.ex>0){o.ex=Math.max(0,o.ex-dt*1.3);if(frame%3===0)burst(o.ax,o.ay-10,WC,1,PAL[o.col],1,1)}});
  tickRit(dt)}
function drawMoonCast(c,P){
  const off=window.islOffset?window.islOffset(P):0,gx=P.x,gy=P.y-off;let rise,sc;
  if(c.t<.35){const u=1-Math.pow(1-c.t/.35,3);rise=64*u;sc=.3+.7*u}
  else if(c.t<1.5){rise=64+Math.sin(c.t*7)*1.5;sc=1}
  else{const u=(c.t-1.5)/(c.d-1.5);rise=64+140*u*u;sc=1-.85*u}
  const mx=gx,my=gy-12-rise,al=c.t>c.d-.3?Math.max(0,(c.d-c.t)/.3):1,top=my-20;
  cx.save();cx.globalCompositeOperation='lighter';
  const g=cx.createLinearGradient(0,top,0,gy);g.addColorStop(0,'rgba(170,200,255,0)');g.addColorStop(.5,'rgba(170,200,255,.28)');g.addColorStop(1,'rgba(230,240,255,.5)');
  cx.globalAlpha=al;cx.fillStyle=g;cx.fillRect(Math.round(gx-7),Math.round(top),14,Math.max(1,Math.round(gy-top)));cx.restore();
  for(let q=0;q<6.28;q+=.4)R(q*5%2<1?'#9ac4ff':'#ffffff',gx+Math.cos(q+c.t*3)*15,gy+Math.sin(q+c.t*3)*5,2,1);
  moonBall(Math.round(mx),Math.round(my),Math.max(3,Math.round(13*sc)),al)}
function drawT(){
  if(state!=='island')return;
  const L=allPl();
  MC.forEach(c=>{const P=L.find(q=>q.pl===c.n);if(P&&vF(P.fl|0))drawMoonCast(c,P)});
  SP.forEach(s=>{
    if(!vF(s.fl)||s.t<0)return;
    const t=s.t,p=PAL[s.col],x=Math.round(s.x),y=Math.round(s.y),
      a=t<.35?t/.35:Math.max(0,1-(t-.35)/.5),
      e=t<.35?0:t<.5?(t-.35)/.15:t<1.2?1:Math.max(0,1-(t-1.2)/.3);
    if(a>0){cx.save();cx.globalCompositeOperation='lighter';
      const g=cx.createLinearGradient(0,y-140,0,y);g.addColorStop(0,'rgba(190,215,255,0)');g.addColorStop(1,'rgba(220,235,255,'+(.55*a).toFixed(3)+')');
      cx.fillStyle=g;cx.fillRect(x-4,y-140,8,140);cx.restore();
      cx.globalAlpha=a*.8;for(let q=0;q<6.28;q+=.5)R('#cfe0ff',x+Math.cos(q)*(4+t*14),y+Math.sin(q)*(2+t*7),2,1);cx.globalAlpha=1}
    if(e>0){
      R('rgba(0,0,0,.3)',x-7,y-1,14,3);
      cx.globalAlpha=.15*e;R(p[3],x-12,y-26*e,24,26*e);cx.globalAlpha=1;
      spike(x-4,y,Math.round(16*e),6,p);spike(x+4,y,Math.round(13*e),5,p);spike(x,y,Math.round(24*e),8,p)}});
  cx.globalAlpha=1}
const _glT=glow;glow=function(){_glT();if(!inside)drawT()};
const _diT=drawIn;drawIn=function(){_diT();drawT()};

/* ---------- Chuyển giới ---------- */
const WORLDS=window.WORLDS;
WORLDS.crystal={name:'Crystal World',enter(q){
  if(!ins.some(p=>p.pl&&p.fl===6&&p!==q))GH=null;
  putIn(q,WC,75.5+(slot(q)-2)*1.2,89.5);q.vis=1;
  if(q.pl===sel)cap('Crystal World: những cụm tinh thể xanh, tím phát sáng quanh hồ ngọc. Bấm E gần tinh thể để đào (cần cuốc). Phía đông có núi khoáng thạch và Pháp sư Đá, phía bắc có hang cổ.')}};
WORLDS.crystalBack={name:'Hang động',enter(q){
  if(!ins.some(p=>p.pl&&p.fl===6))newGhost();
  putIn(q,6,85.5+(slot(q)-2)*.9,52.5);q.vis=1;
  if(q.pl===sel)cap('Bạn trở lại hang cấm, đứng trên trận pháp trước cổng đá. Oan hồn vẫn đang rình rập đâu đó...')}};
const askBack=n=>window.abyssAsk('Vòng trận pháp dưới chân bắt đầu xoay. Bạn có muốn quay lại hang cấm không?',[['Quay lại',()=>window.worldTransfer(n,'crystalBack')],['Ở lại',()=>{}]]);

/* ---------- Phím E ---------- */
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat||e.key.toLowerCase()!=='e'||e.ctrlKey||e.metaKey||e.altKey)return;
  if(state!=='island'||TK||trans)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const P=allPl().find(p=>p.pl===sel);if(!P)return;
  if(P.fl===6){const cr=nearCrate(P);if(cr){e.stopImmediatePropagation();takePick(P.pl,cr);return}}
  if(P.fl===6&&!G.open&&nearCircle(P)){e.stopImmediatePropagation();gateE(P);return}
  if(P.fl===WC&&nearWiz(P)&&!RIT){e.stopImmediatePropagation();wOpen(P);return}
  if(P.fl===WC&&D){const tg=target(P);if(!tg)return;e.stopImmediatePropagation();if(tg.t==='back')askBack(P.pl);else startMine(P,tg)}},true);

/* ---------- Khung nhìn, camera, khóa di chuyển khi đào ---------- */
const snapC=()=>{const P=ins.find(p=>p.pl===sel);if(!P||!D)return;camX=clamp(P.x-CW/IS/2,0,D.W*T-CW/IS);camY=clamp(P.y-CH/IS/2,0,D.H*T-CH/IS)};
const _sv=syncView;syncView=function(s){_sv(s);const P=ins.find(p=>p.pl===sel);if(P&&P.fl===WC&&D){IS=CW/VW;if(s)snapC()}};
const _cam=cam;cam=function(){
  if(inside&&curF===WC&&D){const P=ins.find(p=>p.pl===sel)||ins.find(p=>p.pl);if(!P)return;
    camX+=(clamp(P.x-CW/IS/2,0,D.W*T-CW/IS)-camX)*.15;camY+=(clamp(P.y-CH/IS/2,0,D.H*T-CH/IS)-camY)*.15;return}
  _cam()};
const _ctrl=ctrl;ctrl=function(){
  if(MN[sel]||(G.mine&&G.mine.n===sel)||(RIT&&RIT.n===sel)){const P=allPl().find(p=>p.pl===sel);if(P){P.moving=0;P.path=[];P.tx=P.x;P.ty=P.y}return}
  _ctrl()};
const _di=drawIn;drawIn=function(){
  if(curF===WC&&D){drawBack();_di();drawFront();return}
  _di()};

/* ---------- Vòng đời game ---------- */
const _step=step;step=function(){
  _step();
  if(state!=='island')return;
  try{tick(Math.min(.25,DM||.016))}catch(e){console.error('sader tick',e)}};
const _gen=gen;gen=function(sd){_gen(sd);buildGate();buildCrates();buildCW();loadGate()};
const _mk=mkPeople;mkPeople=function(){_mk();
  MN={};GOT={};PT=[];CS={};QS={};RIT=null;MC=[];SP=[];TC={};saveCS();
  try{localStorage.removeItem(KEY+seed);localStorage.removeItem(SKEY);localStorage.removeItem(BKEY+seed)}catch(_){}
  buildGate();
  if(D)D.OBJ.forEach(o=>{
    if(o.k==='cl'){o.alive=1;D.im[o.y][o.x]=WALL;D.rid[o.y][o.x]=0}
    if(o.k==='bar'){o.open=0;o.ex=1;D.im[o.y][o.x]=WALL;D.rid[o.y][o.x]=0}})};
buildGate();buildCrates();buildCW();loadGate();
})();