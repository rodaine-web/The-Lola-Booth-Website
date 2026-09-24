import sharp from 'sharp';
const MAX_BYTES=12*1024*1024;
export async function optimizedMedia({id,width,origin,environment,fetchImpl=fetch}){
 if(!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(id||'')||![640,960,1600].includes(Number(width)))return {status:400};
 let base;try{base=new URL(origin);}catch{return {status:503};}
 if(base.protocol!=='https:'||base.username||base.password||base.pathname!=='/'||base.search||base.hash)return {status:503};
 if(!['staging','production'].includes(environment))return {status:503};
 if(environment==='staging'&&['api.thelolabooth.com','admin.thelolabooth.com','thelolabooth.com'].includes(base.hostname))return {status:503};
 try{
  const response=await fetchImpl(new URL(`/api/public/media/${id}`,base),{redirect:'error',signal:AbortSignal.timeout(15000),headers:{Accept:'image/avif,image/webp,image/png,image/jpeg'}});
  if(!response.ok)return {status:response.status===404?404:502};
  const type=response.headers.get('content-type')||'';
  if(type.startsWith('video/'))return {status:307,location:new URL(`/api/public/media/${id}`,base).href};
  if(!/^image\/(jpeg|png|webp|avif)(;|$)/i.test(type))return {status:415};
  if(Number(response.headers.get('content-length'))>MAX_BYTES){await response.body?.cancel();return {status:413};}
  const chunks=[];let bytes=0;for await(const chunk of response.body){bytes+=chunk.length;if(bytes>MAX_BYTES)return {status:413};chunks.push(chunk);}
  const buffer=await sharp(Buffer.concat(chunks),{limitInputPixels:40_000_000}).rotate().resize({width:Number(width),withoutEnlargement:true}).webp({quality:84,effort:4}).toBuffer();
  return {status:200,buffer,type:'image/webp'};
 }catch(error){return {status:['TimeoutError','AbortError'].includes(error.name)?504:502};}
}
