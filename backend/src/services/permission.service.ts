import { AuthRepository } from "../repositories/auth.repository";

import type { PermissionKey } from "../config/permissions";

const PERMISSIONS_KV_PREFIX = "perms:role:";
const PERMISSIONS_KV_TTL_SECONDS = 120; // 2 minutes

export class PermissionService {
  /**
   * Get permissions for a role using KV short-lived cache, falling back to DB.
   * If DB returns an empty list, do NOT cache so defaults can still apply.
   */
  static async getRolePermissions(
    db: D1Database,
    kv: KVNamespace,
    roleName: string,
  ): Promise<PermissionKey[]> {
    const kvKey = `${PERMISSIONS_KV_PREFIX}${roleName}`;

    try {
      // Read from KV (stored as JSON string)
      const cached = await kv.get(kvKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as PermissionKey[];
          if (Array.isArray(parsed)) {
            return parsed as PermissionKey[];
          }
        } catch {
          // fall through to DB
        }
      }
    } catch {
      // Ignore KV errors and fall back to DB
    }

    // Fetch from DB
    const dbPerms = await AuthRepository.getPermissionsForRole(db, roleName);
    if (dbPerms.length > 0) {
      // Cache only non-empty results to avoid suppressing defaults
      try {
        await kv.put(kvKey, JSON.stringify(dbPerms), {
          expirationTtl: PERMISSIONS_KV_TTL_SECONDS,
        } as any);
      } catch {
        // Ignore KV write errors
      }
      return dbPerms;
    }

    return [];
  }
}
