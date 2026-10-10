import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const user = req.user as { id?: string } | undefined;
    if (user?.id) {
      return `user:${user.id}`;
    }
    return `ip:${(req.ip as string | undefined) ?? "unknown"}`;
  }
}
