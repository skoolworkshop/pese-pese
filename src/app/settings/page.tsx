"use client";

import { Scherm, Paneel, Schakelaar, Segment } from "@/components/ui";
import { useT } from "@/i18n";
import { useSettings } from "@/lib/settings";
import type { Taal } from "@/i18n";

export default function InstellingenScherm() {
  const { t, taal, zetTaal } = useT();
  const { config, zetConfig } = useSettings();

  return (
    <Scherm titel={t("instel.titel")} terugNaar="/">
      <div className="flex flex-col gap-4">
        <Paneel>
          <div className="mb-2 font-semibold text-cream">
            {t("instel.startKaarten")}
          </div>
          <Segment
            waarde={config.startKaarten}
            opties={[3, 5, 7, 10].map((n) => ({ label: String(n), waarde: n }))}
            onChange={(n) => zetConfig({ startKaarten: n })}
          />
          <p className="mt-2 text-sm text-cream/60">
            Meer kaarten maakt een potje langer en pittiger.
          </p>
        </Paneel>

        <Paneel>
          <div className="mb-2 font-semibold text-cream">
            {t("instel.reactieTijd")}
          </div>
          <Segment
            waarde={config.reactieTijdMs}
            opties={[
              { label: t("snelheid.snel"), waarde: 1800 },
              { label: t("snelheid.normaal"), waarde: 2600 },
              { label: t("snelheid.rustig"), waarde: 3600 },
            ]}
            onChange={(n) => zetConfig({ reactieTijdMs: n })}
          />
          <p className="mt-2 text-sm text-cream/60">
            Hoelang je de tijd krijgt om de juiste kaart te tikken.
          </p>
        </Paneel>

        <Paneel>
          <div className="mb-2 font-semibold text-cream">
            {t("instel.computerSnelheid")}
          </div>
          <Segment
            waarde={config.computerSnelheid}
            opties={[
              { label: t("snelheid.rustig"), waarde: "rustig" },
              { label: t("snelheid.normaal"), waarde: "normaal" },
              { label: t("snelheid.snel"), waarde: "snel" },
            ]}
            onChange={(v) => zetConfig({ computerSnelheid: v })}
          />
        </Paneel>

        <Paneel>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-cream">
                {t("instel.jokers")}
              </div>
              <p className="text-sm text-cream/60">
                Speel met 2 jokers erbij.
              </p>
            </div>
            <Schakelaar
              aan={config.jokersAan}
              onChange={(v) => zetConfig({ jokersAan: v })}
              labelAria={t("instel.jokers")}
            />
          </div>
        </Paneel>

        <Paneel>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-cream">
                {t("instel.geluid")}
              </div>
              <p className="text-sm text-cream/60">Geluid en trillingen.</p>
            </div>
            <Schakelaar
              aan={config.geluidAan}
              onChange={(v) => zetConfig({ geluidAan: v })}
              labelAria={t("instel.geluid")}
            />
          </div>
        </Paneel>

        <Paneel>
          <div className="mb-2 font-semibold text-cream">{t("instel.taal")}</div>
          <Segment<Taal>
            waarde={taal}
            opties={[
              { label: "Nederlands", waarde: "nl" },
              { label: "English", waarde: "en" },
              { label: "Sranan", waarde: "srn" },
            ]}
            onChange={(v) => zetTaal(v)}
          />
        </Paneel>
      </div>
    </Scherm>
  );
}
