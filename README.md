# fuzzy-octo-doodle

Next.js(React)のフロントエンドと、コンテナで動く TypeScript バックエンドの pnpm workspace モノレポ。

```text
frontend/         Next.js + React（静的ビルド → frontend/dist）
backend/          TypeScript HTTP サーバー + Dockerfile
docs/             実行契約、ツールの使い方
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

## ドキュメント

- [docs/tooling.md](docs/tooling.md) — mise でツールを追加する手順と、pnpm の基本的な使い方
- [docs/contracts.md](docs/contracts.md) — アプリケーションとインフラ・CI/CD の契約
