import type { SVGProps } from "react";

/** The Dash Hour mark: a ticket with its gold stub torn off along the notches. */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 28" aria-hidden {...props}>
      <path d="M4 2h19.5a3.5 3.5 0 0 0 2.5 3.354v17.292A3.5 3.5 0 0 0 23.5 26H4a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z" fill="currentColor" />
      <path d="M28 5.354A3.5 3.5 0 0 0 30.5 2H36a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3h-5.5a3.5 3.5 0 0 0-2.5-3.354Z" fill="var(--color-gold-500)" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-black tracking-[0.06em] whitespace-nowrap ${className}`}>
      DASH HOUR
    </span>
  );
}
