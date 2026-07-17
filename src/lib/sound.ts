// Zelf gegenereerde geluidseffecten via de Web Audio API. Geen externe
// bestanden nodig, dus rechtenvrij en licht.

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function toon(
  frequentie: number,
  duurMs: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  startVertragingMs = 0,
): void {
  const ac = audioContext();
  if (!ac) return;
  const nu = ac.currentTime + startVertragingMs / 1000;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequentie, nu);
  gain.gain.setValueAtTime(0, nu);
  gain.gain.linearRampToValueAtTime(volume, nu + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, nu + duurMs / 1000);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(nu);
  osc.stop(nu + duurMs / 1000);
}

export type GeluidNaam =
  | "flip"
  | "correct"
  | "fout"
  | "winst"
  | "knop";

let geluidAan = true;

export function zetGeluid(aan: boolean): void {
  geluidAan = aan;
}

// Sommige browsers starten de audiocontext pas na een gebruikersactie.
export function ontgrendelAudio(): void {
  const ac = audioContext();
  if (ac && ac.state === "suspended") {
    ac.resume().catch(() => undefined);
  }
}

export function speel(naam: GeluidNaam): void {
  if (!geluidAan) return;
  switch (naam) {
    case "flip":
      toon(320, 90, "triangle", 0.12);
      break;
    case "correct":
      toon(660, 90, "sine", 0.16);
      toon(880, 120, "sine", 0.16, 80);
      break;
    case "fout":
      toon(180, 220, "sawtooth", 0.14);
      break;
    case "winst":
      toon(523, 130, "sine", 0.18);
      toon(659, 130, "sine", 0.18, 130);
      toon(784, 130, "sine", 0.18, 260);
      toon(1047, 220, "sine", 0.18, 390);
      break;
    case "knop":
      toon(440, 60, "triangle", 0.1);
      break;
  }
}

export function tril(patroon: number | number[]): void {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(patroon);
    } catch {
      // Niet ondersteund. Negeren.
    }
  }
}
