import { z } from "zod";
import type { DiscountKind } from "./api";
import { DISCOUNT_KIND_VALUES } from "./discountKinds";

/** Mirrors the backend's limits in domain/discount_service.go. */
export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 2000;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const optionalDate = z
  .string()
  .refine((value) => value === "" || DATE_PATTERN.test(value), "Формат ГГГГ-ММ-ДД");

export const discountFormSchema = z
  .object({
    kind: z.enum(DISCOUNT_KIND_VALUES as [DiscountKind, ...DiscountKind[]]),
    title: z
      .string()
      .trim()
      .min(1, "Укажите название")
      .max(MAX_TITLE_LENGTH, `Не более ${MAX_TITLE_LENGTH} символов`),
    description: z.string().max(MAX_DESCRIPTION_LENGTH, `Не более ${MAX_DESCRIPTION_LENGTH} символов`),
    // NaN when the input is empty, so "required" and "range" errors stay distinct.
    percent_off: z.union([z.number(), z.nan()]),
    active: z.boolean(),
    starts_on: optionalDate,
    ends_on: optionalDate,
  })
  .superRefine((values, ctx) => {
    // Kind-specific terms — the one place a new kind adds its rules, as on the backend.
    if (values.kind === "percent_off") {
      if (!Number.isFinite(values.percent_off)) {
        ctx.addIssue({ code: "custom", path: ["percent_off"], message: "Укажите размер скидки" });
      } else if (
        !Number.isInteger(values.percent_off) ||
        values.percent_off < 1 ||
        values.percent_off > 100
      ) {
        ctx.addIssue({ code: "custom", path: ["percent_off"], message: "Целое число от 1 до 100" });
      }
    }
    if (values.starts_on && values.ends_on && values.ends_on < values.starts_on) {
      ctx.addIssue({ code: "custom", path: ["ends_on"], message: "Не раньше даты начала" });
    }
  });

export type DiscountFormValues = z.infer<typeof discountFormSchema>;

export const emptyDiscountForm: DiscountFormValues = {
  kind: "percent_off",
  title: "",
  description: "",
  percent_off: Number.NaN,
  active: true,
  starts_on: "",
  ends_on: "",
};
