/** The console's currency: every city is in Belarus today (cities.country_code = BY). */
export const BOX_CURRENCY = "BYN";

/** 590 → "5,90". Money travels as integer minor units (api-contract.md rule 5). */
export function formatMinor(minor: number): string {
  return (minor / 100).toFixed(2).replace(".", ",");
}

/** 5.9 → 590; rounds away float noise such as 5.9 * 100 = 590.0000000000001. */
export function toMinor(major: number): number {
  return Math.round(major * 100);
}
