import { BANKS, type BankKey } from "@/lib/data";
import { cx } from "./ui";

/** A bank's logo on a white disc. Round logos fill the disc. */
export function BankBadge({
  bank,
  className,
}: {
  bank: BankKey;
  className?: string;
}) {
  const { round, letters } = BANKS[bank];
  return (
    <span aria-hidden className={cx("bank-badge-span", className)}>
      {letters ? (
        <svg viewBox="0 0 40 40" className="bank-badge-svg">
          <text
            x="20"
            y="25.5"
            textAnchor="middle"
            fontSize="15"
            fontWeight="900"
            letterSpacing="-0.5"
            fill={letters.color}
          >
            {letters.text}
          </text>
        </svg>
      ) : (
        <img
          src={`/banks/${bank}.webp`}
          alt=""
          className={round ? "bank-badge-svg" : "bank-badge-img"}
          draggable={false}
        />
      )}
    </span>
  );
}
