// Veilige helpers rond localStorage. Werkt ook wanneer opslag geblokkeerd is.

export function leesJson<T>(sleutel: string, standaard: T): T {
  if (typeof window === "undefined") return standaard;
  try {
    const ruw = localStorage.getItem(sleutel);
    if (!ruw) return standaard;
    return JSON.parse(ruw) as T;
  } catch {
    return standaard;
  }
}

export function schrijfJson(sleutel: string, waarde: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(sleutel, JSON.stringify(waarde));
  } catch {
    // Opslag vol of geblokkeerd. Stil negeren zodat het spel doorloopt.
  }
}

export function verwijder(sleutel: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(sleutel);
  } catch {
    // negeren
  }
}

export function downloadBestand(
  naam: string,
  inhoud: string,
  type: string,
): void {
  const blob = new Blob([inhoud], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = naam;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
