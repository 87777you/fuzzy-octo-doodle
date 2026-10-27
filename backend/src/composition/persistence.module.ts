import { Inject, Module } from "@nestjs/common";
import type { OnApplicationShutdown } from "@nestjs/common";
import type { Kysely } from "kysely";
import { CLOCK } from "../application/ports/clock.port.ts";
import { EVIDENCE_REPOSITORY, UPLOAD_SESSION_REPOSITORY } from "../application/ports/evidence.repository.ts";
import { POST_REPOSITORY, REACTION_REPOSITORY } from "../application/ports/feed.repository.ts";
import { FRIEND_INVITE_REPOSITORY, FRIENDSHIP_REPOSITORY } from "../application/ports/friendship.repository.ts";
import { ID_GENERATOR } from "../application/ports/id-generator.port.ts";
import { IDEMPOTENCY_REPOSITORY } from "../application/ports/idempotency.repository.ts";
import { NOTIFICATION_REPOSITORY } from "../application/ports/notification.repository.ts";
import { OBJECTION_REPOSITORY } from "../application/ports/objection.repository.ts";
import { TASK_REPOSITORY } from "../application/ports/task.repository.ts";
import { UNIT_OF_WORK } from "../application/ports/unit-of-work.port.ts";
import { USER_REPOSITORY } from "../application/ports/user.repository.ts";
import { createDatabase } from "../infrastructure/db/create-database.ts";
import { createPostgresDialect, loadPostgresConfig } from "../infrastructure/db/postgres.ts";
import type { PostgresHandle } from "../infrastructure/db/postgres.ts";
import { KyselyEvidenceRepository, KyselyUploadSessionRepository } from "../infrastructure/db/repositories/evidence.repository.ts";
import { KyselyPostRepository, KyselyReactionRepository } from "../infrastructure/db/repositories/feed.repository.ts";
import { KyselyFriendInviteRepository, KyselyFriendshipRepository } from "../infrastructure/db/repositories/friendship.repository.ts";
import { KyselyIdempotencyRepository } from "../infrastructure/db/repositories/idempotency.repository.ts";
import { KyselyNotificationRepository } from "../infrastructure/db/repositories/notification.repository.ts";
import { KyselyObjectionRepository } from "../infrastructure/db/repositories/objection.repository.ts";
import { KyselyTaskRepository } from "../infrastructure/db/repositories/task.repository.ts";
import { KyselyUserRepository } from "../infrastructure/db/repositories/user.repository.ts";
import type { Database } from "../infrastructure/db/schema.ts";
import { KyselyUnitOfWork } from "../infrastructure/db/unit-of-work.ts";
import { RandomIdGenerator, SystemClock } from "../infrastructure/system/system.ts";

const POSTGRES_HANDLE = Symbol("PostgresHandle");
const DATABASE = Symbol("Database");

/** DB 接続と、DB・システムに依存する port の束縛。他の port（Storage、決済）はそれぞれの担当が追加する */
@Module({
  providers: [
    { provide: POSTGRES_HANDLE, useFactory: (): PostgresHandle => createPostgresDialect(loadPostgresConfig(process.env)) },
    { provide: DATABASE, useFactory: (handle: PostgresHandle) => createDatabase(handle.dialect), inject: [POSTGRES_HANDLE] },
    { provide: UNIT_OF_WORK, useFactory: (db: Kysely<Database>) => new KyselyUnitOfWork(db), inject: [DATABASE] },
    { provide: USER_REPOSITORY, useClass: KyselyUserRepository },
    { provide: FRIENDSHIP_REPOSITORY, useClass: KyselyFriendshipRepository },
    { provide: FRIEND_INVITE_REPOSITORY, useClass: KyselyFriendInviteRepository },
    { provide: TASK_REPOSITORY, useClass: KyselyTaskRepository },
    { provide: EVIDENCE_REPOSITORY, useClass: KyselyEvidenceRepository },
    { provide: UPLOAD_SESSION_REPOSITORY, useClass: KyselyUploadSessionRepository },
    { provide: OBJECTION_REPOSITORY, useClass: KyselyObjectionRepository },
    { provide: POST_REPOSITORY, useClass: KyselyPostRepository },
    { provide: REACTION_REPOSITORY, useClass: KyselyReactionRepository },
    { provide: NOTIFICATION_REPOSITORY, useClass: KyselyNotificationRepository },
    { provide: IDEMPOTENCY_REPOSITORY, useClass: KyselyIdempotencyRepository },
    { provide: CLOCK, useClass: SystemClock },
    { provide: ID_GENERATOR, useClass: RandomIdGenerator },
  ],
  exports: [
    UNIT_OF_WORK,
    USER_REPOSITORY,
    FRIENDSHIP_REPOSITORY,
    FRIEND_INVITE_REPOSITORY,
    TASK_REPOSITORY,
    EVIDENCE_REPOSITORY,
    UPLOAD_SESSION_REPOSITORY,
    OBJECTION_REPOSITORY,
    POST_REPOSITORY,
    REACTION_REPOSITORY,
    NOTIFICATION_REPOSITORY,
    IDEMPOTENCY_REPOSITORY,
    CLOCK,
    ID_GENERATOR,
  ],
})
export class PersistenceModule implements OnApplicationShutdown {
  private readonly handle: PostgresHandle;

  constructor(@Inject(POSTGRES_HANDLE) handle: PostgresHandle) {
    this.handle = handle;
  }

  async onApplicationShutdown(): Promise<void> {
    await this.handle.close();
  }
}
