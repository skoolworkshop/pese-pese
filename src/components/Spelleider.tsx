"use client";

import { speel } from "@/lib/sound";

// De spelleider. Een vriendelijke gastheer die je verwelkomt en meeleeft.
// Dit is een praatje dat bij het spel hoort, geen echte medespeler.

export const SPELLEIDER_NAAM = "Dealer";
export const SPELLEIDER_AVATAR = "🎩";

export function Spelleider({
  bericht,
  toonSnelknoppen,
  onReageer,
}: {
  bericht: string;
  toonSnelknoppen?: boolean;
  onReageer?: (emoji: string) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md items-start gap-2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xl">
        {SPELLEIDER_AVATAR}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold text-gold-300">
          {SPELLEIDER_NAAM}
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-black/30 px-3 py-2 text-sm text-cream">
          {bericht}
        </div>
        {toonSnelknoppen && onReageer && (
          <div className="mt-2 flex gap-2">
            {["👋", "💪", "😅", "🔥"].map((e) => (
              <button
                key={e}
                onClick={() => {
                  speel("knop");
                  onReageer(e);
                }}
                className="focus-ring rounded-full bg-white/10 px-3 py-1 text-lg hover:bg-white/20"
                aria-label={`Reageer met ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Kiest een passend praatje op basis van wat er in het spel gebeurt.
export function kiesBericht(opts: {
  fase: string;
  ronde: number;
  resultaat: "correct" | "fout" | "gemist" | null;
  spelerNaam: string;
  winnaarNaam?: string;
  winnaarIsMens?: boolean;
}): string {
  const { fase, ronde, resultaat, spelerNaam, winnaarNaam, winnaarIsMens } =
    opts;

  if (fase === "einde") {
    if (winnaarIsMens)
      return `Masha bun, ${spelerNaam}! Je hebt gewonnen. Netjes gespeeld.`;
    return `${winnaarNaam ?? "De ander"} was net sneller. Volgende keer pak jij 'm, ${spelerNaam}.`;
  }

  if (fase === "wachten" && ronde === 0) {
    return `Hi ${spelerNaam}, leuk dat je er bent! Ik ben de ${SPELLEIDER_NAAM}. Draai de eerste kaart maar om als je klaar bent.`;
  }

  if (resultaat === "correct") {
    return kies(ronde, [
      "Bun so! Mooi gezien.",
      "Ja! Lekker snel.",
      "Netjes, die pak je goed.",
      "Zo doe je dat.",
    ]);
  }
  if (resultaat === "fout") {
    return kies(ronde, [
      "Oei, mis. Geeft niks, ga door.",
      "Net niet. Blijf rustig.",
      "Verkeerde kaart, let op de volgende.",
    ]);
  }
  if (resultaat === "gemist") {
    return kies(ronde, [
      "Te laat! Blijf scherp, de volgende komt eraan.",
      "Aai, voorbij. Focus op de volgende kaart.",
      "Die liet je gaan. Volgende keer sneller.",
    ]);
  }

  if (fase === "reactie") {
    return kies(ronde, [
      "Let goed op...",
      "Ogen op je kaarten.",
      "Klaar om te tikken?",
    ]);
  }

  return "Zet 'm op!";
}

function kies(ronde: number, opties: string[]): string {
  return opties[ronde % opties.length];
}

// Vrolijke reacties als de speler een snelknop tikt.
export function antwoordOpReactie(emoji: string): string {
  switch (emoji) {
    case "👋":
      return `Fa waka! Fijn dat je er bent. Zet 'm op.`;
    case "💪":
      return "Die energie mag ik wel. Laat maar zien.";
    case "😅":
      return "Rustig ademhalen, jij kan dit.";
    case "🔥":
      return "Vuurwerk! Kom, we gaan ervoor.";
    default:
      return "Zet 'm op!";
  }
}
