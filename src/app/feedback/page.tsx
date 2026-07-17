"use client";

import { useState } from "react";
import { Scherm, Paneel, Knop, LinkKnop, Segment } from "@/components/ui";
import { useT } from "@/i18n";
import { bewaarFeedback } from "@/lib/feedback";
import { speel } from "@/lib/sound";

export default function FeedbackScherm() {
  const { t } = useT();
  const [verstuurd, setVerstuurd] = useState(false);

  const [naam, setNaam] = useState("");
  const [leeftijd, setLeeftijd] = useState("13-15");
  const [apparaat, setApparaat] = useState("telefoon");
  const [duidelijk, setDuidelijk] = useState("ja");
  const [leuk, setLeuk] = useState("ja");
  const [werkte, setWerkte] = useState("ja");
  const [cijfer, setCijfer] = useState(8);
  const [opmerking, setOpmerking] = useState("");
  const [toestemming, setToestemming] = useState(true);

  function verstuur() {
    bewaarFeedback({
      naam,
      leeftijd,
      apparaat,
      duidelijk,
      leuk,
      werkte,
      cijfer,
      opmerking,
      toestemming,
    });
    speel("winst");
    setVerstuurd(true);
  }

  const jaBeetjeNee = [
    { label: t("feedback.ja"), waarde: "ja" },
    { label: t("feedback.beetje"), waarde: "beetje" },
    { label: t("feedback.nee"), waarde: "nee" },
  ];

  if (verstuurd) {
    return (
      <Scherm titel={t("feedback.titel")} terugNaar="/">
        <Paneel className="text-center">
          <div className="mb-2 text-4xl">🙌</div>
          <p className="text-lg font-semibold text-cream">
            {t("feedback.dank")}
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <LinkKnop href="/rooms" volleBreedte>
              {t("welkom.speel")}
            </LinkKnop>
            <LinkKnop href="/" variant="ghost" volleBreedte>
              {t("nav.home")}
            </LinkKnop>
          </div>
        </Paneel>
      </Scherm>
    );
  }

  return (
    <Scherm titel={t("feedback.titel")} terugNaar="/">
      <div className="flex flex-col gap-4">
        <Paneel>
          <label className="mb-1 block text-sm text-cream/80">
            {t("feedback.naam")}
          </label>
          <input
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            maxLength={24}
            className="focus-ring w-full rounded-card bg-white/10 px-3 py-2 text-cream placeholder-cream/40"
          />
        </Paneel>

        <Paneel>
          <div className="mb-2 text-sm text-cream/80">
            {t("feedback.leeftijd")}
          </div>
          <Segment
            waarde={leeftijd}
            onChange={setLeeftijd}
            opties={[
              { label: "onder 13", waarde: "onder13" },
              { label: "13-15", waarde: "13-15" },
              { label: "16-18", waarde: "16-18" },
              { label: "18+", waarde: "18plus" },
            ]}
          />
        </Paneel>

        <Paneel>
          <div className="mb-2 text-sm text-cream/80">
            {t("feedback.apparaat")}
          </div>
          <Segment
            waarde={apparaat}
            onChange={setApparaat}
            opties={[
              { label: "Telefoon", waarde: "telefoon" },
              { label: "Tablet", waarde: "tablet" },
              { label: "Laptop", waarde: "laptop" },
            ]}
          />
        </Paneel>

        <Paneel>
          <div className="mb-2 text-sm text-cream/80">
            {t("feedback.duidelijk")}
          </div>
          <Segment waarde={duidelijk} onChange={setDuidelijk} opties={jaBeetjeNee} />
        </Paneel>

        <Paneel>
          <div className="mb-2 text-sm text-cream/80">{t("feedback.leuk")}</div>
          <Segment waarde={leuk} onChange={setLeuk} opties={jaBeetjeNee} />
        </Paneel>

        <Paneel>
          <div className="mb-2 text-sm text-cream/80">
            {t("feedback.werkte")}
          </div>
          <Segment waarde={werkte} onChange={setWerkte} opties={jaBeetjeNee} />
        </Paneel>

        <Paneel>
          <div className="mb-2 flex items-center justify-between text-sm text-cream/80">
            <span>{t("feedback.cijfer")}</span>
            <span className="font-display text-xl font-bold text-gold-400">
              {cijfer}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={cijfer}
            onChange={(e) => setCijfer(Number(e.target.value))}
            className="w-full accent-gold-500"
          />
        </Paneel>

        <Paneel>
          <label className="mb-1 block text-sm text-cream/80">
            {t("feedback.opmerking")}
          </label>
          <textarea
            value={opmerking}
            onChange={(e) => setOpmerking(e.target.value)}
            rows={3}
            maxLength={500}
            className="focus-ring w-full rounded-card bg-white/10 px-3 py-2 text-cream placeholder-cream/40"
          />
        </Paneel>

        <Paneel>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={toestemming}
              onChange={(e) => setToestemming(e.target.checked)}
              className="mt-1 h-5 w-5 accent-gold-500"
            />
            <span className="text-sm text-cream/80">
              {t("feedback.toestemming")}
            </span>
          </label>
        </Paneel>

        <Knop volleBreedte onClick={verstuur} disabled={!toestemming}>
          {t("feedback.verstuur")}
        </Knop>
        <p className="text-center text-xs text-cream/50">
          Je feedback blijft op dit apparaat en wordt niet automatisch
          verstuurd. De testbegeleider kan de gegevens exporteren.
        </p>
      </div>
    </Scherm>
  );
}
