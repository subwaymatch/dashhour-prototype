import { BANKS, type BankKey } from "@/lib/data";
import { cx } from "./ui";

/** A bank's initials on its brand colour, standing in for a logo. */
export function BankBadge({ bank, className }: { bank: BankKey; className?: string }) {
  const b = BANKS[bank];
  return (
    <span
      aria-hidden
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-tight", className)}
      style={{ backgroundColor: b.color, color: b.ink }}
    >
      {b.short}
    </span>
  );
}
