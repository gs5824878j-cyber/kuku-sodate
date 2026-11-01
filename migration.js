/* Local-only, allowlisted learning-data transfer. No analytics or network requests. */
'use strict';
(() => {
 const KEY='kuku_preview_v5', MAX=1024*1024;
 const object=x=>x!==null && typeof x==='object' && !Array.isArray(x);
 const fail=()=>{throw new Error('この形式の記録はまだ保存できません。元の記録は変更していません。');};
 function fields(x,allowed){if(!object(x)||Object.keys(x).some(k=>!allowed.includes(k)))fail();}
 function number(x){if(typeof x!=='number'||!Number.isFinite(x)||x<0||x>1e15)fail();}
 function text(x){if(x!==null&&(typeof x!=='string'||x.length>1000))fail();}
 function validate(s){
  fields(s,['f','coins','streak','last','reward','settings','pet','dailyTask','economyVersion','lastTaskClear','taskStreak','learnHistory']);
  if(!object(s.f)||Object.keys(s.f).length!==81)fail();
  for(let a=1;a<=9;a++)for(let b=1;b<=9;b++){
   const f=s.f[`${a}x${b}`]; fields(f,['a','b','l','d','at','ok','w','ms','ca','cok','cms','learnTestScore','learnedOn','pendingLearn']);
   if(f.a!==a||f.b!==b||!Number.isInteger(f.l)||f.l < -1||f.l>20)fail();
   for(const k of ['d','at','ok','w','ms'])number(f[k]);
   for(const k of ['ca','cok','cms'])if(k in f)number(f[k]);
   if('learnTestScore'in f&&(!Number.isInteger(f.learnTestScore)||f.learnTestScore<0||f.learnTestScore>9))fail();
   if('learnedOn'in f){
    if(typeof f.learnedOn!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(f.learnedOn))fail();
    const date=new Date(f.learnedOn+'T00:00:00Z');
    if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==f.learnedOn)fail();
   }
   if('pendingLearn'in f&&typeof f.pendingLearn!=='boolean')fail();
  }
  for(const k of ['coins','streak'])number(s[k]);
  for(const k of ['taskStreak','economyVersion'])if(k in s)number(s[k]);
  for(const k of ['last','reward','lastTaskClear'])if(k in s)text(s[k]);
  fields(s.settings,['challengeMin','species','dailyGoal','showReadings']);
  if(![1,3,5].includes(s.settings.challengeMin)||!['human','dino','animal'].includes(s.settings.species))fail();
  if('dailyGoal'in s.settings)number(s.settings.dailyGoal);
  if('showReadings'in s.settings&&typeof s.settings.showReadings!=='boolean')fail();
  fields(s.pet,['xp','branch','care','inv','log']); number(s.pet.xp);
  if(![null,'study','play','food','balance'].includes(s.pet.branch))fail();
  fields(s.pet.care,['study','play','food']);for(const k of ['study','play','food'])number(s.pet.care[k]);
  fields(s.pet.inv,['food','toy','book','gem']);for(const k of ['food','toy','book','gem'])number(s.pet.inv[k]);
  if(!Array.isArray(s.pet.log)||s.pet.log.length>5000)fail();s.pet.log.forEach(text);
  if(s.dailyTask){fields(s.dailyTask,['date','correct','attempts','wrong','cleared']);text(s.dailyTask.date);for(const k of ['correct','attempts','wrong'])number(s.dailyTask[k]);if('cleared'in s.dailyTask&&typeof s.dailyTask.cleared!=='boolean')fail();}
  if(s.learnHistory){if(!object(s.learnHistory))fail();for(const [k,v]of Object.entries(s.learnHistory)){if(!/^[1-9]$/.test(k))fail();fields(v,['date','score','passed']);text(v.date);number(v.score);if(v.score>9||typeof v.passed!=='boolean')fail();}}
  return s;
 }
 function pack(raw){return {app:'kuku-sodate',version:1,key:KEY,createdAt:new Date().toISOString(),data:validate(JSON.parse(raw))};}
 const $=id=>document.getElementById(id), message=s=>{$('message').textContent=s;};
 const bytes=s=>new TextEncoder().encode(s).length;
 const storageMessage=e=>e.name==='SecurityError'?'この画面では記録の保存領域を利用できません。元の記録は削除せず、以前使っていたブラウザ・起動方法で開いてください。':e.message;
 let pending=null,existing=null,backedUpRaw=null,textSnapshot=null;
 function snapshot(){
  const raw=localStorage.getItem(KEY);
  if(raw===null)throw Error('この画面には九九の記録がありません。以前使っていた端末・ブラウザ・プロファイルと、通常/ホーム画面の起動方法を確認してください。');
  if(bytes(raw)>MAX)fail();
  return {raw,text:JSON.stringify(pack(raw),null,2),name:'kuku-backup-'+Date.now()+'.json'};
 }
 $('export').onclick=()=>{try{
  const saved=snapshot(),url=URL.createObjectURL(new Blob([saved.text],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=saved.name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);backedUpRaw=saved.raw;
  message('保存操作を開始しました。ファイルが保存できたことを確認してください。保存できないときは共有またはテキスト保存を使ってください。');
 }catch(e){message(storageMessage(e));}};
 if($('share')){
  $('share').hidden=!(typeof navigator.share==='function'&&typeof navigator.canShare==='function'&&typeof File==='function');
  $('share').onclick=async()=>{try{
   const saved=snapshot(),files=[new File([saved.text],saved.name,{type:'application/json'})];
   if(!navigator.canShare({files}))throw Error('この画面ではJSONファイルを共有できません。通常の保存またはテキスト保存を使ってください。');
   await navigator.share({files});backedUpRaw=saved.raw;
   message('共有画面を閉じました。「ファイルに保存」などでJSONが保存できたことを確認してください。');
  }catch(e){message(e.name==='AbortError'?'共有を中止しました。元の記録は変更していません。':storageMessage(e));}};
 }
 if($('show-text'))$('show-text').onclick=()=>{try{
  textSnapshot=snapshot();$('backup-text').value=textSnapshot.text;$('text-backup').hidden=false;
  $('backup-text').focus();$('backup-text').select();
  message('下のテキスト全体を端末内のファイルなどへ保存してください。表示しただけでは退避完了になりません。チャットやお問い合わせには送らないでください。');
 }catch(e){message(storageMessage(e));}};
 if($('copy-text')){
  $('copy-text').hidden=typeof navigator.clipboard?.writeText!=='function';
  $('copy-text').onclick=async()=>{try{
   if(!textSnapshot)fail();await navigator.clipboard.writeText(textSnapshot.text);
   message('コピーしました。端末内のファイルなどへ貼り付けて保存し、保存内容を確認してください。');
  }catch(e){message('コピーできませんでした。テキスト欄を長押し・全選択して、端末内のファイルなどへ保存してください。');}};
 }
 if($('text-saved'))$('text-saved').onclick=()=>{try{
  if(!textSnapshot)fail();if(localStorage.getItem(KEY)!==textSnapshot.raw)throw Error('保存の表示後に記録が変わりました。もう一度テキストを表示して保存してください。');
  backedUpRaw=textSnapshot.raw;message('テキストを保存したことを確認しました。復元する場合は内容を確認して進んでください。');
 }catch(e){message(storageMessage(e));}};
 if(new URLSearchParams(location.search).get('exportOnly')==='1'){
  document.body.dataset.exportOnly='true';$('import-panel')?.remove();$('return-link')?.remove();
 }
 if(document.body.dataset.exportOnly==='true')return;
 function inspect(contents){
  if(bytes(contents)>MAX)fail();const packet=JSON.parse(contents);fields(packet,['app','version','key','createdAt','data']);
  if(packet.app!=='kuku-sodate'||packet.version!==1||packet.key!==KEY)fail();text(packet.createdAt);
  const checked=validate(packet.data),old=localStorage.getItem(KEY);
  pending=checked;existing=old;backedUpRaw=null;$('ack').checked=false;
  message(`読み込み確認：学習済み ${Object.values(pending.f).filter(f=>f.l>=0).length}問、${pending.coins}ポイント、育成 ${pending.pet.xp} XP。${existing===null?'この画面には既存記録がありません。':'既存記録があります。この画面の記録も先に保存してください。'}`);$('restore').disabled=false;
 }
 let inspection=0;
 function reset(){pending=null;$('restore').disabled=true;return ++inspection;}
 $('file').onchange=async e=>{const turn=reset();try{
  const file=e.target.files[0];if(!file)return;if(file.size>MAX)fail();
  const contents=typeof file.text==='function'?await file.text():await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('ファイルを読み込めませんでした。'));reader.readAsText(file);});
  if(turn===inspection)inspect(contents);
 }catch(e){if(turn===inspection){pending=null;message(storageMessage(e));}}};
 if($('import-text'))$('import-text').oninput=()=>{reset();message('テキストを変更しました。「テキストの内容を確認」を押してください。');};
 if($('inspect-text'))$('inspect-text').onclick=()=>{reset();try{inspect($('import-text').value);}catch(e){message(storageMessage(e));}};
 $('restore').onclick=()=>{try{
  if(!pending)fail();if(!$('ack').checked)throw Error('内容と退避ファイルを確認してチェックしてください。');
  if(localStorage.getItem(KEY)!==existing)throw Error('別の画面で記録が変わりました。ファイルを選び直すかテキストを確認し直してください。');
  if(existing!==null&&backedUpRaw!==existing)throw Error('先に既存の記録をファイルへ保存してください。');
  if(!confirm('この画面の九九の記録を、確認したバックアップの内容に置き換えますか？'))return;
  localStorage.setItem(KEY,JSON.stringify(validate(pending)));pending=null;$('restore').disabled=true;
  message('復元しました。他の九九画面を閉じてから、アプリを開き直してください。旧サイトとの自動同期はありません。');
 }catch(e){message(e.name==='QuotaExceededError'?'保存容量が不足しています。既存の記録は変更していません。':storageMessage(e));}};
})();
