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
function curWeapon(n){
  const b=bagOf(n);
  if(EQ[n]&&b.includes(EQ[n]))return EQ[n];
  return b.find(id=>ITEMS[id]&&ITEMS[id].weapon)||null}

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
      R('#dff2ff',Math.round(ox+Math.cos(a)*15),Math.round(oy+Math.sin(a)*15),2,2)}
    cx.globalAlpha=1;
    for(let r=3;r<=15;r+=1.5)R(r<6?'#d4a63a':'#cfe9ff',Math.round(ox+Math.cos(a1)*r)-1,Math.round(oy+Math.sin(a1)*r)-1,2,2)});
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
    if(d<=30){
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
  if(!curWeapon(n)){cap('Cần cầm kiếm hoặc dao phép để dùng kỹ năng đỡ đòn.');return}
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

/* ---------- Móc vào vòng vẽ của game ---------- */
const _glow=glow;glow=function(){_glow();if(inside)return;gateFx();drawParry();drawSwings();drawParts()};
const _drawIn=drawIn;drawIn=function(){_drawIn();drawParry();drawSwings();drawParts()};

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

/* ---------- Thanh kỹ năng trong HUD ---------- */
const sty=document.createElement('style');
sty.textContent='#skl{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:170px;font-size:12px}'+
  '#sklI{width:72px;height:72px;transition:filter .15s}';
document.head.appendChild(sty);
const skl=document.createElement('div');skl.className='pnl';skl.id='skl';skl.hidden=true;
skl.innerHTML='<span id="sklN"></span>'+
 '<svg id="sklI" viewBox="0 0 100 100"><defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">'+
 '<stop offset="0" stop-color="#2fb8e8"/><stop offset=".4" stop-color="#e0306e"/><stop offset=".75" stop-color="#7a3fc8"/><stop offset="1" stop-color="#2f4fd0"/></linearGradient></defs>'+
 '<polygon points="50,1 56,7 50,13 44,7" fill="#2aa7c9"/><polygon points="50,99 56,93 50,87 44,93" fill="#2f4fd0"/>'+
 '<polygon points="1,50 7,44 13,50 7,56" fill="#e0a040"/><polygon points="99,50 93,44 87,50 93,56" fill="#e0306e"/>'+
 '<circle cx="50" cy="50" r="38" fill="url(#mg)"/>'+
 '<g fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round">'+
 '<circle cx="50" cy="50" r="38"/><circle cx="50" cy="50" r="32" stroke-dasharray="3 2"/><circle cx="50" cy="50" r="25"/>'+
 [0,45,90,135,180,225,270,315].map(a=>'<ellipse cx="50" cy="36" rx="6" ry="11" transform="rotate('+a+' 50 50)"/>').join('')+
 '<polygon points="50,20 56,44 80,50 56,56 50,80 44,56 20,50 44,44"/>'+
 '<polygon points="50,37 54,46 63,50 54,54 50,63 46,54 37,50 46,46"/>'+
 '<path d="M12 50H88M50 12V88M23 23L77 77M77 23L23 77"/></g>'+
 '<circle cx="18" cy="22" r="2.5" fill="#e0306e"/><circle cx="84" cy="80" r="2.5" fill="#e0a040"/><circle cx="82" cy="16" r="2" fill="#6a8de0"/><circle cx="14" cy="84" r="2" fill="#2f4fd0"/></svg>'+
 '<span id="sklT"></span>';
if($('hud'))$('hud').insertBefore(skl,$('gd'));
function hudSkill(){
  const w=curWeapon(sel);
  if(!w){skl.hidden=true;return}
  skl.hidden=false;
  const s=SK[sel]||{t:0,cd:0,cdMax:CD_MISS};let st,k,f;
  if(s.t>0){st='Đang đỡ đòn!';k=1;f='brightness(1.25) drop-shadow(0 0 6px #ffd23f)'}
  else if(s.cd>0){k=1-s.cd/s.cdMax;st='Hồi '+fmt(s.cd);f='brightness('+(.18+.82*k).toFixed(2)+') saturate('+(.2+.8*k).toFixed(2)+')'}
  else{st='Sẵn sàng';f='none'}
  const key=w+'|'+st+'|'+f;
  if(skl.dataset.k===key)return;skl.dataset.k=key;
  $('sklN').textContent=ITEMS[w].icon+' '+ITEMS[w].name+' · Chuột phải: chém';
  $('sklI').style.filter=f;
  $('sklT').textContent='R · Đỡ đòn: '+st}
function hudSkill(){
  const w=curWeapon(sel);
  if(!w){skl.hidden=true;return}
  skl.hidden=false;
  const s=SK[sel]||{t:0,cd:0,cdMax:CD_MISS};let st,pct,cls='';
  if(s.t>0){st='Đang đỡ đòn!';pct=100;cls='on'}
  else if(s.cd>0){st='Hồi '+fmt(s.cd);pct=Math.round((1-s.cd/s.cdMax)*100);cls='cd'}
  else{st='Sẵn sàng';pct=100}
  const key=w+'|'+st+'|'+pct+'|'+cls;
  if(skl.dataset.k===key)return;skl.dataset.k=key;
  skl.innerHTML='<span>'+ITEMS[w].icon+' '+ITEMS[w].name+' · Chuột phải: chém</span><div class="bar"><i class="'+cls+'" style="width:'+pct+'%"></i></div><span>R · Đỡ đòn: '+st+'</span>'}
const _sh=showHud;showHud=function(){_sh();const g=$('gd');if(g)g.innerHTML+='<br>Chuột phải: dùng vũ khí · R: kỹ năng vũ khí'};

/* ---------- Túi đồ: chọn vũ khí rồi bấm "Dùng" để cầm ---------- */
const selIdx=()=>[...$('invGrid').children].findIndex(c=>c.classList.contains('sel'));
function selItem(){bcf=-99;const i=selIdx();return i>=0?bagOf(sel)[i]:null}
function updInv(){
  const id=selItem(),it=id&&ITEMS[id],btn=$('invUse');
  if(it&&it.weapon){
    btn.disabled=false;btn.textContent='Cầm vũ khí';
    if(EQ[sel]===id)$('invInfo').textContent+=' [Đang cầm]'}
  else btn.textContent='Dùng'}
const _use=$('invUse').onclick;
$('invUse').onclick=function(){
  const id=selItem(),it=id&&ITEMS[id];
  if(it&&it.weapon){EQ[sel]=id;cap('P'+sel+' cầm '+it.name+'. Chuột phải: chém · R: đỡ đòn.');updInv();return}
  if(_use)_use.call(this)};
new MutationObserver(updInv).observe($('invGrid'),{childList:true});

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