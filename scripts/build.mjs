// Developer export only. Node built-ins; no packages, install, or build step for visitors.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=process.env.SBS_OUTPUT_DIR?path.resolve(process.env.SBS_OUTPUT_DIR):root;
const scripts=['config','generated-art','content','metadata','page-sections','render','motion'];
const context=vm.createContext({URLSearchParams,URL,console});
for(const name of scripts)vm.runInContext(fs.readFileSync(path.join(root,'assets/js/'+name+'.js'),'utf8'),context,{filename:name+'.js'});
const {SBS:S,SBS_CONFIG:C,SBS_CONTENT:D}=context;
if(process.env.SBS_SITE_URL){
  const site=new URL(process.env.SBS_SITE_URL);
  if(site.protocol!=='https:')throw new Error('SBS_SITE_URL must use HTTPS.');
  C.basePath=site.pathname.replace(/\/$/,'');
  C.origin=site.origin+C.basePath;
}
if(C.production&&!C.clientApprovedStaticDelivery)throw new Error('Record client approval for static delivery before production export.');
const escape=D.esc;
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
function documentFor(key){
  const route=S.routes[key]||'/404.html';
  const depth=route.split('/').filter(Boolean).length;
  const base=key==='404'?(C.basePath||'')+'/':('../'.repeat(depth));
  const r=S.render(key,{base});
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="color-scheme" content="light"><meta name="theme-color" content="#ffffff"><meta name="referrer" content="no-referrer"><title>${escape(r.title)}</title>${r.description?`<meta name="description" content="${escape(r.description)}">`:''}<meta name="robots" content="${r.noindex||!C.production?'noindex, follow':'index, follow'}"><link rel="canonical" href="${C.origin+r.path}"><meta property="og:type" content="website"><meta property="og:title" content="${escape(r.title)}"><meta property="og:description" content="${escape(r.description||'')}"><meta property="og:url" content="${C.origin+r.path}"><meta property="og:site_name" content="Secure Biz Solutions"><link rel="icon" href="${base}assets/images/favicon.svg" type="image/svg+xml"><link rel="preload" href="${base}assets/fonts/poppins-700.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="${base}assets/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="${base}assets/css/base.css"><link rel="stylesheet" href="${base}assets/css/premium.css"><link rel="stylesheet" href="${base}assets/css/motion.css"><script type="application/ld+json" id="page-schema">${json(r.schema)}</script>${[...scripts,'app'].map(s=>`<script defer src="${base}assets/js/${s}.js"></script>`).join('')}</head>
<body data-page="${key}" data-base="${base}" class="${r.simple?'':'hasbar'}"><a class="skip-link" href="#main">Skip to content</a><div id="route-status" class="sr-only" role="status" aria-live="polite"></div><div id="app">${r.html}</div><noscript><nav class="nojs-nav" aria-label="All pages">${Object.entries(S.routes).map(([k,p])=>`<a href="${C.basePath||''}${p}">${escape(context.SBS_META[k][0])}</a>`).join('')}</nav></noscript></body></html>\n`;
}
const manifest=[];
for(const [key,url] of Object.entries(S.routes)){
  const target=path.join(output,url==='/'?'index.html':url.slice(1)+'index.html');
  fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,documentFor(key));
  const r=S.render(key);manifest.push({key,url,title:r.title,description:r.description,form:S.forms.includes(key),conversion:S.conversions.includes(key),faqCount:r.faqCount});
}
fs.writeFileSync(path.join(output,'404.html'),documentFor('404'));
fs.writeFileSync(path.join(output,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+manifest.filter(p=>!p.conversion).map(p=>`<url><loc>${C.origin+p.url}</loc></url>`).join('')+'</urlset>\n');
fs.writeFileSync(path.join(output,'robots.txt'),`User-agent: *\n${C.production?'Allow: /':'Disallow: /'}\nSitemap: ${C.origin}/sitemap.xml\n`);
fs.mkdirSync(path.join(output,'docs'),{recursive:true});
fs.writeFileSync(path.join(output,'docs/page-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Exported ${manifest.length} pages, 404, sitemap and manifest. Mode: ${C.production?'production':'review (noindex)'}.`);
