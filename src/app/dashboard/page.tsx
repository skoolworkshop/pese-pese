"use client";

import { useEffect, useState } from "react";
import { Scherm, Paneel, Knop } from "@/components/ui";
import { useT } from "@/i18n";
import {
  feedbackNaarCsv,
  feedbackNaarJson,
  leesFeedback,
  wisFeedback,
  type FeedbackItem,
} from "@/lib/feedback";
import {
  leesTelemetrie,
  formatteerDuur,
  type TelemetrieItem,
} from "@/lib/stats";
import { downloadBestand } from "@/lib/storage";

const PIN = "2580";

export default function DashboardScherm() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [invoer, setInvoer] = useState("");
  const [fout, setFout] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [telemetrie, setTelemetrie] = useState<TelemetrieItem[]>([]);

  useEffect(() => {
    if (open) {
      setFeedback(leesFeedback());
      setTelemetrie(leesTelemetrie());
    }
  }, [open]);

  function probeer() {
    if (invoer.trim() === PIN) {
      setOpen(true);
      setFout(false);
    } else {
      setFout(true);
    }
  }

  function exporteerJson() {
    downloadBestand(
      "pisipisi-feedback.json",
      feedbackNaarJson(),
      "application/json",
    );
  }

  function exporteerCsv() {
    downloadBestand("pisipisi-feedback.csv", feedbackNaarCsv(), "text/csv");
  }

  function exporteerTelemetrie() {
    downloadBestand(
      "pisipisi-telemetrie.json",
      JSON.stringify(telemetrie, null, 2),
      "application/json",
    );
  }

  if (!open) {
    return (
      <Scherm titel={t("dashboard.titel")} terugNaar="/privacy">
        <Paneel>
          <label className="mb-2 block text-sm text-cream/80">
            {t("dashboard.pincode")}
          </label>
          <input
            value={invoer}
            onChange={(e) => setInvoer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && probeer()}
            inputMode="numeric"
            type="password"
            className="focus-ring w-full rounded-card bg-white/10 px-3 py-2 text-cream"
          />
          {fout && (
            <p className="mt-2 text-sm text-blood-500">{t("dashboard.fout")}</p>
          )}
          <div className="mt-4">
            <Knop volleBreedte onClick={probeer}>
              {t("dashboard.open")}
            </Knop>
          </div>
        </Paneel>
      </Scherm>
    );
  }

  const voltooid = telemetrie.filter((x) => x.voltooid).length;
  const afgebroken = telemetrie.filter((x) => x.afgebroken).length;
  const gemCijfer =
    feedback.length > 0
      ? (
          feedback.reduce((s, f) => s + f.cijfer, 0) / feedback.length
        ).toFixed(1)
      : "-";

  return (
    <Scherm titel={t("dashboard.titel")} terugNaar="/privacy" breed>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tegel label="Spellen" waarde={String(telemetrie.length)} />
          <Tegel label="Voltooid" waarde={String(voltooid)} />
          <Tegel label="Afgebroken" waarde={String(afgebroken)} />
          <Tegel label="Gem. cijfer" waarde={gemCijfer} />
        </div>

        <Paneel>
          <div className="mb-3 font-display text-lg font-bold text-cream">
            Feedback ({feedback.length})
          </div>
          <div className="flex flex-wrap gap-2">
            <Knop onClick={exporteerJson} disabled={feedback.length === 0}>
              {t("dashboard.exporteerJson")}
            </Knop>
            <Knop
              variant="secundair"
              onClick={exporteerCsv}
              disabled={feedback.length === 0}
            >
              {t("dashboard.exporteerCsv")}
            </Knop>
            <Knop variant="ghost" onClick={exporteerTelemetrie}>
              Telemetrie JSON
            </Knop>
          </div>

          {feedback.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {feedback
                .slice()
                .reverse()
                .slice(0, 20)
                .map((f) => (
                  <div
                    key={f.op}
                    className="rounded-card bg-black/25 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-cream">
                        {f.naam || "Anoniem"}{" "}
                        <span className="text-cream/50">
                          ({f.leeftijd}, {f.apparaat})
                        </span>
                      </span>
                      <span className="font-display text-gold-400">
                        {f.cijfer}/10
                      </span>
                    </div>
                    <div className="mt-1 text-cream/70">
                      Duidelijk: {f.duidelijk}. Leuk: {f.leuk}. Werkte:{" "}
                      {f.werkte}.
                    </div>
                    {f.opmerking && (
                      <div className="mt-1 text-cream/85">
                        “{f.opmerking}”
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </Paneel>

        <Paneel>
          <div className="mb-3 font-display text-lg font-bold text-cream">
            Laatste spellen
          </div>
          {telemetrie.length === 0 ? (
            <p className="text-cream/70">Nog geen spelgegevens.</p>
          ) : (
            <div className="flex flex-col gap-1 text-sm">
              {telemetrie
                .slice()
                .reverse()
                .slice(0, 20)
                .map((x, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-white/5 py-1.5 last:border-0"
                  >
                    <span className="text-cream/80">{x.modus}</span>
                    <span className="text-cream/60">
                      {x.rondes} rondes, {formatteerDuur(x.duurMs)}
                    </span>
                    <span
                      className={
                        x.voltooid ? "text-gold-400" : "text-cream/50"
                      }
                    >
                      {x.voltooid ? x.winnaar : "afgebroken"}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Paneel>

        <Knop
          variant="gevaar"
          onClick={() => {
            wisFeedback();
            setFeedback([]);
          }}
        >
          {t("dashboard.wisFeedback")}
        </Knop>
      </div>
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
