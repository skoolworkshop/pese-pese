"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { SUIT_ROOD, SUIT_SYMBOOL, RANK_LABEL } from "@/game/cards";
import type { Card } from "@/game/types";
import { ontgrendelAudio, speel } from "@/lib/sound";

type KnopVariant = "primair" | "secundair" | "ghost" | "gevaar";

interface KnopProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: KnopVariant;
  volleBreedte?: boolean;
  children: ReactNode;
}

const knopStijl: Record<KnopVariant, string> = {
  primair:
    "bg-gold-500 text-ink hover:bg-gold-400 active:translate-y-px shadow-card font-semibold",
  secundair:
    "bg-felt-600 text-cream hover:bg-felt-500 active:translate-y-px border border-felt-500",
  ghost: "bg-white/5 text-cream hover:bg-white/10 border border-white/15",
  gevaar: "bg-blood-600 text-white hover:bg-blood-500 active:translate-y-px",
};

export function Knop({
  variant = "primair",
  volleBreedte,
  className = "",
  children,
  onClick,
  ...rest
}: KnopProps) {
  return (
    <button
      {...rest}
      onClick={(e) => {
        ontgrendelAudio();
        speel("knop");
        onClick?.(e);
      }}
      className={`focus-ring rounded-card px-5 py-3 text-base transition-all geen-selectie ${
        volleBreedte ? "w-full" : ""
      } ${knopStijl[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function LinkKnop({
  href,
  variant = "primair",
  volleBreedte,
  children,
}: {
  href: string;
  variant?: KnopVariant;
  volleBreedte?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={() => {
        ontgrendelAudio();
        speel("knop");
      }}
      className={`focus-ring inline-block text-center rounded-card px-5 py-3 text-base transition-all geen-selectie ${
        volleBreedte ? "w-full" : ""
      } ${knopStijl[variant]}`}
    >
      {children}
    </Link>
  );
}

// Speelkaart. Toont voor- of achterkant met het stermotief.
export function Speelkaart({
  kaart,
  dicht,
  groot,
  gemarkeerd,
  fout,
  onClick,
  disabled,
  ariaLabel,
}: {
  kaart?: Card;
  dicht?: boolean;
  groot?: boolean;
  gemarkeerd?: boolean;
  fout?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const maat = groot
    ? "w-24 h-36 sm:w-28 sm:h-40 text-4xl"
    : "w-14 h-20 sm:w-16 sm:h-24 text-xl";

  if (dicht || !kaart) {
    return (
      <div
        className={`kaartrug rounded-card ${maat} shadow-card flex items-center justify-center`}
        aria-hidden="true"
      >
        <span className="text-gold-300 text-lg">★</span>
      </div>
    );
  }

  const rood = SUIT_ROOD[kaart.suit];
  const isJoker = kaart.suit === "joker";
  const kleur = rood ? "text-blood-600" : "text-ink";
  const rand = gemarkeerd
    ? "ring-4 ring-gold-500"
    : fout
      ? "ring-4 ring-blood-500 animate-shakeX"
      : "";

  const inhoud = (
    <div
      className={`relative bg-cream rounded-card ${maat} shadow-card flex flex-col justify-between p-1.5 ${rand} ${
        onClick && !disabled ? "hover:-translate-y-1 transition-transform" : ""
      }`}
    >
      {isJoker ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gold-500">
          <span className={groot ? "text-3xl" : "text-lg"}>★</span>
          <span className={`font-semibold ${groot ? "text-sm" : "text-[10px]"}`}>
            Joker
          </span>
        </div>
      ) : (
        <>
          <div className={`leading-none font-semibold ${kleur}`}>
            <div className={groot ? "text-lg" : "text-xs"}>
              {RANK_LABEL[kaart.rank]}
            </div>
            <div className={groot ? "text-2xl" : "text-sm"}>
              {SUIT_SYMBOOL[kaart.suit]}
            </div>
          </div>
          <div
            className={`self-center ${kleur} ${groot ? "text-5xl" : "text-2xl"}`}
          >
            {SUIT_SYMBOOL[kaart.suit]}
          </div>
          <div
            className={`self-end rotate-180 leading-none font-semibold ${kleur}`}
          >
            <div className={groot ? "text-lg" : "text-xs"}>
              {RANK_LABEL[kaart.rank]}
            </div>
            <div className={groot ? "text-2xl" : "text-sm"}>
              {SUIT_SYMBOOL[kaart.suit]}
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className="focus-ring rounded-card disabled:opacity-60 geen-selectie"
      >
        {inhoud}
      </button>
    );
  }
  return inhoud;
}

// Aan/uit schakelaar.
export function Schakelaar({
  aan,
  onChange,
  labelAria,
}: {
  aan: boolean;
  onChange: (v: boolean) => void;
  labelAria?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={aan}
      aria-label={labelAria}
      onClick={() => {
        speel("knop");
        onChange(!aan);
      }}
      className={`focus-ring relative h-8 w-14 rounded-full transition-colors ${
        aan ? "bg-gold-500" : "bg-white/20"
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-cream transition-transform ${
          aan ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// Keuze uit een rij opties.
export function Segment<T extends string | number>({
  opties,
  waarde,
  onChange,
  label,
}: {
  opties: { label: string; waarde: T }[];
  waarde: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-2"
    >
      {opties.map((opt) => {
        const actief = opt.waarde === waarde;
        return (
          <button
            key={String(opt.waarde)}
            role="radio"
            aria-checked={actief}
            onClick={() => {
              speel("knop");
              onChange(opt.waarde);
            }}
            className={`focus-ring rounded-card px-4 py-2 text-sm transition-colors geen-selectie ${
              actief
                ? "bg-gold-500 text-ink font-semibold"
                : "bg-white/5 text-cream border border-white/15 hover:bg-white/10"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Schermkader met titel en terugknop.
export function Scherm({
  titel,
  terugNaar,
  children,
  breed,
}: {
  titel?: string;
  terugNaar?: string;
  children: ReactNode;
  breed?: boolean;
}) {
  const router = useRouter();
  return (
    <main className="relative min-h-[100dvh] tafel-sterren px-4 py-5 sm:py-8">
      <div
        className={`relative z-10 mx-auto ${breed ? "max-w-3xl" : "max-w-md"}`}
      >
        {(titel || terugNaar) && (
          <header className="mb-5 flex items-center gap-3">
            {terugNaar !== undefined && (
              <button
                onClick={() => {
                  speel("knop");
                  if (terugNaar) router.push(terugNaar);
                  else router.back();
                }}
                aria-label="Terug"
                className="focus-ring rounded-full bg-white/10 h-10 w-10 flex items-center justify-center text-cream hover:bg-white/20"
              >
                ←
              </button>
            )}
            {titel && (
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
                {titel}
              </h1>
            )}
          </header>
        )}
        {children}
      </div>
    </main>
  );
}

export function Paneel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-panel bg-black/25 border border-white/10 p-4 sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}
