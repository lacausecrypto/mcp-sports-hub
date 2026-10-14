import {createServer} from 'node:http';
import {timingSafeEqual} from 'node:crypto';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const port=Number(process.env.PORT||3000);
const secret=process.env.GATEWAY_TOKEN||'';
if(secret.length<32){console.error('Missing or too short GATEWAY_TOKEN');process.exit(1)}
const sportMap={football:['soccer','eng.1'],nba:['basketball','nba'],nfl:['football','nfl'],nhl:['hockey','nhl'],mlb:['baseball','mlb']};
const allow=new Set(['espn_get_scoreboard','espn_get_standings','nhl_get_scores','nhl_get_standings','mlb_get_schedule','mlb_get_standings','f1_get_schedule','f1_get_driver_standings']);
const secure=(s)=>{const a=Buffer.from(s),b=Buffer.from(secret);return a.length===b.length&&timingSafeEqual(a,b)};
let client,transport,connection;const circuit={failures:0,until:0};const cache=new Map();let inflight=0;
async function connect(){if(connection)return connection;connection=(async()=>{const t=new StdioClientTransport({command:process.execPath,args:['dist/index.js'],env:{...process.env,SPORTS_HUB_PROVIDERS:'espn,nhl,mlb,f1'}});const c=new Client({name:'sports-hub-preview-gateway',version:'1.0.0'});await c.connect(t);transport=t;client=c;return c})().catch(e=>{connection=null;throw e});return connection}
function select(sport,operation){const year=new Date().getUTCFullYear();if(sport==='f1'){if(operation==='scores')return {name:'f1_get_schedule',arguments:{season:String(year)}};if(operation==='standings')return {name:'f1_get_driver_standings',arguments:{season:String(year)}}}if(sport==='nhl'){if(operation==='scores')return {name:'nhl_get_scores',arguments:{}};if(operation==='standings')return {name:'nhl_get_standings',arguments:{}}}if(sport==='mlb'){if(operation==='scores')return {name:'mlb_get_schedule',arguments:{date:new Date().toISOString().slice(0,10)}};if(operation==='standings')return {name:'mlb_get_standings',arguments:{season:year}}}const arr=sportMap[sport];if(!arr)return null;return {name:operation==='scores'?'espn_get_scoreboard':'espn_get_standings',arguments:{sport:arr[0],league:arr[1]}}}
function send(res,status,payload){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(payload))}
const server=createServer(async(req,res)=>{
 if(req.url==='/health'&&req.method==='GET')return send(res,200,{status:'ok',service:'sports-hub-preview-gateway',mcpConnected:!!client});
 if(req.url!=='/v1/query'||req.method!=='POST')return send(res,404,{error:'not found'});
 const auth=req.headers.authorization||'';if(!auth.startsWith('Bearer ')||!secure(auth.slice(7)))return send(res,401,{error:'unauthorized'});
 if(circuit.until>Date.now())return send(res,503,{error:'provider temporarily unavailable'});
 if(inflight>=4)return send(res,429,{error:'busy'});
 let raw='';try{for await(const chunk of req){raw+=chunk;if(raw.length>1500)throw Error('limit')}const o=JSON.parse(raw),sport=o?.sport,operation=o?.operation;if(!['scores','standings'].includes(operation))return send(res,400,{error:'operation not allowed'});const tool=select(sport,operation);if(!tool||!allow.has(tool.name))return send(res,400,{error:'sport not allowed'});const key=sport+'|'+operation,old=cache.get(key);if(old&&old.exp>Date.now())return send(res,200,{...old.data,cached:true});inflight++;try{const c=await connect();const result=await Promise.race([c.callTool(tool),new Promise((_,rej)=>setTimeout(()=>rej(Error('timeout')),8500))]);if(result.isError)throw Error('upstream error');const payload={sport,operation,tool:tool.name,content:result.content?.find(x=>x.type==='text')?.text?.slice(0,250000)||'',note:result.content?.filter(x=>x.type==='text').slice(1).map(x=>x.text).join(' ').slice(0,800)||'',asOf:new Date().toISOString(),cached:false};cache.set(key,{exp:Date.now()+120000,data:payload});if(cache.size>32)cache.delete(cache.keys().next().value);circuit.failures=0;return send(res,200,payload)}finally{inflight--}}catch(e){circuit.failures++;if(circuit.failures>=6)circuit.until=Date.now()+30000;return send(res,502,{error:'upstream request failed'})}
});
server.requestTimeout=12000;server.headersTimeout=10000;server.listen(port,'0.0.0.0',()=>console.log('restricted sports data gateway listening',port));
process.on('SIGTERM',async()=>{server.close();await client?.close().catch(()=>{});process.exit(0)});
