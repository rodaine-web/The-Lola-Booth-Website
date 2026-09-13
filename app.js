(() => {
  "use strict";
  const API_BASE = String(window.LOLA_API_BASE || (window.LOLA_CONFIG && window.LOLA_CONFIG.apiBase) || "https://api.thelolabooth.com").replace(/\/$/, "");
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const apiAsset=(p)=>!p?null:(/^https?:\/\//i.test(p)?p:(p.startsWith("/api/")?API_BASE+p:p));
  const money=(v,c="USD")=>{ if(v==null||v==="") return ""; if(String(v).toLowerCase().includes("request")) return String(v); const n=Number(v); return Number.isFinite(n)?new Intl.NumberFormat("en-US",{style:"currency",currency:c,maximumFractionDigits:n%1?2:0}).format(n):String(v); };
  const esc=(s)=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  async function get(path){ const r=await fetch(API_BASE+path,{headers:{Accept:"application/json"}}); if(!r.ok) throw new Error(`${r.status}`); return r.json(); }

  // Mobile menu
  const menuBtn=qs('.menu-btn'), menu=qs('.mobile-menu');
  if(menuBtn&&menu) menuBtn.addEventListener('click',()=>menu.classList.toggle('open'));

  // Existing/fallback hero slideshow
  let heroTimer;
  function initHero(){
    const slides=qsa('.hero-slide'), dots=qsa('.dot'); let i=0;
    if(heroTimer) clearInterval(heroTimer);
    function show(n){ if(!slides.length)return; slides.forEach((s,k)=>s.classList.toggle('active',k===n)); dots.forEach((d,k)=>d.classList.toggle('active',k===n)); i=n; }
    dots.forEach((d,k)=>d.onclick=()=>{clearInterval(heroTimer);show(k);start();});
    function start(){ if(slides.length>1) heroTimer=setInterval(()=>show((i+1)%slides.length),5200); }
    show(0); start();
  }
  initHero();

  const featuredExperienceOrder=['glam','360','vogue','audio'];
  const featuredExperienceImages={glam:'assets/glam.jpg',360:'assets/booth360.jpg',vogue:'assets/vogue.jpg',audio:'assets/audio.jpg'};
  const featuredExperienceNames={glam:'Lola Glam',360:'Lola 360',vogue:'Lola Vogue',audio:'Lola Audio Guestbook'};
  function experienceIdentity(item){ const name=typeof item==='string'?item:(item?.website_name||item?.name||''); const n=String(name||'').toLowerCase(); if(n.includes('glam'))return 'glam'; if(n.includes('360'))return '360'; if(n.includes('vogue'))return 'vogue'; if(n.includes('audio'))return 'audio'; return ''; }
  function localExperienceImage(name){ const id=experienceIdentity(name); if(id)return featuredExperienceImages[id]; const n=(name||'').toLowerCase(); if(n.includes('digital'))return 'assets/camera-roll.jpg'; if(n.includes('corporate')||n.includes('brand'))return 'assets/corporate.jpg'; return 'assets/private.jpg'; }
  function displayExperienceName(item){ const id=experienceIdentity(item); return featuredExperienceNames[id]||item.website_name||item.name; }
  function displayExperienceImage(item){ const id=experienceIdentity(item); return id?featuredExperienceImages[id]:(apiAsset(item.image)||localExperienceImage(item.name||item.website_name)); }
  function featuredFirst(items,{excludeCorporate=false,limit}={}){ const featured=[], other=[]; for(const item of items){ const id=experienceIdentity(item); if(id&&!featured.some(x=>experienceIdentity(x)===id))featured.push(item); else if(!(excludeCorporate&&String(item.name).toLowerCase().includes('corporate')))other.push(item); } const ordered=[...featured.sort((a,b)=>featuredExperienceOrder.indexOf(experienceIdentity(a))-featuredExperienceOrder.indexOf(experienceIdentity(b))),...other]; return limit?ordered.slice(0,limit):ordered; }
  function localEventImage(name){ const n=(name||'').toLowerCase(); if(n.includes('wedding'))return 'assets/wedding.jpg'; if(n.includes('birthday'))return 'assets/birthday.jpg'; if(n.includes('corporate')||n.includes('brand'))return 'assets/corporate.jpg'; if(n.includes('shower'))return 'assets/shower.jpg'; if(n.includes('graduat'))return 'assets/graduation.jpg'; return 'assets/private.jpg'; }
  const packageFallbacks={
    'THE ESSENTIAL':{sub:'Perfect for intimate events.',features:['2 hours of booth time','Unlimited prints on site','Digital gallery within 48 hours','One curated backdrop','On-site attendant']},
    'THE SIGNATURE':{sub:'Our most booked package.',features:['3 hours of booth time','Glam or Vogue photo finish','GIFs, boomerangs and instant sharing','Custom print design','Props styled to your event','On-site attendant']},
    'THE LUXE':{sub:'For elevated celebrations.',features:['4 hours of booth time','360 booth plus photo booth','Premium backdrop styling','Branded overlays and prints','Two attendants','Same-night highlight reel']},
    'CUSTOM':{sub:'Multi-day, multi-booth or brand activations.',features:['Any combination of experiences','Multi-day and multi-city coverage','Brand activations and press walls','Custom software and data capture']}
  };

  function setSiteSettings(settings){
    if(!settings)return;
    const email=settings.contact_email;
    const phone=String(settings.phone||'');
    const serviceArea=String(settings.service_area||'');
    const isSeedPhone=/555|010-LOLA/i.test(phone);
    const isSeedService=/Dallas-Fort Worth/i.test(serviceArea);
    qsa('[data-site-email]').forEach(a=>{if(email){a.textContent=email;a.href=`mailto:${email}`;}});
    qsa('[data-site-phone]').forEach(n=>{ if(phone&&!isSeedPhone){ n.textContent=`Phone: ${phone}`; n.classList.remove('footer-placeholder'); } });
    qsa('[data-site-service-area]').forEach(n=>{ if(serviceArea&&!isSeedService){ n.textContent=`Service area: ${serviceArea}`; n.classList.remove('footer-placeholder'); } });
    qsa('[data-brand-line]').forEach(n=>{if(settings.brand_line)n.textContent=settings.brand_line;});
    qsa('[data-site-copyright]').forEach(n=>{ n.textContent=settings.copyright_text||`© ${new Date().getFullYear()} ${settings.business_name||'The LOLA Booth'}. All rights reserved.`; });
    qsa('[data-site-socials]').forEach(el=>{
      const links=[['Instagram',settings.instagram_url],['TikTok',settings.tiktok_url],['Facebook',settings.facebook_url],['Pinterest',settings.pinterest_url]].filter(x=>x[1]);
      if(links.length) el.innerHTML=links.map(([label,url])=>`<a href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`).join(' · ');
    });
    if(settings.site_title) document.title=settings.site_title;
    if(settings.default_meta_description){ const m=qs('meta[name="description"]'); if(m)m.content=settings.default_meta_description; }
  }

  function renderHero(home){
    if(!qs('[data-cms-homepage]')) return;
    const def=home.defaults?.homepage?.hero||{}, content=home.content||{};
    const heroContent=content.hero||content.HERO||{};
    const headline=heroContent.headline||def.headline;
    const sub=heroContent.subheadline||heroContent.supporting_text;
    const h=qs('.hero-copy h1'); if(h&&headline) h.innerHTML=esc(headline).replace(/\n/g,'<br>');
    const p=qs('.hero-copy p:not(.eyebrow)'); if(p&&sub) p.textContent=sub;
    const primary=qs('.hero-actions .btn.dark'); if(primary){ if(heroContent.primary_cta_label||def.primaryCtaLabel)primary.textContent=(heroContent.primary_cta_label||def.primaryCtaLabel)+' →'; primary.href=heroContent.primary_cta_url||def.primaryCtaUrl||'availability.html'; }
    const banner=home.defaults?.homepage?.banner;
    if(Array.isArray(banner)&&banner.length){
      const track=qs('.marquee-track'); if(track){ const line=banner.map(x=>`${esc(x)} <i class="sep">✦</i>`).join(' '); track.innerHTML=`<span>${line}</span><span>${line}</span>`; }
    }
    const realSlides=(home.heroSlides||[]).filter(s=>!s.fallback&&s.image);
    if(realSlides.length){
      const media=qs('.hero-media'); if(media){
        qsa('.hero-slide,.hero-dots',media).forEach(x=>x.remove());
        realSlides.sort((a,b)=>(a.display_order||0)-(b.display_order||0)).forEach((s,idx)=>{
          const d=document.createElement('div'); d.className='hero-slide'+(idx===0?' active':''); d.style.backgroundImage=`url("${apiAsset(s.image)}")`; if(s.focal_point)d.style.backgroundPosition=`${s.focal_point.x||50}% ${s.focal_point.y||50}%`; d.setAttribute('role','img'); d.setAttribute('aria-label',s.alt_text||'LOLA event'); media.prepend(d);
        });
        const dots=document.createElement('div'); dots.className='hero-dots'; dots.innerHTML=realSlides.map((_,i)=>`<button class="dot${i===0?' active':''}" aria-label="Slide ${i+1}"></button>`).join(''); media.append(dots); initHero();
      }
    }
  }

  function fillSelects(experiences,packages,eventTypes){
    qsa('[data-experience-select]').forEach(sel=>{ const current=sel.value; sel.innerHTML='<option value="">Not sure yet</option>'+experiences.map(x=>`<option value="${esc(x.id)}">${esc(x.website_name||x.name)}</option>`).join(''); sel.value=current; });
    qsa('[data-package-select]').forEach(sel=>{ const current=sel.value; sel.innerHTML='<option value="">Not sure yet</option>'+packages.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join(''); sel.value=current; });
    if(eventTypes?.length) qsa('[data-event-type-select]').forEach(sel=>{ sel.innerHTML='<option value="">Select event type</option>'+eventTypes.map(x=>`<option value="${esc(x.name)}">${esc(x.name)}</option>`).join('')+'<option value="Other">Other</option>'; });
  }

  function renderExperiences(items){
    if(!items?.length)return;
    const home=qs('[data-cms-experiences="home"]');
    if(home){ const selected=featuredFirst(items,{excludeCorporate:true,limit:4}); home.innerHTML=selected.map(x=>{const name=displayExperienceName(x); return `<article class="card"><img src="${esc(displayExperienceImage(x))}" alt="${esc(name)}"><div class="card-body"><span class="arrow">→</span><h3>${esc(name)}</h3><p>${esc(x.public_description||x.website_short_description||x.description||'')}</p></div></article>`;}).join(''); }
    const page=qs('[data-cms-experiences="page"]');
    if(page){ page.innerHTML=featuredFirst(items).map((x,i)=>{const name=displayExperienceName(x); return `<div class="split" style="margin-bottom:60px"><div${i%2?' style="order:2"':''}><p class="eyebrow">${esc(name)}</p><h2 class="display" style="font-size:3rem">${esc(x.website_short_description||x.public_description||x.description||'Your LOLA moment.')}</h2>${x.website_long_description?`<p class="muted">${esc(x.website_long_description)}</p>`:''}${x.features?.length?`<ul>${x.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>`:''}<a class="btn dark" href="availability.html">Ask About ${esc(name)}</a></div><img src="${esc(displayExperienceImage(x))}" alt="${esc(name)}"></div>`;}).join(''); }
  }

  function renderPackages(items,showPrice=true){
    if(!items?.length)return;
    const sort=[...items].sort((a,b)=>(a.website_display_order||0)-(b.website_display_order||0));
    const home=qs('[data-cms-packages="home"]');
    if(home){ home.innerHTML=sort.slice(0,4).map(x=>{const f=packageFallbacks[String(x.name).toUpperCase()]||{}; const custom=String(x.name).toUpperCase()==='CUSTOM'; const formatted=money(x.display_price||x.starting_price,x.currency); const dp=custom?'Custom Pricing':(!showPrice?'Request Pricing':(x.display_price==='Request Pricing'?'Request Pricing':`Starting at ${formatted || 'Custom Pricing'}`)); return `<div class="card package${x.most_popular?' featured':''}">${x.most_popular?'<p class="eyebrow">Most Popular</p>':''}<h3>${esc(titleCase(x.name))}</h3><p class="muted">${esc(x.website_short_description||x.short_description||f.sub||'A LOLA experience tailored to your event.')}</p><div class="price">${esc(dp)}</div></div>`;}).join(''); }
    const page=qs('[data-cms-packages="page"]');
    if(page){ page.innerHTML=sort.map(x=>{const f=packageFallbacks[String(x.name).toUpperCase()]||{}; const custom=String(x.name).toUpperCase()==='CUSTOM'; const formatted=money(x.display_price||x.starting_price,x.currency); const price=custom?'Custom Pricing':(!showPrice?'Request Pricing':(x.display_price==='Request Pricing'?'Request Pricing':formatted || 'Custom Pricing')); return `<article class="pricing-card${x.most_popular?' featured':''}">${x.most_popular?'<div class="pricing-badge">Most Popular</div>':''}<h3>${esc(titleCase(x.name))}</h3><p class="sub">${esc(x.website_short_description||x.short_description||f.sub||'Tailored for your celebration.')}</p>${custom?'<div class="starting">Have something different in mind?</div><div class="big-copy">Let’s Create<br>Together</div>':`<div class="starting">${showPrice?'Starting at':'Pricing'}</div><div class="price">${esc(price)}</div>`}<hr><ul>${(f.features||[]).map(y=>`<li>${esc(y)}</li>`).join('')}</ul><a class="btn ${x.most_popular?'dark':'light'}" href="availability.html">Book Now →</a></article>`;}).join(''); }
  }
  function titleCase(s){return String(s||'').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()).replace('Lola','LOLA');}

  function renderEvents(items){
    if(!items?.length)return;
    for(const grid of qsa('[data-cms-events]')) grid.innerHTML=items.map(x=>`<a class="event-card" href="availability.html"><img src="${esc(apiAsset(x.image)||localEventImage(x.name))}" alt="${esc(x.name)}"><div class="label"><h3>${esc(x.name)}</h3><p>${esc(x.short_description||'Make it memorable with LOLA.')}</p></div></a>`).join('');
  }
  function renderGallery(items){ const grid=qs('[data-cms-gallery]'); if(!grid||!items?.length)return; grid.innerHTML=items.map(x=>`<img src="${esc(apiAsset(x.thumbnail||x.image))}" data-full="${esc(apiAsset(x.image)||'')}" alt="${esc(x.alt_text||x.caption||'LOLA event moment')}" loading="lazy">`).join(''); }
  function renderTestimonials(items){ const grid=qs('[data-cms-testimonials]'); if(!grid)return; const section=grid.closest('[data-cms-testimonial-section]'); if(!items?.length){ if(section)section.hidden=true; grid.innerHTML=''; return; } if(section)section.hidden=false; grid.innerHTML=items.slice(0,6).map(x=>`<div class="card testimonial"><p class="quote">“${esc(x.quote)}”</p><p class="muted">— ${esc(x.client_display_name||'LOLA client')}${x.event_type?`, ${esc(x.event_type)}`:''}</p></div>`).join(''); }
  function renderFaqs(items){ const box=qs('[data-cms-faqs]'); if(!box||!items?.length)return; box.innerHTML=items.map(x=>`<details><summary>${esc(x.question)}</summary><p class="muted">${esc(x.answer)}</p></details>`).join(''); }

  function friendlyInquiryError(status,data){
    const code=data.error?.code;
    if(status===400&&code==='SPAM_DETECTED')return 'We could not send that message. Please refresh the page and try again.';
    if(status===400)return 'Please check the highlighted details and try again.';
    if(status===403||code==='CORS_REJECTED')return 'This booking form is not enabled for this website yet. Please email hello@thelolabooth.com.';
    if(status===429)return 'Too many requests came through at once. Please wait a minute and try again.';
    if(status>=500)return 'LOLA could not receive your inquiry right now. Please email hello@thelolabooth.com.';
    return data.error?.message||'We could not send your inquiry right now. Please try again.';
  }

  function captureAttribution(){ const p=new URLSearchParams(location.search); const fields=['utm_source','utm_medium','utm_campaign','utm_content','utm_term']; fields.forEach(k=>{const v=p.get(k); if(v)sessionStorage.setItem(`lola_${k}`,v)}); if(!sessionStorage.getItem('lola_landing_page_url'))sessionStorage.setItem('lola_landing_page_url',location.href); if(document.referrer&&!sessionStorage.getItem('lola_referrer_url'))sessionStorage.setItem('lola_referrer_url',document.referrer); }
  captureAttribution();

  function formPayload(form){ const fd=new FormData(form), obj={}; for(const [k,v] of fd.entries()){ if(k==='marketing_email_opt_in')continue; if(v!==''&&v!=null)obj[k]=v; } obj.marketing_email_opt_in=!!form.querySelector('[name="marketing_email_opt_in"]:checked'); ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(k=>{const v=sessionStorage.getItem(`lola_${k}`);if(v)obj[k]=v}); obj.landing_page_url=sessionStorage.getItem('lola_landing_page_url')||location.href; obj.referrer_url=sessionStorage.getItem('lola_referrer_url')||document.referrer||''; if(obj.guestCount)obj.guestCount=Number(obj.guestCount); obj.website=''; return obj; }
  function showFieldErrors(form,errors){ qsa('.field-error',form).forEach(e=>e.remove()); qsa('[aria-invalid="true"]',form).forEach(e=>e.removeAttribute('aria-invalid')); Object.entries(errors||{}).forEach(([name,msgs])=>{const f=form.elements[name]; if(f){f.setAttribute('aria-invalid','true'); const e=document.createElement('div'); e.className='field-error'; e.textContent=(msgs||[])[0]||'Please check this field.'; f.insertAdjacentElement('afterend',e);}}); }
  qsa('form[data-lola-inquiry]').forEach(form=>form.addEventListener('submit',async e=>{
    e.preventDefault(); const status=qs('[data-form-status]',form); showFieldErrors(form,{});
    if(!form.reportValidity())return;
    const btn=qs('button[type="submit"]',form), original=btn?.textContent; if(btn){btn.disabled=true;btn.textContent='Sending…'}; if(status){status.className='form-status';status.textContent='';}
    try{ const r=await fetch(API_BASE+'/api/public/inquiries',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(formPayload(form))}); const data=await r.json().catch(()=>({})); if(!r.ok){if(r.status===400&&data.error?.details?.fieldErrors)showFieldErrors(form,data.error.details.fieldErrors); throw new Error(friendlyInquiryError(r.status,data));} if(status){status.className='form-status success';status.textContent=(data.code==='POSSIBLE_DUPLICATE')?'Thanks, we already have a recent inquiry from you. The LOLA team will follow up soon.':(data.message||'Thank you. Your inquiry was received and the LOLA team will be in touch soon.');} form.reset(); status?.scrollIntoView({behavior:'smooth',block:'nearest'});
    }catch(err){if(status){status.className='form-status error';status.textContent=err.message||'We couldn’t send your inquiry right now. Please try again.';}}
    finally{if(btn){btn.disabled=false;btn.textContent=original;}}
  }));

  async function load(){
    try{
      const site=await get('/api/public/site');
      setSiteSettings(site.settings);
      renderHero(site);
      renderExperiences(site.experiences||[]);
      renderPackages(site.packages||[],site.settings?.show_starting_price!==false);
      renderEvents(site.eventTypes||[]);
      renderGallery(site.gallery||[]);
      renderTestimonials(site.testimonials||[]);
      renderFaqs(site.faqs||[]);
      fillSelects(site.experiences||[],site.packages||[],site.eventTypes||[]);
      document.documentElement.dataset.lolaCms='connected';
    } catch(e){ console.warn('LOLA CMS unavailable; static website fallbacks remain active.',e); document.documentElement.dataset.lolaCms='fallback';
      // even without API, keep existing event options and inject static experience/package options with no UUIDs omitted at submit
    }
  }
  load();
})();
