const securityHeaders=[
{key:'X-Content-Type-Options',value:'nosniff'},
{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
{key:'X-Frame-Options',value:'DENY'},
{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=()'},
{key:'Strict-Transport-Security',value:'max-age=63072000; includeSubDomains; preload'},
{key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests"}
];
export default {reactStrictMode:true,poweredByHeader:false,async headers(){return [{source:'/(.*)',headers:securityHeaders}]}};
