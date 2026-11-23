/* ===== G1.js (memory.js BẢN 3): THẾ GIỚI KÍ ỨC (góc nhìn thứ nhất) của DU THUYỀN DANOVA =====
   Nạp CUỐI CÙNG (sau dream.js):  <script src="../js/G1.js"></script>
   Bản 3 thêm:
   - CHUI TỦ: chỉ còn 1 khe chữ nhật để nhìn, phần còn lại đen hoàn toàn. Xoay được tối đa 160° (±80°) bằng ←/→ hoặc chuột.
   - CỬA PHÒNG đóng sẵn: hai cánh trượt mở khi có người / NPC lại gần (≤ ~4 ô), đóng lại khi đi xa. Cửa đóng thì chặn đường.
   - TRẦN NHÀ: tầng 4, 3, 2 có trần (xà gỗ + đèn âm trần). Tầng 1 (tầng thượng) vẫn thấy trời.
   Giữ nguyên: cầu thang thật, đồ vật chi tiết, NPC kí ức, hiệu ứng nhắm / mở mắt, buồn ngủ. */
(()=>{
const need=['putIn','syncView','allPl','drawIn','ctrl','step','draw','sprite','bfs','hour','clockUI','gen','mkPeople','snapP'];
const miss=need.filter(n=>{try{return new Function('return typeof '+n)()==='undefined'}catch(_){return true}});
if(miss.length||!window.yachtDream||typeof window.yachtDream.floors!=='function'){
  console.warn('G1.js: hãy nạp CUỐI CÙNG (sau dream.js / yacht.js)'+(miss.length?' thiếu '+miss.join(', '):''));return}

const YT=window.yachtDream;
const F0=27,FM=31,NF=4,DX0=14,DY0=12,NC=250,CS=CW/NC,EYE0=.55,PL=.8,PASS=100,STU=.42,STD=.22;
const NAMES=['Tầng 4: Khu phòng ngủ','Tầng 3: Tầng tiệc','Tầng 2: Tắm nắng và bể bơi','Tầng 1: Tầng thượng'];
const EMPTY=[10];
const SXof=i=>i===0?116:92,LANDR=j=>j===0?113:89;
const isY=f=>f>=F0&&f<F0+NF,isM=f=>f>=FM&&f<FM+NF;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=u=>u*u*(3-2*u);
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
const warned={};const oops=(n,e)=>{if(!warned[n]){warned[n]=1;console.error('[memory] lỗi trong '+n+':',e)}};
const MV=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);
const HALF=80*Math.PI/180;   /* ±80° = tổng 160° khi trốn tủ */
function clampYaw(P){if(!P.mcl||P.mcy===undefined)return;const d=wrapA((P.yaw||0)-P.mcy);P.yaw=P.mcy+clamp(d,-HALF,HALF)}

let M={fx:null,done:{},bed:{},ban:{t0:0,txt:''}},DR={},OMAP=[],OREF=[],WIN=new Set(),MREF=null,SF=null;
let DRS=[],DMAP=new Map();   /* cửa phòng: danh sách + bản đồ ô -> cửa */
const memP=()=>state==='island'?(ins.find(p=>p.pl===sel&&isM(p.fl))||null):null;
const modal=()=>{const a=$('abAsk'),iv=$('inv');return !!TK||!!trans||!!(a&&!a.hidden)||!!(iv&&!iv.hidden)};

/* ---------- Đồng bộ dữ liệu tầng từ du thuyền ---------- */
function sync(){
  const Y=YT.floors();if(!Y||!Y[0])return false;
  if(MREF!==Y){
    MREF=Y;OMAP=[];OREF=[];WIN=new Set();
    Y.forEach((f,i)=>{const mp=new Map(),rf=new Map();
      f.O.forEach(o=>{const k=(o.room&&o.k==='tbl')?'desk':o.k;
        for(let yy=o.y;yy<o.y+o.h;yy++)for(let xx=o.x;xx<o.x+o.w;xx++){mp.set(yy*IW+xx,k);rf.set(yy*IW+xx,o)}});
      OMAP[i]=mp;OREF[i]=rf});
    YT.rooms().forEach(rm=>[3,7].forEach(k=>{for(let t=0;t<3;t++)WIN.add((DY0+rm.outY)*IW+DX0+rm.w+k+t)}));
    /* cửa phòng (2 ô kd=10 ở hàng wallY của mỗi phòng) */
    DRS=[];DMAP=new Map();
    YT.rooms().forEach(rm=>{
      const x1=DX0+rm.w+7,y=DY0+rm.wallY,d={o:0,px:(x1+1)*T,py:(y+.5)*T};
      DRS.push(d);DMAP.set(y*IW+x1,d);DMAP.set(y*IW+x1+1,d)})}
  if(FL[FM]&&FL[FM].im===Y[0].im)return true;
  for(let i=0;i<NF;i++){const src=FL[F0+i];if(!src)return false;FL[FM+i]={im:Y[i].im,rid:Y[i].rid,RM:src.RM}}
  return true}

function ownBed(n){
  const R=YT.rooms(),occ=R.map((_,k)=>k).filter(k=>!EMPTY.includes(k)),rm=R[occ[(n-1)%occ.length]];
  if(!rm)return null;
  return YT.spots().find(s=>s.k==='bed'&&s.room===rm.id)||null}

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
function spawnMem(n){
  const src=ins.filter(p=>p.yt);
  if(!src.length)return spawnMemRand(n);
  ins=ins.filter(p=>!p.mem);
  src.forEach(s=>ins.push({k:s.k,pl:0,cls:'y',mem:1,mroom:(s.room|0)+1,evt:1,c:s.c,skin:s.skin,hair:s.hair,
    x:s.x,y:s.y,tx:s.x,ty:s.y,sp:s.sp,path:[],ph:1,wait:ri(20,200),moving:0,vis:1,delay:0,hide:0,fl:FM+(s.fl-F0),
    n:{hu:20,fa:10,sl:5},act:'idle',t:0,cd:1e9,goal:null,say:'',tool:null}))}
/* ---------- NPC kí ức ---------- */
function spawnMemRand(n){
  ins=ins.filter(p=>!p.mem);
  const R=YT.rooms(),occ=R.map((_,k)=>k).filter(k=>!EMPTY.includes(k)),own=n?occ[(n-1)%occ.length]:-1,
    ref=ins.filter(p=>p.yt),KS=['man','woman','man','woman','elder','child'];let q=0;
  const mk=(j,tx,ty,room)=>{
    const src=ref.length?ref[q++%ref.length]:null;
    ins.push({k:src?src.k:KS[rnd(KS.length)],pl:0,cls:'y',mem:1,mroom:room||0,evt:1,
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
  if(p.g2)return;
  const j=p.fl-FM;
  if(Math.random()<.04){                                   /* đôi khi NPC đổi tầng: xuất hiện ở chiếu nghỉ cầu thang */
    const d=Math.random()<.5?1:-1,k=j+d;
    if(k>=0&&k<NF){const left=Math.random()<.5,s=freeNear(k,DX0+(left?2:SXof(k)+1),DY0+(d>0?6:25));
      if(s){p.fl=FM+k;p.x=p.tx=s[0]*T+4;p.y=p.ty=s[1]*T+4;p.path=[];return}}}
  const cx0=Math.floor(p.x/T),cy0=Math.floor(p.y/T);
  for(let t=0;t<30;t++){
    const x=cx0+ri(-24,24),y=cy0+ri(-14,14);
    if(j===0){const rr=((YT.floors()[0].RID[y]||[])[x])|0;if(rr&&rr!==(p.mroom|0))continue}
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
    if(!YT.clock().on)try{save()}catch(_){}
  const go=()=>{
    const Q=allPl().find(p=>p.pl===n);if(!Q)return;
    try{
      if(!sync())return;
      const bed=ownBed(n)||{wx:DX0+8,wy:DY0+6},R=YT.rooms();
      M.bed[n]=ownBed(n);
      putIn(Q,FM,bed.wx+.5,bed.wy+.5);
      const rm=R.find(r=>bed.wy>=DY0+r.y0-1&&bed.wy<=DY0+r.y1+1&&bed.wx>=DY0&&bed.wx>=DX0+r.x0&&bed.wx<=DX0+r.x1);
      Q.yaw=rm?Math.atan2(DY0+rm.wallY+.5-(bed.wy+.5),DX0+rm.w+7.5-(bed.wx+.5)):0;
      Q.mcl=null;Q.act='idle';Q.mb=60;Q.vis=1;Q.sz=0;Q.sk=0;Q.wakeT=performance.now()/1000;
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
    Q.mcl=null;Q.act='idle';Q.sz=0;Q.sk=0;
    const bed=M.bed[n]||ownBed(n);
    if(YT.clock().on&&bed){putIn(Q,F0,bed.wx+.5,bed.wy+.5);Q.yb=60;Q.vis=1}
    else{const rid=window.guestRooms&&window.guestRooms.of(n),b=rid!==undefined?BEDS.find(x=>x.fl===2&&x.room===rid):null;
      putIn(Q,2,b?b.x+.5:59.5,b?b.y+.5:27.5);Q.vis=1}
    Q.wakeT=performance.now()/1000;
    if(n===sel)syncView(true);
    if(msg)cap(msg)};
  if(!instant&&n===sel&&!M.fx)startFx({n,close:1,hold:.5,open:1.8,cb:go});else go()}

const _aa=window.abyssAsk;
if(typeof _aa==='function')window.abyssAsk=function(t,o){
  if(typeof t==='string'&&t.indexOf('Thức dậy khỏi giấc mơ')===0&&DR[sel]&&!memP()){
    const n=sel;
    return _aa('Bạn mệt rã rời, mí mắt nặng trĩu... Nằm xuống giường và chìm vào giấc ngủ?',[['Nằm xuống ngủ',()=>enterMemory(n,'bed')],['Chưa',()=>{}]])}
  return _aa(t,o)};

/* ================= CẦU THANG THẬT =================
   Lên: bậc thang ở phía bắc (hàng 8-10), đi từ nam lên bắc, mắt nâng dần.
   Xuống: bậc thang ở phía nam (hàng 21-23), đi từ bắc xuống nam, mắt hạ dần.
   Hết bậc: mờ chuyển, bước ra chiếu nghỉ của tầng mới. Hai bên là lan can, chỉ đi vào được từ đầu bậc. */
function stInfo(x,y,i){
  const SX=SXof(i),lx=Math.floor(x/T)-DX0,py=y/T-DY0;
  if(!((lx>=1&&lx<=3)||(lx>=SX&&lx<=SX+2)))return null;
  if(i<NF-1&&py>=8&&py<11)return{d:1,u:clamp((11-py)/3,0,1)};
  if(i>0&&py>=21&&py<24)return{d:-1,u:clamp((py-21)/3,0,1)};
  return null}
function stairBlock(P,nx,ny){
  const i=P.fl-FM,o=stInfo(P.x,P.y,i),n=stInfo(nx,ny,i);
  if(!o&&!n)return false;
  if(n&&!o){const py=P.y/T-DY0;return n.d>0?py<8:py>=24}              /* không vào bậc từ đầu trên */
  if(o&&!n){const py=ny/T-DY0;return o.d>0?(py>=8&&py<11):(py>=21&&py<24)}   /* không bước ngang ra khỏi lan can */
  return false}
function stairSwitch(P,d){
  const i=P.fl-FM,j=i+d,cxl=P.x/T,left=Math.floor(cxl)-DX0<=3;
  let nx=cxl+(left?0:SXof(j)-SXof(i)),ny=DY0+(d>0?7.45:24.55);
  if(!okTile(j,Math.floor(nx),Math.floor(ny),true)){const t=freeNear(j,Math.floor(nx),Math.floor(ny));if(t){nx=t[0]+.5;ny=t[1]+.5}}
  putIn(P,FM+j,nx,ny);P.sz=0;P.sk=0;P.mb=0;
  if(P.pl===sel){syncView(true);M.ban={t0:performance.now(),txt:NAMES[j]};cap('Bạn '+(d>0?'đi lên ':'đi xuống ')+NAMES[j]+'.')}}
function stairTick(P){
  if(SF&&SF.n===P.pl)return;
  if(P.mb>0){P.mb--;P.sz=0;return}
  if(M.fx&&M.fx.n===P.pl)return;
  const info=stInfo(P.x,P.y,P.fl-FM);
  if(info){P.sk=info.d;P.sz=info.d>0?info.u*STU:-info.u*STD;return}
  if(P.sk){
    const py=P.y/T-DY0,far=P.sk>0?py<8:py>=24,d=P.sk;P.sk=0;
    if(far){if(P.pl===sel)SF={n:P.pl,d,t:0,fired:0};else stairSwitch(P,d);return}}
  P.sz=0}
function stairFade(){
  if(!SF||SF.n!==sel)return;
  const a=SF.t<.3?SF.t/.3:Math.max(0,1-(SF.t-.3)/.4);
  cx.save();cx.setTransform(1,0,0,1,0,0);cx.globalAlpha=clamp(a,0,1);cx.fillStyle='#050308';cx.fillRect(0,0,CW,CH);cx.restore()}

/* ================= CỬA PHÒNG TỰ ĐỘNG =================
   Cửa đóng sẵn, mở khi có người chơi / NPC trong ~4,5 ô, đóng lại khi đi xa. Cửa chưa mở thì chặn đường. */
function doorTick(dt){
  DRS.forEach(d=>{
    let near=false;
    for(const p of ins){
      if(p.fl!==FM||!(p.pl||p.mem)||p.mcl)continue;
      if(Math.hypot(p.x-d.px,p.y-d.py)<36){near=true;break}}
    d.o=clamp(d.o+(near?1:-1)*dt*4,0,1)})}
const BLK=[[-1,-1],[1,-1],[-1,1],[1,1]];
function doorBlock(P,nx,ny){
  if(P.fl!==FM||!DMAP.size)return false;
  for(const[a,b]of BLK){
    const d=DMAP.get(Math.floor((ny+b*2.6)/T)*IW+Math.floor((nx+a*2.6)/T));
    if(d&&d.o<.6)return true}
  return false}

function tick(dt){
  const c=YT.clock(),h=hour(),night=!!c.on&&(h>=22||h<6),nid=Math.floor((c.g-960)/1440);
  doorTick(dt);
  if(M.fx){
    const f=M.fx;f.t+=dt;
    if(!f.fired&&f.t>=f.close+.12){f.fired=1;try{f.cb&&f.cb()}catch(e){oops('fx',e)}}
    if(f.t>=f.close+f.hold+f.open)M.fx=null}
  if(SF){
    SF.t+=dt;
    if(!SF.fired&&SF.t>=.3){SF.fired=1;const P=allPl().find(p=>p.pl===SF.n);if(P&&isM(P.fl))stairSwitch(P,SF.d)}
    if(SF.t>=.7)SF=null}
  let anyM=false;
  allPl().forEach(P=>{
    const n=P.pl,busy=!!(M.fx&&M.fx.n===n);
    if(isM(P.fl)){
      anyM=true;
      if(!c.on){if(!busy)wakeMem(n,'Kí ức nhạt dần... bạn tỉnh dậy.',true);return}
      if(h>=6&&h<12){if(!busy)wakeMem(n,'Trời đã sáng, kí ức tan biến. Bạn tỉnh dậy trên giường.');return}
      stairTick(P);return}
    if(isY(P.fl)&&c.on){
      if(night&&!DR[n]&&M.done[n]!==nid){
        DR[n]={t:0};
        if(n===sel)cap('Đồng hồ điểm 10 giờ tối... mí mắt bạn nặng trĩu. Hãy về giường của mình và bấm E để ngủ.')}
      if(!night)delete DR[n];
      if(DR[n]){DR[n].t+=dt;if(DR[n].t>=PASS&&!M.fx)enterMemory(n,'pass')}
    }else delete DR[n]});
  if(anyM){
  const f0=YT.floors()[0];
  if(f0)ins.forEach(p=>{
    if(!p.mem||p.fl!==FM)return;
    const rr=((f0.RID[Math.floor(p.y/T)]||[])[Math.floor(p.x/T)])|0;
    if(rr&&rr!==(p.mroom|0)){
      const rm=YT.rooms()[rr-1];if(!rm)return;
      p.x=p.tx=(DX0+rm.w+8)*T;p.y=p.ty=(DY0+rm.wallY+(rm.n?1.5:-.5))*T;p.path=[]}});
    if(!ins.some(p=>p.mem))spawnMem();
    if(frame%20===0)ins.forEach(p=>{
      if(!p.mem||p.path.length||Math.hypot(p.tx-p.x,p.ty-p.y)>.7||Math.random()>.3)return;
      wander(p)})}
  else{
    if(ins.some(p=>p.mem))ins=ins.filter(p=>!p.mem);
    if(document.pointerLockElement===cv)document.exitPointerLock()}}

/* ---------- Điều khiển góc nhìn thứ nhất ---------- */
function blocked(im,x,y){
  for(const[a,b]of BLK){const row=im[Math.floor((y+b*2.6)/T)];if(!row||row[Math.floor((x+a*2.6)/T)]!==0)return true}
  return false}
function fpMove(P){
  P.moving=0;P.path=[];P.tx=P.x;P.ty=P.y;
  if(modal()||(SF&&SF.n===P.pl))return;
  const dt=Math.min(.1,DM||.016),k=keys;
  P.yaw=(P.yaw||0)+((k.arrowright?1:0)-(k.arrowleft?1:0))*2.3*dt;
  if(P.mcl){clampYaw(P);return}                 /* trong tủ: chỉ xoay trong ±80°, không đi được */
  const f=(k.w||k.arrowup?1:0)-(k.s||k.arrowdown?1:0),s=(k.d?1:0)-(k.a?1:0);
  if(!f&&!s)return;
  const l=Math.hypot(f,s),onSt=!!stInfo(P.x,P.y,P.fl-FM),sp=(k.shift?36:66)*(onSt?.6:1)*dt,c=Math.cos(P.yaw),sn=Math.sin(P.yaw),
    vx=(c*f-sn*s)/l*sp,vy=(sn*f+c*s)/l*sp,im=FL[P.fl].im;
  if(!blocked(im,P.x+vx,P.y)&&!stairBlock(P,P.x+vx,P.y)&&!doorBlock(P,P.x+vx,P.y))P.x+=vx;
  if(!blocked(im,P.x,P.y+vy)&&!stairBlock(P,P.x,P.y+vy)&&!doorBlock(P,P.x,P.y+vy))P.y+=vy;
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
  const P=memP();
  if(P&&!modal()&&!M.fx){P.yaw=(P.yaw||0)+e.movementX*.0028;clampYaw(P)}});
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
  if(w){
    P.mcl=w;P.path=[];P.moving=0;
    P.mcy=Math.atan2(P.y-(w.py+8),P.x-(w.px+8));   /* tâm tầm nhìn: hướng ra phía phòng */
    P.yaw=P.mcy;
    cap('P'+n+' chui vào tủ đồ và nín thở... (←/→ hoặc chuột để nhìn quanh, tối đa 160°)');return}
  const q=nearNpc(P);
  if(q){const L=(typeof LN!=='undefined'&&LN.y)||['...'];cap('Một bóng người trong kí ức thì thầm: "'+L[rnd(L.length)]+'"');return}
  cap('Không có gì để tương tác ở đây.')}
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.ctrlKey||e.metaKey||e.altKey||state!=='island')return;
  const k=e.key.toLowerCase();
  if(k==='q'&&DR[sel]&&!memP()){e.stopImmediatePropagation();cap('Bạn mệt rã rời, không còn sức để chạy nữa...');return}
  const P=memP();if(!P)return;
  if(M.fx&&M.fx.n===P.pl){if(k==='e')e.stopImmediatePropagation();return}
  if(P.mcl){
    if(k==='e')e.stopImmediatePropagation();
    if(k==='e'||(MV.has(k)&&k!=='arrowleft'&&k!=='arrowright')){P.mcl=null;P.mcy=undefined;cap('P'+P.pl+' chui ra khỏi tủ.')}
    return}
  if(k==='e'&&!e.repeat&&!modal()){e.stopImmediatePropagation();mE(P)}},true);

/* ================= RAYCASTING ================= */
/* [chiều cao, màu thường, màu phụ, tỉ lệ] — màu chỉ dùng cho đồ chưa có hàm vẽ riêng */
const OBJS={bed:[.34,'#d9d3c6'],desk:[.34,'#a87a4c'],wardrobe:[1,'#7a5434'],tbl:[.5,'#f6f1e6'],chair:[.5,'#c8a878'],stand:[.42,'#6a4630'],banq:[.4,'#f6f1e6'],
  plant:[.62,'#a8683c'],toilet:[.36,'#e6e8f2'],sink:[.44,'#cfd6e2'],shower:[.94,'#aee0ee'],sofa:[.46,'#98a2bc'],
  lounger:[.3,'#f6f2ea'],pole:[.88,'#9aa0aa'],palm:[.78,'#6a4a2a'],egg:[.72,'#8a7a62'],mast:[.94,'#e8eaf2'],
  bar:[.62,'#2aa89a'],stool:[.36,'#9a7040'],step:[.3,'#a8743f']};
const HC=new Map();
function rgb(h){let v=HC.get(h);if(!v){v=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];HC.set(h,v)}return v}
function shade(h,s){const v=rgb(h);return 'rgb('+(v[0]*s|0)+','+(v[1]*s|0)+','+(v[2]*s|0)+')'}
const KA=[[.2,46,34],[.8,70,48],[1.5,52,40],[2.3,80,56],[3,60,44],[3.8,74,50],[4.6,50,38],[5.4,66,46]];
const BC=[['#2a8aa0','#4cc0d0'],['#b85a7a','#e88aa8'],['#4a9a5a','#7acb8a'],['#7a62c0','#a890e8']];
let ARU=null,ARD=null,BBC=null;
function arrow(up,r,gg,b){
  const c=document.createElement('canvas');c.width=20;c.height=56;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,56);gr.addColorStop(0,'rgba('+r+','+gg+','+b+',0)');gr.addColorStop(1,'rgba('+r+','+gg+','+b+',.7)');
  g.fillStyle=gr;g.fillRect(2,0,16,56);g.fillStyle='#fff';g.beginPath();
  if(up){g.moveTo(10,8);g.lineTo(2,22);g.lineTo(8,22);g.lineTo(8,40);g.lineTo(12,40);g.lineTo(12,22);g.lineTo(18,22)}
  else{g.moveTo(10,40);g.lineTo(2,26);g.lineTo(8,26);g.lineTo(8,8);g.lineTo(12,8);g.lineTo(12,26);g.lineTo(18,26)}
  g.closePath();g.fill();return c}
/* sprite trang trí (dù, cọ, thang bể bơi, đèn dây, biển số phòng) */
const mkc=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'));return c};
function bbi(){
  if(BBC)return BBC;
  BBC={plates:{},
    par:mkc(48,12,g=>{for(let x=0;x<48;x++){const u=(x-23.5)/24,top=Math.round(u*u*8),st=(x/6|0)&1;
      g.fillStyle=st?'#f4ecd8':'#d8604a';g.fillRect(x,top,1,4);g.fillStyle=st?'#c9b88c':'#a83e2c';g.fillRect(x,top+4,1,1);
      if(x%6<3){g.fillStyle=st?'#f4ecd8':'#d8604a';g.fillRect(x,top+5,1,1)}}
      g.fillStyle='#8a7a5a';g.fillRect(23,0,2,2)}),
    palm:mkc(48,24,g=>{for(let k=0;k<9;k++){const a=-3.1+k*.39;
      for(let r=1;r<=22;r+=.7){const x=24+Math.cos(a)*r,y=12+Math.sin(a)*r*.45+r*r*.014;
        g.fillStyle=k%2?'#2f8f46':'#58c25e';g.fillRect(Math.round(x),Math.round(y),2,2);
        if(r>6&&Math.round(r)%3===0){g.fillStyle='#1f6a34';g.fillRect(Math.round(x),Math.round(y)+2,1,2)}}}
      g.fillStyle='#4a3020';g.fillRect(22,10,4,4);g.fillStyle='#7a5a38';g.fillRect(23,11,2,2)}),
    lad:mkc(16,24,g=>{g.fillStyle='#d0d6e0';g.fillRect(3,2,2,21);g.fillRect(11,2,2,21);g.fillRect(3,1,10,1);
      g.fillStyle='#8a909c';[7,12,17].forEach(y=>g.fillRect(5,y,6,1));g.fillStyle='#ffffff';g.fillRect(3,2,1,19)}),
    bulb:mkc(8,8,g=>{const r=g.createRadialGradient(4,4,0,4,4,4);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,210,120,.8)');r.addColorStop(1,'rgba(255,170,80,0)');g.fillStyle=r;g.fillRect(0,0,8,8)})};
  return BBC}
function plateImg(t,col){
  const B=bbi(),k=t+col;
  return B.plates[k]||(B.plates[k]=mkc(24,10,g=>{g.fillStyle='#2a1d12';g.fillRect(0,0,24,10);g.fillStyle=col;g.fillRect(1,1,22,8);
    g.fillStyle='#2a1d12';g.font='bold 6px monospace';g.textAlign='center';g.fillText(t,12,7.2)}))}

/* ---------- Hàm vẽ chi tiết từng loại đồ theo cột tia ----------
   a = vị trí dọc mặt đồ vật (0..1), cao tính theo "đơn vị tường". Trả 0 = không vẽ gì (không che), 1 = che, 2 = vẽ nhưng trong suốt */
function paint(g,o,kind,x,fy,lh,a,s0,def){
  let d=0,S=s0;
  const C=(c,y0,y1,al)=>{if(y1<=y0)return;g.fillStyle=shade(c,S);if(al!==undefined)g.globalAlpha=al;
    g.fillRect(x,fy-lh*y1,CS,Math.max(1,lh*(y1-y0)));if(al!==undefined)g.globalAlpha=1;d=d||1};
  const c0=Math.abs(a-.5),hh=o?hs(o.x|0,o.y|0)%100:0,fl=(frame>>2)&1;
  switch(kind){
  case 'tbl':{S=s0*(1-Math.pow(c0*2,2)*.35);
    C(((a*14)|0)%2?'#e8e0cf':'#f6f1e6',0,.3);C('#d8b04a',.25,.285);C('#f8f4ea',.3,.32);
    if((a>.1&&a<.3)||(a>.7&&a<.9)){C('#ffffff',.32,.335);if(Math.abs(a-.2)<.035||Math.abs(a-.8)<.035)C(['#c0392b','#5aa845','#d4a63a'][hh%3],.335,.36)}
    if(Math.abs(a-.38)<.014||Math.abs(a-.62)<.014){C('#cfeaff',.32,.34,.7);C('#cfeaff',.34,.43,.55)}
    if(Math.abs(a-.5)<.06){C('#2f8f46',.32,.38);C(['#ff6a8a','#ffd23f','#ffffff'][hh%3],.38,.46);if(c0<.025)C('#ff9ac2',.46,.5)}
    if(Math.abs(a-.28)<.012||Math.abs(a-.72)<.012){C('#fff8e0',.32,.43);C(fl?'#ffb02e':'#ffe08a',.43,.47)}
    break}
  case 'banq':{
    const W=o?o.w:14,u=a*W,k=Math.floor(u),c1=Math.abs(u-k-.5);
    C('#f2ecdc',0,.33);C('#fffaf0',.33,.36);C('#c9a04c',.36,.365);
    if(c1<.3){C('#ffffff',.365,.38);if(k%2===0&&c1<.18)C(['#c0392b','#d4a63a','#5aa845'][k%3],.38,.4)}
    if(k%2===1&&c1<.1)C('#cfeaff',.365,.44,.6);
    if(k%3===1&&c1<.06){C('#fff8e0',.365,.46);C(fl?'#ffb02e':'#ffe08a',.46,.5)}
    else if(k%5===3&&c1<.2){C('#2f8f46',.365,.42);C(['#ff6a8a','#ffd23f','#ffffff'][k%3],.42,.5)}
    else if(k%4===2&&c1<.35){C('#d8dce2',.365,.375);C(['#b5651d','#c0392b','#5aa845','#d4a63a'][k%4],.375,.43)}
    break}
  case 'desk':C('#6a4630',0,.28);C('#a87a4c',.28,.32);if(a>.55&&a<.9)C('#8a6040',.08,.24);
    if(a>.15&&a<.32){C('#c0392b',.32,.36);C('#f4f4f8',.34,.35)}
    if(Math.abs(a-.8)<.012)C('#555a66',.32,.42);if(Math.abs(a-.8)<.06){C('#e8d8b0',.42,.5);C('#ffd88a',.41,.42,.5)}
    break;
  case 'sofa':{
    C('#3f3558',0,.05);C(((a*3)|0)%2?'#7a86ac':'#8590b6',.05,.22);
    if(Math.abs(a*3-Math.round(a*3))<.02)C('#4f5a80',.05,.22);
    C('#98a2bc',.22,.44);C('#b8c0d8',.43,.46);
    if(Math.abs(a*12-Math.round(a*12))<.05&&Math.round(a*12)%2===1)C('#5a6490',.3,.34);
    if(a<.06||a>.94)C('#6a7490',.05,.36);
    if(a>.1&&a<.2)C('#2aa8a0',.22,.36);if(a>.8&&a<.9)C('#f0b060',.22,.36);
    break}
  case 'lounger':
    C('#b4772f',0,.06);C('#f6f2ea',.06,.14);
    if(a<.28)C('#ffffff',.14,.18+.18*(1-a/.28));
    if(a>.55&&a<.66)C('#3a8fb8',.14,.17);C('#e8e2d4',.13,.145);
    break;
  case 'bar':{const k=Math.floor(a*44),fk=(a*44)%1;
    C(((a*80)|0)&1?'#1d7e74':'#145a52',0,.38);C('#7cfff0',.33,.355,.55+.3*Math.sin(frame*.08+a*20));
    C('#f6f6fa',.38,.43);C('#d9dce8',.43,.44);
    if(k%3===0){const col=['#58c25e','#e8a030','#4a90e0','#e0506a'][((k/3)|0)%4];if(fk<.7)C(col,.44,.52);if(fk>.2&&fk<.5)C(col,.52,.6)}
    if(k%4===1&&fk>.3&&fk<.7)C('#e8f6ff',.44,.49,.6);
    break}
  case 'stool':if(c0<.4){C('#9a7040',.28,.3);C('#e0b878',.3,.36)}if(c0<.08)C('#555a66',0,.28);break;
  case 'chair':if(a<.12||a>.88)C('#5a4a3a',0,.26);if(c0<.42){C('#c8a878',.26,.3);C('#f0e6d0',.3,.33)}if(a>.86)C('#c8a878',.33,.52);break;
  case 'bed':{const P=BC[((o&&o.col)||0)%4];
    C('#4a2e1e',0,.1);C('#f4efe6',.1,.2);
    if(a>.4){C(P[0],.2,.27);if(((a*20)|0)%3===0)C(P[1],.2,.27);C(P[1],.26,.28)}
    else{C('#ffffff',.2,.3);if(a>.2&&a<.22)C('#d8d4e0',.2,.3)}
    if(a<.05)C('#3a2418',.1,.44);
    break}
  case 'wardrobe':
    C('#7a5434',0,1);C('#4a2e1e',.95,1);C('#4a2e1e',0,.04);
    if(a<.06||a>.94)C('#5a3a22',.04,.95);
    else{C('#8a6040',.08,.45);C('#8a6040',.55,.9);C('#a87a4c',.08,.1);C('#a87a4c',.55,.57)}
    if(c0<.03)C('#120709',.04,.95);
    if((a>.4&&a<.45)||(a>.55&&a<.6))C('#e8c86a',.45,.55);
    break;
  case 'stand':C('#6a4630',0,.24);C('#4a2e1e',.11,.125);C('#8a6040',.24,.27);
    if(Math.abs(a-.5)<.02)C('#e8d8b0',.27,.34);if(c0<.22){C('#e8d8b0',.34,.42);C('#ffd88a',.33,.43,.4)}break;
  case 'plant':{
    if(c0<.22){C('#a8683c',0,.2);C('#c8884c',.18,.22)}
    for(let k=0;k<5;k++){const y0=.22+k*.08,w=.36-k*.03+((hh>>k)&1)*.04;if(c0<w)C(k%2?'#2f8f46':'#58c25e',y0,y0+.08)}
    break}
  case 'toilet':
    C('#d9dde8',0,.1);
    if(a<.34){C('#cdd2e0',.1,.36);if(Math.abs(a-.17)<.02)C('#e8c86a',.34,.37)}
    else{C('#f4f6fb',.1,.2);C('#ffffff',.2,.23)}
    break;
  case 'sink':
    C('#8a6040',0,.3);if(c0<.015)C('#4a2e1e',0,.3);C('#cfd6e2',.3,.34);
    if(c0<.04)C('#9aa0aa',.34,.42);
    break;
  case 'shower':
    C('#aee0ee',0,.94,.3);
    if(a<.05||a>.95)C('#9aa0aa',0,.94);
    C('#9aa0aa',.9,.94);
    if(a>.68&&a<.85){C('#9aa0aa',.8,.86)}
    if(((a*24)|0)%3===0&&hs((a*24)|0,frame>>1)%3){const y0=.2+((frame*.02+a*7)%.55);C('#bfe8ff',y0,y0+.06,.8)}
    d=2;break;
  case 'egg':{const hgt=Math.sqrt(Math.max(0,1-Math.pow(c0*2,2)));
    if(c0<.03)C('#7a7f8a',.6,1);
    if(hgt>0){const top=.2+.42*hgt;C('#2a2a30',.18,top);C(((a*18)|0)%2?'#8a7a62':'#6a5a42',.2,top-.02);if(hgt>.3)C('#f2ecdc',.22,.2+.22*hgt)}
    break}
  case 'pole':if(c0<.03)C('#9aa0aa',.04,.88);if(c0<.22)C('#4a4a52',0,.05);break;
  case 'palm':
    if(c0<.42){C('#a89c88',0,.18);C('#d8cfc0',.16,.2)}
    if(c0<.07)C(((a*40)|0)%2?'#6a4a2a':'#7a5a38',.2,.78);
    break;
  case 'mast':
    if(c0<.3)C('#c8ccdc',0,.12);if(c0<.07)C('#e8eaf2',.12,.9);if(c0<.3)C('#f4f6fb',.76,.82);
    if(c0<.05)C(fl?'#ff3b3b':'#802020',.9,.94);
    break;
  case 'step':
    if(o.up){C('#8a5a34',0,o.hh);C('#d8b878',Math.max(0,o.hh-.02),o.hh)}
    else{C('#5a2a3c',0,o.hh);C('#d8b04a',0,.012)}
    break;
  default:C(def[1],0,def[0])}
  return d}

/* ---------- Trần nhà: ceiling casting (xà gỗ + đèn âm trần), vẽ bằng ImageData rồi phóng to ---------- */
let CBUF=null,CBG=null,CIMG=null;
function drawCeil(g,px,py,dX,dY,plX,plY,hor,EYE){
  if(!CBUF){CBUF=document.createElement('canvas');CBUF.width=NC;CBUF.height=CH;CBG=CBUF.getContext('2d');CIMG=CBG.createImageData(NC,CH)}
  const H=clamp(Math.round(hor),1,CH),d=CIMG.data,hz=Math.max(.12,1-EYE),
    rx0=dX-plX,ry0=dY-plY,sx=2*plX/NC,sy=2*plY/NC;
  for(let y=0;y<H;y+=2){
    const den=Math.max(.6,hor-y-.5);
    const rd=CH*1.1*hz/den,sh=clamp(1.35-rd*.045,.3,1);
    let wx=px+rd*rx0,wy=py+rd*ry0;
    for(let c=0;c<NC;c++,wx+=rd*sx,wy+=rd*sy){
      const ax=wx/3,ay=wy/3,fx=ax-Math.floor(ax),fy=ay-Math.floor(ay);
      let r,gc,b,k=sh;
      if(fx<.07||fy<.07){r=112;gc=72;b=46}                                          /* xà gỗ */
      else if(Math.abs(fx-.5)<.16&&Math.abs(fy-.5)<.16){r=255;gc=240;b=196;k=1}     /* đèn âm trần */
      else{const q=(Math.floor(wx*2)+Math.floor(wy*2))&1;r=q?236:226;gc=q?230:219;b=q?220:206}
      const i=(y*NC+c)*4;
      d[i]=r*k;d[i+1]=gc*k;d[i+2]=b*k;d[i+3]=255;
      if(y+1<CH){const j=i+NC*4;d[j]=d[i];d[j+1]=d[i+1];d[j+2]=d[i+2];d[j+3]=255}}}
  CBG.putImageData(CIMG,0,0);
  g.drawImage(CBUF,0,0,NC,H,0,0,CW,H)}
/* ---------- Sàn: ceiling-casting đảo ngược, mỗi ô lấy đúng loại sàn (kd) của yacht ---------- */
let FBUF=null,FBG=null,FIMG=null,DDEC=null;
function danovaData(){
  if(DDEC)return DDEC;
  const c=document.createElement('canvas');c.width=96;c.height=24;const g=c.getContext('2d');
  g.fillStyle='rgba(255,216,107,.18)';g.fillRect(0,2,96,16);
  g.textAlign='center';g.font='bold 10px monospace';g.fillStyle='#8a5a1a';g.fillText('DANOVA',49,13);g.fillStyle='#ffe9a0';g.fillText('DANOVA',48,12);
  g.font='bold 5px monospace';g.fillStyle='#ffd86b';g.fillText('CRUISE HALONG BAY',48,19);
  return DDEC=g.getImageData(0,0,96,24).data}
const PLAT=[[98,52,[200,154,96]],[102,56,[152,105,60]],[112,62,[208,160,102]],[116,66,[168,116,68]],[126,72,[214,164,106]],[130,76,[122,78,42]]];
function drawFloor(g,i,Yf,px,py,dX,dY,plX,plY,hor,EYE){
  if(!FBUF){FBUF=document.createElement('canvas');FBUF.width=NC;FBUF.height=CH;FBG=FBUF.getContext('2d');FIMG=FBG.createImageData(NC,CH)}
  const d=FIMG.data,kd=Yf.kd,y0=Math.max(0,Math.floor(hor)),rx0=dX-plX,ry0=dY-plY,sx=2*plX/NC,sy=2*plY/NC,
    dec=i===2?danovaData():null,DXo=DX0+48-6,DYo=DY0+27-1.25;
  for(let y=y0;y<CH;y+=2){
    const den=Math.max(.6,y+.5-hor);
    const rd=CH*1.1*EYE/den,sh=clamp(1.35-rd*.045,.3,1);
    let wx=px+rd*rx0,wy=py+rd*ry0;
    for(let c=0;c<NC;c++,wx+=rd*sx,wy+=rd*sy){
      const tx=Math.floor(wx),ty=Math.floor(wy),fx=wx-tx,fy=wy-ty,row=kd[ty],k=row?(row[tx]|0):0;
      let r,gc,b,q=sh;
      if(!k){const w=Math.sin(wx*.9+wy*.5+frame*.05)+Math.sin(wx*.3-wy*.8+frame*.03),hi=w>1.2;r=hi?150:46;gc=hi?170:74;b=hi?210:134;q=1}
      else if(k===3){
        const e=(fy<.125&&((kd[ty-1]||[])[tx]|0)!==3)||(fy>.875&&((kd[ty+1]||[])[tx]|0)!==3)||(fx<.125&&(row[tx-1]|0)!==3)||(fx>.875&&(row[tx+1]|0)!==3);
        if(e){r=224;gc=184;b=96}else if((tx+ty)&1){r=122;gc=54;b=80}else{r=110;gc=46;b=68}}
      else if(k===4){if(fx>.875||fy>.875){r=150;gc=180;b=200}else if((tx+ty)&1){r=216;gc=232;b=240}else{r=188;gc=212;b=224}}
      else if(k===5||k===6){if((fy>.25&&fy<.31)||(fy>.62&&fy<.69)){r=176;gc=168;b=152}else{r=240;gc=235;b=224}}
      else if(k===7){r=31;gc=178;b=196}
      else if(k===8){r=232;gc=226;b=216}
      else if(k===9){r=236;gc=238;b=246}
      else{
        const pale=k===2||k===10,idx=(fy<.5?(tx+ty):(tx+ty+1))&1;
        if(pale){r=idx?201:211;gc=idx?156:168;b=idx?104:118}else{r=idx?185:196;gc=idx?125:135;b=idx?54:63}
        if((fy>=.375&&fy<.5)||fy>=.875){r*=.78;gc*=.78;b*=.78}
        if(i===1){                                   /* bục gỗ nhiều lớp quanh quầy bar + ánh ngọc dưới sàn */
          const ex=wx-(DX0+48),ey=wy-(DY0+16.25);
          for(const[a,bb,col]of PLAT){const u=ex/(a/8),v=ey/(bb/8);if(u*u+v*v<1){r=col[0];gc=col[1];b=col[2];if(fy>=.875){r*=.85;gc*=.85;b*=.85}break}}
          const gl=(ex/11.5)*(ex/11.5)+(ey/6.25)*(ey/6.25);if(gl<1){const t=(1-gl)*34;gc+=t;b+=t*.9}}
        else if(i===2){                              /* viền hồ bơi: gờ trắng + sàn cát */
          const dd=Math.max(Math.max(DX0+34-wx,0,wx-(DX0+63)),Math.max(DY0+9-wy,0,wy-(DY0+22)));
          if(dd<.5){r=246;gc=246;b=251}else if(dd<1.25){r=226;gc=184;b=120;if(((tx+ty)&1)===0&&fy<.12){r=190;gc=140;b=80}}}
        else if(i===3){                              /* viền gỗ jacuzzi */
          for(const jx of[DX0+28,DX0+70]){const rr=Math.hypot(wx-jx,wy-(DY0+8));
            if(rr<3.625){r=168;gc=104;b=60}else if(rr<3.875){r=122;gc=74;b=42}}}
        if(dec){                                     /* chữ DANOVA dưới sàn tầng 2 */
          const u=Math.floor((wx-DXo)*8),v=Math.floor((wy-DYo)*8);
          if(u>=0&&u<96&&v>=0&&v<24){const p=(v*96+u)*4,al=dec[p+3]/255;if(al>0){r+=(dec[p]-r)*al;gc+=(dec[p+1]-gc)*al;b+=(dec[p+2]-b)*al}}}
      }
      const o=(y*NC+c)*4;d[o]=r*q;d[o+1]=gc*q;d[o+2]=b*q;d[o+3]=255;
      if(y+1<CH){const o2=o+NC*4;d[o2]=d[o];d[o2+1]=d[o+1];d[o2+2]=d[o+2];d[o2+3]=255}}}
  FBG.putImageData(FIMG,0,0);
  g.drawImage(FBUF,0,y0,NC,CH-y0,0,y0,CW,CH-y0)}
function render(P){
  const g=cx;g.save();
  try{
    g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;g.globalAlpha=1;g.globalCompositeOperation='source-over';
    const i=P.fl-FM,Yf=YT.floors()[i];if(!Yf)return;
    const im=FL[P.fl].im,kd=Yf.kd,RID=Yf.RID,OM=OMAP[i]||new Map(),OR=OREF[i]||new Map();
    const px=P.x/T,py=P.y/T,yaw=P.yaw||0,dX=Math.cos(yaw),dY=Math.sin(yaw),plX=-dY*PL,plY=dX*PL;
    const EZ=P.sz||0,EYE=EYE0+EZ;
    const lift=clamp(1-(performance.now()/1000-(P.wakeT||0))/2.8,0,1);
    const hor=Math.round(CH/2+lift*CH*.3+(P.moving?Math.sin(frame*.25)*2.2:0)+Math.sin(frame*.03)+EZ*CH*.22);
    const ptx=Math.floor(px),pty=Math.floor(py);

    /* trần (tầng 4, 3, 2) / bầu trời (tầng thượng) */
    const roofOn=i<NF-1;
    if(roofOn){
      drawCeil(g,px,py,dX,dY,plX,plY,hor,EYE)}
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
      }

    drawFloor(g,i,Yf,px,py,dX,dY,plX,plY,hor,EYE);
    /* bắn tia */
    const cols=new Array(NC);
    for(let c=0;c<NC;c++){
      const cam=2*c/NC-1,rx=dX+plX*cam,ry=dY+plY*cam;
      let mx=ptx,my=pty,side=0,endD=0,sdx,sdy,stx,sty,lastD=.15,inW=false,ws=.15,wk=null;
      const ddx=Math.abs(1/(rx||1e-9)),ddy=Math.abs(1/(ry||1e-9));
      if(rx<0){stx=-1;sdx=(px-mx)*ddx}else{stx=1;sdx=(mx+1-px)*ddx}
      if(ry<0){sty=-1;sdy=(py-my)*ddy}else{sty=1;sdy=(my+1-py)*ddy}
      const hits=[];
      const flushW=de=>{if(inW){hits.push({d:ws,de,t:'wa',jac:wk==='jac'});inW=false}};
      if(((kd[pty]||[])[ptx]|0)===7){inW=true;wk=OM.get(pty*IW+ptx)}
      for(let n=0;n<70;n++){
        if(sdx<sdy){sdx+=ddx;mx+=stx;side=0}else{sdy+=ddy;my+=sty;side=1}
        const d=Math.max(.15,side===0?sdx-ddx:sdy-ddy);lastD=d;
        if(mx<0||my<0||mx>=IW||my>=IH){if(!endD)endD=d;break}
        const k=((kd[my]||[])[mx])|0,wx=side===0?py+d*ry:px+d*rx,fr=wx-Math.floor(wx),isW=k===7;
        if(isW&&!inW){inW=true;ws=d;wk=OM.get(my*IW+mx)}else if(!isW&&inW)flushW(d);
        if(im[my][mx]===0){                                      /* ô đi được: cửa phòng, bậc thang, ghế / ghế bar */
          if(k===10){
            const dd=DMAP.get(my*IW+mx);
            hits.push({d,t:'d',fr,side,lf:((kd[my]||[])[mx-1]|0)!==10,op:dd?dd.o:1})}
          else if(k===5||k===6){const ly=my-DY0,up=k===5,hh2=up?.09*(10-ly+1):.025;
            hits.push({d,t:'o',fr,side,kind:'step',def:[hh2,'#a8743f'],o:{up,hh:hh2},a:fr})}
          else{const kind=OM.get(my*IW+mx);
            if(kind==='chair'||kind==='stool'){const o=OR.get(my*IW+mx);hits.push({d,t:'o',fr,side,def:OBJS[kind],kind,o,a:o?clamp(side===1?(wx-o.x)/o.w:(wx-o.y)/o.h,0,1):fr})}}
          continue}
        if(k===0){if(!endD)endD=d;break}
        if(k===9){if(!endD)endD=d;hits.push({d,t:'r',fr,side});continue}
        if(k===8){hits.push({d,t:'w',fr,side,win:i===0&&WIN.has(my*IW+mx),mx,my});break}
        const kind=OM.get(my*IW+mx),o=OR.get(my*IW+mx),def=OBJS[kind]||[.6,'#8a6a4a'];
        hits.push({d,t:'o',fr,side,def,kind,o,a:o?clamp(side===1?(wx-o.x)/o.w:(wx-o.y)/o.h,0,1):fr});
        if(def[0]>=.95)break}
      flushW(lastD);
      cols[c]=hits;
      const x=c*CS;
      if(endD){const lh=CH*1.1/endD,fy=hor+lh*EYE,hh=Math.max(0,fy-hor);
        g.fillStyle='#2e4a86';g.fillRect(x,hor,CS,hh);g.fillStyle='#7a6aa8';g.fillRect(x,hor,CS,hh*.22);
        if(hs(c,frame>>3)%9===0){g.fillStyle='#ffd9a0';g.fillRect(x,hor+2+(hs(c,3)%Math.max(1,hh|0)),CS,1)}}
      for(let q=hits.length-1;q>=0;q--){
        const h=hits[q],lh=CH*1.1/h.d,fy=hor+lh*EYE,
          s=clamp(1.3-h.d*.05,.3,1)*(h.side?.8:1)*(h.fr<.03?.9:1);
        if(h.t==='r'){                                           /* lan can: tay vịn + con tiện */
          h.occ=false;const t1=fy-lh*.3;
          g.fillStyle=shade('#e8ecf6',s);g.fillRect(x,t1,CS,Math.max(1,lh*.035));g.fillRect(x,fy-lh*.14,CS,Math.max(1,lh*.025));
          g.fillStyle=shade('#c4cade',s);
          if((h.fr*8)%1<.18)g.fillRect(x,t1,CS,lh*.3);
          if(h.fr<.1||h.fr>.92){g.fillStyle=shade('#ffffff',s);g.fillRect(x,t1-lh*.02,CS,lh*.34)}}
        else if(h.t==='wa'){                                     /* mặt nước: bể bơi / jacuzzi */
          h.occ=false;
          const yN=Math.min(CH,hor+CH*1.1/Math.max(.15,h.d)*EYE),yF=Math.max(hor+1,hor+CH*1.1/Math.max(.2,h.de)*EYE);
          if(yN>yF){
            const bs=h.jac?['#3ed4d6','#9afaf8','#1f9aa8']:['#1fb2c4','#8af0f6','#0e8aa0'],sf=clamp(1.25-h.d*.04,.55,1);
            g.fillStyle=shade(bs[0],sf);g.fillRect(x,yF,CS,yN-yF);
            for(let y=Math.floor(yF);y<yN;y+=2){
              const dist=CH*1.1*EYE/(y-hor),w=Math.sin(dist*2.2+frame*.05+c*.07)+Math.sin(dist*1.1-frame*.03+c*.13);
              if(w>1.1){g.fillStyle=shade(bs[1],sf);g.fillRect(x,y,CS,2)}else if(w<-1.2){g.fillStyle=shade(bs[2],sf);g.fillRect(x,y,CS,2)}}
            g.fillStyle=shade('#f6f6fb',sf);if(yN<CH)g.fillRect(x,yN-1,CS,2);
            g.fillStyle=shade('#c9cde0',sf);g.fillRect(x,yF,CS,1);
            if(h.jac&&hs(c,frame>>2)%30===0){g.fillStyle='#ffffff';g.fillRect(x,yF+((hs(c,7)+frame)%Math.max(1,yN-yF|0)),CS,2)}}}
        else if(h.t==='d'){                                      /* cửa phòng: 2 cánh trượt, đóng sẵn, mở khi có người lại gần */
          const top=fy-lh,u=h.lf?h.fr*.5:.5+h.fr*.5,hw=.5*(1-h.op),
            jamb=h.side===0||u<.05||u>.95,leaf=!jamb&&(u<hw||u>1-hw);
          h.occ=jamb||leaf;h.full=h.occ;h.top=top;
          if(jamb){
            g.fillStyle=shade('#5a3a1e',s);g.fillRect(x,top,CS,lh);
            g.fillStyle=shade('#8a5a34',s);g.fillRect(x,top+lh*.1,CS,lh*.36);g.fillRect(x,top+lh*.54,CS,lh*.36)}
          else if(leaf){
            const e=u<.5?hw:1-hw,de=Math.abs(u-e);
            g.fillStyle=shade('#6a4228',s);g.fillRect(x,top,CS,lh);
            g.fillStyle=shade('#8f6038',s);g.fillRect(x,top+lh*.1,CS,lh*.36);g.fillRect(x,top+lh*.54,CS,lh*.36);
            if(de<.012){g.fillStyle=shade('#2a1608',s);g.fillRect(x,top,CS,lh)}
            if(de>.03&&de<.06){g.fillStyle=shade('#e8c86a',s);g.fillRect(x,fy-lh*.52,CS,Math.max(1,lh*.06))}
            g.fillStyle=shade('#3a2210',s);g.fillRect(x,top,CS,lh*.08)}
          else{
            g.fillStyle=shade('#4a2e1e',s);g.fillRect(x,top,CS,lh*.2);
            g.fillStyle=shade('#e8c86a',s);g.fillRect(x,top+lh*.2,CS,Math.max(1,lh*.02))}}
        else if(h.t==='o'){
          const def=h.def,r=paint(g,h.o,h.kind,x,fy,lh,h.a,s,def),top=fy-lh*def[0];
          h.occ=r===1;h.full=r===1&&def[0]>=.95;h.top=top;
          if(r===1){g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x,top,CS,Math.max(1,lh*.015))}}
        else{
          const top=fy-lh;h.occ=true;h.full=true;h.top=top;
          g.fillStyle=shade('#e8e2d8',s);g.fillRect(x,top,CS,lh);
          g.fillStyle=shade('#b9a888',s);g.fillRect(x,top,CS,lh*.06);
          g.fillStyle=shade('#8a5a38',s);g.fillRect(x,fy-lh*.1,CS,lh*.1);
                    const pn=(h.fr<.05||h.fr>.95||(h.fr>.47&&h.fr<.53));
          g.fillStyle=shade(pn?'#6a4228':'#a06a40',s);g.fillRect(x,fy-lh*.34,CS,lh*.24);
          g.fillStyle=shade('#d8b060',s);g.fillRect(x,fy-lh*.36,CS,Math.max(1,lh*.025));g.fillRect(x,top+lh*.06,CS,Math.max(1,lh*.02));
          if(((h.fr*6)|0)%2===0){g.fillStyle='rgba(150,120,90,.10)';g.fillRect(x,top+lh*.08,CS,lh*.5)}
          if(((h.mx*3+h.my*5)&3)===0&&h.fr>.44&&h.fr<.56){
            g.fillStyle=shade('#6a4a1a',s);g.fillRect(x,fy-lh*.66,CS,lh*.08);
            g.fillStyle=shade('#fff0b0',Math.max(s,.8));g.fillRect(x,fy-lh*.76,CS,lh*.1);
            g.globalAlpha=.25;g.fillStyle='#ffd98a';g.fillRect(x-CS*3,fy-lh*.9,CS*7,lh*.4);g.globalAlpha=1}
          if(h.win){
            g.fillStyle=shade('#ff9a62',Math.max(s,.75));g.fillRect(x,top+lh*.28,CS,lh*.4);
            g.fillStyle=shade('#ffe0b0',Math.max(s,.75));g.fillRect(x,top+lh*.28,CS,lh*.1);
            if(h.fr<.06||h.fr>.94||(h.fr>.48&&h.fr<.52)){g.fillStyle=shade('#5a3a1e',s);g.fillRect(x,top+lh*.26,CS,lh*.44)}}}}}

    /* billboard: NPC, người chơi khác, cầu thang, dù, cọ, thang bể bơi, đèn dây, biển số phòng */
    const B=[],t=frame,BB=bbi();
    ins.forEach(p=>{
      if(p===P||p.fl!==P.fl||!(p.mem||p.pl)||p.mcl)return;
      B.push({src:p,x:p.x,y:p.y,img:sprite(p,p.moving?1+((frame>>3)&1):0),wT:2,hT:2.5,pad:2/30,a:p.mem?(.82+.1*Math.sin(t*.05+p.x)):1})});
    if(!ARU){ARU=arrow(true,255,210,63);ARD=arrow(false,124,255,240)}
    [1,SXof(i)].forEach(lx=>{
      const x=(DX0+lx+1.5)*T;
      if(i<NF-1)B.push({x,y:(DY0+9.5)*T,img:ARU,wT:1.3,hT:2.6,pad:0,a:.45+.2*Math.sin(t*.08),add:1});
      if(i>0)B.push({x,y:(DY0+22.5)*T,img:ARD,wT:1.3,hT:2.6,pad:0,a:.45+.2*Math.sin(t*.08),add:1})});
    Yf.O.forEach(o=>{
      const cxp=o.px+o.w*4,cyp=o.py+o.h*4;
      if(Math.abs(cxp/T-px)>30||Math.abs(cyp/T-py)>30)return;
      if(o.k==='pole')B.push({x:o.px+4,y:o.py+4,img:BB.par,wT:6,hT:1.5,pad:-1.7,a:1});
      else if(o.k==='palm')B.push({x:cxp,y:cyp,img:BB.palm,wT:6.8,hT:3.4,pad:-.66,a:1});
      else if(o.k==='pool')[46,58].forEach(a=>B.push({x:o.px+a,y:o.py+2,img:BB.lad,wT:1.6,hT:2.4,pad:0,a:1}))});
    if(i>=1&&YT.karst)YT.kp().forEach(([kx,by,v,s2])=>{
      const c=YT.karst(v),w=c.width*s2,hh=c.height*s2;
      B.push({x:kx+w/2,y:by,img:c,wT:w*3/8,hT:hh*3/8,pad:0,a:2.2})});
    if(i===1)for(let lx=14;lx<=84;lx+=2)[2,29].forEach(ly=>{
      const bx=(DX0+lx)*T+4,by=(DY0+ly)*T+4;
      if(Math.abs(bx/T-px)>26||Math.abs(by/T-py)>26)return;
      B.push({x:bx,y:by,img:BB.bulb,wT:.9,hT:.9,pad:-3.2,a:.55+.4*Math.sin(t*.06+lx),add:1})});
    if(i===0)YT.rooms().forEach(rm=>{
      const wy=DY0+rm.wallY,onC=rm.n?py>wy+1:py<wy;if(!onC)return;
      const emp=EMPTY.includes(rm.r),occ=YT.rooms().map((_,k)=>k).filter(k=>!EMPTY.includes(k)),k=occ.indexOf(rm.r),pn=(k>=0&&k<(nPl||1))?k+1:0;
      B.push({x:(DX0+rm.w+8)*T,y:(wy+(rm.n?1.1:-.1))*T,img:plateImg(emp?'TRỐNG':pn?'P'+pn:String(rm.id),emp?'#3a7a52':pn?'#c9a04c':'#d8d2c4'),wT:2.6,hT:1.1,pad:-2.1,a:1})});
    try{if(window.GMEM)GMEM.bills(P,B)}catch(e){oops('ghost-bills',e)}
    const inv=1/(plX*dY-dX*plY),items=[];
    B.forEach(b=>{
      const dx=b.x/T-px,dy=b.y/T-py,tx=inv*(dY*dx-dX*dy),ty=inv*(-plY*dx+plX*dy);
      if(ty<.25||ty>40)return;items.push(Object.assign(b,{tx,ty}))});
    items.sort((a,b)=>b.ty-a.ty);
    items.forEach(b=>{
      const lh=CH*1.1/b.ty,sh=lh*(b.hT/3),sw=lh*(b.wT/3),fy=hor+lh*EYE+sh*b.pad,top=fy-sh,
        sxc=CW/2*(1+b.tx/b.ty),x0=Math.round(sxc-sw/2),iw=b.img.width,ih=b.img.height;
      g.globalAlpha=b.nf?clamp(b.a,0,1):clamp(b.a*(1.25-b.ty*.03),.25,1);
      if(b.add)g.globalCompositeOperation='lighter';
      for(let xs=Math.max(0,x0-(x0&1));xs<Math.min(CW,x0+sw);xs+=CS){
        const hits=cols[Math.floor(xs/CS)];if(!hits)continue;
        let lim=CH,occ=false;
        for(const h of hits){if(h.d<b.ty&&h.occ){if(h.full){occ=true;break}lim=Math.min(lim,h.top)}}
        if(occ)continue;
        const vis=Math.min(b.add?CH+sh:fy+(b.pad<0?sh:0),lim)-top;if(vis<=0)continue;
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

    if(P.mcl){                                                   /* trong tủ: chỉ còn 1 khe chữ nhật, còn lại đen hoàn toàn */
      const sh=Math.round(CH*.14),sw=Math.round(CW*.6),y0=Math.round(CH/2-sh/2),x0=Math.round((CW-sw)/2);
      g.fillStyle='#000';
      g.fillRect(0,0,CW,y0);g.fillRect(0,y0+sh,CW,CH-y0-sh);g.fillRect(0,y0,x0,sh);g.fillRect(x0+sw,y0,CW-x0-sw,sh);
      g.fillStyle='#2a1a10';
      g.fillRect(x0-2,y0-2,sw+4,2);g.fillRect(x0-2,y0+sh,sw+4,2);g.fillRect(x0-2,y0,2,sh);g.fillRect(x0+sw,y0,2,sh)}

    g.textAlign='center';g.textBaseline='middle';
    let hint=null;
    if(P.mcl)hint='E / W A S D: chui ra · ←/→ hoặc chuột: nhìn quanh';
    else if(nearBedM(P))hint='E: Thức dậy khỏi kí ức';
    else if(nearWard(P))hint='E: Trốn vào tủ';
    else if(nearNpc(P))hint='E: Nói chuyện với bóng người';
    else if(stInfo(P.x,P.y,i))hint=stInfo(P.x,P.y,i).d>0?'Đang lên cầu thang...':'Đang xuống cầu thang...';
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
    if(M.fx&&M.fx.n===sel)lids(lidA(M.fx));
    stairFade()
  }catch(e){oops('draw',e)}};
const _step=step;
step=function(){_step();if(state!=='island')return;try{tick(Math.min(.25,DM||.016))}catch(e){oops('tick',e)}};
const _cu=clockUI;
clockUI=function(){_cu();if(memP()){const c=$('clk');if(c)c.innerHTML=c.innerHTML.replace('🚢 Du thuyền','🧠 Kí ức du thuyền')}};
const _snapP=snapP;
snapP=function(){const I=ins;ins=I.filter(p=>!p.mem);try{return _snapP()}finally{ins=I}};
const _gen=gen;
gen=function(sd){_gen(sd);M={fx:null,done:{},bed:{},ban:{t0:0,txt:''}};DR={};MREF=null;OMAP=[];OREF=[];DRS=[];DMAP=new Map();SF=null;ins=ins.filter(p=>!p.mem)};
const _mk=mkPeople;
mkPeople=function(){_mk();M.done={};M.bed={};M.fx=null;DR={};SF=null;ins=ins.filter(p=>!p.mem)};
/* Không lưu khi đang ở du thuyền / kí ức */
const _sv=save;
save=function(){
  if(memP()||YT.clock().on||allPl().some(p=>p.fl>=F0))return;
  _sv()};

/* Bản lưu cũ bị hỏng: đưa người chơi ở tầng du thuyền / kí ức về giường phòng khách */
const _rs=restore;
restore=function(s){
  try{
    s.people.forEach(o=>{
      if(o.pl&&o.fl>=F0){
        const rid=window.guestRooms&&window.guestRooms.of(o.pl),
          b=rid!==undefined?BEDS.find(q=>q.fl===2&&q.room===rid):null;
        o.fl=2;o.inn=1;o.x=(b?b.x+.5:59.5)*T;o.y=(b?b.y+.5:25.5)*T}})
  }catch(e){oops('restore',e)}
  _rs(s)};
window.memoryWorld={enter:n=>enterMemory(n||sel,'bed'),wake:n=>wakeMem(n||sel,'Bạn tỉnh dậy.'),drowsy:()=>DR};
console.log('[memory] đã nạp OK (bản 3: khe tủ 160°, cửa tự động, trần nhà)');
})();

/* ===== resume.js: LƯU / TIẾP TỤC NGAY TẠI CHỖ KHI ĐANG Ở DU THUYỀN HOẶC KÍ ỨC =====
   Nạp CUỐI CÙNG, sau G1.js:  <script src="../js/resume.js"></script>
   Nguyên nhân lỗi cũ: yacht.js và G1.js chặn save() khi đang ở giấc mơ / kí ức,
   nên bản lưu cuối luôn là lúc người chơi còn nằm trên giường ở đảo.
   Cách sửa:
   - save(): vẫn lưu bình thường, và nếu có người ở du thuyền (tầng 27-30) hoặc kí ức (tầng 31-34)
     thì lưu thêm tầng, tọa độ, hướng nhìn và đồng hồ du thuyền vào khóa riêng.
   - restore(): khi bấm "Tiếp tục", đặt người chơi lại đúng tầng và đúng vị trí đó,
     bật lại đồng hồ du thuyền, dựng lại các tầng kí ức. */
(()=>{
const need=['save','restore','allPl','snapP','putIn','syncView','FL','IW','T'];
const miss=need.filter(n=>{try{return new Function('return typeof '+n)()==='undefined'}catch(_){return true}});
if(miss.length||!window.yachtDream){console.warn('resume.js: hãy nạp CUỐI CÙNG (sau G1.js). Thiếu: '+miss.join(', '));return}

const YT=window.yachtDream,F0=27,FM=31,NF=4,DK='deadisland:dreamresume';
const inDream=p=>p.fl>=F0&&p.fl<F0+2*NF+0&&p.fl<=FM+NF-1;

/* ---------- Lưu ---------- */
save=function(){
  if(state!=='island')return;
  try{
    localStorage.setItem(KEY,JSON.stringify({v:1,seed,nPl,gm,people:snapP(),snap,hunt:HUNT,acc:ACC}));
    const L=allPl().filter(inDream);
    if(L.length){
      const pl={};
      L.forEach(p=>{pl[p.pl]={fl:p.fl,x:p.x,y:p.y,yaw:p.yaw||0}});
      localStorage.setItem(DK,JSON.stringify({seed,on:YT.clock().on?1:0,g:gm,pl}))}
    else localStorage.removeItem(DK)
  }catch(_){}};

/* ---------- Tiếp tục ---------- */
const _rs=restore;
restore=function(s){
  let D=null;
  /* chỉ áp dụng khi bấm "Tiếp tục" (lúc đó state chưa phải 'island'), không áp dụng khi reset về đầu ngày/tuần */
  if(state!=='island'){
    try{const o=JSON.parse(localStorage.getItem(DK));if(o&&o.seed===seed&&o.pl&&Object.keys(o.pl).length)D=o}catch(_){}}
  if(D){
    /* dựng sẵn các tầng kí ức để syncView không bị lỗi */
    const Y=YT.floors();
    if(Y&&Y[0])for(let i=0;i<NF;i++)if(Y[i]&&FL[F0+i])FL[FM+i]={im:Y[i].im,rid:Y[i].rid,RM:FL[F0+i].RM};
    /* G1.js sẽ đưa người ở tầng >=27 về giường: tạm đổi sang tầng 2 để nó bỏ qua, sau đó đặt lại đúng chỗ */
    s.people.forEach(o=>{if(o.pl&&D.pl[o.pl]){o.fl=2;o.inn=1}})}
  _rs(s);
  if(!D)return;
  try{
    const c=YT.clock();
    c.on=1;c.g=D.g;c.pend=0;c.ending=0;gm=D.g;
    Object.keys(D.pl).forEach(k=>{
      const q=allPl().find(p=>p.pl===+k),d=D.pl[k];if(!q)return;
      putIn(q,d.fl,d.x/T,d.y/T);
      q.yaw=d.yaw;q.vis=1;q.act='idle';q.cl=null;q.mcl=null;q.mb=0;q.sz=0;q.sk=0;q.yb=40;
      q.wakeT=performance.now()/1000-3});
    syncView(true);
    if(typeof clockUI==='function')clockUI()
  }catch(e){console.error('[resume]',e)}};
console.log('[resume] đã nạp OK');
})();



/* ===== G2.js: OAN HỒN TRONG KÍ ỨC DU THUYỀN DANOVA =====
   Nạp SAU G1.js:  <script src="../js/G2.js"></script>   (cần thêm 3 sửa nhỏ trong G1.js, xem hướng dẫn)
   - Đêm đầu tiên, trong kí ức có 1 oan hồn cầm liềm (giống oan hồn trong hang) đi tuần ở hành lang / các tầng / lẻn vào phòng.
   - Trời tối: NPC về phòng của mình, ngủ hoặc tắm / ăn / đi vệ sinh rồi ngủ.
   - Oan hồn lại gần: đèn đỏ nhấp nháy viền màn hình, càng gần càng đậm (không che giữa màn hình).
   - Thấy người chơi (ưu tiên) hoặc NPC: cười, rồi đuổi (nhanh hơn người chơi một chút). Bắt được thì xé xác hoặc chém.
   - Mất tầm nhìn: đuổi tới chỗ cuối cùng thấy, nếu là cửa phòng thì vào phòng kiểm tra vài giây rồi bỏ đi tuần tiếp.
   - Trốn tủ: an toàn, trừ khi oan hồn đang thấy bạn ở rất gần lúc bạn chui vào (C.seenEntry, đặt 0 để tắt).
   - Mỗi đêm chỉ giết ngẫu nhiên 1-2 NPC. */
(()=>{
const need=['ins','sel','bfs','sprite','hour','cap','allPl','setSel','infoUI','gameOver','step','draw','ctrl','gen','mkPeople','ri','rnd','hs','keys'];
const miss=need.filter(n=>{try{return new Function('return typeof '+n)()==='undefined'}catch(_){return true}});
if(miss.length||!window.memoryWorld||!window.yachtDream||typeof window.yachtDream.floors!=='function'){
  console.warn('G2.js: hãy nạp SAU G1.js'+(miss.length?' (thiếu '+miss.join(', ')+')':''));return}

const YT=window.yachtDream,F0=27,FM=31,NF=4,DX0=14,DY0=12,LENS=[138,98,98,98];
const isY=f=>f>=F0&&f<F0+NF;
/* ---------- Thông số (px / giây; người chơi đi 66, đi chậm Shift 36) ---------- */
const C={
  firstOnly:true,      /* true: chỉ đêm đầu tiên có oan hồn; false: mọi đêm */
  spawnDelay:8,        /* giây sau khi có người vào kí ức thì oan hồn xuất hiện */
  patrol:30,           /* tốc độ đi tuần */
  chase:74,            /* tốc độ đuổi (hơn người chơi 66 một chút) */
  sight:150,           /* tầm nhìn */
  hear:42,             /* nghe tiếng bước chân khi người chơi đang đi (không Shift) */
  catch:10,            /* khoảng cách bắt được */
  lose:2.4,            /* giây mất tầm nhìn thì bỏ đuổi, chuyển sang tìm */
  notice:.9,           /* giây cười / gầm trước khi đuổi */
  check:[6,9],         /* giây kiểm tra trong phòng */
  seenEntry:70,        /* thấy người chơi chui vào tủ ở trong bán kính này thì biết đường lôi ra */
  near:26,far:240,     /* viền đỏ: đậm nhất ở near, bắt đầu hiện ở far */
  quota:[1,2],         /* số NPC bị giết mỗi đêm */
  home:0,              /* tầng 4 = chỉ số 0 */
  homeSpawn:1,         /* 100% xuất hiện ở tầng nhà */
  stayHome:true,       /* TẠM THỜI: oan hồn không bao giờ đổi tầng */
  awayStay:[12,25],    /* giây ở tầng khác rồi quay về */
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
const rf=(a,b)=>a+Math.random()*(b-a);
const stay=j=>j===C.home?rf(C.homeStay[0],C.homeStay[1]):rf(C.awayStay[0],C.awayStay[1]);
const SXof=i=>i===0?116:92;
const isM=f=>f>=FM&&f<FM+NF;
const warned={};const oops=(n,e)=>{if(!warned[n]){warned[n]=1;console.error('[ghost-mem] lỗi trong '+n+':',e)}};
const memPlayers=()=>ins.filter(p=>p.pl&&isM(p.fl));
const npcs=()=>ins.filter(p=>p.mem&&!p.dead);
const nidNow=()=>Math.floor((YT.clock().g-960)/1440);
const nightOK=()=>{if(!YT.clock().on)return false;const h=hour();return h>=22||h<6};
const keyOf=p=>[p.mroom,p.k,p.c,p.skin,p.hair].join('|');

let G=null,K={nid:-9,quota:0,kills:0,dead:[],wk:0},CORP=[],BP=[],PM={},S={t:0},SU=null,ROOMS=[],DOORS=[],DKEY=new Map(),SP={},LOW=[],BT=new Set();
const LOWK=new Set(['bed','tbl','chair','stand','banq','plant','toilet','sink','sofa','lounger','stool','pool','bar','jac']);

/* ================= DỮ LIỆU TẦNG ================= */
function setup(){
  const Y=YT.floors();if(!Y||!Y[0])return false;
  if(SU===Y)return true;
  SU=Y;ROOMS=YT.rooms();DOORS=[];DKEY=new Map();
  ROOMS.forEach(rm=>{const x1=DX0+rm.w+7,y=DY0+rm.wallY,d={px:(x1+1)*T,py:(y+.5)*T,g:false};DOORS.push(d);DKEY.set(y*IW+x1,d);DKEY.set(y*IW+x1+1,d)});
  SP={};YT.spots().forEach(s=>{if(!s.room)return;const o=SP[s.room]||(SP[s.room]={bed:[],shower:[],wc:[],desk:[]});if(o[s.k])o[s.k].push(s)});
  LOW=Y.map(f=>{const set=new Set();f.O.forEach(o=>{if(LOWK.has(o.k))for(let yy=o.y;yy<o.y+o.h;yy++)for(let xx=o.x;xx<o.x+o.w;xx++)set.add(yy*IW+xx)});return set});
  return true}
function okT(j,x,y){const f=YT.floors()[j];if(!f||!f.im[y]||f.im[y][x]!==0)return false;const k=(f.kd[y]||[])[x]|0;return k===1||k===2||k===3||k===4||k===10}
function roomAt(x,y,fl){if(fl!==FM)return null;const f=YT.floors()[0],r=((f.RID[Math.floor(y/T)]||[])[Math.floor(x/T)])|0;return r?ROOMS[r-1]:null}
function roomNearDoor(x,y,fl){if(fl!==FM)return null;const i=DOORS.findIndex(d=>Math.hypot(x-d.px,y-d.py)<30);return i>=0?ROOMS[i]:null}
function roomPoint(rm){for(let t=0;t<30;t++){const x=DX0+rm.x0+rnd(rm.x1-rm.x0+1),y=DY0+rm.y0+rnd(rm.y1-rm.y0+1);if(okT(0,x,y))return[x*T+4,y*T+4]}return null}
function freeNear(j,tx,ty){
  const f=YT.floors()[j];
  for(let r=0;r<=14;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
    const X=tx+dx,Y=ty+dy;if(okT(j,X,Y)&&!(j===0&&((f.RID[Y]||[])[X]|0)))return[X,Y]}
  return null}
function pickTileOn(j){
  for(let t=0;t<80;t++){
    if(j===0){const x=DX0+2+rnd(116),y=DY0+13+rnd(6);if(okT(0,x,y)&&((YT.floors()[0].kd[y]||[])[x]|0)===3)return[x*T+4,y*T+4]}
    else{const x=DX0+2+rnd(LENS[j]-12),y=DY0+2+rnd(28);if(okT(j,x,y))return[x*T+4,y*T+4]}}
  return null}
/* đổi tầng bằng cầu thang (ghost và NPC dùng chung) */
function swapFloor(e,d){
  const i=e.fl-FM,j=i+d;if(j<0||j>=NF)return;
  const left=Math.floor(e.x/T)-DX0<=3;
  let nx=e.x/T+(left?0:SXof(j)-SXof(i)),ny=DY0+(d>0?7.45:24.55);
  if(!okT(j,Math.floor(nx),Math.floor(ny))){const t=freeNear(j,Math.floor(nx),Math.floor(ny));if(t){nx=t[0]+.5;ny=t[1]+.5}}
  e.fl=FM+j;e.x=nx*T;e.y=ny*T;if(e.tx!==undefined){e.tx=e.x;e.ty=e.y}e.path=[]}

/* ================= TẦM NHÌN / ĐƯỜNG ĐI ================= */
function updateDoors(){
  const ents=ins.filter(p=>p.fl===FM&&(p.pl||p.mem)&&!p.mcl);
  DOORS.forEach(d=>{
    let n=ents.some(p=>Math.hypot(p.x-d.px,p.y-d.py)<40);
    if(!n&&G&&G.fl===FM&&Math.hypot(G.x-d.px,G.y-d.py)<40)n=true;
    d.g=n})}
/* strict=true: kiểm tra đường đi (đồ thấp cũng chặn); false: tầm nhìn (đồ thấp trong suốt, cửa đóng chặn) */
function ray(f,x0,y0,x1,y1,strict){
  const dx=x1-x0,dy=y1-y0,n=Math.ceil(Math.hypot(dx,dy)/3),im=FL[f].im,low=LOW[f>=FM?f-FM:f-F0];
  for(let i=1;i<n;i++){
    const tx=Math.floor((x0+dx*i/n)/T),ty=Math.floor((y0+dy*i/n)/T),row=im[ty];
    if(!row)return false;
    if(row[tx]!==0){if(strict||!(low&&low.has(ty*IW+tx)))return false}
    else if(!strict&&f===FM){const d=DKEY.get(ty*IW+tx);if(d&&!d.g)return false}}
  return true}
function gmove(tx,ty,sp){
  const dx=tx-G.x,dy=ty-G.y,d=Math.hypot(dx,dy);if(d<.01)return true;
  const k=Math.min(1,sp/d),nx=G.x+dx*k,ny=G.y+dy*k,im=FL[G.fl].im,
    ok=(x,y)=>{const r=im[Math.floor(y/T)];return !!r&&r[Math.floor(x/T)]===0};
  if(ok(nx,ny)){G.x=nx;G.y=ny}else if(ok(nx,G.y))G.x=nx;else if(ok(G.x,ny))G.y=ny;
  return d<=sp}
function pathTo(x,y){const a=bfs(G.fl,Math.floor(G.x/T),Math.floor(G.y/T),Math.floor(x/T),Math.floor(y/T));G.path=a||[];return !!a}
function follow(sp){if(!G.path.length)return true;const t=G.path[0];if(gmove(t[0],t[1],sp))G.path.shift();return !G.path.length}
function pathNpc(p,x,y){const a=bfs(p.fl,Math.floor(p.x/T),Math.floor(p.y/T),Math.floor(x/T),Math.floor(y/T));if(a){p.path=a;p.tx=p.x;p.ty=p.y;return true}return false}

/* ================= HÌNH ẢNH ================= */
const GWc=64,GHc=76,GU=19,GC=document.createElement('canvas');GC.width=GWc;GC.height=GHc;const GX=GC.getContext('2d');
const GLW=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),r=g.createRadialGradient(16,16,1,16,16,16);
  r.addColorStop(0,'rgba(255,90,70,.9)');r.addColorStop(.4,'rgba(255,40,40,.35)');r.addColorStop(1,'rgba(255,0,0,0)');g.fillStyle=r;g.fillRect(0,0,32,32);return c})();
function paintGhost(o){
  const g=GX,st=o.st,t=frame,ag=st==='chase'||st==='slash'||st==='grab',gp=st==='laugh'||st==='grab';
  g.clearRect(0,0,GWc,GHc);g.imageSmoothingEnabled=false;g.globalAlpha=1;
  const R=(c,a,b,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(32+a),Math.round(68+b),w,h)};
  const L=(c,x0,y0,x1,y1,w)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));g.fillStyle=c;
    for(let i=0;i<=n;i++)g.fillRect(Math.round(32+x0+(x1-x0)*i/n-w/2),Math.round(68+y0+(y1-y0)*i/n-w/2),w,w)};
  const sw=Math.sin(t*.06),skin='#cfc6bd',sk2='#9a9187',bone='#e9e2dc',ink='#0c0a10';
  g.globalAlpha=(.12+.05*Math.sin(t*.1))*(ag?1.8:1);R(ag?'#ff8a80':'#cfe6ff',-18,-66,36,70);g.globalAlpha=1;
  const scythe=(hx,hy,a,len,bl)=>{
    const dx=Math.cos(a),dy=Math.sin(a);
    L('#4a3b2c',hx-dx*26,hy-dy*26,hx+dx*len,hy+dy*len,2);
    const tx=hx+dx*len,ty=hy+dy*len,px=-dy,py=dx;
    for(let i=0;i<=22;i++){const u=i/22,x=tx+px*u*bl-dx*u*u*12,y=ty+py*u*bl-dy*u*u*12,w=u<.7?3:2;
      g.fillStyle=u<.3?'#8a95a3':'#e6edf5';g.fillRect(Math.round(32+x-w/2),Math.round(68+y-w/2),w,w)}};
  const arm=(sx,sy,ex,ey,hx,hy)=>{
    L(skin,sx,sy,ex,ey,2);L(sk2,sx+1,sy,ex+1,ey,1);L(skin,ex,ey,hx,hy,2);R(bone,ex-1,ey-1,3,3);
    const dx=hx-ex,dy=hy-ey,l=Math.hypot(dx,dy)||1,ba=Math.atan2(dy,dx);
    for(let k=-2;k<=2;k++){const a=ba+k*.38;L(k%2?bone:skin,hx,hy,hx+Math.cos(a)*7,hy+Math.sin(a)*7,1)}};
  const slash=st==='slash',pr=o.p||0,sa=-2.4+3.2*pr;
  if(!slash&&st!=='grab')scythe(ag?12:14,ag?-34:-22,ag?-1.15:-1.5,44,16);
  /* áo choàng rách, dài, hở xương sườn */
  for(let y=-50;y<=0;y++){
    const hw=Math.round(y<-30?6-(y+50)/20*2:4+(y+30)/30*10),ox=Math.round(sw*((y+50)/50)*2.2);
    R(y%7===0?'#a9a59a':'#d6d2c6',-hw+ox,y,hw*2,1);R('#ece8dc',-hw+ox,y,2,1);R(sk2,hw-3+ox,y,3,1);
    if(y>-48&&y<-34&&y%3===0)R('#4a4840',-hw+3+ox,y,hw*2-6,1)}
  const ox0=Math.round(sw*2.2);
  for(let i=-14;i<=14;i+=2){const ln2=2+((hs(i+20,5)+(t>>3))%8);R(i%4?'#bdb9ae':'#8f8b80',i+ox0,0,2,ln2)}
  [[-3,-22,3,5],[4,-14,2,6],[-8,-9,2,4],[0,-34,2,3]].forEach(a=>R('#8a0a12',a[0]+ox0,a[1],a[2],a[3]));
  /* cổ dài + đầu thuôn */
  const hx=Math.round(Math.sin(t*.05)*1.5)+(gp?0:0);
  L(skin,ox0*0,-50,hx,-56,3);
  R(bone,-4+hx,-66,8,11);R(sk2,2+hx,-66,2,11);
  /* tóc đen rất dài che mặt */
  R(ink,-7+hx,-69,14,4);R(ink,-8+hx,-66,16,3);
  for(let y=-66;y<=-14;y++){const wv=Math.round(Math.sin(t*.07+y*.12)*1.6),w=y<-40?4:3;R(ink,-9+wv+hx*(y<-56?1:0),y,w,1);R(ink,6+wv+hx*(y<-56?1:0)-(w-3),y,w,1)}
  /* mắt đỏ, miệng toác */
  R('#000',-3+hx,-63,3,4);R('#000',1+hx,-63,3,4);
  g.globalAlpha=.4;R('#ff2a2a',-4+hx,-64,5,6);R('#ff2a2a',0+hx,-64,5,6);g.globalAlpha=1;
  R(ag?'#ff3a2a':'#ff6a5a',-2+hx,-62,2,2);R(ag?'#ff3a2a':'#ff6a5a',2+hx,-62,2,2);R('#fff',-2+hx,-62,1,1);R('#fff',2+hx,-62,1,1);
  const mh=gp?8:3;R('#14070b',-3+hx,-57,6,mh);
  for(let i=-3;i<3;i+=2){R('#f4f4ee',i+hx,-57,1,2);R('#f4f4ee',i+hx,-57+mh-2,1,2)}
  for(let y=-64;y<=-52;y++)R(ink,-4+hx+Math.round(Math.sin(t*.08+y)*.8),y,1,1);
  /* tay dài tới đầu gối, móng vuốt dài */
  const lh=Math.round(Math.sin(t*.07)*1.5);
  if(st==='grab'){arm(-6,-47,-18,-44,-27,-60);arm(6,-47,18,-44,27,-60)}
  else if(ag){arm(-6,-47,-16,-42,-21,-56+lh);
    if(slash)arm(6,-47,16,-40,10+Math.round(Math.cos(sa)*0),-30);else arm(6,-47,13,-40,12,-34)}
  else{arm(-6,-47,-11,-26+lh,-10,-6+lh);arm(6,-47,12,-36,14,-22)}
  if(slash)scythe(10,-30,sa,26,11);
  if(st==='grab'){R('#8a0a12',-27,-58,2,6);R('#8a0a12',26,-58,2,6)}
}

const LC=new Map();
function lieImg(p,blood){
  const key=[p.k,p.c,p.skin,p.hair,blood?1:0].join('|');let c=LC.get(key);if(c)return c;
  const s=sprite(p,0);c=document.createElement('canvas');c.width=30;c.height=24;const g=c.getContext('2d');
  g.imageSmoothingEnabled=false;g.translate(15,12);g.rotate(-Math.PI/2);g.drawImage(s,-12,-15);g.setTransform(1,0,0,1,0,0);
  if(blood){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(150,6,12,.78)';[[8,8,10,8],[16,12,8,6],[4,14,6,5],[12,3,5,5]].forEach(a=>g.fillRect(a[0],a[1],a[2],a[3]));g.globalCompositeOperation='source-over'}
  LC.set(key,c);return c}
const HC=new Map();
function halves(p){
  const key=[p.k,p.c,p.skin,p.hair].join('|');let h=HC.get(key);if(h)return h;
  const L=lieImg(p,true),a=document.createElement('canvas'),b=document.createElement('canvas');
  a.width=16;a.height=24;b.width=14;b.height=24;
  a.getContext('2d').drawImage(L,0,0,16,24,0,0,16,24);b.getContext('2d').drawImage(L,16,0,14,24,0,0,14,24);
  h=[a,b];HC.set(key,h);return h}
const POOL=document.createElement('canvas');POOL.width=44;POOL.height=10;
(()=>{const g=POOL.getContext('2d');for(let y=0;y<10;y++)for(let x=0;x<44;x++){const d=Math.pow((x-21.5)/22,2)+Math.pow((y-4.5)/5,2);if(d<1){g.fillStyle=d<.5?'#5a0508':'#7a0a10';g.fillRect(x,y,1,1)}}
  g.fillStyle='#a8121c';[[10,3],[22,5],[30,4],[16,6]].forEach(a=>g.fillRect(a[0],a[1],2,1))})();
const BI=['#8a0a12','#c4121c','#5a0508'].map(c=>{const k=document.createElement('canvas');k.width=k.height=4;const g=k.getContext('2d');g.fillStyle=c;g.fillRect(0,0,4,4);return k});

/* ================= MÁU / XÁC ================= */
function splat(v,n){
  for(let i=0;i<n;i++){const a=Math.random()*6.28,s=rf(8,34);
    BP.push({fl:v.fl,x:v.x,y:v.y,z:rf(.15,.65),vx:Math.cos(a)*s,vy:Math.sin(a)*s,vz:rf(.3,1.5),c:rnd(3)})}
  if(BP.length>220)BP.splice(0,BP.length-220)}
function npcDie(p,kt){
  ins=ins.filter(q=>q!==p);p.dead=1;K.kills++;K.dead.push(keyOf(p));
  CORP.push({fl:p.fl,x:p.x,y:p.y,kt,bed:p.act==='sleep',t0:YT.clock().g,sn:{},al:{},p:{k:p.k,c:p.c,skin:p.skin,hair:p.hair}});
  splat(p,24);
  const P=ins.find(q=>q.pl===sel&&isM(q.fl));
  if(P)cap(P.fl===p.fl&&Math.hypot(P.x-p.x,P.y-p.y)<220?'Oan hồn '+(kt==='rip'?'xé xác':'chém chết')+' một người ngay trước mắt bạn!':'Một tiếng thét thất thanh vang lên rồi im bặt... có ai đó vừa bị giết.')}
function instantKill(n,kt){
  const V=allPl().find(p=>p.pl===n);if(!V)return;
  flash=24;LS={t:0,fin:0};
  people=people.filter(p=>p.pl!==n);ins=ins.filter(p=>p.pl!==n);
  const L=allPl();
  if(!L.length){gameOver();return}
  cap('P'+n+' đã bị oan hồn '+(kt==='rip'?'xé xác':'chém chết')+' trong kí ức...');
  if(sel===n)setSel(L[0].pl);else infoUI()}

/* ================= NPC: TỐI THÌ VỀ PHÒNG ================= */
function npcInit(p){
  const g=p.g2={};
  if(K.dead.includes(keyOf(p))){ins=ins.filter(q=>q!==p);p.dead=1;return}
  p.mh=1;g.sp0=p.sp;g.rm=ROOMS[(p.mroom|0)-1]||null;g.rp=0;g.t=0;g.fail=0;g.wt=0;g.tgt=null;g.plan=[];
  if(Math.random()<.5)g.plan=['eat','shower','wc'].filter(()=>Math.random()<.5).sort(()=>Math.random()-.5);
  g.st=p.fl===FM?'home':'down';
  if(!K.wk&&Math.random()<.12){K.wk=1;g.walk=1;g.st='walk';g.wt=0;g.rp=0;g.wlim=rf(70,120)}   /* ~83% có 1 người đi dạo mỗi đêm */
  else if(g.rm&&Math.random()<.45)sleepAt(p)}
function sleepAt(p,s){
  const g=p.g2,rm=g.rm;if(!rm)return false;
  if(!s){const L=(SP[rm.id]||{}).bed||[];s=L.find(b=>!BT.has(b))||L[0]}
  if(!s)return false;
  BT.add(s);p.fl=FM;p.x=p.tx=s.sx;p.y=p.ty=s.sy;p.path=[];p.act='sleep';p.t=0;g.st='sleep';g.tgt=null;return true}
function flee(p){
  for(let t=0;t<14;t++){
    const a=Math.random()*6.28,r=60+Math.random()*120,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r,tx=Math.floor(x/T),ty=Math.floor(y/T);
    if(!okT(p.fl-FM,tx,ty)||Math.hypot(x-G.x,y-G.y)<Math.hypot(p.x-G.x,p.y-G.y))continue;
    if(pathNpc(p,tx*T+4,ty*T+4)&&p.path.length<70)return}}
function npcTick(p,dt){
  const g=p.g2;if(!g||p.dead)return;
  if(p.dying){p.path=[];p.tx=p.x;p.ty=p.y;return}
  if(G&&G.st==='chase'&&G.tgt===p&&p.fl===G.fl&&g.st!=='sleep'){
    if(!g.flee){g.flee=1;p.sp=.95;g.fr=0;p.act='idle'}
    g.fr-=dt;if(g.fr<=0||(!p.path.length&&Math.hypot(p.tx-p.x,p.ty-p.y)<=.7)){g.fr=.9;flee(p)}
    return}
  if(g.flee){g.flee=0;p.sp=g.sp0;g.st=g.walk?'walk':(p.fl===FM?'home':'down');g.tgt=null}
  switch(g.st ){   
    case 'roam':case 'walk':{
    if(!g.wlim)g.wlim=rf(60,100);
    g.wt=(g.wt||0)+dt;
    if(g.wt>g.wlim){g.walk=0;g.wt=0;g.st=p.fl===FM?'home':'down';g.tgt=null;break}
    if(p.path.length||Math.hypot(p.tx-p.x,p.ty-p.y)>.7)break;
    g.rp=(g.rp||0)-dt;if(g.rp>0)break;g.rp=rf(1.5,4);
    if(Math.random()<.08){const j=p.fl-FM,d=Math.random()<.5?1:-1;if(j+d>=0&&j+d<NF){swapFloor(p,d);break}}
    const tp=pickTileOn(p.fl-FM);if(tp)pathNpc(p,tp[0],tp[1]);
    break}
  case 'sleep':p.act='sleep';break;
  case 'down':{
    if(p.fl===FM){g.st='home';break}
    const tx=(DX0+2)*T+4,ty=(DY0+22)*T+4;g.t+=dt;g.rp-=dt;
    if(Math.hypot(p.x-tx,p.y-ty)<9||g.t>40){swapFloor(p,-1);g.t=0;break}
    if(!p.path.length&&Math.hypot(p.tx-p.x,p.ty-p.y)<=.7&&g.rp<=0){g.rp=1;pathNpc(p,tx,ty)}
    break}
  case 'home':{
    const rm=g.rm;if(!rm){g.st='roam';break}
    if(!g.tgt){
      const kind=g.plan.length?g.plan[0]:'bed',L=(SP[rm.id]||{})[kind]||[];
      const s=kind==='bed'?(L.find(b=>!BT.has(b))||L[0]):L[0];
      if(!s){if(g.plan.length)g.plan.shift();else g.st='roam';break}
      g.tgt={kind,s};g.fail=0;g.wt=0;pathNpc(p,s.wx*T+4,s.wy*T+4)}
    const s=g.tgt.s,k=g.tgt.kind;g.wt+=dt;
    if(Math.hypot(p.x-(s.wx*T+4),p.y-(s.wy*T+4))<7){
      if(k==='bed')sleepAt(p,s);
      else{g.st='act';g.t=k==='shower'?rf(14,22):k==='eat'?rf(10,16):rf(6,10);g.plan.shift();g.tgt=null}}
    else if(!p.path.length&&Math.hypot(p.tx-p.x,p.ty-p.y)<=.7){
      g.fail++;if(g.fail>4||g.wt>45){p.x=p.tx=s.wx*T+4;p.y=p.ty=s.wy*T+4}else pathNpc(p,s.wx*T+4,s.wy*T+4)}
    break}
  case 'gather':{
    g.gt-=dt;
    if(g.gt<=0){g.st=g.walk?'walk':(p.fl===FM?'home':'down');g.tgt=null;p.act='idle';break}
    p.act='idle';
    if(Math.hypot(p.x-g.gx,p.y-g.gy)>16&&!p.path.length&&Math.hypot(p.tx-p.x,p.ty-p.y)<=.7){
      g.rp=(g.rp||0)-dt;if(g.rp<=0){g.rp=1.2;pathNpc(p,g.gx,g.gy)}}
    break}
  case 'act':g.t-=dt;if(g.t<=0){g.st='home';g.tgt=null}break}}

/* ================= OAN HỒN ================= */
function valid(e){return !!e&&!e.dead&&!e.dying&&!e.gk&&ins.includes(e)}
function canSee(e){
  if(!valid(e)||e.fl!==G.fl)return false;
  const isP=!!e.pl;
  if(isP&&e.mcl)return G.found===e;
  let R=C.sight;
  if(isP){if(e.pl===sel&&keys.shift&&e.moving)R*=.55;if(!e.moving)R*=.7}
  const d=Math.hypot(e.x-G.x,e.y-G.y);
  return d<=R&&ray(G.fl,G.x,G.y,e.x,e.y,false)}
function detect(){
  let best=null,bd=1e9;
  memPlayers().forEach(p=>{
    const d=Math.hypot(p.x-G.x,p.y-G.y);
    if(canSee(p)||(p.fl===G.fl&&!p.mcl&&!p.gk&&p.moving&&!(p.pl===sel&&keys.shift)&&d<C.hear)){if(d<bd){bd=d;best={e:p,isP:1}}}});
  if(best)return best;
  if(K.kills<K.quota)npcs().forEach(p=>{if(p.fl!==G.fl||!valid(p))return;const d=Math.hypot(p.x-G.x,p.y-G.y);if(d<C.sight&&canSee(p)&&d<bd){bd=d;best={e:p,isP:0}}});
  return best}
function notice(det){
  const e=det.e;G.tgt=e;G.tp=det.isP;G.st='laugh';G.t=0;G.path=[];G.goal=null;G.lx=e.x;G.ly=e.y;G.lost=0;
  if(det.isP&&e.pl===sel){cap('Oan hồn đã thấy bạn! Chạy đi, hoặc trốn vào tủ đồ (E)!');flash=Math.max(flash,10)}}
function startSearch(){
  G.st='search';G.t=0;G.ph=0;G.path=[];G.goal=null;G.tgt=null;G.found=null;G.lk=0;
  G.room=roomAt(G.lx,G.ly,G.fl)||roomNearDoor(G.lx,G.ly,G.fl);
  G.dur=G.room?rf(C.check[0],C.check[1]):rf(2,3.5);
  let sx=G.lx,sy=G.ly;if(G.room){const pt=roomPoint(G.room);if(pt){sx=pt[0];sy=pt[1]}}
  pathTo(sx,sy)}
function startKill(v,isP){
  G.st='kill';G.t=0;G.hit=0;G.v=v;G.vp=isP;G.kt=Math.random()<.5?'slash':'rip';G.path=[];
  if(isP){v.gk=1;v.moving=0;if(v.mcl){v.mcl=null;v.mcy=undefined;cap('Oan hồn giật tung cánh cửa tủ!')}}
  else v.dying={t:0,type:G.kt}}
function endKill(){
  const v=G.v,isP=G.vp,kt=G.kt;
  G.st='patrol';G.wait=rf(2.5,4);G.goal=null;G.path=[];G.tgt=null;G.found=null;G.v=null;
  if(isP){v.gk=0;instantKill(v.pl,kt)}else npcDie(v,kt)}
function killTick(dt){
  const v=G.v;
  if(!v||!ins.includes(v)){if(v)v.gk=0;G.st='patrol';G.wait=1;G.v=null;return}
  G.t+=dt;
  const d=Math.hypot(v.x-G.x,v.y-G.y);
  if(G.kt==='rip'&&d>6)gmove(v.x,v.y,50*dt);
  if(G.vp){const a=Math.atan2(G.y-v.y,G.x-v.x);v.yaw=(v.yaw||0)+wrapA(a-(v.yaw||0))*Math.min(1,dt*9);v.moving=0;v.path=[]}
  else{v.dying.t=G.t;v.path=[];v.tx=v.x;v.ty=v.y;v.moving=0}
  if(G.kt==='slash'){
    if(!G.hit&&G.t>=.75){G.hit=1;splat(v,G.vp?20:40);if(G.vp)flash=22}
    if(G.t>=1.2)endKill()}
  else{
    if(G.t>.35&&frame%3===0)splat(v,2);
    if(!G.hit&&G.t>=1.3){G.hit=1;splat(v,50);if(G.vp)flash=22}
    if(G.t>=1.75)endKill()}}
function pickStairDir(){
  const i=G.fl-FM;
  if(i===C.home){
    const opt=[];if(i<NF-1)opt.push(1);if(i>0)opt.push(-1);
    return opt.length?opt[rnd(opt.length)]:0}
  const back=C.home>i?1:-1,away=-back,n=i+away;
  if(Math.random()<.3&&n>=0&&n<NF)return away;   /* thỉnh thoảng đi xa thêm 1 tầng */
  return back}
function pickDest(){
  const j=G.fl-FM,r=Math.random();
  if(j===0){
    if(K.kills<K.quota&&r<.45){const L=npcs().filter(p=>p.fl===FM&&valid(p));if(L.length){const rm=ROOMS[(L[rnd(L.length)].mroom|0)-1];if(rm){const pt=roomPoint(rm);if(pt)return pt}}}
    if(r>.8){const pt=roomPoint(ROOMS[rnd(ROOMS.length)]);if(pt)return pt}}
  return pickTileOn(j)}
function spawn(){
  const A=memPlayers();if(!A.length||!setup())return false;
  let j=C.home;
if(Math.random()>C.homeSpawn){const o=[];for(let q=0;q<NF;q++)if(q!==C.home)o.push(q);j=o[rnd(o.length)]}
  for(let t=0;t<60;t++){
    const p=pickTileOn(j);if(!p)continue;
    if(A.some(a=>a.fl===FM+j&&Math.hypot(a.x-p[0],a.y-p[1])<160))continue;
    G={fl:FM+j,x:p[0],y:p[1],dir:1,st:'spawn',t:0,path:[],goal:null,wait:0,tgt:null,tp:false,lx:p[0],ly:p[1],lost:0,rep:0,vt:0,flr:stay(j),alpha:0,room:null,found:null,v:null,sc:0,ox:p[0],oy:p[1],ph:0,dur:0,lk:0};
    cap('Đâu đó trên du thuyền vang lên tiếng liềm kéo lê trên sàn... Đêm nay có thứ gì đó đang đi tuần.');
    return true}
  return false}

function ghostTick(dt){
  if(!G){S.t+=dt;if(S.t>=C.spawnDelay)spawn();return}
  G.t+=dt;
  G.vt-=dt;let det=null;if(G.vt<=0){G.vt=.15;det=detect()}
  /* người chơi chui vào tủ ngay trước mắt oan hồn */
  memPlayers().forEach(p=>{
    if(p.mcl&&!PM[p.pl]&&C.seenEntry>0&&(G.st==='chase'||G.st==='laugh')&&G.tgt===p&&p.fl===G.fl&&Math.hypot(p.x-G.x,p.y-G.y)<C.seenEntry&&ray(G.fl,G.x,G.y,p.x,p.y,false)){G.found=p}});
  switch(G.st){
  case 'spawn':G.alpha=Math.min(1,G.t/1.6);if(G.t>=1.6){G.alpha=1;G.st='patrol';G.wait=1}break;
  case 'patrol':{
    G.alpha=1;
    if(det){notice(det);break}
    G.flr-=dt;
    if(G.wait>0){G.wait-=dt;break}
    if(!G.goal){
      if(G.flr<=0){const d=pickStairDir();if(d){const i=G.fl-FM,left=Math.random()<.5;G.goal={stair:d,x:(DX0+(left?2:SXof(i)+1))*T+4,y:(DY0+(d>0?9:22))*T+4}}G.flr=stay(G.fl-FM)}
      if(!G.goal){const p=pickDest();if(p)G.goal={x:p[0],y:p[1]};else{G.wait=.5;break}}
      if(!pathTo(G.goal.x,G.goal.y)){G.goal=null;G.wait=.6;break}
      G.sc=0;G.ox=G.x;G.oy=G.y}
    const done=follow(C.patrol*dt);
    G.sc+=dt;if(G.sc>1.2){if(Math.hypot(G.x-G.ox,G.y-G.oy)<2){G.goal=null;G.path=[];G.wait=.3}G.sc=0;G.ox=G.x;G.oy=G.y}
    if(G.goal&&(done||Math.hypot(G.x-G.goal.x,G.y-G.goal.y)<7)){if(G.goal.stair){swapFloor(G,G.goal.stair);G.flr=stay(G.fl-FM)}G.goal=null;G.wait=rf(1,3)}
    break}
  case 'laugh':{
    const e=G.tgt;
    if(!valid(e)){G.st='patrol';G.wait=1;break}
    if(G.t>=C.notice){G.st='chase';G.lost=0;G.rep=0;G.path=[]}
    break}
  case 'chase':{
    const e=G.tgt;
    if(!valid(e)||e.fl!==G.fl){if(valid(e)||G.lx!==undefined)startSearch();break}
    const vis=G.found===e||canSee(e);
    if(vis){G.lx=e.x;G.ly=e.y;G.lost=0}else G.lost+=dt;
    if(!G.tp&&det&&det.isP){G.tgt=det.e;G.tp=true}
    const d=Math.hypot(e.x-G.x,e.y-G.y);
    if(vis&&d<C.catch){startKill(e,!!e.pl);break}
    const sp=C.chase*dt;
    if(vis&&ray(G.fl,G.x,G.y,e.x,e.y,true)){gmove(e.x,e.y,sp);G.path=[]}
    else{
      G.rep-=dt;
      if(G.rep<=0||(!G.path.length&&Math.hypot(G.x-G.lx,G.y-G.ly)>8)){G.rep=.35;pathTo(vis?e.x:G.lx,vis?e.y:G.ly)}
      follow(sp)}
    if(!vis&&(G.lost>C.lose||(!G.path.length&&Math.hypot(G.x-G.lx,G.y-G.ly)<10)))startSearch();
    break}
  case 'search':{
    if(det){notice(det);break}
    if(G.ph===0){
      const done=follow(C.chase*.85*dt);G.t+=0;
      if(done||G.t>7){G.ph=1;G.t=0}}
    else{
      if(G.room){
        G.lk-=dt;
        if(G.lk<=0&&!G.path.length){G.lk=rf(1.2,2.2);const pt=roomPoint(G.room);if(pt)pathTo(pt[0],pt[1])}
        follow(C.patrol*1.4*dt)}
      if(G.t>=G.dur){G.st='patrol';G.wait=rf(.8,1.6);G.goal=null;G.path=[];G.room=null}}
    break}
  case 'kill':killTick(dt);break}}

  /* ================= XÁC: MŨI TÊN, PHÁT HIỆN, HÉT LÊN, BIẾN MẤT SAU 1 NGÀY ================= */
let AR=null;const DAYM=1440;
const rid0=(x,y,j)=>{if(j!==0)return 0;const f=YT.floors()[0];return f?(((f.RID[Math.floor(y/T)]||[])[Math.floor(x/T)])|0):0};
const pj=p=>isM(p.fl)?p.fl-FM:isY(p.fl)?p.fl-F0:-1;
const SCR=['Chuyện gì vậy?!','Trời ơi...','Có người chết!','Gọi ai đi!','Ôi không...'];
function shout(p,txt,dur){p.bub={txt,t:dur};if(p.yt)p.shout=[txt]}
const BUB=new Map();
function bubImg(t){let c=BUB.get(t);if(c)return c;
  const m=document.createElement('canvas').getContext('2d');m.font='bold 8px monospace';
  const w=Math.ceil(m.measureText(t).width)+10;c=document.createElement('canvas');c.width=w;c.height=14;
  const g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,w,14);g.fillStyle='#fff';g.fillRect(1,1,w-2,12);
  g.font='bold 8px monospace';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#b3001b';g.fillText(t,w/2,7.5);
  BUB.set(t,c);return c}
/* điểm tụ tập: quanh xác (hành lang) hoặc ngay ngoài cửa phòng nếu xác nằm trong phòng */
function gatherPt(c,j){
  const rid=rid0(c.x,c.y,j);
  if(rid){const rm=ROOMS[rid-1];
    if(rm){const tx=DX0+rm.w+7+rnd(3),ty=Math.floor(DY0+rm.wallY+(rm.n?1.5:-.5));
      if(okT(j,tx,ty)&&rid0(tx*T,ty*T,j)===0)return[tx,ty];
      return freeNear(j,tx,ty)||[tx,ty]}}
  const bx=Math.floor(c.x/T),by=Math.floor(c.y/T);
  for(let t=0;t<12;t++){const x=bx+rnd(7)-3,y=by+rnd(7)-3;if(okT(j,x,y)&&rid0(x*T,y*T,j)===rid&&(x!==bx||y!==by))return[x,y]}
  return freeNear(j,bx,by)||[bx,by]}
function gatherTo(q,c,j){
  const pt=gatherPt(c,j),wx=pt[0]*T+4,wy=pt[1]*T+4;
  if(q.mem){const g=q.g2;if(!g)return;
    if(q.act==='sleep')q.act='idle';
    g.st='gather';g.gt=rf(14,22);g.gx=wx;g.gy=wy;g.tgt=null;g.rp=0;g.flee=0;q.sp=g.sp0;q.path=[];pathNpc(q,wx,wy)}
  else if(q.yt){
    rel(q);if(q.ys&&q.ys.o===q)q.ys.o=null;q.sn=null;q.seat=0;q.act='idle';q.path=[];
    const s={k:'look',fl:q.fl,wx:pt[0],wy:pt[1],o:q};q.ys=s;q.goal={fl:q.fl,x:pt[0],y:pt[1],kind:'ys',s}}}
function discoverOne(p,c,j,key){
  c[key]=1;
  shout(p,'AAAAAAA!!',6);
  ins.forEach(q=>{
    if(q===p||q.dead||q.dying||q.gk||!(q.mem||q.yt)||q.fl!==p.fl)return;
    if(Math.hypot(q.x-p.x,q.y-p.y)>320)return;
    if(q.mem&&q.g2&&q.g2.flee)return;
    shout(q,SCR[rnd(SCR.length)],rf(3,6));gatherTo(q,c,j)});
  gatherTo(p,c,j);
  if(allPl().some(a=>isM(a.fl)||isY(a.fl)))cap('Một tiếng hét thất thanh vang lên: có người vừa phát hiện ra một xác chết! Mọi người đang xôn xao.')}
/* NPC đi qua, cùng phòng, đủ gần và nhìn thấy xác thì hét lên (kí ức và dream tính riêng) */
function discover(inY){
  CORP.forEach(c=>{
    const j=c.fl-FM,rc=rid0(c.x,c.y,j);
    ['fm','fy'].forEach(key=>{
      if(c[key]||(key==='fy'&&!inY))return;
      for(const p of ins){
        if(key==='fm'?!(p.mem&&p.fl===c.fl):!(p.yt&&p.fl===F0+j))continue;
        if(p.dead||p.dying||p.gk||p.cl||p.act==='sleep')continue;
        if(p.mem&&p.g2&&(p.g2.flee||p.g2.st==='sleep'))continue;
        if(rid0(p.x,p.y,j)!==rc)continue;
        if(Math.hypot(p.x-c.x,p.y-c.y)>(rc?40:72))continue;
        if(!ray(p.fl,p.x,p.y,c.x,c.y,false))continue;
        discoverOne(p,c,j,key);break}})})}
function corpseTick(dt){
  const g=YT.clock().g;
  CORP=CORP.filter(c=>g>=c.t0&&g-c.t0<DAYM);                       /* xác biến mất sau 1 ngày */
  BP=BP.filter(q=>q.t0===undefined||(g>=q.t0&&g-q.t0<DAYM));
  ins.forEach(p=>{if(p.bub&&(p.bub.t-=dt)<=0){p.bub=null;if(p.yt)p.shout=null}});
  const A=allPl();
  A.forEach(P=>{                                                     /* tới gần xác thì đánh dấu đã thấy */
    const j=pj(P);if(j<0)return;
    CORP.forEach(c=>{
      if(c.sn[P.pl]||c.fl-FM!==j||rid0(P.x,P.y,j)!==rid0(c.x,c.y,j)||Math.hypot(P.x-c.x,P.y-c.y)>30)return;
      c.sn[P.pl]=1;if(P.pl===sel)cap('Bạn đã tìm thấy xác chết. Mũi tên chỉ hướng biến mất.')})});
  AR=null;
  if(state!=='island')return;
  const P=A.find(p=>p.pl===sel);if(!P||!isY(P.fl))return;
  const j=P.fl-F0;let best=null,bs=1e9;
  CORP.forEach(c=>{if(c.sn[sel])return;const s=Math.abs(c.fl-FM-j)*5000+Math.hypot(c.x-P.x,c.y-P.y);if(s<bs){bs=s;best=c}});
  if(!best)return;
  const cj=best.fl-FM;let tx=best.x,ty=best.y,st=0;
  if(cj!==j){                                                        /* xác ở tầng khác: chỉ về cầu thang gần nhất */
    st=cj>j?1:-1;const left=(P.x/T-DX0)<(j===0?60:49);
    tx=(DX0+(left?2.5:SXof(j)+1.5))*T;ty=(DY0+(st>0?9.5:22.5))*T}
  AR={x:tx,y:ty,st,d:Math.hypot(tx-P.x,ty-P.y)};
  if(!best.al[sel]){best.al[sel]=1;cap('Có tiếng xì xào và mùi tanh nồng... một mũi tên đỏ chỉ về nơi có xác chết.')}}
function arrowDraw(){
  if(!AR||!inside)return;
  const P=ins.find(p=>p.pl===sel);if(!P||!isY(P.fl)||trans)return;
  const g=cx;g.save();g.setTransform(1,0,0,1,0,0);
  const px=(P.x-Math.round(camX))*IS,py=(P.y-14-Math.round(camY))*IS,a=Math.atan2(AR.y-P.y,AR.x-P.x),
    r=46+Math.sin(frame*.15)*3,x=px+Math.cos(a)*r,y=py+Math.sin(a)*r;
  g.translate(x,y);g.rotate(a);
  g.globalCompositeOperation='lighter';g.globalAlpha=.3;g.fillStyle='#ff2a2a';g.beginPath();g.arc(0,0,16,0,6.283);g.fill();
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  g.beginPath();g.moveTo(13,0);g.lineTo(-7,-9);g.lineTo(-3,0);g.lineTo(-7,9);g.closePath();
  g.fillStyle='#ff3b3b';g.fill();g.lineWidth=2;g.strokeStyle='#2a0508';g.stroke();
  g.setTransform(1,0,0,1,0,0);
  const t=AR.st?(AR.st>0?'Lên cầu thang':'Xuống cầu thang'):'Xác chết · '+Math.round(AR.d/T)+' ô';
  g.textAlign='center';g.font='bold 9px monospace';g.lineWidth=3;g.strokeStyle='#000';
  g.strokeText(t,x,y+22);g.fillStyle='#ffb0a0';g.fillText(t,x,y+22);
  g.restore()}

/* ================= VÒNG LẶP ================= */
function resetNight(){K={nid:nidNow(),quota:ri(C.quota[0],C.quota[1]),kills:0,dead:[],wk:0};CORP=[];BP=[];BT=new Set()}
function tick(dt){
  if(!setup())return;
  if(K.nid!==nidNow())resetNight();
  corpseTick(dt);
  if(frame%6===0)discover(allPl().some(p=>isY(p.fl)));
    if(frame%20===0)syncDead();
  const A=memPlayers();
  BP.forEach(q=>{if(q.rest)return;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;q.vz-=2.8*dt;if(q.z<=0){q.z=0;q.rest=1}});
  if(!A.length){G=null;S.t=0;PM={};return}
  updateDoors();
  if(ins.some(p=>p.mem&&!p.g2)&&!ins.some(p=>p.mem&&p.g2))BT.clear();
  ins.forEach(p=>{if(p.mem&&!p.g2&&!p.dead)npcInit(p)});
  ins.slice().forEach(p=>{if(p.mem)npcTick(p,dt)});
  if(C.firstOnly&&K.nid>0)G=null;
  else if(nightOK())ghostTick(dt);
  else G=null;
  A.forEach(p=>{PM[p.pl]=!!p.mcl})}
const _step=step;
step=function(){_step();if(state!=='island')return;try{tick(Math.min(.25,DM||.016))}catch(e){oops('tick',e)}};
const _ctrl=ctrl;
ctrl=function(){
  const P=ins.find(p=>p.pl===sel&&p.gk);
  if(P){P.moving=0;P.path=[];P.tx=P.x;P.ty=P.y;return}
  _ctrl()};

/* ================= BILLBOARD (G1.js gọi GMEM.bills trong render) ================= */
function bills(P,B){
  if(!isM(P.fl)||!setup())return;
  const fl=P.fl,px=P.x,py=P.y,nr=(x,y,r)=>Math.abs(x-px)<r&&Math.abs(y-py)<r;
  B.forEach(b=>{
      const p=b.src;if(!p)return;
      if(p.bub&&p.bub.t>0){const im=bubImg(p.bub.txt);B.push({x:p.x,y:p.y,img:im,wT:im.width/12,hT:14/12,pad:-1.9/(14/12),a:1,nf:1})}
      const sl=p.act==='sleep',dy=p.dying;
    

    if(dy){
      if(dy.type==='slash'){if(dy.t>.75){b.img=lieImg(p,true);b.wT=2.5;b.hT=2;b.pad=sl?-.22:.02}}
      else{b.x+=(rnd(3)-1)*1.1;b.y+=(rnd(3)-1)*1.1;
        if(sl){b.img=lieImg(p,true);b.wT=2.5;b.hT=2;b.pad=-.22-Math.min(.35,dy.t*.25)}else b.pad-=Math.min(.4,dy.t*.3)}
      return}
    if(sl){b.img=lieImg(p,false);b.wT=2.5;b.hT=2;b.pad=-.22}});
  CORP.forEach(c=>{
    if(c.fl!==fl||!nr(c.x,c.y,260))return;
    B.push({x:c.x,y:c.y,img:POOL,wT:POOL.width/12,hT:POOL.height/12,pad:c.bed?-.6:0,a:1});
    if(c.kt==='slash'){const im=lieImg(c.p,true);B.push({x:c.x,y:c.y,img:im,wT:2.5,hT:2,pad:c.bed?-.22:.02,a:1})}
    else{const h=halves(c.p);
      B.push({x:c.x-3,y:c.y-4,img:h[0],wT:h[0].width/12,hT:2,pad:c.bed?-.22:.02,a:1});
      B.push({x:c.x+4,y:c.y+5,img:h[1],wT:h[1].width/12,hT:2,pad:c.bed?-.22:.02,a:1})}});
  BP.forEach(q=>{
    if(q.fl!==fl||!nr(q.x,q.y,260))return;
    B.push({x:q.x,y:q.y,img:BI[q.c],wT:.33,hT:.33,pad:-q.z/(.33/3),a:.95})});
  if(G&&G.fl===fl){
    let st='idle',pp=0;
    if(G.st==='laugh')st='laugh';else if(G.st==='chase')st='chase';
    else if(G.st==='kill'){if(G.kt==='slash'){st='slash';pp=clamp((G.t-.15)/.6,0,1)}else st='grab'}
    paintGhost({st,p:pp});
    const calm=G.st==='patrol'||G.st==='search'||G.st==='spawn';
    B.push({x:G.x,y:G.y,img:GLW,wT:8,hT:8,pad:.25,a:(.3+.12*Math.sin(frame*.12))*G.alpha*(calm?.7:1.4),add:1,nf:1});
B.push({x:G.x,y:G.y,img:GC,wT:GWc/GU,hT:GHc/GU,pad:4/GHc-.1+Math.sin(frame*.08)*.03,a:G.alpha*(calm?.85:1),nf:1})}}
window.GMEM={bills,near:(x,y,r)=>!!G&&G.fl===FM&&Math.hypot(G.x-x,G.y-y)<r,ghost:()=>G,cfg:C,
  spawnNow:()=>{C.firstOnly=false;return spawn()},kills:()=>K};

/* ================= HIỆU ỨNG MÀN HÌNH ================= */
function fxDraw(){
  const P=ins.find(p=>p.pl===sel&&isM(p.fl));if(!P||!G)return;
  const g=cx;g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';
  const d=G.fl===P.fl?Math.hypot(G.x-P.x,G.y-P.y):1e9,k=clamp(1-(d-C.near)/(C.far-C.near),0,1)*G.alpha;
  if(k>0){
    const on=(hs(Math.floor(frame*(1+4*k)),11)%100)<(35+55*k),a=(.1+.5*k)*(on?1:.2)*(.85+.15*Math.sin(frame*.4));
    const gr=g.createRadialGradient(CW/2,CH/2,CH*.4,CW/2,CH/2,CW*.68);
    gr.addColorStop(0,'rgba(255,0,0,0)');gr.addColorStop(1,'rgba(230,8,12,'+a.toFixed(3)+')');
    g.fillStyle=gr;g.fillRect(0,0,CW,CH);
    g.fillStyle='#ff2a2a';
    for(let i=0;i<10;i++){
      const t=(i+.5)/10,s=k>.6?1:2;
      if((hs(i*13+(frame>>s),29)%100)<20+65*k){g.globalAlpha=.25+.4*k;g.fillRect(t*CW-14,0,28,5);g.fillRect(t*CW-14,CH-5,28,5)}
      if((hs(i*17+(frame>>s),31)%100)<20+65*k){g.globalAlpha=.25+.4*k;g.fillRect(0,t*CH-10,5,20);g.fillRect(CW-5,t*CH-10,5,20)}}
    g.globalAlpha=1}
  if(G.st==='kill'&&G.vp&&G.v&&G.v.pl===sel){
    const slash=G.kt==='slash',tot=slash?1.2:1.75,hitT=slash?.75:1.3,pr=clamp(G.t/tot,0,1);
    g.globalAlpha=.12+.4*pr;g.fillStyle='#7a0008';g.fillRect(0,0,CW,CH);g.globalAlpha=1;
    if(G.hit){
      const q=clamp((G.t-hitT)/.25,0,1);
      g.lineCap='round';
      for(let i=0;i<3;i++){
        const x0=CW*(.18+.24*i),y0=CH*.05,x1=x0+CW*.28*q,y1=y0+CH*.85*q;
        g.strokeStyle='rgba(25,0,0,.9)';g.lineWidth=9;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
        g.strokeStyle='rgba(205,10,22,.95)';g.lineWidth=4;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke()}
      g.fillStyle='#8a0008';
      for(let i=0;i<14;i++){const x=hs(i,3)%CW,h=(hs(i,5)%60+20)*q;g.fillRect(x,0,3,h);g.fillRect(x-1,h,5,4)}}}
  g.restore()}
const _draw=draw;
draw=function(){_draw();if(state!=='island')return;try{fxDraw()}catch(e){oops('fx',e);cx.restore()}try{arrowDraw()}catch(e){oops('arrow',e);cx.restore()}};
/* NPC đã chết trong kí ức thì cũng biến mất khỏi du thuyền */
function syncDead(){
  if(!K.dead.length)return;
  ins=ins.filter(p=>{
    if(!p.yt)return true;
    if(K.dead.includes([(p.room|0)+1,p.k,p.c,p.skin,p.hair].join('|'))){
      rel(p);if(p.ys&&p.ys.o===p)p.ys.o=null;if(p.bed&&p.bed.o===p)p.bed.o=null;return false}
    return true})}
/* vẽ xác + máu lên bản đồ 2D của du thuyền (cùng toạ độ với kí ức) */
function dreamCorpses(){
  if(state!=='island'||!inside||!CORP.length&&!BP.length)return;
  const P=ins.find(p=>p.pl===sel);if(!P||P.fl<F0||P.fl>=F0+NF)return;
  const j=P.fl-F0,f0=YT.floors()[0],vw=CW/IS,vh=CH/IS,
    rid=(x,y)=>((f0.RID[Math.floor(y/T)]||[])[Math.floor(x/T)])|0,
    myRoom=j===0?rid(P.x,P.y):0,
    vis=(x,y)=>x>camX-30&&x<camX+vw+30&&y>camY-30&&y<camY+vh+30&&(j!==0||rid(x,y)===myRoom);
  cx.save();cx.imageSmoothingEnabled=false;
  BP.forEach(q=>{if(q.fl!==FM+j||!q.rest||!vis(q.x,q.y))return;cx.fillStyle='#8a0a12';cx.fillRect(Math.round(q.x),Math.round(q.y),2,2)});
  CORP.forEach(c=>{
    if(c.fl!==FM+j||!vis(c.x,c.y))return;
    const x=Math.round(c.x),y=Math.round(c.y);
    cx.fillStyle='#5a0508';cx.beginPath();cx.ellipse(x,y+2,14,5,0,0,6.283);cx.fill();
    cx.fillStyle='#8a0a12';cx.beginPath();cx.ellipse(x,y+2,10,3.5,0,0,6.283);cx.fill();
    if(c.kt==='slash')cx.drawImage(lieImg(c.p,true),x-15,y-16);
    else{const h=halves(c.p);cx.drawImage(h[0],x-18,y-14);cx.drawImage(h[1],x+3,y-9)}});
  cx.restore()}
const _diG=drawIn;
drawIn=function(){_diG();try{dreamCorpses()}catch(e){oops('dreamCorpses',e);cx.restore()}};
/* ---------- Vòng đời game ---------- */
function resetAll(){G=null;K={nid:-9,quota:0,kills:0,dead:[],wk:0};CORP=[];BP=[];PM={};S.t=0;SU=null;BT=new Set()}
const _gen=gen;gen=function(sd){_gen(sd);resetAll()};
const _mk=mkPeople;mkPeople=function(){_mk();resetAll()};
console.log('[ghost-mem] đã nạp OK (oan hồn kí ức: tuần tra, đuổi, kiểm tra phòng, giết 1-2 NPC mỗi đêm)');
})();