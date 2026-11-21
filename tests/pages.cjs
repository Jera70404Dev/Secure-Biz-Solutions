// Run after build-pages.mjs; use SBS_PLAYWRIGHT for an existing Playwright install.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.SBS_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'../dist');
const manifest=require('../docs/page-manifest.json');
const site='https://jera70404dev.github.io/Secure-Biz-Solutions';
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844}});
    const errors=[],missing=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://form.jotform.com/**',r=>r.fulfill({body:'<!doctype html><title>Test form</title>'}));
    await page.route('https://jera70404dev.github.io/**',r=>{
      const url=new URL(r.request().url());
      if(!url.pathname.startsWith('/Secure-Biz-Solutions/')){
        missing.push(url.pathname);return r.fulfill({status:404,body:'Outside site prefix'});
      }
      const rel=url.pathname.slice('/Secure-Biz-Solutions/'.length);
      const file=path.join(root,rel.endsWith('/')?rel+'index.html':rel||'index.html');
      const found=fs.existsSync(file)&&fs.statSync(file).isFile();
      const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'};
      if(!found&&!r.request().isNavigationRequest())missing.push(url.pathname);
      return r.fulfill({status:found?200:404,path:found?file:path.join(root,'404.html'),contentType:mime[path.extname(file)]||'text/html'});
    });
    for(const {url,key} of manifest){
      const response=await page.goto(site+url);
      assert.equal(response.status(),200,url);
      assert.equal(await page.locator('body').getAttribute('data-page'),key,url);
      assert.equal(await page.locator('h1').count(),1,url);
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),site+url);
      const links=await page.locator('a[href^="/"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
      assert(links.every(h=>h.startsWith('/Secure-Biz-Solutions/')),url+' has a link outside the site');
    }
    await page.goto(site+'/');
    await page.locator('.picker a').first().click();
    assert.equal(new URL(page.url()).pathname,'/Secure-Biz-Solutions/get-funded/');
    await page.locator('[data-form=funding] iframe').waitFor();
    await page.goto(site+'/missing/deep/path/');
    assert.equal(await page.locator('body').getAttribute('data-page'),'404');
    await page.locator('.logo').first().click();
    assert.equal(new URL(page.url()).pathname,'/Secure-Biz-Solutions/');
    for(const internal of ['docs','scripts','tests','ordenes','tmp','templates'])assert(!fs.existsSync(path.join(root,internal)));
    assert(!fs.existsSync(path.join(root,'assets/images/originals')));
    assert(!fs.existsSync(path.join(root,'assets/images/images.zip')));
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    console.log('Passed: 28 GitHub Pages routes, navigation, canonical URLs, nested 404 recovery and public package boundaries.');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
