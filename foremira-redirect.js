(() => {
  'use strict';
  if (location.hostname !== 'gs5824878j-cyber.github.io' ||
      !/^\/kuku-sodate\/(?:index\.html)?$/.test(location.pathname)) return;
  const target = 'https://kuku.foremira.com/';
  let needsBackup = true;
  try { needsBackup = localStorage.getItem('kuku_preview_v5') !== null; } catch (_) {}
  if (!needsBackup) {
    location.replace(target + location.search + location.hash);
    return;
  }
  document.addEventListener('DOMContentLoaded', () => {
    const box = document.createElement('aside');
    box.setAttribute('aria-label', '新しいURLへの移行案内');
    box.style.cssText = 'margin:12px;padding:16px;background:#eef7ef;border:2px solid #397458;border-radius:12px;color:#234c3b;line-height:1.8';
    const heading = document.createElement('strong');
    heading.textContent = '九九そだては新しいURLへ引っ越しました';
    const message = document.createElement('p');
    message.textContent = 'このブラウザに以前の記録があるか、保存状態を確認できません。先に「記録の保存・復元」から記録を保存し、新しいサイトで復元してください。元の記録は削除しません。新旧の記録は自動同期されません。';
    const backup = document.createElement('a');
    backup.href = 'migration.html'; backup.textContent = '① 旧サイトの記録を保存する';
    const next = document.createElement('a');
    next.href = target + 'migration.html'; next.textContent = '② 新サイトで記録を復元する';
    const home = document.createElement('a');
    home.href = target; home.textContent = '新しい九九そだてへ';
    for (const a of [backup,next,home]) a.style.cssText='display:block;padding:8px 0;color:#234c3b;text-decoration:underline';
    box.append(heading,message,backup,next,home);
    document.body.prepend(box);
  });
})();