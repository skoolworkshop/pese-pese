"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Scherm, Paneel, Knop } from "@/components/ui";
import { useSettings } from "@/lib/settings";
import { KAMERS, leesFiches, resetFiches, START_FICHES, euro } from "@/game/economie";
import { speel } from "@/lib/sound";

export default function KamersScherm() {
  const router = useRouter();
  const { zetKamer } = useSettings();
  const [fiches, setFiches] = useState<number>(START_FICHES);

  useEffect(() => {
    setFiches(leesFiches());
  }, []);

  function kies(id: string) {
    speel("knop");
    zetKamer(id);
    router.push("/room-setup");
  }

  return (
    <Scherm titel="Kamers" terugNaar="/">
      <div className="mb-4">
        <Paneel className="flex items-center justify-between">
          <div>
            <div className="text-sm text-cream/70">Jouw saldo</div>
            <div className="font-display text-3xl font-bold text-gold-400">
              {euro(fiches)}
            </div>
          </div>
          <Knop
            variant="ghost"
            onClick={() => {
              setFiches(resetFiches());
            }}
          >
            Bijvullen
          </Knop>
        </Paneel>
        <p className="mt-2 px-1 text-xs text-cream/50">
          Dit is een testversie. De bedragen zijn nog niet echt en er wordt geen
          geld verwerkt.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {KAMERS.map((k) => {
          const teDuur = !k.hobby && fiches < k.inleg;
          return (
            <button
              key={k.id}
              onClick={() => !teDuur && kies(k.id)}
              disabled={teDuur}
              className="focus-ring text-left rounded-panel disabled:opacity-50"
            >
              <Paneel className="transition-colors hover:bg-black/35">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold"
                      style={{ backgroundColor: k.accent, color: "#12251c" }}
                    >
                      {k.hobby ? "★" : k.inleg}
                    </span>
                    <div>
                      <div className="font-display text-lg font-bold text-cream">
                        {k.naam}
                      </div>
                      <div className="text-sm text-cream/70">
                        {k.hobby
                          ? "Gratis spelen, geen inzet"
                          : `Inleg ${euro(k.inleg)} per speler`}
                      </div>
                    </div>
                  </div>
                  <span className="text-cream/50">
                    {teDuur ? "Te weinig saldo" : "→"}
                  </span>
                </div>
              </Paneel>
            </button>
          );
        })}
      </div>

      <p className="mt-4 px-1 text-xs text-cream/50">
        Tot 10 spelers per kamer. Nu speel je samen op 1 apparaat. Online kamers
        op aparte telefoons volgen later.
      </p>
    </Scherm>
  );
}
