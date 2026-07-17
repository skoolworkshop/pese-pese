// Centrale typedefinities voor de Pese Pese spelengine.

export type Suit = "harten" | "ruiten" | "klaveren" | "schoppen" | "joker";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "B"
  | "V"
  | "H"
  | "joker";

export interface Card {
  /** Unieke instantie-id, zodat dubbele kaarten los verwerkt kunnen worden. */
  id: string;
  suit: Suit;
  rank: Rank;
}

export type ComputerSpeed = "rustig" | "normaal" | "snel";

export interface GameConfig {
  spelerAantal: number; // 2 tot en met 4
  startKaarten: number; // 3, 5, 7 of 10
  reactieTijdMs: number; // duur van een reactieronde
  strafkaartAan: boolean;
  computerSnelheid: ComputerSpeed;
  jokersAan: boolean;
  geluidAan: boolean;
  uitlegTijdensSpel: boolean;
}

export type SpelModus = "solo" | "lokaal" | "oefenen";

export interface PlayerSetup {
  id: string;
  naam: string;
  avatar: string; // emoji of korte code
  isHuman: boolean;
  kleur: string; // tailwind hex voor zone-accent
}

export interface Player extends PlayerSetup {
  hand: Card[];
  strafkaarten: number;
  eersteReactieAantal: number;
  fouteTikken: number;
}

export type GamePhase =
  | "voorbereiding"
  | "delen"
  | "wachten"
  | "reactie"
  | "resultaat"
  | "volgende"
  | "einde";

export type TapResult = "correct" | "fout";

export interface LogEntry {
  ronde: number;
  tekst: string;
}

export interface GameState {
  fase: GamePhase;
  modus: SpelModus;
  spelers: Player[];
  leiderTrekstapel: Card[];
  leiderAflegstapel: Card[];
  huidigeKaart: Card | null;
  spelerVoorraad: Card[];
  gematchtStapel: Card[];
  ronde: number;
  /** Per reveal: welke spelers al een poging deden (voorkomt dubbele tikken). */
  reactiesDezeReveal: Record<string, TapResult>;
  eersteReageerderId: string | null;
  winnaarId: string | null;
  config: GameConfig;
  log: LogEntry[];
  gestartOp: number;
  snelsteReactieMs: number | null;
  laatsteRevealOp: number | null;
}

export type Rng = () => number;
