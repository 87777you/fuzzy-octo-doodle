import { randomBytes, randomUUID } from "node:crypto";
import type { Clock } from "../../application/ports/clock.port.ts";
import type { IdGenerator } from "../../application/ports/id-generator.port.ts";

/**
 * 責務: `Clock` port の本番実装。現在時刻を返す。
 * 時刻を直接 `new Date()` で取らず Clock を経由するのは、ユースケースの時刻を 1 リクエスト内で揃えられるようにし、
 * テストで差し替えられるようにするため。
 *
 * 全体の流れ: PersistenceModule が `CLOCK` トークンに束縛し、ユースケース・ガードに注入される。
 */
export class SystemClock implements Clock {
  /** 呼び出した時点の現在時刻 */
  now(): Date {
    return new Date();
  }
}

/**
 * 責務: `IdGenerator` port の本番実装。新しい ID と招待トークンを作る。
 * 全体の流れ: PersistenceModule が `ID_GENERATOR` トークンに束縛する。ID は、ユースケースが名目型にしてから保存する。
 */
export class RandomIdGenerator implements IdGenerator {
  /** UUID v4。タスク、投稿などの ID に使う */
  uuid(): string {
    return randomUUID();
  }

  /** 256 ビットの乱数を URL に使える形式（base64url）にしたもの。招待リンクの推測を困難にする */
  inviteToken(): string {
    return randomBytes(32).toString("base64url");
  }
}
