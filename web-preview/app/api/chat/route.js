import {NextResponse} from 'next/server';
import {GET as getData} from '../data/route';
export const runtime='nodejs';
const valid=new Set(['f1','nhl','mlb','nba','nfl','football']);
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export async function POST(request){
 const origin=request.headers.get('origin');
 if(origin){try{if(new URL(origin).host!==request.headers.get('host'))return NextResponse.json({error:'Origin blocked'},{status:403,headers})}catch{return NextResponse.json({error:'Invalid origin'},{status:403,headers})}}
 if(Number(request.headers.get('content-length')||0)>1800)return NextResponse.json({error:'Too large'},{status:413,headers});
 let o;try{o=await request.json()}catch{return NextResponse.json({error:'Invalid request'},{status:400,headers})}
 const sport=String(o.sport||''),question=String(o.question||'').trim();
 if(!valid.has(sport)||question.length<4||question.length>300)return NextResponse.json({error:'Invalid parameters'},{status:400,headers});
 const q=question.toLowerCase();
 if(!/rank|table|stand|leader|top|point|goal|win|race|result|score|match|game|next|schedule|team|driver|constructor|classement|pilote|équipe|equipe|match|course|buts|points|prochain|victoire/.test(q))return NextResponse.json({answer:'I can only answer factual sports-data questions from this dashboard. Try asking about rankings, games or statistical leaders.',llm:false,sources:[]},{headers});
 const dataResp=await getData(new Request('https://internal/api/data?sport='+sport));
 if(!dataResp.ok)return NextResponse.json({answer:'The MCP sources are currently unavailable. I cannot verify that answer.',llm:false,sources:[]},{headers});
 const d=await dataResp.json();
 let a;
 const wantsLeaders=/leader|top|best|buts|goals|home run|strike|meilleur|leader/.test(q);
 const wantsTable=/stand|rank|table|classement|points|victoire/.test(q)&&!wantsLeaders;
 const wantsNext=/next|upcoming|prochain|calendrier/.test(q);
 if(wantsLeaders&&d.leaders?.length){a=d.leaders.slice(0,8).map((v,i)=>(i+1)+'. '+v.name+' — '+v.value+' '+v.unit).join('\n')}
 else if(wantsTable){a=d.standings?.length?d.standings.slice(0,10).map((v,i)=>(i+1)+'. '+v.name+' — '+(v.points!==null&&v.points!==undefined?v.points+' pts':v.wins!==null?v.wins+' wins':'n/a')).join('\n'):'This provider has not returned usable standings for the selected sport.'}
 else{const matches=wantsNext?d.events.filter(x=>x.state==='pre'):d.events;a=matches.length?matches.slice(0,9).map(g=>g.title+' · '+g.date+' · '+(g.teams||[]).map(t=>t.abbr+': '+(t.score??'—')).join(' / ')).join('\n'):'No matching games or races were returned in the available feed.'}
 return NextResponse.json({answer:a,asOf:d.asOf,llm:false,sources:d.sources.filter(s=>s.ok).slice(0,4).map(s=>({name:s.provider+' / '+s.name,url:s.link}))},{headers});
}
