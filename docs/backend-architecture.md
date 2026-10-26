# バックエンドのアーキテクチャ

`backend/` はオニオンアーキテクチャで構成する。依存の向きは外側から内側への一方向だけで、内側の層は外側の層を import しない。

```text
presentation (HTTP。NestJS の Controller)   ─┐
infrastructure (DB、Storage、決済の実装)      ├─→ application ─→ domain
                                            ─┘
```

| 層 | 場所 | 責務 | 依存してよいもの |
|---|---|---|---|
| domain | `backend/src/domain/` | 集約、状態遷移、ポリシー。クラスを使わず、型と関数で構成する | なし（標準ライブラリのみ） |
| application | `backend/src/application/` | ユースケースと、外部とのインターフェース（port） | domain |
| infrastructure | `backend/src/infrastructure/` | port の実装（DB、Storage、決済、時計） | application、domain |
| presentation | `backend/src/presentation/` | HTTP の入出力、認証、DTO への変換、エラーの HTTP 変換 | application |

## 依存性の注入（DI）

domain と application は、特定のフレームワークを import しない。

TypeScript の `interface` はコンパイル後に消えるため、実行時に実装を差し込むには別の目印が要る。そこで port ごとに `Symbol` のトークンを定義する。

```ts
// application/ports/task.repository.ts
export const TASK_REPOSITORY = Symbol("TaskRepository");
export interface TaskRepository { /* ... */ }
```

使う側は、トークンで受け取る。

```ts
// ユースケース（NestJS の @Inject を使う場合）
constructor(@Inject(TASK_REPOSITORY) private readonly tasks: TaskRepository) {}
```

束縛は、NestJS のモジュールで行う。実装を差し替えるときに変更するのは、この1行だけである。

```ts
{ provide: TASK_REPOSITORY, useClass: KyselyTaskRepository }
```

`@Inject` は NestJS のデコレータである。「フレームワークに依存しない」のは domain と port の定義であり、ユースケースのクラスに `@Inject` を付ける場合は、そのクラスだけが NestJS に触れる。これも避けたい場合は、ユースケースを素のクラスにして、NestJS のモジュール内の factory（`useFactory`）で組み立てる。

## ファイル構成と責務

### domain

| ファイル | 責務 |
|---|---|
| `shared/brand.ts`, `shared/ids.ts` | 名目型（`Brand`）と、`TaskId` や `UserId` などの ID の型 |
| `shared/errors.ts` | `DomainError` と `ErrorCode`。HTTP ステータスへの変換は presentation の責務 |
| `shared/exhaustive.ts`, `shared/time.ts`, `shared/transition.ts` | `assertNever`、時間の定数、遷移の戻り値 `{ next, events }` |
| `task/task.ts` | タスクの状態型（共用体）と、全ての状態遷移の関数 |
| `task/task-policy.ts` | 期限（10分〜72時間）、金額（100〜10,000円）、同時3件、審査24時間、アップロード猶予5分の定数と検証 |
| `task/task-values.ts` | タイトルや金額の `parse*` 関数 |
| `task/task-status.ts` | 状態名の型 |
| `task/visibility-policy.ts`, `task/task-view.ts` | 誰が何を見られるかの判定と、権限の証明型。フレンド向けの出力型 |
| `task/task-events.ts` | 遷移が返すドメインイベント |
| `evidence/evidence.ts`, `evidence/upload-session.ts` | 証拠と、アップロードセッション |
| `objection/objection.ts` | 異議と取り下げ |
| `friendship/friendship.ts`, `friendship/friend-invite.ts` | フレンド関係（申請、承認、拒否、取消、解除、ブロック）と招待リンク |
| `user/user.ts` | ユーザーと、達成率の算出 |
| `feed/post.ts`, `notification/notification.ts` | 投稿、リアクション、通知の型 |

### application/ports

| port（トークン） | 責務 |
|---|---|
| `Clock`（`CLOCK`） | 現在時刻 |
| `IdGenerator`（`ID_GENERATOR`） | UUID と、招待リンク用の推測されにくいトークンの採番 |
| `UnitOfWork`（`UNIT_OF_WORK`） | トランザクション境界。`Tx` は中身の見えない型で、実装だけが中身を知る |
| `UserRepository` | ユーザーの取得と保存、達成実績の集計 |
| `FriendshipRepository`, `FriendInviteRepository` | フレンド関係と招待リンク |
| `TaskRepository` | タスクの保存、行ロック付き取得、一覧、期限切れジョブ用のロック取得 |
| `EvidenceRepository`, `UploadSessionRepository` | 証拠と、アップロードセッション |
| `ObjectionRepository` | 異議。先着1件の判定を含む |
| `PostRepository`, `ReactionRepository` | タイムラインの投稿とリアクション |
| `NotificationRepository` | アプリ内通知 |
| `IdempotencyRepository` | `Idempotency-Key` の予約と、レスポンスの保存 |
| `ObjectStorage` | 証拠写真の署名付き URL の発行と、存在確認 |
| `PaymentGateway` | 支払い状態の確認と、請求依頼。MVP ではモック |

### infrastructure（実装先）

| 場所 | 責務 |
|---|---|
| `infrastructure/db/schema.ts` | テーブルの型（Kysely） |
| `infrastructure/db/mappers/` | DB の行と domain 型の相互変換。不正な行は例外にする |
| `infrastructure/db/repositories/` | 各 `*Repository` の実装 |
| `infrastructure/db/unit-of-work.ts` | `UnitOfWork` の実装 |
| `infrastructure/db/errors.ts` | 一意制約違反の判定と、重複を許容する INSERT |
| `infrastructure/db/cloud-sql.ts` | Cloud SQL への IAM 認証接続 |
| `infrastructure/storage/` | `ObjectStorage` の実装 |
| `infrastructure/payment/` | `PaymentGateway` のモック実装 |
| `infrastructure/system/` | `Clock` と `IdGenerator` の実装 |
| `backend/migrations/` | スキーマの SQL |

### application のユースケース（実装先）

`application/usecases/<領域>/<操作>.ts` に、1ファイル1ユースケースで置く。ユースケースは、次の流れで書く。

1. 入力を検証する。値は `parse*` を通して名目型にする。
2. `UnitOfWork.run` の中で、port と domain の関数を呼ぶ。
3. 遷移関数が返したイベントを、投稿と通知に変換して保存する。
4. コミット後に、外部への依頼（請求）を行う。

## 型による保証

テストコードは書かず、不正な状態や操作をコンパイルできない形にして担保する。`pnpm typecheck` が通ることが検証になる。

| 保証すること | 方法 |
|---|---|
| 不正な状態遷移（達成済みに証拠提出、審査中に追加証拠など） | `Task` を `status` で判別する共用体にし、遷移関数の引数を遷移元の状態に限定する |
| 状態ごとに必要な値（審査期限、追加証拠期限、達成日時） | 該当する状態の型にだけフィールドを持たせる。`reviewing` は必ず `reviewDeadlineAt` を持つ |
| 再審査（2回目）の異議は取り下げ不可 | `Objection<1, "open">` だけが取り下げ関数に渡せる |
| 非公開の金額がフレンド向け出力に載らない | `FriendTaskView` は `isPenaltyPublic: false` のとき `penaltyAmount?: never` |
| 権限のない証拠写真 URL の発行 | `ObjectStorage.createSignedReadUrl` が `authorizePhotoAccess` の結果（`PhotoAccessGrant`）を要求する |
| 権限のない異議申し立て | `createObjection` が `authorizeObjection` の結果（`ObjectionRight`）と審査中のタスクを要求する |
| 写真は1〜3枚 | `PhotoPaths` は1〜3要素のタプル型 |
| 検証前の値の混入 | タイトル、金額、ニックネームは `parse*` を通した名目型（`Brand`）だけを受け付ける |
| ID の取り違え | `TaskId` や `UserId` を名目型にする |
| フレンド関係の状態の網羅 | `switch` の `default` で `assertNever` を呼ぶ。状態を増やすとコンパイルエラーになる |

具体例は `backend/src/domain/type-guarantees.ts` にある。`@ts-expect-error` を付けた行は、コンパイルできてはいけない操作である。型が緩むと、未使用の `@ts-expect-error` として `pnpm typecheck` が失敗する。このファイルは実行されず、ビルドの出力にも含まれない。

型で表せないもの（期限などの時刻、フレンド数、行ロックの取得）は、関数内の実行時検証と、port の契約で扱う。DB から読んだ値を特定の状態に絞る `expectStatus` などは、infrastructure のマッパーとユースケースの境界で使う。

## タスクの状態遷移

遷移は `domain/task/task.ts` の純粋関数で行い、`{ next, events }`（`Transition`）を返す。元の値は変更しない。

| 契機 | 関数（引数の状態） | 結果 |
|---|---|---|
| 作成 | `createTask` | `active` |
| 初回証拠の提出確定 | `submitInitialEvidence(active, friendCount, now)` | フレンド0人は `success`。1人以上は `reviewing`（1回目、24時間審査） |
| 初回審査中の異議の受理 | `acceptFirstObjection(reviewing 1回目, now)` | `disputed`（追加証拠の期限は24時間後） |
| 再審査中の異議の受理 | `acceptSecondObjection(reviewing 2回目, now)` | `indeterminate` |
| 追加証拠の提出確定 | `submitAdditionalEvidence(disputed, now)` | `reviewing`（2回目、24時間の再審査） |
| 異議の取り下げ | `withdrawFirstObjection(disputed, 初回の未取り下げ異議, now)` | `success` |
| 初回期限切れ（ジョブ） | `expireInitial(active, now, hasLiveUploadSession)` | `failed`（請求の対象） |
| 審査期間の終了（ジョブ） | `closeReviewPeriod(reviewing, now)` | `success` |
| 追加証拠の期限切れ（ジョブ） | `expireAdditional(disputed, now, hasLiveUploadSession)` | `indeterminate`（請求なし） |

ジョブ用の関数は、まだ確定しない場合に `null` を返す。多重に実行しても結果は変わらない。

## ユースケースと使う部品

API 設計書のエンドポイントごとに、使う関数と port を示す。重要な POST は、冒頭で `IdempotencyRepository.reserve` による冪等性の確認を行う（詳細は後述）。

### タスク

| 操作 | 処理の流れ |
|---|---|
| `POST /api/tasks` | `PaymentGateway.assertCanCreateTask` → `lockUserForCreation` → `countActiveInitial` → `assertCanCreateTask` → `assertDeadlineInRange` → `createTask` → `TaskRepository.insert` → 「作成」の投稿 |
| `GET /api/tasks` | `TaskRepository.listByOwner` → `toTaskView(task, "owner")` |
| `GET /api/tasks/{id}` | `findById` → `viewerRole`（本人・フレンド・その他）→ 「その他」は `NOT_FOUND`。それ以外は `toTaskView` |
| `GET /api/tasks/{id}/retry-template` | 本人のタスクを取得し、入力値だけを返す。保存はしない |

### 証拠の提出

| 操作 | 処理の流れ |
|---|---|
| `POST /api/tasks/{id}/evidence-upload-sessions` | `findById` → `startInitialUpload` または `startAdditionalUpload` → `UploadSessionRepository.insert` |
| `POST .../upload-urls` | `findByIdForUpdate` → `expectUploading` → `photoPathPrefix` に沿ったパスで `ObjectStorage.createSignedUploadUrl` |
| `POST .../complete` | 下記の手順 |
| `GET /api/tasks/{id}/evidences` | `viewerRole` → `authorizePhotoAccess`（null なら `FORBIDDEN`）→ `listByTask` → 写真ごとに `createSignedReadUrl` |

`complete` の手順は次のとおり。

1. `TaskRepository.findByIdForUpdate` と `UploadSessionRepository.findByIdForUpdate` で行ロックを取る。
2. `completeUpload`（所有者と完了期限の検証）。
3. `parsePhotoPaths`（1〜3枚）と、`ObjectStorage.exists` による存在確認。
4. `EvidenceRepository.insert`（重複は `ALREADY_EXISTS`）。
5. `countFriends` を取得し、`submitInitialEvidence` または `submitAdditionalEvidence` を呼ぶ。
6. `TaskRepository.save`、イベントから投稿と通知を保存する。

### 異議

| 操作 | 処理の流れ |
|---|---|
| `POST /api/tasks/{id}/objections` | `findByIdForUpdate` → `areFriends` → `authorizeObjection` → `createObjection` → `ObjectionRepository.tryInsert`（false なら `STATE_CONFLICT`）→ `acceptFirstObjection` または `acceptSecondObjection` → `save` → 通知 |
| `POST /api/objections/{id}/withdraw` | `ObjectionRepository.findById` → `TaskRepository.findByIdForUpdate` → `expectOpenFirst` → `withdrawObjection` → `withdrawFirstObjection` → 保存 → 通知 |
| `GET /api/me/objections` | `listByObjector`。判定が確定したタスクの写真は返さない |

### フレンド

| 操作 | 処理の流れ |
|---|---|
| `POST /api/friend-invites` | `FriendInviteRepository.findActiveByInviter`。なければ `IdGenerator.inviteToken` で作って `insert` する |
| `GET /api/friend-invites/{token}` | `findActiveByToken` → 招待者のニックネームを返す |
| `POST /api/friend-requests` | `findByPair(forUpdate)` → `requestFriendship` → `save` → 通知 |
| `.../accept`, `/reject`, `/cancel` | `findById` → `acceptFriendship`、`rejectFriendship`、`cancelFriendship` → `save` |
| `DELETE /api/friends/{userId}` | `findByPair(forUpdate)` → `removeFriendship` → `save` |
| `POST`、`DELETE /api/users/{userId}/block` | `blockFriendship` または `blockStranger`、`unblockFriendship` |
| `GET /api/friends`, `/friend-requests`, `/blocked-users` | `listFriendIds`、`listIncomingPending`、`listOutgoingPending`、`listBlockedBy` |

### タイムライン・通知・ユーザー

| 操作 | 処理の流れ |
|---|---|
| `GET /api/feed` | `PostRepository.listFeed`。`since` は `now - FEED_WINDOW_DAYS`。タスクは `TaskRepository.findByIds` で取得し、`toTaskView(task, "friend")` で金額を伏せる |
| `GET /api/posts/{id}` | `findFeedItem`（本人とフレンドの投稿だけ返る） |
| `PUT`、`DELETE /api/posts/{id}/reaction` | `ReactionRepository.upsert`、`remove`（投稿を見られる人だけ） |
| 通知 API | `NotificationRepository` の `list`、`countUnread`、`markRead`、`markAllRead` |
| `GET`、`PATCH /api/me` | `UserRepository` と `changeNickname` |
| `GET /api/me/stats` | `getStats` → `successRate` |

### 定期ジョブ

各ジョブは、1回に処理する件数を決めて、1件ごとに別のトランザクションで処理する。

| ジョブ | 処理の流れ |
|---|---|
| 初回期限切れ | `lockExpiredInitial` → `hasLiveSession` → `expireInitial` → 保存 → 「失敗」の投稿、通知 → コミット後に `PaymentGateway.requestCharge` |
| 審査期間の終了 | `lockReviewEnded` → `closeReviewPeriod` → 保存 → 通知 |
| 追加証拠の期限切れ | `lockExpiredAdditional` → `hasLiveSession` → `expireAdditional` → 保存 → 通知 |
| アップロードセッションの整理 | `UploadSessionRepository.expireStale` |

`lock*` は `FOR UPDATE SKIP LOCKED` で取得するため、ジョブを複数同時に動かしても同じ行を二重に処理しない。

## 実装時の規約

### 排他制御

1. タスクの状態を変更するユースケースは、必ず `TaskRepository.findByIdForUpdate` で行ロックを取ってから遷移関数を呼ぶ。取り下げと追加証拠の同時発生や、異議と審査終了の競合は、先に確定した処理が勝つ。
2. 異議の「全フレンド合計で先着1件」は、`ObjectionRepository.tryInsert` の戻り値で判定する。`(task_id, review_round)` の UNIQUE 制約に任せ、事前の SELECT で判定しない。取り下げ済みでも枠は戻らない。
3. タスク作成は、`lockUserForCreation` で同一ユーザーの処理を直列化してから、`countActiveInitial` を確認する。そうしないと、並列のリクエストで3件の上限を超える。
4. フレンド申請は、`findByPair` に `forUpdate` を指定して、同時申請の競合を防ぐ。

### トランザクション

5. 外部への請求依頼（`PaymentGateway.requestCharge`）は、トランザクションのコミット後に呼ぶ。トランザクションの中で外部通信をしない。
6. 一意制約に違反しても継続したい INSERT（通知、投稿の重複排除など）は、PostgreSQL では失敗した文でトランザクション全体が中断される。実装では savepoint で囲み、違反したら savepoint まで戻す。`ON CONFLICT` などの製品固有の構文は使わない。

### 冪等性

7. 重要な POST は `Idempotency-Key` を必須とする。ユースケースの冒頭で `IdempotencyRepository.reserve` を呼ぶ。
   - 戻り値が `null` なら新規の要求である。処理の最後に `complete` でレスポンスを保存する。
   - 記録があり `requestHash` が違えば、`IDEMPOTENCY_KEY_REUSED` を返す。
   - 記録があり完了済みなら、保存したレスポンスを返す。
8. 通知は `deduplicationKey` で重複を防ぐ。キーは「種別:タスク ID:審査回」のように、同じ出来事から必ず同じ文字列になる形にする。ジョブが再実行されても、通知は1件になる。

### 時刻・ID・値

9. 時刻は `Clock` から取得する。domain と application では `new Date()` を使わない。DB の日時は UTC で保存する。
10. ID は `IdGenerator.uuid` で採番する。DB の自動採番は使わない。
11. ページングはカーソル方式とし、並び順の列と ID の組で位置を表す。`limit + 1` 件を取得して、次のページの有無を判定する。
12. DB から読んだ行は、マッパーで `Task` などの共用体に変換する。状態と必須フィールドの組み合わせが不正な行は、変換時に例外とする。

### 型の使い方

13. `any` を使わない。`as` は、名目型・権限の証明・状態の絞り込みを作る関数（`parse*`、`authorize*`、`expect*`、`start*`）の内部に限る。

## エラーの扱い

domain と application は `DomainError`（`code`、`message`、`details`）を投げる。presentation の例外フィルタで、API 設計書のエラーレスポンスに変換する。

| `code` | HTTP ステータス | 発生する場面 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 入力の形式、文字数、範囲の不正 |
| `UNAUTHENTICATED` | 401 | 未認証 |
| `FORBIDDEN` | 403 | 権限がない |
| `NOT_FOUND` | 404 | 対象がない。見せてはいけない対象も、存在を隠すためにこれを返す |
| `ALREADY_EXISTS`, `STATE_CONFLICT`, `IDEMPOTENCY_KEY_REUSED` | 409 | 重複、状態の競合、冪等キーの再利用 |
| `DEADLINE_EXPIRED`, `TOO_MANY_ACTIVE_TASKS`, `PAYMENT_REQUIRED`, `INVALID_EVIDENCE_COUNT` | 422 | 業務ルールの違反 |
| `TEMPORARILY_UNAVAILABLE` | 503 | サービスの障害 |

予期しない例外（DB の接続エラー、不正な行の変換エラーなど）は 500 にし、詳細はログにだけ出す。

## DB

- DB は Cloud SQL for PostgreSQL（シングルインスタンス）、クエリビルダーは Kysely を使う。
- 接続は IAM 認証で行い、パスワードは持たない。Cloud Run のサービスアカウントを IAM データベースユーザーとして登録する。
- 製品に依存するのは接続の `Dialect` だけである。別の製品に変える場合は、`cloud-sql.ts` の差し替えと `migrations/` の書き直しで対応する。
- テーブルの定義は `infrastructure/db/schema.ts` を正とし、`migrations/` の SQL と対応させる。

## 要件に対する判断

- 招待リンクは恒久的に再取得できる必要があるため、`friend_invites` にはトークンの平文を保存する（`FriendInvite.token`）。ハッシュだけの保存とは両立しない。
- 初回期限を過ぎても、期限内に開始したアップロードは期限の5分後まで完了できる。このため、期限切れのジョブは、有効なアップロードセッションが残っている間は `failed` にしない。
- フレンドが証拠写真を見られるのは、`reviewing` と `disputed` の間だけである。判定の確定後は、写真の URL を発行しない。
- 決済は MVP ではモックとし、`PaymentGateway` を差し替えられるようにしておく。

## 未決定

- 認証基盤。API 設計書は Supabase Auth のアクセストークンを前提としている。採用する場合は、presentation の認証ガードでトークンを検証し、`UserId` に変換する。
- NestJS の導入。導入時に追加するのは、presentation と DI のモジュールだけである。
- DTO の定義と、リクエストの検証方式。
- 通知の種別（現在の5種は暫定）。
