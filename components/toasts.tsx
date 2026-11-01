"use client";

import { Toast } from "@base-ui/react/toast";
import { X } from "lucide-react";

export function Toasts() {
  return (
    <Toast.Portal>
      <Toast.Viewport className="toasts-toast-viewport">
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
      className="toast-card"
    >
      <Toast.Content className="toast-list-toast-content">
        <div className="toast-list-div">
          <Toast.Title className="toast-list-toast-title" />
          <Toast.Description className="toast-list-toast-description" />
        </div>
        <Toast.Close aria-label="Close" className="toast-list-toast-close">
          <X className="toast-list-x" />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}
