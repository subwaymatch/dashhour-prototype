"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useStore } from "./store";
import { cx, focusRing, navyButton } from "./ui";

const SLIDES = [
  { image: "onboard-ticket", title: "ob1Title", body: "ob1Body" },
  { image: "onboard-queue", title: "ob2Title", body: "ob2Body" },
  { image: "onboard-arrive", title: "ob3Title", body: "ob3Body" },
] as const;

export function Onboarding() {
  const { showOnboarding, setShowOnboarding, t } = useStore();
  const [step, setStep] = React.useState(0);
  const slide = SLIDES[step];
  const last = step === SLIDES.length - 1;

  return (
    <Dialog.Root
      open={showOnboarding}
      onOpenChange={(open) => {
        setShowOnboarding(open);
        if (!open) window.setTimeout(() => setStep(0), 300);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className={cx(
            "fixed inset-0 flex flex-col bg-paper outline-none transition-[opacity,transform] duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0",
            "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:w-[26rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-hidden sm:rounded-lg sm:shadow-2xl",
          )}
        >
          <div className="flex justify-end px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:pt-4">
            <Dialog.Close className={cx("rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:bg-black/5", focusRing)}>{t("skip")}</Dialog.Close>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="relative aspect-square w-full max-w-[280px]">
              <div className="absolute inset-[8%] rounded-full bg-gold-100" aria-hidden />
              <img key={slide.image} src={`/images/${slide.image}.webp`} alt="" className="relative size-full animate-rise object-contain" />
            </div>
            <Dialog.Title key={slide.title} className="mt-6 animate-rise text-xl leading-tight font-bold tracking-tight text-ink">
              {t(slide.title)}
            </Dialog.Title>
            <Dialog.Description key={slide.body} className="mt-3 max-w-xs animate-rise text-sm leading-relaxed text-muted">
              {t(slide.body)}
            </Dialog.Description>
          </div>
          <div className="px-6 pt-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6">
            <div className="mb-6 flex justify-center gap-2" role="tablist" aria-label="Steps">
              {SLIDES.map((s, i) => (
                <button
                  key={s.image}
                  type="button"
                  role="tab"
                  aria-selected={i === step}
                  aria-label={`${i + 1} / ${SLIDES.length}`}
                  onClick={() => setStep(i)}
                  className={cx("h-2 rounded-full transition-all", i === step ? "w-6 bg-navy-900" : "w-2 bg-line hover:bg-muted/40", focusRing)}
                />
              ))}
            </div>
            <button type="button" className={cx(navyButton, "h-14 w-full")} onClick={() => (last ? setShowOnboarding(false) : setStep(step + 1))}>
              {last ? t("getStarted") : t("next")}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
