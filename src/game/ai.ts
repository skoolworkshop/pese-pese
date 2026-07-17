// Beslislogica voor computerspelers. Geeft een lijst geplande tikken terug
// die de interface met timers binnen de reactietijd uitvoert.

import { kaartenMatchen } from "./cards";
import { COMPUTER_PROFIEL } from "./config";
import type { GameState, Rng } from "./types";

export interface GeplandeTik {
  spelerId: string;
  kaartId: string;
  vertragingMs: number;
  fout: boolean;
}

/**
 * Plant per computerspeler een mogelijke reactie op de huidige open kaart.
 * Computerspelers reageren niet altijd perfect: ze kunnen missen of soms fout tikken.
 */
export function planComputerReacties(state: GameState, rng: Rng): GeplandeTik[] {
  if (!state.huidigeKaart || state.fase !== "reactie") return [];
  const profiel = COMPUTER_PROFIEL[state.config.computerSnelheid];
  const plannen: GeplandeTik[] = [];

  for (const speler of state.spelers) {
    if (speler.isHuman) continue;
    if (speler.hand.length === 0) continue;

    const match = speler.hand.find((k) =>
      kaartenMatchen(k, state.huidigeKaart as never),
    );

    const vertraging = Math.round(
      profiel.minMs + rng() * (profiel.maxMs - profiel.minMs),
    );

    if (match) {
      // Soms mist de computer de kaart volledig.
      if (rng() < profiel.missKans) continue;
      plannen.push({
        spelerId: speler.id,
        kaartId: match.id,
        vertragingMs: vertraging,
        fout: false,
      });
    } else if (rng() < profiel.foutKans && speler.hand.length > 0) {
      // Zeldzame foute tik op een willekeurige eigen kaart.
      const willekeurig =
        speler.hand[Math.floor(rng() * speler.hand.length)];
      plannen.push({
        spelerId: speler.id,
        kaartId: willekeurig.id,
        vertragingMs: vertraging,
        fout: true,
      });
    }
  }

  // Zorg dat de vertragingen binnen de reactietijd vallen (indien begrensd).
  if (state.config.reactieTijdMs > 0) {
    const limiet = state.config.reactieTijdMs - 150;
    for (const plan of plannen) {
      if (plan.vertragingMs > limiet) plan.vertragingMs = Math.max(120, limiet);
    }
  }

  return plannen;
}
