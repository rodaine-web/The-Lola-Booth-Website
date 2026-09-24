import fs from 'node:fs/promises';import path from 'node:path';import sharp from 'sharp';
const root=process.cwd(),assets=path.join(root,'assets'),report=[];
for(const file of await fs.readdir(assets)){
 const brand=/^LOLA_Primary_.*\.png$/i.test(file);
 if(!/\.(jpe?g|png)$/i.test(file)||(!brand&&/logo|LOLA_/i.test(file)))continue;
 const original=await fs.readFile(path.join(assets,file));const output=await sharp(original).rotate().resize({width:brand?640:1600,withoutEnlargement:true}).webp(brand?{lossless:true,effort:5}:{quality:84,effort:5}).toBuffer();const target=file.replace(/\.[^.]+$/,'.webp');await fs.writeFile(path.join(assets,target),output);report.push({source:file,target,before:original.length,after:output.length});
}
for(const file of (await fs.readdir(root)).filter(x=>/\.(html|css)$/.test(x))){const target=path.join(root,file);let text=await fs.readFile(target,'utf8');for(const image of report){text=text.replaceAll(`src="assets/${image.source}"`,`src="assets/${image.target}"`).replaceAll(`url('assets/${image.source}')`,`url('assets/${image.target}')`).replaceAll(`url("assets/${image.source}")`,`url("assets/${image.target}")`);}await fs.writeFile(target,text);}
await fs.writeFile(path.join(root,'image-optimization-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
