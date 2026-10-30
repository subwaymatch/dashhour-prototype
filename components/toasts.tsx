"use client";

import { Toast } from "@base-ui/react/toast";
import { X } from "lucide-react";

export function Toasts() {
  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed top-[calc(0.75rem+env(safe-area-inset-top))] right-3 left-3 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:w-[22rem] lg:top-20">
        <ToastList />
      </Toast.Viewport>
    </Toast.Portal>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      swipeDirection={["up", "right"]}
      className={[
        "[--gap:0.5rem] [--offset-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))]",
        "absolute top-0 right-0 left-0 z-[calc(1000-var(--toast-index))] origin-top rounded-lg bg-navy-950 text-white shadow-[0_10px_30px_rgba(13,17,55,0.3)] select-none",
        "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*0.6rem)))_scale(calc(1-(var(--toast-index)*0.05)))]",
        "data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-starting-style:[transform:translateY(-120%)] data-ending-style:opacity-0 data-limited:opacity-0",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-120%)]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+120%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-120%))]",
        "h-[var(--toast-frontmost-height,var(--toast-height))] data-expanded:h-[var(--toast-height)]",
        "[transition:transform_0.45s_cubic-bezier(0.22,1,0.36,1),opacity_0.45s,height_0.15s]",
      ].join(" ")}
    >
      <Toast.Content className="flex items-start gap-3 overflow-hidden px-4 py-3 transition-opacity duration-200 data-behind:opacity-0 data-expanded:opacity-100">
        <div className="min-w-0 flex-1">
          <Toast.Title className="text-sm font-bold" />
          <Toast.Description className="mt-0.5 text-xs text-white/70 empty:hidden" />
        </div>
        <Toast.Close aria-label="Close" className="-mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
          <X className="size-4" />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}
