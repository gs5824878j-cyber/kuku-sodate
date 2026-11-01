/* Keep transfer inside the current app window, including an installed app. */
'use strict';
(() => {
 const open=document.getElementById('record-transfer-open'),dialog=document.getElementById('record-transfer-dialog'),frame=document.getElementById('record-transfer-frame');
 if(!open||!dialog||!frame)return;
 open.addEventListener('click',event=>{
  event.preventDefault();
  // No external navigation: the child document shares this window's origin.
  const url=new URL('migration.html',location.href);
  if(location.hostname==='gs5824878j-cyber.github.io')url.searchParams.set('exportOnly','1');
  frame.src=url.href;
  if(typeof dialog.showModal==='function')dialog.showModal();
  else{dialog.setAttribute('open','');dialog.classList.add('transfer-fallback');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');}
  document.getElementById('record-transfer-close').focus();
 });
 const oldHost=location.hostname==='gs5824878j-cyber.github.io';
 if(oldHost)document.getElementById('record-transfer-close').textContent='アプリに戻る';
 // The old host is export-only: keep its running app and memory intact.
 // A destination app can restore records, so reload that app before continuing.
 const close=()=>{
  if(!oldHost){location.reload();return;}
  if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');
  dialog.classList.remove('transfer-fallback');frame.src='about:blank';open.focus();
 };
 document.getElementById('record-transfer-close').addEventListener('click',close);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
})();
