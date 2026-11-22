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