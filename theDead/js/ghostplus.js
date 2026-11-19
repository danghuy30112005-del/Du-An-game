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
  chase:1.9,       /* đuổi (gốc 1.4; người đi bộ 1.25, chạy Q 2.1) */
  mini:1.6,        /* hồn ma triệu hồi */
  slow:.8,         /* tốc độ khi bị choáng sau chém hụt (gốc .5) */
  slowT:.6,        /* thời gian choáng (gốc 1) */
  laugh:.8,        /* thời gian cười trước khi đuổi (gốc 1.5) */
  wind:.2,         /* thời gian vung liềm (gốc .45) */
  reach:24,        /* tầm chém */
  sight:120,       /* tầm nhìn thấy người */
  cdS:6, cdW:10, cdM:18, gcd:1.8,       /* hồi chiêu: thạch nhũ / tường / triệu hồi / chung */
  castS:.5, castW:.7, castM:.9,         /* thời gian niệm chú */
  warn:.9, fall:.22,                    /* thạch nhũ: báo trước / rơi */
  wallLife:6, wallHalf:3,               /* tường đá: sống bao lâu, nửa chiều dài (ô) */
  minLife:11
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
    const A=pls();if(!A.length)return;
    const[P,d]=nearest(m,A);
    if(m.slow>0)m.slow=Math.max(0,m.slow-dt);
    if(m.st==='slash'){
      m.t+=dt;
      const V=A.find(p=>m.tgt&&p.pl===m.tgt.pl);
      if(V)m.dir=V.x>=m.x?1:-1;
      if(m.t>=C.wind){
        m.st='chase';m.path=[];m.rt=0;
        if(V&&Math.hypot(V.x-m.x,V.y-m.y)<C.reach)killPlayer(V.pl);
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
    if(G.t>=C.wind){
      if(V&&Math.hypot(V.x-G.x,V.y-G.y)<C.reach){killPlayer(V.pl);G.st='patrol';G.wait=1.2;G.path=[]}
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