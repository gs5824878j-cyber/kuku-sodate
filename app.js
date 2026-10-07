const KEY='kuku_preview_v5';
const INT=[600000,86400000,259200000,604800000,1209600000,2592000000,5184000000];
const ITEMS={food:{n:'ごはん',e:'🍙',xp:3,c:'food'},toy:{n:'おもちゃ',e:'🪀',xp:4,c:'play'},book:{n:'えほん',e:'📕',xp:5,c:'study'},gem:{n:'キラキラ',e:'💎',xp:8,c:null}};
const ST=[{m:0,n:'たまご'},{m:30,n:'あかちゃん'},{m:90,n:'こども'},{m:180,n:'せいちょう'},{m:320,n:'おとな'}];
const RO={study:{n:'学習型',c1:'#7eb5e3',c2:'#4f83b5',mark:'📘'},play:{n:'元気型',c1:'#ffc06c',c2:'#df7c2f',mark:'⚡'},food:{n:'のんびり型',c1:'#98cf88',c2:'#5f9c58',mark:'🌱'}};
const SPECIES={human:{n:'人間',icon:'🧒',base:'ミライ'},dino:{n:'恐竜',icon:'🦖',base:'ガオ'},animal:{n:'動物',icon:'🐾',base:'ポコ'}};
let mem={};
function get(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}}
function set(k,v){try{localStorage.setItem(k,v)}catch(e){mem[k]=v}}
function D(){let f={};for(let a=1;a<=9;a++)for(let b=1;b<=9;b++)f[`${a}x${b}`]={a,b,l:-1,d:0,at:0,ok:0,w:0,ms:0,ca:0,cok:0,cms:0};return{f,coins:0,streak:0,last:null,reward:null,settings:{challengeMin:1,species:'animal'},pet:{xp:0,branch:null,care:{study:0,play:0,food:0},inv:{food:2,toy:1,book:1,gem:0},log:['ふしぎなたまごをもらった！']}}}
function load(){try{let base=D(),raw=JSON.parse(get(KEY)||'null')||{};let s={...base,...raw,settings:{...base.settings,...(raw.settings||{})},pet:{...base.pet,...(raw.pet||{}),care:{...base.pet.care,...(raw.pet?.care||{})},inv:{...base.pet.inv,...(raw.pet?.inv||{})}},f:{...base.f,...(raw.f||{})}};Object.values(s.f).forEach(f=>{if(f.ca==null)f.ca=0;if(f.cok==null)f.cok=0;if(f.cms==null)f.cms=0});return s}catch(e){return D()}}
let S=load(),ld=2,lb=1,ls=0,rq=[],ri=0,rs=0,ct=null,end=0,sc=0,co=0,cf=null,cs=0,challengeLocked=false;
const $=x=>document.getElementById(x);function save(){set(KEY,JSON.stringify(S))}function day(){return new Date().toISOString().slice(0,10)}
function stage(){let s=ST[0];for(let x of ST)if(S.pet.xp>=x.m)s=x;return s}function nextstage(){let s=stage(),i=ST.indexOf(s);return ST[Math.min(i+1,ST.length-1)]}
function branch(){if(S.pet.branch)return S.pet.branch;if(S.pet.xp<90)return null;let c=S.pet.care,k='study';if(c.play>c[k])k='play';if(c.food>c[k])k='food';S.pet.branch=k;S.pet.log.unshift(`${RO[k].n}に進化！`);save();return k}
function fmt(t){if(!t)return'未学習';let d=t-Date.now();if(d<=0)return'復習できます';let m=Math.ceil(d/60000);if(m<60)return m+'分後';let h=Math.ceil(d/3600000);return h<24?h+'時間後':Math.ceil(d/86400000)+'日後'}
function lev(l){return['覚えたて','10分クリア','1日クリア','3日クリア','1週間クリア','2週間クリア','1か月クリア'][Math.max(0,l)]||'長期記憶'}
function diff(f){if(!f.at)return-1;let ac=f.ok/f.at,slow=Math.min(1,f.ms/7000),over=f.d<Date.now()?Math.min(1,(Date.now()-f.d)/(7*86400000)):0;return(1-ac)*.6+slow*.25+over*.15}
function duef(){return Object.values(S.f).filter(f=>f.l>=0&&f.d<=Date.now()).sort((a,b)=>diff(b)-diff(a))}
function rec(f,ok,ms,mode='study'){f.at++;f.ms=f.ms?Math.round(f.ms*.7+ms*.3):Math.round(ms);if(mode==='challenge'){f.ca++;if(ok)f.cok++;f.cms=f.cms?Math.round(f.cms*.7+ms*.3):Math.round(ms)}if(ok){f.ok++;f.l=f.l<0?0:Math.min(f.l+(ms<6000?1:0),INT.length-1);let iv=INT[Math.max(0,f.l)];if(ms<2500&&f.l>=2)iv*=1.2;if(ms>6000)iv*=.7;f.d=Date.now()+iv}else{f.w++;f.l=f.l<0?0:Math.max(0,f.l-2);f.d=Date.now()+300000}let t=day();if(S.last!==t){S.streak=S.last&&Math.round((new Date(t)-new Date(S.last))/86400000)===1?S.streak+1:1;S.last=t}save()}
function petName(){let sp=SPECIES[S.settings.species],b=branch();return b?`${sp.base}・${RO[b].n}`:sp.base}
function petSvg(){let s=stage(),b=branch(),cfg=b?RO[b]:{c1:'#e4b777',c2:'#b7793f',mark:''},species=S.settings.species;
 if(s.n==='たまご')return`<svg class="pet-anim" viewBox="0 0 180 180"><defs><radialGradient id="egg" cx="35%" cy="25%"><stop offset="0" stop-color="#fffce9"/><stop offset=".6" stop-color="#f9dda0"/><stop offset="1" stop-color="#e8b85f"/></radialGradient></defs><ellipse cx="90" cy="99" rx="52" ry="67" fill="url(#egg)" stroke="#6a5133" stroke-width="6"/><ellipse class="shine" cx="69" cy="67" rx="13" ry="24" fill="#fff" opacity=".45"/><text x="90" y="105" text-anchor="middle" font-size="40">${SPECIES[species].icon}</text></svg>`;
 if(species==='human')return`<svg class="pet-anim" viewBox="0 0 200 190"><defs><radialGradient id="skin" cx="35%" cy="20%"><stop offset="0" stop-color="#fff4e7"/><stop offset="1" stop-color="#efba8f"/></radialGradient><linearGradient id="shirt" x1="0" x2="1"><stop stop-color="${cfg.c1}"/><stop offset="1" stop-color="${cfg.c2}"/></linearGradient></defs><circle cx="100" cy="70" r="48" fill="url(#skin)" stroke="#684a3c" stroke-width="6"/><path d="M56 58 Q65 18 103 22 Q144 22 147 62 Q128 42 104 44 Q76 43 56 58" fill="#4b3428"/><g class="eye"><ellipse cx="81" cy="72" rx="5" ry="7"/></g><g class="eye"><ellipse cx="119" cy="72" rx="5" ry="7"/></g><path d="M87 93 Q100 103 113 93" fill="none" stroke="#5d4034" stroke-width="5" stroke-linecap="round"/><rect x="61" y="112" width="78" height="56" rx="25" fill="url(#shirt)" stroke="#55453a" stroke-width="6"/><path class="armR" d="M136 124 Q166 118 170 92" fill="none" stroke="#efba8f" stroke-width="14" stroke-linecap="round"/><path d="M66 157 Q53 173 40 171" fill="none" stroke="#5b4a42" stroke-width="15" stroke-linecap="round"/><path d="M134 157 Q147 173 160 171" fill="none" stroke="#5b4a42" stroke-width="15" stroke-linecap="round"/><text x="100" y="124" text-anchor="middle" font-size="24">${cfg.mark}</text></svg>`;
 if(species==='dino')return`<svg class="pet-anim" viewBox="0 0 210 190"><defs><radialGradient id="db" cx="35%" cy="20%"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".2" stop-color="${cfg.c1}"/><stop offset="1" stop-color="${cfg.c2}"/></radialGradient></defs><path class="tail" d="M150 118 Q203 110 190 147 Q178 164 148 143" fill="${cfg.c2}" stroke="#4f4437" stroke-width="6"/><ellipse cx="105" cy="111" rx="60" ry="55" fill="url(#db)" stroke="#4f4437" stroke-width="6"/><path d="M69 74 Q59 43 82 34 Q108 23 133 40 Q148 50 145 80" fill="url(#db)" stroke="#4f4437" stroke-width="6"/><path d="M78 42 l8-18 10 17 10-20 11 22 12-14 3 23" fill="#f4df7a" stroke="#665a39" stroke-width="4"/><g class="eye"><circle cx="90" cy="61" r="6"/></g><g class="eye"><circle cx="124" cy="61" r="6"/></g><path d="M92 79 Q108 90 127 77" fill="none" stroke="#4b3930" stroke-width="5"/><ellipse cx="87" cy="121" rx="28" ry="24" fill="#f3dfc0" opacity=".75"/><path d="M69 151 l-10 19 M83 153 l-4 20 M132 153 l5 20 M145 151 l11 18" stroke="#4f4437" stroke-width="7" stroke-linecap="round"/><text x="112" y="126" text-anchor="middle" font-size="24">${cfg.mark}</text></svg>`;
 return`<svg class="pet-anim" viewBox="0 0 200 190"><defs><radialGradient id="body" cx="34%" cy="22%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".18" stop-color="${cfg.c1}"/><stop offset="1" stop-color="${cfg.c2}"/></radialGradient></defs><path class="tail" d="M149 111 Q187 103 178 133 Q167 155 145 139" fill="${cfg.c2}" stroke="#584331" stroke-width="6"/><ellipse cx="100" cy="108" rx="57" ry="61" fill="url(#body)" stroke="#584331" stroke-width="6"/><circle class="earL" cx="58" cy="62" r="23" fill="${cfg.c1}" stroke="#584331" stroke-width="6"/><circle class="earR" cx="142" cy="62" r="23" fill="${cfg.c1}" stroke="#584331" stroke-width="6"/><ellipse cx="100" cy="125" rx="34" ry="30" fill="#f3dfc0"/><g class="eye"><ellipse cx="79" cy="99" rx="6" ry="8"/></g><g class="eye"><ellipse cx="121" cy="99" rx="6" ry="8"/></g><path d="M87 124 Q100 135 113 124" fill="none" stroke="#4b3930" stroke-width="5"/><text x="100" y="48" text-anchor="middle" font-size="27">${cfg.mark}</text></svg>`}
function show(id){if(ct&&id!=='challenge'){clearInterval(ct);ct=null}document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.s===id));if(id==='home')home();if(id==='learn')learn();if(id==='petroom')petroom();if(id==='settings')settings();if(id==='parent')parent()}
function home(){let du=duef(),nd=Object.values(S.f).filter(f=>f.l>=0&&f.d>Date.now()).sort((a,b)=>a.d-b.d)[0],st=stage(),ns=nextstage();$('due').textContent=du.length;$('nextdue').textContent=du.length?'今が復習タイミングです':nd?'次は '+fmt(nd.d):'まず1つの段を学習しよう';$('streak').textContent=S.streak;$('coins').textContent=S.coins;$('stage').textContent=st.n;$('petname').textContent=petName();$('petmsg').textContent=`${SPECIES[S.settings.species].n}を育てています`;let from=st.m,to=ns===st?st.m+1:ns.m,p=ns===st?100:(S.pet.xp-from)/(to-from)*100;$('xpbar').style.width=Math.max(0,Math.min(100,p))+'%';$('xptext').textContent=ns===st?S.pet.xp+' XP':'次の成長まで '+Math.max(0,to-S.pet.xp)+' XP';$('petvis').innerHTML=petSvg();$('challengeHome').textContent=`⏱ ${S.settings.challengeMin}分チャレンジ`}
function learn(){$('dangrid').innerHTML='';for(let a=1;a<=9;a++){let b=document.createElement('button');b.textContent=a+'の段';b.onclick=()=>startLearn(a);$('dangrid').appendChild(b)}}
function startLearn(a){ld=a;lb=1;$('learnbox').style.display='block';nextLearn()}function nextLearn(){$('learnlabel').textContent=ld+'の段';$('learnq').textContent=ld+' × '+lb;$('learna').value='';$('learnfb').textContent='';ls=performance.now();setTimeout(()=>$('learna').focus(),80)}
function submitLearn(){if($('learna').value==='')return;let f=S.f[`${ld}x${lb}`],ans=ld*lb,ok=+$('learna').value===ans;rec(f,ok,performance.now()-ls,'learn');$('learnfb').className='feedback '+(ok?'ok':'ng');$('learnfb').textContent=ok?'正解！ 次は '+fmt(f.d):'答えは '+ans+'。5分後にもう一度';if(ok){S.coins++;S.pet.xp++;S.pet.care.study++;save()}setTimeout(()=>{lb++;if(lb>9){lb=1;modal('🎉',ld+'の段クリア！','復習は自動予約されました。');home()}else nextLearn()},500)}
function openReview(){rq=duef();ri=0;if(!rq.length){modal('✨','今は復習なし！','復習の時間になったら、ここに問題が表示されます。');show('home');return}show('review');nextReview()}
function nextReview(){if(ri>=rq.length){finishReview();return}let f=rq[ri];$('reviewprog').textContent=`${ri+1}/${rq.length}`;$('reviewlevel').textContent=lev(f.l);$('reviewq').textContent=f.a+' × '+f.b;$('reviewa').value='';$('reviewfb').textContent='';$('reviewsched').textContent='';rs=performance.now();setTimeout(()=>$('reviewa').focus(),80)}
function submitReview(){if($('reviewa').value===''||ri>=rq.length)return;let f=rq[ri],ok=+$('reviewa').value===f.a*f.b;rec(f,ok,performance.now()-rs,'review');$('reviewfb').className='feedback '+(ok?'ok':'ng');$('reviewfb').textContent=ok?'正解！':'答えは '+f.a*f.b;$('reviewsched').textContent=ok?'次の復習：'+fmt(f.d):'5分後にもう一度';if(ok){S.coins+=2;S.pet.xp+=2;S.pet.care.study+=2;save()}setTimeout(()=>{ri++;nextReview()},500)}
function finishReview(){let text='今日の復習おつかれさま！';if(S.reward!==day()){let ks=['food','toy','book','gem'],k=ks[Math.floor(Math.random()*4)];S.pet.inv[k]=(S.pet.inv[k]||0)+1;S.reward=day();S.coins+=10;S.pet.xp+=8;S.pet.log.unshift('復習クリア！ '+ITEMS[k].n+'をGET');text=ITEMS[k].e+' '+ITEMS[k].n+' と10コインをGET！'}save();modal('🎁','復習クリア！',text);show('home')}
function randf(){let a=Object.values(S.f),w=[];for(let f of a){let n=1+(f.l<2?2:0)+(f.ca&&f.cok/f.ca<.75?3:0);for(let i=0;i<n;i++)w.push(f)}return w[Math.floor(Math.random()*w.length)]}
function startChallenge(){if(ct)clearInterval(ct);show('challenge');sc=co=0;challengeLocked=false;$('score').textContent=0;$('combo').textContent=0;$('challengeTitle').textContent=`${S.settings.challengeMin}分チャレンジ`;$('timer').textContent=`${S.settings.challengeMin}:00`;end=Date.now()+S.settings.challengeMin*60000;nextChallenge();ct=setInterval(()=>{let r=Math.max(0,end-Date.now()),s=Math.ceil(r/1000);$('timer').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');if(r<=0)finishChallenge()},250)}
function nextChallenge(){if(Date.now()>=end){finishChallenge();return}challengeLocked=false;cf=randf();$('challengeq').textContent=cf.a+' × '+cf.b;$('challengea').value='';$('challengefb').className='feedback';$('challengefb').innerHTML='';cs=performance.now();setTimeout(()=>$('challengea').focus(),50)}
function submitChallenge(){if(challengeLocked||$('challengea').value===''||!cf)return;challengeLocked=true;let ok=+$('challengea').value===cf.a*cf.b,ms=performance.now()-cs;rec(cf,ok,ms,'challenge');if(ok){sc++;co++;S.coins++;S.pet.xp++;S.pet.care.play++;$('challengefb').className='feedback ok';$('challengefb').textContent='○ 正解！'}else{co=0;$('challengefb').className='feedback ng';$('challengefb').innerHTML=`✕ ちがうよ<div class="wrong-answer">正解は ${cf.a*cf.b}</div>`}$('score').textContent=sc;$('combo').textContent=co;save();setTimeout(nextChallenge,ok?320:1050)}
function finishChallenge(){if(!ct)return;clearInterval(ct);ct=null;challengeLocked=true;let bonus=Math.max(3,Math.floor(sc/3));S.coins+=bonus;S.pet.xp+=Math.floor(sc/4);S.pet.care.play+=Math.floor(sc/5);save();modal('⏱',`${S.settings.challengeMin}分チャレンジ終了！`,sc+'問正解！ ボーナス '+bonus+'コイン');show('home')}
function petroom(){let st=stage(),ns=nextstage();$('petvis2').innerHTML=petSvg();$('petname2').textContent=petName();$('stage2').textContent=`${SPECIES[S.settings.species].n}・${st.n}`;let from=st.m,to=ns===st?st.m+1:ns.m,p=ns===st?100:(S.pet.xp-from)/(to-from)*100;$('xpbar2').style.width=Math.max(0,Math.min(100,p))+'%';$('xptext2').textContent=ns===st?S.pet.xp+' XP':'次の成長まで '+Math.max(0,to-S.pet.xp)+' XP';let mx=Math.max(1,S.pet.care.study,S.pet.care.play,S.pet.care.food);for(let k of['study','play','food']){$(k+'bar').style.width=S.pet.care[k]/mx*100+'%';$(k+'v').textContent=S.pet.care[k]}$('inventory').innerHTML='';for(let [k,it] of Object.entries(ITEMS)){let n=S.pet.inv[k]||0,b=document.createElement('button');b.className='item';b.disabled=n<=0;b.innerHTML=`<div class="e">${it.e}</div><b>${it.n}</b><div class="tiny">×${n}</div>`;b.onclick=()=>useItem(k);$('inventory').appendChild(b)}$('log').innerHTML='';S.pet.log.slice(0,8).forEach(x=>{let r=document.createElement('div');r.className='row';r.textContent=x;$('log').appendChild(r)})}
function useItem(k){if(!S.pet.inv[k])return;let it=ITEMS[k],old=branch();S.pet.inv[k]--;S.pet.xp+=it.xp;if(it.c)S.pet.care[it.c]+=3;let nb=branch();S.pet.log.unshift(it.n+'を使った');save();petroom();home();if(!old&&nb)modal('✨','進化した！',RO[nb].n+'になったよ！')}
function setChallengeMin(n){S.settings.challengeMin=n;save();settings();home()}
function setSpecies(sp){S.settings.species=sp;S.pet.branch=null;S.pet.log.unshift(`${SPECIES[sp].n}を育てることにした！`);save();settings();home();petroom();modal(SPECIES[sp].icon,'育てる種類を変更',`${SPECIES[sp].n}を育てます。成長タイプはこれからの行動で決まります。`)}
function settings(){document.querySelectorAll('[data-min]').forEach(b=>b.classList.toggle('active',+b.dataset.min===S.settings.challengeMin));document.querySelectorAll('[data-species]').forEach(b=>b.classList.toggle('active',b.dataset.species===S.settings.species));$('challengeSettingText').textContent=`現在：${S.settings.challengeMin}分`;$('speciesSettingText').textContent=`現在：${SPECIES[S.settings.species].n}`}
function challengeRate(f){return f.ca?f.cok/f.ca:null}function ccls(f){if(!f.ca)return'none';let r=challengeRate(f);if(f.ca>=5&&r>=.9)return'master';if(r<.6)return'weak';if(r<.8)return'mid';return'good'}
function parent(){let fs=Object.values(S.f),played=fs.filter(f=>f.ca),cat=played.reduce((s,f)=>s+f.ca,0),cok=played.reduce((s,f)=>s+f.cok,0);$('challengePlayed').textContent=played.length;$('challengeAccuracy').textContent=cat?Math.round(cok/cat*100)+'%':'—';$('challengeAttempts').textContent=cat;let g=$('heat');g.innerHTML='<div></div>';for(let b=1;b<=9;b++){let h=document.createElement('div');h.className='hh';h.textContent=b;g.appendChild(h)}for(let a=1;a<=9;a++){let h=document.createElement('div');h.className='hh';h.textContent=a;g.appendChild(h);for(let b=1;b<=9;b++){let f=S.f[`${a}x${b}`],c=document.createElement('button');c.className='hc '+ccls(f);c.textContent=f.ca?Math.round(f.cok/f.ca*100)+'%':'—';c.onclick=()=>challengeDetail(f);g.appendChild(c)}}$('weaklist').innerHTML='';let w=played.slice().sort((a,b)=>(challengeRate(a)-challengeRate(b))||(b.ca-a.ca)).slice(0,6);if(!w.length)$('weaklist').innerHTML='<div class="row">まだチャレンジの記録がありません</div>';w.forEach(f=>{let r=document.createElement('div');r.className='row';r.innerHTML=`<b>${f.a}×${f.b}=${f.a*f.b}</b><span class="tiny">チャレンジ正答率 ${Math.round(f.cok/f.ca*100)}%（${f.cok}/${f.ca}）</span>`;$('weaklist').appendChild(r)})}
function challengeDetail(f){if(!f.ca){modal('📊',`${f.a} × ${f.b}`,'まだチャレンジでは出題されていません。');return}modal('📊',`${f.a} × ${f.b} = ${f.a*f.b}`,`チャレンジ正答率 ${Math.round(f.cok/f.ca*100)}%（${f.cok}/${f.ca}）／ 平均 ${(f.cms/1000).toFixed(1)}秒`)}
function demo(){S=D();let n=Date.now();for(let a=1;a<=9;a++)for(let b=1;b<=9;b++){let f=S.f[`${a}x${b}`];if((a+b)%3){f.at=8;f.ok=6;f.l=(a*b)%6;f.ms=2400+(a*b*211)%3000;f.d=n+(((a+b)%4)-2)*86400000;f.ca=3+((a*b)%8);let ratio=(a*b)%5===0?.45:(a+b)%4===0?.65:(a*b)%3===0?.82:.95;f.cok=Math.max(1,Math.round(f.ca*ratio));f.cms=1800+(a*b*173)%3600}}S.coins=74;S.streak=5;S.pet.xp=205;S.pet.care={study:24,play:10,food:15};S.pet.inv={food:4,toy:3,book:3,gem:1};S.pet.log.unshift('デモデータを読み込みました');save();home();modal('🧪','デモデータON','チャレンジ正答率マップ・進化・復習を確認できます。')}
function boost(){S.pet.xp+=80;branch();save();home();petroom();modal('✨','XP +80','育成画面で進化を確認してください。')}function makeDue(){Object.values(S.f).filter(f=>f.l>=0).forEach(f=>f.d=Date.now()-1000);save();home();modal('🧠','復習を期限にしました','ホームの「今日の復習」から確認できます。')}function resetAll(){S=D();save();location.reload()}
function modal(e,t,x){$('me').textContent=e;$('mt').textContent=t;$('mx').textContent=x;$('modal').classList.add('show')}function closeModal(){$('modal').classList.remove('show')}
for(let [id,fn] of[['learna',submitLearn],['reviewa',submitReview],['challengea',submitChallenge]])$(id).addEventListener('keydown',e=>{if(e.key==='Enter')fn()});home();learn();petroom();settings();

// v6: 今日の課題（正答数ベース）と 10/30/50 件設定
(function(){
  let taskCurrent=null;

  function ensureDailyTask(){
    if(!S.settings) S.settings={};
    if(![10,30,50].includes(Number(S.settings.dailyGoal))) S.settings.dailyGoal=10;
    const t=day();
    if(!S.dailyTask || S.dailyTask.date!==t){
      S.dailyTask={date:t,correct:0,attempts:0,wrong:0};
    }
    if(typeof S.dailyTask.correct!=='number') S.dailyTask.correct=0;
    if(typeof S.dailyTask.attempts!=='number') S.dailyTask.attempts=0;
    if(typeof S.dailyTask.wrong!=='number') S.dailyTask.wrong=0;
    save();
    return S.dailyTask;
  }

  function dailyGoal(){ ensureDailyTask(); return Number(S.settings.dailyGoal)||10; }
  function dailyCorrect(){ return ensureDailyTask().correct||0; }

  function taskPool(){
    return Object.values(S.f).filter(f=>f.l>=0 || f.at>0 || f.ca>0);
  }

  function pickTaskFact(){
    const pool=taskPool();
    if(!pool.length) return null;
    const now=Date.now(), weighted=[];
    pool.forEach(f=>{
      let n=1;
      if(f.d && f.d<=now) n+=4;
      if(f.at && f.ok/f.at<0.75) n+=3;
      if((f.ms||0)>5000) n+=1;
      for(let i=0;i<n;i++) weighted.push(f);
    });
    return weighted[Math.floor(Math.random()*weighted.length)] || pool[0];
  }

  function setupLabels(){
    const dueEl=$('due');
    if(dueEl){
      const card=dueEl.closest('.card');
      const label=card && card.querySelector('.label');
      if(label) label.textContent='今日の課題';
      const big=dueEl.parentElement;
      if(big && !big.dataset.taskFormat){
        big.dataset.taskFormat='1';
        big.innerHTML='<span id="due">0／10</span>';
      }
    }
    const home=$('home');
    if(home){
      const buttons=[...home.querySelectorAll('button')];
      const taskBtn=buttons.find(b=>(b.getAttribute('onclick')||'').includes('openReview'));
      if(taskBtn) taskBtn.textContent='🧠 今日の課題をする';
      const rewardCards=[...home.querySelectorAll('.card')];
      const reward=rewardCards.find(c=>c.textContent.includes('今日の復習'));
      if(reward) reward.textContent='🎁 今日の課題を全部クリアすると育成アイテムGET';
    }
    const review=$('review');
    if(review){
      const title=review.querySelector('.section');
      if(title && title.firstChild) title.firstChild.textContent='今日の課題 ';
    }
  }

  function ensureGoalSettingUI(){
    const settingsScreen=$('settings');
    if(!settingsScreen || $('dailyGoalSetting')) return;
    const firstCard=settingsScreen.querySelector('.card.setting-card');
    if(!firstCard) return;
    const title=document.createElement('div');
    title.className='section';
    title.textContent='今日の課題';
    const card=document.createElement('div');
    card.id='dailyGoalSetting';
    card.className='card setting-card';
    card.innerHTML=`<b>1日の正答目標</b>
      <div class="sub">10・30・50から選べます。間違えた問題はカウントされません。</div>
      <div class="seg">
        <button data-goal="10" onclick="setDailyGoal(10)">10問</button>
        <button data-goal="30" onclick="setDailyGoal(30)">30問</button>
        <button data-goal="50" onclick="setDailyGoal(50)">50問</button>
      </div>
      <div id="dailyGoalSettingText" class="tiny"></div>`;
    firstCard.after(title,card);
  }

  window.setDailyGoal=function(n){
    n=Number(n);
    if(![10,30,50].includes(n)) return;
    ensureDailyTask();
    S.settings.dailyGoal=n;
    save();
    renderGoalSetting();
    home();
  };

  function renderGoalSetting(){
    ensureGoalSettingUI();
    const goal=dailyGoal();
    document.querySelectorAll('[data-goal]').forEach(b=>b.classList.toggle('active',Number(b.dataset.goal)===goal));
    const t=$('dailyGoalSettingText');
    if(t) t.textContent=`現在：${goal}問（正解した問題だけカウント）`;
  }

  const originalHome=home;
  home=function(){
    originalHome();
    setupLabels();
    const task=ensureDailyTask(), goal=dailyGoal();
    const dueNow=$('due');
    if(dueNow) dueNow.textContent=`${Math.min(task.correct,goal)}／${goal}`;
    const sub=$('nextdue');
    if(sub) sub.textContent=task.correct>=goal?'今日の課題クリア！':'正解した数だけカウント';
  };

  const originalSettings=settings;
  settings=function(){
    originalSettings();
    ensureGoalSettingUI();
    renderGoalSetting();
  };

  openReview=function(){
    const task=ensureDailyTask(), goal=dailyGoal();
    if(task.correct>=goal){
      modal('🎉','今日の課題はクリア済み！',`${task.correct}／${goal} 正解できています。`);
      show('home');
      return;
    }
    if(!taskPool().length){
      modal('📘','まず1つの段をおぼえよう','「新しい段をおぼえる」で学習した九九が、今日の課題に出題されます。');
      show('learn');
      return;
    }
    show('review');
    nextReview();
  };

  nextReview=function(){
    const task=ensureDailyTask(), goal=dailyGoal();
    if(task.correct>=goal){ finishReview(); return; }
    taskCurrent=pickTaskFact();
    if(!taskCurrent){ show('home'); return; }
    $('reviewprog').textContent=`${task.correct}／${goal} 正解`;
    $('reviewlevel').textContent='正解した問題だけ今日の課題にカウント';
    $('reviewq').textContent=`${taskCurrent.a} × ${taskCurrent.b}`;
    $('reviewa').value='';
    $('reviewfb').textContent='';
    $('reviewsched').textContent=`あと ${Math.max(0,goal-task.correct)} 問正解でクリア`;
    rs=performance.now();
    setTimeout(()=>$('reviewa').focus(),80);
  };

  submitReview=function(){
    if($('reviewa').value==='' || !taskCurrent) return;
    const task=ensureDailyTask(), goal=dailyGoal();
    const correctAnswer=taskCurrent.a*taskCurrent.b;
    const ok=Number($('reviewa').value)===correctAnswer;
    task.attempts++;
    rec(taskCurrent,ok,performance.now()-rs,'review');
    if(ok){
      task.correct++;
      S.coins+=2;
      S.pet.xp+=2;
      S.pet.care.study+=2;
      $('reviewfb').className='feedback ok';
      $('reviewfb').textContent='○ 正解！ 1問カウント';
      $('reviewsched').textContent=`${Math.min(task.correct,goal)}／${goal} 正解`;
    }else{
      task.wrong++;
      $('reviewfb').className='feedback ng';
      $('reviewfb').innerHTML=`✕ ちがうよ <div class="wrong-answer">正解は ${correctAnswer}</div>`;
      $('reviewsched').textContent='不正解は今日の課題にカウントされません';
    }
    S.dailyTask=task;
    save();
    setTimeout(nextReview,ok?430:1050);
  };

  finishReview=function(){
    const task=ensureDailyTask(), goal=dailyGoal();
    if(task.correct<goal){ nextReview(); return; }
    let text=`${goal}問正解！ 今日の課題クリア！`;
    if(S.reward!==day()){
      const ks=['food','toy','book','gem'];
      const k=ks[Math.floor(Math.random()*ks.length)];
      S.pet.inv[k]=(S.pet.inv[k]||0)+1;
      S.reward=day();
      S.coins+=10;
      S.pet.xp+=8;
      S.pet.log.unshift(`今日の課題クリア！ ${ITEMS[k].n}をGET`);
      text+=` ${ITEMS[k].e} ${ITEMS[k].n} と10コインをGET！`;
    }
    save();
    modal('🎁','今日の課題クリア！',text);
    show('home');
  };

  setupLabels();
  ensureGoalSettingUI();
  ensureDailyTask();
  renderGoalSetting();
  home();
})();


// v7: 育成ポイント、ショップ、課題クリア連続日数
(function(){
  const ECON_VERSION=2;
  const DAILY_CLEAR_POINTS=10;
  const SHOP={
    food:{name:'ごはん',emoji:'🍙',price:10,care:'food'},
    toy:{name:'おもちゃ',emoji:'🪀',price:10,care:'play'},
    book:{name:'えほん',emoji:'📕',price:10,care:'study'}
  };
  const GROW_ST=[
    {m:0,n:'たまご'},
    {m:1,n:'あかちゃん'},
    {m:5,n:'こども'},
    {m:12,n:'せいちょう'},
    {m:25,n:'おとな'}
  ];
  let currentTaskFact=null;

  // 日本時間を含む端末のローカル日付で日替わり判定
  day=function(){
    const d=new Date();
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${dd}`;
  };

  RO.balance={n:'バランス型',c1:'#c6ace8',c2:'#8a68b2',mark:'🌟'};

  function migrateEconomy(){
    if(S.economyVersion===ECON_VERSION) return;
    S.economyVersion=ECON_VERSION;
    S.coins=0;
    S.taskStreak=0;
    S.lastTaskClear=null;
    S.pet.xp=0;
    S.pet.branch=null;
    S.pet.care={study:0,play:0,food:0};
    S.pet.inv={food:0,toy:0,book:0,gem:0};
    S.pet.log=['新しい育成ポイント制がスタート！'];
    save();
  }

  function taskState(){
    if(!S.settings) S.settings={};
    if(![10,30,50].includes(Number(S.settings.dailyGoal))) S.settings.dailyGoal=10;
    const t=day();
    if(!S.dailyTask || S.dailyTask.date!==t){
      S.dailyTask={date:t,correct:0,attempts:0,wrong:0,cleared:false};
    }
    if(typeof S.dailyTask.correct!=='number') S.dailyTask.correct=0;
    if(typeof S.dailyTask.attempts!=='number') S.dailyTask.attempts=0;
    if(typeof S.dailyTask.wrong!=='number') S.dailyTask.wrong=0;
    if(typeof S.dailyTask.cleared!=='boolean') S.dailyTask.cleared=false;
    return S.dailyTask;
  }
  function goal(){return Number(S.settings.dailyGoal)||10;}

  // 成長は「アイテムをあげた回数」だけで進む
  stage=function(){
    let s=GROW_ST[0];
    for(const x of GROW_ST) if(S.pet.xp>=x.m) s=x;
    return s;
  };
  nextstage=function(){
    const s=stage(),i=GROW_ST.indexOf(s);
    return GROW_ST[Math.min(i+1,GROW_ST.length-1)];
  };
  branch=function(){
    if(S.pet.branch) return S.pet.branch;
    if(S.pet.xp<5) return null;
    const c=S.pet.care;
    const vals={study:c.study||0,play:c.play||0,food:c.food||0};
    const mx=Math.max(vals.study,vals.play,vals.food);
    const tops=Object.keys(vals).filter(k=>vals[k]===mx);
    const k=tops.length>=2?'balance':tops[0];
    S.pet.branch=k;
    S.pet.log.unshift(`${RO[k].n}に進化！`);
    save();
    return k;
  };

  // チャレンジはSRSを動かさない。通常学習/課題だけ復習予定を更新。
  rec=function(f,ok,ms,mode='study'){
    if(mode==='challenge'){
      f.ca=(f.ca||0)+1;
      if(ok) f.cok=(f.cok||0)+1;
      f.cms=f.cms?Math.round(f.cms*.7+ms*.3):Math.round(ms);
      save();
      return;
    }
    f.at=(f.at||0)+1;
    f.ms=f.ms?Math.round(f.ms*.7+ms*.3):Math.round(ms);
    if(ok){
      f.ok=(f.ok||0)+1;
      f.l=f.l<0?0:Math.min(f.l+(ms<6000?1:0),INT.length-1);
      let iv=INT[Math.max(0,f.l)];
      if(ms<2500&&f.l>=2)iv*=1.2;
      if(ms>6000)iv*=.7;
      f.d=Date.now()+iv;
    }else{
      f.w=(f.w||0)+1;
      f.l=f.l<0?0:Math.max(0,f.l-2);
      f.d=Date.now()+300000;
    }
    save();
  };

  function setupUi(){
    migrateEconomy();

    // ヘッダー通貨
    const pill=document.querySelector('header .pill');
    if(pill && !pill.dataset.pointsV7){
      pill.dataset.pointsV7='1';
      pill.innerHTML='⭐ <b id="coins">0</b>P';
    }

    // 連続日数カード
    const streak=$('streak');
    if(streak){
      const card=streak.closest('.card');
      const label=card&&card.querySelector('.label');
      const tiny=card&&card.querySelector('.tiny');
      if(label) label.textContent='連続クリア';
      if(tiny) tiny.textContent='今日の課題を達成した日';
    }

    // ごほうび説明
    const home=$('home');
    if(home){
      [...home.querySelectorAll('.card')].forEach(c=>{
        if(c.textContent.includes('今日の課題を全部クリア')) c.textContent=`🎁 今日の課題クリアで +${DAILY_CLEAR_POINTS}P`;
      });
    }

    // 育成画面のルート説明
    const route=document.querySelector('#petroom .route');
    if(route){
      const b=route.querySelector('b');
      const tiny=route.querySelector('.tiny');
      if(b) b.textContent='あげたアイテムで育ち方が変わる';
      if(tiny) tiny.textContent='えほん・おもちゃ・ごはん。どれを多くあげたかで進化が分岐します。';
      const evo=route.querySelector('.evolist');
      if(evo) evo.innerHTML='<div class="evo">📘<br><b>学習型</b></div><div class="evo">⚡<br><b>元気型</b></div><div class="evo">🌱<br><b>のんびり型</b></div><div class="evo">🌟<br><b>バランス型</b></div>';
    }

    const inv=$('inventory');
    if(inv && !$('shop')){
      const oldTitle=inv.previousElementSibling;
      if(oldTitle && oldTitle.classList.contains('section')) oldTitle.textContent='ショップ';
      const rule=document.createElement('div');
      rule.id='pointRule';
      rule.className='card';
      rule.style.marginBottom='10px';
      rule.innerHTML=`<b>⭐ 育成ポイント</b><div class="tiny">今日の課題クリア：+${DAILY_CLEAR_POINTS}P ／ チャレンジ：1正解=1P</div><div class="tiny">新しい段の学習や、課題1問ごとの正解ではポイントは増えません。</div>`;
      if(oldTitle) oldTitle.before(rule);
      const shop=document.createElement('div');
      shop.id='shop'; shop.className='inventory';
      inv.before(shop);
      const owned=document.createElement('div');
      owned.id='ownedTitle'; owned.className='section'; owned.textContent='もちもの';
      inv.before(owned);
    }
  }

  window.buyItem=function(k){
    const it=SHOP[k];
    if(!it) return;
    if(S.coins<it.price){
      modal('⭐','ポイントが足りません',`${it.name}は${it.price}Pです。`);
      return;
    }
    S.coins-=it.price;
    S.pet.inv[k]=(S.pet.inv[k]||0)+1;
    S.pet.log.unshift(`${it.name}を${it.price}Pで購入`);
    save();
    petroom(); home();
  };

  useItem=function(k){
    const it=SHOP[k];
    if(!it || !S.pet.inv[k]) return;
    const old=branch();
    S.pet.inv[k]--;
    S.pet.xp=(S.pet.xp||0)+1;
    S.pet.care[it.care]=(S.pet.care[it.care]||0)+1;
    const nb=branch();
    S.pet.log.unshift(`${it.name}をあげた`);
    save();
    petroom(); home();
    if(!old&&nb) modal('✨','進化した！',`${RO[nb].n}になったよ！`);
  };

  const v6Home=home;
  home=function(){
    setupUi();
    v6Home();
    const t=taskState();
    if($('streak')) $('streak').textContent=S.taskStreak||0;
    if($('coins')) $('coins').textContent=S.coins||0;
    const st=stage(),ns=nextstage();
    const xp=$('xptext');
    if(xp) xp.textContent=ns===st?`おせわ ${S.pet.xp}回`:`次の成長まで ${Math.max(0,ns.m-S.pet.xp)}回おせわ`;
    const msg=$('petmsg');
    if(msg) msg.textContent=`${SPECIES[S.settings.species].n}を育てています`;
    if(t.cleared && $('nextdue')) $('nextdue').textContent='今日の課題クリア！';
  };

  petroom=function(){
    setupUi();
    const st=stage(),ns=nextstage();
    $('petvis2').innerHTML=petSvg();
    $('petname2').textContent=petName();
    $('stage2').textContent=`${SPECIES[S.settings.species].n}・${st.n}`;
    const from=st.m,to=ns===st?st.m+1:ns.m;
    const p=ns===st?100:(S.pet.xp-from)/(to-from)*100;
    $('xpbar2').style.width=Math.max(0,Math.min(100,p))+'%';
    $('xptext2').textContent=ns===st?`おせわ ${S.pet.xp}回`:`次の成長まで ${Math.max(0,to-S.pet.xp)}回おせわ`;

    const mx=Math.max(1,S.pet.care.study||0,S.pet.care.play||0,S.pet.care.food||0);
    for(const k of ['study','play','food']){
      $(k+'bar').style.width=(S.pet.care[k]||0)/mx*100+'%';
      $(k+'v').textContent=S.pet.care[k]||0;
    }

    const shop=$('shop');
    if(shop){
      shop.innerHTML='';
      for(const [k,it] of Object.entries(SHOP)){
        const b=document.createElement('button');
        b.className='item';
        b.innerHTML=`<div class="e">${it.emoji}</div><b>${it.name}</b><div class="tiny">${it.price}Pで購入</div>`;
        b.onclick=()=>buyItem(k);
        shop.appendChild(b);
      }
    }

    $('inventory').innerHTML='';
    for(const [k,it] of Object.entries(SHOP)){
      const n=S.pet.inv[k]||0;
      const b=document.createElement('button');
      b.className='item';
      b.disabled=n<=0;
      b.innerHTML=`<div class="e">${it.emoji}</div><b>${it.name}</b><div class="tiny">×${n}　あげる</div>`;
      b.onclick=()=>useItem(k);
      $('inventory').appendChild(b);
    }

    $('log').innerHTML='';
    S.pet.log.slice(0,8).forEach(x=>{
      const r=document.createElement('div'); r.className='row'; r.textContent=x; $('log').appendChild(r);
    });
    if($('coins')) $('coins').textContent=S.coins||0;
  };

  // 新しい段をおぼえる：学習記録だけ。ポイントも育成も増えない。
  submitLearn=function(){
    if($('learna').value==='') return;
    const f=S.f[`${ld}x${lb}`],ans=ld*lb,ok=+$('learna').value===ans;
    rec(f,ok,performance.now()-ls,'learn');
    $('learnfb').className='feedback '+(ok?'ok':'ng');
    $('learnfb').textContent=ok?'正解！ 次は '+fmt(f.d):'答えは '+ans+'。5分後にもう一度';
    setTimeout(()=>{
      lb++;
      if(lb>9){lb=1;modal('🎉',ld+'の段クリア！','学習できました。今日の課題のポイントには加算されません。');home()}
      else nextLearn();
    },500);
  };

  function taskPool(){
    return Object.values(S.f).filter(f=>f.l>=0);
  }
  function pickTaskFact(){
    const pool=taskPool();
    if(!pool.length) return null;
    const now=Date.now(),weighted=[];
    for(const f of pool){
      let n=1;
      if(f.d&&f.d<=now)n+=4;
      if(f.at&&f.ok/f.at<.75)n+=3;
      if((f.ms||0)>5000)n+=1;
      for(let i=0;i<n;i++) weighted.push(f);
    }
    return weighted[Math.floor(Math.random()*weighted.length)]||pool[0];
  }

  openReview=function(){
    const t=taskState(),g=goal();
    if(t.correct>=g){
      if(!t.cleared) finishReview();
      else {modal('🎉','今日の課題はクリア済み！',`${t.correct}／${g} 正解できています。`);show('home');}
      return;
    }
    if(!taskPool().length){
      modal('📘','まず1つの段をおぼえよう','「新しい段をおぼえる」で学習した九九が、今日の課題に出題されます。');
      show('learn'); return;
    }
    show('review'); nextReview();
  };

  nextReview=function(){
    const t=taskState(),g=goal();
    if(t.correct>=g){finishReview();return;}
    currentTaskFact=pickTaskFact();
    if(!currentTaskFact){show('home');return;}
    $('reviewprog').textContent=`${t.correct}／${g} 正解`;
    $('reviewlevel').textContent='正解した問題だけ今日の課題にカウント';
    $('reviewq').textContent=`${currentTaskFact.a} × ${currentTaskFact.b}`;
    $('reviewa').value=''; $('reviewfb').textContent='';
    $('reviewsched').textContent=`あと ${g-t.correct} 問正解でクリア`;
    rs=performance.now();
    setTimeout(()=>$('reviewa').focus(),80);
  };

  submitReview=function(){
    if($('reviewa').value===''||!currentTaskFact)return;
    const t=taskState(),g=goal(),ans=currentTaskFact.a*currentTaskFact.b;
    const ok=+$('reviewa').value===ans;
    t.attempts++;
    rec(currentTaskFact,ok,performance.now()-rs,'review');
    if(ok){
      t.correct++;
      $('reviewfb').className='feedback ok';
      $('reviewfb').textContent='○ 正解！ 1問カウント';
      $('reviewsched').textContent=`${Math.min(t.correct,g)}／${g} 正解`;
    }else{
      t.wrong++;
      $('reviewfb').className='feedback ng';
      $('reviewfb').innerHTML=`✕ ちがうよ<div class="wrong-answer">正解は ${ans}</div>`;
      $('reviewsched').textContent='不正解はカウントされません';
    }
    S.dailyTask=t; save();
    setTimeout(nextReview,ok?430:1050);
  };

  function updateTaskStreak(){
    const today=day();
    if(S.lastTaskClear===today) return;
    let next=1;
    if(S.lastTaskClear){
      const a=new Date(S.lastTaskClear+'T00:00:00'),b=new Date(today+'T00:00:00');
      const diff=Math.round((b-a)/86400000);
      if(diff===1) next=(S.taskStreak||0)+1;
    }
    S.taskStreak=next;
    S.lastTaskClear=today;
  }

  finishReview=function(){
    const t=taskState(),g=goal();
    if(t.correct<g){nextReview();return;}
    if(!t.cleared){
      t.cleared=true;
      S.coins=(S.coins||0)+DAILY_CLEAR_POINTS;
      updateTaskStreak();
      S.pet.log.unshift(`今日の課題クリア！ +${DAILY_CLEAR_POINTS}P`);
      S.dailyTask=t;
      save();
      modal('⭐','今日の課題クリア！',`${g}問正解！ +${DAILY_CLEAR_POINTS}P ゲット！`);
    }else{
      modal('🎉','今日の課題はクリア済み！',`${t.correct}／${g} 正解できています。`);
    }
    show('home');
  };

  // チャレンジ：正解数 = 獲得ポイント。直接育成はしない。
  submitChallenge=function(){
    if(challengeLocked||$('challengea').value===''||!cf)return;
    challengeLocked=true;
    const ok=+$('challengea').value===cf.a*cf.b,ms=performance.now()-cs;
    rec(cf,ok,ms,'challenge');
    if(ok){
      sc++;co++;
      $('challengefb').className='feedback ok';
      $('challengefb').textContent='○ 正解！ +1P予定';
    }else{
      co=0;
      $('challengefb').className='feedback ng';
      $('challengefb').innerHTML=`✕ ちがうよ<div class="wrong-answer">正解は ${cf.a*cf.b}</div>`;
    }
    $('score').textContent=sc;$('combo').textContent=co;
    save();
    setTimeout(nextChallenge,ok?320:1050);
  };

  finishChallenge=function(){
    if(!ct)return;
    clearInterval(ct);ct=null;challengeLocked=true;
    S.coins=(S.coins||0)+sc;
    if(sc>0) S.pet.log.unshift(`チャレンジ ${sc}問正解で +${sc}P`);
    save();
    modal('⭐',`${S.settings.challengeMin}分チャレンジ終了！`,`${sc}問正解！ +${sc}P ゲット！`);
    show('home');
  };

  // 設定変更後の表示
  const v6Settings=settings;
  settings=function(){
    setupUi(); v6Settings();
  };

  // デモ/初期化も新ポイント制に合わせる
  demo=function(){
    const keepSettings={...(S.settings||{})};
    S=D(); S.settings={...S.settings,...keepSettings};
    S.economyVersion=ECON_VERSION; S.coins=42; S.taskStreak=5; S.lastTaskClear=day();
    S.pet.xp=8; S.pet.care={study:4,play:2,food:2}; S.pet.inv={food:2,toy:1,book:2,gem:0}; S.pet.branch='study';
    const n=Date.now();
    for(let a=1;a<=9;a++)for(let b=1;b<=9;b++){
      const f=S.f[`${a}x${b}`];
      if((a+b)%3){f.at=6;f.ok=5;f.l=(a*b)%4;f.ms=2200+(a*b*151)%2500;f.d=n+(((a+b)%4)-2)*86400000;f.ca=3+((a*b)%6);f.cok=Math.max(1,Math.round(f.ca*((a*b)%5===0?.5:.85)));f.cms=1800+(a*b*143)%2500}
    }
    S.dailyTask={date:day(),correct:4,attempts:5,wrong:1,cleared:false};
    S.pet.log.unshift('新ポイント制のデモデータ');
    save();home();petroom();modal('🧪','デモデータON','育成ポイント・ショップ・今日の課題を確認できます。');
  };
  resetAll=function(){
    S=D();
    S.economyVersion=ECON_VERSION; S.coins=0; S.taskStreak=0; S.lastTaskClear=null;
    S.pet.xp=0; S.pet.branch=null; S.pet.care={study:0,play:0,food:0}; S.pet.inv={food:0,toy:0,book:0,gem:0};
    save();location.reload();
  };

  // 既存のEnterキーイベントより先に新処理を実行
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return;
    if(e.target&&e.target.id==='learna'){e.preventDefault();e.stopImmediatePropagation();submitLearn();}
    else if(e.target&&e.target.id==='reviewa'){e.preventDefault();e.stopImmediatePropagation();submitReview();}
    else if(e.target&&e.target.id==='challengea'){e.preventDefault();e.stopImmediatePropagation();submitChallenge();}
  },true);

  setupUi();
  home();
  petroom();
  settings();
})();


// v8: 「新しい段をおぼえる」を見る→聞く・言う→答えをかくす→9問テストに刷新
(function(){
  const READINGS={
    1:['いんいちがいち','いんにがに','いんさんがさん','いんしがし','いんごがご','いんろくがろく','いんしちがしち','いんはちがはち','いんくがく'],
    2:['にいちがに','ににんがし','にさんがろく','にしがはち','にごじゅう','にろくじゅうに','にしちじゅうし','にはちじゅうろく','にくじゅうはち'],
    3:['さんいちがさん','さんにがろく','さざんがく','さんしじゅうに','さんごじゅうご','さぶろくじゅうはち','さんしちにじゅういち','さんぱにじゅうし','さんくにじゅうしち'],
    4:['しいちがし','しにがはち','しさんじゅうに','ししじゅうろく','しごにじゅう','しろくにじゅうし','ししちにじゅうはち','しはさんじゅうに','しくさんじゅうろく'],
    5:['ごいちがご','ごにじゅう','ごさんじゅうご','ごしにじゅう','ごごにじゅうご','ごろくさんじゅう','ごしちさんじゅうご','ごはしじゅう','ごっくしじゅうご'],
    6:['ろくいちがろく','ろくにじゅうに','ろくさんじゅうはち','ろくしにじゅうし','ろくごさんじゅう','ろくろくさんじゅうろく','ろくしちしじゅうに','ろっぱしじゅうはち','ろっくごじゅうし'],
    7:['しちいちがしち','しちにじゅうし','しちさんにじゅういち','しちしにじゅうはち','しちごさんじゅうご','しちろくしじゅうに','しちしちしじゅうく','しちはごじゅうろく','しちくろくじゅうさん'],
    8:['はちいちがはち','はちにじゅうろく','はちさんにじゅうし','はちしさんじゅうに','はちごしじゅう','はちろくしじゅうはち','はちしちごじゅうろく','はっぱろくじゅうし','はっくしちじゅうに'],
    9:['くいちがく','くにじゅうはち','くさんにじゅうしち','くしさんじゅうろく','くごしじゅうご','くろくごじゅうし','くしちろくじゅうさん','くはしちじゅうに','くくはちじゅういち']
  };

  let dan=2, phase='choose', pos=0, hiddenQueue=[], hiddenMiss=[], testQueue=[], testPos=0, testCorrect=0, locked=false;

  function todayLocal(){
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function promoteYesterdayLearning(){
    let changed=false;
    Object.values(S.f).forEach(f=>{
      if(f.pendingLearn && f.learnedOn && f.learnedOn!==todayLocal()){
        f.pendingLearn=false;
        if(f.l<0) f.l=0;
        f.d=Date.now();
        changed=true;
      }
    });
    if(changed) save();
  }

  function injectStyles(){
    if(document.getElementById('learnV8Style')) return;
    const s=document.createElement('style');
    s.id='learnV8Style';
    s.textContent=`
      #learn .learn-v8-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      #learn .learn-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:10px 0 14px}
      #learn .learn-step{font-size:10px;text-align:center;padding:7px 3px;border-radius:12px;background:#f0ede7;color:#82776c;font-weight:700}
      #learn .learn-step.on{background:#ffe2a8;color:#6b4d24}
      #learn .learn-step.done{background:#dff2d6;color:#4e7442}
      #learn .chant-card{background:linear-gradient(180deg,#fffaf1,#fff);border:1px solid #eadbc6;border-radius:22px;padding:18px;text-align:center;box-shadow:0 5px 18px rgba(80,55,30,.06)}
      #learn .chant-eq{font-size:38px;font-weight:900;letter-spacing:.5px;margin:4px 0 8px}
      #learn .chant-reading{font-size:22px;font-weight:800;color:#9a5e27;margin:4px 0 14px;line-height:1.45}
      #learn .listen-btn{border:0;background:#fff0cf;border-radius:999px;padding:10px 16px;font-weight:800;color:#6c4f2f}
      #learn .learn-list{display:grid;gap:7px}
      #learn .learn-row{display:grid;grid-template-columns:92px 1fr 38px;align-items:center;gap:8px;padding:10px 12px;border-radius:14px;background:#fff;border:1px solid #eee3d6}
      #learn .learn-row b{font-size:18px}
      #learn .learn-row .r{font-size:14px;color:#8c623b}
      #learn .round-audio{border:0;width:36px;height:36px;border-radius:50%;background:#fff0cf;font-size:18px}
      #learn .learn-note{font-size:12px;color:#8b8178;line-height:1.5;margin:10px 2px}
      #learn .learn-actions{display:grid;gap:8px;margin-top:13px}
      #learn .learn-feedback{min-height:30px;font-weight:800;margin-top:9px}
      #learn .learn-result{font-size:48px;font-weight:900;margin:8px 0}
      #learn .learn-badge{display:inline-block;background:#fff0cf;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;color:#70532f}
      #learn .mini-progress{font-size:12px;color:#877a6c;margin-bottom:6px}
    `;
    document.head.appendChild(s);
  }

  function speak(text){
    if(!('speechSynthesis' in window)){
      modal('🔊','音声を使えません','この端末では音声読み上げに対応していません。');
      return;
    }
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.lang='ja-JP';
      u.rate=.82;
      u.pitch=1.04;
      const voices=speechSynthesis.getVoices();
      const jp=voices.find(v=>/^ja/i.test(v.lang));
      if(jp) u.voice=jp;
      speechSynthesis.speak(u);
    }catch(e){}
  }
  window.learnSpeakV8=speak;

  function reading(b){return READINGS[dan][b-1];}
  function eq(b,showAnswer=true){return `${dan} × ${b}${showAnswer?' = '+dan*b:''}`;}
  function shuffle(a){return a.slice().sort(()=>Math.random()-.5);}

  function screen(){
    injectStyles();
    const el=$('learn');
    if(!el) return;
    el.innerHTML='<div id="learnV8"></div>';
    render();
  }

  function stepBar(active){
    const names=[['look','① 見る'],['say','② 聞く・言う'],['hide','③ かくす'],['test','④ テスト']];
    return `<div class="learn-steps">${names.map(([k,n])=>`<div class="learn-step ${k===active?'on':phaseRank(k)<phaseRank(active)?'done':''}">${n}</div>`).join('')}</div>`;
  }
  function phaseRank(p){return {look:1,say:2,hide:3,test:4,result:5}[p]||0;}

  function render(){
    const root=document.getElementById('learnV8');
    if(!root) return;
    if(phase==='choose'){ renderChoose(root); return; }
    if(phase==='look'){ renderLook(root); return; }
    if(phase==='say'){ renderSay(root); return; }
    if(phase==='hide'){ renderHide(root); return; }
    if(phase==='test'){ renderTest(root); return; }
    if(phase==='result'){ renderResult(root); return; }
  }

  function renderChoose(root){
    root.innerHTML=`
      <div class="section">新しい段をおぼえる</div>
      <div class="card">
        <b>まず「答える」より「覚える」</b>
        <div class="sub">数字・九九の唱え方・音をセットで覚えてから、答えを隠して確認します。</div>
      </div>
      <div class="section">段をえらぶ</div>
      <div class="dan" id="danV8"></div>
      <div class="learn-note">※ ここでの練習やテストは「今日の課題」の正解数・育成ポイントには加算されません。</div>`;
    const g=document.getElementById('danV8');
    for(let a=1;a<=9;a++){
      const b=document.createElement('button');
      const learned=Object.values(S.f).filter(f=>f.a===a&&f.learnedOn).length===9;
      b.innerHTML=`${a}の段${learned?'<br><small>✓ 学習済み</small>':''}`;
      b.onclick=()=>startDan(a);
      g.appendChild(b);
    }
  }

  function startDan(a){
    dan=a; phase='look'; pos=0; hiddenQueue=[]; hiddenMiss=[]; testQueue=[]; testPos=0; testCorrect=0; locked=false;
    render();
  }

  function header(title){
    return `<div class="learn-v8-head"><div><div class="section" style="margin:0">${dan}の段</div><div class="tiny">${title}</div></div><button class="listen-btn" onclick="learnBackV8()">← 段を選ぶ</button></div>`;
  }
  window.learnBackV8=function(){phase='choose';try{speechSynthesis.cancel()}catch(e){}render();};

  function renderLook(root){
    root.innerHTML=header('まず全部を見て、読み方を知ろう')+stepBar('look')+`
      <div class="learn-list">${Array.from({length:9},(_,i)=>{
        const b=i+1;
        return `<div class="learn-row"><b>${eq(b)}</b><div class="r">${reading(b)}</div><button class="round-audio" onclick="learnSpeakV8('${reading(b)}')">🔊</button></div>`;
      }).join('')}</div>
      <div class="learn-actions"><button class="cta" onclick="learnStartSayV8()">全部見た！ 次へ</button></div>
      <div class="learn-note">🔊を押すと九九の唱え方を聞けます。学校や先生によって細かな読み方が異なる場合があります。</div>`;
  }
  window.learnStartSayV8=function(){phase='say';pos=0;render();setTimeout(()=>speak(reading(1)),180);};

  function renderSay(root){
    const b=pos+1;
    root.innerHTML=header('聞いて、声に出して言ってみよう')+stepBar('say')+`
      <div class="mini-progress">${b} / 9</div>
      <div class="chant-card">
        <div class="chant-eq">${eq(b)}</div>
        <div class="chant-reading">${reading(b)}</div>
        <button class="listen-btn" onclick="learnSpeakV8('${reading(b)}')">🔊 もう一度きく</button>
      </div>
      <div class="learn-actions"><button class="cta green" onclick="learnSaidV8()">声に出して言えた！</button></div>
      <div class="learn-note">音をまねして言うだけでOK。ここでは正解・不正解をつけません。</div>`;
  }
  window.learnSaidV8=function(){
    pos++;
    if(pos>=9){phase='hide';pos=0;hiddenQueue=Array.from({length:9},(_,i)=>i+1);hiddenMiss=[];render();}
    else {render();setTimeout(()=>speak(reading(pos+1)),140);}
  };

  function renderHide(root){
    const b=hiddenQueue[pos];
    root.innerHTML=header('今度は答えを隠して思い出そう')+stepBar('hide')+`
      <div class="mini-progress">${pos+1} / ${hiddenQueue.length}</div>
      <div class="chant-card">
        <div class="chant-eq">${dan} × ${b} = ？</div>
        <div class="chant-reading" style="font-size:15px;color:#8b8178">九九の唱え方も思い出してみよう</div>
        <div class="ansrow" style="justify-content:center;margin-top:12px">
          <input id="learnAnswerV8" class="answer" inputmode="numeric" aria-label="答え">
          <button class="cta" style="width:auto" onclick="learnSubmitHideV8()">答える</button>
        </div>
        <div id="learnFeedbackV8" class="learn-feedback"></div>
      </div>
      <div class="learn-note">間違えても大丈夫。正解を見てから、あとでもう一度出ます。</div>`;
    setTimeout(()=>document.getElementById('learnAnswerV8')?.focus(),80);
  }

  window.learnSubmitHideV8=function(){
    if(locked) return;
    const input=document.getElementById('learnAnswerV8');
    if(!input||input.value==='')return;
    locked=true;
    const b=hiddenQueue[pos],ans=dan*b,ok=Number(input.value)===ans;
    const fb=document.getElementById('learnFeedbackV8');
    if(ok){
      fb.className='learn-feedback feedback ok'; fb.textContent='○ できた！';
    }else{
      fb.className='learn-feedback feedback ng'; fb.innerHTML=`✕ 正解は ${ans}<br><span class="tiny">${reading(b)}</span>`;
      if(!hiddenMiss.includes(b))hiddenMiss.push(b);
    }
    setTimeout(()=>{
      pos++;
      if(pos>=hiddenQueue.length){
        if(hiddenMiss.length){
          hiddenQueue=hiddenMiss.slice();hiddenMiss=[];pos=0;
          modal('🔁','もう一度だけ','間違えた問題だけ、もう一度やってみよう！');
        }else{
          phase='test';testQueue=shuffle(Array.from({length:9},(_,i)=>i+1));testPos=0;testCorrect=0;
        }
      }
      locked=false;render();
    },ok?430:1050);
  };

  function renderTest(root){
    const b=testQueue[testPos];
    root.innerHTML=header('最後に9問テスト')+stepBar('test')+`
      <div class="mini-progress">${testPos+1} / 9　正解 ${testCorrect}</div>
      <div class="chant-card">
        <div class="learn-badge">答えも読み方も見ないで挑戦</div>
        <div class="chant-eq" style="margin-top:16px">${dan} × ${b} = ？</div>
        <div class="ansrow" style="justify-content:center;margin-top:12px">
          <input id="learnTestAnswerV8" class="answer" inputmode="numeric" aria-label="答え">
          <button class="cta" style="width:auto" onclick="learnSubmitTestV8()">答える</button>
        </div>
        <div id="learnTestFeedbackV8" class="learn-feedback"></div>
      </div>
      <div class="learn-note">このテストも「今日の課題」には加算されません。</div>`;
    setTimeout(()=>document.getElementById('learnTestAnswerV8')?.focus(),80);
  }

  window.learnSubmitTestV8=function(){
    if(locked)return;
    const input=document.getElementById('learnTestAnswerV8');
    if(!input||input.value==='')return;
    locked=true;
    const b=testQueue[testPos],ans=dan*b,ok=Number(input.value)===ans;
    const fb=document.getElementById('learnTestFeedbackV8');
    if(ok){testCorrect++;fb.className='learn-feedback feedback ok';fb.textContent='○ 正解！';}
    else{fb.className='learn-feedback feedback ng';fb.innerHTML=`✕ 正解は ${ans}<br><span class="tiny">${reading(b)}</span>`;}
    setTimeout(()=>{
      testPos++;
      if(testPos>=9){
        const learnedOn=todayLocal();
        const passed=testCorrect>=7;
        for(let b2=1;b2<=9;b2++){
          const f=S.f[`${dan}x${b2}`];
          f.learnTestScore=testCorrect;
          if(passed){
            f.learnedOn=learnedOn;
            f.pendingLearn=true;
            // 今日の課題に混ざらないよう、SRS開始は翌日
            if(f.l<0){f.l=-1;f.d=0;}
          }
        }
        if(!S.learnHistory)S.learnHistory={};
        S.learnHistory[dan]={date:learnedOn,score:testCorrect,passed};
        save();
        phase='result';
      }
      locked=false;render();
    },ok?400:950);
  };

  function renderResult(root){
    const pass=testCorrect>=7;
    root.innerHTML=header('学習おわり！')+`
      <div class="chant-card">
        <div style="font-size:52px">${pass?'🎉':'🌱'}</div>
        <div class="h1">${dan}の段</div>
        <div class="learn-result">${testCorrect} / 9</div>
        <div class="sub">${pass?'よく覚えられたね！':'もう一度やれば、もっと覚えられるよ！'}</div>
      </div>
      <div class="learn-actions">
        <button class="cta green" onclick="learnAgainV8()">もう一度おぼえる</button>
        <button class="cta white" onclick="learnFinishV8()">段をえらぶ</button>
      </div>
      <div class="learn-note">${pass?'合格した段は今日の課題には入りません。翌日以降、復習対象になります。':'7/9以上で「学習済み」になります。今回は今日の課題には追加されません。'}</div>`;
  }
  window.learnAgainV8=function(){phase='look';pos=0;testCorrect=0;render();};
  window.learnFinishV8=function(){phase='choose';render();};

  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return;
    if(e.target&&e.target.id==='learnAnswerV8'){e.preventDefault();learnSubmitHideV8();}
    if(e.target&&e.target.id==='learnTestAnswerV8'){e.preventDefault();learnSubmitTestV8();}
  });

  // show('learn') 時に新画面を初期化
  const prevShow=show;
  show=function(id){
    promoteYesterdayLearning();
    prevShow(id);
    if(id==='learn'){phase='choose';screen();}
  };

  // アプリを開いたまま翌日になった場合もホーム遷移時に復習対象へ
  const prevHome=home;
  home=function(){promoteYesterdayLearning();prevHome();};

  promoteYesterdayLearning();
  injectStyles();
})();


// v9: 学習フロー簡略化・読み方ON/OFF・ホーム導線整理
(function(){
  const READINGS={
    1:['いんいちがいち','いんにがに','いんさんがさん','いんしがし','いんごがご','いんろくがろく','いんしちがしち','いんはちがはち','いんくがく'],
    2:['にいちがに','ににんがし','にさんがろく','にしがはち','にごじゅう','にろくじゅうに','にしちじゅうし','にはちじゅうろく','にくじゅうはち'],
    3:['さんいちがさん','さんにがろく','さざんがく','さんしじゅうに','さんごじゅうご','さぶろくじゅうはち','さんしちにじゅういち','さんぱにじゅうし','さんくにじゅうしち'],
    4:['しいちがし','しにがはち','しさんじゅうに','ししじゅうろく','しごにじゅう','しろくにじゅうし','ししちにじゅうはち','しはさんじゅうに','しくさんじゅうろく'],
    5:['ごいちがご','ごにじゅう','ごさんじゅうご','ごしにじゅう','ごごにじゅうご','ごろくさんじゅう','ごしちさんじゅうご','ごはしじゅう','ごっくしじゅうご'],
    6:['ろくいちがろく','ろくにじゅうに','ろくさんじゅうはち','ろくしにじゅうし','ろくごさんじゅう','ろくろくさんじゅうろく','ろくしちしじゅうに','ろっぱしじゅうはち','ろっくごじゅうし'],
    7:['しちいちがしち','しちにじゅうし','しちさんにじゅういち','しちしにじゅうはち','しちごさんじゅうご','しちろくしじゅうに','しちしちしじゅうく','しちはごじゅうろく','しちくろくじゅうさん'],
    8:['はちいちがはち','はちにじゅうろく','はちさんにじゅうし','はちしさんじゅうに','はちごしじゅう','はちろくしじゅうはち','はちしちごじゅうろく','はっぱろくじゅうし','はっくしちじゅうに'],
    9:['くいちがく','くにじゅうはち','くさんにじゅうしち','くしさんじゅうろく','くごしじゅうご','くろくごじゅうし','くしちろくじゅうさん','くはしちじゅうに','くくはちじゅういち']
  };

  let dan=2, phase='choose', pos=0, hiddenQueue=[], hiddenMiss=[], testQueue=[], testPos=0, testCorrect=0, locked=false;

  function ensureV9Settings(){
    if(!S.settings) S.settings={};
    if(typeof S.settings.showReadings!=='boolean') S.settings.showReadings=true;
    save();
  }

  function injectStyles(){
    if(document.getElementById('v9style')) return;
    const s=document.createElement('style');
    s.id='v9style';
    s.textContent=`
      #learn .v9-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      #learn .v9-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0 14px}
      #learn .v9-step{font-size:11px;text-align:center;padding:8px 4px;border-radius:12px;background:#f0ede7;color:#82776c;font-weight:800}
      #learn .v9-step.on{background:#ffe2a8;color:#6b4d24}
      #learn .v9-step.done{background:#dff2d6;color:#4e7442}
      #learn .v9-list{display:grid;gap:7px}
      #learn .v9-row{display:grid;grid-template-columns:105px 1fr;align-items:center;gap:8px;padding:11px 12px;border-radius:14px;background:#fff;border:1px solid #eee3d6}
      #learn .v9-row.no-reading{grid-template-columns:1fr;text-align:center}
      #learn .v9-row b{font-size:19px}
      #learn .v9-reading{font-size:14px;color:#8c623b;font-weight:700}
      #learn .v9-card{background:linear-gradient(180deg,#fffaf1,#fff);border:1px solid #eadbc6;border-radius:22px;padding:18px;text-align:center;box-shadow:0 5px 18px rgba(80,55,30,.06)}
      #learn .v9-eq{font-size:38px;font-weight:900;letter-spacing:.5px;margin:8px 0}
      #learn .v9-note{font-size:12px;color:#8b8178;line-height:1.5;margin:10px 2px}
      #learn .v9-actions{display:grid;gap:8px;margin-top:13px}
      #learn .v9-result{font-size:48px;font-weight:900;margin:8px 0}
      #learn .v9-mini{font-size:12px;color:#877a6c;margin-bottom:6px}
      #settings .v9-setting{margin-top:0}
      #home .v9-challenge-card{display:grid;gap:9px}
      #home .v9-rewards{display:grid;gap:9px}
      #home .v9-reward-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 12px;border-radius:14px;background:#fffaf1}
      #home .v9-reward-row b{white-space:nowrap}
    `;
    document.head.appendChild(s);
  }

  function reading(b){ return READINGS[dan][b-1]; }
  function eq(b,show=true){ return `${dan} × ${b}${show?' = '+dan*b:''}`; }
  function shuffle(a){ return a.slice().sort(()=>Math.random()-.5); }
  function rank(p){ return {look:1,hide:2,test:3,result:4}[p]||0; }

  function stepBar(active){
    const names=[['look','① 見る'],['hide','② かくす'],['test','③ テスト']];
    return `<div class="v9-steps">${names.map(([k,n])=>`<div class="v9-step ${k===active?'on':rank(k)<rank(active)?'done':''}">${n}</div>`).join('')}</div>`;
  }

  function learnScreen(){
    injectStyles();
    const el=$('learn');
    if(!el)return;
    el.innerHTML='<div id="learnV9"></div>';
    renderLearn();
  }

  function renderLearn(){
    const root=document.getElementById('learnV9');
    if(!root)return;
    if(phase==='choose') return renderChoose(root);
    if(phase==='look') return renderLook(root);
    if(phase==='hide') return renderHide(root);
    if(phase==='test') return renderTest(root);
    if(phase==='result') return renderResult(root);
  }

  function renderChoose(root){
    root.innerHTML=`
      <div class="section">新しい段をおぼえる</div>
      <div class="card">
        <b>見て覚える → 隠して思い出す</b>
        <div class="sub">最初に答えを見て覚え、そのあと答えを隠して確認します。</div>
      </div>
      <div class="section">段をえらぶ</div>
      <div class="dan" id="danV9"></div>
      <div class="v9-note">※ ここでの正解は「今日の課題」や育成ポイントには加算されません。</div>`;
    const g=document.getElementById('danV9');
    for(let a=1;a<=9;a++){
      const b=document.createElement('button');
      const learned=Object.values(S.f).filter(f=>f.a===a&&f.learnedOn).length===9;
      b.innerHTML=`${a}の段${learned?'<br><small>✓ 学習済み</small>':''}`;
      b.onclick=()=>startDan(a);
      g.appendChild(b);
    }
  }

  function startDan(a){
    dan=a;phase='look';pos=0;hiddenQueue=[];hiddenMiss=[];testQueue=[];testPos=0;testCorrect=0;locked=false;
    renderLearn();
  }

  function head(title){
    return `<div class="v9-head"><div><div class="section" style="margin:0">${dan}の段</div><div class="tiny">${title}</div></div><button class="listen-btn" onclick="learnBackV9()">← 段を選ぶ</button></div>`;
  }
  window.learnBackV9=function(){phase='choose';renderLearn();};

  function renderLook(root){
    const show=S.settings.showReadings!==false;
    root.innerHTML=head('まず答えを見て覚えよう')+stepBar('look')+`
      <div class="v9-list">${Array.from({length:9},(_,i)=>{
        const b=i+1;
        return `<div class="v9-row ${show?'':'no-reading'}"><b>${eq(b)}</b>${show?`<div class="v9-reading">${reading(b)}</div>`:''}</div>`;
      }).join('')}</div>
      <div class="v9-actions"><button class="cta" onclick="learnStartHideV9()">覚えた！ 答えをかくす</button></div>
      <div class="v9-note">${show?'「いんいちがいち」などの読み方も一緒に表示しています。':'九九の読み方は設定でOFFになっています。'}</div>`;
  }
  window.learnStartHideV9=function(){phase='hide';pos=0;hiddenQueue=Array.from({length:9},(_,i)=>i+1);hiddenMiss=[];renderLearn();};

  function renderHide(root){
    const b=hiddenQueue[pos],show=S.settings.showReadings!==false;
    root.innerHTML=head('答えを隠して思い出そう')+stepBar('hide')+`
      <div class="v9-mini">${pos+1} / ${hiddenQueue.length}</div>
      <div class="v9-card">
        <div class="v9-eq">${dan} × ${b} = ？</div>
        ${show?'<div class="tiny">読み方も頭の中で思い出してみよう</div>':''}
        <div class="ansrow" style="justify-content:center;margin-top:12px">
          <input id="learnAnswerV9" class="answer" inputmode="numeric" aria-label="答え">
          <button class="cta" style="width:auto" onclick="learnSubmitHideV9()">答える</button>
        </div>
        <div id="learnFeedbackV9" class="feedback"></div>
      </div>
      <div class="v9-note">間違えた問題は、正解を確認したあとでもう一度出ます。</div>`;
    setTimeout(()=>document.getElementById('learnAnswerV9')?.focus(),80);
  }

  window.learnSubmitHideV9=function(){
    if(locked)return;
    const input=document.getElementById('learnAnswerV9');
    if(!input||input.value==='')return;
    locked=true;
    const b=hiddenQueue[pos],ans=dan*b,ok=Number(input.value)===ans;
    const fb=document.getElementById('learnFeedbackV9');
    if(ok){fb.className='feedback ok';fb.textContent='○ できた！';}
    else{
      fb.className='feedback ng';
      fb.innerHTML=`✕ 正解は ${ans}${S.settings.showReadings!==false?`<br><span class="tiny">${reading(b)}</span>`:''}`;
      if(!hiddenMiss.includes(b))hiddenMiss.push(b);
    }
    setTimeout(()=>{
      pos++;
      if(pos>=hiddenQueue.length){
        if(hiddenMiss.length){hiddenQueue=hiddenMiss.slice();hiddenMiss=[];pos=0;}
        else{phase='test';testQueue=shuffle(Array.from({length:9},(_,i)=>i+1));testPos=0;testCorrect=0;}
      }
      locked=false;renderLearn();
    },ok?430:950);
  };

  function renderTest(root){
    const b=testQueue[testPos];
    root.innerHTML=head('最後に9問テスト')+stepBar('test')+`
      <div class="v9-mini">${testPos+1} / 9　正解 ${testCorrect}</div>
      <div class="v9-card">
        <div class="learn-badge">答えを見ずに挑戦</div>
        <div class="v9-eq">${dan} × ${b} = ？</div>
        <div class="ansrow" style="justify-content:center;margin-top:12px">
          <input id="learnTestAnswerV9" class="answer" inputmode="numeric" aria-label="答え">
          <button class="cta" style="width:auto" onclick="learnSubmitTestV9()">答える</button>
        </div>
        <div id="learnTestFeedbackV9" class="feedback"></div>
      </div>
      <div class="v9-note">7/9以上で「学習済み」。このテストの正解は今日の課題には加算されません。</div>`;
    setTimeout(()=>document.getElementById('learnTestAnswerV9')?.focus(),80);
  }

  window.learnSubmitTestV9=function(){
    if(locked)return;
    const input=document.getElementById('learnTestAnswerV9');
    if(!input||input.value==='')return;
    locked=true;
    const b=testQueue[testPos],ans=dan*b,ok=Number(input.value)===ans;
    const fb=document.getElementById('learnTestFeedbackV9');
    if(ok){testCorrect++;fb.className='feedback ok';fb.textContent='○ 正解！';}
    else{fb.className='feedback ng';fb.innerHTML=`✕ 正解は ${ans}${S.settings.showReadings!==false?`<br><span class="tiny">${reading(b)}</span>`:''}`;}
    setTimeout(()=>{
      testPos++;
      if(testPos>=9){
        const passed=testCorrect>=7;
        const learnedOn=(new Date()).toISOString().slice(0,10);
        for(let b2=1;b2<=9;b2++){
          const f=S.f[`${dan}x${b2}`];
          f.learnTestScore=testCorrect;
          if(passed){
            f.learnedOn=learnedOn;
            f.pendingLearn=false;
            if(f.l<0)f.l=0;
            if(!f.d)f.d=Date.now();
          }
        }
        if(!S.learnHistory)S.learnHistory={};
        S.learnHistory[dan]={date:learnedOn,score:testCorrect,passed};
        save();phase='result';
      }
      locked=false;renderLearn();
    },ok?400:900);
  };

  function renderResult(root){
    const pass=testCorrect>=7;
    root.innerHTML=head('学習おわり！')+`
      <div class="v9-card">
        <div style="font-size:52px">${pass?'🎉':'🌱'}</div>
        <div class="h1">${dan}の段</div>
        <div class="v9-result">${testCorrect} / 9</div>
        <div class="sub">${pass?'学習済みになりました！':'7/9以上でもう一度チャレンジ！'}</div>
      </div>
      <div class="v9-actions">
        <button class="cta green" onclick="learnAgainV9()">もう一度おぼえる</button>
        <button class="cta white" onclick="learnFinishV9()">段をえらぶ</button>
      </div>
      <div class="v9-note">${pass?'この段は「今日の課題」の出題対象になります。':'今回はまだ「今日の課題」の出題対象にはなりません。'}</div>`;
  }
  window.learnAgainV9=function(){phase='look';pos=0;testCorrect=0;renderLearn();};
  window.learnFinishV9=function(){phase='choose';renderLearn();};

  // 今日の課題は「新しい段をおぼえる」で学習済みになった九九だけ
  function learnedFacts(){
    return Object.values(S.f).filter(f=>!!f.learnedOn);
  }
  function pickLearnedFact(){
    const pool=learnedFacts();
    if(!pool.length)return null;
    const now=Date.now(),weighted=[];
    for(const f of pool){
      let n=1;
      if(f.d&&f.d<=now)n+=4;
      if(f.at&&f.ok/f.at<.75)n+=3;
      if((f.ms||0)>5000)n+=1;
      for(let i=0;i<n;i++)weighted.push(f);
    }
    return weighted[Math.floor(Math.random()*weighted.length)]||pool[0];
  }

  let taskFact=null;
  openReview=function(){
    const t=(function(){
      if(!S.dailyTask||S.dailyTask.date!==day())S.dailyTask={date:day(),correct:0,attempts:0,wrong:0,cleared:false};
      return S.dailyTask;
    })();
    const g=Number(S.settings.dailyGoal)||10;
    if(t.correct>=g){
      if(!t.cleared)finishReview();
      else{modal('🎉','今日の課題はクリア済み！',`${t.correct}／${g} 正解できています。`);show('home');}
      return;
    }
    if(!learnedFacts().length){
      modal('📘','まず新しい段をおぼえよう','「新しい段をおぼえる」で7/9以上になると、今日の課題に出題されます。');
      show('learn');return;
    }
    show('review');nextReview();
  };

  nextReview=function(){
    const t=S.dailyTask&&S.dailyTask.date===day()?S.dailyTask:(S.dailyTask={date:day(),correct:0,attempts:0,wrong:0,cleared:false});
    const g=Number(S.settings.dailyGoal)||10;
    if(t.correct>=g){finishReview();return;}
    taskFact=pickLearnedFact();
    if(!taskFact){show('home');return;}
    $('reviewprog').textContent=`${t.correct}／${g} 正解`;
    $('reviewlevel').textContent='学習済みの九九から出題';
    $('reviewq').textContent=`${taskFact.a} × ${taskFact.b}`;
    $('reviewa').value='';$('reviewfb').textContent='';
    $('reviewsched').textContent=`あと ${g-t.correct} 問正解でクリア`;
    rs=performance.now();
    setTimeout(()=>$('reviewa').focus(),80);
  };

  submitReview=function(){
    if($('reviewa').value===''||!taskFact)return;
    const t=S.dailyTask&&S.dailyTask.date===day()?S.dailyTask:(S.dailyTask={date:day(),correct:0,attempts:0,wrong:0,cleared:false});
    const g=Number(S.settings.dailyGoal)||10;
    const ans=taskFact.a*taskFact.b,ok=Number($('reviewa').value)===ans;
    t.attempts++;
    rec(taskFact,ok,performance.now()-rs,'review');
    if(ok){
      t.correct++;
      $('reviewfb').className='feedback ok';$('reviewfb').textContent='○ 正解！ 1問カウント';
      $('reviewsched').textContent=`${Math.min(t.correct,g)}／${g} 正解`;
    }else{
      t.wrong++;
      $('reviewfb').className='feedback ng';$('reviewfb').innerHTML=`✕ ちがうよ<div class="wrong-answer">正解は ${ans}</div>`;
      $('reviewsched').textContent='不正解はカウントされません';
    }
    S.dailyTask=t;save();
    setTimeout(nextReview,ok?430:950);
  };

  function settingsUi(){
    const s=$('settings');
    if(!s||document.getElementById('readingSettingV9'))return;
    const first=s.querySelector('.card.setting-card');
    if(!first)return;
    const title=document.createElement('div');title.className='section';title.textContent='九九の読み方';
    const card=document.createElement('div');card.className='card setting-card v9-setting';card.id='readingSettingV9';
    card.innerHTML=`
      <b>「いんいちがいち」などの表示</b>
      <div class="sub">新しい段をおぼえる画面で、九九の読み方を表示するか選べます。</div>
      <div class="seg">
        <button data-reading="on" onclick="setReadingV9(true)">ON</button>
        <button data-reading="off" onclick="setReadingV9(false)">OFF</button>
      </div>
      <div id="readingSettingTextV9" class="tiny"></div>`;
    first.after(title,card);
  }
  window.setReadingV9=function(v){S.settings.showReadings=!!v;save();renderSettingsV9();};
  function renderSettingsV9(){
    ensureV9Settings();settingsUi();
    document.querySelectorAll('[data-reading]').forEach(b=>b.classList.toggle('active',(b.dataset.reading==='on')===S.settings.showReadings));
    const t=document.getElementById('readingSettingTextV9');
    if(t)t.textContent=`現在：${S.settings.showReadings?'ON':'OFF'}`;
  }

  function homeUi(){
    const h=$('home');if(!h)return;
    const stack=h.querySelector('.stack');
    if(stack){
      const learn=[...stack.querySelectorAll('button')].find(b=>(b.getAttribute('onclick')||'').includes("show('learn')"));
      const task=[...stack.querySelectorAll('button')].find(b=>(b.getAttribute('onclick')||'').includes('openReview'));
      const ch=document.getElementById('challengeHome');
      if(learn&&task){
        stack.innerHTML='';
        learn.textContent='📘 新しい段をおぼえる';
        task.textContent='🧠 今日の課題をする';
        stack.append(learn,task);
      }
      if(ch){
        let area=document.getElementById('challengeAreaV9');
        if(!area){
          area=document.createElement('div');area.id='challengeAreaV9';
          area.innerHTML='<div class="section">チャレンジ</div><div class="card v9-challenge-card"><div class="sub">時間内に何問正解できるか挑戦。正解1問ごとに1P。</div><div id="challengeBtnSlotV9"></div></div>';
          stack.after(area);
        }
        document.getElementById('challengeBtnSlotV9').appendChild(ch);
      }
    }

    const sections=[...h.querySelectorAll('.section')];
    const rewardSec=sections.find(x=>x.textContent.trim()==='今日のごほうび');
    if(rewardSec){
      let card=rewardSec.nextElementSibling;
      if(card&&card.classList.contains('card')){
        card.className='card v9-rewards';
        card.innerHTML=`
          <div class="v9-reward-row"><span>🧠 今日の課題をクリア</span><b>+10P</b></div>
          <div class="v9-reward-row"><span>⏱ チャレンジ</span><b>正解数 × 1P</b></div>
          <div class="tiny">ポイントをためて、育成画面のショップでアイテムを買えます。</div>`;
      }
    }
  }

  const prevShow=show;
  show=function(id){
    prevShow(id);
    if(id==='learn'){phase='choose';learnScreen();}
    if(id==='settings')renderSettingsV9();
  };

  const prevHome=home;
  home=function(){prevHome();homeUi();};

  const prevSettings=settings;
  settings=function(){prevSettings();renderSettingsV9();};

  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return;
    if(e.target&&e.target.id==='learnAnswerV9'){e.preventDefault();e.stopImmediatePropagation();learnSubmitHideV9();}
    if(e.target&&e.target.id==='learnTestAnswerV9'){e.preventDefault();e.stopImmediatePropagation();learnSubmitTestV9();}
  },true);

  ensureV9Settings();injectStyles();settingsUi();renderSettingsV9();homeUi();
})();


// キャラクターの表示と進化ガイド
(function(){
  function injectV10Styles(){
    if(document.getElementById('v10style')) return;
    const s=document.createElement('style');
    s.id='v10style';
    s.textContent=`
      .pet-anim.v10pet{filter:drop-shadow(0 10px 12px rgba(74,52,34,.16));overflow:visible}
      .pet-anim.v10pet .blink{transform-origin:center;animation:v10blink 4.6s infinite}
      .pet-anim.v10pet .breath{transform-origin:center;animation:v10breath 3.2s ease-in-out infinite}
      .pet-anim.v10pet .tail-real{transform-origin:145px 120px;animation:v10tail 2.8s ease-in-out infinite}
      @keyframes v10blink{0%,45%,48%,100%{transform:scaleY(1)}46%,47%{transform:scaleY(.12)}}
      @keyframes v10breath{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.025)}}
      @keyframes v10tail{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(7deg)}}
      #petroom .v10-evo-guide{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin:10px 0}
      #petroom .v10-evo-step{background:#fffaf1;border:1px solid #eadfce;border-radius:12px;padding:7px 3px;text-align:center;font-size:10px}
      #petroom .v10-evo-step.now{background:#ffe7b5;border-color:#e2bd72;font-weight:900}
    `;
    document.head.appendChild(s);
  }

  function petCfg(){
    const b=branch();
    return b && RO[b] ? RO[b] : {c1:'#d5a56b',c2:'#8e5f39',mark:''};
  }

  function stageInfo(){
    const n=stage().n;
    const order=['たまご','あかちゃん','こども','せいちょう','おとな'];
    return {name:n,index:Math.max(0,order.indexOf(n))};
  }

  function eggSvg(species){
    const accent=species==='dino'?'#7fa879':species==='human'?'#d49a78':'#b77a4a';
    return `
      <svg class="pet-anim v10pet" viewBox="0 0 220 210" aria-label="たまご">
        <defs>
          <radialGradient id="v10egg" cx="32%" cy="24%">
            <stop offset="0" stop-color="#fffef6"/>
            <stop offset=".45" stop-color="#f7e7bd"/>
            <stop offset="1" stop-color="#d9b56d"/>
          </radialGradient>
          <linearGradient id="v10ground" x1="0" y1="0" x2="0" y2="1">
            <stop stop-color="#6a5133" stop-opacity=".22"/><stop offset="1" stop-color="#6a5133" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <ellipse cx="110" cy="184" rx="63" ry="12" fill="url(#v10ground)"/>
        <path d="M110 28 C76 28 53 69 53 118 C53 162 76 184 110 184 C144 184 167 162 167 118 C167 69 144 28 110 28Z"
          fill="url(#v10egg)" stroke="#7a6549" stroke-width="4"/>
        <path d="M76 80 C88 67 92 84 104 70 C116 57 123 78 138 66" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" opacity=".65"/>
        <ellipse cx="87" cy="68" rx="15" ry="27" fill="#fff" opacity=".36" transform="rotate(20 87 68)"/>
        <path d="M94 132 l11-9 9 10 12-8" fill="none" stroke="#9a7b54" stroke-width="4" stroke-linecap="round" opacity=".45"/>
      </svg>`;
  }

  function animalSvg(idx,cfg){
    const grow=[.70,.80,.90,1.00][Math.max(0,idx-1)]||1;
    const ear=idx>=3?24:21, leg=idx>=3?31:25, muzzle=idx>=4?29:26;
    return `
      <svg class="pet-anim v10pet" viewBox="0 0 240 220" aria-label="動物キャラクター">
        <defs>
          <radialGradient id="v10fur" cx="34%" cy="22%">
            <stop offset="0" stop-color="#fff" stop-opacity=".42"/>
            <stop offset=".22" stop-color="${cfg.c1}"/>
            <stop offset="1" stop-color="${cfg.c2}"/>
          </radialGradient>
          <radialGradient id="v10muzzle" cx="42%" cy="30%"><stop stop-color="#fff7ea"/><stop offset="1" stop-color="#dcc6a8"/></radialGradient>
          <linearGradient id="v10shade" x1="0" x2="1"><stop stop-color="#5f432f" stop-opacity=".24"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>
        </defs>
        <ellipse cx="120" cy="199" rx="69" ry="11" fill="#5b4939" opacity=".14"/>
        <g transform="translate(120 114) scale(${grow}) translate(-120 -114)" class="breath">
          <path class="tail-real" d="M166 139 C211 126 224 153 201 170 C188 180 173 169 171 156"
            fill="none" stroke="${cfg.c2}" stroke-width="22" stroke-linecap="round"/>
          <ellipse cx="120" cy="143" rx="53" ry="48" fill="url(#v10fur)"/>
          <path d="M87 153 C93 176 92 ${176+leg/5} 88 ${185+leg/6}" stroke="${cfg.c2}" stroke-width="${leg}" stroke-linecap="round"/>
          <path d="M151 153 C147 176 148 ${176+leg/5} 152 ${185+leg/6}" stroke="${cfg.c2}" stroke-width="${leg}" stroke-linecap="round"/>
          <ellipse cx="120" cy="89" rx="49" ry="44" fill="url(#v10fur)"/>
          <path d="M82 68 L74 ${35-ear/4} L104 52 Z" fill="${cfg.c1}" stroke="#674b36" stroke-width="3"/>
          <path d="M158 68 L166 ${35-ear/4} L136 52 Z" fill="${cfg.c1}" stroke="#674b36" stroke-width="3"/>
          <path d="M84 58 L80 43 L97 54 Z" fill="#d7a88e" opacity=".72"/>
          <path d="M156 58 L160 43 L143 54 Z" fill="#d7a88e" opacity=".72"/>
          <g class="blink">
            <ellipse cx="101" cy="88" rx="8" ry="10" fill="#1d1b19"/>
            <ellipse cx="139" cy="88" rx="8" ry="10" fill="#1d1b19"/>
            <circle cx="98" cy="84" r="2.4" fill="#fff"/><circle cx="136" cy="84" r="2.4" fill="#fff"/>
          </g>
          <ellipse cx="120" cy="111" rx="${muzzle}" ry="22" fill="url(#v10muzzle)"/>
          <path d="M114 105 Q120 100 126 105 Q120 112 114 105" fill="#49372f"/>
          <path d="M120 111 Q111 120 103 117 M120 111 Q129 120 137 117" fill="none" stroke="#60483b" stroke-width="3" stroke-linecap="round"/>
          <path d="M91 71 Q120 58 149 71" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="5" stroke-linecap="round"/>
          <path d="M72 143 C89 150 91 164 84 176" fill="none" stroke="url(#v10shade)" stroke-width="8" stroke-linecap="round"/>
        </g>
      </svg>`;
  }

  function dinoSvg(idx,cfg){
    const grow=[.72,.82,.91,1.00][Math.max(0,idx-1)]||1;
    const snout=idx>=3?46:38, thigh=idx>=4?22:19;
    return `
      <svg class="pet-anim v10pet" viewBox="0 0 250 220" aria-label="恐竜キャラクター">
        <defs>
          <radialGradient id="v10dino" cx="34%" cy="20%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".18" stop-color="${cfg.c1}"/><stop offset="1" stop-color="${cfg.c2}"/></radialGradient>
          <linearGradient id="v10belly" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#efe0bd"/><stop offset="1" stop-color="#cbb48e"/></linearGradient>
        </defs>
        <ellipse cx="126" cy="198" rx="75" ry="10" fill="#4d4439" opacity=".15"/>
        <g transform="translate(124 112) scale(${grow}) translate(-124 -112)" class="breath">
          <path class="tail-real" d="M160 139 C208 129 238 122 242 105 C224 140 206 165 165 166Z" fill="url(#v10dino)" stroke="#4e473b" stroke-width="3"/>
          <ellipse cx="132" cy="145" rx="48" ry="42" fill="url(#v10dino)"/>
          <path d="M104 157 C96 172 95 185 87 195" fill="none" stroke="${cfg.c2}" stroke-width="${thigh}" stroke-linecap="round"/>
          <path d="M150 158 C153 174 158 186 166 195" fill="none" stroke="${cfg.c2}" stroke-width="${thigh}" stroke-linecap="round"/>
          <path d="M77 194 h29 M151 194 h31" stroke="#4b4339" stroke-width="5" stroke-linecap="round"/>
          <ellipse cx="115" cy="82" rx="46" ry="38" fill="url(#v10dino)"/>
          <path d="M118 70 C145 62 ${151+snout/2} 68 ${160+snout/2} 80 C147 87 132 91 112 91Z" fill="${cfg.c1}" stroke="#4e473b" stroke-width="3"/>
          <g class="blink"><ellipse cx="98" cy="76" rx="7" ry="9" fill="#191817"/><circle cx="96" cy="73" r="2" fill="#fff"/></g>
          <path d="M145 79 q8 4 16 0" fill="none" stroke="#51483d" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M105 108 C101 122 94 127 84 129 M119 110 C118 124 125 128 133 130" fill="none" stroke="${cfg.c2}" stroke-width="8" stroke-linecap="round"/>
          <path d="M93 121 l-10 8 10 1" fill="none" stroke="#493f35" stroke-width="2"/>
          <path d="M132 128 l9 5-8 3" fill="none" stroke="#493f35" stroke-width="2"/>
          <ellipse cx="126" cy="150" rx="26" ry="28" fill="url(#v10belly)" opacity=".72"/>
          <path d="M84 54 l8-16 9 17 9-20 10 19 9-14 8 18" fill="${idx>=3?'#d8b85d':'#b9a96d'}" opacity=".9"/>
          <circle cx="153" cy="95" r="2.7" fill="#66594a" opacity=".7"/><circle cx="165" cy="89" r="2.1" fill="#66594a" opacity=".7"/>
        </g>
      </svg>`;
  }

  function humanSvg(idx,cfg){
    const grow=[.73,.82,.91,1.00][Math.max(0,idx-1)]||1;
    const hair=idx>=3?'#34271f':'#49342a';
    return `
      <svg class="pet-anim v10pet" viewBox="0 0 230 225" aria-label="人間キャラクター">
        <defs>
          <radialGradient id="v10skin" cx="36%" cy="22%"><stop offset="0" stop-color="#fff7ed"/><stop offset=".68" stop-color="#efc09a"/><stop offset="1" stop-color="#d79e75"/></radialGradient>
          <linearGradient id="v10shirt" x1="0" x2="1"><stop stop-color="${cfg.c1}"/><stop offset="1" stop-color="${cfg.c2}"/></linearGradient>
        </defs>
        <ellipse cx="115" cy="205" rx="59" ry="9" fill="#453b34" opacity=".14"/>
        <g transform="translate(115 114) scale(${grow}) translate(-115 -114)" class="breath">
          <path d="M95 139 C83 160 81 180 80 199" fill="none" stroke="#514941" stroke-width="19" stroke-linecap="round"/>
          <path d="M136 139 C148 160 150 180 151 199" fill="none" stroke="#514941" stroke-width="19" stroke-linecap="round"/>
          <path d="M70 201 h25 M138 201 h27" stroke="#332e2a" stroke-width="8" stroke-linecap="round"/>
          <rect x="76" y="112" width="78" height="61" rx="25" fill="url(#v10shirt)"/>
          <path d="M78 126 C58 138 55 153 52 166" fill="none" stroke="#e9b68f" stroke-width="15" stroke-linecap="round"/>
          <path d="M152 126 C171 138 176 151 179 164" fill="none" stroke="#e9b68f" stroke-width="15" stroke-linecap="round"/>
          <rect x="108" y="101" width="16" height="20" rx="7" fill="#e6ae86"/>
          <ellipse cx="116" cy="72" rx="45" ry="47" fill="url(#v10skin)"/>
          <path d="M73 69 C73 31 97 22 117 23 C148 24 160 46 157 72 C143 53 126 48 107 51 C94 54 84 61 73 69Z" fill="${hair}"/>
          <path d="M82 48 C101 32 128 31 149 45" fill="none" stroke="#6d4d38" stroke-width="6" stroke-linecap="round" opacity=".34"/>
          <g class="blink">
            <ellipse cx="98" cy="76" rx="5.7" ry="7.5" fill="#2c261f"/>
            <ellipse cx="134" cy="76" rx="5.7" ry="7.5" fill="#2c261f"/>
            <circle cx="96.5" cy="73.5" r="1.6" fill="#fff"/><circle cx="132.5" cy="73.5" r="1.6" fill="#fff"/>
          </g>
          <path d="M115 78 q-2 8 2 12" fill="none" stroke="#bd8764" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M102 96 Q116 105 130 96" fill="none" stroke="#9c654d" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M84 68 Q98 60 110 66 M122 66 Q136 60 149 69" fill="none" stroke="${hair}" stroke-width="3" stroke-linecap="round" opacity=".75"/>
        </g>
      </svg>`;
  }

  petSvg=function(){
    injectV10Styles();
    const sp=S.settings.species, st=stageInfo(), cfg=petCfg();
    if(st.index===0) return eggSvg(sp);
    if(sp==='dino') return dinoSvg(st.index,cfg);
    if(sp==='human') return humanSvg(st.index,cfg);
    return animalSvg(st.index,cfg);
  };

  function addEvolutionGuide(){
    const room=$('petroom');
    if(!room || document.getElementById('v10EvoGuide')) return;
    const route=room.querySelector('.route');
    if(!route) return;
    const box=document.createElement('div');
    box.id='v10EvoGuide';
    box.className='card';
    box.style.marginTop='12px';
    box.innerHTML='<b>成長の目安</b><div class="tiny">アイテムをあげた回数で少しずつ成長します。</div><div class="v10-evo-guide"></div>';
    route.before(box);
  }

  function renderEvolutionGuide(){
    addEvolutionGuide();
    const g=document.querySelector('#v10EvoGuide .v10-evo-guide');
    if(!g) return;
    const steps=[
      ['たまご','0回'],['あかちゃん','1回'],['こども','5回'],['せいちょう','12回'],['おとな','25回']
    ];
    const now=stage().n;
    g.innerHTML=steps.map(([n,c])=>`<div class="v10-evo-step ${n===now?'now':''}"><b>${n}</b><br>${c}</div>`).join('');
  }

  const oldPetroom=petroom;
  petroom=function(){
    oldPetroom();
    if($('petvis2')) $('petvis2').innerHTML=petSvg();
    renderEvolutionGuide();
  };

  const oldHome=home;
  home=function(){
    oldHome();
    if($('petvis')) $('petvis').innerHTML=petSvg();
  };


  injectV10Styles();
  renderEvolutionGuide();
  if($('petvis')) $('petvis').innerHTML=petSvg();
  if($('petvis2')) $('petvis2').innerHTML=petSvg();
})();

// v11: 成長差を大きく・育成中キャラを常時表示・アイテムアクション・進化演出
(function(){
  const ITEM_META={
    food:{name:'ごはん',emoji:'🍙',care:'food',say:'もぐもぐ…おいしい！'},
    toy:{name:'おもちゃ',emoji:'🟢',care:'play',say:'わーい！あそぼう！'},
    book:{name:'えほん',emoji:'📖',care:'study',say:'ふむふむ…おもしろい！'}
  };
  const STAGES=['たまご','あかちゃん','こども','せいちょう','おとな'];
  const THRESHOLDS={たまご:0,あかちゃん:1,こども:5,せいちょう:12,おとな:25};

  function injectV11Styles(){
    if(document.getElementById('v11style'))return;
    const s=document.createElement('style');
    s.id='v11style';
    s.textContent=`
      #petroom{position:relative}
      #careDockV11{
        position:sticky;top:8px;z-index:18;margin:8px 0 14px;
        background:rgba(255,252,245,.96);backdrop-filter:blur(10px);
        border:1px solid #eadbc8;border-radius:20px;padding:10px 12px;
        box-shadow:0 8px 25px rgba(72,52,34,.13);
        display:grid;grid-template-columns:112px 1fr;align-items:center;gap:10px;
      }
      #careDockPetV11{height:108px;display:flex;align-items:center;justify-content:center;position:relative}
      #careDockPetV11 svg{width:112px;height:108px;overflow:visible}
      #careDockV11 .care-title{font-size:17px;font-weight:900}
      #careDockV11 .care-stage{font-size:12px;color:#806f61;margin-top:2px}
      #careDockV11 .care-speech{margin-top:7px;background:#fff;border:1px solid #eadfce;border-radius:14px;padding:7px 9px;font-size:12px;font-weight:700;min-height:18px}
      #careDockV11.care-food #careDockPetV11{animation:v11nom .36s ease-in-out 4}
      #careDockV11.care-book #careDockPetV11{animation:v11read .7s ease-in-out 2}
      #careDockV11.care-toy #careDockPetV11{animation:v11jump .42s ease-in-out 4}
      #careItemFxV11{position:absolute;left:50%;top:50%;font-size:42px;z-index:5;pointer-events:none;opacity:0}
      #careDockV11.care-food #careItemFxV11{opacity:1;animation:v11food 1.8s ease-in-out forwards}
      #careDockV11.care-book #careItemFxV11{opacity:1;font-size:48px;animation:v11book 1.8s ease-in-out forwards}
      #careDockV11.care-toy #careItemFxV11{opacity:1;animation:v11toy 1.8s ease-in-out forwards}
      @keyframes v11nom{0%,100%{transform:scale(1)}50%{transform:scale(.97) translateY(2px)}}
      @keyframes v11read{0%,100%{transform:rotate(0)}50%{transform:rotate(-2deg)}}
      @keyframes v11jump{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      @keyframes v11food{0%{transform:translate(55px,35px) scale(.8);opacity:0}20%{opacity:1}70%{transform:translate(7px,-2px) scale(.72);opacity:1}100%{transform:translate(4px,-6px) scale(.25);opacity:0}}
      @keyframes v11book{0%{transform:translate(-50%,60px) scale(.45);opacity:0}25%{opacity:1}55%,85%{transform:translate(-50%,26px) scale(1);opacity:1}100%{transform:translate(-50%,26px) scale(.9);opacity:0}}
      @keyframes v11toy{0%{transform:translate(-70px,45px) scale(.7);opacity:0}18%{opacity:1}40%{transform:translate(-15px,-25px) scale(1)}65%{transform:translate(30px,40px) scale(.85)}88%{transform:translate(50px,-5px) scale(.75);opacity:1}100%{opacity:0}}
      .v11-pet{filter:drop-shadow(0 10px 13px rgba(52,39,29,.18))}
      .v11-pet .blink{transform-origin:center;animation:v11blink 4.8s infinite}
      .v11-pet .breathe{transform-origin:center;animation:v11breathe 3.2s ease-in-out infinite}
      .v11-pet .tail{transform-origin:165px 145px;animation:v11tail 2.4s ease-in-out infinite}
      @keyframes v11blink{0%,47%,50%,100%{transform:scaleY(1)}48%,49%{transform:scaleY(.08)}}
      @keyframes v11breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.018)}}
      @keyframes v11tail{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(9deg)}}
      #evoOverlayV11{position:fixed;inset:0;z-index:999;background:rgba(34,27,22,.82);display:none;align-items:center;justify-content:center;padding:22px}
      #evoOverlayV11.show{display:flex}
      #evoOverlayV11 .evo-box{width:min(420px,94vw);background:linear-gradient(180deg,#fffdf7,#fff4d9);border-radius:28px;padding:20px;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.35);animation:v11evo .5s cubic-bezier(.2,.9,.25,1.25)}
      #evoOverlayV11 .evo-stars{font-size:28px;letter-spacing:8px;animation:v11spark .8s ease-in-out infinite alternate}
      #evoOverlayV11 .evo-pet{height:250px;display:flex;align-items:center;justify-content:center}
      #evoOverlayV11 .evo-pet svg{width:260px;height:245px}
      #evoOverlayV11 .evo-title{font-size:28px;font-weight:1000;margin-top:-4px}
      #evoOverlayV11 .evo-fromto{font-size:15px;color:#795d3d;margin:6px 0 12px;font-weight:800}
      @keyframes v11evo{from{transform:scale(.65);opacity:0}to{transform:scale(1);opacity:1}}
      @keyframes v11spark{from{transform:scale(.92)}to{transform:scale(1.08)}}
      @media(max-width:520px){
        #careDockV11{grid-template-columns:94px 1fr;padding:8px 10px;top:6px}
        #careDockPetV11,#careDockPetV11 svg{width:94px;height:92px}
      }
    `;
    document.head.appendChild(s);
  }

  function cfg(){
    const b=branch();
    if(b && typeof RO!=='undefined' && RO[b])return RO[b];
    return {c1:'#d9ad72',c2:'#8b6040',mark:''};
  }
  function stageIndex(){return Math.max(0,STAGES.indexOf(stage().n));}
  function typeMark(){
    const b=branch();
    if(b==='study')return '📘';
    if(b==='play')return '⚡';
    if(b==='food')return '🌱';
    if(b==='balance')return '🌟';
    return '';
  }

  function egg(sp){
    const crack=sp==='dino'?'#6e9561':sp==='human'?'#c88767':'#98683d';
    return `<svg class="pet-anim v11-pet" viewBox="0 0 260 240">
      <defs><radialGradient id="e11" cx="34%" cy="25%"><stop offset="0" stop-color="#fffef8"/><stop offset=".48" stop-color="#f4e2b5"/><stop offset="1" stop-color="#d6ad62"/></radialGradient></defs>
      <ellipse cx="130" cy="216" rx="70" ry="12" fill="#604b37" opacity=".13"/>
      <path d="M130 25 C85 25 58 78 61 140 C63 191 89 211 130 211 C171 211 197 191 199 140 C202 78 175 25 130 25Z" fill="url(#e11)" stroke="#806745" stroke-width="4"/>
      <path d="M84 92 l19-12 14 14 19-15 17 14 20-10" fill="none" stroke="${crack}" stroke-width="5" stroke-linecap="round" opacity=".7"/>
      <ellipse cx="101" cy="73" rx="16" ry="31" fill="#fff" opacity=".34" transform="rotate(18 101 73)"/>
      <path d="M111 159 l13-11 12 12 15-9" fill="none" stroke="#9a7d56" stroke-width="4" opacity=".55"/>
    </svg>`;
  }

  function animal(idx,c){
    const mark=typeMark();
    if(idx===1) return `<svg class="pet-anim v11-pet" viewBox="0 0 260 240">
      <defs><radialGradient id="a11b" cx="35%" cy="20%"><stop stop-color="#fff" stop-opacity=".45"/><stop offset=".22" stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></radialGradient></defs>
      <ellipse cx="130" cy="213" rx="54" ry="10" fill="#493d34" opacity=".13"/>
      <g class="breathe"><ellipse cx="130" cy="150" rx="50" ry="48" fill="url(#a11b)"/>
      <circle cx="130" cy="91" r="50" fill="url(#a11b)"/>
      <path d="M92 66 L83 28 L115 52Z M168 66 L177 28 L145 52Z" fill="${c.c1}" stroke="#66503d" stroke-width="4"/>
      <path d="M92 56 L88 39 L107 53Z M168 56 L172 39 L153 53Z" fill="#d99f95" opacity=".7"/>
      <g class="blink"><circle cx="111" cy="92" r="7" fill="#201c19"/><circle cx="149" cy="92" r="7" fill="#201c19"/><circle cx="109" cy="89" r="2" fill="#fff"/><circle cx="147" cy="89" r="2" fill="#fff"/></g>
      <ellipse cx="130" cy="115" rx="25" ry="20" fill="#eedbc4"/><path d="M125 110 Q130 105 135 110 Q130 116 125 110" fill="#4a3830"/>
      <path d="M112 164 q-25 23-8 39 M148 164 q25 23 8 39" fill="none" stroke="${c.c2}" stroke-width="22" stroke-linecap="round"/>
      </g></svg>`;

    if(idx===2) return `<svg class="pet-anim v11-pet" viewBox="0 0 280 245">
      <defs><radialGradient id="a11c" cx="34%" cy="18%"><stop stop-color="#fff" stop-opacity=".35"/><stop offset=".2" stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></radialGradient></defs>
      <ellipse cx="140" cy="220" rx="72" ry="10" fill="#44382f" opacity=".14"/>
      <path class="tail" d="M184 154 Q245 125 249 165 Q239 198 188 184" fill="none" stroke="${c.c2}" stroke-width="21" stroke-linecap="round"/>
      <g class="breathe"><ellipse cx="139" cy="155" rx="61" ry="48" fill="url(#a11c)"/>
      <ellipse cx="130" cy="86" rx="52" ry="48" fill="url(#a11c)"/>
      <path d="M91 63 L79 19 L118 49Z M169 63 L181 19 L142 49Z" fill="${c.c1}" stroke="#5b4738" stroke-width="4"/>
      <g class="blink"><ellipse cx="110" cy="86" rx="7" ry="9" fill="#1f1c19"/><ellipse cx="150" cy="86" rx="7" ry="9" fill="#1f1c19"/></g>
      <ellipse cx="130" cy="111" rx="27" ry="21" fill="#ead5bb"/><path d="M124 106 Q130 101 136 106 Q130 114 124 106" fill="#49372f"/>
      <path d="M100 175 L84 210 M174 174 L191 210" stroke="${c.c2}" stroke-width="18" stroke-linecap="round"/>
      <path d="M76 211 h26 M180 211 h26" stroke="#4e4037" stroke-width="6" stroke-linecap="round"/>
      <text x="140" y="155" text-anchor="middle" font-size="25">${mark}</text></g></svg>`;

    if(idx===3) return `<svg class="pet-anim v11-pet" viewBox="0 0 300 250">
      <defs><linearGradient id="a11t" x1="0" x2="1"><stop stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></linearGradient></defs>
      <ellipse cx="150" cy="226" rx="82" ry="10" fill="#44372f" opacity=".14"/>
      <path class="tail" d="M205 145 Q276 113 280 159 Q269 197 214 183" fill="none" stroke="${c.c2}" stroke-width="19" stroke-linecap="round"/>
      <g class="breathe"><ellipse cx="155" cy="153" rx="66" ry="48" fill="url(#a11t)"/>
      <ellipse cx="133" cy="80" rx="51" ry="45" fill="url(#a11t)"/>
      <path d="M96 59 L91 17 L121 50Z M169 58 L180 16 L147 48Z" fill="${c.c1}" stroke="#594436" stroke-width="4"/>
      <path d="M107 67 Q132 51 157 66" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="6"/>
      <g class="blink"><ellipse cx="115" cy="82" rx="7" ry="9" fill="#191817"/><ellipse cx="151" cy="82" rx="7" ry="9" fill="#191817"/></g>
      <ellipse cx="133" cy="105" rx="26" ry="19" fill="#ead5bc"/><path d="M127 101 Q133 96 139 101 Q133 109 127 101" fill="#44332d"/>
      <path d="M111 174 L90 218 M183 173 L206 218" stroke="${c.c2}" stroke-width="16" stroke-linecap="round"/>
      <path d="M80 220 h28 M195 220 h29" stroke="#413730" stroke-width="6" stroke-linecap="round"/>
      <path d="M111 132 Q153 147 190 126" fill="none" stroke="#fff" stroke-opacity=".15" stroke-width="8"/>
      <text x="158" y="153" text-anchor="middle" font-size="28">${mark}</text></g></svg>`;

    return `<svg class="pet-anim v11-pet" viewBox="0 0 320 260">
      <defs><linearGradient id="a11a" x1="0" x2="1"><stop stop-color="${c.c1}"/><stop offset=".62" stop-color="${c.c2}"/><stop offset="1" stop-color="#554132"/></linearGradient></defs>
      <ellipse cx="160" cy="238" rx="90" ry="11" fill="#3e332d" opacity=".16"/>
      <path class="tail" d="M218 151 Q302 104 304 157 Q291 205 226 187" fill="none" stroke="${c.c2}" stroke-width="20" stroke-linecap="round"/>
      <g class="breathe"><ellipse cx="165" cy="157" rx="72" ry="52" fill="url(#a11a)"/>
      <ellipse cx="139" cy="77" rx="54" ry="46" fill="url(#a11a)"/>
      <path d="M99 56 L91 8 L128 47Z M177 55 L190 8 L153 46Z" fill="${c.c1}" stroke="#4d3d33" stroke-width="4"/>
      <path d="M105 60 Q140 40 174 61" fill="none" stroke="#3e3029" stroke-opacity=".25" stroke-width="10"/>
      <g class="blink"><ellipse cx="120" cy="78" rx="7" ry="9" fill="#151412"/><ellipse cx="159" cy="78" rx="7" ry="9" fill="#151412"/><circle cx="118" cy="75" r="2" fill="#fff"/><circle cx="157" cy="75" r="2" fill="#fff"/></g>
      <ellipse cx="140" cy="104" rx="27" ry="20" fill="#e8d2b5"/><path d="M134 99 Q140 94 146 99 Q140 108 134 99" fill="#42322b"/>
      <path d="M116 181 L91 229 M194 180 L221 229" stroke="${c.c2}" stroke-width="17" stroke-linecap="round"/>
      <path d="M79 231 h31 M209 231 h32" stroke="#372f2a" stroke-width="7" stroke-linecap="round"/>
      <path d="M108 127 Q166 151 209 122" fill="none" stroke="#f2d791" stroke-width="7" stroke-linecap="round" opacity=".65"/>
      <text x="169" y="158" text-anchor="middle" font-size="31">${mark}</text></g></svg>`;
  }

  function dino(idx,c){
    const mark=typeMark();
    if(idx===1) return `<svg class="pet-anim v11-pet" viewBox="0 0 270 245">
      <defs><radialGradient id="d11b" cx="34%" cy="20%"><stop stop-color="#fff" stop-opacity=".35"/><stop offset=".2" stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></radialGradient></defs>
      <ellipse cx="135" cy="220" rx="58" ry="10" fill="#403a33" opacity=".14"/>
      <g class="breathe"><ellipse cx="137" cy="154" rx="48" ry="52" fill="url(#d11b)"/><ellipse cx="119" cy="91" rx="48" ry="43" fill="url(#d11b)"/>
      <path d="M124 81 Q164 73 183 88 Q165 100 124 101" fill="${c.c1}" stroke="#51483d" stroke-width="3"/>
      <g class="blink"><circle cx="104" cy="86" r="7" fill="#191817"/><circle cx="102" cy="83" r="2" fill="#fff"/></g>
      <path d="M86 134 q-22 14-25 28 M113 133 q-10 19-2 30" fill="none" stroke="${c.c2}" stroke-width="8" stroke-linecap="round"/>
      <path d="M117 178 l-14 34 M151 177 l16 34" stroke="${c.c2}" stroke-width="19" stroke-linecap="round"/>
      <path d="M94 213 h26 M154 213 h28" stroke="#453d35" stroke-width="5" stroke-linecap="round"/>
      <path class="tail" d="M172 151 Q225 142 238 119 Q230 166 178 181" fill="${c.c2}" stroke="#51483d" stroke-width="3"/>
      <path d="M83 64 l10-18 9 18 10-20 10 20" fill="#c6b36a"/></g></svg>`;

    if(idx===2) return `<svg class="pet-anim v11-pet" viewBox="0 0 300 250">
      <defs><linearGradient id="d11c" x1="0" x2="1"><stop stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></linearGradient></defs>
      <ellipse cx="150" cy="228" rx="78" ry="10" fill="#3e382f" opacity=".14"/>
      <path class="tail" d="M188 159 Q261 143 285 113 Q274 172 197 191" fill="${c.c2}" stroke="#4d463c" stroke-width="3"/>
      <g class="breathe"><ellipse cx="153" cy="160" rx="59" ry="46" fill="url(#d11c)"/>
      <ellipse cx="122" cy="89" rx="47" ry="40" fill="url(#d11c)"/><path d="M124 76 Q172 66 205 84 Q172 104 122 102" fill="${c.c1}" stroke="#4d463c" stroke-width="3"/>
      <g class="blink"><ellipse cx="108" cy="83" rx="7" ry="9" fill="#171614"/></g><path d="M173 85 q10 5 19 0" fill="none" stroke="#51483e" stroke-width="3"/>
      <path d="M104 131 q-28 10-34 27 M126 132 q-17 18-8 31" fill="none" stroke="${c.c2}" stroke-width="8" stroke-linecap="round"/>
      <path d="M128 181 L111 220 M171 180 L190 220" stroke="${c.c2}" stroke-width="20" stroke-linecap="round"/>
      <path d="M98 221 h31 M177 221 h34" stroke="#413b34" stroke-width="6" stroke-linecap="round"/>
      <path d="M82 66 l10-22 10 20 11-24 11 22 10-19 10 24" fill="#d2bb66"/>
      <text x="157" y="163" text-anchor="middle" font-size="27">${mark}</text></g></svg>`;

    if(idx===3) return `<svg class="pet-anim v11-pet" viewBox="0 0 330 260">
      <defs><linearGradient id="d11t" x1="0" x2="1"><stop stop-color="${c.c1}"/><stop offset=".72" stop-color="${c.c2}"/><stop offset="1" stop-color="#46503f"/></linearGradient></defs>
      <ellipse cx="164" cy="237" rx="91" ry="11" fill="#39342f" opacity=".15"/>
      <path class="tail" d="M201 164 Q286 137 323 91 Q307 172 213 200" fill="url(#d11t)" stroke="#443e37" stroke-width="3"/>
      <g class="breathe"><ellipse cx="164" cy="166" rx="65" ry="47" fill="url(#d11t)"/>
      <ellipse cx="124" cy="86" rx="50" ry="42" fill="url(#d11t)"/><path d="M128 72 Q184 56 225 81 Q190 105 124 103" fill="${c.c1}" stroke="#443e37" stroke-width="3"/>
      <g class="blink"><ellipse cx="109" cy="81" rx="7" ry="9" fill="#151412"/></g><path d="M190 82 q11 5 20 0" fill="none" stroke="#4c443b" stroke-width="3"/>
      <path d="M104 132 q-34 8-43 25 M132 133 q-25 16-17 32" fill="none" stroke="${c.c2}" stroke-width="9" stroke-linecap="round"/>
      <path d="M136 188 L113 229 M183 187 L208 229" stroke="${c.c2}" stroke-width="22" stroke-linecap="round"/>
      <path d="M98 231 h36 M193 231 h38" stroke="#3d3731" stroke-width="7" stroke-linecap="round"/>
      <path d="M75 63 l11-24 11 22 12-26 12 25 11-23 12 25 12-19 9 23" fill="#d6b958"/>
      <text x="168" y="170" text-anchor="middle" font-size="30">${mark}</text></g></svg>`;

    return `<svg class="pet-anim v11-pet" viewBox="0 0 360 275">
      <defs><linearGradient id="d11a" x1="0" x2="1"><stop stop-color="${c.c1}"/><stop offset=".68" stop-color="${c.c2}"/><stop offset="1" stop-color="#344235"/></linearGradient></defs>
      <ellipse cx="180" cy="251" rx="105" ry="12" fill="#342f2b" opacity=".17"/>
      <path class="tail" d="M221 176 Q313 137 354 69 Q339 180 235 219" fill="url(#d11a)" stroke="#3f3a34" stroke-width="4"/>
      <g class="breathe"><ellipse cx="181" cy="176" rx="73" ry="52" fill="url(#d11a)"/>
      <ellipse cx="129" cy="84" rx="54" ry="45" fill="url(#d11a)"/><path d="M134 68 Q201 49 251 80 Q208 111 129 104" fill="${c.c1}" stroke="#3f3a34" stroke-width="4"/>
      <g class="blink"><ellipse cx="112" cy="78" rx="8" ry="10" fill="#111"/><circle cx="110" cy="75" r="2" fill="#fff"/></g><path d="M211 81 q14 6 26 0" fill="none" stroke="#453f38" stroke-width="3"/>
      <path d="M107 136 q-42 5-56 28 M140 137 q-29 14-25 35" fill="none" stroke="${c.c2}" stroke-width="10" stroke-linecap="round"/>
      <path d="M150 201 L120 243 M202 200 L232 243" stroke="${c.c2}" stroke-width="24" stroke-linecap="round"/>
      <path d="M102 245 h42 M214 245 h43" stroke="#342f2b" stroke-width="8" stroke-linecap="round"/>
      <path d="M74 59 l13-28 13 25 14-31 14 29 13-27 14 28 13-24 13 27" fill="#d8b552"/>
      <path d="M146 121 Q195 135 232 111" fill="none" stroke="#f0d180" stroke-width="8" opacity=".45"/>
      <text x="184" y="181" text-anchor="middle" font-size="34">${mark}</text></g></svg>`;
  }

  function human(idx,c){
    const mark=typeMark();
    if(idx===1) return `<svg class="pet-anim v11-pet" viewBox="0 0 260 245">
      <defs><radialGradient id="h11b" cx="35%" cy="22%"><stop stop-color="#fff7ef"/><stop offset=".7" stop-color="#efbf99"/><stop offset="1" stop-color="#d99770"/></radialGradient></defs>
      <ellipse cx="130" cy="220" rx="54" ry="9" fill="#403832" opacity=".12"/>
      <g class="breathe"><ellipse cx="130" cy="88" rx="48" ry="51" fill="url(#h11b)"/>
      <path d="M83 82 Q84 38 130 33 Q174 34 178 84 Q152 59 126 60 Q102 59 83 82" fill="#49332a"/>
      <g class="blink"><circle cx="112" cy="91" r="6" fill="#27211d"/><circle cx="148" cy="91" r="6" fill="#27211d"/></g>
      <path d="M118 113 Q130 120 142 113" fill="none" stroke="#9d684f" stroke-width="3" stroke-linecap="round"/>
      <rect x="89" y="136" width="82" height="54" rx="28" fill="${c.c1}"/>
      <path d="M101 183 Q86 201 81 214 M159 183 Q174 201 179 214" stroke="#dfaa83" stroke-width="17" stroke-linecap="round"/>
      </g></svg>`;

    if(idx===2) return `<svg class="pet-anim v11-pet" viewBox="0 0 270 250">
      <defs><radialGradient id="h11c" cx="35%" cy="22%"><stop stop-color="#fff7ef"/><stop offset=".7" stop-color="#efbf99"/><stop offset="1" stop-color="#d99770"/></radialGradient><linearGradient id="h11cs" x1="0" x2="1"><stop stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></linearGradient></defs>
      <ellipse cx="135" cy="228" rx="62" ry="9" fill="#3f3833" opacity=".13"/>
      <g class="breathe"><ellipse cx="135" cy="78" rx="44" ry="47" fill="url(#h11c)"/>
      <path d="M92 72 Q95 31 136 29 Q176 31 179 74 Q157 54 134 54 Q111 53 92 72" fill="#453128"/>
      <g class="blink"><ellipse cx="119" cy="80" rx="5.5" ry="7" fill="#28211c"/><ellipse cx="151" cy="80" rx="5.5" ry="7" fill="#28211c"/></g>
      <path d="M123 100 Q135 108 147 100" fill="none" stroke="#9d674f" stroke-width="3"/>
      <rect x="94" y="121" width="82" height="66" rx="24" fill="url(#h11cs)"/>
      <path d="M96 138 Q71 150 65 173 M174 138 Q198 150 205 173" stroke="#e4ad85" stroke-width="14" stroke-linecap="round"/>
      <path d="M114 181 L101 222 M155 181 L169 222" stroke="#4a4541" stroke-width="18" stroke-linecap="round"/>
      <text x="135" y="151" text-anchor="middle" font-size="24">${mark}</text></g></svg>`;

    if(idx===3) return `<svg class="pet-anim v11-pet" viewBox="0 0 285 260">
      <defs><radialGradient id="h11t" cx="35%" cy="20%"><stop stop-color="#fff7ef"/><stop offset=".72" stop-color="#edb991"/><stop offset="1" stop-color="#cf8f68"/></radialGradient><linearGradient id="h11ts" x1="0" x2="1"><stop stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></linearGradient></defs>
      <ellipse cx="142" cy="239" rx="67" ry="10" fill="#3b3430" opacity=".14"/>
      <g class="breathe"><ellipse cx="142" cy="70" rx="42" ry="45" fill="url(#h11t)"/>
      <path d="M101 66 Q105 24 143 22 Q182 24 185 68 Q162 47 140 48 Q119 46 101 66" fill="#382921"/>
      <path d="M108 44 Q139 27 174 44" fill="none" stroke="#654735" stroke-width="6" opacity=".45"/>
      <g class="blink"><ellipse cx="127" cy="72" rx="5" ry="7" fill="#231e1a"/><ellipse cx="158" cy="72" rx="5" ry="7" fill="#231e1a"/></g>
      <path d="M130 92 Q142 100 154 92" fill="none" stroke="#98624b" stroke-width="3"/>
      <path d="M105 115 Q142 101 179 115 L174 184 Q142 195 110 184Z" fill="url(#h11ts)"/>
      <path d="M109 129 Q78 143 70 173 M176 129 Q207 143 215 173" stroke="#dfaa83" stroke-width="13" stroke-linecap="round"/>
      <path d="M122 183 L105 232 M163 183 L180 232" stroke="#3f3c3a" stroke-width="17" stroke-linecap="round"/>
      <text x="142" y="145" text-anchor="middle" font-size="26">${mark}</text></g></svg>`;

    return `<svg class="pet-anim v11-pet" viewBox="0 0 300 270">
      <defs><radialGradient id="h11a" cx="35%" cy="20%"><stop stop-color="#fff7ef"/><stop offset=".72" stop-color="#ebb58d"/><stop offset="1" stop-color="#ca8963"/></radialGradient><linearGradient id="h11as" x1="0" x2="1"><stop stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></linearGradient></defs>
      <ellipse cx="150" cy="250" rx="72" ry="10" fill="#36302c" opacity=".15"/>
      <g class="breathe"><ellipse cx="150" cy="66" rx="41" ry="44" fill="url(#h11a)"/>
      <path d="M111 62 Q117 19 151 18 Q188 19 191 64 Q170 42 149 43 Q129 41 111 62" fill="#30231e"/>
      <path d="M121 38 Q151 21 180 39" fill="none" stroke="#654735" stroke-width="7" opacity=".38"/>
      <g class="blink"><ellipse cx="136" cy="68" rx="5" ry="7" fill="#201b18"/><ellipse cx="165" cy="68" rx="5" ry="7" fill="#201b18"/></g>
      <path d="M138 88 Q150 95 162 88" fill="none" stroke="#925f49" stroke-width="3"/>
      <path d="M111 109 Q150 94 189 109 L183 191 Q150 204 117 191Z" fill="url(#h11as)"/>
      <path d="M115 126 Q80 143 70 178 M185 126 Q220 143 230 178" stroke="#dba47d" stroke-width="13" stroke-linecap="round"/>
      <path d="M131 189 L108 242 M169 189 L192 242" stroke="#363432" stroke-width="18" stroke-linecap="round"/>
      <path d="M99 244 h30 M180 244 h31" stroke="#242321" stroke-width="7" stroke-linecap="round"/>
      <text x="150" y="146" text-anchor="middle" font-size="29">${mark}</text></g></svg>`;
  }

  petSvg=function(){
    injectV11Styles();
    const sp=S.settings.species,idx=stageIndex(),c=cfg();
    if(idx===0)return egg(sp);
    if(sp==='dino')return dino(idx,c);
    if(sp==='human')return human(idx,c);
    return animal(idx,c);
  };

  function ensureCareDock(){
    const room=$('petroom');
    if(!room)return;
    let dock=document.getElementById('careDockV11');
    if(!dock){
      dock=document.createElement('div');
      dock.id='careDockV11';
      dock.innerHTML=`
        <div id="careDockPetV11"><div id="careItemFxV11"></div></div>
        <div>
          <div class="care-title" id="careDockNameV11"></div>
          <div class="care-stage" id="careDockStageV11"></div>
          <div class="care-speech" id="careDockSpeechV11">アイテムをあげると、ここで反応するよ。</div>
        </div>`;
      const point=document.getElementById('pointRule');
      const shop=document.getElementById('shop');
      if(point)point.before(dock);
      else if(shop)shop.before(dock);
      else room.prepend(dock);
    }
    renderCareDock();
  }

  function renderCareDock(message){
    const pet=document.getElementById('careDockPetV11');
    if(pet){
      let fx=document.getElementById('careItemFxV11');
      pet.innerHTML=petSvg()+'<div id="careItemFxV11"></div>';
      fx=document.getElementById('careItemFxV11');
    }
    const n=document.getElementById('careDockNameV11');
    const st=document.getElementById('careDockStageV11');
    const sp=document.getElementById('careDockSpeechV11');
    if(n)n.textContent=petName();
    if(st){
      const b=branch();
      const type=b&&typeof RO!=='undefined'&&RO[b]?('・'+RO[b].n):'';
      st.textContent=`${stage().n}${type} ／ おせわ ${S.pet.xp||0}回`;
    }
    if(sp && message)sp.textContent=message;
  }

  function ensureEvolutionOverlay(){
    if(document.getElementById('evoOverlayV11'))return;
    const o=document.createElement('div');
    o.id='evoOverlayV11';
    o.innerHTML=`<div class="evo-box">
      <div class="evo-stars">✨ ⭐ ✨</div>
      <div class="evo-pet" id="evoPetV11"></div>
      <div class="evo-title">しんかした！</div>
      <div class="evo-fromto" id="evoTextV11"></div>
      <button class="cta" onclick="closeEvolutionV11()">やった！</button>
    </div>`;
    document.body.appendChild(o);
  }
  window.closeEvolutionV11=function(){document.getElementById('evoOverlayV11')?.classList.remove('show');};

  function showEvolution(beforeStage,afterStage,beforeBranch,afterBranch){
    ensureEvolutionOverlay();
    const o=document.getElementById('evoOverlayV11');
    const p=document.getElementById('evoPetV11');
    const t=document.getElementById('evoTextV11');
    if(p)p.innerHTML=petSvg();
    const branchChanged=beforeBranch!==afterBranch&&afterBranch&&typeof RO!=='undefined'&&RO[afterBranch];
    let msg=beforeStage!==afterStage?`${beforeStage} → ${afterStage}`:`${afterStage}`;
    if(branchChanged)msg+=`　${RO[afterBranch].n}になった！`;
    if(t)t.textContent=msg;
    if(o)o.classList.add('show');
  }

  function playAction(k,then){
    ensureCareDock();
    const dock=document.getElementById('careDockV11');
    const fx=document.getElementById('careItemFxV11');
    const meta=ITEM_META[k];
    if(!dock||!fx||!meta){if(then)then();return;}
    dock.classList.remove('care-food','care-book','care-toy');
    void dock.offsetWidth;
    dock.classList.add('care-'+k);
    fx.textContent=k==='book'?'📖':meta.emoji;
    const speech=document.getElementById('careDockSpeechV11');
    if(speech)speech.textContent=k==='food'?'もぐもぐ…':k==='book'?'えほんを読んでるよ…':'あそんでるよ！';
    setTimeout(()=>{if(speech)speech.textContent=meta.say;},900);
    setTimeout(()=>{
      dock.classList.remove('care-food','care-book','care-toy');
      fx.textContent='';
      if(then)then();
    },1900);
  }

  useItem=function(k){
    const meta=ITEM_META[k];
    if(!meta||!S.pet.inv[k])return;
    const beforeStage=stage().n;
    const beforeBranch=branch();
    S.pet.inv[k]--;
    S.pet.xp=(S.pet.xp||0)+1;
    S.pet.care[meta.care]=(S.pet.care[meta.care]||0)+1;
    S.pet.branch=null;
    const afterBranch=branch();
    const afterStage=stage().n;
    S.pet.log.unshift(`${meta.name}をあげた`);
    save();

    // 先に新しい状態を画面に反映し、アクションを見せる
    petroom();
    home();
    renderCareDock();
    playAction(k,()=>{
      if(beforeStage!==afterStage || beforeBranch!==afterBranch){
        showEvolution(beforeStage,afterStage,beforeBranch,afterBranch);
      }
    });
  };

  // v10/v7の描画後に、常時見える育成ドックと新キャラを再描画
  const prevPetroom=petroom;
  petroom=function(){
    prevPetroom();
    if($('petvis2'))$('petvis2').innerHTML=petSvg();
    ensureCareDock();
    renderCareDock();
  };

  const prevHome=home;
  home=function(){
    prevHome();
    if($('petvis'))$('petvis').innerHTML=petSvg();
  };


  injectV11Styles();
  ensureEvolutionOverlay();
  if($('petvis'))$('petvis').innerHTML=petSvg();
  if($('petvis2'))$('petvis2').innerHTML=petSvg();
  ensureCareDock();
})();
