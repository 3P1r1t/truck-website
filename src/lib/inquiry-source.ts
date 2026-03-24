export type InquirySourceType = "GENERAL" | "PRODUCT";

const SOURCE_PATTERN = /^\[SOURCE:(GENERAL|PRODUCT)\]\s*/;

export function normalizeInquirySourceType(value?: string | null): InquirySourceType {
  if (value === "GENERAL") {
    return "GENERAL";
  }
  return "PRODUCT";
}

export function encodeInquiryIntentNotes(intentNotes: string | null | undefined, sourceType: InquirySourceType) {
  const cleaned = decodeInquiryIntentNotes(intentNotes).intentNotes;
  return cleaned ? `[SOURCE:${sourceType}] ${cleaned}` : `[SOURCE:${sourceType}]`;
}

export function decodeInquiryIntentNotes(intentNotes: string | null | undefined) {
  const raw = (intentNotes || "").trim();
  const match = raw.match(SOURCE_PATTERN);

  if (!match) {
    return {
      sourceType: undefined as InquirySourceType | undefined,
      intentNotes: raw,
    };
  }

  return {
    sourceType: normalizeInquirySourceType(match[1]),
    intentNotes: raw.replace(SOURCE_PATTERN, "").trim(),
  };
}
