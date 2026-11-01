"""Offline Chromium tests with ephemeral origins and synthetic learning data.
Requires installed Python Playwright and Chromium; never uses real browser profiles.
Run: python3 -m unittest discover -s tests -v
"""
import asyncio
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import tempfile
from threading import Thread
import unittest
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
KEY = 'kuku_preview_v5'

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

class TransferTest(unittest.TestCase):
    def test_cancel_conflict_duplicate_and_validation(self):
        servers = [ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT))) for _ in range(2)]
        for server in servers: Thread(target=server.serve_forever, daemon=True).start()
        try:
            asyncio.run(self.exercise(*['http://127.0.0.1:' + str(s.server_port) for s in servers]))
        finally:
            for s in servers: s.shutdown(); s.server_close()

    async def exercise(self, source, target):
        async with async_playwright() as p:
            browser = await p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
            try:
                context = await browser.new_context(accept_downloads=True)
                await context.route('**/*', lambda r: r.continue_() if r.request.url.startswith('http://127.0.0.1:') else r.abort())
                page = await context.new_page()
                await page.goto(source + '/', wait_until='networkidle')
                raw = await page.evaluate("() => {S.coins=123;S.pet.xp=160;S.pet.branch='balance';Object.assign(S.f['2x3'],{l:2,learnTestScore:9,learnedOn:'2026-10-31',pendingLearn:false});S.learnHistory={'2':{date:'2026-10-31',score:9,passed:true}};save();return localStorage.getItem('kuku_preview_v5')}")
                await page.goto(source + '/migration.html')
                with tempfile.TemporaryDirectory() as tmp:
                    async with page.expect_download() as event: await page.locator('#export').click()
                    backup = Path(tmp) / 'synthetic.json'
                    await (await event.value).save_as(str(backup))
                    packet = json.loads(backup.read_text())
                    self.assertEqual(packet['data'], json.loads(raw))
                    await page.goto(target + '/migration.html')
                    old = json.loads(raw); old['coins'] = 7
                    await page.evaluate("s=>localStorage.setItem('kuku_preview_v5',s)", json.dumps(old))
                    await page.locator('#file').set_input_files(str(backup))
                    await page.locator('#ack').check()
                    await page.locator('#restore').click()
                    self.assertEqual(json.loads(await page.evaluate("localStorage.getItem('kuku_preview_v5')")), old)
                    async with page.expect_download(): await page.locator('#export').click()
                    async def cancel(dialog): await dialog.dismiss()
                    page.on('dialog', cancel)
                    await page.locator('#restore').click()
                    self.assertEqual(json.loads(await page.evaluate("localStorage.getItem('kuku_preview_v5')")), old)
                    page.remove_listener('dialog', cancel)
                    # A second tab writes after inspection: do not replace its new record.
                    other = await context.new_page(); await other.goto(target + '/migration.html')
                    changed = {**old, 'coins': 8}
                    await other.evaluate("s=>localStorage.setItem('kuku_preview_v5',s)", json.dumps(changed))
                    await page.locator('#restore').click()
                    self.assertIn('記録が変わりました', await page.locator('#message').inner_text())
                    self.assertEqual(json.loads(await page.evaluate("localStorage.getItem('kuku_preview_v5')")), changed)
                    await page.locator('#file').set_input_files([])
                    await page.locator('#file').set_input_files(str(backup))
                    async with page.expect_download(): await page.locator('#export').click()
                    await page.locator('#ack').check()
                    page.on('dialog', lambda d: d.accept())
                    await page.locator('#restore').click()
                    self.assertEqual(json.loads(await page.evaluate("localStorage.getItem('kuku_preview_v5')")), json.loads(raw))
                    self.assertTrue(await page.locator('#restore').is_disabled())
                    # Selecting the same file again still requires a fresh backup and acknowledgement.
                    await page.locator('#file').set_input_files([])
                    await page.locator('#file').set_input_files(str(backup))
                    await page.locator('#ack').check()
                    await page.locator('#restore').click()
                    self.assertIn('先に既存の記録', await page.locator('#message').inner_text())
                    for label, data in [('unknown-field', {**packet, 'data': {**packet['data'], 'auth_token': 'synthetic'}}), ('wrong-version', {**packet, 'version': 99}), ('bad-species', {**packet, 'data': {**packet['data'], 'settings': {**packet['data']['settings'], 'species': 'unknown'}}})]:
                        await page.locator('#file').set_input_files({'name': label+'.json', 'mimeType':'application/json', 'buffer':json.dumps(data).encode()})
                        self.assertTrue(await page.locator('#restore').is_disabled())
                        self.assertEqual(json.loads(await page.evaluate("localStorage.getItem('kuku_preview_v5')")), json.loads(raw))
            finally:
                await browser.close()

if __name__ == '__main__': unittest.main()
