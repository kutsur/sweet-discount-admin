import type { ListCitiesParams } from "./api";

export const citiesKeys = {
  all: ["cities"] as const,
  lists: () => [...citiesKeys.all, "list"] as const,
  list: (params: ListCitiesParams) => [...citiesKeys.lists(), params] as const,
  details: () => [...citiesKeys.all, "detail"] as const,
  detail: (id: string) => [...citiesKeys.details(), id] as const,
  managerSearch: (q: string) => [...citiesKeys.all, "managerSearch", q] as const,
  publicList: () => [...citiesKeys.all, "public"] as const,
};
