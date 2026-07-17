import { maakRng } from "@/game/cards";
import { STANDAARD_CONFIG, standaardSpelers } from "@/game/config";
import {
  bepaalWinnaar,
  maakSpel,
  revealVolgende,
  sluitReactie,
  spelersMetKaart,
  verwerkTik,
} from "@/game/engine";
import type { Card, GameConfig, GameState, Player } from "@/game/types";

function kaart(id: string, suit: Card["suit"], rank: Card["rank"]): Card {
  return { id, suit, rank };
}

function bouwState(
  handen: Card[][],
  overrides: Partial<GameState> = {},
  config: Partial<GameConfig> = {},
): GameState {
  const cfg = { ...STANDAARD_CONFIG, ...config };
  const spelers: Player[] = handen.map((hand, i) => ({
    id: `p${i}`,
    naam: `Speler ${i}`,
    avatar: "🦜",
    isHuman: i === 0,
    kleur: "#f2b03d",
    hand,
    strafkaarten: 0,
    eersteReactieAantal: 0,
    fouteTikken: 0,
  }));
  return {
    fase: "reactie",
    modus: "solo",
    spelers,
    leiderTrekstapel: [],
    leiderAflegstapel: [],
    huidigeKaart: null,
    spelerVoorraad: [],
    gematchtStapel: [],
    ronde: 1,
    reactiesDezeReveal: {},
    eersteReageerderId: null,
    winnaarId: null,
    config: cfg,
    log: [],
    gestartOp: 0,
    snelsteReactieMs: null,
    laatsteRevealOp: 0,
    ...overrides,
  };
}

describe("spel opbouwen", () => {
  it("deelt aan iedere speler het ingestelde aantal kaarten", () => {
    const cfg = { ...STANDAARD_CONFIG, spelerAantal: 3, startKaarten: 7 };
    const state = maakSpel(cfg, standaardSpelers(3, 1), "solo", maakRng(1), 0);
    expect(state.spelers).toHaveLength(3);
    state.spelers.forEach((sp) => expect(sp.hand).toHaveLength(7));
    expect(state.leiderTrekstapel).toHaveLength(52);
    expect(state.fase).toBe("wachten");
  });
});

describe("kaart openen", () => {
  it("draait de volgende kaart open en start een reactieronde", () => {
    const state = bouwState([[kaart("a", "harten", "7")]], {
      fase: "wachten",
      leiderTrekstapel: [kaart("x", "klaveren", "2"), kaart("y", "ruiten", "9")],
      ronde: 0,
    });
    const na = revealVolgende(state, maakRng(1), 1000);
    expect(na.huidigeKaart?.id).toBe("x");
    expect(na.fase).toBe("reactie");
    expect(na.ronde).toBe(1);
    expect(na.leiderTrekstapel).toHaveLength(1);
  });

  it("hervult de trekstapel uit de aflegstapel wanneer die leeg is", () => {
    const state = bouwState([[kaart("a", "harten", "7")]], {
      fase: "resultaat",
      leiderTrekstapel: [],
      leiderAflegstapel: [kaart("oud1", "schoppen", "3"), kaart("oud2", "ruiten", "5")],
      huidigeKaart: kaart("cur", "klaveren", "8"),
    });
    const na = revealVolgende(state, maakRng(2), 2000);
    expect(na.huidigeKaart).not.toBeNull();
    expect(na.leiderAflegstapel.length).toBeGreaterThanOrEqual(0);
    // De open kaart komt uit de eerder geschudde aflegstapel.
    expect(["oud1", "oud2"]).toContain(na.huidigeKaart?.id);
  });
});

describe("juiste reactie", () => {
  it("verwijdert de gematchte kaart uit de hand", () => {
    const state = bouwState([[kaart("a", "harten", "7"), kaart("b", "klaveren", "2")]], {
      huidigeKaart: kaart("cur", "harten", "7"),
    });
    const na = verwerkTik(state, "p0", "a", maakRng(1), 500);
    expect(na.spelers[0].hand.map((k) => k.id)).toEqual(["b"]);
    expect(na.reactiesDezeReveal["p0"]).toBe("correct");
    expect(na.eersteReageerderId).toBe("p0");
  });

  it("registreert de snelste reactie", () => {
    const state = bouwState([[kaart("a", "harten", "7")]], {
      huidigeKaart: kaart("cur", "harten", "7"),
      laatsteRevealOp: 1000,
    });
    const na = verwerkTik(state, "p0", "a", maakRng(1), 1420);
    expect(na.snelsteReactieMs).toBe(420);
  });
});

describe("foute reactie", () => {
  it("geeft een strafkaart bij een foute tik wanneer dat aanstaat", () => {
    const state = bouwState(
      [[kaart("a", "harten", "7")]],
      {
        huidigeKaart: kaart("cur", "schoppen", "9"),
        spelerVoorraad: [kaart("straf", "ruiten", "4")],
      },
      { strafkaartAan: true },
    );
    const na = verwerkTik(state, "p0", "a", maakRng(1), 500);
    expect(na.reactiesDezeReveal["p0"]).toBe("fout");
    expect(na.spelers[0].hand).toHaveLength(2);
    expect(na.spelers[0].strafkaarten).toBe(1);
    expect(na.spelers[0].fouteTikken).toBe(1);
  });

  it("geeft geen strafkaart wanneer strafkaarten uitstaan", () => {
    const state = bouwState(
      [[kaart("a", "harten", "7")]],
      {
        huidigeKaart: kaart("cur", "schoppen", "9"),
        spelerVoorraad: [kaart("straf", "ruiten", "4")],
      },
      { strafkaartAan: false },
    );
    const na = verwerkTik(state, "p0", "a", maakRng(1), 500);
    expect(na.spelers[0].hand).toHaveLength(1);
    expect(na.spelers[0].strafkaarten).toBe(0);
  });

  it("hergebruikt gematchte kaarten als de voorraad leeg is", () => {
    const state = bouwState(
      [[kaart("a", "harten", "7")]],
      {
        huidigeKaart: kaart("cur", "schoppen", "9"),
        spelerVoorraad: [],
        gematchtStapel: [kaart("hergebruik", "klaveren", "6")],
      },
      { strafkaartAan: true },
    );
    const na = verwerkTik(state, "p0", "a", maakRng(1), 500);
    expect(na.spelers[0].hand).toHaveLength(2);
  });
});

describe("meerdere spelers met dezelfde kaart", () => {
  it("laat beide spelers hun eigen kaart verwijderen", () => {
    const state = bouwState([
      [kaart("a", "harten", "7"), kaart("a2", "schoppen", "3")],
      [kaart("b", "harten", "7"), kaart("b2", "ruiten", "5")],
    ], {
      huidigeKaart: kaart("cur", "harten", "7"),
    });
    expect(spelersMetKaart(state, state.huidigeKaart as Card)).toHaveLength(2);

    let na = verwerkTik(state, "p1", "b", maakRng(1), 300);
    na = verwerkTik(na, "p0", "a", maakRng(1), 500);
    expect(na.spelers[0].hand.map((k) => k.id)).toEqual(["a2"]);
    expect(na.spelers[1].hand.map((k) => k.id)).toEqual(["b2"]);
    // De eerste reageerder is p1.
    expect(na.eersteReageerderId).toBe("p1");
  });
});

describe("dubbele tikken", () => {
  it("negeert een tweede tik van dezelfde speler in dezelfde reveal", () => {
    const state = bouwState([[kaart("a", "harten", "7"), kaart("c", "harten", "7")]], {
      huidigeKaart: kaart("cur", "harten", "7"),
    });
    let na = verwerkTik(state, "p0", "a", maakRng(1), 300);
    // Tweede tik zou een tweede match zijn, maar mag niet meer.
    na = verwerkTik(na, "p0", "c", maakRng(1), 320);
    expect(na.spelers[0].hand).toHaveLength(1);
  });
});

describe("winstconditie", () => {
  it("wijst de winnaar aan zodra een speler geen kaarten meer heeft", () => {
    const state = bouwState([[kaart("a", "harten", "7")]], {
      huidigeKaart: kaart("cur", "harten", "7"),
    });
    const na = verwerkTik(state, "p0", "a", maakRng(1), 300);
    expect(na.winnaarId).toBe("p0");
    expect(na.fase).toBe("einde");
  });

  it("stopt met verwerken na afloop van het spel", () => {
    const state = bouwState([[]], {
      huidigeKaart: kaart("cur", "harten", "7"),
      fase: "einde",
      winnaarId: "p0",
    });
    const na = verwerkTik(state, "p0", "x", maakRng(1), 300);
    expect(na).toBe(state);
  });

  it("bepaalWinnaar vindt een lege hand als vangnet", () => {
    const state = bouwState([[kaart("a", "harten", "7")], []]);
    const na = bepaalWinnaar(state);
    expect(na.winnaarId).toBe("p1");
  });
});

describe("reactieronde sluiten", () => {
  it("zet de fase naar resultaat", () => {
    const state = bouwState([[kaart("a", "harten", "7")]]);
    const na = sluitReactie(state);
    expect(na.fase).toBe("resultaat");
  });
});

describe("opnieuw starten", () => {
  it("bouwt een volledig nieuw spel met verse handen", () => {
    const cfg = { ...STANDAARD_CONFIG, spelerAantal: 2, startKaarten: 5 };
    const eerste = maakSpel(cfg, standaardSpelers(2, 1), "solo", maakRng(1), 0);
    const opnieuw = maakSpel(cfg, standaardSpelers(2, 1), "solo", maakRng(9), 0);
    expect(opnieuw.spelers[0].hand).toHaveLength(5);
    expect(opnieuw.winnaarId).toBeNull();
    expect(opnieuw.ronde).toBe(0);
    // Twee verschillende seeds geven doorgaans andere handen.
    const a = eerste.spelers[0].hand.map((k) => k.suit + k.rank).join();
    const b = opnieuw.spelers[0].hand.map((k) => k.suit + k.rank).join();
    expect(a).not.toBe(b);
  });
});
