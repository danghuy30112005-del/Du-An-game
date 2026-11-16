const W=150,H=96,T=8,CW=500,CH=300,WW=W*T,WH=H*T,BR=48,CX0=65,CY0=34,SEA=0,SAND=1,GRASS=2,TREE=3,MTN=4,ROCK=5,FLOW=6,CAS=7,DOOR=8,COURT=9,CLF=10,PATH=11,PLAT=12,HUT=13,WELL=14,PIT=15;
const cv=document.getElementById('c'),cx=cv.getContext('2d');cv.width=CW;cv.height=CH;
const $=id=>document.getElementById(id),rnd=n=>Math.floor(Math.random()*n),ri=(a,b)=>a+rnd(b-a+1);
const PC=['#e0533d','#3b6fd6','#e0b030','#8e44ad','#16a085','#ff7ab6'];
const SHIRT=['#7f8c8d','#c0392b','#2980b9','#27ae60','#d4ac0d','#8e6bbf','#e67e22','#ecf0f1','#1abc9c'];
const SKIN=['#f1c27d','#e0ac69','#c68642','#8d5524','#ffdbac'],HAIR=['#2b1b0f','#4a2f17','#d9a441','#7a3b1d','#111'];
const KEY='deadisland:save3',mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let HX=0,HY=0,WX=0,WY=0,camX=0,camY=0,inside=false,im=[],ins=[],sel=1,trans=null,keys={},seed=0,gm=0,snap={},lastMin=-1,last=performance.now(),confirmKey='';
let m,hg,state='title',frame=0,bx=40,by=BR*T+3,tbx=0,iAlpha=0,shake=0,crashT=-1,people=[],nPl=1,shoreX=0,parts=[];
const hs=(x,y)=>{let h=(x*374761393+y*668265263)>>>0;h=((h^(h>>>13))*1274126177)>>>0;return(h^(h>>>16))>>>0};
const cap=t=>$('cap').textContent=t;
const walkT=(tx,ty)=>{const t=inside?(FL[wf].im[ty]||[])[tx]:m[ty]&&m[ty][tx];return inside?(t===0||t===2||t===6||t===30||t===32||t===33||t===36):(t===SAND||t===GRASS||t===FLOW||t===COURT||t===DOOR||t===PLAT||t===PATH)};
const walk=(x,y)=>walkT(Math.floor(x/T),Math.floor(y/T));

/* ===== Tạo đảo: bãi cát, đồng cỏ, rừng, núi ===== */
function gen(sd){
  seed=sd||(1+rnd(2e9));const rg=mul(seed),p=[0,1,2,3,4,5].map(()=>rg()*6);m=[];hg=[];
  for(let y=0;y<H;y++){m[y]=[];hg[y]=[];for(let x=0;x<W;x++){
    const dx=(x+.5-80)/52,dy=(y+.5-48)/36,a=Math.atan2(dy,dx),
      r=1+.12*Math.sin(3*a+p[0])+.08*Math.sin(5*a+p[1])+.06*Math.sin(2*a+p[2]),d=Math.hypot(dx,dy)/r;
    hg[y][x]=d;m[y][x]=d>1?SEA:d>.88?SAND:GRASS}}
  shoreX=m[BR].findIndex(t=>t!==SEA);tbx=shoreX*T+4-34;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dm=Math.hypot((x-46)/9,(y-66)/6);if(dm<1&&m[y][x]!==SEA){m[y][x]=MTN;hg[y][x]=dm*.4}}
  for(let y=0;y<H;y++)for(let x=90;x<W;x++)if(Math.hypot((x-122)/24,(y-48)/36)<1&&m[y][x]===SEA)m[y][x]=GRASS;
  const q=[rg()*9,rg()*9,rg()*9];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const h=hs(x,y)%100,f=Math.sin(x*.8+q[0])+Math.sin(y*.9+q[1])+Math.sin((x+y)*.45+q[2]);
    if(m[y][x]===GRASS&&(Math.hypot((x-122)/24,(y-48)/36)<1?h<90:(((x>=78&&hg[y][x]>.45)||(x>=58&&hg[y][x]>.62))?h<84:((f>1.1&&h<60)||h<1))))m[y][x]=TREE;
    else if(m[y][x]===SAND&&h<3)m[y][x]=ROCK}
  for(let y=1;y<H-1;y++)for(let x=90;x<W-1;x++)if(m[y][x]!==SEA&&m[y][x]!==SAND&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>m[y+b][x+a]===SEA))m[y][x]=SAND;
  for(let y=BR-2;y<=BR+2;y++)for(let x=shoreX;x<=shoreX+5;x++){if(m[y][x]===TREE)m[y][x]=GRASS;if(m[y][x]===ROCK)m[y][x]=SAND}
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
  clr(100,py(103)-8,108,py(103)-2);clr(118,py(121)-6,124,py(121)-2);
  for(let x=96;x<=136;x++)for(let y=py(x)-1;y<=py(x)+1;y++)if(m[y][x]!==SEA)m[y][x]=PATH;
  for(let x=72;x<=98;x++)for(let y=59;y<=61;y++)if(m[y][x]!==SEA)m[y][x]=PATH;
  for(let y=py(97);y<=61;y++)for(let x=96;x<=98;x++)if(m[y][x]!==SEA)m[y][x]=PATH;
  HX=102;HY=py(103)-6;for(let y=HY;y<HY+3;y++)for(let x=HX;x<HX+4;x++)m[y][x]=HUT;
  WX=120;WY=py(121)-4;for(let y=WY;y<WY+2;y++)for(let x=WX;x<WX+2;x++)m[y][x]=WELL;
  for(let y=40;y<=56;y++)for(let x=130;x<=148;x++)if(Math.hypot((x-140)/6.5,(y-48)/5)<1&&m[y][x]!==SEA)m[y][x]=PIT;
}
function pickWalk(cx0,cy0,rad){
  for(let i=0;i<40;i++){const x=cx0+ri(-rad,rad),y=cy0+ri(-rad,rad);if(walkT(x,y))return[x*T+rnd(T),y*T+rnd(T)]}
  return[cx0*T+4,cy0*T+4]}

/* ===== Nhân vật: người chơi + NPC (nam, nữ, trẻ em, người già) ===== */
function mkPeople(){
  const ks=['man','woman','child','elder'],all=[],n=nPl+ri(10,20);
  for(let i=0;i<n;i++){
    const pl=i<nPl,k=pl?['man','woman'][rnd(2)]:(i-nPl<4?ks[i-nPl]:ks[rnd(4)]);
    all.push({k,pl:pl?i+1:0,c:pl?PC[i]:SHIRT[rnd(SHIRT.length)],skin:SKIN[rnd(5)],hair:k==='elder'?'#cfd3d8':HAIR[rnd(5)],
      x:0,y:0,sp:(k==='child'?.4:.5)+Math.random()*.1,path:[],ph:0,wait:0,moving:0,vis:0})}
  all.sort(()=>Math.random()-.5).forEach((p,i)=>{
    p.delay=i*14;p.x=bx+ri(8,26);p.y=by+2;p.tx=shoreX*T+4;p.ty=by+ri(0,3);p.path=[pickWalk(shoreX+1,BR,5)]});
  people=all}
function upd(p){
  if(p.delay>0){p.delay--;return}
  p.vis=1;
  const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy);
  if(d>.7){
    const nx=p.x+dx/d*p.sp,ny=p.y+dy/d*p.sp;
    if(p.ph&&!walk(nx,ny)){p.tx=p.x;p.ty=p.y;p.wait=15;p.moving=0}else{p.x=nx;p.y=ny;p.moving=1}
  }else{
    p.moving=0;
    if(p.path.length){[p.tx,p.ty]=p.path.shift();p.ph=1}
    else if(!p.pl&&--p.wait<=0){if(p.roam){roam(p);return}const q=pickWalk(Math.floor(p.x/T),Math.floor(p.y/T),4);p.tx=q[0];p.ty=q[1];p.wait=ri(40,160)}
  }}

/* ===== Vẽ ===== */
function sea(x,y){
  const h=hs(x,y),px=x*T,py=y*T;
  cx.fillStyle=(x+y)%2?'#3b8fd0':'#3687c8';cx.fillRect(px,py,T,T);
  if((x*3+y*5+(frame>>5)+(h&3))%7===0){cx.fillStyle='#8fd0ef';cx.fillRect(px+1+((h>>3)&3),py+2+((h>>5)&3),3,1)}
  [[0,-1,0,0,T,1],[0,1,0,T-1,T,1],[-1,0,0,0,1,T],[1,0,T-1,0,1,T]].forEach(([a,b,rx,ry,w,hh])=>{
    const r=m[y+b];if(r&&r[x+a]!==undefined&&r[x+a]!==SEA){
      cx.globalAlpha=iAlpha*(.5+.3*Math.sin(frame*.07+x*.7+y*.5));cx.fillStyle='#fff';cx.fillRect(px+rx,py+ry,w,hh);cx.globalAlpha=1}})}
function land(x,y){
  const t=m[y][x];if(t===SEA)return;
  const h=hs(x,y),px=x*T,py=y*T,R=(c,a,b,w,hh)=>{cx.fillStyle=c;cx.fillRect(px+a,py+b,w,hh)};
  if(t===SAND||t===ROCK){R(h%3?'#ecd79d':'#e0c88a',0,0,T,T);if(h%4===0)R('#cdb06b',(h>>4)&7,(h>>7)&7,1,1);if(h%7===0)R('#fff4d6',(h>>5)&7,(h>>9)&7,1,1);return}
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
  if(t===PATH){R(h%2?'#b89b6a':'#a98c5c',0,0,T,T);if(h%3===0)R('#d9c39a',(h>>3)&7,(h>>6)&7,2,1);if(h%5===0)R('#7d6a45',(h>>4)&7,(h>>8)&7,1,1);return}
  R((t===PLAT||t===FLOW?['#6bb04e','#64a748','#6fb552']:['#5aa845','#55a141','#5fae4a'])[h%3],0,0,T,T);
  if(h%5===0)R('#3f8a35',(h>>3)&7,(h>>6)&6,1,2);if(h%9===0)R('#7cc462',(h>>4)&7,(h>>8)&7,1,1);
  if(t===FLOW)for(let i=0;i<3;i++)R(['#ff6b9a','#ffd23f','#ffffff','#b07cff'][(h>>(i*3))&3],(h>>(i*2+1))&7,(h>>(i+5))&7,1,1)}
function tree(x,y){
  const h=hs(x,y),px=x*T,py=y*T,c=h%2?['#1f5a26','#2f8f3a']:['#256f2c','#3fae4a'],R=(cc,a,b,w,hh)=>{cx.fillStyle=cc;cx.fillRect(px+a,py+b,w,hh)};
  R('rgba(0,0,0,.25)',1,7,6,1);R('#4a2f17',3,4,2,4);
  R(c[0],3,-4,2,2);R(c[1],2,-2,4,2);R(c[0],1,0,6,2);R(c[1],0,2,T,2);R('#8be07c',3,-4,1,1);R(c[0],0,4,T,1)}
function rock(x,y){const px=x*T,py=y*T,R=(c,a,b,w,hh)=>{cx.fillStyle=c;cx.fillRect(px+a,py+b,w,hh)};
  R('#8a8f98',2,4,4,3);R('#b9bec6',2,4,2,1);R('#5b606a',2,6,4,1)}
function person(p){
  const x=Math.round(p.x),y=Math.round(p.y),R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(x+a,y+b,w,h)},
    [H0,L,w]={man:[10,3,6],woman:[10,3,6],child:[7,2,4],elder:[9,3,6]}[p.k],hx=-(w>>1),sb=p.moving?(frame>>3)&1:0;
  cx.globalAlpha=1;
  R('rgba(0,0,0,.3)',-3,-1,6,2);if(p.pl&&p.pl===sel&&state==='island')R('#fff',-4,0,8,1);
  R('#2b2b33',-2,-L,2,L-sb);R('#2b2b33',0,-L,2,L-(1-sb));
  if(p.k==='woman'){R(p.c,hx+1,-7,w-2,1);R(p.c,hx,-6,w,5)}else R(p.c,hx,-H0+3,w,H0-3-L);
  R(p.skin,hx-1,-H0+4,1,2);R(p.skin,hx+w,-H0+4,1,2);
  R(p.skin,-2,-H0,4,3);R(p.hair,-2,-H0,4,1);
  if(p.k==='woman'){R(p.hair,-3,-H0,1,5);R(p.hair,2,-H0,1,5)}
  if(p.k==='elder')R('#6b4423',hx+w+1,-6,1,6);
  if(p.role==='Quản gia')R('#fff',-1,-H0+3,2,2);if(p.role==='Giúp việc')R('#fff',-1,-5,2,3);if(p.role==='Đầu bếp')R('#fff',-2,-H0-2,4,2);if(p.role==='Làm vườn'){R('#c9a64b',-3,-H0,6,1);R('#c9a64b',-2,-H0-1,4,1)}
  if(p.role){cx.font='6px monospace';cx.textAlign='center';cx.lineWidth=2;cx.strokeStyle='#000';cx.strokeText(p.role,x,y-H0-3);cx.fillStyle='#ffe9a8';cx.fillText(p.role,x,y-H0-3)}
  if(p.pl){const b=(frame>>4)&1;R(p.c,-2,-H0-6-b,5,1);R(p.c,-1,-H0-5-b,3,1);R(p.c,0,-H0-4-b,1,1);
    cx.font='bold 6px monospace';cx.textAlign='center';cx.lineWidth=2;cx.strokeStyle='#000';cx.strokeText('P'+p.pl,x,y-H0-8-b);cx.fillStyle='#fff';cx.fillText('P'+p.pl,x,y-H0-8-b)}}
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
  frame++;const now=performance.now(),dt=Math.min(.25,(now-last)/1000);last=now;
  if(trans){trans.t+=.04;if(!trans.done&&trans.t>=1){trans.cb();trans.done=1}if(trans.t>=2)trans=null}
  if(state==='title')bx=30+Math.sin(frame*.01)*10;
  else if(state==='sail'){
    iAlpha=Math.min(1,iAlpha+.02);bx+=.8;
    if(bx>=tbx){bx=tbx;state='crash';crashT=0;shake=30;puff(bx+34,by+6,30,['#fff','#cfeaf7','#8a5a2b'],.06,-.8,40);cap('RẦM! Con thuyền đâm vào bờ đảo!')}
  }else if(state==='crash'){
    if(++crashT===45){state='land';mkPeople();cap('Mọi người lần lượt bước xuống đảo...')}
  }else{
    (inside?ins:people).forEach(p=>{wf=p.fl||1;upd(p)});if(state==='island')ctrl();
    if(state==='land'&&people.every(p=>p.ph)){
      state='island';gm=0;snap.day=snap.week=snapshot();save();showHud();cap('Ngày 1 bắt đầu. Chào mừng đến Dead Island...')}
    if(state==='island'){
      if(!trans){doors();if(inside)roomCheck()}const d0=day();gm+=dt;
      if(day()!==d0){snap.day=snapshot();if((day()-1)%7===0)snap.week=snap.day;save();cap('Ngày '+day()+' bắt đầu.')}
      if(Math.floor(gm)!==lastMin){lastMin=Math.floor(gm);clockUI()}
      if(frame%300===0)save();
      if(frame%12===0)puff(bx+25,by-12,1,['#8a8f98','#b9bec6'],-.01,-.3,50)}}
  parts=parts.filter(q=>--q.l>0);parts.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=q.g});cam()}
function castle(){
  const R=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h)},X=CX0*T,Y=CY0*T,S='#7b8087',L='#9aa0a8',D='#555b63',K='#3b4350',G='#1d2230';
  const bricks=(x,y,w,h)=>{for(let j=2;j<h;j+=4){R(D,x,y+j,w,1);for(let i=((j>>2)&1)*3;i<w;i+=6)R(D,x+i,y+j-2,1,2)}};
  const merl=(x,y,w)=>{for(let i=0;i<w;i+=6){R(S,x+i,y-3,4,3);R(L,x+i,y-3,4,1)}};
  const win=(x,y)=>{R(G,x,y+2,3,6);R(G,x+1,y,1,2);R(L,x-1,y+2,1,6)};
  const spire=(mx,top,w,h)=>{for(let i=0;i<h;i++){const ww=Math.max(1,Math.round(w*(i+1)/h));R(K,mx-(ww>>1),top+i,ww,1)}R('#222a36',mx,top,1,h)};
  const drum=(x,y,w,h)=>{R(S,x,y,w,h);R(D,x,y,4,h);R('#8b9199',x+(w>>2),y,w>>1,h);R(D,x+w-5,y,5,h);bricks(x,y,w,h);R(D,x-2,y-2,w+4,3);merl(x-2,y-2,w+4)};
  R('rgba(0,0,0,.3)',X-16,Y+46,152,5);
  R(S,X,Y+16,128,32);bricks(X,Y+16,128,32);merl(X,Y+16,128);R(D,X,Y+44,128,4);
  for(let i=24;i<110;i+=18)win(X+i,Y+24);
  R(S,X+16,Y-12,14,30);R(D,X+27,Y-12,3,30);bricks(X+16,Y-12,14,30);merl(X+16,Y-12,14);win(X+21,Y-4);spire(X+23,Y-30,18,18);
  R(S,X+38,Y-30,52,46);R(L,X+38,Y-30,2,46);R(D,X+86,Y-30,4,46);bricks(X+38,Y-30,52,46);merl(X+38,Y-30,52);
  R(D,X+56,Y-30,1,46);R(D,X+71,Y-30,1,46);
  [[46,-18],[60,-24],[75,-18],[46,-2],[75,-2]].forEach(([i,j])=>win(X+i,Y+j));
  R(G,X+62,Y+4,4,8);R(G,X+63,Y+2,2,2);
  spire(X+41,Y-52,7,22);spire(X+87,Y-52,7,22);
  R(S,X+96,Y-50,16,66);R(D,X+108,Y-50,4,66);R(L,X+96,Y-50,2,66);bricks(X+96,Y-50,16,66);merl(X+96,Y-50,16);
  win(X+102,Y-40);win(X+102,Y-22);win(X+102,Y-4);spire(X+104,Y-74,20,24);R('#9aa0ac',X+104,Y-86,1,12);R('#da251d',X+105,Y-86,5,3);
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
function well(){
  const R=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h)},x=WX*T,y=WY*T;
  R('rgba(0,0,0,.25)',x-1,y+14,18,3);R('#8d8a80',x,y+7,16,9);R('#a8a498',x,y+6,16,2);R('#6f6c63',x,y+13,16,3);
  R('#7d7a70',x+3,y+10,2,2);R('#7d7a70',x+9,y+12,3,2);R('#14201f',x+3,y+6,10,2);
  R('#8a5a2e',x+1,y-5,2,12);R('#8a5a2e',x+13,y-5,2,12);R('#6b4423',x+7,y-3,2,8);
  for(let i=0;i<6;i++){const ww=10+i*3;R(i%2?'#9c6b3f':'#8a5a2e',x+8-(ww>>1),y-12+i,ww,1)}}
/* ===== Dinh thự 2 tầng: tầng 1 (sảnh, phòng chung, phòng người làm) / tầng 2 (phòng khách, phòng gia đình) ===== */
const IW=108,IH=56,IS=CW/320;let FL=[],wf=1,curF=1,curR=1,hudOn=true;
const iw=t=>t===0||t===2||t===30||t===32||t===33;
const ridAt=p=>{const r=FL[p.fl||1].rid[Math.floor(p.y/T)];return r?r[Math.floor(p.x/T)]|0:0};
const snapCam=()=>{const P=ins.find(p=>p.pl===sel);if(!P)return;camX=Math.max(0,Math.min(IW*T-CW/IS,P.x-CW/IS/2));camY=Math.max(0,Math.min(IH*T-CH/IS,P.y-CH/IS/2))};
function roomCheck(){
  const P=ins.find(p=>p.pl===sel);if(!P)return;const r=ridAt(P);
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
  for(let y=18;y<=yb;y++)for(let x=58;x<=61;x++)im[y][x]=2;
  for(let y=14;y<=17;y++){for(let x=57;x<=62;x++)im[y][x]=y===14?36:33;im[y][56]=im[y][63]=37}
  (f===1?[28,34,40,46,50]:[20,26]).forEach(y=>{im[y][49]=3;im[y][70]=3});
  (f===1?[28,33,40,46,50]:[18,28]).forEach(y=>{im[y][47]=7;im[y][72]=7});
  [50,53,66,69].forEach(x=>im[13][x]=31);
  for(let x=58;x<=61;x++)im[13][x]=1;im[13][58]=40;/* ảnh gia đình giữa cầu thang */
  [[49,15],[70,15],[49,yb-1],[70,yb-1]].forEach(([x,y])=>im[y][x]=27);
  if(f===1){
    for(let y=36;y<=38;y++){for(let x=58;x<=61;x++)im[y][x]=35;im[y][57]=im[y][62]=34}
    for(let x=58;x<=61;x++){im[35][x]=34;im[39][x]=34}
    im[54][59]=im[54][60]=6;
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
    r=rm(12,'Nhà bếp',['#cfd3d6','#bfc4c8'],74,14,82,20,1);fill(12,77,21,78,21,OAK);
    put(r,26,0,0,3,1);put(r,28,4,0,5,1);put(r,22,2,3,5,1);win(r);
    r=rm(13,'Nhà ăn',['#6e4a2b','#7a5232'],84,14,93,20,1);fill(13,88,21,89,21,BIR);
    put(r,22,2,2,6,2);put(r,24,0,0,3,1);put(r,24,7,0,3,1);win(r);
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
function genIn(){FL=[null,build(1),build(2)]}
function bfs(f,sx,sy,tx,ty){
  const M=FL[f].im,pr=new Int32Array(IW*IH).fill(-1),s0=sy*IW+sx,q=[s0];pr[s0]=s0;
  for(let i=0;i<q.length;i++){const c=q[i],x=c%IW,y=(c/IW)|0;if(x===tx&&y===ty)break;
    for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<0||Y<0||X>=IW||Y>=IH)continue;const k=Y*IW+X,t=M[Y][X];if(pr[k]>=0)continue;if(iw(t)||(X===tx&&Y===ty&&t===36)){pr[k]=c;q.push(k)}}}
  const e=ty*IW+tx;if(pr[e]<0)return null;const o=[];for(let c=e;c!==pr[c];c=pr[c])o.push([(c%IW)*T+4,((c/IW)|0)*T+4]);return o.reverse()}
function roam(p){
  const f=p.fl,F=FL[f],tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);
  if(F.im[ty][tx]===36){p.fl=3-f;p.x=p.tx=(57+rnd(6))*T+4;p.y=p.ty=19*T+4;p.path=[];p.wait=ri(30,90);return}
  let path=null;
  for(let k=0;k<4&&!path;k++){let g;
    if(p.fam&&Math.random()<.25)g=[57+rnd(6),14];
    else{const rs=F.RM.filter(Boolean),r=rs[rnd(rs.length)],c=[];for(let y=r.y0;y<=r.y1;y++)for(let x=r.x0;x<=r.x1;x++){const t=F.im[y][x];if(t===0||t===2)c.push([x,y])}if(!c.length)continue;g=c[rnd(c.length)]}
    path=bfs(f,tx,ty,g[0],g[1])}
  if(path){p.path=path;p.wait=ri(60,200)}else p.wait=40}
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
function drawIn(){
  const R=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h)},F=FL[curF],im=F.im,rid=F.rid,RM=F.RM;
  const x0=Math.max(0,Math.floor(camX/T)),y0=Math.max(0,Math.floor(camY/T)),x1=Math.min(IW-1,x0+41),y1=Math.min(IH-1,y0+27),f=RM[curR].f,tall=[],pics=[];
  const near=(x,y)=>{for(let j=-1;j<=1;j++){const r=rid[y+j];if(r)for(let i=-1;i<=1;i++)if(r[x+i]===curR)return 1}return 0};
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const t=im[y][x],px=x*T,py=y*T,h=hs(x,y);
    if(rid[y][x]===curR){
      R((x+y)%2?f[0]:f[1],px,py,T,T);
      if(t===2){R('#a3202a',px,py,T,T);if(x===58||x===61)R('#d4a63a',px,py,1,T)}
      else if(t===3)tall.push([px,py]);
      else if(t===30||t===32)drDoor(t,px,py,x);
      else if(t===33||t===36){R('#9c7a52',px,py,T,T);R('#7d5f3e',px,py+T-2,T,2);R('#b8946a',px,py,T,1);if(x>=58&&x<=61)R('#a3202a',px+1,py,6,T-2);
        if(t===36){R('#fff2a8',px+(curF===1?3:2),py+2,curF===1?2:4,1);R('#fff2a8',px+(curF===1?2:3),py+3,curF===1?4:2,1)}}
      else if(t===37){R('#4a2f17',px+3,py-2,2,T+2);R('#6b4423',px+2,py-3,4,2)}
      else if(t===34){R('#7a4f2a',px+1,py+1,6,6);R('#c0392b',px+2,py+2,4,4)}
      else if(t===35){R('#6b4423',px,py+T-1,T,1);R('#e8dcc0',px,py+1,T,T-2);R('#c89a62',px,py+1,T,1);if(h%4===0){R('#fff',px+2,py+3,2,2);R('#c0392b',px+4,py+2,1,2)}}
      else if(t===20){R('#6b4423',px,py,T,T);R('#f3efe2',px+1,py+1,6,4)}
      else if(t===21){R('#6b4423',px,py,T,T);R('#3b6fd6',px,py,T,T-1);R('#5f8df0',px,py,T,1)}
      else if(t===22){R('#6b4423',px,py+T-1,T,1);R('#a9794a',px,py+1,T,T-2);R('#c89a62',px,py+1,T,2)}
      else if(t===23){R('#5a3a1e',px,py-2,T,T+2);for(let i=0;i<3;i++)R(['#c0392b','#2980b9','#d4ac0d','#27ae60'][(h>>(i*2))&3],px+1+i*2,py-1,1,5)}
      else if(t===24){R('#7a4f2a',px,py-1,T,T+1);R('#4a2f17',px+3,py-1,1,T+1);R('#ffd23f',px+2,py+3,1,1);R('#ffd23f',px+5,py+3,1,1)}
      else if(t===26){R('#3a3a40',px,py-2,T,T+2);R((frame>>3)%2?'#ff8a3d':'#ffd23f',px+2,py+2,4,3)}
      else if(t===27){R('#6b4423',px,py+3,T,T-3);R('#3f8a35',px+1,py,6,4);R(['#ff6b9a','#ffd23f','#ffffff'][h%3],px+2+(h&3),py+1,2,2)}
      else if(t===28){R('#5a3a1e',px,py,T,T);R('#7a4f2a',px,py,T,3);R('#f3efe2',px+2,py+1,3,2)}
      else if(t===29){R('#c89a62',px,py+1,T,T-2);R('#fff',px+3,py+2,2,2)}
    }else if(near(x,y)){
      if(t===6){R('#6b4423',px,py,T,T);R('#ffd23f',px+5,py+3,1,1)}
      else if(t===30||t===32)drDoor(t,px,py,x);
      else if(t===1||t===7||t===25||t===31||(t>=40&&t<=43)){
        R('#8d8576',px,py,T,T);R('#6f6859',px,py+6,T,2);
        if(t===25){R('#d8d0bc',px+1,py+1,6,5);R('#8ec6ee',px+2,py+2,4,3);R('#fff',px+2,py+2,1,1);R('#d8d0bc',px+4,py+2,1,3)}
        if(t===31){R('#8e1f2a',px+1,py,6,7);R('#d4a63a',px+3,py+1,2,4)}
        if(t>=40&&t<=43)pics.push([px,py,t,(rid[y-1]||[])[x]===curR]);
        if(t===7){R('#3a3a40',px+2,py+1,4,5);R((frame>>3)%2?'#ff8a3d':'#ffd23f',px+3,py+2,2,3)}}}}
  tall.forEach(([px,py])=>{R('#d8d0bc',px+1,py-6,6,T+6);R('#a9a18c',px+5,py-6,2,T+6)});
  pics.forEach(a=>drPic(...a));
  if(curR===1)(curF===1?[24,34,46]:[20,27]).forEach(y=>{const X=476,Y=y*T;cx.globalAlpha=.1;R('#ffcc66',X-34,Y-14,68,40);R('#ffcc66',X-20,Y-22,40,56);cx.globalAlpha=1;R('#ffd23f',X-5,Y,10,1);R('#fff2a8',X-1,Y+1,2,2)});
  cx.globalAlpha=1;
  ins.filter(p=>p.fl===curF&&ridAt(p)===curR).sort((a,b)=>a.y-b.y).forEach(person)}
function draw(){
  cx.save();
  if(inside){cx.fillStyle='#000';cx.fillRect(0,0,CW,CH);cx.scale(IS,IS);cx.translate(-Math.round(camX),-Math.round(camY));drawIn()}
  else{
    if(shake>0){shake--;cx.translate(rnd(5)-2,rnd(3)-1)}
    cx.translate(-Math.round(camX),-Math.round(camY));
    const x0=Math.max(0,Math.floor(camX/T)),x1=Math.min(W-1,x0+Math.ceil(CW/T)+1),y0=Math.max(0,Math.floor(camY/T)),y1=Math.min(H-1,y0+Math.ceil(CH/T)+1);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)sea(x,y);
    cx.globalAlpha=iAlpha;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)land(x,y);cx.globalAlpha=1;
    boat();if(iAlpha>0){cx.globalAlpha=iAlpha;castle();cx.globalAlpha=1}
    for(let y=y0;y<=Math.min(H-1,y1+1);y++){
      cx.globalAlpha=iAlpha;
      for(let x=x0;x<=x1;x++){const t=m[y][x];if(t===TREE)tree(x,y);else if(t===ROCK)rock(x,y)}
      cx.globalAlpha=iAlpha;if(y===HY+2)hut();if(y===WY+1)well();cx.globalAlpha=1;
      people.filter(p=>p.vis&&Math.floor(p.y/T)===y).sort((a,b)=>a.y-b.y).forEach(person)}
    parts.forEach(q=>{cx.globalAlpha=Math.min(1,q.l/20);cx.fillStyle=q.c;cx.fillRect(Math.round(q.x),Math.round(q.y),q.s,q.s)})}
  cx.globalAlpha=1;cx.restore();
  if(state==='title'){cx.fillStyle='rgba(30,10,50,.3)';cx.fillRect(0,0,CW,CH)}
  else{const c=tint();cx.fillStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+(c[3]*(inside?.35:1)).toFixed(3)+')';cx.fillRect(0,0,CW,CH)}
  if(trans){cx.fillStyle='rgba(0,0,0,'+Math.max(0,Math.min(1,trans.t<1?trans.t:2-trans.t))+')';cx.fillRect(0,0,CW,CH)}}
/* ===== Điều khiển, camera, ra vào lâu đài ===== */
function setSel(n){sel=n;const e=$('sl');if(e)e.innerHTML='Đang điều khiển: <b>P'+n+'</b>'}
function cam(){
  if(inside){const P=ins.find(p=>p.pl===sel)||{x:0,y:0};camX+=(Math.max(0,Math.min(IW*T-CW/IS,P.x-CW/IS/2))-camX)*.15;camY+=(Math.max(0,Math.min(IH*T-CH/IS,P.y-CH/IS/2))-camY)*.15;return}
  let fx=CW/2,fy=by;
  if(state==='sail'||state==='crash'){fx=bx+17}
  else if(state==='land'||state==='island'){const P=people.find(p=>p.pl===sel&&p.vis);if(P){fx=P.x;fy=P.y}else fx=bx+17}
  camX+=(Math.max(0,Math.min(WW-CW,fx-CW/2))-camX)*.08;camY+=(Math.max(0,Math.min(WH-CH,fy-CH/2))-camY)*.08}
function ctrl(){
  const P=(inside?ins:people).find(p=>p.pl===sel);if(!P||trans)return;wf=P.fl||1;
  const dx=(keys.arrowright||keys.d?1:0)-(keys.arrowleft||keys.a?1:0),dy=(keys.arrowdown||keys.s?1:0)-(keys.arrowup||keys.w?1:0);
  if(dx||dy){const l=Math.hypot(dx,dy),nx=P.x+dx/l,ny=P.y+dy/l;P.path=[];if(walk(nx,P.y))P.x=nx;if(walk(P.x,ny))P.y=ny;P.tx=P.x;P.ty=P.y;P.moving=1}}
function doors(){
  const at=(p,t)=>{const r=FL[p.fl]&&FL[p.fl].im[Math.floor(p.y/T)];return r&&r[Math.floor(p.x/T)]===t};
  if(!inside&&people.some(p=>p.pl&&(m[Math.floor(p.y/T)]||[])[Math.floor(p.x/T)]===DOOR))enter();
  else if(inside){
    if(ins.some(p=>p.pl&&at(p,6)))leave();
    else{const q=ins.find(p=>p.pl&&at(p,36));if(q)stairs(q)}}}
function stairs(q){trans={t:0,cb:()=>{
  q.fl=3-q.fl;q.x=q.tx=(57+rnd(6))*T+4;q.y=q.ty=19*T+4;q.path=[];
  if(q.pl===sel){curF=q.fl;curR=1;snapCam();cap(curF===2?'Bạn lên tầng 2.':'Bạn xuống tầng 1.')}}}}
function fixPos(p){const M=FL[p.fl].im,tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);
  for(let r=0;r<14;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const t=(M[ty+j]||[])[tx+i];if(t===0||t===2){p.x=p.tx=(tx+i)*T+4;p.y=p.ty=(ty+j)*T+4;return p}}return p}
function npcI(role,k,c,tx,ty,fl,fam){return fixPos({k,pl:0,role,c,skin:SKIN[rnd(5)],hair:role==='Quản gia'||role==='Chủ nhân'?'#cfd3d6':HAIR[rnd(5)],x:tx*T+4,y:ty*T+4,tx:tx*T+4,ty:ty*T+4,sp:.4,path:[],ph:1,wait:ri(20,90),moving:0,vis:1,delay:0,roam:1,fl,fam})}
function enter(){trans={t:0,cb:()=>{
  genIn();inside=true;curF=1;curR=1;
  ins=people.filter(p=>p.pl).map((p,i)=>({...p,fl:1,x:(55.5+i*1.5)*T,y:52*T,tx:(55.5+i*1.5)*T,ty:52*T,path:[],ph:1,moving:0,vis:1,delay:0}))
    .concat([npcI('Quản gia','man','#151515',59,26,1),npcI('Giúp việc','woman','#222',30,23,1),npcI('Giúp việc','woman','#222',90,23,1),npcI('Giúp việc','woman','#222',60,45,1),
      npcI('Đầu bếp','man','#f4f4f4',75,18,1),npcI('Làm vườn','man','#556b2f',86,29,1),npcI('Làm vườn','man','#6b7b3a',65,50,1),
      npcI('Chủ nhân','man','#5b2a86',52,22,2,1),npcI('Phu nhân','woman','#8e1f2a',66,22,2,1),npcI('Cậu chủ','man','#2980b9',54,27,2,1),npcI('Tiểu thư','woman','#ff7ab6',68,27,2,1)]);
  setSel(sel);snapCam();
  cap('Sảnh chính. Cầu thang lên tầng 2 ở cuối sảnh; hành lang phải: bếp, nhà ăn, thư viện, phòng trà, nhà kính; hành lang trái: phòng người làm.')}}}
function leave(){trans={t:0,cb:()=>{
  inside=false;ins=[];
  people.filter(p=>p.pl).forEach((p,i)=>{p.x=72*T+4+(i-2)*6;p.y=41*T+4;p.tx=p.x;p.ty=p.y;p.path=[]});
  cap('Bạn đã bước ra sân lâu đài.')}}}
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
  if(c)c.innerHTML=ph[0]+' Ngày <b>'+day()+'</b> · '+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+' · '+ph[1]}
function showHud() {
  $('hud').hidden = !hudOn;
  $('tools').hidden = false;
  lastMin = -1;

  $('hud').innerHTML =
    '<div id="clk"></div>' +
    '<div id="sl"></div>' +

    'Người chơi: <b>' + nPl + '</b> · NPC: <b>' +
    (people.length - nPl) + '</b>' +

    people
      .filter(p => p.pl)
      .map(p => '<span class="sw" style="background:' + p.c + '"></span>P' + p.pl)
      .join('') +

    '<div class="tip">' +
      'WASD / Mũi tên: Di chuyển<br>' +
      '1-' + nPl + ' hoặc Tab: Đổi nhân vật<br>' +
      'Bấm lên bản đồ để di chuyển<br>' +
      'Bước vào cổng lâu đài để vào trong<br>' +
      'H: Ẩn / hiện HUD' +
    '</div>';

  setSel(sel > nPl ? 1 : sel);
  clockUI();
}

/* ===== Lưu tiến trình & reset ===== */
function snapP() {
  return people.map(p => ({ k: p.k, pl: p.pl, c: p.c, skin: p.skin, hair: p.hair, x: p.x, y: p.y, sp: p.sp }));
}
const snapshot=()=>({gm,people:snapP()});
function restore(s){inside=false;ins=[];trans=null;gm=s.gm;parts=[];people=s.people.map(o=>({...o,tx:o.x,ty:o.y,path:[],ph:1,wait:ri(10,60),moving:0,vis:1,delay:0}))}
function save(){if(state!=='island')return;try{localStorage.setItem(KEY,JSON.stringify({v:1,seed,nPl,gm,people:snapP(),snap}))}catch(_){}}
function load(){try{return JSON.parse(localStorage.getItem(KEY))}catch(_){return null}}
function cont(){
  const s=load();if(!s)return;
  nPl=s.nPl;gen(s.seed);snap=s.snap;restore(s);
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
  gen();state='title';people=[];parts=[];iAlpha=0;crashT=-1;shake=0;gm=0;snap={};
  inside=false;ins=[];trans=null;['tools','hud','ask','rs','lv'].forEach(i=>$(i).hidden=true);$('menu').hidden=false;$('title').hidden=false;
  const sv=load();$('cont').hidden=!sv;if(sv)$('cont').textContent='Tiếp tục (Ngày '+(Math.floor(sv.gm/1440)+1)+')';
  cap('Một con thuyền trôi dạt giữa biển khơi...')}
function submit(){
  const v=Number($('np').value);
  if(!Number.isInteger(v)||v<1||v>6){$('err').textContent='Chỉ nhập số từ 1 đến 6.';$('np').select();return}
  nPl=v;sel=1;$('err').textContent='';$('ask').hidden=true;$('title').hidden=true;
  state='sail';cap('Thuyền lao thẳng về phía một hòn đảo hoang...')}
$('start').onclick=()=>{$('menu').hidden=true;$('lv').hidden=false};
$('lv1').onclick=()=>{$('lv').hidden=true;$('ask').hidden=false;$('np').value=1;$('err').textContent='';$('np').focus();$('np').select()};
$('lvX').onclick=()=>{$('lv').hidden=true;$('menu').hidden=false};
$('np').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();submit()}};
$('ok').onclick=submit;$('again').onclick=()=>{save();reset()};$('cont').onclick=cont;
$('rsBtn').onclick=()=>{confirmKey='';rsLabels();$('rs').hidden=!$('rs').hidden};
document.querySelectorAll('#rs [data-r]').forEach(b=>b.onclick=()=>doReset(b.dataset.r));
$('rsX').onclick=()=>{confirmKey='';$('rs').hidden=true};
addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;
  const k=e.key.toLowerCase();if(k==='h'&&state==='island'){togHud();return}
  if(state==='island'){
    if(/^[1-6]$/.test(k)&&+k<=nPl){setSel(+k);return}
    if(k==='tab'){e.preventDefault();setSel(sel%nPl+1);return}
    if(k.startsWith('arrow'))e.preventDefault()}
  keys[k]=1});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=0});
addEventListener('blur',()=>{keys={}});
cv.addEventListener('pointerdown',e=>{
  if(state!=='island'||trans)return;
  const r=cv.getBoundingClientRect(),wx=(e.clientX-r.left)/r.width*CW/(inside?IS:1)+camX,wy=(e.clientY-r.top)/r.height*CH/(inside?IS:1)+camY,
    L=(inside?ins:people).filter(p=>p.pl&&(!inside||p.fl===curF)),c=L.find(p=>Math.abs(p.x-wx)<6&&Math.abs(p.y-5-wy)<8);
  if(c){setSel(c.pl);return}
  const P=L.find(p=>p.pl===sel);if(P){P.tx=wx;P.ty=wy;P.path=[]}});
const togHud=()=>{hudOn=!hudOn;$('hud').hidden=!hudOn};$('hudBtn').onclick=togHud;
reset();requestAnimationFrame(loop);a