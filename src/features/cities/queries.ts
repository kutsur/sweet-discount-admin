import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as citiesApi from "./api";
import type { AdminCity, CreateCityRequest, ListCitiesParams, UpdateCityRequest } from "./api";
import { citiesKeys } from "./queryKeys";

export function useCitiesList(params: ListCitiesParams) {
  return useQuery({
    queryKey: citiesKeys.list(params),
    queryFn: () => citiesApi.fetchCities(params),
    placeholderData: keepPreviousData,
  });
}

export function useCity(id: string | undefined) {
  return useQuery({
    queryKey: citiesKeys.detail(id ?? ""),
    queryFn: () => citiesApi.fetchCity(id as string),
    enabled: Boolean(id),
  });
}

export function useManagerSearch(q: string) {
  return useQuery({
    queryKey: citiesKeys.managerSearch(q),
    queryFn: () => citiesApi.searchManagerCandidates({ q, limit: 20, offset: 0 }),
    placeholderData: keepPreviousData,
  });
}

export function useCreateCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCityRequest) => citiesApi.createCity(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: citiesKeys.lists() });
    },
  });
}

export function useUpdateCity(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCityRequest) => citiesApi.updateCity(id, body),
    onSuccess: (city) => {
      queryClient.setQueryData(citiesKeys.detail(id), city);
      void queryClient.invalidateQueries({ queryKey: citiesKeys.lists() });
    },
  });
}

export function useDeleteCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => citiesApi.deleteCity(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: citiesKeys.lists() });
    },
  });
}

export function useAddCityManager(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => citiesApi.addCityManager(id, userId),
    onSuccess: (city) => {
      queryClient.setQueryData(citiesKeys.detail(id), city);
    },
  });
}

export function useRemoveCityManager(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => citiesApi.removeCityManager(id, userId).then(() => userId),
    onSuccess: (userId) => {
      queryClient.setQueryData<AdminCity | undefined>(citiesKeys.detail(id), (current) =>
        current ? { ...current, managers: current.managers.filter((m) => m.user_id !== userId) } : current,
      );
    },
  });
}
