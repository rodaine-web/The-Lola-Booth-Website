import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('CMS image paths preserve filenames and nested folders',()=>{
 const expression=fs.readFileSync('design.js','utf8').match(/const asset=(.*?);\n/)[1];
 const asset=vm.runInNewContext(expression,{location:{href:'https://thelolabooth.com/',pathname:'/'},base:'https://api.thelolabooth.com',URL});
 for(const path of ['reference-home.jpg','equipment-cutout-360.png','nested/photo.jpg?v=2']) assert.equal(asset('/staging-site/assets/'+path),'/assets/'+path);
 assert.equal(asset('/assets/photo.webp'),'/assets/photo.webp');
 assert.equal(asset('/api/media/id'),'https://api.thelolabooth.com/api/media/id');
 assert.equal(asset('javascript:alert(1)'),'');
});
test('cached legacy CMS image URLs remain routable',()=>{
 const c=JSON.parse(fs.readFileSync('vercel.json','utf8'));
 assert.ok(c.rewrites.some(r=>r.source==='/staging-site/assets/:path*'&&r.destination==='/assets/:path*'));
});

test('cropped images load without Safari offscreen lazy-loading deadlock',()=>{const s=fs.readFileSync('design.js','utf8');assert.match(s,/loading="eager"><\/span>/);});
