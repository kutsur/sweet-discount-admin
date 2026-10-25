import { z } from "zod";
import type { DiscountKind } from "./api";
import { DISCOUNT_KIND_VALUES } from "./discountKinds";

/** Mirrors the backend's limits in domain/discount_service.go. */
export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 2000;
/** In major units (BYN): the backend caps price_minor at 10 000 000. */
export const MAX_BOX_PRICE = 100_000;
export const MAX_BOX_QUANTITY = 10_000;

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
    // A box's prices in major units (5.90), converted to minor units on submit.
    price: z.union([z.number(), z.nan()]),
    original_price: z.union([z.number(), z.nan()]),
    quantity_left: z.union([z.number(), z.nan()]),
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
    if (values.kind === "surprise_box") {
      checkBoxTerms(values, ctx);
    }
    if (values.starts_on && values.ends_on && values.ends_on < values.starts_on) {
      ctx.addIssue({ code: "custom", path: ["ends_on"], message: "Не раньше даты начала" });
    }
  });

type BoxTermsValues = { price: number; original_price: number; quantity_left: number };

function checkBoxTerms(values: BoxTermsValues, ctx: z.RefinementCtx) {
  const hasKopecksOnly = (n: number) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;

  if (!Number.isFinite(values.price)) {
    ctx.addIssue({ code: "custom", path: ["price"], message: "Укажите цену бокса" });
  } else if (values.price <= 0 || values.price > MAX_BOX_PRICE || !hasKopecksOnly(values.price)) {
    ctx.addIssue({
      code: "custom",
      path: ["price"],
      message: `От 0,01 до ${MAX_BOX_PRICE}, не больше двух знаков после запятой`,
    });
  }
  if (Number.isFinite(values.original_price)) {
    if (!hasKopecksOnly(values.original_price) || values.original_price > MAX_BOX_PRICE) {
      ctx.addIssue({
        code: "custom",
        path: ["original_price"],
        message: `До ${MAX_BOX_PRICE}, не больше двух знаков после запятой`,
      });
    } else if (Number.isFinite(values.price) && values.original_price <= values.price) {
      ctx.addIssue({ code: "custom", path: ["original_price"], message: "Должна быть больше цены бокса" });
    }
  }
  if (!Number.isFinite(values.quantity_left)) {
    ctx.addIssue({ code: "custom", path: ["quantity_left"], message: "Укажите, сколько боксов осталось" });
  } else if (
    !Number.isInteger(values.quantity_left) ||
    values.quantity_left < 0 ||
    values.quantity_left > MAX_BOX_QUANTITY
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["quantity_left"],
      message: `Целое число от 0 до ${MAX_BOX_QUANTITY}`,
    });
  }
}

export type DiscountFormValues = z.infer<typeof discountFormSchema>;

export const emptyDiscountForm: DiscountFormValues = {
  kind: "percent_off",
  title: "",
  description: "",
  percent_off: Number.NaN,
  price: Number.NaN,
  original_price: Number.NaN,
  quantity_left: Number.NaN,
  active: true,
  starts_on: "",
  ends_on: "",
};
