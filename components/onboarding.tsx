"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowRight, ChevronsRight } from "lucide-react";
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
        <Dialog.Backdrop className="onboarding-dialog-backdrop" />
        <Dialog.Popup
          className={cx(
            "onboarding-dialog-popup-skip",
            "onboarding-dialog-popup-skip-2",
          )}
        >
          <div className="onboarding-div-skip">
            <Dialog.Close
              className={cx("onboarding-dialog-close-skip", focusRing)}
            >
              {t("skip")}
              <ChevronsRight className="onboarding-skip-icon" aria-hidden />
            </Dialog.Close>
          </div>
          <div className="onboarding-div">
            <div className="onboarding-div-2">
              <div className="onboarding-div-3" aria-hidden />
              <img
                key={slide.image}
                src={`/images/${slide.image}.webp`}
                alt=""
                className="onboarding-img"
              />
            </div>
            <Dialog.Title key={slide.title} className="onboarding-dialog-title">
              {t(slide.title)}
            </Dialog.Title>
            <Dialog.Description
              key={slide.body}
              className="onboarding-dialog-description"
            >
              {t(slide.body)}
            </Dialog.Description>
          </div>
          <div className="onboarding-div-get-started">
            <div className="onboarding-div-4" role="tablist" aria-label={t("steps")}>
              {SLIDES.map((s, i) => (
                <button
                  key={s.image}
                  type="button"
                  role="tab"
                  aria-selected={i === step}
                  aria-label={`${i + 1} / ${SLIDES.length}`}
                  onClick={() => setStep(i)}
                  className={cx(
                    "onboarding-button",
                    i === step ? "onboarding-button-2" : "onboarding-button-3",
                    focusRing,
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              className={cx(navyButton, "onboarding-button-get-started")}
              onClick={() =>
                last ? setShowOnboarding(false) : setStep(step + 1)
              }
            >
              {last ? t("getStarted") : t("next")}
              <ArrowRight className="onboarding-next-icon" aria-hidden />
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
