const W=340,H=180,T=8,CW=500,CH=300,WW=W*T,WH=H*T,BR=48,CX0=65,CY0=34,SEA=0,SAND=1,GRASS=2,TREE=3,MTN=4,ROCK=5,FLOW=6,CAS=7,DOOR=8,COURT=9,CLF=10,PATH=11,PLAT=12,HUT=13,WELL=14,PIT=15,HSE=16,HSX=86,HSY=37,HDX=87,HDY=43,SWAMP=17,POOL=18,DTREE=19,CAVE=20,SIGN=21,CROCK=22,CVX=80,CVY=121,SGX=78,SGY=120;
const cv=document.getElementById('c'),cx=cv.getContext('2d');cv.width=CW;cv.height=CH;
const $=id=>document.getElementById(id),rnd=n=>Math.floor(Math.random()*n),ri=(a,b)=>a+rnd(b-a+1);
const PC=['#e0533d','#3b6fd6','#e0b030','#8e44ad','#16a085','#ff7ab6'];
const SHIRT=['#7f8c8d','#c0392b','#2980b9','#27ae60','#d4ac0d','#8e6bbf','#e67e22','#ecf0f1','#1abc9c'];
const SKIN=['#f1c27d','#e0ac69','#c68642','#8d5524','#ffdbac'],HAIR=['#2b1b0f','#4a2f17','#d9a441','#7a3b1d','#111'];
const LCX=140,LRX=36,LRY=40;/* thùy đất phía đông (khu rừng lớn) */
const GARD=23,GX0=82,GX1=93,GY0=45,GY1=49;/* khu vườn của chủ đảo */
const KEY='deadisland:save5',mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let HX=0,HY=0,WX=0,WY=0,camX=0,camY=0,inside=false,im=[],ins=[],sel=1,trans=null,keys={},seed=0,gm=0,snap={},lastMin=-1,last=performance.now(),confirmKey='';
let m,hg,state='title',frame=0,bx=40,by=BR*T+3,tbx=0,iAlpha=0,shake=0,crashT=-1,people=[],nPl=1,shoreX=0,parts=[];
let OW=null,TK=null,NPCD=0,ACC={},sd=[],BTOT=0,MTOT=0;
let BL=[],GH=null,SGN=0,flash=0,LS=null,FOR=null;
const CHB=[[22,20],[148,20],[20,54],[150,54],[24,88],[146,88],[85,12],[50,10],[120,10],[62,42],[108,42],[62,64],[108,64],[85,54],[85,78]];/* điểm tuần tra của oan hồn */
let CAMPX=40,CAMPY=53,CAMPN=0;
const CSP=[[-2,0],[2,0],[0,2],[-2,2],[2,2],[-3,1],[3,1],[-1,-2],[1,-2],[-3,-1],[3,-1],[0,-3]];
CSP.push([-4,1],[4,1],[-2,3],[2,3],[-4,-1],[4,-1]);
const HELP=[[76,10],[78,10],[80,10],[82,10],[86,9],[90,9],[84,13]];/* chỗ phụ bếp: khu sơ chế, rửa, bếp phụ */
function campGoal(p,kind){
  const k=(p.cs=p.cs==null?CAMPN++:p.cs),[a,b]=CSP[k%CSP.length],x=CAMPX+a,y=CAMPY+b;
  return walkT(x,y)?{out:1,x,y,kind}:{out:1,x:CAMPX,y:CAMPY+2,kind}}
const hs=(x,y)=>{let h=(x*374761393+y*668265263)>>>0;h=((h^(h>>>13))*1274126177)>>>0;return(h^(h>>>16))>>>0};
const cap=t=>$('cap').textContent=t;
const walkT=(tx,ty,fl,npc)=>{if(fl){const t=(FL[fl].im[ty]||[])[tx];return t===0||t===2||t===6||t===30||t===32||t===33||t===36||t===44|| t===45||t===50||t===57||(npc&&t===21)}const t=m[ty]&&m[ty][tx];return t===SAND||t===GRASS||t===FLOW||t===COURT||t===DOOR||t===PLAT||t===PATH||t===SWAMP||t===CAVE||t===GARD};

const walk=(x,y,p)=>walkT(Math.floor(x/T),Math.floor(y/T),p&&p.fl,p&&!p.pl);

/* ===== Tạo đảo: bãi cát, đồng cỏ, rừng, núi ===== */
function gen(sd){
  BL=[];GH=null;SGN=0;FOR=null;
  seed=sd||(1+rnd(2e9));const rg=mul(seed),p=[0,1,2,3,4,5].map(()=>rg()*6);m=[];hg=[];
  for(let y=0;y<H;y++){m[y]=[];hg[y]=[];for(let x=0;x<W;x++){
    const dx=(x+.5-80)/55,dy=(y+.5-48)/37,a=Math.atan2(dy,dx),
      r=1+.12*Math.sin(3*a+p[0])+.08*Math.sin(5*a+p[1])+.06*Math.sin(2*a+p[2]),d=Math.hypot(dx,dy)/r;
    hg[y][x]=d;m[y][x]=d>1?SEA:d>.88?SAND:GRASS}}
  shoreX=m[BR].findIndex(t=>t!==SEA);tbx=shoreX*T+4-34;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dm=Math.hypot((x-46)/9,(y-66)/6);if(dm<1&&m[y][x]!==SEA){m[y][x]=MTN;hg[y][x]=dm*.4}}
  for(let y=0;y<H;y++)for(let x=90;x<W;x++)if(Math.hypot((x-LCX)/LRX,(y-48)/LRY)<1&&m[y][x]===SEA)m[y][x]=GRASS;
  const q=[rg()*9,rg()*9,rg()*9];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const h=hs(x,y)%100,f=Math.sin(x*.8+q[0])+Math.sin(y*.9+q[1])+Math.sin((x+y)*.45+q[2]);
    if(m[y][x]===GRASS&&(Math.hypot((x-LCX)/LRX,(y-48)/LRY)<1?h<70:(((x>=78&&hg[y][x]>.45)||(x>=58&&hg[y][x]>.62))?h<84:((f>1.1&&h<60)||h<1))))m[y][x]=TREE;
    else if(m[y][x]===SAND&&h<3)m[y][x]=ROCK}
  for(let y=1;y<H-1;y++)for(let x=90;x<W-1;x++)if(m[y][x]!==SEA&&m[y][x]!==SAND&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>m[y+b][x+a]===SEA))m[y][x]=SAND;
  for(let y=BR-2;y<=BR+2;y++)for(let x=shoreX;x<=shoreX+5;x++){if(m[y][x]===TREE)m[y][x]=GRASS;if(m[y][x]===ROCK)m[y][x]=SAND}
  /* Đặt lửa trại gần bãi đổ bộ và dọn cây/đá quanh đó */
  CAMPX=shoreX+7;CAMPY=BR+5;
  for(let y=CAMPY-5;y<=CAMPY+5;y++)for(let x=CAMPX-5;x<=CAMPX+5;x++){if(m[y]&&(m[y][x]===TREE||m[y][x]===ROCK))m[y][x]=GRASS}
  genLobes(p);
  const hcx=72,hcy=41;
  for(let y=hcy-20;y<=hcy+20;y++)for(let x=hcx-28;x<=hcx+28;x++){
    if(m[y][x]===SEA)continue;
    const ex=(x+.5-hcx)/22,ey=(y+.5-hcy)/14,a=Math.atan2(ey,ex),r=hs(x,y)%100,
      dh=Math.hypot(ex,ey)/(1+.12*Math.sin(5*a+1.3)+.08*Math.sin(9*a+2.1)+.05*Math.sin(14*a))+(r/100-.5)*.12;
    if(dh<1)m[y][x]=dh<.78?(dh>.68&&r<22?CLF:PLAT):CLF;
    else if(dh<1.12&&r<14&&(m[y][x]===GRASS||m[y][x]===TREE))m[y][x]=CLF}
  for(let y=59;y>=40;y--){const px=72+Math.round(5*Math.sin((59-y)*.5));for(let x=px-1;x<=px+1;x++)if(m[y][x]!==SEA)m[y][x]=PATH}
  for(let y=34;y<=52;y++)for(let x=56;x<=88;x++){
    if(y<=39&&x>=65&&x<=79)m[y][x]=CAS;
    else if(y>=40&&y<=42&&x>=67&&x<=77)m[y][x]=COURT;
    else if(y>=40&&m[y][x]===PLAT&&(x<=66||x>=78)&&hs(x,y)%100<65)m[y][x]=FLOW}
  m[39][72]=DOOR;
  /* Rừng lớn bên phải: đường mòn -> nhà gỗ -> giếng cổ -> hố lớn (cách xa nhau) */
  const py=x=>48+Math.round(3*Math.sin((x-98)*.15)),clr=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(m[y][x]!==SEA)m[y][x]=GRASS};
  clr(100,py(103)-8,108,py(103)-2);clr(118,py(121)-6,124,py(121)-2);clr(108,42,114,47);clr(110,47,112,49);
  for(let x=96;x<=152;x++)for(let y=py(x)-3;y<=py(x)+3;y++)if(m[y][x]===TREE||m[y][x]===ROCK)m[y][x]=GRASS;/* dọn cây hai bên đường mòn để không bị kẹt */
  for(let x=96;x<=152;x++)for(let y=py(x)-1;y<=py(x)+1;y++)if(m[y][x]!==SEA)m[y][x]=PATH;
  for(let x=72;x<=98;x++)for(let y=59;y<=61;y++)if(m[y][x]!==SEA)m[y][x]=PATH;
  for(let y=py(97);y<=61;y++)for(let x=96;x<=98;x++)if(m[y][x]!==SEA)m[y][x]=PATH;
  HX=102;HY=py(103)-6;for(let y=HY;y<HY+3;y++)for(let x=HX;x<HX+4;x++)m[y][x]=HUT;
  WX=120;WY=py(121)-4;for(let y=WY;y<WY+2;y++)for(let x=WX;x<WX+2;x++)m[y][x]=WELL;
  for(let y=36;y<=60;y++)for(let x=140;x<=174;x++){const d=Math.hypot((x-156)/10,(y-48)/8.5);if(d<1.5&&m[y][x]!==SEA&&(m[y][x]===TREE||m[y][x]===ROCK))m[y][x]=GRASS}
  for(let y=40;y<=56;y++)for(let x=146;x<=166;x++)if(Math.hypot((x-156)/6.5,(y-48)/5)<1&&m[y][x]!==SEA)m[y][x]=PIT;
  for(let y=36;y<=60;y++)for(let x=140;x<=174;x++)if(Math.hypot((x-156)/10,(y-48)/8.5)<1&&m[y][x]!==SEA&&m[y][x]!==PIT)m[y][x]=PATH;/* đường mòn vòng quanh hố lớn */
  /* Nhà 2 tầng của chủ đảo (cạnh dinh thự) + sân đá nối với sân lâu đài */
  for(let y=HSY;y<HSY+6;y++)for(let x=HSX;x<HSX+8;x++)m[y][x]=HSE;
  for(let x=66;x<=HSX+9;x++)if(m[43][x]!==SEA)m[43][x]=COURT;
  for(let x=HSX-1;x<=HSX+9;x++)if(m[44][x]!==SEA)m[44][x]=COURT;
  /* sân quanh nhà (để chủ đảo đi dọn dẹp) + vườn phía nam */
  for(let y=35;y<=44;y++)for(let x=84;x<=95;x++){if(x>=HSX&&x<HSX+8&&y>=HSY&&y<HSY+6)continue;if(!walkT(x,y))m[y][x]=GRASS}
  for(let y=GY0;y<=GY1;y++)for(let x=GX0;x<=GX1;x++)m[y][x]=GARD;
  genPaths();
  calcSea();genIn();
}

/* ===== Mở rộng đảo: cánh rừng phía bắc, rừng + đầm lầy phía nam, đường mòn, cửa hang ===== */
function genLobes(p){
  const nSea=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>(m[y+b]||[])[x+a]===SEA);
  for(let y=0;y<=24;y++)for(let x=0;x<W;x++){
    const dx=(x+.5-80)/40,dy=(y+.5-11)/11,a=Math.atan2(dy,dx),r=1+.1*Math.sin(4*a+p[3])+.07*Math.sin(7*a+p[4]),d=Math.hypot(dx,dy)/r;
    if(d<1&&m[y][x]===SEA)m[y][x]=hs(x,y)%100<55?TREE:GRASS}
  for(let y=70;y<H;y++)for(let x=0;x<W;x++){
    const dx=(x+.5-80)/46,dy=(y+.5-104)/29,a=Math.atan2(dy,dx),r=1+.1*Math.sin(3*a+p[3])+.07*Math.sin(5*a+p[4]),d=Math.hypot(dx,dy)/r;
    if(d>=1)continue;
    const h=hs(x,y)%100,f=Math.sin(x*.5+p[0])+Math.sin(y*.6+p[1])+Math.sin((x+y)*.3+p[2]),sw=y>=98||(y>=93&&h<(y-92)*16);
    if(!sw)m[y][x]=h<(y<90?52:38)?TREE:GRASS;
    else m[y][x]=(y>=97&&f>1.7)?POOL:h<9?DTREE:SWAMP}
  for(let y=0;y<H;y++){if(y>24&&y<70)continue;for(let x=0;x<W;x++){const t=m[y][x];
    if((t===GRASS||t===TREE||t===SWAMP||t===DTREE||t===POOL)&&nSea(x,y))m[y][x]=SAND}}}
function genPaths(){
  const fix=(x,y,t)=>{if(m[y]&&m[y][x]!==undefined&&(m[y][x]===TREE||m[y][x]===ROCK||m[y][x]===DTREE||m[y][x]===POOL))m[y][x]=t};
  /* đường mòn phía nam: từ đường chính xuống rừng, qua đầm lầy (đường gỗ) tới cửa hang */
  const sx=y=>{const t=(y-60)/(CVY-1-60);return Math.round(72+8*t+4*Math.sin((y-60)*.22)*(1-t))};
  for(let y=60;y<=CVY-1;y++){const px=sx(y);
    for(let dx=-3;dx<=3;dx++)fix(px+dx,y,y>=96?SWAMP:GRASS);
    for(let dx=-1;dx<=1;dx++)m[y][px+dx]=PATH}
  for(let y=CVY-4;y<=CVY+3;y++)for(let x=CVX-7;x<=CVX+7;x++)fix(x,y,SWAMP);
  for(let x=CVX-3;x<=CVX+3;x++)for(let y=CVY;y<=CVY+2;y++)m[y][x]=CROCK;
  m[CVY][CVX]=CAVE;m[SGY][SGX]=SIGN;
  /* đường mòn phía bắc: từ sân dinh thự lên cánh rừng phía bắc */
  const nx=y=>96+Math.round(3*Math.sin((y-44)*.2));
  for(let y=44;y>=3;y--){const px=nx(y);
    for(let dx=-3;dx<=3;dx++)fix(px+dx,y,GRASS);
    for(let dx=-1;dx<=1;dx++)m[y][px+dx]=PATH}
  for(let y=2;y<=12;y++)for(let x=nx(7)-5;x<=nx(7)+5;x++)if(m[y]&&m[y][x]!==undefined&&m[y][x]!==SEA&&m[y][x]!==PATH&&Math.hypot((x-nx(7))/5,(y-7)/4)<1)m[y][x]=FLOW}
function calcSea(){
  sd=Array.from({length:H},()=>Array(W).fill(99));const q=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(m[y][x]!==SEA){sd[y][x]=0;q.push([x,y])}
  for(let i=0;i<q.length;i++){const[x,y]=q[i];for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X>=0&&Y>=0&&X<W&&Y<H&&sd[Y][X]>sd[y][x]+1){sd[Y][X]=sd[y][x]+1;q.push([X,Y])}}}}
function pickWalk(cx0,cy0,rad){
  for(let i=0;i<40;i++){const x=cx0+ri(-rad,rad),y=cy0+ri(-rad,rad);if(walkT(x,y))return[x*T+rnd(T),y*T+rnd(T)]}
  return[cx0*T+4,cy0*T+4]}

/* ===== Nhân vật: người chơi + NPC, nhu cầu, giờ giấc ===== */
let DM=0,SEATS=[],BEDS=[],HUNT={pelt:2,meat:3};
const hour=()=>(6+gm/60)%24;
const PRIV={12:1,14:1,15:1};/* tầng 2: phòng chủ, phòng cậu chủ, phòng tiểu thư */
const MEAL=h=>h>=6&&h<7?0:h>=11.5&&h<12?1:h>=18&&h<19?2:-1;/* 6-7h, 11h30-12h, 18-19h */
const MUL={g:1,s:.9,f:.5,h:.8},SKIP={g:0,s:.45,f:.7,h:.1};/* g=người trên thuyền, s=người làm, f=gia chủ */
const WAIT=p=>p.cls==='h'?ri(150,400):p.cls==='f'?ri(600,1500):p.cls==='s'?ri(300,800):ri(60,240);
const newNeeds=()=>({hu:ri(10,40),fa:ri(5,30),sl:ri(0,20)});
const canEnter=(p,f,id)=>!(f===2&&PRIV[id])||!!(p.own&&p.own.includes(id));
const SKINS=[['Trắng','#ffe0c8'],['Vàng','#f1c27d'],['Đen','#4a2f1e'],['Nâu','#8d5524']];let cfg=[],ci=0;
function mkPeople(){
  const ks=['man','woman','child','elder'],all=[],n=nPl+ri(10,20);
  for(let i=0;i<n;i++){
    const pl=i<nPl,k=pl?((cfg[i]&&CHM[cfg[i].look]&&CHM[cfg[i].look].k)||['man','woman'][rnd(2)]):(i-nPl<4?ks[i-nPl]:ks[rnd(4)]);
    all.push({k,look:pl&&cfg[i]?cfg[i].look:undefined,pl:pl?i+1:0,c:pl?PC[i]:SHIRT[rnd(SHIRT.length)],skin:pl?'#f1c27d':SKIN[rnd(5)],hair:k==='elder'?'#cfd3d8':HAIR[rnd(5)],
      x:0,y:0,sp:(k==='child'?.4:.5)+Math.random()*.1,path:[],ph:0,wait:0,moving:0,vis:0,
      cls:'g',n:newNeeds(),act:'idle',t:0,cd:0,goal:null,say:''})}
  all.sort(()=>Math.random()-.5).forEach((p,i)=>{
    p.delay=i*14;p.x=bx+ri(8,26);p.y=by+2;p.tx=shoreX*T+4;p.ty=by+ri(0,3);p.path=[pickWalk(shoreX+1,BR,5)]});
  BTOT=0;MTOT=0;people=all;ins=[];CAMPN=0;initRes();ACC={};NPCD=0;OW=mkOwner();people.push(OW)}
function upd(p){
  if(p.delay>0){p.delay--;return}
  p.vis=1;
  if(!p.pl){if(p.owner){if(ownerTick(p))return}else{needTick(p);if(p.cd>0)p.cd--;if(actTick(p))return}}
  const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy);
  if(d>.7){
    const nx=p.x+dx/d*p.sp,ny=p.y+dy/d*p.sp;
    if(p.ph&&!walk(nx,ny,p)){p.tx=p.x;p.ty=p.y;p.wait=15;p.moving=0;p.path=[];if(!p.pl&&(p.stuck=(p.stuck|0)+1)>3){rel(p);p.goal=null;p.stuck=0}}
    else{p.x=nx;p.y=ny;p.moving=1;p.stuck=0}
  }else{
    p.moving=0;
    if(p.path.length){[p.tx,p.ty]=p.path.shift();p.ph=1}
    else if(!p.pl&&!p.owner){if(p.goal){if(!nav(p))arrive(p)}else if(--p.wait<=0)think(p)}}}

/* --- Nhu cầu: đói, mệt, buồn ngủ (gia chủ tăng chậm hơn, người làm ít chủ động hơn) --- */
function needTick(p){
  const n=p.n||(p.n=newNeeds()),k=MUL[p.cls]||1,a=p.act,h=hour(),nt=h>=20||h<5;
  n.hu=a==='eat'?Math.max(0,n.hu-2.2*DM):Math.min(100,n.hu+.16*k*DM);
  if(a==='sleep'){n.sl=Math.max(0,n.sl-.15*DM);n.fa=Math.max(0,n.fa-.4*DM)}
  else{n.sl=Math.min(100,n.sl+(nt?.15:.05)*k*DM);n.fa=a==='rest'?Math.max(0,n.fa-1.2*DM):Math.min(100,n.fa+(p.moving?.14:.03)*k*DM)}}
function rel(p){
  if(p.si!=null){if(SEATS[p.si]&&SEATS[p.si].o===p)SEATS[p.si].o=null;p.si=null}
  if(p.bi!=null){if(BEDS[p.bi]&&BEDS[p.bi].o===p)BEDS[p.bi].o=null;p.bi=null}}
function startAct(p,a,t){p.act=a;p.t=t;p.moving=0;p.path=[];p.tx=p.x;p.ty=p.y}
function endAct(p){
  const a=p.act;p.act='idle';p.say='';
  if(a==='eat'||a==='sleep')rel(p);
  if(a==='chat')p.cd=2400;
  if(a==='hunt'){p.hide=0;const l=p.loot||(p.loot={pelt:0,meat:0});l.pelt+=ri(1,2);l.meat+=ri(1,3);p.n.fa=Math.min(100,p.n.fa+25);p.n.hu=Math.min(100,p.n.hu+10)}
  p.wait=a==='chat'?ri(20,60):ri(40,120)}
function actTick(p){
  const a=p.act;if(!a||a==='idle')return false;
  p.moving=0;p.t-=DM;
  if(a==='sleep'){const h=hour();if(h>=5.5&&h<21&&(h>=6||p.n.sl<=0))endAct(p)}
  else if(p.t<=0)endAct(p);
  return true}

/* --- Quyết định hành động --- */
function think(p){if(p.evt){p.wait=30;return}
  const h=hour(),n=p.n,fam=p.cls==='f',ms=MEAL(h),mk=Math.floor(gm/1440)*3+ms;
  p.wait=WAIT(p);
  if((h>=21.5||h<5.5)&&n.sl>=30)return goSleep(p);
  if(n.hu>=60||(ms>=0&&p.ate!==mk&&n.hu>=(p.cls==='g'?8:fam?20:30))){
    if(!goEat(p))n.hu=Math.max(0,n.hu-15);/* hết ghế: ăn nhẹ tại chỗ */
    if(ms>=0)p.ate=mk;
    if(p.goal)return}
  if(n.fa>=75)return startAct(p,'rest',ri(12,18));
  if(p.cls==='g'&&!p.fl&&!p.acc&&(h>=18||h<5.5)){p.goal=campGoal(p,'camp');p.path=[];return}/* tối: tụ tập bên lửa trại */
  if(p.cls==='h'&&p.loot&&(p.loot.pelt||p.loot.meat)){p.goal={fl:3,x:55,y:22,kind:'stash'};p.path=[];return}
  if(Math.random()<SKIP[p.cls])return;
  const g=idleGoal(p);if(g){p.goal=g;p.path=[]}}
function goEat(p){
  if(p.cls==='f')return false;/* gia đình chủ đảo chỉ ăn ở bàn chính trong đại sảnh (bữa ăn lớn), không ăn ở bếp / bàn nhân viên */
  if(p.cls==='g'&&!p.acc)return false;/* người chưa được vào dinh thự ăn tại trại */
  const pref=p.cls==='h'?[101]:[102,12];let i=-1;
  for(const r of pref){i=SEATS.findIndex(q=>q.room===r&&!q.o);if(i>=0)break}
  if(i<0)return false;
  const s=SEATS[i];s.o=p;p.si=i;p.goal={fl:s.fl,x:s.x,y:s.y,kind:'eat'};p.path=[];return true}
function goSleep(p){
  const taken=j=>people.concat(ins).some(q=>q!==p&&q.hb===j);/* giường đã có chủ */
  let i=-1;
  if(p.hb!=null&&BEDS[p.hb]&&(!BEDS[p.hb].o||BEDS[p.hb].o===p))i=p.hb;/* giường của chính mình */
  else if((p.cls==='g'&&p.acc)||p.cls==='s')i=BEDS.findIndex((b,j)=>b.fl===1&&b.room>=4&&b.room<=11&&!b.o&&!taken(j));/* giường trống phòng người làm TẦNG 1, không lên tầng 2 */
  if(i<0){
    if(p.cls==='g'||p.cls==='s'){p.goal=campGoal(p,'campsleep');p.path=[];return}/* hết giường / chưa được vào dinh thự: ra ngủ thành nhóm cạnh lửa trại */
    return startAct(p,'rest',ri(12,18))}/* gia chủ, thợ săn: không bao giờ ngủ giữa sàn hay ngoài trời */
  const b=BEDS[i];b.o=p;p.bi=i;p.goal={fl:b.fl,x:b.x,y:b.y,kind:'sleep'};p.path=[]}
function arrive(p){
  const g=p.goal;p.goal=null;p.wait=WAIT(p);
  if(g.kind==='eat'){const s=SEATS[p.si];if(s){p.x=p.tx=s.x*T+4;p.y=p.ty=s.y*T+4}startAct(p,'eat',ri(16,24))}
  else if(g.kind==='sleep'){const b=BEDS[p.bi];if(b){p.x=p.tx=b.x*T+4;p.y=p.ty=b.y*T+4}startAct(p,'sleep',0)}
  else if(g.kind==='cook')startAct(p,'cook',1e9);
  else if(g.kind==='dine')seatNpc(p,p.sd);
  else if(g.kind==='hunt'){startAct(p,'hunt',ri(30,60))}
  else if(g.kind==='help')startAct(p,'cook',ri(20,40));
  else if(g.kind==='clean'||g.kind==='garden')startAct(p,'clean',ri(15,30));
  else if(g.kind==='camp')startAct(p,'rest',ri(15,30));
  else if(g.kind==='campsleep')startAct(p,'sleep',0);
  else if(g.kind==='stash'&&p.loot){HUNT.pelt+=p.loot.pelt;HUNT.meat+=p.loot.meat;p.loot=null}}
function roomTile(f,id){
  const r=FL[f].RM[id],c=[];if(!r)return null;
  for(let y=r.y0;y<=r.y1;y++)for(let x=r.x0;x<=r.x1;x++){const t=FL[f].im[y][x];if(t===0||t===2)c.push([x,y])}
  return c.length?c[rnd(c.length)]:null}
const roomGoal=(f,ids)=>{const t=roomTile(f,ids[rnd(ids.length)]);return t&&{fl:f,x:t[0],y:t[1],kind:'walk'}};
function indoorGoal(p,f){const ids=[];FL[f].RM.forEach((r,i)=>{if(r&&canEnter(p,f,i))ids.push(i)});return roomGoal(f,ids)}
function landNear(cx0,cy0,r){for(let i=0;i<40;i++){const x=cx0+ri(-r,r),y=cy0+ri(-r,r);if(walkT(x,y))return{out:1,x,y,kind:'walk'}}return null}
function randLand(){for(let i=0;i<60;i++){const x=ri(5,W-5),y=ri(3,H-3);if(walkT(x,y))return{out:1,x,y,kind:'walk'}}return null}
const mansionGoal=()=>({fl:1,x:59,y:50,kind:'walk'});
const outGoal=p=>p.role==='Làm vườn'?landNear(76,48,12):{out:1,x:67+rnd(11),y:41,kind:'walk'};
/* Quản gia / giúp việc thỉnh thoảng vào phòng gia chủ để kiểm tra, dọn dẹp (ban ngày, lúc chủ phòng vắng) */
function cleanGoal(){
  const h=hour();if(h<8||h>=17.5)return null;
  const ids=[12,14,15].filter(id=>!ins.some(q=>!q.pl&&q.fl===2&&q.own&&q.own.includes(id)&&ridAt(q)===id));
  if(!ids.length)return null;const id=ids[rnd(ids.length)],t=roomTile(2,id);
  return t&&{fl:2,x:t[0],y:t[1],kind:'clean'}}
function forestTiles(){
  if(FOR)return FOR;
  FOR=[];const sx=HX+2,sy=HY+3;if(!walkT(sx,sy))return FOR;
  const seen=new Uint8Array(W*H),q=[sy*W+sx];seen[q[0]]=1;
  for(let i=0;i<q.length;i++){const c=q[i],x=c%W,y=(c/W)|0;
    for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H)continue;const k=Y*W+X;if(seen[k]||!walkT(X,Y))continue;seen[k]=1;q.push(k)}}
  q.forEach(c=>{const x=c%W,y=(c/W)|0;
    if(m[y][x]!==GRASS||y>=96)return;                 /* bỏ đầm lầy / hang */
    if(Math.hypot(x-sx,y-sy)<12)return;               /* không săn ngay trước nhà */
    if(Math.hypot(x-72,y-42)<28)return;               /* không vào sân dinh thự */
    if(x>=184&&x<=287&&y>=24&&y<=78)return;           /* không vào ruộng / nhà trong làng */
    let n=0;for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++)if((m[y+j]||[])[x+i]===TREE)n++;
    if(n>=4)FOR.push([x,y])});
  return FOR}
function forestGoal(){
  const L=forestTiles();if(!L.length)return null;
  let t=L[rnd(L.length)];
  for(let i=0;i<10&&Math.hypot(t[0]-HX,t[1]-HY)>70;i++)t=L[rnd(L.length)];/* ưu tiên chuyến không quá xa */
  return{out:1,x:t[0],y:t[1],kind:'hunt'}}
function idleGoal(p){
  const r=Math.random(),tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);
  if(p.cls==='h'){if(p.fl===3&&r<.25)return roomGoal(3,[1]);if(r<.85){const g=forestGoal();if(g)return g;const g2=landNear(140,48,6);if(g2)g2.kind='hunt';return g2}return landNear(HX+2,HY+6,5)}
  if(p.cls==='g'){
    if(!p.acc)return r<.55?landNear(tx,ty,6):r<.8?randLand():campGoal(p,'camp');
    const hr=hour();
    if(hr>=7&&hr<18&&r<.55){/* phụ giúp dinh thự */
      const q=Math.random();
      if(q<.4){const s=HELP[rnd(HELP.length)];return{fl:1,x:s[0],y:s[1],kind:'help'}}
      if(q<.7){const g=roomGoal(1,[1,2,3,14,15,16]);if(g)g.kind='clean';return g}
      const g=landNear(76,48,12);if(g)g.kind='garden';return g}
    if(p.fl)return r<.4?outGoal(p):indoorGoal(p,r<.75?p.fl:3-p.fl);
    return r<.5?landNear(tx,ty,6):r<.8?randLand():mansionGoal()}
  if(p.cls==='s'){
    if(p.clean&&p.fl&&r<.18)return cleanGoal();
    if(p.role==='Làm vườn')return p.fl?(r<.7?outGoal(p):indoorGoal(p,1)):(r<.75?landNear(76,48,12):mansionGoal());
    if(!p.fl)return mansionGoal();
    if((p.role==='Đầu bếp'||p.role==='Phụ bếp')&&r<.7)return roomGoal(1,[12]);
    return indoorGoal(p,r<.8?p.fl:3-p.fl)}
  if(!p.fl)return mansionGoal();
  return r<.4?roomGoal(2,p.own):indoorGoal(p,r<.7?2:1)}

/* --- Tìm đường trong dinh thự, ngoài đảo, ra vào cổng / cầu thang --- */
function enterNpc(p){people=people.filter(q=>q!==p);p.fl=1;p.x=p.tx=(57+rnd(6))*T+4;p.y=p.ty=52*T+4;p.path=[];ins.push(p)}
function exitNpc(p){ins=ins.filter(q=>q!==p);p.fl=0;p.x=p.tx=(68+rnd(9))*T+4;p.y=p.ty=41*T+4;p.path=[];people.push(p)}
function enterHutNpc(p){people=people.filter(q=>q!==p);p.fl=3;p.x=p.tx=48*T+4;p.y=p.ty=30*T+4;p.path=[];ins.push(p)}
function exitHutNpc(p){ins=ins.filter(q=>q!==p);p.fl=0;p.x=p.tx=(HX+2)*T+4;p.y=p.ty=(HY+4)*T+4;p.path=[];people.push(p)}
function bfsW(sx,sy,tx,ty){
  const pr=new Int32Array(W*H).fill(-1),s0=sy*W+sx,q=[s0];pr[s0]=s0;
  for(let i=0;i<q.length;i++){const c=q[i],x=c%W,y=(c/W)|0;if(x===tx&&y===ty)break;
    for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H)continue;const k=Y*W+X;if(pr[k]>=0||!walkT(X,Y))continue;pr[k]=c;q.push(k)}}
  const e=ty*W+tx;if(pr[e]<0)return null;const o=[];for(let c=e;c!==pr[c];c=pr[c])o.push([(c%W)*T+4,((c/W)|0)*T+4]);return o.reverse()}
function nav(p){/* true = đang di chuyển / chuyển khu vực, false = đã tới đích */
  const g=p.goal,F=p.fl,tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);let gx,gy,pth;
  if(F){
    const t=FL[F].im[ty][tx];
    if(F===3){if(t===45&&(g.out||g.fl!==3)){exitHutNpc(p);return true}if(g.out||g.fl!==3){gx=48;gy=32}else{gx=g.x;gy=g.y;if(tx===gx&&ty===gy)return false}pth=bfs(3,tx,ty,gx,gy);if(pth&&pth.length){p.path=pth;return true}rel(p);p.goal=null;return true}
    if(t===36&&(g.out||g.fl!==F)){p.fl=3-F;p.x=p.tx=(57+rnd(6))*T+4;p.y=p.ty=19*T+4;p.path=[];return true}
    if(t===6&&(g.out||g.fl===3)){exitNpc(p);return true}
    if(g.out||g.fl!==F){if(F===1&&(g.out||g.fl===3)){gx=59+rnd(2);gy=54}else{gx=58+rnd(4);gy=14}}
    else{gx=g.x;gy=g.y;if(tx===gx&&ty===gy)return false}
    pth=bfs(F,tx,ty,gx,gy)
  }else{
    if(!g.out){if(g.fl===3){if(tx===HX+2&&ty===HY+3){enterHutNpc(p);return true}gx=HX+2;gy=HY+3}else{if(m[ty][tx]===DOOR){if(p.cls==='g'&&!p.acc){if(NPCD)p.acc=Math.random()<.4;if(!p.acc){p.goal=null;p.wait=ri(300,700);return true}}enterNpc(p);return true}gx=72;gy=39}}
    else{gx=g.x;gy=g.y;if(tx===gx&&ty===gy)return false}
    pth=bfsW(tx,ty,gx,gy)}
  if(pth&&pth.length){p.path=pth;return true}
  rel(p);p.goal=null;return true}

/* --- Tương tác: NPC trên thuyền và NPC dinh thự gặp nhau thì trò chuyện --- */
const LN={g:['Chào bạn! Bạn cũng sống sót à?','Đảo này lạ quá...','Bạn thấy dinh thự trên đồi chưa?','Cùng đi dạo quanh đảo nhé?'],
  s:['Xin chào, mời ghé dinh thự nghỉ ngơi.','Bữa ăn có ở nhà bếp đấy.','Tôi còn phải dọn dẹp...','Tối nhớ vào phòng nghỉ nhé.'],
  f:['Chào anh chị.','Dinh thự yên tĩnh nhỉ.','Hôm nay trời đẹp nhỉ.','Mời ghé dùng trà.'],
  h:['Tôi phải vào rừng săn tiếp.','Hôm nay nhiều thú lắm.','Thịt tươi, da đẹp đấy.']};
const sayLine=p=>{const n=p.n;if(n.hu>=60)return'Tôi đói quá...';if(n.sl>=60)return'Buồn ngủ quá...';if(n.fa>=70)return'Mệt quá...';const L=LN[p.cls];return L[rnd(L.length)]};
const canTalk=p=>!p.pl&&!p.evt&&p.cd<=0&&p.ph&&p.delay<=0&&(!p.act||p.act==='idle');
function chat(a,b){[a,b].forEach((p,i)=>{p.act='chat';p.t=ri(4,6);p.path=[];p.tx=p.x;p.ty=p.y;p.moving=0;p.turn=i;p.say=sayLine(p)})}
function social(){
  [people.filter(p=>!p.fl),ins.filter(p=>!p.pl)].forEach(L=>{
    for(let i=0;i<L.length;i++){const a=L[i];if(!canTalk(a))continue;
      for(let j=i+1;j<L.length;j++){const b=L[j];if(!canTalk(b)||a.fl!==b.fl)continue;
        if(a.fl&&ridAt(a)!==ridAt(b))continue;
        if(Math.hypot(a.x-b.x,a.y-b.y)<14&&Math.random()<(a.cls==='h'||b.cls==='h'?.015:.05)){chat(a,b);break}}}})}

/* ===== Vẽ ===== */
const SEAC=['#58d0e4','#4cc4e2','#40b0da','#399fd2','#3389c6','#2c77b6','#256599'];
function sea(x,y){
  const h=hs(x,y),px=x*T,py=y*T;let d=Math.min(6,(sd[y]&&sd[y][x])||6);d=Math.round(6-(6-d)*iAlpha);
  cx.fillStyle=SEAC[d];cx.fillRect(px,py,T,T);
  const wv=Math.sin(x*.55+y*.35+frame*.04)+Math.sin(x*.2-y*.5+frame*.027);
  if(GL>.45&&(x*7+y*3+(frame>>3))%29===0){cx.fillStyle='rgba(255,255,255,.3)';cx.fillRect(px+((h>>3)&3),py+((h>>5)&3),3,1)}
  if(wv>1.2-.45*GL){cx.fillStyle=d<3?'rgba(255,255,255,.32)':'rgba(190,230,255,.24)';cx.fillRect(px+1+((h>>3)&3),py+2+((h>>5)&3),4,1)}
  else if(wv<-1.3){cx.fillStyle='rgba(8,30,80,.13)';cx.fillRect(px,py+3,T,2)}
  if(d>=4&&(x*3+y*5+(frame>>5)+(h&3))%11===0){cx.fillStyle='rgba(255,255,255,.35)';cx.fillRect(px+((h>>3)&5),py+((h>>5)&5),1,1)}
  [[0,-1,0,0,T,1],[0,1,0,T-1,T,1],[-1,0,0,0,1,T],[1,0,T-1,0,1,T]].forEach(([a,b,rx,ry,w,hh])=>{
    const r=m[y+b];if(r&&r[x+a]!==undefined&&r[x+a]!==SEA){
      cx.globalAlpha=iAlpha*(.5+.3*Math.sin(frame*.07+x*.7+y*.5));cx.fillStyle='#fff';cx.fillRect(px+rx,py+ry,w,hh);cx.globalAlpha=1}})}
function land(x,y){
  const t=m[y][x];if(t===SEA)return;
  const h=hs(x,y),px=x*T,py=y*T,R=(c,a,b,w,hh)=>{cx.fillStyle=c;cx.fillRect(px+a,py+b,w,hh)};
  if(t===SAND||t===ROCK){R(h%3?'#ecd79d':'#e0c88a',0,0,T,T);if(t===SAND&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>(m[y+b]||[])[x+a]===SEA))R('rgba(150,115,60,.22)',0,0,T,T);if(h%4===0)R('#cdb06b',(h>>4)&7,(h>>7)&7,1,1);if(h%7===0)R('#fff4d6',(h>>5)&7,(h>>9)&7,1,1);return}
  if(t===MTN){const d=hg[y][x];
    R(d<.16?'#eef3f8':d<.26?'#a2a9b3':'#7d838c',0,0,T,T);
    if(x>=46)R('rgba(0,0,0,.18)',4,0,4,T);
    if(h%3===0)R(d<.16?'#c9d3de':'#646a73',(h>>3)&7,(h>>6)&6,2,1);
    R('rgba(255,255,255,.25)',0,0,T,1);
    if(!(m[y+1]&&m[y+1][x]===MTN))R('#4b5059',0,6,T,2);return}
  if(t===COURT||t===DOOR){R(h%2?'#b9b2a2':'#aaa393',0,0,T,T);if(h%5===0)R('#8f8978',(h>>3)&7,(h>>6)&7,2,1);return}
  if(t===CAS){R('#6e6a60',0,0,T,T);return}
  if(t===PIT){const n=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>(m[y+b]||[])[x+a]!==PIT).length;
    if(n){R('#5b6068',0,0,T,T);R('#7d838c',(h>>3)&5,(h>>6)&5,3,2);R('#4f7a3a',(h>>4)&7,(h>>8)&7,3,1);if(m[y+1]&&m[y+1][x]===PIT)for(let i=0;i<3;i++)R('#3f8a35',1+i*3,T-3,1,3)}
    else{R('#0f2a2c',0,0,T,T);if((x*3+y+(frame>>4))%5===0)R('#1f5d57',(h>>3)&5,(h>>6)&5,3,1)}
    return}
  if(t===CLF){
    const up=m[y-1]&&m[y-1][x]===CLF,dn=m[y+1]&&m[y+1][x]===CLF,o=up?0:1+(h&1);
    R('#5aa845',0,0,T,T);R('#6d727c',0,o,T,T-o-(dn?0:(h>>1)&1));
    R('#565b64',(h>>3)&7,up?0:2,2,3+((h>>6)&3));R('#8b919b',(h>>5)&3,(h>>7)&3,3+((h>>9)&1),2);
    R('#9aa0aa',((h>>11)&3)+3,3+((h>>13)&1),2,1);R('#4b4f57',(h>>15)&7,6,2,1);
    if(!up){R('#7e848e',0,o,2,2);R('#7e848e',5+(h&1),o,2,1)}
    if(!dn)R('#3c4048',0,6,T,2);
    if(h%4===0)R('#4f7a3a',(h>>2)&7,(h>>4)&5,2,1);
    return}
  if(t===POOL){R('#1f352b',0,0,T,T);if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>(m[y+b]||[])[x+a]!==POOL)){R('#37503a',0,0,T,1);R('#2a4231',0,T-1,T,1)}
    if((x*5+y*3+(frame>>5))%9===0)R('#4a7a52',(h>>3)&5,(h>>6)&5,3,1);if(h%13===0){R('#3f7a34',(h>>4)&5,(h>>8)&5,3,2);R('#5fa044',(h>>4)&5,(h>>8)&5,1,1)}return}
  if(t===CROCK){R('#6b6f78',0,0,T,T);R('#868c96',(h>>3)&3,0,4,2);R('#4b4f57',0,6,T,2);R('#55595f',(h>>5)&7,(h>>8)&5,2,2);return}
  if(t===GARD){R(h%2?'#7a5230':'#6e4a2a',0,0,T,T);R('#5a3a1e',0,2,T,1);R('#5a3a1e',0,6,T,1);
    const c=[['#ff6b9a','#3f8a35'],['#ffd23f','#3f8a35'],['#e0453a','#2f7d32'],['#b07cff','#3f8a35']][(x*3+y)&3],sw=((frame>>5)+x+y)&1;
    R(c[1],1,3,2,3);R(c[1],5,3,2,3);R(c[0],1,2+sw,2,2);R(c[0],5,2+sw,2,2);
    if((m[y+1]||[])[x]!==GARD)R('#c89a62',0,6,T,2);return}
  if(t===SWAMP||t===DTREE||t===SIGN||t===CAVE){
    R(['#4d5a36','#465230','#53613a'][h%3],0,0,T,T);
    if(h%7===0)R('#2f3b2a',(h>>3)&5,(h>>6)&5,3,2);if(h%5===0)R('#6f8a3a',(h>>4)&7,(h>>8)&7,1,1);if(h%11===0)R('#7a8a3a',(h>>3)&7,2,1,4);
    if((x*7+y*3+(frame>>4))%29===0)R('#8fa86a',(h>>4)&5,(h>>7)&5,1,1);
    if(t===CAVE){R('#5b606a',0,0,T,T);R('#7e8794',0,0,T,2);R('#07060b',1,2,6,6);R('#1a1822',1,2,6,1);if((frame>>4)%6===0)R('#aab4c2',3+((frame>>6)&1),4,1,1)}
    return}
  if(t===PATH){if(y>=96){R(h%2?'#7a5a38':'#6e5030',0,0,T,T);R('#8a6a44',0,0,T,1);R('#3e2a16',0,T-1,T,1);if(h%4===0)R('#3e2a16',(h>>3)&7,3,1,1);return}
    R(h%2?'#b89b6a':'#a98c5c',0,0,T,T);if(h%3===0)R('#d9c39a',(h>>3)&7,(h>>6)&7,2,1);if(h%5===0)R('#7d6a45',(h>>4)&7,(h>>8)&7,1,1);return}
  R((t===PLAT||t===FLOW?['#6bb04e','#64a748','#6fb552']:['#5aa845','#55a141','#5fae4a'])[h%3],0,0,T,T);
  if(h%5===0)R('#3f8a35',(h>>3)&7,(h>>6)&6,1,2);if(h%9===0)R('#7cc462',(h>>4)&7,(h>>8)&7,1,1);
  if(h%13===0){const sw=((frame>>5)+x+y)&1;R('#3a8230',(h>>4)&5,3,1,3);R('#78cc5e',((h>>4)&5)+1+sw,2,1,2)}
  if(h%29===0){R('#2f6f2b',2,2,1,1);R('#ffb4d2',2,1,1,1)}
  if(h%7===3){const sw2=((frame>>4)+x)&1;R('#4a9a3a',(h>>6)&5,4,1,3);R('#6dbb52',((h>>6)&5)+sw2,3,1,1)}
  if(GL>.5&&h%11===5)R('rgba(80,115,160,'+(.25*GL).toFixed(2)+')',(h>>3)&3,(h>>5)&3,4,2);
  if(t===FLOW)for(let i=0;i<3;i++)R(['#ff6b9a','#ffd23f','#ffffff','#b07cff'][(h>>(i*3))&3],(h>>(i*2+1))&7,(h>>(i+5))&7,1,1)}
function tree(x,y){
  const h=hs(x,y),px=x*T,py=y*T,v=h%3,sw=Math.round(Math.sin(frame*.03+x*.9+y*.4)*.8),
    c=v===0?['#184a22','#2a8236','#4cbc58']:v===1?['#205f29','#35a043','#7ad56e']:['#2b6a2a','#3f9f45','#9ad974'],
    R=(cc,a,b,w,hh)=>{cx.fillStyle=cc;cx.fillRect(px+a,py+b,w,hh)};
  R('rgba(0,0,0,.18)',-1,7,10,1);R('rgba(0,0,0,.28)',0,6,9,2);
  R('#4a2f17',3,4,2,4);R('#6b4423',3,4,1,4);
  if(v===0){R(c[0],3+sw,-6,2,1);R(c[1],2+sw,-5,4,1);R(c[0],2+sw,-4,4,1);R(c[1],1+sw,-3,6,1);R(c[0],1,-2,6,1);R(c[1],0,-1,T,2);R(c[0],0,1,T,1);R(c[1],1,2,6,2);R(c[0],0,4,T,1);R(c[2],3+sw,-5,1,1);R(c[2],2,-1,2,1)}
  else{R(c[0],3+sw,-5,2,1);R(c[1],2+sw,-4,4,1);R(c[0],1+sw,-3,6,1);R(c[1],0+(sw>>1),-2,T,3);R(c[0],0,1,T,2);R(c[1],1,3,6,1);R(c[0],0,4,T,1);R(c[2],2+sw,-3,2,1);R(c[2],1,-1,2,1);if(h%7===0){R('#ff5252',5,1,1,1);R('#ff5252',2,2,1,1)}}
  R('rgba(0,0,0,.22)',5,0,3,4)}
function rock(x,y){const px=x*T,py=y*T,R=(c,a,b,w,hh)=>{cx.fillStyle=c;cx.fillRect(px+a,py+b,w,hh)};
  R('#8a8f98',2,4,4,3);R('#b9bec6',2,4,2,1);R('#5b606a',2,6,4,1)}
/* ===== Sprite pixel-art có viền + đổ bóng ===== */
const SW=24,SH=30,OX=12,OY=28,SPR=new Map();
const ROLELOOK={'Quản gia':'butler','Chủ nhân':'master','Phu nhân':'madam','Cậu chủ':'boy','Tiểu thư':'miss'};
const lookOf=p=>p.look||ROLELOOK[p.role]||(p.pl?['pA','pB','pC','pD'][(p.pl-1)%4]:null);
const LOOKHT={pA:18,pB:18,pC:20,pD:18,pE:18,pF:19,pG:18,butler:18,miss:18,boy:16,master:19,madam:22};
const hOf=p=>{const l=lookOf(p);if(LOOKHT[l])return LOOKHT[l];if(p.k==='child')return 16;
  return {'Đầu bếp':22,'Phụ bếp':20,'Làm vườn':20,'Thợ săn':20}[p.role]||18};
const LG=(R,c,sh,s)=>{const a=s===2?1:0,b=s===1?1:0;R(c,-2,-4,2,3-a);R(sh,-2,-1-a,2,1);R(c,0,-4,2,3-b);R(sh,0,-1-b,2,1)};
const KID=(R,s,o)=>{const a=s===2?1:0,b=s===1?1:0;
  R(o.bt,-2,-3,2,2-a);R(o.sh,-2,-1-a,2,1);R(o.bt,0,-3,2,2-b);R(o.sh,0,-1-b,2,1);
  R(o.top,-3,-8,6,4);R(o.top,-4,-8,1,3);R(o.top,3,-8,1,3);R(o.sk,-4,-5,1,1);R(o.sk,3,-5,1,1);
  if(o.bt!==o.top){R(o.bt,-2,-7,4,4);R(o.bt,-3,-4,6,1)}
  R(o.sk,-3,-13,6,5);R(o.h,-3,-15,6,3);R(o.h,-4,-14,1,3);R(o.h,3,-14,1,3);R(o.h,-1,-16,2,1);
  R('#2a1c14',-2,-11,1,1);R('#2a1c14',1,-11,1,1);R('#c25a4a',-1,-9,2,1)};
const LOOKS={
 pA:(R,s)=>{const sk='#fbe6da',h='#c8ccd4';
  LG(R,'#f4f4f6','#1d1d22',s);
  R('#a9794a',-4,-10,8,7);R('#85582f',2,-10,2,7);R('#85582f',-4,-4,8,1);R('#a9794a',-5,-10,1,6);R('#a9794a',4,-10,1,6);
  R('#fff',-1,-9,2,5);R('#1d1d22',-1,-10,2,1);R('#d4a85f',-3,-8,1,1);R('#d4a85f',-3,-6,1,1);R(sk,-5,-4,1,1);R(sk,4,-4,1,1);
  R(sk,-3,-15,6,5);R(h,-3,-17,6,2);R(h,-4,-16,1,3);R(h,3,-16,1,3);R(h,-3,-15,2,1);R(h,1,-15,2,1);R(h,-2,-18,2,1);R(h,1,-18,2,1);
  R('#1d1d22',-2,-13,1,1);R('#1d1d22',1,-13,1,1);R('#555',-3,-14,2,1)},
 pB:(R,s)=>{const sk='#fde6da',h='#eceef4';
  LG(R,sk,'#e6e6ea',s);
  R(h,-4,-12,1,7);R(h,3,-12,1,7);
  R('#8e1f35',-4,-7,8,3);R('#8e1f35',-5,-5,10,1);R('#6e1527',-4,-5,8,1);
  R('#f7f7f9',-3,-10,6,3);R('#f7f7f9',-4,-10,1,2);R('#f7f7f9',3,-10,1,2);R('#d5d5dc',2,-10,1,3);R(sk,-5,-9,1,3);R(sk,4,-9,1,3);
  R(sk,-3,-15,6,5);R(h,-3,-17,6,2);R(h,-4,-16,1,5);R(h,3,-16,1,5);R(h,-3,-15,3,1);R(h,1,-15,1,1);
  R('#b5172e',-2,-13,1,2);R('#b5172e',1,-13,1,2)},
 pC:(R,s)=>{const sk='#f2d2ae',h='#1b1b22';
  LG(R,'#2a2530','#111',s);
  R('#eceff2',-4,-10,8,6);R('#c8ccd2',2,-10,2,6);R('#eceff2',-5,-9,1,5);R('#eceff2',4,-9,1,5);R(sk,-5,-4,1,1);R(sk,4,-4,1,1);
  R('#16161c',-1,-10,2,1);R('#16161c',-1,-9,1,5);R('#2a2530',-4,-5,8,1);
  R(sk,-3,-15,6,5);R(h,-3,-17,6,2);R(h,-1,-19,2,3);R('#3a3a46',-3,-15,1,2);R('#3a3a46',2,-15,1,2);R(h,-2,-15,4,1);
  R('#16161c',-2,-13,1,1);R('#16161c',1,-13,1,1);R(h,-3,-14,2,1)},
 pD:(R,s)=>{const sk='#f7ddd0',h='#241c2b',pk='#e8548a';
  LG(R,sk,'#2a2a30',s);
  R('#1d1d24',-4,-7,8,3);R('#1d1d24',-5,-5,10,1);R('#f4f4f6',-3,-10,6,3);R('#f4f4f6',-4,-10,1,2);R('#f4f4f6',3,-10,1,2);R('#d5d5db',2,-10,1,3);
  R('#14141a',-1,-7,2,1);R(sk,-5,-9,1,3);R(sk,4,-9,1,3);
  R(sk,-3,-15,6,5);R(h,-3,-17,6,2);R(h,-4,-16,1,5);R(h,3,-16,1,5);R(pk,-4,-13,1,3);R(h,-3,-15,2,1);R(h,1,-15,2,1);
  R('#1a1420',-2,-13,1,2);R('#1a1420',1,-13,1,2)},
 pE:(R,s)=>{const sk='#e8c9a8',h='#2a1f1a';
  LG(R,'#2b2b33','#111',s);
  R('#1b1b20',-4,-10,8,6);R('#1b1b20',-5,-10,1,6);R('#1b1b20',4,-10,1,6);R('#2c2c34',2,-10,2,6);
  R('#f2f2f2',-1,-9,2,5);R(sk,-5,-4,1,1);R(sk,4,-4,1,1);
  R(sk,-3,-15,6,5);R(h,-3,-17,6,2);R(h,-2,-18,3,1);R(h,-4,-16,1,4);R(h,3,-16,1,4);R(h,-3,-15,2,1);R(h,1,-15,2,1);
  R('#1d1d22',-2,-13,1,1);R('#1d1d22',1,-13,1,1)},
 pF:(R,s)=>{const sk='#efd9cc',h='#e6e8ee';
  LG(R,'#17171c','#0a0a0d',s);
  R('#222228',-4,-10,8,6);R('#222228',-5,-10,1,6);R('#222228',4,-10,1,6);R('#34343c',2,-10,2,6);
  R('#f4f4f6',-1,-10,2,4);R('#111',0,-9,1,4);R(sk,-5,-4,1,1);R(sk,4,-4,1,1);
  R(sk,-3,-15,6,5);R(h,-3,-17,6,2);R(h,-2,-18,3,1);R(h,-4,-16,1,4);R(h,3,-16,1,4);R(h,-3,-15,3,1);R(h,1,-15,2,1);
  R('#1d1d22',-2,-13,1,1);R('#1d1d22',1,-13,1,1)},
 pG:(R,s)=>{const sk='#fde8da',h='#e8c26a',h2='#c99a3e';
  LG(R,sk,'#6b4a2a',s);
  R('#5a4630',-4,-6,8,2);R('#5a4630',-5,-5,10,1);
  R(sk,-4,-10,8,2);R('#f3ead6',-4,-8,8,4);R('#e8c33a',-3,-10,1,2);R('#e8c33a',2,-10,1,2);R(sk,-5,-9,1,3);R(sk,4,-9,1,3);
  R(h,-4,-14,1,8);R(h,3,-14,1,8);R(h2,-4,-10,1,1);R(h2,3,-8,1,1);
  R(h,-6,-17,2,4);R(h,4,-17,2,4);R(h2,-6,-15,1,1);R(h2,5,-15,1,1);
  R(sk,-3,-15,6,5);R(h,-3,-17,6,2);R(h2,-1,-17,2,1);R(h,-3,-15,2,2);R(h,1,-15,2,2);
  R('#3a2a1a',-2,-13,2,1);R('#3a2a1a',1,-13,2,1);R('#e87a7a',-1,-11,2,1)},
 butler:(R,s)=>{const sk='#e8cdbd',h='#dcdce0';
  LG(R,'#1b1b20','#0c0c10',s);
  R('#3e3e46',-4,-10,8,6);R('#2b2b31',-2,-9,4,4);R('#f2f2f2',-1,-10,2,2);R('#c9b46a',0,-8,1,1);R('#c9b46a',0,-6,1,1);
  R('#3e3e46',-5,-10,1,6);R('#3e3e46',4,-10,1,6);R(sk,-5,-4,1,1);R(sk,4,-4,1,1);
  R(sk,-3,-15,6,5);R(h,-3,-17,6,2);R(h,-4,-16,1,3);R(h,3,-16,1,8);R(h,-3,-15,1,2);
  R('#111',-3,-14,3,2);R('#b0273a',1,-13,1,1);R('#6a4a46',0,-12,1,1);R('#6a4a46',2,-14,1,1);R('#b79a8a',-1,-11,2,1)},
 miss:(R,s)=>{const sk='#fbe2d4',h1='#b890dc',h2='#eaa6bd',dr='#1c1a22';
  LG(R,sk,'#18161d',s);
  R(dr,-4,-9,8,5);R(dr,-5,-5,10,1);R(sk,-4,-10,8,1);R(sk,-5,-9,1,3);R(sk,4,-9,1,3);
  R(sk,-3,-15,6,5);R(h1,-3,-17,6,2);R(h1,-4,-16,1,2);R(h1,3,-16,1,2);R(h2,-4,-14,1,5);R(h2,3,-14,1,5);R(h1,-3,-15,2,1);R(h1,1,-15,2,1);
  R('#15121a',-2,-10,4,1);R('#9b5de5',0,-10,1,1);R('#7a3fc8',-4,-11,1,2);R('#7a3fc8',3,-11,1,2);
  R('#3a3030',-2,-13,1,2);R('#3a3030',1,-13,1,2);R('#5a4a5a',-3,-14,2,1)},
 boy:(R,s)=>{KID(R,s,{sk:'#fde0cc',h:'#5a4030',top:'#f2ead0',bt:'#7090b6',sh:'#6b6f7a'});
  R('#fff',-1,-6,2,2);R('#222',-1,-6,1,1);R('#ddd',4,-8,1,4);R('#e0453a',3,-11,3,3);R('#ffd23f',4,-10,1,1)},
 master:(R,s)=>{const sk='#f6dcc4',h='#dcb870',co='#22222b',ma='#7a1a2a';
  LG(R,'#1a1a20','#0b0b0e',s);
  R(co,-4,-10,8,5);R(co,-4,-5,2,3);R(co,2,-5,2,3);R(ma,-4,-4,1,2);R(ma,3,-4,1,2);
  R('#f4f4f4',-1,-9,2,3);R('#6c6c78',-1,-7,2,3);R(ma,-3,-10,1,5);R(ma,2,-10,1,5);
  R(co,-5,-10,1,6);R(co,4,-10,1,6);R(sk,-5,-4,1,1);R(sk,4,-4,1,1);R('#a3202a',-2,-10,4,1);
  R(sk,-3,-15,6,5);R(h,-3,-17,6,2);R(h,-4,-16,1,3);R(h,3,-16,1,3);R(h,-3,-15,2,1);R(h,2,-15,1,1);R(h,-2,-18,2,1);R(h,1,-18,1,1);
  R('#8a8450',-2,-13,1,1);R('#8a8450',1,-13,1,1)},
 madam:(R,s)=>{const sk='#f6dcc8',dr='#1d1b22';
  LG(R,dr,'#0c0b0f',s);
  R(dr,-4,-10,8,7);R(dr,-5,-4,10,2);R('#2c2a34',2,-10,2,7);
  R('#e8e8ec',-1,-10,2,1);R('#e8e8ec',-2,-9,1,1);R('#e8e8ec',1,-9,1,1);R('#e8e8ec',0,-8,1,1);
  R(dr,-5,-10,1,5);R(dr,4,-9,1,3);R('#f4f4f6',2,-8,4,3);R('#fbe6da',5,-9,2,2);
  R(sk,-3,-15,6,5);R('#2b2018',-3,-16,6,1);R('#2b2018',-4,-15,1,3);R('#2b2018',-6,-14,2,2);
  R('#14121a',-8,-17,16,2);R('#14121a',-4,-21,8,5);R('#2e2b36',-4,-18,8,1);
  R('#222',-2,-13,1,1);R('#222',1,-13,1,1);R('#c2605a',-1,-11,2,1)}
};
function generic(R,s,p){
  const k=p.k,sk=p.skin,h=p.hair,c=p.c,r=p.role,wm=k==='woman';
  if(k==='child'){KID(R,s,{sk,h,top:c,bt:'#4a5a8a',sh:'#2b2b33'});return}
  if(wm)LG(R,sk,'#2b2b33',s);else LG(R,r==='Thợ săn'?'#4a3a22':'#2b2b33','#111',s);
  if(wm){R(c,-4,-10,8,6);R(c,-5,-5,10,1)}else R(c,-4,-10,8,6);
  R('rgba(255,255,255,.2)',-4,-10,1,5);R('rgba(0,0,0,.22)',3,-10,1,5);
  R(c,-5,-10,1,5);R(c,4,-10,1,5);R(sk,-5,-5,1,1);R(sk,4,-5,1,1);
  R(sk,-3,-15,6,5);R(h,-3,-17,6,2);R(h,-4,-16,1,wm?7:3);R(h,3,-16,1,wm?7:3);R(h,-3,-15,2,1);
  R('#222',-2,-13,1,1);R('#222',1,-13,1,1);
  if(k==='elder')R('#6b4423',5,-8,1,8);
  if(r==='Giúp việc'){R('#f4f4f4',-2,-9,4,5);R('#f4f4f4',-3,-17,6,1)}
  if(r==='Đầu bếp'){R('#fff',-3,-10,6,6);R('#fff',-3,-20,6,3);R('#fff',-2,-21,4,1)}
  if(r==='Phụ bếp'){R('#fff',-3,-10,6,6);R('#fff',-3,-19,6,2)}
  if(r==='Thợ săn'){R('#4a2f17',-4,-17,8,1);R('#6b4423',-3,-19,6,2);R('#2b2b33',5,-14,1,10);R('#8b5a2b',5,-6,1,3)}
  if(r==='Làm vườn'){R('#c9a64b',-5,-17,10,1);R('#c9a64b',-3,-19,6,2)}}
function sprite(p,s){
  const l=lookOf(p),key=l?l+'|'+s:[p.k,p.role||'',p.c,p.skin,p.hair,s].join('|');
  let c=SPR.get(key);if(c)return c;
  c=document.createElement('canvas');c.width=SW;c.height=SH;const g=c.getContext('2d');
  const R=(col,a,b,w,h)=>{g.fillStyle=col;g.fillRect(OX+a,OY+b,w,h)};
  (LOOKS[l]||((R,s)=>generic(R,s,p)))(R,s);
  const id=g.getImageData(0,0,SW,SH),d=id.data,A=(x,y)=>x>=0&&y>=0&&x<SW&&y<SH&&d[(y*SW+x)*4+3]>=128,o=[];
  for(let y=0;y<SH;y++)for(let x=0;x<SW;x++)if(!A(x,y)&&(A(x+1,y)||A(x-1,y)||A(x,y+1)||A(x,y-1)))o.push(y*SW+x);
  o.forEach(i=>{d[i*4]=23;d[i*4+1]=18;d[i*4+2]=31;d[i*4+3]=255});
  g.putImageData(id,0,0);SPR.set(key,c);return c}
function person(p){
  const x=Math.round(p.x),y=Math.round(p.y),H0=hOf(p),R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(x+a,y+b,w,h)},
    s=p.moving?1+((frame>>3)&1):0,spr=sprite(p,p.act==='sleep'?0:s);
  cx.globalAlpha=1;cx.imageSmoothingEnabled=false;
  if(p.act==='sleep'){
    R('rgba(0,0,0,.25)',-9,-1,18,2);
    cx.save();cx.translate(x+8,y-3);cx.rotate(-Math.PI/2);cx.drawImage(spr,-OX,-OY);cx.restore();
    cx.font='6px monospace';cx.textAlign='center';cx.lineWidth=2;cx.strokeStyle='#000';
    cx.strokeText('Zzz',x,y-14-((frame>>5)&1));cx.fillStyle='#fff';cx.fillText('Zzz',x,y-14-((frame>>5)&1));return}
  R('rgba(0,0,0,.2)',-5,-1,10,2);
  if(p.pl&&p.pl===sel&&state==='island')R('#fff',-5,0,10,1);
  cx.drawImage(spr,x-OX,y-OY+(p.seat?2:0));
  if(p.loot&&(p.loot.meat||p.loot.pelt)){R('#8a6a3a',-9,-H0+6,3,5);R('#c0392b',-9,-H0+8,3,2);R('#e8a0a0',-8,-H0+8,1,1)}
  if(p.role){cx.font='6px monospace';cx.textAlign='center';cx.lineWidth=2;cx.strokeStyle='#000';cx.strokeText(p.role,x,y-H0-3);cx.fillStyle='#ffe9a8';cx.fillText(p.role,x,y-H0-3)}
  if(p.owner&&(p.os==='meet'||p.os==='tend')&&!TK){const bb=(frame>>4)&1,y0=-H0-17+bb;R('#000',-4,y0-1,9,1);for(let i=0;i<4;i++){const ww=7-2*i;R('#000',-(ww>>1)-1,y0+i,ww+2,1);R('#ffd23f',-(ww>>1),y0+i,ww,1)}R('#000',0,y0+4,1,1)}
  if(p.pl){const b=(frame>>4)&1;R(p.c,-2,-H0-6-b,5,1);R(p.c,-1,-H0-5-b,3,1);R(p.c,0,-H0-4-b,1,1);
    cx.font='bold 6px monospace';cx.textAlign='center';cx.lineWidth=2;cx.strokeStyle='#000';cx.strokeText('P'+p.pl,x,y-H0-8-b);cx.fillStyle='#fff';cx.fillText('P'+p.pl,x,y-H0-8-b)}
  const ic={eat:'🍴',rest:'💭',clean:'🧹',cook:'🍳',garden:'🌱'}[p.act];
  if(ic){cx.font='7px sans-serif';cx.textAlign='center';cx.fillText(ic,x,y-H0-(p.role?12:4))}
  if(p.act==='chat'&&p.say&&((frame>>6)&1)===p.turn){
    cx.font='6px monospace';const w2=cx.measureText(p.say).width+6,y2=y-H0-(p.role?12:6);
    cx.fillStyle='rgba(255,255,255,.93)';cx.fillRect(Math.round(x-w2/2),y2-9,Math.round(w2),9);
    cx.fillStyle='#111';cx.textAlign='center';cx.fillText(p.say,x,y2-2)}
  if(p.shout){R('#9ad7ff',5,-14,3,2);R('#d9dde3',6,-12,1,3);bub(x,y-H0-(p.role?12:6),p.shout)}}
function boat(){
  const bob=state==='title'||state==='sail'?Math.sin(frame*.05)*1.5:0,R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(a,b,w,h)};
  cx.save();cx.translate(Math.round(bx),Math.round(by+bob));
  if(crashT>=0){cx.translate(34,6);cx.rotate(-.08);cx.translate(-34,-6)}
  for(let r=0;r<6;r++)R(r?'#7a4a24':'#a8744b',r,r,34-3*r,1);
  R('#c08a50',0,0,34,1);R('#c0392b',2,2,28,1);
  R('#f3efe2',8,-7,13,7);R('#8aa6c1',10,-5,3,3);R('#8aa6c1',15,-5,3,3);R('#c0392b',7,-8,15,2);
  R('#444',24,-10,3,6);R('#d8d8d8',24,-11,3,1);R('#999',3,-10,1,10);R('#e0533d',4,-10,5,3);
  cx.globalAlpha=.6;R('#fff',-1,6,36,1);cx.globalAlpha=1;cx.restore()}
function puff(x,y,n,cols,g,vy,life){
  for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*1.6,vy:vy-Math.random()*1.2,g,l:life+rnd(20),c:cols[rnd(cols.length)],s:1+rnd(2)})}

/* ===== Vòng lặp ===== */
function step(){
  frame++;GL=gloomK();const now=performance.now(),dt=Math.min(.25,(now-last)/1000);last=now;DM=dt;
  if(trans){trans.t+=.04;if(!trans.done&&trans.t>=1){trans.cb();trans.done=1}if(trans.t>=2)trans=null}
  if(state==='title')bx=30+Math.sin(frame*.01)*10;
  else if(state==='sail'){
    iAlpha=Math.min(1,iAlpha+.02);bx+=.8;
    if(bx>=tbx){bx=tbx;state='crash';crashT=0;shake=30;puff(bx+34,by+6,30,['#fff','#cfeaf7','#8a5a2b'],.06,-.8,40);cap('RẦM! Con thuyền đâm vào bờ đảo!')}
  }else if(state==='crash'){
    if(++crashT===45){state='land';mkPeople();cap('Mọi người lần lượt bước xuống đảo... Một người đang đi ra từ ngôi nhà gần dinh thự.')}
  }else{
    people.slice().forEach(upd);ins.slice().forEach(upd);if(state==='island')ctrl();if(frame%30===0)social();
    if(state==='land'&&people.every(p=>p.ph)&&OW&&OW.os!=='out'){
      state='island';gm=0;snap.day=snap.week=snapshot();save();showHud();cap('Chủ đảo đã tới! Lại gần người có mũi tên ▼ rồi bấm E để nói chuyện.')}
    if(state==='island'){
      ghostTick();signTick();
      if(!trans){doors();if(inside)roomCheck()}const d0=day();gm+=dt;dineTick();
      if(day()!==d0){snap.day=snapshot();if((day()-1)%7===0)snap.week=snap.day;save();cap('Ngày '+day()+' bắt đầu.')}
      if(Math.floor(gm)!==lastMin){lastMin=Math.floor(gm);clockUI()}
      if(frame%300===0)save();
      if(frame%6===0)tkUI();
      if(!inside&&nightK()>.5&&frame%14===0){const fx=camX+rnd(CW),fy=camY+rnd(CH);if(walkT(Math.floor(fx/T),Math.floor(fy/T)))parts.push({x:fx,y:fy,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.3,g:0,l:120+rnd(90),c:'#e8ff8a',s:1})}
      if(frame%12===0)puff(bx+25,by-12,1,['#8a8f98','#b9bec6'],-.01,-.3,50)}}
  parts=parts.filter(q=>--q.l>0);parts.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=q.g});cam()}
function castle(){
  const R=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h)},X=CX0*T,Y=CY0*T,S='#7b8087',L='#9aa0a8',D='#555b63',K='#3b4350',G='#1d2230';
  const bricks=(x,y,w,h)=>{for(let j=2;j<h;j+=4){R(D,x,y+j,w,1);for(let i=((j>>2)&1)*3;i<w;i+=6)R(D,x+i,y+j-2,1,2)}};
  const merl=(x,y,w)=>{for(let i=0;i<w;i+=6){R(S,x+i,y-3,4,3);R(L,x+i,y-3,4,1)}};
  const win=(x,y)=>{R(G,x,y+2,3,6);R(G,x+1,y,1,2);R(L,x-1,y+2,1,6)};
  const spire=(mx,top,w,h)=>{for(let i=0;i<h;i++){const ww=Math.max(1,Math.round(w*(i+1)/h));R(K,mx-(ww>>1),top+i,ww,1)}R('#222a36',mx,top,1,h)};
  const drum=(x,y,w,h)=>{R(S,x,y,w,h);R(D,x,y,4,h);R('#8b9199',x+(w>>2),y,w>>1,h);R(D,x+w-5,y,5,h);bricks(x,y,w,h);R(D,x-2,y-2,w+4,3);merl(x-2,y-2,w+4)};
  R('rgba(0,0,0,.14)',X-22,Y+48,164,5);R('rgba(0,0,0,.3)',X-16,Y+46,152,5);
  R(S,X,Y+16,128,32);bricks(X,Y+16,128,32);merl(X,Y+16,128);R(D,X,Y+44,128,4);
  for(let i=24;i<110;i+=18)win(X+i,Y+24);
  R(S,X+16,Y-12,14,30);R(D,X+27,Y-12,3,30);bricks(X+16,Y-12,14,30);merl(X+16,Y-12,14);win(X+21,Y-4);spire(X+23,Y-30,18,18);
  R(S,X+38,Y-30,52,46);R(L,X+38,Y-30,2,46);R(D,X+86,Y-30,4,46);bricks(X+38,Y-30,52,46);merl(X+38,Y-30,52);
  R(D,X+56,Y-30,1,46);R(D,X+71,Y-30,1,46);
  [[46,-18],[60,-24],[75,-18],[46,-2],[75,-2]].forEach(([i,j])=>win(X+i,Y+j));
  R(G,X+62,Y+4,4,8);R(G,X+63,Y+2,2,2);
  spire(X+41,Y-52,7,22);spire(X+87,Y-52,7,22);
  R(S,X+96,Y-50,16,66);R(D,X+108,Y-50,4,66);R(L,X+96,Y-50,2,66);bricks(X+96,Y-50,16,66);merl(X+96,Y-50,16);
  win(X+102,Y-40);win(X+102,Y-22);win(X+102,Y-4);spire(X+104,Y-74,20,24);R('#9aa0ac',X+104,Y-86,1,12);for(let i=0;i<6;i++)R('#da251d',X+105+i,Y-86+Math.round(Math.sin(frame*.15+i*.8)*.8),1,3);
  drum(X-14,Y+6,36,42);drum(X+110,Y+10,22,38);
  R(G,X+56,Y+34,8,14);R(G,X+57,Y+32,6,2);R('#6b4423',X+57,Y+36,6,12);R('#3a2a18',X+60,Y+36,1,12);R(L,X+55,Y+32,1,16);R(L,X+64,Y+32,1,16);
  for(let i=0;i<128;i+=5)if((i*7)%3===0)R('#4f7a3a',X+i,Y+45,3,2);
  R('rgba(210,218,228,.2)',X-16,Y-62,160,54)}
function hut(){
  const R=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h)},x=HX*T,y=HY*T;
  R('rgba(0,0,0,.25)',x-2,y+22,36,4);R('#9c6b3f',x,y+6,32,18);
  for(let i=0;i<18;i+=3)R('#7a4f2a',x,y+6+i,32,1);
  R('#6b4423',x,y+6,2,18);R('#6b4423',x+30,y+6,2,18);
  for(let i=0;i<10;i++){const ww=8+Math.round(i*3.1);R(i%2?'#8a4b2a':'#9a5a34',x+16-(ww>>1),y-4+i,ww,1)}
  R('#5a3a1e',x-2,y+6,36,2);R('#6d727c',x+24,y-8,5,8);
  R('#4a2f17',x+13,y+12,6,12);R('#ffd23f',x+4,y+11,5,5);R('#4a2f17',x+4,y+13,5,1);R('#4a2f17',x+6,y+11,1,5);
  cx.globalAlpha=.4;R('#ddd',x+25+((frame>>4)%3),y-12-((frame>>3)%6),3,2);cx.globalAlpha=1}
function camp(){
  const R=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h)},x=CAMPX*T,y=CAMPY*T,f=(frame>>2)%3;
  R('rgba(0,0,0,.25)',x-18,y+8,44,3);
  [[-16,3,8],[12,3,8],[-8,12,8],[4,12,8],[-4,-9,8]].forEach(([a,b,w])=>{R('#4a2f17',x+a,y+b+2,w,3);R('#8a5a2e',x+a,y+b,w,3);R('#b8864f',x+a,y+b,w,1)});
  R('#555a63',x-2,y+4,12,4);R('#8a8f98',x-2,y+3,12,2);R('#3a3a40',x,y+5,8,2);
  R('#ff5a1f',x+1,y-1-f,6,5+f);R('#ff8a3d',x+2,y-3-f,4,5+f);R('#ffd23f',x+3,y-1-f,2,4);
  cx.globalAlpha=.4;R('#ddd',x+3+((frame>>4)%3),y-9-((frame>>3)%8),2,2);cx.globalAlpha=1}
function well(){
  const R=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h)},x=WX*T,y=WY*T;
  R('rgba(0,0,0,.25)',x-1,y+14,18,3);R('#8d8a80',x,y+7,16,9);R('#a8a498',x,y+6,16,2);R('#6f6c63',x,y+13,16,3);
  R('#7d7a70',x+3,y+10,2,2);R('#7d7a70',x+9,y+12,3,2);R('#14201f',x+3,y+6,10,2);
  R('#8a5a2e',x+1,y-5,2,12);R('#8a5a2e',x+13,y-5,2,12);R('#6b4423',x+7,y-3,2,8);
  for(let i=0;i<6;i++){const ww=10+i*3;R(i%2?'#9c6b3f':'#8a5a2e',x+8-(ww>>1),y-12+i,ww,1)}}
/* Nhà 2 tầng của chủ đảo: tháp trắng bên trái, tường kem, mái xám, cửa gỗ nâu, ban công */
function owHouse(){
  const R=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(HSX*T+x,HSY*T+y,w,h)},W0='#f4f1ea',SH='#d3cdbd',BW='#8a3b22',DK='#5a2412';
  R('rgba(0,0,0,.25)',-2,46,68,3);
  R('#efe3b8',18,8,46,38);R(SH,18,8,46,2);
  R('#6d727c',18,-2,46,8);R('#8a8f98',18,-2,46,1);R('#555a63',18,6,46,2);
  R(W0,0,0,20,48);R(SH,18,0,2,48);R(W0,-2,-3,24,3);R(W0,2,-7,16,4);R(SH,2,-4,16,1);
  R(W0,8,-14,4,7);R(W0,9,-19,2,5);R(SH,8,-6,4,3);R('#8ec6ee',9,-5,2,1);
  R(W0,58,8,6,40);R(SH,58,8,1,40);R(W0,16,8,48,2);
  R(W0,0,27,64,2);R(SH,0,29,64,1);
  R(W0,5,10,10,12);R(BW,7,12,6,10);R(BW,8,11,4,1);R(DK,10,12,1,10);
  R(W0,2,22,16,1);for(let i=0;i<7;i++)R(W0,3+i*2,23,1,3);R(W0,1,26,18,1);
  R(W0,28,12,22,12);R(BW,30,14,18,8);R(W0,38,14,1,8);
  R(W0,5,30,14,2);R(DK,6,32,12,16);R(BW,7,33,10,15);R(DK,11,33,1,15);R('#ffd23f',9,41,1,1);R('#ffd23f',13,41,1,1);
  R(W0,28,34,22,12);R(BW,30,36,18,8);R(W0,38,36,1,8);
  R(SH,0,46,64,2);R('#bfc4c8',4,48,16,2);R('#a3a8ad',4,50,16,1);
  R('#2f8f3a',30,40,8,6);R('#4fc05a',31,40,4,2);R('#ff6b9a',34,42,1,1)}
/* ===== Dinh thự 2 tầng: tầng 1 (sảnh, phòng chung, phòng người làm) / tầng 2 (phòng khách, phòng gia đình) ===== */
const IW=170,IH=104,CAVEZ=420,IS0=CW/320;let IS=IS0,FL=[],wf=1,curF=1,curR=1,hudOn=true;
const iw=t=>t===0||t===2||t===30||t===32||t===33||t===44;
const ridAt=p=>{const r=FL[p.fl||1].rid[Math.floor(p.y/T)];return r?r[Math.floor(p.x/T)]|0:0};
function roomCheck(){
  const P=ins.find(p=>p.pl===sel);if(!P)return;const r=ridAt(P);
  if(P.fl===6){if(r&&r!==curR){curR=r;curF=6;cap('Bạn đang ở: '+FL[6].RM[r].n)}return}/* trong hang: không đen màn, vẽ cả hang cùng lúc */
  if(r&&(P.fl!==curF||r!==curR))trans={t:0,cb:()=>{const Q=ins.find(p=>p.pl===sel);if(!Q)return;const q=ridAt(Q);curF=Q.fl;if(q)curR=q;cap('Bạn bước vào: '+FL[curF].RM[curR].n+(curF===2?' (tầng 2)':''))}}}
function build(f){
  const im=Array.from({length:IH},()=>Array(IW).fill(1)),rid=Array.from({length:IH},()=>Array(IW).fill(0)),RM=[];
  const fill=(id,a,b,c,d,t)=>{for(let y=b;y<=d;y++)for(let x=a;x<=c;x++){im[y][x]=t||0;rid[y][x]=id}};
  const rm=(id,n,fl,x0,y0,x1,y1,s)=>{const r={n,f:fl,x0,y0,x1,y1,s};RM[id]=r;fill(id,x0,y0,x1,y1);return r};
  const put=(r,t,dx,dy,w,h)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++){const x=r.x0+dx+i,y=r.s>0?r.y0+dy+j:r.y1-dy-j;if(x>=r.x0&&x<=r.x1&&y>=r.y0&&y<=r.y1)im[y][x]=t}};
  const win=r=>{const y=r.s>0?r.y0-1:r.y1+1;for(let x=r.x0+1;x<=r.x1-1;x+=3)im[y][x]=25};
  const BF=['#8a6d4b','#7d6244'],CF=['#9c917a','#a89e86'],HF=['#b4a58a','#a89878'],OAK=30,BIR=32;
  const bedroom=r=>{put(r,20,0,0,2,1);put(r,21,0,1,2,2);put(r,23,4,0,2,1);put(r,22,4,2,2,1);put(r,24,0,4,2,1);win(r)};
  const duo=r=>{put(r,20,0,0,2,1);put(r,21,0,1,2,2);put(r,20,4,0,2,1);put(r,21,4,1,2,2);put(r,22,2,0,2,1);put(r,24,0,4,2,1);put(r,24,4,4,2,1);win(r)};
  /* Sảnh + cầu thang ở đầu sảnh (hàng y=14 là bậc lên/xuống) */
  const yb=f===1?53:30,h=rm(1,f===1?'Sảnh chính':'Sảnh tầng 2',HF,48,14,71,yb,1);win(h);
  if(f===1){im[yb+1][59]=6;im[yb+1][60]=6}/* cửa chính: 2 ô ở bức tường phía nam sảnh (y=54) */
  for(let y=18;y<=yb;y++)for(let x=58;x<=61;x++)im[y][x]=2;
  for(let y=14;y<=17;y++){for(let x=57;x<=62;x++)im[y][x]=y===14?36:33;im[y][56]=im[y][63]=37}
  (f===1?[28,34,40,46,50]:[20,26]).forEach(y=>{im[y][49]=3;im[y][70]=3});
  (f===1?[28,33,40,46,50]:[18,28]).forEach(y=>{im[y][47]=7;im[y][72]=7});
  [50,53,66,69].forEach(x=>im[13][x]=31);
  for(let x=58;x<=61;x++)im[13][x]=1;im[13][58]=40;/* ảnh gia đình giữa cầu thang */
  [[49,15],[70,15],[49,yb-1],[70,yb-1]].forEach(([x,y])=>im[y][x]=27);
  if(f===1){
    for(let y=36;y<=38;y++)for(let x=53;x<=67;x++)im[y][x]=35;
    for(let x=54;x<=66;x+=2){im[35][x]=44;im[39][x]=44}
    im[37][68]=44;
  }else{im[26][59]=im[26][60]=35;im[25][59]=im[25][60]=34;im[27][59]=im[27][60]=34;im[26][58]=im[26][61]=34}
  /* Hai hành lang */
  rm(2,f===1?'Hành lang phòng người làm':'Hành lang phòng khách',CF,19,22,47,24,1);
  rm(3,f===1?'Hành lang phía đông':'Hành lang gia đình',CF,72,22,105,24,1);
  [[14,20,1,21,0],[26,32,-1,25,4]].forEach(([y0,y1,s,dy,o])=>[20,27,34,41].forEach((x0,i)=>{
    const n=o+i,id=4+n,names=['Phòng giúp việc 1','Phòng giúp việc 2','Phòng giúp việc 3','Phòng giúp việc 4','Phòng làm vườn 1','Phòng làm vườn 2','Phòng người làm 7','Phòng người làm 8'];
    const r=rm(id,f===1?names[n]:'Phòng khách '+(n+1),f===1?['#7a6446','#6f5a3e']:BF,x0,y0,x0+5,y1,s);
    fill(id,x0+2,dy,x0+3,dy,f===1?OAK:BIR);f===1?duo(r):bedroom(r)}));
  let r;
  if(f===1){
    r=rm(17,'Phòng quản gia',['#7a5a3a','#6f5234'],8,20,17,28,1);fill(17,18,23,18,24,OAK);
    put(r,20,1,0,3,1);put(r,21,1,1,3,3);put(r,23,5,0,5,1);put(r,28,6,6,3,1);put(r,24,0,6,3,1);win(r);
    /* Nhà bếp lớn chia khu: kho/kệ, rửa, sơ chế, nấu, bàn nhân viên (ghế x>=84 là room 102) */
    r=rm(12,'Nhà bếp lớn',['#cfd3d6','#bfc4c8'],74,8,93,20,1);fill(12,77,21,78,21,OAK);fill(12,88,21,89,21,BIR);
    put(r,56,0,0,4,1);put(r,23,5,0,5,1);
    put(r,54,11,0,4,1);put(r,55,15,0,4,1);
    put(r,22,1,3,7,2);
    put(r,26,0,6,3,1);put(r,28,4,6,5,1);put(r,22,2,9,5,2);put(r,44,2,8,5,1);put(r,44,2,11,5,1);
    put(r,27,9,6,1,2);put(r,27,9,11,1,2);
    put(r,24,10,6,3,1);put(r,24,17,6,3,1);put(r,22,12,8,8,2);put(r,44,12,7,8,1);put(r,44,12,10,8,1);
    win(r);
    r=rm(14,'Phòng đọc sách',['#5b3f2a','#4f3524'],95,14,104,20,1);fill(14,99,21,100,21,OAK);
    put(r,23,0,0,10,1);put(r,23,0,1,1,4);put(r,23,9,1,1,4);put(r,28,3,3,4,1);win(r);
    r=rm(15,'Phòng trà',['#b7b07a','#aaa36d'],74,26,83,33,-1);fill(15,78,25,79,25,BIR);
    put(r,29,1,1,2,2);put(r,29,7,1,2,2);put(r,24,3,0,4,1);put(r,27,0,4,1,2);put(r,27,9,4,1,2);win(r);
    r=rm(16,'Nhà kính',['#9aa59a','#8f9a8f'],85,26,104,34,-1);fill(16,93,25,94,25,BIR);
    put(r,27,1,1,6,2);put(r,27,13,1,6,2);put(r,27,1,5,4,2);put(r,27,15,5,4,2);put(r,27,7,3,6,1);win(r);
  }else{
    r=rm(12,'Phòng chủ dinh thự',['#8a5d4b','#7d5242'],74,12,85,20,1);fill(12,79,21,80,21,OAK);
    put(r,20,4,0,3,1);put(r,21,4,1,3,3);put(r,23,0,0,3,1);put(r,24,9,0,3,1);put(r,22,0,4,3,2);win(r);im[11][79]=43;
    r=rm(13,'Phòng làm việc',['#5e4a38','#54402f'],87,14,96,20,1);fill(13,91,21,92,21,OAK);
    put(r,23,0,0,10,1);put(r,28,3,2,4,1);put(r,22,8,3,2,2);win(r);
    r=rm(14,'Phòng con trai',['#6a7a8a','#5f6f7f'],74,26,83,32,-1);fill(14,78,25,79,25,BIR);
    put(r,20,0,0,2,1);put(r,21,0,1,2,2);put(r,23,6,0,4,1);put(r,28,6,2,3,1);put(r,24,0,4,2,1);win(r);im[33][76]=41;
    r=rm(15,'Phòng con gái',['#a58a9a','#9a7f8f'],85,26,94,32,-1);fill(15,89,25,90,25,BIR);
    put(r,20,0,0,2,1);put(r,21,0,1,2,2);put(r,24,3,0,3,1);put(r,23,7,0,3,1);put(r,22,7,1,2,2);put(r,27,0,4,2,1);win(r);im[33][90]=42;
  }
  return{im,rid,RM}}
function buildHut(){
  const im=Array.from({length:IH},()=>Array(IW).fill(1)),rid=Array.from({length:IH},()=>Array(IW).fill(0)),RM=[];
  RM[1]={n:'Nhà gỗ của thợ săn',f:['#8a6a45','#7d5f3c'],x0:40,y0:20,x1:57,y1:31,s:1};
  for(let y=20;y<=31;y++)for(let x=40;x<=57;x++){im[y][x]=0;rid[y][x]=1}
  [[42,25],[44,46],[46,48],[48,47],[50,46],[52,48],[55,25]].forEach(([x,t])=>im[19][x]=t);/* cửa sổ, súng shotgun, da thú, đầu hươu */
  im[20][41]=im[20][42]=20;for(let y=21;y<=22;y++)im[y][41]=im[y][42]=21;/* giường */
  [24,25,27,28].forEach(y=>im[y][40]=24);/* tủ đồ */
  im[20][53]=26;/* lò sưởi */
  [[52,27],[53,27],[52,28],[53,28]].forEach(([x,y])=>im[y][x]=22);/* bàn */
  [[51,27],[51,28],[54,27],[54,28]].forEach(([x,y])=>im[y][x]=44);/* ghế gỗ */
  im[22][56]=im[23][56]=49;/* giá treo thịt, da */
  im[32][48]=45;/* cửa ra */
  return{im,rid,RM}}
function buildOwn(f){
  const im=Array.from({length:IH},()=>Array(IW).fill(1)),rid=Array.from({length:IH},()=>Array(IW).fill(0)),RM=[],A=f===1;
  const S=(t,x,y,w,h)=>{for(let j=0;j<(h||1);j++)for(let i=0;i<(w||1);i++)im[y+j][x+i]=t};
  const rm=(id,n,fl,x0,y0,x1,y1)=>{RM[id]={n,f:fl,x0,y0,x1,y1,s:1};for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){im[y][x]=0;rid[y][x]=id}};
  rm(1,A?'Phòng khách':'Phòng làm việc',A?['#a8896a','#9c7e60']:['#7a5a3a','#6f5234'],36,16,55,30);
  rm(2,A?'Bếp và phòng ăn':'Phòng ngủ của chủ đảo',A?['#cfc9b8','#c2bba8']:['#8a5d4b','#7d5242'],57,16,74,30);
  S(30,56,22,1,2);/* cửa giữa 2 phòng */
  for(let y=16;y<=19;y++){S(y===16?36:33,48,y,4,1);S(37,47,y);S(37,52,y)}/* cầu thang */
  if(A){
    [37,46,50,60,64,68,72].forEach(x=>im[15][x]=25);[38,42,52,60,66,70].forEach(x=>im[31][x]=25);
    S(50,45,31,2,1);im[15][40]=40;im[15][53]=43;/* cửa ra + ảnh gia đình */
    S(2,39,22,15,7);/* thảm */
    S(27,36,16);S(23,37,16,2,1);S(53,40,16);S(26,41,16,2,1);S(53,43,16);S(27,55,16);S(27,36,29);S(27,55,29);
    S(52,41,23,5,1);S(53,40,23);S(53,46,23);S(22,42,25,3,1);S(44,41,27);S(44,45,27);
    S(56,58,16);S(54,59,16,2,1);S(55,61,16);S(54,62,16,3,1);/* bếp */
    S(54,60,19,5,1);S(44,60,20,5,1);/* quầy đảo + ghế */
    S(22,62,24,5,2);S(44,62,23,5,1);S(44,62,26,5,1);S(44,61,24,1,2);S(44,67,24,1,2);/* bàn ăn */
    S(24,74,19,1,3);S(27,74,16);S(27,74,30);S(27,57,30);
  }else{
    [37,50,54,60,68,72].forEach(x=>im[15][x]=25);[38,46,52,60,66,72].forEach(x=>im[31][x]=25);
    im[15][39]=41;im[15][42]=42;im[15][64]=43;
    S(2,38,23,9,5);S(2,62,21,9,5);/* thảm */
    S(23,37,16,9,1);S(27,36,16);S(27,55,16);S(27,36,29);S(27,55,29);
    S(28,40,20,3,1);S(44,41,21);S(23,53,17,1,6);/* bàn làm việc, kệ sách */
    S(52,38,26,3,1);S(53,41,26);S(22,39,24);/* góc đọc sách */
    S(20,63,16,3,1);S(21,63,17,3,3);S(29,62,16);S(29,66,16);S(53,61,16);/* giường + tab đầu giường */
    S(24,69,16,3,1);S(28,58,16,2,1);S(44,58,17);S(23,57,19,1,3);/* tủ áo, bàn trang điểm */
    S(52,66,27,4,1);S(53,65,27);S(53,70,27);S(27,74,16);S(27,74,30);S(27,57,30);
  }
  return{im,rid,RM}}
function genIn(){
FL=[null,build(1),build(2),buildHut(),buildOwn(1),buildOwn(2),buildCave()];SEATS=[];BEDS=[];
  const nb=(M,x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const t=(M[y+b]||[])[x+a];return t===0||t===2});
  [1,2,3].forEach(f=>{const{im,RM}=FL[f];
    RM.forEach((r,id)=>{if(!r)return;const pk=[];
      for(let y=r.y0;y<=r.y1;y++)for(let x=r.x0;x<=r.x1;x++){const t=im[y][x];
        if((f===1||f===3)&&t===44)SEATS.push({x,y,room:f===3?101:(id===12&&x>=84?102:id),fl:f,o:null});/* 102 = bàn nhân viên */
        if(t===21&&nb(im,x,y)&&!pk.some(([a,b])=>Math.abs(a-x)<2&&Math.abs(b-y)<2)){pk.push([x,y]);BEDS.push({fl:f,room:id,x,y,o:null})}}})})}
function bfs(f,sx,sy,tx,ty){
  const M=FL[f].im,pr=new Int32Array(IW*IH).fill(-1),s0=sy*IW+sx,q=[s0];pr[s0]=s0;
  for(let i=0;i<q.length;i++){const c=q[i],x=c%IW,y=(c/IW)|0;if(x===tx&&y===ty)break;
    for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<0||Y<0||X>=IW||Y>=IH)continue;const k=Y*IW+X,t=M[Y][X];if(pr[k]>=0)continue;if(iw(t)||(X===tx&&Y===ty)){pr[k]=c;q.push(k)}}}
  const e=ty*IW+tx;if(pr[e]<0)return null;const o=[];for(let c=e;c!==pr[c];c=pr[c])o.push([(c%IW)*T+4,((c/IW)|0)*T+4]);return o.reverse()}
function drDoor(t,px,py,x){
  const c=t===30?['#6b4423','#8b5a2b','#a8743f']:['#cdbfa0','#efe6d2','#fff8e8'],R=(a,b,d,w,h)=>{cx.fillStyle=a;cx.fillRect(px+b,py+d,w,h)};
  R(c[0],0,0,T,T);R(c[1],1,1,T-2,T-2);R(c[2],2,2,T-4,2);R(c[0],2,5,T-4,1);R('#ffd23f',x%2?1:6,4,1,1)}
/* Ảnh treo tường: 40 = ảnh gia đình 4 người, 41 = cậu chủ, 42 = tiểu thư, 43 = ông bà chủ */
function drPic(px,py,t,south){
  const y=south?-3:1,SK='#f1c27d',W=t===40?32:16,R=(c,x,yy,w,h)=>{cx.fillStyle=c;cx.fillRect(px+x,py+yy,w,h)};
  R('#d4a63a',0,y,W,10);R('#8a6a1f',0,y+9,W,1);R(['#3d4a6b','#5c6f8a','#8a5c78','#6b4a3a'][t-40],1,y+1,W-2,8);
  const bust=(x,hc,bc,hh)=>{R(SK,x-1,y+hh,3,3);R(hc,x-1,y+hh,3,1);R(bc,x-2,y+hh+3,5,6-hh)};
  if(t===40){bust(4,'#2b1b0f','#5b2a86',2);bust(11,'#4a2f17','#8e1f2a',2);bust(18,'#d9a441','#2980b9',3);bust(25,'#111','#ff7ab6',3)}
  else if(t===41){R(SK,6,y+2,4,4);R('#d9a441',6,y+2,4,1);R('#2980b9',4,y+6,8,3)}
  else if(t===42){R(SK,6,y+2,4,4);R('#111',5,y+2,6,1);R('#111',5,y+3,1,3);R('#111',10,y+3,1,3);R('#ff7ab6',4,y+6,8,3)}
  else{bust(5,'#2b1b0f','#5b2a86',2);bust(11,'#4a2f17','#8e1f2a',2)}}
function drDec(px,py,t){
  const R=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(px+x,py+y,w,h)};
  if(t===46){R('#3a2410',1,1,1,6);R('#3a2410',6,1,1,6);R('#6b4423',0,3,3,3);R('#2b2b33',3,3,5,1);R('#444a54',3,4,5,1);R('#8b5a2b',3,5,3,1);R('#9aa0aa',7,3,1,1)}
  else if(t===48){R('#6b4423',1,0,6,1);R('#a8794a',1,1,6,6);R('#a8794a',0,2,1,2);R('#a8794a',7,2,1,2);R('#8a5a2e',2,7,4,2);R('#5a3a1e',3,3,1,1);R('#5a3a1e',5,2,1,1);R('#5a3a1e',4,5,1,1)}
  else if(t===47){const A='#e8dcc0';R('#5a3a1e',-1,1,10,10);R('#8a5a2e',0,2,8,8);
    R(A,-3,1,1,5);R(A,-4,1,1,1);R(A,-2,0,1,2);R(A,-2,3,1,1);R(A,10,1,1,5);R(A,11,1,1,1);R(A,9,0,1,2);R(A,9,3,1,1);
    R('#a9794a',1,3,6,6);R('#c49a6a',2,4,4,3);R('#a9794a',0,4,1,2);R('#a9794a',7,4,1,2);R('#111',2,5,1,1);R('#111',5,5,1,1);R('#222',3,8,2,1)}}
function hutRug(){
  const R=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h)},X=44*T,Y=24*T,B='#7a4f2a',L='#9a6a3a',D='#4a2f17';
  for(let j=0;j<32;j++){const w=Math.round(Math.sqrt(1-Math.pow((j-15.5)/16,2))*21);R(D,X+26-w,Y+j,w*2+2,1);R(B,X+27-w,Y+j,w*2,1)}
  [[3,-2],[44,-2],[3,29],[44,29]].forEach(([a,b])=>{R(D,X+a-1,Y+b,9,5);R(B,X+a,Y+b+1,7,3)});
  R(D,X-9,Y+10,11,12);R(B,X-8,Y+11,10,10);R(D,X-9,Y+9,3,3);R(D,X-1,Y+9,3,3);R('#111',X-6,Y+14,1,1);R('#111',X-3,Y+14,1,1);R('#111',X-8,Y+17,2,2);
  for(let i=0;i<16;i++)R(L,X+6+(i*7)%40,Y+4+(i*11)%24,3,1)}
/* Trang trí vách hang: vỉa than / sắt / vàng / tinh thể và thạch nhũ treo từ trần */
function cvDeco(x,y,px,py,rid){
  const h=hs(x*5+2,y*3+7),R=(c,a,b,w,hh)=>{cx.fillStyle=c;cx.fillRect(px+a,py+b,w,hh)},w=h%48;
  if(w===0){R('#0e0f12',2,2,3,2);R('#0e0f12',4,4,2,2);R('#5a5f69',2,2,1,1)}
  else if(w===1){R('#b8683a',1,3,2,2);R('#e3a070',2,3,1,1)}
  else if(w===2){R('#ffd23f',3,2,2,2);R('#fff3a0',3,2,1,1)}
  else if(w===3){R('#2fb8f0',4,3,2,3);R('#9ae8ff',4,3,1,1)}
  if(((rid[y+1]||[])[x]|0)>0&&h%3===0){const a=1+((h>>4)&3);R('#6a6878',a,5,3,1);R('#8a889a',a,5,1,1);R('#6a6878',a+1,6,1,2)}
}
function drawIn(){
  const R=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h)},F=FL[curF],im=F.im,rid=F.rid,RM=F.RM;
  const cvv=curF===6,x0=Math.max(0,Math.floor(camX/T)),y0=Math.max(0,Math.floor(camY/T)),x1=Math.min(IW-1,x0+Math.ceil(CW/IS/T)+1),y1=Math.min(IH-1,y0+Math.ceil(CH/IS/T)+1),f=RM[curR].f,tall=[],pics=[],dec=[];
  const near=(x,y)=>{for(let j=-1;j<=1;j++){const r=rid[y+j];if(r)for(let i=-1;i<=1;i++)if(cvv?r[x+i]>0:r[x+i]===curR)return 1}return 0};
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const t=im[y][x],px=x*T,py=y*T,h=hs(x,y);
    if(cvv?rid[y][x]>0:rid[y][x]===curR){
      const ff=cvv?(RM[rid[y][x]]||RM[1]).f:f;
      R((x+y)%2?ff[0]:ff[1],px,py,T,T);
      if(t===2){R('#a3202a',px,py,T,T);if(x===58||x===61)R('#d4a63a',px,py,1,T)}
      else if(t===3)tall.push([px,py]);
      else if(t===30||t===32)drDoor(t,px,py,x);
      else if(t===33||t===36){R('#9c7a52',px,py,T,T);R('#7d5f3e',px,py+T-2,T,2);R('#b8946a',px,py,T,1);if(x>=58&&x<=61)R('#a3202a',px+1,py,6,T-2);
        const up=curF===1||curF===4;if(t===36){R('#fff2a8',px+(up?3:2),py+2,up?2:4,1);R('#fff2a8',px+(up?2:3),py+3,up?4:2,1)}}
      else if(t===37){R('#4a2f17',px+3,py-2,2,T+2);R('#6b4423',px+2,py-3,4,2)}
      else if(t===34){R('#7a4f2a',px+1,py+1,6,6);R('#c0392b',px+2,py+2,4,4)}
      else if(t===35){R('#6b4423',px,py+T-1,T,1);R('#e8dcc0',px,py+1,T,T-2);R('#c89a62',px,py+1,T,1);if(curF===1)tbl(px,py,x,y);else if(h%4===0){R('#fff',px+2,py+3,2,2);R('#c0392b',px+4,py+2,1,2)}}
      else if(t===20){R('#6b4423',px,py,T,T);R('#f3efe2',px+1,py+1,6,4)}
      else if(t===21){R('#6b4423',px,py,T,T);R('#3b6fd6',px,py,T,T-1);R('#5f8df0',px,py,T,1)}
      else if(t===22){R('#6b4423',px,py+T-1,T,1);R('#a9794a',px,py+1,T,T-2);R('#c89a62',px,py+1,T,2)}
      else if(t===23){R('#5a3a1e',px,py-2,T,T+2);for(let i=0;i<3;i++)R(['#c0392b','#2980b9','#d4ac0d','#27ae60'][(h>>(i*2))&3],px+1+i*2,py-1,1,5)}
      else if(t===24){R('#7a4f2a',px,py-1,T,T+1);R('#4a2f17',px+3,py-1,1,T+1);R('#ffd23f',px+2,py+3,1,1);R('#ffd23f',px+5,py+3,1,1)}
      else if(t===26){R('#3a3a40',px,py-2,T,T+2);R((frame>>3)%2?'#ff8a3d':'#ffd23f',px+2,py+2,4,3)}
      else if(t===27){R('#6b4423',px,py+3,T,T-3);R('#3f8a35',px+1,py,6,4);R(['#ff6b9a','#ffd23f','#ffffff'][h%3],px+2+(h&3),py+1,2,2)}
      else if(t===28){R('#5a3a1e',px,py,T,T);R('#7a4f2a',px,py,T,3);R('#f3efe2',px+2,py+1,3,2)}
      else if(t===29){R('#c89a62',px,py+1,T,T-2);R('#fff',px+3,py+2,2,2)}
      else if(t===49){R('#4a2f17',px,py-3,1,T+3);R('#4a2f17',px+T-1,py-3,1,T+3);R('#6b4423',px,py-3,T,1);
        if(y%2===0){for(let i=0;i<Math.min(HUNT.meat,4);i++){R('#c0392b',px+1+i*2,py-2,1,5);R('#e8a0a0',px+1+i*2,py-2,1,1)}}
        else{for(let i=0;i<Math.min(HUNT.pelt,3);i++)R(['#8a5a2e','#a8794a','#6b4423'][i],px+1+i*2,py-1,2,6)}}
      else if(t===44){R('#4a2f17',px+1,py+1,6,1);R('#8b5a2b',px+1,py+2,6,4);R('#a8743f',px+2,py+3,4,2);R('#4a2f17',px+1,py+6,1,2);R('#4a2f17',px+6,py+6,1,2)}
      else if(t===52){R('#3a2848',px,py+1,T,3);R('#6b4a86',px,py+3,T,4);R('#8a63a8',px,py+3,T,1);R('#2e1f3a',px,py+6,T,1);if(im[y][x-1]!==52)R('#3a2848',px,py+1,1,6);if(im[y][x+1]!==52)R('#3a2848',px+T-1,py+1,1,6)}
      else if(t===53){R('#4a2f17',px+3,py+3,2,5);R('#3a2410',px+2,py+7,4,1);R('#ffd98a',px+1,py,6,3);R('#fff2c0',px+2,py+1,4,1);cx.globalAlpha=.12;R('#ffcc66',px-4,py-4,16,14);cx.globalAlpha=1}
      else if(t===54){R('#6b4423',px,py+4,T,4);R('#cfd3d6',px,py,T,4);R('#8a8f98',px,py,T,1);if(x%3===0){R('#8ec6ee',px+2,py+1,4,2);R('#555',px+4,py-1,1,2)}}
      else if(t===55){R('#6b4423',px,py+4,T,4);R('#3a3a40',px,py,T,4);R('#111',px+1,py+1,2,2);R('#111',px+5,py+1,2,2);if((frame>>3)%2)R('#ff8a3d',px+1,py,2,1)}
      else if(t===56){R('#e8eef2',px+1,py-4,6,T+4);R('#b9c2cf',px+1,py+1,6,1);R('#8a8f98',px+5,py-2,1,2);R('#8a8f98',px+5,py+3,1,2)}
      else if(t===58){R('rgba(0,0,0,.3)',px,py+6,T,2);R('#4a4852',px+2,py,4,8);R('#5f5d6a',px+3,py-4,2,5);R('#6d6b7a',px+3,py-4,1,9)}
      else if(t===59){R('rgba(0,0,0,.3)',px,py+6,T,2);R('#3a3d44',px+1,py+1,6,6);R('#5a5f69',px+1,py+1,6,1);R('#1b1c20',px+2,py+2,2,2);R('#1b1c20',px+5,py+4,2,2);R('#8a8f98',px+3,py+4,1,1)}
      else if(t===60){R('rgba(0,0,0,.3)',px,py+6,T,2);R('#6d727c',px+1,py+1,6,6);R('#9aa0aa',px+1,py+1,6,1);R('#b8683a',px+2,py+2,2,2);R('#ffd23f',px+5,py+4,2,2);R('#fff3a0',px+5,py+4,1,1)}
      else if(t===61){R('rgba(0,0,0,.3)',px,py+6,T,2);R('#4a5060',px,py+5,T,2);R('#2fb8f0',px+3,py,2,6);R('#9ae8ff',px+3,py,1,3);R('#2fb8f0',px+1,py+3,2,3);R('#2fb8f0',px+5,py+2,2,4);if(((frame>>3)+x+y)%7===0)R('#fff',px+4,py+1,1,1)}
      else if(t===57){R('#b9d4ee',px,py,T,T);R('#e8f4ff',px+1,py+1,6,3)}
    }else if(near(x,y)){
      if(t===57){R('#b9d4ee',px,py,T,T);R('#e8f4ff',px+1,py+1,6,3)}
      else if(t===6||t===45||t===50){R('#6b4423',px,py,T,T);R('#ffd23f',px+5,py+3,1,1)}
      else if(t===30||t===32)drDoor(t,px,py,x);
      else if(t===1||t===7||t===25||t===31||(t>=40&&t<=43)||(t>=46&&t<=48)){
        if(curF===3){R('#7a5230',px,py,T,T);R('#5a3a1e',px,py+6,T,2);R('#6b4423',px,py+3,T,1)}else if(curF===6){R('#2a2830',px,py,T,T);R('#1b1a21',px,py+6,T,2);R('#3a3844',px,py,T,1);cvDeco(x,y,px,py,rid)}else{R('#8d8576',px,py,T,T);R('#6f6859',px,py+6,T,2)}
        if(t===25){R('#d8d0bc',px+1,py+1,6,5);R('#8ec6ee',px+2,py+2,4,3);R('#fff',px+2,py+2,1,1);R('#d8d0bc',px+4,py+2,1,3)}
        if(t===31){R('#8e1f2a',px+1,py,6,7);R('#d4a63a',px+3,py+1,2,4)}
        if(t>=40&&t<=43)pics.push([px,py,t,(rid[y-1]||[])[x]===curR]);
        if(t>=46&&t<=48)dec.push([px,py,t]);
        if(t===7){R('#3a3a40',px+2,py+1,4,5);R((frame>>3)%2?'#ff8a3d':'#ffd23f',px+3,py+2,2,3)}}}}
  if(curF===3)hutRug();
  tall.forEach(([px,py])=>{R('#d8d0bc',px+1,py-6,6,T+6);R('#a9a18c',px+5,py-6,2,T+6)});
  pics.forEach(a=>drPic(...a));dec.forEach(a=>drDec(...a));if(curF===6)railDraw(F,x0,y0,x1,y1);if(curF===6)gateDraw(F,x0,y0,x1,y1);
  if(curR===1&&curF<=2)(curF===1?[24,34,46]:[20,27]).forEach(y=>{const X=476,Y=y*T;cx.globalAlpha=.1;R('#ffcc66',X-34,Y-14,68,40);R('#ffcc66',X-20,Y-22,40,56);cx.globalAlpha=1;R('#ffd23f',X-5,Y,10,1);R('#fff2a8',X-1,Y+1,2,2)});
  cx.globalAlpha=1;
  /* chi tiết thêm: hạt bụi bay trong tia sáng (ban ngày, trời quang) */
  if(curF<=5&&curF!==3&&GL<.6&&nightK()<.5){for(let i=0;i<14;i++){const dx=camX+((i*97+frame*.15*(1+i%3*.4))%(CW/IS)),dy=camY+((i*61+frame*.07+Math.sin(frame*.02+i)*6)%(CH/IS));cx.globalAlpha=.25;R('#fff6d0',Math.round(dx),Math.round(dy),1,1)}cx.globalAlpha=1}

  if(curF===6)BL.forEach(([bx2,by2])=>{R('#4a0b10',bx2-5,by2-1,10,3);R('#7a1a20',bx2-3,by2-2,6,2);R('#7a1a20',bx2+4,by2+1,2,1)});
  if(curF===6)mineCarts(F,x0,y0,x1,y1);cartDraw();ins.filter(p=>p.fl===curF&&(cvv||ridAt(p)===curR)).sort((a,b)=>a.y-b.y).forEach(person);
  if(curF===6)caveLight()}
/* ===== THỜI TIẾT: càng gần ngày 30 trời càng âm u (mây, mưa, sương mù, giông bão) ===== */
let GL=0,LT=0,RAIN=[],BIRDS=[],LBX=0;
function gloomK(){const d=Math.max(0,Math.min(1,gm/1440/29));return d*d*(3-2*d)}/* 0 (ngày 1) -> 1 (ngày 30) */
function atmos(){
  if(iAlpha<=0)return;
  const g=GL,dk=1-nightK();
  /* tia nắng chiếu xiên khi trời quang */
  if(g<.55&&dk>.4){
    cx.save();cx.globalCompositeOperation='lighter';cx.fillStyle='#fff3b0';
    for(let i=0;i<4;i++){const X=((i*173+frame*.05)%(CW+160))-80;cx.globalAlpha=(.05+.03*Math.sin(frame*.02+i))*(1-g/.55)*dk;
      for(let y=0;y<CH;y+=4)cx.fillRect(Math.round(X+y*.35),y,14+i*3,4)}
    cx.restore();cx.globalAlpha=1}
  /* chim bay ngang bầu trời */
  if(g<.7&&dk>.5&&BIRDS.length<4&&Math.random()<.004)BIRDS.push({x:-10,y:20+rnd(90),v:.5+Math.random()*.6,ph:rnd(10)});
  BIRDS=BIRDS.filter(b=>b.x<CW+12);
  BIRDS.forEach(b=>{b.x+=b.v;b.y+=Math.sin((frame+b.ph*9)*.05)*.2;const f=((frame>>3)+b.ph)%2,x=Math.round(b.x),y=Math.round(b.y);cx.fillStyle='#1d1d26';cx.fillRect(x-2,y+(f?0:1),2,1);cx.fillRect(x,y,1,1);cx.fillRect(x+1,y+(f?0:1),2,1)});
  /* sương mù */
  if(g>.45){cx.fillStyle='rgba(165,175,190,'+((g-.45)*.32).toFixed(3)+')';cx.fillRect(0,0,CW,CH)}
  /* mưa */
  if(g>.42){const n=Math.floor((g-.42)/.58*150);
    while(RAIN.length<n)RAIN.push({x:rnd(CW+60),y:rnd(CH),v:5+Math.random()*3});
    while(RAIN.length>n)RAIN.pop();
    cx.fillStyle='rgba(190,208,235,.55)';
    RAIN.forEach(r=>{r.y+=r.v;r.x-=1.6;if(r.y>CH||r.x<-4){r.y=-6;r.x=rnd(CW+60)}cx.fillRect(Math.round(r.x),Math.round(r.y),1,3);cx.fillRect(Math.round(r.x)+1,Math.round(r.y)-2,1,2)})}
  else if(RAIN.length)RAIN=[];
  /* sấm chớp khi gần cuối tháng */
  if(g>.8&&LT<=0&&Math.random()<.003+.008*(g-.8)/.2){LT=18;LBX=rnd(CW)}
  if(LT>0){const a=Math.min(.55,LT/18*.6)*(LT%7<5?1:.35);cx.globalAlpha=a;cx.fillStyle='#e8f0ff';cx.fillRect(0,0,CW,CH);
    if(LT>11){cx.globalAlpha=.9;cx.fillStyle='#fff';let bx=LBX;for(let y=0;y<CH*.7;y+=5){bx+=rnd(7)-3;cx.fillRect(bx,y,2,5)}}
    cx.globalAlpha=1;if(LT===17&&!inside)shake=Math.max(shake,8);LT--}}
function draw(){
  cx.save();
  if(inside){cx.fillStyle='#000';cx.fillRect(0,0,CW,CH);cx.scale(IS,IS);cx.translate(-Math.round(camX),-Math.round(camY));drawIn()}
  else{
    if(shake>0){shake--;cx.translate(rnd(5)-2,rnd(3)-1)}
    cx.translate(-Math.round(camX),-Math.round(camY));
    const x0=Math.max(0,Math.floor(camX/T)),x1=Math.min(W-1,x0+Math.ceil(CW/T)+1),y0=Math.max(0,Math.floor(camY/T)),y1=Math.min(H-1,y0+Math.ceil(CH/T)+1);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)sea(x,y);
    cx.globalAlpha=iAlpha;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)land(x,y);cx.globalAlpha=1;
    clouds();boat();if(iAlpha>0){cx.globalAlpha=iAlpha;castle();owHouse();cx.globalAlpha=1}
    for(let y=y0;y<=Math.min(H-1,y1+1);y++){
      cx.globalAlpha=iAlpha;
      for(let x=x0;x<=x1;x++){const t=m[y][x];if(t===TREE)tree(x,y);else if(t===ROCK)rock(x,y);else if(t===DTREE)dtree(x,y);else if(t===SIGN)sign(x,y)}
      cx.globalAlpha=iAlpha;if(y===HY+2)hut();if(y===WY+1)well();if(y===CAMPY)camp();cx.globalAlpha=1;
      people.filter(p=>p.vis&&!p.hide&&Math.floor(p.y/T)===y).sort((a,b)=>a.y-b.y).forEach(person)}
    glow();mist(x0,x1,y0,y1);
    parts.forEach(q=>{cx.globalAlpha=Math.min(1,q.l/20);cx.fillStyle=q.c;cx.fillRect(Math.round(q.x),Math.round(q.y),q.s,q.s)})}
  cx.globalAlpha=1;cx.restore();
  if(state==='title'){const g=cx.createLinearGradient(0,0,0,CH);g.addColorStop(0,'rgba(60,20,90,.55)');g.addColorStop(.6,'rgba(255,120,80,.12)');g.addColorStop(1,'rgba(10,10,40,.35)');cx.fillStyle=g;cx.fillRect(0,0,CW,CH)}
  else{const c=tint();cx.fillStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+(c[3]*(inside?.35:1)).toFixed(3)+')';cx.fillRect(0,0,CW,CH);
    if(GL>0){/* âm u: giảm sáng + mất màu dần theo ngày */
      const gk=GL*(inside?.3:1);
      cx.globalCompositeOperation='saturation';cx.fillStyle='rgba(128,128,128,'+(gk*.6).toFixed(3)+')';cx.fillRect(0,0,CW,CH);cx.globalCompositeOperation='source-over';
      cx.fillStyle='rgba(48,58,78,'+(gk*.42).toFixed(3)+')';cx.fillRect(0,0,CW,CH)}
    if(!inside)atmos()}
  cx.drawImage(VG,0,0);
  if(flash>0){cx.fillStyle='rgba(190,0,0,'+(flash/24*.5).toFixed(3)+')';cx.fillRect(0,0,CW,CH);flash--}
  if(trans){cx.fillStyle='rgba(0,0,0,'+Math.max(0,Math.min(1,trans.t<1?trans.t:2-trans.t))+')';cx.fillRect(0,0,CW,CH)}
  loserDraw()}
/* ===== Màn hình "LOSER": tối mờ dần rồi hiện chữ khi bị oan hồn giết ===== */
function loserDraw(){
  if(!LS)return;
  LS.t++;
  if(!LS.fin&&LS.t>=210){LS=null;return}
  const out=LS.fin?0:Math.max(0,(LS.t-170)/40),al=1-out,
    dark=Math.min(.82,LS.t/50)*al,ta=Math.min(1,Math.max(0,(LS.t-25)/30))*al;
  cx.save();
  cx.fillStyle='rgba(0,0,0,'+dark.toFixed(3)+')';cx.fillRect(0,0,CW,CH);
  cx.globalAlpha=ta;cx.textAlign='center';cx.textBaseline='middle';
  const sx=LS.t<60?Math.round(Math.sin(LS.t*1.7)*2):0;
  cx.font='bold 64px monospace';cx.lineWidth=6;cx.strokeStyle='#000';
  cx.strokeText('LOSER',CW/2+sx,CH/2);cx.fillStyle='#d8392b';cx.fillText('LOSER',CW/2+sx,CH/2);
  cx.font='bold 10px monospace';cx.lineWidth=3;
  cx.strokeText('Bạn đã bị oan hồn giết',CW/2,CH/2+44);cx.fillStyle='#fff';cx.fillText('Bạn đã bị oan hồn giết',CW/2,CH/2+44);
  cx.restore()}
/* ===== Điều khiển, camera ===== */
function cam(){
  if(inside){const P=ins.find(p=>p.pl===sel)||ins.find(p=>p.pl);if(!P)return;camX+=(Math.max(0,Math.min(IW*T-CW/IS,P.x-CW/IS/2))-camX)*.15;camY+=(Math.max(0,Math.min(IH*T-CH/IS,P.y-CH/IS/2))-camY)*.15;return}
  let fx=CW/2,fy=by;
  if(state==='sail'||state==='crash'){fx=bx+17}
  else if(state==='land'||state==='island'){const P=people.find(p=>p.pl===sel&&p.vis);if(state==='land'&&OW&&OW.vis&&OW.os==='out'){fx=OW.x;fy=OW.y}else if(P){fx=P.x;fy=P.y}else fx=bx+17}
  camX+=(Math.max(0,Math.min(WW-CW,fx-CW/2))-camX)*.08;camY+=(Math.max(0,Math.min(WH-CH,fy-CH*0.75))-camY)*.08}
function ctrl(){
  const P=(inside?ins:people).find(p=>p.pl===sel);if(!P||trans||TK)return;wf=P.fl||1;
  const dx=(keys.arrowright||keys.d?1:0)-(keys.arrowleft||keys.a?1:0),dy=(keys.arrowdown||keys.s?1:0)-(keys.arrowup||keys.w?1:0);
  if(dx||dy){const l=Math.hypot(dx,dy),sf=(!inside&&(m[Math.floor(P.y/T)]||[])[Math.floor(P.x/T)]===SWAMP)?.7:1,nx=P.x+dx/l*sf,ny=P.y+dy/l*sf;P.path=[];if(walk(nx,P.y,P))P.x=nx;if(walk(P.x,ny,P))P.y=ny;P.tx=P.x;P.ty=P.y;P.moving=1}}
function fixPos(p){const M=FL[p.fl].im,tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);
  for(let r=0;r<14;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const t=(M[ty+j]||[])[tx+i];if(t===0||t===2){p.x=p.tx=(tx+i)*T+4;p.y=p.ty=(ty+j)*T+4;return p}}return p}
function npcI(role,k,c,tx,ty,fl,cls,o){return fixPos({k,pl:0,role,cls,c,skin:SKIN[rnd(5)],hair:role==='Quản gia'||role==='Chủ nhân'?'#cfd3d6':HAIR[rnd(5)],x:tx*T+4,y:ty*T+4,tx:tx*T+4,ty:ty*T+4,sp:.4,path:[],ph:1,wait:ri(20,90),moving:0,vis:1,delay:0,fl,n:{hu:ri(25,45),fa:ri(5,25),sl:ri(0,15)},act:'idle',t:0,cd:0,goal:null,say:'',...o})}
function initRes(){
  const MS=SKINS.map(a=>a[1]).concat(SKIN).sort(()=>Math.random()-.5);let mi=0;
  const used=new Set(),L=[
    ['Quản gia','man','#151515',59,26,1,'s',{clean:1,home:[1,17]}],
    ['Giúp việc','woman','#222',30,23,1,'s',{clean:1,home:[1,4]}],
    ['Giúp việc','woman','#222',90,23,1,'s',{clean:1,home:[1,5]}],
    ['Giúp việc','woman','#222',60,45,1,'s',{clean:1,home:[1,6]}],
    ['Đầu bếp','man','#f4f4f4',75,18,1,'s',{home:[1,7]}],
    ['Đầu bếp','woman','#f4f4f4',75,19,1,'s',{home:[1,7]}],
    ['Phụ bếp','woman','#f4f4f4',74,19,1,'s',{home:[1,10]}],
    ['Phụ bếp','man','#f4f4f4',81,19,1,'s',{home:[1,11]}],
    ['Thợ săn','man','#4b5d2a',48,28,3,'h',{home:[3,1]}],
    ['Làm vườn','man','#556b2f',86,29,1,'s',{home:[1,8]}],
    ['Làm vườn','man','#6b7b3a',65,50,1,'s',{home:[1,9]}],
    ['Chủ nhân','man','#5b2a86',52,22,2,'f',{own:[12],home:[2,12]}],
    ['Phu nhân','woman','#8e1f2a',66,22,2,'f',{own:[12],home:[2,12]}],
    ['Cậu chủ','man','#2980b9',54,27,2,'f',{own:[14],home:[2,14]}],
    ['Tiểu thư','woman','#ff7ab6',68,27,2,'f',{own:[15],home:[2,15]}]];
  L.forEach(a=>{const p=npcI(...a),[f,r]=a[7].home;if(a[0]==='Giúp việc')p.skin=MS[mi++%MS.length];const i=BEDS.findIndex((b,j)=>b.fl===f&&b.room===r&&!used.has(j));if(i>=0){used.add(i);p.hb=i}delete p.home;ins.push(p)})}

/* ===== Chủ đảo: nhà 2 tầng, vườn bên cạnh, đi ra đón, hội thoại bằng phím E ===== */
const nearOwner=()=>{const P=people.find(p=>p.pl===sel);return OW&&(OW.os==='meet'||OW.os==='tend')&&OW.vis&&!OW.hide&&P&&Math.hypot(P.x-OW.x,P.y-OW.y)<28?P:null};
function tkUI(){$('tk').hidden=!(state==='island'&&!inside&&!TK&&!trans&&nearOwner())}
function mkOwner(){return{k:'man',pl:0,role:'Chủ đảo',cls:'o',owner:1,c:'#5b2a86',skin:'#f1c27d',hair:'#cfd3d6',x:HDX*T+4,y:HDY*T+4,tx:HDX*T+4,ty:HDY*T+4,sp:1,path:[],ph:1,wait:0,moving:0,vis:0,delay:50,act:'idle',t:0,cd:1e9,goal:null,say:'',os:'out',re:0,life:0}}
function homeOwner(){/* dùng khi tải save / quay về mốc ngày */
  OW=mkOwner();OW.delay=0;OW.vis=1;
  if(allAcc()){OW.os='tend';OW.sp=.45;OW.x=OW.tx=(HSX+4)*T+4;OW.y=OW.ty=44*T+4}
  else{OW.os='meet';OW.x=OW.tx=(HSX+4)*T+4;OW.y=OW.ty=44*T+4}
  people.push(OW)}
function ownerTick(p){
  if(p.os==='gohome'||p.os==='inh')return houseTick(p);
  if(p.os==='tend'&&frame%15===0){const w=wantHome(p);if(w){startHome(p,w);return true}}
  if(p.os==='out'){
    p.life++;const t=people.find(q=>q.pl&&q.vis),gx=t?Math.floor(t.x/T):shoreX+2,gy=t?Math.floor(t.y/T):BR,d=t?Math.hypot(t.x-p.x,t.y-p.y):99;
    if(d<22||p.life>2400){p.os='meet';p.path=[];p.tx=p.x;p.ty=p.y;p.moving=0;return true}
    if(--p.re<=0){p.re=40;const pth=bfsW(Math.floor(p.x/T),Math.floor(p.y/T),gx,gy);if(pth&&pth.length){p.path=pth;p.tx=p.x;p.ty=p.y}}
    return false}
  if(p.os==='home'){
    if(!p.path.length&&Math.hypot(p.tx-p.x,p.ty-p.y)<=.7){
      const tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);
      if(tx===HDX&&ty===HDY){p.os='in';p.hide=1;return true}
      const pth=bfsW(tx,ty,HDX,HDY);if(pth&&pth.length)p.path=pth;else{p.os='in';p.hide=1;return true}}
    return false}
  if(p.os==='tend'){
    p.moving=0;
    /* có người chơi lại gần hoặc đang nói chuyện: đứng yên chờ */
    if(TK||people.some(q=>q.pl&&Math.hypot(q.x-p.x,q.y-p.y)<30))return true;
    if(p.act!=='idle'){if((p.t-=DM)<=0)p.act='idle';return true}
    if(p.path.length||Math.hypot(p.tx-p.x,p.ty-p.y)>.7){
      p.sp=Math.hypot(p.x-(HSX+4)*T,p.y-44*T)>90?1:.45;/* ở xa thì đi nhanh về nhà, ở sân thì đi thong thả */
      return false}
    if(p.gk){ownerAct(p,p.gk);p.gk=null;return true}
    const g=ownerGoal(),pth=bfsW(Math.floor(p.x/T),Math.floor(p.y/T),g.x,g.y);
    if(pth){p.gk=g.k;if(pth.length){p.path=pth;p.tx=p.x;p.ty=p.y}}
    else{p.act='look';p.t=2}
    return true}
  p.moving=0;return true}
  
function ownerAct(p,k){p.act=k==='walk'?'look':k;p.t=k==='walk'?ri(3,6):ri(12,25);p.moving=0}
function ownerGoal(){
  const r=Math.random();
  if(r<.55)return{x:ri(GX0,GX1),y:ri(GY0,GY1),k:'garden'};/* chăm vườn */
  const c=[];
  for(let y=35;y<=44;y++)for(let x=84;x<=95;x++){if(x>=HSX&&x<HSX+8&&y>=HSY&&y<HSY+6)continue;if(walkT(x,y))c.push([x,y])}
  const s=c.length?c[rnd(c.length)]:[HDX,HDY+1];
  return{x:s[0],y:s[1],k:r<.85?'clean':'walk'}}/* dọn quanh nhà / đứng ngắm */
  const CHAIRS=[[62,23],[63,23],[64,23],[65,23],[66,23],[62,26],[63,26],[64,26],[65,26],[66,26],[61,24],[67,24]];
  const OEXIT={fl:4,x:45,y:31};
  function wantHome(p){
    if(state!=='island'||TK)return null;
    const h=hour(),ms=MEAL(h),mk=Math.floor(gm/1440)*3+ms;
    if(h>=21||h<5.5)return'sleep';
    if(ms>=0&&p.ate!==mk){
      if(people.some(q=>q.pl&&Math.hypot(q.x-p.x,q.y-p.y)<30))return null;/* có người chơi đứng gần thì chờ */
      return'eat'}
    return null}
  function startHome(p,mode){
    p.os='gohome';p.mode=mode;p.gk=null;p.act='idle';p.path=[];p.tx=p.x;p.ty=p.y;p.moving=0;p.sp=1;
    if(mode==='eat')p.ate=Math.floor(gm/1440)*3+MEAL(hour())}
  function enterHouse(p){
    people=people.filter(q=>q!==p);p.fl=4;p.x=p.tx=45*T+4;p.y=p.ty=29*T+4;p.path=[];p.hide=0;p.vis=1;p.act='idle';
    p.os='inh';p.sp=.45;ins.push(p);planIn(p)}
function leaveHouse(p){
  ins=ins.filter(q=>q!==p);
  p.fl=0;p.x=p.tx=HDX*T+4;p.y=p.ty=(HDY+1)*T+4;
  p.path=[];p.act='idle';p.hide=0;p.os='tend';p.gk=null;p.sp=.45;p.mode=null;p.hq=null;
  people.push(p)}
/* kế hoạch trong nhà: ăn -> ngồi ghế phòng ăn; ngủ -> lên tầng 2 nằm giường */
function planIn(p){
  if(p.mode==='sleep')p.hq=[{fl:5,x:64,y:19,k:'sleep'}];
  else{const c=CHAIRS[rnd(CHAIRS.length)];p.hq=[{fl:4,x:c[0],y:c[1],k:'eat'}]}}
const HEXIT={fl:4,x:45,y:31,k:'exit'};
function houseTick(p){
  const tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);
  /* đang đi ngoài trời về cửa nhà */
  if(p.os==='gohome'){
    if(p.path.length||Math.hypot(p.tx-p.x,p.ty-p.y)>.7)return false;
    if(tx===HDX&&ty===HDY){enterHouse(p);return true}
    const pth=bfsW(tx,ty,HDX,HDY);
    if(pth&&pth.length){p.path=pth;p.tx=p.x;p.ty=p.y;return false}
    enterHouse(p);return true}
  /* đang ở trong nhà (os==='inh') */
  if(p.act==='eat'){p.moving=0;if((p.t-=DM)<=0){p.act='idle';p.hq=[HEXIT]}return true}
  if(p.act==='sleep'){p.moving=0;const h=hour();if(h>=5.5&&h<21){p.act='idle';p.hq=[HEXIT]}return true}
  if(p.path.length||Math.hypot(p.tx-p.x,p.ty-p.y)>.7)return false;
  if(!p.hq||!p.hq.length)p.hq=[HEXIT];
  const g=p.hq[0];
  if(p.fl!==g.fl){                                   /* khác tầng: ra cầu thang */
    if(tx>=48&&tx<=51&&ty===17){p.fl=g.fl;p.x=p.tx=49*T+4;p.y=p.ty=20*T+4;p.path=[];return true}
    const a=bfs(p.fl,tx,ty,49,17);
    if(a&&a.length){p.path=a;p.tx=p.x;p.ty=p.y;return false}
    p.fl=g.fl;p.x=p.tx=49*T+4;p.y=p.ty=20*T+4;p.path=[];return true}
  if(tx===g.x&&ty===g.y){                           /* đã tới đích */
    p.hq.shift();
    if(g.k==='exit'){leaveHouse(p);return true}
    p.x=p.tx=g.x*T+4;p.y=p.ty=g.y*T+4;
    startAct(p,g.k==='eat'?'eat':'sleep',g.k==='eat'?ri(20,30):0);
    return true}
  const a=bfs(p.fl,tx,ty,g.x,g.y);
  if(a&&a.length){p.path=a;p.tx=p.x;p.ty=p.y;return false}
  p.x=p.tx=g.x*T+4;p.y=p.ty=g.y*T+4;return true}
function startTend(){OW.os='tend';OW.hide=0;OW.path=[];OW.tx=OW.x;OW.ty=OW.y;OW.act='idle';OW.gk=null;OW.sp=1}

const CAVE_T='Cái hang ở phía nam, sau đầm lầy ấy ư? Đừng bén mảng tới đó! bạn sẽ hối hận khi đụng độ thứ bên trong. Từng có người vào đó và không ai trở ra. Nếu lỡ vào, hãy chạy về phía lối ra ngay chỗ các bạn bước vào, nó chạy chậm hơn các bạn một chút.';
const NODES=[
  {t:'Tàu các bạn bị đắm sao?',o:[{t:'Đúng, ở đây có thuyền để về đất liền không?',go:1}]},
  {t:'Một tháng nữa sẽ có thuyền tiếp tế tới dinh thự, lúc đó chúng tôi sẽ nhờ họ đưa các bạn về đất liền. Trong thời gian này các bạn có thể ở lại dinh thự làm khách và phụ giúp các công việc trong dinh thự được chứ?',o:[{t:'Đồng ý, cảm ơn gia chủ',go:2,acc:1},{t:'Không đồng ý',go:3},{t:'Hỏi về cái hang',go:5}]},
  {t:'Tốt quá! Dinh thự ở ngay phía trước, mời các bạn vào. Tôi ra chăm vườn cạnh nhà một lát, cần gì cứ lại hỏi tôi nhé.',o:[{t:'Kết thúc',end:1}]},
  {t:'Vậy sao... Khi nào đổi ý, hãy quay lại nói chuyện với tôi nhé.',o:[{t:'Kết thúc',end:1}]},
  {t:'Cứ tự nhiên như ở nhà nhé. Các bạn cần hỏi gì không?',o:[{t:'Hỏi về cái hang',go:5},{t:'Không có gì',end:1}]},
  {t:CAVE_T,o:[{t:'Tôi hiểu rồi, cảm ơn',end:1},{t:'Hỏi chuyện khác',go:'back'}]}];
function openTalk(P){
  if(!NPCD){NPCD=1;people.filter(p=>!p.pl&&p.cls==='g').forEach(p=>p.acc=Math.random()<.6)}/* NPC trên thuyền random đồng ý / không */
  TK={P,node:ACC[P.pl]?4:0};$('tk').hidden=true;renderTalk()}
function renderTalk(){
  const n=NODES[TK.node],o=$('dO');$('dlg').hidden=false;$('dN').textContent='Chủ đảo (nói với P'+TK.P.pl+')';$('dT').textContent=n.t;o.innerHTML='';
  n.o.forEach((a,i)=>{const b=document.createElement('button');b.className='btn';b.textContent=(i+1)+'. '+a.t;b.onclick=()=>pickOpt(a);o.append(b)});
  o.firstChild.focus()}
function pickOpt(a){if(a.acc)ACC[TK.P.pl]=1;if(a.end)return closeTalk();
  if(a.go==='back')TK.node=TK.from;else{TK.from=TK.node;TK.node=a.go}
  renderTalk()}
function closeTalk(){
  if(!TK)return;const n=TK.P.pl;TK=null;$('dlg').hidden=true;
  if(ACC[n]){
    if(allAcc()){
      if(OW&&OW.os==='meet'){cap('Cả nhóm đã được phép ở lại dinh thự. Chủ đảo ra chăm vườn cạnh nhà.');startTend()}
      else cap('Bạn đã kết thúc cuộc trò chuyện với chủ đảo.')}
    else cap('P'+n+' đã được phép vào dinh thự. Những người chơi còn lại cũng cần nói chuyện với chủ đảo.')}
  else cap('Bạn chưa đồng ý nên chưa thể vào dinh thự. Hãy nói chuyện lại với chủ đảo khi sẵn sàng.')}

/* ===== Hiệu ứng đồ họa: ánh sáng đêm, bóng mây, vignette ===== */
const VG=(()=>{const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d'),r=g.createRadialGradient(CW/2,CH/2,CH*.42,CW/2,CH/2,CW*.62);r.addColorStop(0,'rgba(0,0,10,0)');r.addColorStop(1,'rgba(0,0,10,.42)');g.fillStyle=r;g.fillRect(0,0,CW,CH);return c})();
function nightK(){const h=hour();return Math.max(0,Math.min(1,h>=18&&h<20.5?(h-18)/2.5:h>=20.5||h<5?1:h<6.5?(6.5-h)/1.5:0))}
function clouds(){
  if(iAlpha<=0)return;const k=(.1+.22*GL)*iAlpha*(1-nightK()*.8);if(k<=0)return;
  cx.fillStyle='rgba(0,20,40,'+k.toFixed(3)+')';
  for(let i=0;i<5+Math.round(GL*7);i++){const X=((frame*(.12+.1*GL)+i*260)%(WW+360))-180,Y=(40+i*150)%WH+Math.sin(i*3)*30,S=46*(1+.3*Math.sin(i));
    for(let j=-8;j<=8;j+=1){const w=Math.round(Math.sqrt(1-(j/8)*(j/8))*S);cx.fillRect(Math.round(X-w),Math.round(Y+j*2),w*2,2)}}}
function glow(){
  const nk=nightK();if(nk<=0||iAlpha<=0)return;
  const X=CX0*T,Y=CY0*T,A=HSX*T,B=HSY*T,fl=.85+.15*Math.sin(frame*.1);
  cx.save();cx.globalCompositeOperation='lighter';
  const L=(x,y,w,h)=>{cx.fillStyle='#ffb347';cx.globalAlpha=.11*nk;cx.fillRect(x-3,y-3,w+6,h+6);cx.globalAlpha=.2*nk;cx.fillRect(x-1,y-1,w+2,h+2);cx.fillStyle='#ffd98a';cx.globalAlpha=.8*nk*fl;cx.fillRect(x,y,w,h)};
  [24,42,60,78,96].forEach(i=>L(X+i,Y+26,3,6));
  [[46,-18],[60,-24],[75,-18],[46,-2],[75,-2]].forEach(([i,j])=>L(X+i,Y+j+2,3,6));
  [-40,-22,-4].forEach(j=>L(X+102,Y+j+2,3,6));L(X+21,Y-2,3,6);L(X+62,Y+4,4,8);
  L(A+30,B+14,18,8);L(A+30,B+36,18,8);L(A+7,B+12,6,10);L(A+7,B+33,10,15);
  /* ánh sáng lửa trại */
  cx.fillStyle='#ff9a3c';cx.globalAlpha=.12*nk;cx.fillRect(CAMPX*T-20,CAMPY*T-14,48,36);cx.globalAlpha=.2*nk*fl;cx.fillRect(CAMPX*T-8,CAMPY*T-6,24,20);
  cx.restore()}

function loop(){step();draw();requestAnimationFrame(loop)}

/* ===== Ngày đêm: 24 giờ trong game = 24 phút ngoài đời (1 giây thật = 1 phút game) ===== */
const day=()=>Math.floor(gm/1440)+1;
const KF=[[0,10,15,50,.55],[5,40,30,70,.4],[6.5,255,160,90,.14],[9,255,255,255,0],[15,255,255,255,0],[17,255,170,60,.12],[18.5,255,100,50,.25],[20.5,20,20,70,.45],[24,10,15,50,.55]];
function tint(){
  const h=(6+gm/60)%24,i=KF.findIndex(k=>k[0]>h),a=KF[i-1],b=KF[i],t=(h-a[0])/(b[0]-a[0]),v=j=>a[j]+(b[j]-a[j])*t;
  return[Math.round(v(1)),Math.round(v(2)),Math.round(v(3)),v(4)]}
function clockUI(){
  const h=(6+gm/60)%24,hh=Math.floor(h),mm=Math.floor((h-hh)*60),
    ph=h>=6&&h<11?['🌅','Sáng']:h>=11&&h<14?['☀️','Trưa']:h>=14&&h<18?['🌇','Chiều']:['🌙','Tối'],c=$('clk');
  if(c)c.innerHTML=ph[0]+' Ngày <b>'+day()+'</b> · '+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+' · '+ph[1]+(GL<.25?'':GL<.5?' · ☁️ Nhiều mây':GL<.8?' · 🌧 Mưa':' · ⛈ Giông bão')+(MEAL(h)>=0?' · 🍽 Giờ ăn':'');infoUI()}
function showHud(){
  $('hud').hidden=false;$('tools').hidden=false;lastMin=-1;
  $('gd').hidden=!hudOn;
  $('gd').innerHTML='<b>Hướng dẫn</b><br>WASD / Mũi tên: Di chuyển<br>1-'+nPl+' hoặc Tab: Đổi nhân vật<br>Bấm lên bản đồ để di chuyển<br>Bấm vào NPC để xem nhu cầu<br>E: Nói chuyện với NPC có mũi tên ▼<br>Bước vào cổng lâu đài để vào trong<br>H: Ẩn / hiện hướng dẫn';
  setSel(sel>nPl?1:sel);clockUI()}

/* ===== Lưu tiến trình & reset ===== */
const snapshot=()=>({gm,people:snapP()});
function save(){if(state!=='island')return;try{localStorage.setItem(KEY,JSON.stringify({v:1,seed,nPl,gm,people:snapP(),snap,hunt:HUNT,acc:ACC}))}catch(_){}}
function load(){try{return JSON.parse(localStorage.getItem(KEY))}catch(_){return null}}
function cont(){
  const s=load();if(!s)return;
  nPl=s.nPl;gen(s.seed);snap=s.snap;ACC=s.acc||{};if(!s.acc)for(let i=1;i<=nPl;i++)ACC[i]=1;NPCD=1;TK=null;restore(s);HUNT=s.hunt||{pelt:0,meat:0};
  state='island';iAlpha=1;crashT=45;bx=tbx;shake=0;
  $('menu').hidden=true;$('title').hidden=true;showHud();cap('Tiếp tục hành trình trên Dead Island...')}
function rsLabels(){
  const L={day:'Về đầu ngày hiện tại (Ngày '+day()+')',week:'Về đầu tuần hiện tại (Ngày '+(Math.floor((day()-1)/7)*7+1)+')',all:'Làm lại từ đầu game'};
  document.querySelectorAll('#rs [data-r]').forEach(b=>b.textContent=confirmKey===b.dataset.r?'Bấm lần nữa để xác nhận':L[b.dataset.r])}
function doReset(k){
  if(confirmKey!==k){confirmKey=k;rsLabels();return}
  confirmKey='';$('rs').hidden=true;
  if(k==='all'){try{localStorage.removeItem(KEY)}catch(_){}reset();return}
  const s=k==='day'?snap.day:snap.week;restore(s);snap.day=s;save();showHud();
  cap(k==='day'?'Đã quay về đầu ngày '+day()+'.':'Đã quay về đầu tuần, Ngày '+day()+'.')}

/* ===== Giao diện ===== */
function reset(){
  LS=null;
  gen();
  ACC={};
  OW=null;
  TK=null;
  NPCD=0;
  HUNT={pelt:2,meat:3};
  state='title';
  people=[];
  parts=[];
  iAlpha=0;
  crashT=-1;
  shake=0;
  gm=0;
  snap={};
  inside=false;
  ins=[];
  trans=null;
  ['tools','hud','ask','rs','lv','chr','dlg','tk','goBox']
    .forEach(i=>$(i).hidden=true);
  $('menu').hidden=false;
  $('title').hidden=false;
  const sv=load();
  $('cont').hidden=!sv;
  if(sv)
    $('cont').textContent='Tiếp tục (Ngày '+(Math.floor(sv.gm/1440)+1)+')';
  cap('Một con thuyền trôi dạt giữa biển khơi...');
}
function submit(){
  const v=Number($('np').value);
  if(!Number.isInteger(v)||v<1||v>6){$('err').textContent='Chỉ nhập số từ 1 đến 6.';$('np').select();return}
  nPl=v;sel=1;$('err').textContent='';$('ask').hidden=true;
  cfg=Array.from({length:v},()=>({look:null}));ci=0;
  $('chr').hidden=false;showChr(1)}
/* ===== Chọn nhân vật cho từng người chơi ===== */
const CHARS=[{id:'pA',n:'Aster',k:'man'},{id:'pB',n:'Seraphina',k:'woman'},{id:'pC',n:'Ash',k:'man'},{id:'pD',n:'Aurora',k:'woman'},{id:'pE',n:'Kai',k:'man'},{id:'pF',n:'Silas',k:'man'},{id:'pG',n:'Lumi',k:'woman'}],
  CHM=Object.fromEntries(CHARS.map(c=>[c.id,c]));
function pvDraw(){const c=$('pv').getContext('2d');c.clearRect(0,0,24,30);const l=cfg[ci].look;if(l)c.drawImage(sprite({look:l},0),0,0)}
function showChr(f){
  const taken=cfg.slice(0,ci).map(c=>c.look),P=cfg[ci];
  if(!P.look||taken.includes(P.look))P.look=(CHARS.find(c=>!taken.includes(c.id))||{}).id;
  $('chT').textContent='Người chơi P'+(ci+1)+' / '+nPl+': chọn nhân vật';
  const box=$('chS');box.innerHTML='';
  CHARS.forEach(ch=>{
    const b=document.createElement('button'),used=taken.includes(ch.id),cv2=document.createElement('canvas');
    b.className='opt'+(P.look===ch.id?' on':'');b.disabled=used;b.style.flexDirection='column';
    cv2.width=SW;cv2.height=SH;cv2.style.cssText='width:48px;height:60px;image-rendering:pixelated';
    cv2.getContext('2d').drawImage(sprite({look:ch.id},0),0,0);
    b.append(cv2,document.createTextNode(used?ch.n+' (đã chọn)':ch.n));
    b.onclick=()=>{P.look=ch.id;for(let j=ci+1;j<cfg.length;j++)if(cfg[j].look===ch.id)cfg[j].look=null;showChr(1)};
    box.append(b)});
  $('chOk').textContent=ci<nPl-1?'Tiếp':'Bắt đầu';$('chOk').disabled=!P.look;pvDraw();if(f)$('chOk').focus()}
function chNext(){
  if(!cfg[ci].look)return;
  if(ci<nPl-1){ci++;showChr(1);return}
  $('chr').hidden=true;$('title').hidden=true;
  state='sail';cap('Thuyền lao thẳng về phía một hòn đảo hoang...')}

$('start').onclick=()=>{$('menu').hidden=true;$('lv').hidden=false};
$('goBtn').onclick=()=>{$('goBox').hidden=true;reset()};
$('lv1').onclick=()=>{$('lv').hidden=true;$('ask').hidden=false;$('np').value=1;$('err').textContent='';$('np').focus();$('np').select()};
$('lvX').onclick=()=>{$('lv').hidden=true;$('menu').hidden=false};
$('np').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();submit()}};
$('ok').onclick=submit;
$('chOk').onclick=chNext;
$('chBack').onclick=()=>{if(ci>0){ci--;showChr(1)}else{$('chr').hidden=true;$('ask').hidden=false;$('np').focus();$('np').select()}};
addEventListener('keydown',e=>{if(!$('chr').hidden&&e.key==='Enter'){e.preventDefault();chNext()}});
$('again').onclick=()=>{save();reset()};$('cont').onclick=cont;
$('rsBtn').onclick=()=>{confirmKey='';rsLabels();$('rs').hidden=!$('rs').hidden};
document.querySelectorAll('#rs [data-r]').forEach(b=>b.onclick=()=>doReset(b.dataset.r));
$('rsX').onclick=()=>{confirmKey='';$('rs').hidden=true};
addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;
  if(TK){const kk=e.key.toLowerCase();if(kk==='escape')closeTalk();else if(/^[1-9]$/.test(kk)){const b=$('dO').children[+kk-1];if(b)b.click()}return}
  if(e.key.toLowerCase()==='e'&&state==='island'&&!inside){const P=nearOwner();if(P)openTalk(P);return}
  const k=e.key.toLowerCase();if(k==='h'&&state==='island'){togHud();return}
  if(state==='island'){
    if(/^[1-6]$/.test(k)&&+k<=nPl){setSel(+k);return}
    if(k==='tab'){e.preventDefault();setSel(nextSel());return}
    if(k.startsWith('arrow'))e.preventDefault()}
  keys[k]=1});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=0});
addEventListener('blur',()=>{keys={}});
cv.addEventListener('pointerdown',e=>{
  if(state!=='island'||trans||TK)return;
  const r=cv.getBoundingClientRect(),wx=(e.clientX-r.left)/r.width*CW/(inside?IS:1)+camX,wy=(e.clientY-r.top)/r.height*CH/(inside?IS:1)+camY,
    L=(inside?ins:people).filter(p=>p.pl&&(!inside||p.fl===curF)),c=L.find(p=>Math.abs(p.x-wx)<6&&Math.abs(p.y-8-wy)<8);
  if(c){setSel(c.pl);return}
  const nq=(inside?ins:people).find(p=>!p.pl&&p.n&&p.vis&&!p.hide&&(!inside||p.fl===curF)&&Math.abs(p.x-wx)<6&&Math.abs(p.y-8-wy)<8);
  if(nq){const a={sleep:'đang ngủ',eat:'đang ăn',rest:'đang nghỉ',chat:'đang trò chuyện',clean:'đang dọn dẹp',cook:'đang phụ bếp'}[nq.act]||'đang rảnh';cap((nq.role||'Người lạ')+' '+a+' · Đói '+Math.round(nq.n.hu)+'% · Mệt '+Math.round(nq.n.fa)+'% · Buồn ngủ '+Math.round(nq.n.sl)+'%');return}
  const P=L.find(p=>p.pl===sel);if(P){P.tx=wx;P.ty=wy;P.path=[]}});
const togHud=()=>{hudOn=!hudOn;$('gd').hidden=!hudOn};$('hudBtn').onclick=togHud;
reset();requestAnimationFrame(loop);
/* ===== BỮA ĂN LỚN Ở ĐẠI SẢNH (gia đình chủ đảo + người chơi cùng ngồi bàn chính; NPC thuyền ăn ở bàn nhân viên) ===== */
const MST=k=>Math.floor(k/3)*1440+[0,330,720][k%3];/* phút game bắt đầu bữa thứ k: 6:00 / 11:30 / 18:00 */
const MNAME=['bữa sáng','bữa trưa','bữa tối'];
const SP1=[['Chào mừng mọi người tới với','dinh thự của tôi.'],['1 tháng sau, mọi người có thể đi','thuyền tiếp tế để về đất liền.'],['Trong thời gian này, mong mọi người','cứ tự nhiên hoặc phụ giúp việc','trong dinh thự.'],['Sau đây mời mọi người','bắt đầu dùng bữa.']],
  SP2=[['Mời mọi người dùng bữa.']];
/* 15 ghế: 0 = đầu bàn, 1-7 = hàng trên (đông -> tây), 8-14 = hàng dưới (đông -> tây) */
const DSEAT=[{x:68,y:37}];
for(let x=66;x>=54;x-=2)DSEAT.push({x,y:35});
for(let x=66;x>=54;x-=2)DSEAT.push({x,y:39});
const COOKSPOT=[[75,15],[77,15],[79,15],[81,15]],STBY=[[80,20],[76,20],[78,20]];
let DN=null,DK=1,CART=null,MQ=null;const DISH={on:0,top:-1,bot:-1,head:0};
const idl=p=>!p.path.length&&Math.hypot(p.tx-p.x,p.ty-p.y)<=.7;
const atTile=(p,x,y)=>Math.hypot(p.x-(x*T+4),p.y-(y*T+4))<4;

function lock(p){rel(p);p.evt=1;p.act='idle';p.say='';p.shout=null;p.seat=0;p.goal=null;p.path=[];p.tx=p.x;p.ty=p.y;p.moving=0}
function placeAt(p,x,y){p.fl=1;p.x=p.tx=x*T+4;p.y=p.ty=y*T+4;p.path=[];p.goal=null;p.moving=0}
function route(p,x,y){const a=bfs(1,Math.floor(p.x/T),Math.floor(p.y/T),x,y);if(a&&a.length){p.path=a;p.tx=p.x;p.ty=p.y}else placeAt(p,x,y)}
function seatNpc(p,i){const s=DSEAT[i];if(!s)return;placeAt(p,s.x,s.y);p.seat=1;startAct(p,'dine',1e9)}
function speak(O,L){if(O){O.shout=L;O.seat=0}cap('Chủ dinh thự: "'+L.join(' ')+'"')}

function planSeats(D){
  const used=new Set(),S=[],give=(p,i)=>{if(p&&!used.has(i)){used.add(i);S.push([p,i])}};
  [['Chủ nhân',0],['Phu nhân',1],['Tiểu thư',2],['Cậu chủ',8]].forEach(([r,i])=>give(ins.find(p=>p.role===r),i));
  D.seats=S}

function startMeal(k){
  const D=DN={k,d:Math.floor(k/3)+1,st:MST(k),ph:0,sp:0,spT:0,seats:[]};
  D.cooks=ins.filter(p=>p.role==='Đầu bếp'||p.role==='Phụ bếp');
  D.butler=ins.find(p=>p.role==='Quản gia');
  D.maids=ins.filter(p=>p.role==='Giúp việc').slice(0,2);
  D.cooks.forEach((p,i)=>{lock(p);const s=COOKSPOT[i%COOKSPOT.length];p.goal={fl:1,x:s[0],y:s[1],kind:'cook'}});
  cap('Còn 1 tiếng nữa là tới '+MNAME[k%3]+'. Các đầu bếp và phụ bếp vào bếp nấu ăn.')}

function gather(D){
  D.ph=1;planSeats(D);
  D.seats.forEach(([p,i])=>{lock(p);p.sd=i;p.goal={fl:1,x:DSEAT[i].x,y:DSEAT[i].y,kind:'dine'}});
  [D.butler].concat(D.maids).forEach((p,i)=>{if(!p)return;lock(p);p.goal={fl:1,x:STBY[i][0],y:STBY[i][1],kind:'wait'}});
  D.owner=ins.find(p=>p.role==='Chủ nhân');
  CART={x:82*T+4,y:19*T+7,dx:0,dy:1,lx:0,ly:0,full:1};
  if(D.d===1)D.forced=0;else showMeal();
  cap('Còn 15 phút nữa là tới giờ ăn. Gia đình chủ dinh thự đang ra bàn ăn lớn ở đại sảnh.')}

function mealAns(n,yes){
  if(trans)return;
  MQ=MQ.filter(q=>q!==n);renderMeal();
  if(yes)trans={t:0,cb:()=>{seatPl(n);cap('P'+n+' đã tới bàn ăn lớn ở đại sảnh.')}}}

function pushCart(D){
  D.ph=2;
  D.cooks.forEach(p=>{p.evt=0;p.goal=null;if(p.act==='cook')p.t=0});/* đầu bếp nấu xong, về sinh hoạt bình thường (tự đi ăn ở bàn nhân viên) */
  [[D.butler,63,31],[D.maids[0],61,31],[D.maids[1],65,31]].forEach(([p,x,y],i)=>{
    if(!p)return;const s=STBY[i];
    if(p.fl!==1||Math.hypot(p.x-(s[0]*T+4),p.y-(s[1]*T+4))>72)placeAt(p,s[0],s[1]);
    p.goal=null;route(p,x,y)});
  if(CART&&D.butler){CART.lx=D.butler.x;CART.ly=D.butler.y}
  cap('Quản gia cùng hai giúp việc đẩy xe đồ ăn ra đại sảnh.')}
function cartTick(D){
  const B=D.butler;if(!CART||!B)return;
  const vx=B.x-CART.lx,vy=B.y-CART.ly,l=Math.hypot(vx,vy);
  if(l>.05){CART.dx+=(vx/l-CART.dx)*.2;CART.dy+=(vy/l-CART.dy)*.2}
  CART.lx=B.x;CART.ly=B.y;
  const n=Math.hypot(CART.dx,CART.dy)||1;
  CART.x+=(B.x+CART.dx/n*9-CART.x)*.25;CART.y+=(B.y+CART.dy/n*9-CART.y)*.25}

function startServe(D){
  D.ph=3;D.t3=gm;D.sp=0;D.spT=gm;DISH.on=1;DISH.top=DISH.bot=53;DISH.head=0;D.l2=14;
  D.seats.forEach(([p,i])=>{if(!p.seat)seatNpc(p,i)});/* ai chưa kịp tới ghế thì được đưa tới */
  D.maids.forEach((p,i)=>{const y=i?40:34,a=bfs(1,Math.floor(p.x/T),Math.floor(p.y/T),53,y),b=bfs(1,53,y,67,y);
    if(a&&b){p.path=a.concat(b);p.tx=p.x;p.ty=p.y}else placeAt(p,67,y)});
  cap('Đồ ăn được bày ra bàn.')}
function startEat(D){
  D.ph=4;D.te=gm;DISH.head=1;if(CART)CART.full=0;
  D.seats.forEach(([p])=>{p.ate=D.k;startAct(p,'eat',ri(20,27))});
  cap('Mọi người bắt đầu dùng bữa.')}
function endMeal(D){
  D.seats.map(a=>a[0]).concat(D.cooks,[D.butler],D.maids).forEach(p=>{if(!p)return;p.evt=0;p.seat=0;p.shout=null;p.goal=null;p.path=[];p.act='idle';p.wait=ri(30,120)});
  DISH.on=0;DISH.top=DISH.bot=-1;DISH.head=0;CART=null;MQ=null;DK=D.k+1;DN=null;
  $('meal').hidden=true;cap('Bữa ăn đã kết thúc.')}
function dineSync(){
  DN=null;CART=null;MQ=null;DISH.on=0;DISH.top=DISH.bot=-1;DISH.head=0;
  DK=1;while(MST(DK)+80<=gm)DK++;
  const m=$('meal');if(m)m.hidden=true}

function dineTick(){
  if(!DN){if(gm<MST(DK)-60)return;startMeal(DK)}
  const D=DN,t=gm-D.st;
  if(D.ph===0&&t>=-15)gather(D);
  if(D.ph===1){
    if(D.d===1&&!D.forced&&!trans)forceAll(D);
    if(MQ&&frame%20===0){const c=$('mC');if(c)c.textContent=Math.max(0,Math.ceil(-t))}
    if(t>=0){MQ=null;$('meal').hidden=true;pushCart(D)}}
  if(D.ph===2){
    cartTick(D);
    if(!D.butler||(atTile(D.butler,63,31)&&idl(D.butler))||t>=45)startServe(D)}
  if(D.ph===3){
    const O=D.owner,SP=D.d===1?SP1:SP2,m1=D.maids[0],m2=D.maids[1];
    if(D.sp<SP.length){if(gm>=D.spT){speak(O,SP[D.sp]);D.sp++;D.spT=gm+4.5}}
    else if(!D.sd&&gm>=D.spT){D.sd=1;if(O){O.shout=null;O.seat=1}}
    if(m1&&m1.path.length&&m1.path.length<=D.l2)DISH.top=Math.max(DISH.top,53+D.l2-m1.path.length);
    if(m2&&m2.path.length&&m2.path.length<=D.l2)DISH.bot=Math.max(DISH.bot,53+D.l2-m2.path.length);
    const to=gm-D.t3>45,d1=!m1||idl(m1)||to,d2=!m2||idl(m2)||to;
    if(d1)DISH.top=99;if(d2)DISH.bot=99;
    if(D.sd&&d1&&d2)startEat(D)}
  if(D.ph===4&&gm-D.te>=30)endMeal(D)}

/* --- Vẽ: bong bóng thoại nhiều dòng, xe đồ ăn 2 tầng, đồ trên bàn --- */
function bub(x,y,L){
  cx.font='6px monospace';cx.textAlign='center';
  const w=Math.ceil(Math.max(...L.map(s=>cx.measureText(s).width)))+8,h=L.length*8+3,vw=CW/IS,c0=Math.round(camX);
  let bx=Math.round(x-w/2);bx=Math.max(c0+2,Math.min(c0+vw-w-2,bx));
  const by=Math.round(y-h);
  cx.fillStyle='rgba(255,255,255,.96)';cx.fillRect(bx,by,w,h);cx.fillRect(Math.round(x)-1,by+h,3,2);
  cx.fillStyle='#111';L.forEach((s,i)=>cx.fillText(s,bx+w/2,by+8+i*8-1))}
function cartDraw(){
  if(!CART||curF!==1)return;
  const tx=Math.floor(CART.x/T),ty=Math.floor(CART.y/T),r=FL[1].rid[ty];
  if(!r||r[tx]!==curR)return;
  const x=Math.round(CART.x),y=Math.round(CART.y),R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(x+a,y+b,w,h)};
  R('rgba(0,0,0,.25)',-8,-1,16,2);
  R('#2b2b33',-7,-2,2,2);R('#2b2b33',5,-2,2,2);
  R('#9aa0aa',-7,-12,1,10);R('#9aa0aa',6,-12,1,10);R('#555',7,-13,2,1);R('#555',8,-13,1,6);
  R('#c9ced6',-7,-4,14,1);R('#8a8f98',-7,-3,14,1);
  R('#c9ced6',-7,-10,14,1);R('#8a8f98',-7,-9,14,1);
  if(CART.full){
    R('#e8ecf0',-5,-7,4,3);R('#fff',-4,-8,2,1);R('#d4a63a',-1,-6,1,2);R('#e8ecf0',1,-7,5,3);R('#c0392b',2,-8,3,1);
    R('#e8ecf0',-5,-13,4,3);R('#fff',-4,-14,2,1);R('#b5651d',1,-12,5,2);R('#5aa845',2,-13,2,1)}}
function tbl(px,py,x,y){
  const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(px+a,py+b,w,h)};
  if(y===37)R('#a3202a',0,2,T,3);
  if(y===37&&(x-57)%4===0){R('#f4f4f6',3,1,2,4);R('#ffd23f',3,0,2,1);if((frame>>3)%2)R('#ff8a3d',3,-1,1,1)}
  if(!DISH.on)return;
  if(y===37&&(x-55)%4===0&&x<=Math.min(DISH.top,DISH.bot)){R('#d8dce2',1,2,6,4);R('#b5651d',2,2,4,3);R('#5aa845',1,2,2,1);R('#c0392b',5,3,1,1)}
  const pl=(y===36&&x%2===0&&x>=54&&x<=66&&x<=DISH.top)||(y===38&&x%2===0&&x>=54&&x<=66&&x<=DISH.bot)||(x===67&&y===37&&DISH.head);
  if(pl){R('#fff',1,2,6,4);R('#cfd3d8',1,5,6,1);R(['#c0392b','#d4a63a','#5aa845'][(x+y)%3],3,3,2,2)}}


/* ===== HANG ĐỘNG CẤM + OAN HỒN =====
   Hang lớn 170x104 ô: hang chính + đại sảnh lối vào + 9 hang nhánh (đã làm TO hơn)
   (thạch nhũ, mỏ than, khoáng sản sắt/vàng, tinh thể kim cương), đường hầm rộng 5 ô, ray xe mỏ, đèn treo.
   Ô đặc biệt: 57 = lối ra, 58 = thạch nhũ, 59 = mỏ than, 60 = sắt + vàng, 61 = tinh thể. */
function buildCave(){
  const im=Array.from({length:IH},()=>Array(IW).fill(1)),rid=Array.from({length:IH},()=>Array(IW).fill(0)),RM=[],rail=new Set(),lamps=[],carts=[];
  const carve=(x,y,id,keep)=>{if(x>0&&y>0&&x<IW-1&&y<IH-1){im[y][x]=0;if(!(keep&&rid[y][x]))rid[y][x]=id}};
  const ell=(a0,b0,rx,ry,k,id)=>{for(let y=b0-ry-2;y<=b0+ry+2;y++)for(let x=a0-rx-2;x<=a0+rx+2;x++){const a=Math.atan2((y-b0)/ry,(x-a0)/rx),r=1+.12*Math.sin(3*a+k)+.08*Math.sin(5*a+k*2),d=Math.hypot((x-a0)/rx,(y-b0)/ry)/r;if(d<1)carve(x,y,id)}};
  const gates=[],gk=new Set();
  const tun=(pts,w)=>{let pr=null;
    for(let i=1;i<pts.length;i++){const[a,b]=pts[i-1],[c,d]=pts[i],n=Math.max(1,Math.abs(c-a),Math.abs(d-b));
      for(let j=0;j<=n;j++){const x=a+Math.round((c-a)*j/n),y=b+Math.round((d-b)*j/n);
        for(let u=-w;u<=w;u++)for(let v=-w;v<=w;v++)carve(x+u,y+v,1,1);
        const r=rid[y][x];
        if(pr&&pr.r!==r&&(pr.r===1||r===1)){
          const g=pr.r===1?pr:{x,y},id=pr.r===1?r:pr.r,k=g.x+','+g.y;
          if(!gk.has(k)){gk.add(k);gates.push([g.x,g.y,pr.x!==x?1:0,id])}}
        pr={x,y,r}}}};
  /* [id, tâm x, tâm y, rx, ry, loại]: st = thạch nhũ, coal = mỏ than, ore = sắt/vàng, cry = tinh thể */
  const SC=[[2,22,20,17,13,'st'],[3,148,20,17,13,'coal'],[4,20,54,16,15,'ore'],[5,150,54,16,15,'cry'],[6,24,88,19,11,'st'],[7,146,88,19,11,'coal'],[8,85,12,19,10,'st'],[9,50,10,12,8,'ore'],[10,120,10,12,8,'coal']];
  ell(85,52,46,22,1,1);ell(85,92,16,6,7,1);
  SC.forEach(([id,x,y,rx,ry])=>ell(x,y,rx,ry,id,id));
  [[[60,40],[38,30],[28,24],[22,20]],[[110,40],[132,30],[142,24],[148,20]],
   [[44,54],[34,54],[24,54]],[[126,54],[136,54],[146,54]],
   [[58,66],[36,76],[28,86],[24,88]],[[112,66],[134,76],[142,86],[146,88]],
   [[85,34],[85,22],[85,14]],[[50,10],[120,10]],
   [[30,16],[44,10]],[[140,16],[126,10]],
   [[22,30],[20,42]],[[148,30],[150,42]],[[20,66],[24,80]],[[150,66],[146,80]],
   [[24,88],[146,88]],[[85,60],[85,99]]].forEach(p=>tun(p,2));
  for(let x=83;x<=87;x++)im[101][x]=57;/* lối ra (dải 5 ô ở đáy đại sảnh phía nam) */
  /* ray xe mỏ */
  const RLS=[[[85,99],[85,14]],[[20,54],[150,54]],[[24,88],[146,88]],[[50,10],[120,10]]];
  RLS.forEach(([[a,b],[c,d]])=>{const n=Math.max(Math.abs(c-a),Math.abs(d-b));for(let j=0;j<=n;j++)rail.add((b+Math.round((d-b)*j/n))*IW+a+Math.round((c-a)*j/n))});
  /* thạch nhũ (58) / mỏ than (59) / sắt+vàng (60) / tinh thể (61): chỉ đặt ở chỗ 8 ô quanh đều là sàn nên không bao giờ chặn đường */
  const kp=new Set(CHB.map(([x,y])=>y*IW+x)),KT={};SC.forEach(s=>KT[s[0]]=s[5]);
  const TP={st:58,coal:59,ore:60,cry:61};
  for(let y=2;y<IH-2;y++)for(let x=2;x<IW-2;x++){
    if(im[y][x]!==0||rail.has(y*IW+x)||kp.has(y*IW+x)||(y>=82&&x>=62&&x<=108))continue;
    let ok=1;for(let j=-1;j<=1&&ok;j++)for(let i=-1;i<=1;i++)if(im[y+j][x+i]!==0){ok=0;break}
    if(!ok)continue;
    const k=KT[rid[y][x]],h=hs(x*3+1,y*7+2)%100;let t=0;
    if(k){if(h<12)t=TP[k];else if(k!=='st'&&h<15)t=58}
    else{if(h<3)t=58;else if(h<5)t=59;else if(h===5)t=60;else if(h===6)t=61}
    if(t)im[y][x]=t}
  /* bóng đèn treo */
  const addL=(x,y)=>{x=Math.round(x);y=Math.round(y);if(im[y]&&im[y][x]===0&&!rail.has(y*IW+x)&&!lamps.some(l=>l[0]===x&&l[1]===y))lamps.push([x,y,rid[y][x],hs(x,y)%8?1:0])};
  RLS.forEach(([[a,b],[c,d]])=>{const hz=b===d,n=Math.max(Math.abs(c-a),Math.abs(d-b));for(let j=3;j<=n;j+=7){const x=a+Math.round((c-a)*j/n),y=b+Math.round((d-b)*j/n);addL(hz?x:x-1,hz?y-1:y)}});
  SC.forEach(([id,x,y,rx,ry])=>{addL(x-rx*.5,y-1);addL(x+rx*.5,y+1);addL(x,y-ry*.5);addL(x,y+ry*.5);addL(x-rx*.7,y+ry*.4);addL(x+rx*.7,y-ry*.4)});
  for(let y=34;y<=72;y+=9)for(let x=50;x<=122;x+=12)addL(x,y);
  [[72,90],[98,90],[72,96],[98,96]].forEach(([x,y])=>addL(x,y));
  /* xe mỏ (0 = vàng, 1 = than, 2 = kim cương) */
  [[40,54,0],[130,54,1],[85,40,2],[85,66,0],[60,88,1],[110,88,2],[70,10,0],[100,10,1],[85,80,0]].forEach(c=>{if(rail.has(c[1]*IW+c[0]))carts.push(c)});
  const NAMES={2:'Hang thạch nhũ',3:'Hang mỏ than',4:'Hang khoáng sản (sắt, vàng)',5:'Hang tinh thể kim cương',6:'Hang thạch nhũ sâu',7:'Hang mỏ than sâu',8:'Đại sảnh thạch nhũ phía bắc',9:'Hang khoáng sản nhỏ',10:'Hang than nhỏ'};
  const FC={st:['#3a3d4a','#343746'],coal:['#2c2b30','#27262b'],ore:['#4a3d35','#43372f'],cry:['#2f3a50','#2a3448']};
  RM[1]={n:'Hang động chính (nguy hiểm!)',f:['#3a3742','#34313c'],x0:0,y0:0,x1:IW-1,y1:IH-1,s:1};
  SC.forEach(([id,,,,,k])=>RM[id]={n:NAMES[id],f:FC[k],x0:0,y0:0,x1:IW-1,y1:IH-1,s:1});
  return{im,rid,RM,rail,lamps,carts,gates}}
function railDraw(F,x0,y0,x1,y1){
  const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(a,b,w,h)},has=(x,y)=>F.rail.has(y*IW+x);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    if(F.rid[y][x]<1||!has(x,y))continue;
    const px=x*T,py=y*T,hz=has(x-1,y)||has(x+1,y),vt=has(x,y-1)||has(x,y+1);
    if(hz||!vt){R('#4a2f17',px+1,py+1,2,6);R('#4a2f17',px+5,py+1,2,6);R('#aab0ba',px,py+2,T,1);R('#6b7078',px,py+3,T,1);R('#aab0ba',px,py+5,T,1);R('#6b7078',px,py+6,T,1)}
    if(vt){R('#4a2f17',px+1,py+1,6,2);R('#4a2f17',px+1,py+5,6,2);R('#aab0ba',px+2,py,1,T);R('#aab0ba',px+5,py,1,T)}}}
/* Khung gỗ ở cửa vào các hang nhánh (xà ngang + 2 trụ), đường hầm rộng 5 ô nên khung dài 5 ô */
function gateDraw(F,x0,y0,x1,y1){
  const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(a,b,w,h)};
  F.gates.forEach(([x,y,h,id])=>{
    if(x<x0-3||x>x1+3||y<y0-3||y>y1+3)return;
    const px=x*T,py=y*T,L=5*T;
    if(h){/* đường hầm đi ngang: khung nằm dọc */
      const ty=py-2*T;
      R('rgba(0,0,0,.3)',px+2,ty+3,7,L);
      R('#4a2f17',px+1,ty-1,6,L+2);R('#8a5a2e',px+2,ty-1,3,L+2);R('#b8864f',px+2,ty-1,1,L+2);
      [ty-6,ty+L-3].forEach(by=>{R('#3a2410',px,by,8,8);R('#6b4423',px+1,by,6,6);R('#a8743f',px+1,by,6,1);R('#2a1608',px+3,by+3,2,2)})
    }else{/* đường hầm đi dọc: khung nằm ngang */
      const tx=px-2*T;
      R('rgba(0,0,0,.3)',tx+1,py+4,L,7);
      R('#4a2f17',tx-1,py+1,L+2,6);R('#8a5a2e',tx-1,py+2,L+2,3);R('#b8864f',tx-1,py+2,L+2,1);
      [tx-5,tx+L-3].forEach(bx=>{R('#3a2410',bx,py-6,8,10);R('#6b4423',bx+1,py-6,6,8);R('#a8743f',bx+1,py-6,6,1);R('#2a1608',bx+3,py-2,2,2)})
    }})}
function mineCarts(F,x0,y0,x1,y1){
  F.carts.forEach(([x,y,k])=>{
    if(x<x0||x>x1||y<y0||y>y1||F.rid[y][x]<1)return;
    const px=x*T,py=y*T,R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(px+a,py+b,w,h)},o=k===0?'#ffd23f':k===1?'#2a2c32':'#5ad1ff';
    R('rgba(0,0,0,.3)',-1,7,10,2);
    R('#6b3b22',-1,2,10,5);R('#8a5030',-1,2,10,1);R('#4a2412',-1,6,10,1);R('#8a8f98',2,3,1,3);R('#8a8f98',6,3,1,3);
    R(o,0,0,3,2);R(o,3,-1,4,3);R(o,6,0,3,2);
    R('#1b1b20',1,7,2,2);R('#1b1b20',6,7,2,2)})}
function signTick(){
  if(inside||frame%8)return;
  const n=people.some(p=>p.pl&&!p.hide&&Math.hypot(p.x-(SGX*T+4),p.y-(SGY*T+4))<26);
  if(n&&!SGN)cap('Bảng cấm: "NGUY HIỂM! CẤM VÀO HANG ĐỘNG." Có thứ gì đó đang canh giữ bên trong...');
  SGN=n?1:0}
function los(a,b){
  const dx=b.x-a.x,dy=b.y-a.y,n=Math.ceil(Math.hypot(dx,dy)/3),M=FL[6].im;
  for(let i=1;i<n;i++){const t=(M[Math.floor((a.y+dy*i/n)/T)]||[])[Math.floor((a.x+dx*i/n)/T)];if(t!==0&&t!==57)return false}
  return true}
function gmove(G,tx,ty,sp){
  const dx=tx-G.x,dy=ty-G.y,d=Math.hypot(dx,dy);if(Math.abs(dx)>.3)G.dir=dx>0?1:-1;
  if(d<=sp){G.x=tx;G.y=ty;return true}G.x+=dx/d*sp;G.y+=dy/d*sp;return false}
  const GH_SPEED=1.4;   /* tốc độ đuổi: nhanh hơn đi bộ (1.25 khi có playerkit), chậm hơn chạy nhanh Q (2.1) */
  const GH_SLOW=.5;     /* tốc độ khi bị choáng sau khi chém hụt */
  const GH_SLOW_T=1;    /* thời gian choáng (giây) */
function ghostTick(){
  if(!GH)return;/* oan hồn hoạt động miễn là có người trong hang, dù bạn đang xem nhân vật khác */
  const G=GH,A=ins.filter(p=>p.pl&&p.fl===6);if(!A.length)return;
  const dt=Math.min(DM,.1);let P=null,d=1e9;
  A.forEach(p=>{const q=Math.hypot(p.x-G.x,p.y-G.y);if(q<d){d=q;P=p}});
  if(G.slow>0)G.slow=Math.max(0,G.slow-dt);
  const see=d<110&&los(G,P);
  if(G.st==='patrol'){/* đi quanh các hang nhỏ, chậm */
    if(see){G.st='laugh';G.t=0;G.tgt=P;G.path=[];cap('Oan hồn đã nhìn thấy bạn... nó đang cười!');return}
    if(G.wait>0){G.wait-=dt;return}
    if(!G.path.length){const w=CHB[rnd(CHB.length)],a=bfs(6,Math.floor(G.x/T),Math.floor(G.y/T),w[0],w[1]);if(a&&a.length)G.path=a;else{G.wait=1;return}}
    if(gmove(G,G.path[0][0],G.path[0][1],.45))G.path.shift();
    if(!G.path.length)G.wait=1+Math.random()*2.5}
  else if(G.st==='laugh'){/* cười 1,5 giây rồi mới đuổi */
    G.t+=dt;G.dir=P.x>=G.x?1:-1;
    if(G.t>=1.5){G.st='chase';G.rt=0;G.lost=0;G.path=[];cap('Oan hồn đuổi theo bạn! Chạy đi!')}}
  else if(G.st==='chase'){
    if(see||d<140)G.lost=0;else G.lost+=dt;
    if(G.lost>3.5){G.st='patrol';G.wait=1;G.path=[];return}
    if(d<10){G.st='slash';G.t=0;G.tgt=P;return}
    const sp=G.slow>0?GH_SLOW:GH_SPEED;/* nhanh hơn người đi bộ một chút; đang choáng thì chậm hẳn */
    if(los(G,P))gmove(G,P.x,P.y,sp);
    else{if(--G.rt<=0||!G.path.length){G.rt=10;const a=bfs(6,Math.floor(G.x/T),Math.floor(G.y/T),Math.floor(P.x/T),Math.floor(P.y/T));G.path=a||[]}
      if(G.path.length&&gmove(G,G.path[0][0],G.path[0][1],sp))G.path.shift()}}
  else if(G.st==='slash'){
    G.t+=dt;const V=A.find(p=>G.tgt&&p.pl===G.tgt.pl);
    if(V)G.dir=V.x>=G.x?1:-1;
    if(G.t>=.45){
      if(V&&Math.hypot(V.x-G.x,V.y-G.y)<24){killPlayer(V.pl);G.st='patrol';G.wait=1.5;G.path=[]}
      else{G.st='chase';G.path=[];G.rt=0;G.slow=GH_SLOW_T;cap('Oan hồn chém hụt! Nó bị choáng một lúc, chạy đi!')}}}}
function gameOver(){
  if(LS)LS.fin=1;
  cap('Oan hồn đã chém chết người chơi cuối cùng. Trò chơi kết thúc...');infoUI();
  state='over';$('goBox').hidden=false}

const DKC=document.createElement('canvas');DKC.width=CW;DKC.height=CH;const DKX=DKC.getContext('2d');
function lampHole(k,x,y,r,a){const g=k.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,'rgba(0,0,0,'+a+')');g.addColorStop(.55,'rgba(0,0,0,'+(a*.55)+')');g.addColorStop(1,'rgba(0,0,0,0)');k.fillStyle=g;k.fillRect(x-r,y-r,r*2,r*2)}
const GHC=()=>!!GH&&(GH.st==='chase'||GH.st==='slash'||GH.st==='laugh');
/* độ sáng 0..1 của bóng đèn: bình thường thỉnh thoảng giật nhẹ; khi bị oan hồn đuổi thì chập chờn và tắt phụt */
function lampV(l){
  if(!l[3])return 0;
  if(GHC()){
    if((frame+l[0]*5)%67<5)return 0;
    const k=hs(l[0]*7+(frame>>2),l[1]*13+3)%100;
    return k<34?1:k<52?.4:0}
  return hs(l[0]+(frame>>3),l[1]+9)%100<8?.55:1}
function caveLight(){
  const P=ins.find(p=>p.pl&&p.pl===sel)||ins.find(p=>p.pl),cX=Math.round(camX),cY=Math.round(camY),k=DKX,vw=CW/IS,vh=CH/IS,ch=GHC();
  const L=FL[6].lamps.filter(l=>l[0]*T>cX-80&&l[0]*T<cX+vw+80&&l[1]*T>cY-80&&l[1]*T<cY+vh+80),V=L.map(lampV);
  /* lớp tối vẽ riêng, khoét sáng quanh người chơi và quanh các bóng đèn đang bật */
  k.setTransform(1,0,0,1,0,0);k.globalCompositeOperation='source-over';k.clearRect(0,0,CW,CH);
  k.setTransform(IS,0,0,IS,-cX*IS,-cY*IS);
  k.fillStyle='rgba(2,2,12,.9)';k.fillRect(cX-4,cY-4,vw+8,vh+8);
  k.globalCompositeOperation='destination-out';
  if(P){const r1=ch?150+hs(frame>>1,5)%40:220,g=k.createRadialGradient(P.x,P.y-6,50,P.x,P.y-6,r1);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');k.fillStyle=g;k.fillRect(P.x-r1,P.y-6-r1,r1*2,r1*2)}
  L.forEach((l,i)=>{if(V[i]>0)lampHole(k,l[0]*T+4,l[1]*T+2,64,(.85+.1*Math.sin(frame*.2+l[0]*1.7))*V[i])});
  k.globalCompositeOperation='source-over';
  cx.save();cx.setTransform(1,0,0,1,0,0);cx.drawImage(DKC,0,0);cx.restore();
  /* ánh cam ấm (đỏ khi bị đuổi) */
  cx.save();cx.globalCompositeOperation='lighter';
  const col=ch?'255,60,40':'255,170,70';
  L.forEach((l,i)=>{const v=V[i];if(!v)return;const x=l[0]*T+4,y=l[1]*T+2,g=cx.createRadialGradient(x,y,2,x,y,56);g.addColorStop(0,'rgba('+col+','+(.2*v).toFixed(3)+')');g.addColorStop(1,'rgba('+col+',0)');cx.fillStyle=g;cx.fillRect(x-56,y-56,112,112)});
  cx.restore();
  L.forEach((l,i)=>{const v=V[i],x=l[0]*T+4,y=l[1]*T,R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(x+a,y+b,w,h)};
    R('#15151a',0,-26,1,17);R('#3a3a40',-1,-9,3,2);
    if(v>0){cx.globalAlpha=Math.max(.5,v);R(ch?'#ff6a4a':'#ffd23f',-1,-7,3,3);R('#fff6c0',0,-6,1,1);cx.globalAlpha=1}else R('#55525c',-1,-7,3,3)});
  ghostDraw()}

function ghostDraw(){
  const G=GH;if(!G)return;
  let md=999;ins.forEach(p=>{if(p.pl&&p.fl===6)md=Math.min(md,Math.hypot(p.x-G.x,p.y-G.y))});
  const st=G.st,al=st==='patrol'?Math.max(.3,Math.min(1,1.25-md/190)):1,x=Math.round(G.x),y=Math.round(G.y),bob=Math.round(Math.sin(frame*.08)*1.5);
  cx.fillStyle='rgba(0,0,0,.3)';cx.fillRect(x-7,y-1,14,2);
  cx.save();cx.translate(x+(st==='laugh'?Math.round(Math.sin(frame*.9)):0),y+bob-3);cx.scale(G.dir,1);
  const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(a,b,w,h)};
  cx.globalAlpha=al*(.14+.06*Math.sin(frame*.1));R('#cfe6ff',-12,-32,24,36);cx.globalAlpha=al;
  /* cây liềm sau lưng (khi chém thì vung ra phía trước) */
  if(st==='slash'){const p=Math.min(1,G.t/.45),a1=-2.6+p*3.4;
    for(let a=-2.6;a<=a1;a+=.12){cx.globalAlpha=al*(.25+.6*(a+2.6)/3.4);R('#e8f0ff',Math.round(Math.cos(a)*17)-1,Math.round(-14+Math.sin(a)*17)-1,2,2)}
    cx.globalAlpha=al;for(let i=0;i<8;i++)R(i<2?'#8a95a3':'#dfe6ee',Math.round(Math.cos(a1)*(10+i*1.2)),Math.round(-14+Math.sin(a1)*(10+i*1.2)),2,2)}
  else{for(let i=0;i<27;i++)R('#4a3b2c',-8+Math.round(i*.55),-1-i,2,1);
    for(let i=0;i<15;i++){const bx2=7+i,by2=-27+Math.round(i*i*.055);R('#dfe6ee',bx2,by2,2,i>10?1:2);R('#8a95a3',bx2,by2+2,2,1)}}
  /* váy trắng rách */
  for(let j=0;j<10;j++){const w=8+Math.round(j*.9);R(j%3?'#f0efea':'#e2e0d8',-(w>>1),-9+j,w,1)}
  for(let i=0;i<9;i++){const hh=1+((i*7+(frame>>5))%3);R(i%2?'#e2e0d8':'#f0efea',-8+i*2,1,2,hh)}
  R('#a9a79f',-3,-6,2,3);R('#8f8d86',2,-2,2,2);R('#7a7870',-5,-1,1,3);R('#a9a79f',4,-7,1,2);R('#8f8d86',-1,-1,1,2);
  R('#f0efea',-4,-18,8,10);R('#d8d6ce',3,-18,1,10);R('#e2e0d8',-5,-18,10,2);R('#a9a79f',-4,-12,2,1);R('#a9a79f',1,-15,1,2);
  /* tay */
  R('#ece0da',-6,-16,2,9);R('#ddd0c8',-6,-8,2,2);
  if(st==='chase'||st==='slash'){R('#ece0da',4,-16,6,2);R('#ddd0c8',10,-16,2,2)}else{R('#ece0da',4,-17,2,8);R('#ddd0c8',4,-9,2,2)}
  /* đầu: tóc đen dài che một bên mắt */
  R('#f3e8e2',-3,-25,6,6);R('#15121a',-4,-28,8,3);R('#15121a',-5,-26,2,17);R('#15121a',3,-26,2,15);R('#15121a',-3,-25,4,3);
  R('#15121a',-6,-12,2,4);R('#15121a',4,-12,2,3);
  R(st==='chase'||st==='slash'?'#ff5a4a':'#ff2a2a',1,-22,2,1);
  if(st==='chase'||st==='slash'||st==='laugh')R('#ff2a2a',-2,-22,2,1);
  if(st==='laugh'){R('#14070b',-2,-20,5,3);R('#f4f4f4',-2,-20,5,1)}else R('#6a3a3a',-1,-19,2,1);
  cx.restore();cx.globalAlpha=1;
  if(G.slow>0){for(let i=0;i<3;i++){const a=frame*.25+i*2.1;cx.fillStyle='#ffe45c';cx.fillRect(Math.round(x+Math.cos(a)*7),Math.round(y+bob-34+Math.sin(a)*2),2,2)}}
  if(st==='laugh')bub(x,y-38+bob,[(frame>>3)%2?'DIE':'AAAAAAAAAAAAA!'])}

/* ===== Cây chết, bảng cấm, sương mù đầm lầy ===== */
function dtree(x,y){
  const h=hs(x,y),px=x*T,py=y*T,R=(c,a,b,w,hh)=>{cx.fillStyle=c;cx.fillRect(px+a,py+b,w,hh)};
  R('rgba(0,0,0,.25)',0,6,8,2);R('#2c2216',3,-6,2,13);R('#3d2f1f',3,-6,1,13);
  R('#2c2216',1,-5,2,1);R('#2c2216',0,-6,1,2);R('#2c2216',5,-3,2,1);R('#2c2216',6,-5,1,2);R('#2c2216',2,-2,1,1);
  if(h%2)R('#5f7a4a',1,-4,1,2);R('#56703f',5,-2,2,1);R('#6f8a58',4,0,1,4)}
function sign(x,y){
  const px=x*T,py=y*T,R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(px+a,py+b,w,h)};
  R('rgba(0,0,0,.25)',0,7,8,1);R('#4a2f17',3,-1,2,9);R('#3a2410',-1,-9,10,9);R('#a8794a',0,-8,8,7);R('#c89a62',0,-8,8,1);
  for(let i=0;i<6;i++){R('#d8392b',1+i,-7+i,1,1);R('#d8392b',6-i,-7+i,1,1)}
  cx.font='bold 5px monospace';cx.textAlign='center';cx.lineWidth=2;cx.strokeStyle='#000';cx.strokeText('CẤM',px+4,py-11);cx.fillStyle='#ff5a4a';cx.fillText('CẤM',px+4,py-11)}
function mist(x0,x1,y0,y1){
  for(let y=Math.max(y0,97);y<=y1;y++)for(let x=x0;x<=x1;x++){const t=m[y][x];
    if(t===SWAMP||t===POOL||t===DTREE||t===CAVE||t===SIGN){cx.globalAlpha=.1+.06*Math.sin(frame*.03+x*.3+y*.5);cx.fillStyle='#b8d4a0';cx.fillRect(x*T,y*T,T,T)}}
  cx.globalAlpha=1}

/*PATCH_PERPLAYER*/
/* ===== MỖI NGƯỜI CHƠI VÀO / RA NHÀ ĐỘC LẬP (không còn teleport cả nhóm) ===== */
function allPl(){return people.concat(ins).filter(p=>p.pl)}
function allAcc(){return allPl().every(p=>ACC[p.pl])}
function slot(q){return (q.pl-1)%6}
function snapCam(){
  const P=ins.find(p=>p.pl===sel);
  if(P){camX=Math.max(0,Math.min(IW*T-CW/IS,P.x-CW/IS/2));camY=Math.max(0,Math.min(IH*T-CH/IS,P.y-CH/IS/2));return}
  const Q=people.find(p=>p.pl===sel);if(!Q)return;
  camX=Math.max(0,Math.min(WW-CW,Q.x-CW/2));camY=Math.max(0,Math.min(WH-CH,Q.y-CH/2))}
function syncView(snap){
  const P=ins.find(p=>p.pl===sel);inside=!!P;
  if(P){curF=P.fl;curR=ridAt(P)||1;IS=curF===6?CW/CAVEZ:IS0}else IS=IS0;
  if(snap)snapCam()}
function warp(q,fn){if(q.pl===sel&&!trans)trans={t:0,cb:fn};else fn()}
function putIn(q,fl,x,y){
  people=people.filter(p=>p!==q);ins=ins.filter(p=>p!==q);
  Object.assign(q,{fl,x:x*T,y:y*T,tx:x*T,ty:y*T,path:[],ph:1,moving:0,vis:1,delay:0});ins.push(q)}
function putOut(q,x,y){
  ins=ins.filter(p=>p!==q);people=people.filter(p=>p!==q);
  Object.assign(q,{fl:0,x,y,tx:x,ty:y,path:[],moving:0});people.push(q)}
function newGhost(){const w=CHB[rnd(9)];GH={x:w[0]*T+4,y:w[1]*T+4,path:[],st:'patrol',t:0,wait:2,dir:1,tgt:null,lost:0,rt:0}}
function setSel(n){
  const A=allPl();if(!A.some(p=>p.pl===n)&&A.length)n=A[0].pl;
  sel=n;syncView(true);infoUI()}
function nextSel(){const a=allPl().map(p=>p.pl).sort((x,y)=>x-y);return a.find(n=>n>sel)||a[0]}
function infoUI(){
  const e=$('sl');if(!e)return;
  const n=sel,A=allPl().sort((a,b)=>a.pl-b.pl),P=A.find(p=>p.pl===n),all=people.concat(ins),
    ba=all.filter(p=>!p.pl&&p.cls==='g').length,
    ma=all.filter(p=>!p.pl&&p.cls==='s').length;
  BTOT=Math.max(BTOT,ba);MTOT=Math.max(MTOT,ma);
  e.innerHTML='<b>Nhân vật đang điều khiển</b><br>'+(P?'<span class="sw" style="background:'+P.c+'"></span>':'')+'<b>P'+n+'</b> / '+nPl+' người chơi<br>'+
    A.map(p=>'<span class="sw" style="background:'+p.c+'"></span>P'+p.pl).join('')+
    '<br><b>Sống sót</b><br>Người chơi: <b>'+A.length+'/'+nPl+'</b><br>NPC thuyền: <b>'+ba+'/'+BTOT+'</b><br>NPC dinh thự: <b>'+ma+'/'+MTOT+'</b>'}

function doors(){
  const at=(p,t)=>{const r=FL[p.fl]&&FL[p.fl].im[Math.floor(p.y/T)];return r&&r[Math.floor(p.x/T)]===t};
  people.filter(p=>p.pl).forEach(p=>{
    const tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);
    if((m[ty]||[])[tx]===DOOR){
      if(ACC[p.pl])enter(p);
      else{p.x=p.tx=72*T+4;p.y=p.ty=41*T+4;p.path=[];if(p.pl===sel)cap('Vui lòng đối thoại với chủ dinh thự trước khi vào.')}
      return}
    if(tx===HX+2&&ty===HY+3){enterHut(p);return}
    if(tx===HDX&&ty===HDY){ownDoor(p);return}
    if(tx===CVX&&ty===CVY){enterCave(p)}});
  ins.filter(p=>p.pl).forEach(p=>{
    if(at(p,6))leave(p);
    else if(at(p,45))leaveHut(p);
    else if(at(p,50))leaveOwn(p);
    else if(at(p,57))leaveCave(p);
    else if(at(p,36))stairs(p)})}
function stairs(q){warp(q,()=>{
  if(q.fl>=4){q.fl=q.fl===4?5:4;q.x=q.tx=(49+rnd(2))*T+4;q.y=q.ty=20*T+4}
  else{q.fl=3-q.fl;q.x=q.tx=(57+rnd(6))*T+4;q.y=q.ty=19*T+4}
  q.path=[];
  if(q.pl===sel){curF=q.fl;curR=1;snapCam();cap(curF===2||curF===5?'Bạn lên tầng 2.':'Bạn xuống tầng 1.')}})}
function enter(q){warp(q,()=>{
  putIn(q,1,55.5+slot(q)*1.5,52);
  if(q.pl===sel){syncView(true);cap('Sảnh chính. Cầu thang lên tầng 2 ở cuối sảnh; hành lang phải: bếp lớn, thư viện, phòng trà, nhà kính; hành lang trái: phòng người làm.')}})}
function leave(q){warp(q,()=>{
  putOut(q,72*T+4+(slot(q)-2)*6,41*T+4);
  if(q.pl===sel){syncView(true);cap('Bạn đã bước ra sân lâu đài.')}})}
function enterHut(q){warp(q,()=>{
  putIn(q,3,47+slot(q)*1.3,30);
  if(q.pl===sel){syncView(true);cap('Nhà gỗ của thợ săn: súng shotgun, tủ đồ, bàn ghế, đầu hươu và thảm da thú.')}})}
function leaveHut(q){warp(q,()=>{
  putOut(q,(HX+2)*T+4+(slot(q)-2)*6,(HY+5)*T+4);
  if(q.pl===sel){syncView(true);cap('Bạn đã bước ra khỏi nhà gỗ.')}})}
function ownDoor(q){
  if(!ACC[q.pl]){q.y=q.ty=(HDY+1)*T+4;q.path=[];if(q.pl===sel)cap('Đây là nhà riêng của chủ đảo. Hãy xin phép chủ đảo trước.');return}
  enterOwn(q)}
function enterOwn(q){warp(q,()=>{
  putIn(q,4,44.5+slot(q)*1.5,29);
  if(q.pl===sel){syncView(true);cap('Nhà chủ đảo: tầng 1 có phòng khách, bếp và phòng ăn. Cầu thang dẫn lên phòng làm việc và phòng ngủ.')}})}
function leaveOwn(q){warp(q,()=>{
  putOut(q,HDX*T+4+(slot(q)-2)*6,(HDY+1)*T+4);
  if(q.pl===sel){syncView(true);cap('Bạn đã bước ra khỏi nhà chủ đảo.')}})}
function enterCave(q){warp(q,()=>{
  if(!ins.some(p=>p.pl&&p.fl===6))newGhost();
  putIn(q,6,51+slot(q)*1.5,52);
  if(q.pl===sel){syncView(true);cap('Bạn đã bước vào hang động tối tăm... đâu đó có tiếng cười vọng lại.')}})}
function leaveCave(q){warp(q,()=>{
  putOut(q,CVX*T+4+(slot(q)-2)*6,(CVY-2)*T+4);
  if(!ins.some(p=>p.pl&&p.fl===6))GH=null;
  if(q.pl===sel){syncView(true);cap('Bạn đã thoát khỏi hang động.')}})}
function killPlayer(n){
  const V=allPl().find(p=>p.pl===n);if(!V)return;
  BL.push([V.x,V.y]);flash=24;LS={t:0,fin:0};
  people=people.filter(p=>p.pl!==n);ins=ins.filter(p=>p.pl!==n);
  const L=allPl();
  if(!L.length){gameOver();return}
  cap('P'+n+' đã bị oan hồn giết.');
  if(sel===n)setSel(L[0].pl);else infoUI()}
function restore(s){
  BTOT=0;MTOT=0;trans=null;gm=s.gm;parts=[];people=[];ins=[];GH=null;SEATS.forEach(q=>q.o=null);BEDS.forEach(q=>q.o=null);
  s.people.forEach(o=>{const p={...o,tx:o.x,ty:o.y,path:[],goal:null,act:'idle',t:0,cd:0,ph:1,wait:ri(10,60),moving:0,vis:1,delay:0,say:''};if(!p.pl&&!p.n)p.n=newNeeds();if(p.cls==='g'&&p.acc===undefined)p.acc=1;(o.inn?ins:people).push(p)});
  CAMPN=people.concat(ins).reduce((a,p)=>p.cs!=null?Math.max(a,p.cs+1):a,0);
  homeOwner();dineSync();
  if(ins.some(p=>p.pl&&p.fl===6))newGhost();
  syncView(true)}
function snapP(){
  const K=['k','look','pl','c','skin','hair','x','y','sp','role','cls','own','clean','hb','ate','fl','loot','acc','cs'];
  return people.filter(p=>!p.owner).concat(ins.filter(p=>!p.owner)).map(p=>{const o={};K.forEach(k=>{if(p[k]!==undefined)o[k]=p[k]});if(p.n)o.n={...p.n};if(p.loot)o.loot={...p.loot};o.inn=ins.includes(p)?1:0;return o})}
function seatPl(n){
  const O=allPl().find(p=>p.pl===n);if(!O)return;
  const s=DSEAT[8+n];putIn(O,1,s.x,s.y);O.x=O.tx=s.x*T+4;O.y=O.ty=s.y*T+4;setSel(n)}
function forceAll(D){
  D.forced=1;const L=allPl().filter(p=>ACC[p.pl]).map(p=>p.pl);if(!L.length)return;
  if(TK)closeTalk();
  trans={t:0,cb:()=>{L.forEach(seatPl);setSel(L[0]);cap('Đã tới giờ ăn! Mọi người được mời ra bàn ăn lớn ở đại sảnh.')}}}
function showMeal(){MQ=allPl().filter(p=>ACC[p.pl]).map(p=>p.pl);const c=$('mC');if(c)c.textContent='15';renderMeal()}
function renderMeal(){
  const b=$('meal');if(!MQ||!MQ.length||!DN){b.hidden=true;return}
  b.hidden=false;$('mT').textContent='Đã đến giờ ăn ('+MNAME[DN.k%3]+'). Bạn có muốn tới bàn ăn lớn ở đại sảnh không?';
  const o=$('mO');o.innerHTML='';
  MQ.forEach(n=>{const P=allPl().find(p=>p.pl===n),r=document.createElement('div');r.className='mrow';
    r.innerHTML='<span class="sw" style="background:'+(P?P.c:'#fff')+'"></span><b>P'+n+'</b>';
    [['Có',1,'btn'],['Không',0,'btn alt']].forEach(([t,y,c])=>{const x=document.createElement('button');x.className=c;x.textContent=t;x.onclick=()=>mealAns(n,y);r.append(x)});
    o.append(r)})}