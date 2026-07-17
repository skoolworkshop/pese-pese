// Kaartlogica: kaartspel opbouwen, schudden, delen en vergelijken.

import type { Card, Rank, Rng, Suit } from "./types";

export const SUITS: Suit[] = ["harten", "ruiten", "klaveren", "schoppen"];
export const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "B",
  "V",
  "H",
];

export const SUIT_SYMBOOL: Record<Suit, string> = {
  harten: "♥",
  ruiten: "♦",
  klaveren: "♣",
  schoppen: "♠",
  joker: "★",
};

export const SUIT_ROOD: Record<Suit, boolean> = {
  harten: true,
  ruiten: true,
  klaveren: false,
  schoppen: false,
  joker: false,
};

export const RANK_LABEL: Record<Rank, string> = {
  A: "A",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  "10": "10",
  B: "J",
  V: "Q",
  H: "K",
  joker: "Joker",
};

// Deterministische pseudo-random generator (mulberry32).
// Zo zijn tests reproduceerbaar en kan een spel later met een seed hervat worden.
export function maakRng(seed: number): Rng {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Standaard rng op basis van Math.random voor gebruik in de app.
export const echteRng: Rng = () => Math.random();

let idTeller = 0;
function nieuwId(prefix: string): string {
  idTeller += 1;
  return `${prefix}-${idTeller}-${Math.floor(Math.random() * 1e6)}`;
}

/** Bouwt één volledig kaartspel op. Met jokers erbij komen er twee jokers bij. */
export function bouwKaartspel(metJokers: boolean, prefix = "k"): Card[] {
  const kaarten: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      kaarten.push({ id: nieuwId(prefix), suit, rank });
    }
  }
  if (metJokers) {
    kaarten.push({ id: nieuwId(prefix), suit: "joker", rank: "joker" });
    kaarten.push({ id: nieuwId(prefix), suit: "joker", rank: "joker" });
  }
  return kaarten;
}

/** Fisher-Yates schudden met injecteerbare rng. Geeft een nieuwe array terug. */
export function schud<T>(kaarten: T[], rng: Rng): T[] {
  const kopie = [...kaarten];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

/**
 * Verdeelt een geschud spel: iedere speler krijgt startKaarten kaarten,
 * de rest wordt de voorraad voor strafkaarten.
 */
export function deel(
  kaarten: Card[],
  spelerAantal: number,
  startKaarten: number,
): { handen: Card[][]; voorraad: Card[] } {
  const handen: Card[][] = Array.from({ length: spelerAantal }, () => []);
  let index = 0;
  for (let r = 0; r < startKaarten; r++) {
    for (let s = 0; s < spelerAantal; s++) {
      if (index < kaarten.length) {
        handen[s].push(kaarten[index]);
        index += 1;
      }
    }
  }
  const voorraad = kaarten.slice(index);
  return { handen, voorraad };
}

/** Twee kaarten matchen wanneer kleur en waarde gelijk zijn. Jokers matchen jokers. */
export function kaartenMatchen(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank;
}

export function kaartLabel(kaart: Card): string {
  if (kaart.suit === "joker") return "Joker";
  return `${RANK_LABEL[kaart.rank]}${SUIT_SYMBOOL[kaart.suit]}`;
}
