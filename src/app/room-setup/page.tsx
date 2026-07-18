"use client";

import { useRouter } from "next/navigation";
import { Scherm, Paneel, Knop, Schakelaar } from "@/components/ui";
import { useSettings } from "@/lib/settings";
import { wisLopendSpel } from "@/game/useGame";
import {
  MAX_SPELERS,
  DERDE_FACTOR,
  EERSTE_FACTOR,
  berekenPools,
  totaleInleg,
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
    inzetKeuze,
    naamOverrides,
    zetConfig,
    zetAantalMensen,
    zetInzet,
    zetNaam,
    bouwSpelers,
  } = useSettings();

  const kamer = kamerById(kamerId ?? "hobby");
  const gestaked = !kamer.hobby;
  const spelers = bouwSpelers();
  const jouwInleg = totaleInleg(kamer.inleg, inzetKeuze);
  const pools = berekenPools(kamer.inleg, config.spelerAantal, inzetKeuze);

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
              <span className="text-cream/80">Jouw inleg</span>
              <span className="font-display text-2xl font-bold text-gold-400">
                {euro(jouwInleg)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-sm">
              <span className="text-cream/70">Totale pot</span>
              <span className="font-semibold text-cream">
                {euro(pools.pot)}
              </span>
            </div>
            {pools.eerste > 0 && (
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-cream/70">1e-kaart prijs</span>
                <span className="font-semibold text-cream">
                  {euro(pools.eerste)}
                </span>
              </div>
            )}
            {pools.derde > 0 && (
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-cream/70">3e-kaart prijs</span>
                <span className="font-semibold text-cream">
                  {euro(pools.derde)}
                </span>
              </div>
            )}
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
            <div className="mb-1 font-semibold text-cream">
              Waar speel je voor?
            </div>
            <p className="mb-3 text-sm text-cream/60">
              De pot speel je altijd. 1e en 3e kaart kun je er als extra bij
              nemen.
            </p>

            <div className="flex items-center justify-between rounded-card bg-white/5 px-3 py-2">
              <div>
                <div className="font-semibold text-cream">Pot</div>
                <div className="text-xs text-cream/60">
                  Wie als eerste alle kaarten kwijt is
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gold-400">
                  {euro(kamer.inleg)}
                </div>
                <div className="text-[11px] text-cream/50">altijd</div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between rounded-card bg-white/5 px-3 py-2">
              <div>
                <div className="font-semibold text-cream">3e kaart</div>
                <div className="text-xs text-cream/60">
                  Extra: {euro(kamer.inleg * DERDE_FACTOR)} erbij
                </div>
              </div>
              <Schakelaar
                aan={inzetKeuze.derde}
                onChange={(v) => zetInzet({ ...inzetKeuze, derde: v })}
                labelAria="3e kaart meespelen"
              />
            </div>

            <div className="mt-2 flex items-center justify-between rounded-card bg-white/5 px-3 py-2">
              <div>
                <div className="font-semibold text-cream">1e kaart</div>
                <div className="text-xs text-cream/60">
                  Extra: {euro(kamer.inleg * EERSTE_FACTOR)} erbij
                </div>
              </div>
              <Schakelaar
                aan={inzetKeuze.eerste}
                onChange={(v) => zetInzet({ ...inzetKeuze, eerste: v })}
                labelAria="1e kaart meespelen"
              />
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
          {gestaked ? `Meedoen voor ${euro(jouwInleg)}` : "Start het spel"}
        </Knop>
      </div>
    </Scherm>
  );
}
