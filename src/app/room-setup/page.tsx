"use client";

import { useRouter } from "next/navigation";
import { Scherm, Paneel, Knop } from "@/components/ui";
import { useSettings } from "@/lib/settings";
import { wisLopendSpel } from "@/game/useGame";
import {
  MAX_SPELERS,
  VERDELING_PRESETS,
  berekenPrijzen,
  kamerById,
  euro,
} from "@/game/economie";
import { speel } from "@/lib/sound";

function Stepper({
  waarde,
  min,
  max,
  onChange,
  label,
}: {
  waarde: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cream/80">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            speel("knop");
            onChange(Math.max(min, waarde - 1));
          }}
          disabled={waarde <= min}
          aria-label="Minder"
          className="focus-ring h-9 w-9 rounded-full bg-white/10 text-cream disabled:opacity-40 hover:bg-white/20"
        >
          −
        </button>
        <span className="w-8 text-center font-display text-xl font-bold text-cream">
          {waarde}
        </span>
        <button
          onClick={() => {
            speel("knop");
            onChange(Math.min(max, waarde + 1));
          }}
          disabled={waarde >= max}
          aria-label="Meer"
          className="focus-ring h-9 w-9 rounded-full bg-white/10 text-cream disabled:opacity-40 hover:bg-white/20"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function KamerSetupScherm() {
  const router = useRouter();
  const {
    kamerId,
    config,
    aantalMensen,
    prijsVerdeling,
    naamOverrides,
    zetConfig,
    zetAantalMensen,
    zetVerdeling,
    zetNaam,
    bouwSpelers,
  } = useSettings();

  const kamer = kamerById(kamerId ?? "hobby");
  const gestaked = !kamer.hobby;
  const spelers = bouwSpelers();
  const pot = berekenPrijzen(kamer.inleg, config.spelerAantal, prijsVerdeling);

  function start() {
    wisLopendSpel();
    router.push("/play");
  }

  return (
    <Scherm titel={kamer.naam} terugNaar="/rooms">
      <div className="flex flex-col gap-4">
        {gestaked && (
          <Paneel>
            <div className="flex items-center justify-between">
              <span className="text-cream/80">Inleg per speler</span>
              <span className="font-display text-xl font-bold text-gold-400">
                {euro(kamer.inleg)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
              <span className="text-cream/80">Totale pot</span>
              <span className="font-display text-xl font-bold text-cream">
                {euro(pot.totaal)}
              </span>
            </div>
          </Paneel>
        )}

        <Paneel className="flex flex-col gap-3">
          <Stepper
            label="Aantal spelers"
            waarde={config.spelerAantal}
            min={2}
            max={MAX_SPELERS}
            onChange={(n) => {
              zetConfig({ spelerAantal: n });
              if (aantalMensen > n) zetAantalMensen(n);
            }}
          />
          <div className="border-t border-white/10" />
          <Stepper
            label="Mensen (pass and play)"
            waarde={Math.min(aantalMensen, config.spelerAantal)}
            min={1}
            max={config.spelerAantal}
            onChange={(n) => zetAantalMensen(n)}
          />
          <p className="text-sm text-cream/60">
            De overige {config.spelerAantal - Math.min(aantalMensen, config.spelerAantal)}{" "}
            {config.spelerAantal - Math.min(aantalMensen, config.spelerAantal) === 1
              ? "speler is"
              : "spelers zijn"}{" "}
            de computer.
          </p>
        </Paneel>

        {gestaked && (
          <Paneel>
            <div className="mb-2 font-semibold text-cream">
              Zo verdeel je de pot
            </div>
            <div className="flex flex-col gap-2">
              {VERDELING_PRESETS.map((p) => {
                const actief =
                  p.verdeling.eerste === prijsVerdeling.eerste &&
                  p.verdeling.derde === prijsVerdeling.derde &&
                  p.verdeling.pot === prijsVerdeling.pot;
                const voorbeeld = berekenPrijzen(
                  kamer.inleg,
                  config.spelerAantal,
                  p.verdeling,
                );
                return (
                  <button
                    key={p.label}
                    onClick={() => {
                      speel("knop");
                      zetVerdeling(p.verdeling);
                    }}
                    className={`focus-ring rounded-card border px-3 py-2 text-left ${
                      actief
                        ? "border-gold-500 bg-gold-500/15"
                        : "border-white/15 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-cream">
                        {p.label}
                      </span>
                      <span className="text-xs text-cream/60">
                        {p.verdeling.eerste} / {p.verdeling.derde} /{" "}
                        {p.verdeling.pot}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-cream/70">
                      1e kaart {euro(voorbeeld.eerste)}, 3e kaart{" "}
                      {euro(voorbeeld.derde)}, hele pot {euro(voorbeeld.pot)}
                    </div>
                  </button>
                );
              })}
            </div>
          </Paneel>
        )}

        <Paneel>
          <div className="mb-2 font-semibold text-cream">Namen</div>
          <div className="flex flex-col gap-2">
            {spelers.map((sp, i) =>
              sp.isHuman ? (
                <div key={sp.id} className="flex items-center gap-3">
                  <span className="text-lg" aria-hidden="true">
                    {sp.avatar}
                  </span>
                  <input
                    value={naamOverrides[i] ?? sp.naam}
                    onChange={(e) => zetNaam(i, e.target.value)}
                    aria-label={`Naam speler ${i + 1}`}
                    maxLength={16}
                    className="focus-ring flex-1 rounded-card bg-white/10 px-3 py-2 text-cream"
                  />
                </div>
              ) : (
                <div key={sp.id} className="flex items-center gap-3 text-cream/70">
                  <span className="text-lg" aria-hidden="true">
                    {sp.avatar}
                  </span>
                  <span>
                    {sp.naam} <span className="text-cream/50">(computer)</span>
                  </span>
                </div>
              ),
            )}
          </div>
        </Paneel>

        {gestaked && (
          <p className="px-1 text-xs text-cream/50">
            Jij bent speler 1 en betaalt de inleg uit je saldo. De andere seats
            vullen de pot aan voor het spel. Wat zij winnen zie je erbij, maar
            alleen jouw saldo wordt bewaard.
          </p>
        )}

        <Knop volleBreedte onClick={start}>
          {gestaked ? `Meedoen voor ${euro(kamer.inleg)}` : "Start het spel"}
        </Knop>
      </div>
    </Scherm>
  );
}
