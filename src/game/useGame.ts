"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { echteRng, kaartenMatchen } from "./cards";
import { planComputerReacties } from "./ai";
import {
  maakSpel,
  revealVolgende,
  sluitReactie,
  verwerkTik,
} from "./engine";
import type {
  Card,
  GameConfig,
  GameState,
  PlayerSetup,
  SpelModus,
} from "./types";
import {
  berekenPools,
  totaleInleg,
  kaartenKwijt,
  leesFiches,
  wijzigFiches,
  type SpelInzet,
  type PrijzenPot,
} from "./economie";
import { leesJson, schrijfJson, verwijder } from "@/lib/storage";
import { speel, tril, zetGeluid } from "@/lib/sound";
import {
  gemiddeldeReactie,
  leesStats,
  verwerkResultaat,
  type SpelResultaat,
} from "@/lib/stats";

const LOPEND_SLEUTEL = "pisipisi.lopendspel";

export function wisLopendSpel(): void {
  verwijder(LOPEND_SLEUTEL);
}

export function leesLopendSpel(): GameState | null {
  const s = leesJson<GameState | null>(LOPEND_SLEUTEL, null);
  if (s && s.fase !== "einde") return s;
  return null;
}

interface Inzet {
  basis: number;
  sel: SpelInzet;
}

interface UseGameArgs {
  config: GameConfig;
  modus: SpelModus;
  bouwSpelers: () => PlayerSetup[];
  inzet?: Inzet | null;
}

export interface PrijsDeel {
  tier: "eerste" | "derde" | "pot";
  label: string;
  winnaarId: string | null;
  winnaarNaam: string;
  bedrag: number;
  isBalansSpeler: boolean;
}

export interface PrijsResultaat {
  pot: PrijzenPot;
  delen: PrijsDeel[];
  inleg: number;
  balansSpelerWinst: number;
  balansSpelerNetto: number;
  nieuwSaldo: number;
}

export interface UseGameReturn {
  state: GameState | null;
  gepauzeerd: boolean;
  wachtOpVolgende: boolean;
  laatsteResultaat: "correct" | "fout" | "gemist" | null;
  kamerPot: PrijzenPot | null;
  mijlpaalEersteId: string | null;
  mijlpaalDerdeId: string | null;
  prijsResultaat: PrijsResultaat | null;
  reveal: () => void;
  volgende: () => void;
  tik: (spelerId: string, kaartId: string) => void;
  pauzeer: () => void;
  hervat: () => void;
  herstart: () => void;
  afsluitenAlsAfgebroken: () => void;
}

export function useGame({
  config,
  modus,
  bouwSpelers,
  inzet,
}: UseGameArgs): UseGameReturn {
  const [state, setState] = useState<GameState | null>(null);
  const [gepauzeerd, setGepauzeerd] = useState(false);
  const [wachtOpVolgende, setWachtOpVolgende] = useState(false);
  const [laatsteResultaat, setLaatsteResultaat] = useState<
    "correct" | "fout" | "gemist" | null
  >(null);
  const [kamerPot, setKamerPot] = useState<PrijzenPot | null>(null);
  const [mijlpaalEersteId, setMijlpaalEersteId] = useState<string | null>(null);
  const [mijlpaalDerdeId, setMijlpaalDerdeId] = useState<string | null>(null);
  const [prijsResultaat, setPrijsResultaat] = useState<PrijsResultaat | null>(
    null,
  );

  const stateRef = useRef<GameState | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const afgerond = useRef(false);
  const eersteRef = useRef<string | null>(null);
  const derdeRef = useRef<string | null>(null);

  const gestaked = !!inzet && inzet.basis > 0;

  const handmatig = modus === "oefenen" || config.reactieTijdMs <= 0;

  const wisTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);

  const checkMijlpalen = useCallback(
    (s: GameState) => {
      if (!gestaked) return;
      if (eersteRef.current === null) {
        const w = s.spelers.find((sp) => kaartenKwijt(config, sp) >= 1);
        if (w) {
          eersteRef.current = w.id;
          setMijlpaalEersteId(w.id);
        }
      }
      if (derdeRef.current === null) {
        const w = s.spelers.find((sp) => kaartenKwijt(config, sp) >= 3);
        if (w) {
          derdeRef.current = w.id;
          setMijlpaalDerdeId(w.id);
        }
      }
    },
    [gestaked, config],
  );

  const bewaarState = useCallback(
    (s: GameState) => {
      stateRef.current = s;
      setState(s);
      checkMijlpalen(s);
      // Ingezette potjes bewaren we niet tussentijds. Zo kan een potje met
      // fiches niet opnieuw hervat of misbruikt worden.
      if (s.fase === "einde" || gestaked) wisLopendSpel();
      else schrijfJson(LOPEND_SLEUTEL, s);
    },
    [checkMijlpalen, gestaked],
  );

  // Geluid volgt de instelling.
  useEffect(() => {
    zetGeluid(config.geluidAan);
  }, [config.geluidAan]);

  const rondAf = useCallback(
    (s: GameState, afgebroken: boolean) => {
      if (afgerond.current) return;
      afgerond.current = true;
      wisTimers();
      const mensen = s.spelers.filter((sp) => sp.isHuman);
      const winnaar = s.spelers.find((sp) => sp.id === s.winnaarId);
      const gewonnenDoorMens = winnaar ? winnaar.isHuman : false;
      const fouteTikkenMens = mensen.reduce(
        (som, sp) => som + sp.fouteTikken,
        0,
      );
      const res: SpelResultaat = {
        modus: s.modus,
        gewonnenDoorMens,
        afgebroken,
        duurMs: Date.now() - s.gestartOp,
        rondes: s.ronde,
        fouteTikkenMens,
        snelsteReactieMs: s.snelsteReactieMs,
        gemiddeldeReactieMs: gemiddeldeReactie(leesStats()),
        winnaarNaam: winnaar ? winnaar.naam : "geen",
      };
      verwerkResultaat(res);
      wisLopendSpel();

      // Fiches afhandelen bij ingezette potjes.
      if (gestaked && inzet) {
        const balansSpeler = mensen[0] ?? s.spelers[0];
        const jouwInleg = totaleInleg(inzet.basis, inzet.sel);
        if (afgebroken || !s.winnaarId) {
          // Wie een ingezet potje verlaat, is zijn inleg kwijt. De inleg zit
          // al in de pot, dus er komt niets terug.
          setPrijsResultaat(null);
        } else {
          const pools = berekenPools(inzet.basis, s.spelers.length, inzet.sel);
          const potId = s.winnaarId;
          const naamVan = (id: string | null) =>
            s.spelers.find((sp) => sp.id === id)?.naam ?? "geen";

          const delen: PrijsDeel[] = [
            {
              tier: "pot",
              label: "Hele pot",
              winnaarId: potId,
              winnaarNaam: naamVan(potId),
              bedrag: pools.pot,
              isBalansSpeler: potId === balansSpeler.id,
            },
          ];
          if (inzet.sel.derde) {
            const derdeId = derdeRef.current ?? s.winnaarId;
            delen.unshift({
              tier: "derde",
              label: "3e kaart",
              winnaarId: derdeId,
              winnaarNaam: naamVan(derdeId),
              bedrag: pools.derde,
              isBalansSpeler: derdeId === balansSpeler.id,
            });
          }
          if (inzet.sel.eerste) {
            const eersteId = eersteRef.current ?? s.winnaarId;
            delen.unshift({
              tier: "eerste",
              label: "1e kaart",
              winnaarId: eersteId,
              winnaarNaam: naamVan(eersteId),
              bedrag: pools.eerste,
              isBalansSpeler: eersteId === balansSpeler.id,
            });
          }

          const winst = delen
            .filter((d) => d.isBalansSpeler)
            .reduce((som, d) => som + d.bedrag, 0);
          if (winst > 0) wijzigFiches(winst);
          setPrijsResultaat({
            pot: pools,
            delen,
            inleg: jouwInleg,
            balansSpelerWinst: winst,
            balansSpelerNetto: Math.round((winst - jouwInleg) * 100) / 100,
            nieuwSaldo: leesFiches(),
          });
        }
      }

      if (!afgebroken && gewonnenDoorMens) speel("winst");
    },
    [wisTimers, gestaked, inzet],
  );

  const iedereenKlaar = useCallback((s: GameState): boolean => {
    if (!s.huidigeKaart) return true;
    return s.spelers.every((sp) => {
      if (s.reactiesDezeReveal[sp.id]) return true;
      const heeft = sp.hand.some((k) =>
        kaartenMatchen(k, s.huidigeKaart as never),
      );
      return !heeft;
    });
  }, []);

  // Vooruit verwijzing naar reveal, opgelost via ref.
  const revealRef = useRef<() => void>(() => undefined);

  const sluitEnGaVerder = useCallback(() => {
    const huidig = stateRef.current;
    if (!huidig) return;
    // Heeft een menselijke speler zijn eigen kaart voorbij laten gaan zonder
    // te tikken? Dan is die kaart gemist en blijft hij in de hand. Pech.
    const gemist =
      !!huidig.huidigeKaart &&
      huidig.spelers.some(
        (sp) =>
          sp.isHuman &&
          !huidig.reactiesDezeReveal[sp.id] &&
          sp.hand.some((k) => kaartenMatchen(k, huidig.huidigeKaart as Card)),
      );
    if (gemist) {
      setLaatsteResultaat("gemist");
      tril(20);
    }
    const gesloten = sluitReactie(huidig);
    bewaarState(gesloten);
    if (handmatig) {
      setWachtOpVolgende(true);
    } else {
      // Bij een gemiste kaart iets langer tonen zodat je het ziet.
      // Gebeurde er niets, dan meteen door. Bij een reactie kort tonen,
      // bij een gemiste eigen kaart iets langer zodat je het ziet.
      const erWasReactie =
        Object.keys(huidig.reactiesDezeReveal ?? {}).length > 0;
      const wacht = gemist ? 1100 : erWasReactie ? 420 : 0;
      const t = setTimeout(() => revealRef.current(), wacht);
      timers.current.push(t);
    }
  }, [bewaarState, handmatig]);

  const planReactie = useCallback(
    (s: GameState) => {
      wisTimers();
      // Computerspelers plannen hun reactie.
      const plannen = planComputerReacties(s, echteRng);
      for (const plan of plannen) {
        const t = setTimeout(() => {
          const huidig = stateRef.current;
          if (!huidig || huidig.fase !== "reactie") return;
          const na = verwerkTik(
            huidig,
            plan.spelerId,
            plan.kaartId,
            echteRng,
          );
          bewaarState(na);
          if (na.fase === "einde") {
            rondAf(na, false);
            return;
          }
          if (iedereenKlaar(na)) {
            wisTimers();
            sluitEnGaVerder();
          }
        }, plan.vertragingMs);
        timers.current.push(t);
      }
      // Reactievenster (alleen bij tijdgebonden modi).
      if (!handmatig) {
        const t = setTimeout(() => {
          sluitEnGaVerder();
        }, config.reactieTijdMs);
        timers.current.push(t);
      }
    },
    [
      wisTimers,
      bewaarState,
      rondAf,
      iedereenKlaar,
      sluitEnGaVerder,
      handmatig,
      config.reactieTijdMs,
    ],
  );

  const reveal = useCallback(() => {
    const huidig = stateRef.current;
    if (!huidig || huidig.fase === "einde") return;
    setWachtOpVolgende(false);
    setLaatsteResultaat(null);
    const na = revealVolgende(huidig, echteRng);
    speel("flip");
    bewaarState(na);
    planReactie(na);
  }, [bewaarState, planReactie]);

  revealRef.current = reveal;

  const volgende = useCallback(() => {
    reveal();
  }, [reveal]);

  const tik = useCallback(
    (spelerId: string, kaartId: string) => {
      const huidig = stateRef.current;
      if (!huidig || huidig.fase !== "reactie") return;
      if (huidig.reactiesDezeReveal[spelerId]) return;
      const na = verwerkTik(huidig, spelerId, kaartId, echteRng);
      const resultaat = na.reactiesDezeReveal[spelerId] ?? null;
      bewaarState(na);
      if (resultaat === "correct") {
        setLaatsteResultaat("correct");
        speel("correct");
        tril(30);
      } else if (resultaat === "fout") {
        setLaatsteResultaat("fout");
        speel("fout");
        tril([40, 40, 40]);
      }
      if (na.fase === "einde") {
        rondAf(na, false);
        return;
      }
      if (!handmatig && iedereenKlaar(na)) {
        wisTimers();
        sluitEnGaVerder();
      }
    },
    [bewaarState, rondAf, handmatig, iedereenKlaar, wisTimers, sluitEnGaVerder],
  );

  const pauzeer = useCallback(() => {
    wisTimers();
    setGepauzeerd(true);
  }, [wisTimers]);

  const hervat = useCallback(() => {
    setGepauzeerd(false);
    const huidig = stateRef.current;
    if (huidig && huidig.fase === "reactie") {
      // Start het reactievenster opnieuw voor een eerlijke voortzetting.
      planReactie(huidig);
    }
  }, [planReactie]);

  const startNieuw = useCallback(() => {
    afgerond.current = false;
    wisTimers();
    eersteRef.current = null;
    derdeRef.current = null;
    setMijlpaalEersteId(null);
    setMijlpaalDerdeId(null);
    setPrijsResultaat(null);
    const nieuw = maakSpel(config, bouwSpelers(), modus, echteRng);
    if (gestaked && inzet) {
      // De totale inleg wordt bij de start ingehouden. De pot speel je altijd,
      // 1e en 3e kaart alleen als je die extra hebt gekozen.
      wijzigFiches(-totaleInleg(inzet.basis, inzet.sel));
      setKamerPot(berekenPools(inzet.basis, nieuw.spelers.length, inzet.sel));
    } else {
      setKamerPot(null);
    }
    setGepauzeerd(false);
    setWachtOpVolgende(false);
    setLaatsteResultaat(null);
    bewaarState(nieuw);
  }, [config, modus, bouwSpelers, wisTimers, bewaarState, gestaked, inzet]);

  const herstart = useCallback(() => {
    startNieuw();
  }, [startNieuw]);

  const afsluitenAlsAfgebroken = useCallback(() => {
    const huidig = stateRef.current;
    wisTimers();
    if (huidig && huidig.fase !== "einde" && huidig.ronde > 0) {
      rondAf(huidig, true);
    } else {
      wisLopendSpel();
    }
  }, [wisTimers, rondAf]);

  // Init: hervat een lopend spel of start een nieuw spel.
  useEffect(() => {
    const opgeslagen = leesLopendSpel();
    if (opgeslagen) {
      afgerond.current = false;
      stateRef.current = opgeslagen;
      setState(opgeslagen);
      // Een hervatte reactieronde wordt gepauzeerd getoond zodat de speler
      // bewust verder gaat.
      if (opgeslagen.fase === "reactie") {
        setGepauzeerd(true);
      }
    } else {
      startNieuw();
    }
    return () => wisTimers();
    // Bewust eenmalig bij mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    gepauzeerd,
    wachtOpVolgende,
    laatsteResultaat,
    kamerPot,
    mijlpaalEersteId,
    mijlpaalDerdeId,
    prijsResultaat,
    reveal,
    volgende,
    tik,
    pauzeer,
    hervat,
    herstart,
    afsluitenAlsAfgebroken,
  };
}
