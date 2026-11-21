(function(){
  'use strict';
  const C=globalThis.SBS_CONFIG,S=globalThis.SBS,D=globalThis.SBS_CONTENT;
  const local=location.protocol==='file:',base=document.body.dataset.base||'',root=document.getElementById('app');
  const trackingKeys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'];
  let currentPath='',params=new URLSearchParams(),cleanup=[],renderCount=0,trackedView='';
  const memory={};
  function sessionGet(k){try{return sessionStorage.getItem(k)}catch{return memory[k]||null}}
  function sessionSet(k,v){memory[k]=v;try{sessionStorage.setItem(k,v)}catch{}}
  function readCookie(){try{const key='sbs_attribution=';const v=document.cookie.split('; ').find(v=>v.startsWith(key));return v?JSON.parse(decodeURIComponent(v.slice(key.length))):{}}catch{return {}}}
  function attribution(query){
    let values=readCookie();
    if(trackingKeys.some(k=>query.has(k))){values={};trackingKeys.forEach(k=>{const v=query.get(k);if(v)values[k]=v.slice(0,500)});
      if(location.protocol==='https:')try{document.cookie='sbs_attribution='+encodeURIComponent(JSON.stringify(values))+'; Max-Age=7776000; Path=/; SameSite=Lax; Secure'}catch{}
      sessionSet('sbs-attribution',JSON.stringify(values));
    }
    if(!Object.keys(values).length)try{values=JSON.parse(sessionGet('sbs-attribution')||'{}')}catch{}
    return values;
  }
  function locationState(){
    let path=location.pathname,search=location.search;
    if(local){const hash=location.hash.slice(1);if(hash.startsWith('/')){const i=hash.indexOf('?');path=i<0?hash:hash.slice(0,i);search=i<0?'':hash.slice(i+1)}else path='/';}
    else if(C.basePath&&(path===C.basePath||path.startsWith(C.basePath+'/')))path=path.slice(C.basePath.length)||'/';
    path=path.replace(/index\.html$/,'');if(!path.endsWith('/')&&!path.endsWith('.html'))path+='/';
    return {path,key:Object.keys(S.routes).find(k=>S.routes[k]===path)||'404',query:new URLSearchParams(search)};
  }
  function metadata(r){
    document.title=r.title;
    const set=(selector,tag,attr,value)=>{let e=document.head.querySelector(selector);if(value===null){e?.remove();return}if(!e){e=document.createElement(tag);document.head.append(e)}e.setAttribute(attr,value);return e};
    let description=set('meta[name=description]','meta','content',r.description);description?.setAttribute('name','description');
    let robots=set('meta[name=robots]','meta','content',r.noindex||!C.production?'noindex, follow':'index, follow');robots.setAttribute('name','robots');
    let canonical=set('link[rel=canonical]','link','href',C.origin+r.path);canonical.setAttribute('rel','canonical');
    let schema=document.getElementById('page-schema');schema.textContent=JSON.stringify(r.schema);
    for(const [property,value] of [['og:title',r.title],['og:description',r.description||''],['og:url',C.origin+r.path]])document.querySelector(`meta[property="${property}"]`)?.setAttribute('content',value);
  }
  function mount(initial=false){
    const state=locationState();params=state.query;
    const last=currentPath||sessionGet('sbs-last-page');
    const previous=last&&last!==state.path?last:sessionGet('sbs-came-from')||state.path;
    const cameFrom=previous;
    sessionSet('sbs-came-from',cameFrom);sessionSet('sbs-last-page',state.path);
    currentPath=state.path;
    cleanup.forEach(fn=>fn());cleanup=[];
    const r=S.render(state.key,{local,base,params});
    root.innerHTML=r.html;document.body.dataset.page=r.key;document.body.classList.toggle('hasbar',!r.simple);metadata(r);renderCount++;
    wire();mountForms(attribution(params),cameFrom);track(r,renderCount);
    if(!initial){window.scrollTo({top:0,behavior:'instant'});document.getElementById('main').focus({preventScroll:true});document.getElementById('route-status').textContent=r.title;}
  }
  function wire(){
    const dialog=document.getElementById('mobile-menu'),opener=document.getElementById('menuOpen');
    function closeMenu(){if(dialog?.open)dialog.close();}
    if(dialog){opener.onclick=()=>{dialog.showModal();opener.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';document.getElementById('menuClose').focus()};document.getElementById('menuClose').onclick=closeMenu;dialog.addEventListener('close',()=>{opener.setAttribute('aria-expanded','false');document.body.style.overflow='';opener.focus()});dialog.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));cleanup.push(()=>{document.body.style.overflow=''});}
    document.querySelectorAll('.nav-group>button').forEach(button=>{button.onclick=()=>{const was=button.getAttribute('aria-expanded')==='true';closeDropdowns();button.setAttribute('aria-expanded',String(!was));document.getElementById(button.getAttribute('aria-controls')).hidden=was;};});
    document.querySelectorAll('[data-scroll]').forEach(a=>a.onclick=e=>{const target=document.getElementById(a.dataset.scroll);if(target){e.preventDefault();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}});
    document.querySelector('[data-seemore]')?.addEventListener('click',e=>{const grid=document.getElementById('fundedGrid');grid.classList.add('open');e.currentTarget.setAttribute('aria-expanded','true');const first=grid.querySelector('.more-story');first.setAttribute('tabindex','-1');first.focus({preventScroll:true});});
    const more=document.querySelector('[data-seemore]');if(more){more.setAttribute('aria-expanded','false');more.setAttribute('aria-controls','fundedGrid');}
    document.querySelectorAll('[data-video]').forEach(button=>button.onclick=()=>playVideo(button));
    document.querySelectorAll('details.q').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open&&!matchMedia('(prefers-reduced-motion: reduce)').matches)detail.querySelector('.faq-answer').animate([{opacity:.8,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'ease-out'})}));
    if(globalThis.SBS_MOTION)cleanup.push(globalThis.SBS_MOTION.mount(root));
    updateHeader();
    document.querySelectorAll('a[href]').forEach(a=>{if(a.getAttribute('href')===((local?'#':(C.basePath||''))+currentPath))a.setAttribute('aria-current','page')});
  }
  function closeDropdowns(){document.querySelectorAll('.nav-group>button').forEach(b=>{b.setAttribute('aria-expanded','false');document.getElementById(b.getAttribute('aria-controls')).hidden=true})}
  function updateHeader(){document.getElementById('site-header')?.classList.toggle('is-scrolled',scrollY>12)}
  document.addEventListener('click',e=>{if(!e.target.closest('.nav-group'))closeDropdowns()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const active=document.querySelector('.nav-group>button[aria-expanded=true]');closeDropdowns();active?.focus();}});
  window.addEventListener('scroll',updateHeader,{passive:true});
  function playVideo(button){
    const v=C.videos[button.dataset.video],frame=button.closest('.video-frame');if(!S.safeURL(v.src))return;
    const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='none';video.src=/^https:/.test(v.src)?v.src:base+v.src;if(v.poster)video.poster=/^https:/.test(v.poster)?v.poster:base+v.poster;
    if(v.captions&&S.safeURL(v.captions)){const track=document.createElement('track');track.kind='captions';track.srclang='en';track.label='English';track.src=base+v.captions;video.append(track)}
    frame.replaceChildren(video);video.addEventListener('error',()=>{const p=document.createElement('p');p.className='video-status';p.textContent='This video could not load. Please try again later.';frame.append(p)});video.play().catch(()=>{});video.focus();
  }
  function mountForms(tracking,cameFrom){
    document.querySelectorAll('[data-form]').forEach(shell=>{
      const kind=shell.dataset.form,id=C.forms[kind],url=new URL('https://form.jotform.com/'+id);
      trackingKeys.forEach(k=>{if(tracking[k])url.searchParams.set(k,tracking[k])});url.searchParams.set('came_from_page',cameFrom);
      if(kind==='funding'&&C.amounts.includes(params.get('howMuch')))url.searchParams.set('howMuch',params.get('howMuch'));
      if(kind==='upload'){const sid=params.get('sid');if(!sid){shell.remove();return}url.searchParams.set('sid',sid.slice(0,200));}
      const iframe=document.createElement('iframe');iframe.id='JotFormIFrame-'+id;iframe.title={funding:'Secure business funding application',merchant:'Secure processing statement review',contact:'Contact Secure Biz Solutions',upload:'Optional bank statement upload'}[kind];iframe.src=url.href;iframe.height=kind==='funding'?'1100':kind==='upload'?'600':'800';iframe.referrerPolicy='no-referrer';iframe.setAttribute('allow','geolocation; camera; microphone');
      const loading=shell.querySelector('.embed-loading');let timeout=setTimeout(()=>{loading.textContent='The secure form is taking longer to load. You can retry below.'},12000);
      iframe.onload=()=>{clearTimeout(timeout);loading.hidden=true};iframe.onerror=()=>{clearTimeout(timeout);loading.hidden=false;loading.textContent='The secure form could not load. Check your connection and retry.'};
      shell.append(iframe);
      const help=document.createElement('details');help.className='embed-help';const summary=document.createElement('summary');summary.textContent='Form not loading?';const retry=document.createElement('button');retry.type='button';retry.textContent='Retry secure form';retry.onclick=()=>{loading.hidden=false;loading.textContent='Loading secure form…';iframe.src=url.href;};help.append(summary,retry);shell.append(help);
      const onMessage=event=>{
        if(event.source!==iframe.contentWindow||event.origin!==url.origin)return;
        if(typeof event.data!=='string')return;
        const m=event.data.match(/^setHeight:(\d+)(?::(\d+))?$/);if(m&&(!m[2]||m[2]===id)){iframe.style.height=Math.max(240,Math.min(8000,Number(m[1])))+'px';}
        // JotForm redirects must remain on this site's documented confirmation routes.
        const redirect=event.data.match(/^(?:redirect|goTo):(.+)$/);if(redirect){try{const dest=new URL(redirect[1],location.origin);if(dest.origin===location.origin&&S.conversions.some(k=>(C.basePath||'')+S.routes[k]===dest.pathname)){location.href=dest.href}}catch{}}
      };
      window.addEventListener('message',onMessage);cleanup.push(()=>{clearTimeout(timeout);window.removeEventListener('message',onMessage)});
    });
  }
  function loadScript(id,src){if(document.getElementById(id))return;const script=document.createElement('script');script.id=id;script.async=true;script.src=src;document.head.append(script)}
  function track(r,view){
    if(local||!C.production||!C.analytics.enabled||location.origin!==C.origin||trackedView===String(view))return;
    trackedView=String(view);
    // Remove URL parameters before loading vendor code; sid remains only in the active upload iframe.
    history.replaceState(history.state,'',location.pathname);
    const page=C.origin+r.path;
    if(/^G-[A-Z0-9]+$/.test(C.analytics.ga4)){
      window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
      if(!document.getElementById('sbs-ga')){gtag('js',new Date());gtag('config',C.analytics.ga4,{send_page_view:false,page_location:page,page_referrer:''});loadScript('sbs-ga','https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(C.analytics.ga4))}
      gtag('event','page_view',{page_title:r.title,page_location:page,page_referrer:''});if(S.conversions.includes(r.key))gtag('event','generate_lead',{page_location:page,page_referrer:'',lead_type:r.key});
    }
    if(/^\d+$/.test(C.analytics.metaPixel)){
      if(!window.fbq){const f=window.fbq=function(){f.callMethod?f.callMethod.apply(f,arguments):f.queue.push(arguments)};f.push=f;f.loaded=true;f.version='2.0';f.queue=[];fbq('init',C.analytics.metaPixel);fbq('set','autoConfig',false,C.analytics.metaPixel);loadScript('sbs-meta','https://connect.facebook.net/en_US/fbevents.js')}
      fbq('track','PageView');if(S.conversions.includes(r.key))fbq('track','Lead',{content_name:r.key});
    }
  }
  if(local)window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#/')||!location.hash)mount()});
  mount(true);
})();
