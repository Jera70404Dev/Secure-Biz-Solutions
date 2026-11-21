(function(g){
  'use strict';
  // One lifecycle per route: observers, frames and listeners leave with the page.
  g.SBS_MOTION={mount(root){
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    let dispose=()=>{};
    function start(){
      dispose();
      if(preference.matches||!('IntersectionObserver' in g))return;
      const removers=[],animations=new Set(),frames=new Set(),typed=[];
      const frame=fn=>{const id=requestAnimationFrame(t=>{frames.delete(id);fn(t)});frames.add(id);return id};
      const listen=(target,event,fn,options)=>{target.addEventListener(event,fn,options);removers.push(()=>target.removeEventListener(event,fn,options))};
      function animate(el,keys,options){
        if(!el.animate)return;
        const a=el.animate(keys,options);animations.add(a);
        a.finished.then(()=>animations.delete(a),()=>animations.delete(a));
      }
      function type(heading){
        if(heading.children.length)return;
        const text=heading.textContent,label=heading.getAttribute('aria-label');
        heading.setAttribute('aria-label',text);heading.classList.add('is-typing');
        // Normal inline characters preserve wrapping and the complete heading's height.
        const chars=Array.from(text,c=>{const span=document.createElement('span');span.textContent=c;span.setAttribute('aria-hidden','true');span.className='type-char';return span});
        heading.replaceChildren(...chars);typed.push(()=>{heading.textContent=text;heading.classList.remove('is-typing');if(label===null)heading.removeAttribute('aria-label');else heading.setAttribute('aria-label',label)});
        let began,last=0;const duration=Math.min(1500,Math.max(650,chars.length*20));
        function tick(now){
          began??=now;const count=Math.min(chars.length,Math.floor((now-began)/duration*chars.length)+1);
          for(;last<count;last++)chars[last].classList.add('is-written');
          if(last<chars.length)frame(tick);else heading.classList.remove('is-typing');
        }
        frame(tick);
      }
      const headings=new Set(root.querySelectorAll('.hero:not(.legal-hero) h1,.final h2,.fs h2'));
      const targets=root.querySelectorAll('main h1,main h2,main h3,main p,main .card,main .indcard,main .photo,main .video-frame,main .picker,main .actions,main .chip,main .q,main .stat,main .step,main .fssteps li,main .checks li,main .why>div,main .btn,main .pill,main .kick,main .tbl,main .calendar-pending,footer .ftop,footer .fcols>div,footer .find,footer .legal');
      const observed=new Set();
      const io=new IntersectionObserver(entries=>{
        const batch=entries.filter(e=>e.isIntersecting);
        batch.forEach((entry,i)=>{
          const el=entry.target;io.unobserve(el);observed.delete(el);
          animate(el,[{opacity:0,transform:'translateY(38px) scale(.975)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:780,delay:Math.min(i%7*65,325),easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
          if(headings.has(el))type(el);
        });
      },{threshold:.06});
      targets.forEach(el=>{
        // Animate a card or grouped control as a unit, avoiding compounded transforms.
        if(el.parentElement.closest('.card,.indcard,.picker,.stat,.step,.fssteps li,.why>div,.calendar-pending'))return;
        observed.add(el);io.observe(el);
      });
      // Hidden funded stories enter when expanded, rather than animating while hidden.
      const mutations=new MutationObserver(()=>targets.forEach(el=>{if(observed.has(el)&&el.getClientRects().length)io.observe(el)}));
      const funded=root.querySelector('#fundedGrid');if(funded)mutations.observe(funded,{attributes:true,attributeFilter:['class']});
      const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');root.append(progress);
      let scrollPending=false;
      function scroll(){if(scrollPending)return;scrollPending=true;frame(()=>{scrollPending=false;const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`})}
      listen(g,'scroll',scroll,{passive:true});listen(g,'resize',scroll);scroll();
      root.querySelectorAll('.hero:not(.legal-hero),.final').forEach(host=>particles(host));
      function particles(host){
        const canvas=document.createElement('canvas');canvas.className='brand-particles';canvas.setAttribute('aria-hidden','true');host.classList.add('particle-host');host.prepend(canvas);
        const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return}
        let w=0,h=0,visible=false,running=false,previous=0,pointer=null,nodes=[];
        function resize(){const rect=host.getBoundingClientRect();w=rect.width;h=rect.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);nodes=Array.from({length:w<760?18:34},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.28,vy:(Math.random()-.5)*.28,r:Math.random()*1.7+1}));}
        const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(host);
        function wake(){if(!running&&visible&&!document.hidden){running=true;previous=0;frame(draw)}}
        const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;wake()});visibility.observe(host);
        listen(document,'visibilitychange',wake);
        listen(host,'pointermove',e=>{if(e.pointerType==='touch')return;const rect=host.getBoundingClientRect();pointer={x:e.clientX-rect.left,y:e.clientY-rect.top}},{passive:true});
        listen(host,'pointerleave',()=>{pointer=null});
        function draw(now){
          if(!visible||document.hidden){running=false;return}
          if(previous&&now-previous<32){frame(draw);return}
          const dt=previous?Math.min((now-previous)/16.67,3):1;previous=now;ctx.clearRect(0,0,w,h);
          nodes.forEach((p,i)=>{
            p.x+=p.vx*dt;p.y+=p.vy*dt;
            if(pointer){const dx=p.x-pointer.x,dy=p.y-pointer.y,d=Math.hypot(dx,dy);if(d>0&&d<110){p.x+=dx/d*.65*dt;p.y+=dy/d*.65*dt}}
            if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;
            ctx.fillStyle=i%4===0?'rgba(134,0,77,.32)':'rgba(15,110,110,.36)';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
            for(let j=i+1;j<nodes.length;j++){const q=nodes[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<135){ctx.strokeStyle=`rgba(15,110,110,${(1-d/135)*.14})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}}
          });frame(draw);
        }
        removers.push(()=>{sizeObserver.disconnect();visibility.disconnect();canvas.remove();host.classList.remove('particle-host')});
      }
      dispose=()=>{io.disconnect();mutations.disconnect();animations.forEach(a=>a.cancel());frames.forEach(cancelAnimationFrame);removers.forEach(fn=>fn());typed.forEach(fn=>fn());progress.remove()};
    }
    start();preference.addEventListener('change',start);
    return ()=>{preference.removeEventListener('change',start);dispose()};
  }};
})(globalThis);
