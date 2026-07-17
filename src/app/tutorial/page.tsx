"use client";

import { useState } from "react";
import { Scherm, Paneel, Knop, LinkKnop, Speelkaart } from "@/components/ui";
import { useT } from "@/i18n";
import { speel } from "@/lib/sound";
import type { Card } from "@/game/types";

const HAND: Card[] = [
  { id: "t1", suit: "klaveren", rank: "9" },
  { id: "t2", suit: "harten", rank: "V" },
  { id: "t3", suit: "schoppen", rank: "3" },
  { id: "t4", suit: "ruiten", rank: "H" },
];
const LEIDER: Card = { id: "tl", suit: "harten", rank: "V" };

export default function UitlegScherm() {
  const { t } = useT();
  const [stap, setStap] = useState(0);
  const [getikt, setGetikt] = useState<string | null>(null);
  const [klaar, setKlaar] = useState(false);

  const stappen = [
    {
      titel: t("uitleg.stap1.titel"),
      tekst: t("uitleg.stap1.tekst"),
    },
    {
      titel: t("uitleg.stap2.titel"),
      tekst: t("uitleg.stap2.tekst"),
    },
    {
      titel: t("uitleg.stap3.titel"),
      tekst: t("uitleg.stap3.tekst"),
    },
  ];

  function tik(kaart: Card) {
    setGetikt(kaart.id);
    const goed = kaart.suit === LEIDER.suit && kaart.rank === LEIDER.rank;
    if (goed) {
      speel("correct");
      setKlaar(true);
    } else {
      speel("fout");
    }
  }

  const isOefenStap = stap === 2;

  return (
    <Scherm titel={t("uitleg.titel")} terugNaar="/">
      <Paneel>
        <div className="mb-1 text-sm text-gold-400">
          {t("uitleg.stapVan", { nu: stap + 1, totaal: stappen.length })}
        </div>
        <h2 className="font-display text-xl font-bold text-cream">
          {stappen[stap].titel}
        </h2>
        <p className="mt-2 text-cream/80">{stappen[stap].tekst}</p>

        {stap === 1 && (
          <div className="mt-5 flex flex-col items-center gap-4">
            <div className="text-sm text-cream/60">{t("uitleg.leiderKaart")}</div>
            <Speelkaart kaart={LEIDER} groot gemarkeerd />
          </div>
        )}

        {isOefenStap && (
          <div className="mt-5">
            <div className="mb-3 flex flex-col items-center gap-2">
              <div className="text-sm text-cream/60">
                {t("uitleg.leiderKaart")}
              </div>
              <Speelkaart kaart={LEIDER} groot gemarkeerd />
            </div>
            <div className="mb-2 text-center text-sm text-cream/70">
              {klaar ? t("uitleg.goedZo") : t("uitleg.tikMatch")}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {HAND.map((k) => (
                <Speelkaart
                  key={k.id}
                  kaart={k}
                  onClick={() => tik(k)}
                  disabled={klaar}
                  gemarkeerd={klaar && k.id === getikt}
                  fout={!klaar && getikt === k.id}
                  ariaLabel={`${k.rank} ${k.suit}`}
                />
              ))}
            </div>
          </div>
        )}
      </Paneel>

      <div className="mt-4 flex gap-2">
        {stap > 0 && (
          <Knop
            variant="ghost"
            onClick={() => {
              setStap((s) => s - 1);
              setGetikt(null);
              setKlaar(false);
            }}
          >
            {t("algemeen.vorige")}
          </Knop>
        )}
        {stap < stappen.length - 1 ? (
          <Knop
            volleBreedte
            onClick={() => {
              setStap((s) => s + 1);
              setGetikt(null);
              setKlaar(false);
            }}
          >
            {t("algemeen.volgende")}
          </Knop>
        ) : (
          <LinkKnop href="/mode" volleBreedte>
            {t("uitleg.begin")}
          </LinkKnop>
        )}
      </div>
    </Scherm>
  );
}
