import {randomBytes,createHmac,timingSafeEqual} from 'node:crypto';
export const defaults={headline:'The art of arriving home.',intro:'Thoughtful cleaning and beautifully prepared spaces. For the homes you treasure, and the guests you welcome.',phone:'022 348 9772',email:'kboomkleen@gmail.com'};
const statuses=['New','Contacted','Consultation','Booked','Completed','Declined'];
export function createAPI(store, env=process.env){
 const secret=()=>env.KBOOM_SESSION_SECRET || env.KBOOM_ADMIN_PASSWORD;
 const sign=s=>createHmac('sha256',secret()).update(s).digest('hex');
 const equal=(a,b)=>{const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y)};
 const json=(d,status=200,extra={})=>new Response(JSON.stringify(d),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...extra}});
 return async req=>{try{
 const url=new URL(req.url),path=url.pathname.replace(/^.*\/api\/?/,'').replace(/^\.netlify\/functions\/api\/?/,'');
 const cookie=(req.headers.get('cookie')||'').match(/(?:^|; )kb_session=([^;]+)/)?.[1];
 let auth=false;if(secret()&&cookie){const [payload,sig]=cookie.split('.');try{auth=equal(sign(payload),sig)&&JSON.parse(Buffer.from(payload,'base64url').toString()).expires>Date.now()}catch{}}
 if(!['GET','HEAD'].includes(req.method)){const origin=req.headers.get('origin');if(origin&&origin!==url.origin)return json({error:'Origin rejected.'},403);if(!req.headers.get('content-type')?.includes('application/json'))return json({error:'JSON required.'},415)}
 if(req.method==='GET'&&path==='config')return json(await store.get('config')||defaults);
 if(req.method==='GET'&&path==='session')return json({authenticated:auth});
 let body={};if(!['GET','HEAD'].includes(req.method)){const raw=await req.text();if(raw.length>16000)return json({error:'Request too large.'},413);try{body=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}}
 if(path==='login'&&req.method==='POST'){
 if(!env.KBOOM_ADMIN_PASSWORD)return json({error:'Owner access is not configured. Set KBOOM_ADMIN_PASSWORD in your hosting environment.'},503);
 const ip=req.headers.get('x-nf-client-connection-ip')||'local';const key='attempt/'+createHmac('sha256',secret()).update(ip).digest('hex');const rate=await store.get(key)||{count:0,until:0};if(rate.until>Date.now()&&rate.count>=8)return json({error:'Too many attempts. Try again in 15 minutes.'},429);
 if(!equal(body.password,env.KBOOM_ADMIN_PASSWORD)){await store.set(key,{count:rate.until>Date.now()?rate.count+1:1,until:Date.now()+900000});return json({error:'Incorrect password.'},401)}
 await store.set(key,{count:0,until:0});const payload=Buffer.from(JSON.stringify({expires:Date.now()+8*3600000,nonce:randomBytes(12).toString('hex')})).toString('base64url');return json({ok:true},200,{'Set-Cookie':`kb_session=${payload}.${sign(payload)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${url.protocol==='https:'?'; Secure':''}`});}
 if(path==='logout'&&req.method==='POST')return json({ok:true},200,{'Set-Cookie':'kb_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});
 if(path==='enquiries'&&req.method==='POST'){
 if(body.website)return json({error:'Unable to accept this request.'},400);
 const clean={};for(const k of ['name','email','phone','area','service','bedrooms','date','notes'])clean[k]=String(body[k]||'').trim().slice(0,k==='notes'?3000:200);
 if(!clean.name||!/^\S+@\S+\.\S+$/.test(clean.email)||!['Wānaka','Albert Town','Lake Hāwea','Luggate','Other'].includes(clean.area)||!['Short-stay turnovers','Deep cleaning','Linen preparation','Tailored property care'].includes(clean.service)||body.consent!==true)return json({error:'Please complete the required fields and consent.'},400);
 if(clean.date&&(!/^\d{4}-\d{2}-\d{2}$/.test(clean.date)||clean.date<new Date().toLocaleDateString('en-CA',{timeZone:'Pacific/Auckland'})))return json({error:'Please choose a future date.'},400);
 const id=randomBytes(12).toString('hex'),record={...clean,id,status:'New',createdAt:new Date().toISOString(),internalNotes:''};await store.set('enquiry/'+id,record);return json({id,ok:true},201);}
 if(!auth)return json({error:'Please sign in.'},401);
 if(path==='enquiries'&&req.method==='GET')return json((await store.list('enquiry/')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));
 if(path.startsWith('enquiries/')&&req.method==='PATCH'){const id=path.split('/')[1];if(!/^[a-f0-9]{24}$/.test(id))return json({error:'Not found.'},404);const record=await store.get('enquiry/'+id);if(!record)return json({error:'Not found.'},404);if(!statuses.includes(body.status))return json({error:'Invalid status.'},400);record.status=body.status;record.internalNotes=String(body.internalNotes||'').slice(0,5000);await store.set('enquiry/'+id,record);return json(record);}
 if(path==='config'&&req.method==='PUT'){const c={};for(const k of Object.keys(defaults)){c[k]=String(body[k]||'').trim().slice(0,500);if(!c[k])return json({error:'All content fields are required.'},400)}if(!/^\S+@\S+\.\S+$/.test(c.email))return json({error:'Enter a valid email.'},400);await store.set('config',c);return json(c)}
 return json({error:'Not found.'},404);
 }catch(error){console.error('API failure',error.message);return json({error:'Service temporarily unavailable. Please try again or contact us directly.'},503)}};
}
