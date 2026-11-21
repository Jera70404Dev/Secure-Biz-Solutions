"""One-time content import from the supplied reference; not needed to run/build the site."""
from pathlib import Path
import re

s = Path('ordenes/v1.0/Secure Biz Solutions - Clickable Mockup.html').read_text(encoding='cp1252')

def clean(t):
    t = re.sub(r'(?<=[0-9KM])\?(?=[$0-9])', '–', t)
    t = t.replace('Mon?Fri', 'Mon–Fri').replace(' ?</a>', ' →</a>')
    for label in ['Learn more', 'How it works', 'Program', 'Get Funded']:
        t = t.replace(label + ' ?', label + ' →')
    return t.replace('�', '·')

data = s[s.index('const P={'):s.index('/* ---------- routes')]
data = data.replace("const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');", "const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;');")
for name in ['WHY','FS_STEPS','FS_FAQ','CMP_ROWS']:
    data += '\n' + re.search(r'^const '+name+r'=.*$', s, re.M).group(0)
data = clean(data) + '\n[FS_FAQ[4],FS_FAQ[5]]=[FS_FAQ[5],FS_FAQ[4]];\n'
Path('assets/js/content.js').write_text('(function(g){\n"use strict";\n'+data+'\ng.SBS_CONTENT={P,I,esc,PRODUCTS,PBY,WH,INDUSTRIES,IBY,HOME_FAQ,MERCH_FAQ,HR_FAQ,BROKER,CONSENT,FOOT_IND,WHY,FS_STEPS,FS_FAQ,CMP_ROWS};\n})(globalThis);\n', encoding='utf-8')

shared = s[s.index('const sec='):s.index('/* ---------- header / footer')]
shared = re.sub(r'^const (photo|video|faqList)=.*\n', '', shared, flags=re.M)
shared = re.sub(r'^const WHY=.*\n', '', shared, flags=re.M)
core = s[s.index('PAGES.home='):s.index('const legalPage=')]
core = re.sub(r'^const CMP_ROWS=.*\n', '', core, flags=re.M)
core = re.sub(r'<form class="form" id="mform".*?</form>', "${embed('merchant')}", core, flags=re.S)
core = re.sub(r'<form class="form" id="cform".*?</form>', "${embed('contact')}", core, flags=re.S)
core = core.replace('href="javascript:void 0" data-scroll="upload"', 'href="#upload" data-scroll="upload"')
core = core.replace('<strong style="color:var(--plum);font-size:20px">${PHONE}</strong>', '${phone()}')
core = core.replace('href="${L(\'get-funded\')}" data-amt="${v}"', 'href="${L(\'get-funded\')}?howMuch=${encodeURIComponent(t)}"')
core = core.replace("'HERO BANNER ? Secure Biz supplies'", "'hero-home.jpg'")
start = core.index('[["$45K", "Tampa bakery"')
end = core.index('].map(([a,h,m,t],i)', start)+1
stories = '''[["$45K","Tampa bakery","Merchant Cash Advance · Funded in 2 days","New ovens before the holiday rush."],["$120K","Sarasota tire shop","Equipment Financing · Funded in 4 days","Two new lifts and an alignment machine."],["$350K","Orlando trucking company","Term Loan · Funded in 6 days","Three trucks added to the fleet."],["$1.2M","Fort Myers dental practice","SBA Loan · Funded in 45 days","A second office location."],["$75K","St. Petersburg restaurant","Line of Credit · Funded in 3 days","A safety net for slow summer months."],["$180K","Bradenton landscaping company","Home Equity Line of Credit · Funded in 10 days","A new crew truck and equipment yard."]]'''
core = core[:start]+stories+core[end:]
core = core.replace('<p class="small" style="margin-top:10px">Prototype note: qualification figures on this page are pending confirmation from the lending partner. No interest rates appear anywhere on this page.</p>', '')
a = core.index(' +(p.disclosure?')
b = core.index('\n}\nPRODUCTS', a)
core = core[:a]+''' +finalBand()
 +(p.disclosure?`<section class="disclosure-section"><div class="wrap"><div class="disc">${esc(p.disclosure)}</div></div></section>`:'');'''+core[b:]
core = core.replace("PAGES.about=()=>heroTwo('Hero ? white, two columns',{h1:", "PAGES.about=()=>heroTwo('Hero ? white, two columns',{btn:'<span></span>',h1:")
fs = s[s.index('const fsBand='):s.index("PAGES['thank-you-fresh-start']=")]
fs = re.sub(r'^const FS_FAQ=.*\n', '', fs, flags=re.M)
fs = fs.replace("${booking('free 20-minute call with a funding specialist')}", "${booking('freshStart')}")
fs = fs.replace(' +finalBand();', ''' +sec('Fresh Start call to action','white',`<div class="final blk"><h2>Talk to a Funding Specialist</h2><p>Pick a time that works for you. It's free.</p><a class="btn" href="#fsbook" data-scroll="fsbook">Book a Free Call</a></div>`);''')
Path('assets/js/page-sections.js').write_text('''(function(g){
"use strict";
g.SBS_SECTIONS=function(api){
const {I,esc,PRODUCTS,PBY,WH,INDUSTRIES,HOME_FAQ,MERCH_FAQ,HR_FAQ,WHY,FS_STEPS,FS_FAQ,CMP_ROWS}=g.SBS_CONTENT;
const {L,photo,video,faqList,embed,booking,phone}=api;
const note=()=>"";
'''+clean(shared)+'\nconst PAGES={};\n'+clean(core)+'\n'+clean(fs)+'\nreturn {PAGES,finalBand,heroCenter,sec};\n};\n})(globalThis);\n', encoding='utf-8')
css = re.findall(r'<style>(.*?)</style>', s, re.S)[1]
css = re.sub(r'/\* prototype chrome \*/.*?/\* header \*/', '/* header */', css, flags=re.S)
Path('assets/css/base.css').write_text(css, encoding='utf-8')
print('Imported full reference content and section layouts.')
