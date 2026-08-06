import {
  whatsappDeepLink,
  whatsappHref,
} from "@/lib/whatsapp";

export type CustomerWhatsAppDispatchResult =
  | { status: "invalid_phone" }
  | { status: "opened" };

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Reserve a tab synchronously while the user gesture is still active. */
export function prepareWhatsAppTab(): Window | null {
  try {
    return window.open("about:blank", "_blank", "noopener,noreferrer");
  } catch {
    return null;
  }
}

export function closeWhatsAppTab(tab: Window | null): void {
  if (!tab || tab.closed) {
    return;
  }
  try {
    tab.close();
  } catch {
    // Some browsers block closing cross-origin tabs.
  }
}

function resolveWhatsAppTarget(
  phone: string,
  message: string,
): { href: string; mobileHref: string } | null {
  const href = whatsappHref(phone, message);
  if (!href) {
    return null;
  }
  const deepLink = whatsappDeepLink(phone, message);
  return {
    href,
    mobileHref: deepLink ?? href,
  };
}

function navigatePreparedTab(tab: Window, targetHref: string): boolean {
  try {
    tab.location.replace(targetHref);
    return true;
  } catch {
    try {
      tab.location.href = targetHref;
      return true;
    } catch {
      return false;
    }
  }
}

function openViaAnchorClick(targetHref: string): void {
  if (typeof document === "undefined") {
    return;
  }
  const anchor = document.createElement("a");
  anchor.href = targetHref;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function dispatchCustomerWhatsApp(
  phone: string,
  message: string,
  preparedTab: Window | null = null,
): CustomerWhatsAppDispatchResult {
  const targets = resolveWhatsAppTarget(phone, message);
  if (!targets) {
    closeWhatsAppTab(preparedTab);
    return { status: "invalid_phone" };
  }

  const targetHref = isMobileDevice() ? targets.mobileHref : targets.href;

  if (preparedTab && !preparedTab.closed) {
    if (navigatePreparedTab(preparedTab, targetHref)) {
      return { status: "opened" };
    }
    closeWhatsAppTab(preparedTab);
  }

  const opened = window.open(targetHref, "_blank", "noopener,noreferrer");
  if (opened) {
    return { status: "opened" };
  }

  openViaAnchorClick(targetHref);
  return { status: "opened" };
}
