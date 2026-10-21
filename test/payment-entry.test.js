import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source=await fs.readFile(new URL('../payment-viewer.js',import.meta.url),'utf8');
async function page(options){
 const elements=new Map(),radios=['DEPOSIT','FULL','CUSTOM'].map(value=>({value,checked:false,addEventListener(){}}));
 const element=id=>{if(!elements.has(id))elements.set(id,{id,style:{},hidden:id==='paymentCard',textContent:'',disabled:false,querySelector:()=>radios[{depositChoice:0,fullChoice:1,customChoice:2}[id]]});return elements.get(id);};
 let redirect=null,requests=0;
 const location={search:'',pathname:'/pay/qa-token',assign:url=>redirect=url,replace:url=>redirect=url};
 vm.runInNewContext(source,{URLSearchParams,Intl,Number,Date,Boolean,crypto:{randomUUID:()=> 'qa-request'},setTimeout,Promise,window:{LOLA_CONFIG:{apiBase:'https://api.example.invalid'}},location,document:{getElementById:element,querySelectorAll:()=>radios,querySelector:()=>radios.find(r=>r.checked)||null},fetch:async()=>{requests++;return {ok:true,json:async()=>({invoice:{invoice_number:'QA-INVOICE',total:1000},paymentOptions:{currency:'USD',providers:[{provider:'STRIPE',label:'Card checkout'}],...options}})};}});
 await new Promise(setImmediate);return {element,radios,redirect,requests};
}
test('unsigned payment entry redirects before exposing payment choices',async()=>{
 const result=await page({agreementRequired:true,agreementUrl:'https://admin.example.invalid/contract/qa',payable:false,providers:[]});
 assert.equal(result.redirect,'https://admin.example.invalid/contract/qa');assert.equal(result.element('paymentCard').hidden,true);assert.equal(result.requests,1);
});
test('signed first payment retains retainer, full balance and custom choices with a 30% minimum',async()=>{
 const result=await page({payable:true,depositAvailable:true,allowPayInFull:true,allowCustomAmount:true,amountDue:300,fullAmount:1000,minimumAmount:300});
 assert.equal(result.redirect,null);assert.equal(result.element('customAmount').min,300);assert.equal(result.element('customAmount').max,1000);assert.equal(result.element('depositChoice').style.display,'flex');assert.equal(result.element('customChoice').style.display,'flex');assert.equal(result.radios[0].checked,true);
});
test('later installments hide retainer and deadline policy removes partial choices',async()=>{
 for(const overdue of [false,true]){
  const result=await page({payable:true,depositAvailable:false,allowPayInFull:true,allowCustomAmount:!overdue,fullAmount:500,amountDue:500,minimumAmount:overdue?500:1});
  assert.equal(result.element('depositChoice').style.display,'none');assert.equal(result.element('customChoice').style.display,overdue?'none':'flex');assert.equal(result.radios[1].checked,true);
 }
});
test('paid in full cannot start another payment',async()=>{
 const result=await page({payable:false,depositAvailable:false,allowPayInFull:false,allowCustomAmount:false,fullAmount:0,amountDue:0,minimumAmount:0,providers:[]});
 assert.equal(result.element('pay').disabled,true);await result.element('pay').onclick();assert.equal(result.requests,1);assert.match(result.element('status').textContent,/No further payment/);
});
