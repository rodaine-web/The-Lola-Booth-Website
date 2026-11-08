import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const html = await fs.readFile(new URL('../packages.html', import.meta.url), 'utf8');
const source = await fs.readFile(new URL('../page-packages-1.js', import.meta.url), 'utf8');
const keys = ['glam', '360', 'vogue', 'audio'];

test('every local packages page script is shipped', async () => {
  for (const [, src] of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)) {
    if (/^(?:https?:)?\/\//.test(src)) continue;
    await fs.access(new URL('../' + src.replace(/^\//, '').split(/[?#]/)[0], import.meta.url));
  }
});

function page(hash = '') {
  const make = (attribute) => keys.map(key => ({
    dataset: { [attribute]: key }, hidden: key !== 'glam', attributes: {}, active: false,
    classList: { toggle(_, active) { this.owner.active = active; } },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, fn) { this[name] = fn; },
  })).map(element => { element.classList.owner = element; return element; });
  const tabs = make('experienceTab'), panels = make('experiencePanel'), addons = make('experienceAddons');
  let url = hash;
  vm.runInNewContext(source, {
    document: { querySelectorAll: selector => ({
      '[data-experience-tab]': tabs, '[data-experience-panel]': panels,
      '[data-experience-addons]': addons,
    })[selector] },
    location: { hash }, history: { replaceState: (_, __, value) => { url = value; } },
  });
  return { tabs, panels, addons, url: () => url };
}

function selected(page, key) {
  assert.deepEqual(page.tabs.filter(tab => tab.attributes['aria-selected'] === 'true').map(tab => tab.dataset.experienceTab), [key]);
  assert.deepEqual(page.panels.filter(panel => !panel.hidden).map(panel => panel.dataset.experiencePanel), [key]);
  assert.deepEqual(page.addons.filter(panel => !panel.hidden).map(panel => panel.dataset.experienceAddons), [key]);
}

test('all Individual tabs reveal their matching prices and add-ons', () => {
  const result = page();
  selected(result, 'glam');
  for (const key of keys) {
    assert.match(html, new RegExp('data-experience-panel="' + key + '"'));
    result.tabs.find(tab => tab.dataset.experienceTab === key).click();
    selected(result, key);
    assert.equal(result.url(), '#experience-' + key);
  }
});

test('experience deep links select the correct panel; unknown hashes fall back to Glam', () => {
  for (const key of keys) selected(page('#experience-' + key), key);
  selected(page('#unknown'), 'glam');
});
