"use client";

import { Scherm, Paneel, LinkKnop } from "@/components/ui";
import { useT } from "@/i18n";

export default function PrivacyScherm() {
  const { t } = useT();
  return (
    <Scherm titel={t("privacy.titel")} terugNaar="/" breed>
      <div className="flex flex-col gap-4">
        <Paneel>
          <h2 className="mb-2 font-display text-lg font-bold text-cream">
            Wat slaat de app op
          </h2>
          <p className="text-cream/85 leading-relaxed">
            De app bewaart alleen gegevens op je eigen apparaat. Denk aan je
            instellingen, je statistieken en de feedback die je invult. Er gaat
            niets automatisch naar een server. Er zijn geen accounts en er is
            geen tracking.
          </p>
        </Paneel>

        <Paneel>
          <h2 className="mb-2 font-display text-lg font-bold text-cream">
            Feedback tijdens het testen
          </h2>
          <p className="text-cream/85 leading-relaxed">
            Vul je het feedbackformulier in, dan wordt dat lokaal bewaard. De
            testbegeleider kan de verzamelde feedback op dat apparaat exporteren
            als JSON of CSV. Zo blijven de gegevens onder jouw controle.
          </p>
        </Paneel>

        <Paneel>
          <h2 className="mb-2 font-display text-lg font-bold text-cream">
            Gegevens wissen
          </h2>
          <p className="text-cream/85 leading-relaxed">
            Je kunt op elk moment alles wissen. Ga naar Statistieken en kies
            Alle gegevens wissen. Daarmee verdwijnen statistieken, testgegevens
            en feedback van dit apparaat.
          </p>
        </Paneel>

        <Paneel>
          <h2 className="mb-2 font-display text-lg font-bold text-cream">
            Voor de testbegeleider
          </h2>
          <p className="mb-3 text-cream/85 leading-relaxed">
            In het testdashboard staan de verzamelde spelgegevens en feedback,
            met knoppen om te exporteren. Het dashboard is afgeschermd met een
            pincode.
          </p>
          <LinkKnop href="/dashboard" variant="secundair">
            {t("dashboard.titel")}
          </LinkKnop>
        </Paneel>
      </div>
    </Scherm>
  );
}
