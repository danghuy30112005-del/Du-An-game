/* ===== ghostplus.js: OAN HỒN MẠNH HƠN =====
   Nạp SAU deadisland.js (đặt cuối cùng, sau witch.js cũng được). Không cần sửa deadisland.js.
   - Oan hồn đi / đuổi / chém nhanh hơn trước.
   - Thạch nhũ rơi: hiện vòng đỏ trên sàn ~0,9 giây rồi thạch nhũ rơi xuống, ai đứng trong vòng sẽ chết.
   - Tường đá tạm: dựng 2 lớp x 7 ô chắn phía trước người chơi (có khung tím báo trước), tan sau vài giây.
   - Triệu hồi 1-3 hồn ma tạm thời: đuổi và chém như oan hồn thật, biến mất sau ~11 giây.
   Chỉnh mọi thông số trong bảng C bên dưới. */
(()=>{
if(typeof ghostTick!=='function'||typeof ghostDraw!=='function'||typeof FL==='undefined'){console.warn('ghostplus.js: hãy nạp SAU deadisland.js');return}

/* ---------- Thông số (px mỗi khung hình ở 60fps, thời gian tính bằng giây) ---------- */
const C={
  patrol:.75,      /* đi tuần (gốc .45) */
  chase:1.8,       /* đuổi (gốc 1.4; người đi bộ 1.25, chạy Q 2.1) */
  mini:4.6,        /* hồn ma triệu hồi */
  slow:.8,         /* tốc độ khi bị choáng sau chém hụt (gốc .5) */
  slowT:.6,        /* thời gian choáng (gốc 1) */
  laugh:.8,        /* thời gian cười trước khi đuổi (gốc 1.5) */
  wind:.3,         /* thời gian vung liềm (gốc .45) */
  reach:24,        /* tầm chém */
  sight:120,       /* tầm nhìn thấy người */
  cdS:6, cdW:10, cdM:18, gcd:1.8,       /* hồi chiêu: thạch nhũ / tường / triệu hồi / chung */
  castS:.5, castW:.7, castM:.9,         /* thời gian niệm chú */
  warn:.9, fall:.22,                    /* thạch nhũ: báo trước / rơi */
  wallLife:6, wallHalf:3,               /* tường đá: sống bao lâu, nửa chiều dài (ô) */
  minLife:5,
  parryStun:2   /* choáng (đứng yên) khi bị đỡ đòn, giây */
};
let MIN=[],ROCKS=[],WALLS=[],PLAN=null,FX=[];
const pls=()=>ins.filter(p=>p.pl&&p.fl===6);
const tc=v=>Math.floor(v/T);
const floorAt=(x,y)=>((FL[6].im[tc(y)]||[])[tc(x)])===0;
function nearest(G,A){let P=null,d=1e9;A.forEach(p=>{const q=Math.hypot(p.x-G.x,p.y-G.y);if(q<d){d=q;P=p}});return[P,d]}
function restoreBatch(b){if(b.F!==FL[6])return;b.tiles.forEach(([x,y])=>{if(b.F.im[y][x]===1)b.F.im[y][x]=0})}
function clearAll(){WALLS.forEach(restoreBatch);WALLS=[];MIN=[];ROCKS=[];PLAN=null;FX=[]}
function dust(x,y,n,cols){for(let i=0;i<n;i++)FX.push({x,y,vx:(Math.random()-.5)*1.6,vy:-Math.random()*1.2,l:20+rnd(20),c:cols[rnd(cols.length)]})}

/* ---------- Chiêu 1: thạch nhũ ---------- */
function spawnRocks(G,P){
  let any=0;
  pls().forEach(p=>{
    if(Math.hypot(p.x-G.x,p.y-G.y)>170)return;
    const n=p===P?ri(3,5):2;
    for(let i=0;i<n;i++){
      const x=i?p.x+ri(-30,30):p.x,y=i?p.y+ri(-22,22):p.y;
      if(floorAt(x,y)){ROCKS.push({x,y,t:-i*.1,hit:0,dd:0});any=1}}});
  if(any)cap('Trần hang rung chuyển, thạch nhũ sắp rơi! Chạy ra khỏi vòng đỏ!')}
function tickRocks(dt){
  ROCKS.forEach(r=>{
    r.t+=dt;
    if(!r.hit&&r.t>=C.warn+C.fall){
      r.hit=1;
      pls().forEach(p=>{if(Math.hypot(p.x-r.x,p.y-r.y)<11)killPlayer(p.pl)})}});
  ROCKS=ROCKS.filter(r=>r.t<C.warn+C.fall+.7)}

/* ---------- Chiêu 2: tường đá tạm thời ---------- */
function planWall(G,P){
  const dx=P.x-G.x,dy=P.y-G.y,hor=Math.abs(dx)>=Math.abs(dy),ux=dx>=0?1:-1,uy=dy>=0?1:-1,
    cxT=tc(P.x+(hor?ux*46:0)),cyT=tc(P.y+(hor?0:uy*46)),M=FL[6].im,out=[];
  for(let s=-C.wallHalf;s<=C.wallHalf;s++)for(let k=0;k<2;k++){
    const x=hor?cxT+ux*k:cxT+s,y=hor?cyT+s:cyT+uy*k;
    if((M[y]||[])[x]===0)out.push([x,y])}
  return out}
function placeWall(){
  if(!PLAN)return;
  const M=FL[6].im,ents=pls().concat(GH?[GH]:[],MIN),ok=[];
  PLAN.tiles.forEach(([x,y])=>{
    if(M[y][x]!==0)return;
    const X=x*T+4,Y=y*T+4;
    if(ents.some(e=>Math.hypot(e.x-X,e.y-Y)<11))return;
    M[y][x]=1;ok.push([x,y]);dust(X,Y,2,['#8a8f9c','#5a5f6c','#a070ff'])});
  PLAN=null;
  if(ok.length){WALLS.push({F:FL[6],tiles:ok,t:0,life:C.wallLife});cap('Oan hồn dựng một bức tường đá chặn đường!')}}
function tickWalls(dt){
  WALLS.forEach(b=>{b.t+=dt;if(b.t>=b.life){b.tiles.forEach(([x,y])=>dust(x*T+4,y*T+4,2,['#8a8f9c','#5a5f6c']));restoreBatch(b);b.done=1}});
  WALLS=WALLS.filter(b=>!b.done)}

/* ---------- Chiêu 3: triệu hồi hồn ma tạm thời ---------- */
function summon(G){
  const n=ri(1,3);let made=0;
  for(let i=0;i<n;i++)for(let k=0;k<30;k++){
    const x=G.x+ri(-32,32),y=G.y+ri(-24,24);
    if(floorAt(x,y)){MIN.push({x,y,path:[],st:'chase',dir:G.dir||1,t:0,lost:0,rt:0,slow:0,spawn:.7,life:C.minLife+Math.random()*2,tgt:null,mini:1});dust(x,y-10,4,['#c9a8ff','#7cfff0']);made++;break}}
  if(made)cap('Oan hồn triệu hồi '+made+' hồn ma! Chúng sẽ biến mất sau một lúc.')}
function chaseMove(g,P,sp){
  if(los(g,P))gmove(g,P.x,P.y,sp);
  else{
    if(--g.rt<=0||!g.path.length){g.rt=10;const a=bfs(6,tc(g.x),tc(g.y),tc(P.x),tc(P.y));g.path=a||[]}
    if(g.path.length&&gmove(g,g.path[0][0],g.path[0][1],sp))g.path.shift()}}
function tickMinions(dt){
  MIN.forEach(m=>{
    m.life-=dt;
    if(m.spawn>0){m.spawn-=dt;return}
    if(m.stun>0){m.stun=Math.max(0,m.stun-dt);m.slow=m.stun;return}
    const A=pls();if(!A.length)return;
    const[P,d]=nearest(m,A);
    if(m.slow>0)m.slow=Math.max(0,m.slow-dt);
    if(m.st==='slash'){
      m.t+=dt;
      const V=A.find(p=>m.tgt&&p.pl===m.tgt.pl);
      if(V)m.dir=V.x>=m.x?1:-1;
      if(m.t>=C.wind){
        m.st='chase';m.path=[];m.rt=0;
        if(V&&Math.hypot(V.x-m.x,V.y-m.y)<C.reach){
          if(window.parryHit&&window.parryHit(V,m)){m.stun=C.parryStun;m.slow=C.parryStun}
          else killPlayer(V.pl)}
        else m.slow=C.slowT}
      return}
    if(d<10){m.st='slash';m.t=0;m.tgt=P;return}
    chaseMove(m,P,m.slow>0?C.slow:C.mini)});
  MIN=MIN.filter(m=>{if(m.life>0)return true;dust(m.x,m.y-10,5,['#c9a8ff','#e8f0ff']);return false})}

/* ---------- Niệm chú ---------- */
function tryCast(G,P,d,dt){
  if(Math.random()>dt*2.5)return;
  const a=G.ab,o=[];
  if(a.m<=0&&MIN.length===0&&d>28)o.push('m');
  if(a.w<=0&&d>30&&d<150)o.push('w');
  if(a.s<=0&&d<170)o.push('s');
  if(!o.length)return;
  const k=o[rnd(o.length)];
  if(k==='w'){
    PLAN={tiles:planWall(G,P)};
    if(PLAN.tiles.length<3){PLAN=null;a.w=2;return}}
  G.ca=k;G.cast=k==='s'?C.castS:k==='w'?C.castW:C.castM}
function finishCast(G){
  const k=G.ca,P=nearest(G,pls())[0];
  G.ca=null;G.ab.g=C.gcd;
  if(!P){PLAN=null;return}
  if(k==='s'){spawnRocks(G,P);G.ab.s=C.cdS+Math.random()*2}
  else if(k==='w'){placeWall();G.ab.w=C.cdW+Math.random()*3}
  else if(k==='m'){summon(G);G.ab.m=C.cdM+Math.random()*4}}

/* ---------- Vòng lặp chính của oan hồn (thay bản gốc) ---------- */
ghostTick=function(){
  if(!GH){if(MIN.length||ROCKS.length||WALLS.length||PLAN)clearAll();return}
  const G=GH;
  if(!pls().length)return;
  const dt=Math.min(DM,.1);
  if(!G.ab)G.ab={s:4,w:8,m:12,g:2};
  tickRocks(dt);tickWalls(dt);tickMinions(dt);
  const A=pls();if(!A.length)return;
  const[P,d]=nearest(G,A);
  if(G.stun>0){G.stun=Math.max(0,G.stun-dt);G.slow=G.stun;return}
  if(G.slow>0)G.slow=Math.max(0,G.slow-dt);

  const see=d<C.sight&&los(G,P);

  if(G.st==='patrol'){
    if(see){G.st='laugh';G.t=0;G.tgt=P;G.path=[];cap('Oan hồn đã nhìn thấy bạn... nó đang cười!');return}
    if(G.wait>0){G.wait-=dt;return}
    if(!G.path.length){
      const w=CHB[rnd(CHB.length)],a=bfs(6,tc(G.x),tc(G.y),w[0],w[1]);
      if(a&&a.length)G.path=a;else{G.wait=1;return}}
    if(gmove(G,G.path[0][0],G.path[0][1],C.patrol))G.path.shift();
    if(!G.path.length)G.wait=.8+Math.random()*1.8}

  else if(G.st==='laugh'){
    G.t+=dt;G.dir=P.x>=G.x?1:-1;
    if(G.t>=C.laugh){G.st='chase';G.rt=0;G.lost=0;G.path=[];G.ab.g=1.2;cap('Oan hồn đuổi theo bạn! Chạy đi!')}}

  else if(G.st==='chase'){
    if(G.cast>0){                       /* đang niệm chú: đứng yên */
      G.cast-=dt;G.dir=P.x>=G.x?1:-1;
      if(G.cast<=0){G.cast=0;finishCast(G)}
      return}
    if(see||d<140)G.lost=0;else G.lost+=dt;
    if(G.lost>3.5){G.st='patrol';G.wait=1;G.path=[];PLAN=null;return}
    if(d<10){G.st='slash';G.t=0;G.tgt=P;return}
    const a=G.ab;a.s=Math.max(0,a.s-dt);a.w=Math.max(0,a.w-dt);a.m=Math.max(0,a.m-dt);a.g=Math.max(0,a.g-dt);
    if(see&&a.g<=0)tryCast(G,P,d,dt);
    if(G.cast>0)return;
    chaseMove(G,P,G.slow>0?C.slow:C.chase)}

  else if(G.st==='slash'){
    G.t+=dt;
    const V=A.find(p=>G.tgt&&p.pl===G.tgt.pl);
    if(V)G.dir=V.x>=G.x?1:-1;
    if(G.t>=C.wind){      if(V&&Math.hypot(V.x-G.x,V.y-G.y)<C.reach){
        if(window.parryHit&&window.parryHit(V,G)){G.st='chase';G.path=[];G.rt=0;G.stun=C.parryStun;G.slow=C.parryStun;G.cast=0;G.ca=null;cap('Đỡ được nhát chém! Oan hồn bị choáng 2 giây.')}
        else{killPlayer(V.pl);G.st='patrol';G.wait=1.2;G.path=[]}}
      else{G.st='chase';G.path=[];G.rt=0;G.slow=C.slowT;cap('Oan hồn chém hụt! Nó bị choáng một lúc, chạy đi!')}}}}

/* ---------- Vẽ ---------- */
const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(a,b,w,h)};
function spike(x,top,h,c){
  for(let i=0;i<h;i++){const w=Math.max(1,Math.round(7*(1-i/h)));R(c,x-(w>>1),top+i,w,1);if(w>2)R('#a9a7bb',x-(w>>1),top+i,1,1)}}
function drawWorld(){
  /* khung báo trước tường */
  if(PLAN){cx.globalAlpha=.4+.3*Math.sin(frame*.4);PLAN.tiles.forEach(([x,y])=>{const px=x*T,py=y*T;R('#a070ff',px,py,T,1);R('#a070ff',px,py+T-1,T,1);R('#a070ff',px,py,1,T);R('#a070ff',px+T-1,py,1,T)});cx.globalAlpha=1}
  /* tường đá */
  WALLS.forEach(b=>{
    const rise=Math.min(1,b.t/.35),left=b.life-b.t;
    if(left<1.2&&((frame>>2)&1))return;
    b.tiles.forEach(([x,y])=>{
      const px=x*T,py=y*T,hh=Math.max(1,Math.round((T+4)*rise)),h=hs(x,y),top=py+T-hh;
      R('#2e3038',px,top,T,hh);
      if(hh>3){R('#5a5f6c',px+1,top+1,T-2,hh-3);R('#8a8f9c',px+1,top+1,T-2,1);if(h%3===0)R('#3c3f48',px+2,top+3,1,Math.min(3,hh-4));R('#a070ff',px+(h&3)+1,top+2,1,1)}})});
  /* thạch nhũ */
  ROCKS.forEach(r=>{
    if(r.t<0)return;
    const x=Math.round(r.x),y=Math.round(r.y);
    if(r.t<C.warn){
      const p=r.t/C.warn,rad=Math.round(3+7*p);
      cx.globalAlpha=.25+.45*p;
      for(let j=-rad;j<=rad;j++){const w=Math.round(Math.sqrt(rad*rad-j*j)*1.2);R('#ff2a2a',x-w,y+Math.round(j*.5),w*2,1)}
      cx.globalAlpha=.35+.3*p;spike(x+Math.round(Math.sin(frame*1.3)),y-130,12,'#6a6878');cx.globalAlpha=1}
    else if(r.t<C.warn+C.fall){
      const p=(r.t-C.warn)/C.fall;spike(x,Math.round(y-130*(1-p)-12),12,'#6a6878')}
    else{
      if(!r.dd){r.dd=1;dust(x,y-2,8,['#8a889a','#6a6878','#c9c2e0'])}
      cx.globalAlpha=Math.max(0,1-(r.t-C.warn-C.fall)/.7);
      R('#6a6878',x-5,y-2,3,2);R('#8a889a',x-1,y-3,4,3);R('#55535f',x+3,y-1,3,2);cx.globalAlpha=1}});
}
function drawFx(){
  FX.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=.03;q.l--;cx.globalAlpha=Math.max(0,Math.min(1,q.l/15));R(q.c,Math.round(q.x),Math.round(q.y),2,2)});
  cx.globalAlpha=1;FX=FX.filter(q=>q.l>0)}
const _gd=ghostDraw;
function one(){const g=GH,t=g.t;if(g.st==='slash')g.t=t*(.45/C.wind);try{_gd()}finally{g.t=t}}  /* ép hoạt ảnh vung liềm khớp thời gian mới */
ghostDraw=function(){
  const main=GH;
  try{
    drawWorld();
    MIN.forEach(m=>{
      if(m.spawn>0){
        const p=1-m.spawn/.7,r=Math.round(4+12*p),x=Math.round(m.x),y=Math.round(m.y-12);
        cx.globalAlpha=1-p*.7;for(let a=0;a<6.28;a+=.45)R('#c9a8ff',x+Math.round(Math.cos(a)*r),y+Math.round(Math.sin(a)*r*.8),2,2);cx.globalAlpha=1;
        if((frame>>1)&1)return}
      if(m.life<2&&((frame>>2)&1))return;
      GH=m;one();
      const x=Math.round(m.x),y=Math.round(m.y-14);
      for(let i=0;i<4;i++){const a=frame*.12+i*1.57;R('#c9a8ff',x+Math.round(Math.cos(a)*11),y+Math.round(Math.sin(a)*8),1,1)}});
    GH=main;
    if(main){
      one();
      if(main.cast>0){
        const col={s:'#ffb347',w:'#a070ff',m:'#46e0d0'}[main.ca]||'#fff',x=Math.round(main.x),y=Math.round(main.y-18),r=12+Math.round(Math.sin(frame*.4)*2);
        for(let a=0;a<6.28;a+=.4)R(col,x+Math.round(Math.cos(a)*r),y+Math.round(Math.sin(a)*r*.7),2,2)}}
    drawFx();
  }finally{GH=main}};
})();

/* ===== vines.js: DÂY LEO CUỐN MIỆNG HANG ĐỘNG =====
   Nạp CUỐI CÙNG (sau sader.js). Không cần sửa file cũ.
   - Miệng hang (CVX,CVY) bị dây leo che kín.
   - Lại gần: dây ngóc lên cảnh báo. Vào vùng GRAB: dây quất ra, quấn, kéo xuống đầm lầy, chết.
   - Sau này diệt dây leo bằng: window.caveVines.destroy()  (khôi phục: caveVines.restore()) */
(()=>{
if(typeof CVX==='undefined'||typeof allPl!=='function'||typeof glow!=='function'||typeof sprite!=='function'||typeof enterCave!=='function'){
  console.warn('vines.js: hãy nạp CUỐI CÙNG (sau deadisland.js)');return}

/* ---------- Thông số ---------- */
const MX=CVX*T+4,MY=CVY*T,CY=CVY*T+4;      /* tâm miệng hang, đỉnh miệng hang */
const WARN=62,GRAB=30;                       /* bán kính cảnh báo / bị bắt (px) */
const T_LASH=.45,T_PULL=.9,T_SINK=1.7,T_DIE=2.9;   /* mốc thời gian chuỗi kéo (giây) */
const KEY='deadisland:vinesgone';
const C={d:'#07241d',m:'#1d6a2a',l:'#3f9a2e',y:'#b8c22e'};

let ALIVE=true,DYING=null,GR=[],SC=[],PT=[],IM={},PF={},NEAR=null,wCD=0;
const loadFlag=()=>{try{ALIVE=localStorage.getItem(KEY)!==String(seed)}catch(_){ALIVE=true}};
loadFlag();

const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),w,h)};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const warned={};const oops=(n,e)=>{if(!warned[n]){warned[n]=1;console.error('[vines] lỗi trong '+n+':',e)}};
function label(x,y,t,col){
  cx.save();cx.textAlign='center';cx.font='bold 6px monospace';
  const w=Math.ceil(cx.measureText(t).width)+6,bx=Math.round(x-w/2),by=Math.round(y);
  cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(bx,by,w,9);cx.fillStyle=col||'#8aff4a';cx.fillRect(bx,by+9,w,1);
  cx.fillStyle='#fff';cx.fillText(t,Math.round(x),by+7);cx.restore()}

/* ---------- Công cụ vẽ dây ---------- */
function curve(x0,y0,qx,qy,x1,y1,n,wig,ph,t){
  const o=[],dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1;
  for(let i=0;i<=n;i++){
    const u=i/n,q=1-u;let x=q*q*x0+2*q*u*qx+u*u*x1,y=q*q*y0+2*q*u*qy+u*u*y1;
    const s=Math.sin(u*9+ph+t*.07)*wig*Math.sin(Math.PI*u);
    x+=-dy/l*s;y+=dx/l*s;o.push([x,y])}
  return o}
function vine(p,w,al){
  const n=p.length;if(n<2)return;
  cx.globalAlpha=al;
  for(let i=0;i<n;i++){const ww=Math.max(1,Math.round(w*(1-i/(n-1)*.5)));R(C.d,p[i][0]-ww/2-1,p[i][1]-ww/2-1,ww+2,ww+2)}
  for(let i=0;i<n;i++){const ww=Math.max(1,Math.round(w*(1-i/(n-1)*.5)));R(C.m,p[i][0]-ww/2,p[i][1]-ww/2,ww,ww)}
  for(let i=0;i<n;i++){const ww=Math.max(1,Math.round(w*(1-i/(n-1)*.5)));if(ww>=2)R(((i>>1)&1)?C.y:C.l,p[i][0]-ww/2,p[i][1]-ww/2,1+(ww>2?1:0),1)}
  for(let i=2;i<n;i+=5){const x=p[i][0],y=p[i][1];R(C.y,x+(i&1?2:-3),y-2,2,1);R(C.l,x+(i&1?2:-3),y-1,1,1)}
  cx.globalAlpha=1}

/* ---------- Vũng bùn ---------- */
function pool(x,y,r,t,al){
  if(r<1)return;
  const ry=Math.max(2,Math.round(r*.45));
  cx.globalAlpha=al;
  for(let j=-ry;j<=ry;j++){const w=Math.round(r*Math.sqrt(Math.max(0,1-(j*j)/(ry*ry+.01))));R('#10190c',x-w-1,y+j,w*2+2,1);R('#26311a',x-w,y+j,w*2,1)}
  for(let j=-ry+1;j<=ry-1;j++){const w=Math.round((r-2)*Math.sqrt(Math.max(0,1-(j*j)/(ry*ry+.01))));if(w>0)R(((j+t>>3)&1)?'#3b4a28':'#334020',x-w,y+j,w*2,1)}
  const q=(t*.03)%1;cx.globalAlpha=al*(1-q);
  for(let a=0;a<6.28;a+=.4)R('#6a7a46',x+Math.cos(a)*r*q,y+Math.sin(a)*ry*q,1,1);
  cx.globalAlpha=1}
function bubbles(x,y,t,al){
  for(let i=0;i<3;i++){const q=(t*.03+i/3)%1;cx.globalAlpha=al*(1-q);R('#6a7a46',x+(i-1)*4+Math.sin(q*6+i)*1.5,y-q*9,2,2);R('#9aaa66',x+(i-1)*4+Math.sin(q*6+i)*1.5,y-q*9,1,1)}
  cx.globalAlpha=1}

/* ---------- Giết ngay (bỏ qua hệ thống tim / hào quang) ---------- */
function instantKill(n){
  const V=allPl().find(p=>p.pl===n);if(!V)return;
  BL.push([V.x,V.y]);flash=24;LS={t:0,fin:0};
  people=people.filter(p=>p.pl!==n);ins=ins.filter(p=>p.pl!==n);
  const L=allPl();
  if(!L.length){gameOver();return}
  cap('P'+n+' bị dây leo kéo xuống đầm lầy và chết.');
  if(sel===n)setSel(L[0].pl);else infoUI()}

function leaves(x,y,n){for(let i=0;i<n;i++)PT.push({x:x+rnd(15)-7,y:y+rnd(11)-5,vx:(Math.random()-.5)*1.2,vy:-(.1+Math.random()*.8),l:40+rnd(40),c:[C.l,C.y,C.m][rnd(3)]})}
function mud(x,y,n){for(let i=0;i<n;i++)PT.push({x:x+rnd(9)-4,y,vx:(Math.random()-.5)*1.6,vy:-(.5+Math.random()*1.6),l:25+rnd(20),c:['#26311a','#47552f','#6a7a46'][rnd(3)]})}

/* ---------- Bắt người chơi ---------- */
function startGrab(P){
  if(GR.some(g=>g.n===P.pl))return;
  const dx=MX-P.x,dy=CY-P.y,d=Math.hypot(dx,dy)||1,mv=Math.min(14,Math.max(0,d-14));
  let tx=P.x+dx/d*mv,ty=P.y+dy/d*mv;
  if(Math.floor(tx/T)===CVX&&Math.floor(ty/T)===CVY)ty=(CVY-1)*T+4;      /* không kéo vào ô cửa hang */
  GR.push({n:P.pl,t:0,sx:P.x,sy:P.y,tx,ty,ax:MX+clamp(P.x-MX,-14,14),ay:MY+4,ax2:MX+clamp(-(P.x-MX),-14,14),ay2:MY+5,ph:Math.random()*6});
  P.path=[];P.tx=P.x;P.ty=P.y;
  shake=Math.max(shake,6);leaves(P.x,P.y-8,10);
  cap('Dây leo bất ngờ quất ra, quấn chặt lấy P'+P.pl+'!')}

/* chặn bước vào cửa hang khi dây leo còn sống */
const _ec=enterCave;
enterCave=function(q){
  if(ALIVE&&!DYING){if(q.fl)return _ec(q);startGrab(q);return}
  return _ec(q)};

/* khóa điều khiển nhân vật đang bị kéo */
const _ctrl=ctrl;
ctrl=function(){
  const P=GR.length&&allPl().find(p=>p.pl===sel&&GR.some(g=>g.n===p.pl));
  if(P){P.moving=0;P.path=[];P.tx=P.x;P.ty=P.y;return}
  _ctrl()};

/* ---------- Cập nhật mỗi khung hình ---------- */
function tick(dt){
  if(state!=='island')return;
  if(wCD>0)wCD-=dt;
  SC.forEach(s=>s.t+=dt);SC=SC.filter(s=>s.t<9);
  PT.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=.04;q.l--});PT=PT.filter(q=>q.l>0);
  if(DYING){DYING.t+=dt;if(frame%3===0)leaves(MX,MY+4,2);
    if(DYING.t>=2.2){DYING=null;ALIVE=false;try{localStorage.setItem(KEY,String(seed))}catch(_){}
      cap('Dây leo khô héo, rụng xuống. Miệng hang đã lộ ra...')}}
  /* theo dõi người chơi ngoài trời */
  NEAR=null;let nd=1e9;
  allPl().forEach(p=>{
    if(p.fl){PF[p.pl]=1;return}
    if(p.hide)return;
    const d=Math.hypot(p.x-MX,p.y-CY);
    if(PF[p.pl]){if(d<WARN+8)IM[p.pl]=1;PF[p.pl]=0}           /* vừa ra khỏi hang: tạm miễn nhiễm */
    if(IM[p.pl]&&d>WARN+6)IM[p.pl]=0;
    if(!ALIVE||DYING)return;
    if(d<WARN*1.25&&d<nd&&!GR.some(g=>g.n===p.pl)){nd=d;NEAR={x:p.x,y:p.y,d}}
    if(d<WARN&&wCD<=0&&p.pl===sel&&!IM[p.pl]){wCD=7;cap('Dây leo quấn kín miệng hang, chúng đang động đậy khi bạn lại gần... Đừng tiến thêm!')}
    if(!IM[p.pl]&&d<GRAB)startGrab(p)});
  /* chuỗi bị kéo */
  GR.forEach(g=>{
    const P=allPl().find(p=>p.pl===g.n);
    if(!P||P.fl||!ALIVE&&!DYING){if(P)P.hide=0;g.dead=1;return}
    if(DYING){P.hide=0;g.dead=1;return}
    g.t+=dt;const t=g.t;let x,y;
    if(t<T_PULL){x=g.sx+Math.sin(t*40)*.6;y=g.sy}
    else if(t<T_SINK){const u=(t-T_PULL)/(T_SINK-T_PULL),e=u*u*(3-2*u);x=g.sx+(g.tx-g.sx)*e;y=g.sy+(g.ty-g.sy)*e}
    else{x=g.tx;y=g.ty;P.hide=1;if(frame%5===0)mud(x,y+1,2)}
    P.x=x;P.y=y;P.tx=x;P.ty=y;P.path=[];P.moving=0;
    if(t>=T_DIE){g.dead=1;SC.push({x:g.tx,y:g.ty+1,t:0});mud(g.tx,g.ty+1,24);instantKill(g.n)}});
  GR=GR.filter(g=>!g.dead)}

/* ---------- Vẽ ---------- */
function roots(t,al,fall){
  for(let k=0;k<7;k++){
    const bx=MX-18+k*6,by=MY+3;
    let ang=-1.5708+(k-3)*.4+Math.sin(t*.03+k)*.15,len=15+(k%3)*6+Math.sin(t*.05+k*2)*2;
    if(NEAR){
      const a2=Math.atan2(NEAR.y-6-by,NEAR.x-bx),k2=clamp(1-(NEAR.d-GRAB)/(WARN-GRAB),0,1),da=Math.atan2(Math.sin(a2-ang),Math.cos(a2-ang));
      ang+=da*k2*.8;len+=k2*(8+((k+1)%3)*4)}
    len*=1-fall*.35;
    const ex=bx+Math.cos(ang)*len,ey=by+Math.sin(ang)*len+fall*fall*6;
    vine(curve(bx,by,bx+Math.cos(ang+.5)*len*.5,by+Math.sin(ang+.5)*len*.5-3,ex,ey,Math.max(5,len>>1),2,k*1.7,t),3,al)}}
function curtain(t,al,fall){
  for(let k=-4;k<=4;k++){
    const bx=MX+k*4,top=MY-24+(((k*5+9)%4+4)%4)*2,len=30+(((k*7)%5+5)%5)*3-fall*8,pts=[];
    for(let i=0;i<=11;i++){const u=i/11;pts.push([bx+Math.sin(t*.035+k*1.3+u*5)*(1+u*2.5),top+u*len+fall*u*u*28])}
    vine(pts,k%2?3:2,al)}
  [[-4,3,6],[2,-3,10],[7,5,9]].forEach(([a,b,c],i)=>
    vine(curve(MX-21,MY+a,MX,MY+b+Math.sin(t*.04+i)*1.5,MX+21,MY+c,18,2,i*2.1,t),i===1?4:3,al))}
function drawGrab(g){
  const P=allPl().find(p=>p.pl===g.n);if(!P)return;
  const t=g.t,f=frame,x=Math.round(P.x),y=Math.round(P.y);
  pool(g.tx,g.ty+1,3+10*clamp((t-.6)/1.1,0,1),f,1);
  if(t<T_SINK){
    if(t<T_LASH){
      const u=clamp(t/.4,0,1),ex=g.ax+(P.x-g.ax)*u,ey=g.ay+(P.y-4-g.ay)*u;
      vine(curve(g.ax,g.ay,(g.ax+ex)/2,Math.min(g.ay,ey)-12*(1-u),ex,ey,16,2.5,g.ph,f),3,1)}
    else{
      vine(curve(g.ax,g.ay,(g.ax+P.x)/2,(g.ay+P.y)/2-6+Math.sin(f*.3)*2,P.x,P.y-5,16,2,g.ph,f),3,1);
      if(t>.6)vine(curve(g.ax2,g.ay2,(g.ax2+P.x)/2,(g.ay2+P.y)/2-6,P.x,P.y-12,16,2,g.ph+2,f),3,1);
      const wn=Math.min(4,Math.floor((t-T_LASH)/.1)+1);
      for(let r=0;r<wn;r++){
        const pts=[];for(let a=0;a<6.3;a+=.55)pts.push([P.x+Math.cos(a+r*1.2)*5,P.y-3-r*4+Math.sin(a+r*1.2)*1.6]);
        vine(pts,2,1)}}}
  else{
    const sink=Math.min(26,(t-T_SINK)*26),sx=Math.round(P.x+Math.sin(f*1.1)*.8);
    cx.save();cx.beginPath();cx.rect(sx-20,y-OY-12,40,OY+13);cx.clip();
    cx.drawImage(sprite(P,0),sx-OX,y-OY+Math.round(sink));cx.restore();
    const rp=12,wy=y-10+sink;
    for(let k=-1;k<=1;k++)vine(curve(sx+k*rp,y+1,sx+k*5,y-14,sx,wy,14,2,k*2+g.ph,f),3,1);
    bubbles(sx,y,f,1)}}
function drawAll(){
  if(!ALIVE&&!DYING&&!SC.length&&!PT.length&&!GR.length)return;
  if(MX<camX-90||MX>camX+CW+90||CY<camY-90||CY>camY+CH+90)return;
  const t=frame;
  SC.forEach(s=>{const a=Math.max(0,1-s.t/9)*.9;pool(s.x,s.y,10,t,a);bubbles(s.x,s.y,t,a)});
  if(ALIVE||DYING){
    const al=DYING?Math.max(0,1-DYING.t/2.2):1,fall=DYING?DYING.t:0,nk=nightK();
    cx.save();cx.globalCompositeOperation='lighter';
    const g=cx.createRadialGradient(MX,MY+4,2,MX,MY+4,34);
    g.addColorStop(0,'rgba(90,220,90,'+((.1+.14*nk)*al).toFixed(3)+')');g.addColorStop(1,'rgba(90,220,90,0)');
    cx.fillStyle=g;cx.fillRect(MX-36,MY-32,72,72);cx.restore();
    roots(t,al,fall);vine.call(null,[],1,al);curtain(t,al,fall)}
  GR.forEach(drawGrab);
  PT.forEach(q=>{cx.globalAlpha=clamp(q.l/15,0,1);R(q.c,q.x,q.y,2,2)});cx.globalAlpha=1;
  if(NEAR&&ALIVE&&!DYING&&!GR.length)label(MX,MY-42,'Dây leo chắn cửa hang','#8aff4a')}

const _glow=glow;
glow=function(){_glow();if(!inside){try{drawAll()}catch(e){oops('vẽ',e);cx.globalAlpha=1}}};
const _step=step;
step=function(){_step();try{tick(Math.min(.25,DM||.016))}catch(e){oops('tick',e)}};

/* ---------- Vòng đời game ---------- */
const _gen=gen;
gen=function(sd){_gen(sd);loadFlag();DYING=null;GR=[];SC=[];PT=[];IM={};PF={};NEAR=null};
const _mk=mkPeople;
mkPeople=function(){_mk();ALIVE=true;DYING=null;GR=[];SC=[];PT=[];IM={};PF={};NEAR=null;
  try{localStorage.removeItem(KEY)}catch(_){}};
const _rs=restore;
restore=function(s){_rs(s);GR=[];IM={};PF={};NEAR=null};

/* ---------- API cho nhiệm vụ sau ---------- */
window.caveVines={
  isAlive:()=>ALIVE&&!DYING,
  destroy:()=>{if(!ALIVE||DYING)return;DYING={t:0};flash=10;shake=Math.max(shake,8);leaves(MX,MY,30)},
  restore:()=>{ALIVE=true;DYING=null;try{localStorage.removeItem(KEY)}catch(_){}}};
})();