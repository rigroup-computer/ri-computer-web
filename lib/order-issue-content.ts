const DEVICE_SPECS_PREFIX = "Prosesor & VGA:";

export type ParsedOrderIssue = Readonly<{
  complaint: string;
  deviceSpecs: string | null;
}>;

export function formatIssueWithDeviceSpecs(
  deviceSpecs: string,
  complaint: string,
): string {
  return `${DEVICE_SPECS_PREFIX} ${deviceSpecs.trim()}\n\n${complaint.trim()}`;
}

export function parseStoredOrderIssue(issue: string): ParsedOrderIssue {
  const trimmed = issue.trim();
  if (!trimmed.startsWith(DEVICE_SPECS_PREFIX)) {
    return { deviceSpecs: null, complaint: trimmed };
  }

  const rest = trimmed.slice(DEVICE_SPECS_PREFIX.length).trimStart();
  const splitIndex = rest.indexOf("\n\n");
  if (splitIndex < 0) {
    return { deviceSpecs: rest || null, complaint: "" };
  }

  return {
    deviceSpecs: rest.slice(0, splitIndex).trim() || null,
    complaint: rest.slice(splitIndex + 2).trim(),
  };
}
