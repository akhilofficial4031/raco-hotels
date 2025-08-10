import { PERMISSIONS, type RoutePermission } from "./types";

// Permissions required for each user route
export const USER_ROUTE_PERMISSIONS: RoutePermission[] = [
  {
    method: "GET",
    pathPattern: /^\/users$/,
    permission: PERMISSIONS.USERS_READ,
  },
  {
    method: "GET",
    pathPattern: /^\/users\/search$/,
    permission: PERMISSIONS.USERS_READ,
  },
  {
    method: "GET",
    pathPattern: /^\/users\/stats$/,
    permission: PERMISSIONS.USERS_READ,
  },
  {
    method: "GET",
    pathPattern: /^\/users\/(\d+)$/,
    permission: PERMISSIONS.USERS_READ,
  },
  {
    method: "POST",
    pathPattern: /^\/users$/,
    permission: PERMISSIONS.USERS_CREATE,
  },
  {
    method: "PUT",
    pathPattern: /^\/users\/(\d+)$/,
    permission: PERMISSIONS.USERS_UPDATE,
  },
  {
    method: "PATCH",
    pathPattern: /^\/users\/(\d+)\/status$/,
    permission: PERMISSIONS.USERS_UPDATE,
  },
  {
    method: "DELETE",
    pathPattern: /^\/users\/(\d+)$/,
    permission: PERMISSIONS.USERS_DELETE,
  },
];
