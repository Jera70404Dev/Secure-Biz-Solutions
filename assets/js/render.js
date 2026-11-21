(function(g){
  'use strict';
  const C=g.SBS_CONFIG,D=g.SBS_CONTENT,{esc,I,PRODUCTS,INDUSTRIES,BROKER,FOOT_IND}=D;
  const R={home:'/','how-it-works':'/how-it-works/','business-funding':'/business-funding/','high-risk':'/high-risk/','merchant-services':'/merchant-services/',about:'/about/',faq:'/faq/',contact:'/contact/','privacy-policy':'/privacy-policy/',terms:'/terms/','get-funded':'/get-funded/','your-options':'/your-options/','thank-you-merchant':'/thank-you/merchant/','thank-you-follow-up':'/thank-you/follow-up/','fresh-start':'/fresh-start/','thank-you-fresh-start':'/thank-you/fresh-start/'};
  PRODUCTS.forEach(p=>R['p-'+p.slug]='/business-funding/'+p.slug+'/');
  INDUSTRIES.forEach(p=>R['i-'+p.slug]='/industries/'+p.slug+'/');
  const forms=['get-funded','your-options','thank-you-merchant','thank-you-follow-up','thank-you-fresh-start'];
  const conversions=forms.filter(k=>k!=='get-funded');
  let context={local:false,base:'',params:new URLSearchParams()},faqs=[];
  function safeURL(value){return typeof value==='string'&&(/^(https:\/\/)/.test(value)||/^(assets\/)[\w./-]+$/.test(value));}
  function asset(path){return /^https:\/\//.test(path)?path:context.base+path;}
  function L(key){return (context.local?'#':(C.basePath||''))+(R[key]||'/404.html');}
  function phone(){return C.phone.number&&/^\+?[\d ()-]{7,24}$/.test(C.phone.number)?`<a class="tel" href="tel:${esc(C.phone.number.replace(/[^+\d]/g,''))}">${esc(C.phone.display)}</a>`:`<span class="tel phone-pending">${esc(C.phone.display)}</span>`;}
  function logo(white=false){
    const file=C.logos[white?'white':'color'];
    return `<a class="logo" href="${L('home')}" aria-label="Secure Biz Solutions home">${file&&safeURL(file)?`<img src="${esc(asset(file))}" width="190" height="48" alt="Secure Biz Solutions">`:`<span class="brand-mark" aria-hidden="true">${I('shield')}</span><span>Secure Biz<small>Solutions</small></span>`}</a>`;
  }
  function photo(filename,description){
    const key=filename.replace(/\.jpg$/,'');
    const p=C.images[key];
    if(p&&(p.approved||(!C.production&&p.generated))&&safeURL(p.src)) {
      const eager=context.heroPhoto===key;
      return `<figure class="photo"><img src="${esc(asset(p.src))}" ${p.small&&safeURL(p.small)?`srcset="${esc(asset(p.small))} 800w, ${esc(asset(p.src))} 1600w" sizes="(max-width: 760px) 100vw, 560px"`:''} alt="${esc(p.alt||description)}" width="1600" height="1200" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async"></figure>`;
    }
    return `<figure class="photo photo-pending${key==='hero-home'?' home-banner':''}" aria-label="${esc(description)}"><div class="photo-lines" aria-hidden="true"></div><div class="photo-message">${I(key==='hero-home'?'store':'camera')}<span>${key==='hero-home'?'Your business.<br>Your next chapter.':'A closer look at your business.'}</span><small>${key==='hero-home'?'Homepage banner · Awaiting client asset':'Photography · Awaiting approval'}</small></div><figcaption>${esc(key==='hero-home'?'Reserved for the Secure Biz hero banner':description)}</figcaption></figure>`;
  }
  function video(still){
    const key=still.includes('owner')?'owner':still.includes('funding')?'funding':'home',v=C.videos[key];
    return `<div class="video-frame" data-video-slot="${key}">${v.poster&&safeURL(v.poster)?`<img src="${esc(asset(v.poster))}" alt="${esc(v.title)}" width="1600" height="900" loading="lazy">`:`<div class="video-placeholder" aria-hidden="true">${I('shield')}</div>`}<div class="video-overlay"><button type="button" class="video-play" data-video="${key}" aria-label="Play ${esc(v.title)}" ${v.src?'':'disabled'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14l11-7z" fill="currentColor"/></svg></button><span>${v.src?'Watch the video':'Video coming soon'}</span></div><p class="video-status" role="status"></p></div>`;
  }
  function faqList(items){faqs.push(...items);return `<div class="faq">${items.map(([q,a])=>`<details class="q"><summary>${esc(q)}<span class="faq-icon" aria-hidden="true"></span></summary><div class="faq-answer"><p>${esc(a)}</p></div></details>`).join('')}</div>`;}
  function embed(kind){return `<div class="embed-shell" data-form="${kind}"><div class="embed-loading" role="status">${I('lock')}<span>Loading secure form…</span></div><noscript><p>Enable JavaScript to use the secure form.</p></noscript></div>`;}
  function booking(kind='advisor'){
    const url=C.calendars[kind];
    if(url&&/^https:\/\/(calendar\.google\.com|calendar\.app\.google)\//.test(url))return `<div class="calendar-shell"><iframe title="Book your ${kind==='freshStart'?'20':'15'}-minute call" src="${esc(url)}" width="760" height="680" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
    return `<div class="calendar-pending">${I('cal')}<h3>${kind==='freshStart'?'Free 20-minute specialist call':'15-minute advisor call'}</h3><p>Online booking will be available soon.</p><span>Monday to Friday, 9 a.m. to 5 p.m. ET</span></div>`;
  }
  function links(items){return items.map(([key,label])=>`<a href="${L(key)}">${esc(label)}</a>`).join('');}
  const productLinks=()=>PRODUCTS.map(p=>['p-'+p.slug,p.name]);
  const industryLinks=()=>[['high-risk','High Risk'],...INDUSTRIES.map(p=>['i-'+p.slug,p.name])];
  const companyLinks=()=>[['about','Our Story'],['how-it-works','How It Works'],['merchant-services','Merchant Services'],['fresh-start','Fresh Start Program'],['faq','FAQ'],['contact','Contact'],['get-funded','Get Funded']];
  function dropdown(id,label,items){return `<div class="nav-group"><button type="button" aria-expanded="false" aria-controls="nav-${id}">${label}<svg viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg></button><div class="nav-dropdown" id="nav-${id}" hidden>${links(items)}</div></div>`;}
  function header(simple){
    if(simple)return `<header class="fhead"><div class="wrap">${logo()}${phone()}</div></header>`;
    return `<header class="site" id="site-header"><div class="wrap">${logo()}<nav class="main" aria-label="Main navigation">${dropdown('about','About',[['about','Our Story'],['faq','FAQ'],['contact','Contact']])}<a href="${L('how-it-works')}">How It Works</a>${dropdown('services','Services',[['business-funding','All funding options'],...productLinks(),['fresh-start','Fresh Start Program']])}${dropdown('industries','Industries',industryLinks())}<a href="${L('merchant-services')}">Merchant Services</a></nav><div class="hright">${phone()}<a class="btn" href="${L('get-funded')}">Get Funded ${I('arrow','arrow')}</a></div><button class="menubtn" id="menuOpen" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div></header><dialog class="mobile-dialog" id="mobile-menu" aria-label="Main navigation"><div class="top">${logo()}<button class="icon-button" id="menuClose" aria-label="Close menu">×</button></div><nav aria-label="Mobile navigation"><h2>About</h2>${links([['about','Our Story'],['faq','FAQ'],['contact','Contact'],['how-it-works','How It Works']])}<h2>Funding</h2>${links([['business-funding','All funding options'],...productLinks(),['fresh-start','Fresh Start Program']])}<h2>Industries</h2>${links(industryLinks())}${links([['merchant-services','Merchant Services']])}<a class="btn" href="${L('get-funded')}">Get Funded</a></nav></dialog>`;
  }
  function footer(simple){
    if(simple)return `<footer class="ffoot"><div class="wrap"><p>${esc(BROKER)}</p><div class="fbot">${links([['privacy-policy','Privacy'],['terms','Terms']])}<span>© 2026 Secure Biz Solutions. All rights reserved.</span></div></div></footer>`;
    return `<footer class="site"><div class="wrap"><div class="ftop"><div class="footer-brand">${logo(true)}<p>Business funding and merchant services for growing businesses.</p></div><div><p>Monday to Friday, 9 a.m. to 5 p.m. ET</p>${phone()}</div></div><div class="fcols">${[['Services',productLinks()],['Industries',industryLinks()],['Company',companyLinks()]].map(([h,items])=>`<div><h2>${h}</h2><ul>${items.map(([k,t])=>`<li><a href="${L(k)}">${esc(t)}</a></li>`).join('')}</ul></div>`).join('')}</div><div class="find"><h2>Industries we fund</h2><div class="l">${FOOT_IND.map(t=>`<span>${esc(t)}</span>`).join('')}</div></div><div class="legal"><p>By opting in to text messages, you agree to receive messages from Secure Biz Solutions about your funding request. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. We do not sell your information.</p><p>${esc(BROKER)}</p><div class="fbot">${links([['privacy-policy','Privacy Policy'],['terms','Terms of Service']])}<span>© 2026 Secure Biz Solutions. All rights reserved.</span></div></div></div></footer><div class="stickybar"><a class="btn" href="${L('get-funded')}">Get Funded ${I('arrow','arrow')}</a></div>`;
  }
  function legal(type,title){
    const legal=C.legal[type];
    return `<section class="hero legal-hero"><div class="wrap narrow"><h1>${title}</h1>${legal.updated?`<p>Last updated: ${esc(legal.updated)}</p>`:''}</div></section><section class="legal-content"><div class="wrap narrow blk">${legal.sections.length?legal.sections.map(s=>`<section class="legal-block"${s.id?` id="${esc(s.id)}"`:''}><h2>${esc(s.heading)}</h2>${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join(''):`<div class="pending-copy">${I('doc')}<h2>${title} is being finalized</h2><p>The approved policy text will appear here before this website launches.</p></div>`}${type==='terms'&&!legal.sections.some(s=>s.id==='sms')?`<div id="sms" class="pending-copy"><h2>SMS Terms</h2><p>Approved SMS policy text is pending.</p></div>`:''}</div></section>`;
  }
  function fitCodes(value){const codes=String(value||'').split(',').filter(c=>PRODUCTS.some(p=>p.code===c));return codes.length?[...new Set(codes)].slice(0,3):['term','loc','mca'];}
  function formPage(content,wide=false){return `<section class="formpage"><div class="wrap"><div class="fcard blk${wide?' wide':''}">${content}</div></div></section>`;}
  function options(){const fit=fitCodes(context.params.get('fit')),sid=context.params.get('sid');
    return formPage(`<h1>Good news: you have options.</h1><p>Based on what you told us, these are the options that most likely fit your business. Your advisor is calling you shortly to walk through them.</p><div class="cards options-grid">${fit.map(c=>{const p=PRODUCTS.find(p=>p.code===c);return `<a class="card" data-fit-code="${p.code}" href="${L('p-'+p.slug)}">${I(p.ico)}<h3>${esc(p.name)}</h3><p>${esc(p.card)}</p><span class="more">Learn more →</span></a>`;}).join('')}</div><div class="callbox">Your advisor will call you shortly from <strong>${esc(C.phone.display)}</strong>. Save the number so you know it's us.</div><h2>Prefer to pick a time?</h2>${booking()}${sid?`<div class="optional-upload"><h2>Want a faster answer?</h2><p>Upload your three most recent business bank statements now. This step is optional; your advisor can collect them on the call.</p>${embed('upload')}</div>`:''}`,true);
  }
  function render(key,options={}){
    const heroPhoto=({home:'hero-home','business-funding':'hero-funding','high-risk':'hero-highrisk','merchant-services':'hero-merchant',about:'about'})[key]||[...PRODUCTS,...INDUSTRIES].find(p=>'p-'+p.slug===key||'i-'+p.slug===key)?.photo[0].replace('.jpg','');
    context={local:false,base:'',params:new URLSearchParams(),heroPhoto,...options};faqs=[];
    applyHeloc();
    const api={L,photo,video,faqList,embed,booking,phone};
    const {PAGES}=g.SBS_SECTIONS(api);
    PAGES['privacy-policy']=()=>legal('privacy','Privacy Policy');PAGES.terms=()=>legal('terms','Terms of Service');
    PAGES['get-funded']=()=>formPage(`<h1>See your funding options</h1><p>It takes about three minutes. Free, with no obligation.</p>${embed('funding')}<p class="privacy-promise">${I('lock')} Your information is private and secure. We never sell your data.</p>`)+`<div class="application-disclosure wrap narrow"><p>${esc(BROKER)}</p></div>`;
    PAGES['your-options']=()=>optionsPage();
    PAGES['thank-you-merchant']=()=>formPage(`<div class="confirmation-icon">${I('check')}</div><h1>We've got your statement.</h1><p>We'll review it line by line and get back to you within one to two business days with your savings.</p><a href="${L('get-funded')}">Need funding too? See your options →</a>`);
    PAGES['thank-you-follow-up']=()=>formPage(`<div class="confirmation-icon">${I('check')}</div><h1>Thanks, we're on it.</h1><p>A funding specialist will review your information and reach out within one business day to talk through what's possible for your business. Want to pick the time? Book it below.</p>${booking()}`);
    PAGES['thank-you-fresh-start']=()=>formPage(`<span class="pill">Fresh Start Program</span><h1>Thanks. You're not out of options.</h1><p>Based on your answers, the fastest path is a quick call with a funding specialist. They'll look at your full picture, check the options that focus on revenue instead of credit, and build you a step-by-step plan to get funding-ready.</p><h2>Book your free call</h2>${booking('freshStart')}<div class="callbox">If you don't book, a specialist will call you within one business day from <strong>${esc(C.phone.display)}</strong>.</div>`,true);
    PAGES['404']=()=>`<section class="not-found wrap"><span class="pill">404</span><h1>We couldn't find that page.</h1><p>Let's get you back to your next step.</p><a class="btn" href="${L('home')}">Back to home</a></section>`;
    if(!PAGES[key])key='404';
    const content=PAGES[key](),simple=forms.includes(key),meta=g.SBS_META[key];
    const title=meta[0].includes('Secure Biz Solutions')?meta[0]:meta[0]+' | Secure Biz Solutions';
    const uniqueFAQ=[...new Map(faqs.map(v=>[v[0],v])).values()];
    const schema=[{'@context':'https://schema.org','@type':'LocalBusiness',name:'Secure Biz Solutions',url:C.origin,description:'Business funding and merchant services for growing businesses.',...(C.phone.number?{telephone:C.phone.number}:{})}];
    if(uniqueFAQ.length)schema.push({'@context':'https://schema.org','@type':'FAQPage',mainEntity:uniqueFAQ.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});
    let html=header(simple)+`<main id="main" tabindex="-1">${content}</main>`+footer(simple);
    html=html.replace(/<div class="tbl">/g,'<div class="tbl" tabindex="0" role="region" aria-label="Funding comparison table">');
    return {key,html,title,description:meta[1],path:R[key]||'/404.html',noindex:conversions.includes(key)||key==='404',simple,schema,faqCount:uniqueFAQ.length};
  }
  const optionsPage=options;
  const originalHeloc=JSON.stringify(PRODUCTS.find(p=>p.code==='heloc'));
  function applyHeloc(){
    const h=C.heloc,amount='$'+(h.maximum/1000)+'K',p=PRODUCTS.find(p=>p.code==='heloc'),original=JSON.parse(originalHeloc);
    Object.assign(p,JSON.parse(JSON.stringify(original).replace(/\$400K/g,amount).replace(/\$400,000/g,'$'+h.maximum.toLocaleString('en-US')).replace(/620/g,String(h.credit)).replace(/43%/g,h.dti+'%').replace(/85%/g,h.cltv+'%').replace(/15%/g,h.retainedEquity+'%')));
    D.CMP_ROWS[7][1]='Up to '+amount;
    g.SBS_META['p-home-equity'][1]=`Use the equity in your home to fund your business, with lines up to $${h.maximum.toLocaleString('en-US')} through a licensed lending partner.`;
  }
  D.P.arrow='<path d="M4 12h15m-6-6 6 6-6 6"/>';
  g.SBS={render,routes:R,forms,conversions,fitCodes,safeURL};
})(globalThis);
