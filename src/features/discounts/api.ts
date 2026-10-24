import { api } from "../../api/client";
import { unwrap, unwrapPage, unwrapVoid } from "../../api/envelope";
import type { components } from "../../api/schema.gen";

export type Discount = components["schemas"]["Discount"];
export type DiscountKind = components["schemas"]["DiscountKind"];
export type DiscountStatus = components["schemas"]["DiscountStatus"];
export type ScheduleWindow = components["schemas"]["ScheduleWindow"];
export type CreateDiscountRequest = components["schemas"]["CreateDiscountRequest"];
export type UpdateDiscountRequest = components["schemas"]["UpdateDiscountRequest"];

export interface ListDiscountsParams {
  limit: number;
  offset: number;
  placeId?: string;
  status?: DiscountStatus;
  q?: string;
  /** YYYY-MM-DD — keep only discounts whose date range contains this day. */
  validOn?: string;
}

// Scoped server-side: an admin sees every discount, a manager those of their cities,
// an owner those of their places.
export function fetchDiscounts({ limit, offset, placeId, status, q, validOn }: ListDiscountsParams) {
  return unwrapPage<Discount>(
    api.GET("/manage/discounts", {
      params: {
        query: {
          limit,
          offset,
          place_id: placeId || undefined,
          status: status || undefined,
          q: q || undefined,
          valid_on: validOn || undefined,
        },
      },
    }),
  );
}

export function fetchDiscount(id: string) {
  return unwrap<Discount>(api.GET("/manage/discounts/{id}", { params: { path: { id } } }));
}

export function createDiscount(body: CreateDiscountRequest) {
  return unwrap<Discount>(api.POST("/manage/discounts", { body }));
}

export function updateDiscount(id: string, body: UpdateDiscountRequest) {
  return unwrap<Discount>(api.PATCH("/manage/discounts/{id}", { params: { path: { id } }, body }));
}

export function deleteDiscount(id: string) {
  return unwrapVoid(api.DELETE("/manage/discounts/{id}", { params: { path: { id } } }));
}
