import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),html=await fs.readFile(new URL('packages.html',root),'utf8'),source=await fs.readFile(new URL('design-packages.js',root),'utf8');
test('all local package page scripts ship',async()=>{for(const [,src]of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g))await fs.access(new URL(src.replace(/^\//,''),root));});
test('each experience renders its own CMS prices, popular card and custom quote',()=>{
 const render=source.slice(source.indexOf(' function renderPackages()'),source.indexOf('\n function render(){'));
 for(const key of ['glam','360','mirror','vogue']){
  const slots=new Map(),$=name=>{if(!slots.has(name))slots.set(name,{});return slots.get(name);};
  const packages=['ESSENTIAL','SIGNATURE','LUXE','CUSTOM'].map((tier,i)=>({id:key+i,catalog_key:'STANDARD',tier_key:tier,name:tier,starting_price:599+i*300,most_popular:i===1,pricing_profile:{experience:key,tier,quoteRequired:i===3,featureLabels:['CMS inclusion']}}));
  vm.runInNewContext(render+';renderPackages();',{$,catalog:{packages},key,money:n=>'$'+n,esc:s=>String(s),URLSearchParams,symbols:{[key]:'camera'},icon:()=>''});
  const output=$('[data-design-packages]').innerHTML;
  assert.match(output,new RegExp('data-package-key="'+key+':essential"'));assert.match(output,/\$599/);assert.match(output,/MOST POPULAR/);assert.match(output,/Request a Quote/);assert.match(output,/Full package details/);
 }
});
