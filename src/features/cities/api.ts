import { api } from "../../api/client";
import { unwrap, unwrapPage, unwrapVoid } from "../../api/envelope";
import type { components } from "../../api/schema.gen";
import type { AdminUser } from "../users/api";

export type AdminCity = components["schemas"]["AdminCity"];
export type City = components["schemas"]["City"];
export type AdminCityListItem = components["schemas"]["AdminCityListItem"];
export type CityManager = components["schemas"]["CityManager"];
export type CreateCityRequest = components["schemas"]["CreateCityRequest"];
export type UpdateCityRequest = components["schemas"]["UpdateCityRequest"];

export interface ListCitiesParams {
  limit: number;
  offset: number;
}

export function fetchCities({ limit, offset }: ListCitiesParams) {
  return unwrapPage<AdminCityListItem>(api.GET("/admin/cities", { params: { query: { limit, offset } } }));
}

export function fetchCity(id: string) {
  return unwrap<AdminCity>(api.GET("/admin/cities/{id}", { params: { path: { id } } }));
}

export function createCity(body: CreateCityRequest) {
  return unwrap<AdminCity>(api.POST("/admin/cities", { body }));
}

export function updateCity(id: string, body: UpdateCityRequest) {
  return unwrap<AdminCity>(api.PATCH("/admin/cities/{id}", { params: { path: { id } }, body }));
}

export function deleteCity(id: string) {
  return unwrapVoid(api.DELETE("/admin/cities/{id}", { params: { path: { id } } }));
}

export function addCityManager(id: string, userId: string) {
  return unwrap<AdminCity>(
    api.POST("/admin/cities/{id}/managers", { params: { path: { id } }, body: { user_id: userId } }),
  );
}

export function removeCityManager(id: string, userId: string) {
  return unwrapVoid(
    api.DELETE("/admin/cities/{id}/managers/{userId}", { params: { path: { id, userId } } }),
  );
}

export interface SearchManagersParams {
  q: string;
  limit: number;
  offset: number;
}

export function searchManagerCandidates({ q, limit, offset }: SearchManagersParams) {
  return unwrapPage<AdminUser>(
    api.GET("/admin/users/search", {
      params: { query: { role: "manager", q: q || undefined, limit, offset } },
    }),
  );
}

/**
 * The public, non-paginated-in-practice city list. Used by the places feature's city
 * picker, which managers also reach — they are not allowed on /admin/cities. 100 is the
 * endpoint's max limit; a longer catalog would need a typeahead instead.
 */
export function fetchPublicCities() {
  return unwrapPage<City>(api.GET("/cities", { params: { query: { limit: 100, offset: 0 } } }));
}
