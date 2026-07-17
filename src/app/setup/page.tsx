"use client";

import { useRouter } from "next/navigation";
import { Scherm, Paneel, Knop, LinkKnop, Segment } from "@/components/ui";
import { useT } from "@/i18n";
import { useSettings } from "@/lib/settings";
import { wisLopendSpel } from "@/game/useGame";

export default function SetupScherm() {
  const { t } = useT();
  const router = useRouter();
  const {
    modus,
    config,
    aantalMensen,
    zetConfig,
    zetAantalMensen,
    zetNaam,
    naamOverrides,
    bouwSpelers,
  } = useSettings();

  const spelers = bouwSpelers();

  function start() {
    // Begin met een schone lei zodat er geen oud spel wordt hervat.
    wisLopendSpel();
    router.push("/play");
  }

  return (
    <Scherm titel={t("setup.titel")} terugNaar="/mode">
      <div className="flex flex-col gap-4">
        {modus !== "oefenen" && (
          <Paneel>
            <label className="mb-2 block font-semibold text-cream">
              {t("setup.aantalSpelers")}
            </label>
            <Segment
              label={t("setup.aantalSpelers")}
              waarde={config.spelerAantal}
              opties={[2, 3, 4].map((n) => ({ label: String(n), waarde: n }))}
              onChange={(n) => {
                zetConfig({ spelerAantal: n });
                if (modus === "lokaal") zetAantalMensen(n);
                if (modus === "solo" && aantalMensen > n) zetAantalMensen(1);
              }}
            />
          </Paneel>
        )}

        {modus === "solo" && (
          <Paneel>
            <div className="text-sm text-cream/70">
              Jij speelt tegen {config.spelerAantal - 1}{" "}
              {config.spelerAantal - 1 === 1 ? "computerspeler" : "computerspelers"}.
            </div>
          </Paneel>
        )}

        {modus === "oefenen" && (
          <Paneel>
            <div className="text-sm text-cream/70">
              Oefenmodus: jij speelt alleen, zonder tijdsdruk. Draai kaarten om
              en tik de kaart die matcht.
            </div>
          </Paneel>
        )}

        <Paneel>
          <div className="mb-2 font-semibold text-cream">Namen</div>
          <div className="flex flex-col gap-2">
            {spelers.map((sp, i) => (
              <div key={sp.id} className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {sp.avatar}
                </span>
                {sp.isHuman ? (
                  <input
                    value={naamOverrides[i] ?? sp.naam}
                    onChange={(e) => zetNaam(i, e.target.value)}
                    aria-label={`${t("setup.naam")} ${i + 1}`}
                    maxLength={16}
                    className="focus-ring flex-1 rounded-card bg-white/10 px-3 py-2 text-cream placeholder-cream/40"
                  />
                ) : (
                  <span className="flex-1 text-cream/80">
                    {sp.naam}{" "}
                    <span className="text-cream/50">({t("setup.computer")})</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </Paneel>

        <div className="flex flex-col gap-2">
          <Knop volleBreedte onClick={start}>
            {t("setup.startSpel")}
          </Knop>
          <LinkKnop href="/settings" variant="ghost" volleBreedte>
            {t("instel.titel")}
          </LinkKnop>
        </div>
      </div>
    </Scherm>
  );
}
