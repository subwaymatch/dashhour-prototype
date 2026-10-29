"use client";

import { Toast } from "@base-ui/react/toast";
import { Onboarding } from "./onboarding";
import { AppShell } from "./shell";
import { StoreProvider } from "./store";
import { IssuingOverlay, TakeTicketSheet } from "./take-ticket";
import { CancelTicketDialog } from "./ticket";
import { Toasts } from "./toasts";

/** State, global overlays and the navigation shell shared by every app screen. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider limit={3}>
      <StoreProvider>
        <AppShell>{children}</AppShell>
        <TakeTicketSheet />
        <IssuingOverlay />
        <CancelTicketDialog />
        <Onboarding />
        <Toasts />
      </StoreProvider>
    </Toast.Provider>
  );
}
