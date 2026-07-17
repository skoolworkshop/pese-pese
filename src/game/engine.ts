// Pese Pese spelengine. Alle functies zijn puur: ze krijgen een state en
// geven een nieuwe state terug. Zo blijft alles testbaar en voorspelbaar.

import {
  bouwKaartspel,
  deel,
  kaartenMatchen,
  kaartLabel,
  schud,
} from "./cards";
import { STRAF_AANTAL } from "./config";
import type {
  Card,
  GameConfig,
  GameState,
  Player,
  PlayerSetup,
  Rng,
  SpelModus,
  TapResult,
} from "./types";

function log(state: GameState, tekst: string): GameState {
  const nieuw = [...state.log, { ronde: state.ronde, tekst }];
  // Houd het logboek behapbaar.
  return { ...state, log: nieuw.slice(-40) };
}

/**
 * Bouwt een nieuw spel op. Deck 1 wordt verdeeld onder de spelers,
 * deck 2 is de trekstapel van de spelleider. Beide zijn identiek.
 */
export function maakSpel(
  config: GameConfig,
  spelerSetup: PlayerSetup[],
  modus: SpelModus,
  rng: Rng,
  nu: number = Date.now(),
): GameState {
  const spelerDeck = schud(bouwKaartspel(config.jokersAan, "s"), rng);
  const leiderDeck = schud(bouwKaartspel(config.jokersAan, "l"), rng);

  const { handen, voorraad } = deel(
    spelerDeck,
    spelerSetup.length,
    config.startKaarten,
  );

  const spelers: Player[] = spelerSetup.map((sp, i) => ({
    ...sp,
    hand: handen[i],
    strafkaarten: 0,
    eersteReactieAantal: 0,
    fouteTikken: 0,
  }));

  const state: GameState = {
    fase: "wachten",
    modus,
    spelers,
    leiderTrekstapel: leiderDeck,
    leiderAflegstapel: [],
    huidigeKaart: null,
    spelerVoorraad: voorraad,
    gematchtStapel: [],
    ronde: 0,
    reactiesDezeReveal: {},
    eersteReageerderId: null,
    winnaarId: null,
    config,
    log: [{ ronde: 0, tekst: "Kaarten gedeeld. Klaar om te spelen." }],
    gestartOp: nu,
    snelsteReactieMs: null,
    laatsteRevealOp: null,
  };
  return state;
}

/** Vult de trekstapel opnieuw uit de aflegstapel wanneer die leeg is. */
function hervulTrekstapelIndienNodig(state: GameState, rng: Rng): GameState {
  if (state.leiderTrekstapel.length > 0) return state;
  if (state.leiderAflegstapel.length === 0) return state;
  const geschud = schud(state.leiderAflegstapel, rng);
  return log(
    {
      ...state,
      leiderTrekstapel: geschud,
      leiderAflegstapel: [],
    },
    "Trekstapel was leeg. Aflegstapel opnieuw geschud.",
  );
}

/** Draait de volgende kaart open en start een nieuwe reactieronde. */
export function revealVolgende(
  state: GameState,
  rng: Rng,
  nu: number = Date.now(),
): GameState {
  if (state.fase === "einde") return state;

  let s = hervulTrekstapelIndienNodig(state, rng);

  if (s.leiderTrekstapel.length === 0) {
    // Geen kaarten meer om te draaien. Dit kan alleen als beide stapels leeg zijn.
    return { ...s, fase: "resultaat" };
  }

  const trek = [...s.leiderTrekstapel];
  const nieuweKaart = trek.shift() as Card;

  // De vorige open kaart gaat naar de aflegstapel.
  const afleg = s.huidigeKaart
    ? [...s.leiderAflegstapel, s.huidigeKaart]
    : [...s.leiderAflegstapel];

  s = {
    ...s,
    leiderTrekstapel: trek,
    leiderAflegstapel: afleg,
    huidigeKaart: nieuweKaart,
    fase: "reactie",
    ronde: s.ronde + 1,
    reactiesDezeReveal: {},
    eersteReageerderId: null,
    laatsteRevealOp: nu,
  };
  return log(s, `Spelleider draait ${kaartLabel(nieuweKaart)} open.`);
}

/** Trekt één strafkaart voor een speler. Hervult de voorraad indien nodig. */
function gefStrafkaart(
  state: GameState,
  spelerId: string,
  rng: Rng,
): GameState {
  let voorraad = state.spelerVoorraad;
  let gematcht = state.gematchtStapel;

  if (voorraad.length === 0 && gematcht.length > 0) {
    // Voorraad is op. Gebruik de eerder gematchte kaarten opnieuw.
    voorraad = schud(gematcht, rng);
    gematcht = [];
  }
  if (voorraad.length === 0) {
    // Geen enkele strafkaart beschikbaar. Sla over zonder te crashen.
    return state;
  }

  const nieuweVoorraad = [...voorraad];
  const straf = nieuweVoorraad.shift() as Card;

  const spelers = state.spelers.map((sp) =>
    sp.id === spelerId
      ? { ...sp, hand: [...sp.hand, straf], strafkaarten: sp.strafkaarten + 1 }
      : sp,
  );

  return {
    ...state,
    spelers,
    spelerVoorraad: nieuweVoorraad,
    gematchtStapel: gematcht,
  };
}

/**
 * Verwerkt een tik van een speler op een kaart in de eigen hand.
 * Iedere speler mag maar één poging per open kaart doen (voorkomt dubbele tikken).
 */
export function verwerkTik(
  state: GameState,
  spelerId: string,
  kaartId: string,
  rng: Rng,
  nu: number = Date.now(),
): GameState {
  if (state.fase !== "reactie") return state;
  if (state.winnaarId) return state;

  // Speler heeft deze reveal al gereageerd. Negeren.
  if (state.reactiesDezeReveal[spelerId]) return state;

  const speler = state.spelers.find((sp) => sp.id === spelerId);
  if (!speler) return state;

  const kaart = speler.hand.find((k) => k.id === kaartId);
  if (!kaart) return state;
  if (!state.huidigeKaart) return state;

  const correct = kaartenMatchen(kaart, state.huidigeKaart);
  const resultaat: TapResult = correct ? "correct" : "fout";

  let s: GameState = {
    ...state,
    reactiesDezeReveal: { ...state.reactiesDezeReveal, [spelerId]: resultaat },
  };

  if (correct) {
    // Verwijder precies deze ene kaartinstantie uit de hand.
    const spelers = s.spelers.map((sp) => {
      if (sp.id !== spelerId) return sp;
      const idx = sp.hand.findIndex((k) => k.id === kaartId);
      const nieuweHand = [...sp.hand];
      nieuweHand.splice(idx, 1);
      return { ...sp, hand: nieuweHand };
    });
    s = { ...s, spelers, gematchtStapel: [...s.gematchtStapel, kaart] };

    // Eerste juiste reactie bijhouden.
    let snelste = s.snelsteReactieMs;
    if (!s.eersteReageerderId) {
      const reactieMs = s.laatsteRevealOp ? nu - s.laatsteRevealOp : null;
      if (reactieMs !== null && (snelste === null || reactieMs < snelste)) {
        snelste = reactieMs;
      }
      s = {
        ...s,
        eersteReageerderId: spelerId,
        snelsteReactieMs: snelste,
        spelers: s.spelers.map((sp) =>
          sp.id === spelerId
            ? { ...sp, eersteReactieAantal: sp.eersteReactieAantal + 1 }
            : sp,
        ),
      };
    }

    s = log(s, `${speler.naam} matcht ${kaartLabel(kaart)}.`);

    // Winstconditie: als eerste geen kaarten meer over.
    const geupdate = s.spelers.find((sp) => sp.id === spelerId);
    if (geupdate && geupdate.hand.length === 0) {
      s = { ...s, winnaarId: spelerId, fase: "einde" };
      s = log(s, `${speler.naam} heeft gewonnen!`);
    }
    return s;
  }

  // Foute tik.
  s = {
    ...s,
    spelers: s.spelers.map((sp) =>
      sp.id === spelerId ? { ...sp, fouteTikken: sp.fouteTikken + 1 } : sp,
    ),
  };
  s = log(s, `${speler.naam} tikt fout op ${kaartLabel(kaart)}.`);

  if (state.config.strafkaartAan) {
    for (let i = 0; i < STRAF_AANTAL; i++) {
      s = gefStrafkaart(s, spelerId, rng);
    }
  }
  return s;
}

/** Sluit de reactieronde af en gaat naar de resultaatfase. */
export function sluitReactie(state: GameState): GameState {
  if (state.fase !== "reactie") return state;
  return { ...state, fase: "resultaat" };
}

/** Controleert of een speler geen kaarten meer heeft (extra vangnet). */
export function bepaalWinnaar(state: GameState): GameState {
  if (state.winnaarId) return state;
  const leeg = state.spelers.find((sp) => sp.hand.length === 0);
  if (leeg) {
    return { ...state, winnaarId: leeg.id, fase: "einde" };
  }
  return state;
}

/** Geeft de speler terug die een gegeven kaart in de hand heeft (of undefined). */
export function spelersMetKaart(state: GameState, kaart: Card): Player[] {
  return state.spelers.filter((sp) =>
    sp.hand.some((k) => kaartenMatchen(k, kaart)),
  );
}

export function isMenselijkeSpelerAanZet(state: GameState): boolean {
  return state.spelers.some((sp) => sp.isHuman);
}
