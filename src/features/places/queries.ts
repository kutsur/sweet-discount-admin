import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as placesApi from "./api";
import type { CreatePlaceRequest, ListPlacesParams, ManagedPlace, UpdatePlaceRequest } from "./api";
import { placesKeys } from "./queryKeys";

export function usePlacesList(params: ListPlacesParams) {
  return useQuery({
    queryKey: placesKeys.list(params),
    queryFn: () => placesApi.fetchPlaces(params),
    placeholderData: keepPreviousData,
  });
}

export function usePlace(id: string | undefined) {
  return useQuery({
    queryKey: placesKeys.detail(id ?? ""),
    queryFn: () => placesApi.fetchPlace(id as string),
    enabled: Boolean(id),
  });
}

/** The catalog is seeded and read-only server-side, so it never needs refetching mid-session. */
export function usePlaceCategories() {
  return useQuery({
    queryKey: placesKeys.categories(),
    queryFn: () => placesApi.fetchPlaceCategories(),
    staleTime: Infinity,
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePlaceRequest) => placesApi.createPlace(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: placesKeys.lists() });
    },
  });
}

export function useUpdatePlace(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePlaceRequest) => placesApi.updatePlace(id, body),
    onSuccess: (place) => {
      queryClient.setQueryData(placesKeys.detail(id), place);
      void queryClient.invalidateQueries({ queryKey: placesKeys.lists() });
    },
  });
}

export function useDeletePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => placesApi.deletePlace(id),
    onSuccess: (_void, id) => {
      void queryClient.invalidateQueries({ queryKey: placesKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: placesKeys.lists() });
    },
  });
}

/** Approve and reject are idempotent and unconditional server-side — any status may transition. */
export function useApprovePlace(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => placesApi.approvePlace(id),
    onSuccess: (place: ManagedPlace) => {
      queryClient.setQueryData(placesKeys.detail(id), place);
      void queryClient.invalidateQueries({ queryKey: placesKeys.lists() });
    },
  });
}

export function useRejectPlace(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => placesApi.rejectPlace(id, reason),
    onSuccess: (place: ManagedPlace) => {
      queryClient.setQueryData(placesKeys.detail(id), place);
      void queryClient.invalidateQueries({ queryKey: placesKeys.lists() });
    },
  });
}
