(() => {
  "use strict";
  const API_BASE = String(window.LOLA_CONFIG?.apiBase || "").replace(/\/$/, "");
  const stagingApiReady = (() => { try { const u=new URL(API_BASE); return u.protocol==='https:' && (window.LOLA_CONFIG?.environment==='production' || !['api.thelolabooth.com','admin.thelolabooth.com','thelolabooth.com','www.thelolabooth.com'].includes(u.hostname)); } catch { return false; } })();
  const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const apiAsset=(p)=>{
    if(!p)return null;
    const url=new URL(p,API_BASE||location.origin);
    const match=url.pathname.match(/^\/api\/public\/media\/([0-9a-f-]{36})$/i);
    if(match&&url.origin===new URL(API_BASE||location.origin).origin){const width=innerWidth<=600?960:1600;return `/api/media/${match[1]}?w=${width}`;}
    return /^https?:\/\//i.test(p)?p:(p.startsWith('/api/')?API_BASE+p:p);
  };
  const money=(v,c="USD")=>{ if(v==null||v==="") return ""; if(String(v).toLowerCase().includes("request")) return String(v); const n=Number(v); return Number.isFinite(n)?new Intl.NumberFormat("en-US",{style:"currency",currency:c,maximumFractionDigits:n%1?2:0}).format(n):String(v); };
  const esc=(s)=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  async function get(path){ const r=await fetch(API_BASE+path,{cache:"no-cache",headers:{Accept:"application/json"}}); if(!r.ok) throw new Error(`${r.status}`); return r.json(); }

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

  function experienceIdentity(item){ return ['glam','360','vogue','audio'].find(k=>String(item.website_name||item.name||item.slug||'').toLowerCase().includes(k))||''; }
  function safeUrl(value){ try{const u=new URL(value,location.href);return ['https:','http:','mailto:','tel:'].includes(u.protocol)?value:null;}catch{return null;} }
  function safeCopy(value){
    const t=document.createElement('template');t.innerHTML=String(value||'');
    const allowed=new Set(['BR','STRONG','EM','B','I','SPAN','SMALL']);
    for(const n of [...t.content.querySelectorAll('*')]){
      if(!allowed.has(n.tagName)){n.replaceWith(document.createTextNode(n.textContent));continue;}
      for(const attr of [...n.attributes])if(attr.name!=='class')n.removeAttribute(attr.name);
    }
    return t.innerHTML;
  }
  const setText=(root,selector,value)=>{const n=qs(selector,root);if(n&&value!=null)n.textContent=value;};
  function setSiteSettings(settings){
    if(!settings)return;
    window.LOLA_SITE_SETTINGS=settings;
    qsa('a[href^="mailto:"],[data-site-email]').forEach(a=>{if(settings.contact_email){if(!a.querySelector('svg'))a.textContent=settings.contact_email;a.href='mailto:'+settings.contact_email;}});
    qsa('a[href^="tel:"],[data-site-phone]').forEach(node=>{const a=node.tagName==='A'?node:qs('a[href^="tel:"]',node)||node;if(settings.phone){if(!a.querySelector('svg'))a.textContent=settings.phone;if(a.tagName==='A')a.href='tel:+'+settings.phone.replace(/[^0-9]/g,'').replace(/^(?=\d{10}$)/,'1');}});
    qsa('[data-brand-line]').forEach(n=>{if(settings.brand_line)n.textContent=settings.brand_line;});
    qsa('[data-site-service-area]').forEach(n=>{if(settings.service_area)n.textContent='Service area: '+settings.service_area;});
    for(const [name,key] of [['instagram','instagram_url'],['tiktok','tiktok_url']])qsa(`a[href*="${name}.com"]`).forEach(a=>{const url=safeUrl(settings[key]);if(url)a.href=url;});
    qsa('[data-site-copyright]').forEach(n=>{if(settings.copyright_text)n.textContent=settings.copyright_text;});
  }
  function renderPageContent(site){
    const slug=location.pathname.split('/').filter(Boolean).pop()?.replace(/\.html$/,'')||'home';
    const page=site.content?.['page.'+(slug==='index'?'home':slug)]?.body;
    if(page){
      qsa('[data-cms-copy]').forEach(n=>{const copy=page.copy?.[n.dataset.cmsCopy];if(!copy)return;n.innerHTML=safeCopy(copy.html);if(copy.href&&n.tagName==='A'&&safeUrl(copy.href))n.href=copy.href;});
      if(page.title)document.title=page.title;
      for(const [key,value] of Object.entries(page.seo||{})){
        if(key==='canonical'){const n=qs('link[rel="canonical"]');if(n&&safeUrl(value))n.href=value;continue;}
        const n=qsa('meta[name],meta[property]').find(n=>n.name===key||n.getAttribute('property')===key);if(n)n.content=value;
      }
    }
    const media=site.content?.['website.media']?.body||{};
    qsa('[data-cms-media]').forEach(n=>{const src=media[n.dataset.cmsMedia];if(src&&safeUrl(apiAsset(src)))n.src=apiAsset(src);});
  }
  function renderHero(home){
    if(!qs('[data-cms-homepage]'))return;
    const c=home.content?.['homepage.hero']?.body;
    if(c){setText(document,'.hero-copy h1',c.headline);setText(document,'.hero-copy p:not(.eyebrow)',c.subheadline);const a=qs('.hero-actions .btn.dark');if(a){if(c.primaryCtaLabel)a.textContent=c.primaryCtaLabel;if(safeUrl(c.primaryCtaUrl))a.href=c.primaryCtaUrl;}}
    const slides=(home.heroSlides||[]).filter(s=>!s.fallback&&s.image).sort((a,b)=>a.display_order-b.display_order);
    const media=qs('.hero-media');if(!media||!slides.length)return;
    qsa('.hero-slide,.hero-dots',media).forEach(n=>n.remove());
    const fragment=document.createDocumentFragment();
    slides.forEach((s,i)=>{const n=document.createElement('div');n.className='hero-slide'+(i===0?' active':'');n.style.backgroundImage=`url("${apiAsset(s.image)}")`;n.style.backgroundPosition=`${s.focal_point?.x??50}% ${s.focal_point?.y??50}%`;n.role='img';n.setAttribute('aria-label',s.alt_text||'LOLA event photograph');fragment.append(n);});
    media.prepend(fragment);
    const dots=document.createElement('div');dots.className='hero-dots';dots.innerHTML=slides.map((_,i)=>`<button class="dot" aria-label="Slide ${i+1}"></button>`).join('');media.append(dots);initHero();
  }

  function fillSelects(experiences,packages,eventTypes){
    qsa('[data-experience-select]').forEach(sel=>{ const current=sel.value; sel.innerHTML='<option value="">Not sure yet</option>'+experiences.map(x=>`<option value="${esc(x.id)}">${esc(x.website_name||x.name)}</option>`).join(''); sel.value=current; });
    qsa('[data-package-select]').forEach(sel=>{ const current=sel.value; sel.innerHTML='<option value="">Not sure yet</option>'+packages.map(x=>`<option value="${esc(x.id)}">${esc(x.website_key?x.website_key.split(':')[0].toUpperCase()+' — '+x.name:x.name)}</option>`).join(''); sel.value=current; });
    if(eventTypes?.length) qsa('[data-event-type-select]').forEach(sel=>{ sel.innerHTML='<option value="">Select event type</option>'+eventTypes.map(x=>`<option value="${esc(x.name)}">${esc(x.name)}</option>`).join('')+'<option value="Other">Other</option>'; });
  }

  function renderExperiences(items,content={}){
    const details=content['experience.details']?.body||{};
    for(const grid of qsa('[data-cms-experiences]')){
      const home=grid.dataset.cmsExperiences==='home';
      for(const node of qsa('[data-experience-key]',grid))node.hidden=true;
      for(const x of [...items].sort((a,b)=>a.display_order-b.display_order)){
        const key=experienceIdentity(x),node=qsa('[data-experience-key]',grid).find(n=>n.dataset.experienceKey===key);if(!node)continue;
        node.hidden=false;grid.append(node);
        const d=details[key]||{};
        setText(node,home?'h3':'.eyebrow',home?(x.website_name||x.name):d.pageLabel);
        setText(node,home?'p':'.muted',home?x.website_short_description:x.website_long_description);
        if(!home){setText(node,'h2',d.heading);setText(node,'.experience-kicker',d.kicker);const list=qs('ul',node);if(list&&Array.isArray(x.features))list.innerHTML=x.features.map(v=>`<li>${esc(v)}</li>`).join('');}
        const img=qs('img',node);if(img&&x.image&&safeUrl(apiAsset(x.image)))img.src=apiAsset(x.image);
      }
    }
  }
  function renderPackages(items,showPrice=true){
    const byKey=new Map(items.filter(x=>x.website_key).map(x=>[x.website_key,x]));
    // Legacy payloads have no experience relationship; do not overwrite approved fallback.
    if(items.length&&!byKey.size)throw new Error('CMS package migration is not available yet');
    for(const card of qsa('[data-package-key]')){
      const x=byKey.get(card.dataset.packageKey);card.hidden=!x;if(!x)continue;
      const custom=x.pricing_mode==='CUSTOM'||/custom/i.test(x.name);
      const home=!!card.closest('[data-cms-packages="home"]');
      card.style.order=String(x.website_display_order||0);
      setText(card,'h3',x.name);
      setText(card,home?'p.muted':'.sub',home?(x.website_home_description||x.website_short_description):x.website_short_description);
      const price=qs('.price',card);
      const amount=Number(x.starting_price);
      if(price)price.textContent=custom?(home?'Let’s Create Together':'Custom'):(!showPrice?'Request Pricing':Number.isFinite(amount)&&amount>0?(home?'Starting at ':'')+money(amount,x.currency):'Contact Us');
      const heading=qs('.big-copy',card);if(heading&&x.website_custom_heading)heading.innerHTML=safeCopy(x.website_custom_heading);
      const list=qs('ul',card);if(list&&Array.isArray(x.website_features))list.innerHTML=x.website_features.map(v=>`<li>${esc(v)}</li>`).join('');
      card.classList.toggle('featured',!!x.most_popular);
      let badge=qs(home?'p.eyebrow':'.pricing-badge',card);
      if(x.most_popular&&!badge){badge=document.createElement(home?'p':'div');badge.className=home?'eyebrow':'pricing-badge';badge.textContent='Most Popular';card.prepend(badge);}
      if(badge)badge.hidden=!x.most_popular;
    }
  }
  function renderEvents(items,content={}){
    const published=new Set(items.map(x=>x.slug));
    qsa('[data-cms-event]').forEach(n=>{n.hidden=!published.has(n.dataset.cmsEvent==='corporate'?'corporate-events':n.dataset.cmsEvent);});
    for(const grid of qsa('[data-cms-events="home"],.event-overview-grid')){
      const home=grid.dataset.cmsEvents==='home',order=content['events.home_order']?.body||[];
      qsa('[data-event-key]',grid).forEach(n=>n.hidden=true);
      const sorted=[...items].sort((a,b)=>home?((order.find(x=>x.slug===a.slug)?.order??a.display_order)-(order.find(x=>x.slug===b.slug)?.order??b.display_order)):a.display_order-b.display_order);
      for(const x of sorted){const n=qsa('[data-event-key]',grid).find(n=>n.dataset.eventKey===x.slug);if(!n)continue;n.hidden=false;grid.append(n);setText(n,home?'h3':'h2',x.name);setText(n,'p',home?(order.find(e=>e.slug===x.slug)?.description||x.short_description):x.short_description);const img=qs('img',n);if(img&&x.image)img.src=apiAsset(x.image);}
    }
  }
  function renderGallery(items){
    const grid=qs('[data-cms-gallery]');if(!grid)return;
    grid.innerHTML=(items||[]).map(x=>{
      const video=(x.tags||[]).includes('media:video');
      return `<figure class="gallery-card" tabindex="0" data-media-type="${video?'video':'photo'}" data-category="${esc((x.tags||[]).filter(t=>!t.startsWith('media:')).join(' '))}"><img src="${esc(apiAsset(x.image))}" alt="${esc(x.alt_text||'LOLA event moment')}"><span class="media-badge">${video?'Video':'Photo'}</span>${video?'<span class="play-badge" aria-hidden="true">▶</span>':''}<figcaption class="gallery-card-meta"><strong>${esc(x.title)}</strong><span>${esc(x.caption)}</span></figcaption></figure>`;
    }).join('');
    document.dispatchEvent(new Event('lola:gallery-updated'));
  }
  function renderTestimonials(items){ const grid=qs('[data-cms-testimonials]'); if(!grid)return; const section=grid.closest('[data-cms-testimonial-section]'); if(!items?.length){ if(section)section.hidden=true; grid.innerHTML=''; return; } if(section)section.hidden=false; grid.innerHTML=items.slice(0,6).map(x=>`<div class="card testimonial"><p class="quote">“${esc(x.quote)}”</p><p class="muted">— ${esc(x.client_display_name||'LOLA client')}${x.event_type?`, ${esc(x.event_type)}`:''}</p></div>`).join(''); }
  function renderFaqs(items){ const box=qs('[data-cms-faqs]'); if(!box)return; box.innerHTML=(items||[]).map(x=>`<details><summary>${esc(x.question)}</summary><p class="muted">${esc(x.answer)}</p></details>`).join(''); }

  function friendlyInquiryError(status,data){
    const code=data.error?.code;
    if(status===400&&code==='SPAM_DETECTED')return 'We could not send that message. Please refresh the page and try again.';
    if(status===400)return 'Please check the highlighted details and try again.';
    if(status===403||code==='CORS_REJECTED')return 'This booking form is not enabled for this website yet. Please email info@thelolabooth.com.';
    if(status===429)return 'Too many requests came through at once. Please wait a minute and try again.';
    if(status>=500)return 'LOLA could not receive your inquiry right now. Please email info@thelolabooth.com.';
    return data.error?.message||'We could not send your inquiry right now. Please try again.';
  }

  function captureAttribution(){ const p=new URLSearchParams(location.search); const fields=['utm_source','utm_medium','utm_campaign','utm_content','utm_term']; fields.forEach(k=>{const v=p.get(k); if(v)sessionStorage.setItem(`lola_${k}`,v)}); if(!sessionStorage.getItem('lola_landing_page_url'))sessionStorage.setItem('lola_landing_page_url',location.href); if(document.referrer&&!sessionStorage.getItem('lola_referrer_url'))sessionStorage.setItem('lola_referrer_url',document.referrer); }
  captureAttribution();

  function formPayload(form){
    const fd=new FormData(form), obj={};
    for(const [key,value] of fd.entries()){
      if(['marketing_email_opt_in','interestedIn','budgetRange','estimatedGuestCount'].includes(key))continue;
      if(value!==''&&value!=null)obj[key]=value;
    }
    const guests=fd.get('guestCount')||fd.get('estimatedGuestCount');
    if(guests)obj.guestCount=Number(guests);
    const names={glam:'The Glam','360':'The 360 Booth',vogue:'The Vogue','audio-guest-book':'The Audio Guest Book'};
    const interests=fd.getAll('interestedIn').filter(Boolean).map(value=>names[value]||value);
    const budget=form.querySelector('[name="budgetRange"]');
    const details=[];
    if(interests.length)details.push('Interested in: '+interests.join(', '));
    if(budget?.value)details.push('Budget: '+budget.selectedOptions[0].textContent.trim());
    obj.message=[String(fd.get('message')||'').trim(),...details].filter(Boolean).join('\n\n');
    obj.form_id=form.dataset.formId||location.pathname.split('/').filter(Boolean).pop()?.replace(/\.html$/,'')||'public-inquiry';
    obj.marketing_email_opt_in=!!form.querySelector('[name="marketing_email_opt_in"]:checked');
    for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){const value=sessionStorage.getItem(`lola_${key}`);if(value)obj[key]=value;}
    obj.landing_page_url=sessionStorage.getItem('lola_landing_page_url')||location.href;
    obj.referrer_url=sessionStorage.getItem('lola_referrer_url')||document.referrer||'';
    // Preserve a filled honeypot so the API can reject bot submissions.
    obj.website=String(fd.get('website')||'');
    return obj;
  }

  function showFieldErrors(form,errors){ qsa('.field-error',form).forEach(e=>e.remove()); qsa('[aria-invalid="true"]',form).forEach(e=>e.removeAttribute('aria-invalid')); Object.entries(errors||{}).forEach(([name,msgs])=>{const f=form.elements[name]; if(f){f.setAttribute('aria-invalid','true'); const e=document.createElement('div'); e.className='field-error'; e.textContent=(msgs||[])[0]||'Please check this field.'; f.insertAdjacentElement('afterend',e);}}); }
  qsa('form[data-lola-inquiry]').forEach(form=>form.addEventListener('submit',async e=>{
    e.preventDefault(); const status=qs('[data-form-status]',form); showFieldErrors(form,{});
    if(!stagingApiReady || window.LOLA_CONFIG?.formsEnabled !== true){if(status){status.className='form-status';status.textContent='Staging preview: submissions are disabled until the staging API is connected.';}return;}
    if(!form.reportValidity())return;
    const btn=qs('button[type="submit"]',form), original=btn?.textContent; if(btn){btn.disabled=true;btn.textContent='Sending…'}; if(status){status.className='form-status';status.textContent='';}
    try{ const r=await fetch(API_BASE+'/api/public/inquiries',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(formPayload(form))}); const data=await r.json().catch(()=>({})); if(!r.ok){if([400,422].includes(r.status)&&data.error?.details?.fieldErrors)showFieldErrors(form,data.error.details.fieldErrors); throw new Error(friendlyInquiryError(r.status,data));} if(status){status.className='form-status success';status.textContent=(data.code==='POSSIBLE_DUPLICATE')?'Thanks, we already have a recent inquiry from you. The LOLA team will follow up soon.':(data.message||'Thank you. Your inquiry was received and the LOLA team will be in touch soon.');} form.reset(); status?.scrollIntoView({behavior:'smooth',block:'nearest'});
    }catch(err){if(status){status.className='form-status error';status.textContent=err.message||'We couldn’t send your inquiry right now. Please try again.';}}
    finally{if(btn){btn.disabled=false;btn.textContent=original;}}
  }));

  async function load(){
    if(!stagingApiReady){document.documentElement.dataset.lolaCms="staging-preview";return;}
    try{
      const site=await get('/api/public/site');
      renderPackages(site.packages||[],site.settings?.show_starting_price!==false);
      renderPageContent(site);
      setSiteSettings(site.settings);
      renderHero(site);
      renderExperiences(site.experiences||[],site.content);
      renderEvents(site.eventTypes||[],site.content);
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
