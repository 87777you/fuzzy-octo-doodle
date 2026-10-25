# ツールとパッケージの管理

このリポジトリでは、2 種類の依存を別々の道具で管理する。

| 対象 | 例 | 道具 | 記録先 |
|---|---|---|---|
| 開発環境のツール本体 | Node.js、pnpm、Terraform | mise | `mise.toml` |
| プロジェクトが使うライブラリ | next、react、eslint | pnpm | `package.json` と `pnpm-lock.yaml` |

どちらも設定ファイルをコミットすることで、全員と CI が同じバージョンを使う。

## mise

mise は言語やコマンドラインツールのバージョンを固定し、タスクを実行する。

### 初回セットアップ

[mise をインストール](https://mise.jdx.dev/getting-started.html)したあと、リポジトリのルートで実行する。

```bash
mise install    # mise.toml に書かれたツールをすべて入れる
mise ls         # 現在使われているツールとバージョンを確認する
```

### ツールを追加する

1. 追加したいツールを探す。

   ```bash
   mise registry | grep <名前>      # 名前で mise に登録されているか検索する
   mise ls-remote <ツール>          # インストールできるバージョン一覧
   ```

2. リポジトリのルートで追加する。`mise.toml` の `[tools]` に追記され、インストールも行われる。

   ```bash
   mise use <ツール>@<バージョン>
   # 例: mise use terraform@1.13
   ```

3. `mise.toml` の差分を確認し、PR に含める。レビューで承認されれば、他のメンバーと CI は次回の `mise install` で同じバージョンを使う。

補足:

- バージョンは `24` のように大まかに、または `10.34.7` のように厳密に指定できる。再現性が重要なツールは厳密に指定する。
- `mise use` を `-g` 付きで実行すると、リポジトリではなく自分のマシン全体の設定に書き込まれる。チームで共有するツールには付けない。
- ツールを削除するときは `mise unuse <ツール>`、または `mise.toml` から該当の行を消す。
- レジストリにないツールは `github:owner/repo` や `npm:パッケージ名` のように取得元を指定できる。詳細は[公式ドキュメント](https://mise.jdx.dev/dev-tools/)を参照。

### タスクを追加する

繰り返し実行するコマンドは `mise.toml` の `[tasks.<名前>]` に書く。

```toml
[tasks.format]
description = "コードを整形する"
depends = ["install"]
run = "pnpm exec prettier --write ."
```

- `depends` に書いたタスクが先に完了してから実行される。`depends` がないタスク同士は並行して動くため、先に済んでいてほしい処理は必ず `depends` で指定する。
- 実行は `mise run format`。複数をまとめて動かすときは `mise run lint ::: typecheck ::: test` のように `:::` で区切る（`mise run typecheck test` は `test` を `typecheck` の引数として渡す）。
- 一覧は `mise tasks` で見られる。

## pnpm

pnpm は npm と互換の JavaScript パッケージマネージャーで、`package.json` の書き方もレジストリも同じ。ダウンロードしたパッケージをマシン全体で共有するため速く、ディスクを節約できる。モノレポ（`pnpm-workspace.yaml`）の扱いが得意である。

### npm との対応

| やりたいこと | npm | pnpm |
|---|---|---|
| 依存をインストールする | `npm install` | `pnpm install` |
| ロックファイルどおりに入れる（CI 用） | `npm ci` | `pnpm install --frozen-lockfile` |
| ライブラリを追加する | `npm install <pkg>` | `pnpm add <pkg>` |
| 開発用ライブラリを追加する | `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| ライブラリを削除する | `npm uninstall <pkg>` | `pnpm remove <pkg>` |
| スクリプトを実行する | `npm run <script>` | `pnpm <script>`（または `pnpm run <script>`） |
| ローカルのコマンドを実行する | `npx <cmd>` | `pnpm exec <cmd>` |
| インストールせず一度だけ実行する | `npx <cmd>` | `pnpm dlx <cmd>` |
| 更新可能なものを確認する | `npm outdated` | `pnpm outdated` |

### このリポジトリでの使い方

ルート、`frontend/`、`backend/` はそれぞれ別の `package.json` を持つワークスペースである。`pnpm add` は、どのパッケージに追加するかを必ず指定する。

```bash
# frontend にライブラリを追加する
pnpm --filter @app/frontend add <pkg>

# backend に開発用ライブラリを追加する
pnpm --filter @app/backend add -D <pkg>

# ルートに追加する（ESLint など、全体で使う開発ツール）
pnpm add -D -w <pkg>

# 特定のパッケージのスクリプトだけ実行する
pnpm --filter @app/frontend build

# すべてのパッケージで実行する
pnpm -r test
```

追加したら次のファイルが変わる。**両方をコミットする。**

- 追加先パッケージの `package.json`
- ルートの `pnpm-lock.yaml`

### 日常の流れ

1. `git pull` したあと依存が増えていたら `mise run install`（`pnpm install --frozen-lockfile`）で追従する。
2. ライブラリを追加・削除したら、上のコマンドを使い、`pnpm-lock.yaml` を含めてコミットする。
3. 提出前に `mise run ci` を実行する。

### 注意点

- `pnpm-lock.yaml` を手で編集しない。競合したときは、どちらかの版を採用してから `pnpm install` を実行して再生成する。
- `node_modules/` はコミットしない。
- **公開から 7 日未満のバージョンは入らない。** サプライチェーン攻撃を避けるため `pnpm-workspace.yaml` の `minimumReleaseAge` で制限している。公開直後のバージョンを指定すると解決エラーになるので、一つ前のバージョンを使うか、日数が経つのを待つ。
- 一部のパッケージはインストール時にスクリプトを実行する。許可リスト（`pnpm-workspace.yaml` の `onlyBuiltDependencies`）にないパッケージのスクリプトは実行されない。必要な場合は `pnpm approve-builds` で内容を確認して許可し、`pnpm-workspace.yaml` の差分を PR に含める。
- Node.js や pnpm 自体のバージョンは `package.json` ではなく `mise.toml` で変更する。
