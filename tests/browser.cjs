// Run with SBS_PLAYWRIGHT pointing to an installed Playwright package.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.SBS_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..');
const pages=require('../docs/page-manifest.json');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://form.jotform.com/**',r=>r.fulfill({body:'<!doctype html><title>Test iframe</title>'}));
 await page.route('https://review.example/**',r=>{
   const url=new URL(r.request().url()), rel=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
   const file=path.join(root,rel);
   const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'};
   return fs.existsSync(file)?r.fulfill({path:file,contentType:mime[path.extname(file)]}):r.fulfill({status:404,body:'Not found'});
 });
 const local=pathToFileURL(path.join(root,'index.html')).href;
 await page.goto(local);
 await page.locator('#menuOpen').click();assert(await page.locator('#mobile-menu').evaluate(el=>el.open));
 await page.keyboard.press('Escape');assert(!(await page.locator('#mobile-menu').evaluate(el=>el.open)));
 await page.locator('[data-seemore]').click();assert.equal(await page.locator('.more-story:visible').count(),3);
 await page.locator('.picker a').nth(1).click();
 await page.locator('[data-form=funding] iframe').waitFor();
 assert.equal(new URL(await page.locator('[data-form=funding] iframe').getAttribute('src')).searchParams.get('howMuch'),'$50K–$250K');
 await page.goBack();await page.locator('.picker a').first().waitFor();
 for(const {url,key,form} of pages){
   await page.goto(local+'#'+url);await page.waitForFunction(k=>document.body.dataset.page===k,key);
   assert.equal(await page.locator('h1').count(),1,url);
   assert.equal(await page.locator('.stickybar').count(),form?0:1,url);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),url+' overflows on mobile');
 }
 await page.goto('https://review.example/?utm_source=review&gclid=test');
 await page.goto('https://review.example/get-funded/?howMuch=%241M%2B');
 let src=new URL(await page.locator('[data-form=funding] iframe').getAttribute('src'));
 assert.equal(src.searchParams.get('utm_source'),'review');assert.equal(src.searchParams.get('gclid'),'test');assert.equal(src.searchParams.get('came_from_page'),'/');
 await page.goto('https://review.example/your-options/?fit=sba,sba,heloc,card,mca,nope&sid=review-token');
 assert.deepEqual(await page.locator('[data-fit-code]').evaluateAll(e=>e.map(x=>x.dataset.fitCode)),['sba','heloc','card']);
 src=new URL(await page.locator('[data-form=upload] iframe').getAttribute('src'));assert.equal(src.searchParams.get('sid'),'review-token');
 await page.goto('https://review.example/your-options/');assert.equal(await page.locator('[data-form=upload]').count(),0);
 assert.deepEqual(await page.locator('[data-fit-code]').evaluateAll(e=>e.map(x=>x.dataset.fitCode)),['term','loc','mca']);
 await page.goto('https://review.example/business-funding/');
 await page.locator('details.q summary').first().click();assert.equal(await page.locator('details[open].q').count(),1);
 assert.deepEqual(errors,[]);
 console.log('Passed: 28 local routes, mobile layout, menu, stories, FAQ, HTTPS attribution and iframe parameters.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
