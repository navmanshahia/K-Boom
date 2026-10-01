import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

const TEST_PASSWORD='admin123';
const statuses=['new','contacted','quote_sent','accepted','scheduled','in_progress','completed','paid','declined','cancelled'];
const auth=e=>e.headers['x-admin-password']===TEST_PASSWORD||e.headers['x-admin-password']===process.env.KBOOM_ADMIN_PASSWORD;
const safe=x=>String(x??'').slice(0,4000);
const token=()=>crypto.randomBytes(24).toString('hex');
const event=(type,note='')=>({type,note,at:new Date().toISOString()});

export const handler=async e=>{
 const s=getStore('kboom');
 let q=await s.get('quotes',{type:'json'}).catch(()=>null)||[];
 if(e.httpMethod==='POST'&&!e.queryStringParameters?.action){
   const x=JSON.parse(e.body||'{}');
   const year=new Date().getFullYear(), seq=(q.filter(v=>String(v.quoteNo||'').startsWith('KB-'+year)).length+1).toString().padStart(4,'0');
   const row={...x,id:crypto.randomUUID(),quoteNo:`KB-${year}-${seq}`,acceptToken:token(),name:safe(x.name),contact:safe(x.contact),area:safe(x.area),notes:safe(x.notes),frequency:safe(x.frequency||'One-time'),estimate:Number(x.estimate)||0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'new',activity:[event('quote_requested','Customer submitted quote request')]};
   q.unshift(row);await s.setJSON('quotes',q);
   return{statusCode:200,headers:{'content-type':'application/json'},body:JSON.stringify({ok:true,id:row.id,quoteNo:row.quoteNo})};
 }
 if(e.httpMethod==='GET'&&e.queryStringParameters?.token){
   const row=q.find(v=>v.acceptToken===e.queryStringParameters.token);
   if(!row)return{statusCode:404,body:'Quote not found'};
   const pub={quoteNo:row.quoteNo,name:row.name,area:row.area,date:row.date,frequency:row.frequency,selection:row.selection,estimate:row.finalAmount??row.estimate,status:row.status,createdAt:row.createdAt};
   return{statusCode:200,headers:{'content-type':'application/json'},body:JSON.stringify(pub)};
 }
 if(e.httpMethod==='POST'&&e.queryStringParameters?.action==='accept'){
   const x=JSON.parse(e.body||'{}'),i=q.findIndex(v=>v.acceptToken===x.token);
   if(i<0)return{statusCode:404,body:'Quote not found'};
   if(['declined','cancelled','paid'].includes(q[i].status))return{statusCode:409,body:'Quote can no longer be accepted'};
   q[i]={...q[i],status:'accepted',acceptedAt:new Date().toISOString(),updatedAt:new Date().toISOString(),activity:[...(q[i].activity||[]),event('quote_accepted','Accepted by customer')]};
   await s.setJSON('quotes',q);return{statusCode:200,body:'{"ok":true}'};
 }
 if(!auth(e))return{statusCode:401,body:'Unauthorized'};
 if(e.httpMethod==='GET')return{statusCode:200,headers:{'content-type':'application/json'},body:JSON.stringify(q)};
 if(e.httpMethod==='PATCH'){
   const x=JSON.parse(e.body||'{}'),i=q.findIndex(v=>v.id===x.id);if(i<0)return{statusCode:404,body:'Not found'};
   const old=q[i].status;const patch={};
   if(x.status&&statuses.includes(x.status))patch.status=x.status;
   if('finalAmount'in x)patch.finalAmount=Number(x.finalAmount)||0;
   if('internalNote'in x)patch.internalNote=safe(x.internalNote);
   if('frequency'in x)patch.frequency=safe(x.frequency);
   const acts=[...(q[i].activity||[])];if(patch.status&&patch.status!==old)acts.push(event('status_changed',old+' → '+patch.status));if(x.addNote)acts.push(event('note_added',safe(x.addNote)));
   q[i]={...q[i],...patch,activity:acts,updatedAt:new Date().toISOString()};await s.setJSON('quotes',q);
   return{statusCode:200,body:JSON.stringify({ok:true,quote:q[i]})};
 }
 return{statusCode:405,body:'Method not allowed'};
};