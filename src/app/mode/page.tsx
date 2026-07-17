"use client";

import { useRouter } from "next/navigation";
import { Scherm, Paneel } from "@/components/ui";
import { useT } from "@/i18n";
import { useSettings } from "@/lib/settings";
import type { SpelModus } from "@/game/types";
import { speel } from "@/lib/sound";

const MODI: { modus: SpelModus; icoon: string; titelKey: string; uitlegKey: string }[] = [
  { modus: "solo", icoon: "🤖", titelKey: "modus.solo", uitlegKey: "modus.solo.uitleg" },
  { modus: "lokaal", icoon: "👥", titelKey: "modus.lokaal", uitlegKey: "modus.lokaal.uitleg" },
  { modus: "oefenen", icoon: "🎓", titelKey: "modus.oefenen", uitlegKey: "modus.oefenen.uitleg" },
];

export default function ModusScherm() {
  const { t } = useT();
  const { zetModus } = useSettings();
  const router = useRouter();

  function kies(m: SpelModus) {
    speel("knop");
    zetModus(m);
    router.push("/setup");
  }

  return (
    <Scherm titel={t("modus.titel")} terugNaar="/">
      <div className="flex flex-col gap-3">
        {MODI.map((m) => (
          <button
            key={m.modus}
            onClick={() => kies(m.modus)}
            className="focus-ring text-left rounded-panel"
          >
            <Paneel className="transition-colors hover:bg-black/35">
              <div className="flex items-center gap-4">
                <span className="text-4xl" aria-hidden="true">
                  {m.icoon}
                </span>
                <div>
                  <div className="font-display text-xl font-bold text-cream">
                    {t(m.titelKey)}
                  </div>
                  <div className="text-sm text-cream/70">{t(m.uitlegKey)}</div>
                </div>
              </div>
            </Paneel>
          </button>
        ))}
      </div>
    </Scherm>
  );
}
