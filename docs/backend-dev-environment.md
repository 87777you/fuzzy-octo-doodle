# backend のローカル開発環境

DB（PostgreSQL）と API をコンテナで起動し、ソースを変更すると自動で反映される環境。

## 必要なもの

1. **Docker Engine と Docker Compose プラグイン**（backend の開発に必須）。
   - インストール手順: <https://docs.docker.com/engine/install/>
   - Compose プラグインの手順: <https://docs.docker.com/compose/install/linux/>
   - 確認: `docker compose version` が表示され、`docker run --rm hello-world` が成功する。
   - Linux では、`sudo` なしで使うために、ユーザーを `docker` グループに入れる（<https://docs.docker.com/engine/install/linux-postinstall/>）。
2. [mise](https://mise.jdx.dev/)（任意）。入れない場合は、下の `docker compose` コマンドを直接使う。

## 使い方

| やりたいこと | mise | docker compose |
| --- | --- | --- |
| 起動して変更を監視する | `mise run dev:up` | `docker compose up --build --watch` |
| 止める（データは残る） | `mise run dev:down` | `docker compose down` |
| 止めて DB のデータも消す | `mise run dev:reset` | `docker compose down -v` |
| 新しい SQL を適用する | `mise run dev:migrate` | `docker compose run --rm migrate` |

起動すると、次の順に動く。

1. `db` — PostgreSQL 17 が起動する（`127.0.0.1:5432`、ユーザー・パスワード・DB 名はすべて `app`）。
2. `migrate` — `backend/migrations/*.sql` を番号順に適用して終了する。適用済みは `schema_migrations` テーブルに記録するため、何度実行しても同じ結果になる。
3. `api` — `tsx watch` で API が起動する（`127.0.0.1:8080`）。

動作確認:

```bash
curl -i http://127.0.0.1:8080/healthz      # 200 が返る
```

## 変更が反映される仕組み

`compose.yaml` の `develop.watch` が、変更を監視する。

| 変更したファイル | 起きること |
| --- | --- |
| `backend/src/**` | コンテナ内の同じ場所にコピーされる。コンテナ内の `tsx watch` が API を再起動する（数秒）。 |
| `backend/package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml` | 開発用イメージを作り直し、コンテナを入れ替える（依存関係のインストールを含むため数十秒〜数分）。 |

- `up --watch` を実行している端末を開いたままにする。閉じると監視が止まる。
- 開発用のイメージは `backend/Dockerfile.dev`。本番用の `backend/Dockerfile` とは別で、ビルドせずに TypeScript を直接実行する。
- 監視の対象外のファイル（`tsconfig.json`、`backend/migrations` など）を変えたときは、`docker compose up --build --watch` をやり直す。SQL を足しただけなら `mise run dev:migrate` でよい。

## 開発用の認証

認証方式が決まるまで、compose の API は環境変数 `DEV_AUTH_USER_ID` を設定して起動する。

- 認証が必要なエンドポイントは、Cookie なしで呼べる。常にその固定の利用者（ID `11111111-1111-4111-8111-111111111111`、ニックネーム「開発ユーザー」）として扱われる。
- `@Public()` のエンドポイントは、これまでどおり認証なしで呼べる。
- 状態を変えるリクエスト(POST など)でも、`Origin` ヘッダは要らない。
- 利用者は、`migrate` サービスが `backend/dev/seed.sql` で作る(何度実行しても同じ結果になる)。
- 設定しなければ、本物の認証ガードが動く。`NODE_ENV=production` で設定すると、起動に失敗する。
- 実装は `composition/auth.module.ts` と `presentation/http/auth/dev-auth.guard.ts`。認証の実装(`SessionAuthGuard`)には触れない。

```bash
curl -i http://127.0.0.1:8080/api/me      # 開発用の利用者として処理される
```

## DB を直接見る

```bash
docker compose exec db psql -U app -d app
```

## 困ったとき

- `docker: 'compose' is not a docker command` — Compose プラグインが入っていない。上の手順 1 を見る。
- `permission denied ... docker.sock` — ユーザーが `docker` グループに入っていない。上の手順 1 を見る。
- ポート 5432 や 8080 が使用中 — 他のプロセスを止める。`compose.yaml` の `ports` の左側の数字を変えてもよい（コミットしない）。
- マイグレーションが失敗した — エラーの SQL を直したあと、`mise run dev:reset` で DB を作り直す。
