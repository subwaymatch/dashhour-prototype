import type { SVGProps } from "react";

const BODY =
  "M4 2h19.5a3.5 3.5 0 0 0 2.5 3.354v17.292A3.5 3.5 0 0 0 23.5 26H4a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z";
const STUB =
  "M28 5.354A3.5 3.5 0 0 0 30.5 2H36a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3h-5.5a3.5 3.5 0 0 0-2.5-3.354Z";

/**
 * The Dash Hour mark: a ticket with its gold stub torn off along the notches.
 * Inside a link, the stub tears and snaps back on hover (see logo.css).
 */
export function LogoMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 28"
      aria-hidden
      className={`logo-mark ${className ?? ""}`}
      {...props}
    >
      <path d={BODY} fill="currentColor" />
      <path className="logo-mark-stub" d={STUB} fill="var(--color-gold-500)" />
    </svg>
  );
}

/**
 * The mark as a looping animation: the ticket lands, the stub clips on, and every few
 * seconds it tears along the perforation and snaps back.
 */
export function AnimatedLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 28"
      role="img"
      aria-label="Dash Hour"
      className={`logo-hero ${className ?? ""}`}
      {...props}
    >
      <path className="logo-hero-body" d={BODY} fill="currentColor" />
      <path
        className="logo-hero-perforation"
        d="M27 7.5v13"
        fill="none"
        stroke="var(--color-gold-500)"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeDasharray="0.1 2.5"
      />
      <path className="logo-hero-stub" d={STUB} fill="var(--color-gold-500)" />
      <path
        className="logo-hero-spark"
        d="M39.5-6.5c.35 2.1.9 2.65 3 3-2.1.35-2.65.9-3 3-.35-2.1-.9-2.65-3-3 2.1-.35 2.65-.9 3-3Z"
        fill="var(--color-gold-500)"
      />
    </svg>
  );
}
