/* ===== Lưu điểm cao (an toàn khi bị chặn storage) ===== */
const store={
  get(k){try{return +localStorage.getItem('goc:'+k)||0}catch(e){return 0}},
  set(k,v){try{localStorage.setItem('goc:'+k,v)}catch(e){}}
};
const $=s=>document.querySelector(s);
let current=null, cleanup=()=>{};

/* ===== Danh sách game: thêm game mới chỉ cần thêm 1 object ở đây ===== */
const GAMES=[
  {id:'pixel',icon:'🖼️',name:'Pixel World',desc:'Chi thức dẫn tới chiến thắng.',noBest:true,start:pixelWorld},
  {id:'dead',icon:'🏝️',name:'Dead Island',desc:'Thuyền đắm, hòn đảo hoang đang chờ bạn.',noBest:true,start:deadIsland},
  {id:'snake',icon:'🐍',name:'Rắn săn mồi',desc:'Ăn táo, đừng cắn vào đuôi.',unit:'điểm',start:snake},
  {id:'ttt',icon:'⭕',name:'Cờ ca-rô 3×3',desc:'Bạn (X) đấu với máy (O).',unit:'ván thắng',start:ttt},
  {id:'mem',icon:'🃏',name:'Lật thẻ ghi nhớ',desc:'Tìm đủ 8 cặp với ít lượt nhất.',unit:'lượt (ít hơn là tốt)',start:memory}
];

function renderHub(){
  $('#tiles').innerHTML='';
  GAMES.forEach(g=>{
    const b=document.createElement('button');
    b.className='tile';
    const best=store.get(g.id);
    b.innerHTML=`<span class="ico">${g.icon}</span><b>${g.name}</b><span class="d">${g.desc}</span>`+(g.noBest?'':`<span class="best">Kỷ lục: ${best||'—'}</span>`);
    b.onclick=()=>open(g);
    $('#tiles').appendChild(b);
  });
}
function open(g){
  current=g;
  $('#hub').hidden=true;$('#play').hidden=false;
  $('#gtitle').textContent=g.name;
  run();
}
function run(){cleanup();cleanup=()=>{};$('#area').innerHTML='';$('#ginfo').textContent='';cleanup=current.start($('#area'),$('#ginfo'))||(()=>{})}
$('#restart').onclick=run;
$('#back').onclick=()=>{cleanup();cleanup=()=>{};$('#play').hidden=true;$('#hub').hidden=false;renderHub()};

/* ===== Pixel World (nhúng từ pixelW.html, để cùng thư mục) ===== */
function pixelWorld(area,info){
  const f=document.createElement('iframe');
  f.className='pw';
  f.src='pixelW.html';
  f.title='Pixel World: Thế giới OOP';
  area.appendChild(f);
  info.textContent='Bấm vào bản đồ để tạo nhân vật, rồi bấm Bắt đầu.';
  return()=>f.remove();
}

/* ===== Dead Island (nhúng từ deadisland.html) ===== */
function deadIsland(area,info){
  const f=document.createElement('iframe');
  f.className='pw';
  f.src='deadisland.html';
  f.title='Dead Island';
  area.appendChild(f);
  info.textContent='Bấm Bắt đầu, nhập số người chơi (1–6) rồi nhấn Enter.';
  return()=>f.remove();
}

/* ===== Game 1: Rắn ===== */
function snake(area,info){
  const N=20,S=20;
  const cv=document.createElement('canvas');cv.width=cv.height=N*S;cv.style.width='min(100%,400px)';
  area.appendChild(cv);
  const ctx=cv.getContext('2d');
  let body=[{x:10,y:10},{x:9,y:10},{x:8,y:10}],dir={x:1,y:0},next={x:1,y:0},apple,score=0,over=false,timer;
  const place=()=>{do{apple={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)}}while(body.some(p=>p.x===apple.x&&p.y===apple.y))};
  place();
  const turn=(x,y)=>{if(x!==-dir.x||y!==-dir.y)next={x,y}};
  function draw(){
    ctx.fillStyle='#f4f8ff';ctx.fillRect(0,0,cv.width,cv.height);
    ctx.fillStyle='#ff6b57';ctx.beginPath();ctx.arc(apple.x*S+S/2,apple.y*S+S/2,S/2-2,0,7);ctx.fill();
    body.forEach((p,i)=>{ctx.fillStyle=i?'#3ddc97':'#1b2a5c';ctx.fillRect(p.x*S+1,p.y*S+1,S-2,S-2)});
  }
  function tick(){
    dir=next;
    const h={x:body[0].x+dir.x,y:body[0].y+dir.y};
    if(h.x<0||h.y<0||h.x>=N||h.y>=N||body.some(p=>p.x===h.x&&p.y===h.y)){
      over=true;clearInterval(timer);
      if(score>store.get('snake'))store.set('snake',score);
      info.textContent=`Thua rồi! Điểm: ${score}. Bấm "Chơi lại" để thử tiếp.`;return;
    }
    body.unshift(h);
    if(h.x===apple.x&&h.y===apple.y){score++;place();info.textContent=`Điểm: ${score}`}else body.pop();
    draw();
  }
  info.textContent='Dùng phím mũi tên / WASD hoặc nút bên dưới.';
  const keys={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
  const onKey=e=>{const k=keys[e.key];if(k){e.preventDefault();turn(...k)}};
  document.addEventListener('keydown',onKey);
  const pad=document.createElement('div');pad.className='dpad';
  [['',''],['▲',[0,-1]],['',''],['◀',[-1,0]],['▼',[0,1]],['▶',[1,0]]].forEach(([t,v])=>{
    if(!t){pad.appendChild(document.createElement('span'));return}
    const b=document.createElement('button');b.className='btn';b.textContent=t;b.setAttribute('aria-label','Rẽ '+t);
    b.onclick=()=>turn(...v);pad.appendChild(b);
  });
  area.appendChild(pad);
  let sx,sy;
  cv.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  cv.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;
    Math.abs(dx)>Math.abs(dy)?turn(dx>0?1:-1,0):turn(0,dy>0?1:-1);
  });
  draw();timer=setInterval(tick,115);
  return()=>{clearInterval(timer);document.removeEventListener('keydown',onKey)};
}

/* ===== Game 2: Cờ ca-rô 3x3 ===== */
function ttt(area,info){
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const b=Array(9).fill(''),wrap=document.createElement('div');wrap.className='ttt';
  const cells=b.map((_,i)=>{const c=document.createElement('button');c.className='cell';c.setAttribute('aria-label','Ô '+(i+1));c.onclick=()=>play(i);wrap.appendChild(c);return c});
  area.appendChild(wrap);
  let over=false,t;
  const win=(s)=>L.find(l=>l.every(i=>b[i]===s));
  const draw=()=>cells.forEach((c,i)=>c.textContent=b[i]);
  function end(msg,line){over=true;if(line)line.forEach(i=>cells[i].classList.add('win'));info.textContent=msg}
  function play(i){
    if(over||b[i])return;
    b[i]='X';draw();
    let w=win('X');if(w){store.set('ttt',store.get('ttt')+1);return end('Bạn thắng! 🎉',w)}
    if(b.every(Boolean))return end('Hòa!');
    t=setTimeout(()=>{
      const m=aiMove();b[m]='O';draw();
      w=win('O');if(w)return end('Máy thắng!',w);
      if(b.every(Boolean))end('Hòa!');else info.textContent='Lượt của bạn.';
    },300);
  }
  function aiMove(){
    const free=b.map((v,i)=>v?-1:i).filter(i=>i>=0);
    for(const s of ['O','X'])for(const i of free){b[i]=s;const ok=!!win(s);b[i]='';if(ok)return i}
    if(!b[4])return 4;
    return free[Math.floor(Math.random()*free.length)];
  }
  info.textContent='Bạn đi trước (X).';
  return()=>clearTimeout(t);
}

/* ===== Game 3: Lật thẻ ===== */
function memory(area,info){
  const em=['🍎','🚀','🐱','⚽','🎸','🌵','🍕','👾'];
  const deck=[...em,...em].sort(()=>Math.random()-.5);
  const wrap=document.createElement('div');wrap.className='mem';area.appendChild(wrap);
  let first=null,lock=false,moves=0,pairs=0,t;
  const cards=deck.map((e,i)=>{
    const c=document.createElement('button');c.className='card';c.textContent='?';c.setAttribute('aria-label','Thẻ '+(i+1));
    c.onclick=()=>flip(i);wrap.appendChild(c);return c;
  });
  function show(i){cards[i].classList.add('open');cards[i].textContent=deck[i]}
  function hide(i){cards[i].classList.remove('open');cards[i].textContent='?'}
  function flip(i){
    if(lock||i===first||cards[i].classList.contains('done'))return;
    show(i);
    if(first===null){first=i;return}
    moves++;info.textContent=`Lượt: ${moves}`
    if(deck[first]===deck[i]){
      cards[first].classList.add('done');cards[i].classList.add('done');first=null;pairs++;
      if(pairs===em.length){
        const b=store.get('mem');if(!b||moves<b)store.set('mem',moves);
        info.textContent=`Hoàn thành sau ${moves} lượt! 🎉`;
      }
    }else{
      lock=true;const f=first;first=null;
      t=setTimeout(()=>{hide(f);hide(i);lock=false},700);
    }
  }
  info.textContent='Lật hai thẻ giống nhau để ghép cặp.';
  return()=>clearTimeout(t);
}

renderHub();