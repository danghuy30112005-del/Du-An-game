/* ===== Abyss2.js: TẦNG 2 CỦA VỰC SÂU + KIẾM THÁNH + QUÁI NẤM KÝ SINH =====
   Nạp SAU Sentinel.js (đặt cuối cùng). Cần các chỗ sửa nhỏ trong Abyss.js, Playerkit.js, Sentinel.js. */
(()=>{
if(typeof putIn!=='function'||typeof syncView!=='function'||typeof allPl!=='function'||!window.WORLDS||typeof window.abyssAsk!=='function'||typeof window.worldTransfer!=='function'||typeof window.sentQuest!=='object'){console.warn('Abyss2.js: hãy nạp SAU Sentinel.js và làm đủ các chỗ sửa trong Abyss.js / Playerkit.js / Sentinel.js');return}

const WID1=21,WID2=22,WALL=62,VW=400;
const K=1.5,sc=v=>Math.round(v*K);          /* hệ số phóng to bản đồ */
const AW2=sc(170),AH2=sc(104);
const SPX=sc(85),SPY=sc(18);            /* chỗ xuất hiện (ô) */
const PTX=sc(98),PTY=sc(18);            /* cổng ánh sáng quay lên */
const STX=sc(84),STY=sc(83);            /* tảng đá (khối 2x2, góc trái-trên) */
const SWa={x:(STX+1)*T,y:(STY+2)*T};
const FEARR=100;                        /* bán kính (px) quanh kiếm thánh mà quái không dám bước vào */
const CHM=[[85,14,18,8],[45,36,16,9],[125,36,16,9],[85,56,18,9],[35,76,14,9],[135,76,14,9],[85,86,24,11]]
  .map(([x,y,rx,ry])=>[sc(x),sc(y),sc(rx),sc(ry)]);
const MS={human:{sp:1.55,wind:.55,sight:95,hear:60,reach:19,alert:.7},
  boss:{sp:1.2,wind:.75,sight:150,hear:100,reach:32,alert:.8},
  snake:{sp:.9,wind:.4,sight:85,hear:50,reach:21,alert:.5},
  spider:{sp:1.0,wind:.32,sight:90,hear:55,reach:21,alert:.4}};
const D4=[[1,0],[-1,0],[0,1],[0,-1]];
let M2=null,OBJ2=[],MON=[],PEND2=[],PT2=[],WF={x:83,y:9},QX=0,QY=0,lastSay=0;
const r=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(QX+a,QY+b,w,h)};
const R0=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),w,h)};
const say=t=>{const n=performance.now();if(n-lastSay>5000){lastSay=n;cap(t)}};

/* ---------- Vật phẩm + nhiệm vụ ---------- */
function ensureItems(){const I=window.ITEMS;if(!I)return;
  if(!I.wdkey)I.wdkey={icon:'🗝️',name:'Chìa khóa cửa xoáy',d:'Chìa khóa bạc khắc hình xoáy ốc. Mở cánh cửa xoáy bên trái bãi đáp Vực sâu, dẫn xuống tầng 2.'};
  if(!I.holysword)I.holysword={icon:'⚔️',name:'Thanh kiếm thánh',d:'Thanh kiếm cánh thiên thần, lưỡi rực lửa. Hãy mang nó trả lại cho Angel Sentinel.'}}
ensureItems();addEventListener('load',ensureItems);
const bagOf=n=>{try{const I=JSON.parse(localStorage.getItem('deadisland:inv1'))||{};return Array.isArray(I[n])?I[n]:[]}catch(_){return[]}};
const hasI=(n,id)=>bagOf(n).includes(id);
const quest=n=>(window.sentQuest.get(n)|0);
let BC={f:-99,n:0,b:[],q:0};
function cache(n){if(BC.n!==n||frame-BC.f>=10)BC={f:frame,n,b:bagOf(n),q:quest(n)};return BC}
const swordShown=()=>{const c=cache(sel);return c.q<2&&!c.b.includes('holysword')};

/* ---------- Cánh cửa xoáy bên trái (Abyss.js gọi hàm này) ---------- */
window.doorHook=function(n){
  ensureItems();
  if(!hasI(n,'wdkey')){cap('Cánh cửa xoáy đóng chặt, một ổ khóa hình xoáy ốc phát sáng mờ nhạt. Có lẽ Angel Sentinel biết cách mở nó...');return true}
  window.abyssAsk('Chìa khóa trong túi rung lên khi cánh cửa xoáy mở ra. Bạn có muốn bước qua để xuống tầng 2 của Vực sâu không?',[
    ['Bước qua',()=>{cap('P'+n+' bước vào cánh cửa xoáy...');window.worldTransfer(n,'abyss2')}],['Chưa',()=>{}]]);
  return true};

/* ---------- Thế giới ---------- */
const WORLDS=window.WORLDS;
WORLDS.abyss2={name:'Vực sâu - tầng 2',enter(q){ensureItems();putIn(q,WID2,SPX+.5+(slot(q)-2)*1.2,SPY+1);q.vis=1;
  if(q.pl===sel)cap('Bạn rơi vào một hang ngầm: nấm phát sáng, thác nước đổ xuống hồ xanh. Nơi sâu nhất ở phía nam có thanh kiếm thánh... và lũ quái bị nấm ký sinh. Đi rón rén (Shift) để chúng khó phát hiện bạn.')}};
WORLDS.abyssW={name:'Vực sâu',enter(q){putIn(q,WID1,70.5+(slot(q)-2)*1.4,69);q.vis=1;
  if(q.pl===sel)cap('Bạn leo lên khỏi hang ngầm, trở lại Vực sâu bên cánh cửa xoáy phía tây.')}};

/* ================= BẢN ĐỒ ================= */
function build2(){
  const mk=v=>Array.from({length:AH2},()=>Array(AW2).fill(v));
  const im=mk(WALL),rid=mk(0),wat=mk(0),ob=mk(0);
  const fl=(x,y)=>{if(x>1&&y>1&&x<AW2-2&&y<AH2-2){im[y][x]=0;rid[y][x]=1}};
  const ell=(a0,b0,rx,ry,k)=>{for(let y=Math.floor(b0-ry*1.3)-1;y<=b0+ry*1.3+1;y++)for(let x=Math.floor(a0-rx*1.3)-1;x<=a0+rx*1.3+1;x++){
    const a=Math.atan2((y+.5-b0)/ry,(x+.5-a0)/rx),q=1+.1*Math.sin(3*a+k)+.07*Math.sin(5*a+2*k),d=Math.hypot((x+.5-a0)/rx,(y+.5-b0)/ry)/q;if(d<1)fl(x,y)}};
  const tun=(pts,w)=>{for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i],n=Math.max(1,Math.abs(c-a),Math.abs(d-b));
    for(let j=0;j<=n;j++){const x=a+Math.round((c-a)*j/n),y=b+Math.round((d-b)*j/n);for(let u=-w;u<=w;u++)for(let v=-w;v<=w;v++)fl(x+u,y+v)}}};
  CHM.forEach(([x,y,rx,ry],i)=>ell(x,y,rx,ry,i+1));
  [[[80,18],[62,28],[50,34]],[[90,18],[108,28],[120,34]],[[50,42],[68,52],[80,56]],[[120,42],[102,52],[90,56]],
   [[75,60],[50,68],[38,74]],[[95,60],[120,68],[132,74]],[[40,82],[58,88],[70,88]],[[130,82],[112,88],[100,88]]].forEach(p=>tun(p.map(([x,y])=>[sc(x),sc(y)]),2));
  for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){fl(SPX+i,SPY+j);fl(PTX+i,PTY+j)}
  for(let x=SPX;x<=PTX;x++)for(let y=PTY-1;y<=PTY+1;y++)fl(x,y);
  for(let j=-4;j<=4;j++)for(let i=-6;i<=6;i++)fl(STX+i,STY+j);
  /* hồ dưới thác nước */
  for(let y=sc(4);y<=sc(22);y++)for(let x=SPX-sc(16);x<=SPX+sc(16);x++)if(Math.hypot((x+.5-SPX)/13,(y+.5-sc(11))/5)<1&&im[y][x]===0){im[y][x]=WALL;rid[y][x]=0;wat[y][x]=1}
  WF={x:SPX-2,y:9};for(let y=0;y<AH2;y++)if(wat[y][SPX]){WF.y=y;break}
  /* vật thể */
  OBJ2=[];const used=[];
  const fine=(x,y,rr)=>{for(let j=-rr;j<=rr;j++)for(let i=-rr;i<=rr;i++)if((im[y+j]||[])[x+i]!==0)return false;return true};
  const pickIn=(ci,k,rr)=>{const[c0,c1,rx,ry]=CHM[ci];
    for(let t=0;t<60;t++){const h=hs(k*131+t*17,ci*97+t*5+3),x=Math.round(c0+((h%1000)/1000-.5)*rx*1.7),y=Math.round(c1+(((h>>>10)%1000)/1000-.5)*ry*1.7);
      if(x<4||y<4||x>=AW2-4||y>=AH2-4||!fine(x,y,rr))continue;
      if(Math.hypot(x-SPX,y-SPY)<10||Math.hypot(x-PTX,y-PTY)<9||Math.hypot(x*T-SWa.x,y*T-SWa.y)<FEARR+16)continue;      if(used.some(([a,b])=>Math.hypot(a-x,b-y)<3))continue;
      used.push([x,y]);return[x,y]}
    return null};
  const put=(k,x,y,h,w,block)=>{OBJ2.push({k,x,y,ax:x*T+4,ay:(y+1)*T,h,w});if(block){im[y][x]=WALL;rid[y][x]=0;ob[y][x]=1}};
  [3,1,1,2,1,1,2].forEach((n,ci)=>{for(let i=0;i<n*2;i++){const p=pickIn(ci,i,1);if(p)put('mus',p[0],p[1],36,24,1)}});
  [3,2,2,2,2,2,3].forEach((n,ci)=>{for(let i=0;i<n*2;i++){const p=pickIn(ci,10+i,0);if(p)put('smu',p[0],p[1],8,10,0)}});
  [0,1,0,1,1,1,1].forEach((n,ci)=>{for(let i=0;i<n*2;i++){const p=pickIn(ci,20+i,1);if(p)put('cry',p[0],p[1],18,14,1)}});
  [2,2,2,2,2,2,2].forEach((n,ci)=>{for(let i=0;i<n*2;i++){const p=pickIn(ci,30+i,0);if(p)put('fern',p[0],p[1],14,16,0)}});
  [1,1,1,1,1,1,2].forEach((n,ci)=>{for(let i=0;i<n*2;i++){const p=pickIn(ci,40+i,1);if(p)put('stg',p[0],p[1],14,8,1)}});
  [[SPX-11,SPY-3],[SPX+10,SPY-3],[SPX-6,SPY-2],[SPX+6,SPY-2]].forEach(([x,y])=>{if(im[y][x]===0)put('fern',x,y,14,16,0)});
  /* tảng đá + kiếm */
  for(let j=0;j<2;j++)for(let i=0;i<2;i++){im[STY+j][STX+i]=WALL;rid[STY+j][STX+i]=0;ob[STY+j][STX+i]=1}
  OBJ2.push({k:'sword',x:STX,y:STY,ax:SWa.x,ay:SWa.y,h:58,w:34});
  OBJ2.sort((a,b)=>a.ay-b.ay);
  /* quái */
  MON=[];
  [[1,['human','snake']],[2,['spider','human']],[3,['human','spider','snake']],[4,['human','human','spider']],[5,['snake','spider','human']],[6,['human','spider','snake','human','spider']]]
   .forEach(([ci,ks])=>ks.forEach((k,i)=>{const p=pickIn(ci,50+i,1);if(p)MON.push({k,x:p[0]*T+4,y:p[1]*T+4,hx:p[0]*T+4,hy:p[1]*T+4,st:'idle',t:0,dir:Math.random()<.5?1:-1,path:[],rt:0,lost:0,stun:0,slow:0,wait:ri(1,3),wt:null,tgt:null,moving:0,rage:0})}));
  M2={im,rid,wat,ob};
  FL[WID2]={im,rid,RM:[null,{n:'Vực sâu - tầng 2',f:['rgba(0,0,0,0)','rgba(0,0,0,0)'],x0:0,y0:0,x1:AW2-1,y1:AH2-1,s:1}]}}

/* ================= QUÁI ================= */
const pls2=()=>ins.filter(p=>p.pl&&p.fl===WID2);
const tcx=v=>Math.floor(v/T);
const free2=(x,y)=>{const a=M2.im[tcx(y)];return !!a&&a[tcx(x)]===0};
function los2(a,b){const dx=b.x-a.x,dy=b.y-a.y,n=Math.ceil(Math.hypot(dx,dy)/3);for(let i=1;i<n;i++)if(!free2(a.x+dx*i/n,a.y+dy*i/n))return false;return true}
function scared(m,x,y){            /* chặn việc tiến lại gần kiếm thánh trong vùng sợ */
  const o=Math.hypot(m.x-SWa.x,m.y-SWa.y),n=Math.hypot(x-SWa.x,y-SWa.y);
  if(n<FEARR&&n<o){m.fear=frame;return true}
  return false}
function step2(m,tx,ty,sp){
  const dx=tx-m.x,dy=ty-m.y,d=Math.hypot(dx,dy);if(d<.01)return true;
  if(Math.abs(dx)>.3)m.dir=dx>0?1:-1;
  const k=Math.min(1,sp/d),nx=m.x+dx*k,ny=m.y+dy*k,
    ok=(x,y)=>free2(x,y)&&!scared(m,x,y);
  if(ok(nx,ny)){m.x=nx;m.y=ny;m.moving=1}
  else if(ok(nx,m.y)){m.x=nx;m.moving=1}
  else if(ok(m.x,ny)){m.y=ny;m.moving=1}
  return d<=sp}
function bfs2(sx,sy,tx,ty){
  const im=M2.im,pr=new Int32Array(AW2*AH2).fill(-1),s0=sy*AW2+sx,q=[s0];pr[s0]=s0;
  for(let i=0;i<q.length;i++){const c=q[i],x=c%AW2,y=(c/AW2)|0;if(x===tx&&y===ty)break;
    for(const[a,b]of D4){const X=x+a,Y=y+b;if(X<0||Y<0||X>=AW2||Y>=AH2)continue;const k=Y*AW2+X;if(pr[k]>=0||im[Y][X]!==0)continue;pr[k]=c;q.push(k)}}
  const e=ty*AW2+tx;if(pr[e]<0)return null;const o=[];for(let c=e;c!==pr[c];c=pr[c])o.push([(c%AW2)*T+4,((c/AW2)|0)*T+4]);return o.reverse()}
function wander(m,dt){
  if(Math.hypot(m.hx-m.x,m.hy-m.y)>40){
    if(!m.path.length){const a=bfs2(tcx(m.x),tcx(m.y),tcx(m.hx),tcx(m.hy));m.path=a||[];if(!a){m.hx=m.x;m.hy=m.y}}
    if(m.path.length&&step2(m,m.path[0][0],m.path[0][1],.5))m.path.shift();return}
  if(m.wt){if(step2(m,m.wt[0],m.wt[1],m.k==='snake'?.35:.3)||!m.moving){m.wt=null;m.wait=1+Math.random()*3}return}
  if(m.wait>0){m.wait-=dt;return}
  const tx=m.x+rnd(41)-20,ty=m.y+rnd(41)-20;
  if(free2(tx,ty)&&los2(m,{x:tx,y:ty}))m.wt=[tx,ty];else m.wait=.5}
function nearestP(m,A){let P=null,d=1e9;A.forEach(p=>{const q=Math.hypot(p.x-m.x,p.y-m.y);if(q<d){d=q;P=p}});return[P,d]}
function tickMon(dt){
  const A=pls2();
  if(!A.length){MON.forEach(m=>{if(m.st!=='idle'){m.st='idle';m.path=[];m.wt=null;m.wait=1;m.rage=0}m.moving=0});return}
  MON.forEach(m=>{
    const S=MS[m.k];m.moving=0;
    if(m.stun>0){m.stun-=dt;return}
    if(m.slow>0)m.slow-=dt;if(m.rage>0)m.rage-=dt;
    const[P,d]=nearestP(m,A);if(!P)return;
    const sn=P.sneak,rn=P.sprint,sr=S.sight*(sn?.55:rn?1.4:1),
      see=m.rage>0?d<260:((d<sr&&los2(m,P))||(!sn&&d<S.hear*(rn?1.6:.55)));
    if(m.st==='idle'){
      if(see){m.st='alert';m.t=0;m.tgt=P;m.path=[];m.wt=null;say('Một con quái bị nấm ký sinh đã phát hiện ra bạn!')}
      else wander(m,dt)}
    else if(m.st==='alert'){
      m.t+=dt;m.dir=P.x>=m.x?1:-1;
      if(m.t>=S.alert){m.st='chase';m.lost=0;m.path=[];m.rt=0;
        MON.forEach(o=>{if(o!==m&&o.st==='idle'&&Math.hypot(o.x-m.x,o.y-m.y)<80){o.st='alert';o.t=0;o.tgt=P}})}}
    else if(m.st==='chase'){
      if(see||d<100)m.lost=0;else m.lost+=dt;
      if(m.lost>4){m.st='idle';m.path=[];m.wt=null;m.wait=1.5;return}
      if(d<14){m.st='bite';m.t=0;m.tgt=P;return}
      /* tốc độ đuổi: bị choáng thì chậm, tối đa 1.9 (chậm hơn người chạy Q = 2.1) */
      const sp=Math.min(1.9,m.slow>0?.6:S.sp);
      if(los2(m,P))step2(m,P.x,P.y,sp);
      else{if(--m.rt<=0||!m.path.length){m.rt=12;m.path=bfs2(tcx(m.x),tcx(m.y),tcx(P.x),tcx(P.y))||[]}
        if(m.path.length&&step2(m,m.path[0][0],m.path[0][1],sp))m.path.shift()}}
    else if(m.st==='bite'){
      m.t+=dt;const V=A.find(p=>m.tgt&&p.pl===m.tgt.pl);
      if(V){m.dir=V.x>=m.x?1:-1;
        /* lao tới khi vồ: dùng đúng tốc độ thường, không nhân thêm */
        if(m.t>S.wind*.35)step2(m,V.x,V.y,Math.min(1.9,S.sp))}
      if(m.t>=S.wind){
        m.st='chase';m.path=[];m.rt=0;
        if(V&&Math.hypot(V.x-m.x,V.y-m.y)<S.reach){
          if(window.parryHit&&window.parryHit(V,m)){m.stun=2;cap('Đỡ được cú vồ! Con quái bị choáng 2 giây.')}
          else{killPlayer(V.pl);m.stun=1.2}}
        else m.slow=.9}}})}
function awaken(P){
  MON.forEach(m=>{if(Math.hypot(m.x-SWa.x,m.y-SWa.y)<300&&m.stun<=0){m.st='chase';m.lost=0;m.path=[];m.rt=0;m.rage=8;m.tgt=P}});
  flash=14}

/* ================= KIẾM THÁNH, CỔNG ================= */
function burst(x,y,n){for(let i=0;i<n;i++)PT2.push({x:x+rnd(9)-4,y:y+rnd(9)-4,vx:(Math.random()-.5)*1.6,vy:-(.3+Math.random()*1.4),l:30+rnd(30),c:['#ffd23f','#fff3a0','#ff9a1a','#ffffff'][rnd(4)]})}
const nearSword=P=>Math.hypot(P.x-SWa.x,P.y-(SWa.y+6))<28;
const nearPortal=P=>!(window.A2S&&window.A2S.sealed)&&Math.hypot(P.x-(PTX*T+4),P.y-(PTY*T+4))<18;
function pullSword(P){
  const n=P.pl,st=quest(n);ensureItems();
  if(hasI(n,'holysword')){cap('P'+n+' đã mang thanh kiếm thánh trong túi. Hãy trả nó cho Angel Sentinel.');return}
  if(st<1){cap('Thanh kiếm cắm trong đá tỏa ánh lửa nhưng không đáp lại bạn. Có ai đó đang chờ nó... (hãy nói chuyện với Angel Sentinel).');return}
  if(st>=2){cap('Thanh kiếm thánh đã được trao trả cho Angel Sentinel.');return}
  if(typeof window.giveItem!=='function')return;
  if(window.giveItem(n,'holysword')){
    burst(SWa.x,SWa.y-30,50);BC.f=-99;window.A2S.sealed=1;window.A2S.phase=1;window.A2S.sealed=1;window.A2S.phase=1;
    cap('P'+n+' rút được Thanh kiếm thánh! Tiếng gầm vang khắp hang, bầy quái đã thức dậy! Chạy về cổng ánh sáng ở phía bắc!')}}
function askUp(n){
  window.abyssAsk('Một vòng sáng dẫn ngược lên Vực sâu. Bạn có muốn quay lên không?',[
    ['Quay lên',()=>{cap('P'+n+' bước vào vòng sáng...');window.worldTransfer(n,'abyssW')}],['Chưa',()=>{}]])}
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat||e.key.toLowerCase()!=='e'||e.ctrlKey||e.metaKey||e.altKey)return;
  if(state!=='island'||TK||trans)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const P=allPl().find(p=>p.pl===sel&&p.fl===WID2);if(!P)return;
  if(window.A2S&&window.A2S.sealed&&Math.hypot(P.x-(PTX*T+4),P.y-(PTY*T+4))<26){cap('Cổng ánh sáng đã sụp, bị phong ấn! Hãy tiêu diệt thứ đang canh giữ hang này.');return}
  if(nearPortal(P)){askUp(P.pl);return}
  if(nearSword(P))pullSword(P)});

/* ================= VẼ ================= */
const solid2=(x,y)=>y>=0&&y<AH2&&x>=0&&x<AW2&&(M2.im[y][x]===0||M2.ob[y][x])&&!M2.wat[y][x];
const isW=(x,y)=>!!(M2.wat[y]&&M2.wat[y][x]);
function floor2(x,y,h){
  r(h%2?'#12303f':'#0f2b3a',0,0,T,T);
  if(h%5===0)r('#0a2230',(h>>3)&7,(h>>6)&7,2,1);
  if(h%9===0)r('#1a4a52',(h>>4)&5,(h>>8)&5,3,1);
  if(h%17===0)r('#1f6a5a',(h>>3)&5,(h>>7)&5,2,2);
  if(h%23===0&&((frame>>4)+h)%4)r('#46e0d0',(h>>3)&7,(h>>6)&7,1,1);
  if(isW(x,y-1)||isW(x,y+1)||isW(x-1,y)||isW(x+1,y)){cx.globalAlpha=.25;r('#58d8f0',0,0,T,T);cx.globalAlpha=1}
  if(!solid2(x,y-1)){cx.globalAlpha=.45;r('#000',0,0,T,3);cx.globalAlpha=1}}
function wall2(x,y,h){
  const s=solid2(x,y+1)||isW(x,y+1);
  if(s){r('#17384f',0,0,T,T);for(let i=0;i<4;i++)r('#0d2438',(h>>(i*2))&7,i*2,1+((h>>(i+3))&1),1);
    r('#2c6a86',0,0,T,1);r('#071522',0,T-2,T,2);
    if(h%3===0){const a=2+((h>>4)%4);r('#071522',a,0,2,3);r('#071522',a+1,3,1,2)}
    if(h%13===0)r('#46e0d0',(h>>5)&5,2,1,2)}
  else{r('#050c18',0,0,T,T);if(solid2(x,y-1))r('#0a1a2e',0,0,T,T);else if(h%4===0)r('#091628',(h>>3)&7,(h>>6)&7,2,1)}}
function water2(x,y,h){
  const w=Math.sin(x*.8+y*.6+frame*.06)+Math.sin(x*.35-y*.9+frame*.04);
  r(w>.9?'#1b86a8':w<-1?'#0a3a52':'#0f5a78',0,0,T,T);
  if(((x*3+y*5+(frame>>3))%7)===0){cx.globalAlpha=.7;r('#46e0d0',(h>>3)&5,(h>>6)&5,2,1);cx.globalAlpha=1}
  if(!isW(x,y-1)){cx.globalAlpha=.5;r('#000',0,0,T,2);cx.globalAlpha=1}
  if(x>=WF.x&&x<=WF.x+4&&y===WF.y){cx.globalAlpha=.6;r('#d8fffa',(h>>3)&3,((frame>>2)+h)&3,4,1);cx.globalAlpha=1}}
function tile2(x,y){
  const h=hs(x,y);QX=x*T;QY=y*T;
  if(M2.wat[y][x])return water2(x,y,h);
  if(M2.im[y][x]===0||M2.ob[y][x])return floor2(x,y,h);
  wall2(x,y,h)}
function waterfall2(){
  const fx=WF.x*T,fw=5*T,top=T,bot=WF.y*T+4;
  if(fx+fw<camX-4||fx>camX+CW/IS+4||bot<camY||top>camY+CH/IS+4)return;
  cx.globalAlpha=.06;for(let y=0;y<bot;y+=3){const w=34+y*.35;R0('#bfeaff',fx+fw/2-w/2,y,w,3)}
  cx.globalAlpha=.9;R0('#136f86',fx,top,fw,bot-top);
  for(let c=0;c<fw;c+=2)for(let yy=top;yy<bot;yy+=5){const o=(yy+frame*2+c*7)%24;if(o<10){cx.fillStyle=o<4?'#d8fffa':'#6ff0e0';cx.fillRect(fx+c,yy,2,Math.min(5,bot-yy))}}
  R0('#0a4a5a',fx,top,2,bot-top);R0('#0a4a5a',fx+fw-2,top,2,bot-top);
  cx.globalAlpha=.25;for(let i=0;i<8;i++)R0('#cffff8',fx-4+((i*9+(frame>>1))%(fw+8)),bot-6-((frame>>2)+i*3)%8,6,3);
  cx.globalAlpha=.12;R0('#46e0d0',fx-14,top,fw+28,bot-top+10);cx.globalAlpha=1}
function drawPortal(){
  if(window.A2S&&window.A2S.sealed)return;
  const x=PTX*T+4,y=PTY*T+4,f=frame;
  if(x<camX-40||x>camX+CW/IS+40||y<camY-60||y>camY+CH/IS+40)return;
  cx.globalAlpha=.16+.06*Math.sin(f*.07);R0('#bfe8ff',x-16,y-46,32,50);
  for(let a=0;a<6.28;a+=.1){cx.globalAlpha=.5+.4*(.5+.5*Math.sin(f*.05+a*2));R0('#e8fbff',x+Math.cos(a)*14,y+Math.sin(a)*8,2,1)}
  cx.globalAlpha=.3;for(let a=0;a<6.28;a+=.2)R0('#46e0d0',x+Math.cos(a+f*.03)*9,y+Math.sin(a+f*.03)*5,2,1);
  cx.globalAlpha=.8;for(let i=0;i<6;i++)R0('#ffffff',x-8+((i*5+f*.2)%16),y-((f*.5+i*13)%40),1,1);
  cx.globalAlpha=1}
/* nấm khổng lồ phát sáng */
function dMus2(o){
  const x=o.ax,y=o.ay,k=o.x*7+o.y,pu=hs(o.x,o.y)%3===0,
    cap=pu?['#4a3a9a','#7a5ad0','#c8a8ff']:['#2f5ab8','#4a8ae0','#9ae8ff'];
  cx.globalAlpha=.12+.05*Math.sin(frame*.06+k);R0(pu?'#a070ff':'#46c8ff',x-22,y-44,44,40);cx.globalAlpha=1;
  R0('rgba(0,0,0,.3)',-7+x,y-2,14,3);
  for(let j=0;j<22;j++){const sx=Math.round(Math.sin(j*.18+k)*2),w=Math.max(3,5-Math.floor(j/9));R0('#8fc4e0',x-(w>>1)+sx,y-2-j,w,1);R0('#5a8aae',x+(w>>1)+sx-1,y-2-j,1,1)}
  const cxm=x+Math.round(Math.sin(22*.18+k)*2),cyt=y-34;
  for(let j=0;j<10;j++){const hw=Math.round(12*Math.sqrt(1-Math.pow((9-j)/10,2)));
    R0(j<2?cap[1]:j<6?cap[0]:(j%2?cap[2]:'#e8fbff'),cxm-hw,cyt+j,hw*2,1)}
  R0(cap[1],cxm-6,cyt+2,3,1);R0('#ffffff',cxm+3,cyt+2,2,1);
  cx.globalAlpha=.3+.2*Math.sin(frame*.1+k);R0(cap[2],cxm-10,cyt+9,20,1);cx.globalAlpha=1}
function dSmu(o){
  const x=o.ax,y=o.ay,c=(o.x+o.y)%3===0?'#b07cff':'#46e0d0';
  cx.globalAlpha=.16;R0(c,x-6,y-9,12,9);cx.globalAlpha=1;
  R0('#cfe6f0',x,y-5,1,5);R0(c,x-2,y-7,5,2);R0('#ffffff',x-1,y-7,1,1);
  if((o.x+o.y)%2){R0('#cfe6f0',x+3,y-3,1,3);R0(c,x+2,y-5,3,2)}}
function dFern(o){
  const x=o.ax,y=o.ay,k=o.x+o.y,c=k%2?['#2b4fa0','#4a7ae0','#1c3478']:['#6a3fc0','#a070ff','#d84a9c'];
  for(let i=0;i<5;i++){const a=-2.5+i*.62+Math.sin(frame*.03+i+k)*.05,L=9+((i+k)%3)*3;
    for(let q=1;q<=L;q++)R0(q%4?c[0]:c[1],x+Math.cos(a)*q*.9,y-2+Math.sin(a)*q*.8+q*q*.012,2,2);
    R0(c[2],x+Math.cos(a)*L*.9,y-2+Math.sin(a)*L*.8,1,1)}}
function dCry2(o){
  const x=o.ax,y=o.ay,pu=(o.x+o.y)%2===0,c=pu?['#a070ff','#d4b8ff','#5a30b0']:['#2fb8f0','#9ae8ff','#1673a8'];
  cx.globalAlpha=.16+.08*Math.sin(frame*.07+o.x);R0(pu?'#a070ff':'#46e0d0',x-10,y-20,20,20);cx.globalAlpha=1;
  R0('rgba(0,0,0,.3)',x-6,y-2,12,3);
  [[0,16,5],[-5,11,4],[5,9,4],[-2,7,3]].forEach(([dx,h,w])=>{
    for(let j=0;j<h;j++){const ww=j>h-4?Math.max(1,w-(j-(h-4))):w;R0(c[0],x+dx-(w>>1),y-2-j,ww,1)}
    R0(c[1],x+dx-(w>>1),y-2-(h-5),1,h-5);R0(c[2],x+dx+(w>>1)-(w>3?1:0),y-3-(h-5),1,h-6)})}
function dStg2(o){
  const x=o.ax,y=o.ay;R0('rgba(0,0,0,.3)',x-4,y-2,8,3);
  for(let j=0;j<14;j++){const w=Math.max(1,Math.round(6*(1-j/14)));R0('#1c3a52',x-(w>>1),y-2-j,w,1);R0('#2c6a86',x-(w>>1),y-2-j,1,1)}}
/* tảng đá + thanh kiếm thánh cánh thiên thần */
function dStone(o){
  const x=o.ax,y=o.ay,f=frame;
  cx.globalAlpha=.3+.2*Math.sin(f*.06);for(let a=0;a<6.28;a+=.12)R0('#ff9a1a',x+Math.cos(a)*30,y-2+Math.sin(a)*12,2,1);cx.globalAlpha=1;
  R0('rgba(0,0,0,.35)',x-15,y-3,30,5);
  for(let j=0;j<13;j++){const w=Math.round(7+j*.6);R0(j<2?'#7a9ab0':j<9?'#4f6f88':'#2c475c',x-w,y-13+j,w*2,1)}
  R0('#a8c4d8',x-5,y-13,6,1);R0('#1a2c3a',x+3,y-10,1,5);R0('#1a2c3a',x-6,y-6,1,4);R0('#2fe0c8',x-8,y-5,1,2);
  if(!swordShown())return;
  const by=y-13;
  cx.globalAlpha=.16+.07*Math.sin(f*.08);R0('#ffa030',x-24,by-58,48,62);R0('#ffd23f',x-12,by-48,24,44);cx.globalAlpha=1;
  /* cánh */
  for(const s of[-1,1]){
    for(let i=0;i<7;i++){const L=8+i*4,fx=x+s*(6+i*2.6)-(s<0?3:0);
      R0(i%2?'#ffffff':'#e6eefb',fx,by-30-L,3,L);R0('#b8c8e0',fx,by-32,3,2)}
    for(let i=0;i<5;i++)R0('#c8d6ec',x+s*(6+i*2.6)-(s<0?2:0),by-29,2,4+i)}
  /* lưỡi kiếm rực lửa */
  for(let j=0;j<26;j++){const w=j<21?4:Math.max(1,4-Math.floor((j-20)/2)),yy=by-26+j,hot=j%5===(f>>2)%5;
    R0(hot?'#fff3a0':'#ffb02e',x-(w>>1),yy,w,1)}
  R0('#ff5a1f',x-3,by-26,1,21);R0('#ff5a1f',x+2,by-26,1,21);R0('#ffd23f',x-1,by-26,2,20);
  /* chắn kiếm, cán, chuôi, ngọc xanh */
  R0('#6a4a2a',x-8,by-29,16,3);R0('#b8864f',x-8,by-29,16,1);R0('#3a2410',x-8,by-27,16,1);R0('#b8864f',x-9,by-31,2,3);R0('#b8864f',x+7,by-31,2,3);
  R0('#2f9bd6',x-2,by-29,4,3);R0('#bfefff',x-1,by-29,1,1);R0('#6a4a2a',x-3,by-26,6,3);
  R0('#4a3a2a',x-1,by-39,3,10);for(let i=0;i<4;i++)R0('#7a6a50',x-1,by-38+i*2,3,1);
  R0('#6a4a2a',x-3,by-42,7,3);R0('#b8864f',x-2,by-43,5,1);R0('#2f9bd6',x-1,by-46,3,3);R0('#bfefff',x,by-46,1,1);
  /* tia lửa + lông vũ rơi */
  for(let i=0;i<6;i++){cx.globalAlpha=.8;R0(i%2?'#ffd23f':'#ff7a1a',x-3+Math.sin(f*.1+i*2)*4,by-6-((f*.6+i*9)%26),1,2)}
  for(let i=0;i<4;i++){cx.globalAlpha=.7;R0('#ffffff',x+Math.sin(f*.03+i*2)*22,by-50+((f*.3+i*17)%48),2,1)}
  cx.globalAlpha=1}
function dObj2(o){
  if(o.k==='mus')dMus2(o);else if(o.k==='smu')dSmu(o);else if(o.k==='fern')dFern(o);
  else if(o.k==='cry')dCry2(o);else if(o.k==='stg')dStg2(o);else dStone(o)}
function drawBack2(){
  const x0=Math.max(0,Math.floor(camX/T)-1),y0=Math.max(0,Math.floor(camY/T)-1),
    x1=Math.min(AW2-1,x0+Math.ceil(CW/IS/T)+3),y1=Math.min(AH2-1,y0+Math.ceil(CH/IS/T)+3);
  cx.fillStyle='#04080f';cx.fillRect(x0*T,y0*T,(x1-x0+1)*T,(y1-y0+1)*T);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)tile2(x,y);
  waterfall2();drawPortal();
  const lx=x0*T-40,rx=x1*T+40,ty=y0*T-70,by=y1*T+70;
  OBJ2.forEach(o=>{if(o.ax<lx||o.ax>rx||o.ay<ty||o.ay>by)return;dObj2(o)});
  cx.globalAlpha=1}
/* ----- quái ----- */
function dHuman(m){
  const x=Math.round(m.x),y=Math.round(m.y),f=m.dir||1,R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(x+(f>0?a:-a-w),y+b,w,h)},
    wk=m.moving?((frame>>3)&1):0,ag=m.st==='chase'||m.st==='bite',al=m.st==='alert',ln=m.st==='bite'?2:0,
    sh=al?Math.round(Math.sin(frame*1.3)):0,ec=ag||al?'#ff4a4a':'#7cfff0';
  cx.globalAlpha=.12+.05*Math.sin(frame*.08+x);R('#46e0d0',-10,-28,20,28);cx.globalAlpha=1;
  R('rgba(0,0,0,.3)',-6,-1,12,2);
  R('#22313a',-3,-6,2,6-wk);R('#22313a',1,-6,2,5+wk);
  R('#44606a',-4+ln,-14,8,8);R('#2c4048',2+ln,-14,2,8);R('#8fa89a',-2+ln,-9,2,1);R('#7a2a3a',ln,-12,2,1);R('#2c4048',-4+ln,-7,8,1);
  if(ag){R('#8fa89a',3+ln,-13,9,2);R('#8fa89a',3+ln,-10,8,2)}
  else if(al){R('#8fa89a',3+sh,-17,2,6);R('#8fa89a',-5+sh,-17,2,6)}
  else{R('#8fa89a',-6,-13,2,7+wk);R('#8fa89a',4,-13,2,6)}
  R('#9bb6a6',-3+ln,-20,6,6);R('#6f8a7c',-3+ln,-20,6,1);R(ec,-2+ln,-18,1,1);R(ec,1+ln,-18,2,1);R('#13201f',ln,-15,3,1);
  R('#e8f4ff',-1+ln,-22,1,2);R('#46e0d0',-3+ln,-24,5,2);R('#9ae8ff',-2+ln,-25,3,1);
  R('#cfe6f0',-5,-15,1,2);R('#b07cff',-7,-17,4,2);R('#e8d8ff',-6,-18,2,1);
  R('#cfe6f0',-4,-10,1,2);R('#46e0d0',-6,-12,4,2)}
function dSnake(m){
  const x=Math.round(m.x),y=Math.round(m.y),f=m.dir||1,Q=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(x+Math.round(a),y+Math.round(b),w,h)},
    ag=m.st==='chase'||m.st==='bite'||m.st==='alert',ph=frame*(m.moving?.22:.07),lf=ag?5:0;
  Q('rgba(0,0,0,.3)',-14,-1,26,2);
  for(let i=11;i>=1;i--){
    const bx=-f*i*2.8,by=-3-Math.sin(ph+i*.8)*(m.moving?2.4:1)-(i<4?lf*(1-i/4):0),w=i>8?2:3;
    Q(i%3?'#4f7a52':'#3a6040',bx-1,by-1,w+1,w+1);Q('#9ac08a',bx,by,1,1);
    if(i===3||i===7){Q('#cfe6f0',bx,by-3,1,2);Q(i===3?'#46e0d0':'#b07cff',bx-2,by-5,5,2);Q('#ffffff',bx-1,by-5,1,1)}}
  const hx=f*3,hy=-4-lf;
  Q('#5a8a5a',hx-2,hy-2,5,4);Q('#7aaa7a',hx-2,hy-2,5,1);Q(ag?'#ff4a4a':'#7cfff0',hx+(f>0?1:-2),hy-1,1,1);
  if((frame>>3)%3===0)Q('#e03040',hx+f*3,hy,3,1)}
function dSpider(m){
  const x=Math.round(m.x),y=Math.round(m.y),f=m.dir||1,Q=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(x+Math.round(a),y+Math.round(b),w,h)},
    ln=(c,x0,y0,x1,y1)=>{const n=Math.max(1,Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++)Q(c,x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,1,1)},
    ag=m.st==='chase'||m.st==='bite'||m.st==='alert',lo=m.st==='bite'?2:0,ec=ag?'#ff4a4a':'#7cfff0';
  Q('rgba(0,0,0,.3)',-10,-1,20,2);
  for(let i=0;i<4;i++)for(const s of[-1,1]){
    const ph=((frame>>2)+i+(s>0?1:0))&1,kx=s*(5+i*1.5),ky=-11-(i%2)*2+lo,fx=s*(9+i*2.5),fy=m.moving&&ph?-2:0;
    ln('#2a1f38',s*3,-6,kx,ky);ln('#2a1f38',kx,ky,fx,fy)}
  const ax=-f*6;
  Q('#34264a',ax-4,-12+lo,9,7);Q('#4a3a66',ax-4,-12+lo,9,1);Q('#a070ff',ax-1,-9+lo,1,1);Q('#a070ff',ax+2,-10+lo,1,1);
  Q('#cfe6f0',ax-2,-14+lo,1,2);Q('#46e0d0',ax-4,-16+lo,5,2);Q('#cfe6f0',ax+2,-15+lo,1,2);Q('#b07cff',ax,-17+lo,4,2);
  Q('#3a2a4a',f*3-4,-10+lo,8,5);Q('#4a3a66',f*3-4,-10+lo,8,1);
  Q(ec,f*3-2,-9+lo,1,1);Q(ec,f*3+1,-9+lo,1,1);Q(ec,f*3-1,-8+lo,1,1);Q(ec,f*3,-8+lo,1,1);
  Q('#e8e0cc',f*3+(f>0?3:-4),-6+lo,1,2)}
function drawMon(m){
  if(m.x<camX-30||m.x>camX+CW/IS+30||m.y<camY-4||m.y>camY+CH/IS+50)return;
  (m.k==='human'?dHuman:m.k==='snake'?dSnake:m.k==='boss'&&window.drawBossPlus?window.drawBossPlus:dSpider)(m);
  const x=Math.round(m.x),y=Math.round(m.y),H0=m.k==='boss'?50:m.k==='human'?26:m.k==='snake'?14:18;
  if(m.st==='alert'||m.st==='chase'||m.st==='bite'){cx.fillStyle='#ff3b3b';cx.fillRect(x-1,y-H0-8,2,4);cx.fillRect(x-1,y-H0-3,2,2)}
  if(m.stun>0)for(let i=0;i<3;i++){const a=frame*.25+i*2.1;cx.fillStyle='#ffe45c';cx.fillRect(Math.round(x+Math.cos(a)*7),Math.round(y-H0-2+Math.sin(a)*2),2,2)}}
function label(x,y,t,col){
  cx.save();cx.textAlign='center';cx.font='bold 6px monospace';
  const w=Math.ceil(cx.measureText(t).width)+6,bx=Math.round(x-w/2),by=Math.round(y);
  cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(bx,by,w,9);cx.fillStyle=col||'#ffd23f';cx.fillRect(bx,by+9,w,1);
  cx.fillStyle='#fff';cx.fillText(t,Math.round(x),by+7);cx.restore()}
function drawFront2(){
  const L=ins.filter(p=>p.fl===WID2).concat(MON);
  OBJ2.forEach(o=>{if(o.k!=='mus'&&o.k!=='cry'&&o.k!=='sword')return;
    if(L.some(q=>q.y<o.ay-1&&q.y>o.ay-o.h-4&&Math.abs(q.x-o.ax)<o.w/2))dObj2(o)});
  const vw=CW/IS,vh=CH/IS;
  cx.globalAlpha=.06+.2*Math.min(1,camY/Math.max(1,AH2*T-vh));R0('#02060e',camX,camY,vw,vh);
  for(let i=0;i<22;i++){const dx=camX+((i*97+frame*.12*(1+i%3*.4))%vw),dy=camY+((i*61+frame*.05+Math.sin(frame*.02+i)*8)%vh);
    cx.globalAlpha=.35+.35*Math.sin(frame*.05+i);R0(i%3?'#d8ff7a':'#7cfff0',dx,dy,1,1)}
  PT2.forEach(q=>{cx.globalAlpha=Math.max(0,Math.min(1,q.l/20));R0(q.c,q.x,q.y,2,2)});cx.globalAlpha=1;
  const P=L.find(q=>q.pl===sel);if(!P||PEND2.length)return;
  if(nearPortal(P))label(PTX*T+4,PTY*T-30,'E: Quay lên Vực sâu','#7cfff0');
  else if(nearSword(P)){const c=cache(sel);label(SWa.x,SWa.y-70,c.q===1&&!c.b.includes('holysword')?'E: Rút thanh kiếm thánh':'Thanh kiếm thánh','#ffd23f')}}

/* ---------- Móc vào game ---------- */
const _pp=person;person=function(p){
  if(PEND2.length&&p.fl===WID2)while(PEND2.length&&PEND2[0].y<=p.y)drawMon(PEND2.shift());
  _pp(p)};
const _di=drawIn;drawIn=function(){
  if(curF!==WID2||!M2)return _di();
  drawBack2();
  PEND2=MON.slice().sort((a,b)=>a.y-b.y);
  _di();
  while(PEND2.length)drawMon(PEND2.shift());
  drawFront2()};
function snap2(){const P=ins.find(p=>p.pl===sel);if(!P)return;
  camX=Math.max(0,Math.min(AW2*T-CW/IS,P.x-CW/IS/2));camY=Math.max(0,Math.min(AH2*T-CH/IS,P.y-CH/IS/2))}
const _sv=syncView;syncView=function(s){_sv(s);const P=ins.find(p=>p.pl===sel);if(P&&P.fl===WID2){IS=CW/VW;if(s)snap2()}};
const _cam=cam;cam=function(){
  if(inside&&curF===WID2){const P=ins.find(p=>p.pl===sel)||ins.find(p=>p.pl);if(!P)return;
    camX+=(Math.max(0,Math.min(AW2*T-CW/IS,P.x-CW/IS/2))-camX)*.15;camY+=(Math.max(0,Math.min(AH2*T-CH/IS,P.y-CH/IS/2))-camY)*.15;return}
  _cam()};
const _step=step;step=function(){
  _step();if(state!=='island'||!M2)return;
  const dt=Math.min(.25,DM||.016);
  PT2.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy-=.01;q.l--});PT2=PT2.filter(q=>q.l>0);
  tickMon(dt)};
const _gen=gen;gen=function(sd){_gen(sd);build2()};
const _mk=mkPeople;mkPeople=function(){_mk();build2();PT2=[]};
window.MONS=()=>MON;
build2();   /* bản đồ đầu tiên đã được tạo trước khi file này nạp */
})();

/* ===== Plus.js: đồ họa mới, xoay hướng, nhấp nhô + bóng, trăng, mở rộng đảo, camera,
   tele đẹp hơn, Angel Sentinel chi tiết, thiên thần bảo hộ (E), tia lửa mới,
   Abyss2: phong ấn cổng -> diệt quái -> xác gộp thành BOSS nấm 400HP -> nấm con trốn -> mở cổng ===== */
(()=>{
if(typeof sprite!=='function'||typeof person!=='function'||typeof step!=='function'||typeof draw!=='function'||typeof drawIn!=='function'){console.warn('Plus.js: hãy nạp CUỐI CÙNG (sau Abyss2.js)');return}
const WID2=22,WALL=62,PTX=Math.round(98*1.5),PTY=Math.round(18*1.5);
const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),w,h)};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let CUT=null,LO=0;
window.A2S={sealed:0,phase:0};

/* ================= 1. XOAY HƯỚNG: trái = lật ngang, lên = quay lưng, xuống/phải = nhìn thẳng ================= */
const _sprite=sprite,VAR=new Map();
function backFace(g,p){
  const l=typeof lookOf==='function'?lookOf(p):null;
  let top=-15,h=5,col=null;
  if(l==='boy'||p.k==='child')top=-13;
  else if(l==='witch'){top=-18;h=5;col='#2a1a2e'}
  const y0=OY+top;
  if(!col){const d=g.getImageData(OX,y0-1,1,1).data;col=(d[3]>200&&!(d[0]===23&&d[1]===18))?'rgb('+d[0]+','+d[1]+','+d[2]+')':'#2b1b0f'}
  g.fillStyle=col;g.fillRect(OX-3,y0,6,h);
  g.fillStyle='rgba(0,0,0,.18)';g.fillRect(OX-3,y0+h-1,6,1)}
sprite=function(p,s){
  const base=_sprite(p,s),f=p&&p.face;
  if(!f||f==='d'||f==='r')return base;
  let m2=VAR.get(base);if(!m2){m2={};VAR.set(base,m2)}
  if(m2[f])return m2[f];
  const c=document.createElement('canvas');c.width=SW;c.height=SH;const g=c.getContext('2d');
  if(f==='l'){g.translate(SW,0);g.scale(-1,1);g.drawImage(base,0,0)}
  else{g.drawImage(base,0,0);backFace(g,p)}
  m2[f]=c;return c};
function trackFace(){
  for(const p of people.concat(ins)){
    if(p.lx===undefined){p.lx=p.x;p.ly=p.y;continue}
    const dx=p.x-p.lx,dy=p.y-p.ly;
    if(Math.abs(dx)<6&&Math.abs(dy)<6&&(Math.abs(dx)>.04||Math.abs(dy)>.04))
      p.face=Math.abs(dx)>=Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u');
    p.lx=p.x;p.ly=p.y}}

/* ================= 2. NHẤP NHÔ KHI ĐI + BÓNG ================= */
const _person=person;
person=function(p){
  const bob=(p.moving&&p.act!=='sleep')?Math.round(Math.abs(Math.sin(frame*.28+p.x*.05))*1.5):0;
  if(p.act!=='sleep'&&p.fl!==21){
    cx.save();cx.fillStyle='rgba(0,0,0,.22)';cx.beginPath();
    cx.ellipse(Math.round(p.x),Math.round(p.y),6-bob*.5,2.3-bob*.3,0,0,6.2832);cx.fill();cx.restore()}
  if(bob){cx.save();cx.translate(0,-bob);try{_person(p)}finally{cx.restore()}}else _person(p)};

/* ================= 3. MỞ RỘNG ĐẢO (2 bán đảo phía tây, tránh đường thuyền) ================= */
function expand(){
  if(!m||!m[0])return;
  [[24,24,17,13,1.3],[28,86,20,14,2.6]].forEach(([cx0,cy0,rx,ry,k])=>{
    for(let y=cy0-ry-3;y<=cy0+ry+3;y++)for(let x=cx0-rx-3;x<=cx0+rx+3;x++){
      if(x<1||y<1||x>=W-1||y>=H-1||m[y][x]!==SEA)continue;
      const a=Math.atan2((y+.5-cy0)/ry,(x+.5-cx0)/rx),r=1+.1*Math.sin(3*a+k)+.07*Math.sin(5*a+2*k),d=Math.hypot((x+.5-cx0)/rx,(y+.5-cy0)/ry)/r;
      if(d<1){const h=hs(x,y)%100;m[y][x]=h<(d<.7?48:28)?TREE:(h>93?FLOW:GRASS)}}
    for(let y=cy0-3;y<=cy0+3;y++)for(let x=cx0-6;x<=cx0;x++)         /* ao nước nhỏ */
      if(m[y][x]!==SEA&&Math.hypot((x+.5-(cx0-3))/3.4,(y+.5-cy0)/2.1)<1)m[y][x]=SEA;
    for(let y=cy0-ry-3;y<=cy0+ry+3;y++)for(let x=cx0-rx-3;x<=cx0+rx+3;x++){
      const t=(m[y]||[])[x];
      if((t===GRASS||t===TREE||t===FLOW)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>(m[y+b]||[])[x+a]===SEA))m[y][x]=SAND}});
  calcSea()}

/* ================= 4. CAMERA NHÌN LÊN TRÊN + khoá điều khiển khi cutscene ================= */
const _cam=cam;
cam=function(){
  if(CUT&&inside&&curF===WID2){
    const im=FL[WID2].im,vw=CW/IS,vh=CH/IS;
    camX+=(clamp(CUT.cx-vw/2,0,im[0].length*T-vw)-camX)*.06;camY+=(clamp(CUT.cy-vh/2,0,im.length*T-vh)-camY)*.06;return}
  if(inside||(state!=='island'&&state!=='land')){LO=0;return _cam()}
  camY-=LO;_cam();
  const up=keys.w||keys.arrowup,dn=keys.s||keys.arrowdown;
  LO+=((up?-36:dn?6:-12)-LO)*.04;
  camY=clamp(camY+LO,0,WH-CH)};
const _ctrl=ctrl;
ctrl=function(){if(CUT){const P=allPl().find(p=>p.pl===sel);if(P)P.moving=0;return}_ctrl()};

/* ================= 5. HẬU KỲ: bloom, grading, trăng, lấp lánh biển, đom đóm / phấn hoa ================= */
const OFF=document.createElement('canvas');OFF.width=Math.ceil(CW/4);OFF.height=Math.ceil(CH/4);
const og=OFF.getContext('2d'),HASF='filter' in og;
function bloom(nk){
  og.setTransform(1,0,0,1,0,0);og.globalCompositeOperation='source-over';og.imageSmoothingEnabled=true;
  if(HASF)og.filter='brightness(.75) contrast(1.9)';
  og.drawImage(cv,0,0,OFF.width,OFF.height);
  if(HASF)og.filter='none';
  cx.save();cx.imageSmoothingEnabled=true;cx.globalCompositeOperation='lighter';cx.globalAlpha=.2+.12*nk;
  cx.drawImage(OFF,0,0,CW,CH);cx.restore()}
function grade(){
  cx.save();cx.globalCompositeOperation='soft-light';
  const g=cx.createLinearGradient(0,0,0,CH);
  g.addColorStop(0,'rgba(120,150,255,.22)');g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(255,170,90,.22)');
  cx.fillStyle=g;cx.fillRect(0,0,CW,CH);cx.restore()}
function sparkle(nk,mx,my){
  const night=nk>.3;
  for(let i=0;i<70;i++){
    const h=hs(i*7,(frame>>3)+i*13),sx=h%CW,sy=(h>>>9)%CH,
      wx=Math.floor((camX+sx)/T),wy=Math.floor((camY+sy)/T);
    if(!m[wy]||m[wy][wx]!==SEA)continue;
    let k=1;
    if(night){k=Math.max(0,1-Math.hypot(sx-mx,(sy-my)*.5)/240);if(k<.05)continue;k*=nk}
    else k=.55*(1-nk);
    cx.globalAlpha=clamp(k*(.5+.5*Math.sin(frame*.2+i)),0,1);
    cx.fillStyle=i%3?'#dfeaff':'#ffffff';cx.fillRect(sx,sy,2,1)}
  cx.globalAlpha=1}
function moon(a){
  const x=CW-58,y=38;
  cx.save();cx.globalCompositeOperation='lighter';
  let g=cx.createRadialGradient(x,y,6,x,y,80);
  g.addColorStop(0,'rgba(170,200,255,'+(.4*a).toFixed(3)+')');g.addColorStop(1,'rgba(170,200,255,0)');
  cx.fillStyle=g;cx.fillRect(x-80,y-80,160,160);
  g=cx.createRadialGradient(x,y,10,x,y,380);
  g.addColorStop(0,'rgba(110,140,255,'+(.09*a).toFixed(3)+')');g.addColorStop(1,'rgba(110,140,255,0)');
  cx.fillStyle=g;cx.fillRect(0,0,CW,CH);cx.restore();
  cx.globalAlpha=a;
  for(let dy=-11;dy<=11;dy++){const w=Math.floor(Math.sqrt(121-dy*dy));R('#f3f6ff',x-w,y+dy,w*2,1);if(dy>2)R('#d3dcf2',x-w,y+dy,Math.max(1,w-2),1)}
  [[-5,-4,3,2],[3,-1,4,3],[-2,5,3,2],[5,-7,2,2]].forEach(([a2,b,w,h])=>R('#c3cde8',x+a2,y+b,w,h));
  cx.globalAlpha=1}
const AMB=Array.from({length:44},()=>({x:Math.random()*CW,y:Math.random()*CH,ph:Math.random()*6.28}));
function ambient(nk){
  if(GL>.65)return;
  AMB.forEach((p,i)=>{
    p.x+=Math.sin(frame*.011+p.ph)*.28+(nk>.4?0:.18);p.y+=Math.cos(frame*.014+p.ph)*.22-(nk>.4?0:.04);
    if(p.x>CW+4)p.x=-4;if(p.x<-4)p.x=CW+4;if(p.y>CH+4)p.y=-4;if(p.y<-4)p.y=CH+4;
    const t=(m[Math.floor((camY+p.y)/T)]||[])[Math.floor((camX+p.x)/T)];
    if(t===undefined||t===SEA)return;
    if(nk>.4){
      const a=Math.max(0,Math.sin(frame*.05+p.ph*3));if(a<.05)return;
      cx.save();cx.globalCompositeOperation='lighter';cx.fillStyle='#d8ff7a';
      cx.globalAlpha=.18*a*nk;cx.fillRect(Math.round(p.x)-3,Math.round(p.y)-3,7,7);
      cx.globalAlpha=a*nk;cx.fillRect(Math.round(p.x),Math.round(p.y),2,2);cx.restore()}
    else{cx.globalAlpha=.4*(1-nk*2);cx.fillStyle=i%5?'#fffbd0':'#a6d86a';cx.fillRect(Math.round(p.x),Math.round(p.y),i%5?1:2,1);cx.globalAlpha=1}})}
function post(){
  const live=state==='island'||state==='land'||state==='sail'||state==='crash',nk=live?nightK():0;
  if(!window.SWACT){grade();bloom(nk)}
  if(!inside&&live){
    const ma=nk*clamp(1-GL*1.3,0,1),mx=CW-58,my=38;
    sparkle(nk,mx,my);ambient(nk);
    if(ma>.15)moon(ma)}}
const _draw=draw;
draw=function(){_draw();try{post()}catch(e){console.error('Plus post',e)}};

/* ================= 6. HIỆU ỨNG TELE XUỐNG ABYSS (Abyss.js gọi window.swDrawPlus) ================= */
window.swDrawPlus=function(S){
  const p=S.t/S.d,e=p<.5?p/.5:(1-p)/.5,E=e*e*(3-2*e),t=S.t,mx=CW/2,my=CH/2,out=p>.5;
  if(!out)shake=Math.max(shake,Math.round(2+4*E));
  cx.save();cx.setTransform(1,0,0,1,0,0);
  let g=cx.createRadialGradient(mx,my,8,mx,my,CW*.72);
  g.addColorStop(0,'rgba(150,190,255,'+(.7*E).toFixed(3)+')');
  g.addColorStop(.4,'rgba(28,48,170,'+(.82*E).toFixed(3)+')');
  g.addColorStop(1,'rgba(3,5,28,'+(.96*E).toFixed(3)+')');
  cx.fillStyle=g;cx.fillRect(0,0,CW,CH);
  for(let i=0;i<90;i++){                                   /* vệt tốc độ */
    const a=(hs(i,11)%6283)/1000,sp=.5+(hs(i,5)%100)/100;
    let ph=(t*sp*(out?-.9:1.4)+(hs(i,7)%100)/100)%1;if(ph<0)ph+=1;
    const r0=14+ph*ph*330,r1=r0+8+ph*70*E;
    cx.globalAlpha=E*(.2+.6*ph);cx.fillStyle=i%6?'#9cc4ff':'#ffffff';
    for(let r=r0;r<r1;r+=2)cx.fillRect(Math.round(mx+Math.cos(a)*r),Math.round(my+Math.sin(a)*r*.78),i%4?1:2,1)}
  const Rm=26+300*E,rot=t*5.5;                             /* 4 cánh xoáy */
  for(let k=0;k<4;k++)for(let r=2;r<Rm;r+=1.4){
    const th=rot+k*1.5708+3*Math.log(r/3+1),u=r/Rm,w=Math.max(1,Math.round(1+r*.035));
    cx.globalAlpha=E*(1-u*.5);cx.fillStyle=u<.15?'#ffffff':u<.5?'#bcd8ff':u<.8?'#5f8fff':'#2b3fb8';
    cx.fillRect(Math.round(mx+Math.cos(th)*r),Math.round(my+Math.sin(th)*r*.78),w,w)}
  for(let i=0;i<3;i++){                                    /* vòng sóng tách màu */
    const q=(t*.8+i/3)%1,r=q*260*(.4+E);cx.globalAlpha=E*(1-q)*.8;cx.lineWidth=1.5;
    for(const[o,c]of[[3,'#ff4a6a'],[0,'#ffffff'],[-3,'#3ad0ff']]){
      cx.strokeStyle=c;cx.beginPath();cx.ellipse(mx,my,Math.max(1,r+o),Math.max(1,(r+o)*.78),0,0,6.2832);cx.stroke()}}
  for(let i=0;i<40;i++){                                   /* mảnh vụn bay */
    const h=hs(i,3),a=(h%628)/100,d=((t*(out?-60:80)*(.5+(h>>8)%100/100)+h%300)%300+300)%300;
    cx.globalAlpha=E*.8;cx.fillStyle=i%3?'#dff0ff':'#7aa8ff';
    cx.fillRect(Math.round(mx+Math.cos(a)*d),Math.round(my+Math.sin(a)*d*.78),1+(i%2),1+(i%2))}
  g=cx.createRadialGradient(mx,my,0,mx,my,40*E+8);
  g.addColorStop(0,'rgba(255,255,255,'+E.toFixed(3)+')');g.addColorStop(1,'rgba(120,170,255,0)');
  cx.globalAlpha=1;cx.fillStyle=g;cx.fillRect(0,0,CW,CH);
  cx.globalAlpha=Math.max(0,1-Math.abs(p-.5)/.07)*.9;cx.fillStyle='#fff';cx.fillRect(0,0,CW,CH);
  cx.restore();cx.globalAlpha=1};

/* ================= 7. CÁNH + ANGEL SENTINEL + THIÊN THẦN BẢO HỘ + TIA LỬA ================= */
function feather(ox,oy,ang,len,wd,main,edge){
  const c=Math.cos(ang),s=Math.sin(ang);
  for(let r=2;r<=len;r+=1.2){
    const k=r/len,w=Math.max(1,Math.round(wd*(1-k*k)*(.6+.4*Math.sin(Math.PI*Math.min(1,k*1.6)))));
    R(k>.82?edge:main,ox+c*r-w/2,oy+s*r*.9-w/2,w,w)}}
function eye(ex,ey,t,q){
  R('#b98b78',ex-3,ey-2,6,4);
  if(((t+q*37)%260)<7)R('#d9b8a6',ex-2,ey-1,4,2);
  else{R('#f6f1ea',ex-2,ey-1,4,2);R('#2f9bd6',ex-1,ey-1,2,2);R('#0b1f33',ex,ey,1,1)}}
function wings(x,y,t,sc,pal,eyes,spread){
  const sp=spread||1,E=[];
  for(let pass=0;pass<2;pass++)for(const s of[-1,1])for(let k=0;k<6;k++){
    const ang=-1.5708+s*(.26+k*.5*sp)+Math.sin(t*.05+k+s)*.05,L=(26-k*1.8+(k%2?4:0))*sc;
    for(let f=-2;f<=2;f++){
      const aa=ang+f*.1,Lf=L-Math.abs(f)*2*sc;
      feather(x,y,aa,Lf+(pass?0:1.5),(pass?4:5)*sc*.8,pass?(k%2?pal.main:pal.alt):pal.back,pass?pal.tip:pal.back)}
    if(pass&&eyes&&k%2===0)E.push([x+Math.cos(ang)*L*.6,y+Math.sin(ang)*L*.6*.9,k+s*5])}
  E.forEach(([ex,ey,q])=>eye(Math.round(ex),Math.round(ey),t,q))}
function lab(x,y,t,col){
  cx.save();cx.textAlign='center';cx.font='bold 6px monospace';
  const w=Math.ceil(cx.measureText(t).width)+6,bx=Math.round(x-w/2),by=Math.round(y);
  cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(bx,by,w,9);cx.fillStyle=col;cx.fillRect(bx,by+9,w,1);
  cx.fillStyle='#fff';cx.fillText(t,Math.round(x),by+7);cx.restore()}

window.drawAngelPlus=function(A,open,P){
  const X=Math.round(A.x),by=Math.round(A.y+Math.sin(frame*.05)*2),f=frame,SY=by-36;
  if(X<camX-80||X>camX+CW/IS+80||by<camY-30||by>camY+CH/IS+110)return;
  cx.save();cx.globalCompositeOperation='lighter';
  let g=cx.createRadialGradient(X,SY,6,X,SY,75);g.addColorStop(0,'rgba(255,230,150,.35)');g.addColorStop(1,'rgba(255,230,150,0)');
  cx.fillStyle=g;cx.fillRect(X-75,SY-75,150,150);
  for(let i=0;i<9;i++){const a=-1.5708+(i-4)*.2+Math.sin(f*.02+i)*.03;
    cx.globalAlpha=.07;cx.fillStyle='#fff3b0';cx.beginPath();cx.moveTo(X,SY);
    cx.lineTo(X+Math.cos(a-.03)*95,SY+Math.sin(a-.03)*95);cx.lineTo(X+Math.cos(a+.03)*95,SY+Math.sin(a+.03)*95);cx.closePath();cx.fill()}
  cx.restore();cx.globalAlpha=1;
  /* trận pháp dưới chân + mây đỡ */
  for(let q=0;q<6.28;q+=.2){R(q*5%2<1?'#ffd23f':'#37e8d8',X+Math.cos(q+f*.02)*26,by+4+Math.sin(q+f*.02)*8,2,1)}
  [[-11,-1,22,5],[-7,2,14,4],[-4,5,8,3],[-16,1,8,3],[9,1,8,3]].forEach(([a,b,w,h])=>R('#e4e8ef',X+a,by+b,w,h));
  wings(X,SY,f,1.15,{back:'#c8323c',main:'#f6ead0',alt:'#efdcb8',tip:'#ffd23f'},true,1);
  /* áo choàng cam đen, viền vàng, gấu áo bay */
  for(let j=0;j<20;j++){const w=Math.round(7+j*.35);for(let i=-w;i<w;i+=2)R(((i>>1)&1)?'#e7791e':'#171210',X+i,SY+4+j,2,1)}
  R('#ffd23f',X-8,SY+4,16,1);R('#ffd23f',X-6,SY+23,12,1);R('#ffd23f',X-1,SY+5,2,18);
  for(let i=-6;i<=6;i+=3)R('#ffd23f',X+i,SY+23+((f>>3)+i&1),2,2+(i&1));
  /* vai giáp vàng, tay cầm quả cầu sáng */
  R('#e0a526',X-8,SY-6,16,5);R('#f4c542',X-8,SY-6,16,1);R('#a8741a',X-8,SY-2,16,1);
  R('#f0c040',X-13,SY+3,3,3);R('#f0c040',X+11,SY+3,3,3);
  const og2=Math.sin(f*.08)*2;cx.save();cx.globalCompositeOperation='lighter';
  g=cx.createRadialGradient(X,SY+14+og2,0,X,SY+14+og2,12);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,200,90,0)');
  cx.fillStyle=g;cx.fillRect(X-12,SY+2+og2,24,24);cx.restore();
  R('#fff',X-1,SY+13+og2,3,3);
  /* đầu trùm mũ + một con mắt lớn */
  R('#171210',X-6,SY-16,12,12);R('#2a1f1a',X-5,SY-17,10,2);R('#171210',X-7,SY-13,2,9);R('#171210',X+5,SY-13,2,9);
  R('#e7791e',X-6,SY-5,12,1);eye(X,SY-10,f,1);R('#ff2a2a',X-1,SY-10,1,1);
  /* hào quang 2 vòng + hạt cầu xoay */
  const hr=f*.03;
  for(let a=0;a<6.28;a+=.35)R('#ffd23f',X+Math.cos(a)*10,SY-22+Math.sin(a)*4,2,1);
  for(let a=0;a<6.28;a+=.5)R('#fff3a0',X+Math.cos(a-hr*2)*14,SY-23+Math.sin(a-hr*2)*5.5,1,1);
  for(let a=0;a<6.28;a+=1.57)R('#37e8d8',X+Math.cos(a+hr)*10-1,SY-22+Math.sin(a+hr)*4-1,3,3);
  for(let i=0;i<5;i++){const a=f*.04+i*1.256;cx.globalAlpha=.8;R('#ffd23f',X+Math.cos(a)*34,SY+6+Math.sin(a)*14,2,2)}
  cx.globalAlpha=1;
  for(let i=0;i<5;i++){cx.globalAlpha=.7;R('#ffffff',X+Math.sin(f*.03+i*2)*30,SY-30+((f*.4+i*17)%55),2,1)}
  cx.globalAlpha=1;
  lab(X,by-92,'Angel Sentinel','#ffd23f');
  if(P&&!TK&&Math.hypot(P.x-A.x,P.y-(A.y-4))<36){
    const b=(f>>4)&1,y0=by-104+b;R('#000',X-4,y0-1,9,1);
    for(let i=0;i<4;i++){const w=7-2*i;R('#000',X-(w>>1)-1,y0+i,w+2,1);R('#ffd23f',X-(w>>1),y0+i,w,1)}}};

/* Thiên thần bảo hộ khi bấm E (a.lvl = hiệu ứng lên cấp, to hơn) */
window.drawGuardianPlus=function(P,a){
  const k=a.t/a.d,al=k<.15?k/.15:k>.7?Math.max(0,(1-k)/.3):1,sc=a.lvl?1.3:1,t=frame,x=Math.round(P.x),y=Math.round(P.y-10);
  cx.save();
  cx.globalAlpha=.75*al;                                   /* vòng rune dưới chân */
  for(let q=0;q<6.28;q+=.26){const c=q*4%2<1?'#ffd23f':'#7cfff0';R(c,x+Math.cos(q+t*.03)*20*sc,P.y+Math.sin(q+t*.03)*8*sc,2,1)}
  for(let q=0;q<6.28;q+=.5)R('#fff3a0',x+Math.cos(q-t*.05)*13*sc,P.y+Math.sin(q-t*.05)*5*sc,1,1);
  cx.globalCompositeOperation='lighter';                   /* cột sáng + bóng thiên thần */
  let g=cx.createLinearGradient(0,y-72*sc,0,y+8);
  g.addColorStop(0,'rgba(255,240,180,0)');g.addColorStop(.5,'rgba(255,240,180,'+(.28*al).toFixed(3)+')');g.addColorStop(1,'rgba(255,240,180,0)');
  cx.fillStyle=g;cx.globalAlpha=1;cx.fillRect(x-10*sc,y-72*sc,20*sc,80*sc);
  for(let j=0;j<40;j++){const w=Math.round((5+j*.3)*sc);cx.globalAlpha=.1*al;cx.fillStyle='#ffe9a8';cx.fillRect(x-w,Math.round(y-36*sc+j*sc),w*2,Math.ceil(sc))}
  cx.restore();cx.globalAlpha=al;
  wings(x,y,t,.85*sc,{back:'#e0a526',main:'#ffffff',alt:'#e6eefb',tip:'#ffe9a8'},false,.75+.25*al);
  for(let q=0;q<6.28;q+=.4)R('#ffd23f',x+Math.cos(q+t*.05)*9*sc,y-34*sc+Math.sin(q+t*.05)*3.5*sc,2,1);   /* vầng hào quang */
  for(let q=0;q<6.28;q+=1.57)R('#7cfff0',x+Math.cos(q-t*.05)*9*sc-1,y-34*sc+Math.sin(q-t*.05)*3.5*sc-1,3,3);
  for(let i=0;i<10;i++){cx.globalAlpha=.8*al;R('#ffffff',x+Math.sin(i*2.1+t*.03)*26*sc,y-30+((t*.7+i*11)%50),2,1)}   /* lông rơi */
  cx.globalAlpha=1;
  if(a.lvl)for(let r=0;r<3;r++){
    const q=(a.t*1.1+r/3)%1,yy=y-q*62*sc,rad=17*sc-q*6;cx.globalAlpha=(1-q)*al;
    for(let g2=0;g2<6.28;g2+=.3)R(r%2?'#7cfff0':'#ffd23f',x+Math.cos(g2+q*6)*rad,yy+Math.sin(g2+q*6)*rad*.35,2,1)}
  cx.globalAlpha=1};

/* Tia lửa xanh đỏ: 2 sợi xoắn + quả cầu lửa + tia sao */
window.drawBeamPlus=function(b){
  const tr=b.tr,n=tr.length;if(n<2)return;
  const l=Math.hypot(b.vx,b.vy)||1,nx=-b.vy/l,ny=b.vx/l,t=frame;
  cx.save();cx.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){
    const p=tr[i],u=(i+1)/n,w=Math.sin(t*.55+i*.85)*(1.5+u*3),s=u>.6?2:1;
    cx.globalAlpha=u*.35;cx.fillStyle=i%2?'#ff5a2a':'#3b8fff';cx.fillRect(Math.round(p.x-3*u),Math.round(p.y-3*u),Math.ceil(6*u),Math.ceil(6*u));
    cx.globalAlpha=u*.95;
    cx.fillStyle='#ff3b2a';cx.fillRect(Math.round(p.x+nx*w),Math.round(p.y+ny*w),s,s);
    cx.fillStyle='#4ac8ff';cx.fillRect(Math.round(p.x-nx*w),Math.round(p.y-ny*w),s,s);
    if(i%3===0){const h=hs(i*3+(t>>1),7);cx.globalAlpha=u*.8;cx.fillStyle=h&1?'#ffd23f':'#cfeaff';
      cx.fillRect(Math.round(p.x+((h>>3)%9)-4),Math.round(p.y+((h>>6)%9)-4),1,1)}}
  const g=cx.createRadialGradient(b.x,b.y,0,b.x,b.y,12);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,210,120,.85)');g.addColorStop(.6,'rgba(255,60,40,.45)');g.addColorStop(1,'rgba(40,150,255,0)');
  cx.globalAlpha=1;cx.fillStyle=g;cx.fillRect(Math.round(b.x)-12,Math.round(b.y)-12,24,24);
  cx.globalAlpha=.7;cx.fillStyle='#fff';
  cx.fillRect(Math.round(b.x)-8,Math.round(b.y),17,1);cx.fillRect(Math.round(b.x),Math.round(b.y)-8,1,17);
  cx.fillRect(Math.round(b.x)-1,Math.round(b.y)-1,3,3);
  const a=t*.6;cx.globalAlpha=1;
  cx.fillStyle='#ff3b2a';cx.fillRect(Math.round(b.x+Math.cos(a)*5)-1,Math.round(b.y+Math.sin(a)*5)-1,3,3);
  cx.fillStyle='#4ac8ff';cx.fillRect(Math.round(b.x-Math.cos(a)*5)-1,Math.round(b.y-Math.sin(a)*5)-1,3,3);
  cx.restore()};

/* ================= 8. ABYSS 2: phong ấn -> diệt quái -> xác gộp thành BOSS -> nấm con ================= */
let sealApplied=false,CORP=[],BOSS=null,BABY=null,HOLE=null,SPO=[],FR=[],FXP=[];
const KC={human:['#44606a','#8fa89a','#46e0d0'],snake:['#4f7a52','#7aaa7a','#b07cff'],spider:['#34264a','#4a3a66','#a070ff']};
const CC=[[85,14],[45,36],[125,36],[85,56],[35,76],[135,76],[85,86]].map(([x,y])=>[Math.round(x*1.5),Math.round(y*1.5)]);
function resetA2(){
  if(sealApplied)try{setPortal(false)}catch(_){}
  window.A2S={sealed:0,phase:0};sealApplied=false;CORP=[];BOSS=null;BABY=null;HOLE=null;SPO=[];FR=[];FXP=[];CUT=null}
function setPortal(block){
  const F=FL[WID2];if(!F)return;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){F.im[PTY+j][PTX+i]=block?WALL:0;F.rid[PTY+j][PTX+i]=block?0:1}}
function snapT(px,py){
  const im=FL[WID2].im,tx=Math.floor(px/T),ty=Math.floor(py/T);
  for(let r=0;r<10;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){
    const X=tx+i,Y=ty+j;
    if(im[Y]&&im[Y][X]===0&&[[1,0],[-1,0],[0,1],[0,-1]].every(([a,b])=>im[Y+b]&&im[Y+b][X+a]===0))return[X*T+4,Y*T+4]}
  return[px,py]}
function bfsA(sx,sy,tx,ty){
  const im=FL[WID2].im,W2=im[0].length,H2=im.length,pr=new Int32Array(W2*H2).fill(-1),s0=sy*W2+sx,q=[s0];pr[s0]=s0;
  for(let i=0;i<q.length;i++){const c=q[i],x=c%W2,y=(c/W2)|0;if(x===tx&&y===ty)break;
    for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<0||Y<0||X>=W2||Y>=H2)continue;const k=Y*W2+X;if(pr[k]>=0||im[Y][X]!==0)continue;pr[k]=c;q.push(k)}}
  const e=ty*W2+tx;if(pr[e]<0)return null;const o=[];for(let c=e;c!==pr[c];c=pr[c])o.push([(c%W2)*T+4,((c/W2)|0)*T+4]);return o.reverse()}
const pls2=()=>ins.filter(p=>p.pl&&p.fl===WID2);
function puff(x,y,n,cols,sp,up){for(let i=0;i<n;i++)FXP.push({x,y,vx:(Math.random()-.5)*sp,vy:-(Math.random()*up),l:30+rnd(40),c:cols[rnd(cols.length)],s:1+rnd(2)})}

window.onMonKilled=function(mo){if(mo.k==='boss'){bossDead(mo);return}CORP.push({x:mo.x,y:mo.y,k:mo.k})};

function startCut(){
  window.A2S.phase=2;
  const last=CORP.length?CORP[CORP.length-1]:{x:CC[6][0]*T,y:CC[6][1]*T},c=snapT(last.x,last.y);
  CUT={t:0,d:7,cx:c[0],cy:c[1]};FR=[];
  (CORP.length?CORP:[{x:c[0],y:c[1],k:'human'}]).forEach(co=>{
    for(let i=0;i<9;i++)FR.push({x:co.x+rnd(13)-6,y:co.y-rnd(10),k:co.k,ph:Math.random()*6.28,sz:1+rnd(3),dl:Math.random()*1.2,ci:rnd(3)})});
  cap('Xác của bầy quái nổi lên, những mảnh nấm độc đang gộp lại với nhau...')}
function tickCut(dt){
  CUT.t+=dt;
  if(frame%3===0){const f=FR[rnd(FR.length)];if(f){const p=fragPos(f);FXP.push({x:p[0],y:p[1],vx:0,vy:0,l:14,c:KC[f.k]?KC[f.k][2]:'#fff',s:1})}}
  if(CUT.t>=CUT.d){
    const b={k:'boss',x:CUT.cx,y:CUT.cy,hx:CUT.cx,hy:CUT.cy,st:'idle',t:0,dir:1,path:[],rt:0,lost:0,stun:1.2,slow:0,wait:1,wt:null,tgt:null,moving:0,rage:60,hp:400,mhp:400,cd:4,cast:0};
    window.MONS().push(b);BOSS=b;window.A2S.phase=3;
    puff(CUT.cx,CUT.cy-20,70,['#b07cff','#7cfff0','#ffffff','#6a3fc0'],4,3);
    flash=20;shake=Math.max(shake,18);FR=[];CUT=null;
    cap('BOSS QUÁI NẤM (400 HP) xuất hiện! Né bào tử độc và tấn công nó!')}}
function fragPos(f){
  const u=clamp((CUT.t-f.dl)/(CUT.d-1.6-f.dl),0,1),e=u*u*(3-2*u),
    bx=f.x+(CUT.cx-f.x)*e,by=f.y+(CUT.cy-12-f.y)*e,sw=(1-e)*e*34,a=f.ph+CUT.t*5;
  return[bx+Math.cos(a)*sw,by+Math.sin(a)*sw*.6-Math.sin(Math.PI*e)*16,u]}
function volley(b){
  const a0=Math.random()*6.28;
  for(let i=0;i<14;i++){const a=a0+i*6.2832/14;SPO.push({x:b.x,y:b.y-20,vx:Math.cos(a)*1.15,vy:Math.sin(a)*1.15,l:130})}
  pls2().forEach(p=>{const a=Math.atan2(p.y-8-(b.y-20),p.x-b.x);for(let k=-1;k<=1;k++)SPO.push({x:b.x,y:b.y-20,vx:Math.cos(a+k*.16)*1.6,vy:Math.sin(a+k*.16)*1.6,l:110})});
  puff(b.x,b.y-34,30,['#b07cff','#7cfff0'],3,2);shake=Math.max(shake,6);cap('Quái nấm phun bào tử độc!')}
function tickBoss(dt){
  const b=BOSS;if(!b||!window.MONS().includes(b))return;
  b.rage=Math.max(b.rage||0,6);
  if(b.cast>0){b.cast-=dt;if(b.cast<=0){b.cast=0;volley(b);b.cd=5+Math.random()*2}}
  else{b.cd-=dt;if(b.cd<=0&&b.st==='chase'&&b.stun<=0){b.cast=.8;b.stun=.8}}
  if(frame%6===0)puff(b.x+rnd(30)-15,b.y-42,1,['#b07cff','#7cfff0'],1,1.2)}
function tickSpores(dt){
  const im=FL[WID2]&&FL[WID2].im;
  SPO.forEach(s=>{
    s.x+=s.vx;s.y+=s.vy;s.l--;
    if(im&&(im[Math.floor(s.y/T)]||[])[Math.floor(s.x/T)]!==0)s.l=0;
    pls2().forEach(p=>{if(s.l>0&&Math.hypot(p.x-s.x,p.y-8-s.y)<6){s.l=0;killPlayer(p.pl)}})});
  SPO=SPO.filter(s=>s.l>0)}
function bossDead(mo){
  const S=window.A2S;S.phase=4;BOSS=null;
  puff(mo.x,mo.y-20,90,['#b07cff','#7cfff0','#ffffff','#34264a'],5,4);flash=24;shake=Math.max(shake,20);
  S.sealed=0;sealApplied=false;setPortal(false);
  const t0=[Math.floor(mo.x/T),Math.floor(mo.y/T)];
  let far=CC[0],fd=-1;CC.forEach(c=>{const d=Math.hypot(c[0]-t0[0],c[1]-t0[1]);if(d>fd){fd=d;far=c}});
  const im=FL[WID2].im;let hole=null;
  for(let r=0;r<16&&!hole;r++)for(let j=-r;j<=r&&!hole;j++)for(let i=-r;i<=r;i++){
    const X=far[0]+i,Y=far[1]+j;
    if(im[Y]&&im[Y][X]===0&&im[Y-1]&&im[Y-1][X]!==0&&im[Y+1][X]===0){hole={x:X,y:Y};break}}
  HOLE=hole||{x:far[0],y:far[1]};
  const st=snapT(mo.x,mo.y),path=bfsA(Math.floor(st[0]/T),Math.floor(st[1]/T),HOLE.x,HOLE.y);
  BABY={x:mo.x,y:mo.y,st:path?'run':'gone',path:path||[],t:0,dir:1};
  cap('Boss nấm gục ngã! Từ xác nó, một con nấm nhỏ chạy vụt ra... Cổng ánh sáng đã mở lại.')}
function tickBaby(dt){
  const B=BABY;if(!B)return;
  if(B.st==='run'){
    if(!B.path.length){B.st='enter';B.t=0;return}
    const g=B.path[0],dx=g[0]-B.x,dy=g[1]-B.y,d=Math.hypot(dx,dy),sp=1.9;
    if(Math.abs(dx)>.3)B.dir=dx>0?1:-1;
    if(d<=sp){B.x=g[0];B.y=g[1];B.path.shift()}else{B.x+=dx/d*sp;B.y+=dy/d*sp}
    if(frame%3===0)puff(B.x,B.y-3,1,['#b07cff','#7cfff0'],.6,.5)}
  else if(B.st==='enter'){
    B.t+=dt;
    if(B.t>=.8){B.st='gone';puff(HOLE.x*T+4,HOLE.y*T,14,['#b07cff','#7cfff0'],2,2);cap('Con nấm nhỏ chui tọt vào hang trốn mất. Tạm thời chưa thể tiêu diệt nó...')}}}
function a2tick(){
  const S=window.A2S,dt=Math.min(.25,DM||.016);
  FXP.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=.01;q.l--});FXP=FXP.filter(q=>q.l>0);
  tickSpores(dt);tickBaby(dt);
  if(!S||!S.sealed)return;
  if(!sealApplied){sealApplied=true;setPortal(true);shake=Math.max(shake,10);flash=10}
  if(S.phase===1&&window.MONS&&window.MONS().length===0&&!CUT&&pls2().length)startCut();
  if(CUT)tickCut(dt);
  if(S.phase===3)tickBoss(dt)}

/* ---- vẽ boss nấm (Abyss2.drawMon gọi window.drawBossPlus) ---- */
function bossBody(x,y,sc,mo,al){
  cx.save();cx.translate(Math.round(x),Math.round(y));cx.scale(sc,sc);
  const t=frame,mv=mo&&mo.moving,wb=mv?Math.sin(t*.25):Math.sin(t*.06)*.4,
    ag=mo&&(mo.st==='chase'||mo.st==='bite'||mo.st==='alert'),cast=mo&&mo.cast>0,
    Q=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(a,b,w,h)};
  cx.globalAlpha=al===undefined?1:al;
  Q('rgba(0,0,0,.35)',-22,-2,44,5);
  cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha*=.12+.05*Math.sin(t*.07)+(cast?.18:0);
  Q(cast?'#ff6ad0':'#a070ff',-34,-62,68,64);cx.restore();
  for(let i=0;i<4;i++){const lx=-14+i*9,ph=Math.sin(t*.25+i*1.6)*(mv?2:.4);Q('#3a2a55',lx,-6+ph,4,6);Q('#5a3a86',lx,-6+ph,4,1)}
  for(let j=0;j<24;j++){const hw=Math.round(8+Math.sin(j*.3)+(j>16?(j-16)*.7:0)),y0=-4-j;
    Q('#9db8d4',-hw,y0,hw*2,1);Q('#cfe6f0',-hw+2,y0,Math.max(1,hw-3),1);Q('#5a7a96',hw-3,y0,3,1);Q('#3a4f66',hw-1,y0,1,1)}
  Q('#46e0d0',-5,-20,2,2);Q('#46e0d0',4,-14,2,2);Q('#b07cff',-3,-9,2,2);
  const ec=ag||cast?'#ff3b3b':'#7cfff0';
  Q(ec,-6,-17,4,3);Q(ec,3,-17,4,3);Q('#fff',-5,-17,1,1);Q('#fff',4,-17,1,1);
  Q('#2a0f2a',-6,-10,12,4);for(let i=-5;i<5;i+=3)Q('#f4f4f4',i,-10,2,2);
  const s=cast?1.08:1,cy0=-26+wb;
  for(let j=0;j<18;j++){
    const hw=Math.round(30*s*Math.sqrt(1-Math.pow(j/18,2))),y0=cy0-j;
    Q(j<2?'#34264a':j<6?'#6a3fc0':'#8a63e0',-hw,y0,hw*2,1);
    if(j<3){for(let g=-hw+2;g<hw;g+=4)Q('#c8a8ff',g,y0,1,1)}
    Q('#34264a',-hw,y0,2,1);Q('#34264a',hw-2,y0,2,1)}
  Q('#b9a0ff',-18,cy0-16,10,1);
  [[-16,-12,4],[6,-15,5],[17,-8,3],[-4,-6,3],[-23,-5,3]].forEach(([a,b,r],i)=>{
    const pl=.5+.5*Math.sin(t*.1+i*1.3);
    Q('#2a1650',a-r,cy0+b-r,r*2,r*2);Q(pl>.5?'#7cfff0':'#e8d8ff',a-r+1,cy0+b-r+1,r*2-2,r*2-2);Q('#fff',a-r+1,cy0+b-r+1,1,1)});
  for(let k=0;k<5;k++){const a=k*2.1;Q('#46e0d0',Math.round(Math.cos(a)*18),Math.round(cy0-6+Math.sin(a)*4-k*2),1,3)}
  for(const sd of[-1,1]){
    for(let i=1;i<=6;i++){
      const ax=sd*(8+i*4),ay=-18+Math.sin(t*.12+i*.7+sd)*3*(ag?2:1)+i*i*.4;
      Q('#5a3a86',ax-2,ay-2,4,4);Q('#8a63e0',ax-2,ay-2,4,1)}
    const ex=sd*34,ey=-18+Math.sin(t*.12+4.2+sd)*3*(ag?2:1)+14;
    Q('#e8e0cc',ex-1,ey,2,5);Q('#e8e0cc',ex+(sd>0?2:-3),ey+1,1,4)}
  cx.restore()}
window.drawBossPlus=function(mo){
  bossBody(mo.x,mo.y,1,mo);
  if(mo.cast>0){
    cx.save();cx.globalCompositeOperation='lighter';
    const r=40*(1-mo.cast/.8)+8;cx.strokeStyle='#ff6ad0';cx.lineWidth=2;cx.globalAlpha=.8;
    cx.beginPath();cx.ellipse(Math.round(mo.x),Math.round(mo.y-22),r,r*.7,0,0,6.2832);cx.stroke();cx.restore()}};

/* ---- vẽ phụ trợ Abyss2 (phong ấn, xác gộp lại, bào tử, hố, nấm con) ---- */
function drawSeal(){
  const x=PTX*T+4,y=PTY*T+4,t=frame;
  [[-11,2,8,7],[-4,-6,9,9],[4,1,8,7],[-9,-9,7,6],[2,-11,7,6],[-3,3,7,6]].forEach(([a,b,w,h])=>{
    R('#2c475c',x+a,y+b,w,h);R('#4f6f88',x+a,y+b,w-1,h-1);R('#7a9ab0',x+a,y+b,w-2,1)});
  cx.globalAlpha=.5+.4*Math.sin(t*.1);
  R('#ff3b2a',x-5,y-8,1,10);R('#ff3b2a',x-4,y-1,5,1);R('#ff3b2a',x+1,y-1,1,8);R('#ff8a3d',x+4,y-6,1,6);
  cx.globalAlpha=.6;
  for(let q=0;q<6.28;q+=.3)R('#b07cff',x+Math.cos(q+t*.02)*16,y+Math.sin(q+t*.02)*9,2,1);
  cx.globalAlpha=1}
function drawHole(){
  if(!HOLE)return;
  const x=HOLE.x*T+4,y=HOLE.y*T+8;
  R('#05020a',x-8,y-5,16,9);R('#0a0612',x-6,y-7,12,3);R('#4f6f88',x-9,y-6,3,4);R('#4f6f88',x+7,y-6,3,4);R('#2c475c',x-8,y+3,16,2);
  R('#3a6a3a',x-9,y-7,2,2);R('#3a6a3a',x+8,y-7,2,2);
  const gone=BABY&&BABY.st==='gone';
  if(gone&&(frame%520)<60){cx.globalAlpha=.9;R('#7cfff0',x-4,y-3,2,2);R('#7cfff0',x+2,y-3,2,2);cx.globalAlpha=1}}
function drawBaby(B){
  if(B.st==='gone')return;
  const s=B.st==='enter'?Math.max(0,1-B.t/.8):1;if(s<=0)return;
  cx.save();cx.translate(Math.round(B.x),Math.round(B.y));cx.scale(s,s);
  const Q=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(a,b,w,h)},ph=Math.sin(frame*.5);
  Q('rgba(0,0,0,.3)',-5,-1,10,2);Q('#3a2a55',-3,-3+ph,2,3);Q('#3a2a55',1,-3-ph,2,3);
  Q('#cfe6f0',-2,-8,4,6);Q('#9db8d4',1,-8,1,6);
  for(let j=0;j<5;j++){const hw=Math.round(6*Math.sqrt(1-Math.pow(j/5,2)));Q(j<2?'#6a3fc0':'#a070ff',-hw,-9-j,hw*2,1)}
  Q('#7cfff0',-3,-11,2,2);Q('#e8d8ff',2,-12,1,1);Q('#ff3b3b',-1,-7,1,1);Q('#ff3b3b',1,-7,1,1);
  cx.restore()}
function a2draw(){
  const S=window.A2S;
  if(S.sealed)drawSeal();
  drawHole();
  if(CUT){
    const g=clamp((CUT.t-2.5)/(CUT.d-2.5),0,1);
    cx.save();cx.globalCompositeOperation='lighter';
    const r=20+60*g,gr=cx.createRadialGradient(CUT.cx,CUT.cy-14,2,CUT.cx,CUT.cy-14,r);
    gr.addColorStop(0,'rgba(190,130,255,'+(.15+.4*g).toFixed(3)+')');gr.addColorStop(1,'rgba(190,130,255,0)');
    cx.fillStyle=gr;cx.fillRect(CUT.cx-r,CUT.cy-14-r,r*2,r*2);cx.restore();
    if(g>0)bossBody(CUT.cx,CUT.cy,.4+.6*g,null,.15+.6*g);
    FR.forEach(f=>{const p=fragPos(f),c=KC[f.k]||KC.human;
      cx.globalAlpha=.9;R(c[f.ci],p[0],p[1],f.sz,f.sz);cx.globalAlpha=.35;R(c[2],p[0]-1,p[1]-1,f.sz+2,f.sz+2)});
    cx.globalAlpha=1}
  SPO.forEach(s=>{
    cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=.4;R('#b07cff',s.x-3,s.y-3,6,6);cx.restore();
    R('#7cfff0',s.x-1,s.y-1,3,3);R('#fff',s.x,s.y,1,1)});
  if(BABY)drawBaby(BABY);
  FXP.forEach(q=>{cx.globalAlpha=clamp(q.l/15,0,1);R(q.c,q.x,q.y,q.s,q.s)});cx.globalAlpha=1}
const _drawIn=drawIn;
drawIn=function(){_drawIn();if(curF===WID2){try{a2draw()}catch(e){console.error('Plus a2draw',e)}}};

/* ================= 9. MÓC VÀO VÒNG ĐỜI GAME ================= */
const _step=step;
step=function(){_step();trackFace();try{a2tick()}catch(e){console.error('Plus a2tick',e)}};
const _gen=gen;gen=function(sd){_gen(sd);expand();resetA2()};
const _mk=mkPeople;mkPeople=function(){_mk();resetA2()};
reset();   /* tạo lại thế giới một lần để bản đồ đầu tiên đã có đảo mở rộng */
})();