/* ===== abyss.js: THẾ GIỚI "VỰC SÂU" + HIỆU ỨNG CHUYỂN GIỚI (vòng xoáy) =====
   Nạp CUỐI CÙNG (sau ghostplus.js). Không cần sửa file cũ.
   - Lại gần miệng hố lớn (trong hàng rào): hiện bảng hỏi "Có muốn nhảy xuống không?".
       Có -> hiệu ứng chuyển giới (vòng xoáy xanh) -> rơi xuống Vực sâu. Không -> đứng yên (bấm E để hỏi lại).
   - Vực sâu (300x170 ô) có 2 hướng, xuất phát ở bãi đáp giữa:
       Ngay bãi đáp: CỬA GỖ VỀ MẶT ĐẤT (cửa vòm trong khung đá, có đèn lồng). Bấm E gần cửa để trở về.
       Phía TÂY : hang tím + cánh cửa xoáy (tạm chưa dùng được, đổi DOOR_TO để gắn thế giới mới).
       Phía ĐÔNG: hang xanh ngọc có thác nước, cầu đá, tinh thể + vách đá có bụi hoa đầm lầy.
   - Bụi hoa: bấm E để hái. Mỗi người chơi chỉ hái được 1 bông, bụi hoa không biến mất.
   - Dùng lại hiệu ứng chuyển giới cho thế giới khác sau này:
       WORLDS.tenmoi={name:'...',enter(q){ putIn(q,<tầng>,x,y) hoặc putOut(q,px,py) }};
       worldTransfer(soNguoiChoi,'tenmoi'); */
(()=>{
if(typeof putIn!=='function'||typeof putOut!=='function'||typeof syncView!=='function'||typeof PIT==='undefined'||typeof FL==='undefined'||typeof allPl!=='function'){console.warn('abyss.js: hãy nạp SAU deadisland.js (đặt cuối cùng)');return}

/* ---------- Thông số ---------- */
const WID=21,WALL=62,VW=400;      /* số tầng của thế giới mới, loại ô tường, bề rộng khung nhìn (px) */
const AW=300,AH=170;              /* kích thước bản đồ Vực sâu (ô), độc lập với IW/IH của nhà */
const LX=150,LY=85;               /* tâm bãi đáp */
const PX=156,PY=48;               /* tâm hố lớn trên mặt đất (ô) */
const DOOR_TO=null;               /* cửa xoáy bên trái dẫn tới thế giới nào (id trong WORLDS); null = chưa dùng */
const GKEY='deadisland:flower';
const D={x:70*T+4,y:64*T};        /* cửa xoáy phía tây (chưa dùng) */
const D2={x:LX*T+4,y:77*T};       /* cửa gỗ về mặt đất, ở chỗ xuất hiện */
const PADS=[[64,76,64,72],[144,156,77,81]];   /* bục gạch trước hai cánh cửa */
const WF0=228;                    /* cột trái của thác nước (rộng 5 ô) */
let AB=null,SW=null,PR=null,GOT={},PT=[],flagN=0,lastReg='',QX=0,QY=0;
window.ABYSS=()=>AB; 
try{GOT=JSON.parse(localStorage.getItem(GKEY))||{}}catch(_){GOT={}}
const saveG=()=>{try{localStorage.setItem(GKEY,JSON.stringify(GOT))}catch(_){}};
const r=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(QX+a,QY+b,w,h)};
const R0=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),w,h)};
const inPad=(x,y)=>PADS.some(([a,b,c,d])=>x>=a&&x<=b&&y>=c&&y<=d);

/* ===== ĐẢO BAY: độ cao, nhấp nhô, xích ===== */
const isl=i=>{const I=AB.ISL[i];return I.h+I.amp*Math.sin(frame*I.sp+I.ph)};
function offAt(tx,ty){
  if(!AB||!AB.mt)return 0;
  const q=AB.mt.get(ty*AW+tx);if(!q)return 0;
  if(q.k==='i')return isl(q.i);
  const a=q.a<0?0:isl(q.a),b=isl(q.b);
  return a+(b-a)*q.t+Math.sin(Math.PI*q.t)*1.5*Math.sin(frame*.06+tx*.5)}
function chain(x0,y0,x1,y1,sag){
  const n=Math.max(2,Math.round(Math.hypot(x1-x0,y1-y0)/2.6));
  for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+sag*4*t*(1-t);
    if(i%2){R0('#aab0ba',x-1,y,3,2);R0('#6b7078',x-1,y+1,3,1)}
    else{R0('#8a909a',x,y-1,2,3);R0('#4a4f58',x+1,y-1,1,3)}}}
function underside(I,i,o){
  const rxp=I.rx*T;
  for(let x=Math.floor(I.cx-I.rx)-1;x<=Math.ceil(I.cx+I.rx)+1;x++){
    let yb=-1;
    for(let y=Math.floor(I.cy+I.ry)+1;y>=Math.floor(I.cy-I.ry)-1;y--){const q=AB.mt.get(y*AW+x);if(q&&q.k==='i'&&q.i===i){yb=y;break}}
    if(yb<0)continue;
    const base=(yb+1)*T-Math.round(o);
    for(let c=0;c<T;c++){
      const px=x*T+c,u=(px+.5-I.cx*T)/rxp,
        d=Math.round(Math.sqrt(Math.max(0,1-u*u))*10+hs(px,i+3)%3+(Math.abs(u)<.12?9:0)),m1=Math.round(d*.55);
      if(d<=0)continue;
      R0('#6a6478',px,base,1,Math.min(2,d));
      if(d>2)R0('#4a4658',px,base+2,1,Math.max(0,m1-2));
      if(d>m1)R0('#2c2838',px,base+m1,1,d-m1)}}}
function islTile(x,y,q,o){
  const h=hs(x,y),A=AB;QX=x*T;QY=y*T-Math.round(o);
  if(q.k==='i'){
    r(h%2?'#3f8c52':'#37804a',0,0,T,T);
    if(h%5===0)r('#62c273',(h>>3)&5,(h>>6)&5,2,1);
    if(h%7===0)r('#27613a',(h>>4)&5,(h>>7)&5,1,2);
    if(h%11===0)r(['#ff8ab8','#fff0a0','#ffd0e4'][h%3],(h>>5)&5,(h>>9)&5,1,1);
    const nb=(dx,dy)=>{const n=A.mt.get((y+dy)*AW+x+dx);return n&&n.k==='i'&&n.i===q.i};
    if(!nb(0,-1))r('#7fd890',0,0,T,1);
    if(!nb(-1,0))r('#2a6a40',0,0,1,T);
    if(!nb(1,0))r('#2a6a40',T-1,0,1,T);
    if(!nb(0,1)){r('#6b5a3e',0,T-2,T,2);r('#3a2f22',0,T-1,T,1)}
    return}
  /* cầu ván treo, lan can xích */
  r('#6b4a2a',0,0,T,T);
  if(q.dir==='x'){
    r('#3a2410',2,0,1,T);r('#3a2410',5,0,1,T);
    const top=q.edge<0,ry=top?0:T-1;
    r('#8a909a',0,ry,T,1);r('#d6dbe3',(x&1)*4+1,ry,2,1);
    if(top){r('#8a909a',0,-4,T,1);r('#d6dbe3',((x+1)&1)*4+1,-4,2,1)}
    if(x%4===0)r('#3a3a40',3,top?-5:ry-3,2,top?6:4)
  }else{
    r('#3a2410',0,2,T,1);r('#3a2410',0,5,T,1);
    const lf=q.edge<0,rx=lf?0:T-1;
    r('#8a909a',rx,0,1,T);r('#d6dbe3',rx,(y&1)*4+1,1,2);
    r('#8a909a',rx,-4,1,T);
    if(y%4===0)r('#3a3a40',lf?0:T-2,-5,2,6)}}
function drawIslands(x0,y0,x1,y1){
  const A=AB;if(!A||!A.ISL||!A.ISL.length)return;
  A.ISL.forEach((I,i)=>underside(I,i,isl(i)));
  /* xích lớn võng xuống nối đáy các đảo */
  for(let i=0;i<A.ISL.length-1;i++){
    const a=A.ISL[i],b=A.ISL[i+1],oa=isl(i),ob=isl(i+1);
    const ax=a.cx*T,ay=(a.cy+a.ry)*T-oa+10,bx=b.cx*T,by=(b.cy+b.ry)*T-ob+10;
    chain(ax,ay,bx,by,12);
    R0('#aab0ba',ax-2,ay-1,4,4);R0('#3a3a40',ax-1,ay,2,2);
    R0('#aab0ba',bx-2,by-1,4,4);R0('#3a3a40',bx-1,by,2,2)}
  for(let y=y0;y<=y1+4;y++)for(let x=x0;x<=x1;x++){
    const q=A.mt.get(y*AW+x);if(q)islTile(x,y,q,offAt(x,y))}
  A.BUSH.forEach(b=>{
    const px=b.x*T+4;if(px<camX-20||px>camX+CW/IS+20)return;
    dBush({x:b.x,ax:px,ay:b.y*T+8-Math.round(offAt(b.x,b.y))})})}
function voidT(x,y,h,p){
  const A=AB;
  r(['#0c0a22','#09071a','#06040f'][Math.max(0,Math.min(2,Math.floor((y-92)/6)))],0,0,T,T);
  if((x*5+y*3+(frame>>5))%11===0){cx.globalAlpha=.25;r(p.gl,(h>>3)&5,(h>>6)&5,3,1);cx.globalAlpha=1}
  if(h%23===0&&((frame>>4)+h)%3){r('#c9a8ff',(h>>3)&7,(h>>6)&7,1,1)}
  const fl2=(xx,yy)=>A.im[yy]&&A.im[yy][xx]===0&&!A.vd[yy][xx];
  if(fl2(x,y-1)){r(p.fc,0,0,T,5);r(p.fk,(h>>2)&5,2,2,1);r(p.fd,0,0,T,1);r(p.sd,0,5,T,2)}
  if(fl2(x-1,y))r(p.fc,0,0,2,T);
  if(fl2(x+1,y))r(p.fc,T-2,0,2,T)}

/* ---------- Bảng màu: tím (tây) -> xanh ngọc (đông) ---------- */
const hx=s=>[parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)];
const mx=(a,b,t)=>{const A=hx(a),B=hx(b);return'#'+[0,1,2].map(i=>Math.round(A[i]+(B[i]-A[i])*t).toString(16).padStart(2,'0')).join('')};
const PA={f1:'#4a3d7c',f2:'#443876',fd:'#5f50a0',fk:'#37295f',wl:'#1d1540',wt:'#2c2258',fc:'#5b4a95',sd:'#33285f',gl:'#2fe0c8',pm:'#5c4a98',pl:'#7a68b8',pd:'#38296a'},
  PB={f1:'#173b4d',f2:'#143445',fd:'#21566b',fk:'#112f48',wl:'#080f26',wt:'#101a3a',fc:'#1f4d6c',sd:'#0d2438',gl:'#46e0d0',pm:'#2a5a7a',pl:'#3f7fa0',pd:'#143048'};
const PL=Array.from({length:AW},(_,x)=>{const t=Math.max(0,Math.min(1,(x-118)/64)),s=t*t*(3-2*t),o={t:s};for(const k in PA)o[k]=mx(PA[k],PB[k],s);return o});

/* ---------- Danh sách thế giới (dùng cho chuyển giới) ---------- */
function surfPos(){
  for(let x=PX-12;x<PX;x++)if(m[PY][x]===PIT){for(const d of[2,1,3]){const tx=x-d;if(walkT(tx,PY))return[tx*T+4,PY*T+4]}}
  return[(PX-8)*T+4,PY*T+4]}
const WORLDS=window.WORLDS||(window.WORLDS={});
WORLDS.surface={name:'Mặt đất',enter(q){const[x,y]=surfPos();putOut(q,x,y);flagN=1;
  if(q.pl===sel)cap('Bạn đã trở lại mặt đất, bên miệng hố lớn.')}};
WORLDS.abyss={name:'Vực sâu',enter(q){putIn(q,WID,LX+.5+(slot(q)-2)*1.4,LY+3);q.vis=1;lastReg='';
  if(q.pl===sel)cap('Bạn rơi xuống Vực sâu. Cánh cửa gỗ phía bắc bãi đáp dẫn về mặt đất. Phía TÂY là hang tím, phía ĐÔNG là hang xanh ngọc có thác nước và các bục đá cao có hoa (leo bậc thang để lên).')}};
function transfer(n,id){
  const q=allPl().find(p=>p.pl===n),W2=WORLDS[id];
  if(!q||!W2||SW)return false;
  closeAsk();
  const go=()=>{W2.enter(q);if(q.pl===sel)syncView(true)};
  if(q.pl===sel)SW={t:0,d:2.4,cb:go,fired:0};else go();
  return true}
window.worldTransfer=transfer;window.abyssAsk=ask;

/* ---------- Hiệu ứng vòng xoáy ---------- */
function spiral(ox,oy,Rm,rot,al){
  const big=Rm>80,step=big?1.2:.6,cs=cx.globalAlpha;
  const L=[[.16,'#161515',1.9],[.08,'#5b5b5b',1.4],[0,'#ffffff',1]];
  for(let k=0;k<3;k++)for(let rr=2;rr<Rm;rr+=step){
    const th=rot+k*2.094+3.1*Math.log(rr/3+1),w=Math.max(1,Math.round(Rm*.008+rr*(big?.045:.05))),u=rr/Rm;
    cx.globalAlpha=al*(1-u*.45);
    for(const[o,c,f]of L){const a=th+o*(1-u*.5),ww=Math.max(1,Math.round(w*f));cx.fillStyle=c;cx.fillRect(Math.round(ox+Math.cos(a)*rr-ww/2),Math.round(oy+Math.sin(a)*rr-ww/2),ww,ww)}}
  for(let i=0;i<(big?26:6);i++){
    const a=(hs(i,7)%628)/100+rot*.25*(1+(i%3)*.2),rd=(hs(i,9)%100)/100*Rm*1.05,sz=1+hs(i,3)%(big?3:2);
    cx.globalAlpha=al*.9;cx.fillStyle=i%3?'#ffffff':'#514d51';cx.fillRect(Math.round(ox+Math.cos(a)*rd),Math.round(oy+Math.sin(a)*rd),sz,sz)}
  const cr=big?9:3;cx.globalAlpha=al*.5;cx.fillStyle='#9cc4ff';cx.fillRect(ox-cr-2,oy-cr-2,cr*2+4,cr*2+4);
  cx.globalAlpha=al;cx.fillStyle='#fff';cx.fillRect(ox-cr,oy-cr,cr*2,cr*2);
  cx.globalAlpha=cs}
function swDraw(){
  const p=SW.t/SW.d,a=p<.4?p/.4:p<.6?1:(1-p)/.4,s=Math.max(0,Math.min(1,a)),e=s*s*(3-2*s);
  cx.save();cx.setTransform(1,0,0,1,0,0);
  const g=cx.createRadialGradient(CW/2,CH/2,10,CW/2,CH/2,CW*.7);g.addColorStop(0,'#1a44d0');g.addColorStop(1,'#050b34');
  cx.globalAlpha=e;cx.fillStyle=g;cx.fillRect(0,0,CW,CH);
  spiral(CW/2,CH/2,30+300*e,SW.t*5,e);
  cx.restore();cx.globalAlpha=1}
function swTick(){
  if(!SW)return;
  SW.t+=Math.min(.1,DM||.016);
  const p=SW.t/SW.d;
  if(!SW.fired&&p>=.5){SW.fired=1;try{SW.cb()}catch(e){console.error(e)}}
  if(p>=1)SW=null}
const _draw=draw;draw=function(){_draw();if(SW)swDraw()};

/* ---------- Bảng hỏi ---------- */
const sty=document.createElement('style');
sty.textContent='#abAsk{position:absolute;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:rgba(0,0,10,.55);line-height:1.4}'+
 '#abAsk .pn{width:min(92%,400px);padding:14px;background:rgba(10,14,28,.97);border:3px solid var(--sun);box-shadow:4px 4px 0 #000}'+
 '#abAsk p{margin:0 0 10px;font-weight:400}#abAsk .row{display:flex;gap:8px}#abAsk .btn{flex:1;padding:8px 12px;font-size:14px}'+
 '#wq .qr.done span{text-decoration:line-through;opacity:.55}#wq .qr.done img{opacity:.5;filter:grayscale(.6)}';
document.head.appendChild(sty);
const box=document.createElement('div');box.id='abAsk';box.hidden=true;
box.innerHTML='<div class="pn"><p id="abT"></p><div class="row" id="abB"></div></div>';
$('stage').appendChild(box);
function closeAsk(){PR=null;box.hidden=true}
function ask(text,opts){
  $('abT').textContent=text;const row=$('abB');row.innerHTML='';
  opts.forEach(([t,fn],i)=>{const b=document.createElement('button');b.className='btn'+(i?' alt':'');b.textContent=(i+1)+'. '+t;b.onclick=()=>{closeAsk();fn()};row.append(b)});
  PR=opts;box.hidden=false;row.firstChild.focus()}
addEventListener('keydown',e=>{
  if(SW){e.preventDefault();e.stopImmediatePropagation();return}
  if(!PR)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.repeat)return;
  if(/^[1-9]$/.test(e.key)&&PR[+e.key-1]){const f=PR[+e.key-1][1];closeAsk();f()}
  else if(e.key==='Escape')closeAsk()},true);
document.addEventListener('pointerdown',e=>{if((SW||PR)&&e.target===cv){e.preventDefault();e.stopPropagation()}},true);
const _ctrl=ctrl;ctrl=function(){
  if(SW||PR){const P=allPl().find(p=>p.pl===sel);if(P)P.moving=0;return}
  _ctrl()};

/* ---------- Miệng hố trên mặt đất ---------- */
function nearPit(P){
  const tx=Math.floor(P.x/T),ty=Math.floor(P.y/T);
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if((m[ty+j]||[])[tx+i]===PIT)return true;
  return false}
function askPit(n){
  ask('Miệng hố tối đen, sâu không thấy đáy. Bạn có muốn nhảy xuống không?',[
    ['Nhảy xuống',()=>{cap('P'+n+' nhảy xuống hố... mọi thứ xoay tròn!');transfer(n,'abyss')}],
    ['Không',()=>cap('Bạn lùi lại khỏi miệng hố. Bấm E nếu muốn nhìn xuống hố lần nữa.')]])}
function pitWatch(){
  if(state!=='island'||inside||SW||PR||trans||TK)return;
  const P=people.find(p=>p.pl===sel&&p.vis);if(!P)return;
  const near=nearPit(P);
  if(near&&!flagN){flagN=1;askPit(sel)}
  else if(!near)flagN=0}

/* ---------- Hoa đầm lầy ---------- */
function ensureItem(){const I=window.ITEMS;if(I&&!I.wflower)I.wflower={icon:'🌸',name:'Bông hoa của đầm lầy',d:'Bông hoa hồng mọc giữa đầm lầy.'}}
function pickFlower(n,b){
  ensureItem();
  if(GOT[n]){cap('P'+n+' đã hái một bông rồi. Mỗi người chỉ hái được 1 bông (bụi hoa vẫn còn đó).');return}
  if(typeof window.giveItem!=='function'){cap('Cần nạp Playerkit.js để nhận đồ vào túi.');return}
  if(window.giveItem(n,'wflower')){
    GOT[n]=1;saveG();
    for(let i=0;i<16;i++)PT.push({x:b.x*T+4+rnd(9)-4,y:b.y*T+4+rnd(7)-3,vx:(Math.random()-.5)*.6,vy:-(.2+Math.random()*.6),l:30+rnd(25),m:55,c:i%2?'#ff8ab8':'#ffd0e4'});
    cap('P'+n+' hái được Bông hoa của đầm lầy. Bụi hoa vẫn còn nguyên; mục này đã được gạch trong danh sách của Pháp sư.')}}
new MutationObserver(()=>{
  const w=$('wq');if(!w)return;
  w.querySelectorAll('.qr').forEach(q=>{const c=q.querySelector('.ck');q.classList.toggle('done',!!c&&c.textContent.indexOf('✔')>=0)})
}).observe($('inv'),{childList:true,subtree:true,characterData:true});

/* ---------- Các cánh cửa ---------- */
function askBack(n){

  
  ask('Cánh cửa gỗ dẫn về mặt đất. Bạn có muốn quay lại không?',[
    ['Quay về',()=>{cap('P'+n+' mở cánh cửa gỗ bước ra...');transfer(n,'surface')}],['Chưa',()=>{}]])}
function askDoor(n){
  const to=DOOR_TO&&WORLDS[DOOR_TO];
  if(window.doorHook&&window.doorHook(n))return;
  if(!to){cap('Cánh cửa xoáy phía tây vẫn im lìm, chưa thể mở được...');return}
  ask('Cánh cửa xoáy đang chờ bạn. Bước qua để tới: '+to.name+'?',[
    ['Bước qua',()=>transfer(n,DOOR_TO)],['Chưa',()=>{}]])}
const nearBush=P=>AB&&AB.BUSH.find(b=>Math.hypot(P.x-(b.x*T+4),P.y-((b.y+1)*T+2))<20);
const nearDoor=(P,d)=>Math.hypot(P.x-d.x,P.y-(d.y+8))<24;
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat||e.key.toLowerCase()!=='e'||e.ctrlKey||e.metaKey||e.altKey)return;
  if(state!=='island'||TK||trans||SW||PR)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const P=allPl().find(p=>p.pl===sel);if(!P)return;
  if(P.fl===WID){
    const b=nearBush(P);if(b){pickFlower(P.pl,b);return}
    if(nearDoor(P,D2)){askBack(P.pl);return}
    if(nearDoor(P,D))askDoor(P.pl);
    return}
  if(!P.fl&&!inside&&nearPit(P))askPit(P.pl)});

/* ================= BẢN ĐỒ VỰC SÂU (300 x 170 ô) ================= */
function buildAbyss(){
  const mk=v=>Array.from({length:AH},()=>Array(AW).fill(v));
  const im=mk(WALL),rid=mk(0),wat=mk(0),br=mk(0),ob=mk(0),cl=mk(0),sp=mk(0),pf=mk(0);
  const fl=(x,y)=>{if(x>1&&y>1&&x<AW-2&&y<AH-2){im[y][x]=0;rid[y][x]=1}};
  const wl=(x,y)=>{im[y][x]=WALL;rid[y][x]=0;wat[y][x]=0;br[y][x]=0;ob[y][x]=0};
  const ell=(a0,b0,rx,ry,k)=>{for(let y=Math.floor(b0-ry-4);y<=b0+ry+4;y++)for(let x=Math.floor(a0-rx-4);x<=a0+rx+4;x++){
    const a=Math.atan2((y+.5-b0)/ry,(x+.5-a0)/rx),q=1+.1*Math.sin(3*a+k)+.07*Math.sin(5*a+2*k),d=Math.hypot((x+.5-a0)/rx,(y+.5-b0)/ry)/q;if(d<1)fl(x,y)}};
  ell(LX,LY,16,11,1);ell(70,85,40,30,2);ell(230,85,40,30,3);      /* bãi đáp, hang tím, hang xanh ngọc */
  for(let y=82;y<=88;y++)for(let x=100;x<=200;x++){if((y===82||y===88)&&hs(x,y)%100<35)continue;fl(x,y)}  /* hai lối đi rộng */
  /* tường phía bắc đặt hai cánh cửa + bục gạch phía trước */
  for(let y=48;y<=63;y++)for(let x=60;x<=80;x++)wl(x,y);
  for(let y=66;y<=76;y++)for(let x=142;x<=158;x++)wl(x,y);
  PADS.forEach(([a,b,c,d])=>{for(let y=c;y<=d;y++)for(let x=a;x<=b;x++)fl(x,y)});
  /* ao + thác nước */
  let wfy=99;
  for(let y=50;y<=80;y++)for(let x=196;x<=264;x++)if(im[y][x]===0&&Math.hypot((x+.5-230)/22,(y+.5-66)/9)<1){
    im[y][x]=WALL;rid[y][x]=0;wat[y][x]=1;if(x>=WF0&&x<=WF0+4&&y<wfy)wfy=y}
  if(wfy===99)wfy=58;
  /* cầu đá bắc qua ao */
  const bry0=65,bry1=67;
  for(let y=bry0;y<=bry1;y++){let a=999,b=-1;for(let x=180;x<=280;x++)if(wat[y][x]){a=Math.min(a,x);b=Math.max(b,x)}
    if(b<0)continue;for(let x=a-1;x<=b+1;x++){fl(x,y);wat[y][x]=0;br[y][x]=1}}
  /* ĐẢO BAY: vực tối + 3 đảo ở các độ cao khác nhau, nối bằng cầu ván treo xích */
  const vd=mk(0),mt=new Map(),BUSH=[],
    ISL=[{cx:212,cy:102,rx:4.6,ry:3.6,h:8, amp:2.2,sp:.032,ph:0,  dy:1},
         {cx:231,cy:99, rx:5.2,ry:3.6,h:24,amp:2.8,sp:.026,ph:2.1,dy:-2},
         {cx:250,cy:103,rx:4.6,ry:3.6,h:15,amp:2.5,sp:.038,ph:4.2,dy:-1}];
  const inLg=(x,y)=>x>=195&&x<=267&&y>=92&&y<=112;     /* vùng vực: không đặt đá / tinh thể / nấm */
  for(let y=90;y<=112;y++)for(let x=196;x<=267;x++)if(Math.hypot((x+.5-231)/31,(y+.5-101)/8.5)<1){wl(x,y);vd[y][x]=1}
  ISL.forEach((I,i)=>{
    for(let y=Math.floor(I.cy-I.ry)-1;y<=I.cy+I.ry+1;y++)for(let x=Math.floor(I.cx-I.rx)-1;x<=I.cx+I.rx+1;x++)
      if(vd[y][x]&&Math.hypot((x+.5-I.cx)/I.rx,(y+.5-I.cy)/I.ry)<1){fl(x,y);mt.set(y*AW+x,{k:'i',i})}
    const bx=I.cx,by=I.cy+I.dy;
    im[by][bx]=WALL;rid[by][bx]=0;ob[by][bx]=1;BUSH.push({x:bx,y:by,i})});
  /* cầu từ mặt đất xuống đảo 1 (2 làn dọc) */
  [211,212].forEach((x,li)=>{
    let y=92;while(y<110&&!vd[y][x])y++;
    const ys=[];for(;y<110&&!mt.has(y*AW+x);y++)ys.push(y);
    ys.forEach((yy,k)=>{fl(x,yy);mt.set(yy*AW+x,{k:'b',a:-1,b:0,t:(k+1)/(ys.length+1),dir:'y',edge:li?1:-1})})});
  /* cầu ngang nối đảo 1-2 và 2-3 (2 làn) */
  const hb=(a,b,rows)=>rows.forEach((y,li)=>{
    let x=Math.ceil(ISL[a].cx);
    while(mt.has(y*AW+x)&&mt.get(y*AW+x).i===a)x++;
    const xs=[];for(;x<AW-2&&!mt.has(y*AW+x);x++)xs.push(x);
    xs.forEach((xx,k)=>{fl(xx,y);mt.set(y*AW+xx,{k:'b',a,b,t:(k+1)/(xs.length+1),dir:'x',edge:li?1:-1})})});
  hb(0,1,[100,101]);hb(1,2,[100,101]);
  /* vật thể */
  const OBJ=[],put=(k,x,y,ax,ay,h,w)=>OBJ.push({k,x,y,ax,ay,h,w});
  [[46,72],[90,74],[48,100],[92,100]].forEach(([x,y])=>{for(let j=0;j<2;j++)for(let i=0;i<2;i++){im[y+j][x+i]=WALL;rid[y+j][x+i]=0;ob[y+j][x+i]=1}put('pil',x,y,(x+1)*T,(y+2)*T,54,30)});
  [[196,70],[262,72],[194,100],[264,98],[210,110],[245,111],[36,84],[98,98],[60,108],[104,70],[190,112],[270,84]].forEach(([x,y])=>{
    if(im[y][x]===0&&!ob[y][x]&&!inLg(x,y)){im[y][x]=WALL;rid[y][x]=0;ob[y][x]=1;put('cry',x,y,x*T+4,(y+1)*T,18,14)}});
  [[204,96],[256,86],[238,104],[226,99],[214,93],[44,90],[96,108],[120,80],[110,96],[180,92],[150,100]].forEach(([x,y])=>{if(im[y][x]===0&&!ob[y][x]&&!inLg(x,y))put('mus',x,y,x*T+4,y*T+8,0,8)});
  const fr=(x,y)=>BUSH.some(b=>Math.abs(x-b.x)<=2&&y>b.y&&y<=b.y+3);
  for(let y=4;y<AH-4;y++)for(let x=4;x<AW-4;x++){
    if(im[y][x]!==0||hs(x*3+1,y*7+2)%100>=2)continue;
    if((Math.abs(x-LX)<22&&Math.abs(y-LY)<16)||(x>=98&&x<=202&&y>=78&&y<=92)||(x>=58&&x<=82&&y>=60&&y<=76)||(x>=138&&x<=162&&y>=72&&y<=84)||fr(x,y)||inLg(x,y))continue;
    let ok=1;for(let j=-1;j<=1&&ok;j++)for(let i=-1;i<=1;i++)if(im[y+j][x+i]!==0||br[y+j][x+i]){ok=0;break}
    if(!ok)continue;
    im[y][x]=WALL;rid[y][x]=0;ob[y][x]=1;put('stg',x,y,x*T+4,(y+1)*T,14,8)}

  OBJ.sort((a,b)=>a.ay-b.ay);
  /* [SỬA 3] gán dữ liệu vào AB (trước đây thiếu nên AB luôn null) */
  AB={im,rid,wat,br,ob,cl,sp,pf,vd,mt,BUSH,ISL,OBJ,wfy,bry0,bry1};
  FL[WID]={im,rid,RM:[null,{n:'Vực sâu',f:['rgba(0,0,0,0)','rgba(0,0,0,0)'],x0:0,y0:0,x1:AW-1,y1:AH-1,s:1}]}}

/* ================= VẼ ================= */
const solid=(x,y)=>y>=0&&y<AH&&(AB.im[y][x]===0||AB.ob[y][x])&&!AB.wat[y][x];
function floorT(x,y,h,p){
  if(inPad(x,y)){/* bục gạch xanh đen trước cửa */
    r((x+y)&1?'#1a2556':'#161f4c',0,0,T,T);r('#0d1436',0,T-1,T,1);r('#0d1436',(y&1)?3:7,0,1,T)}
  else{
    r(h%2?p.f1:p.f2,0,0,T,T);
    if(h%5===0)r(p.fd,(h>>3)&7,(h>>6)&7,2,1);
    if(h%11===0)r(p.fk,(h>>4)&5,(h>>8)&5,3,1);
    if(p.t<.5&&h%29===0){r('#2f8f5a',(h>>3)&5,(h>>6)&5,3,1);r('#58c98a',(h>>3)&5,(h>>6)&5,1,1)}
    else if(p.t>=.5&&h%17===0&&((frame>>4)+h)%3){r(p.gl,(h>>3)&7,(h>>6)&7,1,1)}}
  if(!solid(x,y-1)){cx.globalAlpha=.4;r('#000',0,0,T,3);cx.globalAlpha=1}}
function wallT(x,y,h,p){
  const s=solid(x,y+1)||(y+1<AH&&AB.wat[y+1][x])||AB.cl[y][x];
  if(s){
    r(p.fc,0,0,T,T);
    for(let i=0;i<4;i++)r(p.fk,(h>>(i*2))&7,i*2,1+((h>>(i+3))&1),1);
    r(p.fd,0,0,T,1);r(p.sd,0,T-2,T,2);
    if(h%3===0){const a=2+((h>>4)%4);r(p.sd,a,0,2,3);r(p.sd,a+1,3,1,2)}
    if(p.t>.5&&h%9===0){r('#c050c0',(h>>5)&5,1,1,5);r('#e080e0',((h>>5)&5)+1,4,1,2)}}
  else{
    r(p.wl,0,0,T,T);
    if(solid(x,y-1)){r(p.wt,0,0,T,T);r(p.fd,0,0,T,1)}
    else if(h%4===0)r(p.wt,(h>>3)&7,(h>>6)&7,2,1)}}
function waterT(x,y,h,p){
  const A=AB,w=Math.sin(x*.8+y*.6+frame*.06)+Math.sin(x*.35-y*.9+frame*.04);
  if(A.br[y-1]&&A.br[y-1][x]){/* mặt cầu có vòm phát sáng */
    r('#3c4668',0,0,T,T);
    if(x%3!==0){r('#0a0e22',1,2,6,6);r('#0a0e22',2,1,4,1);cx.globalAlpha=.55+.25*Math.sin(frame*.08+x);r('#2fe0c8',2,3,4,5);cx.globalAlpha=1}
    else r('#2a3350',3,0,1,T);
    r('#262e48',0,T-1,T,1);return}
  r(w>.9?'#1b86a8':w<-1?'#0a3a52':'#0f5a78',0,0,T,T);
  if(((x*3+y*5+(frame>>3))%7)===0){cx.globalAlpha=.7;r(p.gl,(h>>3)&5,(h>>6)&5,2,1);cx.globalAlpha=1}
  if(!solid(x,y-1)&&!(A.wat[y-1]&&A.wat[y-1][x])){cx.globalAlpha=.5;r('#000',0,0,T,2);cx.globalAlpha=1}
  if(x>=WF0&&x<=WF0+4&&y<=A.wfy+2){cx.globalAlpha=.55;r('#d8fffa',(h>>3)&3,((frame>>2)+h)&3,4+((h>>5)&3),1);cx.globalAlpha=1}}
function bridgeT(x,y,h,p){
  const A=AB;
  r(((x>>1)+y)&1?'#59658a':'#4f5a7e',0,0,T,T);r('#3a4468',0,T-1,T,1);if(x&1)r('#3a4468',0,0,1,T);
  if(y===A.bry0){r('#8190b8',0,0,T,2);r('#2a3150',0,2,T,1);if(x%3===0){r('#a0aed0',2,-3,3,5);r('#6a76a0',2,2,3,1)}}
  if(y===A.bry1){r('#8190b8',0,T-2,T,2);if(x%3===0){r('#a0aed0',2,T-6,3,5)}}}
/* bậc thang đá: bậc càng cao càng sáng */
function stairT(x,y,h,p){
  const k=AB.sp[y][x];
  r('#4a5578',0,0,T,T);r('#8190b8',0,0,T,3);r('#6a76a0',0,3,T,2);r('#262e48',0,T-2,T,2);r('#a9b6dc',0,0,T,1);
  cx.globalAlpha=.1*(4-k);r('#000',0,0,T,T);cx.globalAlpha=1}
/* mặt bục cao: sáng hơn nền hang, có gờ đá ở mép vách */
function plateauT(x,y,h,p){
  cx.globalAlpha=.16;r('#bcd0ff',0,0,T,T);cx.globalAlpha=1;
  if(AB.cl[y+1]&&AB.cl[y+1][x]&&!AB.sp[y+1][x]){r(p.pl,0,T-2,T,2);r('#000',0,T-1,T,1)}}
function tileAt(x,y){
  const A=AB,h=hs(x,y),p=PL[x];QX=x*T;QY=y*T;
  if(A.wat[y][x])return waterT(x,y,h,p);
  if(A.vd[y][x])return voidT(x,y,h,p);
  if(A.im[y][x]===0||A.ob[y][x]){
    if(A.sp[y][x])return stairT(x,y,h,p);
    if(A.br[y][x])return bridgeT(x,y,h,p);
    floorT(x,y,h,p);
    if(A.pf[y][x])plateauT(x,y,h,p);
    return}
  wallT(x,y,h,p)}
/* [SỬA 1] waterfall: bỏ dòng tự gọi chính nó */
function waterfall(){
  const A=AB,fx=WF0*T,fw=5*T,top=(A.wfy-9)*T,bot=A.wfy*T+6;
  if(fx+fw<camX-4||fx>camX+CW/IS+4||bot<camY||top>camY+CH/IS+4)return;
  cx.globalAlpha=.9;R0('#136f86',fx,top,fw,bot-top);
  for(let c=0;c<fw;c+=2)for(let yy=top;yy<bot;yy+=5){const o=(yy+frame*2+c*7)%24;if(o<10){cx.fillStyle=o<4?'#d8fffa':'#6ff0e0';cx.fillRect(fx+c,yy,2,Math.min(5,bot-yy))}}
  R0('#0a4a5a',fx,top,2,bot-top);R0('#0a4a5a',fx+fw-2,top,2,bot-top);
  cx.globalAlpha=.25;for(let i=0;i<8;i++)R0('#cffff8',fx-4+((i*9+(frame>>1))%(fw+8)),bot-6-((frame>>2)+i*3)%8,6,3);
  cx.globalAlpha=.12;R0('#46e0d0',fx-14,top,fw+28,bot-top+10);cx.globalAlpha=1}
function drawRune(){
  const x=LX*T+4,y=LY*T+4,k=.5+.5*Math.sin(frame*.05);
  cx.globalAlpha=.35+.35*k;
  for(let a=0;a<6.28;a+=.09)R0('#46e0d0',x+Math.cos(a)*34,y+Math.sin(a)*20,2,1);
  for(let a=0;a<6.28;a+=.14)R0('#2fb8f0',x+Math.cos(a)*22,y+Math.sin(a)*13,1,1);
  for(let i=0;i<5;i++){const a=i*1.2566-1.5708;R0('#9ae8ff',x+Math.cos(a)*28,y+Math.sin(a)*16,2,2)}
  cx.globalAlpha=1}
function horn(x0,y0,d,L,cv){
  for(let i=0;i<L;i++){const t=i/L,px=x0+d*cv*Math.sin(t*Math.PI*.9),w=Math.max(1,Math.round(4*(1-t)));R0('#1a3590',px-(w>>1),y0-i,w,1);if(w>1)R0('#3b60d0',px-(w>>1),y0-i,1,1)}}
/* cửa xoáy phía tây (chưa dùng) */
function drawDoor(dd,glow){
  const x=dd.x,y=dd.y,fr=frame;
  if(x<camX-70||x>camX+CW/IS+70||y<camY-20||y>camY+CH/IS+130)return;
  const g=cx.createRadialGradient(x,y-60,4,x,y-60,72);g.addColorStop(0,glow[0]);g.addColorStop(1,glow[1]);
  cx.fillStyle=g;cx.fillRect(x-72,y-132,144,144);
  horn(x-40,y-2,1,70,16);horn(x+40,y-2,-1,78,18);horn(x-52,y-2,1,40,10);horn(x+54,y-2,-1,46,12);
  for(let a=Math.PI*.9;a<=Math.PI*2.1;a+=.035){const px=Math.round(x+Math.cos(a)*29),py=Math.round(y-22+Math.sin(a)*29);R0('#0f1c52',px-1,py-1,4,4);R0('#2a46b0',px-1,py-1,3,3);R0('#4d78e8',px-1,py-1,1,1)}
  for(let row=0;row<34;row++){
    const hw=row<7?Math.round(Math.sqrt(1-Math.pow((7-row)/7,2))*11):11,yy=y-34+row;
    for(let bx=-hw;bx<hw;bx+=2)R0((((bx>>1)+(row>>1))&1)?'#16235e':'#0c1438',x+bx,yy,2,1);
    R0('#2b4bb8',x-hw-1,yy,1,1);R0('#2b4bb8',x+hw,yy,1,1)}
  R0('#2b4bb8',x-5,y-35,10,1);
  R0('#1b2a66',x-16,y-2,32,3);R0('#0d1436',x-16,y+1,32,1);
  cx.globalAlpha=.5+.3*Math.sin(fr*.08);R0('#3b6bff',x-8,y-1,16,1);cx.globalAlpha=1;
  cx.globalAlpha=.25;R0(glow[2],x-24,y-86,48,48);cx.globalAlpha=1;
  spiral(x,y-62,17,fr*.07,1);cx.globalAlpha=1}
/* cửa gỗ vòm trong khung đá (cửa về mặt đất, không xoáy) */
function drawExit(dd){
  const x=dd.x,y=dd.y,fr=frame;
  if(x<camX-60||x>camX+CW/IS+60||y<camY-20||y>camY+CH/IS+70)return;
  const g=cx.createRadialGradient(x,y-20,3,x,y-20,52);
  g.addColorStop(0,'rgba(255,205,90,.38)');g.addColorStop(1,'rgba(160,90,20,0)');
  cx.fillStyle=g;cx.fillRect(x-52,y-72,104,104);
  R0('rgba(0,0,0,.3)',x-17,y-1,34,4);
  /* khung đá vòm */
  for(let row=-2;row<34;row++){
    const hw=(row<6?Math.round(Math.sqrt(1-Math.pow((6-row)/6,2))*10):10)+4,yy=y-34+row;
    R0(row%6===2?'#3a4468':'#59658a',x-hw,yy,hw*2,1);R0('#8190b8',x-hw,yy,1,1);R0('#262e48',x+hw-1,yy,1,1)}
  R0('#8190b8',x-6,y-36,12,1);
  /* cánh cửa gỗ */
  for(let row=0;row<34;row++){
    const hw=row<6?Math.round(Math.sqrt(1-Math.pow((6-row)/6,2))*10):10,yy=y-34+row;
    R0('#5a3a1e',x-hw,yy,hw*2,1);
    for(let px=-hw;px<hw;px+=5)R0('#8a5a2e',x+px,yy,4,1);
    if(row===10||row===24)R0('#2b2b33',x-hw,yy,hw*2,2)}
  R0('#2a1a0c',x,y-30,1,30);
  R0('#ffd23f',x-3,y-14,2,2);R0('#ffd23f',x+2,y-14,2,2);
  /* ánh sáng lọt qua khe cửa */
  cx.globalAlpha=.5+.3*Math.sin(fr*.08);R0('#ffe9a8',x-9,y-2,18,2);cx.globalAlpha=1;
  /* bậc đá */
  R0('#59658a',x-17,y-3,34,3);R0('#3a4468',x-17,y,34,1);
  /* hai đèn lồng */
  [-22,22].forEach((o,i)=>{
    R0('#15151a',x+o,y-34,1,6);R0('#3a3a40',x+o-2,y-28,5,1);
    R0(((fr>>3)+i)%2?'#ffd23f':'#ffb347',x+o-1,y-27,3,4);
    cx.globalAlpha=.2;R0('#ffcc66',x+o-6,y-32,13,12);cx.globalAlpha=1})}
/* vật thể */
function dPil(o,p){
  const ax=o.ax,ay=o.ay,Hh=54;
  R0('rgba(0,0,0,.3)',ax-15,ay-3,30,5);
  for(let j=0;j<Hh;j++){const u=j/(Hh-1),hw=Math.round(5.5+7*Math.pow(1-u,3)+9*Math.pow(u,4)),y=ay-j;
    R0(p.pm,ax-hw,y,hw*2,1);R0(p.pl,ax-hw,y,2,1);R0(p.pd,ax+hw-3,y,3,1);if(j%5===2)R0(p.fk,ax-hw+2,y,hw*2-4,1)}
  R0(p.pl,ax-10,ay-Hh,20,1)}
function dCry(o,p){
  const x=o.ax,y=o.ay,pu=p.t<.5,c=pu?['#a070ff','#d4b8ff','#5a30b0']:['#2fb8f0','#9ae8ff','#1673a8'];
  cx.globalAlpha=.16+.08*Math.sin(frame*.07+o.x);R0(pu?'#a070ff':'#46e0d0',x-10,y-20,20,20);cx.globalAlpha=1;
  R0('rgba(0,0,0,.3)',x-6,y-2,12,3);
  [[0,16,5],[-5,11,4],[5,9,4],[-2,7,3]].forEach(([dx,h,w])=>{
    for(let j=0;j<h;j++){const ww=j>h-4?Math.max(1,w-(j-(h-4))):w;R0(c[0],x+dx-(ww>>1),y-2-j,ww,1)}
    R0(c[1],x+dx-(w>>1),y-2-(h-5),1,h-5);R0(c[2],x+dx+(w>>1)-(w>3?1:0),y-3-(h-5),1,h-6)});
  if(((frame>>3)+o.x)%7===0)R0('#fff',x+1,y-14,1,1)}
function dMus(o){
  const x=o.ax,y=o.ay;
  cx.globalAlpha=.14;R0('#e090ff',x-8,y-12,16,12);cx.globalAlpha=1;
  R0('#e8d8f0',x-1,y-5,2,5);R0('#c070d8',x-4,y-8,8,3);R0('#e8a0ff',x-3,y-9,6,1);R0('#8a3fa8',x-4,y-6,8,1);R0('#fff',x-2,y-8,1,1);R0('#fff',x+1,y-7,1,1)}
function dStg(o,p){
  const x=o.ax,y=o.ay;
  R0('rgba(0,0,0,.3)',x-4,y-2,8,3);
  for(let j=0;j<14;j++){const w=Math.max(1,Math.round(6*(1-j/14)));R0(p.fc,x-(w>>1),y-2-j,w,1);R0(p.pl,x-(w>>1),y-2-j,1,1);if(w>2)R0(p.sd,x+(w>>1)-1,y-2-j,1,1)}}
function dBush(o){
  const x=o.ax,y=o.ay-4,sw=Math.round(Math.sin(frame*.04+o.x));
  cx.globalAlpha=.18+.07*Math.sin(frame*.06);R0('#ff9ad0',x-10,y-9,20,18);cx.globalAlpha=1;
  R0('#3a2a22',x-1,y+3,2,4);
  [[-5,-1,6,5,'#1f5d3f'],[0,-3,6,6,'#2a7a52'],[-2,1,6,5,'#3a9a68'],[-6,2,4,3,'#2a7a52']].forEach(([a,b,w,h,c])=>R0(c,x+a+sw*(b<0?1:0),y+b,w,h));
  [[-4,-1],[2,-2],[0,2],[-1,-4],[4,1],[-5,3]].forEach(([a,b],i)=>{R0('#ff8ab8',x+a+sw,y+b,2,2);R0('#fff0a0',x+a+sw,y+b,1,1);if(((frame>>4)+i)%5===0)R0('#fff',x+a+sw+1,y+b-1,1,1)})}
function dObj(o){
  const p=PL[Math.max(0,Math.min(AW-1,o.x))];
  if(o.k==='pil')dPil(o,p);else if(o.k==='cry')dCry(o,p);else if(o.k==='mus')dMus(o);else if(o.k==='stg')dStg(o,p);else dBush(o)}
function drawBack(){
  if(!AB)return;
  const x0=Math.max(0,Math.floor(camX/T)-1),y0=Math.max(0,Math.floor(camY/T)-1),
    x1=Math.min(AW-1,x0+Math.ceil(CW/IS/T)+3),y1=Math.min(AH-1,y0+Math.ceil(CH/IS/T)+3);
  cx.fillStyle='#07061a';cx.fillRect(x0*T,y0*T,(x1-x0+1)*T,(y1-y0+1)*T);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)tileAt(x,y);
  /* [SỬA 2] thêm drawIslands để vẽ đảo bay + cầu treo */
  drawRune();waterfall();drawIslands(x0,y0,x1,y1);
  drawDoor(D,['rgba(80,140,255,.38)','rgba(20,40,160,0)','#4a90f5']);
  drawExit(D2);
  const lx=x0*T-40,rx=x1*T+40,ty=y0*T-70,by=y1*T+70;
  AB.OBJ.forEach(o=>{if(o.ax<lx||o.ax>rx||o.ay<ty||o.ay>by)return;dObj(o)});
  cx.globalAlpha=1}
function label(x,y,t,col){
  cx.save();cx.textAlign='center';cx.font='bold 6px monospace';
  const w=Math.ceil(cx.measureText(t).width)+6,bx=Math.round(x-w/2),by=Math.round(y);
  cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(bx,by,w,9);cx.fillStyle=col||'#ffd23f';cx.fillRect(bx,by+9,w,1);
  cx.fillStyle='#fff';cx.fillText(t,Math.round(x),by+7);cx.restore()}
function drawFront(){
  if(!AB)return;
  const L=ins.filter(p=>p.fl===WID);
  AB.OBJ.forEach(o=>{
    if(o.k!=='pil'&&o.k!=='cry')return;
    if(L.some(q=>q.y<o.ay-1&&q.y>o.ay-o.h-4&&Math.abs(q.x-o.ax)<o.w/2))dObj(o)});
  const vw=CW/IS,vh=CH/IS;
  for(let i=0;i<16;i++){
    const dx=camX+((i*97+frame*.15*(1+i%3*.4))%vw),dy=camY+((i*61+frame*.07+Math.sin(frame*.02+i)*6)%vh),pu=PL[Math.max(0,Math.min(AW-1,Math.floor(dx/T)))].t<.5;
    cx.globalAlpha=.4;R0(pu?'#c9a8ff':'#7cfff0',dx,dy,1,1)}
  cx.globalAlpha=1;
  PT.forEach(q=>{cx.globalAlpha=Math.max(0,Math.min(1,q.l/20));R0(q.c,q.x,q.y,2,2)});cx.globalAlpha=1;
  const P=L.find(q=>q.pl===sel);if(!P||SW||PR)return;
  const b=nearBush(P);
  if(b)label(b.x*T+4,b.y*T-14,GOT[sel]?'Đã hái 1 bông':'E: Hái hoa đầm lầy',GOT[sel]?'#aaa':'#ffd23f');
  else if(nearDoor(P,D2))label(D2.x,D2.y-40,'E: Cửa về mặt đất','#ffc84a');
  else if(nearDoor(P,D))label(D.x,D.y-30,'E: Cánh cửa xoáy','#ffd23f')
  }

/* [SỬA 4] bọc person và drawIn tách riêng, mỗi cái chỉ bọc 1 lần */
const _personA=person;
person=function(p){
  if(p.fl!==WID||!AB)return _personA(p);
  const o=offAt(Math.floor(p.x/T),Math.floor(p.y/T));
  if(!o)return _personA(p);
  cx.save();cx.translate(0,-Math.round(o));
  try{_personA(p)}finally{cx.restore()}};
const _drawIn=drawIn;
drawIn=function(){
  if(curF!==WID)return _drawIn();
  drawBack();_drawIn();drawFront()};

/* ---------- Khung nhìn + camera riêng cho Vực sâu (bản đồ lớn hơn nhà) ---------- */
function abSnap(){
  const P=ins.find(p=>p.pl===sel);if(!P)return;
  camX=Math.max(0,Math.min(AW*T-CW/IS,P.x-CW/IS/2));camY=Math.max(0,Math.min(AH*T-CH/IS,P.y-CH/IS/2))}
const _sv=syncView;syncView=function(s){
  _sv(s);
  const P=ins.find(p=>p.pl===sel);
  if(P&&P.fl===WID){IS=CW/VW;if(s)abSnap()}};
const _cam=cam;cam=function(){
  if(inside&&curF===WID){
    const P=ins.find(p=>p.pl===sel)||ins.find(p=>p.pl);if(!P)return;
    camX+=(Math.max(0,Math.min(AW*T-CW/IS,P.x-CW/IS/2))-camX)*.15;
    camY+=(Math.max(0,Math.min(AH*T-CH/IS,P.y-CH/IS/2))-camY)*.15;return}
  _cam()};

/* ---------- Cập nhật mỗi khung hình ---------- */
function regionWatch(){
  const P=ins.find(p=>p.pl===sel&&p.fl===WID);if(!P)return;
  const x=P.x/T,g=x<115?'tim':x>185?'ngoc':'giua';
  if(g!==lastReg){const f=lastReg==='';lastReg=g;
    if(!f)cap(g==='tim'?'Hang tím: trụ đá khổng lồ, thạch nhũ rủ xuống. Cánh cửa xoáy ở cuối hang, phía bắc (chưa mở được).':
      g==='ngoc'?'Hang xanh ngọc: thác nước, cầu đá, tinh thể phát sáng. Bụi hoa đầm lầy mọc trên các bục đá cao, hãy leo bậc thang để lên hái.':'Bãi đáp ở giữa Vực sâu. Cửa gỗ phía bắc dẫn về mặt đất. Tây: hang tím. Đông: hang xanh ngọc.')}}
const _step=step;step=function(){
  _step();swTick();pitWatch();
  if(state==='island'){
    PT.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy-=.01;q.l--});PT=PT.filter(q=>q.l>0);
    regionWatch()}};


/* ---------- Móc vào vòng đời game ---------- */
const _gen=gen;gen=function(sd){_gen(sd);buildAbyss()};
const _mk=mkPeople;mkPeople=function(){_mk();GOT={};saveG();PT=[];SW=null;closeAsk();flagN=0;lastReg=''};
window.ABYSS=()=>AB;   /* Sentinel.js cần dòng này để lấy dữ liệu Vực sâu */
buildAbyss();   /* bản đồ đầu tiên đã được tạo trước khi file này nạp */
})();

