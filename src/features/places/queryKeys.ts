import type { ListPlacesParams } from "./api";

export const placesKeys = {
  all: ["places"] as const,
  lists: () => [...placesKeys.all, "list"] as const,
  list: (params: ListPlacesParams) => [...placesKeys.lists(), params] as const,
  details: () => [...placesKeys.all, "detail"] as const,
  detail: (id: string) => [...placesKeys.details(), id] as const,
  categories: () => ["placeCategories"] as const,
};
