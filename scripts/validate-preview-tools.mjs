import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const c=new Client({name:'sports-hub-contract-test',version:'0.1.0'});const t=new StdioClientTransport({command:process.execPath,args:['dist/index.js'],env:{...process.env,SPORTS_HUB_PROVIDERS:'espn,nhl,mlb,f1'}});await c.connect(t);
const year=String(new Date().getUTCFullYear());
const cases=[
 {name:'nhl_get_scores',arguments:{}},
 {name:'nhl_get_standings',arguments:{fields:'teamName,teamAbbrev,points,wins,losses'}},
 {name:'mlb_get_schedule',arguments:{date:new Date().toISOString().slice(0,10)}},
 {name:'mlb_get_standings',arguments:{season:year,fields:'team,wins,losses'}},
 {name:'espn_get_scoreboard',arguments:{sport:'basketball',league:'nba'}},
 {name:'espn_get_standings',arguments:{sport:'basketball',league:'nba'}},
 {name:'espn_get_standings',arguments:{sport:'soccer',league:'eng.1'}},
 {name:'f1_get_schedule',arguments:{season:year}},
 {name:'f1_get_driver_standings',arguments:{season:year}},
 {name:'f1_get_constructor_standings',arguments:{season:year}},
 {name:'f1_get_race_results',arguments:{season:year,round:'last',limit:30}},
 {name:'nhl_get_stat_leaders',arguments:{category:'points'}},
 {name:'nhl_get_stat_leaders',arguments:{category:'goals'}},
 {name:'mlb_get_league_leaders',arguments:{leaderCategories:'homeRuns',season:year,sportId:1}},
 {name:'mlb_get_league_leaders',arguments:{leaderCategories:'strikeouts',season:year,sportId:1}},
 {name:'espn_get_teams',arguments:{sport:'basketball',league:'nba',limit:40,fields:'sports'}}
];
for(const arg of cases){try{let res=await Promise.race([c.callTool(arg),new Promise((_,reject)=>setTimeout(()=>reject(new Error('12s timeout')),12000))]);const first=res.content?.find(x=>x.type==='text')?.text||'';let json;try{json=JSON.parse(first)}catch{json=null};const meta={tool:arg.name,arguments:arg.arguments,isError:!!res.isError,textSize:first.length,contentItems:res.content?.length,topLevelKeys:json&&typeof json==='object'?Object.keys(json).slice(0,18):[],arrayLengths:json&&typeof json==='object'?Object.fromEntries(Object.entries(json).filter(([k,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length])):{},standings:json?.standings?.length,races:json?.MRData?.RaceTable?.Races?.length,pilots:json?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.length,recordGroups:json?.records?.length,events:json?.events?.length,preview:json?JSON.stringify(json).slice(0,950):first.slice(0,180),note:res.content?.slice(1).map(x=>x.text).join(' ').slice(0,450)};console.log('TOOL_RESULT',JSON.stringify(meta))}catch(e){console.log('TOOL_ERROR',arg.name,String(e.message))}}
await c.close();
