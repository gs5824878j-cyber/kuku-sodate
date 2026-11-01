"""New-site regression: persisted balanced pets must complete startup after reload."""
import asyncio,unittest
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
class BalancedReloadTest(unittest.TestCase):
    def test_balanced_pet_reload_for_all_species(self):
        server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
        Thread(target=server.serve_forever,daemon=True).start()
        try:asyncio.run(self.exercise('http://127.0.0.1:'+str(server.server_port)))
        finally:server.shutdown();server.server_close()
    async def exercise(self,url):
        async with async_playwright() as p:
            b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
            try:
                for species in ['human','dino','animal']:
                    c=await b.new_context();await c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(url+'/') else r.abort())
                    page=await c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
                    await page.goto(url+'/',wait_until='networkidle')
                    await page.evaluate("species=>{S.coins=137;S.pet.xp=160;S.pet.branch='balance';S.settings.species=species;save()}",species)
                    await page.reload(wait_until='networkidle')
                    self.assertFalse(errors,(species,errors))
                    self.assertEqual(await page.evaluate('typeof learnStartHideV9'),'function')
                    self.assertEqual(await page.locator('#coins').inner_text(),'137')
                    self.assertEqual(await page.evaluate('S.pet.branch'),'balance')
                    self.assertEqual(await page.evaluate('S.settings.species'),species)
                    self.assertEqual(await page.evaluate('S.pet.xp'),160)
                    await page.get_by_role('button',name='📘 新しい段をおぼえる',exact=True).click()
                    await page.get_by_role('button',name='2の段',exact=True).click()
                    await page.get_by_role('button',name='覚えた！ 答えをかくす',exact=True).wait_for()
                    await c.close()
            finally:await b.close()
if __name__=='__main__':unittest.main()
