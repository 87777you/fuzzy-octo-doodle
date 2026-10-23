# fuzzy-octo-doodle

Next.js(React)のフロントエンドと、コンテナで動く TypeScript バックエンドの pnpm workspace モノレポ。

```text
frontend/         Next.js + React（静的ビルド → frontend/dist）
backend/          TypeScript HTTP サーバー + Dockerfile
packages/shared/  frontend と backend が共有する型・定数
docs/             実行契約
scripts/          CI・ローカル検証用スクリプト
mise.toml         ツールチェーン固定とタスク定義
```

## セットアップ

[mise](https://mise.jdx.dev/) をインストールし、リポジトリのルートで実行する。Node.js と pnpm は `mise.toml` で固定されている。

```bash
mise install
mise run dev      # frontend と backend を起動
mise run ci       # CI と同じ検証（Docker が必要）
```

タスク一覧は `mise tasks` で確認できる。

## 設計

契約の詳細は [docs/contracts.md](docs/contracts.md) を参照。
