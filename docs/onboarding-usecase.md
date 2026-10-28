# ユースケースを実装する人のためのオンボーディング

Issue に割り当てられたユースケース(と、その HTTP コントローラ)を実装するために、最初に読む資料。読む時間は 15 分ほど。

## 1. 用語

| 用語 | 意味 |
| --- | --- |
| ユースケース | 「タスクを作る」「通知を既読にする」のような、1 つの操作の手順。`application/usecases/` に 1 操作 1 ファイルある。 |
| コントローラ | HTTP のリクエストを受け、入力を検証して、ユースケースを呼ぶだけの層。`presentation/http/`。業務のルールは書かない。 |
| domain | 業務のルールそのもの(状態の遷移、権限の判定、値の検証)。フレームワークも DB も知らない。`domain/`。 |
| port | 「DB に保存する」「現在時刻を得る」などを、interface として表したもの。ユースケースは port だけを知り、実装(Kysely など)は知らない。`application/ports/`。 |
| `UnitOfWork` | トランザクションの境界。`run` の中で行ったことは、全部成功するか、全部なかったことになるかのどちらか。 |
| `Tx` | `run` が渡す、トランザクションの印。DB に触れる port のメソッドは、必ず `tx` を最初の引数に取る。 |
| 名目型(`UserId` など) | 中身は `string` だが、「検証済みの UserId」として区別される型。ただの `string` を渡すと型エラーになる。 |
| `parse*` | 文字列などを、検証して名目型にする関数。`parseUserId(raw)`。形式が違えば `DomainError("VALIDATION_ERROR")`。 |
| `DomainError` | 業務上の失敗(見つからない、権限がない、など)。`code` を持つ。HTTP のステータスへの変換は例外フィルタが行う。 |
| 冪等性 | 同じ `Idempotency-Key` の再送で、同じ結果になること。対象の操作だけ。`hashRequest` を使う。 |
| `todo("名前")` | 「ここを実装する」という印。実行すると未実装エラーになる。あなたの仕事は、これを 0 件にすること。 |

## 2. 1 つのリクエストが通る道筋

`GET /api/me` を例に、ファイルを順に開いて読む。

1. `presentation/http/me/me.controller.ts` の `show` — `@CurrentUser()` で認証済みの `UserId` を受け取り、ユースケースを呼ぶ。
2. `application/usecases/me/get-me.usecase.ts` の `execute` — `UnitOfWork.run` の中で `UserRepository.findById(tx, userId)` を呼び、なければ `DomainError("NOT_FOUND")`。
3. `application/ports/user.repository.ts` — ユースケースが使う port(interface)。
4. `infrastructure/db/repositories/` — port の実装(Kysely)。**既にあるので、書かない**。
5. `presentation/http/errors/all-exceptions.filter.ts` — `DomainError` や `ZodError` を HTTP のステータスに変える。

```text
HTTP → ガード(Origin、認証) → コントローラ(検証) → ユースケース(手順) → domain(ルール) / port(保存)
```

全体の図は [backend-architecture.md](backend-architecture.md) の「リクエストが処理される流れ」を読む。

## 3. 実装の進め方

1. Issue の「変更するファイル」を開く。先頭の JSDoc に、責務、全体の流れ、「処理」の手順、失敗の一覧が書いてある。
2. `grep -n "todo(" <ファイル>` で、実装する場所を探す。
3. 「処理」の番号の順に、そのまま実装する。コメントにある関数の名前(`parse*`、`authorize*`、`expect*` など)は、そのまま使う。使い方は [backend-architecture.md](backend-architecture.md) の「実装に影響する関数の使い方」にある。
4. コントローラでは、入力を Zod で検証し、`parse*Id` などで名目型にしてから、ユースケースの `execute` に渡す。
5. 実装が終わったら、`todo(` が消えたことを確認する。
6. 検証する(次の「4. 動作確認」)。
7. PR を出す。手順は [contributing-workflow.md](contributing-workflow.md)(最初は Draft で作る)。説明に、動作確認の手順と結果を書く。

コントローラの検証の例:

```ts
import { z } from "zod";

const Body = z.object({ nickname: z.string() });

// ハンドラの中で
const body = Body.parse(rawBody); // 形が違えば ZodError になり、自動で 400 になる
```

## 4. 動作確認

環境の準備は [backend-dev-environment.md](backend-dev-environment.md) を読む(Docker Engine が必要)。

```bash
docker compose up --build --watch          # DB と API を起動。backend/src の変更は自動で反映される
curl -i http://127.0.0.1:8080/api/me       # 開発用の認証で、固定の利用者として呼べる
```

PR の前に、リポジトリのルートで次の 4 つを実行して、すべて成功させる。

```bash
pnpm exec eslint .
pnpm -r typecheck
pnpm -r test
pnpm -r build
```

テストは、`backend/src/*.test.ts` に書く。`get-me.test.ts` が見本になる(偽の port を渡して、ユースケースだけを試す)。

## 5. よくある型エラーと対処

| エラーの内容 | 原因と対処 |
| --- | --- |
| `Argument of type 'string' is not assignable to parameter of type 'UserId'` | 名目型に `string` を渡している。`parseUserId(raw)` を通す。 |
| `Type 'undefined' is not assignable to ...`(`exactOptionalPropertyTypes`) | 任意の項目に `undefined` を明示的に代入している。項目ごと省くか、型を `T \| null` にしているなら `null` を渡す。 |
| `Do not use any type assertions` | `as` は backend では禁止。型を合わせるのは `parse*` などの関数で行う。どうしても必要なときは、Issue または Discord で相談する。 |
| `Property 'x' does not exist on type 'never'` | `switch` や `if` で、すべての状態を処理した後の `never`。`expect*` で状態を絞ってから使う。 |
| `Promise returned in function argument where a void return was expected` | `await` の付け忘れ。`async` の関数の中で、Promise を返す呼び出しには `await` を付ける。 |
| `Unsafe member access` / `no-unsafe-*`(eslint) | `unknown` や `any` をそのまま使っている。Zod で検証して型を付ける。 |

## 6. 困ったとき

- 仕様が分からない、コメントと実装が食い違う: 推測で進めず、Issue のコメントまたは Discord で質問する。
- 範囲を超える変更が必要になった(port の追加など): 先に Issue または Discord で相談する。必要なら別の Issue にする。
- `todo()` を残したまま PR を出さない。残る部分があるなら、その理由を PR に書く。
