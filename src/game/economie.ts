// Kamers, inzet en prijsverdeling. Alles werkt met fiches. Fiches zijn
// fictieve punten voor de lol. Geen echt geld, niet te kopen en niet uit te
// betalen. Zo blijft dit een spel en geen gokdienst.

import type { GameConfig, Player } from "./types";
import { leesJson, schrijfJson } from "@/lib/storage";

const FICHES_SLEUTEL = "pisipisi.fiches";
export const START_FICHES = 1000;

export interface Kamer {
  id: string;
  naam: string;
  inleg: number; // in fiches, 0 bij de hobbykamer
  hobby: boolean;
  accent: string;
}

// De beschikbare kamers. De hobbykamer is gratis, de rest heeft een inleg.
export const KAMERS: Kamer[] = [
  { id: "hobby", naam: "Hobbykamer", inleg: 0, hobby: true, accent: "#238a5f" },
  { id: "k5", naam: "Kamer 5", inleg: 5, hobby: false, accent: "#f2b03d" },
  { id: "k10", naam: "Kamer 10", inleg: 10, hobby: false, accent: "#f2b03d" },
  { id: "k15", naam: "Kamer 15", inleg: 15, hobby: false, accent: "#f57f3d" },
  { id: "k20", naam: "Kamer 20", inleg: 20, hobby: false, accent: "#f57f3d" },
  { id: "k50", naam: "Kamer 50", inleg: 50, hobby: false, accent: "#e01f3d" },
  { id: "k100", naam: "Kamer 100", inleg: 100, hobby: false, accent: "#e01f3d" },
];

export function kamerById(id: string): Kamer {
  return KAMERS.find((k) => k.id === id) ?? KAMERS[0];
}

export const MAX_SPELERS = 10;

// Waar je voor speelt. De pot speel je altijd. 1e en 3e kaart zijn optioneel.
// 3e kost de helft van de kamerinzet extra, 1e een kwart extra.
export interface SpelInzet {
  eerste: boolean; // meespelen om de 1e-kaart prijs
  derde: boolean; // meespelen om de 3e-kaart prijs
}

export const STANDAARD_INZET: SpelInzet = { eerste: false, derde: false };
export const EERSTE_FACTOR = 0.25;
export const DERDE_FACTOR = 0.5;

function afrondCent(n: number): number {
  return Math.round(n * 100) / 100;
}

// Wat één speler betaalt bij deze kamer en keuzes.
export function totaleInleg(basis: number, sel: SpelInzet): number {
  let inleg = basis; // pot altijd
  if (sel.derde) inleg += basis * DERDE_FACTOR;
  if (sel.eerste) inleg += basis * EERSTE_FACTOR;
  return afrondCent(inleg);
}

export interface PrijzenPot {
  totaal: number;
  eerste: number;
  derde: number;
  pot: number;
}

// De prijzenpotten. Iedere speler die meedoet vult de betreffende pot.
export function berekenPools(
  basis: number,
  aantalSpelers: number,
  sel: SpelInzet,
): PrijzenPot {
  const pot = afrondCent(basis * aantalSpelers);
  const eerste = sel.eerste
    ? afrondCent(basis * EERSTE_FACTOR * aantalSpelers)
    : 0;
  const derde = sel.derde ? afrondCent(basis * DERDE_FACTOR * aantalSpelers) : 0;
  return { totaal: afrondCent(pot + eerste + derde), eerste, derde, pot };
}

// Aantal kaarten dat een speler al kwijt is. Strafkaarten tellen mee zodat
// een foute tik je voortgang terugdraait.
export function kaartenKwijt(config: GameConfig, speler: Player): number {
  return config.startKaarten - speler.hand.length + speler.strafkaarten;
}

export function leesFiches(): number {
  return leesJson<number>(FICHES_SLEUTEL, START_FICHES);
}

export function schrijfFiches(waarde: number): void {
  schrijfJson(FICHES_SLEUTEL, Math.max(0, afrondCent(waarde)));
}

export function wijzigFiches(delta: number): number {
  const nieuw = Math.max(0, afrondCent(leesFiches() + delta));
  schrijfFiches(nieuw);
  return nieuw;
}

export function resetFiches(): number {
  schrijfFiches(START_FICHES);
  return START_FICHES;
}

// Toon bedragen als euro. Dit is een testversie, er wordt nog geen echt geld
// verwerkt. De euro is hier alleen een label voor het gevoel.
export function euro(n: number): string {
  const heel = Math.round(n * 100) % 100 === 0;
  return heel
    ? `\u20ac ${Math.round(n)}`
    : `\u20ac ${n.toFixed(2).replace(".", ",")}`;
}
