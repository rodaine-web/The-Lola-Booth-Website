import {optimizedMedia} from '../../lib/media-image.js';
export default async function handler(req,res){
 if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return res.status(405).end();}
 const result=await optimizedMedia({id:req.query.id,width:Number(req.query.w||1600),origin:process.env.LOLA_MEDIA_ORIGIN,environment:process.env.LOLA_DEPLOYMENT_ENV});
 res.setHeader('X-Content-Type-Options','nosniff');
 if(result.status===307){res.setHeader('Location',result.location);return res.status(307).end();}
 if(result.status!==200){res.setHeader('Cache-Control','no-store');return res.status(result.status).end();}
 res.setHeader('Content-Type',result.type);res.setHeader('Cache-Control','public, max-age=300, s-maxage=3600');
 return res.status(200).send(req.method==='HEAD'?undefined:result.buffer);
}
