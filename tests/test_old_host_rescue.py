"""Route-only simulation of the old host; never accesses the real GitHub site."""
import asyncio,json,tempfile,unittest
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
OLD='https://gs5824878j-cyber.github.io/kuku-sodate/'

class OldHostTest(unittest.TestCase):
    def test_old_window_export_only_without_storage_writes(self): asyncio.run(self.exercise())
    async def exercise(self):
        async with async_playwright() as p:
            b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
            try:
                c=await b.new_context(accept_downloads=True)
                async def serve(route):
                    request=route.request.url
                    if request.startswith(OLD):
                        relative=urlsplit(request).path[len('/kuku-sodate/'):] or 'index.html'
                        path=(ROOT/relative).resolve()
                        if path.is_relative_to(ROOT) and path.is_file():await route.fulfill(path=str(path))
                        else:await route.fulfill(status=404,body='not found')
                    else:await route.abort()
                await c.route('**/*',serve)
                await c.add_init_script("""if(window.parent!==window){window.transferWrites=0;Storage.prototype.setItem=function(){window.transferWrites++;throw Error('no writes')};Storage.prototype.removeItem=function(){window.transferWrites++;throw Error('no removal')};Storage.prototype.clear=function(){window.transferWrites++;throw Error('no clearing')}}""")
                page=await c.new_page();await page.goto(OLD,wait_until='networkidle')
                raw=await page.evaluate("()=>{S.coins=137;S.pet.branch='balance';save();return localStorage.getItem('kuku_preview_v5')}")
                await page.locator('#record-transfer-open').click()
                f=page.frame_locator('#record-transfer-frame')
                await f.locator('#show-text').click()
                self.assertEqual(await f.locator('#restore').count(),0)
                self.assertEqual(await f.locator('#file').count(),0)
                self.assertEqual(json.loads(await f.locator('#backup-text').input_value())['data'],json.loads(raw))
                with tempfile.TemporaryDirectory() as tmp:
                    async with page.expect_download() as event:await f.locator('#export').click()
                    dest=Path(tmp)/'synthetic.json';await (await event.value).save_as(str(dest))
                    self.assertEqual(json.loads(dest.read_text())['data'],json.loads(raw))
                self.assertEqual(await f.locator('body').evaluate('()=>window.transferWrites'),0)
                self.assertEqual(await page.evaluate("localStorage.getItem('kuku_preview_v5')"),raw)
                self.assertEqual(page.url,OLD)
                await page.evaluate('window.oldWindowMarker=true')
                await page.locator('#record-transfer-close').click()
                self.assertTrue(await page.evaluate('window.oldWindowMarker'))
                self.assertFalse(await page.locator('#record-transfer-dialog').evaluate('(el)=>el.open'))
                self.assertEqual(await page.locator('#coins').inner_text(),'137')
                self.assertEqual(await page.evaluate("localStorage.getItem('kuku_preview_v5')"),raw)
                await page.get_by_role('button',name='📘 新しい段をおぼえる',exact=True).click()
                await page.get_by_role('button',name='2の段',exact=True).click()
                await page.get_by_role('button',name='覚えた！ 答えをかくす',exact=True).wait_for()
                await c.close()
            finally:await b.close()
if __name__=='__main__':unittest.main()
