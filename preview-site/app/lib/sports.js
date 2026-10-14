export const SPORTS=['football','nba','nfl','nhl','mlb','f1'];
export const PROVIDERS={football:{name:'ESPN',url:'https://site.api.espn.com'},nba:{name:'ESPN',url:'https://site.api.espn.com'},nfl:{name:'ESPN',url:'https://site.api.espn.com'},nhl:{name:'NHL',url:'https://api-web.nhle.com'},mlb:{name:'MLB',url:'https://statsapi.mlb.com'},f1:{name:'Jolpica F1',url:'https://api.jolpi.ca'}};
export const number=v=>Number.isFinite(Number(v))?Number(v):0;
export async function callMcp(sport,operation){
if(!SPORTS.includes(sport))throw Error('unsupported-sport');
if(!['scores','standings','insights','insights2'].includes(operation))throw Error('unsupported-operation');
const url=process.env.SPORTS_HUB_GATEWAY_URL;
const token=process.env.SPORTS_HUB_GATEWAY_TOKEN;
if(!url||!url.startsWith('https://')||!token)throw Error('gateway-not-configured');
const controller=new AbortController();
const timeout=setTimeout(()=>controller.abort(),11500);
try{
const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({sport,operation}),signal:controller.signal,cache:'no-store'});
if(!response.ok)throw Error('mcp-gateway-'+response.status);
const result=await response.json();
if(typeof result.content!=='string'||typeof result.tool!=='string')throw Error('invalid-tool-response');
const body=JSON.parse(result.content);
if(!body||typeof body!=='object')throw Error('invalid-tool-payload');
return{data:body,tool:result.tool,note:result.note||null,asOf:result.asOf,cached:result.cached};
}finally{clearTimeout(timeout)}
}
export const safeSources=(sport,results,operations)=>results.map((r,i)=>({operation:operations[i],ok:r.status==='fulfilled',tool:r.status==='fulfilled'?r.value.tool:null,name:r.status==='fulfilled'?r.value.tool:operations[i],provider:PROVIDERS[sport].name,url:PROVIDERS[sport].url,note:r.status==='fulfilled'?r.value.note:null,error:r.status==='rejected'?'Fournisseur indisponible':null,asOf:r.status==='fulfilled'?r.value.asOf:null}));
