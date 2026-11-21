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
window.ITEMS=ITEMS;window.giveItem=giveItem;
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
/* ---------- Icon thể lực: mũi tên pixel (tối khi cạn, sáng dần khi hồi) ---------- */
(function(){
  const stm=$('stm');if(!stm)return;
  const bar=stm.querySelector('.bar');if(bar)bar.remove();
  const cv=document.createElement('canvas');cv.id='stIc';cv.width=24;cv.height=16;
  const g=cv.getContext('2d'),
    inA=(x,y)=>{const a=x+.5,b=y+.5;return(a>=3&&a<12&&Math.abs(b-8)<=3)||(a>=12&&a<=21.5&&Math.abs(b-8)<=8*(21.5-a)/9.5)};
  for(let y=0;y<16;y++)for(let x=0;x<24;x++){
    if(!inA(x,y)){
      if(x<3&&y>=4&&y<=11&&hs(x,y)%100<(x===2?45:x===1?30:15)){g.fillStyle='#ff5fa2';g.fillRect(x,y,1,1)}
      continue}
    const edge=!inA(x+1,y)||!inA(x-1,y)||!inA(x,y+1)||!inA(x,y-1);
    g.fillStyle=edge?'#14123a':!inA(x,y-2)?'#8fd8ff':(y===8&&x%4===0&&x<10)?'#ff5fa2':x<9?'#3b5bd6':'#6a3fc0';
    g.fillRect(x,y,1,1)}
  stm.insertBefore(cv,stm.firstChild);
  const st=document.createElement('style');
  st.textContent='#stIc{width:72px;height:48px;image-rendering:pixelated;transition:filter .1s}#stIc.run{box-shadow:0 0 0 0}';
  document.head.appendChild(st)})();

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
  const ic=$('stIc');if(ic){const k=v/100;ic.style.filter='brightness('+(.18+.82*k).toFixed(2)+') saturate('+(.25+.75*k).toFixed(2)+')'+(S.on?' drop-shadow(0 0 4px #ffd23f)':'')}
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
window.takeItem=(n,id)=>{const b=bag(n),i=b.indexOf(id);if(i<0)return false;b[i]=null;saveInv();if(open)render();return true};
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
/* ===== pitgate.js: HÀNG RÀO QUANH HỐ + CỔNG KHÓA + DAO PHÉP + ĐỠ ĐÒN =====
   Nạp CUỐI CÙNG (sau ghostplus.js). Không cần sửa deadisland.js.
   - Hàng rào bao quanh hố lớn, cổng phía tây bị khóa. Lại gần: hiện "Đã bị khóa".
   - Nói chuyện xong với Pháp sư: nhận thêm Dao phép. Trong túi đồ: chọn Dao phép, bấm Dùng để cầm.
   - Chuột phải: vung vũ khí (chém khóa cổng nếu đứng gần và vung về phía cổng).
   - R: giơ kiếm đỡ đòn. Đỡ trúng: lửa xanh, hồi 120 giây. Đỡ hụt: hồi 5 giây. (giây ngoài đời thật)
   - Cần ghostplus.js gọi window.parryHit (xem 2 chỗ sửa nhỏ trong ghostplus.js). */
(()=>{
if(typeof killPlayer!=='function'||typeof allPl!=='function'||typeof PIT==='undefined'){console.warn('pitgate.js: hãy nạp SAU deadisland.js');return}

/* ---------- Thông số ---------- */
const FENCE=40,GATEL=41;          /* loại ô mới: hàng rào, cổng khóa */
const PW=.7,CD_OK=120,CD_MISS=5;  /* cửa sổ đỡ đòn / hồi khi đỡ trúng / hồi khi đỡ hụt (giây) */
const SWCD=.35;                   /* thời gian giữa 2 lần vung (giây) */
const CX0=156,CY0=48,RX=8,RY=6.5; /* tâm hố và bán kính hàng rào (ô). Hố có bán kính 6,5 x 5 */
const INVKEY='deadisland:inv1',GKEY='deadisland:gate:';
const ITEMS=window.ITEMS||{};
let FN=null,EQ={},SK={},SWC={},SWG=[],PT=[],RG=[],LKA=null,bc=null,bcf=-99;
const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(a,b,w,h)};
const visFl=f=>inside?f===curF:!f;
const playerOf=n=>allPl().find(p=>p.pl===n);

/* ---------- Vật phẩm: Dao phép ---------- */
if(ITEMS&&!ITEMS.mdagger)ITEMS.mdagger={icon:'🗡️',name:'Dao phép',weapon:1,
  d:'Lưỡi dao thép xanh, chuôi vàng. Chuột phải: chém (mở được khóa cổng). R: giơ lên đỡ đòn.'};

/* ---------- Đọc túi đồ (playerkit.js lưu ở localStorage) ---------- */
function bagRaw(){
  if(frame-bcf>=10||!bc){bcf=frame;try{bc=JSON.parse(localStorage.getItem(INVKEY))||{}}catch(_){bc={}}}
  return bc}
const bagOf=n=>{const b=bagRaw()[n];return Array.isArray(b)?b:[]};
function heldId(n){
  const b=bagOf(n);
  if(EQ[n]&&b.includes(EQ[n]))return EQ[n];
  delete EQ[n];return null}            /* đồ đã vứt / không còn trong túi thì tự bỏ cầm */
function curWeapon(n){
  const id=heldId(n);
  return id&&ITEMS[id]&&ITEMS[id].weapon?id:null}
window.curWeapon=curWeapon; 

/* ---------- Tạo hàng rào + cổng ---------- */
function buildFence(){
  FN=null;
  if(!m||!m[CY0]||m[CY0][CX0]!==PIT)return;
  const inn=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&Math.hypot((x+.5-CX0)/RX,(y+.5-CY0)/RY)<1;
  const fence=[];
  /* hàng rào = các ô nằm sát ngoài vùng elip (8 hướng) nên vòng rào liền mạch, người không lọt qua được */
  for(let y=CY0-10;y<=CY0+10;y++)for(let x=CX0-12;x<=CX0+12;x++){
    if(inn(x,y)||m[y][x]===SEA)continue;
    let nb=false;
    for(let j=-1;j<=1&&!nb;j++)for(let i=-1;i<=1;i++)if((i||j)&&inn(x+i,y+j)){nb=true;break}
    if(nb)fence.push([x,y])}
  if(!fence.length)return;
  /* cổng: 2 ô ở phía tây, hai hàng giữa */
  const gate=[CY0-1,CY0].map(y=>{let b=null;fence.forEach(([x,yy])=>{if(yy===y&&x<CX0&&(!b||x<b[0]))b=[x,yy]});return b}).filter(Boolean);
  if(!gate.length)return;
  let open=false;try{open=localStorage.getItem(GKEY+seed)==='1'}catch(_){}
  const gset=new Set(gate.map(([x,y])=>y*W+x)),orig=new Map();
  fence.forEach(([x,y])=>{
    const k=y*W+x;orig.set(k,m[y][x]);
    m[y][x]=gset.has(k)?(open?PATH:GATEL):FENCE});
  const gx=gate.reduce((a,g)=>a+g[0],0)/gate.length,gy=gate.reduce((a,g)=>a+g[1],0)/gate.length;
  FN={gate,gset,orig,open,gcx:Math.round((gx+.5)*T),gcy:Math.round((gy+.5)*T),near:0,flag:0}}

const _gen=gen;gen=function(sd){_gen(sd);buildFence()};
const _mk=mkPeople;mkPeople=function(){_mk();EQ={};SK={};SWC={};SWG=[];PT=[];RG=[];LKA=null};

/* ---------- Vẽ hàng rào, cổng (vẽ lên nền đất) ---------- */
const isF=(x,y)=>{const t=(m[y]||[])[x];return t===FENCE||t===GATEL||!!(FN&&FN.gset.has(y*W+x))};
const _land=land;land=function(x,y){
  _land(x,y);
  if(!FN)return;
  const t=m[y][x],k=y*W+x,og=FN.open&&FN.gset.has(k);
  if(t!==FENCE&&t!==GATEL&&!og)return;
  const px=x*T,py=y*T,h=hs(x,y),Q=(c,a,b,w,hh)=>{cx.fillStyle=c;cx.fillRect(px+a,py+b,w,hh)};
  if(og){/* cổng đã mở: hai cánh cửa dạt vào trong */
    const top=y===FN.gate[0][1];
    Q('#4a2f17',0,top?0:6,7,2);Q('#8a5a2e',0,top?0:6,7,1);return}
  if(FN.orig.get(k)===PATH)Q(h%2?'#b89b6a':'#a98c5c',0,0,T,T);
  if(t===GATEL){/* cổng gỗ có đai sắt */
    Q('rgba(0,0,0,.25)',1,7,7,1);
    Q('#4a2f17',0,0,T,T);Q('#8a5a2e',1,1,6,6);Q('#6b4423',3,1,1,6);Q('#6b4423',5,1,1,6);Q('#b8864f',1,1,6,1);
    Q('#3a3a40',0,2,T,1);Q('#3a3a40',0,5,T,1);return}
  const E=isF(x+1,y),Wt=isF(x-1,y),N=isF(x,y-1),S=isF(x,y+1);
  Q('rgba(0,0,0,.22)',1,7,7,1);
  if(E){Q('#8a5a2e',4,2,4,1);Q('#8a5a2e',4,5,4,1);Q('#5a3a1e',4,3,4,1);Q('#5a3a1e',4,6,4,1)}
  if(Wt){Q('#8a5a2e',0,2,4,1);Q('#8a5a2e',0,5,4,1);Q('#5a3a1e',0,3,4,1);Q('#5a3a1e',0,6,4,1)}
  if(N){Q('#8a5a2e',3,0,2,4);Q('#5a3a1e',5,0,1,4)}
  if(S){Q('#8a5a2e',3,4,2,4);Q('#5a3a1e',5,4,1,4)}
  Q('#4a2f17',3,0,2,7);Q('#6b4423',3,0,1,7);Q('#b8864f',3,0,2,1)};

/* ---------- Hiệu ứng lửa xanh ---------- */
function burst(x,y,fl,n,big){
  for(let i=0;i<n;i++){const l=26+rnd(26);
    PT.push({x:x+rnd(7)-3,y:y+rnd(5)-2,vx:(Math.random()-.5)*(big?2.4:1.4),vy:-(.3+Math.random()*(big?2.2:1.3)),l,m:l,s:1+rnd(2)+(big?1:0),fl})}}
function drawParts(){
  PT.forEach(q=>{
    if(!visFl(q.fl))return;
    const k=q.l/q.m,c=k>.75?'#eaf6ff':k>.5?'#6fd0ff':k>.28?'#3b6fff':'#8a4dff';
    cx.globalAlpha=Math.min(1,q.l/10);
    R(c,Math.round(q.x),Math.round(q.y),q.s,q.s*2);R(c,Math.round(q.x)+(q.s>>1),Math.round(q.y)-1,1,1)});
  RG.forEach(r=>{
    if(!visFl(r.fl))return;
    const rad=3+r.t*1.4;cx.globalAlpha=1-r.t/r.d;
    for(let a=0;a<6.28;a+=.3)R('#bfe3ff',Math.round(r.x+Math.cos(a)*rad),Math.round(r.y+Math.sin(a)*rad*.8),2,2)});
  cx.globalAlpha=1}

/* ---------- Vung vũ khí ---------- */
function drawSwings(){
  SWG.forEach(s=>{
    const P=playerOf(s.n);if(!P||!visFl(P.fl||0))return;
    const p=s.t/s.d,a1=s.ang-1.1+2.2*p,ox=P.x,oy=P.y-7;
    for(let i=0;i<9;i++){const a=a1-i*.13;cx.globalAlpha=(1-p*.5)*(1-i/9);
      R('#dff2ff',Math.round(ox+Math.cos(a)*40),Math.round(oy+Math.sin(a)*40),2,2)}
    cx.globalAlpha=1;
    for(let r=3;r<=40;r+=1.5)R(r<6?'#d4a63a':'#cfe9ff',Math.round(ox+Math.cos(a1)*r)-1,Math.round(oy+Math.sin(a1)*r)-1,2,2)});
  cx.globalAlpha=1}
function doSwing(e){
  if(state!=='island'||trans||TK)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const n=sel,P=playerOf(n);if(!P)return;
  if(!curWeapon(n)){cap('Bạn chưa có vũ khí. Hãy nói chuyện với Pháp sư già để nhận Dao phép.');return}
  if((SWC[n]||0)>0)return;
  const r=cv.getBoundingClientRect(),k=inside?IS:1,
    wx=(e.clientX-r.left)/r.width*CW/k+camX,wy=(e.clientY-r.top)/r.height*CH/k+camY,
    ang=Math.atan2(wy-(P.y-7),wx-P.x);
  SWC[n]=SWCD;SWG.push({n,ang,t:0,d:10});
  if(FN&&!FN.open&&!P.fl&&!inside){
    const d=Math.hypot(FN.gcx-P.x,FN.gcy-P.y);
    if(d<=46){
      const ga=Math.atan2(FN.gcy-(P.y-7),FN.gcx-P.x),df=Math.abs(Math.atan2(Math.sin(ang-ga),Math.cos(ang-ga)));
      if(df<1.3)openGate();else cap('Hãy vung dao về phía cổng để chém khóa.')}}}
function openGate(){
  FN.open=true;FN.gate.forEach(([x,y])=>{m[y][x]=PATH});
  try{localStorage.setItem(GKEY+seed,'1')}catch(_){}
  burst(FN.gcx,FN.gcy,0,36,1);RG.push({x:FN.gcx,y:FN.gcy,fl:0,t:0,d:18});LKA={t:0};
  shake=Math.max(shake,8);
  cap('Chém! Ổ khóa vỡ tan, cổng hàng rào đã mở.')}
/* chuột phải: vung vũ khí, không làm nhân vật chạy tới chỗ bấm */
document.addEventListener('pointerdown',e=>{
  if(e.button!==2||e.target!==cv)return;
  e.preventDefault();e.stopPropagation();doSwing(e)},true);
cv.addEventListener('contextmenu',e=>e.preventDefault());

/* ---------- Kỹ năng R: đỡ đòn ---------- */
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key.toLowerCase()!=='r')return;
  if(state!=='island'||TK||trans)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const n=sel;if(!playerOf(n))return;
  if(!curWeapon(n)){cap('Cần cầm vũ khí để dùng kỹ năng.');return}
  const s=SK[n]||(SK[n]={t:0,cd:0,cdMax:CD_MISS,hit:0});
  if(s.t>0)return;
  if(s.cd>0){cap('Đỡ đòn đang hồi: '+fmt(s.cd)+'.');return}
  s.t=PW;s.hit=0;cap('Giơ kiếm lên đỡ đòn!')});

/* ghostplus.js gọi hàm này đúng lúc nhát chém trúng người chơi: true = đã đỡ được */
window.parryHit=function(V,att){
  const s=SK[V.pl];
  if(!s||s.t<=0||!curWeapon(V.pl))return false;
  s.t=0;s.hit=1;s.cd=CD_OK;s.cdMax=CD_OK;
  const H0=hOf(V),fl=V.fl||0,x=V.x+4,y=V.y-H0-6;
  burst(x,y,fl,40,1);burst(V.x+(att&&att.x>V.x?9:-9),V.y-10,fl,20,1);
  RG.push({x,y,fl,t:0,d:18},{x:V.x,y:V.y-10,fl,t:0,d:14});
  shake=Math.max(shake,6);
  cap('Đỡ đòn thành công! Lửa xanh bùng lên, kỹ năng hồi 2 phút.');
  return true};

function drawParry(){
  allPl().forEach(P=>{
    const s=SK[P.pl];if(!s||s.t<=0||!visFl(P.fl||0))return;
    const x=Math.round(P.x),y=Math.round(P.y),H0=hOf(P),bx=x+4;
    cx.globalAlpha=.3+.25*Math.sin(frame*.5);
    for(let a=0;a<6.28;a+=.35)R('#bfe3ff',x+Math.round(Math.cos(a)*9),Math.round(y-H0/2+Math.sin(a)*H0*.45),1,1);
    cx.globalAlpha=1;
    R('#e8f6ff',bx,y-H0-13,1,10);R('#8fc4e4',bx+1,y-H0-12,1,9);R('#e8f6ff',bx,y-H0-14,1,1);
    R('#d4a63a',bx-2,y-H0-3,5,1);R('#3a2a22',bx,y-H0-2,2,3)});
  cx.globalAlpha=1}

/* ---------- Ổ khóa, bong bóng "Đã bị khóa" ---------- */
function gbub(x,y,L){
  const c0=Math.round(camX),r0=Math.round(camY);
  if(x<c0-4||x>c0+CW+4||y<r0||y>r0+CH+40)return;
  cx.font='6px monospace';cx.textAlign='center';
  const w=Math.ceil(Math.max(...L.map(s=>cx.measureText(s).width)))+8,h=L.length*8+3,by=Math.round(y-h);
  let bx=Math.round(x-w/2);bx=Math.max(c0+2,Math.min(c0+CW-w-2,bx));
  cx.fillStyle='rgba(255,255,255,.96)';cx.fillRect(bx,by,w,h);cx.fillRect(Math.round(x)-1,by+h,3,2);
  L.forEach((s,i)=>{cx.fillStyle=i===0?'#b3261e':'#111';cx.fillText(s,bx+w/2,by+8+i*8-1)})}
function gateFx(){
  if(!FN)return;
  const x=FN.gcx,y=FN.gcy;
  if(!FN.open){
    R('#aab0ba',x-2,y-5,4,1);R('#aab0ba',x-2,y-4,1,2);R('#aab0ba',x+1,y-4,1,2);
    R('#d4a63a',x-3,y-2,6,5);R('#8a6a1f',x-3,y+2,6,1);R('#222',x,y,1,2);
    if((frame>>4)%4===0)R('#fff',x-2,y-1,1,1);
    if(FN.near){const w=curWeapon(sel);
      gbub(x,y-10,w?['Đã bị khóa','Cần thứ gì đó sắc nhọn để mở','(Chuột phải để chém)']:['Đã bị khóa','Cần thứ gì đó sắc nhọn để mở'])}}
  else if(LKA){
    const t=LKA.t;cx.globalAlpha=Math.max(0,1-t/40);
    R('#d4a63a',x-4-Math.round(t*.2),y-1+Math.round(t*t*.04),3,4);
    R('#d4a63a',x+1+Math.round(t*.2),y-1+Math.round(t*t*.04),3,4);
    cx.globalAlpha=1}}
/* ---------- Vẽ món đồ đang cầm trên tay nhân vật ---------- */
const FACE={};
function drawHeld(){
  allPl().forEach(P=>{
    const n=P.pl,fc=FACE[n]||(FACE[n]={x:P.x,f:1});
    if(P.x>fc.x+.05)fc.f=1;else if(P.x<fc.x-.05)fc.f=-1;
    fc.x=P.x;
    if(!visFl(P.fl||0))return;
    const id=heldId(n);if(!id)return;
    const s=SK[n];if(s&&s.t>0)return;               /* đang đỡ đòn: drawParry tự vẽ kiếm */
    const x=Math.round(P.x),y=Math.round(P.y),hx=x+(fc.f>0?5:-6);
    cx.globalAlpha=1;
    if(id==='mdagger'){
      if(window.holyHeld&&window.holyHeld(P,hx,y,fc.f))return;
      R('#e8f6ff',hx,y-15,1,8);R('#8fc4e4',hx+1,y-14,1,7);R('#e8f6ff',hx,y-16,1,1);
      R('#d4a63a',hx-1,y-7,3,1);R('#3a2a22',hx,y-6,1,2);R('#f1c27d',hx,y-5,1,1)}
    else{
      const it=ITEMS[id]||{};
      cx.font='8px sans-serif';cx.textAlign='center';cx.fillStyle='#fff';
      cx.fillText(it.icon||'❓',hx+(fc.f>0?1:0),y-4)}})}
/* ---------- Móc vào vòng vẽ của game ---------- */

const _glow=glow;glow=function(){_glow();if(inside)return;gateFx();drawHeld();drawParry();drawSwings();drawParts()};
const _drawIn=drawIn;drawIn=function(){_drawIn();drawHeld();drawParry();drawSwings();drawParts()};

/* ---------- Cập nhật mỗi khung hình ---------- */
function fmt(s){const t=Math.ceil(s);return t>=60?Math.floor(t/60)+':'+String(t%60).padStart(2,'0'):t+'s'}
const _step=step;step=function(){_step();tick()};
function tick(){
  if(state!=='island')return;
  const dt=Math.min(.25,DM||.016);
  Object.keys(SK).forEach(k=>{const s=SK[k];
    if(s.t>0){s.t-=dt;if(s.t<=0){s.t=0;if(!s.hit){s.cd=CD_MISS;s.cdMax=CD_MISS;if(+k===sel)cap('Đỡ hụt, kỹ năng hồi trong 5 giây.')}}}
    else if(s.cd>0)s.cd=Math.max(0,s.cd-dt)});
  Object.keys(SWC).forEach(k=>{if(SWC[k]>0)SWC[k]-=dt});
  PT.forEach(q=>{q.x+=q.vx+Math.sin(q.l*.35)*.15;q.y+=q.vy;q.vx*=.97;q.vy-=.012;q.l--});PT=PT.filter(q=>q.l>0);
  RG.forEach(r=>r.t++);RG=RG.filter(r=>r.t<r.d);
  SWG.forEach(s=>s.t++);SWG=SWG.filter(s=>s.t<s.d);
  if(LKA){LKA.t++;if(LKA.t>40)LKA=null}
  /* lại gần cổng bị khóa */
  if(FN&&!FN.open){
    const P=playerOf(sel),near=!!(P&&!P.fl&&!inside&&Math.hypot(FN.gcx-P.x,FN.gcy-P.y)<34);
    if(near&&!FN.flag)cap('Cổng đã bị khóa. Cần thứ gì đó sắc nhọn để mở.');
    FN.flag=near?1:0;FN.near=near}
  hudSkill()}

/* ---------- Icon kỹ năng (hình 1) cạnh bảng thời gian ---------- */
const sty=document.createElement('style');
sty.textContent='#skl{padding:4px;min-width:0}#sklI{display:block;width:40px;height:40px;transition:filter .15s}';
document.head.appendChild(sty);
const skl=document.createElement('div');skl.className='pnl';skl.id='skl';skl.hidden=true;
skl.innerHTML='<svg id="sklI" viewBox="0 0 100 100"><defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">'+
 '<stop offset="0" stop-color="#2fb8e8"/><stop offset=".4" stop-color="#e0306e"/><stop offset=".75" stop-color="#7a3fc8"/><stop offset="1" stop-color="#2f4fd0"/></linearGradient></defs>'+
 '<polygon points="50,1 56,7 50,13 44,7" fill="#2aa7c9"/><polygon points="50,99 56,93 50,87 44,93" fill="#2f4fd0"/>'+
 '<polygon points="1,50 7,44 13,50 7,56" fill="#e0a040"/><polygon points="99,50 93,44 87,50 93,56" fill="#e0306e"/>'+
 '<circle cx="50" cy="50" r="38" fill="url(#mg)"/>'+
 '<g fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round">'+
 '<circle cx="50" cy="50" r="38"/><circle cx="50" cy="50" r="32" stroke-dasharray="3 2"/><circle cx="50" cy="50" r="25"/>'+
 [0,45,90,135,180,225,270,315].map(a=>'<ellipse cx="50" cy="36" rx="6" ry="11" transform="rotate('+a+' 50 50)"/>').join('')+
 '<polygon points="50,20 56,44 80,50 56,56 50,80 44,56 20,50 44,44"/>'+
 '<polygon points="50,37 54,46 63,50 54,54 50,63 46,54 37,50 46,46"/>'+
 '<path d="M12 50H88M50 12V88M23 23L77 77M77 23L23 77"/></g></svg>';
$('topRow').appendChild(skl);
function hudSkill(){
  const w=curWeapon(sel);
  window.curWeapon=curWeapon;
  if(!w){skl.hidden=true;return}
  skl.hidden=false;
  const s=SK[sel]||{t:0,cd:0,cdMax:CD_MISS};let f,tip;
  if(s.t>0){f='brightness(1.25) drop-shadow(0 0 4px #ffd23f)';tip='Đang đỡ đòn!'}
  else if(s.cd>0){const k=1-s.cd/s.cdMax;f='brightness('+(.15+.85*k).toFixed(2)+') saturate('+(.2+.8*k).toFixed(2)+')';tip='Hồi '+fmt(s.cd)}
  else{f='none';tip='Sẵn sàng'}
  const key=w+'|'+f+'|'+tip;
  if(skl.dataset.k===key)return;skl.dataset.k=key;
  $('sklI').style.filter=f;
  skl.title=ITEMS[w].name+' · Chuột phải: chém · R: đỡ đòn · '+tip}

/* ---------- Túi đồ: chọn vũ khí rồi bấm "Dùng" để cầm ---------- */
/* ---------- Túi đồ: nút Cầm / Bỏ cầm ---------- */
const selIdx=()=>[...$('invGrid').children].findIndex(c=>c.classList.contains('sel'));
function selItem(){bcf=-99;const i=selIdx();return i>=0?bagOf(sel)[i]:null}
const holdBtn=document.createElement('button');
holdBtn.className='btn';holdBtn.id='invHold';holdBtn.textContent='Cầm';holdBtn.disabled=true;
$('invUse').after(holdBtn);
function updInv(){
  const id=selItem(),it=id&&ITEMS[id],held=!!it&&EQ[sel]===id,info=$('invInfo');
  holdBtn.disabled=!it;
  holdBtn.textContent=held?'Bỏ cầm':'Cầm';
  info.textContent=info.textContent.replace(' [Đang cầm]','')+(held?' [Đang cầm]':'')}
holdBtn.onclick=()=>{
  const id=selItem(),it=id&&ITEMS[id];if(!it)return;
  if(EQ[sel]===id){delete EQ[sel];cap('P'+sel+' bỏ cầm '+it.name+', cất lại vào túi đồ.')}
  else{EQ[sel]=id;cap('P'+sel+' cầm '+it.name+' trên tay.'+(it.weapon?' Chuột phải: chém · R: đỡ đòn.':''))}
  updInv();setTimeout(updInv,0)};          // chạy lại sau khi item.js sửa invInfo
$('invGrid').addEventListener('click',()=>setTimeout(updInv,0));  // cập nhật khi chọn ô khác

/* ---------- Pháp sư đưa Danh sách thì đưa luôn Dao phép ---------- */
const _gi=window.giveItem;
if(typeof _gi==='function')window.giveItem=function(n,id){
  const ok=_gi(n,id);
  if(ok&&id==='wlist'&&ITEMS.mdagger){
    bcf=-99;
    if(!bagOf(n).includes('mdagger')&&_gi(n,'mdagger'))
      setTimeout(()=>cap('Bà pháp sư còn trao cho P'+n+' một Dao phép. Mở túi (B), chọn Dao phép rồi bấm Dùng để cầm.'),80)}
  return ok};

/* tạo lại thế giới một lần để bản đồ đầu tiên đã có hàng rào */
reset();
})();
/* ===== holy.js: 3 TIM + KIẾM THÁNH (hào quang 6 đôi cánh, tia lửa xanh đỏ) + MÁU QUÁI + PHÍM J =====
   Nạp CUỐI CÙNG (sau Abyss2.js). Cần 3 chỗ sửa nhỏ: window.curWeapon, window.holyHeld (Playerkit.js), window.MONS (Abyss2.js).
   Bản cập nhật:
   - Đỡ đòn bằng R: tia lửa tóe nhiều hơn, cả lửa đỏ + lửa xanh, kèm vòng sóng.
   - Trả kiếm thánh cho Angel Sentinel: hiệu ứng thiên thần bảo hộ kiểu lên cấp.
   - E bắn tia lửa dùng được ở mọi nơi (ngoài trời, trong nhà, hang, Vực sâu), mỗi lần bắn có thiên thần quanh thân. */
(()=>{
if(typeof killPlayer!=='function'||typeof allPl!=='function'||typeof window.curWeapon!=='function'){
  console.warn('holy.js: thiếu window.curWeapon');return}
const MONS=()=>typeof window.MONS==='function'?window.MONS():[];

/* ---------- Thông số ---------- */
const AURA_KEY='r';                 /* phím hào quang (đổi thành 'q' nếu muốn, nhưng Q đang là chạy nhanh) */
const MAXHP=3,IV_T=1.5;             /* số tim, thời gian bất tử sau khi trúng đòn (giây) */
const AURA_T=1.5,CD_HIT=120,CD_MISS=5;
const CD2=1,BEAM_DMG=35,BEAM_CRIT=.2,BEAM_CDMG=56;
const MELEE=[10,26],MELEE_R=52,MELEE_ARC=1.45,MELEE_CD=.35;   /* tầm chém 28 -> 52 */
const MHP={human:100,snake:80,spider:80,boss:400};
const WID2=22;
const inArena=f=>f===WID2||f===23;
const PKEY='deadisland:holypower',INVKEY='deadisland:inv1';
/* vị trí tảng đá kiếm + cổng ánh sáng ở tầng 2 (khớp Abyss2.js) */
const SWX=1016,SWY=1016,PTX=1180,PTY=220;

let PWR={},HP={},IV={},AU={},S2={},SC={},BM=[],PT3=[],FT=[],MS={x:0,y:0,has:0},slOn=true,lastChk=-99,bc=null,bcf=-99,AN={},RN=[];
try{PWR=JSON.parse(localStorage.getItem(PKEY))||{}}catch(_){PWR={}}
const savePw=()=>{try{localStorage.setItem(PKEY,JSON.stringify(PWR))}catch(_){}};
const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),w,h)};
const visFl=f=>inside?f===curF:!f;
const playerOf=n=>allPl().find(p=>p.pl===n);
const fmt=s=>{const t=Math.ceil(s);return t>=60?Math.floor(t/60)+':'+String(t%60).padStart(2,'0'):t+'s'};
const powered=n=>!!PWR[n];
const hasW=n=>!!window.curWeapon(n);

function bagOf(n){
  if(frame-bcf>=10||!bc){bcf=frame;try{bc=JSON.parse(localStorage.getItem(INVKEY))||{}}catch(_){bc={}}}
  return Array.isArray(bc[n])?bc[n]:[]}

/* ---------- Hạt + chữ nổi ---------- */
function burst(x,y,fl,n,cols,big){
  for(let i=0;i<n;i++){const l=24+rnd(26);
    PT3.push({x:x+rnd(7)-3,y:y+rnd(5)-2,vx:(Math.random()-.5)*(big?3:1.6),vy:-(.2+Math.random()*(big?2.4:1.4)),l,m:l,c:cols[rnd(cols.length)],fl,s:1+rnd(2)})}}
const FIRE=['#ff3b2a','#ff8a3d','#2fb8f0','#9ae8ff','#ffffff'],GOLD=['#ffd23f','#fff3a0','#ffffff','#ffb02e'];
const REDF=['#ff3b2a','#ff8a3d','#8a0f18','#ffd0a0'],BLUF=['#2fb8f0','#9ae8ff','#3b6fff','#ffffff'];

/* tia lửa đỡ đòn: nhiều hơn, cả lửa đỏ lẫn lửa xanh, kèm 2 vòng sóng */
function parrySparks(P){
  const fl=P.fl|0,x=P.x,y=P.y-10;
  burst(x,y,fl,70,FIRE,1);
  burst(x-10,y,fl,40,REDF,1);
  burst(x+10,y,fl,40,BLUF,1);
  burst(x,y-8,fl,30,['#ff3b2a','#2fb8f0','#ffffff'],1);
  RN.push({x,y,fl,t:0,d:20,c:'#ff5a3a'},{x,y,fl,t:4,d:24,c:'#6fd0ff'});
  shake=Math.max(shake,6)}
/* hiệu ứng thiên thần bảo hộ quanh người (lvl=1: kiểu lên cấp) */
function angelFx(P,d,lvl){AN[P.pl]={t:0,d,lvl:lvl?1:0}}

/* ---------- Nhận sức mạnh kiếm thánh ---------- */
function checkPower(){
  allPl().forEach(P=>{
    const n=P.pl;if(PWR[n])return;
    const q=window.sentQuest?window.sentQuest.get(n):0;
    if(bagOf(n).includes('holysword')||q>=2){
      PWR[n]=1;savePw();
      burst(P.x,P.y-10,P.fl|0,60,GOLD,1);flash=14;
      angelFx(P,3.2,1);
      RN.push({x:P.x,y:P.y-10,fl:P.fl|0,t:0,d:26,c:'#ffd23f'},{x:P.x,y:P.y-10,fl:P.fl|0,t:6,d:30,c:'#7cfff0'});
      cap('P'+n+' nhận được SỨC MẠNH CỦA KIẾM THÁNH! Thiên thần bảo hộ giáng xuống. R: hào quang 6 đôi cánh · E: bắn tia lửa xanh đỏ (dùng được ở mọi nơi).')}})}

/* ---------- 3 tim ---------- */
const _kp=killPlayer;
killPlayer=function(n){
  const P=playerOf(n);if(!P)return _kp(n);
  const a=AU[n];
  if(a&&a.t>0){                                  /* hào quang đỡ mọi đòn */
    a.hit=1;burst(P.x,P.y-10,P.fl|0,22,GOLD,1);shake=Math.max(shake,4);
    cap('Hào quang cánh thiên thần đã đỡ đòn!');return}
  if(IV[n]>0)return;
  HP[n]=(HP[n]===undefined?MAXHP:HP[n])-1;
  if(HP[n]<=0){HP[n]=0;return _kp(n)}
  IV[n]=IV_T;flash=14;shake=Math.max(shake,8);
  burst(P.x,P.y-10,P.fl|0,26,['#ff3b2a','#8a0f18','#ffffff'],1);
  cap('P'+n+' bị trúng đòn! Còn '+HP[n]+'/'+MAXHP+' tim.')};

/* đỡ đòn: hào quang (R) hoặc kỹ năng đỡ cũ đều tóe lửa xanh đỏ */
const _ph=window.parryHit;
window.parryHit=function(V,att){
  const a=AU[V.pl];
  if(powered(V.pl)&&a&&a.t>0){a.hit=1;parrySparks(V);angelFx(V,.7,0);cap('Hào quang đỡ được đòn! Lửa xanh đỏ bùng lên, kẻ tấn công bị choáng.');return true}
  const ok=_ph?_ph(V,att):false;
  if(ok&&powered(V.pl))parrySparks(V);
  return ok};

/* ---------- Gây sát thương quái ---------- */
function hurt(m,d,crit,n){
  const mx=MHP[m.k]||80;if(m.hp===undefined)m.hp=mx;m.mhp=mx;
  m.hp-=d;
  FT.push({x:m.x,y:m.y-(m.z||0)-(m.sky&&m.k==='boss'?70:m.k==='human'?32:m.k==='spider'?22:16),t:0,txt:d+(crit?'!':''),c:crit?'#ffd23f':'#ffffff'});
  burst(m.x,m.y-(m.z||0)-10,m.sky?23:WID2,crit?14:8,FIRE,crit);
  if(m.st==='idle'){m.st='chase';m.lost=0;m.path=[];m.wt=null;m.rage=Math.max(m.rage||0,3)}
  if(m.hp<=0){
    const A=window.MONS(),i=A.indexOf(m);if(i>=0)A.splice(i,1);
    if(window.onMonKilled)window.onMonKilled(m);
    burst(m.x,m.y-10,m.sky?23:WID2,36,['#c9a8ff','#7cfff0','#ffffff'],1);
    cap('P'+n+' đã hạ gục một con quái!')}}
  window.holyHurt=hurt;

/* ---------- Chém thường (chuột phải) ---------- */
addEventListener('pointerdown',e=>{
  if(e.button!==2||e.target!==cv)return;
  if(state!=='island'||trans||TK)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const n=sel,P=playerOf(n);if(!P||!hasW(n)||(SC[n]||0)>0)return;
  if(!inArena(P.fl|0))return;                         /* chỉ chém quái ở tầng 2 / đảo bay */
  SC[n]=MELEE_CD;
  const r=cv.getBoundingClientRect(),k=inside?IS:1,
    wx=(e.clientX-r.left)/r.width*CW/k+camX,wy=(e.clientY-r.top)/r.height*CH/k+camY,
    ang=Math.atan2(wy-(P.y-7),wx-P.x);
  window.MONS().slice().forEach(m=>{
    const boss=m.k==='boss',
      cy=m.sky?m.y-(m.z||0)-(boss?30:8):m.y,
      dx=m.x-P.x,dy=cy-P.y,d=Math.hypot(dx,dy),
      reach=MELEE_R+(m.sky&&boss?55:boss?18:0);       /* boss to nên cộng thêm tầm */
    if(d>reach)return;
    const a=Math.atan2(dy,dx),da=Math.abs(Math.atan2(Math.sin(a-ang),Math.cos(a-ang)));
    if(da<MELEE_ARC||d<22)hurt(m,ri(MELEE[0],MELEE[1]),false,n)})},true);

cv.addEventListener('pointermove',e=>{MS.x=e.clientX;MS.y=e.clientY;MS.has=1});
function mouseW(){const r=cv.getBoundingClientRect(),k=inside?IS:1;return{x:(MS.x-r.left)/r.width*CW/k+camX,y:(MS.y-r.top)/r.height*CH/k+camY}}

/* ---------- Phím: R = hào quang, E = tia lửa, J = bảng thông tin ---------- */
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
  if(state!=='island'||TK||trans)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const k=e.key.toLowerCase(),n=sel,P=playerOf(n);if(!P)return;
  if(k===AURA_KEY&&powered(n)){
    e.stopImmediatePropagation();                       /* thay kỹ năng đỡ cũ */
    if(!hasW(n)){cap('Cần cầm kiếm để dùng hào quang.');return}
    const a=AU[n]||(AU[n]={t:0,cd:0,cdMax:CD_MISS,hit:0});
    if(a.t>0)return;
    if(a.cd>0){cap('Hào quang đang hồi: '+fmt(a.cd)+'.');return}
    a.t=AURA_T;a.hit=0;burst(P.x,P.y-10,P.fl|0,24,GOLD,1);if(window.angelCast)window.angelCast(P,'shield');if(window.angelCast)window.angelCast(P,'shield');
    cap('Hào quang 6 đôi cánh bao quanh bạn, đỡ mọi đòn!');return}
  if(k==='e'&&powered(n)&&hasW(n)){
    const tk=$('tk');if(tk&&!tk.hidden)return;
    if(P.fl===WID2&&(Math.hypot(P.x-SWX,P.y-(SWY+6))<30||Math.hypot(P.x-PTX,P.y-PTY)<20))return;   /* đang tương tác kiếm / cổng */
    fire(P)}},true);
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat)return;
  if(e.key.toLowerCase()==='j'&&state==='island')togSl()});

function fire(P){
  const n=P.pl,s=S2[n]||(S2[n]={cd:0});
  if(s.cd>0){cap('Tia lửa đang hồi: '+fmt(s.cd)+'.');return}
  let ang=0;if(MS.has){const w=mouseW();ang=Math.atan2(w.y-(P.y-8),w.x-P.x)}
  const c=Math.cos(ang),sn=Math.sin(ang);
  const go=()=>{const Q=playerOf(n)||P;BM.push({n,x:Q.x+c*6,y:Q.y-8+sn*6,vx:c*1.9,vy:sn*1.9,l:56,fl:Q.fl|0,tr:[]});burst(Q.x+c*8,Q.y-8+sn*8,Q.fl|0,8,FIRE,0)};
if(window.angelCast){window.angelCast(P,'sword',ang);setTimeout(go,560)}else go();
  s.cd=CD2;if(!window.angelCast)angelFx(P,.6,0)}

/* tia lửa có va chạm theo từng khu vực: ngoài trời, nhà, hang, Vực sâu */
function blocked(b){
  const tx=Math.floor(b.x/T),ty=Math.floor(b.y/T);
  if(!b.fl){const t=(m[ty]||[])[tx];return t===undefined||t===TREE||t===ROCK||t===MTN||t===DTREE||t===CAS||t===HSE||t===40}
  const r=((FL[b.fl]||{}).im||[])[ty],v=r&&r[tx];
  return b.fl===WID2?v!==0:(v===undefined||v===1||v===62)}

function tickBeams(){
  BM.forEach(b=>{
    for(let i=0;i<2&&!b.dead;i++){
      b.x+=b.vx;b.y+=b.vy;
      b.tr.push({x:b.x,y:b.y});if(b.tr.length>12)b.tr.shift();
      if(blocked(b)){b.dead=1;burst(b.x,b.y,b.fl,10,FIRE,0);break}
      if(inArena(b.fl)){
        for(const mo of window.MONS()){
          const hy=mo.sky?mo.y-(mo.z||0)-(mo.k==='boss'?30:8):mo.y-(mo.k==='boss'?20:8),
                hr=mo.sky&&mo.k==='boss'?64:mo.k==='boss'?24:mo.sky?12:11;
          if(Math.hypot(b.x-mo.x,b.y-hy)<hr){
            const crit=Math.random()<BEAM_CRIT;
            hurt(mo,crit?BEAM_CDMG:BEAM_DMG,crit,b.n);b.dead=1;break}}}}
    if(--b.l<=0)b.dead=1});
  BM=BM.filter(b=>!b.dead)}

/* ---------- Cập nhật mỗi khung hình ---------- */
function tick(){
  if(state!=='island')return;
  const dt=Math.min(.25,DM||.016);
  if(frame-lastChk>=10){lastChk=frame;checkPower()}
  Object.keys(IV).forEach(k=>{if(IV[k]>0)IV[k]-=dt});
  Object.keys(SC).forEach(k=>{if(SC[k]>0)SC[k]-=dt});
  Object.keys(S2).forEach(k=>{if(S2[k].cd>0)S2[k].cd=Math.max(0,S2[k].cd-dt)});
  Object.keys(AU).forEach(k=>{const a=AU[k];
    if(a.t>0){a.t-=dt;if(a.t<=0){a.t=0;a.cd=a.hit?CD_HIT:CD_MISS;a.cdMax=a.cd;if(+k===sel)cap(a.hit?'Đỡ đòn thành công! Hào quang hồi 2 phút.':'Hào quang tan, đỡ hụt, hồi 5 giây.')}}
    else if(a.cd>0)a.cd=Math.max(0,a.cd-dt)});
  Object.keys(AN).forEach(k=>{const a=AN[k];a.t+=dt;
    if(a.lvl&&frame%2===0){const P=playerOf(+k);if(P)burst(P.x+rnd(15)-7,P.y-2,P.fl|0,2,GOLD,0)}
    if(a.t>=a.d)delete AN[k]});
  RN.forEach(r=>r.t++);RN=RN.filter(r=>r.t<r.d);
  tickBeams();
  PT3.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vx*=.97;q.vy-=.01;q.l--});PT3=PT3.filter(q=>q.l>0);
  FT.forEach(f=>f.t++);FT=FT.filter(f=>f.t<45);
  hud()}
const _st=step;step=function(){_st();tick()};
const _mk=mkPeople;mkPeople=function(){_mk();PWR={};savePw();HP={};IV={};AU={};S2={};SC={};BM=[];PT3=[];FT=[];AN={};RN=[]};
const _rs=restore;restore=function(s){_rs(s);HP={};IV={};AU={};S2={};BM=[];PT3=[];FT=[];AN={};RN=[]};

/* ---------- Vẽ: kiếm thánh cầm tay ---------- */
window.holyHeld=function(P,hx,y){
  if(!powered(P.pl))return false;
  const t=frame;
  cx.globalAlpha=.22+.1*Math.sin(t*.12);R('#ffa030',hx-6,y-33,13,27);cx.globalAlpha=1;
  /* cánh nhỏ trên chắn kiếm */
  [-1,1].forEach(s=>{const o=s<0?-6:3;
    R('#ffffff',hx+o,y-18,3,4);R('#e6eefb',hx+o+(s<0?-1:1),y-21,2,4);R('#ffffff',hx+o+(s<0?-2:2),y-23,1,4);R('#c8d6ec',hx+o,y-14,3,1)});
  /* lưỡi rực lửa */
  R('#ff7a1a',hx-1,y-27,3,14);R('#ffd23f',hx,y-28,1,14);R('#ffb02e',hx,y-30,1,2);
  const h=((t>>2)%6);R('#fff3a0',hx,y-26+h*2,1,2);
  /* chắn kiếm đồng + ngọc xanh */
  R('#8a6a3a',hx-4,y-13,9,2);R('#b8864f',hx-4,y-13,9,1);R('#2f9bd6',hx,y-13,1,2);R('#bfefff',hx,y-13,1,1);
  /* cán + chuôi */
  R('#4a3a2a',hx,y-11,1,4);R('#7a6a50',hx,y-10,1,1);R('#2f9bd6',hx,y-7,1,1);R('#f1c27d',hx,y-6,1,1);
  if(t%3===0)R('#ffd23f',hx+rnd(5)-2,y-30-rnd(6),1,1);
  return true};

/* ---------- Vẽ: 6 đôi cánh thiên thần (dùng chung cho hào quang, lên cấp, bắn tia lửa) ---------- */
function drawAngel(P,al){
  const x=P.x,y=P.y-9,t=frame;
  cx.globalAlpha=(.16+.06*Math.sin(t*.2))*al;R('#ffe9a8',x-28,y-24,56,48);R('#ffffff',x-14,y-30,28,60);cx.globalAlpha=al;
  for(let k=0;k<6;k++)for(const s of[-1,1]){
    const ang=-1.5708+s*(.32+k*.52)+Math.sin(t*.05+k)*.05,L=17+(k%2?4:0);
    for(let f=-2;f<=2;f++){
      const aa=ang+f*.11,Lf=L-Math.abs(f)*1.8;
      for(let r=7;r<=Lf;r+=1.7){
        const px=x+Math.cos(aa)*r,py=y+Math.sin(aa)*r*.85;
        R(r>Lf-2.4?'#ffe9a8':(f&1?'#ffffff':'#e6eefb'),px-1,py-1,2,2)}}}
  for(let q=0;q<6.28;q+=.4)R('#ffd23f',x+Math.cos(q+t*.04)*7,y+Math.sin(q+t*.04)*4-14,2,1);
  for(let i=0;i<5;i++)R('#7cfff0',x+Math.cos(t*.07+i*1.26)*22,y+Math.sin(t*.07+i*1.26)*18,1,1);
  cx.globalAlpha=1}
function drawAura(P,a){
  const life=a.t/AURA_T;drawAngel(P,life<.2?Math.max(.25,life/.2):1)}
/* hiệu ứng lên cấp / bắn tia lửa */
function drawAngelFx(P,a){
  const k=a.t/a.d,al=k<.2?k/.2:k>.75?Math.max(0,(1-k)/.25):1,x=P.x,y=P.y;
  if(a.lvl){
    cx.globalAlpha=.22*al;R('#fff3a0',x-10,y-74,20,74);
    cx.globalAlpha=.4*al;R('#ffffff',x-4,y-84,8,84);
    for(let r=0;r<3;r++){
      const q=(a.t*1.1+r/3)%1,yy=y-q*62,rad=17-q*6;cx.globalAlpha=(1-q)*al;
      for(let g=0;g<6.28;g+=.3)R(r%2?'#7cfff0':'#ffd23f',x+Math.cos(g+q*6)*rad,yy+Math.sin(g+q*6)*rad*.35,2,1)}}
  drawAngel(P,a.lvl?al:al*.85)}

function drawAll(){
  allPl().forEach(P=>{
    if(!visFl(P.fl|0))return;
    const a=AU[P.pl];if(a&&a.t>0)drawAura(P,a);
    const f=AN[P.pl];if(f){if(window.drawGuardianPlus)window.drawGuardianPlus(P,f);else drawAngelFx(P,f)}
    if(IV[P.pl]>0&&((frame>>2)&1)){cx.globalAlpha=.35;R('#ff3b3b',P.x-6,P.y-20,12,20);cx.globalAlpha=1}});
  /* thanh máu quái */
  if(inside&&curF===WID2)window.MONS().forEach(m=>{
    if(m.hp===undefined||m.hp>=m.mhp)return;
    const H0=m.k==='boss'?52:m.k==='human'?26:m.k==='snake'?14:18,w=m.k==='boss'?30:18,fw=Math.max(0,Math.round(w*m.hp/m.mhp));
    R('#000',m.x-w/2-1,m.y-H0-13,w+2,4);R('#5a0f16',m.x-w/2,m.y-H0-12,w,2);R(m.hp/m.mhp>.4?'#3ddc97':'#ff3b2a',m.x-w/2,m.y-H0-12,fw,2)});
  /* tia lửa xanh đỏ */
  BM.forEach(b=>{
    if(!visFl(b.fl))return;
    if(window.drawBeamPlus){window.drawBeamPlus(b);return}
    b.tr.forEach((p,i)=>{cx.globalAlpha=(i+1)/b.tr.length*.85;
      R(((i+(frame>>1))&1)?'#ff3b2a':'#2fb8f0',p.x-1,p.y-1,i>8?3:2,i>8?3:2);
      R(((i+(frame>>1))&1)?'#ffb02e':'#9ae8ff',p.x+Math.sin(frame*.5+i)*2,p.y+Math.cos(frame*.5+i)*2,1,1)});
    cx.globalAlpha=1;
    R('#ffffff',b.x-1,b.y-1,3,3);
    R('#ff3b2a',b.x+Math.cos(frame*.6)*3-1,b.y+Math.sin(frame*.6)*3-1,2,2);
    R('#2fb8f0',b.x-Math.cos(frame*.6)*3-1,b.y-Math.sin(frame*.6)*3-1,2,2)});
  /* vòng sóng (đỡ đòn / lên cấp) */
  RN.forEach(r=>{
    if(!visFl(r.fl))return;
    const rad=4+r.t*1.8;cx.globalAlpha=Math.max(0,1-r.t/r.d);
    for(let g=0;g<6.28;g+=.25)R(r.c,r.x+Math.cos(g)*rad,r.y+Math.sin(g)*rad*.8,2,2)});
  cx.globalAlpha=1;
  PT3.forEach(q=>{if(!visFl(q.fl))return;cx.globalAlpha=Math.min(1,q.l/10);R(q.c,q.x,q.y,q.s,q.s)});
  cx.globalAlpha=1;
  /* chữ sát thương */
  cx.save();cx.textAlign='center';cx.font='bold 7px monospace';cx.lineWidth=2;cx.strokeStyle='#000';
  FT.forEach(f=>{const y=f.y-f.t*.5;cx.strokeText(f.txt,f.x,y);cx.fillStyle=f.c;cx.fillText(f.txt,f.x,y)});
  cx.restore()}
const _glow=glow;glow=function(){_glow();if(!inside)drawAll()};
const _drawIn=drawIn;drawIn=function(){_drawIn();drawAll()};

/* ================= GIAO DIỆN ================= */
const sty=document.createElement('style');
sty.textContent='#hp{font-size:16px;letter-spacing:2px;line-height:1.2}#hp.hit{background:rgba(120,10,20,.7)}'+
 '#hs1,#hs2{padding:4px;min-width:0;position:relative}#hs1 svg,#hs2 svg{display:block;width:40px;height:40px;transition:filter .15s}'+
 '#hs1 .cd,#hs2 .cd{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 13px monospace;color:#fff;text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000;pointer-events:none}';
document.head.appendChild(sty);

/* bảng tim */
const hp=document.createElement('div');hp.className='pnl';hp.id='hp';
$('hud').insertBefore(hp,$('sl'));

/* icon skill 1 (copy icon đỡ đòn cũ) + skill 2 (kiếm thánh) */
const skl=$('skl'),topRow=$('topRow');
const h1=skl?skl.cloneNode(true):document.createElement('div');
h1.id='hs1';h1.className='pnl';h1.hidden=true;
const sv=h1.querySelector('svg');if(sv)sv.removeAttribute('id');
h1.insertAdjacentHTML('beforeend','<span class="cd"></span>');
const h2=document.createElement('div');h2.className='pnl';h2.id='hs2';h2.hidden=true;
h2.innerHTML='<svg viewBox="0 0 100 100"><defs><linearGradient id="hsb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a0"/><stop offset=".5" stop-color="#ffb02e"/><stop offset="1" stop-color="#e0541a"/></linearGradient></defs>'+
 '<rect width="100" height="100" rx="12" fill="#141a30"/><circle cx="50" cy="55" r="34" fill="#ffa030" opacity=".18"/>'+
 '<g id="hw"><path d="M45 44 C30 40 10 36 4 12 C16 17 26 19 32 26 C26 16 24 8 26 2 C36 10 44 24 46 38 Z" fill="#f4f8ff" stroke="#c9d6ee" stroke-width="1.5"/>'+
 '<path d="M44 52 C32 52 18 50 12 40 C22 42 30 44 36 46 Z" fill="#e6eefb" stroke="#c9d6ee" stroke-width="1.2"/></g>'+
 '<use href="#hw" transform="translate(100,0) scale(-1,1)"/>'+
 '<polygon points="44,46 56,46 56,84 50,97 44,84" fill="url(#hsb)" stroke="#ff7a1a" stroke-width="1.5"/>'+
 '<rect x="47" y="48" width="3" height="40" fill="#fff6c0" opacity=".7"/>'+
 '<rect x="30" y="40" width="40" height="7" rx="2" fill="#8a6a3a" stroke="#4a3a2a"/><circle cx="50" cy="43" r="4.5" fill="#2f9bd6" stroke="#bfefff"/>'+
 '<rect x="47" y="24" width="6" height="16" fill="#5a4a3a"/><circle cx="50" cy="20" r="4.5" fill="#2f9bd6" stroke="#bfefff"/></svg><span class="cd"></span>';
if(skl)skl.after(h1);else topRow.appendChild(h1);
h1.after(h2);

function hud(){
  const n=sel,h=HP[n]===undefined?MAXHP:HP[n];
  hp.innerHTML='❤️'.repeat(h)+'🖤'.repeat(Math.max(0,MAXHP-h));
  hp.classList.toggle('hit',IV[n]>0);
  const pw=powered(n),ok=pw&&hasW(n);
  if(skl&&pw)skl.hidden=true;                       /* icon đỡ đòn cũ nhường chỗ cho bản nâng cấp */
  h1.hidden=!ok;h2.hidden=!ok;
  if(!ok)return;
  const a=AU[n]||{t:0,cd:0,cdMax:CD_MISS},s=S2[n]||{cd:0};
  let f,tx='';
  if(a.t>0){f='brightness(1.25) drop-shadow(0 0 4px #ffd23f)';tx='✦'}
  else if(a.cd>0){const k=1-a.cd/a.cdMax;f='brightness('+(.15+.85*k).toFixed(2)+') saturate('+(.2+.8*k).toFixed(2)+')';tx=fmt(a.cd)}
  else f='none';
  h1.querySelector('svg').style.filter=f;h1.querySelector('.cd').textContent=tx;
  h1.title='Hào quang 6 đôi cánh ['+AURA_KEY.toUpperCase()+']: đỡ mọi đòn';
  const k2=1-s.cd/CD2;
  h2.querySelector('svg').style.filter=s.cd>0?'brightness('+(.15+.85*k2).toFixed(2)+') saturate('+(.2+.8*k2).toFixed(2)+')':'none';
  h2.querySelector('.cd').textContent=s.cd>0?fmt(s.cd):'';
  h2.title='Tia lửa xanh đỏ [E]: 35 sát thương (20% crit 56), hồi 3s'}

/* phím J: bật / tắt bảng thông tin số lượng */
function togSl(){slOn=!slOn;$('sl').hidden=!slOn}
const jb=document.createElement('button');jb.className='btn alt';jb.id='jBtn';jb.textContent='J';
jb.title='Bật / tắt bảng thông tin';jb.onclick=togSl;$('tools').insertBefore(jb,$('hudBtn'));
const _sh=showHud;showHud=function(){_sh();
  $('sl').hidden=!slOn;
  const g=$('gd');if(g)g.innerHTML+='<br>J: Ẩn / hiện bảng thông tin<br>Kiếm thánh: '+AURA_KEY.toUpperCase()+' hào quang · E tia lửa (mọi nơi) · Chuột phải chém'};
})();

/* ===== equip.js: Ô TRANG BỊ + DREAMCATCHER + QUẢ CẦU PHÉP + KỸ NĂNG C (TIA NĂNG LƯỢNG) =====
   Nạp CUỐI CÙNG trong deadisland.html (sau Abyss2.js):  <script src="../js/equip.js"></script>
   Kèm PATCHES.md (vài sửa nhỏ trong Playerkit.js). Item mới chỉ cần thuộc tính slot: 'neck'|'ring'|'wrist'|'ear'. */
(()=>{
if(typeof window.giveItem!=='function'||!window.ITEMS||!$('inv')||typeof glow!=='function'||typeof drawIn!=='function'){
  console.warn('equip.js: hãy nạp CUỐI CÙNG');return}
const ITEMS=window.ITEMS,INVKEY='deadisland:inv1',EKEY='deadisland:equip',GKEY='deadisland:dcgiven';
const WID2=22,CCD=.5,BLEN=300,DMAX=150,DMIN=50,FIRE_AT=.9,CAST_D=2.0;
const SLOTS=[['neck','Dây chuyền','📿'],['ring','Nhẫn','💍'],['wrist','Vòng tay','⭕'],['ear','Hoa tai','🧿']];
ITEMS.dreamcatcher={icon:'📿',name:'Vòng cổ Dreamcatcher',slot:'neck',
  d:'Vòng cổ bắt giấc mơ. Trang bị vào ô dây chuyền: quả cầu phép bay quanh bạn và mở khóa kỹ năng C.'};
let EQ={},GV={},CC={},BMS=[],CST=[],MSX=0,MSY=0,MHAS=0,sealMsg=false;
try{EQ=JSON.parse(localStorage.getItem(EKEY))||{}}catch(_){}
try{GV=JSON.parse(localStorage.getItem(GKEY))||{}}catch(_){}
const save=()=>{try{localStorage.setItem(EKEY,JSON.stringify(EQ));localStorage.setItem(GKEY,JSON.stringify(GV))}catch(_){}};
const eq=n=>EQ[n]||(EQ[n]={});
const bagOf=n=>{try{const I=JSON.parse(localStorage.getItem(INVKEY))||{};return Array.isArray(I[n])?I[n]:[]}catch(_){return[]}};
const visFl=f=>inside?f===curF:!f;
const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),w,h)};
const fmt=s=>Math.ceil(s)+'s';
const hasNeck=n=>eq(n).neck==='dreamcatcher';

/* Dao phép giữ nguyên hình dao, không hóa kiếm thánh */
window.holyHeld=()=>false;

/* ---------- Hình pixel: Dreamcatcher ---------- */
const DCI=(()=>{
  const c=document.createElement('canvas');c.width=20;c.height=34;const g=c.getContext('2d');
  const P=(col,x,y,w=1,h=1)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
  const ring=(a,b,r,col,th)=>{for(let y=0;y<34;y++)for(let x=0;x<20;x++){const d=Math.hypot(x+.5-a,y+.5-b);if(d<=r&&d>r-th)P(col,x,y)}};
  const disc=(a,b,r,col)=>{for(let y=0;y<34;y++)for(let x=0;x<20;x++)if(Math.hypot(x+.5-a,y+.5-b)<=r)P(col,x,y)};
  P('#f0c0e8',9,0,2,3);
  ring(10,10,7.5,'#b06cc8',1.6);ring(10,10,4.5,'#f060b0',1.3);
  P('#f5c0f0',10,4,1,13);P('#f5c0f0',4,10,13,1);P('#f060b0',9,9,2,2);
  [[4,20],[16,20],[10,23]].forEach(([x,y])=>{disc(x,y,3.4,'#f5c0f0');ring(x,y,3.4,'#f060b0',1.3);P('#f060b0',x,y,1,1)});
  P('#f0c0e8',10,17,1,3);P('#f0c0e8',4,17,1,2);P('#f0c0e8',16,17,1,2);
  [['#78c8f0',1,22,2,5],['#8a6ae0',4,24,2,5],['#f5c0f0',3,29,2,4],['#78c8f0',7,26,2,4],['#8a6ae0',8,28,2,4],
   ['#f060b0',6,30,2,3],['#78c8f0',11,27,2,4],['#8a6ae0',12,29,2,5],['#f5c0f0',14,24,2,5],['#8a6ae0',17,22,2,5],['#78c8f0',15,28,2,4],['#8a6ae0',9,31,2,3]]
   .forEach(([c2,x,y,w,h])=>P(c2,x,y,w,h));
  return c})();

/* ---------- Hình pixel: quả cầu phép ---------- */
const ORB=(()=>{
  const c=document.createElement('canvas');c.width=15;c.height=15;const g=c.getContext('2d');
  for(let y=0;y<15;y++)for(let x=0;x<15;x++){
    const dx=x+.5-7.5,dy=y+.5-7.5,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx),h=hs(x*3+1,y*7+2)%100;
    const outer=6.6+(Math.sin(a*8)>.5?.9:0)-(h<25?.7:0);
    if(r>outer)continue;
    let col;
    if(r<1.1)col='#ffffff';
    else if(r<2.2)col=h<50?'#fff0e8':'#f8d8d0';
    else if(r<3.8)col=Math.sin(a*10)>.7?'#e08a8a':['#c0586a','#a04060','#8a3050'][h%3];
    else if(r<5.1)col=h%5===0?'#e0805a':(h&1?'#4a5f7e':'#42587a');
    else if(r<5.7)col='#62d0b4';
    else if(r<6.6)col='#f8e4ac';
    else col='#f4b6bc';
    g.fillStyle=col;g.fillRect(x,y,1,1)}
  return c})();

/* ---------- 6 đôi cánh bọc quanh quả cầu (sc: tỉ lệ, open: 0..1 độ xòe) ---------- */
function wings(x,y,t,al,sc,open){
  const px=Math.max(1,Math.round(2*sc));
  for(let k=0;k<6;k++)for(const s of[-1,1]){
    const ang=-1.5708+s*(.35+k*.5)+Math.sin(t*.08+k)*.04,L=(9+(k%2?3:0))*sc*open;
    if(L<2)continue;
    for(let f=-1;f<=1;f++){
      const aa=ang+f*.12,Lf=L-Math.abs(f)*1.5*sc;
      for(let r=3*sc;r<=Lf;r+=1.4*sc){
        cx.globalAlpha=al;
        R(r>Lf-2*sc?'#ffffff':(f?'#c3ccda':'#e6ebf3'),x+Math.cos(aa)*r-px/2,y+Math.sin(aa)*r*.9-px/2,px,px)}}}
  cx.globalAlpha=1}
function magicOrb(x,y,sc,al,open){
  cx.save();cx.imageSmoothingEnabled=false;
  cx.globalAlpha=(.16+.06*Math.sin(frame*.12))*al;R('#ffd0c0',x-12*sc,y-12*sc,24*sc,24*sc);
  cx.globalAlpha=1;wings(x,y,frame,al,sc,open);
  cx.globalAlpha=al;const s=15*sc;
  cx.drawImage(ORB,Math.round(x-s/2),Math.round(y-s/2),Math.round(s),Math.round(s));
  cx.restore()}
window.magicOrb=magicOrb;

/* quả cầu nhỏ bay quanh người khi đeo vòng */
function drawOrbs(){
  if(state!=='island')return;
  const t=frame;
  allPl().forEach(P=>{
    if(!hasNeck(P.pl)||!visFl(P.fl|0))return;
    const off=window.islOffset?window.islOffset(P):0,a=t*.035+P.pl*1.7;
    magicOrb(P.x+Math.cos(a)*14,P.y-off-14+Math.sin(a)*4+Math.sin(t*.1),.6,1,1)})}

/* ---------- Hiệu ứng: Angel Sentinel triệu hồi quả cầu từ tay, bắn tia C ---------- */
function startOrb(P,ang){
  CST=CST.filter(c=>c.n!==P.pl);
  CST.push({n:P.pl,ang,t:0,d:CAST_D,fired:0})}
const _ac=window.angelCast;
window.angelCast=function(P,kind,ang){
  if(kind==='orb')return startOrb(P,ang||0);
  if(_ac)return _ac(P,kind,ang)};
function drawCast(c,P){
  const p=c.t/c.d,off=window.islOffset?window.islOffset(P):0,gx=P.x,gy=P.y-off;
  let rise,sc;
  if(c.t<.3){const u=1-Math.pow(1-c.t/.3,3);rise=60*u;sc=.28+.4*u}
  else if(c.t<1.7){rise=60+Math.sin(c.t*8)*1.5;sc=.68}
  else{const u=(c.t-1.7)/(c.d-1.7);rise=60+150*u*u;sc=.68*(1-.88*u)}
  const ax=gx,ay=gy-6-rise;
  cx.save();cx.globalCompositeOperation='lighter';
  const top=ay-60*sc,g=cx.createLinearGradient(0,top,0,gy);
  g.addColorStop(0,'rgba(255,240,170,0)');g.addColorStop(.5,'rgba(255,240,170,.3)');g.addColorStop(1,'rgba(255,255,255,.45)');
  cx.fillStyle=g;cx.fillRect(Math.round(gx-7),Math.round(top),14,Math.max(1,Math.round(gy-top)));
  cx.restore();cx.globalAlpha=1;
  cx.save();cx.translate(ax,ay);cx.scale(sc,sc);cx.translate(-ax,-ay);
  if(window.drawAngelPlus)window.drawAngelPlus({x:ax,y:ay},true,null);
  cx.restore();cx.globalAlpha=1;
  /* quả cầu bay lên từ bàn tay Angel, xòe cánh, biến mất khi tia kết thúc */
  const hx=ax-13*sc,hy=ay-33*sc,u=Math.min(1,c.t/.8),e=1-Math.pow(1-u,3),
    open=Math.min(1,Math.max(0,(c.t-.25)/.45)),fade=c.t>c.d-.25?Math.max(0,(c.d-c.t)/.25):1;
  magicOrb(hx,hy-3-26*e,.4+.7*e,fade,open)}
function drawBeams(){
  BMS.forEach(b=>{
    if(!visFl(b.fl))return;
    const p=b.t/b.d,ext=Math.min(1,b.t/.18),fade=p>.6?1-(p-.6)/.4:1,L=BLEN*ext;
    cx.save();cx.translate(b.x,b.y);cx.rotate(b.a);cx.globalCompositeOperation='lighter';
    for(let u=0;u<L;u+=2){
      const k=u/BLEN,hw=1.5+16*Math.pow(k,1.3)*(.85+.15*Math.sin(frame*.4+u*.15)),j=Math.sin(u*.35+frame*.5)*3*k;
      cx.globalAlpha=.18*fade;cx.fillStyle=k<.4?'#2f4fff':'#8a3fff';cx.fillRect(u,j-hw*1.7,2,hw*3.4);
      cx.globalAlpha=.5*fade;cx.fillStyle=k<.45?'#4a7aff':'#c050ff';cx.fillRect(u,j-hw,2,hw*2);
      cx.globalAlpha=.9*fade;cx.fillStyle=k<.5?'#9ac4ff':'#ffd0ff';cx.fillRect(u,j-hw*.3,2,Math.max(1,hw*.6));
      cx.globalAlpha=fade;cx.fillStyle='#fff';cx.fillRect(u,j-.5,2,1);
      if(u%6===0&&hs(u,frame>>1)%3===0){
        const q=(hs(u,7)%2?1:-1)*hw*(1.1+(hs(u,frame>>2)%10)/10);
        cx.globalAlpha=.8*fade;cx.fillStyle='#e080ff';cx.fillRect(u,j+q,1,3)}}
    cx.restore();cx.globalAlpha=1})}
function drawAll(){
  const L=allPl();
  CST.forEach(c=>{const P=L.find(q=>q.pl===c.n);if(P&&visFl(P.fl|0))drawCast(c,P)});
  drawOrbs();drawBeams()}
const _glow=glow;glow=function(){_glow();if(!inside)drawAll()};
const _drawIn=drawIn;drawIn=function(){_drawIn();drawAll()};

/* ---------- Kỹ năng C: tia năng lượng ---------- */
cv.addEventListener('pointermove',e=>{MSX=e.clientX;MSY=e.clientY;MHAS=1});
function mouseW(){const r=cv.getBoundingClientRect(),k=inside?IS:1;return{x:(MSX-r.left)/r.width*CW/k+camX,y:(MSY-r.top)/r.height*CH/k+camY}}
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.key.toLowerCase()!=='c')return;
  if(state!=='island'||TK||trans)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const n=sel,P=allPl().find(p=>p.pl===n);if(!P||!hasNeck(n))return;
  if((CC[n]||0)>0){cap('Tia năng lượng đang hồi: '+fmt(CC[n])+'.');return}
  CC[n]=CCD;
  let ang=0;if(MHAS){const w=mouseW();ang=Math.atan2(w.y-(P.y-8),w.x-P.x)}
  startOrb(P,ang);
  cap('Angel Sentinel triệu hồi quả cầu phép... tia năng lượng sắp bắn ra!')});
function hurt(m,d,n){
  if(window.holyHurt)return window.holyHurt(m,d,false,n);
  const mx={human:100,snake:80,spider:80,boss:400}[m.k]||80;
  if(m.hp===undefined)m.hp=mx;m.mhp=mx;m.hp-=d;
  if(m.hp<=0){const A=window.MONS(),i=A.indexOf(m);if(i>=0)A.splice(i,1);if(window.onMonKilled)window.onMonKilled(m)}}
function fireBeam(n,ang){
  const P=allPl().find(p=>p.pl===n);if(!P)return;
  const off=window.islOffset?window.islOffset(P):0,x=P.x,y=P.y-off-8,c=Math.cos(ang),s=Math.sin(ang);
  BMS.push({x,y,a:ang,t:0,d:.9,fl:P.fl|0});
  shake=Math.max(shake,6);
  if((P.fl!==WID2&&P.fl!==23)||!window.MONS)return;       /* thêm tầng 23 = đảo bay boss */
  let hit=0;
  window.MONS().slice().forEach(m=>{
    const sb=m.sky&&m.k==='boss',
      cy=m.sky?m.y-(m.z||0)-(m.k==='boss'?30:8):m.y-8,
      mx=m.x-x,my=cy-y,d=mx*c+my*s;
    if(d<0||d>BLEN)return;
    const perp=Math.abs(-mx*s+my*c),k=d/BLEN,
      hw=3+22*Math.pow(k,1.3)+(sb?50:m.k==='boss'?14:6);   /* boss đảo bay to hơn */
    if(perp>hw)return;
    hurt(m,Math.round(DMAX-(DMAX-DMIN)*k),n);hit++});
  if(hit)cap('Tia năng lượng xuyên qua '+hit+' kẻ địch!')}

/* ---------- Icon kỹ năng C ---------- */
const hsty=document.createElement('style');
hsty.textContent='#hsC{padding:4px;min-width:0;position:relative}#hsC canvas{width:40px;height:40px;image-rendering:pixelated;display:block}'+
 '#hsC .cd{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 13px monospace;color:#fff;text-shadow:1px 1px 0 #000,-1px -1px 0 #000}';
document.head.appendChild(hsty);
const hc=document.createElement('div');hc.className='pnl';hc.id='hsC';hc.hidden=true;
const hic=document.createElement('canvas');hic.width=15;hic.height=15;hic.getContext('2d').drawImage(ORB,0,0);
const hcd=document.createElement('span');hcd.className='cd';
hc.append(hic,hcd);$('topRow').appendChild(hc);
setInterval(()=>{
  const ok=state==='island'&&hasNeck(sel);hc.hidden=!ok;if(!ok)return;
  const c=CC[sel]||0;hic.style.filter=c>0?'brightness(.3) saturate(.3)':'none';
  hcd.textContent=c>0?fmt(c):'C';
  hc.title='Tia năng lượng [C]: 100→50 sát thương theo khoảng cách, hồi 30s';
  /* R giữ icon cũ (kỹ năng đỡ đòn của dao phép), ẩn icon hào quang kiếm thánh */
  const h1=$('hs1');if(h1)h1.hidden=true;
  const sk=$('skl');if(sk&&window.curWeapon)sk.hidden=!window.curWeapon(sel)},150);

/* ---------- Bảng trang bị cạnh túi đồ ---------- */
const sty=document.createElement('style');
sty.textContent='#eqp{position:absolute;top:50%;transform:translateY(-50%);width:104px;padding:8px;background:rgba(10,14,28,.96);border:3px solid var(--ink);box-shadow:4px 4px 0 #000;line-height:1.3;z-index:6}'+
 '#eqp h3{margin:0 0 6px;font-size:13px;text-align:center}#eqS{display:grid;grid-template-columns:1fr 1fr;gap:6px}'+
 '#eqS .eqc{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:10px;font-weight:400;text-align:center}'+
 '#eqS .slot{width:100%;font-size:20px}#eqS .slot canvas{height:80%;width:auto;image-rendering:pixelated}';
document.head.appendChild(sty);
const panel=document.createElement('div');panel.id='eqp';panel.hidden=true;
panel.innerHTML='<h3>🎽 Trang bị</h3><div id="eqS"></div>';
$('stage').appendChild(panel);
let sig='';
function render(){
  const E=eq(sel),s=sel+JSON.stringify(E);if(s===sig)return;sig=s;
  const box=$('eqS');box.innerHTML='';
  SLOTS.forEach(([k,name,ph])=>{
    const id=E[k],w=document.createElement('div'),b=document.createElement('button'),l=document.createElement('span');
    w.className='eqc';b.className='slot'+(id?'':' empty');l.textContent=name;
    if(id==='dreamcatcher'){const c=document.createElement('canvas');c.width=20;c.height=34;c.getContext('2d').drawImage(DCI,0,0);b.append(c)}
    else b.textContent=id?ITEMS[id].icon:ph;
    b.title=id?ITEMS[id].name+' (bấm để tháo)':name+' (trống)';
    b.onclick=()=>unequip(sel,k);
    w.append(b,l);box.append(w)})}
const selId=()=>{const i=[...$('invGrid').children].findIndex(c=>c.classList.contains('sel'));return i>=0?bagOf(sel)[i]:null};
const btn=document.createElement('button');btn.className='btn';btn.id='invEq';btn.textContent='Trang bị';btn.disabled=true;
$('invUse').after(btn);
function equip(n,id){
  const it=ITEMS[id];if(!it||!it.slot)return;
  const E=eq(n),old=E[it.slot];
  if(!window.takeItem(n,id))return;
  E[it.slot]=id;save();
  if(old)window.giveItem(n,old);
  cap('P'+n+' trang bị '+it.name+'.'+(id==='dreamcatcher'?' Quả cầu phép bay quanh bạn. Bấm C để phóng tia năng lượng!':''));
  sig='';render()}
function unequip(n,slot){
  const E=eq(n),id=E[slot];if(!id)return;
  if(window.giveItem(n,id)){E[slot]=null;save();cap('P'+n+' tháo '+ITEMS[id].name+'.');sig='';render()}}
btn.onclick=()=>{const id=selId();if(id)equip(sel,id)};
function sync(){const id=selId(),it=id&&ITEMS[id];btn.disabled=!(it&&it.slot);render()}
$('invGrid').addEventListener('click',()=>setTimeout(sync,0));
let tm=null;
new MutationObserver(()=>{
  const open=!$('inv').hidden;
  panel.hidden=!open;
  $('inv').style.left=open?'42%':'';
  panel.style.left='calc(42% + min(47%,215px) + 8px)';
  clearInterval(tm);if(open){sig='';sync();tm=setInterval(sync,150)}
}).observe($('inv'),{attributes:true,attributeFilter:['hidden']});

/* ---------- Rút kiếm thánh: phong ấn cổng + nhận Dreamcatcher ---------- */
function giveCheck(){
  allPl().forEach(P=>{
    const n=P.pl;if(GV[n])return;
    const b=bagOf(n),q=window.sentQuest?window.sentQuest.get(n):0;
    if(hasNeck(n)||b.includes('dreamcatcher')){GV[n]=1;save();return}
    if(b.includes('holysword')||q>=2){
      if(window.giveItem(n,'dreamcatcher')){GV[n]=1;save();
        setTimeout(()=>cap('P'+n+' nhận Vòng cổ Dreamcatcher! Bấm B, chọn vòng rồi bấm Trang bị.'),120)}}})}
function sealCheck(){
  const S=window.A2S;if(!S)return;
  if(!S.sealed){sealMsg=false;
    /* phòng khi đã giữ kiếm từ trước mà cổng chưa đóng */
    if(S.phase===0&&window.MONS&&window.MONS().length&&window.sentQuest&&
       allPl().some(p=>p.fl===WID2&&bagOf(p.pl).includes('holysword')&&(window.sentQuest.get(p.pl)|0)<2)){S.sealed=1;S.phase=1}
    return}
  if(S.phase===1&&!sealMsg){sealMsg=true;
    cap('Cổng lên Vực sâu tầng 1 bị phong ấn! Hãy tiêu diệt hết quái vật ở Vực sâu tầng 2 để mở lại cổng.')}}

/* ---------- Vòng lặp ---------- */
const _step=step;step=function(){
  _step();
  if(state!=='island')return;
  const dt=Math.min(.25,DM||.016);
  Object.keys(CC).forEach(k=>{if(CC[k]>0)CC[k]-=dt});
  CST.forEach(c=>{c.t+=dt;if(!c.fired&&c.t>=FIRE_AT){c.fired=1;fireBeam(c.n,c.ang)}});
  CST=CST.filter(c=>c.t<c.d);
  BMS.forEach(b=>b.t+=dt);BMS=BMS.filter(b=>b.t<b.d);
  if(frame%20===0)giveCheck();
  if(frame%10===0)sealCheck()};
const _mk=mkPeople;mkPeople=function(){_mk();EQ={};GV={};CC={};BMS=[];CST=[];sealMsg=false;save();sig=''};
})();