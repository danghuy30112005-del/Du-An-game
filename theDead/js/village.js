/* ===== village.js: LÀNG BIỆT LẬP SÂU TRONG RỪNG cho Dead Island =====
   Nạp SAU deadisland.js. Chỉ cần sửa deadisland.js đúng 1 chỗ, dòng 1:
   đổi W=180,H=136 thành W=340,H=180 (mở rộng biển).
   - Một "Rừng sâu" mới mọc ở phía đông, nối với rừng lớn có hố sâu của đảo chính.
   - Làng nằm giữa khu rừng này (cách dinh thự ~100 ô), rừng dày bao quanh nên không đi xuyên được.
   - Chỉ có 4 đường mòn vào làng: Tây (từ hố sâu, nối về dinh thự), Bắc, Nam, Đông (ra các bãi biển).
   - Thêm vài đảo nhỏ hoang trên vùng biển mới. */
(()=>{
let VM=null,HOUSES=[],HF={},HDOOR=new Map(),FLD=[],ORC=[],PENF=[],RD=[],YD=[],ANI=[],VTOT=0,VSEEN=false;

/* Vị trí làng và khu rừng bao quanh (toạ độ ô) */
const OX=186,OY=30;                 /* gốc bố cục làng */
const FCX=236,FCY=50,FRX=78,FRY=44; /* hình elip của khu Rừng sâu */

/* Nếu dòng 1 của deadisland.js chưa được sửa, bản đồ quá nhỏ và làng nằm ngoài bản đồ (mất làng): báo lỗi rõ ràng */
if(W<FCX+FRX+10||H<176){
  const b=document.createElement('div');
  b.style.cssText='position:fixed;left:0;right:0;top:0;z-index:99;padding:10px;background:#d8392b;color:#fff;font:600 14px monospace;text-align:center';
  b.textContent='village.js: hãy sửa dòng 1 của deadisland.js thành W=340,H=180 (hiện đang là W='+W+', H='+H+') rồi tải lại trang bằng Ctrl+F5.';
  document.body.appendChild(b);
  return}
  /* ===== Tạo hình Trưởng thôn: khăn xếp, râu bạc, áo dài nâu, chống gậy ===== */
LOOKS.vchief=(R,s)=>{
  const sk='#d9b08a',wh='#eceef2',rb='#6e3b22',rd='#4a2314',gd='#d4a63a';
  LG(R,'#e8dcc0','#3a2a1a',s);
  /* áo dài */
  R(rb,-4,-10,8,7);R(rd,-4,-4,8,1);R(rd,0,-10,1,6);R(gd,-1,-9,1,1);R(gd,-1,-7,1,1);R('#a3202a',-2,-10,4,1);
  R(rb,-5,-10,1,5);R(rb,4,-10,1,5);R(sk,-5,-5,1,1);R(sk,4,-5,1,1);
  /* gậy */
  R('#6b4423',5,-9,1,9);R('#6b4423',5,-10,2,1);
  /* đầu hơi cúi về phía trước */
  R(sk,-2,-15,6,5);R('#1b1b22',-3,-18,8,3);R('#1b1b22',-2,-19,6,1);R('#33333d',-3,-16,8,1);
  R(wh,-3,-15,1,3);R(wh,4,-15,1,3);
  R(wh,-1,-14,2,1);R(wh,2,-14,2,1);
  R('#222',-1,-13,1,1);R('#222',2,-13,1,1);
  R('#b98a64',-2,-12,1,1);R('#b98a64',3,-12,1,1);
  /* râu bạc dài */
  R(wh,-1,-12,4,1);R(wh,-2,-11,6,2);R(wh,-1,-9,4,2);R('#cfd2d8',0,-7,2,1)};
LOOKHT.vchief=17;               /* thấp hơn người thường một chút vì còng lưng */
ROLELOOK['Trưởng thôn']='vchief';

/* ================= NỘI THẤT (mỗi nhà một tầng riêng: FL[7+i]) ================= */
function mkInt(chief){
  const LIV=['#a8896a','#9c7e60'],BED=['#8a6d4b','#7d6244'],KIT=['#b9b09a','#aea58f'];
  const im=Array.from({length:IH},()=>Array(IW).fill(1)),rid=Array.from({length:IH},()=>Array(IW).fill(0)),RM=[],beds=[],seats=[];
  const S=(t,x,y,w=1,h=1)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)im[y+j][x+i]=t};
  const rm=(id,n,f,x0,y0,x1,y1)=>{RM[id]={n,f,x0,y0,x1,y1,s:1};for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){im[y][x]=0;rid[y][x]=id}};
  const dr=(x,y,id,t)=>{im[y][x]=t||32;rid[y][x]=id};
  const bed=(id,x,y,west)=>{S(20,x,y,2);S(21,x,y+1,2,2);const sx=west?x+1:x;beds.push([sx,y+1,id],[sx,y+2,id])};
  const chairs=a=>a.forEach(([x,y])=>{S(44,x,y);seats.push([x,y])});
  let ex,ey,rooms,kit;
  if(!chief){
    /* NHÀ DÂN: phòng khách (bàn trà nhỏ) + 2 phòng ngủ đơn sơ + bếp nhỏ */
    rm(1,'Phòng khách',LIV,30,26,41,31);rm(2,'Phòng ngủ 1',BED,30,20,34,24);rm(3,'Phòng ngủ 2',BED,36,20,41,24);rm(4,'Bếp nhỏ',KIT,43,26,47,31);
    dr(32,25,1);dr(38,25,1);dr(42,28,1);dr(35,32,1,30);
    bed(2,30,20,true);S(24,33,20,2);S(22,34,22);
    bed(3,40,20,false);S(24,36,20,2);S(22,36,22);
    S(2,33,27,5,3);S(35,35,28,2);S(44,34,28);S(44,37,28);
    S(27,30,26);S(27,41,26);S(28,30,30,1,2);S(40,34,25);
    S(25,32,19);S(25,39,19);S(25,31,32);S(25,40,32);S(25,45,25);
    S(54,43,26,3);S(55,46,26,2);S(56,47,27);S(35,45,29,2);
    chairs([[44,29],[47,29],[45,30],[46,30]]);
    ex=35;ey=31;rooms=[1,2,3,4];kit=4;
  }else{
    /* NHÀ TRƯỞNG THÔN: 1 phòng khách + 3 phòng ngủ + bếp có khu nấu ăn và bàn ăn lớn */
    rm(1,'Phòng khách',LIV,24,25,35,31);rm(2,'Phòng ngủ 1',BED,24,18,29,23);rm(3,'Phòng ngủ 2',BED,31,18,36,23);rm(4,'Phòng ngủ 3',BED,38,18,43,23);rm(5,'Bếp và phòng ăn',KIT,37,25,48,31);
    dr(27,24,1);dr(34,24,1);dr(41,24,5);dr(36,28,1);dr(29,32,1,30);
    bed(2,24,18,true);S(24,28,18,2);S(22,29,21);
    bed(3,31,18,true);S(24,35,18,2);S(23,35,20,2);
    bed(4,42,18,false);S(24,38,18,2);S(22,38,21);
    S(25,26,17);S(25,33,17);S(25,40,17);S(25,46,24);S(25,26,32);S(25,32,32);
    S(52,26,26,4);S(2,26,27,6,3);S(35,28,28,2);S(44,27,28);S(44,30,28);S(53,24,25);
    S(27,24,31);S(27,35,31);S(27,35,25);S(23,31,31,4);S(40,28,24);
    S(54,38,25,3);S(55,42,25,2);S(26,44,25,2);S(56,47,25,2);S(54,39,27,5);
    S(35,40,29,6,2);
    chairs([[41,28],[43,28],[45,28],[41,31],[43,31],[45,31],[39,29],[39,30],[46,29],[46,30]]);
    ex=29;ey=31;rooms=[1,2,3,4,5];kit=5;
  }
  return{im,rid,RM,beds,seats,rooms,kit,ex,ey}
}

/* ================= TẠO RỪNG SÂU + LÀNG TRÊN BẢN ĐỒ ================= */
function buildVillage(){
  const rg=mul(((seed|0)^0x5bd1e995)>>>0);
  VM=Array.from({length:H},()=>Array(W).fill(0));
  HOUSES=[];HF={};HDOOR=new Map();FLD=[];ORC=[];PENF=[];RD=[];YD=[];ANI=[];VSEEN=false;
  const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  const set=(x,y,t,c)=>{if(!inb(x,y))return;if(t!=null)m[y][x]=t;if(c!==undefined)VM[y][x]=c};
  const nSea=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>inb(x+a,y+b)&&m[y+b][x+a]===SEA);
  const wood=(x,y)=>hs(x,y)%100<80;/* ~80% là cây: rừng dày, không đi xuyên qua được */

  /* 1) Khu Rừng sâu: elip có viền gồ ghề, nối liền rừng lớn phía đông của đảo chính */
  const K=rg()*6;
  const dE=(x,y)=>{const dx=(x+.5-FCX)/FRX,dy=(y+.5-FCY)/FRY,a=Math.atan2(dy,dx);
    return Math.hypot(dx,dy)/(1+.07*Math.sin(3*a+K)+.05*Math.sin(5*a+2*K)+.03*Math.sin(9*a))};
  for(let y=0;y<H;y++)for(let x=150;x<W;x++)if(m[y][x]===SEA&&dE(x,y)<1)set(x,y,wood(x,y)?TREE:GRASS,0);
  /* cát bờ cũ của rừng đông nay nằm trong đất liền: đổi lại thành rừng */
  for(let y=0;y<H;y++)for(let x=150;x<W;x++)if(m[y][x]===SAND&&dE(x,y)<1.04&&!nSea(x,y))set(x,y,wood(x,y)?TREE:GRASS,0);
  /* 1b) Dải đất phía bắc: nối đất liền phía trên của đảo chính sang Rừng sâu và làng */
  const NY=x=>11+Math.round(2.5*Math.sin(x*.07+K));
  for(let x=112;x<=292;x++){
    const cy=NY(x),hw=7+Math.round(2*Math.sin(x*.13+K*2));
    for(let y=Math.max(0,cy-hw);y<=cy+hw;y++){
      const rag=Math.abs(y-cy)>=hw-1&&hs(x,y)%100<50;/* viền gồ ghề */
      if(m[y][x]===SEA&&!rag)set(x,y,wood(x,y)?TREE:GRASS,0)}}
  /* 2) Khoảng đất trống giữa rừng cho làng (viền gồ ghề) */
  for(let y=OY-6;y<=OY+46;y++)for(let x=OX-4;x<=OX+101;x++){
    const core=x>=OX+2&&x<=OX+97&&y>=OY&&y<=OY+40,edge=x>=OX-2&&x<=OX+99&&y>=OY-4&&y<=OY+44;
    if((core||(edge&&hs(x,y)%100<55))&&inb(x,y)&&m[y][x]!==SEA)set(x,y,GRASS,0)}

  /* 3) Bờ cát quanh khu rừng mới */
  for(let y=0;y<H;y++)for(let x=110;x<W;x++)if((m[y][x]===GRASS||m[y][x]===TREE)&&nSea(x,y))set(x,y,SAND,0);

  /* 4) Vài đảo nhỏ hoang trên vùng biển mới */
  [[190,124,5,3],[252,134,6,4],[322,114,4,3],[326,22,5,3],[300,152,5,3],[198,164,4,3],[160,100,4,3],[170,150,5,3]].forEach(([cx0,cy0,rx,ry])=>{
    for(let y=cy0-ry-1;y<=cy0+ry+1;y++)for(let x=cx0-rx-1;x<=cx0+rx+1;x++)
      if(inb(x,y)&&m[y][x]===SEA&&Math.hypot((x+.5-cx0)/rx,(y+.5-cy0)/ry)<1)set(x,y,SAND,0);
    set(cx0,cy0,GRASS,0);set(cx0-1,cy0,GRASS,0);set(cx0+1,cy0,TREE,0)});

  /* 5) Ruộng lúa, vườn táo / đào, chuồng trại bao quanh làng */
  const rect=(a,b,c,d,f)=>{for(let y=b;y<=d;y++)for(let x=a;x<=c;x++)if(inb(x,y)&&m[y][x]===GRASS&&!VM[y][x])f(x,y)};
  const R2=(a,b,c,d,f)=>rect(a+OX,b+OY,c+OX,d+OY,f);
  [[6,18,20,22],[22,18,38,22],[64,18,78,21],[3,10,8,17]].forEach(r=>R2(...r,(x,y)=>{VM[y][x]='F';FLD.push([x,y])}));
  const orch=(a,b,c,d,ch)=>R2(a,b,c,d,(x,y)=>{if(x%2===0&&y%3===0)set(x,y,TREE,ch);else{VM[y][x]='o';ORC.push([x,y])}});
  orch(4,24,24,34,'A');   /* A = táo */
  orch(26,24,50,35,'P');  /* P = đào */
  const pen=(x0,y0,x1,y1,k,n,pond)=>{
    x0+=OX;x1+=OX;y0+=OY;y1+=OY;if(pond)pond=[pond[0]+OX,pond[1]+OX];
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!inb(x,y)||m[y][x]===SEA)continue;
      const bd=x===x0||x===x1||y===y0||y===y1,w=pond&&x>=pond[0]&&x<=pond[1]&&y>=y0+1&&y<=y1-1;
      set(x,y,HSE,bd?'f':w?'w':'n')}
    PENF.push([Math.floor((x0+x1)/2),y0-1]);
    for(let i=0;i<n;i++)ANI.push({k,x:(x0+1+rg()*(x1-x0-1))*T,y:(y0+2+rg()*(y1-y0-2))*T,vx:0,vy:0,t:ri(1,60),d:1,c:rg()<.4?'#b5651d':'#ffffff',b:[(x0+1)*T+3,(y0+1)*T+5,x1*T-3,y1*T-1]})};
  pen(40,18,47,22,'cow',3);
  pen(49,18,54,22,'hen',6);
  pen(56,18,62,22,'duck',5,[58,60]);

  /* 6) Đường làng + sân rộng của trưởng thôn */
  for(let x=OX+6;x<=OX+96;x++)for(const y of[OY+15,OY+16])if(m[y][x]!==SEA){set(x,y,PATH,0);RD.push([x,y])}
  for(let y=OY+9;y<=OY+13;y++)for(let x=OX+36;x<=OX+52;x++){set(x,y,COURT,0);YD.push([x,y])}
  set(OX+44,OY+14,PATH,0);set(OX+45,OY+14,PATH,0);

  /* 7) Nhà: [x,y,rộng,cao,loại,x cửa] theo bố cục làng */
  const DEF=[[21,5,6,4,'wood',24],[28,5,6,4,'palm',31],[38,5,13,4,'chief',44],[55,5,6,4,'wood',58],[63,5,6,4,'palm',66],
    [9,11,6,3,'palm',12],[16,11,6,3,'wood',19],[26,11,5,3,'palm',28],[53,11,5,3,'wood',55],[60,11,5,3,'palm',62],[68,11,6,3,'wood',70],[75,11,6,3,'palm',77]];
  DEF.forEach(([lx,ly,w,h,kind,ldx],i)=>{
    const x=lx+OX,y=ly+OY,dx=ldx+OX,ch=kind==='chief',dy=y+h,fl=7+i,I=mkInt(ch),
      hz={i,x,y,w,h,kind,chief:ch,dx,dy,fl,ex:I.ex,ey:I.ey,rooms:I.rooms,kit:I.kit,spots:[],seats:[]};
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)set(xx,yy,HSE,'H');
    if(ch)set(dx,dy,COURT,0);else for(let yy=dy;yy<=OY+14;yy++)set(dx,yy,PATH,0);
    FL[fl]=I;
    I.beds.forEach(([bx,by,id])=>hz.spots.push(BEDS.push({fl,room:id,x:bx,y:by,o:null})-1));
    I.seats.forEach(([sx,sy])=>hz.seats.push(SEATS.push({x:sx,y:sy,room:900+fl,fl,o:null})-1));
    HOUSES.push(hz);HF[fl]=hz;HDOOR.set(dy*W+dx,hz)});
  FLD=FLD.filter(([x,y])=>VM[y][x]==='F');

  /* 8) CHỈ 4 ĐƯỜNG MÒN vào làng, xuyên qua rừng rậm */
  const trail=pts=>{
    for(let i=1;i<pts.length;i++){
      const[a,b]=pts[i-1],[c,d]=pts[i],n=Math.max(Math.abs(c-a),Math.abs(d-b));
      for(let j=0;j<=n;j++){
        const x=a+Math.round((c-a)*j/n),y=b+Math.round((d-b)*j/n);
        for(let u=-3;u<=3;u++)for(let v=-3;v<=3;v++){const X=x+u,Y=y+v;if(inb(X,Y)&&(m[Y][X]===TREE||m[Y][X]===ROCK))set(X,Y,GRASS,0)}
        for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++){const X=x+u,Y=y+v;if(inb(X,Y)&&m[Y][X]!==SEA&&m[Y][X]!==HSE)set(X,Y,PATH,0)}}}};
  const RY0=OY+15;
  trail([[166,48],[172,51],[178,47],[184,46],[OX+6,RY0]]);                       /* TÂY: từ hố sâu, nối về dinh thự */
  trail([[100,NY(100)],[OX+86,NY(OX+86)],[OX+86,OY-22]]);                          /* BẮC MỚI: từ đất phía trên của dinh thự tới làng */
  trail([[OX+86,RY0+1],[OX+84,OY+28],[OX+88,OY+42],[OX+86,OY+62]]);              /* NAM: ra bãi biển phía nam */
  trail([[OX+96,RY0],[OX+108,RY0+2],[OX+118,RY0+3],[OX+132,RY0+3]]);             /* ĐÔNG: ra bãi biển phía đông */
  calcSea();
}

/* ================= DÂN LÀNG ================= */
function spawnV(){
  if(!HOUSES.length)return;
  const rg=mul(((seed|0)^0x9e3779b9)>>>0),pk=a=>a[Math.floor(rg()*a.length)];
  const SK=['#f1c27d','#e0ac69','#c68642','#ffdbac'],HR=['#111111','#2b1b0f','#111111','#4a2f17'],
    SH=['#6e7f80','#a0522d','#2e7d6b','#b5651d','#4b6ea8','#8d6e63','#c0a050','#6a8a3a'];/* khác bảng màu NPC dinh thự (tránh trùng cache sprite) */
  const FAM=[['man','woman','child'],['man','woman','child','child'],['elder','woman','man'],['woman','man'],['elder','man','woman','child'],['elder','elder','woman','child'],['man','woman','child']];
  VTOT=0;
  HOUSES.forEach(hz=>{
    const fam=hz.chief?['elder','elder','man','woman','child']:pk(FAM);
    fam.forEach((k,i)=>{
      const boss=hz.chief&&i===0,t=roomTile(hz.fl,1)||[hz.ex,hz.ey],X=t[0]*T+4,Y=t[1]*T+4;
      ins.push({k,vil:1,cls:'v',pl:0,hh:hz,chief:boss,role:boss?'Trưởng thôn':undefined,c:boss?'#8e1f2a':pk(SH),skin:pk(SK),hair:k==='elder'?'#cfd3d8':pk(HR),
        x:X,y:Y,tx:X,ty:Y,sp:k==='child'?.45:k==='elder'?.35:.45,path:[],ph:1,wait:ri(20,150),moving:0,vis:1,delay:0,hide:0,fl:hz.fl,
        n:{hu:ri(10,40),fa:ri(0,20),sl:ri(0,15)},act:'idle',t:0,cd:0,goal:null,say:'',tool:null,hb:hz.spots[i%hz.spots.length]});
      VTOT++})})
}

/* --- đi lại giữa ngoài trời và trong nhà --- */
function enterV(p,hz){people=people.filter(q=>q!==p);p.fl=hz.fl;p.x=p.tx=hz.ex*T+4;p.y=p.ty=hz.ey*T+4;p.path=[];ins.push(p)}
function exitV(p){const hz=p.hh;ins=ins.filter(q=>q!==p);p.fl=0;p.x=p.tx=hz.dx*T+4;p.y=p.ty=(hz.dy+1)*T+4;p.path=[];people.push(p)}
function vnav(p){/* true = đang di chuyển, false = đã tới đích */
  const g=p.goal,F=p.fl,hz=p.hh,tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);let pth;
  if(F){
    if(g.out||g.fl!==F){if(FL[F].im[ty][tx]===30){exitV(p);return true}pth=bfs(F,tx,ty,hz.ex,hz.ey+1)}
    else{if(tx===g.x&&ty===g.y)return false;pth=bfs(F,tx,ty,g.x,g.y)}
  }else{
    if(!g.out){if(tx===hz.dx&&ty===hz.dy){enterV(p,hz);return true}pth=bfsW(tx,ty,hz.dx,hz.dy)}
    else{if(tx===g.x&&ty===g.y)return false;pth=bfsW(tx,ty,g.x,g.y)}
  }
  if(pth&&pth.length){p.path=pth;return true}
  rel(p);p.goal=null;return true}

/* --- thói quen: ngủ 21h-5h30, ăn 3 bữa cùng giờ như dinh thự, ban ngày làm đồng / hái quả / chăn nuôi --- */
function goOutV(p,kind,L){
  if(!L.length)return indoorV(p,'walk');
  const t=L[rnd(L.length)];p.goal={out:1,x:t[0],y:t[1],kind};p.path=[];
  p.tool={work:'hoe',pick:'basket',tend:'bucket'}[kind]||null}
function indoorV(p,kind,ids){
  const L=ids||p.hh.rooms,t=roomTile(p.hh.fl,L[rnd(L.length)]);
  if(t){p.goal={fl:p.hh.fl,x:t[0],y:t[1],kind:kind||'walk'};p.path=[]}}
function vseat(p){
  const i=p.hh.seats.find(j=>!SEATS[j].o);if(i==null)return false;
  const s=SEATS[i];s.o=p;p.si=i;p.goal={fl:s.fl,x:s.x,y:s.y,kind:'eat'};p.path=[];return true}
function vsleep(p){
  const b=BEDS[p.hb];if(!b||(b.o&&b.o!==p))return startAct(p,'sleep',0);
  b.o=p;p.bi=p.hb;p.goal={fl:b.fl,x:b.x,y:b.y,kind:'sleep'};p.path=[]}
function vthink(p){
  const h=hour(),n=p.n,hz=p.hh,r=Math.random(),ms=MEAL(h),mk=Math.floor(gm/1440)*3+ms;
  p.wait=ri(40,130);p.tool=null;
  if(h>=21||h<5.5)return vsleep(p);
  if((ms>=0&&p.ate!==mk)||n.hu>=70){if(ms>=0)p.ate=mk;if(vseat(p))return}
  if(n.fa>=80)return startAct(p,'rest',ri(10,18));
  const day=h>=6.5&&h<17.5;
  if(p.k==='child')return day&&r<.7?goOutV(p,'walk',r<.3?YD:RD):indoorV(p,'walk');
  if(p.k==='elder')return p.chief?(r<.5?goOutV(p,'walk',YD):indoorV(p,'walk')):(day&&r<.35?goOutV(p,'tend',PENF):indoorV(p,r<.5?'clean':'walk'));
  if(!day)return(r<.4&&h>=16.5&&h<18.5)?indoorV(p,'vcook',[hz.kit]):indoorV(p,'walk');
  if(p.k==='woman')return r<.2?indoorV(p,'clean'):r<.35?indoorV(p,'vcook',[hz.kit]):r<.55?goOutV(p,'tend',PENF):goOutV(p,'work',FLD);
  return r<.5?goOutV(p,'work',FLD):r<.8?goOutV(p,'pick',ORC):goOutV(p,'tend',PENF)}

/* ================= VẼ ================= */
function wins(hz){const Wd=hz.w*T,dl=(hz.dx-hz.x)*T,fr=hz.chief?[.1,.27,.6,.78]:[.14,.72];return fr.map(f=>Math.round(Wd*f)).filter(wx=>Math.abs(wx+2-dl-4)>=8)}
function drawHouse(hz){
  const X=hz.x*T,Y=hz.y*T,Wd=hz.w*T,Hd=hz.h*T,k=hz.kind,palm=k==='palm',ch=k==='chief',rh=ch?13:9,RH=rh+8,dl=(hz.dx-hz.x)*T,
    R=(c,a,b,w,hh)=>{cx.fillStyle=c;cx.fillRect(X+a,Y+b,w,hh)},
    nz=(i,n)=>hs(hz.x*7+i*131,hz.y*13+i*57)%n,/* nhiễu cố định theo từng nhà */
    MS=['#5f7f3a','#6f8f45','#4e6b30'],
    WL=palm?['#b8a370','#9d8851','#75622f']:ch?['#d2c4a2','#b5a582','#7a7260']:['#8a5e38','#74482a','#5a3920'],
    RC=palm?['#a88f44','#8f7430','#bfa95e']:ch?['#8a3c24','#74321d','#a8553b']:['#4d3219','#3e2813','#664020'];
  R('rgba(0,0,0,.25)',1,Hd-1,Wd,2);
  R(WL[0],0,6,Wd,Hd-6);
  if(palm)for(let i=1;i<Wd;i+=3)R(WL[1],i,6,1,Hd-6);else for(let j=9;j<Hd;j+=3)R(WL[1],0,j,Wd,1);
  if(ch){R('#8d8570',0,Hd-5,Wd,5);for(let i=0;i<Wd;i+=6)R('#6f6a58',i,Hd-5,1,5)}
  R(WL[2],0,Hd-1,Wd,1);R(WL[2],0,6,1,Hd-6);R(WL[2],Wd-1,6,1,Hd-6);
  for(let j=0;j<RH;j++){const o=Math.round((RH-1-j)*.55)-1;
    R(RC[(j>>1)%2],o,j-rh,Wd-2*o,1);
    if(j%2)for(let i=o+1+(j%4);i<Wd-o-1;i+=4)R(RC[2],i,j-rh,1,1)}
  R('rgba(0,0,0,.3)',0,8,Wd,1);
  if(palm)for(let i=0;i<Wd;i+=2)R(RC[1],i,8+(i%3===0?1:0),1,1);
  /* cửa gỗ cũ, sờn */
  R('#2a1a0c',dl,Hd-10,8,10);R('#5a3a1e',dl+1,Hd-9,6,9);R('#755029',dl+1,Hd-9,6,1);R('#241608',dl+3,Hd-8,1,5);R('#b8922f',dl+5,Hd-5,1,1);
  /* cửa sổ: kính ngả màu, có cánh cửa chớp xộc xệch */
  wins(hz).forEach((wx,wi)=>{R('#4a2f17',wx-1,Hd-15,6,6);R('#7fb0c8',wx,Hd-14,4,4);R('#d8ecf4',wx,Hd-14,1,1);R('#4a2f17',wx+2,Hd-14,1,4);
    if(nz(wi+130,2)===0){R('#5a3a1e',wx-3,Hd-14,2,4);R('#5a3a1e',wx-3,Hd-10,1,1)}
    else{R('#5a3a1e',wx+4,Hd-14,2,3)}});
  if(!palm){const c=Wd-9,a=cx.globalAlpha;R('#5d626b',c,-rh-3,4,7);R('#454a53',c-1,-rh-4,6,2);cx.globalAlpha=a*.35;R('#dddddd',c+((frame>>4)%3),-rh-8-((frame>>3)%6),3,2);cx.globalAlpha=a}
  if(ch){R('#5a3a1e',dl-6,Hd-14,2,14);R('#5a3a1e',dl+12,Hd-14,2,14);R('#74321d',dl-8,Hd-16,28,3);
    const f=Math.round(Wd/2);R('#9aa0ac',f,-rh-12,1,12);for(let i=0;i<6;i++)R('#a83428',f+1+i,-rh-12+Math.round(Math.sin(frame*.15+i*.8)*.8),1,4)}
  /* ---- dấu vết thời gian ---- */
  for(let i=0;i<8;i++){const j=2+nz(i,RH-4),o=Math.round((RH-1-j)*.55)-1,span=Wd-2*o-6;if(span<2)continue;
    R(MS[i%3],o+2+nz(i+20,span),j-rh,2+nz(i+40,3),1)}                       /* rêu trên mái */
  for(let i=0;i<3;i++){const j=3+nz(i+60,RH-6),o=Math.round((RH-1-j)*.55)-1,span=Wd-2*o-4;if(span<2)continue;
    R('#241608',o+1+nz(i+70,span),j-rh,2,1)}                                  /* lỗ thủng mái */
  for(let i=0;i<3;i++){const x=2+nz(i+80,Wd-4);if(x>=dl-2&&x<dl+9)continue;
    R(WL[2],x,Hd-11-nz(i+90,2),1,3+nz(i+95,3))}                               /* vết nứt tường */
  if(ch)for(let i=0;i<3;i++){const x=2+nz(i+100,Wd-8);if(x>=dl-4&&x<dl+11)continue;
    R('#a8704c',x,Hd-13+nz(i+110,3),3,2);R('#8a5a3c',x+1,Hd-12+nz(i+110,3),1,1)} /* vữa bong lộ gạch */
  for(let i=0;i<Wd;i+=3){if(i>=dl-1&&i<dl+9)continue;if(nz(i+120,100)<55)R(MS[i%3],i,Hd-3+(i%2),2,2)} /* rêu chân tường */
}
function animals(){
  ANI.forEach(a=>{
    if(--a.t<=0){a.vx=rnd(3)-1;a.vy=rnd(3)-1;a.t=ri(40,140);if(a.vx)a.d=a.vx}
    const sp=a.k==='cow'?.12:a.k==='duck'?.18:.22,B=a.b;
    a.x=Math.max(B[0],Math.min(B[2],a.x+a.vx*sp));a.y=Math.max(B[1],Math.min(B[3],a.y+a.vy*sp));
    const x=Math.round(a.x),y=Math.round(a.y),f=a.d||1,R=(c,p,q,w,h)=>{cx.fillStyle=c;cx.fillRect(x+(f>0?p:-p-w),y+q,w,h)};
    R('rgba(0,0,0,.25)',-5,0,11,2);
    if(a.k==='cow'){R('#f4f1ea',-5,-7,10,5);R('#3b2a1e',-3,-7,3,3);R('#3b2a1e',1,-5,3,2);R('#3b2a1e',-4,-2,1,3);R('#3b2a1e',-1,-2,1,3);R('#3b2a1e',2,-2,1,3);R('#3b2a1e',4,-2,1,3);
      R('#f4f1ea',5,-8,4,4);R('#e8a0a0',8,-6,1,2);R('#dddddd',5,-9,1,1);R('#222222',7,-7,1,1);R('#3b2a1e',-6,-6,1,3)}
    else if(a.k==='hen'){R(a.c,-2,-4,4,3);R(a.c,2,-6,2,2);R('#e0302a',3,-7,1,1);R('#ffb300',4,-5,1,1);R('#cfcfcf',-3,-5,1,2);R('#ffb300',-1,-1,1,1);R('#ffb300',1,-1,1,1)}
    else{R('#f5f5f0',-3,-3,6,3);R('#d8d8d0',-1,-3,3,1);R('#2f7d4a',3,-5,2,2);R('#ffb300',5,-4,1,1);R('#ffb300',-1,0,1,1)}})}

/* ================= BỌC CÁC HÀM CÓ SẴN CỦA GAME ================= */
const _gen=gen;gen=function(sd){_gen(sd);buildVillage()};
const _initRes=initRes;initRes=function(){_initRes();spawnV()};
const _restore=restore;restore=function(s){_restore(s);spawnV()};
const _snapP=snapP;snapP=function(){const P=people,I=ins;people=P.filter(p=>!p.vil);ins=I.filter(p=>!p.vil);try{return _snapP()}finally{people=P;ins=I}};/* dân làng không lưu vào save */
const _think=think;think=function(p){return p.vil?vthink(p):_think(p)};
const _nav=nav;nav=function(p){return p.vil?vnav(p):_nav(p)};
const _arrive=arrive;arrive=function(p){
  if(!p.vil)return _arrive(p);
  const k=p.goal.kind;if(k==='eat'||k==='sleep'||k==='clean')return _arrive(p);
  p.goal=null;p.wait=ri(40,120);
  if(k==='work'||k==='pick')startAct(p,'garden',ri(40,100));
  else if(k==='tend')startAct(p,'garden',ri(20,40));
  else if(k==='vcook')startAct(p,'cook',ri(20,40))};

/* NPC dinh thự chỉ đi dạo trong vùng đảo chính (làng biệt lập, họ không tự đi tới) */
randLand=function(){
  for(let i=0;i<80;i++){const x=ri(3,176),y=ri(3,133);if(walkT(x,y))return{out:1,x,y,kind:'walk'}}
  return null};

/* sprite: nón lá cho người lớn */
const _generic=generic;generic=function(R,s,p){_generic(R,s,p);
  if(p.vil&&(p.k==='man'||p.k==='woman')){R('#c9a64b',-6,-18,12,1);R('#e2c777',-5,-19,10,1);R('#e2c777',-3,-20,6,1);R('#c9a64b',-1,-21,2,1);R('#8a5a2e',-3,-17,6,1)}};
/* vác cuốc / giỏ / xô khi đi làm */
const _person=person;person=function(p){_person(p);
  if(!p.vil||p.fl||!p.tool||p.act==='sleep')return;
  const x=Math.round(p.x),y=Math.round(p.y),sw=p.act==='garden'?((frame>>3)&1):0,R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(x+a,y+b,w,h)};
  if(p.tool==='hoe'){R('#6b4423',4,-15+sw,1,12);R('#aab0ba',3,-16+sw,3,2)}
  else if(p.tool==='basket'){R('#8a5a2e',4,-9,5,4);R('#c9a64b',4,-9,5,1);R('#e0302a',5,-10,2,1);R('#ffa6c0',7,-10,1,1)}
  else{R('#8a8f98',4,-8,4,3);R('#555a63',4,-8,4,1)}};

/* ruộng lúa, hàng rào, ao vịt (vẽ lên nền đất) */
const _land=land;land=function(x,y){_land(x,y);if(!VM)return;const c=VM[y][x];if(!c)return;
  const px=x*T,py=y*T,h=hs(x,y),R=(col,a,b,w,hh)=>{cx.fillStyle=col;cx.fillRect(px+a,py+b,w,hh)};
  if(c==='F'){
    const st=Math.floor(gm/1440)%4,hh=[2,3,4,5][st],col=st===3?['#e8c547','#f7e08a']:['#58b04a','#86d466'];
    R('#6b5530',0,0,8,8);if(st<2)R('#7ea9b8',0,(y&1)*4+2,8,1);
    [5,8].forEach((by,r)=>{for(let i=0;i<4;i++){const sw=((frame>>5)+x+i+r)&1;R(col[0],1+i*2,by-hh,1,hh);R(col[1],1+i*2+(st>1?sw:0),by-hh-1,1,1)}})}
  else if(c==='f'){R('#8a5a2e',0,2,8,1);R('#8a5a2e',0,5,8,1);R('#6b4423',0,1,1,7);R('#6b4423',7,1,1,7)}
  else if(c==='w'){R('#4a95d8',0,0,8,8);if((x*3+y+(frame>>4))%5===0)R('#bfe3ff',(h>>3)&5,(h>>6)&5,3,1);if(h%7===0){R('#3f8a35',(h>>4)&5,(h>>8)&5,3,2)}}
  else if(c==='n'){if(h%3===0)R('#c9b25a',(h>>3)&5,(h>>6)&5,2,1)}};

/* quả táo (đỏ) / đào (hồng) trên cây */
const _tree=tree;tree=function(x,y){_tree(x,y);if(!VM)return;const c=VM[y][x];if(c!=='A'&&c!=='P')return;
  const px=x*T,py=y*T,hv=hs(x,y);cx.fillStyle=c==='A'?'#e0302a':'#ffa6c0';
  [[1,-2],[5,-1],[3,1],[6,-4],[2,2],[4,-4]].forEach(([a,b],i)=>{if(i<3||(hv>>i)&1)cx.fillRect(px+a,py+b,1,2)})};

/* nhà dân + mây: vẽ cùng lớp với lâu đài (trước cây và người) */
const _clouds=clouds;clouds=function(){_clouds();
  if(iAlpha<=0)return;
  /* thêm bóng mây trên vùng biển và đất mới mở rộng */
  const k=.1*iAlpha*(1-nightK());
  if(k>0){cx.fillStyle='rgba(0,20,40,'+k.toFixed(3)+')';
    for(let i=0;i<10;i++){const X=((frame*.09+i*330+120)%(WW+360))-180,Y=60+i*140+Math.sin(i*5)*40,S=44*(1+.3*Math.sin(i+2));
      for(let j=-8;j<=8;j++){const w=Math.round(Math.sqrt(1-(j/8)*(j/8))*S);cx.fillRect(Math.round(X-w),Math.round(Y+j*2),w*2,2)}}}
  if(!VM)return;
  cx.globalAlpha=iAlpha;
  HOUSES.forEach(hz=>{const X=hz.x*T,Y=hz.y*T;if(X>camX+CW+20||X+hz.w*T<camX-20||Y>camY+CH+20||Y+hz.h*T<camY-30)return;drawHouse(hz)});
  cx.globalAlpha=1};

/* vật nuôi + ánh đèn cửa sổ ban đêm */
const _glow=glow;glow=function(){_glow();if(!VM||iAlpha<=0)return;
  cx.globalAlpha=iAlpha;animals();cx.globalAlpha=1;
  const nk=nightK();if(nk<=0)return;
  cx.save();cx.globalCompositeOperation='lighter';const fl=.85+.15*Math.sin(frame*.1);
  HOUSES.forEach(hz=>{const Y=hz.y*T+hz.h*T-14;wins(hz).forEach(wx=>{const X=hz.x*T+wx;
    cx.fillStyle='#ffb347';cx.globalAlpha=.12*nk;cx.fillRect(X-3,Y-3,10,10);cx.globalAlpha=.8*nk*fl;cx.fillRect(X,Y,4,4)})});
  cx.restore();cx.globalAlpha=1};

/* thông tin dân làng trên bảng bên trái */
const _info=infoUI;infoUI=function(){_info();const e=$('sl');if(!e||!VM)return;
  const v=people.concat(ins).filter(p=>p.vil),c=k=>v.filter(p=>p.k===k).length;
  e.innerHTML+='<div class="vil"><b>Dân làng: '+v.length+'/'+VTOT+'</b><br>Người lớn: '+(c('man')+c('woman'))+' · Người già: '+c('elder')+' · Trẻ em: '+c('child')+'</div>'};
const st=document.createElement('style');
st.textContent='#sl .vil{margin-top:6px;padding-top:6px;border-top:2px dashed var(--ink)}';
document.head.appendChild(st);

/* thông báo khi người chơi lần đầu tới được làng */
const _signTick=signTick;signTick=function(){_signTick();
  if(VSEEN||inside||frame%10)return;
  const P=people.find(p=>p.pl===sel&&!p.hide);
  if(P&&P.x>(OX+4)*T&&P.x<(OX+98)*T&&P.y>(OY+2)*T&&P.y<(OY+42)*T){VSEEN=true;cap('Bạn đã tìm thấy một ngôi làng biệt lập sâu trong rừng. Dân làng đang làm ruộng và chăn nuôi.')}};
/* đưa người chơi n vào / ra nhà dân (dùng putIn/putOut/syncView có sẵn của deadisland.js) */
function goIn(n,fl,x,y){
  const q=allPl().find(p=>p.pl===n);if(!q)return;
  putIn(q,fl,x,y);
  if(q.pl===sel)syncView(true)}
function goOut(n,px,py){
  const q=allPl().find(p=>p.pl===n);if(!q)return;
  putOut(q,px,py);
  if(q.pl===sel)syncView(true)}
/* người chơi bước vào / ra khỏi nhà dân */
function enterH(n,hz){trans={t:0,cb:()=>{goIn(n,hz.fl,hz.ex+.5,hz.ey,hz.dx,hz.dy);
  cap(hz.chief?'Nhà trưởng thôn: 3 phòng ngủ, phòng khách, bếp có bàn ăn lớn.':'Nhà dân '+(hz.kind==='palm'?'lợp lá cọ':'bằng gỗ')+': phòng khách có bàn trà, 2 phòng ngủ, bếp nhỏ.')}}}
function leaveH(n,fl){const hz=HF[fl];trans={t:0,cb:()=>{goOut(n,hz.dx*T+4,(hz.dy+1)*T+4);cap('Bạn đã bước ra đường làng.')}}}
const _doors=doors;doors=function(){_doors();
  if(trans||state!=='island')return;
  const S=(inside?ins:people).find(p=>p.pl===sel);if(!S)return;
  if(!inside){const hz=HDOOR.get(Math.floor(S.y/T)*W+Math.floor(S.x/T));if(hz)enterH(sel,hz)}
  else if(S.fl>=7){const r=FL[S.fl]&&FL[S.fl].im[Math.floor(S.y/T)];if(r&&r[Math.floor(S.x/T)]===30)leaveH(sel,S.fl)}};

/* câu thoại của dân làng */
LN.v=['Lúa năm nay tốt quá!','Chào bạn, sao bạn tìm được tới tận đây?','Táo năm nay chín sớm lắm.','Trời đẹp, ra đồng thôi.','Ghé nhà tôi uống trà nhé.','Rừng quanh đây dày lắm, đừng đi lạc nhé.','Đào năm nay ngọt lắm đấy.'];

/* tạo lại thế giới một lần để bản đồ đầu tiên đã có làng */
reset();
})();


/* ===== witch.js: PHÁP SƯ GIÀ + NHÀ TÂM LINH CỔ KÍNH trong làng =====
   Nạp SAU village.js (và market.js, playerkit.js nếu có). Không cần sửa file cũ.
   - Nhà tâm linh: đá cổ phủ rêu, mái đá sẫm, sọ thú trên đỉnh, bùa đỏ, đá cổ khắc ký tự, cửa sổ ánh lục lam.
   - Bà pháp sư (ngoại hình: mũ nhọn, khăn che mặt, tóc xoăn dài, mặt dây chuyền tam giác).
   - Lại gần bà (có mũi tên ▼) rồi bấm E để nói chuyện. Bấm 1, 2... hoặc Esc.
   - Nói chuyện xong bà đưa 1 "Danh sách tìm đồ" vào túi đồ. Bấm B mở túi, bấm vào danh sách để xem 5 vật phẩm bà cần. */
(()=>{
if(typeof LOOKS==='undefined'||!LOOKS.vchief||W<340||H<180){console.warn('witch.js: hãy nạp SAU village.js (và deadisland.js phải có W=340,H=180)');return}

const MX=186,MY=30;                 /* gốc bố cục làng (giống village.js) */
const pk=a=>a[rnd(a.length)];
let SH=null,WQ={};                  /* SH = vị trí nhà; WQ[p] = người chơi p đã nghe lời tiên tri */

/* ---------- Danh sách vật phẩm bà cần (icon pixel nhúng sẵn) ---------- */
const IMG={"tear": "data:image/png;base64,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", "gift": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFE0lEQVR4nO2WX2xUdRbHP+fe+5s7d2bazrSdMsiCKLhBiVFBywKm+MALkpUHfFETEjXxzWz2kZcl8VWNCZj4ojHZ8LBijCS6zSa4m5Zs2brbFVlI45+ASq2FdlrmT+fOzJ177/FhKtgUoUjflvN2J/ec7/d8z/eeOXAn/t9DVrLY3r17dXZ29qbvdXd3y+Dg4MoQGBgYoFarKcCTW/u4NwdSaqAdLhoDfgDZFNQDpBEBykfnm8y2XBke/gfO7YAfOHCAoDSlDdMAYPNqh6f7e5GLNSgkQUHnAnRtBplrIPMxSMzpqQkysa379++X21Jgy5Ytum1jijefvw8QkBgi4LsGrE6A5wAWKqAoggAKkz7vjc3x2mjx1ylw6NAhTpw4oS88kaV/TRqmAwA07SBpGwouuBaNS01K42UE6NzUiXdXsl1AQQGNo1snsGvXLj7/zyn67zE8dk+KzavSaKlFY6KO3ZPAwdC40gKgdaWF5UcgCmF83Xq3TCAMYy2XSrz6hwexdEHSPpfiUJHOaot03WVmtAxAupBg1QMdqAhxd+JaEb3m/lvyQH9/vz7dn+OFgT6ypQB6PUQUmW7w/ak5olBxMg75vX0IIJZg2W0IESAApuq8+OEkJauTdRs3yrIU2LNnD+VyWZ/9XZbHNqTIdRhQQYOQoBTin68Rh4rGSlQPmT9bRRBMh00670Iugfohl6frfDA6Qy22CR1LDh8+fPMRHDx4kLnpSb4qT/PUo93c1WWImjF2xia63KJVbFKdCRBbsBe6rX1ZBUvw8klSSRvpNOCHTF/yeefzK6RTaTl16mNgGR44efKkblpl8cmfHgKgfK5K9UyZNTtylMYrxEnDb55Zg3xbh1jRnxILHpqyAEW/8RHV6877hgR27Nihz92fZtu9acACYkCJ44jieBm3K4GbdZFLAWgbWmyBHhd1wVIAgbzHe6NTfHqhwbq710gykb4xgd27d9Oo1Xikz2Hr3R4Pr88sgNPuKFb8YoDxDNqIaEzUSWYNJAWSFqRtCCKUCBIOIxcrnCnGnJkVhoYGb65AtVql6df01ec24xQMZBJwVdyrIlOeqFFeEHbtth4kY5Dswud2JQBbiHsNf/zzebK5HoaGhpZMYckPO3fu1CfWurz8aJb8b3PMfVYkKrfIP9DFpdMl3C5DR6ENIr0JSDmAYhsLqjFUwzbNHsOJryq8/tdJcqvXS6FQ4MiRI0uaXaKA7/sQ2uRTLpoAbcUEpYDSN1XCSojEiu9AZnMnVtqAafeg1QBE8Q385V+zkLGYqimlhvLJ++9fT+jFBI4dO8bIyAifjY7gOoAdoa0IFSFqQeViHYBmFVqtJpnHE21bLFijORMQdxiKxubd/82jGuMYh7GxsRsuu6sEjh8/ztmzZ/Xtp9axdVMO8i4TRy/Qe18nvTt7FiWpDYIi0wHqh4jC749+zcx8jOd5/PvT0WVv2EUjELEQoHnZpzpeIf94gUSHA64gPzOfH8S8cvQCNGOI2n+zHdkeIhNLKuUuF/sagX379sF8RR/OGEwjYuqHOue+rpFfZSBoLkmqB8rfv6hepSRYbFhfkOHBX571L4UAbN++XbvCJm9tyAEwXKnzxmRt4XywaF8ZPy0iC8uyOX36vytyTzoDAwP6ZEZ5yFi8dGEOAM/zMMb8DMBelGTbi59vi0ClUuF8bGPSBj/ZXpHiZWRs+G8rBnJDAp7ncS6C8XmLkZF/ruiZfifuxHLiRzuXENYtwKmNAAAAAElFTkSuQmCC", "snake": "data:image/png;base64,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", "stone": "data:image/png;base64,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", "flower": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD7klEQVR4nMWWzWtcZRSHn/d+zL1zZzLJTNpOpxrBSm2roBK6qKCL0EUpSFHEgBbXNeI/oAi2FMSFrroxdiPUhUQUFQnu6sKPUq2FtLVoG61pYttMkpm583W/j4tqEBfJzNxCz+7Ce895znt+53evoo+QhVMk5oLolRNKpk/jhR6JHpGbmiK++aZoI48plZ3sJyWqp8K33wJlQpInvvmLyGdlpUZHRYtjRNNI1qqK51ckqjylbOYBH1V+pycAo6dT4kssjtJ/H0EuGeiVsqDroBSQoGcrkpyrkeyqEe/x0VUkvTbXG4BWVPH1a8K3LlppHAIXWi4q8FFmBhkaRsuPY/54XQJzgezOXT0VpxdKmZ4mbDdE8xsw9jDa/FWirkfVbVGwbJq+z2hhCNO2kId2I4tXCJ2t2Hv2KnXwYDoAmZ7G80PJmDqMjKCuXqHttggloZhz1s812h0MTeHk88juR1D1OqHXJZPNKXX06IYAG46g02mJbWVQ3Tbqrxs0uh6OYZDP6LQ8nyhKMAyd4ZxDGEQ03SaFy3NIsYRhO/jtxqZa2BBAN01AAyAKY0QEM2PQ9LrcqjWpdTxKjk25WGDItumGAWEUYaDulE02bH5zAGu/pbzv22J1W8RxRN62ub68SsMLqPtdojjBaya0o4iCbTFWGiEKAoxui0ADe2h4U41tLsLZWTxNQ7vws6hOh/nlWzQerbF4o8vSjj9xftvClu06O5ceZO+OCtg28RP71FoQcN/hw5veQM/r8m98fuZlxK9KFLdYXKmSJAkZI49pl9UrL3zdb7p/BtxHPDtxmoJTQqGTtx1AYRjDDFJ8IACAny5cIY6EISdH6Cc0qv5AxaFXJ/xfrNZ8Wm6TVl3Hykc42YH6GBzAXdWVbZmSG/bwWllCigMDDIT+/smLaGxn61gJCUqcOP5V32K+K3Hq00OSNsfgw7tLsaEGLl1+XVYaKyyvLtENE8IkJvQ7TB35bv3KL92ewXIbVH0X3/VxfZc7O2ExOXE8HUAQBXzxyTlyxYRi4QE1/vQzzM19IAAffvkSvn+b2vwshq7EbTdZWFpgeW0NzVCMju5I/0My/vh7/0lykTPnD60/NZu/Si5b4fwf17A0g6kXv1HH3t4vrXqGYrlANlfqpX6fa+hCNruN6Y8PEMZ18s4u5XbPrqc59sbZvrehLxFOTLxGLr9P5ZytQuRjZ/IUMkUZ23Zg4DUc6MWZmRmqwbuilM6rR35I5QEDreHk5CQiMVtG96c2oIF9wMyX1Up9Tk5+9OS9ATj63CylkfuJkk4qN0zlhNlCRSnSuXFqK9aTdDJIBVDAQk/Zwz3/GKUCSBIDdDMVwN8nCprvtGs6vgAAAABJRU5ErkJggg=="};
const QI=[
  {id:'wtear',k:'tear',emoji:'💧',n:'Nước mắt của hi vọng',d:'Giọt nước bảy sắc, kết tinh từ hi vọng.'},
  {id:'wgift',k:'gift',emoji:'🪶',n:'Món quà đứa con của rừng thiêng',d:'Chiếc lông rực lửa, quà của rừng thiêng.'},
  {id:'wsnake',k:'snake',emoji:'🐍',n:'Rắn từ bầy rắn mặt trăng',d:'Con rắn tím quấn quanh nấm và tinh thể.'},
  {id:'wstone',k:'stone',emoji:'💎',n:'Viên đá trong hang cổ',d:'Viên đá pha lê lấy từ hang cổ.'},
  {id:'wflower',k:'flower',emoji:'🌸',n:'Bông hoa của đầm lầy',d:'Bông hoa hồng mọc giữa đầm lầy.'}];
const LISTN='Danh sách tìm đồ',INVKEY='deadisland:inv1';
function ensureItems(){/* thêm vật phẩm vào túi đồ của playerkit.js (nạp trước hay sau đều được) */
  const I=window.ITEMS;if(!I||I.wlist)return;
  I.wlist={icon:'📜',name:LISTN,d:'Danh sách vật phẩm Pháp sư cần. Bấm vào để xem chi tiết.'};
  QI.forEach(q=>{I[q.id]={icon:q.emoji,name:q.n,d:q.d}})}
ensureItems();addEventListener('load',ensureItems);
function bagOf(n){try{const I=JSON.parse(localStorage.getItem(INVKEY))||{};return Array.isArray(I[n])?I[n]:[]}catch(_){return[]}}
function giveList(n){
  ensureItems();
  if(bagOf(n).includes('wlist'))return;
  if(typeof window.giveItem==='function'&&window.giveItem(n,'wlist'))
    cap('Bà pháp sư đưa cho P'+n+' một danh sách. Bấm B mở túi đồ rồi bấm vào danh sách để xem.');
  else if(typeof window.giveItem!=='function')cap('Cần nạp playerkit.js để nhận danh sách trong túi đồ.')}

/* ---------- Bảng yêu cầu: hiện trong túi đồ khi bấm vào Danh sách ---------- */
const sty=document.createElement('style');
sty.textContent='#wq{margin:0 0 8px;padding:8px;background:#1b1230;border:2px solid var(--sun);line-height:1.4}'+
 '#wq h3{margin:0 0 6px;font-size:14px;color:var(--sun)}'+
 '#wq .qr{display:flex;align-items:center;gap:10px;margin:4px 0;font-size:13px}'+
 '#wq img{width:36px;height:36px;flex:none;object-fit:contain;image-rendering:pixelated;background:#26304f;border:2px solid var(--ink);padding:2px}'+
 '#wq .ck{margin-left:auto;font-size:16px}';
document.head.appendChild(sty);
function showQ(on){
  const inv=$('inv');if(!inv)return;
  let p=$('wq');
  if(!p){p=document.createElement('div');p.id='wq';p.hidden=true;inv.insertBefore(p,inv.querySelector('.row'))}
  if(!on){p.hidden=true;return}
  const have=bagOf(sel);
  p.innerHTML='<h3>📜 Pháp sư cần tìm</h3>'+QI.map(q=>'<div class="qr"><img src="'+IMG[q.k]+'" alt=""><span>'+q.n+'</span><b class="ck">'+(have.includes(q.id)?'✔':'☐')+'</b></div>').join('');
  p.hidden=false}
document.addEventListener('click',e=>{
  const s=e.target.closest&&e.target.closest('#invGrid .slot');if(!s)return;
  showQ(s.getAttribute('aria-label')===LISTN)},true);
if($('inv'))new MutationObserver(()=>{if($('inv').hidden)showQ(false)}).observe($('inv'),{attributes:true,attributeFilter:['hidden']});

/* ---------- Hội thoại ---------- */
const WN=[
  {t:'Một bà lão mặc áo choàng tím, che nửa mặt bằng khăn xanh lục, quanh người treo đầy bùa chú, đang ngước nhìn bạn.',o:[{t:'Chào bà',go:1}]},
  {w:1,t:'Các cậu là người đến từ tòa lâu đài sao? Tôi chưa từng gặp cậu bao giờ.',o:[{t:'Đúng vậy, cháu là người mới đến.',go:2}]},
  {w:1,t:'Các người nên cẩn thận đi. Các người đã bị thứ không nên đụng trong cái hang đó để ý tới rồi.',o:[{t:'Tiếp tục',go:3}]},
  {w:1,t:'Số mệnh đã thay đổi, đường đã rẽ, không thể quay lại.',o:[{t:'Tiếp tục',go:4}]},
  {w:1,t:'Ở phía trái ngôi làng có một cái hang. Trong đó có một thứ đen tối sẵn sàng tiêu diệt những kẻ bén mảng đến bí mật ở trong đó. Các người đã bị nó nhắm tới, để càng lâu thì tỷ lệ chết càng cao.',o:[{t:'Vậy làm sao để rũ bỏ lời nguyền này?',go:5}]},
  {w:1,t:'Ta không thể xóa bỏ lời nguyền. Lời nguyền này các người phải tự tìm cách giải quyết.',o:[{t:'Tiếp tục',go:6}]},
  {w:1,t:'Các người hãy tìm cho ta những thứ ta cần. Ta sẽ đưa cho các ngươi một "con đường". Cầm lấy danh sách này.',o:[{t:'Kết thúc hội thoại',end:1}]},
  {w:1,t:'Hãy tìm cho ta những thứ ta cần, rồi ta sẽ đưa cho các ngươi một "con đường". Danh sách ở trong túi của các ngươi.',o:[{t:'Cháu hiểu rồi',end:1}]}];
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
  if(a.end){const n=TK.P.pl;WQ[n]=1;TK=null;$('dlg').hidden=true;
    cap('Bà pháp sư muốn các bạn tìm những thứ bà cần. Hãy quay lại khi đã sẵn sàng.');giveList(n);return}
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
  RM[1]={n:'Nhà của Pháp sư',f:['#38334a','#322d44'],x0:30,y0:20,x1:41,y1:28,s:1};
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
  const p={k:'woman',pl:0,cls:'v',witch:1,look:'witch',role:'Pháp sư',c:'#3a1f5c',skin:'#e8c9b8',hair:'#2a1a2e',fl:20,x:36*T+4,y:23*T+4,sp:.3,
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
  if(q.pl===sel){syncView(true);cap('Nhà của bà pháp sư: tường đá cổ phủ rêu, sọ thú, nến xanh, nồi thuốc sủi bọt và quả cầu pha lê. Lại gần bà rồi bấm E để nói chuyện.')}})}
function leaveShrine(q){warp(q,()=>{putOut(q,SH.dx*T+4,(SH.dy+1)*T+4);
  if(q.pl===sel){syncView(true);cap('Bạn đã bước ra khỏi nhà pháp sư.')}})}
const _doors=doors;doors=function(){_doors();
  if(!SH||trans||state!=='island')return;
  people.filter(p=>p.pl).forEach(p=>{if(Math.floor(p.x/T)===SH.dx&&Math.floor(p.y/T)===SH.dy)enterShrine(p)});
  ins.filter(p=>p.pl&&p.fl===20).forEach(p=>{const r=FL[20].im[Math.floor(p.y/T)];if(r&&r[Math.floor(p.x/T)]===32)leaveShrine(p)})};

/* ---------- Hình dáng: phù thủy mũ nhọn, khăn che mặt, tóc xoăn dài, mặt dây chuyền tam giác ---------- */
LOOKS.witch=(R,s)=>{
  const sk='#e8c9b8',hr='#2a1a2e',hl='#4a2f4a',rb='#3a1f5c',rd='#241040',rl='#5a3a86',
    ht='#2b1650',hd='#1d0f38',hh='#4a2a80',tl='#1fb8a8',gd='#e6c25a',mk='#1c8f93',mkd='#0f5f66',ey='#7cfff0';
  /* chân + váy xòe */
  R('#15101c',-3,-1,2,1);R('#15101c',1,-1,2,1);
  R(rb,-6,-5,12,4);R(rd,-6,-2,12,1);R(rl,-5,-5,1,3);
  /* thân áo choàng */
  R(rb,-5,-11,10,7);R(rd,0,-11,1,9);R(rl,-4,-10,1,5);R(rd,3,-10,2,6);
  /* tay + tay cầm muôi gỗ */
  R(rb,-6,-10,2,6);R(rb,4,-10,2,6);R(sk,-6,-4,2,1);R(sk,4,-4,2,1);
  R('#6b4423',5,-14,1,10);R('#6b4423',4,-15,3,1);R('#4fe3d0',4,-16,2,1);
  /* mặt dây chuyền tam giác */
  R(gd,0,-11,1,1);R(gd,0,-10,1,1);R(gd,-1,-9,3,1);R(gd,0,-8,1,1);
  /* tóc xoăn dài phía sau */
  R(hr,-6,-19,12,12);R(hr,-7,-17,3,13);R(hr,4,-17,3,13);
  R(hr,-8,-12,1,4);R(hr,7,-10,1,5);R(hr,-8,-6,1,3);R(hr,7,-4,1,3);
  R(hl,-6,-15,1,3);R(hl,5,-13,1,3);R(hl,-7,-9,1,3);R(hl,6,-8,1,2);
  /* mặt: tai nhọn, mắt phát sáng, khăn che mũi miệng */
  R(sk,-3,-19,6,6);R(sk,-5,-16,2,1);R(sk,3,-16,2,1);
  R(hd,-3,-19,6,1);
  R(ey,-2,-17,1,1);R(ey,1,-17,1,1);
  R(mk,-3,-15,6,3);R(mkd,-3,-13,6,1);R(mkd,-1,-15,2,1);
  /* mũ: vành rộng, dây thắt xanh lục có khóa vàng, đỉnh nhọn cong */
  R(hd,-9,-19,18,1);R(ht,-8,-20,16,1);R(hd,-8,-20,2,1);
  R(ht,-5,-21,10,1);R(tl,-5,-22,10,1);R(gd,-1,-22,2,1);
  R(ht,-4,-23,8,1);R(hh,-3,-23,1,1);R(ht,-3,-24,6,1);R(ht,-2,-25,5,1);R(ht,-1,-26,3,1);R(ht,0,-27,2,1);R(ht,2,-27,2,1);R(tl,3,-26,1,1)};
LOOKHT.witch=28;

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

/* ---------- Vẽ ngôi nhà tâm linh cổ kính bên ngoài ---------- */
function drawShrine(){
  const X=SH.x*T,Y=SH.y*T,Wd=SH.w*T,Hd=SH.h*T,dl=(SH.dx-SH.x)*T,rh=13,RH=21,fr=frame,
    R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(X+a,Y+b,w,h)},
    nz=(i,n)=>hs(SH.x*7+i*131,SH.y*13+i*57)%n,
    RC=['#2b2538','#221d30','#3d3552'],TL='#46e0d0',pul=.55+.45*Math.sin(fr*.07);
  R('rgba(0,0,0,.3)',-3,Hd-1,Wd+6,3);
  /* hai phiến đá cổ khắc ký tự phát sáng trước nhà */
  [-13,Wd+7].forEach(a=>{R('#2f2b3b',a,Hd-15,7,15);R('#4a4658',a+1,Hd-16,5,15);R('#5d586d',a+1,Hd-16,1,15);R('#3a3646',a+4,Hd-14,2,14);R('#15121c',a,Hd-15,1,1);
    cx.globalAlpha=iAlpha*pul;R(TL,a+3,Hd-12,1,5);R(TL,a+2,Hd-10,3,1);R(TL,a+2,Hd-7,1,1);R(TL,a+4,Hd-7,1,1);cx.globalAlpha=iAlpha});
  /* nấm tím + cỏ dại bên trái */
  for(let i=0;i<3;i++){const x=-24+i*4;R('#d8d0bc',x,Hd-3,1,3);R(['#8a63a8','#6b4a86','#b07cff'][i],x-1,Hd-5,3,2)}
  /* tường đá cổ */
  R('#58536a',0,6,Wd,Hd-6);
  for(let j=9;j<Hd;j+=4){R('#383446',0,j,Wd,1);for(let i=((j>>2)&1)*5;i<Wd;i+=10)R('#383446',i,j-3,1,3)}
  for(let i=0;i<16;i++)R(i%2?'#6b667e':'#4a4659',2+nz(i,Wd-6),8+nz(i+30,Hd-14),3,2);
  R('#322e3f',0,Hd-4,Wd,4);R('#201d2a',0,Hd-1,Wd,1);R('#6b667e',0,6,1,Hd-6);R('#2a2636',Wd-1,6,1,Hd-6);
  for(let i=0;i<4;i++){const x=4+nz(i+80,Wd-8);if(x>dl-3&&x<dl+11)continue;R('#1c1926',x,10+nz(i+90,6),1,4+nz(i+95,4));R('#1c1926',x+1,14+nz(i+90,6),1,2)}
  for(let i=0;i<Wd;i+=2){if(i>=dl-1&&i<dl+9)continue;if(nz(i+120,100)<65)R(i%4?'#4a6a36':'#3a5a2c',i,Hd-6-nz(i+7,3),2,3+nz(i+9,3))}
  [3,Wd-6].forEach(a=>{for(let j=0;j<20;j+=2)R(j%4?'#3a5a2c':'#557a40',a+((j>>1)%2),8+j,2,2)});
  /* ký tự cổ phát sáng trên tường */
  cx.globalAlpha=iAlpha*pul*.8;R(TL,4,Hd-10,1,4);R(TL,3,Hd-9,3,1);R(TL,Wd-6,Hd-10,1,4);R(TL,Wd-7,Hd-8,3,1);cx.globalAlpha=iAlpha;
  /* mái đá sẫm phủ rêu */
  for(let j=0;j<RH;j++){const o=Math.round((RH-1-j)*.5)-1;R(RC[(j>>1)%2],o,j-rh,Wd-2*o,1);if(j%2)for(let i=o+1+(j%4);i<Wd-o-1;i+=4)R(RC[2],i,j-rh,1,1)}
  R('rgba(0,0,0,.4)',0,8,Wd,1);R('#15121c',-1,7,Wd+2,1);
  for(let i=0;i<9;i++){const j=2+nz(i+10,RH-5),o=Math.round((RH-1-j)*.5)-1,sp=Wd-2*o-6;if(sp<2)continue;R(['#4a6a36','#3a5a2c','#5c7e42'][i%3],o+2+nz(i+20,sp),j-rh,2+nz(i+40,3),1+(i%2))}
  R('#0e0c14',Wd-26,-rh+9,3,1);R('#0e0c14',16,-rh+10,2,1);
  /* ống khói đá + khói lục lam */
  R('#4a4658',Wd-14,-rh+1,6,9);R('#2f2b3b',Wd-15,-rh,8,2);R('#5d586d',Wd-14,-rh+1,1,9);
  cx.globalAlpha=iAlpha*.4;R('#9fe8e0',Wd-13+((fr>>4)%3),-rh-4-((fr>>3)%7),3,2);cx.globalAlpha=iAlpha;
  /* sọ thú có sừng trên đỉnh mái, mắt phát sáng */
  const mx=Math.round(Wd/2);
  R('#cbbf9c',mx-6,-rh-7,1,4);R('#cbbf9c',mx-5,-rh-4,2,1);R('#cbbf9c',mx+5,-rh-7,1,4);R('#cbbf9c',mx+3,-rh-4,2,1);
  R('#e8e0cc',mx-3,-rh-5,6,5);R('#cbbf9c',mx-2,-rh,4,1);R('#15121c',mx-2,-rh-3,2,2);R('#15121c',mx+1,-rh-3,2,2);
  cx.globalAlpha=iAlpha*pul;R(TL,mx-2,-rh-3,1,1);R(TL,mx+2,-rh-3,1,1);cx.globalAlpha=iAlpha;
  /* quạ đậu trên mái */
  R('#0d0b12',10,-8,4,3);R('#0d0b12',13,-9,2,2);R('#d9a441',15,-9,1,1);R('#0d0b12',8,-7,2,1);
  /* cửa vòm gỗ nặng có đai sắt */
  R('#6b667e',dl-2,Hd-14,12,2);R('#58536a',dl-2,Hd-13,2,13);R('#58536a',dl+8,Hd-13,2,13);
  R('#0f0c16',dl,Hd-12,8,12);R('#3a2412',dl+1,Hd-11,6,11);R('#4d321a',dl+1,Hd-11,2,11);
  R('#15121a',dl+1,Hd-8,6,1);R('#15121a',dl+1,Hd-4,6,1);R('#0f0c16',dl+3,Hd-11,1,11);
  cx.globalAlpha=iAlpha*pul;R(TL,dl+5,Hd-6,1,1);cx.globalAlpha=iAlpha;
  /* sọ trên cửa */
  R('#e8e0cc',dl+2,Hd-20,4,3);R('#cbbf9c',dl+3,Hd-17,2,1);R('#15121c',dl+2,Hd-19,1,1);R('#15121c',dl+5,Hd-19,1,1);
  cx.globalAlpha=iAlpha*pul;R(TL,dl+2,Hd-19,1,1);R(TL,dl+5,Hd-19,1,1);cx.globalAlpha=iAlpha;
  /* cửa sổ nhỏ ánh lục lam */
  [9,Wd-17].forEach(wx=>{R('#58536a',wx-1,Hd-21,8,10);R('#15121c',wx,Hd-20,6,8);cx.globalAlpha=iAlpha*(.6+.4*pul);R('#2fd6c6',wx+1,Hd-19,4,6);cx.globalAlpha=iAlpha;R('#15121c',wx+2,Hd-19,1,6);R('#15121c',wx+1,Hd-17,4,1)});
  /* bùa giấy đỏ treo dưới mái + chuông xương */
  [dl-7,dl+14,dl+19].forEach((a,i)=>{const sw=Math.round(Math.sin(fr*.05+i));R('#8a7a5a',a,8,1,1);R('#b3261e',a+sw,9,3,8);R('#e8d08a',a+1+sw,10,1,2);R('#e8d08a',a+sw,13,3,1)});
  {const sw=Math.round(Math.sin(fr*.06));R('#8a7a5a',dl+34,8,8,1);R('#e8e0cc',dl+35+sw,9,1,5);R('#e8e0cc',dl+37+sw,9,1,7);R('#e8e0cc',dl+39+sw,9,1,4)}
  /* nến lục lam trước cửa */
  [[dl-14,Hd+3],[dl-8,Hd+5],[dl+14,Hd+5],[dl+20,Hd+3]].forEach(([a,b],i)=>{R('#d8d0bc',a,b-3,2,3);R(((fr>>3)+i)%2?'#7cfff0':'#2fd6c6',a,b-5,1,2)})}
const _clouds=clouds;clouds=function(){_clouds();
  if(!SH||iAlpha<=0)return;
  const X=SH.x*T,Y=SH.y*T;
  if(X+SH.w*T+20<camX||X-30>camX+CW||Y+SH.h*T+30<camY||Y-40>camY+CH)return;
  cx.globalAlpha=iAlpha;drawShrine();cx.globalAlpha=1};
const _glow=glow;glow=function(){_glow();
  if(!SH||iAlpha<=0)return;const nk=nightK();if(nk<=0)return;
  cx.save();cx.globalCompositeOperation='lighter';const fl=.85+.15*Math.sin(frame*.1);
  const L=(c,x,y,w,h)=>{cx.fillStyle=c;cx.globalAlpha=.13*nk;cx.fillRect(x-4,y-4,w+8,h+8);cx.globalAlpha=.8*nk*fl;cx.fillRect(x,y,w,h)};
  const X=SH.x*T,Y=SH.y*T,Hd=SH.h*T,Wd=SH.w*T;
  L('#2fd6c6',X+10,Y+Hd-19,4,6);L('#2fd6c6',X+Wd-16,Y+Hd-19,4,6);L('#46e0d0',X+Wd/2-2,Y-16,1,1);L('#46e0d0',X+Wd/2+2,Y-16,1,1);
  L('#46e0d0',X-10,Y+Hd-12,1,5);L('#46e0d0',X+Wd+10,Y+Hd-12,1,5);
  cx.restore();cx.globalAlpha=1};

/* ---------- Vẽ bên trong nhà (tường đá cổ, thảm trận pháp, quả cầu pha lê, nồi thuốc lục lam, sọ, nến xanh) ---------- */
const _drawIn=drawIn;drawIn=function(){
  if(curF!==20)return _drawIn();
  const I=ins;ins=I.filter(p=>p.fl!==20);
  try{_drawIn()}finally{ins=I}
  const R=(c,a,b,w,h)=>{cx.fillStyle=c;cx.fillRect(a,b,w,h)},fr=frame,F=FL[20],TL='#7cfff0',pul=.55+.45*Math.sin(fr*.07);
  /* tường đá sẫm phủ rêu (đè lên tường sáng mặc định, giữ nguyên cửa sổ / đồ đạc) */
  for(let y=18;y<=30;y++)for(let x=29;x<=42;x++){
    if(F.im[y][x]!==1)continue;let nr=0;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if((F.rid[y+j]||[])[x+i]===1)nr=1;
    if(!nr)continue;
    const px=x*T,py=y*T,h=hs(x,y);
    R((x+y)%2?'#4b4659':'#443f52',px,py,T,T);R('#2c2838',px,py+T-2,T,2);R('#5d586d',px,py,T,1);
    if(h%3===0)R('#5d586d',px+(h>>3)%5,py+2,3,2);
    if(h%5===0)R('#3f5a30',px,py+T-4,3+(h>>4)%3,3)}
  /* ký tự cổ phát sáng trên tường phía bắc + tơ nhện góc nhà */
  cx.globalAlpha=.35+.45*pul;[[31,19],[36,19],[40,19]].forEach(([x,y],i)=>{const px=x*T+2,py=y*T+1;R(TL,px,py,1,5);R(TL,px-1,py+1,3,1);if(i%2)R(TL,px+1,py+3,2,1);else R(TL,px-2,py+3,2,1)});cx.globalAlpha=1;
  cx.globalAlpha=.45;for(let i=0;i<8;i++){R('#d8dae6',30*T+i,20*T+i,1,1);R('#d8dae6',41*T+7-i,20*T+i,1,1)}R('#d8dae6',30*T,20*T+8,6,1);R('#d8dae6',41*T+2,20*T+8,6,1);cx.globalAlpha=1;
  /* thảm trận pháp ngũ giác teal */
  const X0=Math.round(35.5*T),Y0=Math.round(26.2*T),rx=28,ry=17;
  [[1,'#12101e'],[.88,'#2a6a70'],[.8,'#171a2a'],[.55,'#1f5a62'],[.45,'#171a2a']].forEach(([k,c])=>{
    const a=Math.round(rx*k),b=Math.round(ry*k);for(let j=-b;j<=b;j++){const w=Math.round(a*Math.sqrt(1-(j/b)*(j/b)));R(c,X0-w,Y0+j,w*2,1)}});
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;R(TL,Math.round(X0+Math.cos(a)*16)-1,Math.round(Y0+Math.sin(a)*9)-1,2,2)}
  R(TL,X0-1,Y0-1,3,3);R('#e8fffb',X0,Y0,1,1);
  /* quả cầu pha lê + sọ + nến lục lam trên bàn */
  R('#3a2410',285,176,6,2);R('#7ad8ff',285,170,6,6);R('#e8fffb',286,171,2,2);
  cx.globalAlpha=.18+.1*Math.sin(fr*.08);R('#46e0d0',280,166,16,14);cx.globalAlpha=1;
  R('#e8e0cc',291,172,4,4);R('#cbbf9c',292,176,2,1);R('#15121c',291,173,1,1);R('#15121c',294,173,1,1);
  [[281,174]].forEach(([a,b],i)=>{R('#d8d0bc',a,b,2,4);R(((fr>>3)+i)%2?TL:'#2fd6c6',a,b-2,2,2)});
  /* nồi thuốc lớn sủi bọt ánh lục lam */
  cx.globalAlpha=.2+.1*Math.sin(fr*.09);R('#2fd6c6',234,192,28,22);cx.globalAlpha=1;
  R('rgba(0,0,0,.3)',241,207,14,2);R('#ff5a1f',244,206,3,2);R('#ffd23f',250,206,2,2);
  R('#1b1b22',242,199,12,8);R('#2e2e38',241,198,14,2);R('#37f0d8',243,198,10,1);R('#9affee',244,198,3,1);
  if((fr>>3)%2){R('#9affee',245,195,1,2);R('#37f0d8',250,196,1,1)}else{R('#9affee',250,195,1,2);R('#37f0d8',246,196,1,1)}
  cx.globalAlpha=.35;R('#9affee',246+((fr>>4)%3),190-((fr>>3)%6),2,2);cx.globalAlpha=1;
  /* bó thảo dược, chuỗi xương và hộp sọ treo trên tường phía bắc */
  [31,33,38,40].forEach((x,i)=>{R('#6a9a3a',x*T+1,19*T+1,3,5);R(i%2?'#b07cff':'#c0392b',x*T+4,19*T+1,1,4)});
  [[32,19],[35,19],[37,19]].forEach(([x,y],i)=>{const a=x*T+(i===1?1:5),b=y*T+1;R('#e8e0cc',a,b,1,5);R('#e8e0cc',a+2,b,1,3);R('#cbbf9c',a+1,b+5,1,1)});
  /* nến lục lam dưới sàn + chai lọ + sọ nhỏ */
  [[33,27],[38,26],[31,24]].forEach(([x,y],i)=>{const a=x*T+3,b=y*T+4;R('#d8d0bc',a,b,2,3);R(((fr>>3)+i)%2?TL:'#2fd6c6',a,b-2,2,2);cx.globalAlpha=.18;R('#46e0d0',a-5,b-6,12,10);cx.globalAlpha=1});
  [[39,23],[32,28]].forEach(([x,y])=>{const a=x*T+1,b=y*T+4;R('#e8e0cc',a,b,4,3);R('#15121c',a,b+1,1,1);R('#15121c',a+3,b+1,1,1)});
  I.filter(p=>p.fl===20).sort((a,b)=>a.y-b.y).forEach(person);
  /* đốm sáng huyền bí lục lam bay lơ lửng */
  for(let i=0;i<12;i++){const x=30*T+((i*53+fr*.3*(1+i%3*.3))%(12*T)),y=28*T-((fr*.25+i*37)%(9*T));cx.globalAlpha=.6;R(i%3?TL:'#c9a8ff',Math.round(x),Math.round(y),1,1)}
  cx.globalAlpha=1};

/* tạo lại thế giới một lần để bản đồ đầu tiên đã có nhà pháp sư */
reset();
})();