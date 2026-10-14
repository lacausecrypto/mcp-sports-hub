import{NextResponse}from'next/server';
import{SPORTS,PROVIDERS,callMcp,number}from'../../lib/sports';
export const runtime='nodejs';
function normalizeEvents(s,d){
if(s==='f1')return(d.MRData?.RaceTable?.Races||[]).map(x=>({id:x.round,name:x.raceName,date:x.date+'T'+(x.time||'12:00:00Z'),state:Date.parse(x.date+'T23:59:59Z')<Date.now()?'post':'pre',teams:[],sources:['F1']}));
if(s==='nhl')return(d.games||[]).map(x=>({id:x.id,name:x.awayTeam?.abbrev+' vs '+x.homeTeam?.abbrev,date:x.startTimeUTC,state:['OFF','FINAL'].includes(x.gameState)?'post':['LIVE','CRIT'].includes(x.gameState)?'in':'pre',teams:[{name:x.awayTeam?.abbrev,score:x.awayTeam?.score??null},{name:x.homeTeam?.abbrev,score:x.homeTeam?.score??null}],sources:['NHL']}));
if(s==='mlb')return(d.dates||[]).flatMap(t=>(t.games||[]).map(x=>({id:x.gamePk,name:x.teams?.away?.team?.name+' vs '+x.teams?.home?.team?.name,date:x.gameDate,state:x.status?.abstractGameState==='Final'?'post':x.status?.abstractGameState==='Live'?'in':'pre',teams:[{name:x.teams?.away?.team?.name,score:x.teams?.away?.score??null},{name:x.teams?.home?.team?.name,score:x.teams?.home?.score??null}],sources:['MLB']})));
return(d.events||[]).map(x=>({id:x.id,name:x.name,date:x.date,state:x.status?.type?.state||'pre',teams:(x.competitions?.[0]?.competitors||[]).map(t=>({name:t.team?.displayName,score:t.score??null})),sources:['ESPN']}));
}
function normalizeRanks(s,d){
if(s==='f1')return(d.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings||[]).map(x=>({name:x.Driver?.givenName+' '+x.Driver?.familyName,points:number(x.points),wins:number(x.wins),team:x.Constructors?.[0]?.name}));
if(s==='nhl')return(d.standings||[]).map(x=>({name:x.teamName?.default||x.teamAbbrev?.default,points:x.points,wins:x.wins,losses:x.losses}));
if(s==='mlb')return(d.records||[]).flatMap(x=>(x.teamRecords||[]).map(t=>({name:t.team?.name,wins:t.wins,losses:t.losses})));
return[];
}
export async function GET(req){
const sport=new URL(req.url).searchParams.get('sport')||'football';if(!SPORTS.includes(sport))return NextResponse.json({error:'Sport invalide'},{status:400});
const operations=['scores','standings'];const resolved=await Promise.allSettled(operations.map(o=>callMcp(sport,o)));
const good=i=>resolved[i].status==='fulfilled'?resolved[i].value:null;
let events=[],standings=[];try{if(good(0))events=normalizeEvents(sport,good(0).data)}catch{}try{if(good(1))standings=normalizeRanks(sport,good(1).data)}catch{}
const sources=operations.map((o,i)=>({name:good(i)?.tool||o,ok:i===0?!!good(i):!!good(i)&&standings.length>0,count:i===0?events.length:standings.length,url:PROVIDERS[sport].url,note:good(i)?.note||null,error:!good(i)?'Source indisponible':i===1&&!standings.length?'Classement non exploitable':null}));
return NextResponse.json({sport,events,standings,sources,asOf:good(0)?.asOf||good(1)?.asOf||new Date().toISOString(),mcpConnected:!!good(0)||!!good(1),partial:sources.some(x=>!x.ok)},{status:good(0)||good(1)?200:503,headers:{'Cache-Control':'public,s-maxage=60'}})
}
