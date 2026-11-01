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
 // Reload the app state after a restore instead of continuing with stale memory.
 const close=()=>location.reload();
 document.getElementById('record-transfer-close').addEventListener('click',close);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
})();
