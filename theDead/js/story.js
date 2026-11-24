/* ===== coldroom.js: TỦ ĐÔNG LỚN Ở KHO LẠNH + TỜ GIẤY + XÀ BENG + TỜ BÁO CŨ (TẦNG HẦM DANOVA) =====
   Nạp SAU dream.js và TRƯỚC G1.js:
     <script src="../js/dream.js"></script>
     <script src="../js/coldroom.js"></script>
     <script src="../js/G1.js"></script>
   (phải nạp trước G1.js để phím E của file này được xử lý trước phím E của G1)
   Không cần sửa file cũ. Hoạt động ở cả giấc mơ (nhìn từ trên) lẫn thế giới kí ức (góc nhìn thứ nhất).

   - Tủ đông lớn (walk-in) trong kho lạnh, cửa quay ra phía đông (về phía lối vào kho lạnh).
     Bên trong có kệ thực phẩm, hoa quả. Cửa đang bị đóng băng.
   - Cạnh cửa có tờ giấy + mũi tên đỏ chỉ vào. Lại gần bấm E để đọc.
   - Xà beng nằm ở góc đông-bắc kho tài liệu, tờ báo cũ nằm ngay cạnh. Bấm E để nhặt.
   - Có xà beng trong túi: bấm E ở cửa tủ đông chọn "Dùng xà beng cạy cửa". Cửa mở, xà beng gãy (mất).
   - Tờ báo: nhặt vào túi, hiện to giữa màn hình, chữ mờ nhòe trừ tiêu đề ở giữa. Trong túi đồ có nút "Đọc". */
(()=>{
const need=['putIn','allPl','step','gen','mkPeople','cap','hs','rnd','ri'];
const miss=need.filter(n=>{try{return new Function('return typeof '+n)()==='undefined'}catch(_){return true}});
if(miss.length||!window.yachtDream||!window.ITEMS||typeof window.giveItem!=='function'||typeof window.takeItem!=='function'){
  console.warn('coldroom.js: hãy nạp SAU dream.js, TRƯỚC G1.js'+(miss.length?' (thiếu '+miss.join(', ')+')':''));return}

const YT=window.yachtDream,ITEMS=window.ITEMS;
const F0=27,FM=32,BI=4,DX0=14,DY0=12,WALL=62;
const AX=l=>DX0+l,AY=l=>DY0+l;
const inB=f=>f===F0+BI||f===FM+BI;

/* ---------- Cấu hình (tọa độ cục bộ trên tầng hầm; chỉnh ở đây) ---------- */
const CAB={x0:38,x1:44,y0:22,y1:27};          /* khối tủ đông: 7 x 6 ô, bên trong 5 x 4 */
const DOOR=[[44,24],[44,25]];                  /* cánh cửa (2 ô) ở tường phía đông */
const NOTE=[44,23];                            /* ô tường có dán tờ giấy */
const CROW=[56,1];                             /* xà beng: góc đông-bắc kho tài liệu */
const NEWS=[55,1];                             /* tờ báo cũ: ngay cạnh xà beng */
const PRY_T=2.2;                               /* thời gian cạy cửa (giây) */
const NEWS_IMG='';                             /* nếu có ảnh tờ báo thật, ví dụ '../img/tinmoi.jpg' thì điền vào đây */
const NOTE_TXT='Cửa tủ đông bị đóng băng rồi, nhưng tôi không nhớ ***** đã để chiếc xà beng cậy mở tủ đông ở đâu trong tầng hầm...';
const NEWS_HEAD='Du khách nữ mất tích trên du thuyền Danova cách đây 13 năm vẫn chưa được tìm thấy';
const NEWS_SUB='Các du khách trên thuyền cho hay, trước khi mất tích có thấy cô đi cùng một nhóm ***** lên thuyền và xích mích.';

const INV='deadisland:inv1',KEY='deadisland:coldroom';
const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(a),Math.round(b),w,h)};
const mkc=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const warned={};const oops=(n,e)=>{if(!warned[n]){warned[n]=1;console.error('[coldroom] lỗi trong '+n+':',e)}};
const bagOf=n=>{try{const I=JSON.parse(localStorage.getItem(INV))||{};return Array.isArray(I[n])?I[n]:[]}catch(_){return[]}};
const hasCrow=n=>bagOf(n).includes('crowbar');
const curP=()=>state==='island'?(ins.find(p=>p.pl===sel&&inB(p.fl))||null):null;
const ipos=a=>[(AX(a[0])+.5)*T,(AY(a[1])+.5)*T];

/* ---------- Vật phẩm ---------- */
ITEMS.crowbar={icon:'🔧',name:'Xà beng',d:'Thanh sắt đen cong, đầu dẹt. Có lẽ dùng cạy được cửa tủ đông ở kho lạnh. Chỉ dùng được một lần (sẽ gãy).'};
ITEMS.tinmoi={icon:'📰',name:'Tờ báo cũ',d:'Tờ báo Tin Mới đã ố vàng, chữ nhòe gần hết. Chọn ô này rồi bấm "Đọc".'};

/* ---------- Trạng thái ---------- */
let S={seed:0,open:0,crow:0,news:{}},PR=null,RD=null;
function load(){try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&o.seed===seed){S=o;if(!S.news)S.news={};return}}catch(_){}S={seed,open:0,crow:0,news:{}}}
function save(){S.seed=seed;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(_){}}
load();

/* ---------- Tiện ích màu cho góc nhìn thứ nhất ---------- */
const HC=new Map();
function rgb(h){let v=HC.get(h);if(!v){v=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];HC.set(h,v)}return v}
function shade(c,s){const v=rgb(c);return 'rgb('+(v[0]*s|0)+','+(v[1]*s|0)+','+(v[2]*s|0)+')'}
const FC=['#c0392b','#e8a030','#58c25e','#4a90e0','#e8c0c0','#9ad0e8','#f2d36b','#b06ad0','#e07a3a','#7bd88f'];
let _pf=-1,_pp=null;
function P4(){if(_pf!==frame){_pf=frame;_pp=ins.find(p=>p.pl===sel&&p.fl===FM+BI)||null}return _pp}
function isIn(P){if(!P)return false;const lx=P.x/T-DX0,ly=P.y/T-DY0;return lx>=CAB.x0&&lx<CAB.x1+1&&ly>=CAB.y0&&ly<CAB.y1+1}

/* ================= DỰNG TỦ ĐÔNG TRÊN TẦNG HẦM ================= */
function ensure(){
  if(!window.BSM)return false;
  const Y=YT.floors(),f=Y&&Y[BI];
  if(!f||!f.zone)return false;
  hookBSM();
  if(f.cold)return true;
  /* dọn các đồ cũ nằm trong khu vực đặt tủ (và phía trước cửa) */
  const rx0=CAB.x0,rx1=CAB.x1+2,ry0=CAB.y0,ry1=CAB.y1+1;
  f.O=f.O.filter(o=>{
    const lx=o.x-DX0,ly=o.y-DY0;
    if(lx<=rx1&&lx+o.w-1>=rx0&&ly<=ry1&&ly+o.h-1>=ry0){
      for(let j=0;j<o.h;j++)for(let i=0;i<o.w;i++){f.im[o.y+j][o.x+i]=0;f.rid[o.y+j][o.x+i]=1}
      return false}
    return true});
  const CT=new Map();
  const set=(lx,ly,k,wall)=>{const x=AX(lx),y=AY(ly);f.kd[y][x]=k;if(wall){f.im[y][x]=WALL;f.rid[y][x]=0}else{f.im[y][x]=0;f.rid[y][x]=1}};
  for(let ly=CAB.y0;ly<=CAB.y1;ly++)for(let lx=CAB.x0;lx<=CAB.x1;lx++){
    const edge=lx===CAB.x0||lx===CAB.x1||ly===CAB.y0||ly===CAB.y1,key=AY(ly)*IW+AX(lx);
    if(edge){set(lx,ly,12,true);CT.set(key,'w')}else{set(lx,ly,4,false);CT.set(key,'i')}}
  DOOR.forEach(([lx,ly])=>CT.set(AY(ly)*IW+AX(lx),'d'));
  CT.set(AY(NOTE[1])*IW+AX(NOTE[0]),'n');
  f.cold={CT};
  f.DEC.push(()=>{try{draw2D(f)}catch(e){oops('draw2D',e)}});
  if(S.open)openDoor(f);
  return true}
function openDoor(f){
  DOOR.forEach(([lx,ly])=>{const x=AX(lx),y=AY(ly);f.kd[y][x]=4;f.im[y][x]=0;f.rid[y][x]=1;f.cold.CT.set(y*IW+x,'i')})}
function hookBSM(){
  if(BSM.__cold)return;BSM.__cold=1;
  const t0=BSM.tile,w0=BSM.wall;
  BSM.tile=function(f,x,y,k,h,px,py,Q,K){
    if(f&&f.cold){const t=f.cold.CT.get(y*IW+x);if(t&&t!=='i'){tile2D(f,x,y,t,h,px,py,Q,K);return true}}
    return t0(f,x,y,k,h,px,py,Q,K)};
  BSM.wall=function(g,h,x,fy,lh,s,Yf,cs){
    if(Yf&&Yf.cold){const t=Yf.cold.CT.get(h.my*IW+h.mx);if(t&&t!=='i'){wall3D(g,h,x,fy,lh,s,t,cs);return}}
    return w0(g,h,x,fy,lh,s,Yf,cs)}}

/* ================= VẼ NHÌN TỪ TRÊN XUỐNG (giấc mơ) ================= */
function strip(Q,o,x,y){
  const c=i=>FC[hs(x*7+i*3+o.charCodeAt(0),y*5+i)%FC.length];
  if(o==='S'){Q('#6f7e8a',0,5,T,3);for(let i=0;i<4;i++){Q(c(i),i*2,5,2,3);Q('rgba(255,255,255,.45)',i*2,5,2,1)}}
  else if(o==='N'){Q('#6f7e8a',0,0,T,3);for(let i=0;i<4;i++){Q(c(i),i*2,0,2,3);Q('rgba(255,255,255,.45)',i*2,0,2,1)}}
  else if(o==='E'){Q('#6f7e8a',5,0,3,T);for(let i=0;i<4;i++){Q(c(i),5,i*2,3,2);Q('rgba(255,255,255,.45)',5,i*2,1,2)}}
  else{Q('#6f7e8a',0,0,3,T);for(let i=0;i<4;i++){Q(c(i),0,i*2,3,2);Q('rgba(255,255,255,.45)',0,i*2,1,2)}}}
function tile2D(f,x,y,t,h,px,py,Q,K){
  const CT=f.cold.CT;
  if(t==='d'){
    Q('#8e9ca7',0,0,T,T);Q('#cfdbe2',0,0,T-1,T);Q('#eef6fa',0,0,T,1);
    const ih=2+(hs(x,y)%3);Q('#a9e2f4',0,0,T,ih+1);Q('#e8faff',0,0,T,1);
    for(let i=0;i<T;i+=2)Q('#bfeaf8',i,0,1,3+((hs(i+y*9,x)%3)));
    if(y===AY(DOOR[0][1])){Q('#2f4a78',5,5,2,3);Q('#9bb4d4',5,5,1,1)}
    if(PR){const p=Math.min(1,PR.t/PRY_T);Q('#17222c',1+(y&3),0,1,Math.round(T*p));Q('#17222c',5,T-Math.round(T*p),1,Math.round(T*p))}
    return}
  Q('#9aa6ae',0,0,T,T);Q('#e9eff2',0,0,T,T-1);Q('#ffffff',0,0,T,1);Q('#c2ccd3',0,T-1,T,1);
  if(((x+y)&1)===0)Q('rgba(150,170,185,.18)',0,0,T,T);
  if(CT.get((y+1)*IW+x)==='i')strip(Q,'S',x,y);
  if(CT.get((y-1)*IW+x)==='i')strip(Q,'N',x,y);
  if(CT.get(y*IW+x+1)==='i')strip(Q,'E',x,y);
  if(CT.get(y*IW+x-1)==='i')strip(Q,'W',x,y)}
let CRI=null,NWI=null;
function crowImg(){
  if(CRI)return CRI;
  const c=mkc(28,14),g=c.getContext('2d');
  const ln=(x0,y0,x1,y1,w,col)=>{g.fillStyle=col;const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));
    for(let i=0;i<=n;i++){g.fillRect(Math.round(x0+(x1-x0)*i/n-w/2),Math.round(y0+(y1-y0)*i/n-w/2),w,w)}};
  ln(7,11,25,2,2,'#1b1e23');ln(7,10,25,1,1,'#4a4f58');
  ln(7,11,4,10,2,'#1b1e23');ln(4,10,2,7,2,'#1b1e23');ln(2,7,1,5,2,'#1b1e23');
  g.fillStyle='#1b1e23';g.fillRect(0,4,1,2);g.fillRect(2,4,1,2);
  g.fillStyle='#e8a020';g.fillRect(14,5,3,3);g.fillStyle='#ffd070';g.fillRect(14,5,3,1);
  ln(24,2,27,1,2,'#8a909a');
  return CRI=c}
function newsSpr(){
  if(NWI)return NWI;
  const c=mkc(16,12),g=c.getContext('2d');
  g.fillStyle='#8a7c58';g.fillRect(0,0,16,12);g.fillStyle='#d9ceaa';g.fillRect(1,1,14,10);
  g.fillStyle='#3a3328';g.fillRect(2,2,12,3);g.fillStyle='#a89c78';
  for(let y=6;y<=10;y+=2){g.fillRect(2,y,5,1);g.fillRect(9,y,5,1)}
  g.fillStyle='#6a604a';g.fillRect(7,6,1,5);
  return NWI=c}
function draw2D(f){
  const vw=CW/IS,vh=CH/IS;
  const X0=AX(CAB.x0)*T,Y0=AY(CAB.y0)*T;
  if(X0+90>camX&&X0<camX+vw+30&&Y0+60>camY&&Y0<camY+vh+30){
    const nx=AX(NOTE[0]+1)*T,ny=AY(NOTE[1])*T,pu=.6+.4*Math.sin(frame*.15);
    R('#f4efd8',nx-1,ny+1,3,6);R('#cfc58a',nx-1,ny+1,3,1);R('#5a5a6a',nx,ny+3,1,1);R('#5a5a6a',nx,ny+5,1,1);
    cx.globalAlpha=.5+.5*pu;
    R('#e03030',nx+4,ny+1,1,6);R('#e03030',nx+5,ny+2,1,4);R('#e03030',nx+6,ny+3,1,2);   /* mũi tên chỉ vào tờ giấy */
    R('#e03030',nx+7,ny+3,5,2);cx.globalAlpha=1;
    const dx=AX(CAB.x1+1)*T,dy=AY(DOOR[0][1])*T;
    if(S.open){R('#a9b3bb',dx,dy,16,2);R('#f2f6f8',dx,dy,16,1);R('#2f4a78',dx+12,dy+1,2,1)}
    if(PR){for(let i=0;i<10;i++){const k=hs(i,frame>>1);R(i%2?'#e8faff':'#a9e2f4',dx+(k%12)-2,dy-4+((k>>4)%22),1+(k&1),1+(k&1))}}}
  cx.save();cx.imageSmoothingEnabled=false;
  if(!S.crow){const[x,y]=ipos(CROW);if(x>camX-20&&x<camX+vw+20&&y>camY-20&&y<camY+vh+20){
    R('rgba(0,0,0,.3)',x-8,y+3,16,2);cx.drawImage(crowImg(),Math.round(x-14),Math.round(y-8));
    if((frame>>4)%3===0)R('#ffffff',x+6,y-6,1,1)}}
  {const[x,y]=ipos(NEWS);if(x>camX-20&&x<camX+vw+20&&y>camY-20&&y<camY+vh+20){
    R('rgba(0,0,0,.3)',x-6,y+3,13,2);cx.drawImage(newsSpr(),Math.round(x-8),Math.round(y-6))}}
  cx.restore()}

/* ================= VẼ GÓC NHÌN THỨ NHẤT ================= */
function inner(F,fr,mx,my){
  F('#b9ccd6',0,1);F('#93a6b2',0,.05);F('#cfe3ec',.95,1);
  if(fr<.03||fr>.97){F('#7d8f9b',0,1);return}
  for(let L=0;L<4;L++){
    const y0=.07+L*.235;F('#8a9ca8',y0,y0+.025);
    const u=fr*6,k=Math.floor(u),fu=u-k,q=hs(mx*13+k,my*7+L*5)%10;
    if(q<8&&fu>.1&&fu<.9){
      const c=FC[q%FC.length],top=y0+.025+.12+.04*(q%3);
      F(c,y0+.025,top);F('#ffffff',top-.02,top,.5);
      if(q%2)F('#ffffff',y0+.06,y0+.075,.7);
      if(q%3===0&&fu>.3&&fu<.7)F(FC[(q+3)%FC.length],top,top+.05)}}
  if(hs(Math.floor(fr*30)+mx,my)%9===0)F('#ffffff',.2+(hs(my,Math.floor(fr*30))%60)/100,.22+(hs(my,Math.floor(fr*30))%60)/100,.7)}
const iceH=u=>.08+.3*(.5+.5*Math.sin(u*14))*.6+.18*((hs(Math.floor(u*40),7)%100)/100);
function wall3D(g,h,x,fy,lh,s,t,cs){
  h.occ=true;h.full=true;h.top=fy-lh;
  const F=(c,y0,y1,al)=>{if(y1<=y0)return;g.fillStyle=shade(c,s);if(al!==undefined)g.globalAlpha=al;
    g.fillRect(x,fy-lh*y1,cs,Math.max(1,lh*(y1-y0)));if(al!==undefined)g.globalAlpha=1};
  const P=P4(),fr=h.fr;
  if(isIn(P)){inner(F,fr,h.mx,h.my);return}
  if(t==='d'){
    const idx=h.my===AY(DOOR[0][1])?0:1,u=(idx+fr)/2;
    F('#cfd9df',0,1);F('#e6edf1',.02,.98);
    if(u<.04||u>.96)F('#8f9ca7',0,1);
    F('#9aa7b1',0,.05);F('#9aa7b1',.95,1);
    if(Math.abs(u-.5)<.01)F('#a9b6bf',.05,.95);
    if(u>.84&&u<.9){F('#2f4a78',.42,.6);F('#9bb4d4',.5,.52)}
    const ih=iceH(u);
    F('#bfe9f8',0,ih,.85);F('#ffffff',Math.max(0,ih-.03),ih,.8);
    F('#cfeefa',1-.14*((hs(Math.floor(u*30),3)%100)/100),1,.85);
    if(hs(Math.floor(u*50),9)%7===0)F('#ffffff',.5+(hs(Math.floor(u*50),2)%40)/100,.52+(hs(Math.floor(u*50),2)%40)/100,.8);
    if(PR){const p=Math.min(1,PR.t/PRY_T);
      [[.25,.18],[.5,.45],[.72,.28]].forEach(([cu,cy])=>{if(Math.abs(u-cu)<.012+.012*p)F('#17222c',cy,cy+.38*p)});
      if(((frame>>1)&1)&&Math.abs(u-.5)<.3)F('#ffffff',.1+.7*p,.12+.7*p,.7)}
    return}
  F('#dfe6ea',0,1);F('#eef3f6',.55,.93);F('#8c97a1',0,.06);F('#c3ccd3',.93,1);
  if(fr<.035||fr>.965)F('#a7b2bb',.06,.93);
  if(Math.abs(fr-.5)<.008)F('#b3bec6',.06,.93);
  if(fr<.12||fr>.88)F('#aab4bc',.9,1);
  F('#ffffff',.06,.12+.08*((hs(Math.floor(fr*20)+h.mx*31,h.my*17)%100)/100),.45);
  if(t==='n'&&h.side===0&&P&&P.x/T>h.mx){
    if(fr>.28&&fr<.72){
      F('#f3edd2',.46,.72);
      if(fr<.34||fr>.66)F('#cfc58a',.69,.72);
      for(let k=0;k<4;k++){const yy=.52+k*.045,w=.26+((hs(k,h.mx)%10)/10)*.14;
        if(fr>.32&&fr<.32+w)F('#5a5a6a',yy,yy+.012)}}
    const d=Math.abs(fr-.5),blink=.6+.4*Math.sin(frame*.15);
    if(d<.1)F('#e03030',.73+d*1.7,.9,blink);
    if(d<.035)F('#e03030',.9,.98,blink)}}

let GB=false;
function hookBills(){
  if(GB||!window.GMEM||typeof GMEM.bills!=='function'||GMEM.__cold)return;
  GMEM.__cold=1;GB=true;
  const b0=GMEM.bills;
  GMEM.bills=function(P,B){b0(P,B);try{bills(P,B)}catch(e){oops('bills',e)}}}
function bills(P,B){
  if(P.fl!==FM+BI)return;
  const add=(on,pos,img,w,h)=>{
    if(!on)return;const[x,y]=ipos(pos);
    if(Math.abs(x-P.x)>260||Math.abs(y-P.y)>260)return;
    B.push({x,y,img,wT:w,hT:h,pad:0,a:1})};
  add(!S.crow,CROW,crowImg(),.9,.45);
  add(true,NEWS,newsSpr(),.6,.45)}

/* ================= TỜ GIẤY + TỜ BÁO (hiện to giữa màn hình) ================= */
const sty=document.createElement('style');
sty.textContent='#cdRead{position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(0,0,8,.82);line-height:1.4;cursor:pointer}'+
 '#cdHint{position:absolute;left:50%;bottom:70px;transform:translateX(-50%);padding:6px 12px;background:rgba(0,0,0,.75);border:2px solid #ffd23f;color:#fff;font:600 13px monospace;z-index:20;pointer-events:none;white-space:nowrap;line-height:1.4}';
document.head.appendChild(sty);
const rd=document.createElement('div');rd.id='cdRead';rd.hidden=true;$('stage').appendChild(rd);
const hi=document.createElement('div');hi.id='cdHint';hi.hidden=true;$('stage').appendChild(hi);
function showRead(node){
  rd.innerHTML='';rd.appendChild(node);
  const f=document.createElement('div');f.textContent='Bấm E / Esc hoặc bấm vào màn hình để đóng';
  f.style.cssText='font:600 12px monospace;color:#cfd8e0';rd.appendChild(f);
  rd.hidden=false;RD=1;
  try{if(document.pointerLockElement)document.exitPointerLock()}catch(_){}
  for(const k in keys)keys[k]=0}
function closeRead(){RD=null;rd.hidden=true;rd.innerHTML=''}
rd.onclick=closeRead;
function openNote(){
  const d=document.createElement('div');
  d.style.cssText='background:linear-gradient(#f1e9cc,#e6dcb8);color:#2b2b3a;font:italic 700 18px/1.55 "Segoe Print","Bradley Hand","Comic Sans MS",cursive;padding:24px 22px;width:min(86%,380px);transform:rotate(-1.5deg);box-shadow:4px 6px 0 rgba(0,0,0,.5);border:1px solid #b9ad85';
  const p=document.createElement('p');p.style.margin='0';p.textContent=NOTE_TXT;d.appendChild(p);
  showRead(d)}
let NEWSC=null,NI=null;
if(NEWS_IMG){NI=new Image();NI.src=NEWS_IMG}
function wrapT(g,text,maxW){
  const words=text.split(' '),lines=[];let l='';
  words.forEach(w=>{const t=l?l+' '+w:w;if(g.measureText(t).width>maxW&&l){lines.push(l);l=w}else l=t});
  if(l)lines.push(l);return lines}
function newsCanvas(){
  const W=420,H=600,c=mkc(W,H),g=c.getContext('2d'),t=mkc(W,H),a=t.getContext('2d');
  g.fillStyle='#d6c9a4';g.fillRect(0,0,W,H);
  const real=NI&&NI.complete&&NI.naturalWidth;
  if(real)a.drawImage(NI,0,0,W,H);
  else{
    a.fillStyle='#1b1812';a.textAlign='center';a.font='bold 58px "Times New Roman",serif';a.fillText('TIN·MỚI',W/2,70);
    a.fillRect(14,82,W-28,3);a.font='bold 9px serif';a.fillText('JOURNAL QUOTIDIEN D’INFORMATION',W/2,98);a.fillRect(14,104,W-28,1);
    const colW=(W-28-16)/3;a.textAlign='left';
    for(let col=0;col<3;col++){
      const x=14+col*(colW+8);let y=118;
      while(y<H-20){
        const k=hs(col*50+((y/7)|0),9)%100;
        if(k<9){a.fillStyle='#14110c';a.font='bold 14px "Times New Roman",serif';
          a.fillText(['VIỆC TRAO ĐỔI','TIN NÓNG','CUỘC SỐNG','HIỆN NAY'][k%4],x,y+10);y+=22}
        else if(k<16){const hh=56+k*2;a.fillStyle='#5a5446';a.fillRect(x,y,colW,hh);
          for(let b=0;b<14;b++){a.fillStyle='rgba(20,16,10,.55)';a.beginPath();a.arc(x+(hs(b,col+y)%colW),y+(hs(b+3,col)%hh),3+(b%4),0,6.3);a.fill()}
          y+=hh+8}
        else{a.fillStyle='rgba(25,22,16,.85)';a.fillRect(x,y,colW*(.7+(k%4)*.08),2);y+=6}}}}
  if('filter' in g){g.filter='blur(2px)';g.drawImage(t,0,0);g.filter='none'}
  else{g.globalAlpha=.35;[[-1,0],[1,0],[0,-1],[0,1],[0,0]].forEach(([dx,dy])=>g.drawImage(t,dx,dy));g.globalAlpha=1}
  /* ố vàng, vết bẩn, nếp gấp */
  g.globalCompositeOperation='multiply';g.fillStyle='rgba(205,180,120,.55)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
  for(let i=0;i<7;i++){const x=hs(i,3)%W,y=hs(i,5)%H,r=30+hs(i,7)%60,gr=g.createRadialGradient(x,y,2,x,y,r);
    gr.addColorStop(0,'rgba(110,80,40,.22)');gr.addColorStop(1,'rgba(110,80,40,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}
  g.fillStyle='rgba(255,255,255,.14)';g.fillRect(W/2-1,0,2,H);g.fillStyle='rgba(60,40,20,.12)';g.fillRect(W/2+1,0,2,H);
  g.fillStyle='rgba(255,255,255,.12)';g.fillRect(0,H/2,W,2);
  const vg=g.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,H*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(40,25,10,.45)');
  g.fillStyle=vg;g.fillRect(0,0,W,H);
  /* tiêu đề rõ ở giữa */
  g.textAlign='center';g.fillStyle='#15110c';
  g.font='bold 27px "Times New Roman",serif';const hl=wrapT(g,NEWS_HEAD.toUpperCase(),W-76);
  g.font='bold 14px "Times New Roman",serif';const sl=wrapT(g,NEWS_SUB,W-76);
  const ph=hl.length*30+sl.length*18+40,py=Math.round(H/2-ph/2);
  g.fillStyle='rgba(222,210,170,.97)';g.fillRect(24,py,W-48,ph);
  g.strokeStyle='#15110c';g.lineWidth=3;g.strokeRect(28,py+4,W-56,ph-8);g.lineWidth=1;g.strokeRect(33,py+9,W-66,ph-18);
  g.fillStyle='#15110c';g.font='bold 27px "Times New Roman",serif';
  hl.forEach((l,i)=>g.fillText(l,W/2,py+36+i*30));
  g.font='bold 14px "Times New Roman",serif';
  sl.forEach((l,i)=>g.fillText(l,W/2,py+36+hl.length*30+10+i*18));
  return c}
function openNews(){
  if(!NEWSC||(NEWS_IMG&&!(NI&&NI.complete&&NI.naturalWidth)))NEWSC=newsCanvas();
  const nc=mkc(NEWSC.width,NEWSC.height);nc.getContext('2d').drawImage(NEWSC,0,0);
  nc.style.cssText='max-width:92%;max-height:86%;box-shadow:4px 6px 0 rgba(0,0,0,.6)';
  showRead(nc)}
addEventListener('keydown',e=>{
  if(!RD)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.repeat)return;
  const k=e.key.toLowerCase();
  if(k==='e'||k==='escape'||k==='enter'||k===' ')closeRead()},true);

/* ================= TƯƠNG TÁC ================= */
function doorPt(){return[AX(CAB.x1+1)*T+4,(AY(DOOR[0][1])+1)*T]}
function target(P){
  const dp=doorPt();
  if(P.x>=AX(CAB.x1+1)*T&&Math.abs(P.x-dp[0])<22&&Math.abs(P.y-dp[1])<22)return{k:'door'};
  if(!S.crow){const c=ipos(CROW);if(Math.hypot(P.x-c[0],P.y-c[1])<22)return{k:'crow'}}
  const n=ipos(NEWS);if(Math.hypot(P.x-n[0],P.y-n[1])<22)return{k:'news'};
  return null}
function pry(P){
  if(S.open||PR)return;
  if(!window.takeItem(P.pl,'crowbar')){cap('Bạn không còn xà beng trong túi.');return}
  PR={t:0,n:P.pl};
  cap('P'+P.pl+' đặt đầu xà beng vào khe cửa và dồn sức cạy lớp băng...')}
function finishPry(){
  const f=YT.floors()[BI];PR=null;
  if(f&&f.cold)openDoor(f);
  S.open=1;save();
  cap('RẮC! Lớp băng nứt toác, cánh cửa tủ đông bật mở... nhưng chiếc xà beng đã gãy làm đôi.')}
function act(P,t){
  const n=P.pl;
  if(t.k==='crow'){if(window.giveItem(n,'crowbar')){S.crow=1;save()}return}
  if(t.k==='news'){
    if(!S.news[n]){if(window.giveItem(n,'tinmoi')){S.news[n]=1;save()}}
    openNews();return}
  if(S.open||!hasCrow(n)){openNote();return}
  const go=()=>pry(P);
  if(typeof window.abyssAsk==='function')
    window.abyssAsk('Cửa tủ đông phủ đầy băng, bên cạnh dán một tờ giấy. Bạn muốn làm gì?',[['Đọc tờ giấy',openNote],['Dùng xà beng cạy cửa',go],['Thôi',()=>{}]]);
  else go()}
const modal=()=>{const a=$('abAsk'),iv=$('inv');return !!RD||!!PR||!!TK||!!trans||!!(a&&!a.hidden)||!!(iv&&!iv.hidden)};
addEventListener('keydown',e=>{
  if(RD||e.target.tagName==='INPUT'||e.repeat||e.key.toLowerCase()!=='e'||e.ctrlKey||e.metaKey||e.altKey)return;
  if(modal())return;
  const P=curP();if(!P||P.cl||P.mcl||P.gk)return;
  const t=target(P);if(!t)return;
  e.stopImmediatePropagation();e.preventDefault();
  act(P,t)},true);
function hintTxt(P){
  const t=target(P);if(!t)return'';
  if(t.k==='door')return S.open?'E: Đọc tờ giấy':hasCrow(P.pl)?'E: Cửa tủ đông (tờ giấy / xà beng)':'E: Đọc tờ giấy trên cửa tủ đông';
  if(t.k==='crow')return'E: Nhặt xà beng';
  return S.news[P.pl]?'E: Đọc tờ báo cũ':'E: Nhặt tờ báo cũ'}
setInterval(()=>{
  try{
    const P=curP();let txt='';
    if(P&&!P.cl&&!P.mcl&&!modal())txt=hintTxt(P);
    hi.hidden=!txt;if(txt)hi.textContent=txt
  }catch(e){oops('hint',e)}},100);

/* ---------- Nút "Đọc" trong túi đồ ---------- */
const selId=()=>{const g=$('invGrid');if(!g)return null;const i=[...g.children].findIndex(c=>c.classList.contains('sel'));return i>=0?bagOf(sel)[i]:null};
const rb=document.createElement('button');rb.className='btn';rb.id='invRead';rb.textContent='Đọc';rb.hidden=true;
$('invUse').after(rb);
rb.onclick=()=>{if(selId()==='tinmoi')openNews()};
setInterval(()=>{const iv=$('inv');if(!iv||iv.hidden){rb.hidden=true;return}rb.hidden=selId()!=='tinmoi'},150);

/* ================= VÒNG LẶP + VÒNG ĐỜI GAME ================= */
function tick(dt){
  const f=YT.floors()[BI];
  if(f&&!f.cold&&window.BSM)ensure();
  hookBills();
  if(PR){PR.t+=dt;if(PR.t>=PRY_T)finishPry()}
  if(f&&f.cold&&!S.open&&frame%20===0){          /* NPC lỡ kẹt trong tủ đông còn đóng thì đưa ra ngoài */
    ins.forEach(p=>{
      if(p.pl||!inB(p.fl))return;
      const lx=Math.floor(p.x/T)-DX0,ly=Math.floor(p.y/T)-DY0;
      if(lx>CAB.x0&&lx<CAB.x1&&ly>CAB.y0&&ly<CAB.y1){
        p.x=p.tx=(AX(CAB.x1+2)+.5)*T;p.y=p.ty=(AY(DOOR[0][1])+.5)*T;p.path=[]}})}}
const _step=step;
step=function(){_step();if(state!=='island')return;try{tick(Math.min(.25,DM||.016))}catch(e){oops('tick',e)}};
const _gen=gen;
gen=function(sd){_gen(sd);PR=null;closeRead();load();try{ensure()}catch(e){oops('gen',e)}};
const _mk=mkPeople;
mkPeople=function(){_mk();PR=null;closeRead();S={seed,open:0,crow:0,news:{}};save()};
if(typeof YT.rebuild==='function'){const rbd=YT.rebuild;YT.rebuild=function(){rbd();try{ensure()}catch(e){oops('rebuild',e)}}}
try{ensure()}catch(e){oops('init',e)}
window.coldRoom={state:()=>S,open:()=>{const f=YT.floors()[BI];if(f&&f.cold){openDoor(f);S.open=1;save()}},news:openNews,note:openNote};
console.log('[coldroom] đã nạp OK (tủ đông, tờ giấy, xà beng, tờ báo cũ)');
})();