// Run with SBS_PLAYWRIGHT pointing to an installed Playwright package.
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.SBS_PLAYWRIGHT||'playwright');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const local=pathToFileURL(path.resolve(__dirname,'../index.html')).href;
    await page.goto(local);
    await page.waitForFunction(()=>document.querySelector('h1 .type-char'));
    const heading=page.locator('h1'),text=await heading.textContent();
    await page.evaluate(()=>document.fonts.ready);
    const before=await heading.evaluate(e=>e.offsetHeight);
    assert.equal(await heading.getAttribute('aria-label'),text);
    await page.waitForFunction(()=>!document.querySelector('h1').classList.contains('is-typing'));
    const after=await heading.evaluate(e=>e.offsetHeight);
    assert.equal(after,before,'Typing must reserve the heading height');
    assert.equal(await page.locator('h1 .type-char:not(.is-written)').count(),0);
    assert.equal(await page.locator('.brand-particles').count(),2);
    assert(await page.locator('.hero canvas').evaluate(c=>c.width>0&&c.height>0));
    await page.waitForFunction(()=>{const c=document.querySelector('.hero canvas');return c&&c.getContext('2d').getImageData(0,0,c.width,c.height).data.some(v=>v>0)});
    const card=page.locator('.card').first();await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);await card.hover();await page.waitForTimeout(550);
    assert.notEqual(await card.evaluate(e=>getComputedStyle(e).transform),'none','Cards should respond to hover');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>!document.querySelector('.brand-particles,.reading-progress,.type-char'));
    assert.equal(await page.locator('.brand-particles,.reading-progress,.type-char').count(),0);
    assert.equal(await heading.textContent(),text);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.waitForFunction(()=>document.querySelectorAll('.brand-particles').length===2);
    assert.equal(await page.locator('.brand-particles').count(),2);
    for(const route of ['/about/','/business-funding/term-loans/','/','/faq/','/']){
      await page.goto(local+'#'+route);await page.waitForFunction(()=>!!document.querySelector('.reading-progress'));
      assert.equal(await page.locator('.reading-progress').count(),1,'Only one motion lifecycle per route');
    }
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1800);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:path.resolve(__dirname,'../tmp/motion-mobile.png')});
    await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(300);
    await page.screenshot({path:path.resolve(__dirname,'../tmp/motion-desktop.png')});
    assert.deepEqual(errors,[]);
    console.log('Passed: typing layout, rendered particles, card interaction, live reduced-motion preference, route cleanup and mobile overflow.');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
