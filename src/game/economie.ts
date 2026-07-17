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

// Verdeling van de pot over de drie prijzen, in procenten. Samen 100.
export interface PrijsVerdeling {
  eerste: number; // prijs voor wie als eerste 1 kaart kwijt is
  derde: number; // prijs voor wie als eerste 3 kaarten kwijt is
  pot: number; // hoofdprijs voor wie als eerste alle kaarten kwijt is
}

export const STANDAARD_VERDELING: PrijsVerdeling = {
  eerste: 20,
  derde: 30,
  pot: 50,
};

export const VERDELING_PRESETS: { label: string; verdeling: PrijsVerdeling }[] =
  [
    { label: "Winnaar pakt veel", verdeling: { eerste: 10, derde: 20, pot: 70 } },
    { label: "Gelijk verdeeld", verdeling: { eerste: 20, derde: 30, pot: 50 } },
    { label: "Elk deel telt", verdeling: { eerste: 33, derde: 33, pot: 34 } },
  ];

export interface PrijzenPot {
  totaal: number;
  eerste: number;
  derde: number;
  pot: number;
}

// Rekent de pot en de drie prijzen uit. Afrondingsrest gaat naar de hoofdpot.
export function berekenPrijzen(
  inleg: number,
  aantalSpelers: number,
  verdeling: PrijsVerdeling,
): PrijzenPot {
  const totaal = inleg * aantalSpelers;
  const eerste = Math.floor((totaal * verdeling.eerste) / 100);
  const derde = Math.floor((totaal * verdeling.derde) / 100);
  const pot = totaal - eerste - derde;
  return { totaal, eerste, derde, pot };
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
  schrijfJson(FICHES_SLEUTEL, Math.max(0, Math.round(waarde)));
}

export function wijzigFiches(delta: number): number {
  const nieuw = Math.max(0, leesFiches() + delta);
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
  return `\u20ac ${n}`;
}
