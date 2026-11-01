"""Offline transfer failure tests. Chromium emulation is not a real iOS/PWA test."""
import asyncio
import json
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
import unittest
from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
KEY = 'kuku_preview_v5'

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

class FallbackTest(unittest.TestCase):
    def test_fallbacks_and_storage_failures(self):
        server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
        Thread(target=server.serve_forever, daemon=True).start()
        try: asyncio.run(self.exercise('http://127.0.0.1:' + str(server.server_port)))
        finally: server.shutdown(); server.server_close()

    async def exercise(self, origin):
        async with async_playwright() as p:
            browser = await p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
            try:
                context = await browser.new_context(viewport={'width':375,'height':812}, has_touch=True)
                outbound = []
                async def route(r):
                    if r.request.url.startswith(origin + '/'): await r.continue_()
                    else: outbound.append(r.request.url); await r.abort()
                await context.route('**/*', route)
                page = await context.new_page()
                await page.goto(origin + '/')
                raw = await page.evaluate("() => {S.coins=123;S.pet.xp=160;S.pet.branch='balance';Object.assign(S.f['2x3'],{l:2,learnTestScore:9,learnedOn:'2026-10-31',pendingLearn:false});save();return localStorage.getItem('kuku_preview_v5')}")
                packet = {'app':'kuku-sodate','version':1,'key':KEY,'createdAt':'2026-11-01T00:00:00Z','data':json.loads(raw)}
                old = json.loads(raw); old['coins'] = 7
                payload = {'name':'synthetic.json','mimeType':'application/json','buffer':json.dumps(packet).encode()}
                async def stored(): return json.loads(await page.evaluate("localStorage.getItem('kuku_preview_v5')"))
                # Existing installed window: no navigation; transfer frame reads the same origin.
                await page.locator('#record-transfer-open').click()
                frame = page.frame_locator('#record-transfer-frame')
                await frame.locator('#show-text').click()
                self.assertEqual(json.loads(await frame.locator('#backup-text').input_value())['data'], json.loads(raw))
                self.assertEqual(page.url, origin + '/')
                self.assertEqual(await page.locator('#record-transfer-frame').evaluate('(el)=>el.contentWindow.location.origin'), origin)
                await page.locator('#record-transfer-close').click()
                await page.wait_for_load_state('networkidle')
                self.assertEqual(await page.locator('#coins').inner_text(), '123')
                # Export-only mode never exposes an importer or replaces storage.
                await page.goto(origin + '/migration.html?exportOnly=1')
                self.assertEqual(await page.locator('#restore').count(), 0)
                await page.locator('#show-text').click()
                self.assertEqual(json.loads(await page.locator('#backup-text').input_value())['data'], json.loads(raw))
                self.assertEqual(await stored(), json.loads(raw))
                # Download failure -> manual text backup -> text restore, with a mandatory backup guard.
                await page.goto(origin + '/migration.html')
                await page.evaluate("s=>localStorage.setItem('kuku_preview_v5',s)", json.dumps(old))
                await page.evaluate("() => {URL.createObjectURL=()=>{throw Error('保存できません')};Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}},configurable:true});}")
                await page.locator('#export').click()
                self.assertIn('保存できません', await page.locator('#message').inner_text())
                await page.locator('summary').click()
                await page.locator('#import-text').fill(json.dumps(packet))
                await page.locator('#inspect-text').click()
                await page.locator('#ack').check()
                await page.locator('#show-text').click()
                self.assertEqual(json.loads(await page.locator('#backup-text').input_value())['data'], old)
                await page.locator('#restore').click()
                self.assertIn('先に既存の記録', await page.locator('#message').inner_text())
                await page.locator('#copy-text').click()
                await expect(page.locator('#message')).to_contain_text('コピーできません')
                await page.locator('#text-saved').click()
                page.on('dialog', lambda d: d.accept())
                await page.locator('#restore').click()
                self.assertEqual(await stored(), packet['data'])
                # Editing inspected text invalidates pending restore; unknown keys cannot be imported.
                await page.locator('#import-text').fill(json.dumps({**packet,'data':{**packet['data'],'unknown':'reject'}}))
                self.assertTrue(await page.locator('#restore').is_disabled())
                await page.locator('#inspect-text').click()
                self.assertTrue(await page.locator('#restore').is_disabled())
                self.assertEqual(await stored(), packet['data'])
                # Mock only the share API: a cancelled or unsupported share is not a completed backup.
                await context.add_init_script("""Object.defineProperties(navigator,{
                  canShare:{configurable:true,value:()=>window.shareSupported!==false},
                  share:{configurable:true,value:async ({files})=>{window.sharedData=await files[0].text();if(window.cancelShare)throw new DOMException('cancelled','AbortError')}}
                });""")
                await page.goto(origin + '/migration.html')
                await page.evaluate("s=>localStorage.setItem('kuku_preview_v5',s)", json.dumps(old))
                await page.locator('#file').set_input_files(payload)
                await page.locator('#ack').check()
                await page.evaluate('window.cancelShare=true')
                await page.locator('#share').click()
                await expect(page.locator('#message')).to_contain_text('共有を中止')
                await page.locator('#restore').click()
                self.assertIn('先に既存の記録', await page.locator('#message').inner_text())
                await page.evaluate('window.shareSupported=false')
                await page.locator('#share').click()
                self.assertIn('共有できません', await page.locator('#message').inner_text())
                self.assertEqual(await stored(), old)
                await page.evaluate('window.shareSupported=true;window.cancelShare=false')
                await page.locator('#share').click()
                await expect(page.locator('#message')).to_contain_text('共有画面を閉じました')
                self.assertEqual(json.loads(await page.evaluate('window.sharedData'))['data'], old)
                # Quota error: setItem fails atomically and old data survives.
                await page.evaluate("() => {Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError')}}")
                await page.locator('#restore').click()
                self.assertIn('保存容量が不足', await page.locator('#message').inner_text())
                self.assertEqual(await stored(), old)
                # Text snapshot changed in another tab cannot satisfy the backup guard.
                await page.goto(origin + '/migration.html')
                await page.locator('#show-text').click()
                await page.evaluate("s=>localStorage.setItem('kuku_preview_v5',s)", raw)
                await page.locator('#text-saved').click()
                self.assertIn('記録が変わりました', await page.locator('#message').inner_text())
                # Storage denied: no import or export; no fallback that clears records.
                await page.evaluate("() => {Storage.prototype.getItem=function(){throw new DOMException('blocked','SecurityError')}}")
                await page.locator('#export').click()
                self.assertIn('保存領域を利用できません', await page.locator('#message').inner_text())
                await page.locator('#file').set_input_files(payload)
                self.assertTrue(await page.locator('#restore').is_disabled())
                self.assertIn('保存領域を利用できません', await page.locator('#message').inner_text())
                self.assertFalse(outbound, 'transfer must never send learning data to a server')
                await context.close()
            finally: await browser.close()

if __name__ == '__main__': unittest.main()
