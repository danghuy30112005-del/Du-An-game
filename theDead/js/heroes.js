/* ===== Skyland.js: KHÓA CỬA SKYBOSS + ICON ĐỒ + CẮT CẢNH MỞ TƯỜNG + KHU RỪNG MÂY + SKYLAND =====
   Nạp CUỐI CÙNG trong deadisland.html (sau heroes.js):  <script src="../js/Skyland.js"></script>
   - Cửa con mắt (tới đảo bay boss) bị khóa: cần "Chìa khóa Thiên giới" (sentkey) trong túi.
   - Icon Dao phép / Thanh kiếm thánh trong túi đồ vẽ giống lúc cầm.
   - Diệt boss nấm rồi lên Vực sâu: cắt cảnh tia sáng bắn nổ bức tường phía đông, mở đường tới KHU RỪNG MÂY (tầng 24).
   - Khu Rừng Mây có cổng vòm hoàng hôn (như ảnh 4) dẫn tới SKYLAND (tầng 25: đảo bay, cầu treo, tháp, tàu, nấm khổng lồ). */
(()=>{
if(typeof putIn!=='function'||typeof syncView!=='function'||!window.WORLDS||!window.WORLDS.abyssW||typeof window.abyssAsk!=='function'||typeof window.worldTransfer!=='function'||typeof window.ABYSS!=='function'){console.warn('Skyland.js: hãy nạp CUỐI CÙNG (sau Abyss2.js)');return}
const WA=21,WM=24,WS=25,WALL=62,VW=560,GK='deadisland:gwall',INV='deadisland:inv1';
const WORLDS=window.WORLDS,AR={};
const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),w,h)};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hasKey=n=>{try{return JSON.parse(localStorage.getItem(INV))[n].includes('sentkey')}catch(_){return false}};
let CS=null,GW={open:0,s:null,ex:0,y:0,xe:0},PT=[],LKC=null;
function disc(c,x,y,r){cx.fillStyle=c;r=Math.max(1,Math.round(r));const st=r>14?2:1;for(let j=-r;j<=r;j+=st){const w=Math.round(Math.sqrt(r*r-j*j));cx.fillRect(Math.round(x-w),Math.round(y+j),w*2,st)}}
const CP=[[0,0,12],[14,-5,15],[31,0,12],[-12,3,9],[43,4,8],[17,5,11]];
function cloud(x,y,s,a){cx.globalAlpha=a;CP.forEach(([dx,dy,r])=>disc('#cfe0f2',x+dx*s,y+(dy+3)*s,r*s));CP.forEach(([dx,dy,r])=>disc('#ffffff',x+dx*s,y+(dy-1)*s,r*s*.92));cx.globalAlpha=1}
function label(x,y,t,col){cx.save();cx.textAlign='center';cx.font='bold 6px monospace';const w=Math.ceil(cx.measureText(t).width)+6,bx=Math.round(x-w/2),by=Math.round(y);cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(bx,by,w,9);cx.fillStyle=col||'#ffd23f';cx.fillRect(bx,by+9,w,1);cx.fillStyle='#fff';cx.fillText(t,Math.round(x),by+7);cx.restore()}

/* ================= 1. KHÓA CỬA CON MẮT (đảo bay boss) ================= */
const _aa=window.abyssAsk;
window.abyssAsk=function(t,o){
  if(/con mắt thiên thần/.test(t)&&/đảo bay khổng lồ/.test(t)){
    if(!hasKey(sel)){cap('Cánh cửa bị khóa bằng ổ khóa thánh. Cần Chìa khóa Thiên giới để mở (giúp Angel Sentinel, rồi lấy chìa ở bệ đá cuối phía đông hang).');return}
    t='Chìa khóa Thiên giới trong túi phát sáng, ổ khóa trên cửa tự tan ra. '+t}
  return _aa(t,o)};
const _wt=window.worldTransfer;
window.worldTransfer=function(n,id){
  if(id==='skyboss'&&!hasKey(n)){cap('Cánh cửa con mắt vẫn bị khóa chặt.');return false}
  return _wt(n,id)};
function doorPos(){
  const A=window.ABYSS();if(!A||!A.ISL||!A.mt)return null;const I=A.ISL[2];let b=null,bd=1e9;
  for(let y=Math.floor(I.cy-I.ry);y<=Math.ceil(I.cy+I.ry);y++)for(let x=Math.floor(I.cx-I.rx);x<=Math.ceil(I.cx+I.rx);x++){
    const q=A.mt.get(y*300+x);
    if(q&&q.k==='i'&&q.i===2&&A.im[y][x]===WALL&&A.ob[y][x]){const d=Math.hypot(x-(I.cx-2.5),y-(I.cy-1.2));if(d<bd){bd=d;b=[x,y]}}}
  return b&&{x:b[0]*T+4,y:(b[1]+1)*T-(I.h+I.amp*Math.sin(frame*I.sp+I.ph))}}
function lockDraw(){
  if(hasKey(sel))return;
  if(frame%30===0||!LKC)LKC=doorPos();
  if(!LKC)return;const x=LKC.x,y=LKC.y;
  cx.save();cx.strokeStyle='#8a909a';cx.lineWidth=2;cx.setLineDash([3,2]);
  cx.beginPath();cx.moveTo(x-13,y-40);cx.lineTo(x+13,y-6);cx.moveTo(x+13,y-40);cx.lineTo(x-13,y-6);cx.stroke();cx.restore();
  cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=.18+.1*Math.sin(frame*.08);R('#ffd23f',x-10,y-32,20,18);cx.restore();cx.globalAlpha=1;
  R('#cfd6e3',x-4,y-34,2,9);R('#cfd6e3',x+2,y-34,2,9);R('#cfd6e3',x-4,y-35,8,2);
  R('#8a6a1f',x-6,y-26,12,11);R('#ffd23f',x-5,y-25,10,9);R('#fff3a0',x-5,y-25,10,1);R('#3a2a08',x-1,y-22,2,4)}

/* ================= 2. ICON ĐỒ TRONG TÚI GIỐNG LÚC CẦM ================= */
const ART={
 'Dao phép':[16,28,g=>{const P=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
   P('#e8f6ff',7,1,1,1);P('#e8f6ff',7,2,1,14);P('#8fc4e4',8,3,1,13);P('#ffffff',7,3,1,4);
   P('#d4a63a',4,16,8,2);P('#f4d870',4,16,8,1);P('#3a2a22',7,18,2,6);P('#d4a63a',6,24,4,2)}],
 'Thanh kiếm thánh':[24,32,g=>{const P=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
   for(let i=0;i<5;i++){const c=i%2?'#ffffff':'#e6eefb',l=3+i;P(c,8-i*2,17-l,2,l);P(c,14+i*2,17-l,2,l)}
   P('#ff7a1a',11,3,3,14);P('#ffd23f',12,2,1,14);P('#ffb02e',12,0,1,3);P('#fff3a0',12,6,1,3);
   P('#8a6a3a',8,17,8,2);P('#b8864f',8,17,8,1);P('#2f9bd6',11,17,2,2);
   P('#4a3a2a',11,19,2,6);P('#7a6a50',11,21,2,1);P('#b8864f',10,25,4,1);P('#2f9bd6',11,26,2,2)}]};
function skin(){
  const g=$('invGrid');if(!g)return;
  [...g.children].forEach(s=>{const f=ART[s.getAttribute('aria-label')];if(!f||s.querySelector('canvas'))return;
    const c=document.createElement('canvas');c.width=f[0];c.height=f[1];f[2](c.getContext('2d'));
    [...s.childNodes].forEach(n=>{if(n.nodeType===3)n.remove()});s.insertBefore(c,s.firstChild)})}
const sty=document.createElement('style');
sty.textContent='#invGrid .slot canvas{height:88%;width:auto;image-rendering:pixelated;pointer-events:none;display:block}';
document.head.appendChild(sty);
if($('invGrid')){new MutationObserver(skin).observe($('invGrid'),{childList:true});skin()}

/* ================= 3. ENGINE KHU VỰC MỚI (mây, đảo, cầu, vật thể) ================= */
const grid=(W,H,v)=>Array.from({length:H},()=>Array(W).fill(v));
function Area(wid,W,H,sky,name){return{wid,W,H,sky,name,im:grid(W,H,WALL),rid:grid(W,H,0),mk:grid(W,H,0),rs:grid(W,H,0),objs:[],und:[],cl:[],arch:null}}
const fl=(A,x,y,t)=>{if(x>1&&y>1&&x<A.W-2&&y<A.H-2){A.im[y][x]=0;A.rid[y][x]=1;A.mk[y][x]=t||1}};
const gnd=(A,x,y)=>{const v=A.mk[y]&&A.mk[y][x];return v>0&&v!==3&&v!==6};
const inI=(x,y,a,b,rx,ry)=>Math.hypot((x+.5-a)/rx,(y+.5-b)/ry)<1;
function isle(A,c0,c1,rx,ry,k){
  for(let y=Math.floor(c1-ry*1.3);y<=c1+ry*1.3;y++)for(let x=Math.floor(c0-rx*1.3);x<=c0+rx*1.3;x++){
    const a=Math.atan2((y+.5-c1)/ry,(x+.5-c0)/rx),r=1+.09*Math.sin(3*a+k)+.06*Math.sin(5*a+2*k)+.04*Math.sin(9*a+k);
    if(Math.hypot((x+.5-c0)/rx,(y+.5-c1)/ry)/r<1)fl(A,x,y,1)}}
function lake(A,c0,c1,rx,ry){for(let y=Math.floor(c1-ry);y<=c1+ry;y++)for(let x=Math.floor(c0-rx);x<=c0+rx;x++)if(inI(x,y,c0,c1,rx,ry)&&A.mk[y][x]===1){A.mk[y][x]=4;A.im[y][x]=WALL;A.rid[y][x]=0}}
const walkPts=(pts,f)=>{for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i],n=Math.max(Math.abs(c-a),Math.abs(d-b))||1;for(let j=0;j<=n;j++)f(a+Math.round((c-a)*j/n),b+Math.round((d-b)*j/n))}};
const rsv=(A,x,y,r)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(A.rs[y+j])A.rs[y+j][x+i]=1};
function path(A,pts){walkPts(pts,(x,y)=>{for(let j=0;j<2;j++)for(let i=0;i<2;i++)if(A.mk[y+j]&&A.mk[y+j][x+i]===1)A.mk[y+j][x+i]=2;rsv(A,x,y,2)})}
function bridge(A,pts){for(let i=1;i<pts.length;i++){const hor=Math.abs(pts[i][0]-pts[i-1][0])>=Math.abs(pts[i][1]-pts[i-1][1]);
  walkPts([pts[i-1],pts[i]],(x,y)=>{for(let k=0;k<2;k++){const X=hor?x:x+k,Y=hor?y+k:y;if(A.mk[Y][X]===0)fl(A,X,Y,hor?3:6)}rsv(A,x,y,3)})}}
function plaza(A,x0,y0,x1,y1,t){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){fl(A,x,y,t||7);A.rs[y][x]=1}}
const blockC=(A,x,y)=>{A.im[y][x]=WALL;A.rid[y][x]=0};
function obj(A,k,x,y,h,w){if(A.im[y][x]!==0)return;blockC(A,x,y);A.objs.push({k,x,y,ax:x*T+4,ay:(y+1)*T,h,w,blk:1})}
function archAt(A,x,y){for(let d=-1;d<=1;d++)blockC(A,x+d,y);A.objs.push({k:'arch',x,y,ax:x*T+4,ay:(y+1)*T,h:70,w:44,blk:1});A.arch={x,y}}
function bigAt(A,k,x,y,half,rows,h,w){for(let r=0;r<rows;r++)for(let d=-half;d<=half;d++)blockC(A,x+d,y-r);A.objs.push({k,x,y,ax:x*T+4,ay:(y+1)*T,h,w,blk:1})}
function scatter(A,k,pr,h,w,sd,ok){
  for(let y=3;y<A.H-3;y++)for(let x=3;x<A.W-3;x++){
    if(A.mk[y][x]!==1||A.rs[y][x]||A.im[y][x]!==0||hs(x*5+sd,y*11+sd)%1000>=pr)continue;
    if(!(gnd(A,x-1,y)&&gnd(A,x+1,y)&&gnd(A,x,y+1)&&gnd(A,x,y-1)&&gnd(A,x,y+2)))continue;
    if(ok&&!ok(x,y))continue;obj(A,k,x,y,h,w)}}
function bottomOf(A,x){for(let y=A.H-2;y>0;y--)if(A.mk[y][x]>0&&A.mk[y][x]<3)return y;return 0}
const wfAt=(A,x)=>{const y=bottomOf(A,x);A.objs.push({k:'wf',x,y,ax:x*T+4,ay:(y+1)*T,h:0,w:0,blk:0})};
function finish(A,nc){
  for(let x=0;x<A.W;x++){let th=0;
    for(let y=0;y<A.H;y++){const g=gnd(A,x,y);th=g?th+1:0;
      if(g&&!gnd(A,x,y+1)){A.und.push([x,y,Math.round(8+Math.min(th,18)*2.8+hs(x,y)%5)]);th=0}}}
  for(let i=0;i<nc;i++)A.cl.push({x:hs(i,11)%(A.W*T),y:hs(i,23)%(A.H*T),s:1+(hs(i,31)%100)/60,sp:.06+(hs(i,41)%100)/900,f:i%5===0});
  A.objs.sort((a,b)=>a.ay-b.ay);
  A.fl={im:A.im,rid:A.rid,RM:[null,{n:A.name,f:['rgba(0,0,0,0)','rgba(0,0,0,0)'],x0:0,y0:0,x1:A.W-1,y1:A.H-1,s:1}]};
  FL[A.wid]=A.fl;return A}

/* ---------- vẽ ô ---------- */
function tileA(A,x,y){
  const t=A.mk[y][x];if(!t)return;
  const h=hs(x,y),px=x*T,py=y*T,Q=(c,a,b,w,hh)=>R(c,px+a,py+b,w,hh),
    G=(dx,dy)=>gnd(A,x+dx,y+dy),B=(dx,dy)=>{const v=A.mk[y+dy]&&A.mk[y+dy][x+dx];return v===3||v===6};
  if(t===3||t===6){
    Q('#6e4422',0,0,T,T);
    if(t===3){Q('#a8743f',0,0,T-1,T);Q('#c08a52',0,0,1,T)}else{Q('#a8743f',0,0,T,T-1);Q('#c08a52',0,0,T,1)}
    if(t===3){
      if(!B(0,-1)){Q('#5a3a1e',0,-4,T,1);Q('#d8c8a0',0,-3,T,1);if(x%4===0)Q('#3a2410',2,-6,2,8)}
      if(!B(0,1)){Q('#5a3a1e',0,T-1,T,1);if(x%4===0)Q('#3a2410',2,T-6,2,7)}}
    else{
      if(!B(-1,0)){Q('#5a3a1e',0,0,1,T);if(y%4===0)Q('#3a2410',-1,0,3,2)}
      if(!B(1,0)){Q('#5a3a1e',T-1,0,1,T);if(y%4===0)Q('#3a2410',T-2,0,3,2)}}
    return}
  if(t===4){
    const w=Math.sin(x*.8+y*.6+frame*.06)+Math.sin(x*.35-y*.9+frame*.04),W4=(dx,dy)=>A.mk[y+dy]&&A.mk[y+dy][x+dx]===4;
    Q(w>.9?'#58b8e8':w<-1?'#2f86c0':'#3f9ad4',0,0,T,T);
    if((x*3+y*5+(frame>>3))%9===0)Q('#d8f4ff',(h>>3)&5,(h>>6)&5,3,1);
    if(!W4(0,-1))Q('#e8f6ff',0,0,T,1);if(!W4(-1,0))Q('#bfe6ff',0,0,1,T);if(!W4(1,0))Q('#bfe6ff',T-1,0,1,T);return}
  let base;
  if(t===2)base=h%2?'#b8895a':'#aa7a4e';
  else if(t===7)base=(x+y)%2?'#a6a8bc':'#9a9cb2';
  else{const n=Math.sin(x*.19+1)+Math.sin(y*.26)+Math.sin((x+y)*.12);base=n>1.1?['#78c850','#82d058'][h%2]:n<-1.2?['#3e8f34','#44963a'][h%2]:['#52b043','#4aa63c','#5cba48'][h%3]}
  Q(base,0,0,T,T);
  if(t===1){if(h%5===0)Q('#2f7a2c',(h>>3)&6,(h>>6)&5,1,2);if(h%9===0)Q('#8ee068',(h>>4)&7,(h>>8)&7,1,1);
    if(h%19===0)Q(['#ff8ab8','#fff0a0','#ffffff','#b090ff'][h%4],(h>>5)&6,(h>>9)&6,2,2)}
  else if(t===2){if(h%4===0)Q('#8a6038',(h>>3)&6,(h>>6)&6,1,1);if(h%7===0)Q('#d0a070',(h>>4)&6,(h>>8)&6,2,1)}
  else{if(h%6===0)Q('#7a7c92',(h>>3)&5,(h>>6)&6,3,1);if(h%11===0)Q('#c8cadc',(h>>4)&6,(h>>8)&6,1,1)}
  if(!G(0,-1))Q(t===2?'#d0a070':t===7?'#c0c2d6':'#9ee878',0,0,T,1);
  if(!G(-1,0))Q('rgba(0,0,0,.18)',0,0,1,T);if(!G(1,0))Q('rgba(0,0,0,.18)',T-1,0,1,T);
  if(!G(0,1))Q(t===7?'#5a5c74':'#3a8f30',0,T-2,T,2)}

/* ---------- vẽ vật thể ---------- */
const OD={
tree(o){const x=o.ax,y=o.ay,h=hs(o.x,o.y),s=Math.round(Math.sin(frame*.03+o.x)*.8),c=h%3?['#276b2c','#3d9a3e','#7ed36a']:['#2a7a52','#42b072','#8ee0a8'];
  R('rgba(0,0,0,.22)',x-8,y-2,16,3);R('#5a3a22',x-2,y-11,4,11);R('#3a2414',x+1,y-11,1,11);
  disc(c[0],x+s,y-20,10);disc(c[1],x-1+s,y-22,8);disc(c[2],x-3+s,y-25,4);
  if(h%6===0){R('#e8453a',x+3+s,y-19,2,2);R('#e8453a',x-5+s,y-23,2,2)}},
pine(o){const x=o.ax,y=o.ay;R('rgba(0,0,0,.22)',x-6,y-2,12,3);R('#4a2f17',x-1,y-6,3,6);
  for(let j=0;j<27;j++){const w=Math.round(2+(j%9)*1.1+((j/9)|0)*2);R((j%9)<2?'#34925a':(j>>2)&1?'#1d5a38':'#2a7a48',x-w,y-33+j,w*2,1)}R('#8be0a0',x-1,y-32,1,3)},
mush(o){const x=o.ax,y=o.ay,k=hs(o.x,o.y)%3,hw0=9+k*2;
  R('rgba(0,0,0,.22)',x-9,y-2,18,3);R('#efe6d0',x-3,y-13,6,13);R('#cfc4aa',x+1,y-13,2,13);
  for(let j=0;j<11;j++){const hw=Math.round(hw0*Math.sqrt(1-Math.pow((10-j)/11,2)));R(j<2?'#f0604a':'#d8402c',x-hw,y-25+j,hw*2,1);R('#a8281c',x+hw-3,y-25+j,3,1)}
  R('#fff',x-5,y-22,2,2);R('#fff',x+3,y-20,3,2);R('#fff',x-1,y-17,2,2)},
rock(o){const x=o.ax,y=o.ay;R('rgba(0,0,0,.22)',x-7,y-2,14,3);disc('#6a7080',x,y-5,6);disc('#8d93a3',x-1,y-6,5);disc('#b9bfce',x-2,y-8,2)},
tower(o){const x=o.ax,y=o.ay;R('rgba(0,0,0,.3)',x-27,y-3,54,5);
  R('#8d93aa',x-22,y-40,44,40);R('#6e7490',x+12,y-40,10,40);R('#b6bcd0',x-22,y-40,3,40);for(let j=6;j<40;j+=6)R('#767c96',x-22,y-40+j,44,1);
  R('#2a2c44',x-14,y-30,5,9);R('#2a2c44',x+9,y-30,5,9);R('#3a2a22',x-5,y-16,10,16);R('#a67c4a',x-4,y-15,8,15);R('#ffd23f',x+2,y-8,1,2);
  R('#a8aec2',x-26,y-43,52,3);R('#6e7490',x-26,y-40,52,1);
  R('#9aa0b8',x-16,y-72,32,29);R('#727894',x+8,y-72,8,29);R('#2a2c44',x-9,y-62,4,8);R('#2a2c44',x+5,y-62,4,8);R('#a8aec2',x-19,y-75,38,3);
  R('#a6acc2',x-10,y-93,20,19);R('#7e84a0',x+5,y-93,5,19);R('#2a2c44',x-2,y-86,4,7);R('#a8aec2',x-13,y-96,26,3);
  for(let j=0;j<22;j++){const hw=Math.round(12*Math.sqrt(1-Math.pow((21-j)/22,2)));R(j<3?'#e0505a':'#c0283a',x-hw,y-118+j,hw*2,1);R('#8a1a28',x+hw-4,y-118+j,4,1);R('#e87a82',x-hw+2,y-118+j,2,1)}
  R('#c8ccd8',x,y-130,1,12);R('#e04a3a',x+1,y-130,5,3)},
ship(o){const x=o.ax,y=o.ay;R('rgba(0,0,0,.25)',x-30,y-3,60,4);
  for(let j=0;j<12;j++){const hw=Math.round(28-j*1.1);R(j<2?'#b07a4a':j%4<2?'#7a4a24':'#8a5a30',x-hw,y-14+j,hw*2,1)}
  R('#5a3a1e',x-26,y-16,52,2);R('#d8c090',x-26,y-16,52,1);
  R('#4a2f17',x-9,y-64,2,50);R('#4a2f17',x+9,y-56,2,42);R('#4a2f17',x+20,y-26,10,2);
  for(let j=0;j<34;j++){const w=Math.round(12+Math.sin(j/34*3.14)*5);R(j<2?'#fff0c8':j%6<1?'#a8452e':'#e0c08a',x-9-w,y-62+j,w,1)}
  for(let j=0;j<28;j++){const w=Math.round(9+Math.sin(j/28*3.14)*5);R(j<2?'#fff0c8':j%6<1?'#a8452e':'#d8b078',x+11,y-54+j,w,1)}
  R('#e04a3a',x-7,y-66,8,3)},
arch(o){const x=o.ax,y=o.ay,f=frame,top=y-68;
  const gl=cx.createRadialGradient(x,y-34,4,x,y-34,60);gl.addColorStop(0,'rgba(255,140,170,.4)');gl.addColorStop(1,'rgba(255,140,170,0)');cx.fillStyle=gl;cx.fillRect(x-60,y-96,120,120);
  for(let j=0;j<66;j++){const hw=(j<14?Math.round(Math.sqrt(196-(14-j)*(14-j))):14)+5;R(j%8===3?'#3a3452':'#4c4670',x-hw,top+j,hw*2,1);R('#ff8aa8',x-hw,top+j,1,1);R('#8a6aa0',x+hw-1,top+j,1,1)}
  for(let j=0;j<63;j++){const hw=j<14?Math.round(Math.sqrt(196-(14-j)*(14-j))):14,p=j/63;R(p<.28?'#2a3f9a':p<.55?'#e8788c':p<.8?'#ffae6a':'#8a52b0',x-hw,top+3+j,hw*2,1)}
  for(let i=0;i<6;i++)disc(i%2?'#ffd9a0':'#fff0d0',x-9+((i*7+f*.15)%18),top+26+i*6,3+(i%2));
  disc('#fffbe0',x+2,top+13,3);cx.globalAlpha=.3;disc('#fffbe0',x+2,top+13,6);cx.globalAlpha=1;
  R('#fff',x-5,top+8,1,1);R('#fff',x+7,top+20,1,1);R('#6a6488',x-26,y-3,52,3);R('#8a84a8',x-26,y-3,52,1)},
mouth(o){const x=o.ax,y=o.ay;R('#4a4668',x-16,y-26,5,26);R('#4a4668',x+11,y-26,5,26);R('#8a84a8',x-16,y-26,2,26);R('#59658a',x-18,y-30,36,5);R('#8a84a8',x-18,y-30,36,1);
  cx.globalAlpha=.25+.1*Math.sin(frame*.08);R('#8a63e0',x-11,y-25,22,25);cx.globalAlpha=1},
wf(o){const x=o.ax,t=(o.y+1)*T;cx.globalAlpha=.85;R('#bfeaff',x-3,t-2,6,66);
  for(let i=0;i<64;i+=4){const k=(i+frame*2)%24;if(k<10)R('#ffffff',x-3+((i>>2)&1)*3,t+i,3,4)}
  cx.globalAlpha=.3;disc('#ffffff',x,t+66,8);disc('#e8f8ff',x+6,t+62,5);cx.globalAlpha=1}};

/* ---------- vẽ khu vực ---------- */
function clouds(A,front){
  const W2=A.W*T+480,vw=CW/IS,vh=CH/IS;
  A.cl.forEach(c=>{if(!!c.f!==!!front)return;const x=((c.x+frame*c.sp)%W2)-240;
    if(x<camX-70*c.s||x>camX+vw+70*c.s||c.y<camY-40*c.s||c.y>camY+vh+40*c.s)return;cloud(x,c.y,c.s,front?.5:.92)})}
function drawArea(A){
  const vw=CW/IS,vh=CH/IS,x0=Math.max(0,Math.floor(camX/T)-1),y0=Math.max(0,Math.floor(camY/T)-1),x1=Math.min(A.W-1,x0+Math.ceil(vw/T)+3),y1=Math.min(A.H-1,y0+Math.ceil(vh/T)+4);
  const g=cx.createLinearGradient(0,camY,0,camY+vh);g.addColorStop(0,A.sky[0]);g.addColorStop(1,A.sky[1]);cx.fillStyle=g;cx.fillRect(camX-2,camY-2,vw+4,vh+4);
  clouds(A,0);
  A.und.forEach(([x,y,d])=>{if(x<x0||x>x1||y<y0-10||y>y1)return;
    const b=(y+1)*T,h=hs(x,y),m=Math.round(d*.5);
    R('#9a5a48',x*T,b,T,Math.min(d,4));R('#7a3f3c',x*T,b+4,T,Math.max(0,m-4));R('#4d2a30',x*T,b+m,T,d-m);
    if(h%3===0)R('#b87a60',x*T+2,b+3,1,Math.round(d*.4));if(h%4===0)R('#3f8f3a',x*T+(h&5),b-1,2,3+h%4)});
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)tileA(A,x,y);
  const lx=x0*T-60,rx=x1*T+60,ty=y0*T-30,by=y1*T+160;
  A.objs.forEach(o=>{if(o.ax<lx||o.ax>rx||o.ay<ty||o.ay>by)return;OD[o.k](o)})}
const nearArch=(P,A)=>A.arch&&Math.hypot(P.x-(A.arch.x*T+4),P.y-((A.arch.y+2)*T))<26;
function drawFront(A){
  const L=ins.filter(p=>p.fl===A.wid);
  A.objs.forEach(o=>{if(!o.blk||o.h<14)return;if(L.some(q=>q.y<o.ay-1&&q.y>o.ay-o.h-4&&Math.abs(q.x-o.ax)<o.w/2))OD[o.k](o)});
  clouds(A,1);
  const P=L.find(q=>q.pl===sel);
  if(P&&nearArch(P,A))label(A.arch.x*T+4,A.arch.y*T-66,A.lab,'#ffd0e8')}

/* ================= 4. HAI KHU VỰC ================= */
function buildMeadow(){
  const A=Area(WM,240,150,['#5fb8ea','#cfeefa'],'Khu Rừng Mây');
  isle(A,120,74,82,48,1.3);
  [[34,38,14,8,2],[208,34,16,9,3],[206,118,14,8,4],[36,118,15,8,5],[122,16,12,6,6],[176,134,10,6,7],[78,134,9,5,8]].forEach(a=>isle(A,...a));
  for(let y=70;y<=75;y++)for(let x=38;x<=48;x++){fl(A,x,y,1);A.rs[y][x]=1}
  lake(A,98,86,15,8);lake(A,150,64,9,5);
  path(A,[[38,72],[62,72],[88,66],[112,52],[120,40],[120,37]]);
  plaza(A,111,28,129,37);archAt(A,120,31);
  A.objs.push({k:'mouth',x:40,y:73,ax:40*T+4,ay:74*T,h:0,w:0,blk:0});
  scatter(A,'tree',90,26,22,1);scatter(A,'pine',25,33,16,2);scatter(A,'mush',9,26,22,3);scatter(A,'rock',12,14,14,4);
  [66,170,34,208].forEach(x=>wfAt(A,x));
  A.ask='Cổng đá khổng lồ mở ra một bầu trời hoàng hôn rực rỡ. Bạn có muốn bước vào Skyland không?';A.yes='Bước vào';A.dest='skyland';A.lab='E: Cổng tới Skyland';
  return finish(A,36)}
function buildSky(){
  const A=Area(WS,240,200,['#62bfe8','#d6effa'],'Skyland');
  isle(A,130,165,54,26,1.1);isle(A,45,110,36,15,2.2);isle(A,200,118,34,15,3.3);isle(A,120,72,40,20,4.4);isle(A,40,48,16,8,5);isle(A,205,46,18,9,6);
  const DEC=[[18,150,10,6],[222,160,10,6],[88,22,12,6],[176,26,10,5],[24,84,8,4],[225,84,9,5],[70,184,8,4],[196,188,9,5]];
  DEC.forEach((a,i)=>isle(A,a[0],a[1],a[2],a[3],i+7));
  lake(A,208,120,12,6);lake(A,135,80,10,5);
  path(A,[[118,157],[100,168],[78,170]]);path(A,[[124,158],[150,164],[182,165]]);
  path(A,[[62,121],[56,114],[50,101]]);path(A,[[200,131],[200,118],[200,106]]);
  path(A,[[84,72],[100,68],[112,64]]);path(A,[[156,76],[140,72],[128,66]]);
  bridge(A,[[62,122],[62,170],[82,170]]);bridge(A,[[180,165],[200,165],[200,130]]);
  bridge(A,[[50,100],[50,72],[84,72]]);bridge(A,[[200,108],[200,76],[156,76]]);
  bridge(A,[[48,56],[48,72]]);bridge(A,[[200,55],[200,76]]);
  for(let y=85;y<=bottomOf(A,135);y++)for(let i=0;i<2;i++)if(A.mk[y][135+i]===1){A.mk[y][135+i]=4;A.im[y][135+i]=WALL;A.rid[y][135+i]=0}
  plaza(A,112,150,124,157);archAt(A,118,151);
  plaza(A,108,62,132,70);bigAt(A,'tower',120,61,2,2,130,50);
  bigAt(A,'ship',45,111,3,2,64,58);
  scatter(A,'pine',70,33,16,1,(x,y)=>inI(x,y,130,165,54,26)||inI(x,y,205,46,18,9));
  scatter(A,'tree',70,26,22,2,(x,y)=>inI(x,y,45,110,36,15)||inI(x,y,120,72,40,20)||inI(x,y,40,48,16,8));
  scatter(A,'mush',95,26,22,3,(x,y)=>inI(x,y,200,118,34,15));
  scatter(A,'tree',140,26,22,5,(x,y)=>DEC.some(d=>inI(x,y,d[0],d[1],d[2],d[3])));
  scatter(A,'rock',15,14,14,4);
  [105,136,185,30,36,95].forEach(x=>wfAt(A,x));
  A.ask='Cổng đá dẫn về Khu Rừng Mây. Bạn có muốn quay lại không?';A.yes='Quay về';A.dest='meadowB';A.lab='E: Cổng về Khu Rừng Mây';
  return finish(A,44)}
AR[WM]=buildMeadow();AR[WS]=buildSky();
WORLDS.meadow={name:'Khu Rừng Mây',enter(q){putIn(q,WM,50+(slot(q)-2)*.8,72.5);q.vis=1;
  if(q.pl===sel)cap('Bạn bước ra khỏi đường hầm: một khu rừng xanh mướt nổi giữa biển mây. Cổng đá hoàng hôn ở phía bắc dẫn tới Skyland (đi theo con đường đất, bấm E).')}};
WORLDS.skyland={name:'Skyland',enter(q){putIn(q,WS,119.5+(slot(q)-2)*.8,156);q.vis=1;
  if(q.pl===sel)cap('Skyland! Những hòn đảo bay nối nhau bằng cầu treo: tàu cổ, đảo nấm khổng lồ có thác nước, và tòa tháp mái đỏ ở giữa.')}};
WORLDS.meadowB={name:'Khu Rừng Mây',enter(q){putIn(q,WM,120.5+(slot(q)-2)*.8,35);q.vis=1;if(q.pl===sel)cap('Bạn trở lại Khu Rừng Mây.')}};
WORLDS.abyssE={name:'Vực sâu',enter(q){putIn(q,WA,GW.xe-4+.5,GW.y+.5);q.vis=1;if(q.pl===sel)cap('Bạn trở lại Vực sâu qua đường hầm phía đông.')}};

addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat||e.key.toLowerCase()!=='e'||e.ctrlKey||e.metaKey||e.altKey)return;
  if(state!=='island'||TK||trans)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const P=allPl().find(p=>p.pl===sel),A=P&&AR[P.fl];
  if(!A||!nearArch(P,A))return;
  e.stopImmediatePropagation();const n=P.pl;
  window.abyssAsk(A.ask,[[A.yes,()=>{cap('P'+n+' bước qua cổng đá...');window.worldTransfer(n,A.dest)}],['Chưa',()=>{}]])},true);

/* khung nhìn + camera cho khu mới */
function snapA(){const P=ins.find(p=>p.pl===sel),A=P&&AR[P.fl];if(!A)return;camX=clamp(P.x-CW/IS/2,0,A.W*T-CW/IS);camY=clamp(P.y-CH/IS/2,0,A.H*T-CH/IS)}
const _sv=syncView;syncView=function(s){_sv(s);const P=ins.find(p=>p.pl===sel);if(P&&AR[P.fl]){IS=CW/VW;if(s)snapA()}};
const _cam=cam;cam=function(){
  if(CS&&inside&&curF===WA){const vw=CW/IS,vh=CH/IS;camX+=(clamp(CS.cx-vw/2,0,300*T-vw)-camX)*.06;camY+=(clamp(CS.cy-vh/2,0,170*T-vh)-camY)*.06;return}
  if(inside&&AR[curF]){const A=AR[curF],P=ins.find(p=>p.pl===sel)||ins.find(p=>p.pl);if(!P)return;
    camX+=(clamp(P.x-CW/IS/2,0,A.W*T-CW/IS)-camX)*.15;camY+=(clamp(P.y-CH/IS/2,0,A.H*T-CH/IS)-camY)*.15;return}
  _cam()};
const _ctrl=ctrl;ctrl=function(){if(CS){const P=allPl().find(p=>p.pl===sel);if(P)P.moving=0;return}_ctrl()};

/* ================= 5. CẮT CẢNH: TIA SÁNG NỔ TƯỜNG PHÍA ĐÔNG VỰC SÂU ================= */
function site(){
  const A=window.ABYSS();if(!A||!A.im)return null;let best=null;
  for(let y=30;y<=80;y++){let ex=-1;
    for(let x=200;x<290;x++)if(A.im[y][x]===0&&!A.ob[y][x]&&!A.wat[y][x]&&!A.vd[y][x])ex=x;
    if(ex<0)continue;let ok=1;
    for(let x=ex+1;x<=ex+6;x++)for(let j=-1;j<=1;j++)if(A.im[y+j][x]!==WALL||A.vd[y+j][x]||A.wat[y+j][x])ok=0;
    if(ok&&(!best||ex>best.ex||(ex===best.ex&&Math.abs(y-70)<Math.abs(best.y-70))))best={ex,y}}
  return best}
function carve(){
  const A=window.ABYSS();
  for(let x=GW.ex+1;x<=GW.xe;x++)for(let j=-1;j<=1;j++){const y=GW.y+j;if(A.im[y][x]===WALL&&!A.ob[y][x]&&!A.wat[y][x]){A.im[y][x]=0;A.rid[y][x]=1}if(A.vd)A.vd[y][x]=0}}
function setSite(s){GW.s=s;GW.ex=s.ex;GW.y=s.y;GW.xe=Math.min(s.ex+22,292)}
function startCut(){
  if(GW.open||CS)return;const s=GW.s||site();if(!s)return;setSite(s);
  CS={t:0,cx:(s.ex+2)*T,cy:s.y*T+4,hit:0};
  cap('Một luồng sáng từ trên cao đang tụ lại ở bức tường phía đông Vực sâu...')}
function explode(){
  carve();GW.open=1;try{localStorage.setItem(GK,String(seed))}catch(_){}
  flash=24;shake=Math.max(shake,18);
  const px=(GW.ex+2)*T,py=GW.y*T+4;
  for(let i=0;i<110;i++){const a=Math.random()*6.28,v=1+Math.random()*3.5;
    PT.push({x:px+rnd(9)-4,y:py+rnd(25)-12,vx:Math.cos(a)*v+1.5,vy:Math.sin(a)*v-1.5,g:.06,l:50+rnd(60),c:['#8a909a','#5a606a','#ffd23f','#fff3a0','#ffffff'][rnd(5)],s:1+rnd(3)})}
  cap('ẦM! Tia sáng phá nát bức tường, một đường hầm sáng rực mở ra phía đông!')}
function beam(x0,y0,x1,y1,k){
  cx.save();cx.globalCompositeOperation='lighter';cx.lineCap='round';
  [[16,.14,'#ffc860'],[9,.32,'#ffe08a'],[4,.7,'#fff3c0'],[2,1,'#ffffff']].forEach(([w,a,c])=>{cx.globalAlpha=a*k;cx.strokeStyle=c;cx.lineWidth=w*(1+.1*Math.sin(frame*.9));cx.beginPath();cx.moveTo(x0,y0);cx.lineTo(x1,y1);cx.stroke()});
  const g=cx.createRadialGradient(x1,y1,0,x1,y1,34);g.addColorStop(0,'rgba(255,255,255,'+k.toFixed(3)+')');g.addColorStop(1,'rgba(255,200,90,0)');
  cx.globalAlpha=1;cx.fillStyle=g;cx.fillRect(x1-34,y1-34,68,68);cx.restore()}
function extras(){
  lockDraw();
  const s=GW.s;
  if(CS&&s){const px=(s.ex+2)*T,py=s.y*T+4,sx=px-170,sy=py-280;
    if(!CS.hit&&CS.t>1){const k=Math.min(1,(CS.t-1)/2);beam(sx,sy,sx+(px-sx)*k,sy+(py-sy)*k,.4+.6*k)}
    if(!CS.hit&&CS.t>2){cx.save();cx.strokeStyle='#fff3a0';cx.lineWidth=1;cx.globalAlpha=.5+.4*Math.sin(frame*.5);
      cx.beginPath();cx.moveTo(px-2,py-12);cx.lineTo(px+1,py-6);cx.lineTo(px-2,py);cx.lineTo(px+2,py+6);cx.lineTo(px,py+12);cx.stroke();cx.restore()}
    if(CS.hit){const k=Math.max(0,1-(CS.t-3)/1.2);if(k>0)beam(sx,sy,px,py,k)}}
  if(GW.open){const x=GW.xe*T,y=GW.y*T+4;
    cx.save();cx.globalCompositeOperation='lighter';const g=cx.createRadialGradient(x,y,2,x,y,46);g.addColorStop(0,'rgba(220,255,200,.8)');g.addColorStop(1,'rgba(120,220,140,0)');cx.fillStyle=g;cx.fillRect(x-48,y-48,96,96);cx.restore();
    R('#e8ffe0',x-2,y-12,5,24);cloud(x-18+Math.sin(frame*.03)*3,y-4,.35,.6);
    const P=ins.find(p=>p.pl===sel&&p.fl===WA);if(P&&Math.hypot(P.x-x,P.y-y)<90)label(x-8,y-26,'Lối tới Khu Rừng Mây','#9fffb0')}
  PT.forEach(q=>{cx.globalAlpha=clamp(q.l/20,0,1);R(q.c,q.x,q.y,q.s,q.s)});cx.globalAlpha=1}

/* ================= 6. MÓC VÀO GAME ================= */
const _di=drawIn;
drawIn=function(){
  const A=AR[curF];
  if(A){drawArea(A);_di();drawFront(A);return}
  _di();if(curF===WA)extras()};
const _ae=WORLDS.abyssW.enter;
WORLDS.abyssW.enter=function(q){_ae(q);if(!GW.open&&!CS&&window.A2S&&window.A2S.phase>=4)setTimeout(startCut,1800)};
const _st=step;
step=function(){
  _st();if(state!=='island')return;
  const dt=Math.min(.25,DM||.016);
  if(CS){CS.t+=dt;if(CS.t>=3&&!CS.hit){CS.hit=1;explode()}
    if(CS.t>=8){CS=null;cap('Lối đi phía đông Vực sâu đã mở! Hãy đi theo đường hầm sáng.')}}
  PT.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=q.g||0;q.l--});PT=PT.filter(q=>q.l>0);
  if(GW.open&&frame%8===0&&PT.length<260)PT.push({x:GW.xe*T,y:GW.y*T+rnd(16),vx:-.4-Math.random()*.3,vy:-.05,g:0,l:90,c:'#e8fff0',s:2});
  ins.filter(p=>p.pl).forEach(P=>{
    if(P.fl===WA&&GW.open&&!CS&&Math.floor(P.x/T)>=GW.xe-1&&Math.abs(Math.floor(P.y/T)-GW.y)<=1)window.worldTransfer(P.pl,'meadow');
    else if(P.fl===WM&&P.x<42*T)window.worldTransfer(P.pl,'abyssE')})};
const _gen=gen;
gen=function(sd){
  _gen(sd);GW.s=null;GW.open=0;LKC=null;FL[WM]=AR[WM].fl;FL[WS]=AR[WS].fl;
  try{if(localStorage.getItem(GK)===String(seed)){const s=site();if(s){setSite(s);GW.open=1;carve()}}}catch(_){}};
const _mk=mkPeople;
mkPeople=function(){_mk();GW.open=0;GW.s=null;CS=null;PT=[];LKC=null;try{localStorage.removeItem(GK)}catch(_){}};
FL[WM]=AR[WM].fl;FL[WS]=AR[WS].fl;
})();