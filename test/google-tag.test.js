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
test('new lead sends supplied conversion once with no personal information',()=>{
 const {window}=run('www.thelolabooth.com','/availability');
 window.lolaTrackLeadConversion({inquiryStatus:'CREATED_LEAD',email:'private@example.invalid'},'random-submission-uuid');
 window.lolaTrackLeadConversion({inquiryStatus:'CREATED_LEAD'},'random-submission-uuid');
 const events=window.dataLayer.filter(x=>x[0]==='event');
 assert.equal(events.length,1);
 assert.equal(events[0][1],'conversion');
 assert.deepEqual(JSON.parse(JSON.stringify(events[0][2])),{send_to:'AW-18531982704/JcHYCPPztaYdEPC63oRF',value:1,currency:'USD',transaction_id:'random-submission-uuid'});
});
test('duplicate, replayed, unknown and failed submissions are not conversions',()=>{
 const {window}=run('www.thelolabooth.com');
 for(const inquiryStatus of ['UPDATED_LEAD','DUPLICATE','REPLAYED',undefined]) window.lolaTrackLeadConversion({inquiryStatus},'random-uuid');
 window.lolaTrackLeadConversion({inquiryStatus:'CREATED_LEAD'},null);
 assert.equal(window.dataLayer.length,3);
});
test('analytics failure cannot break customer submission',()=>{
 const {window}=run('www.thelolabooth.com');window.gtag=()=>{throw Error('blocked');};
 assert.doesNotThrow(()=>window.lolaTrackLeadConversion({inquiryStatus:'CREATED_LEAD'},'random-uuid'));
});
async function submit(kind,{ok=true,inquiryStatus='CREATED_LEAD',valid=true}={}) {
 const {window}=run('www.thelolabooth.com');window.LOLA_CONFIG={formsEnabled:true};
 const status={focus(){},scrollIntoView(){}},button={textContent:'Submit'},form={reportValidity:()=>valid,reset(){}};
 let handler;
 form.addEventListener=(_,fn)=>handler=fn;
 const selectors=s=>s.includes('status')?status:s.includes('submit')?button:{checked:false};
 const context={window,crypto:{randomUUID:()=> 'qa-random-submission'},URLSearchParams,FormData:function(){return [];},Map,location:{origin:'https://www.thelolabooth.com',pathname:'/availability'},document:{referrer:''},sessionStorage:{getItem:()=>null},fetch:async()=>({ok,status:ok?201:500,json:async()=>({inquiryStatus})}),form,el:selectors,chosen:new Map([['glam',{packageId:'qa-package'}]]),addons:new Map(),busy:false,ready:true,submissionId:'qa-random-submission',base:'https://api.example.invalid',renderExperiences(){},renderAddons(){},summary(){},qsa:()=>[form],qs:selectors,showFieldErrors(){},stagingApiReady:true,API_BASE:'https://api.example.invalid',formPayload:()=>({}),friendlyInquiryError:()=> 'Submission failed'};
 const source=fs.readFileSync(new URL('../'+(kind==='booking'?'booking.js':'app.js'),import.meta.url),'utf8');
 const start=source.indexOf(kind==='booking'?" form.addEventListener('submit',":"  qsa('form[data-lola-inquiry]");
 const end=source.indexOf(kind==='booking'?'\n renderExperiences();renderAddons();loadCatalog();':'\n\n  async function load()',start);
 assert.ok(start>=0&&end>start);
 vm.runInNewContext(source.slice(start,end),context);
 await handler({preventDefault(){}});
 return window.dataLayer.filter(x=>x[0]==='event');
}
for(const form of ['booking','contact']) test(form+' emits a conversion only after a newly created lead, never validation/fetch failures or duplicates',async()=>{
 assert.equal((await submit(form)).length,1);
 assert.equal((await submit(form,{ok:false})).length,0);
 assert.equal((await submit(form,{inquiryStatus:'UPDATED_LEAD'})).length,0);
 assert.equal((await submit(form,{valid:false})).length,0);
});
