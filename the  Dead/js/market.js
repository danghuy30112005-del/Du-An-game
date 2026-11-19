/* ===== market.js: KHU CHỢ LÀNG + NOCE (gã nghiện rượu) + NHÀ RƠM của Noce =====
   Nạp SAU village.js và TRƯỚC playerkit.js. Không cần sửa deadisland.js / village.js.
   - Khu chợ (sân lát đá) nằm ở phía nam đường làng, có 7 quầy: rau, rượu, thịt, trái cây, gốm, vải, cá.
   - Người bán đứng sau quầy (7h-18h). Dân làng ban ngày thỉnh thoảng ra chợ mua đồ.
   - Noce: dân làng nghiện rượu, ra quầy rượu mua rượu, mang về nhà rơm uống, gần như luôn say, hay gục xuống sàn.
   - Nhà rơm của Noce nằm phía đông chợ, người chơi có thể bước vào cửa để xem bên trong. */
(()=>{
if(typeof LOOKS==='undefined'||!LOOKS.vchief||W<340||H<180){console.warn('market.js: hãy nạp SAU village.js (và deadisland.js phải có W=340,H=180)');return}

const MX=186,MY=30;                 /* gốc bố cục làng (giống village.js) */
const pk=a=>a[rnd(a.length)];
let STALLS=[],SELL=[],HN=null;
const MK={deals:0};
if(!LN.v)LN.v=['Chào bạn!'];

/* ---------- Loại quầy ---------- */
const KIND={
  veg:{c:['#4caf50','#e67e22','#c0392b','#8bc34a'],a:['#2e7d32','#f4f4f4'],item:'rau củ',name:'RAU CỦ'},
  wine:{c:['#2f8f3a','#8a4a22','#2f8f3a','#c9a64b'],a:['#7b1e3a','#f0e0c0'],item:'rượu',name:'RƯỢU'},
  meat:{c:['#c0392b','#e8a0a0','#a93226','#f1948a'],a:['#a83428','#f4f4f4'],item:'thịt',name:'THỊT'},
  fruit:{c:['#e0302a','#ffd23f','#ffa6c0','#8bc34a'],a:['#e08a1f','#f4f4f4'],item:'trái cây',name:'HOA QUẢ'},
  pot:{c:['#b5651d','#c97a3a','#8a4a1c','#d89060'],a:['#5b7fa8','#f4f4f4'],item:'đồ gốm',name:'GỐM'},
  cloth:{c:['#3b6fd6','#e0533d','#8e44ad','#16a085'],a:['#8e44ad','#f4f4f4'],item:'vải',name:'VẢI'},
  fish:{c:['#9fb6c8','#7fa0b8','#c8d6e0','#e08a6a'],a:['#2d7da8','#f4f4f4'],item:'cá',name:'CÁ'}};
const CALLS={
  wine:['Rượu nếp, rượu gạo đây!','Rượu ngon đây!'],veg:['Rau tươi mới hái!','Củ quả giá rẻ!'],
  meat:['Thịt tươi đây!','Thịt rừng mới săn!'],fruit:['Táo, đào ngọt lắm!','Trái cây tươi đây!'],
  pot:['Nồi, chum, vại đây!','Đồ gốm bền đẹp!'],cloth:['Vải lụa đẹp đây!','Vải thô giá rẻ!'],fish:['Cá tươi vừa đánh!','Cá, tôm tươi sống!']};
const DL=['Hức... rượu đâu rồi?','Tôi... chưa say đâu mà!','Hức! Thêm chai nữa...','Nhà tôi... đằng nào nhỉ?','Đất cứ xoay xoay...','Ai... ai lấy chai của tôi?','Uống đi... uống đi...','Hức... hức...'];
/* [loại, phía (N = quầy hướng nam, S = quầy hướng bắc), x cục bộ, tên người bán] */
const DEF=[['veg','N',56,'Bán rau'],['wine','N',62,'Bán rượu'],['meat','N',68,'Bán thịt'],['fruit','N',74,'Bán trái cây'],
  ['pot','S',56,'Bán đồ gốm'],['cloth','S',62,'Bán vải'],['fish','S',68,'Bán cá']];
const WI=1;                          /* chỉ số quầy rượu */
const open=()=>{const h=hour();return h>=7&&h<18};

/* ---------- Nội thất nhà rơm (FL[19]) ---------- */
function mkHome(){
  const im=Array.from({length:IH},()=>Array(IW).fill(1)),rid=Array.from({length:IH},()=>Array(IW).fill(0)),RM=[];
  const S=(t,x,y,w=1,h=1)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)im[y+j][x+i]=t};
  RM[1]={n:'Nhà rơm của Noce',f:['#b59a52','#a88e48'],x0:30,y0:20,x1:40,y1:27,s:1};
  for(let y=20;y<=27;y++)for(let x=30;x<=40;x++){im[y][x]=0;rid[y][x]=1}
  im[28][35]=32;rid[28][35]=1;                        /* cửa ra */
  S(20,30,20,2);S(21,30,21,2,2);S(24,32,20);           /* giường + tủ đầu giường */
  S(26,34,20);S(28,36,20,5);                           /* bếp lửa + thùng rượu */
  S(22,36,22,2);S(44,36,23,2);                         /* bàn + ghế */
  S(2,32,24,5,3);                                      /* tấm thảm rơm */
  im[19][33]=25;im[19][38]=25;im[28][31]=25;im[28][39]=25;
  S(27,30,26);S(24,40,26);
  return{im,rid,RM}}

/* ---------- Tạo khu chợ + nhà rơm lên bản đồ ---------- */
function buildMarket(){
  STALLS=[];SELL=[];HN=null;
  const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H,set=(x,y,t)=>{if(inb(x,y)&&m[y][x]!==SEA)m[y][x]=t};
  if(!inb(MX+95,MY+36)||m[MY+29][MX+67]===SEA||m[MY+28][MX+90]===SEA)return;
  for(let y=MY+24;y<=MY+35;y++)for(let x=MX+54;x<=MX+80;x++)set(x,y,COURT);       /* sân chợ */
  for(let y=MY+17;y<=MY+23;y++)for(let x=MX+79;x<=MX+80;x++)set(x,y,PATH);         /* đường từ đường làng xuống chợ */
  for(let y=MY+29;y<=MY+30;y++)for(let x=MX+81;x<=MX+85;x++)set(x,y,PATH);         /* đường từ chợ sang đường mòn phía nam */
  STALLS=DEF.map(([k,side,dx,n])=>({k,side,n,x:MX+dx,y:side==='N'?MY+25:MY+33}));
  STALLS.forEach(s=>{for(let y=s.y;y<=s.y+1;y++)for(let x=s.x;x<=s.x+3;x++)set(x,y,HSE)});
  HN={x:MX+88,y:MY+27,w:6,h:4,dx:MX+91,dy:MY+31,ex:35,ey:27,ix:35,iy:28,bx:31,by:21,chx:36,chy:23,px:34,py:25};
  for(let y=HN.y;y<HN.y+HN.h;y++)for(let x=HN.x;x<HN.x+HN.w;x++)set(x,y,HSE);
  set(HN.dx,HN.dy,PATH);set(HN.dx,HN.dy+1,PATH);
  for(let x=MX+86;x<=MX+91;x++)set(x,MY+32,PATH);
  FL[19]=mkHome()}

/* ---------- Tạo NPC ---------- */
function mkN(o){
  const p=Object.assign({k:'man',pl:0,cls:'v',mk:1,c:'#8a6a3a',skin:SKIN[rnd(5)],hair:HAIR[rnd(5)],x:0,y:0,sp:.45,path:[],ph:1,wait:ri(30,120),moving:0,vis:1,delay:0,hide:0,fl:0,
    n:{hu:ri(10,30),fa:ri(0,20),sl:ri(0,10)},act:'idle',t:0,cd:0,goal:null,say:'',tool:null},o);
  p.tx=p.x;p.ty=p.y;return p}
function spawnM(){
  if(!HN)return;SELL=[];
  const KS=['man','woman','elder','man','woman','woman','man'],CL=['#6e7f80','#a0522d','#2e7d6b','#b5651d','#4b6ea8','#8d6e63','#6a8a3a'];
  STALLS.forEach((st,i)=>{
    const p=mkN({role:st.n,k:KS[i],c:CL[i%CL.length],x:(st.x+1)*T+4,y:(st.side==='N'?st.y:st.y+1)*T+4,seller:1,stall:i,kind:st.k,hide:1,cd:1e9,hair:KS[i]==='elder'?'#cfd3d8':HAIR[rnd(5)]});
    people.push(p);SELL[i]=p});
  const nc=mkN({role:'Noce',k:'man',c:'#a0522d',skin:'#e8b27a',hair:'#4a3b2c',noce:1,fl:19,x:HN.ex*T+4,y:HN.ey*T+4,sp:.33,bt:0,drank:0});
  ins.push(nc)}

/* ---------- Mua bán ---------- */
function sell(i,p,line){
  const st=STALLS[i],s=SELL[i];MK.deals++;
  p.mkSay=line||('Bán cho tôi ít '+KIND[st.k].item);p.mkT=3;
  if(s){s.mkSay=p.noce?'Lại là anh Noce à?':pk(['Cảm ơn!','Hàng tươi đây!','Lần sau lại ghé nhé!']);s.mkT=3;
    puff(s.x,s.y-18,4,['#ffd23f','#fff3a0','#e0b030'],.02,-.5,24)}
  if(!p.noce)p.hold={c:pk(KIND[st.k].c),t:50}}
function shopBusy(){let n=0;people.concat(ins).forEach(p=>{if(p.vil&&((p.goal&&p.goal.kind==='shop')||p.act==='shop'))n++});return n}
function tryShop(p){
  if(!HN||p.k==='child')return false;
  const h=hour();if(h<8||h>=17||MEAL(h)>=0)return false;
  if(p.n.hu>=70||p.n.fa>=80)return false;
  if(Math.random()>.25||shopBusy()>=5)return false;
  const i=rnd(STALLS.length),st=STALLS[i];
  p.goal={out:1,x:st.x+rnd(4),y:st.side==='N'?st.y+2:st.y-1,kind:'shop',st:i};p.path=[];p.tool=null;p.wait=ri(40,130);
  return true}

/* ---------- Noce: mua rượu -> về nhà uống -> say gục -> ngủ ---------- */
function enterN(p){people=people.filter(q=>q!==p);p.fl=19;p.x=p.tx=HN.ex*T+4;p.y=p.ty=HN.ey*T+4;p.path=[];ins.push(p)}
function exitN(p){ins=ins.filter(q=>q!==p);p.fl=0;p.x=p.tx=HN.dx*T+4;p.y=p.ty=(HN.dy+1)*T+4;p.path=[];people.push(p)}
function mnav(p){/* true = đang di chuyển / chuyển khu vực, false = đã tới đích */
  const g=p.goal,F=p.fl,tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);let pth;
  if(F===19){
    if(g.out||g.fl!==19){if(FL[19].im[ty][tx]===32){exitN(p);return true}pth=bfs(19,tx,ty,HN.ix,HN.iy)}
    else{if(tx===g.x&&ty===g.y)return false;pth=bfs(19,tx,ty,g.x,g.y)}
  }else{
    if(!g.out){if(tx===HN.dx&&ty===HN.dy){enterN(p);return true}pth=bfsW(tx,ty,HN.dx,HN.dy)}
    else{if(tx===g.x&&ty===g.y)return false;pth=bfsW(tx,ty,g.x,g.y)}}
  if(pth&&pth.length){p.path=pth;return true}
  rel(p);p.goal=null;return true}
function noceThink(p){
  const h=hour(),night=h>=21||h<5.5,home=p.fl===19;p.wait=ri(40,100);p.path=[];
  if(night){p.goal={fl:19,x:HN.bx,y:HN.by,kind:'nbed'};return}
  if(home&&(p.drank||0)>=2&&Math.random()<.45){p.goal={fl:19,x:HN.px,y:HN.py,kind:'pass'};return}
  if((p.bt|0)>0){p.goal={fl:19,x:HN.chx,y:HN.chy,kind:'drink'};return}
  if(h<7||h>=17.5){if(!home)p.goal={fl:19,x:HN.ex,y:HN.ey,kind:'walk'};p.wait=ri(120,260);return}
  const st=STALLS[WI];
  p.goal={out:1,x:st.x+rnd(4),y:st.y+2,kind:'wine',st:WI}}
function noceArrive(p,g){
  p.wait=ri(30,80);
  if(g.kind==='wine'){p.bt=(p.bt|0)+ri(3,5);sell(WI,p,pk(['Cho tôi... mấy chai rượu!','Hức... chai nữa đi bác!']));startAct(p,'shop',ri(4,7))}
  else if(g.kind==='drink'){p.x=p.tx=HN.chx*T+4;p.y=p.ty=HN.chy*T+4;p.bt=Math.max(0,(p.bt|0)-1);p.drank=(p.drank|0)+1;p.mkSay=pk(DL);p.mkT=3;startAct(p,'drink',ri(22,40))}
  else if(g.kind==='pass'){p.x=p.tx=HN.px*T+4;p.y=p.ty=HN.py*T+4;p.drank=0;startAct(p,'pass',ri(50,100))}
  else if(g.kind==='nbed'){p.x=p.tx=HN.bx*T+4;p.y=p.ty=HN.by*T+4;startAct(p,'sleep',0)}}

/* ---------- Bọc các hàm có sẵn của game ---------- */
const _gen=gen;gen=function(sd){_gen(sd);buildMarket()};
const _initRes=initRes;initRes=function(){_initRes();spawnM()};
const _restore=restore;restore=function(s){_restore(s);spawnM()};
const _snapP=snapP;snapP=function(){const P=people,I=ins;people=P.filter(p=>!p.mk);ins=I.filter(p=>!p.mk);try{return _snapP()}finally{people=P;ins=I}};/* NPC chợ không lưu vào save */
const _think=think;think=function(p){
  if(p.noce)return noceThink(p);
  if(p.mk){p.wait=ri(90,220);return}
  if(p.vil&&tryShop(p))return;
  return _think(p)};
const _nav=nav;nav=function(p){return p.noce?mnav(p):_nav(p)};
const _arrive=arrive;arrive=function(p){
  const g=p.goal;
  if(g&&g.kind==='shop'&&p.vil){p.goal=null;p.wait=ri(40,120);sell(g.st,p);startAct(p,'shop',ri(4,8));return}
  if(p.noce&&g){p.goal=null;return noceArrive(p,g)}
  return _arrive(p)};
const _step=step;step=function(){_step();mTick()};
function mTick(){
  if(state!=='island'&&state!=='land')return;
  const dt=Math.min(.25,DM||.016),o=open();
  people.concat(ins).forEach(p=>{
    if(!p.mk&&!p.vil)return;
    if(p.mkT>0){p.mkT-=dt;if(p.mkT<=0)p.mkSay=''}
    if(p.hold&&p.hold.t>0)p.hold.t-=dt;
    if(p.seller){p.hide=o?0:1;if(o&&!(p.mkT>0)&&Math.random()<.0007){p.mkSay=pk(CALLS[p.kind]);p.mkT=3.5}}
    if(p.noce&&p.act==='idle'&&!(p.mkT>0)&&Math.random()<.0012){p.mkSay=pk(DL);p.mkT=3}})}

/* Noce nói chuyện lè nhè */
const _social=social;social=function(){_social();
  people.concat(ins).forEach(p=>{if(!p.noce)return;if(p.act==='chat'){if(!p.dsay){p.say=pk(DL);p.dsay=1}}else p.dsay=0})};

/* Người chơi bước vào / ra nhà rơm */
function enterHome(q){warp(q,()=>{putIn(q,19,HN.ex-1.5+slot(q)*.6,HN.ey);
  if(q.pl===sel){syncView(true);cap('Nhà rơm của Noce: giường, bếp lửa, bàn ghế và thùng rượu. Chủ nhà chắc đang say khướt đâu đó.')}})}
function leaveHome(q){warp(q,()=>{putOut(q,HN.dx*T+4,(HN.dy+1)*T+4);
  if(q.pl===sel){syncView(true);cap('Bạn đã bước ra khỏi nhà rơm.')}})}
const _doors=doors;doors=function(){_doors();
  if(!HN||trans||state!=='island')return;
  people.filter(p=>p.pl).forEach(p=>{if(Math.floor(p.x/T)===HN.dx&&Math.floor(p.y/T)===HN.dy)enterHome(p)});
  ins.filter(p=>p.pl&&p.fl===19).forEach(p=>{const r=FL[19].im[Math.floor(p.y/T)];if(r&&r[Math.floor(p.x/T)]===32)leaveHome(p)})};

/* ---------- Hình dáng nhân vật ---------- */
const _generic=generic;generic=function(R,s,p){_generic(R,s,p);
  if(p.noce){
    R('#e0705a',-3,-12,2,1);R('#e0705a',1,-12,2,1);R('#d9534f',0,-12,1,1);              /* má đỏ, mũi đỏ */
    R('#c9a64b',-6,-18,12,1);R('#e2c777',-5,-19,10,1);R('#e2c777',-3,-20,6,1);R('#8a5a2e',-3,-17,6,1)}  /* nón rơm */
  else if(p.seller&&p.k!=='child'){R('#f4f4f4',-3,-8,6,5);R('#d8d8d8',-3,-4,6,1)}};      /* tạp dề */
/* bong bóng thoại của chợ: chỉ vẽ khi NPC nằm trong màn hình, gắn sát đầu NPC (bub() gốc kẹp sai vùng nhìn khi ở ngoài trời) */
function mbub(x,y,t){
  const vw=inside?CW/IS:CW,vh=inside?CH/IS:CH,c0=Math.round(camX),r0=Math.round(camY);
  if(x<c0-4||x>c0+vw+4||y<r0||y>r0+vh+40)return;
  cx.font='6px monospace';cx.textAlign='center';
  const w=Math.ceil(cx.measureText(t).width)+8,h=11,by=Math.round(y-h);
  let bx=Math.round(x-w/2);bx=Math.max(c0+2,Math.min(c0+vw-w-2,bx));
  cx.fillStyle='rgba(255,255,255,.96)';cx.fillRect(bx,by,w,h);cx.fillRect(Math.round(x)-1,by+h,3,2);
  cx.fillStyle='#111';cx.fillText(t,bx+w/2,by+8)}
const _person=person;person=function(p){
  const ox=p.x,oa=p.act,pass=oa==='pass',wob=p.noce&&!pass&&oa!=='sleep';
  if(wob)p.x=ox+Math.round(Math.sin(frame*.11)*1.6);      /* đi loạng choạng */
  if(pass)p.act='sleep';                                   /* gục xuống sàn */
  _person(p);
  p.x=ox;p.act=oa;
  if(!(p.mk||p.vil)||oa==='sleep'||pass)return;
  const x=Math.round(ox),y=Math.round(p.y),H0=hOf(p),R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(x+a,y+b,w,h)};
  if(p.hold&&p.hold.t>0){R('#6b4423',4,-9,5,4);R(p.hold.c,5,-11,3,3);R('#fff',5,-11,1,1)}
  if(p.noce){
    if(oa==='drink'){R('#2f8f3a',3,-17,2,5);R('#b9e6b0',3,-17,1,1)}
    else if((p.bt|0)>0){R('#2f8f3a',5,-10,2,5);R('#b9e6b0',5,-10,1,1)}}
  if(p.mkT>0&&p.mkSay){mbub(x,y-H0-(p.role?14:8),p.mkSay);return}
  if(p.noce&&oa!=='chat'){cx.font='7px sans-serif';cx.textAlign='center';cx.fillText(oa==='drink'?'🍺':oa==='shop'?'💰':'💫',x,y-H0-12)}};

/* ---------- Vẽ quầy chợ, nhà rơm, biển CHỢ ---------- */
function drawStall(s,op){
  const K=KIND[s.k],X=s.x*T,Y=s.y*T,N=s.side==='N',ct=N?8:0,bk=N?0:8,y0=N?ct-3:ct+1,
    R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(X+a,Y+b,w,h)};
  R('rgba(0,0,0,.22)',-1,15,34,3);
  R('#4a2f17',0,-4,2,20);R('#4a2f17',30,-4,2,20);
  R('#6b4a2a',2,bk,28,8);R('#7b5a38',2,bk,28,1);R('#553a20',2,bk+7,28,1);
  R('#8a5a2e',0,ct,32,8);R('#b8864f',0,ct,32,2);R('#5a3a1e',0,ct+7,32,1);
  for(let i=4;i<32;i+=8)R('#6b4423',i,ct+2,1,5);
  if(op){
    if(s.k==='wine'){for(let i=0;i<4;i++){const x=3+i*5;R('#2f8f3a',x,y0,2,4);R('#2f8f3a',x,y0-2,1,2);R('#b9e6b0',x,y0,1,1)}
      R('#7a4a22',24,y0-2,6,6);R('#3a2410',24,y0,6,1);R('#3a2410',24,y0+2,6,1)}
    else if(s.k==='fish'){for(let i=0;i<5;i++){const x=2+i*6,c=K.c[i%4];R(c,x,y0+1,4,2);R(c,x+4,y0,1,1);R(c,x+4,y0+3,1,1);R('#222',x,y0+1,1,1)}}
    else for(let i=0;i<6;i++){const x=2+i*5;R(K.c[(i+s.x)%4],x,y0,4,3);R('rgba(255,255,255,.35)',x,y0,4,1)}
  }else{R('#5a4630',0,ct,32,8);R('#3a2a1a',0,ct+3,32,1);R('#3a2a1a',0,ct+6,32,1)}
  for(let i=0;i<32;i+=4)R(K.a[(i>>2)&1],i,-9,4,8);
  for(let i=0;i<32;i+=4)R(K.a[(i>>2)&1],i,-1,4,2+((i>>2)&1));
  R('rgba(0,0,0,.18)',0,2,32,1);
  R('#3a2410',6,-18,20,8);R('#d8c08c',7,-17,18,6);
  cx.font='bold 5px monospace';cx.textAlign='center';cx.fillStyle='#3a2410';cx.fillText(K.name,X+16,Y-12)}
function drawStraw(){
  const X=HN.x*T,Y=HN.y*T,Wd=HN.w*T,Hd=HN.h*T,dl=(HN.dx-HN.x)*T,rh=11,RH=19,R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(X+a,Y+b,w,h)};
  R('rgba(0,0,0,.25)',1,Hd-1,Wd,2);
  R('#c9a85a',0,6,Wd,Hd-6);
  for(let i=0;i<Wd;i+=3)R(i%6?'#b8964a':'#d6b86a',i,6,1,Hd-6);
  R('#8a6a30',0,13,Wd,1);R('#8a6a30',0,Hd-8,Wd,1);R('#6b4f22',0,Hd-1,Wd,1);R('#6b4f22',0,6,1,Hd-6);R('#6b4f22',Wd-1,6,1,Hd-6);
  for(let j=0;j<RH;j++){const o=Math.round((RH-1-j)*.5)-1;
    R(j%2?'#d9b94f':'#c9a63e',o,j-rh,Wd-2*o,1);
    if(j%3===1)for(let i=o+1+(j%5);i<Wd-o-1;i+=5)R('#a88326',i,j-rh,1,1);
    if(j%4===0)for(let i=o+2+(j%3);i<Wd-o-2;i+=7)R('#efd77a',i,j-rh,2,1)}
  for(let i=-1;i<Wd+1;i+=2)R(i%4?'#b8962f':'#a88326',i,RH-rh-1,1,2+(hs(i+9,3)%2));
  R('rgba(0,0,0,.3)',0,8,Wd,1);
  R('#a88326',Wd-18,-3,8,4);R('#efd77a',Wd-18,-3,8,1);                                    /* mảng mái vá tạm */
  R('#2a1a0c',dl,Hd-10,8,10);R('#5a3a1e',dl+1,Hd-9,6,9);R('#241608',dl+3,Hd-8,1,5);R('#b8922f',dl+5,Hd-5,1,1);
  R('#4a2f17',33,Hd-19,8,8);R('#7fb0c8',34,Hd-18,6,6);R('#d8ecf4',34,Hd-18,1,1);R('#4a2f17',36,Hd-18,1,6);
  [[dl-9,Hd-4],[dl-5,Hd-2],[dl+12,Hd-3],[dl+16,Hd-1]].forEach(([a,b])=>{R('#2f8f3a',a,b-3,2,3);R('#2f8f3a',a,b-4,1,1);R('#b9e6b0',a,b-3,1,1)});  /* chai rỗng vứt bừa */
  R('#6b4423',Wd-9,Hd-9,7,9);R('#8a5a2e',Wd-8,Hd-9,5,1);R('#3a2410',Wd-9,Hd-7,7,1);R('#3a2410',Wd-9,Hd-3,7,1)}                                  /* thùng rượu */
function drawSign(){
  const X=(MX+76)*T,Y=(MY+22)*T,R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(X+a,Y+b,w,h)};
  R('rgba(0,0,0,.25)',0,7,12,2);R('#4a2f17',1,-6,2,13);R('#4a2f17',9,-6,2,13);
  R('#3a2410',-12,-18,36,13);R('#c9a85a',-11,-17,34,11);
  cx.font='bold 6px monospace';cx.textAlign='center';cx.fillStyle='#3a2410';cx.fillText('CHỢ LÀNG',X+6,Y-9)}
function drawMarket(){
  const op=open(),vis=(x,y,w,h)=>x+w>camX-40&&x<camX+CW+40&&y+h>camY-40&&y<camY+CH+40;
  cx.globalAlpha=iAlpha;
  STALLS.forEach(s=>{if(vis(s.x*T,s.y*T-20,32,40))drawStall(s,op)});
  if(vis(HN.x*T-4,HN.y*T-14,52,50))drawStraw();
  if(vis((MX+76)*T-14,(MY+22)*T-20,40,30))drawSign();
  cx.globalAlpha=1}
const _clouds=clouds;clouds=function(){_clouds();if(!HN||iAlpha<=0)return;drawMarket()};
const _glow=glow;glow=function(){_glow();
  if(!HN||iAlpha<=0)return;const nk=nightK();if(nk<=0)return;
  cx.save();cx.globalCompositeOperation='lighter';const fl=.85+.15*Math.sin(frame*.1);
  const L=(x,y,w,h)=>{cx.fillStyle='#ffb347';cx.globalAlpha=.11*nk;cx.fillRect(x-3,y-3,w+6,h+6);cx.globalAlpha=.8*nk*fl;cx.fillRect(x,y,w,h)};
  L(HN.x*T+34,HN.y*T+HN.h*T-18,6,6);
  STALLS.forEach(s=>L(s.x*T+14,s.y*T-6,4,4));
  cx.restore();cx.globalAlpha=1};
/* chai rượu rỗng vứt dưới sàn nhà rơm */
const _drawIn=drawIn;drawIn=function(){_drawIn();
  if(curF!==19)return;
  [[33,26],[38,25],[31,24],[39,23]].forEach(([a,b],i)=>{const X=a*T,Y=b*T+3;
    cx.fillStyle='#2f8f3a';cx.fillRect(X,Y,5,2);cx.fillRect(X+5,Y,2,1);cx.fillStyle='#b9e6b0';cx.fillRect(X+1,Y,2,1)})};

/* ---------- Bảng thông tin bên trái ---------- */
const _info=infoUI;infoUI=function(){_info();const e=$('sl');if(!e||!HN)return;
  const n=people.concat(ins).find(p=>p.noce);let t='';
  if(n){const a={drink:'đang nhậu',pass:'say gục',sleep:'đang ngủ',shop:'đang mua rượu',chat:'đang lè nhè'}[n.act]||
    (n.goal&&n.goal.kind==='wine'?'đi mua rượu':n.goal&&n.goal.kind==='drink'?'về nhà nhậu':'lảo đảo');
    t='<br>Noce: '+a+' · '+(n.bt|0)+' chai'}
  e.innerHTML+='<div class="vil"><b>Chợ làng</b><br>Giao dịch: '+MK.deals+t+'</div>'};

/* tạo lại thế giới một lần để bản đồ đầu tiên đã có chợ */
reset();
})();