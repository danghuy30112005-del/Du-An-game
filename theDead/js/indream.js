/* ===== ghost2.js: NGOẠI HÌNH MỚI CHO OAN HỒN DU THUYỀN (kinh dị hơn) =====
   Nạp SAU G1.js. Không sửa logic G2: chỉ thay ảnh vẽ của oan hồn trong GMEM.bills. */
(()=>{
if(!window.GMEM||typeof GMEM.bills!=='function'||typeof GMEM.ghost!=='function'||typeof hs!=='function'){console.warn('ghost2.js: hãy nạp SAU G1.js');return}
const W=64,H=76,OX=32,OY=68;
const cv2=document.createElement('canvas');cv2.width=W;cv2.height=H;
const g=cv2.getContext('2d');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const R=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(OX+x),Math.round(OY+y),w,h)};
const L=(c,x0,y0,x1,y1,w)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));g.fillStyle=c;
  for(let i=0;i<=n;i++){const u=i/n;g.fillRect(Math.round(OX+x0+(x1-x0)*u-w/2),Math.round(OY+y0+(y1-y0)*u-w/2),w,w)}};
const SK={hi:'#c3c9c2',md:'#9aa29d',lo:'#646c6a',dk:'#3c4244',bru:'#5b4a66',vein:'#4a3a58'};
const INK='#08070b',INK2='#181622',SHEEN='#3a3750';
const DP=[{l:'#ddd8cb',m:'#c6c1b3',d:'#8a857a',f:'#a9a498'},{l:'#c9c4b6',m:'#b0ab9d',d:'#767166',f:'#948f83'},
  {l:'#a8a496',m:'#8f8b7e',d:'#605c53',f:'#79756a'},{l:'#7e7b70',m:'#6a665c',d:'#48453d',f:'#58554c'}];

function backHair(t,sw){
  for(let y=-58;y<=-8;y++){
    const u=(y+58)/50,wv=Math.round(Math.sin(t*.06+y*.15)*1.6*u+sw*u*2.4),w=Math.round(8+u*3);
    R(INK,-w+wv,y,w*2,1);
    if(hs(y,5)%3===0)R(INK,-w-1-(hs(y,7)%2)+wv,y,1,1);
    if((y+((t*.2)|0))%11===0)R(INK2,-w+2+wv,y,3,1)}}
function dress(sw){
  for(let y=-48;y<=-1;y++){
    const hw=y<-30?Math.round(5+(-30-y)/18*1.2):Math.round(4+(y+30)/30*10),
      o=Math.round(sw*((y+48)/48)*2.4),P=DP[y<-34?0:y<-22?1:y<-10?2:3];
    for(let x=-hw;x<hw;x++){
      const k=hs(x+50,y+90)%100;
      let c=x<-hw+3?P.l:x>=hw-4?P.d:P.m;
      if(((x+hw+((y>>3)&1)*2)%5)===0)c=P.f;
      if(k<4)c='#4f493f';else if(k<7)c='#5c0a10';else if(k<9)c='#2e2b26';
      R(c,x+o,y,1,1)}
    if(hs(y,13)%4===0)R(P.d,-hw-1+o,y,1,1);
    if(hs(y,17)%4===0)R(P.d,hw+o,y,1,1)}
  /* lỗ rách */
  [[-3,-24,3,5],[4,-14,2,6],[-8,-9,3,4]].forEach(([a,b,w,h])=>{R('#07050a',a,b,w,h);R('#6a665c',a,b-1,w,1)})}
function chest(sw){                                  /* ngực hở: xương sườn */
  for(let y=-47;y<=-36;y++){
    const o=Math.round(sw*((y+48)/48)*2.4),w=y<-44?3:4;
    for(let x=-w;x<w;x++)R(x<0?'#8f9793':'#737b78',x+o,y,1,1);
    const r=(y+47)%3;
    if(r===1)R('#25212a',-w+o,y,w*2,1);else if(r===2)R('#b0b7b2',-w+1+o,y,w*2-2,1);
    R('#c6c1b3',-w-1+o,y,1,1);R('#c6c1b3',w+o,y,1,1)}
  L('#3a3540',0,-47,0,-37,1);R('#b4bab4',-5,-47,10,1)}
function hem(t,sw){
  const o0=Math.round(sw*2.4);
  for(let i=-14;i<=14;i+=2){
    const ln=2+((hs(i+20,5)+(t>>3))%7);
    R(i%4?'#8f8b7e':'#605c53',i+o0,0,2,ln);
    if(ln>5)R('#3d3a34',i+o0,ln-1,2,1)}
  for(let k=0;k<3;k++)R(k===1?'#7a0810':'#5a6a78',(k-1)*8+o0,4+((t*.5+k*7)%5|0),1,2)}
function head(hx,hy,st,t,ag){
  const gp=st==='laugh'||st==='grab'||st==='chase';
  L('#7c8480',0,-47,hx,hy+8,4);L('#5f6664',2,-47,hx+2,hy+8,1);L('#a8afa9',-1,-46,hx-1,hy+8,1);L(SK.vein,0,-45,hx*.6,hy+10,1);
  for(let j=-8;j<=9;j++){                              /* sọ thuôn, má hóp, cằm nhọn */
    const w=j<=-2?Math.round(4.8*Math.sqrt(Math.max(0,1-Math.pow((j+2)/6.5,2)))):Math.max(1,Math.round(5-(j+2)*.38));
    for(let x=-w;x<w;x++){
      const q=hs(x+70,j+80)%100;
      let c=x<-w+1?SK.hi:x>=w-2?SK.lo:SK.md;
      if(q<8)c=SK.bru;else if(q<13)c=SK.hi;else if(q<16)c=SK.dk;
      if(j>=1&&j<=5&&Math.abs(x)>=2&&Math.abs(x)<=3)c=SK.lo;
      R(c,hx+x,hy+j,1,1)}}
  L(SK.dk,hx+2,hy-8,hx+4,hy-4,1);L(SK.dk,hx-3,hy+5,hx-1,hy+8,1);
  /* hốc mắt + con ngươi đỏ */
  R('#07050a',hx-4,hy-3,4,5);R('#07050a',hx+1,hy-3,3,4);R('#1d1018',hx-5,hy-2,1,3);
  const ec=ag?'#ff2a1a':'#c8341e';
  R(ec,hx-3,hy-2,2,2);R(ec,hx+1,hy-2,2,2);R('#fff2d0',hx-3,hy-2,1,1);R('#fff2d0',hx+1,hy-2,1,1);
  g.globalAlpha=ag?.45:.25;R('#ff3a2a',hx-5,hy-4,6,6);R('#ff3a2a',hx,hy-4,5,6);g.globalAlpha=1;
  R('#1a1418',hx-1,hy+1,2,2);
  /* miệng há toác, hàm dưới kéo dài */
  let mh=st==='laugh'?11:st==='grab'?9:st==='chase'?7:3;
  mh+=Math.round(Math.sin(t*(gp?.8:.09))*(gp?1.6:.5));
  const my=hy+4;
  R('#10050a',hx-3,my,6,mh);R('#10050a',hx-4,my+1,1,2);R('#10050a',hx+3,my+1,1,2);
  R(SK.lo,hx-2,my+mh,4,2);R(SK.md,hx-1,my+mh+1,2,2);R(SK.lo,hx,my+mh+3,1,1);
  for(let x=-3;x<3;x++){R('#e6dfc8',hx+x,my,1,x&1?2:3);R('#d0c7ac',hx+x,my+mh-2-((x+1)&1),1,2+((x+1)&1))}
  if(mh>5){R('#5e1018',hx-1,my+mh-4,3,3);R('#8a1a24',hx,my+mh-4,1,1)}
  R('#7a0810',hx-1,my+mh+3,1,2+((t>>3)%3));R('#5c0a10',hx-3,my+mh,1,3);
  /* huyết lệ */
  for(const s of[-1,1]){const x=s<0?hx-3:hx+2,len=5+((t>>2)+(s<0?0:2))%4;
    R('#8a0a12',x,hy+2,1,len);R('#c4121c',x,hy+1+len,1,1);
    R('#c4121c',x,hy+2+len+(((t*.6+(s<0?0:7))|0)%9),1,2)}
  /* tóc ướt dính mặt */
  const wv=j=>Math.round(Math.sin(t*.07+j*.2)*1.4);
  R(INK,hx-6,hy-9,12,3);R(INK,hx-7,hy-7,14,4);R(INK2,hx-5,hy-9,3,1);
  for(let j=-4;j<=17;j++){const w=Math.round(3+(j>6?1:0)-(j>13?1:0));R(INK,hx-8+wv(j),hy+j,w,1);if(j%4===0)R(SHEEN,hx-8+wv(j),hy+j,1,1)}
  for(let j=-4;j<=13;j++)R(INK,hx+5+wv(j),hy+j,2,1);
  L(INK,hx-6,hy-6,hx-2,hy,1);L(INK,hx+5,hy-5,hx+1,hy+6,1);L(INK,hx-1,hy-8,hx-4,hy+3,1)}
function hand(x,y,ba,open){
  R(SK.md,x-1,y-1,3,3);
  for(let k=-2;k<=2;k++){const a=ba+k*.4*open,len=6+(k===0?2:0)-(Math.abs(k)===2?1:0),ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;
    L(k%2?SK.hi:SK.md,x,y,ex,ey,1);R('#15101a',Math.round(ex),Math.round(ey),1,1)}}
function arm(sx,sy,ex,ey,hx,hy,open){
  L(SK.md,sx,sy,ex,ey,2);L(SK.lo,sx+1,sy,ex+1,ey,1);L(SK.md,ex,ey,hx,hy,2);L(SK.lo,ex+1,ey,hx+1,hy,1);
  L(SK.vein,sx,sy+1,ex,ey+1,1);R(SK.hi,ex-1,ey-1,3,3);R(SK.dk,ex,ey,1,1);R('#8a0a12',ex,ey+1,1,2);
  hand(hx,hy,Math.atan2(hy-ey,hx-ex),open||1)}
function scythe(hx,hy,a,len,bl){
  const dx=Math.cos(a),dy=Math.sin(a),px=-dy,py=dx;
  L('#3b2d20',hx-dx*26,hy-dy*26,hx+dx*len,hy+dy*len,2);
  L('#5a4630',hx-dx*26+1,hy-dy*26,hx+dx*len+1,hy+dy*len,1);
  for(let i=0;i<4;i++){const q=i*.28-.2,cx0=hx+dx*len*q,cy0=hy+dy*len*q;L('#1d1712',cx0-px,cy0-py,cx0+px,cy0+py,1)}
  const tx=hx+dx*len,ty=hy+dy*len;
  for(let i=0;i<=24;i++){
    const u=i/24,x=tx+px*u*bl-dx*u*u*13,y=ty+py*u*bl-dy*u*u*13,w=u<.65?3:2;
    let c=u<.25?'#58626e':u<.9?'#9aa6b4':'#c4ced9';
    if(hs(i,11)%7===0)c='#7a4a2a';
    if(i>13&&hs(i,5)%3===0)c='#7a0810';
    R(c,x-w/2,y-w/2,w,w)}}

function paint(o){
  const st=o.st,t=frame,ag=st==='chase'||st==='slash'||st==='grab',sw=Math.sin(t*.06);
  g.clearRect(0,0,W,H);g.imageSmoothingEnabled=false;g.globalAlpha=1;
  g.globalAlpha=(.10+.05*Math.sin(t*.1))*(ag?1.9:1);R(ag?'#ff6a60':'#9fc0e0',-18,-66,36,70);g.globalAlpha=1;
  backHair(t,sw);
  if(st!=='slash'&&st!=='grab')scythe(ag?12:14,ag?-34:-22,ag?-1.15:-1.5,44,16);
  dress(sw);chest(sw);hem(t,sw);
  let hx=0,hy=-60;
  const jerk=hs(t>>1,7)%31===0?hs(t,3)%5-2:0;          /* giật cục */
  if(st==='idle'){hx=-4+Math.round(sw*1.5);hy=-59}
  else if(st==='laugh'){hx=3+Math.round(Math.sin(t*.9)*1.5);hy=-62}
  else if(st==='chase'){hx=Math.round(Math.sin(t*.45)*1.2);hy=-57}
  else if(st==='slash'){hx=-2;hy=-58}
  head(hx+jerk,hy,st,t,ag);
  for(let y=-50;y<=-22;y++){const wv=Math.round(Math.sin(t*.06+y*.18)*1.3+sw*((y+50)/28)*1.4);R(INK,-9+wv,y,3,1);R(INK,6+wv,y,2,1)}
  const lh=Math.round(Math.sin(t*.07)*1.5);
  if(st==='grab'){arm(-6,-47,-18,-44,-27,-60,1.3);arm(6,-47,18,-44,27,-60,1.3)}
  else if(st==='slash'){arm(-6,-46,-14,-40,-18,-52,1.2);arm(6,-46,16,-40,10,-30,1)}
  else if(st==='chase'){arm(-6,-46,-17,-42,-22,-56+lh,1.3);arm(6,-46,13,-38,12,-34,1)}
  else if(st==='laugh'){arm(-6,-46,-16,-44,-20,-58+Math.round(Math.sin(t*.8)*2),1.3);arm(6,-46,12,-36,14,-22,1)}
  else{arm(-6,-46,-10,-28,-10,-9+lh,1.1);arm(6,-46,12,-36,14,-22,1)}
  if(st==='slash')scythe(10,-30,-2.4+3.2*(o.p||0),26,11);
  if(hs(t>>1,9)%23===0){const yy=6+hs(t,4)%52;g.drawImage(cv2,0,yy,W,3,(hs(t,5)%7)-3,yy,W,3)}   /* nhiễu hình */
}

let warned=false;
const b0=GMEM.bills;
GMEM.bills=function(P,B){
  b0(P,B);
  try{
    const G=GMEM.ghost();if(!G)return;
    const e=B.find(b=>b&&b.nf&&b.img&&b.img.width===64&&b.img.height===76&&b.img!==cv2);
    if(!e)return;
    let st='idle',p=0;
    if(G.st==='laugh')st='laugh';else if(G.st==='chase')st='chase';
    else if(G.st==='kill'){if(G.kt==='slash'){st='slash';p=clamp((G.t-.15)/.6,0,1)}else st='grab'}
    paint({st,p});e.img=cv2;
  }catch(err){if(!warned){warned=true;console.error('[ghost2]',err)}}};
console.log('[ghost2] đã nạp OK');
})();



/* ===== basement.js: TẦNG 5 – TẦNG HẦM DU THUYỀN DANOVA =====
   Nạp TRƯỚC dream.js. Cần các sửa nhỏ trong dream.js (yacht) và G1.js (xem hướng dẫn).
   kd: 11 = sàn thép, 12 = vách thép có ống (tường), 4 = gạch trắng (kho lạnh). */
(()=>{
const R=(c,x,y,w,h)=>{cx.fillStyle=c;cx.fillRect(Math.round(x),Math.round(y),w,h)};
const hexv=s=>[parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)];
const MX=new Map();
const mix=(a,b,t)=>{t=Math.round(t*12)/12;const k=a+b+t;let v=MX.get(k);if(v)return v;
  const A=hexv(a),B=hexv(b);v='#'+[0,1,2].map(i=>Math.round(A[i]+(B[i]-A[i])*t).toString(16).padStart(2,'0')).join('');MX.set(k,v);return v};
const PM=new Map();
const pip=c=>{let v=PM.get(c);if(!v){v={b:c,l:mix(c,'#ffffff',.4),d:mix(c,'#000000',.45)};PM.set(c,v)}return v};
const SHM=new Map();
const shd=(c,s)=>{s=Math.round(s*20)/20;const k=c+s;let v=SHM.get(k);if(!v){const a=hexv(c);v='rgb('+(a[0]*s|0)+','+(a[1]*s|0)+','+(a[2]*s|0)+')';SHM.set(k,v)}return v};
const disc=(c,x,y,r)=>{cx.fillStyle=c;r=Math.round(r);for(let j=-r;j<=r;j++){const w=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));cx.fillRect(Math.round(x-w),Math.round(y+j),w*2,1)}};
const HALL=['#c9742a','#3f9a8a','#8a98a6','#b8423a','#d4b04a','#4a7ac0'],
      DOCS=['#6f7f8f','#8a6a4a','#5a6a7a','#7a8a6a'],
      COLD=['#e4edf2','#cddae2','#f0f6f9','#b8cbd6'];
const SIGNS=new Map();
const zoneAt=(Yf,P)=>((Yf&&Yf.zone&&Yf.zone[Math.floor(P.y/T)]||[])[Math.floor(P.x/T)])|0;
const getY4=()=>window.yachtDream&&window.yachtDream.floors()[4];

function signImg(txt,col){
  const c=document.createElement('canvas');c.width=48;c.height=12;const g=c.getContext('2d');
  g.fillStyle='#1a1410';g.fillRect(0,0,48,12);g.fillStyle=col;g.fillRect(1,1,46,10);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(1,6,46,5);
  g.fillStyle='#1a1410';g.font='bold 7px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,24,6.5);return c}

/* ================= DỰNG TẦNG ================= */
function build(A){
  const {AX,AY,CL,onDeck,setK,obj,kd,DEC,FR}=A,Z=A.g(0);
  SIGNS.clear();
  for(let ly=0;ly<32;ly++)for(let lx=0;lx<CL;lx++){
    if(!onDeck(lx,ly))continue;
    const edge=!onDeck(lx-1,ly)||!onDeck(lx+1,ly)||!onDeck(lx,ly-1)||!onDeck(lx,ly+1);
    setK(lx,ly,edge?12:11,edge)}
  for(let y=0;y<kd.length;y++)for(let x=0;x<kd[y].length;x++)if(kd[y][x]===9)kd[y][x]=0;   /* bỏ lan can: trong lòng tàu */
  const wall=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)setK(x,y,12,1)};
  const gap=(x0,x1,y)=>{for(let x=x0;x<=x1;x++)setK(x,y,11,0)};
  const zone=(z,x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)Z[AY(y)][AX(x)]=z};
  /* 3 phòng kho */
  wall(11,1,11,12);wall(34,1,34,12);wall(57,1,57,12);wall(11,12,57,12);gap(20,22,12);gap(44,46,12);   /* A: đồ cũ, B: tài liệu */
  wall(35,19,35,30);wall(60,19,60,30);wall(35,19,60,19);gap(46,48,19);                                 /* C: kho lạnh */
  for(let y=20;y<=30;y++)for(let x=36;x<=59;x++)setK(x,y,4,0);
  zone(1,11,0,34,12);zone(2,34,0,57,12);zone(3,35,19,60,31);
  const sgn=(x0,y,txt,col)=>{const im=signImg(txt,col);
    for(let i=0;i<3;i++)SIGNS.set(AY(y)*IW+AX(x0+i),{im,i});
    DEC.push(()=>cx.drawImage(im,0,0,48,12,AX(x0)*T,AY(y)*T+1,24,6))};
  sgn(16,12,'KHO ĐỒ CŨ','#d8b04a');sgn(40,12,'TÀI LIỆU','#9ab0c8');sgn(42,19,'KHO LẠNH','#bfe8f4');
  const O=(k,x,y,w,h,o)=>obj(k,x,y,w,h,o);

  /* ---- KHO A: đồ đạc linh tinh ---- */
  O('crate',12,1,3,2);O('crate',15,1,2,2);O('barrel',17,1,1,1);O('barrel',18,1,1,1);O('crate',12,3,2,2);
  O('wardrobe',30,1,2,2);O('wardrobe',32,1,2,2);O('stand',22,2,1,1);
  O('tbl',26,4,2,2);O('chair',25,5,1,1,{nb:1});O('chair',28,5,1,1,{nb:1});
  [[31,5],[32,5],[31,6],[32,6]].forEach(([x,y])=>O('barrel',x,y,1,1));
  O('plant',33,8,1,1);O('bed',13,7,4,3,{col:1,d:'n'});O('crate',23,7,3,2);
  O('sofa',24,10,6,2,{d:'s'});O('stand',31,9,1,1);

  /* ---- KHO B: tài liệu, giấy báo ---- */
  O('bookcase',43,1,5,1);  
  [[35,6],[35,7],[35,8],[35,9],[56,6],[56,7],[56,8]].forEach(([x,y])=>O('fcab',x,y,1,1));
  [[43,5],[47,5],[43,8],[47,8],[37,8],[38,8],[41,8],[42,8],[49,8],[50,8],[53,8],[54,8]]
    .forEach(([x,y],k)=>O('newsbox',x,y,1,1,{v:k})); 
  [1,4,7].forEach(y=>[36,40,48,52].forEach(x=>O('shelf',x,y,3,1)));
  [2,3,4,5].forEach(y=>{O('fcab',35,y,1,1);O('fcab',56,y,1,1)});
  O('paper',36,10,3,2);O('paper',40,10,2,2);O('paper',48,10,3,2);O('paper',52,10,3,2);
  O('tbl',55,9,2,2);O('chair',54,9,1,1,{nb:1});

  /* ---- KHO C: kho lạnh ---- */
  [[39,22],[54,22],[39,27],[54,27]].forEach(([x,y])=>O('freezer',x,y,3,2));   // tủ đông chứa thực phẩm
  [[45,23],[50,23],[45,28],[49,28]].forEach(([x,y],k)=>O('foodbox',x,y,1,1,{v:k}));  // thùng thực phẩm đông lạnh
  [21,23,25,27].forEach(y=>{O('fridge',36,y,2,2);O('fridge',58,y,2,2)});
  [38,40,42,44,50,52,54,56].forEach(x=>O('fridge',x,20,2,2));
  for(let x=36;x<=58;x+=2)O('fridge',x,29,2,2);
  O('fridge',42,24,2,2);O('fridge',52,24,2,2);O('crate',47,25,2,2);

  /* ---- Sảnh ngoài: bồn áp lực, phuy, thùng hàng ---- */
  [66,71,76].forEach(x=>O('tank',x,2,3,3));
  [[64,8],[65,8],[64,9]].forEach(([x,y])=>O('barrel',x,y,1,1));
  O('crate',64,23,3,2);O('crate',68,23,2,2);O('crate',64,26,2,2);O('crate',67,26,3,2);O('crate',74,24,2,2);
  /* ---- THÙNG THÊM: kho A ---- */
  O('crate',17,3,2,2);O('crate',20,8,2,2);O('crate',28,8,2,2);O('crate',13,10,2,2);
  /* ---- THÙNG THÊM: sảnh trái trên + dưới ---- */
  O('crate',8,2,2,2);O('crate',8,7,2,2);
  O('crate',10,22,3,2);O('crate',14,24,2,2);O('crate',18,22,3,2);O('crate',22,26,3,2);
  O('crate',26,22,2,2);O('crate',30,28,3,2);O('crate',14,28,2,2);
  /* ---- THÙNG THÊM: sảnh phải ---- */
  O('crate',59,2,2,2);O('crate',59,5,2,2);O('crate',59,9,2,2);
  O('crate',82,2,3,2);O('crate',86,2,2,2);O('crate',82,5,2,2);
  O('crate',62,21,2,2);O('crate',80,22,3,2);O('crate',84,22,2,2);O('crate',80,27,3,2);O('crate',84,28,2,2);
  [[61,29],[62,29],[80,25],[81,25],[88,26]].forEach(([x,y])=>O('barrel',x,y,1,1));
  [[72,27],[73,27],[72,28]].forEach(([x,y])=>O('barrel',x,y,1,1));
  O('crate',3,26,3,3);O('crate',7,28,2,2);O('crate',5,4,2,2);[[2,21],[3,21],[2,22]].forEach(([x,y])=>O('barrel',x,y,1,1));

  /* ---- Đèn treo + vạch kẻ sàn ---- */
  const bulbs=[];for(let lx=8;lx<=88;lx+=10)bulbs.push([lx,15]);
  [[16,6],[28,6],[40,6],[52,6],[44,25],[52,25],[44,22]].forEach(b=>bulbs.push(b));
  DEC.push(()=>{
    for(let lx=6;lx<=90;lx+=4)R('#b8982a',AX(lx)*T,AY(15)*T+3,8,2);
    bulbs.forEach(([lx,ly])=>{const x=AX(lx)*T+4,y=AY(ly)*T+4;R('#14171d',x-2,y-2,5,3);R('#ffe9a0',x-1,y+1,3,2)})});
  FR.push(()=>{
    cx.save();cx.globalCompositeOperation='lighter';
    bulbs.forEach(([lx,ly],k)=>{
      const x=AX(lx)*T+4,y=AY(ly)*T+4,fl=(hs(frame>>3,k)%11===0?.4:1)*(.8+.2*Math.sin(frame*.09+k*1.7));
      const gr=cx.createRadialGradient(x,y,2,x,y,54);gr.addColorStop(0,'rgba(255,200,110,'+(.26*fl).toFixed(3)+')');gr.addColorStop(1,'rgba(255,200,110,0)');
      cx.fillStyle=gr;cx.fillRect(x-54,y-54,108,108)});
    cx.restore();cx.globalAlpha=1});
  return Z}

/* ================= VẼ 2D (nhìn từ trên xuống) ================= */
const pH=(Q,c,y0,th)=>{Q(c.d,0,y0,T,th);Q(c.b,0,y0,T,Math.max(1,th-1));Q(c.l,0,y0,T,1)};
const pV=(Q,c,x0,th)=>{Q(c.d,x0,0,th,T);Q(c.b,x0,0,Math.max(1,th-1),T);Q(c.l,x0,0,1,T)};
function tile(f,x,y,k,h,px,py,Q,K){
  if(k===11){
    Q((x+y)&1?'#474d57':'#40464f',0,0,T,T);Q('#2a2e36',0,T-1,T,1);Q('#2a2e36',T-1,0,1,T);Q('#59606b',0,0,T,1);
    Q('#707884',1,1,1,1);Q('#707884',T-2,T-2,1,1);
    if((x+y)%3===0){Q('#4f5662',2,3,4,1);Q('#4f5662',3,5,2,1)}
    if(h%13===0)Q('rgba(8,8,10,.5)',(h>>3)&3,(h>>5)&3,4,3);
    if(h%29===0)Q('#6a3f26',(h>>4)&5,(h>>7)&5,2,1);
    if(h%41===0){Q('rgba(60,120,160,.4)',1,2,5,3);Q('rgba(190,230,255,.4)',2,3,2,1)}
    return true}
  if(k===12){
    const z=f.zone?f.zone[y][x]:0,P=z===3?COLD:z===2?DOCS:HALL;
    Q(z===3?'#7f95a3':'#1e232b',0,0,T,T);Q(z===3?'#a8bcc8':'#2b313b',0,0,T,1);Q('#12151a',0,T-1,T,1);
    const hz=K(-1,0)===12||K(1,0)===12,vt=K(0,-1)===12||K(0,1)===12;
    if(hz||!vt){
      pH(Q,pip(P[(y*3)%P.length]),1,3);pH(Q,pip(P[(y*3+2)%P.length]),5,2);
      if(x%4===0){Q('#14171c',3,0,2,5);Q('#14171c',3,4,2,4);Q('#8a929c',3,2,1,1)}
      if(h%19===0&&z!==3){Q('#b8423a',2,2,4,1);Q('#b8423a',3,1,2,3);Q('#e8c84a',3,2,2,1)}}
    if(vt){
      pV(Q,pip(P[(x*3+1)%P.length]),1,3);if(!hz)pV(Q,pip(P[(x*3+3)%P.length]),5,2);
      if(y%4===0){Q('#14171c',0,3,5,2);Q('#14171c',4,3,4,2)}}
    if(h%41===0)Q('#5ab4d4',(h>>3)&5,2+((frame>>2)%5),1,2);
    if(z===3&&h%5===0)Q('#ffffff',(h>>3)&6,(h>>6)&6,1,1);
    return true}
  return false}

const draw={
freezer(o){const x=o.px,y=o.py,w=o.w*8,h=o.h*8,v=hs(o.x,o.y);
  R('rgba(0,0,0,.3)',x+1,y+h-1,w,3);R('#7d8a94',x,y,w,h);R('#e8eef2',x+1,y+1,w-2,h-2);
  R('#4f6f82',x+2,y+2,w-4,h-4);R('#cfeaf6',x+2,y+2,w-4,1);R('#cfeaf6',x+2,y+2,1,h-4);
  for(let i=0;i<w-8;i+=5)for(let j=0;j<h-8;j+=5){
    R(['#c0392b','#4a90e0','#58c25e','#e8a030','#e8c0c0','#9ad0e8'][hs(o.x+i,o.y+j+v)%6],x+3+i,y+3+j,4,4);R('#fff',x+3+i,y+3+j,4,1)}
  R(((frame>>5)+v)%7?'#4aff7a':'#ff4a4a',x+1,y+h-3,1,1);
  cx.globalAlpha=.4+.3*Math.sin(frame*.08+v);R('#fff',x+3+(v%(w-6)),y+3,1,1);cx.globalAlpha=1},
foodbox(o){const x=o.px,y=o.py,k=o.v|0;
  R('rgba(0,0,0,.3)',x+1,y+7,8,2);R('#2a4a62',x,y,8,8);R(k%2?'#c0dcee':'#9ac4e0',x+1,y+1,6,6);R('#e8f6ff',x+1,y+1,6,1);
  R(['#c0392b','#e8a030','#58c25e','#4a90e0'][k%4],x+2,y+3,4,2);R('#fff',x+3,y+3,1,1)},
newsbox(o){const x=o.px,y=o.py;
  R('rgba(0,0,0,.3)',x+1,y+7,8,2);R('#5a3a1e',x,y,8,8);R('#b8864f',x+1,y+1,6,6);R('#e6e0cc',x+1,y+1,6,3);
  R('#cfc8b0',x+1,y+3,6,1);R('#555',x+2,y+2,4,1);R('#9a8a6a',x+1,y+5,6,1);R('#d8d0b8',x+2+((o.v|0)%2),y,3,2)},
bookcase(o){const x=o.px,y=o.py,w=o.w*8;
  R('rgba(0,0,0,.3)',x+1,y+7,w,2);R('#3a2410',x,y,w,8);R('#6b4423',x+1,y+1,w-2,6);
  for(let i=0;i<w-2;i+=2){
    R(['#8e1f2a','#2a5a8a','#c9a04c','#3f7a4a','#6a3a7a','#d8d0b8'][hs(o.x+i,o.y)%6],x+1+i,y+1,2,3);
    R(['#6a3a7a','#c9a04c','#2a5a8a','#8e1f2a'][hs(o.x+i,3)%4],x+1+i,y+4,2,3)}
  R('#8a5a2e',x,y,w,1)},
crate(o){const x=o.px,y=o.py,w=o.w*8,h=o.h*8;R('rgba(0,0,0,.3)',x+1,y+h-1,w,2);
  for(let j=0;j<o.h;j++)for(let i=0;i<o.w;i++){
    const bx=x+i*8,by=y+j*8,v=hs(o.x+i,o.y+j)%3;
    R('#3e2812',bx,by,8,8);R(['#a8743f','#9a6a38','#b4824a'][v],bx+1,by+1,6,6);R('#c89a62',bx+1,by+1,6,1);R('#6b4423',bx+1,by+4,6,1);
    R('#5a3a1e',bx+1,by+1,1,6);R('#5a3a1e',bx+6,by+1,1,6);
    if(v===1){R('#d8d2c0',bx+2,by+2,3,2);R('#7a2a20',bx+3,by+3,1,1)}}},
barrel(o){const x=o.px+4,y=o.py+4,c=['#2f5f8a','#8a2a22','#6a4a2a'][hs(o.x,o.y)%3];
  disc('rgba(0,0,0,.3)',x+1,y+1,4);disc('#1c2026',x,y,4);disc(c,x,y,3);disc(mix(c,'#ffffff',.3),x-1,y-1,1);
  R(mix(c,'#000000',.45),x-3,y,6,1)},
shelf(o){const x=o.px,y=o.py,w=o.w*8;R('rgba(0,0,0,.3)',x+1,y+7,w,2);R('#3a3f48',x,y,w,8);R('#59616c',x,y,w,1);
  for(let i=0;i<w;i+=3){const v=hs(o.x*7+i,o.y)%5;if(v===4)continue;R(['#c9b88c','#9a8a6a','#a85a4a','#4a6a8a'][v%4],x+i,y+2,2,4);R('#e8e0c8',x+i,y+2,2,1)}
  R('#2a2f36',x,y+7,w,1)},
paper(o){const x=o.px,y=o.py;R('rgba(0,0,0,.3)',x+1,y+o.h*8-1,o.w*8,2);
  for(let j=0;j<o.h;j++)for(let i=0;i<o.w;i++){
    const bx=x+i*8,by=y+j*8;R('#a8a290',bx,by,8,8);R('#e6e0cc',bx+1,by+1,6,6);
    R('#cfc8b0',bx+1,by+3,6,1);R('#555',bx+2,by+2,3,1);R('#a8743f',bx+3,by+1,1,6);R('#a8743f',bx+1,by+4,6,1)}},
fcab(o){const x=o.px,y=o.py;R('rgba(0,0,0,.3)',x+1,y+7,8,2);R('#5e6772',x,y,8,8);R('#98a2ac',x+1,y+1,6,2);
  R('#4a525c',x+1,y+4,6,1);R('#c8ced6',x+3,y+5,2,1);R('#c8ced6',x+3,y+2,2,1)},
fridge(o){const x=o.px,y=o.py,w=o.w*8,h=o.h*8,lab=['#58c25e','#d8392b','#4a90e0'][hs(o.x,o.y)%3];
  R('rgba(0,0,0,.35)',x+1,y+h-1,w,3);R('#7d8a94',x,y,w,h);R('#e8eef2',x+1,y+1,w-2,h-7);R('#aeb9c2',x+w-3,y+1,2,h-7);
  R('#dfe6ea',x+1,y+h-6,w-2,5);R('#2a3038',x+(w>>1),y+h-6,1,5);R('#7a8690',x+(w>>1)-2,y+h-5,1,3);R('#7a8690',x+(w>>1)+2,y+h-5,1,3);
  R(lab,x+2,y+h-5,3,1);
  for(let i=0;i<4;i++)if(hs(o.x+i,o.y)%3===0)R('#ffffff',x+2+i*3,y+2+(i&1)*2,2,1);
  R(((frame>>5)+o.x)%7?'#4aff7a':'#ff4a4a',x+2,y+h-7,1,1)},
tank(o){const r=o.w*4,x=o.px+r,y=o.py+r;
  disc('rgba(0,0,0,.3)',x+2,y+2,r);disc('#2a2f38',x,y,r);disc('#5d6773',x,y,r-1);disc('#7a8794',x-1,y-1,r-3);disc('#4a535e',x,y,r-5);
  disc('#2a2f38',x,y,3);disc('#8a95a0',x,y,2);R('#2a2f38',x-1,y-4,2,8);
  for(let a=0;a<6.28;a+=.8)R('#9aa6b2',x+Math.cos(a)*(r-2),y+Math.sin(a)*(r-2),1,1);
  R('#e8e0c8',x+4,y-7,3,3);R('#d83a2a',x+5,y-6,1,1);R('#c9742a',x+r-1,y-1,5,3)}
};

/* ================= GÓC NHÌN THỨ NHẤT ================= */
function paint(kind,C,o,a){
    
  const hh=o?hs(o.x|0,o.y|0)%100:0,c0=Math.abs(a-.5),cyl=c=>mix(c,'#000000',Math.pow(c0*2,2)*.5);
  switch(kind){
  case 'freezer':{const W=o?o.w:3,u=Math.floor(a*W*2),f=(a*W*2)%1;
    C('#6f7c86',0,.4);C('#e8f1f6',.03,.38);C('#2f4a5a',.38,.5);C('#cfeaf6',.38,.4);
    if(f>.12&&f<.88)C(['#c0392b','#4a90e0','#58c25e','#e8a030','#e8c0c0','#9ad0e8'][(hh+u)%6],.4,.47);
    if(f>.3&&f<.7)C('#ffffff',.47,.5);
    if(c0<.03)C('#4aff7a',.2,.24);return true}
  case 'foodbox':
    C('#2a4a62',0,.42);C(['#9ac4e0','#c0dcee'][hh%2],.03,.4);C('#e8f6ff',.36,.4);
    if(c0<.3)C(['#c0392b','#e8a030','#58c25e','#4a90e0'][hh%4],.15,.3);return true;
  case 'newsbox':
    C('#5a3a1e',0,.42);C('#b8864f',.03,.4);C('#e6e0cc',.34,.45);
    if(((a*10)|0)%3===0)C('#555',.38,.40);return true;
  case 'bookcase':{
    C('#3a2410',0,1);if(a<.03||a>.97){C('#6b4423',0,1);return true}
    const pal=['#8e1f2a','#2a5a8a','#c9a04c','#3f7a4a','#6a3a7a','#d8d0b8'],u=a*(o?o.w:5)*7,fu=u%1;
    for(let L=0;L<4;L++){const y0=.04+L*.24;C('#6b4423',y0,y0+.02);
      const q=hs(Math.floor(u)+hh,L*11+5)%7;
      if(q<6){C(pal[q],y0+.02,y0+.02+.13+((q+L)%3)*.03);if(fu>.15&&fu<.85)C('#e8e0c8',y0+.07,y0+.09)}}
    C('#8a5a2e',.97,1);return true}
  case 'crate':{const f=(a*3)%1;
    C('#3e2812',0,.5);C(['#a8743f','#9a6a38','#b4824a'][hh%3],.02,.48);C('#6b4423',.15,.17);C('#6b4423',.31,.33);
    if(f<.07||f>.93)C('#4a2e14',0,.5);
    if(Math.abs(f-.5)<.3&&hh%2===0){C('#d8d2c0',.2,.29);if(f>.4&&f<.6)C('#7a2a20',.22,.26)}
    C('#c89a62',.47,.5);return true}
  case 'barrel':{const col=['#2f5f8a','#8a2a22','#6a4a2a'][hh%3],dk=mix(col,'#000000',.45);
    C(cyl('#1c2026'),0,.55);C(cyl(col),.01,.54);C(cyl(dk),.12,.15);C(cyl(dk),.38,.41);
    if(c0<.12)C(mix(col,'#ffffff',.35),.02,.52);C(cyl(mix(col,'#ffffff',.2)),.52,.55);return true}
  case 'shelf':{
    C('#2e333b',0,1);if(a<.04||a>.96){C('#59616c',0,1);return true}
    const pal=['#c9b88c','#9a8a6a','#7a6a52','#a85a4a','#4a6a8a','#d8d0b8'],u=a*14,fu=u%1;
    for(let L=0;L<4;L++){
      const y0=.03+L*.245;C('#4a525c',y0,y0+.018);
      const q=hs(Math.floor(u)+(hh>>1),L*17+3)%7;
      if(q<5){const col=pal[q%6],hg=.12+((q+L)%3)*.03;
        C(col,y0+.02,y0+.02+hg);if(fu>.1&&fu<.9)C(mix(col,'#ffffff',.35),y0+.02,y0+.03);if(q%2===0)C('#e8e0c8',y0+.06,y0+.09)}}
    C('#59616c',.98,1);return true}
  case 'paper':{
    C('#bfb7a0',0,.45);C('#e6e0cc',.01,.44);for(let k=1;k<7;k++)C('#c9c2a8',k*.06,k*.06+.008);
    C('#a8743f',.17,.19);C('#a8743f',.30,.32);if(Math.abs((a*3)%1-.5)<.03)C('#a8743f',0,.45);
    if(((a*26)|0)%3===0)C('#4a4a4a',.36,.40);return true}
  case 'fcab':{
    C('#5e6772',0,.8);C('#7a8590',.02,.78);C('#4a525c',.26,.275);C('#4a525c',.52,.535);
    if(c0<.22){C('#c8ced6',.12,.14);C('#c8ced6',.37,.39);C('#c8ced6',.63,.65);C('#e8e0c8',.17,.22);C('#e8e0c8',.42,.47);C('#e8e0c8',.68,.73)}
    if(a<.04||a>.96)C('#4a525c',0,.8);C('#98a2ac',.78,.8);return true}
  case 'fridge':{
    const v=hh%3,lab=['#58c25e','#d8392b','#4a90e0'][v],body=['#d8e0e6','#c9d2d9','#e2e8ec'][v],f=(a*2)%1;
    C('#323a42',0,.06);C(body,.06,.97);C('#aeb8c0',.97,1);
    if(f<.03||f>.97)C('#2a3038',.06,.97);
    if(Math.abs(f-.1)<.015||Math.abs(f-.9)<.015)C('#8a96a0',.35,.72);
    C(lab,.84,.9);if(((a*36)|0)%5===0)C('#ffffff',.08,.3,.6);
    if(c0<.02)C(((frame>>5)+hh)%7?'#4aff7a':'#ff4a4a',.76,.78);return true}
  case 'tank':{
    C(cyl('#2a2f38'),0,1);C(cyl('#6a7480'),.01,.99);for(let b=1;b<5;b++)C(cyl('#3a424c'),b*.2,b*.2+.015);
    if(((a*14)|0)%2===0)C(cyl('#9aa6b2'),.22,.235);
    if(c0<.05){C('#e8e0c8',.5,.62);C('#d83a2a',.55,.57)}
    if(((a*12)|0)%2)C('#d4b04a',0,.06);C(cyl('#8a95a0'),.97,1);return true}}
  return false}

/* vách tầng hầm: thép + ống dẫn nguyên liệu chạy dọc tường */
function wall(g,h,x,fy,lh,s,Yf,cs){
  const top=fy-lh;h.occ=true;h.full=true;h.top=top;
  const z=((Yf.zone&&Yf.zone[h.my]||[])[h.mx])|0,cold=z===3,fr=h.fr,P=cold?COLD:z===2?DOCS:HALL;
  const F=(c,y0,y1)=>{g.fillStyle=shd(c,s);g.fillRect(x,fy-lh*y1,cs,Math.max(1,lh*(y1-y0)))};
  F(cold?'#cfdde6':'#363d48',0,1);F(cold?'#b8cad6':'#2a3038',0,.22);F('#20252d',.97,1);
  if(fr<.03||fr>.97)F('#1c2027',0,1);
  if(Math.abs((fr*4)%1-.5)<.04){F('#6a727e',.3,.34);F('#6a727e',.62,.66)}
  const id=h.side?h.my:h.mx;
  const pipe=(y0,y1,k)=>{const c=pip(P[((id*3+k)%P.length+P.length)%P.length]),d=y1-y0;
    F(c.d,y0,y1);F(c.b,y0+d*.15,y1-d*.2);F(c.l,y0+d*.6,y0+d*.78)};
  pipe(.76,.88,0);pipe(.60,.67,1);pipe(.18,.27,2);
  if(fr<.05||fr>.95){F('#14171c',.74,.9);F('#14171c',.58,.69);F('#14171c',.16,.29)}
  const hh=hs(h.mx,h.my);
  if(hh%9===0&&Math.abs(fr-.5)<.1&&!cold){F('#b8423a',.9,.96);F('#e8c84a',.78,.9)}
  if(hh%5===0&&fr>.4&&fr<.48)F(pip(P[(id*3+1)%P.length]).b,0,1);
  if(hh%13===0&&Math.abs(fr-.3)<.012)F('#4a90a8',.1,.58);
  if(cold){F('#eaf5fb',0,.08);if(hs((fr*40)|0,h.mx+h.my)%6===0)F('#ffffff',.3,.55)}
  F('#14171c',0,.05);
  const sg=SIGNS.get(h.my*IW+h.mx);
  if(sg&&h.side===1&&fr>.04&&fr<.96){
    const iw=sg.im.width,sx=Math.min(iw-1,Math.floor((sg.i+fr)/3*iw)),y0=fy-lh*.88,hgt=lh*.26;
    g.drawImage(sg.im,sx,0,1,12,x,y0,cs,hgt);g.fillStyle='rgba(0,0,0,'+((1-s)*.5).toFixed(3)+')';g.fillRect(x,y0,cs,hgt)}}
function ceil(g,hor){
  const gr=g.createLinearGradient(0,0,0,hor);gr.addColorStop(0,'rgba(4,6,12,.86)');gr.addColorStop(1,'rgba(10,14,22,.55)');
  g.fillStyle=gr;g.fillRect(0,0,CW,hor)}
function post(g,P,Yf){
  g.save();g.setTransform(1,0,0,1,0,0);
  g.fillStyle='rgba(6,12,24,.32)';g.fillRect(0,0,CW,CH);
  if(hs(frame>>2,5)%29===0){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,CW,CH)}          /* đèn chập chờn */
  const gr=g.createLinearGradient(0,CH*.6,0,CH);gr.addColorStop(0,'rgba(120,160,190,0)');gr.addColorStop(1,'rgba(120,160,190,.12)');
  g.fillStyle=gr;g.fillRect(0,CH*.6,CW,CH*.4);
  if(zoneAt(Yf,P)===3){
    g.fillStyle='rgba(150,215,255,.14)';g.fillRect(0,0,CW,CH);
    for(let i=0;i<6;i++){const q=((frame*.8+i*17)%60)/60;g.globalAlpha=(1-q)*.35;g.fillStyle='#e8f6ff';
      g.fillRect(CW/2-6+Math.sin(i*2+frame*.05)*10+q*6,CH-60-q*40,4+q*8,3+q*5)}
    g.globalAlpha=.8;g.font='bold 9px monospace';g.textAlign='center';g.fillStyle='#bfe8f4';g.fillText('KHO LẠNH  -4°C',CW/2,16);g.globalAlpha=1}
  g.restore()}
function post2D(g,BN){
  g.save();g.setTransform(1,0,0,1,0,0);
  g.fillStyle='rgba(5,10,24,.40)';g.fillRect(0,0,CW,CH);
  const v=g.createRadialGradient(CW/2,CH/2,CH*.3,CW/2,CH/2,CW*.65);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,6,.6)');
  g.fillStyle=v;g.fillRect(0,0,CW,CH);
  const P=ins.find(p=>p.pl===sel),Y=getY4();
  if(P&&zoneAt(Y,P)===3){g.fillStyle='rgba(150,215,255,.16)';g.fillRect(0,0,CW,CH)}
  BN.t++;
  if(BN.t<240){const a=Math.min(1,BN.t/30,(240-BN.t)/50);g.globalAlpha=a;g.textAlign='center';g.font='bold 9px monospace';g.lineWidth=3;g.strokeStyle='#05080f';
    g.strokeText('✦ TẦNG HẦM ✦',CW/2,22);g.fillStyle='#9ad0e8';g.fillText('✦ TẦNG HẦM ✦',CW/2,22);
    g.font='bold 13px monospace';g.strokeText(BN.txt,CW/2,40);g.fillStyle='#ffe9a0';g.fillText(BN.txt,CW/2,40)}
  g.restore()}

window.BSM={build,draw,tile,paint,wall,ceil,post,post2D};
if(window.yachtDream&&window.yachtDream.rebuild)window.yachtDream.rebuild();  /* dựng lại tầng hầm 1 lần, giờ BSM đã có */
console.log('[basement] đã nạp OK');
})();