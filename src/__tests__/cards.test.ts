import {
  bouwKaartspel,
  deel,
  kaartenMatchen,
  maakRng,
  schud,
} from "@/game/cards";
import type { Card } from "@/game/types";

describe("kaartspel opbouwen", () => {
  it("bouwt 52 kaarten zonder jokers", () => {
    expect(bouwKaartspel(false)).toHaveLength(52);
  });

  it("bouwt 54 kaarten met jokers", () => {
    expect(bouwKaartspel(true)).toHaveLength(54);
  });

  it("geeft iedere kaart een uniek id", () => {
    const deck = bouwKaartspel(false);
    const ids = new Set(deck.map((k) => k.id));
    expect(ids.size).toBe(52);
  });
});

describe("schudden", () => {
  it("behoudt alle kaarten en verandert niets aan het origineel", () => {
    const rng = maakRng(123);
    const deck = bouwKaartspel(false);
    const geschud = schud(deck, rng);
    expect(geschud).toHaveLength(52);
    expect(new Set(geschud.map((k) => k.id)).size).toBe(52);
    // Origineel blijft ongewijzigd.
    expect(deck).toHaveLength(52);
  });

  it("is deterministisch met dezelfde seed", () => {
    const a = schud(bouwKaartspel(false), maakRng(42)).map((k) => k.suit + k.rank);
    const b = schud(bouwKaartspel(false), maakRng(42)).map((k) => k.suit + k.rank);
    expect(a).toEqual(b);
  });
});

describe("delen", () => {
  it("geeft iedere speler het juiste aantal kaarten", () => {
    const deck = bouwKaartspel(false);
    const { handen, voorraad } = deel(deck, 4, 5);
    expect(handen).toHaveLength(4);
    handen.forEach((h) => expect(h).toHaveLength(5));
    expect(voorraad).toHaveLength(52 - 20);
  });

  it("verliest geen kaarten tijdens het delen", () => {
    const deck = bouwKaartspel(false);
    const { handen, voorraad } = deel(deck, 3, 7);
    const totaal = handen.flat().length + voorraad.length;
    expect(totaal).toBe(52);
  });
});

describe("kaarten vergelijken", () => {
  it("matcht identieke kleur en waarde", () => {
    const a: Card = { id: "1", suit: "harten", rank: "7" };
    const b: Card = { id: "2", suit: "harten", rank: "7" };
    expect(kaartenMatchen(a, b)).toBe(true);
  });

  it("matcht niet bij andere kleur", () => {
    const a: Card = { id: "1", suit: "harten", rank: "7" };
    const b: Card = { id: "2", suit: "schoppen", rank: "7" };
    expect(kaartenMatchen(a, b)).toBe(false);
  });

  it("matcht jokers onderling", () => {
    const a: Card = { id: "1", suit: "joker", rank: "joker" };
    const b: Card = { id: "2", suit: "joker", rank: "joker" };
    expect(kaartenMatchen(a, b)).toBe(true);
  });
});
