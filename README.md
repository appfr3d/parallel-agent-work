# BG — Bekk's Gang

En liten, fiktiv nyhetsavis om konsulent-Norge. Prosjektet er laget som workshop-eksempel med React, Express, TypeScript og en lokal JSON-database.

## Kom i gang

Installer Node.js 20.19 eller nyere. Fra prosjektmappen:

```sh
npm install
npm run dev
```

Åpne [http://localhost:5173](http://localhost:5173). Express API-et kjører på [http://localhost:3001](http://localhost:3001).

Du kan også bygge frontend med `npm run build` og kjøre API-et med `npm start`.

## Parallelle worktrees med Portless

Kjør `npm run dev:portless` for å få en navngitt lokal URL som er unik for Git-worktreet. Det gjør det enklere å kjøre og sammenligne flere agentversjoner samtidig på samme maskin. Den vanlige `npm run dev` er fortsatt tilgjengelig for oppsettet uten Portless. Første Portless-oppstart kan be om å sette opp lokal HTTPS og proxy.

Se [WORKSHOP_PORTLESS.md](./WORKSHOP_PORTLESS.md) for oppsett og workshopoppgaver.

## Slik henger det sammen

- `src/` er React-nettsiden i TypeScript, servert og bygget av Vite.
- `server/index.ts` er Express API-et i TypeScript.
- `shared/news.ts` definerer TypeScript-skjemaet for artikler og databasen, brukt av både API og frontend.
- `server/data/news.json` er den lokale databasen med fem oppdiktede artikler.
- `GET /api/articles` henter alle artiklene. `GET /api/articles/:slug` henter én artikkel.
- `@kilden/designsystem` leverer Kilden-stiler og skrifter. Siden bruker de semantiske fargetokenene i temaet `ild-light`.

Dataene ligger som vanlig JSON, så det er ingen database-server eller plattformspesifikke binærfiler å installere. Artiklene er oppdiktet, og bildefilene lastes fra Unsplash. Kildens fonter følger med npm-pakken.
