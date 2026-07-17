// Statistieken en testgegevens. Alles lokaal opgeslagen, verwijderbaar en
// exporteerbaar.

import type { SpelModus } from "@/game/types";
import { leesJson, schrijfJson, verwijder } from "./storage";

const STATS_SLEUTEL = "pisipisi.stats";
const TELEMETRIE_SLEUTEL = "pisipisi.telemetrie";

export interface SpelerStats {
  spellen: number;
  gewonnen: number;
  verloren: number;
  snelsteReactieMs: number | null;
  totaleReactieMs: number;
  reactieMetingen: number;
  fouteTikken: number;
  modusTellingen: Record<string, number>;
  laatstGespeeld: number | null;
}

export const LEGE_STATS: SpelerStats = {
  spellen: 0,
  gewonnen: 0,
  verloren: 0,
  snelsteReactieMs: null,
  totaleReactieMs: 0,
  reactieMetingen: 0,
  fouteTikken: 0,
  modusTellingen: {},
  laatstGespeeld: null,
};

export function leesStats(): SpelerStats {
  return leesJson<SpelerStats>(STATS_SLEUTEL, LEGE_STATS);
}

export interface SpelResultaat {
  modus: SpelModus;
  gewonnenDoorMens: boolean;
  afgebroken: boolean;
  duurMs: number;
  rondes: number;
  fouteTikkenMens: number;
  snelsteReactieMs: number | null;
  gemiddeldeReactieMs: number | null;
  winnaarNaam: string;
}

export function verwerkResultaat(res: SpelResultaat): SpelerStats {
  const stats = leesStats();
  const nieuw: SpelerStats = {
    ...stats,
    spellen: stats.spellen + 1,
    gewonnen: stats.gewonnen + (res.gewonnenDoorMens ? 1 : 0),
    verloren:
      stats.verloren + (!res.gewonnenDoorMens && !res.afgebroken ? 1 : 0),
    fouteTikken: stats.fouteTikken + res.fouteTikkenMens,
    modusTellingen: {
      ...stats.modusTellingen,
      [res.modus]: (stats.modusTellingen[res.modus] ?? 0) + 1,
    },
    laatstGespeeld: Date.now(),
  };
  if (res.snelsteReactieMs !== null) {
    nieuw.snelsteReactieMs =
      stats.snelsteReactieMs === null
        ? res.snelsteReactieMs
        : Math.min(stats.snelsteReactieMs, res.snelsteReactieMs);
    nieuw.totaleReactieMs = stats.totaleReactieMs + res.snelsteReactieMs;
    nieuw.reactieMetingen = stats.reactieMetingen + 1;
  }
  schrijfJson(STATS_SLEUTEL, nieuw);
  registreerTelemetrie(res);
  return nieuw;
}

export function gemiddeldeReactie(stats: SpelerStats): number | null {
  if (stats.reactieMetingen === 0) return null;
  return Math.round(stats.totaleReactieMs / stats.reactieMetingen);
}

export function favorieteModus(stats: SpelerStats): string | null {
  const paren = Object.entries(stats.modusTellingen);
  if (paren.length === 0) return null;
  paren.sort((a, b) => b[1] - a[1]);
  return paren[0][0];
}

export function wisStats(): void {
  verwijder(STATS_SLEUTEL);
}

// Telemetrie per spel voor het testdashboard.
export interface TelemetrieItem {
  op: number;
  modus: SpelModus;
  duurMs: number;
  rondes: number;
  voltooid: boolean;
  afgebroken: boolean;
  fouteTikken: number;
  winnaar: string;
}

export function leesTelemetrie(): TelemetrieItem[] {
  return leesJson<TelemetrieItem[]>(TELEMETRIE_SLEUTEL, []);
}

function registreerTelemetrie(res: SpelResultaat): void {
  const lijst = leesTelemetrie();
  lijst.push({
    op: Date.now(),
    modus: res.modus,
    duurMs: res.duurMs,
    rondes: res.rondes,
    voltooid: !res.afgebroken,
    afgebroken: res.afgebroken,
    fouteTikken: res.fouteTikkenMens,
    winnaar: res.winnaarNaam,
  });
  schrijfJson(TELEMETRIE_SLEUTEL, lijst.slice(-500));
}

export function wisTelemetrie(): void {
  verwijder(TELEMETRIE_SLEUTEL);
}

export function formatteerDuur(ms: number): string {
  const totaalSec = Math.round(ms / 1000);
  const min = Math.floor(totaalSec / 60);
  const sec = totaalSec % 60;
  if (min === 0) return `${sec}s`;
  return `${min}m ${sec.toString().padStart(2, "0")}s`;
}
