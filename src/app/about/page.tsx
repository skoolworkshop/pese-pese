"use client";

import { Scherm, Paneel, LinkKnop } from "@/components/ui";
import { useT } from "@/i18n";

export default function OverScherm() {
  const { t } = useT();
  return (
    <Scherm titel={t("over.titel")} terugNaar="/" breed>
      <div className="flex flex-col gap-4">
        <Paneel>
          <p className="text-cream/85 leading-relaxed">
            Pese Pese is het populaire Surinaamse kaartspel. Iedereen krijgt
            kaarten in de hand. De spelleider draait steeds een kaart open. Zie
            je dezelfde kaart in je eigen hand? Tik er dan snel op. Wie als
            eerste al zijn kaarten kwijt is, wint het potje.
          </p>
        </Paneel>

        <Paneel>
          <h2 className="mb-2 font-display text-lg font-bold text-cream">
            Waar het spel om draait
          </h2>
          <p className="text-cream/85 leading-relaxed">
            Pese Pese gaat om snelheid, herkennen en op tijd reageren. Je moet
            jouw kaart terugzien in de open kaart en er als eerste bij zijn.
            Deze app brengt dat naar je telefoon, tablet of laptop, zodat je
            overal kunt spelen of oefenen.
          </p>
        </Paneel>

        <Paneel>
          <h2 className="mb-2 font-display text-lg font-bold text-cream">
            Manieren om te spelen
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-cream/85">
            <li>Tegen de computer, alleen oefenen tegen slimme tegenstanders.</li>
            <li>Samen op 1 apparaat, gezellig met 2 tot 4 spelers.</li>
            <li>Oefenen, rustig leren zonder tijdsdruk.</li>
          </ul>
        </Paneel>

        <Paneel>
          <p className="text-sm text-cream/70">
            Deze app is gemaakt als leer en testproject. Alle gegevens blijven
            op je eigen apparaat. Kijk bij Privacy en test voor meer uitleg.
          </p>
          <div className="mt-3">
            <LinkKnop href="/privacy" variant="ghost">
              {t("privacy.titel")}
            </LinkKnop>
          </div>
        </Paneel>

        <p className="px-1 text-center text-sm text-cream/55">
          Pese Pese is ontwikkeld door Clinten Piqué. Gemaakt met liefde voor het
          spel en voor de Surinaamse cultuur.
        </p>
      </div>
    </Scherm>
  );
}
