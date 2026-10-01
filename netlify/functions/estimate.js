import { getStore } from '@netlify/blobs';

const minutes={
 bedrooms:5,masterBedroom:5,livingRoom:5,diningRoom:5,kitchen:30,scullery:5,laundry:5,hallways:5,stairs:5,foyer:5,office:5,mediaRoom:10,garage:5,balcony:5,outdoorBbqArea:10,storage:5,otherRoom:0,
 kingBed:15,queenBed:15,singleBed:15,bunkBed:30,sofaBed:15,linenChange:10,bedMaking:7,
 bathroom:5,separateToilet:5,powderRoom:5,shower:10,bathtub:7,doubleVanity:6,spa:7,
 oven:30,rangehood:30,interiorWindows:5,exteriorWindows:5,tracksFrames:5,carpetShampoo:20,wallSpot:10,skirtingFrames:5,bbqClean:30,outdoorFurniture:40,otherExtra:0
};
const defaults={internalRate:55,gst:.15,baseMinutes:0};
export const handler=async e=>{
 if(e.httpMethod!=='POST')return{statusCode:405,body:'Method not allowed'};
 try{
  const body=JSON.parse(e.body||'{}'), selection=body.selection||{};
  const store=getStore('kboom');
  const cfg=await store.get('config',{type:'json'}).catch(()=>null);
  const pricing={...defaults,...(cfg?.pricing||{})};
  let totalMinutes=Number(pricing.baseMinutes)||0;
  for(const [key,mins] of Object.entries(minutes)){const qty=Math.max(0,Math.min(50,Number(selection[key])||0));totalMinutes+=qty*mins}
  const roundedHours=Math.ceil((totalMinutes/60)*4)/4;
  const total=roundedHours*(Number(pricing.internalRate)||0)*(1+(Number(pricing.gst)||0));
  return{statusCode:200,headers:{'content-type':'application/json'},body:JSON.stringify({total:Number(total.toFixed(2)),currency:'NZD',gstIncluded:true})};
 }catch{return{statusCode:400,body:'Invalid estimate request'}}
};