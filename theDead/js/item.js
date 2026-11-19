/* ===== itemdrop.js: VỨT ĐỒ (có xác nhận) + NHẶT LẠI (E) + KHÓA ĐỒ =====
   Nạp SAU Playerkit.js (đặt cuối cùng cũng được). Không cần sửa file cũ.
   - Bấm "Vứt": hiện bảng hỏi "Bạn có chắc chắn vứt bỏ <tên đồ> không?" (Có / Không).
   - Vứt xong: icon đồ bay từ người ra rồi nằm trên đất.
   - Lại gần đồ rơi sẽ hiện chữ E. Bấm E: chọn "Nhặt" hoặc "Bỏ qua" (hoặc bấm phím 1 / 2).
   - Bên phải icon đồ trong túi có ổ khóa. Bấm vào để khóa / mở khóa. Đồ bị khóa không thể vứt. */
(()=>{
if(typeof window.giveItem!=='function'||!$('invDrop')||!$('invGrid')||typeof glow!=='function'||typeof drawIn!=='function'){
  console.warn('itemdrop.js: hãy nạp SAU Playerkit.js');return}

const INVKEY='deadisland:inv1',LKEY='deadisland:locks';
const FLY=.45,REACH=20;
let LK={},DR=[],cur=null;
try{LK=JSON.parse(localStorage.getItem(LKEY))||{}}catch(_){LK={}}
const saveLK=()=>{try{localStorage.setItem(LKEY,JSON.stringify(LK))}catch(_){}};

const bagOf=n=>{try{const I=JSON.parse(localStorage.getItem(INVKEY))||{};return Array.isArray(I[n])?I[n]:[]}catch(_){return[]}};
const itemOf=id=>(window.ITEMS||{})[id]||{icon:'❓',name:id,d:''};
const isLocked=(n,i)=>{const id=bagOf(n)[i];return !!(id&&LK[n]&&LK[n][i]===id)};
const playerOf=n=>allPl().find(p=>p.pl===n);
const selIdx=()=>[...$('invGrid').children].findIndex(c=>c.classList.contains('sel'));
const visFl=f=>inside?(f|0)===curF:!(f|0);

/* ---------- CSS ---------- */
const sty=document.createElement('style');
sty.textContent=
'#invGrid .slot{position:relative}'+
'#invGrid .lk{position:absolute;right:1px;top:50%;transform:translateY(-50%);font-size:11px;line-height:1;padding:2px 1px;cursor:pointer;opacity:.45;filter:grayscale(.6)}'+
'#invGrid .lk:hover{opacity:1}'+
'#invGrid .lk.on{opacity:1;filter:none}'+
'#dropAsk{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);line-height:1.4}'+
'#dropAsk .pn{width:min(92%,380px);padding:14px;background:rgba(10,14,28,.97);border:3px solid var(--sun);box-shadow:4px 4px 0 #000}'+
'#dropAsk p{margin:0 0 10px;font-weight:400}'+
'#dropAsk .row{display:flex;gap:8px}'+
'#dropAsk .btn{flex:1;padding:8px 12px;font-size:14px}';
document.head.appendChild(sty);

/* ---------- Bảng hỏi dùng chung ---------- */
const box=document.createElement('div');box.id='dropAsk';box.hidden=true;
box.innerHTML='<div class="pn"><p id="daT"></p><div class="row" id="daB"></div></div>';
$('stage').appendChild(box);
function closeAsk(){cur=null;box.hidden=true}
function ask(text,opts){
  $('daT').textContent=text;const row=$('daB');row.innerHTML='';
  opts.forEach(([t,fn],i)=>{
    const b=document.createElement('button');b.className='btn'+(i?' alt':'');b.textContent=(i+1)+'. '+t;
    b.onclick=()=>{closeAsk();fn()};row.append(b)});
  cur=opts;box.hidden=false;row.firstChild.focus()}

/* ---------- Ổ khóa trên từng ô đồ ---------- */
function refresh(){
  const g=$('invGrid'),b=bagOf(sel);let ch=false;
  [...g.children].forEach((s,i)=>{
    s.querySelectorAll('.lk').forEach(x=>x.remove());
    if(!b[i]){if(LK[sel]&&LK[sel][i]!==undefined){delete LK[sel][i];ch=true}return}
    const lk=isLocked(sel,i),sp=document.createElement('span');
    sp.className='lk'+(lk?' on':'');sp.textContent=lk?'🔒':'🔓';
    sp.title=lk?'Đã khóa (bấm để mở khóa)':'Bấm để khóa';
    sp.onclick=e=>{e.stopPropagation();e.preventDefault();toggleLock(i)};
    s.append(sp)});
  if(ch)saveLK();
  syncDrop()}
function syncDrop(){
  const i=selIdx(),lk=i>=0&&isLocked(sel,i),info=$('invInfo');
  info.textContent=info.textContent.replace(' 🔒 (Đã khóa)','')+(lk?' 🔒 (Đã khóa)':'');
  if(lk)$('invDrop').disabled=true}
function toggleLock(i){
  const id=bagOf(sel)[i];if(!id)return;
  const L=LK[sel]||(LK[sel]={});
  if(L[i]===id){delete L[i];cap('Đã mở khóa '+itemOf(id).name+'.')}
  else{L[i]=id;cap('Đã khóa '+itemOf(id).name+'. Đồ bị khóa không thể vứt.')}
  saveLK();refresh()}
new MutationObserver(refresh).observe($('invGrid'),{childList:true});

/* ---------- Bấm "Vứt": hỏi xác nhận, rồi vứt ---------- */
const _drop=$('invDrop').onclick;
$('invDrop').onclick=function(){
  const n=sel,i=selIdx(),id=i>=0?bagOf(n)[i]:null;if(!id)return;
  if(isLocked(n,i)){cap(itemOf(id).name+' đang bị khóa, không thể vứt.');return}
  const it=itemOf(id);
  ask('Bạn có chắc chắn vứt bỏ '+it.icon+' '+it.name+' không?',[
    ['Có',()=>{
      if(sel!==n||bagOf(n)[i]!==id||isLocked(n,i))return;
      const P=playerOf(n);if(!P)return;
      _drop.call($('invDrop'));                       /* playerkit.js xóa đồ khỏi túi */
      if(bagOf(n)[i]===id)return;                     /* nếu chưa xóa được thì thôi */
      spawnDrop(id,P);
      cap('P'+n+' vứt '+it.name+'. Lại gần bấm E để nhặt lại.')}],
    ['Không',()=>{}]])};

/* ---------- Đồ rơi trên đất ---------- */
function spawnDrop(id,P){
  let ex=P.x,ey=P.y;const a0=Math.random()*6.28;
  for(let k=0;k<14;k++){
    const a=a0+k*.9,r=13+Math.random()*7,x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r*.7;
    if(walk(x,y,P)){ex=x;ey=y;break}}
  DR.push({id,fl:P.fl|0,sx:P.x,sy:P.y-9,ex,ey,t:0})}
const landed=d=>d.t>=FLY;
function nearDrop(){
  const P=(inside?ins:people).find(p=>p.pl===sel);if(!P)return null;
  let b=null,bd=REACH;
  DR.forEach(d=>{if(!landed(d)||(d.fl|0)!==(P.fl|0))return;const q=Math.hypot(d.ex-P.x,d.ey-P.y);if(q<bd){bd=q;b=d}});
  return b}
function pick(d,n){
  if(!DR.includes(d))return;
  if(window.giveItem(n,d.id))DR=DR.filter(x=>x!==d)}  /* túi đầy thì đồ vẫn nằm lại trên đất */

function drawDrops(){
  if(state!=='island'||!DR.length)return;
  const near=nearDrop();
  cx.save();cx.textAlign='center';
  DR.forEach(d=>{
    if(!visFl(d.fl))return;
    const k=Math.min(1,d.t/FLY),x=d.sx+(d.ex-d.sx)*k,gy=d.sy+(d.ey-d.sy)*k,y=gy-Math.sin(Math.PI*k)*14,
      it=itemOf(d.id),bob=landed(d)?Math.sin(frame*.1+d.ex)*1:0;
    cx.fillStyle='rgba(0,0,0,.28)';cx.fillRect(Math.round(d.ex-4),Math.round(d.ey),8,2);
    cx.font='9px sans-serif';cx.fillStyle='#fff';
    cx.fillText(it.icon,Math.round(x),Math.round((landed(d)?d.ey-2:y)+bob));
    if(d===near){
      const t='E: '+it.name;cx.font='bold 6px monospace';
      const w=Math.ceil(cx.measureText(t).width)+6,bx=Math.round(d.ex-w/2),by=Math.round(d.ey-20);
      cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(bx,by,w,9);
      cx.fillStyle='#ffd23f';cx.fillRect(bx,by+9,w,1);
      cx.fillStyle='#fff';cx.fillText(t,Math.round(d.ex),by+7)}});
  cx.restore();cx.globalAlpha=1}

const _glow=glow;glow=function(){_glow();if(!inside)drawDrops()};
const _drawIn=drawIn;drawIn=function(){_drawIn();drawDrops()};
const _step=step;step=function(){_step();const dt=Math.min(.25,DM||.016);DR.forEach(d=>{if(d.t<FLY)d.t+=dt})};

/* ---------- Phím: E để nhặt, 1/2/Esc trả lời bảng hỏi ---------- */
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;
  if(cur){                                         /* đang có bảng hỏi: chặn mọi phím khác */
    e.preventDefault();e.stopImmediatePropagation();
    if(e.repeat)return;
    const k=e.key;
    if(/^[1-9]$/.test(k)&&cur[+k-1]){const f=cur[+k-1][1];closeAsk();f()}
    else if(k==='Escape')closeAsk();
    return}
  if(e.key.toLowerCase()!=='e'||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
  if(state!=='island'||TK||trans)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const d=nearDrop();if(!d)return;
  e.stopImmediatePropagation();                    /* ưu tiên nhặt đồ hơn nói chuyện NPC */
  const n=sel,it=itemOf(d.id);
  ask('Nhặt lại '+it.icon+' '+it.name+'?',[['Nhặt',()=>pick(d,n)],['Bỏ qua',()=>{}]])},true);

/* ---------- Ván mới: xóa đồ rơi + khóa ---------- */
const _mk=mkPeople;mkPeople=function(){_mk();DR=[];LK={};saveLK();closeAsk()};
})();