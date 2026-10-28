import assert from "node:assert/strict";
import { test } from "node:test";
import type { UnitOfWork, Tx } from "./application/ports/unit-of-work.port.ts";
import type { UserRepository } from "./application/ports/user.repository.ts";
import { GetMeUseCase } from "./application/usecases/me/get-me.usecase.ts";
import { DomainError } from "./domain/shared/errors.ts";
import { parseUserId } from "./domain/shared/id-parsers.ts";
import { registerUser } from "./domain/user/user.ts";
import type { User } from "./domain/user/user.ts";

const userId = parseUserId("11111111-1111-4111-8111-111111111111");

// Tx は実装（infrastructure）だけが作れる不透明な型で、テストでは中身を使わない。型を満たす値を作るためだけに断言する。
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const tx = {} as Tx;
const uow: UnitOfWork = { run: (fn) => fn(tx) };

/** `findById` だけが意味を持つ UserRepository。他のメソッドは、このテストでは呼ばれない */
class FakeUsers implements UserRepository {
  private readonly user: User | null;
  constructor(user: User | null) {
    this.user = user;
  }
  findById(): Promise<User | null> {
    return Promise.resolve(this.user);
  }
  findByIds(): Promise<User[]> {
    return Promise.reject(new Error("使わない"));
  }
  save(): Promise<void> {
    return Promise.reject(new Error("使わない"));
  }
  getStats(): never {
    throw new Error("使わない");
  }
}

test("GetMe は、保存されている本人のプロフィールを返す", async () => {
  const user = registerUser(userId, "開発ユーザー", new Date("2026-10-28T00:00:00Z"));
  const result = await new GetMeUseCase(uow, new FakeUsers(user)).execute({ userId });
  assert.deepEqual(result, user);
});

test("GetMe は、利用者の行がなければ NOT_FOUND で失敗する", async () => {
  await assert.rejects(new GetMeUseCase(uow, new FakeUsers(null)).execute({ userId }), (error: unknown) => {
    assert.ok(error instanceof DomainError);
    assert.equal(error.code, "NOT_FOUND");
    return true;
  });
});
