import type { SVGProps } from "react";

/** The Dash Hour badge: a queue ticket with a torn, zig-zag bottom edge. */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 44" aria-hidden {...props}>
      <path d="M5 2.5C5 1.7 5.7 1 6.5 1h27c.8 0 1.5.7 1.5 1.5S34.3 4 33.5 4h-27C5.7 4 5 3.3 5 2.5Z" fill="currentColor" />
      <path d="M4 9a2 2 0 0 1 2-2h28a2 2 0 0 1 2 2v26l-4 4-4-4-4 4-4-4-4 4-4-4-4 4-4-4Z" fill="currentColor" />
      <text
        x="20"
        y="28"
        textAnchor="middle"
        fontSize="17"
        fontWeight="900"
        fontFamily="var(--font-display)"
        letterSpacing="-0.5"
        fill="var(--color-navy-950)"
      >
        DH
      </text>
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
