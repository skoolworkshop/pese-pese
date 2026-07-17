"use client";

import { useEffect, useState } from "react";
import { Scherm, Paneel, Knop } from "@/components/ui";
import { useT } from "@/i18n";
import {
  LEGE_STATS,
  favorieteModus,
  formatteerDuur,
  gemiddeldeReactie,
  leesStats,
  wisStats,
  wisTelemetrie,
  type SpelerStats,
} from "@/lib/stats";
import { wisFeedback } from "@/lib/feedback";

const MODUS_LABEL: Record<string, string> = {
  solo: "Tegen de computer",
  lokaal: "Samen op 1 apparaat",
  oefenen: "Oefenen",
};

export default function StatsScherm() {
  const { t } = useT();
  const [stats, setStats] = useState<SpelerStats>(LEGE_STATS);
  const [geladen, setGeladen] = useState(false);
  const [bevestig, setBevestig] = useState(false);

  useEffect(() => {
    setStats(leesStats());
    setGeladen(true);
  }, []);

  const leeg = stats.spellen === 0;
  const gem = gemiddeldeReactie(stats);
  const fav = favorieteModus(stats);

  function wisAlles() {
    wisStats();
    wisTelemetrie();
    wisFeedback();
    setStats(LEGE_STATS);
    setBevestig(false);
  }

  return (
    <Scherm titel={t("stats.titel")} terugNaar="/">
      {!geladen ? null : leeg ? (
        <Paneel>
          <p className="text-cream/70">{t("stats.leeg")}</p>
        </Paneel>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Tegel label={t("stats.spellen")} waarde={String(stats.spellen)} />
            <Tegel label={t("stats.gewonnen")} waarde={String(stats.gewonnen)} />
            <Tegel label={t("stats.verloren")} waarde={String(stats.verloren)} />
            <Tegel
              label={t("stats.fouteTikken")}
              waarde={String(stats.fouteTikken)}
            />
            <Tegel
              label={t("stats.snelste")}
              waarde={
                stats.snelsteReactieMs !== null
                  ? `${stats.snelsteReactieMs} ms`
                  : t("stats.geen")
              }
            />
            <Tegel
              label={t("stats.gemiddelde")}
              waarde={gem !== null ? `${gem} ms` : t("stats.geen")}
            />
          </div>

          <Paneel>
            <Rij
              label={t("stats.favoriet")}
              waarde={fav ? (MODUS_LABEL[fav] ?? fav) : t("stats.geen")}
            />
            <Rij
              label={t("stats.laatste")}
              waarde={
                stats.laatstGespeeld
                  ? new Date(stats.laatstGespeeld).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : t("stats.geen")
              }
            />
          </Paneel>

          {!bevestig ? (
            <Knop variant="gevaar" onClick={() => setBevestig(true)}>
              {t("stats.wissen")}
            </Knop>
          ) : (
            <Paneel>
              <p className="mb-3 text-cream/80">
                Weet je het zeker? Dit wist statistieken, testgegevens en
                feedback op dit apparaat.
              </p>
              <div className="flex gap-2">
                <Knop variant="gevaar" onClick={wisAlles}>
                  Ja, wis alles
                </Knop>
                <Knop variant="ghost" onClick={() => setBevestig(false)}>
                  {t("nav.annuleren")}
                </Knop>
              </div>
            </Paneel>
          )}
        </div>
      )}
    </Scherm>
  );
}

function Tegel({ label, waarde }: { label: string; waarde: string }) {
  return (
    <Paneel className="!p-3 text-center">
      <div className="font-display text-2xl font-bold text-gold-400">
        {waarde}
      </div>
      <div className="mt-1 text-xs text-cream/70">{label}</div>
    </Paneel>
  );
}

function Rij({ label, waarde }: { label: string; waarde: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
      <span className="text-cream/70">{label}</span>
      <span className="font-semibold text-cream">{waarde}</span>
    </div>
  );
}
