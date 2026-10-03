import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const html = await fs.readFile(new URL('../proposal.html', import.meta.url), 'utf8');
const config = await fs.readFile(new URL('../config.js', import.meta.url), 'utf8');
const source = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const flush = () => new Promise(resolve => setImmediate(resolve));
async function viewer(search = '', configured = true) {
  const elements = new Map();
  const calls = [], redirects = [];
  const document = {getElementById(id) {
    if (!elements.has(id)) elements.set(id, {style: {}, value: '', disabled: false,
      listeners: {}, addEventListener(event, handler) {this.listeners[event] = handler;},
      removeAttribute() {}, focus() {this.focused = true;}, scrollIntoView() {this.scrolled = true;}});
    return elements.get(id);
  }};
  const context = {window: {}, document, URLSearchParams, Intl,
    location: {search, pathname: '/proposal/demo-token', assign: url => redirects.push(url)},
    fetch: async (url, options) => {
      calls.push({url, options});
      return {ok: true, json: async () => ({proposal: {status: 'SENT', proposal_number: 'QA-1', total: 699}}), text: async () => '<main>Proposal</main>'};
    }};
  if (configured) vm.runInNewContext(config, context);
  vm.runInNewContext(source, context);
  await flush();
  return {elements, calls, redirects};
}
test('proposal loads configuration before its viewer script', () => {
  assert.ok(html.indexOf('src="/config.js"') >= 0);
  assert.ok(html.indexOf('src="/config.js"') < html.indexOf('<script>'));
});
test('metadata, preview, PDF and acceptance use the staging API', async () => {
  const {elements, calls} = await viewer();
  const base = 'https://stagingapi.thelolabooth.com/api/public/proposals/demo-token';
  assert.deepEqual(calls.map(c => c.url), [base, base + '/preview']);
  assert.equal(elements.get('downloadBtn').href, base + '/pdf');
  assert.equal(elements.get('proposalFrame').srcdoc, '<main>Proposal</main>');
  elements.get('acceptName').value = 'Demo Guest';
  await elements.get('acceptBtn').listeners.click();
  assert.equal(calls[2].url, base + '/accept');
  assert.equal(calls[2].options.method, 'POST');
  assert.deepEqual(JSON.parse(calls[2].options.body), {acceptedByName: 'Demo Guest'});
});
test('email download link redirects to the staging PDF', async () => {
  const {redirects} = await viewer('?download=pdf');
  assert.deepEqual(redirects, ['https://stagingapi.thelolabooth.com/api/public/proposals/demo-token/pdf']);
});
test('missing configuration makes no API requests', async () => {
  const {calls, elements} = await viewer('', false);
  assert.equal(calls.length, 0);
  assert.equal(elements.get('status').className, 'status error');
});
test('embedded proposal acceptance opens the outer confirmation form', async () => {
  const {elements} = await viewer();
  let click;
  const frame = elements.get('proposalFrame');
  frame.contentDocument = {body: {scrollHeight: 5100}, documentElement: {scrollHeight: 5100},
    querySelectorAll: selector => selector === 'img' ? [] : [{addEventListener(event, handler) {click = handler;}}]};
  frame.onload();
  assert.equal(frame.style.height, '5100px');
  let prevented = false;
  click({preventDefault() {prevented = true;}});
  assert.equal(prevented, true);
  assert.equal(elements.get('acceptName').focused, true);
  assert.equal(elements.get('acceptCard').scrolled, true);
});
