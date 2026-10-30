import { BANKS, type BankKey } from "@/lib/data";
import { cx } from "./ui";

/** A bank's logo on a white disc. Round logos fill the disc. */
export function BankBadge({ bank, className }: { bank: BankKey; className?: string }) {
  const { round, letters } = BANKS[bank];
  return (
    <span aria-hidden className={cx("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white inset-ring inset-ring-navy-900/10", className)}>
      {letters ? (
        <svg viewBox="0 0 40 40" className="size-full">
          <text x="20" y="25.5" textAnchor="middle" fontSize="15" fontWeight="900" letterSpacing="-0.5" fill={letters.color}>
            {letters.text}
          </text>
        </svg>
      ) : (
        <img src={`/banks/${bank}.webp`} alt="" className={round ? "size-full" : "size-[64%]"} draggable={false} />
      )}
    </span>
  );
}
