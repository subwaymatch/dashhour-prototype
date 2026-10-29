export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const focusRing =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700";

export const headerIconButton = cx(
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors",
  "hover:bg-white/10 active:bg-white/20 data-popup-open:bg-white/15",
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-300",
);

export const primaryButton = cx(
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gold-600 px-5 text-[17px] font-bold text-white transition-colors",
  "hover:bg-gold-700 active:bg-gold-800 disabled:opacity-50",
  focusRing,
);

export const secondaryButton = cx(
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-navy-900/15 bg-white px-5 text-[15px] font-semibold text-navy-900 transition-colors",
  "hover:bg-navy-100/60 active:bg-navy-100",
  focusRing,
);

export const navyButton = cx(
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-[15px] font-bold text-white transition-colors",
  "hover:bg-navy-800 active:bg-navy-950",
  focusRing,
);

export const popupAnimation =
  "transition-[scale,opacity] duration-150 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0";

export const backdropClass =
  "fixed inset-0 min-h-dvh bg-navy-950/45 backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute";
