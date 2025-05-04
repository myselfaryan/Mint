import { db } from "@/db/drizzle";
import { CACHE_TTL } from "@/db/redis";
import { orgs } from "@/db/schema";
import { withDataCache } from "@/lib/cache/utils";
import { eq } from "drizzle-orm";

export function getOrgByOrgId(orgId: number) {
  return withDataCache(
    `org:${orgId}`,
    async () => {
      const org = await db.query.orgs.findFirst({
        where: eq(orgs.id, orgId),
      });
      return org;
    },
    CACHE_TTL.MEDIUM,
  );
}
