import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "./api";
import type { ListUsersParams, Role } from "./api";
import { usersKeys } from "./queryKeys";

export function useUsersList(params: ListUsersParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.fetchUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: usersKeys.detail(id ?? ""),
    queryFn: () => usersApi.fetchUser(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidateUser(id: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
    void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
  };
}

export function useActivateUser(id: string) {
  const invalidate = useInvalidateUser(id);
  return useMutation({
    mutationFn: () => usersApi.activateUser(id),
    onSuccess: invalidate,
  });
}

export function useChangeUserRole(id: string) {
  const invalidate = useInvalidateUser(id);
  return useMutation({
    mutationFn: (role: Role) => usersApi.changeUserRole(id, role),
    onSuccess: invalidate,
  });
}

export function useTriggerPasswordReset(id: string) {
  const invalidate = useInvalidateUser(id);
  return useMutation({
    mutationFn: () => usersApi.triggerPasswordReset(id),
    onSuccess: invalidate,
  });
}

export function useBlockUser(id: string) {
  const invalidate = useInvalidateUser(id);
  return useMutation({
    mutationFn: () => usersApi.blockUser(id),
    onSuccess: invalidate,
  });
}

export function useUnblockUser(id: string) {
  const invalidate = useInvalidateUser(id);
  return useMutation({
    mutationFn: () => usersApi.unblockUser(id),
    onSuccess: invalidate,
  });
}

export function useDeleteUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => usersApi.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}
