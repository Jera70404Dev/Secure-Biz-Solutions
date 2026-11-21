"""Resize generated originals for the site and write the review gallery."""
import html
import json
import shutil
import sys
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
catalog = root / 'docs/image-candidates.json'
data = json.loads(catalog.read_text(encoding='utf-8'))
jobs = json.load(sys.stdin)
assets = root / 'assets/images'
originals = assets / 'originals'
originals.mkdir(exist_ok=True)
images = {}
gallery = []
for item in data['images']:
    key = Path(item['slot']).stem
    source = jobs.get(key)
    original = originals / (key + '.png')
    if source and source.get('path'):
        shutil.copyfile(source['path'], original)
        item['prompt'] = source['prompt']
    if not original.exists():
        continue
    with Image.open(original) as image:
        image = ImageOps.exif_transpose(image).convert('RGB')
        for width, suffix in [(1600, ''), (800, '-800')]:
            out = ImageOps.fit(image, (width, width * 3 // 4), Image.Resampling.LANCZOS)
            out.save(assets / (key + suffix + '.webp'), quality=83, method=6)
    item.update(state='placed-in-review', alt=item['brief'], generator='OpenAI built-in image generation')
    images[key] = dict(src=f'assets/images/{key}.webp',small=f'assets/images/{key}-800.webp',alt=item['alt'],generated=True)
    gallery.append(f'<figure><img src="../{images[key]["small"]}" alt="{html.escape(item["alt"], quote=True)}"><figcaption><strong>{html.escape(key)}</strong><br>{html.escape(item["role"])}</figcaption></figure>')
data['status'] = 'placed-in-review' if len(images) == len(data['images']) else 'partial'
catalog.write_text(json.dumps(data, indent=2, ensure_ascii=False)+'\n',encoding='utf-8')
(root/'assets/js/generated-art.js').write_text('globalThis.SBS_CONFIG.images = Object.assign('+json.dumps(images,ensure_ascii=False,indent=2)+', globalThis.SBS_CONFIG.images);\n',encoding='utf-8')
(root/'docs/image-candidates.html').write_text('''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Imágenes para revisión · Secure Biz Solutions</title><style>body{font:16px system-ui;color:#333;margin:40px auto;max-width:1200px;padding:0 20px}h1,strong{color:#86004d}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:20px}figure{margin:0;border:1px solid #e8e6ec;border-radius:12px;overflow:hidden}img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}figcaption{padding:12px}</style><h1>Imágenes para revisión</h1><p>Escenas ilustrativas generadas con IA, sin representación de clientes o empleados reales.</p><main>'''+''.join(gallery)+'</main>',encoding='utf-8')
print(f'Prepared {len(images)} of {len(data["images"])} photos.')
