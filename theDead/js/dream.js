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
  if(!S.open){cap('Cửa phòng khách bị khóa chặt. Quản gia sẽ phát chìa khóa sau bữa trưa.');return}
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
function drawLocks(){
  if(!FL[2])return;
  const vw=CW/IS,vh=CH/IS;
  DOORS.forEach(d=>{
    if(!isLocked(d))return;
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