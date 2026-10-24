import type { ListDiscountsParams } from "./api";

export const discountsKeys = {
  all: ["discounts"] as const,
  lists: () => [...discountsKeys.all, "list"] as const,
  list: (params: ListDiscountsParams) => [...discountsKeys.lists(), params] as const,
  details: () => [...discountsKeys.all, "detail"] as const,
  detail: (id: string) => [...discountsKeys.details(), id] as const,
};
