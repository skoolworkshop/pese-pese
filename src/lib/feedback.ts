// Opslag en export van testerfeedback. Alles blijft lokaal op het apparaat.

import { leesJson, schrijfJson, verwijder } from "./storage";

const SLEUTEL = "pisipisi.feedback";

export interface FeedbackItem {
  op: number;
  naam: string;
  leeftijd: string;
  apparaat: string;
  duidelijk: string;
  leuk: string;
  werkte: string;
  cijfer: number;
  opmerking: string;
  toestemming: boolean;
}

export function leesFeedback(): FeedbackItem[] {
  return leesJson<FeedbackItem[]>(SLEUTEL, []);
}

export function bewaarFeedback(item: Omit<FeedbackItem, "op">): FeedbackItem[] {
  const lijst = leesFeedback();
  lijst.push({ ...item, op: Date.now() });
  const bijgewerkt = lijst.slice(-500);
  schrijfJson(SLEUTEL, bijgewerkt);
  return bijgewerkt;
}

export function wisFeedback(): void {
  verwijder(SLEUTEL);
}

export function feedbackNaarJson(): string {
  return JSON.stringify(leesFeedback(), null, 2);
}

export function feedbackNaarCsv(): string {
  const lijst = leesFeedback();
  const kolommen = [
    "op",
    "naam",
    "leeftijd",
    "apparaat",
    "duidelijk",
    "leuk",
    "werkte",
    "cijfer",
    "opmerking",
    "toestemming",
  ];
  const regels = [kolommen.join(",")];
  for (const item of lijst) {
    const rij = kolommen.map((k) => {
      const waarde = (item as unknown as Record<string, unknown>)[k];
      const tekst =
        k === "op"
          ? new Date(item.op).toISOString()
          : String(waarde ?? "");
      // Escape voor CSV.
      const veilig = tekst.replace(/"/g, '""');
      return `"${veilig}"`;
    });
    regels.push(rij.join(","));
  }
  return regels.join("\n");
}
