import assert from 'node:assert/strict';
const root='https://sports-hub-mcp-private-production.up.railway.app';
const cases=[
 {method:'GET',path:'/health',want:200},
 {method:'GET',path:'/mcp',want:404},
 {method:'POST',path:'/mcp',want:404,body:'{}'},
 {method:'GET',path:'/v1/query',want:404},
 {method:'POST',path:'/v1/query',want:401,body:JSON.stringify({sport:'nhl',operation:'scores'})},
 {method:'POST',path:'/v1/query',want:401,authorization:'Bearer totally-incorrect-placeholder',body:JSON.stringify({sport:'nhl',operation:'scores'})}
];
for(const c of cases){const controller=new AbortController(),t=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(root+c.path,{method:c.method,headers:{...(c.authorization?{Authorization:c.authorization}:{}),...(c.body?{'Content-Type':'application/json'}:{})},body:c.body,signal:controller.signal});assert.equal(r.status,c.want,c.path+' HTTP status');let text=await r.text();if(c.path==='/health'){let json=JSON.parse(text);assert.equal(json.status,'ok')}console.log('SECURITY_OK',c.method,c.path,r.status)}finally{clearTimeout(t)}}
