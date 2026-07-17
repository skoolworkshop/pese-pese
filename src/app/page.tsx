"use client";

import { useEffect, useState } from "react";
import { LinkKnop } from "@/components/ui";
import { useT } from "@/i18n";
import { leesLopendSpel } from "@/game/useGame";

export default function WelkomScherm() {
  const { t } = useT();
  const [heeftLopend, setHeeftLopend] = useState(false);

  useEffect(() => {
    setHeeftLopend(!!leesLopendSpel());
  }, []);

  return (
    <main className="relative min-h-[100dvh] tafel-sterren flex flex-col px-5 py-8">
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Pese Pese, het populaire Surinaamse kaartspel"
            width={640}
            height={640}
            className="h-auto w-64 max-w-[80%] drop-shadow-xl"
          />
        </div>

        <div className="mt-2 text-center">
          <p className="text-cream/80">{t("app.tagline")}</p>
          <p className="mx-auto mt-3 max-w-xs text-sm text-cream/70">
            {t("welkom.intro")}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {heeftLopend && (
            <LinkKnop href="/play" volleBreedte variant="primair">
              {t("spel.hervat")}
            </LinkKnop>
          )}
          <LinkKnop
            href="/mode"
            volleBreedte
            variant={heeftLopend ? "secundair" : "primair"}
          >
            {t("welkom.speel")}
          </LinkKnop>
          <LinkKnop href="/rooms" volleBreedte variant="secundair">
            Kamers en inzet
          </LinkKnop>
          <div className="grid grid-cols-2 gap-3">
            <LinkKnop href="/tutorial" variant="ghost">
              {t("welkom.uitleg")}
            </LinkKnop>
            <LinkKnop href="/stats" variant="ghost">
              {t("welkom.stats")}
            </LinkKnop>
          </div>
        </div>
      </div>

      <footer className="relative z-10 mx-auto mt-6 w-full max-w-md">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-cream/60">
          <a
            className="focus-ring rounded px-1 hover:text-cream"
            href="/settings"
          >
            Instellingen
          </a>
          <a className="focus-ring rounded px-1 hover:text-cream" href="/about">
            Over
          </a>
          <a
            className="focus-ring rounded px-1 hover:text-cream"
            href="/feedback"
          >
            Feedback
          </a>
          <a
            className="focus-ring rounded px-1 hover:text-cream"
            href="/privacy"
          >
            Privacy en test
          </a>
        </div>
        <p className="mt-3 text-center text-xs text-cream/45">
          Ontwikkeld door Clinten Piqué
        </p>
      </footer>
    </main>
  );
}
