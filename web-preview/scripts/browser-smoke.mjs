import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];
const fixture={sport:'f1',label:'Formula 1',provider:'Jolpica F1',asOf:new Date().toISOString(),connected:true,partial:false,sources:[{operation:'scores',name:'f1_get_schedule',provider:'Jolpica F1',ok:true,count:2,link:'https://api.jolpi.ca/'},{operation:'standings',name:'f1_get_driver_standings',provider:'Jolpica F1',ok:true,count:3,link:'https://api.jolpi.ca/'}],events:[{id:'1',title:'Test Grand Prix',date:'2026-10-14T14:00:00Z',state:'pre',round:18,teams:[],source:'Jolpica F1'}],standings:[{id:'d1',name:'Driver Alpha',team:'Team One',wins:5,points:300,position:1},{id:'d2',name:'Driver Beta',team:'Team Two',wins:3,points:240,position:2},{id:'d3',name:'Driver Gamma',team:'Team Three',wins:1,points:150,position:3}],leaders:[{id:'c1',name:'Constructor Alpha',value:500,unit:'pts'}],secondary:[],race:{name:'Test GP',rows:[{id:'d1',name:'Driver Alpha',value:25,unit:'pts'}]},teams:[]};
try{
 for(const [label,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>errors.push(label+': '+e.message));
  await page.route('**/api/data?*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)}));
  await page.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});
  await page.getByText('Beyond').first().waitFor();
  await page.getByText('Game tracker').waitFor();
  await page.getByRole('button',{name:'Visual lab',exact:true}).click({force:true});
  await page.getByText('Driver championship').waitFor();
  await page.getByRole('button',{name:/Standings/i}).click({force:true});
  await page.getByText('Driver Alpha').first().waitFor();
  await page.goto('http://127.0.0.1:3000/privacy');
  await page.getByText('Confidentialité & RGPD').first().waitFor();
  await page.goto('http://127.0.0.1:3000/cookies');
  await page.getByText('Cookies et traceurs').first().waitFor();
  const measurements=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
  assert.ok(measurements.scrollWidth<=width+2,label+' horizontal overflow: '+JSON.stringify(measurements));
  console.log('BROWSER_OK',label,'visuals, standings and privacy/cookie pages');
  await page.close();
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close()}
