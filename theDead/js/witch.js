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
const IMG={"tear": "data:image/png;base64,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", "gift": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFE0lEQVR4nO2WX2xUdRbHP+fe+5s7d2bazrSdMsiCKLhBiVFBywKm+MALkpUHfFETEjXxzWz2kZcl8VWNCZj4ojHZ8LBijCS6zSa4m5Zs2brbFVlI45+ASq2FdlrmT+fOzJ177/FhKtgUoUjflvN2J/ec7/d8z/eeOXAn/t9DVrLY3r17dXZ29qbvdXd3y+Dg4MoQGBgYoFarKcCTW/u4NwdSaqAdLhoDfgDZFNQDpBEBykfnm8y2XBke/gfO7YAfOHCAoDSlDdMAYPNqh6f7e5GLNSgkQUHnAnRtBplrIPMxSMzpqQkysa379++X21Jgy5Ytum1jijefvw8QkBgi4LsGrE6A5wAWKqAoggAKkz7vjc3x2mjx1ylw6NAhTpw4oS88kaV/TRqmAwA07SBpGwouuBaNS01K42UE6NzUiXdXsl1AQQGNo1snsGvXLj7/zyn67zE8dk+KzavSaKlFY6KO3ZPAwdC40gKgdaWF5UcgCmF83Xq3TCAMYy2XSrz6hwexdEHSPpfiUJHOaot03WVmtAxAupBg1QMdqAhxd+JaEb3m/lvyQH9/vz7dn+OFgT6ypQB6PUQUmW7w/ak5olBxMg75vX0IIJZg2W0IESAApuq8+OEkJauTdRs3yrIU2LNnD+VyWZ/9XZbHNqTIdRhQQYOQoBTin68Rh4rGSlQPmT9bRRBMh00670Iugfohl6frfDA6Qy22CR1LDh8+fPMRHDx4kLnpSb4qT/PUo93c1WWImjF2xia63KJVbFKdCRBbsBe6rX1ZBUvw8klSSRvpNOCHTF/yeefzK6RTaTl16mNgGR44efKkblpl8cmfHgKgfK5K9UyZNTtylMYrxEnDb55Zg3xbh1jRnxILHpqyAEW/8RHV6877hgR27Nihz92fZtu9acACYkCJ44jieBm3K4GbdZFLAWgbWmyBHhd1wVIAgbzHe6NTfHqhwbq710gykb4xgd27d9Oo1Xikz2Hr3R4Pr88sgNPuKFb8YoDxDNqIaEzUSWYNJAWSFqRtCCKUCBIOIxcrnCnGnJkVhoYGb65AtVql6df01ec24xQMZBJwVdyrIlOeqFFeEHbtth4kY5Dswud2JQBbiHsNf/zzebK5HoaGhpZMYckPO3fu1CfWurz8aJb8b3PMfVYkKrfIP9DFpdMl3C5DR6ENIr0JSDmAYhsLqjFUwzbNHsOJryq8/tdJcqvXS6FQ4MiRI0uaXaKA7/sQ2uRTLpoAbcUEpYDSN1XCSojEiu9AZnMnVtqAafeg1QBE8Q385V+zkLGYqimlhvLJ++9fT+jFBI4dO8bIyAifjY7gOoAdoa0IFSFqQeViHYBmFVqtJpnHE21bLFijORMQdxiKxubd/82jGuMYh7GxsRsuu6sEjh8/ztmzZ/Xtp9axdVMO8i4TRy/Qe18nvTt7FiWpDYIi0wHqh4jC749+zcx8jOd5/PvT0WVv2EUjELEQoHnZpzpeIf94gUSHA64gPzOfH8S8cvQCNGOI2n+zHdkeIhNLKuUuF/sagX379sF8RR/OGEwjYuqHOue+rpFfZSBoLkmqB8rfv6hepSRYbFhfkOHBX571L4UAbN++XbvCJm9tyAEwXKnzxmRt4XywaF8ZPy0iC8uyOX36vytyTzoDAwP6ZEZ5yFi8dGEOAM/zMMb8DMBelGTbi59vi0ClUuF8bGPSBj/ZXpHiZWRs+G8rBnJDAp7ncS6C8XmLkZF/ruiZfifuxHLiRzuXENYtwKmNAAAAAElFTkSuQmCC", "snake": "data:image/png;base64,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", "stone": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAGS0lEQVR4nKWWW2xU1xWGv30ucx97fBkbsLHxYGxABGICJjQhFyUQelFUVckDjaJKeWjVm1SkvuSp6lujJFKlBiWtmpeWNsIlLRWtoKINOAmXJCaQ2DgG22Nz8Yw9YxjPeM5czzm7Dw5jnAF7cNbT0d5r//+/115nrSVYpv1nYARHTa2cSSXQpw3xnV2bl4WjLOfQif4r1AeD8qM8fIIbs6FW/qqn5+sJGH3tIn2vnV7ywJmrMZpXNMiWag9Bp8LHsSS90wZPbv2GXI4A7fbHgZ0BZFqRgLiX838vjxH0uWXQ50IRgnqnCsD5eArTsvlgLCJ3ta265/m7mQJw+o2PpafRKUMbVnHoYL888/qpMsd/f3qJ1oagDPrcKGKe4/Z3f8Lg0PUkH0am7ysSJaSfnh5HMVLyd3s2l93gX+cH6GxfKxvdemltMmcxnDbpy+XoHZnAzORRXQ7aVgTY5zDE7o0bKxJQyoGff3KTFy8ly8j/NzjCutCaBeRTOYuRdJEOv0ajSy2tW7kC7nyRwyNjcverr1YkoJQD63/xUNnmu6Mx6qtcstHjKq1FshYjaZP1VToORXCzYM3fxqkTdugIt0bRJRbNpzIBd9/VZaSoEk/k6a51EsvPkXf4NXyawoWZAoY59+RCU/CsrKE+oPP9Ndt5R7WXvv5SApp0i1XZAv6cRN7KY+oKbfUuAg6Fc9N5Rq4XiYdt2mQjli6x3DYvBv10627atj3CxJu/lcVcQvTu//U9OZYsRIr80knCyoJNOpHn6GiGq5MmNyYtpA1CCrSCwoPX3ezQ3URsk7dzGZoefRynv7H0V7xw7F32Hft75REwThkYLoE35EHR57ROTVtcGLOQQEuThqpCIjkf7nGryF+TKa5E45izaYTXXdrbFvOg6W75zh25sWgEjJMG6f4Uqf7p0trUtEWuIFlTa3O5Z4iabIpq/xxMOFfkrWiSy9EoIhtDzsbIRqKls0+sa+HZTe2VRwAgPqnhchco9kZwrfQidB+qAp8fHCSXyDMwZdD9gw7Sqot0Pk1y6hrCtoD5evTcqePyZ+E6Wra0IYRC+PiofEWE+f0zu8WSAixLMD7iBCA/YOJxJtm5x8PxdBGAYtbkzJ9HePqXXVwcskjZZhnG4Sf2isPA+U391AVqZWjv2tITLCrA1kyBjVSlSl5X+KzdzUS9g/ShIayijVrlItgRIPhgA0Of5dlzI0tf1g/AlfY0ha/gnRu4gVO/tWBtUQHffXMz//zR5wyEfMy6Vcy1Tras0LhwWmB4HDQ93caWnTX4vQqpt2N0emH1hBeAswmdYxsTC/A+CsxQ8BQWFKclnwAgUudA1Kps73SwsU5naleImZzF1kcCeNxzCbjyZgGtWlJVbRGf1FkdceMcd5Funu9cf/revjLsJQUM1vSLnONJubfbR6tXI+TT8AU9dKxT8ejzP5GUMDOr8Z7DT3iDE2laqEdUeg+8vCj+koXo5d+8gBSCZo9Ku09DAE895KK3kC35JNM2eUvhQ3wMr3JhKQIzNcvfjn7za/aCL00o0Omf74Z+TVnQZTJn00RbXIw2zTetbN/VSqArmwltG45cMAC4nrUYThfp1HV6J7PETqQwkjbhO8jzAxGELFY0GS0Q8NJLr7B//+tlTk7jqhiLW0RzFuF0EVPCjYsW3jM5ZiZNwrX6fNmREiuRRmQrm8wWCNDcO6RRLJ8L3vjxw6RMm8HUHLmRsZkdvsX46CTX1rrp3uYi4Feo8ghyl6KQjIm//ONbFQnQAJ5/vofVHa18+ycbsEDa5vvij289tsDRti0iMRMrkeGLfoP02XH01jpCzRqBKpXHt6soWYujA4JURdR3CHA6q0HkpIJN0bRQ1HzZNGPMZkRfryGz569hpXJ3BavzC7Z2uTk5VNkwUhJw8OAzACIz2ysFivjDgd1ljnu7dMY+NTh3L3LNRhbzbO6qFT989rmKBSzIgexMWLiU6F0dTWWGTV06Wx5rQFUFKALhUEsgOhJp2zy8ur5icqhgaPyqfRCekCd7onwxlMH71HoeaNfZHlKxcxkebV1x33gVFaI7bVeoSZy4NCy1Og9hwKtIZCHHiSOH7psclhGB23Z8cEJejrvwuhQeaCqKHc0Ny8K57wjcNlGIi1BNlRQS4mMTy4Xh/9yDkrK11ppnAAAAAElFTkSuQmCC", "flower": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD7klEQVR4nMWWzWtcZRSHn/d+zL1zZzLJTNpOpxrBSm2roBK6qKCL0EUpSFHEgBbXNeI/oAi2FMSFrroxdiPUhUQUFQnu6sKPUq2FtLVoG61pYttMkpm583W/j4tqEBfJzNxCz+7Ce895znt+53evoo+QhVMk5oLolRNKpk/jhR6JHpGbmiK++aZoI48plZ3sJyWqp8K33wJlQpInvvmLyGdlpUZHRYtjRNNI1qqK51ckqjylbOYBH1V+pycAo6dT4kssjtJ/H0EuGeiVsqDroBSQoGcrkpyrkeyqEe/x0VUkvTbXG4BWVPH1a8K3LlppHAIXWi4q8FFmBhkaRsuPY/54XQJzgezOXT0VpxdKmZ4mbDdE8xsw9jDa/FWirkfVbVGwbJq+z2hhCNO2kId2I4tXCJ2t2Hv2KnXwYDoAmZ7G80PJmDqMjKCuXqHttggloZhz1s812h0MTeHk88juR1D1OqHXJZPNKXX06IYAG46g02mJbWVQ3Tbqrxs0uh6OYZDP6LQ8nyhKMAyd4ZxDGEQ03SaFy3NIsYRhO/jtxqZa2BBAN01AAyAKY0QEM2PQ9LrcqjWpdTxKjk25WGDItumGAWEUYaDulE02bH5zAGu/pbzv22J1W8RxRN62ub68SsMLqPtdojjBaya0o4iCbTFWGiEKAoxui0ADe2h4U41tLsLZWTxNQ7vws6hOh/nlWzQerbF4o8vSjj9xftvClu06O5ceZO+OCtg28RP71FoQcN/hw5veQM/r8m98fuZlxK9KFLdYXKmSJAkZI49pl9UrL3zdb7p/BtxHPDtxmoJTQqGTtx1AYRjDDFJ8IACAny5cIY6EISdH6Cc0qv5AxaFXJ/xfrNZ8Wm6TVl3Hykc42YH6GBzAXdWVbZmSG/bwWllCigMDDIT+/smLaGxn61gJCUqcOP5V32K+K3Hq00OSNsfgw7tLsaEGLl1+XVYaKyyvLtENE8IkJvQ7TB35bv3KL92ewXIbVH0X3/VxfZc7O2ExOXE8HUAQBXzxyTlyxYRi4QE1/vQzzM19IAAffvkSvn+b2vwshq7EbTdZWFpgeW0NzVCMju5I/0My/vh7/0lykTPnD60/NZu/Si5b4fwf17A0g6kXv1HH3t4vrXqGYrlANlfqpX6fa+hCNruN6Y8PEMZ18s4u5XbPrqc59sbZvrehLxFOTLxGLr9P5ZytQuRjZ/IUMkUZ23Zg4DUc6MWZmRmqwbuilM6rR35I5QEDreHk5CQiMVtG96c2oIF9wMyX1Up9Tk5+9OS9ATj63CylkfuJkk4qN0zlhNlCRSnSuXFqK9aTdDJIBVDAQk/Zwz3/GKUCSBIDdDMVwN8nCprvtGs6vgAAAABJRU5ErkJggg=="};
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