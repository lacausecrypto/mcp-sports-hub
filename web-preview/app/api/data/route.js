import {NextResponse} from 'next/server';
export const runtime='nodejs';
const SPORTS={f1:{label:'Formula 1',provider:'Jolpica F1',url:'https://api.jolpi.ca/'},nhl:{label:'NHL',provider:'NHL Web API',url:'https://api-web.nhle.com/'},mlb:{label:'MLB',provider:'MLB Stats API',url:'https://statsapi.mlb.com/'},nba:{label:'NBA',provider:'ESPN',url:'https://site.api.espn.com/'},nfl:{label:'NFL',provider:'ESPN',url:'https://site.api.espn.com/'},football:{label:'Premier League',provider:'ESPN',url:'https://site.api.espn.com/'}};
const str=x=>typeof x==='string'?x:String(x??'');
const num=x=>x===null||x===undefined||x===''?null:(Number.isFinite(Number(x))?Number(x):null);
const limit=(arr,n=50)=>Array.isArray(arr)?arr.slice(0,n):[];
const nameObj=x=>typeof x==='object'&&x!==null?(x.default||x.name||''):str(x);
const scoreState=x=>{if(['post','in','pre'].includes(x))return x;return 'pre'};
async function call(sport,operation){
 const url=process.env.SPORTS_HUB_GATEWAY_URL,token=process.env.SPORTS_HUB_GATEWAY_TOKEN;
 if(!url||!url.startsWith('https://')||!token)throw Error('gateway-unconfigured');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12500);
 try{
 const res=await fetch(url,{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token},body:JSON.stringify({sport,operation}),cache:'no-store',signal:controller.signal});
 if(!res.ok)throw Error('gateway-http-'+res.status);
 const raw=await res.json();if(typeof raw.content!=='string'||typeof raw.tool!=='string')throw Error('gateway-envelope-invalid');
 const data=JSON.parse(raw.content);if(typeof data!=='object'||!data)throw Error('upstream-payload-invalid');
 return {data,tool:raw.tool,asOf:raw.asOf,note:raw.note||'',cached:!!raw.cached};
 }finally{clearTimeout(timer)}
}
function events(sport,d){
 if(sport==='f1')return limit(d.MRData?.RaceTable?.Races,30).map(r=>({id:'f1:'+r.round,title:r.raceName,date:r.date+'T'+(r.time||'12:00:00Z'),state:Date.parse(r.date+'T23:59:59Z')<Date.now()?'post':'pre',venue:r.Circuit?.circuitName||'',location:[r.Circuit?.Location?.locality,r.Circuit?.Location?.country].filter(Boolean).join(', '),teams:[],series:[],round:num(r.round),source:'Jolpica F1'}));
 if(sport==='nhl')return limit(d.games,80).map(g=>({id:'nhl:'+g.id,title:[g.awayTeam?.abbrev,g.homeTeam?.abbrev].filter(Boolean).join(' @ '),date:g.startTimeUTC,state:['OFF','FINAL'].includes(g.gameState)?'post':['LIVE','CRIT'].includes(g.gameState)?'in':'pre',venue:g.venue?.default||'',teams:[{name:g.awayTeam?.abbrev||'Away',abbr:g.awayTeam?.abbrev||'',score:num(g.awayTeam?.score),home:false},{name:g.homeTeam?.abbrev||'Home',abbr:g.homeTeam?.abbrev||'',score:num(g.homeTeam?.score),home:true}],series:[],source:'NHL Web API'}));
 if(sport==='mlb')return limit(d.dates,8).flatMap(day=>limit(day.games,40).map(g=>({id:'mlb:'+g.gamePk,title:[g.teams?.away?.team?.name,g.teams?.home?.team?.name].filter(Boolean).join(' @ '),date:g.gameDate,state:g.status?.abstractGameState==='Final'?'post':g.status?.abstractGameState==='Live'?'in':'pre',venue:g.venue?.name||'',teams:[{name:g.teams?.away?.team?.name||'Away',abbr:'AWY',score:num(g.teams?.away?.score),home:false},{name:g.teams?.home?.team?.name||'Home',abbr:'HME',score:num(g.teams?.home?.score),home:true}],series:[],source:'MLB Stats API'}))).slice(0,65);
 return limit(d.events,75).map(e=>{const competitors=limit(e.competitions?.[0]?.competitors,2);let teams=competitors.map(t=>({name:t.team?.displayName||t.team?.name||'Unknown',abbr:t.team?.abbreviation||'',score:num(t.score),home:t.homeAway==='home',periods:limit(t.linescores,8).map(x=>num(x.value))}));const totalPeriods=Math.max(0,...teams.map(t=>t.periods.length));let series=Array.from({length:Math.min(totalPeriods,8)},(_,i)=>({period:'P'+(i+1),a:teams[0]?.periods[i]??null,b:teams[1]?.periods[i]??null}));return{id:'espn:'+e.id,title:e.name||'',date:e.date||'',state:scoreState(e.status?.type?.state),venue:e.competitions?.[0]?.venue?.fullName||'',teams,series,source:'ESPN'}});
}
function rankings(sport,d){
 if(sport==='f1')return limit(d.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings,40).map(x=>({id:x.Driver?.driverId||str(x.position),name:[x.Driver?.givenName,x.Driver?.familyName].filter(Boolean).join(' '),short:x.Driver?.code||'',team:x.Constructors?.[0]?.name||'',points:num(x.points),wins:num(x.wins),losses:null,position:num(x.position)}));
 if(sport==='nhl')return limit(d.standings,40).map((x,i)=>({id:x.teamAbbrev?.default||String(i),name:nameObj(x.teamName)||nameObj(x.teamAbbrev)||'Unknown',short:nameObj(x.teamAbbrev),team:nameObj(x.divisionName),points:num(x.points),wins:num(x.wins),losses:num(x.losses),position:num(x.leagueSequence)||i+1}));
 if(sport==='mlb')return limit(d.records,10).flatMap(g=>limit(g.teamRecords,20).map(x=>({id:String(x.team?.id||''),name:x.team?.name||'Unknown',short:'',team:'',points:null,wins:num(x.wins),losses:num(x.losses),pct:num(x.winningPercentage),position:num(x.divisionRank)}))).slice(0,40).sort((a,b)=>(b.wins||0)-(a.wins||0));
 const out=[];
 function walk(x,depth=0){if(!x||typeof x!=='object'||depth>9)return;if(Array.isArray(x))return x.forEach(v=>walk(v,depth+1));if(x.team&&Array.isArray(x.stats)){const get=k=>num(x.stats.find(v=>v.name===k)?.value);out.push({id:String(x.team.id||''),name:x.team.displayName||'',short:x.team.abbreviation||'',points:get('points'),wins:get('wins'),losses:get('losses'),position:null})}Object.entries(x).forEach(([k,v])=>{if(k!=='team'&&k!=='stats')walk(v,depth+1)})}walk(d);return [...new Map(out.map(t=>[t.id||t.name,t])).values()].slice(0,40);
}
function leaders(sport,d,kind){
 if(sport==='f1'&&kind==='insights')return limit(d.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings,20).map(x=>({id:x.Constructor?.constructorId||'',name:x.Constructor?.name||'',team:x.Constructor?.nationality||'',value:num(x.points),unit:'pts',wins:num(x.wins),rank:num(x.position)}));
 if(sport==='f1'&&kind==='insights2'){const race=d.MRData?.RaceTable?.Races?.[0];return {race:race?{name:race.raceName,date:race.date,round:num(race.round),rows:limit(race.Results,16).map(x=>({id:x.Driver?.driverId||'',name:[x.Driver?.givenName,x.Driver?.familyName].filter(Boolean).join(' '),team:x.Constructor?.name||'',rank:num(x.position),value:num(x.points),unit:'pts',status:x.status||''}))}:null}};
 if(sport==='nhl')return limit(d[kind==='insights'?'points':'goals'],20).map((x,i)=>({id:String(x.id||i),name:[nameObj(x.firstName),nameObj(x.lastName)].filter(Boolean).join(' '),team:x.teamAbbrev||'',value:num(x.value),unit:kind==='insights'?'pts':'goals',rank:i+1}));
 if(sport==='mlb')return limit(d.leagueLeaders,10).flatMap(g=>limit(g.leaders,20).map(x=>({id:String(x.person?.id||''),name:x.person?.fullName||'',team:x.team?.name||'',value:num(x.value),unit:kind==='insights'?'HR':'K',rank:num(x.rank)}))).filter(x=>x.name&&x.value!==null).filter((v,i,a)=>a.findIndex(o=>o.id===v.id)===i).sort((a,b)=>b.value-a.value).slice(0,12);
 if(kind==='insights')return limit(d.sports,5).flatMap(s=>limit(s.leagues,10).flatMap(l=>limit(l.teams,45).map(x=>x.team||x))).map(t=>({id:str(t.id),name:t.displayName||t.name||'',team:t.abbreviation||'',color:/^[a-f\d]{6}$/i.test(t.color||'')?'#'+t.color:null,value:null,unit:'team'})).filter(t=>t.name).slice(0,40);
 return [];
}
export async function GET(req){
 const u=new URL(req.url);const sport=u.searchParams.get('sport')||'f1';if(!SPORTS[sport])return NextResponse.json({error:'Sport not supported'},{status:400,headers:{'Cache-Control':'no-store'}});
 const operations=sport==='nba'||sport==='nfl'||sport==='football'?['scores','standings','insights']:['scores','standings','insights','insights2'];
 const work=await Promise.allSettled(operations.map(op=>call(sport,op)));
 const sources=[],result={events:[],standings:[],leaders:[],secondary:[],race:null,teams:[]};let time=null;let connected=false;
 work.forEach((w,i)=>{const op=operations[i],ok=w.status==='fulfilled',data=ok?w.value:null;let count=0,error=null;if(ok){connected=true;time=time||data.asOf;try{
 if(op==='scores'){result.events=events(sport,data.data);count=result.events.length}
 else if(op==='standings'){result.standings=rankings(sport,data.data);count=result.standings.length}
 else if(op==='insights'){const x=leaders(sport,data.data,op);if(sport==='nba'||sport==='nfl'||sport==='football')result.teams=x;else result.leaders=x;count=x.length}
 else if(op==='insights2'){const x=leaders(sport,data.data,op);if(sport==='f1'){result.race=x.race;count=x.race?.rows?.length||0}else{result.secondary=x;count=x.length}}
 }catch{error='Unrecognized source format'}}else{error='Source temporarily unavailable'}
 const empty=ok&&count===0;if(empty&&!error)error='No usable records returned';
 sources.push({operation:op,name:data?.tool||op,provider:SPORTS[sport].provider,link:SPORTS[sport].url,ok:ok&&!error,count,at:data?.asOf||null,partial:!!data?.note,note:data?.note||null,error});
 });
 return NextResponse.json({sport,label:SPORTS[sport].label,provider:SPORTS[sport].provider,asOf:time,connected,partial:sources.some(x=>!x.ok||x.partial),sources,...result},{status:connected?200:503,headers:{'Cache-Control':connected?'public, s-maxage=45, stale-while-revalidate=120':'no-store','X-Content-Type-Options':'nosniff'}});
}
