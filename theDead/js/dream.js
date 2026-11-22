/* ===== guestkeys.js: CHÌA KHÓA PHÒNG KHÁCH TẦNG 2 =====
   Nạp CUỐI CÙNG (sau vines.js). Không cần sửa file cũ.
   - 8 phòng khách tầng 2 (FL[2], id 4..11) bị khóa (ô 66, không đi qua được).
   - Bữa trưa ngày 1, sau khi chủ đảo nói xong: quản gia phát cho mỗi người chơi 1 chìa.
   - Chìa chỉ mở 1 phòng (bị tiêu hao). NPC không bao giờ vào các phòng này (PRIV).
   - window.guestRooms.of(n) = id phòng người chơi n đã chọn (dùng cho chức năng ngủ sau này). */
(()=>{
if(typeof allPl!=='function'||typeof dineTick!=='function'||typeof PRIV==='undefined'||typeof route!=='function'||!window.ITEMS||typeof window.giveItem!=='function'||typeof window.takeItem!=='function'){
  console.warn('guestkeys.js: hãy nạp CUỐI CÙNG (sau Playerkit.js)');return}

const LK=66,SKEY='deadisland:guestkeys',INV='deadisland:inv1';
const DOORS=[];
for(let n=0;n<8;n++){const i=n%4;DOORS.push({id:4+n,n:n+1,name:'Phòng khách '+(n+1),x0:[20,27,34,41][i]+2,y:n<4?21:25})}
for(let i=4;i<=11;i++)PRIV[i]=1;            /* NPC không chọn các phòng này làm đích */

window.ITEMS.guestkey={icon:'🗝️',name:'Chìa khóa phòng khách',d:'Chìa khóa phòng khách tầng 2. Chỉ mở được 1 phòng duy nhất: ra cửa phòng, bấm E.'};

let S={seed:0,open:false,given:{},rooms:{}},KQ=null,DD=0,shT=0,shB=null;
function load(){
  try{const o=JSON.parse(localStorage.getItem(SKEY));if(o&&o.seed===seed){S=o;return}}catch(_){}
  S={seed,open:false,given:{},rooms:{}}}
function save(){S.seed=seed;try{localStorage.setItem(SKEY,JSON.stringify(S))}catch(_){}}
const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),w,h)};
const bagHas=(n,id)=>{try{const I=JSON.parse(localStorage.getItem(INV))||{};return Array.isArray(I[n])&&I[n].includes(id)}catch(_){return false}};
function label(x,y,t,col){
  cx.save();cx.textAlign='center';cx.font='bold 6px monospace';
  const w=Math.ceil(cx.measureText(t).width)+6,bx=Math.round(x-w/2),by=Math.round(y);
  cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(bx,by,w,9);cx.fillStyle=col||'#ffd23f';cx.fillRect(bx,by+9,w,1);
  cx.fillStyle='#fff';cx.fillText(t,Math.round(x),by+7);cx.restore()}

/* ---------- khóa / mở cửa ---------- */
const isLocked=d=>!!(FL[2]&&FL[2].im[d.y][d.x0]===LK);
function lockAll(){
  if(!FL[2])return;
  DOORS.forEach(d=>{for(let k=0;k<2;k++)FL[2].im[d.y][d.x0+k]=LK})}
function applyRooms(){
  if(!FL[2])return;
  Object.keys(S.rooms).forEach(n=>{const d=DOORS.find(q=>q.id===S.rooms[n]);if(d)for(let k=0;k<2;k++)FL[2].im[d.y][d.x0+k]=32})}
function unlock(n,d){
  if(!isLocked(d)||S.rooms[n]!==undefined)return;
  if(!window.takeItem(n,'guestkey')){cap('Bạn không còn chìa khóa trong túi.');return}
  S.rooms[n]=d.id;for(let k=0;k<2;k++)FL[2].im[d.y][d.x0+k]=32;save();
  cap('P'+n+' mở khóa '+d.name+'. Chìa khóa gãy trong ổ, từ giờ bạn chỉ ngủ được ở phòng này.')}

/* ---------- tương tác ---------- */
function nearDoor(P){
  if(!P||P.fl!==2||!inside)return null;
  return DOORS.find(d=>Math.hypot(P.x-(d.x0+1)*T,P.y-(d.y*T+4))<22)||null}
function useDoor(P,d){
  const n=P.pl;
  if(!S.open){cap('Cửa phòng khách bị khóa chặt. Quản gia sẽ phát chìa khóa vui lòng tìm quản gia.');return}
  if(S.rooms[n]!==undefined){cap('Chìa khóa của bạn đã dùng cho Phòng khách '+(S.rooms[n]-3)+'. Phòng này vẫn khóa với bạn.');return}
  if(!bagHas(n,'guestkey')){cap('Cửa khóa chặt. Cần chìa khóa phòng khách, hãy xin Quản gia.');return}
  const go=()=>unlock(n,d);
  if(typeof window.abyssAsk==='function')
    window.abyssAsk('Dùng chìa khóa mở '+d.name+'? Chìa khóa chỉ dùng được một lần, bạn sẽ chỉ ngủ được ở phòng này.',[['Mở khóa',go],['Chưa',()=>{}]]);
  else go()}
const butler=()=>ins.find(p=>p.role==='Quản gia');
function butlerNear(P){
  const B=butler();
  return B&&!B.hide&&B.act!=='sleep'&&(B.fl|0)===(P.fl|0)&&Math.hypot(P.x-B.x,P.y-B.y)<28?B:null}
function giveKey(P,B){
  const n=P.pl;
  if(window.giveItem(n,'guestkey')){
    S.given[n]=1;save();
    if(B){B.shout=['Chìa khóa phòng khách','tầng 2 của bạn đây.'];shB=B;shT=200}
    setTimeout(()=>cap('Quản gia đưa cho P'+n+' một chìa khóa phòng khách. Ra cửa phòng ở tầng 2 rồi bấm E (mỗi chìa chỉ mở 1 phòng).'),90);
    return true}
  return false}
function askKey(P){
  const n=P.pl;
  if(S.rooms[n]!==undefined){cap('Bạn đã chọn Phòng khách '+(S.rooms[n]-3)+' rồi, Quản gia không có chìa thứ hai.');return}
  if(bagHas(n,'guestkey')){cap('Bạn đã có chìa khóa phòng khách trong túi.');return}
  giveKey(P,butlerNear(P))}
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat||e.key.toLowerCase()!=='e'||e.ctrlKey||e.metaKey||e.altKey)return;
  if(state!=='island'||TK||trans)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const P=allPl().find(p=>p.pl===sel);if(!P)return;
  const d=nearDoor(P);
  if(d&&isLocked(d)){e.stopImmediatePropagation();useDoor(P,d);return}
  if(S.open&&butlerNear(P)){e.stopImmediatePropagation();askKey(P)}},true);
const _tk=tkUI;tkUI=function(){
  _tk();const e=$('tk');if(!e)return;
  const P=allPl().find(p=>p.pl===sel);
  if(state==='island'&&P&&!TK&&!trans&&S.open&&butlerNear(P)&&S.rooms[sel]===undefined&&!bagHas(sel,'guestkey')){
    e.innerHTML='Bấm <b>E</b> để xin chìa khóa phòng khách từ Quản gia';e.dataset.gk=1;e.hidden=false}
  else if(e.dataset.gk){delete e.dataset.gk;e.innerHTML='Bấm <b>E</b> để nói chuyện với Chủ đảo'}};

/* ---------- quản gia phát chìa trong bữa trưa ngày 1 ---------- */
function endQ(home){
  if(!KQ)return;
  KQ.B.sp=KQ.sp0;
  if(home&&DN&&DN.butler===KQ.B&&DN.ph===4)route(KQ.B,63,31);
  KQ=null}
function keyTick(){
  if(!S.open&&gm>=MST(1)+60){S.open=true;save()}
  if(KQ&&(!DN||DN.butler!==KQ.B||DN.ph!==4)){endQ(false)}
  if(!DN||DN.d!==1||DN.ph<4)return;
  if(!DN.gk){
    DN.gk=1;S.open=true;save();
    const list=allPl().filter(p=>ACC[p.pl]&&S.rooms[p.pl]===undefined&&!bagHas(p.pl,'guestkey')).map(p=>p.pl);
    const B=DN.butler;
    if(!list.length)return;
    if(!B){list.forEach(n=>giveKey(allPl().find(p=>p.pl===n),null));return}
    KQ={B,sp0:B.sp,list,cur:null,rt:0,t:0};B.sp=1;
    cap('Chủ đảo đã nói xong. Quản gia đi phát chìa khóa phòng khách tầng 2 cho từng người.')}
  if(!KQ)return;
  DN.te=gm-20;                                   /* giữ bữa ăn chưa kết thúc cho tới khi phát xong */
  const B=KQ.B;
  if(KQ.cur==null){
    if(!KQ.list.length){endQ(true);return}
    KQ.cur=KQ.list.shift();KQ.rt=0;KQ.t=0}
  const P=allPl().find(p=>p.pl===KQ.cur);
  if(!P||P.fl!==1||++KQ.t>900){KQ.cur=null;return}
  if(Math.hypot(P.x-B.x,P.y-B.y)<16){
    B.path=[];B.tx=B.x;B.ty=B.y;
    giveKey(P,B);KQ.cur=null;return}
  if(--KQ.rt<=0){KQ.rt=25;route(B,Math.floor(P.x/T),Math.floor(P.y/T))}}
const _dt=dineTick;
dineTick=function(){_dt();keyTick();if(shT>0&&--shT<=0&&shB){shB.shout=null;shB=null}};

/* ---------- vẽ cửa khóa (vẽ trước người để không đè đầu nhân vật) ---------- */
/* chỉ vẽ ổ khóa khi ô cửa nằm sát phòng đang xem (giống cách drawIn chỉ vẽ phòng hiện tại) */
function lockVisible(d){
  const rid=FL[2].rid;
  for(let k=0;k<2;k++)for(let j=-1;j<=1;j++){
    const r=rid[d.y+j];
    if(!r)continue;
    for(let i=-1;i<=1;i++)if(r[d.x0+k+i]===curR)return true}
  return false}
function drawLocks(){
  if(!FL[2]||!inside||curF!==2)return;
  const vw=CW/IS,vh=CH/IS;
  DOORS.forEach(d=>{
    if(!isLocked(d)||!lockVisible(d))return;
    const px=d.x0*T,py=d.y*T;
    if(px<camX-24||px>camX+vw+24||py<camY-24||py>camY+vh+24)return;
    R('#1a0f06',px-1,py-1,2*T+2,T+2);
    R('#5a3a1e',px,py,2*T,T);
    for(let i=0;i<2*T;i+=4){R('#8a5a2e',px+i,py,3,T);R('#6b4423',px+i+3,py,1,T)}
    R('#3a3a40',px,py+1,2*T,1);R('#3a3a40',px,py+6,2*T,1);
    R('#2a2a30',px+6,py+2,4,5);R('#d4a63a',px+6,py+2,4,4);R('#fff3a0',px+6,py+2,4,1);R('#111',px+7,py+4,2,1);
    R('#aab0ba',px+7,py,2,1)});
  const P=ins.find(p=>p.pl===sel&&p.fl===2),d=P&&nearDoor(P);
  if(d&&isLocked(d)&&!TK){
    const can=S.open&&S.rooms[sel]===undefined&&bagHas(sel,'guestkey');
    label((d.x0+1)*T,d.y*T-14,can?'E: Mở '+d.name:d.name+' (khóa)',can?'#ffd23f':'#ff8a7a')}}
const _di=drawIn;
drawIn=function(){DD=0;_di();if(curF===2&&!DD)drawLocks()};
const _pp=person;
person=function(p){
  if(!DD&&inside&&curF===2&&p.fl===2){DD=1;drawLocks()}
  _pp(p)};

/* ---------- vòng đời game ---------- */
const _gen=gen;
gen=function(sd){_gen(sd);load();KQ=null;lockAll();applyRooms()};
const _mk=mkPeople;
mkPeople=function(){_mk();endQ(false);S={seed,open:false,given:{},rooms:{}};save();lockAll()};

window.guestRooms={
  of:n=>S.rooms[n],
  canSleepIn:(n,id)=>S.rooms[n]===id,
  isOpen:()=>S.open};

load();lockAll();applyRooms();
})();



/* ===== sleep.js: NGỦ BẰNG GIƯỜNG + CHỨNG BUỒN NGỦ SAU BỮA TỐI NGÀY 1 =====
   Nạp CUỐI CÙNG (sau dream.js). Không cần sửa file cũ.
   - Lại gần giường trong phòng khách của mình (tầng 2), bấm E để ngủ (từ 20:00 tới 6:00, hoặc khi đang buồn ngủ nặng).
   - Khi mọi người chơi đều ngủ, thời gian trôi nhanh. 6:00 sáng tự thức dậy. E hoặc phím di chuyển để dậy sớm.
   - Hết bữa tối ngày 1: nhân vật buồn ngủ nặng: đi chậm, không chạy được, màn hình nhòe, nhấp nháy mí mắt,
     giữa màn hình hiện chữ nhắc lên mở phòng đi ngủ. Hết khi người chơi đi ngủ. */
(()=>{
if(typeof allPl!=='function'||typeof endMeal!=='function'||typeof ctrl!=='function'||typeof step!=='function'||typeof draw!=='function'||!window.guestRooms){
  console.warn('sleep.js: hãy nạp CUỐI CÙNG (sau dream.js)');return}

const KEY='deadisland:drowsy',ACCEL=25,WAKE0=6,WAKE1=12;
let SL={},DR={},dark=0;
const MV=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function load(){try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&o.seed===seed){DR=o.dr||{};return}}catch(_){}DR={}}
function save(){try{localStorage.setItem(KEY,JSON.stringify({seed,dr:DR}))}catch(_){}}
function label(x,y,t,col){
  cx.save();cx.textAlign='center';cx.font='bold 6px monospace';
  const w=Math.ceil(cx.measureText(t).width)+6,bx=Math.round(x-w/2),by=Math.round(y);
  cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(bx,by,w,9);cx.fillStyle=col||'#9ae8ff';cx.fillRect(bx,by+9,w,1);
  cx.fillStyle='#fff';cx.fillText(t,Math.round(x),by+7);cx.restore()}

/* ---------- Kích hoạt chứng buồn ngủ: hết bữa tối ngày 1 (bát đĩa được dọn đi) ---------- */
const _end=endMeal;
endMeal=function(D){
  const lunch1=!!D&&D.d===1&&D.k===1;   // k: 0 = sáng, 1 = trưa, 2 = tối
  _end(D);
  if(lunch1)startDrowsy()};
function startDrowsy(){
  const L=allPl().filter(p=>ACC[p.pl]&&!SL[p.pl]);
  if(!L.length)return;
  L.forEach(p=>{DR[p.pl]={t:0}});save();
  cap('Bữa ăn kết thúc, bát đĩa đã được dọn đi. Bỗng mí mắt bạn nặng trĩu, đầu óc quay cuồng... Hãy lên tầng 2, mở cửa phòng và đi ngủ!')}

/* ---------- Giường ---------- */
function nearBed(P){
  if(!inside||P.fl!==2)return null;
  let b=null,bd=26;
  BEDS.forEach(q=>{if(q.fl!==2)return;const d=Math.hypot(P.x-(q.x*T+4),P.y-(q.y*T+4));if(d<bd){bd=d;b=q}});
  return b}
function tryBed(P){
  const n=P.pl,b=nearBed(P);if(!b)return false;
  const rid=window.guestRooms.of(n);
  if(rid===undefined){cap('Bạn chưa có phòng riêng. Hãy lấy chìa khóa từ Quản gia và mở một phòng khách trước.');return true}
  if(b.room!==rid){cap('Đây không phải giường của bạn. Hãy ngủ ở phòng khách bạn đã mở khóa.');return true}
  const h=hour();
  if(!(DR[n]||h>=20||h<6)){cap('Bạn chưa buồn ngủ. Hãy quay lại sau 20:00.');return true}
  sleep(P,b);return true}
function sleep(P,b){
  const n=P.pl;
  SL[n]={t:0,ox:P.x,oy:P.y,bx:b.x*T+4,by:b.y*T+4};
  delete DR[n];save();
  P.x=P.tx=SL[n].bx;P.y=P.ty=SL[n].by;P.path=[];P.moving=0;P.act='sleep';
  cap('P'+n+' nằm xuống giường và chìm vào giấc ngủ... (bấm E hoặc phím di chuyển để thức dậy)')}
function wake(n,msg,place){
  const s=SL[n],P=allPl().find(p=>p.pl===n);delete SL[n];
  if(!P)return;
  P.act='idle';
  if(place!==false&&s)P.x=P.tx=s.ox,P.y=P.ty=s.oy;
  if(msg)cap(msg)}

/* ---------- Phím ---------- */
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.ctrlKey||e.metaKey||e.altKey||state!=='island')return;
  const k=e.key.toLowerCase();
  if(SL[sel]){
    if(k==='e'||MV.has(k)){
      if(k==='e')e.stopImmediatePropagation();
      if(!e.repeat)wake(sel,'P'+sel+' thức dậy.')}
    return}
  if(k==='q'&&DR[sel]){e.stopImmediatePropagation();cap('Bạn mệt rã rời, không còn sức để chạy nữa...');return}
  if(k==='e'){
    if(e.repeat||TK||trans)return;
    const iv=$('inv');if(iv&&!iv.hidden)return;
    const P=allPl().find(p=>p.pl===sel);if(!P)return;
    if(tryBed(P))e.stopImmediatePropagation()}},true);

/* ---------- Điều khiển: ngủ thì đứng yên, buồn ngủ thì đi chậm ---------- */
const _ctrl=ctrl;
ctrl=function(){
  const P=allPl().find(p=>p.pl===sel);
  if(P&&SL[sel]){P.moving=0;P.path=[];P.tx=P.x;P.ty=P.y;return}
  if(P&&DR[sel]){
    const ox=P.x,oy=P.y;_ctrl();
    if(P.x!==ox||P.y!==oy){
      const f=1-.1-.45*Math.min(1,DR[sel].t/90);
      P.x=ox+(P.x-ox)*f;P.y=oy+(P.y-oy)*f;P.tx=P.x;P.ty=P.y}
    return}
  _ctrl()};

/* ---------- Cập nhật mỗi khung hình ---------- */
function tick(dt){
  const L=allPl();
  Object.keys(DR).forEach(k=>{if(!L.some(p=>p.pl===+k))delete DR[k];else DR[k].t+=dt});
  Object.keys(SL).forEach(k=>{
    const n=+k,P=L.find(p=>p.pl===n),s=SL[k];
    if(!P){delete SL[k];return}
    /* bị chuyển đi nơi khác (ví dụ đi ăn) thì tự dậy */
    if(P.fl!==2||Math.hypot(P.x-s.bx,P.y-s.by)>6){wake(n,null,false);return}
    s.t+=dt;P.x=P.tx=s.bx;P.y=P.ty=s.by;P.path=[];P.moving=0;P.act='sleep'});
  if(L.length&&L.every(p=>SL[p.pl])){            /* tất cả cùng ngủ: thời gian trôi nhanh */
    const d0=day();gm+=dt*ACCEL;
    if(day()!==d0){snap.day=snapshot();if((day()-1)%7===0)snap.week=snap.day}}
  const h=hour();
  if(h>=WAKE0&&h<WAKE1)Object.keys(SL).forEach(k=>{if(SL[k].t>2)wake(+k,'Trời đã sáng. P'+k+' thức dậy sau một đêm dài.')})}
const _step=step;
step=function(){_step();if(state!=='island')return;try{tick(Math.min(.25,DM||.016))}catch(e){console.error('[sleep] tick',e)}};

/* ---------- Nhãn "E: Đi ngủ" cạnh giường của mình ---------- */
const _di=drawIn;
drawIn=function(){
  _di();
  if(curF!==2||state!=='island'||SL[sel])return;
  const P=ins.find(p=>p.pl===sel&&p.fl===2),b=P&&nearBed(P);
  if(b&&b.room===window.guestRooms.of(sel))label(b.x*T+4,b.y*T-14,'E: Đi ngủ','#9ae8ff')};

/* ---------- Hiệu ứng màn hình ---------- */
function drowsyFx(dr){
  const t=dr.t,k=.35+.65*Math.min(1,t/90);
  cx.save();
  /* nhìn đôi, nhòe */
  cx.globalAlpha=.2*k;
  cx.drawImage(cv,Math.round(Math.sin(frame*.03)*5*k),Math.round(Math.cos(frame*.021)*3*k));
  cx.globalAlpha=1;
  /* tối ở rìa mắt */
  const g=cx.createRadialGradient(CW/2,CH/2,CH*.18,CW/2,CH/2,CW*.62);
  g.addColorStop(0,'rgba(8,8,40,0)');g.addColorStop(1,'rgba(8,8,40,'+(.4+.35*k).toFixed(3)+')');
  cx.fillStyle=g;cx.fillRect(0,0,CW,CH);
  /* mí mắt sập xuống rồi mở ra: càng lâu càng nhanh, càng kín */
  const period=7-4*k,dur=1.3+1.3*k,u=t%period;
  let lid=0;if(u<dur)lid=Math.sin(Math.PI*u/dur)*(.4+.6*k);
  if(lid>0){
    const h=Math.round(lid*CH*.5);
    cx.fillStyle='rgba(0,0,0,.97)';cx.fillRect(0,0,CW,h);cx.fillRect(0,CH-h,CW,h);
    cx.fillStyle='rgba(0,0,0,.4)';cx.fillRect(0,h,CW,6);cx.fillRect(0,CH-h-6,CW,6)}
  /* chớp tối ngắn */
  if(hs(frame>>3,7)%100<7*k){cx.fillStyle='rgba(0,0,0,.55)';cx.fillRect(0,0,CW,CH)}
  /* chữ giữa màn hình */
  const rid=window.guestRooms.of(sel),
    t1=rid===undefined?'Hãy lên mở phòng và đi ngủ':'Hãy về giường và đi ngủ',
    t2=rid===undefined?'Lên tầng 2, ra cửa phòng khách và bấm E (cần chìa khóa của Quản gia)':'Lại gần giường trong phòng của bạn và bấm E';
  cx.textAlign='center';cx.textBaseline='middle';
  cx.globalAlpha=clamp((.6+lid*.5)*(.8+.2*Math.sin(frame*.12)),0,1);
  const sx=lid>.5?Math.round(Math.sin(frame*1.7)):0;
  cx.font='bold 26px monospace';cx.lineWidth=5;cx.strokeStyle='#000';
  cx.strokeText(t1,CW/2+sx,CH/2-6);cx.fillStyle='#ffb0a0';cx.fillText(t1,CW/2+sx,CH/2-6);
  cx.font='bold 9px monospace';cx.lineWidth=3;
  cx.strokeText(t2,CW/2,CH/2+22);cx.fillStyle='#fff';cx.fillText(t2,CW/2,CH/2+22);
  cx.restore()}
function sleepFx(){
  cx.fillStyle='rgba(4,6,20,'+dark.toFixed(3)+')';cx.fillRect(0,0,CW,CH);
  if(dark<.5)return;
  const h=hour(),hh=Math.floor(h),mm=Math.floor((h-hh)*60),all=allPl().every(p=>SL[p.pl]);
  cx.save();cx.textAlign='center';cx.textBaseline='middle';cx.globalAlpha=clamp((dark-.5)*2,0,1);
  cx.font='bold 22px monospace';cx.lineWidth=4;cx.strokeStyle='#000';
  const zy=Math.round(Math.sin(frame*.05)*4);
  cx.strokeText('Zzz...',CW/2,CH/2-10+zy);cx.fillStyle='#9ac4ff';cx.fillText('Zzz...',CW/2,CH/2-10+zy);
  cx.font='bold 10px monospace';cx.lineWidth=3;
  const l1=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+(all?' · Thời gian trôi nhanh...':' · Chờ những người chơi khác đi ngủ...'),
    l2='Bấm E hoặc phím di chuyển để thức dậy';
  cx.strokeText(l1,CW/2,CH/2+18);cx.fillStyle='#fff';cx.fillText(l1,CW/2,CH/2+18);
  cx.strokeText(l2,CW/2,CH/2+34);cx.fillText(l2,CW/2,CH/2+34);
  cx.restore()}
const _draw=draw;
draw=function(){
  _draw();
  if(state!=='island')return;
  try{
    dark+=((SL[sel]?.9:0)-dark)*.06;
    if(dark>.01)sleepFx();
    if(DR[sel]&&!SL[sel])drowsyFx(DR[sel])
  }catch(e){console.error('[sleep] vẽ',e);cx.restore()}};

/* ---------- Vòng đời game ---------- */
const _gen=gen;gen=function(sd){_gen(sd);load();SL={};dark=0};
const _mk=mkPeople;mkPeople=function(){_mk();SL={};DR={};dark=0;save()};
const _rs=restore;restore=function(s){_rs(s);SL={}};
load();
})();

/* ===== yacht.js: DU THUYỀN DANOVA TRONG GIẤC MƠ (4 tầng, hoàng hôn Vịnh Hạ Long) =====
   Nạp CUỐI CÙNG trong deadisland.html (sau sleep.js):  <script src="../js/yacht.js"></script>
   Không cần sửa file cũ. Đánh số tầng từ TRÊN xuống (khớp mô tả: phòng ngủ = tầng 4 ở dưới cùng):
     Tầng 1 (trên cùng): Tầng thượng      (FL[30])
     Tầng 2            : Tắm nắng + bể bơi (FL[29])
     Tầng 3            : Tầng tiệc, quầy bar tròn (FL[28])
     Tầng 4 (dưới cùng): Khu phòng ngủ    (FL[27])  <- nhân vật thức dậy ở đây
   - Cầu thang ở 2 đầu thuyền (đầu thuyền + đuôi thuyền): đi vào bậc thang là lên / xuống tầng.
   - Kích hoạt: lần ngủ đầu tiên của mỗi người chơi (bấm E ở giường tầng 2 dinh thự, sleep.js)
     -> sau ~1,6 giây hiệu ứng vòng xoáy, rơi vào giấc mơ, thức dậy ở 1 trong 10 phòng ngủ tầng 4.
   - Chưa có đường về (theo yêu cầu). Để thử nhanh: mở Console gõ  yachtDream.go(1)  (1 = số người chơi). */
(()=>{
if(typeof putIn!=='function'||typeof syncView!=='function'||typeof allPl!=='function'||typeof drawIn!=='function'||typeof warp!=='function'||typeof cam!=='function'||typeof step!=='function'||typeof draw!=='function'){
  console.warn('yacht.js: hãy nạp CUỐI CÙNG (sau sleep.js)');return}

const WORLDS=window.WORLDS||(window.WORLDS={});
const F0=27,NF=4,WALL=62,GW=126,GHH=56,OX=14,OY=12,LH=32,VW=400,DKEY='deadisland:yachtdream';
const NAMES=['Tầng 4: Khu phòng ngủ','Tầng 3: Tầng tiệc','Tầng 2: Tắm nắng và bể bơi','Tầng 1: Tầng thượng'];
const isY=f=>f>=F0&&f<F0+NF;
const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),w,h)};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const warned={};const oops=(n,e)=>{if(!warned[n]){warned[n]=1;console.error('[yacht] lỗi trong '+n+':',e)}};
const mkc=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
function disc(c,x,y,r){cx.fillStyle=c;r=Math.round(r);for(let j=-r;j<=r;j++){const w=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));cx.fillRect(Math.round(x-w),Math.round(y+j),w*2,1)}}
function ell(c,x,y,rx,ry){cx.fillStyle=c;ry=Math.round(ry);for(let j=-ry;j<=ry;j++){const w=rx*Math.sqrt(Math.max(0,1-(j*j)/(ry*ry)));cx.fillRect(Math.round(x-w),Math.round(y+j),Math.round(w*2),1)}}
function label(x,y,t,col){
  cx.save();cx.textAlign='center';cx.font='bold 6px monospace';
  const w=Math.ceil(cx.measureText(t).width)+6,bx=Math.round(x-w/2),by=Math.round(y);
  cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(bx,by,w,9);cx.fillStyle=col||'#ffd23f';cx.fillRect(bx,by+9,w,1);
  cx.fillStyle='#fff';cx.fillText(t,Math.round(x),by+7);cx.restore()}

/* ---------- Dữ liệu ---------- */
let Y=[],DONE={},DT={},BN={t:999,txt:''};
function load(){try{const o=JSON.parse(localStorage.getItem(DKEY));if(o&&o.seed===seed){DONE=o.done||{};return}}catch(_){}DONE={}}
function save(){try{localStorage.setItem(DKEY,JSON.stringify({seed,done:DONE}))}catch(_){}}

/* hình thân tàu: thân chữ nhật, mũi tàu bo tròn từ lx 80 */
function onDeck(lx,ly){
  if(lx<0||lx>97||ly<0||ly>31)return false;
  if(lx<=80)return true;
  const h=16*Math.sqrt(1-Math.pow((lx-80)/18,2));return Math.abs(ly+.5-16)<h}

const WX=[7,22,37,52,67];                        /* cột tường các phòng ngủ */
const CAB=[[0,0],[1,1],[2,0],[3,1],[4,0],[0,1],[1,0],[2,1],[3,0],[4,1]].map(([c,b])=>[WX[c]+7,b?21:10]);   /* chỗ thức dậy */
const SPAWN=[0,5,1,6,2,7,3,8,4,9];

function buildFloor(i){
  const g=v=>Array.from({length:GHH},()=>Array(GW).fill(v));
  const kd=g(0),im=g(WALL),rid=g(0),O=[],DEC=[],FR=[];
  const ok=(lx,ly)=>onDeck(lx,ly);
  for(let ly=0;ly<LH;ly++)for(let lx=0;lx<98;lx++)if(onDeck(lx,ly)){const x=OX+lx,y=OY+ly;kd[y][x]=1;im[y][x]=0;rid[y][x]=1}
  for(let y=1;y<GHH-1;y++)for(let x=1;x<GW-1;x++)if(!kd[y][x]&&[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].some(([a,b])=>kd[y+b][x+a]===1))kd[y][x]=9;
  const setK=(lx,ly,k,blocked)=>{if(!ok(lx,ly))return;const x=OX+lx,y=OY+ly;kd[y][x]=k;if(blocked){im[y][x]=WALL;rid[y][x]=0}else{im[y][x]=0;rid[y][x]=1}};
  const blk=(lx,ly,w,h)=>{for(let j=0;j<h;j++)for(let k=0;k<w;k++)if(ok(lx+k,ly+j)){const x=OX+lx+k,y=OY+ly+j;im[y][x]=WALL;rid[y][x]=0}};
  const obj=(k,lx,ly,w,h,o)=>{const p=Object.assign({k,x:OX+lx,y:OY+ly,w,h,px:(OX+lx)*T,py:(OY+ly)*T,ay:(OY+ly+h)*T,ax:(OX+lx+w/2)*T},o||{});O.push(p);if(!(o&&o.nb))blk(lx,ly,w,h);return p};
  const tset=(lx,ly)=>{obj('tbl',lx,ly,2,2);obj('chair',lx-1,ly,1,1);obj('chair',lx+2,ly+1,1,1);obj('chair',lx,ly-1,1,1);obj('chair',lx+1,ly+2,1,1)};
  const palm=(lx,ly)=>obj('palm',lx,ly,2,2,{th:36});
  const para=(lx,ly)=>obj('pole',lx,ly,1,1);

  if(i===0){            /* ===== TẦNG 4: PHÒNG NGỦ ===== */
    for(let ly=13;ly<=18;ly++)for(let lx=0;lx<=92;lx++)setK(lx,ly,3,0);
    WX.forEach(w=>{
      for(let lx=w+1;lx<=w+14;lx++){for(let ly=0;ly<=11;ly++)setK(lx,ly,2,0);for(let ly=20;ly<=31;ly++)setK(lx,ly,2,0)}});
    [...WX,82].forEach(w=>{for(let ly=0;ly<=12;ly++)setK(w,ly,8,1);for(let ly=19;ly<=31;ly++)setK(w,ly,8,1)});
    for(let lx=7;lx<=82;lx++){setK(lx,12,8,1);setK(lx,19,8,1)}
    WX.forEach(w=>{[12,19].forEach(ly=>{setK(w+7,ly,3,0);setK(w+8,ly,3,0)})});
    WX.forEach(w=>{
      obj('bed',w+6,0,4,3,{d:'n'});obj('stand',w+5,0,1,1);obj('stand',w+10,0,1,1);obj('wardrobe',w+12,0,2,2);obj('tbl',w+1,0,2,2);obj('chair',w+3,1,1,1);
      obj('bed',w+6,29,4,3,{d:'s'});obj('stand',w+5,30,1,1);obj('stand',w+10,30,1,1);obj('wardrobe',w+12,30,2,2);obj('tbl',w+1,30,2,2);obj('chair',w+3,30,1,1)});
    palm(84,13);palm(84,17);
    DEC.push(()=>{for(let lx=8;lx<=88;lx++)R((lx&1)?'#c9a04c':'#9a7030',(OX+lx)*T,(OY+15)*T+2,T,4)});
  }
  if(i===1){            /* ===== TẦNG 3: TIỆC + QUẦY BAR TRÒN ===== */
    const cxp=(OX+48)*T,cyp=(OY+16)*T;
    for(let ly=0;ly<LH;ly++)for(let lx=0;lx<98;lx++)if(Math.pow((lx+.5-48)/10.5,2)+Math.pow((ly+.5-16)/5.5,2)<1)blk(lx,ly,1,1);
    DEC.push(()=>{[[130,76,'#7a4e2a'],[126,72,'#d6a46a'],[116,66,'#a87444'],[112,62,'#d0a066'],[102,56,'#98693c'],[98,52,'#c89a60']].forEach(([a,b,c])=>ell(c,cxp,cyp+2,a,b))});
    obj('bar',38,10,21,12,{nb:1,cxp,cyp,ay:cyp+46,ax:cxp});
    for(let k=0;k<12;k++){const a=k*Math.PI/6+.26;obj('stool',Math.round(48+Math.cos(a)*12.2-.5),Math.round(16+Math.sin(a)*7.2-.5),1,1)}
    obj('sofa',12,3,6,2,{d:'n'});obj('sofa',12,27,6,2,{d:'s'});obj('sofa',70,3,6,2,{d:'n'});obj('sofa',70,27,6,2,{d:'s'});
    tset(11,8);tset(11,21);tset(83,8);tset(83,21);tset(28,10);tset(28,20);tset(66,10);tset(66,20);
    palm(6,2);palm(6,28);palm(88,3);palm(88,27);
    const bulbs=[];for(let lx=14;lx<=84;lx+=2){bulbs.push([lx,2],[lx,29])}
    FR.push(()=>{cx.save();cx.globalCompositeOperation='lighter';
      bulbs.forEach(([lx,ly],k)=>{const x=(OX+lx)*T+4,y=(OY+ly)*T+4,a=.5+.5*Math.sin(frame*.06+k);cx.globalAlpha=.16*a;R(['#ffd27a','#ff9acb','#9ff5ff'][k%3],x-4,y-4,9,9);cx.globalAlpha=.9;R(['#ffd27a','#ff9acb','#9ff5ff'][k%3],x,y,2,2)});
      cx.globalAlpha=.1+.05*Math.sin(frame*.05);ell('#2ee8d0',cxp,cyp+4,92,50);cx.restore();cx.globalAlpha=1});
  }
  if(i===2){            /* ===== TẦNG 2: TẮM NẮNG + BỂ BƠI ===== */
    obj('pool',34,9,29,13);
    [33,39,45,51,57].forEach(lx=>{obj('lounger',lx,5,5,2);obj('lounger',lx,24,5,2)});
    [38,50].forEach(lx=>{para(lx,5);para(lx,24)});
    tset(10,6);tset(10,22);tset(78,6);tset(78,22);
    palm(24,3);palm(24,27);palm(72,3);palm(72,27);
    DEC.push(()=>{cx.save();cx.textAlign='center';cx.font='bold 10px monospace';const x=(OX+48)*T,y=(OY+27)*T+2;
      cx.globalAlpha=.18;cx.fillStyle='#ffd86b';cx.fillRect(x-48,y-10,96,16);cx.globalAlpha=.95;
      cx.fillStyle='#8a5a1a';cx.fillText('DANOVA',x+1,y+1);cx.fillStyle='#ffe9a0';cx.fillText('DANOVA',x,y);
      cx.font='bold 5px monospace';cx.fillStyle='#ffd86b';cx.fillText('CRUISE HALONG BAY',x,y+7);cx.restore()});
  }
  if(i===3){            /* ===== TẦNG 1: TẦNG THƯỢNG ===== */
    obj('jac',24,4,8,8);obj('jac',66,4,8,8);
    [24,30,60,66].forEach(lx=>obj('lounger',lx,24,5,2));
    para(29,24);para(65,24);
    obj('egg',44,3,2,2,{th:48});obj('egg',51,3,2,2,{th:48});
    obj('mast',46,13,3,3,{th:56});
    obj('sofa',10,3,6,2,{d:'n'});obj('sofa',10,27,6,2,{d:'s'});obj('sofa',76,3,6,2,{d:'n'});obj('sofa',76,27,6,2,{d:'s'});
    tset(12,13);tset(80,13);palm(20,14);palm(74,14);
  }
  /* cầu thang 2 đầu: ▲ lên (hàng trên), ▼ xuống (hàng dưới) */
  const st=(lx,ly,d)=>{for(let j=0;j<3;j++)for(let k=0;k<3;k++)setK(lx+k,ly+j,d==='u'?5:6,0);
    DEC.push(()=>{const x=(OX+lx+1.5)*T,y=(OY+ly+1.5)*T,c=d==='u'?'#ffd23f':'#7cfff0';
      for(let r=0;r<4;r++){const w=d==='u'?r*2+1:7-r*2;R('#2a2438',x-w/2-1,y-4+r*2-1+0,w+2,3);R(c,x-w/2,y-4+r*2,w,2)}})};
  [1,92].forEach(lx=>{if(i<NF-1)st(lx,8,'u');if(i>0)st(lx,21,'d')});
  O.sort((a,b)=>a.ay-b.ay);
  return{kd,im,rid,O,DEC,FR}}

function buildAll(){
  Y=[];for(let i=0;i<NF;i++)Y.push(buildFloor(i));
  Y.forEach((f,i)=>{FL[F0+i]={im:f.im,rid:f.rid,RM:[null,{n:NAMES[i],f:['rgba(0,0,0,0)','rgba(0,0,0,0)'],x0:0,y0:0,x1:GW-1,y1:GHH-1,s:1}]}})}

/* ================= VẼ ĐỒ VẬT ================= */
const DRAW={
bed(o){const x=o.px,y=o.py,w=32,h=24,n=o.d==='n';
  R('rgba(0,0,0,.25)',x,y+h-1,w,2);R('#4a2e1e',x,y,w,h);R('#6a4630',x+1,y+1,w-2,h-2);R('#f4efe6',x+2,y+2,w-4,h-4);
  const by=n?y+10:y+2,bh=h-12;R('#2a8aa0',x+2,by,w-4,bh);R('#4cc0d0',x+2,by,w-4,1);R('#1c6a80',x+2,by+bh-1,w-4,1);
  for(let i=0;i<w-4;i+=6)R('#3aa4b8',x+2+i,by+2,3,bh-4);
  const py=n?y+3:y+h-8;R('#ffffff',x+4,py,10,5);R('#ffffff',x+w-14,py,10,5);R('#d8d4e0',x+4,py+4,10,1);R('#d8d4e0',x+w-14,py+4,10,1);
  R('#3a2418',x,n?y:y+h-3,w,3)},
stand(o){const x=o.px,y=o.py;R('rgba(0,0,0,.25)',x,y+7,8,1);R('#6a4630',x+1,y+3,6,5);R('#8a6040',x+1,y+3,6,1);R('#e8d8b0',x+3,y,2,3);
  cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=.25;R('#ffd88a',x-1,y-3,10,8);cx.restore()},
wardrobe(o){const x=o.px,y=o.py;R('rgba(0,0,0,.25)',x,y+15,16,2);R('#4a2e1e',x,y,16,16);R('#7a5434',x+1,y+1,6,14);R('#7a5434',x+9,y+1,6,14);R('#a87a4c',x+1,y+1,6,1);R('#a87a4c',x+9,y+1,6,1);R('#e8c86a',x+6,y+7,1,3);R('#e8c86a',x+9,y+7,1,3)},
tbl(o){const x=o.px+8,y=o.py+9;disc('rgba(0,0,0,.25)',x+1,y+2,7);disc('#6a4a30',x,y,7);disc('#a87a4c',x,y-1,6);disc('#c89a62',x-1,y-2,3);R('#58c25e',x-1,y-5,2,2);R('#f4f4f8',x-1,y-3,2,2)},
chair(o){const x=o.px+4,y=o.py+4;disc('rgba(0,0,0,.2)',x+1,y+1,3);disc('#5a4a3a',x,y,4);disc('#c8a878',x,y,3);disc('#f0e6d0',x,y,2)},
sofa(o){const x=o.px,y=o.py,w=o.w*8,n=o.d==='n';R('rgba(0,0,0,.25)',x,y+15,w,2);
  R('#5a6280',x,n?y:y+10,w,6);R('#98a2bc',x+3,n?y+5:y+1,w-6,10);R('#6a7490',x,n?y+3:y,3,13);R('#6a7490',x+w-3,n?y+3:y,3,13);
  for(let i=x+3+((w-6)>>1);i<x+w-3;i+=(w-6)){}R('#7a84a0',x+(w>>1),n?y+5:y+1,1,10);
  R('#2aa8a0',x+6,n?y+6:y+7,5,4);R('#f0b060',x+w-11,n?y+6:y+7,5,4)},
lounger(o){const x=o.px,y=o.py,w=40,h=16;R('rgba(0,0,0,.22)',x,y+h-1,w,2);R('#b4772f',x,y+1,w,h-2);R('#f6f2ea',x+1,y+2,w-2,h-4);
  R('#ffffff',x+2,y+3,10,h-6);R('#d8d2c4',x+12,y+2,1,h-4);R('#3a8fb8',x+22,y+2,4,h-4);R('#e8e2d4',x+w-8,y+2,1,h-4);R('#d89a56',x,y,w,1)},
pole(o){const x=o.px,y=o.py;R('rgba(0,0,0,.25)',x,y+7,8,1);disc('#4a4a52',x+4,y+5,3);R('#9aa0aa',x+3,y-12,2,16)},
palm(o){const x=o.px,y=o.py;R('rgba(0,0,0,.25)',x,y+15,16,2);R('#a89c88',x+2,y+8,12,8);R('#d8cfc0',x+2,y+8,12,2);R('#3a2a1e',x+4,y+8,8,2);
  R('#6a4a2a',x+7,y-6,2,14);
  for(let k=0;k<8;k++){const a=-3.1+k*.44,s=Math.sin(frame*.03+k)*.5;
    for(let r=2;r<=15;r+=1.5){const lx=x+8+Math.cos(a)*r,ly=y-6+Math.sin(a)*r*.6+r*r*.02+s*r*.1;R(k%2?'#2f8f46':'#58c25e',lx,ly,2,2)}}},
egg(o){const x=o.px+8,y=o.py+8,sw=Math.round(Math.sin(frame*.03+o.px));R('#7a7f8a',x+sw*.5,y-o.th,1,o.th-8);
  R('rgba(0,0,0,.2)',x-7,y+9,14,2);ell('#2a2a30',x+sw,y,8,9);ell('#8a7a62',x+sw,y,7,8);ell('#f2ecdc',x+sw,y+2,5,5);
  for(let j=-6;j<=6;j+=3)R('#3a3a42',x+sw-6,y+j,12,1)},
jac(o){const x=o.px+32,y=o.py+32;disc('rgba(0,0,0,.25)',x,y+3,31);disc('#7a4a2a',x,y,31);disc('#a8683c',x,y,29);disc('#e8e4dc',x,y,25);disc('#3ed4d6',x,y,23);
  disc('#6ef0f0',x-5,y-5,10);const q=(frame*.5)%22;cx.globalAlpha=1-q/22;for(let a=0;a<6.28;a+=.35)R('#c8ffff',x+Math.cos(a)*q,y+Math.sin(a)*q,2,1);cx.globalAlpha=1;
  for(let k=0;k<7;k++)R('#ffffff',x+Math.sin(k*2.1+frame*.04)*14,y+Math.cos(k*1.7+frame*.05)*14,2,2);
  R('#fff',x+22,y-34,1,1);cx.save();cx.globalAlpha=.25;R('#ffffff',x-6+Math.sin(frame*.03)*3,y-40-((frame>>1)%14),6,4);cx.restore()},
pool(o){const x=o.px,y=o.py,w=o.w*8,h=o.h*8;
  R('#e2b878',x-10,y-10,w+20,h+20);R('#c4905a',x-10,y-10,w+20,2);R('#c4905a',x-10,y+h+8,w+20,2);
  for(let k=0;k<w+20;k+=8){R('#b07a40',x-10+k,y-10,1,h+20)}
  R('#f6f6fb',x-4,y-4,w+8,h+8);R('#c9cde0',x-4,y+h+3,w+8,1);R('#1fb2c4',x,y,w,h);
  for(let yy=0;yy<h;yy+=4)for(let xx=0;xx<w;xx+=4){const v=Math.sin(xx*.3+yy*.5+frame*.05)+Math.sin(xx*.17-yy*.4+frame*.03);
    if(v>1.05)R('#8af0f6',x+xx,y+yy,4,2);else if(v<-1.05)R('#0e8aa0',x+xx,y+yy,4,2)}
  R('rgba(255,255,255,.14)',x,y,w,6);R('rgba(255,255,255,.14)',x,y,6,h);
  for(let s=0;s<4;s++)R(s%2?'#d8f6f8':'#a8e8ee',x+w-16+s*4,y+4,3,h-8);
  [44,56].forEach(a=>{R('#d0d6e0',x+a,y-9,1,11);R('#d0d6e0',x+a+5,y-9,1,11);R('#d0d6e0',x+a,y-9,6,1);R('#d0d6e0',x+a,y-5,6,1)});
  cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=.14;R('#9ff5ff',x-6,y-6,w+12,h+12);cx.restore()},
bar(o){const X=o.cxp,Y0=o.cyp,rx=84,ry=44;
  ell('rgba(0,0,0,.28)',X+2,Y0+9,rx+2,ry+2);ell('#145a52',X,Y0+6,rx,ry);ell('#2aa89a',X,Y0+4,rx,ry);
  for(let xx=X-rx+2;xx<X+rx;xx+=4){const u=(xx-X)/rx,b=Y0+4+ry*Math.sqrt(Math.max(0,1-u*u));R('#1d7e74',xx,b-3,1,4)}
  ell('#f6f6fa',X,Y0,rx,ry);ell('#d9dce8',X,Y0+1,rx-2,ry-1);ell('#f6f6fa',X,Y0,rx-2,ry-2);ell('#1b2a30',X,Y0,rx-10,ry-8);
  const cols=['#e8a030','#58c25e','#4a90e0','#e0506a'];
  for(let a=0;a<6.28;a+=.2){const bx=X+Math.cos(a)*(rx-16),by=Y0+Math.sin(a)*(ry-12);R(cols[(a*5|0)%4],bx,by-3,2,4);R('#ffffff',bx,by-3,1,1)}
  ell('#2e4048',X,Y0,28,14);ell('#8a9ab0',X,Y0-2,26,10);ell('#d0dae6',X,Y0-3,22,7);
  for(let k=0;k<9;k++)R(k%2?'#7cfff0':'#ffd86b',X-22+k*5,Y0-4+(k%3),2,3)},
stool(o){const x=o.px+4,y=o.py+4;disc('rgba(0,0,0,.25)',x+1,y+2,4);R('#555a66',x-1,y,2,5);disc('#9a7040',x,y-1,4);disc('#e0b878',x,y-2,3)},
mast(o){const x=o.px+12,y=o.py+14;R('rgba(0,0,0,.25)',x-12,y+8,24,3);disc('#c8ccdc',x,y,12);disc('#e8eaf2',x,y-1,11);disc('#aab0c4',x,y,7);
  R('#9aa0b0',x-1,y-40,2,34);disc('#f4f6fb',x,y-12,7);disc('#ffffff',x-2,y-14,3);R('#aab',x-9,y-30,18,1);
  if((frame>>4)&1)R('#ff3b3b',x-1,y-42,2,2)}
};

/* ================= VẼ NỀN ================= */
const KS=[];
function karst(v){
  if(KS[v])return KS[v];
  const w=[56,64,48][v],h=[56,70,48][v],c=mkc(w,h),g=c.getContext('2d');
  for(let x=0;x<w;x++){
    const u=(x+.5)/w*2-1,top=h*(1-Math.pow(Math.abs(u),.65+v*.1))*(.82+((hs(x,v*7+3)%100)/100)*.18)+(hs(x>>2,v)%5),t0=Math.max(0,Math.round(h-top));
    for(let y=t0;y<h;y++){const d=y-t0;let col=d<1?(u>0?'#d8805a':'#7a5a8a'):d<3?(u>0?'#8a4a5a':'#3f2f5e'):y<h*.7?'#2a2046':'#1c1632';
      if(hs(x,y+v*13)%23===0&&d>3)col='#3a2c5a';g.fillStyle=col;g.fillRect(x,y,1,1)}}
  g.fillStyle='rgba(120,80,130,.35)';g.fillRect(0,h-6,w,6);return KS[v]=c}
const KP=[];
(()=>{
  for(let i=0;i<16;i++){KP.push([i*66+(hs(i,3)%24)-20,OY*T-12,hs(i,5)%3,.8+(hs(i,7)%50)/100]);KP.push([i*66+(hs(i,13)%24)+10,GHH*T-4,hs(i,15)%3,.7+(hs(i,17)%40)/100])}
  for(let k=0;k<6;k++){KP.push([4+hs(k,21)%24,70+k*72,hs(k,23)%3,.75+(hs(k,25)%40)/100]);KP.push([936+hs(k,27)%16,70+k*72,hs(k,29)%3,.75+(hs(k,31)%40)/100])}
})();

function tileY(f,x,y){
  const k=f.kd[y][x],h=hs(x,y),px=x*T,py=y*T,Q=(c,a,b,w,hh)=>R(c,px+a,py+b,w,hh),K=(dx,dy)=>(f.kd[y+dy]||[])[x+dx]|0;
  if(!k){if(hs(x*3,y*5+(frame>>4))%11===0){cx.globalAlpha=.5;Q('#ffd6aa',(h>>3)&3,(h>>5)&5,3,1);cx.globalAlpha=1}
    if(((x+y+(frame>>5))&3)===0){cx.globalAlpha=.1;Q('#ffffff',0,3,T,1);cx.globalAlpha=1}return}
  if(k===1||k===2){
    const a=k===1?['#c4873f','#b97d36']:['#d3a876','#c99c68'];
    Q(a[(x+y)&1],0,0,T,4);Q(a[(x+y+1)&1],0,4,T,4);Q('rgba(60,30,10,.35)',0,3,T,1);Q('rgba(60,30,10,.35)',0,7,T,1);
    if(h%7===0)Q('rgba(60,30,10,.4)',(h>>3)&7,0,1,3);if(h%5===0)Q('rgba(255,220,160,.35)',(h>>4)&5,1,3,1);return}
  if(k===3){
    Q((x+y)&1?'#7a3650':'#6e2e44',0,0,T,T);if(h%4===0)Q('#8a4660',(h>>3)&6,(h>>6)&6,2,1);
    if(K(0,-1)!==3)Q('#e0b860',0,0,T,1);if(K(0,1)!==3)Q('#e0b860',0,T-1,T,1);return}
  if(k===8){Q('#e8e2d8',0,0,T,T);if(K(0,-1)!==8)Q('#ffffff',0,0,T,2);Q('#cdbfae',0,T-3,T,3);Q('#8a5a38',0,T-1,T,1);if(h%9===0)Q('#d6cebf',(h>>3)&5,2,2,3);return}
  if(k===9){
    Q('#eceef6',0,0,T,T);if(K(0,1)===0)Q('#b8bed4',0,T-2,T,2);
    [[0,-1,0,0,T,2],[0,1,0,T-2,T,2],[-1,0,0,0,2,T],[1,0,T-2,0,2,T]].forEach(([a,b,rx,ry,w,hh])=>{const n=K(a,b);if(n===1||n===2||n===3){Q('#9aa2c0',rx,ry,w,hh);cx.globalAlpha=.5;Q('#a8d8f4',a?rx:0,b?ry:0,a?w:T,b?hh:T);cx.globalAlpha=1}});
    if(h%29===0){disc('#d8392b',px+4,py+4,3);disc('#ffffff',px+4,py+4,2);disc('#d8392b',px+4,py+4,1)}return}
  if(k===5||k===6){
    Q('#f0ebe0',0,0,T,T);Q('#b0a898',0,2,T,1);Q('#b0a898',0,5,T,1);Q(k===5?'#ffffff':'#d8d2c4',0,0,T,1);
    if(K(-1,0)!==5&&K(-1,0)!==6)Q('#8a909a',0,0,1,T);if(K(1,0)!==5&&K(1,0)!==6)Q('#8a909a',T-1,0,1,T)}}

function drawBack(i){
  const f=Y[i],vw=CW/IS,vh=CH/IS,x0=Math.max(0,Math.floor(camX/T)-1),y0=Math.max(0,Math.floor(camY/T)-1),x1=Math.min(GW-1,x0+Math.ceil(vw/T)+3),y1=Math.min(GHH-1,y0+Math.ceil(vh/T)+3);
  const g=cx.createLinearGradient(camX,0,camX+vw,0);g.addColorStop(0,'#3a2a5e');g.addColorStop(.5,'#7a4a72');g.addColorStop(1,'#d8704a');
  cx.fillStyle=g;cx.fillRect(camX-2,camY-2,vw+4,vh+4);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(!f.kd[y][x])tileY(f,x,y);
  KP.forEach(([x,by,v,s])=>{const c=karst(v),w=c.width*s,h=c.height*s;if(x+w<camX||x>camX+vw||by<camY||by-h>camY+vh)return;cx.drawImage(c,Math.round(x),Math.round(by-h),Math.round(w),Math.round(h))});
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(f.kd[y][x])tileY(f,x,y);
  f.DEC.forEach(fn=>fn());
  const ex=200;f.O.forEach(o=>{if(o.ax<camX-ex||o.ax>camX+vw+ex||o.ay<camY-ex||o.ay>camY+vh+ex+80)return;
    if(o.k==='pole')ell('rgba(0,0,0,.14)',o.px+9,o.py+3,12,5);DRAW[o.k]&&DRAW[o.k](o)})}

function canopy(o){
  const x=o.px+4,y=o.py-16;cx.globalAlpha=.6;disc('#f4ecd8',x,y,13);
  for(let a=0;a<6.28;a+=.785)for(let r=2;r<13;r+=1)R('#c9b88c',x+Math.cos(a)*r,y+Math.sin(a)*r,1,1);
  disc('#8a7a5a',x,y,2);cx.globalAlpha=1}
const ZN=[[1,8,'u'],[92,8,'u'],[1,21,'d'],[92,21,'d']];
function drawFront(i){
  const f=Y[i],vw=CW/IS,vh=CH/IS,L=ins.filter(p=>p.fl===F0+i);
  f.O.forEach(o=>{
    if(o.th&&L.some(q=>q.y<o.ay-1&&q.y>o.ay-o.th-4&&Math.abs(q.x-o.ax)<o.w*4+6))DRAW[o.k](o);
    if(o.k==='pole'&&o.ax>camX-30&&o.ax<camX+vw+30)canopy(o)});
  f.FR.forEach(fn=>fn());
  cx.save();cx.globalCompositeOperation='lighter';
  for(let k=0;k<30;k++){const x=camX+(((hs(k,1)%1000)/1000*vw)+frame*(.08+(k%3)*.05))%vw,y=camY+(((hs(k,2)%1000)/1000*vh)+Math.sin(frame*.02+k)*8+frame*.03*(k%2?1:-1)+vh*4)%vh;
    cx.globalAlpha=.25+.35*Math.abs(Math.sin(frame*.04+k));R(k%3?'#ffd9a0':'#ffb8e0',x,y,k%5?1:2,1)}
  const gr=cx.createRadialGradient(camX+vw,camY+vh*.25,10,camX+vw,camY+vh*.25,vw*.9);gr.addColorStop(0,'rgba(255,170,90,.22)');gr.addColorStop(1,'rgba(255,170,90,0)');
  cx.globalAlpha=1;cx.fillStyle=gr;cx.fillRect(camX,camY,vw,vh);cx.restore();
  const P=L.find(q=>q.pl===sel);
  if(P&&!TK)ZN.forEach(([lx,ly,d])=>{if(d==='u'&&i>=NF-1||d==='d'&&i<=0)return;
    const x=(OX+lx+1.5)*T,y=(OY+ly+1.5)*T;if(Math.hypot(P.x-x,P.y-y)<30){const j=i+(d==='u'?1:-1);label(x,y-26,(d==='u'?'Lên ':'Xuống ')+NAMES[j].split(':')[0],d==='u'?'#ffd23f':'#7cfff0')}})}

/* hậu kỳ màn hình: sắc hoàng hôn mơ màng + biển tên tầng */
const _dr=draw;
draw=function(){
  _dr();
  if(state!=='island'||!inside||!isY(curF))return;
  try{
    cx.save();cx.setTransform(1,0,0,1,0,0);
    cx.globalCompositeOperation='soft-light';cx.globalAlpha=.55;
    const g=cx.createLinearGradient(0,0,0,CH);g.addColorStop(0,'#ff9a5a');g.addColorStop(1,'#c05aa0');cx.fillStyle=g;cx.fillRect(0,0,CW,CH);
    cx.globalCompositeOperation='lighter';cx.globalAlpha=.06;cx.fillStyle='#ffb070';cx.fillRect(0,0,CW,CH);
    cx.globalCompositeOperation='source-over';
    const v=cx.createRadialGradient(CW/2,CH/2,CH*.35,CW/2,CH/2,CW*.65);v.addColorStop(0,'rgba(90,30,100,0)');v.addColorStop(1,'rgba(90,30,100,.38)');cx.globalAlpha=1;cx.fillStyle=v;cx.fillRect(0,0,CW,CH);
    BN.t++;
    if(BN.t<240){const a=Math.min(1,BN.t/30,(240-BN.t)/50);cx.globalAlpha=a;cx.textAlign='center';cx.font='bold 9px monospace';cx.lineWidth=3;cx.strokeStyle='#2a1038';
      cx.strokeText('✦ GIẤC MƠ ✦',CW/2,22);cx.fillStyle='#ffd9f0';cx.fillText('✦ GIẤC MƠ ✦',CW/2,22);
      cx.font='bold 13px monospace';cx.strokeText(BN.txt,CW/2,40);cx.fillStyle='#ffe9a0';cx.fillText(BN.txt,CW/2,40)}
    cx.restore()}catch(e){oops('hậu kỳ',e);cx.restore()}};

/* ================= HOOK VÀO GAME ================= */
const _di=drawIn;
drawIn=function(){
  const i=curF-F0;
  if(i<0||i>=NF||!Y[i])return _di();
  try{drawBack(i)}catch(e){oops('drawBack',e);cx.globalAlpha=1}
  _di();
  try{drawFront(i)}catch(e){oops('drawFront',e);cx.globalAlpha=1}};
const snapY=()=>{const P=ins.find(p=>p.pl===sel);if(!P||!isY(P.fl))return;camX=clamp(P.x-CW/IS/2,0,GW*T-CW/IS);camY=clamp(P.y-CH/IS/2,0,GHH*T-CH/IS)};
const _sv=syncView;syncView=function(s){_sv(s);const P=ins.find(p=>p.pl===sel);if(P&&isY(P.fl)){IS=CW/VW;if(s)snapY()}};
const _cam=cam;cam=function(){
  if(inside&&isY(curF)){const P=ins.find(p=>p.pl===sel)||ins.find(p=>p.pl);if(!P)return;
    camX+=(clamp(P.x-CW/IS/2,0,GW*T-CW/IS)-camX)*.15;camY+=(clamp(P.y-CH/IS/2,0,GHH*T-CH/IS)-camY)*.15;return}
  _cam()};

/* ---------- Thế giới giấc mơ: thức dậy ở phòng ngủ tầng 4 ---------- */
WORLDS.yacht={name:'Du thuyền Danova (giấc mơ)',enter(q){
  const c=CAB[SPAWN[(q.pl-1)%SPAWN.length]];
  q.act='idle';q.sneak=0;q.sprint=0;q.yb=60;
  putIn(q,F0,OX+c[0]+.5,OY+c[1]+.5);q.vis=1;
  if(q.pl===sel){BN={t:0,txt:NAMES[0]};
    cap('Bạn mở mắt: mình đang ở trong một phòng ngủ trên du thuyền Danova, giữa vịnh Hạ Long lúc hoàng hôn... Đây là giấc mơ ư? Đi ra hành lang, hai đầu thuyền có cầu thang lên các tầng trên.')}}};

function startDream(P){
  const n=P.pl;
  if(typeof window.worldTransfer==='function'){if(window.worldTransfer(n,'yacht')){DONE[n]=1;save()}}
  else{DONE[n]=1;save();warp(P,()=>{WORLDS.yacht.enter(P);if(P.pl===sel)syncView(true)})}}

function stairCheck(P,i){
  if(P.yb>0){P.yb--;return}
  if(trans)return;
  const lx=Math.floor(P.x/T)-OX,ly=Math.floor(P.y/T)-OY,Lf=lx>=1&&lx<=3,Rt=lx>=92&&lx<=94;
  if(!Lf&&!Rt)return;
  let d=0;if(ly>=8&&ly<=10&&i<NF-1)d=1;else if(ly>=21&&ly<=23&&i>0)d=-1;
  if(!d)return;
  const j=i+d,end=Lf?7:88;P.yb=60;
  warp(P,()=>{putIn(P,F0+j,OX+end+.5,OY+12.5+slot(P)*.6);P.yb=40;
    if(P.pl===sel){syncView(true);BN={t:0,txt:NAMES[j]};cap('Bạn '+(d>0?'đi lên ':'đi xuống ')+NAMES[j]+'.')}})}

function tick(dt){
  allPl().forEach(P=>{
    const i=P.fl-F0;
    if(i>=0&&i<NF){stairCheck(P,i);return}
    if(P.fl===2&&P.act==='sleep'&&!DONE[P.pl]){DT[P.pl]=(DT[P.pl]||0)+dt;if(DT[P.pl]>=1.6)startDream(P)}
    else DT[P.pl]=0})}
const _step=step;step=function(){_step();if(state!=='island')return;try{tick(Math.min(.25,DM||.016))}catch(e){oops('tick',e)}};

/* ---------- Vòng đời game ---------- */
const _gen=gen;gen=function(sd){_gen(sd);load();DT={};buildAll()};
const _mk=mkPeople;mkPeople=function(){_mk();DONE={};DT={};save()};

window.yachtDream={go:n=>window.worldTransfer?window.worldTransfer(n||sel,'yacht'):false,done:()=>DONE,floors:()=>Y};
load();buildAll();
console.log('[yacht] đã nạp OK (4 tầng du thuyền Danova)');
})();