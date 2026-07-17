import {
  berekenPrijzen,
  kaartenKwijt,
  STANDAARD_VERDELING,
} from "@/game/economie";
import { STANDAARD_CONFIG } from "@/game/config";
import type { Player } from "@/game/types";

function speler(hand: number, straf = 0): Player {
  return {
    id: "p0",
    naam: "Test",
    avatar: "🦜",
    isHuman: true,
    kleur: "#fff",
    hand: Array.from({ length: hand }, (_, i) => ({
      id: `k${i}`,
      suit: "harten",
      rank: "A",
    })),
    strafkaarten: straf,
    eersteReactieAantal: 0,
    fouteTikken: 0,
  };
}

describe("berekenPrijzen", () => {
  test("verdeelt de pot en houdt het totaal kloppend", () => {
    const pot = berekenPrijzen(10, 4, STANDAARD_VERDELING);
    expect(pot.totaal).toBe(40);
    expect(pot.eerste + pot.derde + pot.pot).toBe(40);
  });

  test("afrondingsrest gaat naar de hoofdpot", () => {
    // 33/33/34 op 10 fiches, 3 spelers = 30 totaal.
    const pot = berekenPrijzen(10, 3, { eerste: 33, derde: 33, pot: 34 });
    expect(pot.totaal).toBe(30);
    expect(pot.eerste).toBe(9);
    expect(pot.derde).toBe(9);
    expect(pot.pot).toBe(12);
    expect(pot.eerste + pot.derde + pot.pot).toBe(30);
  });

  test("gratis kamer levert een lege pot", () => {
    const pot = berekenPrijzen(0, 8, STANDAARD_VERDELING);
    expect(pot.totaal).toBe(0);
    expect(pot.pot).toBe(0);
  });
});

describe("kaartenKwijt", () => {
  const config = { ...STANDAARD_CONFIG, startKaarten: 5 };

  test("telt gespeelde kaarten", () => {
    expect(kaartenKwijt(config, speler(5))).toBe(0);
    expect(kaartenKwijt(config, speler(2))).toBe(3);
  });

  test("een strafkaart draait voortgang terug", () => {
    // Startte met 5, heeft er nu 4 in de hand maar kreeg 1 strafkaart.
    // Netto dus 5 - 4 + 1 = 2 echt gespeeld.
    expect(kaartenKwijt(config, speler(4, 1))).toBe(2);
  });
});
