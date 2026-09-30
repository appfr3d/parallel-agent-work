# BG — Bekk's Gang

En liten, fiktiv nyhetsavis om konsulent-Norge. Prosjektet er laget som workshop-eksempel med React, Express og en lokal JSON-database.

## Kom i gang

Installer Node.js 20.19 eller nyere. Fra prosjektmappen:

```sh
npm install
npm run dev
```

Åpne [http://localhost:5173](http://localhost:5173). Express API-et kjører på [http://localhost:3001](http://localhost:3001).

Du kan også bygge frontend med `npm run build` og kjøre API-et med `npm start`.

## Slik henger det sammen

- `src/` er React-nettsiden, servert og bygget av Vite.
- `server/index.js` er Express API-et.
- `server/data/news.json` er den lokale databasen med fem oppdiktede artikler.
- `GET /api/articles` henter alle artiklene. `GET /api/articles/:slug` henter én artikkel.
- `@kilden/designsystem` leverer Kilden-stiler og skrifter. Siden bruker de semantiske fargetokenene i temaet `ild-light`.

Dataene ligger som vanlig JSON, så det er ingen database-server eller plattformspesifikke binærfiler å installere. Artiklene er oppdiktet, og bildefilene lastes fra Unsplash. Kildens fonter følger med npm-pakken.
