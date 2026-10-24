import { api } from "../../api/client";
import { unwrap, unwrapPage, unwrapVoid } from "../../api/envelope";
import type { components } from "../../api/schema.gen";

export type ManagedPlace = components["schemas"]["ManagedPlace"];
export type ManagedPlaceListItem = components["schemas"]["ManagedPlaceListItem"];
export type PlaceCategory = components["schemas"]["PlaceCategory"];
export type PlaceStatus = components["schemas"]["PlaceStatus"];
export type OpeningHours = components["schemas"]["OpeningHours"];
export type CreatePlaceRequest = components["schemas"]["CreatePlaceRequest"];
export type UpdatePlaceRequest = components["schemas"]["UpdatePlaceRequest"];
export type AssignableUser = components["schemas"]["AssignableUser"];

export interface ListPlacesParams {
  limit: number;
  offset: number;
  cityId?: string;
  status?: PlaceStatus;
}

// /manage/places, not /admin/places: the backend opens reads to admin, manager and
// owner, scoping a manager to their cities and an owner to their places; mutations are
// admin/manager only. See the backend's router.go comment on the /v1/manage/places group.
export function fetchPlaces({ limit, offset, cityId, status }: ListPlacesParams) {
  return unwrapPage<ManagedPlaceListItem>(
    api.GET("/manage/places", {
      params: { query: { limit, offset, city_id: cityId || undefined, status: status || undefined } },
    }),
  );
}

export function fetchPlace(id: string) {
  return unwrap<ManagedPlace>(api.GET("/manage/places/{id}", { params: { path: { id } } }));
}

export function createPlace(body: CreatePlaceRequest) {
  return unwrap<ManagedPlace>(api.POST("/manage/places", { body }));
}

export function updatePlace(id: string, body: UpdatePlaceRequest) {
  return unwrap<ManagedPlace>(api.PATCH("/manage/places/{id}", { params: { path: { id } }, body }));
}

export function deletePlace(id: string) {
  return unwrapVoid(api.DELETE("/manage/places/{id}", { params: { path: { id } } }));
}

export function approvePlace(id: string) {
  return unwrap<ManagedPlace>(api.POST("/manage/places/{id}/approve", { params: { path: { id } } }));
}

export function rejectPlace(id: string, reason: string) {
  return unwrap<ManagedPlace>(
    api.POST("/manage/places/{id}/reject", { params: { path: { id } }, body: { reason } }),
  );
}

export function addPlaceOwner(id: string, userId: string) {
  return unwrap<ManagedPlace>(
    api.POST("/manage/places/{id}/owners", { params: { path: { id } }, body: { user_id: userId } }),
  );
}

export function removePlaceOwner(id: string, userId: string) {
  return unwrapVoid(api.DELETE("/manage/places/{id}/owners/{userId}", { params: { path: { id, userId } } }));
}

/** Active role=owner accounts — open to managers too, unlike /admin/users/search. */
export function searchOwnerCandidates(q: string) {
  return unwrapPage<AssignableUser>(
    api.GET("/manage/owner-candidates", { params: { query: { q: q || undefined, limit: 20, offset: 0 } } }),
  );
}

/** The category catalog is seeded and read-only — there is no create/rename endpoint. */
export function fetchPlaceCategories() {
  return unwrapPage<PlaceCategory>(api.GET("/categories", { params: { query: { limit: 100, offset: 0 } } }));
}
