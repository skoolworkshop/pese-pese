import {
  totaleInleg,
  berekenPools,
  kaartenKwijt,
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

describe("totaleInleg", () => {
  test("alleen pot is de kamerinzet", () => {
    expect(totaleInleg(20, { eerste: false, derde: false })).toBe(20);
  });

  test("pot en 3e is de helft erbij", () => {
    expect(totaleInleg(20, { eerste: false, derde: true })).toBe(30);
  });

  test("pot en 1e is een kwart erbij", () => {
    expect(totaleInleg(20, { eerste: true, derde: false })).toBe(25);
  });

  test("pot, 1e en 3e samen", () => {
    expect(totaleInleg(20, { eerste: true, derde: true })).toBe(35);
  });
});

describe("berekenPools", () => {
  test("potpool is inzet maal spelers, extra pools alleen indien gekozen", () => {
    const pools = berekenPools(20, 3, { eerste: false, derde: false });
    expect(pools.pot).toBe(60);
    expect(pools.eerste).toBe(0);
    expect(pools.derde).toBe(0);
  });

  test("gekozen extra pools tellen mee", () => {
    const pools = berekenPools(20, 4, { eerste: true, derde: true });
    expect(pools.pot).toBe(80);
    expect(pools.derde).toBe(40); // 10 per speler
    expect(pools.eerste).toBe(20); // 5 per speler
    expect(pools.totaal).toBe(140);
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
