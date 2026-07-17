# Pese Pese

Digitale versie van het Surinaamse reactiespel Pese Pese. Gebouwd als
mobiele webapp en installeerbare PWA met Next.js, React, TypeScript en
Tailwind CSS.

## Wat het is

Iedereen krijgt kaarten in de hand. De spelleider draait steeds een kaart
open. Zie je dezelfde kaart in je eigen hand, tik er dan snel op. Wie als
eerste al zijn kaarten kwijt is, wint.

Drie manieren om te spelen:

- Tegen de computer, 1 mens tegen 1 tot 3 computerspelers.
- Samen op 1 apparaat, 2 tot 4 spelers om hetzelfde scherm.
- Oefenen, rustig leren zonder tijdsdruk.

## Lokaal draaien

Je hebt Node 18 of hoger nodig.

```bash
npm install
npm run dev
```

Open daarna http://localhost:3000.

## Handige commando's

```bash
npm run dev        # ontwikkelserver
npm run build      # productiebuild
npm run start      # productieserver (na build)
npm run lint       # eslint
npm run typecheck  # TypeScript controleren
npm test           # unit tests (spelengine)
```

## Naar Vercel zetten

1. Zet de map in een Git repository (GitHub, GitLab of Bitbucket).
2. Ga naar vercel.com, kies New Project en importeer de repository.
3. Vercel herkent Next.js automatisch. Klik Deploy. Je hoeft niets in te
   stellen, er zijn geen omgevingsvariabelen nodig.
4. Na de build krijg je een live url. De PWA werkt daar meteen, inclusief
   installeren op je telefoon en offline spelen.

Wil je het zonder Git doen, dan kan het ook met de Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Spelregels aanpassen

Alle standaardregels staan op 1 plek: `src/game/config.ts`. Daar pas je aan:

- `STANDAARD_CONFIG`, de standaardinstellingen (aantal startkaarten,
  reactietijd, strafkaart aan of uit, jokers, computer snelheid).
- `COMPUTER_PROFIEL`, hoe snel en hoe foutgevoelig de computerspelers zijn.
- `STRAF_AANTAL`, hoeveel strafkaarten je pakt bij een foute tik.
- `COMPUTER_NAMEN` en `AVATARS`, de namen en emoji van spelers.

De spelregels zelf (matchen, winnen, strafkaart, hervullen van stapels)
staan in `src/game/engine.ts`. Alle functies daar zijn puur en worden
gedekt door de tests in `src/__tests__`.

## Structuur

```
src/
  app/            de schermen (Next.js App Router)
  components/     herbruikbare UI (kaart, knop, schakelaar, schermkader)
  game/           spelengine, types, AI, config, useGame hook
  lib/            opslag, statistieken, feedback, geluid, instellingen
  i18n/           vertaalsysteem (nl, en, srn)
  __tests__/      unit tests voor de engine
public/           manifest, service worker, iconen
```

## Testgegevens

Feedback en telemetrie blijven lokaal op het apparaat. De testbegeleider
kan ze bekijken en exporteren via het dashboard op `/dashboard`
(pincode 2580). Wissen kan via Statistieken of via het dashboard.
