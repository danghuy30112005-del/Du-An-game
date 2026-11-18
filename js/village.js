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
    WL=palm?['#d8c08a','#c4a868','#9a7e46']:ch?['#e9dcc0','#cdbd9c','#8d8570']:['#9c6b3f','#86582e','#6b4423'],
    RC=palm?['#c9a64b','#b08a38','#e2c777']:ch?['#a3482a','#8a3b22','#c8664a']:['#5f3d20','#4e3118','#7a4c2a'];
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
  R('#3a2410',dl,Hd-10,8,10);R('#6b4423',dl+1,Hd-9,6,9);R('#8a5a2e',dl+1,Hd-9,6,1);R('#ffd23f',dl+5,Hd-5,1,1);
  wins(hz).forEach(wx=>{R('#4a2f17',wx-1,Hd-15,6,6);R('#9ad0f0',wx,Hd-14,4,4);R('#ffffff',wx,Hd-14,1,1);R('#4a2f17',wx+2,Hd-14,1,4)});
  if(!palm){const c=Wd-9,a=cx.globalAlpha;R('#6d727c',c,-rh-3,4,7);R('#555a63',c-1,-rh-4,6,2);cx.globalAlpha=a*.35;R('#dddddd',c+((frame>>4)%3),-rh-8-((frame>>3)%6),3,2);cx.globalAlpha=a}
  if(ch){R('#6b4423',dl-6,Hd-14,2,14);R('#6b4423',dl+12,Hd-14,2,14);R('#8a3b22',dl-8,Hd-16,28,3);
    const f=Math.round(Wd/2);R('#9aa0ac',f,-rh-12,1,12);for(let i=0;i<6;i++)R('#c0392b',f+1+i,-rh-12+Math.round(Math.sin(frame*.15+i*.8)*.8),1,4)}
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