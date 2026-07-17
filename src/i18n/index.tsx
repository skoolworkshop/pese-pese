"use client";

// Lichtgewicht vertaalsysteem. Voeg nieuwe teksten toe aan de woordenboeken
// hieronder. Ontbrekende sleutels vallen terug op Nederlands.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Taal = "nl" | "en" | "srn";

export const TALEN: { code: Taal; label: string }[] = [
  { code: "nl", label: "Nederlands" },
  { code: "en", label: "English" },
  { code: "srn", label: "Sranantongo" },
];

type Woordenboek = Record<string, string>;

// Nederlands is de basis en is altijd volledig.
const nl: Woordenboek = {
  "app.naam": "Pese Pese",
  "app.tagline": "Het populaire Surinaamse kaartspel",
  "nav.terug": "Terug",
  "nav.home": "Home",
  "nav.verder": "Verder",
  "nav.start": "Start",
  "nav.opnieuw": "Opnieuw spelen",
  "nav.sluiten": "Sluiten",
  "nav.annuleren": "Annuleren",
  "nav.opslaan": "Opslaan",

  "welkom.speel": "Speel",
  "welkom.uitleg": "Hoe werkt het",
  "welkom.stats": "Statistieken",
  "welkom.over": "Over Pese Pese",
  "welkom.intro":
    "Draai kaarten om, herken jouw kaart en tik als eerste. Wie het snelst zijn kaarten kwijt is, wint.",

  "modus.titel": "Kies een spelmodus",
  "modus.solo": "Tegen de computer",
  "modus.solo.uitleg": "Speel alleen tegen 1 tot 3 computerspelers.",
  "modus.lokaal": "Samen op 1 apparaat",
  "modus.lokaal.uitleg": "2 tot 4 spelers om hetzelfde scherm.",
  "modus.oefenen": "Oefenen",
  "modus.oefenen.uitleg": "Rustig leren zonder tijdsdruk of tegenstanders.",

  "setup.titel": "Spelers instellen",
  "setup.aantalSpelers": "Aantal spelers",
  "setup.aantalMensen": "Aantal mensen",
  "setup.naam": "Naam",
  "setup.mens": "Mens",
  "setup.computer": "Computer",
  "setup.startSpel": "Start het spel",

  "instel.titel": "Spelregels en instellingen",
  "instel.startKaarten": "Startkaarten per speler",
  "instel.reactieTijd": "Reactietijd",
  "instel.strafkaart": "Strafkaart bij foute tik",
  "instel.computerSnelheid": "Snelheid computerspelers",
  "instel.jokers": "Jokerkaarten",
  "instel.geluid": "Geluid",
  "instel.uitleg": "Uitleg tijdens het spel",
  "instel.taal": "Taal",
  "instel.aan": "Aan",
  "instel.uit": "Uit",
  "snelheid.rustig": "Rustig",
  "snelheid.normaal": "Normaal",
  "snelheid.snel": "Snel",

  "spel.leiderKaart": "Kaart van de spelleider",
  "spel.jouwKaarten": "Jouw kaarten",
  "spel.wachten": "Klaar? Draai de eerste kaart om.",
  "spel.draaiKaart": "Draai kaart om",
  "spel.volgende": "Volgende kaart",
  "spel.reageer": "Tik jouw kaart als die matcht!",
  "spel.correct": "Goed zo!",
  "spel.fout": "Mis! Strafkaart erbij.",
  "spel.foutGeenStraf": "Mis!",
  "spel.geenMatch": "Niemand had deze kaart.",
  "spel.gemist": "Te laat! Je kaart blijft in je hand.",
  "spel.eersteReactie": "Eerste reactie",
  "spel.pauze": "Pauze",
  "spel.hervat": "Verder spelen",
  "spel.stoppen": "Stoppen",
  "spel.kaarten": "kaarten",
  "spel.jouwBeurt": "Tik nu",
  "spel.hint": "Hint",
  "spel.tikHier": "Tik hier",

  "eind.titel": "Einde spel",
  "eind.winnaar": "Winnaar",
  "eind.jijWint": "Jij wint!",
  "eind.jijVerliest": "Helaas, verloren.",
  "eind.duur": "Speelduur",
  "eind.rondes": "Rondes",
  "eind.deelFeedback": "Geef feedback",

  "stats.titel": "Statistieken",
  "stats.spellen": "Gespeelde spellen",
  "stats.gewonnen": "Gewonnen",
  "stats.verloren": "Verloren",
  "stats.snelste": "Snelste reactie",
  "stats.gemiddelde": "Gemiddelde reactietijd",
  "stats.fouteTikken": "Foute tikken",
  "stats.favoriet": "Favoriete modus",
  "stats.laatste": "Laatst gespeeld",
  "stats.leeg": "Nog geen statistieken. Speel eerst een spel.",
  "stats.wissen": "Alle gegevens wissen",
  "stats.geen": "geen",

  "feedback.titel": "Feedback",
  "feedback.naam": "Voornaam of bijnaam (optioneel)",
  "feedback.leeftijd": "Leeftijdscategorie",
  "feedback.apparaat": "Apparaat",
  "feedback.duidelijk": "Was het spel duidelijk?",
  "feedback.leuk": "Was het spel leuk?",
  "feedback.werkte": "Werkte alles goed?",
  "feedback.cijfer": "Cijfer (1 tot 10)",
  "feedback.opmerking": "Opmerkingen",
  "feedback.toestemming": "Ik geef toestemming om deze feedback te gebruiken.",
  "feedback.verstuur": "Verstuur feedback",
  "feedback.dank": "Bedankt voor je feedback!",
  "feedback.ja": "Ja",
  "feedback.beetje": "Een beetje",
  "feedback.nee": "Nee",

  "over.titel": "Over Pese Pese",
  "privacy.titel": "Privacy en test",

  "algemeen.vorige": "Vorige",
  "algemeen.volgende": "Volgende",

  "uitleg.titel": "Hoe werkt het",
  "uitleg.stapVan": "Stap {nu} van {totaal}",
  "uitleg.leiderKaart": "Kaart van de spelleider",
  "uitleg.tikMatch": "Tik de kaart die matcht met de open kaart.",
  "uitleg.goedZo": "Goed zo! Dat is de match.",
  "uitleg.begin": "Begin met spelen",
  "uitleg.stap1.titel": "Het doel",
  "uitleg.stap1.tekst":
    "Iedereen krijgt kaarten in de hand. De spelleider draait steeds een kaart open. Wie als eerste al zijn kaarten kwijt is, wint.",
  "uitleg.stap2.titel": "Herken jouw kaart",
  "uitleg.stap2.tekst":
    "Heb je dezelfde kaart als de open kaart? Tik er dan snel op. Klopt het, dan ben je die kaart kwijt. Dat is precies wat je wilt.",
  "uitleg.stap3.titel": "Probeer het zelf",
  "uitleg.stap3.tekst":
    "Hieronder zie je de open kaart en jouw hand. Tik de kaart die matcht.",

  "dashboard.titel": "Testdashboard",
  "dashboard.pincode": "Pincode",
  "dashboard.open": "Openen",
  "dashboard.fout": "Onjuiste pincode.",
  "dashboard.exporteerJson": "Exporteer JSON",
  "dashboard.exporteerCsv": "Exporteer CSV",
  "dashboard.wisFeedback": "Wis alle feedback",
};

// Engelse vertaling van dezelfde sleutels.
const en: Woordenboek = {
  "app.naam": "Pese Pese",
  "app.tagline": "The popular Surinamese card game",
  "nav.terug": "Back",
  "nav.home": "Home",
  "nav.verder": "Next",
  "nav.start": "Start",
  "nav.opnieuw": "Play again",
  "nav.sluiten": "Close",
  "nav.annuleren": "Cancel",
  "nav.opslaan": "Save",
  "welkom.speel": "Play",
  "welkom.uitleg": "How it works",
  "welkom.stats": "Statistics",
  "welkom.over": "About Pese Pese",
  "welkom.intro":
    "Flip cards, spot your card and tap first. The first to run out of cards wins.",
  "modus.titel": "Choose a game mode",
  "modus.solo": "Against the computer",
  "modus.solo.uitleg": "Play solo against 1 to 3 computer players.",
  "modus.lokaal": "Together on 1 device",
  "modus.lokaal.uitleg": "2 to 4 players around the same screen.",
  "modus.oefenen": "Practice",
  "modus.oefenen.uitleg": "Learn calmly, no time pressure or opponents.",
  "setup.titel": "Set up players",
  "setup.aantalSpelers": "Number of players",
  "setup.aantalMensen": "Number of humans",
  "setup.naam": "Name",
  "setup.mens": "Human",
  "setup.computer": "Computer",
  "setup.startSpel": "Start the game",
  "instel.titel": "Rules and settings",
  "instel.startKaarten": "Starting cards per player",
  "instel.reactieTijd": "Reaction time",
  "instel.strafkaart": "Penalty card on wrong tap",
  "instel.computerSnelheid": "Computer speed",
  "instel.jokers": "Joker cards",
  "instel.geluid": "Sound",
  "instel.uitleg": "In-game hints",
  "instel.taal": "Language",
  "instel.aan": "On",
  "instel.uit": "Off",
  "snelheid.rustig": "Calm",
  "snelheid.normaal": "Normal",
  "snelheid.snel": "Fast",
  "spel.leiderKaart": "Dealer's card",
  "spel.jouwKaarten": "Your cards",
  "spel.wachten": "Ready? Flip the first card.",
  "spel.draaiKaart": "Flip card",
  "spel.volgende": "Next card",
  "spel.reageer": "Tap your card if it matches!",
  "spel.correct": "Nice!",
  "spel.fout": "Miss! Penalty card added.",
  "spel.foutGeenStraf": "Miss!",
  "spel.geenMatch": "Nobody held this card.",
  "spel.gemist": "Too late! Your card stays in your hand.",
  "spel.eersteReactie": "First to react",
  "spel.pauze": "Pause",
  "spel.hervat": "Resume",
  "spel.stoppen": "Quit",
  "spel.kaarten": "cards",
  "spel.jouwBeurt": "Tap now",
  "spel.hint": "Hint",
  "spel.tikHier": "Tap here",
  "eind.titel": "Game over",
  "eind.winnaar": "Winner",
  "eind.jijWint": "You win!",
  "eind.jijVerliest": "You lost this time.",
  "eind.duur": "Duration",
  "eind.rondes": "Rounds",
  "eind.deelFeedback": "Give feedback",
  "stats.titel": "Statistics",
  "stats.spellen": "Games played",
  "stats.gewonnen": "Won",
  "stats.verloren": "Lost",
  "stats.snelste": "Fastest reaction",
  "stats.gemiddelde": "Average reaction",
  "stats.fouteTikken": "Wrong taps",
  "stats.favoriet": "Favourite mode",
  "stats.laatste": "Last played",
  "stats.leeg": "No statistics yet. Play a game first.",
  "stats.wissen": "Clear all data",
  "stats.geen": "none",
  "feedback.titel": "Feedback",
  "feedback.naam": "First name or nickname (optional)",
  "feedback.leeftijd": "Age group",
  "feedback.apparaat": "Device",
  "feedback.duidelijk": "Was the game clear?",
  "feedback.leuk": "Was the game fun?",
  "feedback.werkte": "Did everything work?",
  "feedback.cijfer": "Score (1 to 10)",
  "feedback.opmerking": "Comments",
  "feedback.toestemming": "I allow this feedback to be used.",
  "feedback.verstuur": "Send feedback",
  "feedback.dank": "Thanks for your feedback!",
  "feedback.ja": "Yes",
  "feedback.beetje": "A bit",
  "feedback.nee": "No",
  "over.titel": "About Pese Pese",
  "privacy.titel": "Privacy and testing",
  "dashboard.titel": "Test dashboard",
  "dashboard.pincode": "PIN code",
  "dashboard.open": "Open",
  "dashboard.fout": "Wrong PIN.",
  "dashboard.exporteerJson": "Export JSON",
  "dashboard.exporteerCsv": "Export CSV",
  "dashboard.wisFeedback": "Clear all feedback",
};

// Sranantongo startset. Ontbrekende sleutels vallen terug op Nederlands,
// zodat de vertaling stap voor stap aangevuld kan worden.
const srn: Woordenboek = {
  "app.tagline": "A populèri Sranan kartaspel",
  "welkom.speel": "Prei",
  "nav.terug": "Drai baka",
  "nav.home": "Oso",
  "modus.solo": "Teige a komputru",
  "spel.correct": "Bun!",
  "spel.fout": "Misi!",
};

const woordenboeken: Record<Taal, Woordenboek> = { nl, en, srn };

interface I18nContextType {
  taal: Taal;
  zetTaal: (t: Taal) => void;
  t: (sleutel: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const OPSLAG_SLEUTEL = "pisipisi.taal";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [taal, setTaalState] = useState<Taal>("nl");

  useEffect(() => {
    try {
      const opgeslagen = localStorage.getItem(OPSLAG_SLEUTEL) as Taal | null;
      if (opgeslagen && woordenboeken[opgeslagen]) setTaalState(opgeslagen);
    } catch {
      // localStorage niet beschikbaar. Blijf bij Nederlands.
    }
  }, []);

  const zetTaal = useCallback((nieuw: Taal) => {
    setTaalState(nieuw);
    try {
      localStorage.setItem(OPSLAG_SLEUTEL, nieuw);
    } catch {
      // negeren
    }
  }, []);

  const t = useCallback(
    (sleutel: string, params?: Record<string, string | number>) => {
      let tekst =
        woordenboeken[taal][sleutel] ?? woordenboeken.nl[sleutel] ?? sleutel;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          tekst = tekst.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return tekst;
    },
    [taal],
  );

  const waarde = useMemo(() => ({ taal, zetTaal, t }), [taal, zetTaal, t]);

  return <I18nContext.Provider value={waarde}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT moet binnen I18nProvider gebruikt worden");
  return ctx;
}
