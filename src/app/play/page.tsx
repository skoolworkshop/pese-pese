"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Knop, LinkKnop, Speelkaart, Paneel } from "@/components/ui";
import {
  Spelleider,
  kiesBericht,
  antwoordOpReactie,
} from "@/components/Spelleider";
import { useT } from "@/i18n";
import { useSettings } from "@/lib/settings";
import { useGame } from "@/game/useGame";
import { kaartenMatchen } from "@/game/cards";
import { kamerById, euro } from "@/game/economie";
import { formatteerDuur } from "@/lib/stats";
import type { Player } from "@/game/types";
import { speel } from "@/lib/sound";

export default function SpeelScherm() {
  const { t } = useT();
  const router = useRouter();
  const { config, modus, bouwSpelers, kamerId, inzetKeuze } = useSettings();

  const kamer = kamerById(kamerId ?? "hobby");
  const gestaked = !!kamerId && !kamer.hobby;
  const inzet = gestaked ? { basis: kamer.inleg, sel: inzetKeuze } : null;

  const game = useGame({ config, modus, bouwSpelers, inzet });
  const {
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
  } = game;

  // Waarschuw de engine als de speler wegnavigeert zonder af te ronden.
  useEffect(() => {
    return () => {
      afsluitenAlsAfgebroken();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Praatje van de spelleider dat meebeweegt met het spel.
  const [hostBericht, setHostBericht] = useState("");
  useEffect(() => {
    if (!state) return;
    const eersteMens = state.spelers.find((sp) => sp.isHuman);
    const win = state.spelers.find((sp) => sp.id === state.winnaarId);
    setHostBericht(
      kiesBericht({
        fase: state.fase,
        ronde: state.ronde,
        resultaat: laatsteResultaat,
        spelerNaam: eersteMens?.naam ?? "speler",
        winnaarNaam: win?.naam,
        winnaarIsMens: win?.isHuman ?? false,
      }),
    );
  }, [state, laatsteResultaat]);

  if (!state) {
    return (
      <main className="min-h-[100dvh] tafel-sterren flex items-center justify-center">
        <div className="text-cream/70">…</div>
      </main>
    );
  }

  const handmatig = modus === "oefenen" || config.reactieTijdMs <= 0;
  const mensen = state.spelers.filter((sp) => sp.isHuman);
  const computers = state.spelers.filter((sp) => !sp.isHuman);
  const inReactie = state.fase === "reactie";
  const klaarOmTeDraaien = state.fase === "wachten";
  const naReactie = state.fase === "resultaat";
  const einde = state.fase === "einde";
  const winnaar = state.spelers.find((sp) => sp.id === state.winnaarId);
  const menselijkeWinnaar = winnaar?.isHuman ?? false;

  const naamVan = (id: string | null | undefined): string | undefined =>
    id ? state.spelers.find((sp) => sp.id === id)?.naam : undefined;

  function statusTekst(): string {
    if (klaarOmTeDraaien) return t("spel.wachten");
    if (inReactie) return t("spel.reageer");
    if (naReactie) {
      if (laatsteResultaat === "correct") return t("spel.correct");
      if (laatsteResultaat === "fout")
        return config.strafkaartAan ? t("spel.fout") : t("spel.foutGeenStraf");
      if (laatsteResultaat === "gemist") return t("spel.gemist");
      return t("spel.geenMatch");
    }
    return "";
  }

  function kanTikken(sp: Player): boolean {
    return inReactie && !state!.reactiesDezeReveal[sp.id];
  }

  return (
    <main className="relative min-h-[100dvh] tafel-sterren flex flex-col px-3 py-3 sm:px-4">
      {/* HUD */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={pauzeer}
          aria-label={t("spel.pauze")}
          className="focus-ring rounded-full bg-white/10 h-10 w-10 flex items-center justify-center text-cream hover:bg-white/20"
        >
          ❚❚
        </button>
        <div className="text-center">
          <div className="font-display text-lg font-bold text-cream">
            Pese Pese
          </div>
          <div className="text-xs text-cream/60">
            {t("eind.rondes")}: {state.ronde}
          </div>
        </div>
        <div className="h-10 w-10" />
      </div>

      {/* Pot en mijlpalen bij een ingezet potje */}
      {kamerPot && (
        <div className="relative z-10 mt-2">
          <div className="mx-auto flex max-w-md items-center justify-around rounded-card bg-black/30 px-3 py-2">
            {kamerPot.eerste > 0 && (
              <Prijsvak
                label="1e kaart"
                bedrag={kamerPot.eerste}
                naam={naamVan(mijlpaalEersteId)}
              />
            )}
            {kamerPot.derde > 0 && (
              <Prijsvak
                label="3e kaart"
                bedrag={kamerPot.derde}
                naam={naamVan(mijlpaalDerdeId)}
              />
            )}
            <Prijsvak
              label="Hele pot"
              bedrag={kamerPot.pot}
              naam={state.winnaarId ? naamVan(state.winnaarId) : undefined}
            />
          </div>
        </div>
      )}

      {/* Tegenstanders (computerspelers) */}
      {computers.length > 0 && (
        <div className="relative z-10 mt-3 flex flex-wrap justify-center gap-2">
          {computers.map((sp) => {
            const reactie = state.reactiesDezeReveal[sp.id];
            return (
              <div
                key={sp.id}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 border ${
                  reactie === "correct"
                    ? "border-gold-500 bg-gold-500/15"
                    : reactie === "fout"
                      ? "border-blood-500 bg-blood-500/15"
                      : "border-white/10 bg-black/20"
                }`}
              >
                <span className="text-xl" aria-hidden="true">
                  {sp.avatar}
                </span>
                <div className="leading-tight">
                  <div className="text-xs text-cream/80">{sp.naam}</div>
                  <div className="text-xs font-semibold text-cream">
                    {sp.hand.length} {t("spel.kaarten")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Spelleider die meepraat */}
      <div className="relative z-10 mt-3">
        <Spelleider
          bericht={hostBericht}
          toonSnelknoppen={klaarOmTeDraaien || einde}
          onReageer={(e) => setHostBericht(antwoordOpReactie(e))}
        />
      </div>

      {/* Tafel met de open kaart */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 py-4">
        <div className="flex items-end gap-5">
          <div className="flex flex-col items-center gap-1">
            <Speelkaart dicht groot />
            <span className="text-[11px] text-cream/50">
              {state.leiderTrekstapel.length}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            {state.huidigeKaart ? (
              <div key={state.huidigeKaart.id} className="animate-flipIn">
                <Speelkaart kaart={state.huidigeKaart} groot />
              </div>
            ) : (
              <div className="w-24 sm:w-28 aspect-[167/243] rounded-card border-2 border-dashed border-white/20" />
            )}
            <span className="text-[11px] text-cream/50">
              {t("spel.leiderKaart")}
            </span>
          </div>
        </div>

        {/* Reactiebalk */}
        {inReactie && !handmatig && (
          <div className="h-2 w-56 max-w-full overflow-hidden rounded-full bg-white/10">
            <div
              key={state.ronde}
              className="timerbalk h-full w-full bg-gold-500"
              style={{ animationDuration: `${config.reactieTijdMs}ms` }}
            />
          </div>
        )}

        {/* Status */}
        <div
          className={`text-center text-lg font-semibold ${
            laatsteResultaat === "correct"
              ? "text-gold-400"
              : laatsteResultaat === "fout"
                ? "text-blood-500"
                : laatsteResultaat === "gemist"
                  ? "text-gold-300"
                  : "text-cream"
          }`}
        >
          {statusTekst()}
        </div>

        {/* Actieknoppen voor draaien of volgende */}
        {klaarOmTeDraaien && (
          <Knop onClick={reveal}>{t("spel.draaiKaart")}</Knop>
        )}
        {(wachtOpVolgende || naReactie || (inReactie && handmatig)) && (
          <Knop onClick={volgende}>{t("spel.volgende")}</Knop>
        )}
      </div>

      {/* Handen van de menselijke spelers */}
      <div className="relative z-10 flex flex-col gap-2 pb-2">
        {mensen.map((sp) => (
          <Paneel key={sp.id} className="!p-2">
            <div className="mb-1 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">
                  {sp.avatar}
                </span>
                <span className="text-sm font-semibold text-cream">
                  {sp.naam}
                </span>
                {kanTikken(sp) && (
                  <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-[11px] text-gold-300">
                    {t("spel.jouwBeurt")}
                  </span>
                )}
              </div>
              <span className="text-xs text-cream/60">
                {sp.hand.length} {t("spel.kaarten")}
              </span>
            </div>
            <div className="hand-scroll flex gap-1.5 overflow-x-auto px-1 pb-1">
              {sp.hand.map((k) => {
                const match =
                  !!state.huidigeKaart && kaartenMatchen(k, state.huidigeKaart);
                return (
                  <div key={k.id} className="shrink-0">
                    <Speelkaart
                      kaart={k}
                      onClick={
                        kanTikken(sp)
                          ? () => tik(sp.id, k.id)
                          : undefined
                      }
                      disabled={!kanTikken(sp)}
                      gemarkeerd={
                        handmatig && inReactie && match ? true : undefined
                      }
                      ariaLabel={`${k.rank} ${k.suit}`}
                    />
                  </div>
                );
              })}
              {sp.hand.length === 0 && (
                <div className="px-2 py-3 text-sm text-cream/50">
                  {t("eind.jijWint")}
                </div>
              )}
            </div>
          </Paneel>
        ))}
      </div>

      {/* Pauze-overlay */}
      {gepauzeerd && !einde && (
        <Overlay>
          <h2 className="mb-4 font-display text-2xl font-bold text-cream">
            {t("spel.pauze")}
          </h2>
          <div className="flex flex-col gap-2">
            <Knop volleBreedte onClick={hervat}>
              {t("spel.hervat")}
            </Knop>
            <Knop
              variant="secundair"
              volleBreedte
              onClick={() => {
                speel("knop");
                herstart();
              }}
            >
              {t("nav.opnieuw")}
            </Knop>
            <LinkKnop href="/settings" variant="ghost" volleBreedte>
              {t("instel.titel")}
            </LinkKnop>
            <Knop
              variant="gevaar"
              volleBreedte
              onClick={() => {
                afsluitenAlsAfgebroken();
                router.push("/");
              }}
            >
              {t("spel.stoppen")}
            </Knop>
          </div>
        </Overlay>
      )}

      {/* Eind-overlay */}
      {einde && (
        <Overlay>
          <div className="mb-2 text-4xl" aria-hidden="true">
            {menselijkeWinnaar ? "🏆" : "🎲"}
          </div>
          <h2 className="font-display text-2xl font-bold text-cream">
            {modus === "solo"
              ? menselijkeWinnaar
                ? t("eind.jijWint")
                : t("eind.jijVerliest")
              : t("eind.titel")}
          </h2>
          <p className="mt-1 text-cream/80">
            {t("eind.winnaar")}: {winnaar ? winnaar.naam : t("stats.geen")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <Statje
              label={t("eind.duur")}
              waarde={formatteerDuur(Date.now() - state.gestartOp)}
            />
            <Statje label={t("eind.rondes")} waarde={String(state.ronde)} />
          </div>

          {prijsResultaat && (
            <div className="mt-4 rounded-panel bg-black/25 p-3 text-left">
              <div className="mb-2 text-center text-sm text-cream/70">
                Verdeling van de pot ({euro(prijsResultaat.pot.totaal)})
              </div>
              <div className="flex flex-col gap-1">
                {prijsResultaat.delen.map((d) => (
                  <div
                    key={d.tier}
                    className="flex items-center justify-between border-b border-white/5 py-1.5 text-sm last:border-0"
                  >
                    <span className="text-cream/80">{d.label}</span>
                    <span
                      className={
                        d.isBalansSpeler ? "text-gold-400" : "text-cream/70"
                      }
                    >
                      {d.winnaarNaam} · {euro(d.bedrag)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
                <span className="text-cream/80">Jouw resultaat</span>
                <span
                  className={`font-display text-lg font-bold ${
                    prijsResultaat.balansSpelerNetto >= 0
                      ? "text-gold-400"
                      : "text-blood-500"
                  }`}
                >
                  {prijsResultaat.balansSpelerNetto >= 0 ? "+" : "-"}
                  {euro(Math.abs(prijsResultaat.balansSpelerNetto))}
                </span>
              </div>
              <div className="mt-1 text-right text-xs text-cream/60">
                Nieuw saldo: {euro(prijsResultaat.nieuwSaldo)}
              </div>
            </div>
          )}
          <div className="mt-5 flex flex-col gap-2">
            <Knop
              volleBreedte
              onClick={() => {
                speel("knop");
                // Bij een ingezet potje kies je opnieuw waar je voor speelt.
                if (gestaked) router.push("/room-setup");
                else herstart();
              }}
            >
              {t("nav.opnieuw")}
            </Knop>
            <LinkKnop href="/feedback" variant="secundair" volleBreedte>
              {t("eind.deelFeedback")}
            </LinkKnop>
            <div className="grid grid-cols-2 gap-2">
              <LinkKnop href="/rooms" variant="ghost">
                Kamers
              </LinkKnop>
              <LinkKnop href="/" variant="ghost">
                {t("nav.home")}
              </LinkKnop>
            </div>
          </div>
        </Overlay>
      )}
    </main>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
      <div className="w-full max-w-sm rounded-panel border border-white/10 bg-felt-700 p-6 text-center animate-popIn">
        {children}
      </div>
    </div>
  );
}

function Statje({ label, waarde }: { label: string; waarde: string }) {
  return (
    <div className="rounded-card bg-black/25 px-3 py-2">
      <div className="text-xs text-cream/60">{label}</div>
      <div className="font-semibold text-cream">{waarde}</div>
    </div>
  );
}

function Prijsvak({
  label,
  bedrag,
  naam,
}: {
  label: string;
  bedrag: number;
  naam?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-wide text-cream/50">
        {label}
      </div>
      <div className="font-display text-base font-bold text-cream">
        {euro(bedrag)}
      </div>
      <div className="max-w-[64px] truncate text-[10px] text-gold-300">
        {naam ?? "—"}
      </div>
    </div>
  );
}
