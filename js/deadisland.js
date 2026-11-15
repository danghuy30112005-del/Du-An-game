const W=40,H=25,T=8,CW=W*T,CH=H*T,SEA=0,SAND=1,GRASS=2,TREE=3,MTN=4,ROCK=5;
const cv=document.getElementById('c'),cx=cv.getContext('2d');cv.width=CW;cv.height=CH;
const $=id=>document.getElementById(id),rnd=n=>Math.floor(Math.random()*n),ri=(a,b)=>a+rnd(b-a+1);
const PC=['#e0533d','#3b6fd6','#e0b030','#8e44ad','#16a085','#ff7ab6'];
const SHIRT=['#7f8c8d','#c0392b','#2980b9','#27ae60','#d4ac0d','#8e6bbf','#e67e22','#ecf0f1','#1abc9c'];
const SKIN=['#f1c27d','#e0ac69','#c68642','#8d5524','#ffdbac'],HAIR=['#2b1b0f','#4a2f17','#d9a441','#7a3b1d','#111'];
let m,hg,state='title',frame=0,bx=40,by=99,tbx=0,iAlpha=0,shake=0,crashT=-1,people=[],nPl=1,shoreX=0,parts=[];
const hs=(x,y)=>{let h=(x*374761393+y*668265263)>>>0;h=((h^(h>>>13))*1274126177)>>>0;return(h^(h>>>16))>>>0};
const cap=t=>$('cap').textContent=t;
const walkT=(tx,ty)=>!!(m[ty]&&(m[ty][tx]===SAND||m[ty][tx]===GRASS));
const walk=(x,y)=>walkT(Math.floor(x/T),Math.floor(y/T));

/* ===== Tạo đảo: bãi cát, đồng cỏ, rừng, núi ===== */
function gen(){
  const p=[0,1,2,3,4,5].map(()=>Math.random()*6);m=[];hg=[];
  for(let y=0;y<H;y++){m[y]=[];hg[y]=[];for(let x=0;x<W;x++){
    const dx=(x+.5-27.5)/9.5,dy=(y+.5-12.5)/9.5,a=Math.atan2(dy,dx),
      r=1+.12*Math.sin(3*a+p[0])+.08*Math.sin(5*a+p[1])+.06*Math.sin(2*a+p[2]),d=Math.hypot(dx,dy)/r;
    hg[y][x]=d;m[y][x]=d>1?SEA:d>.86?SAND:d<.34?MTN:GRASS}}
  shoreX=m[12].findIndex(t=>t!==SEA);tbx=shoreX*T+4-34;
  const q=[Math.random()*9,Math.random()*9,Math.random()*9];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const h=hs(x,y)%100,f=Math.sin(x*.8+q[0])+Math.sin(y*.9+q[1])+Math.sin((x+y)*.45+q[2]);
    if(m[y][x]===GRASS&&((f>.5&&h<72)||h<6))m[y][x]=TREE;
    else if(m[y][x]===SAND&&h<3)m[y][x]=ROCK}
  for(let y=10;y<=14;y++)for(let x=shoreX;x<=shoreX+5;x++){if(m[y][x]===TREE)m[y][x]=GRASS;if(m[y][x]===ROCK)m[y][x]=SAND}
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
    p.delay=i*14;p.x=bx+ri(8,26);p.y=by+2;p.tx=shoreX*T+4;p.ty=by+ri(0,3);p.path=[pickWalk(shoreX+1,12,5)]});
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
    else if(--p.wait<=0){const q=pickWalk(Math.floor(p.x/T),Math.floor(p.y/T),4);p.tx=q[0];p.ty=q[1];p.wait=ri(40,160)}
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
    if(x>=27)R('rgba(0,0,0,.18)',4,0,4,T);
    if(h%3===0)R(d<.16?'#c9d3de':'#646a73',(h>>3)&7,(h>>6)&6,2,1);
    R('rgba(255,255,255,.25)',0,0,T,1);
    if(!(m[y+1]&&m[y+1][x]===MTN))R('#4b5059',0,6,T,2);return}
  R(['#5aa845','#55a141','#5fae4a'][h%3],0,0,T,T);
  if(h%5===0)R('#3f8a35',(h>>3)&7,(h>>6)&6,1,2);if(h%9===0)R('#7cc462',(h>>4)&7,(h>>8)&7,1,1)}
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
  R('rgba(0,0,0,.3)',-3,-1,6,2);
  R('#2b2b33',-2,-L,2,L-sb);R('#2b2b33',0,-L,2,L-(1-sb));
  if(p.k==='woman'){R(p.c,hx+1,-7,w-2,1);R(p.c,hx,-6,w,5)}else R(p.c,hx,-H0+3,w,H0-3-L);
  R(p.skin,hx-1,-H0+4,1,2);R(p.skin,hx+w,-H0+4,1,2);
  R(p.skin,-2,-H0,4,3);R(p.hair,-2,-H0,4,1);
  if(p.k==='woman'){R(p.hair,-3,-H0,1,5);R(p.hair,2,-H0,1,5)}
  if(p.k==='elder')R('#6b4423',hx+w+1,-6,1,6);
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
  frame++;
  if(state==='title')bx=40+Math.sin(frame*.01)*18;
  else if(state==='sail'){
    iAlpha=Math.min(1,iAlpha+.02);bx+=.8;
    if(bx>=tbx){bx=tbx;state='crash';crashT=0;shake=30;puff(bx+34,by+6,30,['#fff','#cfeaf7','#8a5a2b'],.06,-.8,40);cap('RẦM! Con thuyền đâm vào bờ đảo!')}
  }else if(state==='crash'){
    if(++crashT===45){state='land';mkPeople();cap('Mọi người lần lượt bước xuống đảo...')}
  }else{
    people.forEach(upd);
    if(state==='land'&&people.every(p=>p.ph)){
      state='island';cap('Chào mừng đến Dead Island. Hãy cẩn thận...');
      $('hud').hidden=false;$('again').hidden=false;
      $('hud').innerHTML='Người chơi: <b>'+nPl+'</b> · NPC: <b>'+(people.length-nPl)+'</b>'+people.filter(p=>p.pl).map(p=>'<span class="sw" style="background:'+p.c+'"></span>P'+p.pl).join('')}
    if(state==='island'&&frame%12===0)puff(bx+25,by-12,1,['#8a8f98','#b9bec6'],-.01,-.3,50)}
  parts=parts.filter(q=>--q.l>0);parts.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy+=q.g})}
function draw(){
  cx.save();if(shake>0){shake--;cx.translate(rnd(5)-2,rnd(3)-1)}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)sea(x,y);
  cx.globalAlpha=iAlpha;for(let y=0;y<H;y++)for(let x=0;x<W;x++)land(x,y);cx.globalAlpha=1;
  boat();
  for(let y=0;y<H;y++){
    cx.globalAlpha=iAlpha;
    for(let x=0;x<W;x++){const t=m[y][x];if(t===TREE)tree(x,y);else if(t===ROCK)rock(x,y)}
    cx.globalAlpha=1;
    people.filter(p=>p.vis&&Math.floor(p.y/T)===y).sort((a,b)=>a.y-b.y).forEach(person)}
  parts.forEach(q=>{cx.globalAlpha=Math.min(1,q.l/20);cx.fillStyle=q.c;cx.fillRect(Math.round(q.x),Math.round(q.y),q.s,q.s)});
  cx.globalAlpha=1;cx.restore();
  if(state==='title'){cx.fillStyle='rgba(30,10,50,.3)';cx.fillRect(0,0,CW,CH)}}
function loop(){step();draw();requestAnimationFrame(loop)}

/* ===== Giao diện ===== */
function reset(){
  gen();state='title';people=[];parts=[];iAlpha=0;crashT=-1;shake=0;
  ['again','hud','ask'].forEach(i=>$(i).hidden=true);$('start').hidden=false;$('title').hidden=false;
  cap('Một con thuyền trôi dạt giữa biển khơi...')}
function submit(){
  const v=Number($('np').value);
  if(!Number.isInteger(v)||v<1||v>6){$('err').textContent='Chỉ nhập số từ 1 đến 6.';$('np').select();return}
  nPl=v;$('err').textContent='';$('ask').hidden=true;$('title').hidden=true;
  state='sail';cap('Thuyền lao thẳng về phía một hòn đảo hoang...')}
$('start').onclick=()=>{$('start').hidden=true;$('ask').hidden=false;$('np').value=1;$('err').textContent='';$('np').focus();$('np').select()};
$('np').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();submit()}};
$('ok').onclick=submit;$('again').onclick=reset;
reset();requestAnimationFrame(loop);