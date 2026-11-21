/* ===== Sentinel.js: ĐẢO BAY PHỤ + CỔNG KHÓA + ANGEL SENTINEL + CHÌA KHÓA THIÊN GIỚI =====
   Nạp SAU Abyss.js (đặt cuối cùng). Cần thêm 1 dòng vào Abyss.js (xem hướng dẫn):  window.ABYSS=()=>AB;
   - Thêm 8 đảo bay nhiều kích cỡ ở phía đông Vực sâu: có đảo nối xích (vào đảo khác / vách đá), có đảo tự do.
   - Mọi đảo bay (cũ + mới) đổi sang màu xanh ngọc giống hang phía đông.
   - Đầu cầu lên khu hái hoa có cổng rào bị khóa. Angel Sentinel đứng cạnh canh cổng (bấm E để nói chuyện).
   - Chìa khóa Thiên giới nằm trên bệ đá ở phía đông hang. Có chìa khóa -> nói chuyện với Sentinel để mở cổng. */
(()=>{
if(typeof allPl!=='function'||typeof window.ABYSS!=='function'||typeof drawIn!=='function'){console.warn('Sentinel.js: hãy nạp SAU Abyss.js và thêm window.ABYSS=()=>AB; vào Abyss.js');return}

const WID=21,WALL=62,AW=300,AH=170,INVKEY='deadisland:inv1',OKEY='deadisland:sentgate';
const AB=()=>window.ABYSS();
let GA=null,AG=null,KA=null,OPEN=false,PT=[],PEND=[],GN=0;
try{OPEN=localStorage.getItem(OKEY)==='1'}catch(_){}
const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h))};
const curP=()=>allPl().find(p=>p.pl===sel&&p.fl===WID);
const bagOf=n=>{try{const I=JSON.parse(localStorage.getItem(INVKEY))||{};return Array.isArray(I[n])?I[n]:[]}catch(_){return[]}};
const has=n=>bagOf(n).includes('sentkey');
function ensure(){const I=window.ITEMS;if(I&&!I.sentkey)I.sentkey={icon:'🔑',name:'Chìa khóa Thiên giới',d:'Chìa khóa vàng khắc hình cánh chim, mở cổng lên Vườn Hoa Treo.'}}
ensure();addEventListener('load',ensure);

/* ---------- Đổi màu đất đảo bay cũ sang xanh ngọc (chỉ khi đang ở Vực sâu) ---------- */
const MAP={'#3f8c52':'#1f5f7e','#37804a':'#1a5472','#62c273':'#46e0d0','#27613a':'#12405a','#7fd890':'#7cf3e6','#2a6a40':'#123f5a',
  '#6b5a3e':'#2a5a7a','#3a2f22':'#0d2438','#6a6478':'#3f7fa0','#4a4658':'#2a5a7a','#2c2838':'#143048'};
const FS=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'fillStyle');
Object.defineProperty(cx,'fillStyle',{configurable:true,get(){return FS.get.call(cx)},
  set(v){FS.set.call(cx,(inside&&curF===WID&&MAP[v])||v)}});

/* ---------- Dữ liệu đảo bay phụ (đơn vị ô). ch: nối xích tới {e: đảo cũ} / {n: đảo mới} / {x,y: vách đá} ---------- */
const ISL2=[
  {cx:276,cy:95, rx:5.5,ry:3,  h:14,amp:3,  sp:.021,ph:1,  ch:[{e:2}]},          /* lớn, xích vào đảo cũ số 3 */
  {cx:287,cy:112,rx:3,  ry:1.9,h:20,amp:3.5,sp:.03, ph:2,  ch:[]},               /* vừa, tự do */
  {cx:262,cy:119,rx:3.8,ry:2.3,h:10,amp:2.5,sp:.027,ph:3,  ch:[{n:0}]},          /* xích vào đảo lớn */
  {cx:279,cy:125,rx:1.8,ry:1.2,h:26,amp:4,  sp:.04, ph:4,  ch:[]},               /* nhỏ, tự do */
  {cx:250,cy:127,rx:4.6,ry:2.7,h:12,amp:2.6,sp:.024,ph:5,  ch:[{x:246,y:141}]},  /* lớn, xích xuống vách đá */
  {cx:226,cy:131,rx:3.2,ry:1.9,h:16,amp:3,  sp:.033,ph:6,  ch:[]},               /* vừa, tự do */
  {cx:211,cy:124,rx:2.2,ry:1.4,h:22,amp:3,  sp:.036,ph:.5, ch:[{n:5}]},          /* nhỏ, xích vào đảo vừa */
  {cx:285,cy:86, rx:1.6,ry:1.1,h:18,amp:3,  sp:.045,ph:1.7,ch:[]}];              /* rất nhỏ, tự do */
const off=I=>I.h+I.amp*Math.sin(frame*I.sp+I.ph);
const dep=I=>Math.round(I.rx*T*.8+8);
const tip=I=>[I.cx*T,I.cy*T-off(I)+I.ry*T*.5+dep(I)-2];
function pt(r){
  if(r.e!==undefined){const a=AB().ISL[r.e];return[a.cx*T,(a.cy+a.ry)*T-(a.h+a.amp*Math.sin(frame*a.sp+a.ph))+10]}
  if(r.n!==undefined)return tip(ISL2[r.n]);
  return[r.x*T,r.y*T]}
function chain(x0,y0,x1,y1,sag){
  const n=Math.max(2,Math.round(Math.hypot(x1-x0,y1-y0)/2.6));
  for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+sag*4*t*(1-t);
    if(i%2){R('#aab0ba',x-1,y,3,2);R('#6b7078',x-1,y+1,3,1)}else{R('#8a909a',x,y-1,2,3);R('#4a4f58',x+1,y-1,1,3)}}
  [[x0,y0],[x1,y1]].forEach(([x,y])=>{R('#aab0ba',x-2,y-1,4,4);R('#3a3a40',x-1,y,2,2)})}
function isle(I,i){
  const o=off(I),X=Math.round(I.cx*T),Y=Math.round(I.cy*T-o),rx=Math.round(I.rx*T),ry=Math.round(I.ry*T),D=dep(I);
  if(X+rx<camX-40||X-rx>camX+CW/IS+40||Y-ry>camY+CH/IS+20||Y+ry+D<camY-20)return;
  cx.globalAlpha=.1+.04*Math.sin(frame*.05+i);R('#46e0d0',X-rx-4,Y-ry-4,rx*2+8,ry*2+10);cx.globalAlpha=1;
  for(let d=0;d<D;d++){const k=d/D,w=Math.round(rx*Math.pow(1-k,.8));
    R(k<.25?'#3f7fa0':k<.6?'#2a5a7a':'#143048',X-w,Y+ry*.5+d,w*2,1);
    if(hs(d,i+9)%4===0)R('#143048',X-w+2,Y+ry*.5+d,2,1)}
  for(let j=-ry;j<=ry;j++){const w=Math.round(rx*Math.sqrt(1-(j*j)/(ry*ry+.01)));
    R(j<-ry+1?'#7cf3e6':j<0?((j&1)?'#1f5f7e':'#1a5472'):'#12405a',X-w,Y+j,w*2,1)}
  for(let q=0;q<Math.max(2,rx>>2);q++){
    const x=X+((hs(q,i)%100)/100-.5)*rx*1.5,y=Y+((hs(q,i+3)%100)/100-.5)*ry*1.1;
    cx.globalAlpha=.6+.4*Math.sin(frame*.1+q);R('#46e0d0',x,y,1,2);R('#7cf3e6',x,y-1,1,1);cx.globalAlpha=1}
  const cxx=X+Math.round(rx*.3),cyy=Y-Math.round(ry*.2);
  if(i%2===0){[[0,9,3],[-3,6,2],[3,5,2]].forEach(([dx,h,w])=>{for(let j=0;j<h;j++)R('#2fb8f0',cxx+dx-(w>>1),cyy-j,w,1);R('#9ae8ff',cxx+dx-(w>>1),cyy-h+3,1,h-4)})}
  else{R('#e8d8f0',cxx,cyy-2,1,3);R('#c070d8',cxx-2,cyy-4,5,2);R('#e8a0ff',cxx-1,cyy-5,3,1)}}
function decor(){
  const A=AB();if(!A||!A.ISL)return;
  ISL2.forEach(I=>I.ch.forEach(r=>{const a=tip(I),b=pt(r);chain(a[0],a[1],b[0],b[1],10)}));
  ISL2.forEach(isle)}

/* ---------- Dựng thế giới: mở rộng vực, đặt cổng / Sentinel / bệ chìa khóa ---------- */
const okT=(A,x,y)=>y>2&&x>2&&y<AH-3&&x<AW-3&&A.im[y][x]===0&&!A.ob[y][x]&&!A.wat[y][x]&&!A.vd[y][x]&&!A.mt.has(y*AW+x);
function nearFloor(A,tx,ty,r){
  for(let d=0;d<=r;d++)for(let j=-d;j<=d;j++)for(let i=-d;i<=d;i++){
    if(Math.max(Math.abs(i),Math.abs(j))!==d)continue;
    let ok=1;for(let b=-1;b<=1&&ok;b++)for(let a=-1;a<=1;a++)if(!okT(A,tx+i+a,ty+j+b)){ok=0;break}
    if(ok)return[tx+i,ty+j]}
  return[tx,ty]}
function gateT(shut){
  const A=AB();if(!A||!GA)return;
  [211,212].forEach(x=>{A.im[GA.y][x]=shut?WALL:0;A.ob[GA.y][x]=shut?1:0})}
function setup(){
  const A=AB();if(!A||!A.mt||!A.vd||A.sent)return;A.sent=1;
  /* khoét thêm vực ở phía đông / nam hang xanh ngọc (chỉ khoét vào đá, không đụng sàn) */
  [[273,106,22,24],[240,128,30,14]].forEach(([a0,b0,rx,ry])=>{
    for(let y=Math.floor(b0-ry)-1;y<=b0+ry+1;y++)for(let x=Math.floor(a0-rx)-1;x<=a0+rx+1;x++){
      if(x<3||y<3||x>=AW-3||y>=AH-3||Math.hypot((x+.5-a0)/rx,(y+.5-b0)/ry)>=1)continue;
      if(A.im[y][x]===WALL&&!A.ob[y][x]&&!A.wat[y][x]&&!A.vd[y][x])A.vd[y][x]=1}});
  let gy=0;for(let y=90;y<114;y++){const q=A.mt.get(y*AW+211);if(q&&q.k==='b'){gy=y;break}}
  if(!gy){GA=null;return}
  GA={x:211,y:gy};
  const s=nearFloor(A,208,gy-2,6);AG={x:s[0]*T+4,y:s[1]*T+6};A.im[s[1]][s[0]]=WALL;A.ob[s[1]][s[0]]=1;
  const k=nearFloor(A,262,90,10);KA={x:k[0]*T+4,y:k[1]*T+7};A.im[k[1]][k[0]]=WALL;A.ob[k[1]][k[0]]=1;
  gateT(!OPEN)}
const _gen=gen;gen=function(sd){_gen(sd);setup()};
const _mk=mkPeople;mkPeople=function(){_mk();OPEN=false;try{localStorage.removeItem(OKEY)}catch(_){}gateT(true);PT=[];if(TK&&TK.ang)closeTalk()};
setup();

/* ---------- Hạt sáng ---------- */
function burst(x,y,n){for(let i=0;i<n;i++)PT.push({x:x+rnd(9)-4,y:y+rnd(9)-4,vx:(Math.random()-.5)*1.2,vy:-(.3+Math.random()*1.1),l:30+rnd(30),c:['#ffd23f','#fff3a0','#46e0d0','#ffffff'][rnd(4)]})}
function openGate(){
  OPEN=true;try{localStorage.setItem(OKEY,'1')}catch(_){}
  gateT(false);burst(GA.x*T+8,GA.y*T-6,40);shake=Math.max(shake,6);
  cap('Ổ khóa tan thành ánh sáng vàng, cổng lên Vườn Hoa Treo đã mở.')}
function takeKey(n){
  ensure();
  if(has(n)){cap('P'+n+' đã mang Chìa khóa Thiên giới rồi.');return}
  if(typeof window.giveItem!=='function'){cap('Cần nạp Playerkit.js để nhận đồ vào túi.');return}
  if(window.giveItem(n,'sentkey'))burst(KA.x,KA.y-14,24)}

/* ---------- Khoảng cách tương tác ---------- */
const nearAng=P=>AG&&Math.hypot(P.x-AG.x,P.y-(AG.y-4))<36;
const nearGate=P=>GA&&Math.hypot(P.x-(GA.x*T+8),P.y-(GA.y*T+4))<26;
const nearKey=P=>false;

/* ---------- Hội thoại ---------- */
function node(k,n){
  const ASK={t:'Ngài là ai?',go:2};
  if(k===0)return OPEN?{t:'Cổng đã mở. Hãy bước nhẹ thôi, những bông hoa treo rất mong manh.',o:[{t:'Cảm ơn ngài',end:1},ASK]}
    :{t:'Dừng bước, kẻ hạ giới! Phía sau cánh cổng này là Vườn Hoa Treo. Không có Chìa khóa Thiên giới, không ai được phép đi qua.',o:[{t:'Tôi muốn lên khu hái hoa',go:1},ASK,{t:'Tôi sẽ quay lại',end:1}]};
  if(k===1)return has(n)?{t:'Ta thấy ánh vàng của chìa khóa trong túi ngươi. Ngươi muốn dùng nó để mở cổng chứ?',o:[{t:'Dùng chìa khóa mở cổng',act:1},{t:'Chưa',end:1}]}
    :{t:'Ngươi chưa có chìa khóa. Nó nằm trên bệ đá ở tận cùng phía đông của hang. Hãy mang nó tới đây, ta sẽ mở cổng.',o:[{t:'Tôi hiểu rồi',end:1},ASK]};
  if(k===2)return{t:'Ta là Angel Sentinel, người canh giữ lối lên những hòn đảo treo trên Vực sâu. Mỗi chiếc lông của ta là một con mắt, không kẻ nào qua mặt được ta.',o:[{t:'Quay lại',go:0}]};
  return{t:'Chìa khóa thật. Cổng đã mở và sẽ không đóng lại nữa. Đừng làm hỏng những bông hoa.',o:[{t:'Cảm ơn ngài',end:1}]}}
function aRender(){
  const n=node(TK.node,TK.P.pl),o=$('dO');
  $('dlg').hidden=false;$('dN').textContent='Angel Sentinel (nói với P'+TK.P.pl+')';$('dT').textContent=n.t;o.innerHTML='';
  n.o.forEach((a,i)=>{const b=document.createElement('button');b.className='btn';b.textContent=(i+1)+'. '+a.t;b.onclick=()=>aPick(a);o.append(b)});
  o.firstChild.focus()}
function aPick(a){
  if(!TK||!TK.ang)return;
  if(a.end){closeTalk();return}
  if(a.act){if(!has(TK.P.pl)){closeTalk();return}openGate();TK.node=3}else TK.node=a.go;
  aRender()}
function aOpen(P){TK={P,ang:1,node:0};$('tk').hidden=true;aRender()}
const _close=closeTalk;closeTalk=function(){if(TK&&TK.ang){TK=null;$('dlg').hidden=true;return}_close()};
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.repeat||e.key.toLowerCase()!=='e'||e.ctrlKey||e.metaKey||e.altKey)return;
  if(state!=='island'||TK||trans)return;
  const iv=$('inv');if(iv&&!iv.hidden)return;
  const P=curP();if(!P||!AG)return;
  if(nearKey(P))takeKey(P.pl);else if(nearAng(P)||nearGate(P))aOpen(P)});
const _tk=tkUI;tkUI=function(){
  _tk();const e=$('tk'),P=curP();
  if(!e||!P||state!=='island'||TK||trans||!AG)return;
  if(nearKey(P)){e.innerHTML='Bấm <b>E</b> để lấy Chìa khóa Thiên giới';e.hidden=false}
  else if(nearAng(P)||nearGate(P)){e.innerHTML='Bấm <b>E</b> để nói chuyện với Angel Sentinel';e.hidden=false}};

/* ---------- Vẽ: cổng, Sentinel, bệ chìa khóa ---------- */
function lab(x,y,t,col){
  cx.save();cx.textAlign='center';cx.font='bold 6px monospace';
  const w=Math.ceil(cx.measureText(t).width)+6,bx=Math.round(x-w/2),by=Math.round(y);
  cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(bx,by,w,9);cx.fillStyle=col;cx.fillRect(bx,by+9,w,1);
  cx.fillStyle='#fff';cx.fillText(t,Math.round(x),by+7);cx.restore()}
function drawGate(){
  const X=GA.x*T,Y=GA.y*T+8,W2=2*T,cX=X+W2/2,f=frame;
  R('rgba(0,0,0,.3)',X-6,Y-2,W2+12,3);
  if(!OPEN){
    for(let i=0;i<W2;i+=2)R(i%4?'#e8d8a0':'#ffd23f',X+i,Y-26,1,24);
    R('#c9a03a',X,Y-14,W2,1);R('#8a6a1f',cX,Y-26,1,24);
    cx.globalAlpha=.28+.22*Math.sin(f*.1);R('#ffe9a8',cX-8,Y-22,16,14);cx.globalAlpha=1;
    R('#d6dbe3',cX-2,Y-19,4,1);R('#d6dbe3',cX-2,Y-18,1,3);R('#d6dbe3',cX+1,Y-18,1,3);R('#ffd23f',cX-3,Y-15,6,5);R('#8a6a1f',cX,Y-13,1,2)}
  else{[X-1,X+W2].forEach(x=>{R('#e8d8a0',x,Y-26,1,24);R('#ffd23f',x,Y-26,1,2)})}
  [X-5,X+W2+1].forEach(px=>{
    R('#8190b8',px,Y-30,4,30);R('#cfd8ea',px,Y-30,3,30);R('#59658a',px+3,Y-30,1,30);
    R('#ffd23f',px-1,Y-33,6,3);R('#ffffff',px-3,Y-37,2,4);R('#ffffff',px+1,Y-38,2,5);R('#ffffff',px+5,Y-37,2,4);
    cx.globalAlpha=.2+.1*Math.sin(f*.08);R('#46e0d0',px-4,Y-42,12,10);cx.globalAlpha=1});
  R('#cfd8ea',X-5,Y-30,W2+10,3);R('#ffd23f',X-5,Y-31,W2+10,1)}
function drawAngel(){
  const A=AG,X=Math.round(A.x),by=Math.round(A.y+Math.sin(frame*.05)*2),f=frame,SY=by-34;
  if(X<camX-60||X>camX+CW/IS+60||by<camY-20||by>camY+CH/IS+90)return;
  cx.globalAlpha=.16+.06*Math.sin(f*.07);R('#bfefff',X-34,by-62,68,60);R('#bfefff',X-24,by-72,48,80);cx.globalAlpha=1;
  [[-9,-1,18,5],[-6,2,12,4],[-4,5,8,3]].forEach(([a,b,w,h])=>R('#d9dde4',X+a,by+b,w,h));
  const FT=[];
  for(let pass=0;pass<2;pass++)for(const s of[-1,1])for(let k=0;k<8;k++){
    const ang=-Math.PI/2+s*(.22+k*.26)+Math.sin(f*.04+k)*.03,L=34-k*1.6+(k%2?3:0);
    for(let r=5;r<=L;r+=1.5){const w=Math.max(1,Math.round(4.2*(1-r/L)+1.2)),px=X+Math.cos(ang)*r,py=SY+Math.sin(ang)*r*.9;
      if(pass===0)R('#c8323c',px-w/2-1,py-w/2-1,w+2,w+2);else R(k%2?'#f6ead0':'#efdcb8',px-w/2,py-w/2,w,w)}
    if(pass&&k%2===1)FT.push([X+Math.cos(ang)*L*.62,SY+Math.sin(ang)*L*.62*.9,k+s*5])}
  FT.forEach(([x,y,q])=>{R('#b98b78',x-3,y-2,6,4);
    if(((f+q*37)%260)<7)R('#d9b8a6',x-2,y-1,4,2);else{R('#f6f1ea',x-2,y-1,4,2);R('#2f9bd6',x-1,y-1,2,2);R('#0b1f33',x,y,1,1)}});
  for(let j=0;j<17;j++){const w=Math.round(7-j*.28);for(let i=-w;i<w;i+=2)R(((i>>1)&1)?'#e7791e':'#171210',X+i,SY+4+j,2,1)}
  R('#ffd23f',X-7,SY+4,14,1);R('#ffd23f',X-5,SY+20,10,1);
  R('#e0a526',X-3,SY-6,6,10);R('#f4c542',X-3,SY-6,2,10);
  R('#f0c040',X-2,SY-12,4,5);R('#2a1a08',X-1,SY-10,1,1);R('#2a1a08',X+1,SY-10,1,1);
  for(let i=0;i<10;i++){R('#e0a526',X-3-i,SY-3+i*.6,1,2);R('#e0a526',X+3+i,SY-4-i,1,2)}
  R('#f0c040',X-13,SY+3,2,2);R('#f0c040',X+13,SY-14,2,2);
  const hr=f*.03;
  for(let a=0;a<6.28;a+=.45)R('#ffd23f',X+Math.cos(a)*8,SY-18+Math.sin(a)*3.5,2,1);
  for(let a=0;a<6.28;a+=1.57)R('#37e8d8',X+Math.cos(a+hr)*8-1,SY-18+Math.sin(a+hr)*3.5-1,3,3);
  lab(X,by-84,'Angel Sentinel','#ffd23f');
  const P=curP();
  if(P&&!TK&&(nearAng(P)||nearGate(P))){const b=(f>>4)&1,y0=by-96+b;R('#000',X-4,y0-1,9,1);for(let i=0;i<4;i++){const w=7-2*i;R('#000',X-(w>>1)-1,y0+i,w+2,1);R('#ffd23f',X-(w>>1),y0+i,w,1)}}}
function drawAltar(){
  const x=KA.x,y=KA.y,f=frame,P=curP(),got=has(sel);
  R('rgba(0,0,0,.3)',x-8,y+1,16,3);R('#59658a',x-6,y-6,12,7);R('#8190b8',x-6,y-6,12,2);R('#262e48',x-6,y,12,1);
  cx.globalAlpha=.4+.3*Math.sin(f*.08);R('#46e0d0',x-4,y-7,8,1);cx.globalAlpha=1;
  if(!got){const b=Math.round(Math.sin(f*.08)*2);
    cx.globalAlpha=.25+.12*Math.sin(f*.1);R('#ffe9a8',x-9,y-26+b,18,18);cx.globalAlpha=1;
    R('#ffd23f',x-1,y-17+b,2,8);R('#ffd23f',x-3,y-21+b,6,5);R('#0d1436',x-1,y-20+b,2,3);R('#ffd23f',x+1,y-11+b,3,1);R('#ffd23f',x+1,y-13+b,2,1);
    if((f>>3)%5===0)R('#fff',x+2,y-21+b,1,1)}
  if(P&&nearKey(P)&&!TK)lab(x,y-32,got?'Đã có chìa khóa':'E: Lấy chìa khóa',got?'#aaa':'#ffd23f')}

/* ---------- Móc vào vòng vẽ ---------- */
const _pp=person;person=function(p){
  if(PEND.length&&p.fl===WID)while(PEND.length&&PEND[0].y<=p.y)PEND.shift().d();
  _pp(p)};
/* Bù độ cao đảo bay cho đồ cầm tay / đỡ đòn / vung vũ khí (code gốc vẽ theo y mặt đất).
   Chỉ trong lúc vẽ Vực sâu, allPl() trả về bản sao có y đã trừ độ cao đảo; logic game không bị ảnh hưởng. */
const isl=i=>{const I=AB().ISL[i];return I.h+I.amp*Math.sin(frame*I.sp+I.ph)};
function offAt(tx,ty){
  const q=AB().mt.get(ty*AW+tx);if(!q)return 0;
  if(q.k==='i')return isl(q.i);
  const a=q.a<0?0:isl(q.a),b=isl(q.b);
  return a+(b-a)*q.t+Math.sin(Math.PI*q.t)*1.5*Math.sin(frame*.06+tx*.5)}
let DRAWING=0;
const _ap=allPl;allPl=function(){
  const L=_ap();if(!DRAWING)return L;
  return L.map(p=>{
    if(p.fl!==WID)return p;
    const o=offAt(Math.floor(p.x/T),Math.floor(p.y/T));if(!o)return p;
    const q=Object.create(p);Object.defineProperty(q,'y',{value:p.y-o});return q})};
const _di=drawIn;drawIn=function(){
  if(curF!==WID||!GA||!AG||!KA)return _di();
  PEND=[{y:GA.y*T+8,d:drawGate},{y:AG.y,d:drawAngel},{y:KA.y,d:drawAltar}].sort((a,b)=>a.y-b.y);
  DRAWING=1;try{_di()}finally{DRAWING=0}
  while(PEND.length)PEND.shift().d();
  decor();
  PT.forEach(q=>{cx.globalAlpha=Math.max(0,Math.min(1,q.l/20));R(q.c,q.x,q.y,2,2)});cx.globalAlpha=1};
const _st=step;step=function(){
  _st();if(state!=='island')return;
  PT.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.vy-=.01;q.l--});PT=PT.filter(q=>q.l>0);
  const P=curP(),n=!!(P&&GA&&!OPEN&&nearGate(P));
  if(n&&!GN)cap('Cổng bị khóa chặt, một thiên thần khổng lồ đang canh giữ bên cạnh. Bấm E để nói chuyện.');
  GN=n?1:0};
})();