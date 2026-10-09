import {getStore} from '@netlify/blobs';
import {createAPI} from '../../server/core.mjs';
export default async req=>{const blobs=getStore({name:`kboom-v3-${process.env.CONTEXT||'production'}`,consistency:'strong'});const store={get:key=>blobs.get(key,{type:'json'}),set:(key,value)=>blobs.setJSON(key,value),list:async prefix=>{const all=[];for await(const page of blobs.list({prefix,paginate:true}))for(const b of page.blobs)all.push(await blobs.get(b.key,{type:'json'}));return all}};return createAPI(store)(req)};
