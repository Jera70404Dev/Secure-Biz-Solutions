// Package only public files; GitHub Pages does not enforce Apache .htaccess rules.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'dist');
const site=new URL(process.env.SBS_SITE_URL||'https://jera70404dev.github.io/Secure-Biz-Solutions/');
if(site.protocol!=='https:')throw new Error('SBS_SITE_URL must use HTTPS.');
const basePath=site.pathname.replace(/\/$/,'');
const origin=site.origin+basePath;
// This fixed, generated directory is the only location that gets replaced.
if(path.dirname(output)!==root||path.basename(output)!=='dist')throw new Error('Invalid output directory');
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
fs.cpSync(path.join(root,'assets'),path.join(output,'assets'),{
  recursive:true,
  filter:source=>source!==path.join(root,'assets/images/originals')&&!source.endsWith('.zip')
});
execFileSync(process.execPath,[path.join(root,'scripts/build.mjs')],{
  env:{...process.env,SBS_OUTPUT_DIR:output,SBS_SITE_URL:site.href},stdio:'inherit'
});
fs.appendFileSync(path.join(output,'assets/js/config.js'),
  '\nObject.assign(globalThis.SBS_CONFIG,'+JSON.stringify({origin,basePath})+');\n');
// The route manifest is for maintainers, not visitors.
fs.unlinkSync(path.join(output,'docs/page-manifest.json'));
fs.rmdirSync(path.join(output,'docs'));
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('GitHub Pages package ready: '+site.href);

