# バックエンドのアーキテクチャ

`backend/` はオニオンアーキテクチャで構成する。依存は外側から内側への一方向のみで、内側の層は外側を import しない。

```text
presentation (HTTP, 将来 NestJS Controller)  ─┐
infrastructure (DB, Storage, 決済の実装)       ├─→ application ─→ domain
                                             ─┘
```

| 層 | 場所 | 責務 | 依存してよいもの |
|---|---|---|---|
| domain | `backend/src/domain/` | 集約、状態遷移、ポリシー。純粋な TypeScript | なし（標準ライブラリのみ） |
| application | `backend/src/application/` | ユースケース、および外部とのインターフェース（port） | domain |
| infrastructure | 未作成 | port の実装（DB、Storage、決済、時計） | application, domain |
| presentation | 未作成 | HTTP の入出力、認証、DTO 変換 | application |

このリポジトリでは、domain と application は特定のフレームワークに依存しない。DI は port ごとに定義した `Symbol` のトークンで行う（例: `TASK_REPOSITORY`）。NestJS では `{ provide: TASK_REPOSITORY, useClass: ... }` で束縛できる。

## このPRで定義したもの

### domain

| ファイル | 内容 |
|---|---|
| `domain/task/task.ts` | タスク集約。全ての状態遷移を持つ |
| `domain/task/task-policy.ts` | 期限範囲（10分〜72時間）、金額（100〜10,000円）、同時3件、24時間審査、5分猶予などの定数と検証 |
| `domain/task/visibility-policy.ts` | 誰が金額・証拠写真・異議理由を見られるか |
| `domain/task/task-events.ts` | 集約が発行するドメインイベント（投稿・通知・請求への変換は application の責務） |
| `domain/evidence/upload-session.ts` | アップロードセッション。期限内の開始と、期限+5分以内の完了を検証 |
| `domain/objection/objection.ts` | 異議と取り下げ |
| `domain/friendship/friendship.ts` | フレンド関係（申請・承認・拒否・取消・解除・ブロック） |
| `domain/user/user.ts` | ユーザーと達成率の算出 |
| `domain/feed/post.ts`, `domain/notification/notification.ts` | 投稿・通知の型 |

### application/ports

リポジトリ（`task`, `user`, `friendship`, `evidence`, `objection`, `feed`, `notification`, `idempotency`）と、`Clock`、`IdGenerator`、`UnitOfWork`、`ObjectStorage`、`PaymentGateway`。
DB 製品は未選定のため、port は SQL や ORM の型を含まない。トランザクションは不透明な `Tx` ハンドルで受け渡す。

## タスクの状態遷移

遷移はすべて `Task` のメソッドで行い、呼び出し側は状態を直接書き換えない。

| 契機 | メソッド | 前提 | 結果 |
|---|---|---|---|
| 初回証拠の提出確定 | `submitInitialEvidence(friendCount, now)` | `active` | フレンド0人: `success` / 1人以上: `reviewing`（round 1、24時間審査） |
| 異議の受理 | `acceptObjection(now)` | `reviewing`、審査期限内 | round 1: `disputed`（追加証拠期限 +24時間） / round 2: `indeterminate` |
| 追加証拠の提出確定 | `submitAdditionalEvidence(now)` | `disputed` | `reviewing`（round 2、24時間再審査） |
| 異議の取り下げ | `applyObjectionWithdrawal(round, now)` | `disputed`、初回異議、期限内 | `success` |
| 初回期限切れ（ジョブ） | `expireInitial(now, hasLiveUploadSession)` | `active`、期限超過、有効なアップロードセッションなし | `failed`（請求対象） |
| 審査期間終了（ジョブ） | `closeReviewPeriod(now)` | `reviewing`、審査期限到達 | `success` |
| 追加証拠期限切れ（ジョブ） | `expireAdditional(now, hasLiveUploadSession)` | `disputed`、期限超過 | `indeterminate`（請求なし） |

ジョブ用のメソッドは、条件を満たさなければ何もせず `false` を返す。多重実行しても結果は変わらない。

## 実装者が守る規約

1. タスクの状態を変更するユースケースは、必ず `TaskRepository.findByIdForUpdate` で行ロックを取ってから `Task` のメソッドを呼ぶ。取り下げと追加証拠の同時発生、異議と審査終了の競合は、先に確定した処理が勝つ。
2. 異議の「全フレンド合計で先着1件」は `ObjectionRepository.tryInsert` の戻り値で判定する。`(task_id, review_round)` の UNIQUE 制約に任せ、事前の SELECT で判定しない。取り下げ済みでも枠は戻らない。
3. タスク作成は `lockUserForCreation` で同一ユーザーを直列化してから `countActiveInitial` を確認する。そうしないと、並列リクエストで3件の上限を超える。
4. 時刻は `Clock` から取得する。`new Date()` は domain / application で使わない。
5. 外部への請求依頼（`PaymentGateway.requestCharge`）はトランザクションのコミット後に呼ぶ。
6. 金額が非公開のとき、フレンド向けのレスポンスには `penalty_amount` のキー自体を含めない。判定は `canSeePenaltyAmount` を使い、DTO への変換は1か所に集約する。
7. 証拠写真の署名 URL は `canSeeEvidencePhotos` を通った場合にのみ発行する。フレンドが閲覧できるのは `reviewing` と `disputed` のみ。

## 要件に対する判断

- 招待リンクは恒久的に再取得できる必要があるため、`friend_invites` にはトークンの平文を保存する（`FriendInvite.token`）。ハッシュのみの保存とは両立しない。ドキュメントの SQL は別途この方針に合わせて更新する。
- 初回期限を過ぎても、期限内に開始したアップロードは期限+5分まで完了できる。このため、期限切れ判定のジョブは有効なアップロードセッションが残っている間は `failed` にしない。
- 決済は MVP ではモックとし、`PaymentGateway` を差し替え可能にしておく。

## 未決定

- DB 製品（PostgreSQL または MariaDB）と ORM / クエリビルダー
- NestJS の導入。導入時は presentation と DI モジュールのみが追加対象
- ユースケース、DTO、エラーの HTTP 変換、認証ガード
- 通知の種別（現在の5種は暫定）
