import { createHash } from "crypto";

export function hashAnonymousId(anonymousId: string): string {
    return createHash("sha256").update(anonymousId).digest("hex");
}
