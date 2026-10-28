-- 開発用の初期データ。compose の起動時に毎回適用する（何度実行しても同じ結果になる）。
-- この利用者は、compose.yaml の DEV_AUTH_USER_ID と同じ ID にする。開発用の認証ガードが、常にこの利用者として扱う。
INSERT INTO users (id, nickname, created_at, updated_at)
VALUES ('11111111-1111-4111-8111-111111111111', '開発ユーザー', now(), now())
ON CONFLICT (id) DO NOTHING;
