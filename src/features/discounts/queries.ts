import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as discountsApi from "./api";
import type { CreateDiscountRequest, Discount, ListDiscountsParams, UpdateDiscountRequest } from "./api";
import { discountsKeys } from "./queryKeys";

export function useDiscountsList(params: ListDiscountsParams) {
  return useQuery({
    queryKey: discountsKeys.list(params),
    queryFn: () => discountsApi.fetchDiscounts(params),
    placeholderData: keepPreviousData,
  });
}

export function useDiscount(id: string | undefined) {
  return useQuery({
    queryKey: discountsKeys.detail(id ?? ""),
    queryFn: () => discountsApi.fetchDiscount(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDiscountRequest) => discountsApi.createDiscount(body),
    onSuccess: (discount: Discount) => {
      queryClient.setQueryData(discountsKeys.detail(discount.id), discount);
      void queryClient.invalidateQueries({ queryKey: discountsKeys.lists() });
    },
  });
}

export function useUpdateDiscount(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateDiscountRequest) => discountsApi.updateDiscount(id, body),
    onSuccess: (discount: Discount) => {
      queryClient.setQueryData(discountsKeys.detail(id), discount);
      void queryClient.invalidateQueries({ queryKey: discountsKeys.lists() });
    },
  });
}

export function useDeleteDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => discountsApi.deleteDiscount(id),
    onSuccess: (_void, id) => {
      void queryClient.invalidateQueries({ queryKey: discountsKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: discountsKeys.lists() });
    },
  });
}
