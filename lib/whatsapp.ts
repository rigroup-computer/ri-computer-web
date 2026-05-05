const digitsOnly = (value: string) => value.replace(/\D/gu, "");

export function normalizeWhatsAppTarget(value: string): string | null {
  let d = digitsOnly(value.trim());
  if (!d.length) return null;
  if (d.startsWith("0")) {
    d = `62${d.slice(1)}`;
  }
  if (!d.startsWith("62")) {
    d = `62${d}`;
  }
  return d.length >= 10 ? d : null;
}

export function whatsappHref(phone: string, message?: string) {
  const target = normalizeWhatsAppTarget(phone);
  if (!target) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${target}${text}`;
}
