export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const focusRing = "focus-ring";

export const headerIconButton = "header-icon-button";

export const primaryButton = cx("primary-button", focusRing);

export const secondaryButton = cx("secondary-button", focusRing);

export const navyButton = cx("navy-button", focusRing);

export const dangerButton = cx("danger-button", focusRing);

export const popupAnimation = "popup-animation";

export const backdropClass = "backdrop-class";
