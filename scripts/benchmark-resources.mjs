import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const configs = [{name:'five',providers:'espn,nhl,mlb,f1,openf1'},{name:'free',providers:'free'}];
for(const cfg of configs){
 const client = new Client({name:'sports-hub-benchmark',version:'0.0.1'});
 const transport = new StdioClientTransport({
  command:process.execPath,
  args:['dist/index.js'],
  env:{...process.env,SPORTS_HUB_PROVIDERS:cfg.providers}
 });
 let samples=[], rssMax=0, rssAfter=0;
 const started=performance.now();
 await client.connect(transport);
 const initialized=performance.now()-started;
 const pid=transport._process?.pid;
 const sample=()=>{
  try{
    const txt=readFileSync('/proc/'+pid+'/status','utf8');
    const m=txt.match(/^VmRSS:\s+(\d+) kB/m);
    if(m){const mb=Number(m[1])/1024;samples.push(mb);rssMax=Math.max(rssMax,mb);rssAfter=mb;}
  }catch{}
 };
 sample();
 const interval=setInterval(sample,75);
 let tools=0, failures=[];
 try{
  let list=await client.listTools();tools=list.tools.length;
  for(const item of [{name:'espn_get_scoreboard',arguments:{sport:'basketball',league:'nba',limit:3}},{name:'nhl_get_scores',arguments:{}}]){
    if(!list.tools.some(t=>t.name===item.name))continue;
    try{
      const t=performance.now();
      const call=await Promise.race([client.callTool(item),new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),12000))]);
      console.log('CALL '+cfg.name+' '+item.name+' '+JSON.stringify({latencyMs:Math.round(performance.now()-t),isError:!!call.isError,contentBytes:JSON.stringify(call).length}));
    }catch(e){failures.push(item.name+':'+String(e.message).slice(0,100))}
  }
  await new Promise(ok=>setTimeout(ok,2500));
 }finally{clearInterval(interval);sample();await client.close().catch(()=>{});}
 console.log('PROFILE '+JSON.stringify({mode:cfg.name,providers:cfg.providers,toolCount:tools,initMs:Math.round(initialized),rssMaxMiB:Math.round(rssMax*10)/10,rssEndMiB:Math.round(rssAfter*10)/10,sampleCount:samples.length,failures}));
}
