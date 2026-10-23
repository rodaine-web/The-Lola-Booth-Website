import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync(new URL('../google-tag.js',import.meta.url),'utf8');
function run(hostname,pathname='/') {
 const scripts=[];
 const window={location:{hostname,pathname}};
 const document={head:{appendChild:s=>scripts.push(s)},createElement:()=>({})};
 const context=vm.createContext({window,document});
 vm.runInContext(code,context);
 return {window,scripts,context};
}
test('production loads one tag and both existing Analytics and new Ads destinations',()=>{
 for(const host of ['thelolabooth.com','www.thelolabooth.com']) {
  const {window,scripts,context}=run(host,'/availability');
  assert.equal(scripts.length,1);
  assert.equal(scripts[0].async,true);
  assert.equal(scripts[0].src,'https://www.googletagmanager.com/gtag/js?id=G-CJBCQ9FYL1');
  assert.deepEqual(Array.from(window.dataLayer,x=>Array.from(x).slice(0,2)).filter(x=>x[0]==='config'),[['config','G-CJBCQ9FYL1'],['config','AW-18531982704']]);
  vm.runInContext(code,context);
  assert.equal(scripts.length,1);
  assert.equal(window.dataLayer.length,3);
 }
});
test('staging, previews, localhost and staff do not send advertising traffic',()=>{
 for(const host of ['staging.thelolabooth.com','stagingadmin.thelolabooth.com','admin.thelolabooth.com','localhost','lola-preview.vercel.app']) {
  const {scripts,window}=run(host);assert.equal(scripts.length,0);assert.equal(window.dataLayer,undefined);
 }
});
test('private customer routes stay untracked, even on public domain',()=>{
 for(const path of ['/pay/token','/pay.html','/proposal/token','/proposal.html','/proposals/token','/client/events/123']) assert.equal(run('www.thelolabooth.com',path).scripts.length,0);
});
test('public marketing pages include shared tag once; private pages do not',()=>{
 for(const name of ['index','about','availability','connect','contact','experiences','faq','packages','privacy','terms','404']) {
  const html=fs.readFileSync(new URL('../'+name+'.html',import.meta.url),'utf8');
  assert.equal((html.match(/src="\/google-tag\.js"/g)||[]).length,1,name);
  assert.equal((html.match(/googletagmanager\.com\/gtag\/js/g)||[]).length,0,name);
 }
 for(const name of ['pay','proposal']) assert.doesNotMatch(fs.readFileSync(new URL('../'+name+'.html',import.meta.url),'utf8'),/google-tag\.js|googletagmanager/);
});
