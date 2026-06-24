# Privacy Policy — Sports Hub MCP Server

_Last updated: 2026-06-24_

This privacy policy describes how the **Sports Hub MCP Server** (`mcp-sports-hub`,
the "Software") handles data. It applies to the open-source software published at
<https://github.com/lacausecrypto/mcp-sports-hub> and on npm as `mcp-sports-hub`.

## Summary

The Software is a self-hosted [Model Context Protocol](https://modelcontextprotocol.io)
server that you run yourself — locally over stdio, or as your own HTTP service. **It
contains no analytics, no telemetry, and no tracking of any kind.** The author
operates no server and receives no data from your use of the Software.

## What the Software does

When your MCP client (e.g. Claude, Cursor, VS Code, Cline) invokes one of the
Software's tools, the Software forwards the parameters of that request to the
relevant third-party sports-data API, and returns the API's response to your
client. That is the entirety of its data flow.

## Data the Software collects

**None.** The author does not collect, store, sell, or transmit any personal data.
Specifically:

- **No telemetry / analytics.** The Software ships with no usage tracking,
  fingerprinting, or phone-home behaviour.
- **No account.** Using the Software requires no registration with the author.
- **No persistent storage of your queries.** Responses from upstream APIs are
  cached **in memory only** (default TTL 60 seconds, LRU-capped, configurable via
  `SPORTS_HUB_CACHE_TTL`). The cache is never written to disk and is discarded when
  the process exits.
- **Logs.** Diagnostic messages are written to standard error on the machine where
  you run the Software. They stay on your machine; the author never receives them.

## API keys and credentials

Some providers require an API key. You supply these through environment variables
(optionally via a local, git-ignored `.env` file). Keys:

- are read only from your environment, on your machine;
- are sent **only** to the corresponding provider's API, over HTTPS, to authenticate
  your own requests;
- are never transmitted to the author or any third party other than the provider the
  key belongs to;
- are never logged.

## Third-party services

The Software is an aggregator: each tool call reaches a third-party sports-data
provider (for example ESPN, NHL, MLB Stats API, The Odds API, API-Football, and
others — see the [provider reference](https://github.com/lacausecrypto/mcp-sports-hub#provider-reference)).
When you use a tool, the query you send is processed by that provider under **its own
privacy policy and terms of service**. The author of the Software is not responsible
for the data practices of those providers; please review the policy of any provider
whose tools you use.

## Data you send to upstream providers

The only data leaving your machine is the request parameters you (or your AI client)
pass to a tool — for example a team name, a date, a player ID, or a league code — sent
to the provider needed to answer it, plus any API key required to authenticate that
request. The Software adds no hidden parameters and no identifying information.

## Children's privacy

The Software is a developer tool and is not directed at children. It collects no
personal data from anyone, including children.

## Hosting it yourself for others

If you deploy the Software's HTTP transport as a service for other people, **you** are
the operator of that service and the data controller for its users; this policy then
describes only the behaviour of the Software itself, not any logging, storage, or
analytics you may add around it.

## Changes to this policy

This policy may be updated over time. Material changes will be reflected in this file,
with a new "Last updated" date, in the project's public repository.

## Contact

Questions about this policy can be raised by opening an issue at
<https://github.com/lacausecrypto/mcp-sports-hub/issues>.
