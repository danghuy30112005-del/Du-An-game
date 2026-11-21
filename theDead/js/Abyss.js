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
const _draw=draw;draw=function(){_draw();if(SW){window.SWACT=1;window.swDrawPlus?window.swDrawPlus(SW):swDraw()}else window.SWACT=0};

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



/* ===== skyboss.js: CỬA CON MẮT THIÊN THẦN (trên đảo bay Vực sâu) + ĐẢO BAY KHỔNG LỒ + BOSS 3 DẠNG =====
   Nạp SAU Abyss2.js và TRƯỚC equip.js:  <script src="../js/skyboss.js"></script>
   Cần thêm vài sửa nhỏ trong Playerkit.js (khối holy.js) -> xem PATCHES2.md.
   Dạng 1 (nhện, 300 máu): nhảy qua lại giữa các đảo; cầu tơ / mưa độc / nhảy biến mất rồi đâm xuống.
   Dạng 2 (hydra, 400 máu): chườn + dịch chuyển; đầu lâu / quất đuôi hoặc chui đất cắn / ra ngoài màn hình bắn tia độc.
   Dạng 3 (kết hợp, 500 máu): có mắt chảy huyết lệ + 6 đôi cánh sắt, dùng ngẫu nhiên mọi chiêu của 2 dạng.
   Hết thanh máu: cơ thể nổ tung -> hóa trắng bay lên -> ghép lại thành dạng tiếp theo. */
(()=>{
if(typeof putIn!=='function'||!window.WORLDS||typeof window.abyssAsk!=='function'||typeof window.worldTransfer!=='function'||typeof window.ABYSS!=='function'||typeof killPlayer!=='function'){
  console.warn('skyboss.js: hãy nạp SAU Abyss2.js (và trước equip.js)');return}

/* ---------- Thông số ---------- */
const WID3=23,WIDA=21,VOID=63,AW3=200,AH3=130,VW3=640,SC=1.4,ABW=300;
const BMAX=[300,400,500],BNAME=['NHỆN RỪNG SÂU','HYDRA TỬ XÀ','HÓA THÂN TUYỆT VỌNG'],BCOL=['#c0287a','#e0602a','#b040ff'];
const DKEY='deadisland:skybossdone';
/* đảo nhỏ / lớn bao quanh đảo chính: [x, y, rx, ry] (ô) */
const ISL3=[[68,50,7,4],[132,50,7,4],[66,92,7,4],[134,92,7,4],[100,38,8,4],[100,104,8,4],[40,70,10,6],[160,70,10,6]];
const MCX=100,MCY=70,MRX=26,MRY=16;     /* đảo chính */
const ANCH=[[100,64],[84,70],[116,70]].concat(ISL3.map(a=>[a[0],a[1]-.5])).map(a=>[a[0]*T,a[1]*T]);
const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),w,h)};
const rf=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pls3=()=>ins.filter(p=>p.pl&&p.fl===WID3);
function near3(x,y){let P=null,d=1e9;pls3().forEach(p=>{const q=Math.hypot(p.x-x,p.y-y);if(q<d){d=q;P=p}});return P}

let M3=null,DOOR=null,RET=null,B=null,PRJ=[],ZON=[],BMB=[],SK=[],FX=[],DONE=false,idleT=0,KEYSEEN=0;
try{DONE=localStorage.getItem(DKEY)==='1'}catch(_){}
const STARS=Array.from({length:150},()=>[rnd(AW3*T),rnd(AH3*T),1+rnd(2),Math.random()*6]);

/* ================= BẢN ĐỒ ĐẢO BAY KHỔNG LỒ ================= */
function build3(){
  const mk=v=>Array.from({length:AH3},()=>Array(AW3).fill(v));
  const im=mk(VOID),rid=mk(0),mask=mk(0),k0=Math.random()*6;
  for(let y=0;y<AH3;y++)for(let x=0;x<AW3;x++){
    const dx=(x+.5-MCX)/MRX,dy=(y+.5-MCY)/MRY,a=Math.atan2(dy,dx),r=1+.04*Math.sin(5*a+k0)+.03*Math.sin(9*a+1);
    if(Math.hypot(dx,dy)/r<1){im[y][x]=0;rid[y][x]=1;mask[y][x]=1}}
  im[83][MCX]=VOID;rid[83][MCX]=0;                 /* cửa về Vực sâu chặn ô này */
  const bot=Array(AW3).fill(-1);
  for(let x=0;x<AW3;x++)for(let y=AH3-1;y>=0;y--)if(mask[y][x]){bot[x]=y;break}
  M3={im,rid,mask,bot};
  FL[WID3]={im,rid,RM:[null,{n:'Đảo bay khổng lồ',f:['rgba(0,0,0,0)','rgba(0,0,0,0)'],x0:0,y0:0,x1:AW3-1,y1:AH3-1,s:1}]}}
const onIsle=(x,y)=>{const tx=Math.floor(x/T),ty=Math.floor(y/T);return !!(M3&&M3.im[ty]&&M3.im[ty][tx]===0)};
function randIsle(){for(let i=0;i<60;i++){const x=(MCX+rf(-MRX+3,MRX-3))*T,y=(MCY+rf(-MRY+3,MRY-3))*T;if(onIsle(x,y))return[x,y]}return[MCX*T,MCY*T+40]}

/* ================= CỬA CON MẮT THIÊN THẦN TRÊN ĐẢO BAY ================= */
function placeDoor(){
  DOOR=null;RET=null;
  const A=window.ABYSS();if(!A||!A.mt||!A.ISL||!A.ISL[2])return;
  const I=A.ISL[2];let best=null,bd=1e9;
  for(let y=Math.floor(I.cy-I.ry);y<=Math.ceil(I.cy+I.ry);y++)for(let x=Math.floor(I.cx-I.rx);x<=Math.ceil(I.cx+I.rx);x++){
    const q=A.mt.get(y*ABW+x);
    if(!q||q.k!=='i'||q.i!==2||A.im[y][x]!==0||A.ob[y][x])continue;
    const d=Math.hypot(x-(I.cx-2.5),y-(I.cy-1.2));if(d<bd){bd=d;best=[x,y]}}
  if(!best)return;
  A.im[best[1]][best[0]]=62;A.ob[best[1]][best[0]]=1;
  for(const dx of[2,1,-2,-1,3]){const q=A.mt.get(best[1]*ABW+best[0]+dx);
    if(q&&q.k==='i'&&q.i===2&&A.im[best[1]][best[0]+dx]===0&&!A.ob[best[1]][best[0]+dx]){RET=[best[0]+dx,best[1]];break}}
  if(!RET)RET=[best[0],best[1]+1];
  DOOR={x:best[0],y:best[1],I}}
const islOff=I=>I.h+I.amp*Math.sin(frame*I.sp+I.ph);
const doorPos=()=>({x:DOOR.x*T+4,y:(DOOR.y+1)*T-islOff(DOOR.I)});
const nearDoor=P=>DOOR&&P.fl===WIDA&&Math.hypot(P.x-(DOOR.x*T+4),P.y-((DOOR.y+1)*T+2))<26;
const nearExit=P=>P.fl===WID3&&Math.hypot(P.x-(MCX*T+4),P.y-(84*T+2))<24;

function pln(c,x0,y0,x1,y1,w){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)/Math.max(1,w*.6)));cx.fillStyle=c;
  for(let i=0;i<=n;i++){const t=i/n;cx.fillRect(Math.round(x0+(x1-x0)*t-w/2),Math.round(y0+(y1-y0)*t-w/2),w,w)}}
/* cánh cửa vòm đá, con mắt thiên thần ở giữa, 6 đôi cánh xung quanh */
function eyeDoor(x,y){
  const f=frame,ey=y-27;
  cx.globalAlpha=.22+.08*Math.sin(f*.07);R('#ffe9a8',x-26,y-70,52,74);cx.globalAlpha=1;
  R('rgba(0,0,0,.3)',x-15,y-1,30,3);
  for(let row=0;row<44;row++){const hw=row<12?Math.round(Math.sqrt(1-Math.pow((12-row)/12,2))*11):11,yy=y-44+row;
    R(row%6===2?'#3a4468':'#59658a',x-hw-3,yy,hw*2+6,1);R(row<22?'#15123a':'#0d0b28',x-hw,yy,hw*2,1)}
  for(let s=-1;s<=1;s+=2)for(let k=0;k<6;k++){
    const ang=-1.5708+s*(.3+k*.5)+Math.sin(f*.05+k)*.04,L=13+(k%2?6:3)+k*1.2;
    pln(k%2?'#f6ead0':'#ffffff',x,ey,x+Math.cos(ang)*L,ey+Math.sin(ang)*L*.95,3);
    pln('#ffd23f',x+Math.cos(ang)*(L-3),ey+Math.sin(ang)*(L-3)*.95,x+Math.cos(ang)*L,ey+Math.sin(ang)*L*.95,2)}
  for(let j=-5;j<=5;j++){const w=Math.round(9*Math.sqrt(Math.max(0,1-(j*j)/30)));R('#b98b78',x-w-1,ey+j,w*2+2,1);R('#f6f1ea',x-w,ey+j,w*2,1)}
  if((f%240)<8){R('#d9b8a6',x-8,ey,16,1)}
  else{for(let j=-4;j<=4;j++){const w=Math.round(Math.sqrt(Math.max(0,16-j*j)));R(j*j>9?'#c9a03a':'#2f9bd6',x-w,ey+j,w*2,1)}
    R('#0b1f33',x-1,ey-4,2,8);R('#ffffff',x-3,ey-3,1,1)}
  R('#ffd23f',x-12,y-48,24,1);R('#ffd23f',x-1,y-51,2,3);
  for(let i=0;i<5;i++){cx.globalAlpha=.7;R('#ffffff',x+Math.sin(f*.03+i*2)*18,y-4-((f*.4+i*13)%50),1,1)}cx.globalAlpha=1}
function label(x,y,t,col){
  cx.save();cx.textAlign='center';cx.font='bold 6px monospace';
  const w=Math.ceil(cx.measureText(t).width)+6,bx=Math.round(x-w/2),by=Math.round(y);
  cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(bx,by,w,9);cx.fillStyle=col||'#ffd23f';cx.fillRect(bx,by+9,w,1);
  cx.fillStyle='#fff';cx.fillText(t,Math.round(x),by+7);cx.restore()}

/* ================= WORLDS ================= */
const WORLDS=window.WORLDS;
WORLDS.skyboss={name:'Đảo bay khổng lồ',enter(q){
  if(!B&&!DONE)mkBoss();
  putIn(q,WID3,MCX+.5+(slot(q)-2)*1.4,78);q.vis=1;
  if(q.pl===sel)cap(DONE?'Đảo bay khổng lồ đã yên tĩnh. Con mắt thiên thần dõi theo bạn từ cánh cửa phía nam.':'Bạn bước qua cánh cửa vào một hòn đảo bay khổng lồ, xích sắt nối với những đảo khác. Có thứ gì đó đang thức giấc...')}};
WORLDS.abyssIsl={name:'Vực sâu',enter(q){
  const r=RET||[250,103];putIn(q,WIDA,r[0]+.5+(slot(q)-2)*.3,r[1]+.5);q.vis=1;
  if(q.pl===sel)cap('Bạn trở lại đảo bay ở Vực sâu.')}};

/* ================= BOSS ================= */
function mkBoss(){
  B={sky:1,k:'boss',hr:44,x:MCX*T,y:64*T,z:0,form:1,hp:BMAX[0],bmax:BMAX[0],S:'idle',e:0,p:0,d:{},wait:1.6,dir:1,
     alpha:1,fa:1,white:0,inv:0,wig:0,mv:0,crouch:0,stab:0,cast:0,shk:0};
  PRJ=[];ZON=[];BMB=[];SK=[];FX=[]}
function setS(s){B.S=s;B.e=0;B.p=0;B.d={}}
function toIdle(w){setS('idle');B.wait=w===undefined?rf(.9,1.8):w;B.crouch=0;B.stab=0;B.cast=0;B.fa=1;B.inv=0;B.z=0;B.mv=0}
function fx(x,y,n,cols,sp,up,life,z0){for(let i=0;i<n;i++)FX.push({x,y,z:z0||0,vx:(Math.random()-.5)*sp,vy:(Math.random()-.5)*sp*.6,vz:Math.random()*up,
  l:life*(.6+Math.random()*.8),m:life,c:cols[rnd(cols.length)],s:1+rnd(2)})}
const POIS=['#8aff4a','#4a9a1a','#d4ff8a','#b07cff'],WHITE=['#ffffff','#fff3a0','#cfeaff'],BOOM=['#ff3b2a','#ff8a3d','#ffd23f','#2a0a2a','#ffffff'];
function pickAnchor(){for(let k=0;k<10;k++){const a=ANCH[rnd(ANCH.length)];if(Math.hypot(a[0]-B.x,a[1]-B.y)>60)return a}return ANCH[0]}
function aim(P,x,y){return Math.atan2((P?P.y-6:y+30)-y,(P?P.x:x)-x)}
function addBeam(x,y,tx,ty,o){BMB.push(Object.assign({x,y,a:Math.atan2(ty-y,tx-x),len:1400,w:16,tele:.9,fire:.4,t:0,col:'poison'},o||{}))}

function startHop(){const a=pickAnchor();setS('hop');B.d={x0:B.x,y0:B.y,x1:a[0],y1:a[1]};
  const dist=Math.hypot(a[0]-B.x,a[1]-B.y);B.d.hd=.8+dist/700;B.d.h=26+dist*.2;B.dir=a[0]>=B.x?1:-1}
function startSlither(){const a=pickAnchor();setS('slither');B.d={tx:a[0],ty:a[1]}}
function startTele(){setS('tele')}
function pick(){
  const f=B.form,r=Math.random(),s1=['web','poison','leap'],s2=['skull','tail','dive','outbeam'],
    pool=f===1?s1:f===2?s2:s1.concat(s2);
  if(r<.28){
    if(f===1)startHop();
    else if(f===2)(Math.random()<.5?startSlither():startTele());
    else{const q=Math.random();q<.34?startHop():q<.67?startSlither():startTele()}
  }else{const k=pool[rnd(pool.length)];setS(k);if(k==='leap'||k==='tail'||k==='dive')B.d={}}}

function bossAI(dt,A){
  const b=B;b.e+=dt;b.alpha+=(b.fa-b.alpha)*Math.min(1,dt*6);
  if(b.S==='idle'||b.S==='web'||b.S==='poison'||b.S==='skull'){const P=near3(b.x,b.y);if(P)b.dir=P.x>=b.x?1:-1}
  switch(b.S){
  case 'idle':b.mv=0;if(b.e>=b.wait)pick();break;
  case 'hop':{const u=Math.min(1,b.e/b.d.hd),k=u*u*(3-2*u);
    b.x=b.d.x0+(b.d.x1-b.d.x0)*k;b.y=b.d.y0+(b.d.y1-b.d.y0)*k;b.z=Math.sin(Math.PI*u)*b.d.h;b.mv=1;
    if(u>=1){shake=Math.max(shake,3);fx(b.x,b.y,16,['#c9b48a','#8a7a5a'],120,60,.6);toIdle()}break}
  case 'slither':{const dx=b.d.tx-b.x,dy=b.d.ty-b.y,d=Math.hypot(dx,dy),sp=90*dt;b.mv=1;
    if(Math.abs(dx)>2)b.dir=dx>0?1:-1;
    if(d<=sp){b.x=b.d.tx;b.y=b.d.ty;toIdle()}else{b.x+=dx/d*sp;b.y+=dy/d*sp}
    if(frame%5===0)fx(b.x,b.y,1,['#c9b48a'],40,20,.5);break}
  case 'tele':
    if(b.p===0){b.fa=0;b.inv=1;if(b.e>=.45){const a=pickAnchor();b.x=a[0];b.y=a[1];b.fa=1;b.p=1;b.e=0;fx(b.x,b.y-20,24,WHITE,160,90,.7)}}
    else if(b.e>=.45)toIdle(rf(.5,1));
    break;
  case 'web':
    b.crouch=Math.min(1,b.e/.6);
    if(b.p<3&&b.e>=.7+b.p*.4){shootWeb(A[rnd(A.length)]);b.p++}
    if(b.e>=2.4)toIdle();break;
  case 'poison':
    b.crouch=Math.min(1,b.e/.5);
    if(b.p===0&&b.e>=.6){b.p=1;spitPoison(A)}
    if(b.e>=1.3)toIdle();break;
  case 'leap':leapAI(A);break;
  case 'skull':
    b.cast=Math.min(1,b.e/.8);
    if(b.p===0&&b.e>=.8){b.p=1;spawnSkulls()}
    if(b.e>=1.5)toIdle();break;
  case 'tail':{
    b.cast=1;const P=near3(b.x,b.y);
    if(b.p===0){addBeam(b.x,b.y-6,b.x+Math.cos(aim(P,b.x,b.y))*100,b.y+Math.sin(aim(P,b.x,b.y))*100,{col:'tail',len:240,w:26,tele:.9,fire:.28});b.p=1}
    if(b.p===1&&b.e>=1.35){const P2=near3(b.x,b.y);addBeam(b.x,b.y-6,b.x+Math.cos(aim(P2,b.x,b.y))*100,b.y+Math.sin(aim(P2,b.x,b.y))*100,{col:'tail',len:240,w:26,tele:.55,fire:.28});b.p=2}
    if(b.e>=2.5)toIdle();break}
  case 'dive':diveAI(A);break;
  case 'outbeam':{
    while(b.p<OBS.length&&b.e>=OBS[b.p][0]){doOB(OBS[b.p][1],A);b.p++}break}
  case 'xform':xformAI(dt);break;
  case 'die':dieAI(dt);break;
  }}

/* --- chiêu dạng 1 --- */
function shootWeb(P){
  if(!P)return;
  const tx=P.x+rf(-12,12),ty=P.y+rf(-8,8),dist=Math.hypot(tx-B.x,ty-B.y),d=clamp(dist/240,.55,1.2);
  PRJ.push({k:'web',sx:B.x,sy:B.y,tx,ty,z0:56,arc:40,e:0,d});
  ZON.push({k:'mark',x:tx,y:ty,r:11,e:0,d});
  fx(B.x,B.y-50,6,['#e8e8f0','#ffffff'],80,40,.4,50)}
function spitPoison(A){
  for(let i=0;i<5;i++){
    PRJ.push({k:'pup',x:B.x+rf(-14,14),y:B.y,z:50,e:0,d:.6});
    let x,y;
    if(i<2&&A.length){const P=A[rnd(A.length)];x=P.x+rf(-6,6);y=P.y+rf(-6,6)}
    else{const P=A.length?A[rnd(A.length)]:null,b=P?[P.x,P.y]:randIsle();x=b[0]+rf(-70,70);y=b[1]+rf(-50,50)}
    if(!onIsle(x,y)){const r=randIsle();x=r[0];y=r[1]}
    ZON.push({k:'drop',x,y,r:17,e:0,d:1.35+i*.15})}}
function leapAI(A){
  const b=B;
  if(b.p===0){b.crouch=Math.min(1,b.e/.5);if(b.e>=.5){b.p=1;b.e=0}}
  else if(b.p===1){b.z=b.e/.45*430;b.crouch=0;
    if(b.e>=.45){b.p=2;b.e=0;b.inv=1;b.fa=0;
      b.d.m=A.map(P=>({x:P.x,y:P.y,r:30,P}));
      const r=randIsle();b.d.m.push({x:r[0],y:r[1],r:30,P:null});
      shake=Math.max(shake,6)}}
  else if(b.p===2){
    if(b.e<1.7)b.d.m.forEach(m=>{if(m.P&&m.P.fl===WID3){m.x=m.P.x;m.y=m.P.y}});
    if(b.e>=2.4){b.p=3;b.e=0;const m0=b.d.m[0];b.x=m0.x;b.y=m0.y;b.fa=1;b.alpha=1;b.dir=1}}
  else if(b.p===3){const u=Math.min(1,b.e/.2);b.z=430*(1-u*u);
    if(u>=1){b.z=0;b.inv=0;b.stab=1;b.p=4;b.e=0;stomp()}}
  else if(b.p===4&&b.e>=1.0)toIdle()}
function stomp(){
  shake=Math.max(shake,12);flash=8;
  B.d.m.forEach(m=>{
    ZON.push({k:'stab',x:m.x,y:m.y,r:m.r,e:0,d:.6});
    fx(m.x,m.y,22,['#2a1230','#c0287a','#8a7a5a'],200,120,.7);
    pls3().forEach(p=>{if(Math.hypot(p.x-m.x,p.y-m.y)<m.r+4)killPlayer(p.pl)})});
  B.d.m=[]}

/* --- chiêu dạng 2 --- */
function spawnSkulls(){
  if(SK.length>=5)return;
  for(let i=0;i<3;i++){const a=i*2.09+Math.random();
    SK.push({sky:1,skull:1,k:'skull',x:B.x+Math.cos(a)*40,y:B.y+Math.sin(a)*24,z:10,hp:10,mhp:10,life:14,cd:rf(.8,1.8),ang:Math.random()*6});
    fx(B.x+Math.cos(a)*40,B.y+Math.sin(a)*24,10,['#e8e4d0','#7aff7a'],90,60,.5,10)}}
function diveAI(A){
  const b=B;
  if(b.p===0){b.fa=0;b.crouch=Math.min(1,b.e/.5);if(b.e>=.5){b.p=1;b.e=0;b.inv=1}}
  else if(b.p===1){
    const P=near3(b.x,b.y);
    if(b.e<1.1&&P){const dx=P.x-b.x,dy=P.y-b.y,d=Math.hypot(dx,dy),sp=130*(1/60);if(d>sp){b.x+=dx/d*sp*(DM>0?DM*60:1);b.y+=dy/d*sp*(DM>0?DM*60:1)}}
    if(frame%3===0)fx(b.x,b.y,2,['#6b5a3e','#3a2f22'],60,40,.5);
    if(b.e>=1.1&&!b.d.lock){b.d.lock=1;ZON.push({k:'mark',x:b.x,y:b.y,r:28,e:0,d:.6})}
    if(b.e>=1.7){b.p=2;b.e=0;b.inv=0;b.fa=1;b.alpha=1;b.crouch=0;shake=Math.max(shake,8);
      fx(b.x,b.y,26,['#6b5a3e','#3a2f22','#8a7a5a'],200,120,.7);
      pls3().forEach(p=>{if(Math.hypot(p.x-b.x,p.y-b.y)<30)killPlayer(p.pl)})}}
  else if(b.p===2&&b.e>=.8)toIdle()}
const OBS=[[0,'out'],[.5,'warp'],[1.0,'A'],[2.7,'B'],[4.0,'out'],[4.5,'warp2'],[5.0,'A'],[6.7,'B'],[8.1,'out'],[8.6,'home'],[9.4,'end']];
function doOB(k,A){
  const b=B,vw=CW/IS,vh=CH/IS;
  if(k==='out'){b.fa=0;b.inv=1}
  else if(k==='warp'){
    b.d.cx=camX+vw/2;b.d.cy=camY+vh/2;
    const s=rnd(4);let x,y;
    if(s===0){x=rf(camX+40,camX+vw-40);y=camY-60}else if(s===1){x=rf(camX+40,camX+vw-40);y=camY+vh+60}
    else if(s===2){x=camX-60;y=rf(camY+30,camY+vh-30)}else{x=camX+vw+60;y=rf(camY+30,camY+vh-30)}
    b.x=clamp(x,30,AW3*T-30);b.y=clamp(y,40,AH3*T-30);b.fa=1;b.alpha=0;b.dir=b.x<b.d.cx?1:-1}
  else if(k==='warp2'){
    b.x=clamp(2*b.d.cx-b.x,30,AW3*T-30);b.y=clamp(2*b.d.cy-b.y,40,AH3*T-30);b.fa=1;b.alpha=0;b.dir=b.x<b.d.cx?1:-1}
  else if(k==='A'){
    const pos=A.map(p=>[p.x,p.y]);
    while(pos.length<3){const r=randIsle();pos.push(r)}
    pos.sort(()=>Math.random()-.5).slice(0,3).forEach(p=>addBeam(b.x,b.y,p[0],p[1],{tele:.9,fire:.45}))}
  else if(k==='B'){for(let i=0;i<2;i++){const r=randIsle();addBeam(b.x,b.y,r[0],r[1],{tele:.8,fire:.45})}}
  else if(k==='home'){const a=ANCH[0];b.x=a[0];b.y=a[1];b.fa=1;b.alpha=0;b.inv=0;b.dir=1;fx(b.x,b.y-20,24,WHITE,160,90,.7)}
  else if(k==='end')toIdle(rf(1,1.6))}

/* --- đổi dạng / chết --- */
function bossDown(){
  if(!B||B.S==='xform'||B.S==='die'||B.S==='dead')return;
  BMB=[];ZON=ZON.filter(z=>z.k==='web'||z.k==='poison');SK=[];PRJ=[];
  B.inv=1;B.z=0;B.fa=1;B.alpha=1;B.crouch=0;B.stab=0;B.cast=0;
  setS(B.form<3?'xform':'die');
  cap(B.form<3?'Cơ thể quái vật nổ tung! Nó đang hóa trắng...':'Quái vật gào thét, cơ thể bắt đầu tan rã!')}
function xformAI(dt){
  const b=B,e=b.e;
  if(e<1.2){
    b.shk=3;b.white=Math.min(.45,e/1.2*.45);
    if(frame%3===0)fx(b.x+rf(-30,30),b.y-rf(10,60),4,BOOM,220,140,.7,rf(0,40));
    if(b.p===0&&e>=.15){b.p=1;fx(b.x,b.y-30,90,BOOM,380,220,1.0,20);flash=14;shake=Math.max(shake,16)}}
  else if(e<2.6){
    const u=(e-1.2)/1.4;b.shk=0;b.white=Math.min(1,.45+u*2);
    b.z=u*u*(3-2*u)*220;b.x+=(MCX*T-b.x)*Math.min(1,dt*2);b.y+=(62*T-b.y)*Math.min(1,dt*2);
    if(frame%2===0)fx(b.x+rf(-40,40),b.y-b.z+rf(-40,10),2,WHITE,60,60,.8,0)}
  else if(e<3.9){
    if(b.p<2){b.p=2;b.form++;b.bmax=BMAX[b.form-1];b.hp=b.bmax;fx(b.x,b.y-b.z,70,WHITE,320,160,.9,0);flash=10;
      cap('Quái vật ghép lại thành dạng '+b.form+': '+BNAME[b.form-1]+'!')}
    const u=Math.min(1,(e-2.6)/1.3);b.white=1-u;b.z=220*(1-u*u*(3-2*u));
    if(frame%2===0){const a=Math.random()*6.28,r=rf(60,120);FX.push({x:b.x+Math.cos(a)*r,y:b.y-b.z-30+Math.sin(a)*r*.5,z:0,vx:-Math.cos(a)*r*1.4,vy:-Math.sin(a)*r*.7,vz:0,l:.7,m:.7,c:'#ffffff',s:2})}
    if(e>=3.9){b.white=0;b.z=0;shake=Math.max(shake,8);toIdle(1.2)}}}
function dieAI(dt){
  const b=B,e=b.e;
  if(e<2.2){b.shk=3;b.white=Math.min(.5,e/2.2*.5);
    if(frame%4===0){fx(b.x+rf(-40,40),b.y-rf(10,70),6,BOOM,260,160,.8,rf(0,50));shake=Math.max(shake,6)}
    if(b.p===0&&e>=.2){b.p=1;fx(b.x,b.y-30,120,BOOM,420,240,1.1,20);flash=16}}
  else if(e<4){const u=(e-2.2)/1.8;b.shk=0;b.white=Math.min(1,.5+u);b.z=u*u*300;b.alpha=1-u*.9;
    if(frame%2===0)fx(b.x+rf(-40,40),b.y-b.z-rf(0,50),2,WHITE,60,60,.8,0)}
  else{
    B.S='dead';DONE=true;try{localStorage.setItem(DKEY,'1')}catch(_){}
    fx(b.x,b.y-b.z,100,WHITE,400,200,1.2,0);flash=16;
    pls3().forEach(p=>{if(window.giveItem)window.giveItem(p.pl,'gem')});
    cap('Quái vật tan biến thành ánh sáng trắng! Đảo bay khổng lồ đã yên tĩnh. Mỗi người chơi nhận được một Tinh thể.')}}

/* ================= CẬP NHẬT ================= */
function hitCircle(x,y,r){pls3().forEach(p=>{if(Math.hypot(p.x-x,p.y-y)<r)killPlayer(p.pl)})}
function updateHaz(dt){
  PRJ.forEach(p=>{
    p.e+=dt;
    if(p.k==='web'){const u=Math.min(1,p.e/p.d);p.x=p.sx+(p.tx-p.sx)*u;p.y=p.sy+(p.ty-p.sy)*u;p.z=p.z0*(1-u)+Math.sin(Math.PI*u)*p.arc;
      if(u>=1){p.dead=1;
        const hit=pls3().filter(q=>Math.hypot(q.x-p.tx,q.y-p.ty)<11);
        if(hit.length){hit.forEach(q=>killPlayer(q.pl));fx(p.tx,p.ty,10,['#e8e8f0','#ffffff'],100,60,.5)}
        else ZON.push({k:'web',x:p.tx,y:p.ty,r:22,e:0,life:9});
        ZON.forEach(z=>{if(z.k==='mark'&&Math.abs(z.x-p.tx)<1&&Math.abs(z.y-p.ty)<1)z.dead=1})}}
    else if(p.k==='pup'){p.z+=700*dt;if(p.e>=p.d)p.dead=1}
    else if(p.k==='bul'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;
      pls3().forEach(q=>{if(!p.dead&&Math.hypot(q.x-p.x,q.y-6-p.y)<6){p.dead=1;killPlayer(q.pl)}});
      if(p.l<=0)p.dead=1}});
  PRJ=PRJ.filter(p=>!p.dead);
  ZON.forEach(z=>{
    z.e+=dt;
    if(z.k==='web'){if(z.e>=z.life)z.dead=1}
    else if(z.k==='poison'){z.tk-=dt;if(z.tk<=0){z.tk=.35;hitCircle(z.x,z.y,z.r)}if(z.e>=z.life)z.dead=1}
    else if(z.k==='drop'){if(z.e>=z.d){z.dead=1;
      ZON.push({k:'poison',x:z.x,y:z.y,r:z.r,e:0,life:7,tk:0});hitCircle(z.x,z.y,z.r*.85);
      fx(z.x,z.y,18,POIS,160,100,.7);shake=Math.max(shake,3)}}
    else if(z.k==='mark'||z.k==='stab'){if(z.e>=z.d)z.dead=1}});
  ZON=ZON.filter(z=>!z.dead);
  BMB.forEach(b=>{
    b.t+=dt;
    if(b.t>=b.tele&&b.t<b.tele+b.fire){
      const c=Math.cos(b.a),s=Math.sin(b.a);
      pls3().forEach(p=>{const rx=p.x-b.x,ry=p.y-6-b.y,d=rx*c+ry*s,pp=Math.abs(-rx*s+ry*c);
        if(d>=0&&d<=b.len&&pp<=b.w/2+3)killPlayer(p.pl)})}
    if(b.t>b.tele+b.fire+.15)b.dead=1});
  BMB=BMB.filter(b=>!b.dead);
  SK.forEach(s=>{
    s.life-=dt;s.ang+=dt;
    const P=near3(s.x,s.y);
    if(P){const dx=P.x-s.x,dy=P.y-s.y,d=Math.hypot(dx,dy),want=110;
      if(d>want+10){s.x+=dx/d*22*dt;s.y+=dy/d*22*dt}else if(d<want-20){s.x-=dx/d*22*dt;s.y-=dy/d*22*dt}
      s.cd-=dt;
      if(s.cd<=0){s.cd=rf(1.8,2.6);const sp=55;PRJ.push({k:'bul',x:s.x,y:s.y-6,vx:dx/d*sp,vy:dy/d*sp,l:7,e:0})}}});
  SK=SK.filter(s=>s.life>0&&s.hp>0)}
function tick(dt){
  const A=pls3();
  if(!B)return;
  if(!A.length){idleT+=dt;if(idleT>6&&!DONE&&(B.form>1||B.hp<B.bmax||B.S!=='idle'))mkBoss();return}
  idleT=0;
  B.wig+=dt;
  FX.forEach(f=>{f.x+=f.vx*dt;f.y+=f.vy*dt;f.z+=f.vz*dt;f.vz-=260*dt;if(f.z<0){f.z=0;f.vz=0}f.l-=dt});FX=FX.filter(f=>f.l>0);
  if(B.S==='dead')return;
  updateHaz(dt);
  bossAI(dt,A)}

/* hit từ kỹ năng người chơi (chạy qua window.MONS + holyHurt) */
const _M=window.MONS;
window.MONS=function(){
  if(inside&&curF===WID3&&B){
    if(B.inv||B.S==='xform'||B.S==='die'||B.S==='dead')return SK.slice();
    return[B].concat(SK)}
  return _M?_M():[]};
const _omk=window.onMonKilled;
window.onMonKilled=function(mo){
  if(mo&&mo.sky){
    if(mo.skull){SK=SK.filter(s=>s!==mo);fx(mo.x,mo.y,12,['#e8e4d0','#7aff7a'],120,80,.5,10);return}
    bossDown();return}
  if(_omk)_omk(mo)};

/* ================= VẼ ================= */
function disc(c,x,y,r){for(let j=-r;j<=r;j++){const w=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));R(c,x-w,y+j,w*2,1)}}
function chain(x0,y0,x1,y1,sag){
  const n=Math.max(2,Math.round(Math.hypot(x1-x0,y1-y0)/2.6));
  for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+sag*4*t*(1-t);
    if(i%2){R('#aab0ba',x-1,y,3,2);R('#6b7078',x-1,y+1,3,1)}else{R('#8a909a',x,y-1,2,3);R('#4a4f58',x+1,y-1,1,3)}}}
const MASK=(x,y)=>!!(M3&&M3.mask[y]&&M3.mask[y][x]);
function grass(x,y){
  const h=hs(x,y),px=x*T,py=y*T,n=Math.sin(x*.21+1)+Math.sin(y*.27)+Math.sin((x+y)*.13);
  let c=['#365f26','#3a6429','#33591f'][h%3];
  if(n>1.1)c=['#6a6a2a','#707030','#62622a'][h%3];else if(n<-1.2)c=['#2a4d20','#2c5222'][h%2];
  R(c,px,py,T,T);
  if(h%5===0)R('#4f7a30',px+((h>>3)&5),py+((h>>6)&5),2,1);
  if(h%9===0)R('#243f1a',px+((h>>4)&5),py+((h>>8)&5),1,2);
  if(h%13===0)R(['#c9b84a','#e0d070','#b8a040'][h%3],px+((h>>5)&5),py+((h>>9)&5),1,1);
  if(!MASK(x,y-1))R('#8aa84a',px,py,T,1);
  if(!MASK(x-1,y))R('#2a4a1c',px,py,1,T);
  if(!MASK(x+1,y))R('#2a4a1c',px+T-1,py,1,T);
  if(!MASK(x,y+1))R('#3a2f1e',px,py+T-2,T,2)}
function drawMain(x0,x1,y0,y1){
  for(let x=x0;x<=x1;x++){const yb=M3.bot[x];if(yb<0)continue;
    const base=(yb+1)*T,u=(x-MCX)/MRX,depth=Math.round(10+40*Math.sqrt(Math.max(0,1-u*u))+hs(x,3)%4);
    for(let d=0;d<depth;d++)R(d<4?'#6a5a3a':d<depth*.55?'#4a3f2c':'#2a2418',x*T,base+d,T,1);
    if(hs(x,8)%3===0)R('#1a150e',x*T+2,base+4,2,Math.round(depth*.4))}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(MASK(x,y))grass(x,y)}
function drawIsle(I,i){
  const X=I[0]*T,rx=I[2]*T,ry=I[3]*T,Y=Math.round(I[1]*T+Math.sin(frame*.02+i)*2),D=Math.round(rx*.8+10);
  if(X+rx<camX-40||X-rx>camX+CW/IS+40||Y-ry>camY+CH/IS+60||Y+ry+D<camY-20)return;
  for(let d=0;d<D;d++){const k=d/D,w=Math.round(rx*Math.pow(1-k,.8));R(k<.25?'#6a5a3a':k<.6?'#4a3f2c':'#2a2418',X-w,Y+ry*.5+d,w*2,1);if(hs(d,i+9)%4===0)R('#1a150e',X-w+2,Y+ry*.5+d,2,1)}
  for(let j=-ry;j<=ry;j++){const w=Math.round(rx*Math.sqrt(1-(j*j)/(ry*ry+.01)));
    R(j<-ry+1?'#8aa84a':(j&1)?'#365f26':'#3a6429',X-w,Y+j,w*2,1)}
  for(let q=0;q<Math.max(3,rx>>2);q++){const x=X+((hs(q,i)%100)/100-.5)*rx*1.5,y=Y+((hs(q,i+3)%100)/100-.5)*ry*1.1;R(q%3?'#6a6a2a':'#4f7a30',x,y,3,1)}}
function drawBG(){
  const vw=CW/IS,vh=CH/IS,f=frame;
  const g=cx.createLinearGradient(0,camY,0,camY+vh);g.addColorStop(0,'#0b0820');g.addColorStop(.55,'#241540');g.addColorStop(1,'#3a2050');
  cx.fillStyle=g;cx.fillRect(camX-2,camY-2,vw+4,vh+4);
  STARS.forEach(([x,y,s,ph])=>{if(x<camX||x>camX+vw||y<camY||y>camY+vh)return;cx.globalAlpha=.35+.5*Math.abs(Math.sin(f*.03+ph));R('#e8e0ff',x,y,s,s)});cx.globalAlpha=1;
  for(let i=0;i<6;i++){const X=((f*.15*(1+i%3*.4)+i*330)%(AW3*T+400))-200,Y=(80+i*190)%(AH3*T);cx.globalAlpha=.08;R('#9a70d0',X,Y,260,18);R('#9a70d0',X+40,Y-8,160,10)}cx.globalAlpha=1;
  /* xích: đảo chính -> các đảo nhỏ, các đảo lớn -> lên trời */
  ISL3.forEach((I,i)=>{
    const a=Math.atan2(I[1]-MCY,I[0]-MCX),rx0=(MCX+Math.cos(a)*MRX*.9)*T,ry0=(MCY+Math.sin(a)*MRY*.9)*T+6;
    chain(rx0,ry0,I[0]*T,I[1]*T+Math.sin(f*.02+i)*2+8,14);
    if(i>=6)chain(I[0]*T,I[1]*T-I[3]*T,I[0]*T+(i===6?-60:60),-40,10)});
  ISL3.forEach(drawIsle);
  const x0=Math.max(0,Math.floor(camX/T)-1),x1=Math.min(AW3-1,x0+Math.ceil(vw/T)+3),y0=Math.max(0,Math.floor(camY/T)-1),y1=Math.min(AH3-1,y0+Math.ceil(vh/T)+3);
  drawMain(x0,x1,y0,y1);
  const ex=MCX*T+4,ey=84*T;
  eyeDoor(ex,ey);
  const P=pls3().find(p=>p.pl===sel);if(P&&nearExit(P)&&!PRJ.length)label(ex,ey-66,'E: Quay về Vực sâu','#ffd23f')}

function ring(x,y,r,c,a){cx.globalAlpha=a;for(let q=0;q<6.28;q+=.18)R(c,x+Math.cos(q)*r,y+Math.sin(q)*r*.6,2,1);cx.globalAlpha=1}
function drawGround(){
  ZON.forEach(z=>{
    if(z.k==='web'){
      const a=Math.min(1,(z.life-z.e)/1.5);cx.globalAlpha=.25*a;for(let j=-z.r*.6;j<=z.r*.6;j++){const w=Math.sqrt(Math.max(0,z.r*z.r-(j/.6)*(j/.6)));R('#e8e8f0',z.x-w,z.y+j,w*2,1)}
      cx.globalAlpha=.8*a;for(let k=0;k<8;k++){const q=k*.785;pln('#f4f4fa',z.x,z.y,z.x+Math.cos(q)*z.r,z.y+Math.sin(q)*z.r*.6,1)}
      ring(z.x,z.y,z.r*.4,'#f4f4fa',.8*a);ring(z.x,z.y,z.r*.7,'#f4f4fa',.8*a);ring(z.x,z.y,z.r,'#f4f4fa',.8*a);cx.globalAlpha=1}
    else if(z.k==='poison'){
      const a=Math.min(1,(z.life-z.e)/1.2);cx.globalAlpha=.55*a;
      for(let j=-z.r*.6;j<=z.r*.6;j++){const w=Math.sqrt(Math.max(0,z.r*z.r-(j/.6)*(j/.6)));R('#3a8a1a',z.x-w,z.y+j,w*2,1)}
      cx.globalAlpha=.7*a;for(let k=0;k<5;k++){const bx=z.x+Math.sin(k*2.1+z.e*2)*z.r*.6,by=z.y+Math.cos(k*1.7+z.e*2.3)*z.r*.35;R('#d4ff8a',bx,by-((frame>>2)+k)%4,2,2)}
      ring(z.x,z.y,z.r,'#8aff4a',.9*a);cx.globalAlpha=1}
    else if(z.k==='mark'){const p=z.e/z.d;ring(z.x,z.y,z.r,'#ff3b3b',.5+.4*Math.sin(frame*.5));ring(z.x,z.y,z.r*p,'#ffd23f',.8)}
    else if(z.k==='drop'){const p=z.e/z.d;cx.globalAlpha=.15+.2*p;for(let j=-z.r*.6;j<=z.r*.6;j++){const w=Math.sqrt(Math.max(0,z.r*z.r-(j/.6)*(j/.6)))*p;R('#8aff4a',z.x-w,z.y+j,w*2,1)}cx.globalAlpha=1;
      ring(z.x,z.y,z.r,'#8aff4a',.6+.3*Math.sin(frame*.4))}
    else if(z.k==='stab'){const p=z.e/z.d,a=1-p;cx.globalAlpha=a;
      for(let k=0;k<10;k++){const q=k*.628,rr=z.r*.75,sx=z.x+Math.cos(q)*rr,sy=z.y+Math.sin(q)*rr*.6,h=Math.sin(Math.min(1,p*3)*1.57)*22;
        for(let j=0;j<h;j++){const w=Math.max(1,Math.round(4*(1-j/h)));R(j<3?'#c0287a':'#1c0e24',sx-w/2,sy-j,w,1)}}
      cx.globalAlpha=1}});
  /* vòng đánh dấu khi boss đang trên không (nhảy biến mất) */
  if(B&&B.S==='leap'&&B.p===2&&B.d.m)B.d.m.forEach(m=>{const p=clamp(B.e/2.4,0,1);ring(m.x,m.y,m.r,'#ff3b3b',.5+.4*Math.sin(frame*.5));ring(m.x,m.y,m.r*p,'#ffd23f',.9)});
  BMB.forEach(b=>{
    cx.save();cx.translate(b.x,b.y-6);cx.rotate(b.a);
    if(b.t<b.tele){const p=b.t/b.tele;cx.globalAlpha=.2+.4*p;cx.fillStyle=b.col==='tail'?'#ff6a3a':'#ff3b3b';cx.fillRect(0,-b.w/2*(.3+.7*p),b.len,Math.max(1,b.w*(.3+.7*p)));
      cx.globalAlpha=.7;cx.fillStyle='#ffd23f';cx.fillRect(0,-.5,b.len,1)}
    cx.restore();cx.globalAlpha=1})}
function drawAir(){
  BMB.forEach(b=>{
    if(b.t<b.tele||b.t>=b.tele+b.fire+.15)return;
    const p=(b.t-b.tele)/b.fire,fade=p>.7?Math.max(0,1-(p-.7)/.3):1;
    cx.save();cx.translate(b.x,b.y-6);cx.rotate(b.a);
    if(b.col==='tail'){
      for(let u=0;u<b.len;u+=3){const w=b.w*.5*(1-u/b.len*.6),j=Math.sin(u*.2+frame*.8)*2;cx.globalAlpha=.9*fade;cx.fillStyle=u%9<3?'#e0602a':'#a8431f';cx.fillRect(u,j-w/2,3,w);
        cx.fillStyle='#e6b878';cx.fillRect(u,j+w/2-2,3,2)}}
    else{cx.globalCompositeOperation='lighter';
      for(let u=0;u<b.len;u+=3){const j=Math.sin(u*.3+frame*.6)*2;
        cx.globalAlpha=.25*fade;cx.fillStyle='#3a8a1a';cx.fillRect(u,j-b.w*.9,3,b.w*1.8);
        cx.globalAlpha=.6*fade;cx.fillStyle='#8aff4a';cx.fillRect(u,j-b.w*.5,3,b.w);
        cx.globalAlpha=fade;cx.fillStyle='#f4ffd0';cx.fillRect(u,j-b.w*.15,3,Math.max(1,b.w*.3))}}
    cx.restore();cx.globalAlpha=1});
  PRJ.forEach(p=>{
    if(p.k==='web'){const y=p.y-p.z;disc('#e8e8f0',Math.round(p.x),Math.round(y),4);disc('#ffffff',Math.round(p.x)-1,Math.round(y)-1,2);R('#cfcfe0',p.x-6,y,3,1);R('#cfcfe0',p.x+4,y+1,3,1)}
    else if(p.k==='pup'){const y=p.y-p.z;R('#3a8a1a',p.x-3,y,6,10);R('#8aff4a',p.x-2,y,4,6)}
    else if(p.k==='bul'){cx.globalAlpha=.4;R('#8aff4a',p.x-5,p.y-5,10,10);cx.globalAlpha=1;disc('#8aff4a',Math.round(p.x),Math.round(p.y),3);R('#f4ffd0',p.x-1,p.y-1,2,2)}});
  ZON.forEach(z=>{if(z.k!=='drop')return;const t=z.d-z.e;if(t<.4){const hh=t/.4*320,y=z.y-hh;R('#3a8a1a',z.x-4,y-10,8,12);R('#8aff4a',z.x-3,y-10,6,8)}});
  SK.forEach(s=>{
    if(s.life<2&&((frame>>2)&1))return;
    const x=Math.round(s.x),y=Math.round(s.y-s.z-Math.sin(frame*.1+s.ang)*2);
    R('rgba(0,0,0,.25)',x-5,s.y-1,10,2);cx.globalAlpha=.3;R('#7aff7a',x-8,y-9,16,14);cx.globalAlpha=1;
    R('#e8e4d0',x-5,y-8,10,8);R('#d0ccb8',x-4,y-1,8,3);R('#14101a',x-4,y-6,3,3);R('#14101a',x+1,y-6,3,3);R('#7aff7a',x-3,y-5,1,1);R('#7aff7a',x+2,y-5,1,1);
    R('#14101a',x-2,y+1,1,2);R('#14101a',x+1,y+1,1,2)});
  FX.forEach(f=>{cx.globalAlpha=Math.min(1,f.l/f.m*1.5);R(f.c,f.x,f.y-f.z,f.s,f.s)});cx.globalAlpha=1}

/* ---------- Sprite boss (vẽ ra canvas riêng rồi phóng 1.4x) ---------- */
const OFF=document.createElement('canvas');OFF.width=300;OFF.height=250;const OG=OFF.getContext('2d'),OX=150,OY=224;
function pl(g,c,x0,y0,x1,y1,w){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)/Math.max(1,w*.6)));g.fillStyle=c;
  for(let i=0;i<=n;i++){const t=i/n;g.fillRect(Math.round(x0+(x1-x0)*t-w/2),Math.round(y0+(y1-y0)*t-w/2),w,w)}}
function gdisc(g,c,x,y,r){g.fillStyle=c;for(let j=-r;j<=r;j++){const w=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));g.fillRect(Math.round(x-w),Math.round(y+j),w*2,1)}}
function legs(g,ox,oy,t,o){
  const cr=o.crouch*10,st=o.stab;
  for(let s=-1;s<=1;s+=2)for(let k=0;k<3;k++){
    const ph=Math.sin(t*.14+k*2.1+(s>0?1.6:0)),lift=o.mv?ph*7:ph*1.2,
      rx=s*(16+k*7),ry=-26+k*2+cr,kx=s*(36+k*10),ky=-56+k*8-lift+cr*.5,tx=s*(46+k*17),ty=-2-st*(k+1)*3;
    pl(g,'#0b060f',ox+rx,oy+ry,ox+kx,oy+ky,6);pl(g,'#1c0e24',ox+kx,oy+ky,ox+tx,oy+ty,5);
    pl(g,'#b02070',ox+kx+(tx-kx)*.55,oy+ky+(ty-ky)*.55,ox+tx,oy+ty,3)}}
function dome(g,ox,oy,o,c1,c2,c3){
  const cr=o.crouch*10;
  for(let yy=-58+cr;yy<=-14+cr;yy++){const u=(yy+14-cr)/44,hw=Math.round(34*Math.sqrt(Math.max(0,1-u*u)));
    g.fillStyle=c1;g.fillRect(ox-hw,oy+yy,hw*2,1);g.fillStyle=c2;g.fillRect(ox-hw+3,oy+yy,Math.max(1,hw-6),1);g.fillStyle=c3;g.fillRect(ox+hw-6,oy+yy,6,1)}}
function spiderHead(g,ox,oy,t,o,y0){
  const q=(c,a,b,w,h)=>{g.fillStyle=c;g.fillRect(ox+a,oy+y0+b,w,h)};
  q('#150818',-5,0,10,9);q('#0b050f',-5,0,10,1);q('#ff2a2a',-3,3,2,2);q('#ff2a2a',1,3,2,2);q('#ff2a2a',-1,6,2,2);
  pl(g,'#150818',ox-4,oy+y0,ox-10,oy+y0-12,2);pl(g,'#150818',ox+4,oy+y0,ox+10,oy+y0-12,2);
  pl(g,'#150818',ox-10,oy+y0-12,ox-12,oy+y0-6,2);pl(g,'#150818',ox+10,oy+y0-12,ox+12,oy+y0-6,2)}
function spider(g,ox,oy,t,o){
  legs(g,ox,oy,t,o);dome(g,ox,oy,o,'#2b1033','#43194d','#15081b');
  const cr=o.crouch*10;
  for(let i=0;i<4;i++){g.fillStyle='#1b0a22';g.fillRect(ox-14+i*8,oy-44+i*2+cr,2,12)}
  spiderHead(g,ox,oy,t,o,-68+Math.round(cr))}
function disc2(g,c,x,y,r){gdisc(g,c,x,y,r)}
function neck(g,c1,c2,x0,y0,x1,y1,cx0,cy0,r0,r1){
  const n=22;for(let i=0;i<=n;i++){const u=i/n,a=(1-u)*(1-u),b=2*(1-u)*u,d=u*u,x=a*x0+b*cx0+d*x1,y=a*y0+b*cy0+d*y1,r=r0+(r1-r0)*u;gdisc(g,i%4===2?c2:c1,x,y,Math.max(1,Math.round(r)))}}
function hhead(g,x,y,s,dx,open,t){
  const q=(c,a,b,w,h)=>{const px=dx>0?x+a*s:x-(a+w)*s;g.fillStyle=c;g.fillRect(Math.round(px),Math.round(y+b*s),Math.max(1,Math.round(w*s)),Math.max(1,Math.round(h*s)))};
  q('#b8481f',-6,-5,14,7);q('#d05a2a',-4,-5,10,2);q('#b8481f',8,-3,7,5);
  q('#7a2a14',-6,2+open,16,2);q('#f4f0e0',-3,2,2,2);q('#f4f0e0',2,2,2,2);q('#f4f0e0',7,1,2,2);
  q('#8a1030',6,3+open/2,10,2);q('#8a1030',14+Math.round(Math.sin(t*.3)),4+open/2,3,1);
  q('#f4f4f4',0,-4,4,3);q('#10101a',2,-4,2,2);q('#e6c890',-5,-9,2,4);q('#e6c890',-3,-11,2,3)}
const HEADS=[{a:-2.5,l:62,s:1.1},{a:-1.9,l:50,s:.9},{a:-.6,l:64,s:1.2},{a:.2,l:46,s:.8},{a:-1.2,l:38,s:.7}];
function hydra(g,ox,oy,t,o){
  for(let j=-14;j<=0;j++){const hw=Math.round(44*Math.sqrt(1-(j/14)*(j/14)));g.fillStyle='#8f3a1c';g.fillRect(ox-hw,oy-14+j,hw*2,1);g.fillStyle='#b0502a';g.fillRect(ox-hw+4,oy-14+j,hw,1)}
  for(let j=-10;j<=0;j++){const hw=Math.round(32*Math.sqrt(1-(j/10)*(j/10)));g.fillStyle='#a8431f';g.fillRect(ox-hw,oy-30+j,hw*2,1);g.fillStyle='#e6b878';if(j%3===0)g.fillRect(ox-hw+3,oy-30+j,6,1)}
  neck(g,'#a8431f','#e6b878',ox,oy-30,ox,oy-70,ox+6,oy-50,13,14);
  gdisc(g,'#b44a22',ox,oy-80,22);gdisc(g,'#c9562a',ox-5,oy-85,16);
  for(let i=0;i<9;i++){const a=i*.7,r=8+(i%3)*5;g.fillStyle=i%2?'#8f3a1c':'#e6b878';g.fillRect(Math.round(ox+Math.cos(a+t*.01)*r-1),Math.round(oy-80+Math.sin(a)*r*.8),3,2)}
  HEADS.forEach((h,i)=>{
    const sw=Math.sin(t*.05+i*1.7)*6,hx=ox+Math.cos(h.a)*h.l+sw,hy=oy-80+Math.sin(h.a)*h.l*.9+Math.cos(t*.04+i)*4;
    neck(g,'#c05a2c','#e6b878',ox+Math.cos(h.a)*10,oy-80+Math.sin(h.a)*8,hx,hy,ox+Math.cos(h.a)*h.l*.5+sw,oy-80+Math.sin(h.a)*h.l*.3-18,5,4);
    hhead(g,hx,hy,h.s,Math.cos(h.a)>=0?1:-1,2+Math.round(Math.sin(t*.1+i)*2+2),t)});
  neck(g,'#c05a2c','#e6b878',ox,oy-70,ox,oy-56,ox+2,oy-62,7,6);
  hhead(g,ox,oy-54,1.6,1,4+Math.round(Math.sin(t*.12)*2+2),t)}
function ironWings(g,ox,oy,t,py){
  for(let s=-1;s<=1;s+=2)for(let k=0;k<6;k++){
    const ang=-1.5708+s*(.3+k*.5)+Math.sin(t*.05+k)*.05,L=58-k*3+(k%2?8:0),x1=ox+Math.cos(ang)*L,y1=oy+py+Math.sin(ang)*L*.95;
    pl(g,k%2?'#2c303a':'#454b5a',ox,oy+py,x1,y1,4);
    pl(g,'#c0392b',ox+Math.cos(ang)*L*.78,oy+py+Math.sin(ang)*L*.95*.78,x1,y1,3)}}
function cryEye(g,ox,oy,t,py){
  const q=(c,a,b,w,h)=>{g.fillStyle=c;g.fillRect(ox+a,oy+py+b,w,h)};
  for(let j=-5;j<=5;j++){const w=Math.round(10*Math.sqrt(Math.max(0,1-(j*j)/36)));q('#6a1a1a',-w-1,j,w*2+2,1);q('#f6ece8',-w,j,w*2,1)}
  gdisc(g,'#d01030',ox,oy+py,4);q('#14040a',-1,-4,2,8);q('#ffffff',-3,-3,1,1);
  for(let i=0;i<4;i++){const d=((t*.8+i*11)%40),a=1-d/40;g.globalAlpha=a;q('#a00820',-5+(i%2?-1:1)*(i%2?4:5),5+d,2,4);q('#d01030',-5+(i%2?-1:1)*(i%2?4:5),5+d,1,2)}
  g.globalAlpha=1}
function chimera(g,ox,oy,t,o){
  ironWings(g,ox,oy,t,-70);legs(g,ox,oy,t,o);dome(g,ox,oy,o,'#240e2c','#3b1646','#12061a');
  for(let i=0;i<5;i++){g.fillStyle='#8a1030';g.fillRect(ox-18+i*9,oy-50+(i%2)*6,2,14)}
  [[-1,-.6],[1,-.6],[-1,-.2],[1,-.2]].forEach(([s,v],i)=>{
    const hx=ox+s*(48+i*8)+Math.sin(t*.05+i)*5,hy=oy-96-i*4+Math.cos(t*.04+i)*4;
    neck(g,'#7a2a30','#c0786a',ox+s*14,oy-52,hx,hy,ox+s*(46+i*4),oy-52-20,6,4);
    hhead(g,hx,hy,.9,s,2+Math.round(Math.sin(t*.1+i)*2+2),t)});
  spiderHead(g,ox,oy,t,o,-68);cryEye(g,ox,oy,t,-96)}
function paintBoss(){
  const g=OG;g.clearRect(0,0,OFF.width,OFF.height);g.imageSmoothingEnabled=false;
  const t=B.wig*60,o={mv:B.mv,crouch:B.crouch||0,stab:B.stab||0};
  (B.form===1?spider:B.form===2?hydra:chimera)(g,OX,OY,t,o);
  if(B.white>0){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,255,255,'+B.white.toFixed(3)+')';g.fillRect(0,0,OFF.width,OFF.height);g.globalCompositeOperation='source-over'}}
function drawBoss(){
  if(!B||B.S==='dead')return;
  const a=clamp(B.alpha,0,1);if(a<.03)return;
  const rw=[34,44,40][B.form-1]*SC,sa=Math.max(0,.3-B.z/700);
  cx.globalAlpha=sa*a;for(let j=-5;j<=5;j++){const w=Math.round(rw*Math.sqrt(1-(j*j)/36));R('#000',B.x-w,B.y+j,w*2,1)}cx.globalAlpha=1;
  paintBoss();
  const jx=B.shk?rnd(B.shk*2+1)-B.shk:0,jy=B.shk?rnd(B.shk*2+1)-B.shk:0;
  if(B.white>.2){cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=.3*B.white;
    const gr=cx.createRadialGradient(B.x,B.y-B.z-50,4,B.x,B.y-B.z-50,110);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'rgba(255,255,255,0)');
    cx.fillStyle=gr;cx.fillRect(B.x-110,B.y-B.z-160,220,220);cx.restore()}
  cx.save();cx.globalAlpha=a;cx.imageSmoothingEnabled=false;
  cx.translate(Math.round(B.x+jx),Math.round(B.y-B.z+jy));cx.scale((B.dir||1)*SC,SC);cx.drawImage(OFF,-OX,-OY);cx.restore();cx.globalAlpha=1}
function drawHud(){
  if(!B||B.S==='dead')return;
  cx.save();cx.setTransform(1,0,0,1,0,0);
  const x=70,y=18,w=360,h=10,f=B.form;
  cx.fillStyle='rgba(0,0,0,.65)';cx.fillRect(x-3,y-12,w+6,h+22);
  cx.fillStyle='#000';cx.fillRect(x-1,y-1,w+2,h+2);cx.fillStyle='#3a0a14';cx.fillRect(x,y,w,h);
  cx.fillStyle=BCOL[f-1];cx.fillRect(x,y,Math.round(w*Math.max(0,B.hp)/B.bmax),h);
  cx.fillStyle='rgba(255,255,255,.25)';cx.fillRect(x,y,Math.round(w*Math.max(0,B.hp)/B.bmax),2);
  cx.textAlign='center';cx.font='bold 8px monospace';cx.lineWidth=2;cx.strokeStyle='#000';
  cx.strokeText(BNAME[f-1]+'  '+Math.max(0,Math.ceil(B.hp))+'/'+B.bmax,CW/2,y-3);cx.fillStyle='#fff';cx.fillText(BNAME[f-1]+'  '+Math.max(0,Math.ceil(B.hp))+'/'+B.bmax,CW/2,y-3);
  for(let i=0;i<3;i++){cx.fillStyle='#000';cx.fillRect(CW/2-14+i*10-1,y+h+3,8,5);cx.fillStyle=i<f-1?'#555':i===f-1?BCOL[i]:'#2a2030';cx.fillRect(CW/2-14+i*10,y+h+4,6,3)}
  cx.restore()}

/* ================= MÓC VÀO GAME ================= */
const _di=drawIn;
drawIn=function(){
  if(curF===WIDA&&DOOR){
    _di();
    const p=doorPos();eyeDoor(p.x,p.y);
    const P=ins.find(q=>q.pl===sel&&q.fl===WIDA);
    if(P&&nearDoor(P)&&!TK)label(p.x,p.y-72,'E: Cánh cửa con mắt thiên thần','#ffd23f');
    return}
  if(curF!==WID3||!M3)return _di();
  drawBG();drawGround();drawBoss();
  _di();
  drawAir();drawHud()};

const SYNC=()=>{const P=ins.find(p=>p.pl===sel);return P&&P.fl===WID3?P:null};
function snap3(){const P=SYNC();if(!P)return;
  camX=clamp(P.x-CW/IS/2,0,AW3*T-CW/IS);camY=clamp(P.y-CH/IS/2,0,AH3*T-CH/IS)}
const _sv=syncView;syncView=function(s){_sv(s);if(SYNC()){IS=CW/VW3;if(s)snap3()}};
const _cam=cam;cam=function(){
  if(inside&&curF===WID3){const P=ins.find(p=>p.pl===sel)||ins.find(p=>p.pl);if(!P)return;
    camX+=(clamp(P.x-CW/IS/2,0,AW3*T-CW/IS)-camX)*.15;camY+=(clamp(P.y-CH/IS/2,0,AH3*T-CH/IS)-camY)*.15;return}
  _cam()};
/* vùng tơ nhện làm chậm người chơi */
const _ctrl=ctrl;ctrl=function(){
  const P=ins.find(p=>p.pl===sel&&p.fl===WID3);
  if(!P||!ZON.some(z=>z.k==='web')){_ctrl();return}
  const ox=P.x,oy=P.y;_ctrl();
  if(ZON.some(z=>z.k==='web'&&Math.hypot(P.x-z.x,P.y-z.y)<z.r)){P.x=ox+(P.x-ox)*.4;P.y=oy+(P.y-oy)*.4;P.tx=P.x;P.ty=P.y}};

addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat||e.key.toLowerCase()!=='e'||e.ctrlKey||e.metaKey||e.altKey)return;
  if(state!=='island'||TK||trans)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const P=allPl().find(p=>p.pl===sel);if(!P)return;
  if(nearDoor(P)){const n=P.pl;
    window.abyssAsk('Cánh cửa đá có một con mắt thiên thần đang nhìn bạn. Phía sau là một hòn đảo bay khổng lồ. Bạn có muốn bước vào không?',
      [['Bước vào',()=>{cap('P'+n+' bước qua cánh cửa con mắt...');window.worldTransfer(n,'skyboss')}],['Chưa',()=>{}]])}
  else if(nearExit(P)){const n=P.pl;
    window.abyssAsk('Bạn có muốn quay lại Vực sâu không?',[['Quay lại',()=>{window.worldTransfer(n,'abyssIsl')}],['Chưa',()=>{}]])}});

const _step=step;step=function(){
  _step();if(state!=='island')return;
  try{tick(Math.min(.25,DM||.016))}catch(e){console.error('skyboss tick',e)}};
const _gen=gen;gen=function(sd){_gen(sd);build3();placeDoor()};
const _mk=mkPeople;mkPeople=function(){_mk();DONE=false;try{localStorage.removeItem(DKEY)}catch(_){}B=null;PRJ=[];ZON=[];BMB=[];SK=[];FX=[];build3();placeDoor()};
build3();placeDoor();
})();