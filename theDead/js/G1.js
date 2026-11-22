/* ===== memory.js: THẾ GIỚI KÍ ỨC (góc nhìn thứ nhất) của DU THUYỀN DANOVA =====
   Nạp CUỐI CÙNG (sau dream.js):  <script src="../js/memory.js"></script>
   Không cần sửa file cũ.
   - Trên du thuyền (giấc mơ), đúng 22:00 (đồng hồ du thuyền) nhân vật BUỒN NGỦ: đi chậm, màn hình nhòe, mí mắt nhấp nháy.
   - Về giường của mình, bấm E -> nhắm mắt -> mở mắt trong KÍ ỨC: bản sao địa hình / phòng ốc / nội thất của du thuyền,
     nhưng nhìn bằng GÓC NHÌN THỨ NHẤT (raycasting). Không lên giường sau ~100 giây thì ngất đi và cũng rơi vào kí ức.
   - Chức năng như giấc mơ: 4 tầng + cầu thang (đi vào vùng cầu thang), 14 phòng, NPC đi lại / ở trong phòng (hình bóng kí ức),
     trốn tủ đồ (E), nói chuyện NPC (E), E ở giường của mình để tỉnh dậy; 6:00 sáng tự tỉnh.
   - Điều khiển trong kí ức: W/S đi tới/lui, A/D đi ngang, ←/→ hoặc chuột (bấm vào màn hình để khóa chuột) xoay, Shift đi chậm, E tương tác. */
(()=>{
const need=['putIn','syncView','allPl','drawIn','ctrl','step','draw','sprite','bfs','hour','clockUI','gen','mkPeople','snapP'];
const miss=need.filter(n=>{try{return new Function('return typeof '+n)()==='undefined'}catch(_){return true}});
if(miss.length||!window.yachtDream||typeof window.yachtDream.floors!=='function'){
  console.warn('memory.js: hãy nạp CUỐI CÙNG (sau dream.js / yacht.js)'+(miss.length?' thiếu '+miss.join(', '):''));return}

const YT=window.yachtDream;
const F0=27,FM=31,NF=4,DX0=14,DY0=12,NC=250,CS=CW/NC,EYE=.55,PL=.8,PASS=100;
const NAMES=['Tầng 4: Khu phòng ngủ','Tầng 3: Tầng tiệc','Tầng 2: Tắm nắng và bể bơi','Tầng 1: Tầng thượng'];
const EMPTY=[10];                                   /* phòng trống (khớp yacht.js) */
const SXof=i=>i===0?116:92,LANDR=j=>j===0?113:89;
const isY=f=>f>=F0&&f<F0+NF,isM=f=>f>=FM&&f<FM+NF;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=u=>u*u*(3-2*u);
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
const warned={};const oops=(n,e)=>{if(!warned[n]){warned[n]=1;console.error('[memory] lỗi trong '+n+':',e)}};
const MV=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);

let M={fx:null,done:{},bed:{},ban:{t0:0,txt:''}},DR={},OMAP=[],WIN=new Set(),MREF=null;
const memP=()=>state==='island'?(ins.find(p=>p.pl===sel&&isM(p.fl))||null):null;
const modal=()=>{const a=$('abAsk'),iv=$('inv');return !!TK||!!trans||!!(a&&!a.hidden)||!!(iv&&!iv.hidden)};

/* ---------- Đồng bộ dữ liệu tầng từ du thuyền sang tầng kí ức (FL[31..34] dùng chung mảng, chỉ đọc) ---------- */
function sync(){
  const Y=YT.floors();if(!Y||!Y[0])return false;
  if(MREF!==Y){
    MREF=Y;OMAP=[];WIN=new Set();
    Y.forEach((f,i)=>{const mp=new Map();f.O.forEach(o=>{for(let yy=o.y;yy<o.y+o.h;yy++)for(let xx=o.x;xx<o.x+o.w;xx++)mp.set(yy*IW+xx,o.k)});OMAP[i]=mp});
    YT.rooms().forEach(rm=>[3,7].forEach(k=>{for(let t=0;t<3;t++)WIN.add((DY0+rm.outY)*IW+DX0+rm.w+k+t)}))}
  if(FL[FM]&&FL[FM].im===Y[0].im)return true;
  for(let i=0;i<NF;i++){const src=FL[F0+i];if(!src)return false;FL[FM+i]={im:Y[i].im,rid:Y[i].rid,RM:src.RM}}
  return true}

/* ---------- Giường của người chơi (khớp cách yacht.js chọn phòng) ---------- */
function ownBed(n){
  const R=YT.rooms(),occ=R.map((_,k)=>k).filter(k=>!EMPTY.includes(k)),rm=R[occ[(n-1)%occ.length]];
  if(!rm)return null;
  return YT.spots().find(s=>s.k==='bed'&&s.room===rm.id)||null}

/* ---------- Ô đi được cho NPC / điểm hạ cánh ---------- */
function okTile(j,x,y,anyRoom){
  const f=YT.floors()[j];if(!f||!f.im[y]||f.im[y][x]!==0)return false;
  const k=(f.kd[y]||[])[x]|0;
  if(k!==1&&k!==2&&k!==3&&k!==4&&k!==10)return false;
  if(j===0&&!anyRoom&&f.RID[y]&&f.RID[y][x])return false;
  return true}
function freeNear(j,tx,ty){
  for(let r=0;r<=14;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
    if(okTile(j,tx+dx,ty+dy,false))return[tx+dx,ty+dy]}
  return null}
const LENS=[138,98,98,98];
function randTile(j,anyRoom){
  for(let t=0;t<300;t++){const x=DX0+2+rnd(LENS[j]-12),y=DY0+2+rnd(28);if(okTile(j,x,y,anyRoom))return[x,y]}
  return null}

/* ---------- NPC kí ức ---------- */
function spawnMem(n){
  ins=ins.filter(p=>!p.mem);
  const R=YT.rooms(),occ=R.map((_,k)=>k).filter(k=>!EMPTY.includes(k)),own=n?occ[(n-1)%occ.length]:-1,
    ref=ins.filter(p=>p.yt),KS=['man','woman','man','woman','elder','child'];let q=0;
  const mk=(j,tx,ty)=>{
    const src=ref.length?ref[q++%ref.length]:null;
    ins.push({k:src?src.k:KS[rnd(KS.length)],pl:0,cls:'y',mem:1,evt:1,
      c:src?src.c:SHIRT[rnd(SHIRT.length)],skin:src?src.skin:SKIN[rnd(SKIN.length)],hair:src?src.hair:HAIR[rnd(HAIR.length)],
      x:tx*T+4,y:ty*T+4,tx:tx*T+4,ty:ty*T+4,sp:.4+Math.random()*.1,path:[],ph:1,wait:ri(20,200),moving:0,vis:1,delay:0,hide:0,fl:FM+j,
      n:{hu:20,fa:10,sl:5},act:'idle',t:0,cd:1e9,goal:null,say:'',tool:null})};
  occ.forEach(r=>{
    if(r===own)return;const rm=R[r];
    for(let t=0;t<60;t++){
      const x=DX0+rm.x0+rnd(rm.x1-rm.x0+1),y=DY0+rm.y0+rnd(rm.y1-rm.y0+1);
      if(okTile(0,x,y,true)){mk(0,x,y);break}}});
  for(let e=0;e<8;e++){const j=rnd(NF),t=randTile(j,false);if(t)mk(j,t[0],t[1])}}
function wander(p){
  const j=p.fl-FM;
  if(Math.random()<.04){                                   /* thỉnh thoảng đổi tầng qua cầu thang */
    const d=Math.random()<.5?1:-1,k=j+d;
    if(k>=0&&k<NF){const s=freeNear(k,DX0+(Math.random()<.5?6:LANDR(k)),DY0+15);
      if(s){p.fl=FM+k;p.x=p.tx=s[0]*T+4;p.y=p.ty=s[1]*T+4;p.path=[];return}}}
  const cx0=Math.floor(p.x/T),cy0=Math.floor(p.y/T);
  for(let t=0;t<30;t++){
    const x=cx0+ri(-24,24),y=cy0+ri(-14,14);
    if(!okTile(j,x,y,true))continue;
    const a=bfs(p.fl,cx0,cy0,x,y);
    if(a&&a.length&&a.length<80){p.path=a;p.tx=p.x;p.ty=p.y;return}}}

/* ---------- Hiệu ứng nhắm mắt / mở mắt ---------- */
function startFx(f){if(M.fx)return false;M.fx=Object.assign({t:0,fired:0},f);return true}
function lidA(f){
  const t=f.t;if(t<f.close)return ease(t/f.close);
  if(t<f.close+f.hold)return 1;
  const v=(t-f.close-f.hold)/f.open;if(v>=1)return 0;
  let a=1-ease(v);if(v>.45&&v<.7)a=Math.max(a,.45*Math.sin((v-.45)/.25*Math.PI));
  return a}
function lids(a){
  if(a<=.01)return;
  const h=Math.round(a*CH*.52);
  cx.save();cx.setTransform(1,0,0,1,0,0);
  if(a>.12){cx.globalAlpha=.3*a;cx.drawImage(cv,Math.round(Math.sin(frame*.4)*3),Math.round(Math.cos(frame*.3)*2));cx.globalAlpha=1}
  cx.fillStyle='#050203';cx.fillRect(0,0,CW,h);cx.fillRect(0,CH-h,CW,h);
  let g=cx.createLinearGradient(0,h,0,h+28);g.addColorStop(0,'rgba(40,8,14,.9)');g.addColorStop(1,'rgba(40,8,14,0)');
  cx.fillStyle=g;cx.fillRect(0,h,CW,28);
  g=cx.createLinearGradient(0,CH-h,0,CH-h-28);g.addColorStop(0,'rgba(40,8,14,.9)');g.addColorStop(1,'rgba(40,8,14,0)');
  cx.fillStyle=g;cx.fillRect(0,CH-h-28,CW,28);
  cx.restore()}
function drowsyFx(dr){
  const t=dr.t,k=.4+.6*Math.min(1,t/70);
  cx.save();cx.setTransform(1,0,0,1,0,0);
  cx.globalAlpha=.22*k;cx.drawImage(cv,Math.round(Math.sin(frame*.03)*5*k),Math.round(Math.cos(frame*.021)*3*k));cx.globalAlpha=1;
  const g=cx.createRadialGradient(CW/2,CH/2,CH*.18,CW/2,CH/2,CW*.62);
  g.addColorStop(0,'rgba(8,8,40,0)');g.addColorStop(1,'rgba(8,8,40,'+(.4+.35*k).toFixed(3)+')');
  cx.fillStyle=g;cx.fillRect(0,0,CW,CH);
  const period=7-4*k,dur=1.4+1.2*k,u=t%period;let a=0;
  if(u<dur)a=Math.sin(Math.PI*u/dur)*(.35+.6*k);
  if(t>PASS-6)a=Math.max(a,(t-(PASS-6))/6);
  cx.textAlign='center';cx.textBaseline='middle';cx.globalAlpha=clamp(.7+.2*Math.sin(frame*.12),0,1);
  cx.font='bold 22px monospace';cx.lineWidth=5;cx.strokeStyle='#000';
  cx.strokeText('Hãy về giường và đi ngủ',CW/2,CH/2-6);cx.fillStyle='#ffb0a0';cx.fillText('Hãy về giường và đi ngủ',CW/2,CH/2-6);
  cx.font='bold 9px monospace';cx.lineWidth=3;
  const s2='Lại gần giường trong phòng của bạn và bấm E (đã 10 giờ tối)';
  cx.strokeText(s2,CW/2,CH/2+20);cx.fillStyle='#fff';cx.fillText(s2,CW/2,CH/2+20);
  cx.restore();lids(a)}

/* ---------- Vào / ra kí ức ---------- */
function enterMemory(n,why){
  const P=allPl().find(p=>p.pl===n);if(!P||isM(P.fl)||!isY(P.fl))return;
  const go=()=>{
    const Q=allPl().find(p=>p.pl===n);if(!Q)return;
    try{
      if(!sync())return;
      const bed=ownBed(n)||{wx:DX0+8,wy:DY0+6},R=YT.rooms();
      M.bed[n]=ownBed(n);
      putIn(Q,FM,bed.wx+.5,bed.wy+.5);
      const rm=R.find(r=>bed.wy>=DY0+r.y0-1&&bed.wy<=DY0+r.y1+1&&bed.wx>=DY0&&bed.wx>=DX0+r.x0&&bed.wx<=DX0+r.x1);
      Q.yaw=rm?Math.atan2(DY0+rm.wallY+.5-(bed.wy+.5),DX0+rm.w+7.5-(bed.wx+.5)):0;
      Q.mcl=null;Q.act='idle';Q.mb=60;Q.vis=1;Q.wakeT=performance.now()/1000;
      delete DR[n];M.done[n]=Math.floor((YT.clock().g-960)/1440);
      spawnMem(n);
      if(n===sel){syncView(true);M.ban={t0:performance.now(),txt:NAMES[0]};
        cap(why==='pass'?'Bạn ngất đi vì quá buồn ngủ... rồi mở mắt: đây là KÍ ỨC về du thuyền. W/S/A/D đi, chuột hoặc ←/→ xoay, E tương tác.'
          :'Bạn nhắm mắt... rồi mở mắt: đây là KÍ ỨC về du thuyền. W/S/A/D đi, chuột hoặc ←/→ xoay, E tương tác.')}
    }catch(e){oops('enterMemory',e)}};
  if(n===sel&&!M.fx)startFx({n,close:1.3,hold:.5,open:2.2,cb:go});else go()}
function wakeMem(n,msg,instant){
  const P=allPl().find(p=>p.pl===n);if(!P||!isM(P.fl))return;
  const go=()=>{
    const Q=allPl().find(p=>p.pl===n);if(!Q)return;
    Q.mcl=null;Q.act='idle';
    const bed=M.bed[n]||ownBed(n);
    if(YT.clock().on&&bed){putIn(Q,F0,bed.wx+.5,bed.wy+.5);Q.yb=60;Q.vis=1}
    else{const rid=window.guestRooms&&window.guestRooms.of(n),b=rid!==undefined?BEDS.find(x=>x.fl===2&&x.room===rid):null;
      putIn(Q,2,b?b.x+.5:59.5,b?b.y+.5:27.5);Q.vis=1}
    Q.wakeT=performance.now()/1000;
    if(n===sel)syncView(true);
    if(msg)cap(msg)};
  if(!instant&&n===sel&&!M.fx)startFx({n,close:1,hold:.5,open:1.8,cb:go});else go()}

/* chặn hộp thoại "Thức dậy khỏi giấc mơ" khi đang buồn ngủ: thay bằng "nằm xuống ngủ" (vào kí ức) */
const _aa=window.abyssAsk;
if(typeof _aa==='function')window.abyssAsk=function(t,o){
  if(typeof t==='string'&&t.indexOf('Thức dậy khỏi giấc mơ')===0&&DR[sel]&&!memP()){
    const n=sel;
    return _aa('Bạn mệt rã rời, mí mắt nặng trĩu... Nằm xuống giường và chìm vào giấc ngủ?',[['Nằm xuống ngủ',()=>enterMemory(n,'bed')],['Chưa',()=>{}]])}
  return _aa(t,o)};

/* ---------- Cầu thang + cập nhật mỗi khung hình ---------- */
function stairs(P){
  if(P.mb>0){P.mb--;return}
  if(M.fx&&M.fx.n===P.pl)return;
  const i=P.fl-FM,SX=SXof(i),lx=Math.floor(P.x/T)-DX0,ly=Math.floor(P.y/T)-DY0,Lf=lx>=1&&lx<=3,Rt=lx>=SX&&lx<=SX+2;
  if(!Lf&&!Rt)return;
  let d=0;if(ly>=8&&ly<=10&&i<NF-1)d=1;else if(ly>=21&&ly<=23&&i>0)d=-1;
  if(!d)return;
  const j=i+d,s=freeNear(j,DX0+(Lf?6:LANDR(j)),DY0+15);if(!s)return;
  putIn(P,FM+j,s[0]+.5+(slot(P)-2)*.25,s[1]+.5);P.mb=60;
  if(P.pl===sel){syncView(true);M.ban={t0:performance.now(),txt:NAMES[j]};cap('Bạn '+(d>0?'đi lên ':'đi xuống ')+NAMES[j]+'.')}}
function tick(dt){
  if(!YG.on&&!YG.ending&&allPl().some(p=>isY(p.fl))){
    YG.on=1;YG.pend=0;YG.g=START_G;gm=START_G;lastMin=-1;
  }
  if(YG.on){const h=(6+YG.g/60)%24;YG.g+=dt*((h>=6&&h<23)?2:1);gm=YG.g}

  const c=YT.clock(),h=hour(),night=!!c.on&&(h>=22||h<6),nid=Math.floor((c.g-960)/1440);
  if(M.fx){
    const f=M.fx;f.t+=dt;
    if(!f.fired&&f.t>=f.close+.12){f.fired=1;try{f.cb&&f.cb()}catch(e){oops('fx',e)}}
    if(f.t>=f.close+f.hold+f.open)M.fx=null}
  let anyM=false;
  allPl().forEach(P=>{
    const n=P.pl,busy=!!(M.fx&&M.fx.n===n);
    if(isM(P.fl)){
      anyM=true;
      if(!c.on){if(!busy)wakeMem(n,'Kí ức nhạt dần... bạn tỉnh dậy.',true);return}
      if(h>=6&&h<12){if(!busy)wakeMem(n,'Trời đã sáng, kí ức tan biến. Bạn tỉnh dậy trên giường.');return}
      stairs(P);return}
    if(isY(P.fl)&&c.on){
      if(night&&!DR[n]&&M.done[n]!==nid){
        DR[n]={t:0};
        if(n===sel)cap('Đồng hồ điểm 10 giờ tối... mí mắt bạn nặng trĩu. Hãy về giường của mình và bấm E để ngủ.')}
      if(!night)delete DR[n];
      if(DR[n]){DR[n].t+=dt;if(DR[n].t>=PASS&&!M.fx)enterMemory(n,'pass')}
    }else delete DR[n]});
  if(anyM){
    if(!ins.some(p=>p.mem))spawnMem();
    if(frame%20===0)ins.forEach(p=>{
      if(!p.mem||p.path.length||Math.hypot(p.tx-p.x,p.ty-p.y)>.7||Math.random()>.3)return;
      wander(p)})}
  else{
    if(ins.some(p=>p.mem))ins=ins.filter(p=>!p.mem);
    if(document.pointerLockElement===cv)document.exitPointerLock()}}

/* ---------- Điều khiển góc nhìn thứ nhất ---------- */
const BLK=[[-1,-1],[1,-1],[-1,1],[1,1]];
function blocked(im,x,y){
  for(const[a,b]of BLK){const row=im[Math.floor((y+b*2.6)/T)];if(!row||row[Math.floor((x+a*2.6)/T)]!==0)return true}
  return false}
function fpMove(P){
  P.moving=0;P.path=[];P.tx=P.x;P.ty=P.y;
  if(modal()||P.mcl)return;
  const dt=Math.min(.1,DM||.016),k=keys;
  P.yaw=(P.yaw||0)+((k.arrowright?1:0)-(k.arrowleft?1:0))*2.3*dt;
  const f=(k.w||k.arrowup?1:0)-(k.s||k.arrowdown?1:0),s=(k.d?1:0)-(k.a?1:0);
  if(!f&&!s)return;
  const l=Math.hypot(f,s),sp=(k.shift?36:66)*dt,c=Math.cos(P.yaw),sn=Math.sin(P.yaw),
    vx=(c*f-sn*s)/l*sp,vy=(sn*f+c*s)/l*sp,im=FL[P.fl].im;
  if(!blocked(im,P.x+vx,P.y))P.x+=vx;
  if(!blocked(im,P.x,P.y+vy))P.y+=vy;
  P.tx=P.x;P.ty=P.y;P.moving=1}
const _ctrl=ctrl;
ctrl=function(){
  const P=ins.find(p=>p.pl===sel)||people.find(p=>p.pl===sel);
  if(M.fx&&M.fx.n===sel){if(P){P.moving=0;P.path=[];P.tx=P.x;P.ty=P.y}return}
  const Pm=memP();if(Pm){fpMove(Pm);return}
  if(P&&DR[sel]&&isY(P.fl)){
    const ox=P.x,oy=P.y;_ctrl();
    if(P.x!==ox||P.y!==oy){P.x=ox+(P.x-ox)*.55;P.y=oy+(P.y-oy)*.55;P.tx=P.x;P.ty=P.y}
    return}
  _ctrl()};

document.addEventListener('mousemove',e=>{
  if(document.pointerLockElement!==cv)return;
  const P=memP();if(P&&!modal()&&!P.mcl&&!M.fx)P.yaw=(P.yaw||0)+e.movementX*.0028});
document.addEventListener('pointerdown',e=>{
  if(e.target!==cv||!memP())return;
  e.stopPropagation();
  if(e.button===0&&document.pointerLockElement!==cv&&!modal()){try{const r=cv.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(_){}}},true);

/* ---------- Tương tác (E) ---------- */
function nearWard(P){const Yf=YT.floors()[P.fl-FM];return Yf&&Yf.O.find(o=>o.k==='wardrobe'&&Math.hypot(P.x-(o.px+8),P.y-(o.py+8))<26)}
function nearBedM(P){const b=M.bed[P.pl]||ownBed(P.pl);return b&&Math.hypot(P.x-(b.wx*T+4),P.y-(b.wy*T+4))<28}
function nearNpc(P){return ins.find(p=>p.mem&&p.fl===P.fl&&Math.hypot(p.x-P.x,p.y-P.y)<22)}
function mE(P){
  const n=P.pl;
  if(nearBedM(P)){
    window.abyssAsk('Thức dậy khỏi kí ức và trở về giường trên du thuyền?',[['Thức dậy',()=>wakeMem(n,'Bạn từ từ mở mắt, trở về giường trên du thuyền.')],['Ở lại kí ức',()=>{}]]);return}
  const w=nearWard(P);
  if(w){P.mcl=w;P.path=[];P.moving=0;cap('P'+n+' chui vào tủ đồ và nín thở...');return}
  const q=nearNpc(P);
  if(q){const L=(typeof LN!=='undefined'&&LN.y)||['...'];cap('Một bóng người trong kí ức thì thầm: "'+L[rnd(L.length)]+'"');return}
  cap('Không có gì để tương tác ở đây.')}
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.ctrlKey||e.metaKey||e.altKey||state!=='island')return;
  const k=e.key.toLowerCase();
  if(k==='q'&&DR[sel]&&!memP()){e.stopImmediatePropagation();cap('Bạn mệt rã rời, không còn sức để chạy nữa...');return}
  const P=memP();if(!P)return;
  if(M.fx&&M.fx.n===P.pl){if(k==='e')e.stopImmediatePropagation();return}
  if(P.mcl){if(k==='e')e.stopImmediatePropagation();if(k==='e'||MV.has(k)){P.mcl=null;cap('P'+P.pl+' chui ra khỏi tủ.')}return}
  if(k==='e'&&!e.repeat&&!modal()){e.stopImmediatePropagation();mE(P)}},true);

/* ================= RAYCASTING ================= */
const OBJS={bed:[.32,'#d9d3c6','#2a8aa0',.55],wardrobe:[1,'#7a5434'],tbl:[.3,'#a87a4c'],chair:[.3,'#c8a878'],stand:[.3,'#6a4630'],
  plant:[.55,'#a8683c','#2f8f46',.6],toilet:[.28,'#e6e8f2'],sink:[.42,'#cfd6e2'],shower:[1,'#aee0ee'],sofa:[.42,'#98a2bc','#6a7490',.5],
  lounger:[.25,'#f6f2ea'],pole:[.9,'#9aa0aa'],palm:[.92,'#6a4a2a','#2f8f46',.5],egg:[.65,'#8a7a62','#f2ecdc',.5],mast:[1,'#e8eaf2'],
  bar:[.46,'#2aa89a','#f6f6fa',.35],stool:[.3,'#9a7040']};
const HC=new Map();
function rgb(h){let v=HC.get(h);if(!v){v=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];HC.set(h,v)}return v}
function shade(h,s){const v=rgb(h);return 'rgb('+(v[0]*s|0)+','+(v[1]*s|0)+','+(v[2]*s|0)+')'}
const KA=[[.2,46,34],[.8,70,48],[1.5,52,40],[2.3,80,56],[3,60,44],[3.8,74,50],[4.6,50,38],[5.4,66,46]];
let ARU=null,ARD=null;
function arrow(up,r,gg,b){
  const c=document.createElement('canvas');c.width=20;c.height=56;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,56);gr.addColorStop(0,'rgba('+r+','+gg+','+b+',0)');gr.addColorStop(1,'rgba('+r+','+gg+','+b+',.7)');
  g.fillStyle=gr;g.fillRect(2,0,16,56);g.fillStyle='#fff';g.beginPath();
  if(up){g.moveTo(10,8);g.lineTo(2,22);g.lineTo(8,22);g.lineTo(8,40);g.lineTo(12,40);g.lineTo(12,22);g.lineTo(18,22)}
  else{g.moveTo(10,40);g.lineTo(2,26);g.lineTo(8,26);g.lineTo(8,8);g.lineTo(12,8);g.lineTo(12,26);g.lineTo(18,26)}
  g.closePath();g.fill();return c}

function render(P){
  const g=cx;g.save();
  try{
    g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;g.globalAlpha=1;g.globalCompositeOperation='source-over';
    const i=P.fl-FM,Yf=YT.floors()[i];if(!Yf)return;
    const im=FL[P.fl].im,kd=Yf.kd,RID=Yf.RID,OM=OMAP[i]||new Map();
    const px=P.x/T,py=P.y/T,yaw=P.yaw||0,dX=Math.cos(yaw),dY=Math.sin(yaw),plX=-dY*PL,plY=dX*PL;
    const lift=clamp(1-(performance.now()/1000-(P.wakeT||0))/2.8,0,1);
    const hor=Math.round(CH/2+lift*CH*.3+(P.moving?Math.sin(frame*.25)*2.2:0)+Math.sin(frame*.03));
    const ptx=Math.floor(px),pty=Math.floor(py);
    const indoor=i===0&&((RID[pty]||[])[ptx]|0)>0;

    /* trần / bầu trời */
    if(indoor){
      const gr=g.createLinearGradient(0,0,0,hor);gr.addColorStop(0,'#1c1216');gr.addColorStop(1,'#5a3a2a');
      g.fillStyle=gr;g.fillRect(0,0,CW,hor)}
    else{
      const gr=g.createLinearGradient(0,0,0,hor);gr.addColorStop(0,'#2a2060');gr.addColorStop(.6,'#7a4a72');gr.addColorStop(1,'#ff9a62');
      g.fillStyle=gr;g.fillRect(0,0,CW,hor);
      const da=wrapA(-yaw);
      if(Math.abs(da)<1.2){
        const sx=CW/2*(1+Math.tan(da)/PL),sy=hor-14;
        const rg=g.createRadialGradient(sx,sy,4,sx,sy,90);rg.addColorStop(0,'rgba(255,220,150,.8)');rg.addColorStop(1,'rgba(255,150,90,0)');
        g.fillStyle=rg;g.fillRect(sx-90,sy-90,180,180);g.fillStyle='#fff3c4';
        for(let j=-16;j<=16;j++){const w=Math.round(Math.sqrt(256-j*j));g.fillRect(sx-w,sy+j,w*2,1)}}
      g.fillStyle='#2a2046';
      KA.forEach(([a,w,h])=>{
        const d=wrapA(a-yaw);if(Math.abs(d)>1.3)return;
        const sx=CW/2*(1+Math.tan(d)/PL);
        g.beginPath();g.moveTo(sx-w,hor);g.lineTo(sx-w*.25,hor-h);g.lineTo(sx+w*.3,hor-h*.85);g.lineTo(sx+w,hor);g.closePath();g.fill()})}

    /* sàn */
    const fk=(kd[pty]||[])[ptx]|0,
      fc0=fk===3?'#4a1e30':(fk===2||fk===10)?'#8a6a46':'#8a5a24',fc1=fk===3?'#8a3a58':(fk===2||fk===10)?'#d3a876':'#c4873f';
    const fg=g.createLinearGradient(0,hor,0,CH);fg.addColorStop(0,fc0);fg.addColorStop(1,fc1);
    g.fillStyle=fg;g.fillRect(0,hor,CW,CH-hor);
    const dp=px*dX+py*dY;
    g.fillStyle='rgba(0,0,0,.09)';
    for(let y=hor+1;y<CH;y+=3){const dist=CH*.605/(y-hor);if(Math.floor(dist+dp)&1)g.fillRect(0,y,CW,3)}

    /* bắn tia */
    const cols=new Array(NC);
    for(let c=0;c<NC;c++){
      const cam=2*c/NC-1,rx=dX+plX*cam,ry=dY+plY*cam;
      let mx=ptx,my=pty,side=0,endD=0,sdx,sdy,stx,sty;
      const ddx=Math.abs(1/(rx||1e-9)),ddy=Math.abs(1/(ry||1e-9));
      if(rx<0){stx=-1;sdx=(px-mx)*ddx}else{stx=1;sdx=(mx+1-px)*ddx}
      if(ry<0){sty=-1;sdy=(py-my)*ddy}else{sty=1;sdy=(my+1-py)*ddy}
      const hits=[];
      for(let n=0;n<70;n++){
        if(sdx<sdy){sdx+=ddx;mx+=stx;side=0}else{sdy+=ddy;my+=sty;side=1}
        const d=Math.max(.15,side===0?sdx-ddx:sdy-ddy);
        if(mx<0||my<0||mx>=IW||my>=IH){if(!endD)endD=d;break}
        if(im[my][mx]===0)continue;
        const k=((kd[my]||[])[mx])|0;
        if(k===0){if(!endD)endD=d;break}
        const wx=side===0?py+d*ry:px+d*rx,fr=wx-Math.floor(wx);
        if(k===9){if(!endD)endD=d;hits.push({d,t:'r',fr,side});continue}
        if(k===8){hits.push({d,t:'w',fr,side,win:i===0&&WIN.has(my*IW+mx)});break}
        const kind=OM.get(my*IW+mx),def=OBJS[kind]||[.6,'#8a6a4a'];
        hits.push({d,t:'o',fr,side,def,kind});
        if(def[0]>=.95)break}
      cols[c]=hits;
      const x=c*CS;
      if(endD){const lh=CH*1.1/endD,fy=hor+lh*EYE,hh=Math.max(0,fy-hor);
        g.fillStyle='#2e4a86';g.fillRect(x,hor,CS,hh);g.fillStyle='#7a6aa8';g.fillRect(x,hor,CS,hh*.22)}
      for(let q=hits.length-1;q>=0;q--){
        const h=hits[q],lh=CH*1.1/h.d,fy=hor+lh*EYE,
          s=clamp(1.3-h.d*.05,.3,1)*(h.side?.8:1)*(h.fr<.03?.9:1);
        if(h.t==='r'){
          h.occ=false;const t1=fy-lh*.3;
          g.fillStyle=shade('#d8dcee',s);g.fillRect(x,t1,CS,Math.max(1,lh*.035));g.fillRect(x,fy-lh*.14,CS,Math.max(1,lh*.03));
          if(h.fr<.12||h.fr>.9)g.fillRect(x,t1,CS,lh*.3)}
        else if(h.t==='o'){
          const def=h.def,hh=lh*def[0],top=fy-hh;
          h.occ=true;h.full=def[0]>=.95;h.top=top;
          g.fillStyle=shade(def[1],s);g.fillRect(x,top,CS,hh);
          if(def[2]){g.fillStyle=shade(def[2],s);g.fillRect(x,top,CS,hh*def[3])}
          if(h.kind==='wardrobe'&&h.fr>.47&&h.fr<.53){g.fillStyle='rgba(0,0,0,.45)';g.fillRect(x,top,CS,hh)}
          g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x,top,CS,Math.max(1,lh*.02))}
        else{
          const top=fy-lh;h.occ=true;h.full=true;h.top=top;
          g.fillStyle=shade('#e8e2d8',s);g.fillRect(x,top,CS,lh);
          g.fillStyle=shade('#b9a888',s);g.fillRect(x,top,CS,lh*.06);
          g.fillStyle=shade('#8a5a38',s);g.fillRect(x,fy-lh*.1,CS,lh*.1);
          if(h.win){
            g.fillStyle=shade('#ff9a62',Math.max(s,.75));g.fillRect(x,top+lh*.28,CS,lh*.4);
            g.fillStyle=shade('#ffe0b0',Math.max(s,.75));g.fillRect(x,top+lh*.28,CS,lh*.1);
            if(h.fr<.06||h.fr>.94||(h.fr>.48&&h.fr<.52)){g.fillStyle=shade('#5a3a1e',s);g.fillRect(x,top+lh*.26,CS,lh*.44)}}}}}

    /* billboard: NPC, người chơi khác, cầu thang */
    const B=[],t=frame;
    ins.forEach(p=>{
      if(p===P||p.fl!==P.fl||!(p.mem||p.pl)||p.mcl)return;
      B.push({x:p.x,y:p.y,img:sprite(p,p.moving?1+((frame>>3)&1):0),wT:2,hT:2.5,pad:2/30,a:p.mem?(.82+.1*Math.sin(t*.05+p.x)):1})});
    if(!ARU){ARU=arrow(true,255,210,63);ARD=arrow(false,124,255,240)}
    [1,SXof(i)].forEach(lx=>{
      const x=(DX0+lx+1.5)*T;
      if(i<NF-1)B.push({x,y:(DY0+9.5)*T,img:ARU,wT:1.3,hT:2.6,pad:0,a:.6+.25*Math.sin(t*.08),add:1});
      if(i>0)B.push({x,y:(DY0+22.5)*T,img:ARD,wT:1.3,hT:2.6,pad:0,a:.6+.25*Math.sin(t*.08),add:1}) });
    const inv=1/(plX*dY-dX*plY),items=[];
    B.forEach(b=>{
      const dx=b.x/T-px,dy=b.y/T-py,tx=inv*(dY*dx-dX*dy),ty=inv*(-plY*dx+plX*dy);
      if(ty<.25||ty>40)return;items.push(Object.assign(b,{tx,ty}))});
    items.sort((a,b)=>b.ty-a.ty);
    items.forEach(b=>{
      const lh=CH*1.1/b.ty,sh=lh*(b.hT/3),sw=lh*(b.wT/3),fy=hor+lh*EYE+sh*b.pad,top=fy-sh,
        sxc=CW/2*(1+b.tx/b.ty),x0=Math.round(sxc-sw/2),iw=b.img.width,ih=b.img.height;
      g.globalAlpha=clamp(b.a*(1.25-b.ty*.03),.25,1);
      if(b.add)g.globalCompositeOperation='lighter';
      for(let xs=Math.max(0,x0-(x0&1));xs<Math.min(CW,x0+sw);xs+=CS){
        const hits=cols[Math.floor(xs/CS)];if(!hits)continue;
        let lim=CH,occ=false;
        for(const h of hits){if(h.d<b.ty&&h.occ){if(h.full){occ=true;break}lim=Math.min(lim,h.top)}}
        if(occ)continue;
        const vis=Math.min(fy,lim)-top;if(vis<=0)continue;
        const sx=clamp(Math.floor((xs-x0)/sw*iw),0,iw-1),swd=Math.max(1,Math.ceil(CS/sw*iw));
        g.drawImage(b.img,sx,0,Math.min(swd,iw-sx),Math.max(1,ih*clamp(vis/sh,0,1)),xs,top,CS,vis)}
      g.globalCompositeOperation='source-over';g.globalAlpha=1});

    /* hậu kỳ kí ức + HUD */
    const vg=g.createRadialGradient(CW/2,CH/2,CH*.3,CW/2,CH/2,CW*.66);vg.addColorStop(0,'rgba(40,20,70,0)');vg.addColorStop(1,'rgba(30,10,50,.55)');
    g.fillStyle=vg;g.fillRect(0,0,CW,CH);
    g.fillStyle='rgba(170,130,220,.07)';g.fillRect(0,0,CW,CH);
    g.fillStyle='rgba(255,255,255,.08)';
    for(let k=0;k<30;k++)g.fillRect(rnd(CW),rnd(CH),1,1);
    g.fillStyle='rgba(255,255,255,.7)';g.fillRect(CW/2-1,CH/2-1,3,3);

    if(P.mcl){
      const sh=Math.round(CH*.16),y0=Math.round(CH/2-sh/2);
      g.fillStyle='rgba(2,1,6,.96)';g.fillRect(0,0,CW,y0);g.fillRect(0,y0+sh,CW,CH-y0-sh);g.fillRect(0,y0,CW*.2,sh);g.fillRect(CW*.8,y0,CW*.2,sh)}

    g.textAlign='center';g.textBaseline='middle';
    let hint=null;
    if(P.mcl)hint='E hoặc di chuyển: Chui ra khỏi tủ';
    else if(nearBedM(P))hint='E: Thức dậy khỏi kí ức';
    else if(nearWard(P))hint='E: Trốn vào tủ';
    else if(nearNpc(P))hint='E: Nói chuyện với bóng người';
    if(hint){g.font='bold 10px monospace';const w=g.measureText(hint).width+14;
      g.fillStyle='rgba(0,0,0,.65)';g.fillRect(CW/2-w/2,CH-52,w,16);g.fillStyle='#ffd23f';g.fillText(hint,CW/2,CH-44)}
    g.font='bold 8px monospace';g.fillStyle='rgba(255,255,255,.75)';
    g.fillText(document.pointerLockElement===cv?'Chuột: xoay · W/A/S/D: đi · Shift: đi chậm · E: tương tác':'Bấm vào màn hình để xoay bằng chuột (hoặc ←/→) · W/A/S/D: đi · E: tương tác',CW/2,CH-12);
    const bt=(performance.now()-M.ban.t0)/1000;
    if(bt<4){g.globalAlpha=Math.min(1,bt/.4,(4-bt)/.8);g.font='bold 11px monospace';g.lineWidth=3;g.strokeStyle='#2a1038';
      g.strokeText('✦ KÍ ỨC ✦',CW/2,20);g.fillStyle='#ffd9f0';g.fillText('✦ KÍ ỨC ✦',CW/2,20);
      g.font='bold 14px monospace';g.strokeText(M.ban.txt,CW/2,40);g.fillStyle='#ffe9a0';g.fillText(M.ban.txt,CW/2,40);g.globalAlpha=1}
  }finally{g.restore()}}

/* ---------- Móc vào game ---------- */
const _di=drawIn;
drawIn=function(){
  const P=memP();
  if(!P||!sync())return _di();
  try{render(P)}catch(e){oops('render',e)}};
const _draw=draw;
draw=function(){
  _draw();
  if(state!=='island')return;
  try{
    const P=allPl().find(p=>p.pl===sel);
    if(P&&isY(P.fl)&&DR[sel]&&!M.fx)drowsyFx(DR[sel]);
    if(M.fx&&M.fx.n===sel)lids(lidA(M.fx))
  }catch(e){oops('draw',e)}};
const _step=step;
step=function(){_step();if(state!=='island')return;try{tick(Math.min(.25,DM||.016))}catch(e){oops('tick',e)}};
const _cu=clockUI;
clockUI=function(){_cu();if(memP()){const c=$('clk');if(c)c.innerHTML=c.innerHTML.replace('🚢 Du thuyền','🧠 Kí ức du thuyền')}};
const _snapP=snapP;
snapP=function(){const I=ins;ins=I.filter(p=>!p.mem);try{return _snapP()}finally{ins=I}};
const _gen=gen;
gen=function(sd){_gen(sd);M={fx:null,done:{},bed:{},ban:{t0:0,txt:''}};DR={};MREF=null;OMAP=[];ins=ins.filter(p=>!p.mem)};
const _mk=mkPeople;
mkPeople=function(){_mk();M.done={};M.bed={};M.fx=null;DR={};ins=ins.filter(p=>!p.mem)};

window.memoryWorld={enter:n=>enterMemory(n||sel,'bed'),wake:n=>wakeMem(n||sel,'Bạn tỉnh dậy.'),drowsy:()=>DR};
console.log('[memory] đã nạp OK (kí ức góc nhìn thứ nhất; 22:00 buồn ngủ)');
})();