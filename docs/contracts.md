# 実行契約

アプリケーション担当（frontend / backend）が守る契約と、インフラ・CI/CD 担当が提供する契約をここで固定する。
クラウドやデプロイ方式の詳細は契約の外側にあり、アプリケーション担当は意識しなくてよい。

## アプリケーション担当が触る範囲

- `frontend/` — Next.js + React。
- `backend/` — TypeScript の HTTP サーバー。

## インフラ・CI/CD 担当が所有する範囲

- `.github/`、`infra/`、`mise.toml`、`backend/Dockerfile`

これらはアプリケーションコードから参照されない。変更してもアプリケーション担当の作業には影響しない。

## frontend の契約

- `pnpm --filter @app/frontend build` が `frontend/dist/` に静的ファイルを出力する（`output: "export"`）。
- サーバー側ランタイム（Route Handlers、SSR、Server Actions など）は使わない。
- バックエンドの URL は `NEXT_PUBLIC_` 接頭辞の環境変数でビルド時に注入する。

## backend の契約

- 1 つの OCI イメージとして `backend/Dockerfile` でビルドされる（ビルドコンテキストはリポジトリルート）。
- `PORT` 環境変数で指定されたポート（既定 8080）で HTTP を待ち受ける。
- `GET /healthz` が HTTP 200 を返す。
- SIGTERM を受けたら接続を閉じて終了する。
- 状態をコンテナ内に保存しない。設定は環境変数で受け取る。
- 長期有効な固定パスワード、アクセスキー、秘密鍵を使わない。DB 認証は実行環境の Workload Identity から得た短期認証情報を使い、DB アクセス実装はアプリケーションロジックから分離する。DB 製品は未選定。

## 開発コマンド

`mise.toml` にタスクを定義している。

| コマンド | 内容 |
|---|---|
| `mise run dev` | frontend と backend を起動 |
| `mise run lint` | ESLint（`any` の禁止など） |
| `mise run typecheck` | 型検査 |
| `mise run test` | テスト |
| `mise run build` | ビルド |
| `mise run ci` | CI と同じ検証（lint、型検査、テスト、ビルド、イメージのビルド。Docker が必要） |

## CI

- Pull Request と `master` への push で `mise run ci` を実行する。クラウド認証は行わない。
