// Centraal configuratiebestand. Pas hier spelregels, standaarden en
// familievarianten aan. De rest van de app leest alles hiervandaan.

import type { ComputerSpeed, GameConfig, PlayerSetup } from "./types";

export const STANDAARD_CONFIG: GameConfig = {
  spelerAantal: 2,
  startKaarten: 5,
  reactieTijdMs: 2600,
  strafkaartAan: false,
  computerSnelheid: "normaal",
  jokersAan: false,
  geluidAan: true,
  uitlegTijdensSpel: true,
};

// Toegestane keuzes voor de instellingenschermen.
export const KEUZES = {
  spelerAantal: [2, 3, 4],
  startKaarten: [3, 5, 7, 10],
  reactieTijdMs: [
    { label: "Snel (1,6s)", waarde: 1600 },
    { label: "Normaal (2,6s)", waarde: 2600 },
    { label: "Rustig (4s)", waarde: 4000 },
  ],
  computerSnelheid: ["rustig", "normaal", "snel"] as ComputerSpeed[],
};

// Reactieprofielen voor computerspelers. Delay in milliseconden.
// missKans zorgt dat de computer niet altijd perfect reageert.
export const COMPUTER_PROFIEL: Record<
  ComputerSpeed,
  { minMs: number; maxMs: number; missKans: number; foutKans: number }
> = {
  rustig: { minMs: 950, maxMs: 1900, missKans: 0.28, foutKans: 0.03 },
  normaal: { minMs: 550, maxMs: 1150, missKans: 0.13, foutKans: 0.05 },
  snel: { minMs: 300, maxMs: 680, missKans: 0.05, foutKans: 0.06 },
};

// Aantal strafkaarten bij een foute tik.
export const STRAF_AANTAL = 1;

// Namen en avatars voor computerspelers en standaardspelers.
export const AVATARS = [
  "🦜",
  "🐆",
  "🐢",
  "🦋",
  "🐍",
  "🦎",
  "🌴",
  "🥥",
  "🐊",
  "🦩",
  "🐠",
  "🌺",
];

export const COMPUTER_NAMEN = [
  "Anansi",
  "Kwaku",
  "Fadien",
  "Sela",
  "Roy",
  "Imro",
  "Djoemai",
  "Naya",
  "Sergio",
  "Wensley",
  "Prakash",
  "Chumira",
];

export const SPELER_KLEUREN = [
  "#f2b03d",
  "#e01f3d",
  "#238a5f",
  "#3d7bf5",
  "#f57f3d",
  "#a855f7",
  "#14b8a6",
  "#ec4899",
  "#84cc16",
  "#f5c15f",
];

export function standaardSpelers(
  aantal: number,
  humanCount: number,
): PlayerSetup[] {
  const spelers: PlayerSetup[] = [];
  const gebruikteNamen = new Set<string>();
  for (let i = 0; i < aantal; i++) {
    const isHuman = i < humanCount;
    let naam: string;
    if (isHuman) {
      naam = humanCount === 1 ? "Jij" : `Speler ${i + 1}`;
    } else {
      naam =
        COMPUTER_NAMEN.find((n) => !gebruikteNamen.has(n)) ??
        `Computer ${i + 1}`;
    }
    gebruikteNamen.add(naam);
    spelers.push({
      id: `p${i}`,
      naam,
      avatar: AVATARS[i % AVATARS.length],
      isHuman,
      kleur: SPELER_KLEUREN[i % SPELER_KLEUREN.length],
    });
  }
  return spelers;
}
