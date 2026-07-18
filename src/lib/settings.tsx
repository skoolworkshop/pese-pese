"use client";

// Gedeelde instellingen die tussen schermen bewaard blijven en lokaal
// worden opgeslagen.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STANDAARD_CONFIG, standaardSpelers } from "@/game/config";
import type { GameConfig, PlayerSetup, SpelModus } from "@/game/types";
import {
  STANDAARD_INZET,
  type SpelInzet,
} from "@/game/economie";
import { leesJson, schrijfJson } from "./storage";

const SLEUTEL = "pisipisi.instellingen";

interface OpgeslagenInstellingen {
  config: GameConfig;
  modus: SpelModus;
  aantalMensen: number;
  naamOverrides: Record<number, string>;
  kamerId: string | null;
  inzetKeuze: SpelInzet;
}

interface SettingsContextType extends OpgeslagenInstellingen {
  zetConfig: (patch: Partial<GameConfig>) => void;
  zetModus: (m: SpelModus) => void;
  zetAantalMensen: (n: number) => void;
  zetNaam: (index: number, naam: string) => void;
  zetKamer: (id: string) => void;
  zetInzet: (v: SpelInzet) => void;
  bouwSpelers: () => PlayerSetup[];
}

const standaard: OpgeslagenInstellingen = {
  config: STANDAARD_CONFIG,
  modus: "solo",
  aantalMensen: 1,
  naamOverrides: {},
  kamerId: null,
  inzetKeuze: STANDAARD_INZET,
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [instellingen, setInstellingen] =
    useState<OpgeslagenInstellingen>(standaard);

  useEffect(() => {
    const opgeslagen = leesJson<OpgeslagenInstellingen>(SLEUTEL, standaard);
    const samen = { ...standaard, ...opgeslagen };
    // De strafkaart bestaat niet meer. Zet oude opgeslagen waarden altijd uit.
    samen.config = { ...samen.config, strafkaartAan: false };
    setInstellingen(samen);
  }, []);

  const bewaar = useCallback((nieuw: OpgeslagenInstellingen) => {
    setInstellingen(nieuw);
    schrijfJson(SLEUTEL, nieuw);
  }, []);

  const zetConfig = useCallback(
    (patch: Partial<GameConfig>) => {
      setInstellingen((prev) => {
        const nieuw = { ...prev, config: { ...prev.config, ...patch } };
        schrijfJson(SLEUTEL, nieuw);
        return nieuw;
      });
    },
    [],
  );

  const zetModus = useCallback((m: SpelModus) => {
    setInstellingen((prev) => {
      let config = prev.config;
      let aantalMensen = prev.aantalMensen;
      if (m === "oefenen") {
        config = { ...config, spelerAantal: 1 };
        aantalMensen = 1;
      } else if (m === "solo") {
        aantalMensen = 1;
        if (config.spelerAantal < 2) config = { ...config, spelerAantal: 2 };
      } else if (m === "lokaal") {
        if (config.spelerAantal < 2) config = { ...config, spelerAantal: 2 };
        aantalMensen = config.spelerAantal;
      }
      const nieuw = { ...prev, modus: m, config, aantalMensen, kamerId: null };
      schrijfJson(SLEUTEL, nieuw);
      return nieuw;
    });
  }, []);

  const zetAantalMensen = useCallback((n: number) => {
    setInstellingen((prev) => {
      const nieuw = { ...prev, aantalMensen: n };
      schrijfJson(SLEUTEL, nieuw);
      return nieuw;
    });
  }, []);

  const zetNaam = useCallback((index: number, naam: string) => {
    setInstellingen((prev) => {
      const nieuw = {
        ...prev,
        naamOverrides: { ...prev.naamOverrides, [index]: naam },
      };
      schrijfJson(SLEUTEL, nieuw);
      return nieuw;
    });
  }, []);

  const zetKamer = useCallback((id: string) => {
    setInstellingen((prev) => {
      // Kamers spelen we getimed. Zo reageren de andere seats ook echt.
      let config = prev.config;
      if (config.reactieTijdMs <= 0) config = { ...config, reactieTijdMs: 2600 };
      if (config.spelerAantal < 2) config = { ...config, spelerAantal: 2 };
      const nieuw = { ...prev, kamerId: id, modus: "solo" as SpelModus, config };
      schrijfJson(SLEUTEL, nieuw);
      return nieuw;
    });
  }, []);

  const zetInzet = useCallback((v: SpelInzet) => {
    setInstellingen((prev) => {
      const nieuw = { ...prev, inzetKeuze: v };
      schrijfJson(SLEUTEL, nieuw);
      return nieuw;
    });
  }, []);

  const bouwSpelers = useCallback((): PlayerSetup[] => {
    const mensen =
      instellingen.modus === "lokaal"
        ? instellingen.config.spelerAantal
        : instellingen.aantalMensen;
    const basis = standaardSpelers(instellingen.config.spelerAantal, mensen);
    return basis.map((sp, i) => {
      const override = instellingen.naamOverrides[i];
      return override && override.trim() ? { ...sp, naam: override.trim() } : sp;
    });
  }, [instellingen]);

  const waarde = useMemo<SettingsContextType>(
    () => ({
      ...instellingen,
      zetConfig,
      zetModus,
      zetAantalMensen,
      zetNaam,
      zetKamer,
      zetInzet,
      bouwSpelers,
    }),
    [
      instellingen,
      zetConfig,
      zetModus,
      zetAantalMensen,
      zetNaam,
      zetKamer,
      zetInzet,
      bouwSpelers,
    ],
  );

  return (
    <SettingsContext.Provider value={waarde}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings moet binnen SettingsProvider gebruikt worden");
  return ctx;
}
