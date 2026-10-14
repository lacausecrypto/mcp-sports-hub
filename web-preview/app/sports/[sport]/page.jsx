import Dashboard from '../../ui/Dashboard';
const sports=['f1','nba','nhl','mlb','nfl','football'];
export function generateStaticParams(){return sports.map(sport=>({sport}))}
export async function generateMetadata({params}){const {sport}=await params;return {title:(sport?.toUpperCase()||'Sports')+' — Sports Hub Intelligence',robots:{index:false,follow:false}}}
export default async function SportPage({params}){const {sport}=await params;return <Dashboard initialSport={sports.includes(sport)?sport:'f1'}/>}
