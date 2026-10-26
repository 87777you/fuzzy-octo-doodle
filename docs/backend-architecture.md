# バックエンドのアーキテクチャ

`backend/` はオニオンアーキテクチャで構成する。依存は外側から内側への一方向のみで、内側の層は外側を import しない。

```text
presentation (HTTP, 将来 NestJS Controller)  ─┐
infrastructure (DB, Storage, 決済の実装)       ├─→ application ─→ domain
                                             ─┘
```

| 層 | 場所 | 責務 | 依存してよいもの |
|---|---|---|---|
| domain | `backend/src/domain/` | 集約、状態遷移、ポリシー。純粋な TypeScript（クラスを使わず、型と関数で構成） | なし（標準ライブラリのみ） |
| application | `backend/src/application/` | ユースケース、および外部とのインターフェース（port） | domain |
| infrastructure | 未作成 | port の実装（DB、Storage、決済、時計） | application, domain |
| presentation | 未作成 | HTTP の入出力、認証、DTO 変換 | application |

このリポジトリでは、domain と application は特定のフレームワークに依存しない。DI は port ごとに定義した `Symbol` のトークンで行う（例: `TASK_REPOSITORY`）。NestJS では `{ provide: TASK_REPOSITORY, useClass: ... }` で束縛できる。

## このPRで定義したもの

### domain

| ファイル | 内容 |
|---|---|
| `domain/task/task.ts` | タスクの状態型（共用体）と、全ての状態遷移の関数 |
| `domain/task/task-policy.ts` | 期限範囲（10分〜72時間）、金額（100〜10,000円）、同時3件、24時間審査、5分猶予などの定数と検証 |
| `domain/task/visibility-policy.ts`, `task-view.ts` | 誰が金額・証拠写真・異議理由を見られるか。権限の証明型とフレンド向け View |
| `domain/task/task-events.ts` | 遷移が返すドメインイベント（投稿・通知・請求への変換は application の責務） |
| `domain/evidence/upload-session.ts` | アップロードセッション。期限内の開始と、期限+5分以内の完了を検証 |
| `domain/objection/objection.ts` | 異議と取り下げ |
| `domain/friendship/friendship.ts` | フレンド関係（申請・承認・拒否・取消・解除・ブロック） |
| `domain/user/user.ts` | ユーザーと達成率の算出 |
| `domain/feed/post.ts`, `domain/notification/notification.ts` | 投稿・通知の型 |

### application/ports

リポジトリ（`task`, `user`, `friendship`, `evidence`, `objection`, `feed`, `notification`, `idempotency`）と、`Clock`、`IdGenerator`、`UnitOfWork`、`ObjectStorage`、`PaymentGateway`。
DB 製品は未選定のため、port は SQL や ORM の型を含まない。トランザクションは不透明な `Tx` ハンドルで受け渡す。

## 型による保証

テストコードは書かず、不正な状態や操作をコンパイルできない形にして担保する。`pnpm typecheck` が通ることが検証になる。

| 保証すること | 方法 |
|---|---|
| 不正な状態遷移（達成済みに証拠提出、審査中に追加証拠など） | `Task` を `status` で判別する共用体にし、遷移関数の引数を遷移元の状態に限定する |
| 状態ごとに必要な値（審査期限、追加証拠期限、達成日時） | 該当する状態の型にだけフィールドを持たせる。`reviewing` は必ず `reviewDeadlineAt` を持つ |
| 再審査（round 2）の異議は取り下げ不可 | `Objection<1, "open">` だけが取り下げ関数に渡せる |
| 非公開の金額がフレンド向け出力に載らない | `FriendTaskView` は `isPenaltyPublic: false` のとき `penaltyAmount?: never` |
| 権限なしの証拠写真URL発行 | `ObjectStorage.createSignedReadUrl` が `authorizePhotoAccess` の結果（`PhotoAccessGrant`）を要求する |
| 権限なしの異議申し立て | `createObjection` が `authorizeObjection` の結果（`ObjectionRight`）と審査中のタスクを要求する |
| 写真は1〜3枚 | `PhotoPaths` は1〜3要素のタプル型 |
| 検証前の値の混入 | タイトル、金額、ニックネームは `parse*` を通した名目型（`Brand`）のみ受け付ける |
| ID の取り違え | `TaskId` や `UserId` を名目型にする |
| フレンド関係の状態網羅 | `switch` の `default` で `assertNever`。状態を増やすとコンパイルエラー |

具体例は `backend/src/domain/type-guarantees.ts` にある。`@ts-expect-error` の行はコンパイルできてはいけない操作で、型が緩むと未使用の `@ts-expect-error` として `pnpm typecheck` が失敗する。

型で表せないもの（期限などの時刻、フレンド数、行ロックの取得）は、関数内の実行時検証と port の契約で扱う。DB から読んだ値を特定の状態に絞る `expectStatus` などは、インフラ層のマッパーとユースケースの境界で使う。

## タスクの状態遷移

遷移は `domain/task/task.ts` の純粋関数で行い、`{ next, events }`（`Transition`）を返す。元の値は変更しない。

| 契機 | 関数（引数の状態） | 結果 |
|---|---|---|
| 作成 | `createTask` | `active` |
| 初回証拠の提出確定 | `submitInitialEvidence(active, friendCount, now)` | フレンド0人: `success` / 1人以上: `reviewing`（round 1、24時間審査） |
| 初回審査中の異議受理 | `acceptFirstObjection(reviewing round 1, now)` | `disputed`（追加証拠期限 +24時間） |
| 再審査中の異議受理 | `acceptSecondObjection(reviewing round 2, now)` | `indeterminate` |
| 追加証拠の提出確定 | `submitAdditionalEvidence(disputed, now)` | `reviewing`（round 2、24時間再審査） |
| 異議の取り下げ | `withdrawFirstObjection(disputed, 初回の未取り下げ異議, now)` | `success` |
| 初回期限切れ（ジョブ） | `expireInitial(active, now, hasLiveUploadSession)` | `failed`（請求対象） |
| 審査期間終了（ジョブ） | `closeReviewPeriod(reviewing, now)` | `success` |
| 追加証拠期限切れ（ジョブ） | `expireAdditional(disputed, now, hasLiveUploadSession)` | `indeterminate`（請求なし） |

ジョブ用の関数は、まだ確定しない場合に `null` を返す。多重実行しても結果は変わらない。

## 実装者が守る規約

1. タスクの状態を変更するユースケースは、必ず `TaskRepository.findByIdForUpdate` で行ロックを取ってから遷移関数を呼ぶ。取り下げと追加証拠の同時発生、異議と審査終了の競合は、先に確定した処理が勝つ。
2. 異議の「全フレンド合計で先着1件」は `ObjectionRepository.tryInsert` の戻り値で判定する。`(task_id, review_round)` の UNIQUE 制約に任せ、事前の SELECT で判定しない。取り下げ済みでも枠は戻らない。
3. タスク作成は `lockUserForCreation` で同一ユーザーを直列化してから `countActiveInitial` を確認する。そうしないと、並列リクエストで3件の上限を超える。
4. 時刻は `Clock` から取得する。`new Date()` は domain / application で使わない。
5. 外部への請求依頼（`PaymentGateway.requestCharge`）はトランザクションのコミット後に呼ぶ。
6. DB から読んだ行は、マッパーで `Task` などの共用体に変換する。状態と必須フィールドの組み合わせが不正な行は、変換時に例外とする。
7. `any` を使わない。`as` は名目型・権限の証明・状態の絞り込みを作る関数（`parse*`、`authorize*`、`expect*`、`start*`）の内部に限る。

## 要件に対する判断

- 招待リンクは恒久的に再取得できる必要があるため、`friend_invites` にはトークンの平文を保存する（`FriendInvite.token`）。ハッシュのみの保存とは両立しない。ドキュメントの SQL は別途この方針に合わせて更新する。
- 初回期限を過ぎても、期限内に開始したアップロードは期限+5分まで完了できる。このため、期限切れ判定のジョブは有効なアップロードセッションが残っている間は `failed` にしない。
- 決済は MVP ではモックとし、`PaymentGateway` を差し替え可能にしておく。

## 未決定

- DB 製品（PostgreSQL または MariaDB）と ORM / クエリビルダー
- NestJS の導入。導入時は presentation と DI モジュールのみが追加対象
- ユースケース、DTO、エラーの HTTP 変換、認証ガード
- 通知の種別（現在の5種は暫定）
