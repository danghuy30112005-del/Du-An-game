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
  if(Math.random()<.04){                                   /* đôi khi NPC đổi tầng: xuất hiện ở chiếu nghỉ cầu thang */
    const d=Math.random()<.5?1:-1,k=j+d;
    if(k>=0&&k<NF){const left=Math.random()<.5,s=freeNear(k,DX0+(left?2:SXof(k)+1),DY0+(d>0?6:25));
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
const OBJS={bed:[.34,'#d9d3c6'],desk:[.34,'#a87a4c'],wardrobe:[1,'#7a5434'],tbl:[.5,'#f6f1e6'],chair:[.5,'#c8a878'],stand:[.42,'#6a4630'],
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
    const den=hor-y-.5;if(den<=.4)continue;
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
      KA.forEach(([a,w,h])=>{
        const d=wrapA(a-yaw);if(Math.abs(d)>1.3)return;
        const sx=CW/2*(1+Math.tan(d)/PL);
        g.beginPath();g.moveTo(sx-w,hor);g.lineTo(sx-w*.25,hor-h);g.lineTo(sx+w*.3,hor-h*.85);g.lineTo(sx+w,hor);g.closePath();g.fill()})}

    /* sàn */
    const fk=(kd[pty]||[])[ptx]|0,
      fc0=fk===3?'#4a1e30':fk===7?'#0e8aa0':(fk===2||fk===10)?'#8a6a46':'#8a5a24',fc1=fk===3?'#8a3a58':fk===7?'#1fb2c4':(fk===2||fk===10)?'#d3a876':'#c4873f';
    const fg=g.createLinearGradient(0,hor,0,CH);fg.addColorStop(0,fc0);fg.addColorStop(1,fc1);
    g.fillStyle=fg;g.fillRect(0,hor,CW,CH-hor);
    const dp=px*dX+py*dY;
    g.fillStyle='rgba(0,0,0,.09)';
    for(let y=hor+1;y<CH;y+=3){const dist=CH*1.1*EYE/(y-hor);if(Math.floor(dist+dp)&1)g.fillRect(0,y,CW,3)}

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
        if(k===8){hits.push({d,t:'w',fr,side,win:i===0&&WIN.has(my*IW+mx)});break}
        const kind=OM.get(my*IW+mx),o=OR.get(my*IW+mx),def=OBJS[kind]||[.6,'#8a6a4a'];
        hits.push({d,t:'o',fr,side,def,kind,o,a:o?clamp(side===1?(wx-o.x)/o.w:(wx-o.y)/o.h,0,1):fr});
        if(def[0]>=.95)break}
      flushW(lastD);
      cols[c]=hits;
      const x=c*CS;
      if(endD){const lh=CH*1.1/endD,fy=hor+lh*EYE,hh=Math.max(0,fy-hor);
        g.fillStyle='#2e4a86';g.fillRect(x,hor,CS,hh);g.fillStyle='#7a6aa8';g.fillRect(x,hor,CS,hh*.22)}
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
          if(h.win){
            g.fillStyle=shade('#ff9a62',Math.max(s,.75));g.fillRect(x,top+lh*.28,CS,lh*.4);
            g.fillStyle=shade('#ffe0b0',Math.max(s,.75));g.fillRect(x,top+lh*.28,CS,lh*.1);
            if(h.fr<.06||h.fr>.94||(h.fr>.48&&h.fr<.52)){g.fillStyle=shade('#5a3a1e',s);g.fillRect(x,top+lh*.26,CS,lh*.44)}}}}}

    /* billboard: NPC, người chơi khác, cầu thang, dù, cọ, thang bể bơi, đèn dây, biển số phòng */
    const B=[],t=frame,BB=bbi();
    ins.forEach(p=>{
      if(p===P||p.fl!==P.fl||!(p.mem||p.pl)||p.mcl)return;
      B.push({x:p.x,y:p.y,img:sprite(p,p.moving?1+((frame>>3)&1):0),wT:2,hT:2.5,pad:2/30,a:p.mem?(.82+.1*Math.sin(t*.05+p.x)):1})});
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
    if(i===1)for(let lx=14;lx<=84;lx+=2)[2,29].forEach(ly=>{
      const bx=(DX0+lx)*T+4,by=(DY0+ly)*T+4;
      if(Math.abs(bx/T-px)>26||Math.abs(by/T-py)>26)return;
      B.push({x:bx,y:by,img:BB.bulb,wT:.9,hT:.9,pad:-3.2,a:.55+.4*Math.sin(t*.06+lx),add:1})});
    if(i===0)YT.rooms().forEach(rm=>{
      const wy=DY0+rm.wallY,onC=rm.n?py>wy+1:py<wy;if(!onC)return;
      const emp=EMPTY.includes(rm.r),occ=YT.rooms().map((_,k)=>k).filter(k=>!EMPTY.includes(k)),k=occ.indexOf(rm.r),pn=(k>=0&&k<(nPl||1))?k+1:0;
      B.push({x:(DX0+rm.w+8)*T,y:(wy+(rm.n?1.1:-.1))*T,img:plateImg(emp?'TRỐNG':pn?'P'+pn:String(rm.id),emp?'#3a7a52':pn?'#c9a04c':'#d8d2c4'),wT:2.6,hT:1.1,pad:-2.1,a:1})});
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

window.memoryWorld={enter:n=>enterMemory(n||sel,'bed'),wake:n=>wakeMem(n||sel,'Bạn tỉnh dậy.'),drowsy:()=>DR};
console.log('[memory] đã nạp OK (bản 3: khe tủ 160°, cửa tự động, trần nhà)');
})();