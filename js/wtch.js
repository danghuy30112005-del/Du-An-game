/* ===== witch.js: PHÁP SƯ GIÀ + NHÀ TÂM LINH trong làng =====
   Nạp SAU village.js (và market.js nếu có), TRƯỚC playerkit.js. Không cần sửa file cũ.
   - Nhà tâm linh nằm ở phía đông đường làng (cuối dãy nhà phía bắc): mái tím, trăng khuyết, chuông gió, tinh thể.
   - Bà pháp sư sống trong nhà: ban ngày ngồi bàn pha lê, đi lại giữa kệ sách / nồi thuốc / thảm trận pháp,
     thỉnh thoảng ra đứng trước sân; 21h lên giường ngủ.
   - Lại gần bà (có mũi tên ▼) rồi bấm E để nói chuyện. Bấm 1, 2... hoặc Esc như cuộc đối thoại với chủ đảo. */
(()=>{
if(typeof LOOKS==='undefined'||!LOOKS.vchief||W<340||H<180){console.warn('witch.js: hãy nạp SAU village.js (và deadisland.js phải có W=340,H=180)');return}

const MX=186,MY=30;                 /* gốc bố cục làng (giống village.js) */
const pk=a=>a[rnd(a.length)];
let SH=null,WQ={};                  /* SH = vị trí nhà; WQ[p] = người chơi p đã nghe lời tiên tri */

/* ---------- Hội thoại ---------- */
const WN=[
  {t:'Một bà lão mặc áo choàng tím, quanh người treo đầy bùa chú, đang ngước nhìn bạn.',o:[{t:'Chào bà',go:1}]},
  {w:1,t:'Các cậu là người đến từ tòa lâu đài sao? Tôi chưa từng gặp cậu bao giờ.',o:[{t:'Đúng vậy, cháu là người mới đến.',go:2}]},
  {w:1,t:'Các người nên cẩn thận đi. Các người đã bị thứ không nên đụng trong cái hang đó để ý tới rồi.',o:[{t:'Tiếp tục',go:3}]},
  {w:1,t:'Số mệnh đã thay đổi, đường đã rẽ, không thể quay lại.',o:[{t:'Tiếp tục',go:4}]},
  {w:1,t:'Ở phía trái ngôi làng có một cái hang. Trong đó có một thứ đen tối sẵn sàng tiêu diệt những kẻ bén mảng đến bí mật ở trong đó. Các người đã bị nó nhắm tới, để càng lâu thì tỷ lệ chết càng cao.',o:[{t:'Vậy làm sao để rũ bỏ lời nguyền này?',go:5}]},
  {w:1,t:'Ta không thể xóa bỏ lời nguyền. Lời nguyền này các người phải tự tìm cách giải quyết.',o:[{t:'Tiếp tục',go:6}]},
  {w:1,t:'Các người hãy tìm cho ta những thứ ta cần. Ta sẽ đưa cho các ngươi một "con đường".',o:[{t:'Kết thúc hội thoại',end:1}]},
  {w:1,t:'Hãy tìm cho ta những thứ ta cần, rồi ta sẽ đưa cho các ngươi một "con đường".',o:[{t:'Cháu hiểu rồi',end:1}]}];
const WL=['Linh hồn đang thì thầm...','Sao chổi báo điềm gở.','Bùa này giữ cho cháu bình an.','Đừng lại gần cái hang đó...','Gió mang theo mùi chết chóc.'];
/* chỗ bà hay đứng trong nhà: [x, y, ngồi?] */
const SPOTS=[[36,23,1],[32,22,0],[31,26,0],[35,26,0],[39,24,0]];

function wRender(){
  const n=WN[TK.node],o=$('dO');
  $('dlg').hidden=false;$('dN').textContent=n.w?'Pháp sư (nói với P'+TK.P.pl+')':'Pháp sư già';
  $('dT').textContent=n.t;o.innerHTML='';
  n.o.forEach((a,i)=>{const b=document.createElement('button');b.className='btn';b.textContent=(i+1)+'. '+a.t;b.onclick=()=>wPick(a);o.append(b)});
  o.firstChild.focus()}
function wPick(a){
  if(!TK||!TK.wiz)return;
  if(a.end){const n=TK.P.pl;WQ[n]=1;TK=null;$('dlg').hidden=true;cap('Bà pháp sư muốn các bạn tìm những thứ bà cần. Hãy quay lại khi đã sẵn sàng.');return}
  TK.node=a.go;wRender()}
function wOpen(P){TK={P,node:WQ[P.pl]?7:0,wiz:1};$('tk').hidden=true;wRender()}
const _closeTalk=closeTalk;closeTalk=function(){if(TK&&TK.wiz){TK=null;$('dlg').hidden=true;return}_closeTalk()};
const wizard=()=>people.concat(ins).find(p=>p.witch);
function nearWitch(){
  const z=wizard(),P=(inside?ins:people).find(p=>p.pl===sel);
  return z&&P&&!z.hide&&z.act!=='sleep'&&(z.fl|0)===(P.fl|0)&&Math.hypot(P.x-z.x,P.y-z.y)<28?P:null}
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat||e.key.toLowerCase()!=='e')return;
  if(state!=='island'||TK||trans)return;
  const P=nearWitch();if(P)wOpen(P)});
const _tkUI=tkUI;tkUI=function(){_tkUI();
  const e=$('tk');if(!e)return;
  if(state==='island'&&!TK&&!trans&&nearWitch()){e.innerHTML='Bấm <b>E</b> để nói chuyện với Pháp sư';e.hidden=false}
  else e.innerHTML='Bấm <b>E</b> để nói chuyện với Chủ đảo'};
/* bà đứng yên khi đang nói chuyện */
const _upd=upd;upd=function(p){if(p.witch&&TK&&TK.wiz){p.moving=0;return}return _upd(p)};

/* ---------- Nội thất nhà tâm linh (FL[20]) ---------- */
function mkShrine(){
  const im=Array.from({length:IH},()=>Array(IW).fill(1)),rid=Array.from({length:IH},()=>Array(IW).fill(0)),RM=[];
  const S=(t,x,y,w=1,h=1)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)im[y+j][x+i]=t};
  RM[1]={n:'Nhà của Pháp sư',f:['#5b4a7a','#52426e'],x0:30,y0:20,x1:41,y1:28,s:1};
  for(let y=20;y<=28;y++)for(let x=30;x<=41;x++){im[y][x]=0;rid[y][x]=1}
  im[29][35]=32;rid[29][35]=1;                         /* cửa ra */
  S(23,30,20,5);S(26,36,20);S(24,37,20,2);S(24,39,20);   /* kệ sách, bếp lửa, tủ */
  S(20,40,20,2);S(21,40,21,2,2);                         /* giường */
  S(22,35,22,2);S(44,35,23,2);                           /* bàn pha lê + ghế */
  S(28,30,25,2);                                         /* nồi thuốc (vẽ chồng lên) */
  S(27,30,27);S(27,41,27);S(27,41,25);
  im[19][33]=25;im[19][38]=25;im[29][31]=25;im[29][39]=25;
  return{im,rid,RM}}

/* ---------- Đặt nhà lên bản đồ ---------- */
function buildShrine(){
  SH=null;
  const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H,set=(x,y,t)=>{if(inb(x,y)&&m[y][x]!==SEA)m[y][x]=t};
  if(!inb(MX+95,MY+16)||m[MY+6][MX+88]===SEA)return;
  SH={x:MX+86,y:MY+5,w:8,h:4,dx:MX+89,dy:MY+9,ex:35,ey:28,ix:35,iy:29,bx:40,by:21};
  for(let y=SH.y;y<SH.y+SH.h;y++)for(let x=SH.x;x<SH.x+SH.w;x++)set(x,y,HSE);
  for(let y=SH.dy;y<=MY+14;y++)set(SH.dx,y,PATH);
  FL[20]=mkShrine()}

function spawnW(){
  if(!SH)return;
  const p={k:'woman',pl:0,cls:'v',witch:1,look:'witch',role:'Pháp sư',c:'#4a2a7a',skin:'#e6c9b0',hair:'#e8eaf0',fl:20,x:36*T+4,y:23*T+4,sp:.3,
    path:[],ph:1,wait:ri(30,90),moving:0,vis:1,delay:0,hide:0,n:{hu:20,fa:5,sl:5},act:'idle',t:0,cd:0,goal:null,say:'',tool:null};
  p.tx=p.x;p.ty=p.y;ins.push(p)}

/* ---------- Đi lại của bà ---------- */
function wenter(p){people=people.filter(q=>q!==p);p.fl=20;p.x=p.tx=SH.ex*T+4;p.y=p.ty=SH.ey*T+4;p.path=[];ins.push(p)}
function wexit(p){ins=ins.filter(q=>q!==p);p.fl=0;p.x=p.tx=SH.dx*T+4;p.y=p.ty=(SH.dy+1)*T+4;p.path=[];people.push(p)}
function wnav(p){/* true = đang di chuyển / chuyển khu vực, false = đã tới đích */
  const g=p.goal,F=p.fl,tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);let pth;
  if(F===20){
    if(g.out||g.fl!==20){if(FL[20].im[ty][tx]===32){wexit(p);return true}pth=bfs(20,tx,ty,SH.ix,SH.iy)}
    else{if(tx===g.x&&ty===g.y)return false;pth=bfs(20,tx,ty,g.x,g.y)}
  }else{
    if(!g.out){if(tx===SH.dx&&ty===SH.dy){wenter(p);return true}pth=bfsW(tx,ty,SH.dx,SH.dy)}
    else{if(tx===g.x&&ty===g.y)return false;pth=bfsW(tx,ty,g.x,g.y)}}
  if(pth&&pth.length){p.path=pth;return true}
  rel(p);p.goal=null;return true}
function wthink(p){
  const h=hour(),r=Math.random();p.wait=ri(80,200);p.path=[];
  if(h>=21||h<5.5){p.goal={fl:20,x:SH.bx,y:SH.by,kind:'wbed'};return}
  if(r<.18){p.goal={out:1,x:SH.dx-1+rnd(3),y:SH.dy+1+rnd(2),kind:'wout'};return}
  const s=pk(SPOTS);p.goal={fl:20,x:s[0],y:s[1],kind:'wspot',sit:s[2]}}

/* ---------- Bọc các hàm có sẵn của game ---------- */
const _gen=gen;gen=function(sd){_gen(sd);buildShrine()};
const _initRes=initRes;initRes=function(){_initRes();spawnW()};
const _restore=restore;restore=function(s){_restore(s);spawnW()};
const _mkPeople=mkPeople;mkPeople=function(){WQ={};_mkPeople()};
const _snapP=snapP;snapP=function(){const P=people,I=ins;people=P.filter(p=>!p.witch);ins=I.filter(p=>!p.witch);try{return _snapP()}finally{people=P;ins=I}};
const _think=think;think=function(p){return p.witch?wthink(p):_think(p)};
const _nav=nav;nav=function(p){return p.witch?wnav(p):_nav(p)};
const _arrive=arrive;arrive=function(p){
  const g=p.goal;
  if(p.witch&&g){
    p.goal=null;p.wait=ri(60,160);
    if(g.kind==='wbed'){p.x=p.tx=SH.bx*T+4;p.y=p.ty=SH.by*T+4;startAct(p,'sleep',0)}
    else if(g.kind==='wspot'){if(g.sit){p.x=p.tx=g.x*T+4;p.y=p.ty=g.y*T+4}startAct(p,'rest',ri(15,30))}
    else startAct(p,'rest',ri(10,20));
    return}
  return _arrive(p)};
const _step=step;step=function(){_step();wTick()};
function wTick(){
  if(state!=='island'&&state!=='land')return;
  const z=wizard();if(!z)return;
  const dt=Math.min(.25,DM||.016);
  if(z.wT>0){z.wT-=dt;if(z.wT<=0)z.wSay=''}
  if(z.act!=='sleep'&&!(z.wT>0)&&!(TK&&TK.wiz)&&Math.random()<.0008){z.wSay=pk(WL);z.wT=3.5}}
const _social=social;social=function(){_social();
  people.concat(ins).forEach(p=>{if(!p.witch)return;if(p.act==='chat'){if(!p.dsay){p.say=pk(WL);p.dsay=1}}else p.dsay=0})};

/* người chơi vào / ra nhà pháp sư */
function enterShrine(q){warp(q,()=>{putIn(q,20,SH.ex-1.5+slot(q)*.6,SH.ey);
  if(q.pl===sel){syncView(true);cap('Nhà của bà pháp sư: nến, sách bùa, nồi thuốc và quả cầu pha lê. Lại gần bà rồi bấm E để nói chuyện.')}})}
function leaveShrine(q){warp(q,()=>{putOut(q,SH.dx*T+4,(SH.dy+1)*T+4);
  if(q.pl===sel){syncView(true);cap('Bạn đã bước ra khỏi nhà pháp sư.')}})}
const _doors=doors;doors=function(){_doors();
  if(!SH||trans||state!=='island')return;
  people.filter(p=>p.pl).forEach(p=>{if(Math.floor(p.x/T)===SH.dx&&Math.floor(p.y/T)===SH.dy)enterShrine(p)});
  ins.filter(p=>p.pl&&p.fl===20).forEach(p=>{const r=FL[20].im[Math.floor(p.y/T)];if(r&&r[Math.floor(p.x/T)]===32)leaveShrine(p)})};

/* ---------- Hình dáng: bà lão pháp sư (nón nhọn, áo choàng tím, gậy pha lê) ---------- */
LOOKS.witch=(R,s)=>{
  const sk='#e6c9b0',wh='#e8eaf0',rb='#4a2a7a',rd='#34195a',gd='#d4a63a';
  R('#1a1020',-2,-1,2,1);R('#1a1020',0,-1,2,1);
  R(rb,-4,-10,8,9);R(rb,-5,-3,10,2);R(rd,-5,-2,10,1);R(rd,2,-10,2,9);
  R('#6b3fa0',-4,-11,8,2);R(gd,-4,-6,8,1);R('#fff2a8',0,-9,1,1);R(gd,-1,-8,3,1);
  R(rb,-5,-10,1,5);R(rb,4,-10,1,5);R(sk,-5,-5,1,1);R(sk,4,-5,1,1);
  R('#6b4423',5,-20,1,19);R('#9b5de5',4,-23,3,3);R('#e0c8ff',5,-22,1,1);
  R(wh,-4,-16,1,8);R(wh,3,-16,1,8);
  R(sk,-3,-16,6,5);
  R('#222',-2,-14,1,1);R('#222',1,-14,1,1);R('#b9917a',-2,-12,1,1);R('#b9917a',1,-12,1,1);R('#a8665a',-1,-11,2,1);
  R(rd,-6,-18,12,2);R(gd,-4,-18,8,1);R(rb,-4,-20,8,2);R(rb,-3,-22,6,2);R(rb,-2,-24,4,2);R(rb,-1,-26,3,2);R('#ffd23f',0,-22,1,1)};
LOOKHT.witch=26;

/* bong bóng thoại + mũi tên ▼ trên đầu bà */
function wbub(x,y,t){
  const vw=inside?CW/IS:CW,vh=inside?CH/IS:CH,c0=Math.round(camX),r0=Math.round(camY);
  if(x<c0-4||x>c0+vw+4||y<r0||y>r0+vh+40)return;
  cx.font='6px monospace';cx.textAlign='center';
  const w=Math.ceil(cx.measureText(t).width)+8,h=11,by=Math.round(y-h);
  let bx=Math.round(x-w/2);bx=Math.max(c0+2,Math.min(c0+vw-w-2,bx));
  cx.fillStyle='rgba(255,255,255,.96)';cx.fillRect(bx,by,w,h);cx.fillRect(Math.round(x)-1,by+h,3,2);
  cx.fillStyle='#111';cx.fillText(t,bx+w/2,by+8)}
const _person=person;person=function(p){_person(p);
  if(!p.witch||p.act==='sleep')return;
  const x=Math.round(p.x),y=Math.round(p.y),H0=hOf(p),R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(x+a,y+b,w,h)};
  if(p.wT>0&&p.wSay){wbub(x,y-H0-14,p.wSay);return}
  if(state==='island'&&!TK){const bb=(frame>>4)&1,y0=-H0-17+bb;R('#000',-4,y0-1,9,1);for(let i=0;i<4;i++){const ww=7-2*i;R('#000',-(ww>>1)-1,y0+i,ww+2,1);R('#ffd23f',-(ww>>1),y0+i,ww,1)}R('#000',0,y0+4,1,1)}};

/* ---------- Vẽ ngôi nhà tâm linh bên ngoài ---------- */
function drawShrine(){
  const X=SH.x*T,Y=SH.y*T,Wd=SH.w*T,Hd=SH.h*T,dl=(SH.dx-SH.x)*T,rh=13,RH=21,fr=frame,R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(X+a,Y+b,w,h)},
    RC=['#3b2a6b','#2f2158','#5a43a0'];
  /* vườn thảo dược bên trái + nến trước sân */
  R('#6a4a2a',-14,Hd-6,12,6);
  for(let i=0;i<4;i++){R('#3f8a35',-13+i*3,Hd-9,1,3);R(['#b07cff','#ffd23f','#ff7ab6','#ffffff'][i],-13+i*3,Hd-10,2,2)}
  [[dl-12,Hd+1],[dl-6,Hd+4],[dl+14,Hd+4],[dl+20,Hd+1]].forEach(([a,b],i)=>{R('#f4f4f6',a,b-3,1,3);R(((fr>>3)+i)%2?'#ffd23f':'#ff8a3d',a,b-5,1,2)});
  R('rgba(0,0,0,.25)',1,Hd-1,Wd,2);
  R('#d9d0e8',0,6,Wd,Hd-6);
  for(let j=9;j<Hd;j+=4){R('#bdb2d6',0,j,Wd,1);for(let i=((j>>2)&1)*4;i<Wd;i+=8)R('#bdb2d6',i,j-3,1,3)}
  R('#7c7394',0,Hd-4,Wd,4);R('#5f5878',0,Hd-1,Wd,1);R('#8a7fa8',0,6,1,Hd-6);R('#8a7fa8',Wd-1,6,1,Hd-6);
  /* trăng khuyết trên tường */
  for(let a=-5;a<=5;a++)for(let b=-5;b<=5;b++){if(Math.hypot(a,b)<=5&&Math.hypot(a-2,b)>4.2)R('#f4e9a8',Wd/2+a-2,15+b,1,1)}
  R('#ffd23f',Wd/2+4,12,1,1);R('#ffd23f',Wd/2+6,16,1,1);
  /* mái */
  for(let j=0;j<RH;j++){const o=Math.round((RH-1-j)*.5)-1;R(RC[(j>>1)%2],o,j-rh,Wd-2*o,1);if(j%2)for(let i=o+1+(j%4);i<Wd-o-1;i+=4)R(RC[2],i,j-rh,1,1)}
  R('rgba(0,0,0,.3)',0,8,Wd,1);
  [[Wd/2-1,-9],[Wd/2-10,-2],[Wd/2+9,-3],[Wd/2-5,3]].forEach(([a,b],i)=>R(((fr>>4)+i)%3===0?'#fff6c0':'#ffd23f',Math.round(a),b,2,2));
  /* tinh thể trên đỉnh mái + khói hương */
  R('#b894ff',Wd/2-1,-rh-5,3,5);R('#e8dcff',Wd/2,-rh-5,1,2);
  cx.globalAlpha=.15+.1*Math.sin(fr*.08);R('#c9a8ff',Wd/2-5,-rh-9,11,12);cx.globalAlpha=iAlpha;
  R('#5d626b',Wd-12,-rh+1,4,7);R('#454a53',Wd-13,-rh,6,2);
  cx.globalAlpha=iAlpha*.4;R('#c9a8ff',Wd-11+((fr>>4)%3),-rh-4-((fr>>3)%6),3,2);cx.globalAlpha=iAlpha;
  /* cửa vòm tối, cửa sổ tím */
  R('#1b1030',dl,Hd-11,8,11);R('#4a2a7a',dl+1,Hd-10,6,10);R('#1b1030',dl+2,Hd-12,4,1);R('#ffd23f',dl+3,Hd-8,2,1);R('#ffd23f',dl+5,Hd-5,1,1);
  [9,Wd-17].forEach(wx=>{R('#4a3a7a',wx,Hd-19,8,8);R('#c9a8ff',wx+1,Hd-18,6,6);R('#fff',wx+1,Hd-18,1,1);R('#4a3a7a',wx+3,Hd-18,1,6);R('#4a3a7a',wx+1,Hd-15,6,1)});
  /* chuông gió, bó thảo dược, ớt khô */
  const sw=Math.round(Math.sin(fr*.06));
  R('#8a7fa8',dl-9,8,7,1);R('#cfd6e8',dl-8+sw,9,1,5);R('#cfd6e8',dl-6+sw,9,1,7);R('#cfd6e8',dl-4+sw,9,1,4);
  R('#6a9a3a',dl+11,9,3,5);R('#a8c860',dl+11,9,1,2);R('#c0392b',dl+16,9,1,4);R('#c0392b',dl+18,9,1,3)}
const _clouds=clouds;clouds=function(){_clouds();
  if(!SH||iAlpha<=0)return;
  const X=SH.x*T,Y=SH.y*T;
  if(X+SH.w*T+20<camX||X-30>camX+CW||Y+SH.h*T+30<camY||Y-40>camY+CH)return;
  cx.globalAlpha=iAlpha;drawShrine();cx.globalAlpha=1};
const _glow=glow;glow=function(){_glow();
  if(!SH||iAlpha<=0)return;const nk=nightK();if(nk<=0)return;
  cx.save();cx.globalCompositeOperation='lighter';const fl=.85+.15*Math.sin(frame*.1);
  const L=(c,x,y,w,h)=>{cx.fillStyle=c;cx.globalAlpha=.13*nk;cx.fillRect(x-4,y-4,w+8,h+8);cx.globalAlpha=.8*nk*fl;cx.fillRect(x,y,w,h)};
  const X=SH.x*T,Y=SH.y*T,Hd=SH.h*T;
  L('#b894ff',X+10,Y+Hd-18,6,6);L('#b894ff',X+SH.w*T-16,Y+Hd-18,6,6);L('#c9a8ff',X+SH.w*T/2-1,Y-18,3,5);
  cx.restore();cx.globalAlpha=1};

/* ---------- Vẽ bên trong nhà (thảm trận pháp, quả cầu pha lê, nồi thuốc nằm dưới người) ---------- */
const _drawIn=drawIn;drawIn=function(){
  if(curF!==20)return _drawIn();
  const I=ins;ins=I.filter(p=>p.fl!==20);
  try{_drawIn()}finally{ins=I}
  const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(a,b,w,h)},fr=frame;
  const X0=Math.round(35.5*T),Y0=Math.round(26.2*T),rx=28,ry=17;
  [[1,'#2a1a4a'],[.88,'#5a3a95'],[.8,'#3a2468'],[.55,'#6a48a8'],[.45,'#3a2468']].forEach(([k,c])=>{
    const a=Math.round(rx*k),b=Math.round(ry*k);for(let j=-b;j<=b;j++){const w=Math.round(a*Math.sqrt(1-(j/b)*(j/b)));R(c,X0-w,Y0+j,w*2,1)}});
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;R('#ffd23f',Math.round(X0+Math.cos(a)*16)-1,Math.round(Y0+Math.sin(a)*9)-1,2,2)}
  R('#ffd23f',X0-1,Y0-1,3,3);R('#fff6c0',X0,Y0,1,1);
  /* quả cầu pha lê + nến trên bàn */
  R('#3a2410',285,176,6,2);R('#b8a0ff',285,170,6,6);R('#e8dcff',286,171,2,2);
  cx.globalAlpha=.18+.1*Math.sin(fr*.08);R('#c9a8ff',280,166,16,14);cx.globalAlpha=1;
  [[281,174],[293,174]].forEach(([a,b],i)=>{R('#f4f4f6',a,b,2,4);R(((fr>>3)+i)%2?'#ffd23f':'#ff8a3d',a,b-2,2,2)});
  /* nồi thuốc sủi bọt */
  R('rgba(0,0,0,.3)',241,207,14,2);R('#ff5a1f',244,206,3,2);R('#ffd23f',250,206,2,2);
  R('#1b1b22',242,199,12,8);R('#2e2e38',241,198,14,2);R('#5ad17a',243,198,10,1);
  if((fr>>3)%2)R('#a8f0b8',245,196,1,2);else R('#a8f0b8',250,197,1,1);
  /* bó thảo dược treo trên tường phía bắc */
  [31,33,38,40].forEach((x,i)=>{R('#6a9a3a',x*T+1,19*T+1,3,5);R(i%2?'#b07cff':'#c0392b',x*T+4,19*T+1,1,4)});
  I.filter(p=>p.fl===20).sort((a,b)=>a.y-b.y).forEach(person);
  /* đốm sáng huyền bí bay lơ lửng */
  for(let i=0;i<10;i++){const x=30*T+((i*53+fr*.3*(1+i%3*.3))%(12*T)),y=28*T-((fr*.25+i*37)%(9*T));cx.globalAlpha=.6;R('#d9c2ff',Math.round(x),Math.round(y),1,1)}
  cx.globalAlpha=1};

/* tạo lại thế giới một lần để bản đồ đầu tiên đã có nhà pháp sư */
reset();
})();