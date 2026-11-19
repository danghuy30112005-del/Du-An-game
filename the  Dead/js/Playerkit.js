/* ===== playerkit.js: tốc độ, rón rén (Shift), chạy nhanh (Q), thể lực, túi đồ 18 ô (B) =====
   Nạp SAU deadisland.js (và village.js nếu có). Không cần sửa deadisland.js.
   - Đi nhanh hơn trước một chút.
   - Giữ Shift: đi rón rén, không phát tiếng bước chân, oan hồn khó phát hiện hơn.
   - Q: chạy nhanh. Thể lực đầy chạy được ~3 giây. Bấm Q lần nữa để dừng sớm.
   - Thể lực hồi đầy sau ~15 giây. Đang hồi vẫn bấm Q được, tiêu hao đúng phần thể lực đã hồi.
   - B: mở / đóng túi đồ (18 ô, mỗi ô 1 đồ, mỗi người chơi một túi, lưu vào localStorage).
   - M: bật / tắt âm thanh bước chân.
   - Thêm đồ từ code khác: giveItem(soNguoiChoi, 'bread')  (id nằm trong ITEMS bên dưới). */
(()=>{
if(typeof ctrl!=='function'||typeof showHud!=='function'||typeof mkPeople!=='function'){console.warn('playerkit.js: hãy nạp sau deadisland.js');return}

/* ---------- Thông số (chỉnh ở đây) ---------- */
const BASE=1.25,SNEAK=.6,RUN=2.1;               /* tốc độ: đi / rón rén / chạy nhanh (gốc là 1) */
const SMAX=100,DRAIN=SMAX/3,REGEN=SMAX/15,MINQ=3;/* thể lực: hết sau 3 giây chạy, hồi đầy sau 15 giây */
const SLOTS=18,SAVE='deadisland:inv1';
const ITEMS={
  bread:{icon:'🍞',name:'Bánh mì',use:'stamina',v:20,d:'Dùng để hồi 20 thể lực.'},
  water:{icon:'🥤',name:'Nước uống',use:'stamina',v:40,d:'Dùng để hồi 40 thể lực.'},
  apple:{icon:'🍎',name:'Táo',use:'stamina',v:15,d:'Dùng để hồi 15 thể lực.'},
  bandage:{icon:'🩹',name:'Băng gạc',d:'Đồ cứu thương (chưa có công dụng).'},
  key:{icon:'🗝️',name:'Chìa khóa cũ',d:'Không biết mở được cánh cửa nào...'},
  pelt:{icon:'🦌',name:'Da thú',d:'Da thú rừng, bán hoặc dùng làm đồ.'},
  meat:{icon:'🍖',name:'Thịt sống',d:'Thịt tươi từ thợ săn.'},
  gem:{icon:'💎',name:'Tinh thể',d:'Viên tinh thể lấp lánh từ hang động.'}};
const START=['bread','water','bandage'];         /* đồ có sẵn khi bắt đầu */

/* ---------- Trạng thái ---------- */
let INV={},ST={},held={shift:0},open=false,selSlot=-1,muted=false,stepAcc=0,lastSel=0,lastKey='';
try{INV=JSON.parse(localStorage.getItem(SAVE))||{}}catch(_){INV={}}
const saveInv=()=>{try{localStorage.setItem(SAVE,JSON.stringify(INV))}catch(_){}};
function bag(n){
  let b=INV[n];
  if(!Array.isArray(b)){b=INV[n]=Array(SLOTS).fill(null);START.forEach((id,i)=>b[i]=id);saveInv()}
  while(b.length<SLOTS)b.push(null);b.length=SLOTS;
  for(let i=0;i<SLOTS;i++)if(b[i]&&!ITEMS[b[i]])b[i]=null;
  return b}
const stOf=n=>ST[n]||(ST[n]={v:SMAX,on:0});

/* ---------- Âm thanh bước chân (WebAudio, không cần file) ---------- */
let AC=null;
function audio(){
  if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(_){}}
  if(AC&&AC.state==='suspended')AC.resume();
  return AC}
const FREQ={sand:1500,grass:800,hard:2200,mud:350,wood:1700,cave:2600};
function groundKind(P){
  if(inside)return P.fl===6?'cave':'wood';
  const t=(m[Math.floor(P.y/T)]||[])[Math.floor(P.x/T)];
  return t===SAND?'sand':t===SWAMP?'mud':(t===PATH||t===COURT||t===DOOR)?'hard':'grass'}
function stepSound(kind,vol){
  const a=audio();if(!a||muted)return;
  const len=Math.floor(a.sampleRate*(kind==='hard'||kind==='cave'?.045:.07)),buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2);
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();
  s.buffer=buf;f.type='lowpass';f.frequency.value=FREQ[kind]||900;g.gain.value=vol;
  s.connect(f);f.connect(g);g.connect(a.destination);s.start()}
function footsteps(P,mv,run){
  if(mv<=0)return;
  stepAcc+=mv;const gap=run?13:9;
  if(stepAcc>=gap){stepAcc=0;stepSound(groundKind(P),run?.22:.11)}}

/* ---------- Thể lực ---------- */
function tickStamina(){
  const dt=Math.min(.1,DM||0);
  people.concat(ins).filter(p=>p.pl).forEach(p=>stOf(p.pl));
  Object.keys(ST).forEach(k=>{
    const S=ST[k];
    if(+k!==sel)S.on=0;                         /* đổi nhân vật thì nhân vật cũ ngừng chạy */
    if(S.on){S.v-=DRAIN*dt;if(S.v<=0){S.v=0;S.on=0;if(+k===sel)cap('Hết thể lực! Đợi hồi thể lực rồi hãy chạy tiếp.')}}
    else S.v=Math.min(SMAX,S.v+REGEN*dt)})}
function hud(){
  const S=stOf(sel),v=Math.round(S.v),txt=S.on?'💨 Chạy nhanh':held.shift?'🤫 Rón rén (im lặng)':'🚶 Đi bộ',key=v+'|'+txt+'|'+S.on;
  if(key===lastKey)return;lastKey=key;
  const f=$('stF');if(f){f.style.width=v+'%';f.className=S.on?'run':v<20?'low':''}
  const t=$('stS');if(t)t.textContent='Thể lực '+v+'/'+SMAX+' · '+txt}

/* ---------- Điều khiển nhân vật (thay ctrl gốc) ---------- */
ctrl=function(){
  tickStamina();
  const P=(inside?ins:people).find(p=>p.pl===sel);
  if(!P||trans||TK){hud();return}
  wf=P.fl||1;
  const S=stOf(sel);
  if(open){S.on=0;P.sneak=0;P.sprint=0;P.moving=0;hud();return}/* mở túi đồ: nhân vật đứng yên */
  const run=!!S.on,sneak=!run&&!!held.shift;
  P.sprint=run?1:0;P.sneak=sneak?1:0;
  const dx=(keys.arrowright||keys.d?1:0)-(keys.arrowleft||keys.a?1:0),dy=(keys.arrowdown||keys.s?1:0)-(keys.arrowup||keys.w?1:0);
  if(dx||dy){
    const l=Math.hypot(dx,dy),mud=(!inside&&(m[Math.floor(P.y/T)]||[])[Math.floor(P.x/T)]===SWAMP)?.7:1,
      sp=(run?RUN:sneak?SNEAK:BASE)*mud,nx=P.x+dx/l*sp,ny=P.y+dy/l*sp,ox=P.x,oy=P.y;
    P.path=[];
    if(walk(nx,P.y,P))P.x=nx;
    if(walk(P.x,ny,P))P.y=ny;
    P.tx=P.x;P.ty=P.y;P.moving=1;
    if(!sneak)footsteps(P,Math.hypot(P.x-ox,P.y-oy),run)}
  hud()};

/* ---------- Túi đồ ---------- */
function render(){
  const g=$('invGrid');if(!g)return;
  const b=bag(sel);g.innerHTML='';
  b.forEach((id,i)=>{
    const s=document.createElement('button');
    s.className='slot'+(id?'':' empty')+(i===selSlot?' sel':'');
    s.textContent=id?ITEMS[id].icon:'';
    s.setAttribute('aria-label',id?ITEMS[id].name:'Ô trống '+(i+1));
    s.onclick=()=>{selSlot=i;render()};
    g.append(s)});
  const n=b.filter(Boolean).length,it=selSlot>=0&&b[selSlot]?ITEMS[b[selSlot]]:null;
  $('invCnt').textContent=n+'/'+SLOTS;$('invWho').textContent='P'+sel;
  $('invInfo').textContent=it?it.icon+' '+it.name+': '+it.d:selSlot>=0?'Ô trống.':'Chọn một ô để xem đồ.';
  $('invUse').disabled=!(it&&it.use);$('invDrop').disabled=!it}
function toggle(on){
  if(state!=='island')return;
  open=on===undefined?!open:on;
  $('inv').hidden=!open;
  if(open){stOf(sel).on=0;selSlot=-1;lastSel=sel;render();cap('Đang mở túi đồ (bấm B hoặc Esc để đóng).')}}
function giveItem(n,id){
  if(!ITEMS[id])return false;
  const b=bag(n),i=b.indexOf(null);
  if(i<0){cap('Túi đồ đã đầy ('+SLOTS+'/'+SLOTS+').');return false}
  b[i]=id;saveInv();if(open)render();
  cap('P'+n+' nhặt được '+ITEMS[id].icon+' '+ITEMS[id].name+'.');return true}
window.giveItem=giveItem;window.ITEMS=ITEMS;
$('invUse').onclick=()=>{
  const b=bag(sel),id=b[selSlot],it=id&&ITEMS[id];if(!it||!it.use)return;
  if(it.use==='stamina'){const S=stOf(sel);S.v=Math.min(SMAX,S.v+it.v);cap('P'+sel+' dùng '+it.name+', hồi '+it.v+' thể lực.')}
  b[selSlot]=null;saveInv();render()};
$('invDrop').onclick=()=>{
  const b=bag(sel),id=b[selSlot];if(!id)return;
  cap('P'+sel+' vứt '+ITEMS[id].name+'.');b[selSlot]=null;saveInv();render()};
$('invX').onclick=()=>toggle(false);
$('invBtn').onclick=()=>toggle();

/* ---------- Phím tắt ---------- */
addEventListener('keydown',e=>{
  held.shift=e.shiftKey?1:0;
  if(e.target.tagName==='INPUT')return;
  audio();/* mở khóa âm thanh sau cú bấm phím đầu tiên */
  if(state!=='island')return;
  const k=e.key.toLowerCase();
  if(k==='escape'&&open){toggle(false);return}
  if(TK||e.repeat)return;
  if(k==='b'){toggle();return}
  if(k==='m'){muted=!muted;cap(muted?'Đã tắt âm thanh bước chân.':'Đã bật âm thanh bước chân.');return}
  if(k==='q'&&!open&&!trans){
    const S=stOf(sel);
    if(S.on){S.on=0;cap('Dừng chạy nhanh.')}
    else if(S.v>=MINQ){S.on=1}
    else cap('Hết thể lực, chưa thể chạy nhanh. Hãy đợi hồi thể lực.')}});
addEventListener('keyup',e=>{held.shift=e.shiftKey?1:0});
addEventListener('blur',()=>{held.shift=0});
setInterval(()=>{if(open&&sel!==lastSel){lastSel=sel;selSlot=-1;render()}},150);/* đổi nhân vật khi đang mở túi */

/* ---------- Móc vào game ---------- */
const _showHud=showHud;
showHud=function(){_showHud();const g=$('gd');if(g)g.innerHTML+='<br>B: Túi đồ · Shift: Rón rén · Q: Chạy nhanh · M: Âm thanh'};
const _mk=mkPeople;
mkPeople=function(){_mk();INV={};ST={};saveInv();if(open)toggle(false)};/* ván mới: túi đồ + thể lực làm lại */
if(typeof doReset==='function'){const _dr=doReset;doReset=function(k){const go=confirmKey===k;_dr(k);if(go&&k==='all'){INV={};ST={};saveInv()}}}
})();