import { randomBytes, randomUUID } from "node:crypto";
import type { Clock } from "../../application/ports/clock.port.ts";
import type { IdGenerator } from "../../application/ports/id-generator.port.ts";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class RandomIdGenerator implements IdGenerator {
  uuid(): string {
    return randomUUID();
  }

  /** 256 ビットの乱数を URL に使える形式（base64url）にしたもの */
  inviteToken(): string {
    return randomBytes(32).toString("base64url");
  }
}
