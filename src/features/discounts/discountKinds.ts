import type { Discount, DiscountKind } from "./api";
import { formatMinor } from "./money";

export interface DiscountKindInfo {
  label: string;
  description: string;
  /** The headline value for lists and chips, e.g. "−20%". */
  formatValue: (discount: Discount) => string;
}

/**
 * Everything the console knows per discount kind. A new kind is one entry here plus its
 * fields in DiscountTermsFields — the backend side is one case in
 * domain.validateKindTerms and its columns.
 */
export const DISCOUNT_KINDS: Record<DiscountKind, DiscountKindInfo> = {
  percent_off: {
    label: "Скидка в процентах",
    description: "Процент от счёта в выбранные дни и часы.",
    formatValue: (discount) => (discount.percent_off == null ? "—" : `−${discount.percent_off}%`),
  },
  surprise_box: {
    label: "Сюрприз-бокс",
    description: "Набор продуктов дня по сниженной цене. Покупатель забирает его в указанные часы.",
    formatValue: (discount) =>
      discount.price_minor == null
        ? "—"
        : `${formatMinor(discount.price_minor)} ${discount.currency_code ?? ""}`.trim(),
  },
};

export const DISCOUNT_KIND_VALUES = Object.keys(DISCOUNT_KINDS) as DiscountKind[];
