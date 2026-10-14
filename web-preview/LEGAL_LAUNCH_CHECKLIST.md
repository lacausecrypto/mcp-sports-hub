# Fieldnotes / Sports Hub — conditions for public launch

Last checked: 2026-10-14. The current Vercel deployment is an explicitly **non-indexed preview**, not a legally certified public product.

## Already implemented and observed

- [x] Privacy/GDPR notice at `/privacy` and legal identification page at `/legal`.
- [x] Cookie information at `/cookies` and product explanation at `/about`.
- [x] Sitewide footer links to these pages, including on sport routes.
- [x] No analytics, advertising tags, embedded social plugins or remote web fonts in the application.
- [x] No application-authored tracking cookies; inspect platform cookies independently after configuration changes.
- [x] HTTPS on Vercel and Railway; server-to-server token; the raw MCP endpoint is not exposed.
- [x] CSP, HSTS, Referrer-Policy, frame protection, no camera/microphone/geolocation/payment permissions.
- [x] Preview `noindex` and disallowed crawler robots.
- [x] Six free sports datasets verified through a restricted MCP gateway; downstream failures clearly flagged.
- [x] Next.js 16.4.0; `npm audit` found zero known vulnerabilities in the CI install.
- [x] No questions sent to a generative AI provider; factual prompts processed on server and mapped to a limited subset of sports data.

## Required before moving to a public/indexed site

- [ ] Determine and accurately publish the **real controller/operator** and legal nature (individual/non-commercial vs enterprise). Provide the actual name/legal entity, geographical address, private contact email, and where applicable BCE/TVA identifiers. Never substitute a GitHub username for controller identity.
- [ ] Put in place a usable private channel for **data-subject requests**, document process and verification, and decide whether a DPO is legally required.
- [ ] Verify and document **actual log retention periods**, processors, locations of processing, international data transfers, processing agreements and security measures for Vercel/Railway and any infrastructure providers.
- [ ] Conduct and record an **Article 6(1)(f) legitimate-interest balancing assessment**, if this remains the legal basis for security and service logs.
- [ ] Inspect cookies, localStorage, IP headers and automated scripts using browser devtools in multiple scenarios (unauthenticated, authenticated preview protection, mobile). Record name, domain, scope, lifetime, purpose and provider of any necessary cookies.
- [ ] If optional analytics, social embeds, advertising or preference tracking is enabled in the future, implement **granular prior consent**, equal accept/reject prominence, revocation and blocking before consent.
- [ ] Verify **data redistribution, source licenses, attribution and logo/trademark rights** for ESPN, NHL, MLB and Jolpica F1, including API restrictions, commercial rights, display and caching conditions. An open-source MCP code license is not an upstream data license.
- [ ] Document security and traffic-abuse tests for the Vercel public API, including distributed rate limiting and a load test; consider security policies for preview protection.
- [ ] Reassess privacy policy after additions of tracking, accounts, personal data, exports or customer payments.
- [ ] Have legal counsel review publication details if required by the owner's status and intended use.

Official references:
- Belgian DPA cookies: https://www.autoriteprotectiondonnees.be/professionnel/themes/internet/cookies
- SPF Economie mandatory identification: https://economie.fgov.be/fr/themes/line/commerce-electronique/vente-par-internet/site-dentreprise-et-comptes
- EU GDPR Articles 12–14: https://eur-lex.europa.eu/eli/reg/2016/679/oj
