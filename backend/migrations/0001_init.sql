-- PostgreSQL 15+ 向け初期スキーマ。src/infrastructure/db/schema.ts と対応させる。
-- ID はアプリ側で採番した UUID 文字列。日時は timestamptz（UTC）。

CREATE TABLE users (
  id          varchar(36) PRIMARY KEY,
  nickname    varchar(30) NOT NULL,
  created_at  timestamptz NOT NULL,
  updated_at  timestamptz NOT NULL
);

CREATE TABLE friendships (
  id            varchar(36) PRIMARY KEY,
  user_low_id   varchar(36) NOT NULL REFERENCES users (id),
  user_high_id  varchar(36) NOT NULL REFERENCES users (id),
  requester_id  varchar(36) NOT NULL REFERENCES users (id),
  receiver_id   varchar(36) NOT NULL REFERENCES users (id),
  status        varchar(16) NOT NULL CHECK (status IN ('pending','accepted','rejected','cancelled','removed','blocked')),
  blocked_by    varchar(36) REFERENCES users (id),
  requested_at  timestamptz NOT NULL,
  accepted_at   timestamptz,
  CHECK (user_low_id < user_high_id),
  CHECK (requester_id <> receiver_id),
  CHECK ((status = 'blocked') = (blocked_by IS NOT NULL)),
  CHECK ((status = 'accepted') = (accepted_at IS NOT NULL)),
  UNIQUE (user_low_id, user_high_id)
);
CREATE INDEX friendships_receiver_status ON friendships (receiver_id, status);
CREATE INDEX friendships_requester_status ON friendships (requester_id, status);

CREATE TABLE friend_invites (
  id          varchar(36) PRIMARY KEY,
  inviter_id  varchar(36) NOT NULL REFERENCES users (id),
  token       varchar(64) NOT NULL UNIQUE,
  is_active   boolean NOT NULL,
  created_at  timestamptz NOT NULL
);
CREATE INDEX friend_invites_inviter ON friend_invites (inviter_id, is_active);

CREATE TABLE tasks (
  id                              varchar(36) PRIMARY KEY,
  user_id                         varchar(36) NOT NULL REFERENCES users (id),
  original_task_id                varchar(36) REFERENCES tasks (id),
  title                           varchar(100) NOT NULL,
  achievement_condition           text NOT NULL,
  evidence_method                 text NOT NULL,
  deadline_at                     timestamptz NOT NULL,
  penalty_amount                  integer NOT NULL CHECK (penalty_amount >= 0),
  is_penalty_public               boolean NOT NULL,
  status                          varchar(16) NOT NULL CHECK (status IN ('active','reviewing','disputed','success','failed','indeterminate','closed')),
  review_round                    smallint NOT NULL CHECK (review_round IN (0,1,2)),
  review_deadline_at              timestamptz,
  additional_evidence_deadline_at timestamptz,
  completed_at                    timestamptz,
  finalized_at                    timestamptz,
  created_at                      timestamptz NOT NULL,
  updated_at                      timestamptz NOT NULL,
  CHECK ((status = 'reviewing') = (review_deadline_at IS NOT NULL)),
  CHECK ((status = 'disputed') = (additional_evidence_deadline_at IS NOT NULL)),
  CHECK ((status IN ('success','failed','indeterminate','closed')) = (finalized_at IS NOT NULL))
);
CREATE INDEX tasks_owner_status_deadline ON tasks (user_id, status, deadline_at);
CREATE INDEX tasks_owner_finalized ON tasks (user_id, finalized_at DESC);
CREATE INDEX tasks_active_deadline ON tasks (deadline_at) WHERE status = 'active';
CREATE INDEX tasks_review_deadline ON tasks (review_deadline_at) WHERE status = 'reviewing';
CREATE INDEX tasks_additional_deadline ON tasks (additional_evidence_deadline_at) WHERE status = 'disputed';

CREATE TABLE task_evidences (
  id               varchar(36) PRIMARY KEY,
  task_id          varchar(36) NOT NULL REFERENCES tasks (id),
  submission_type  varchar(16) NOT NULL CHECK (submission_type IN ('initial','additional')),
  comment          text,
  submitted_at     timestamptz NOT NULL,
  UNIQUE (task_id, submission_type)
);

CREATE TABLE evidence_photos (
  id             varchar(60) PRIMARY KEY,
  evidence_id    varchar(36) NOT NULL REFERENCES task_evidences (id),
  storage_path   text NOT NULL,
  display_order  smallint NOT NULL CHECK (display_order BETWEEN 1 AND 3),
  UNIQUE (evidence_id, display_order)
);

CREATE TABLE evidence_upload_sessions (
  id                varchar(36) PRIMARY KEY,
  task_id           varchar(36) NOT NULL REFERENCES tasks (id),
  user_id           varchar(36) NOT NULL REFERENCES users (id),
  submission_type   varchar(16) NOT NULL CHECK (submission_type IN ('initial','additional')),
  started_at        timestamptz NOT NULL,
  upload_expires_at timestamptz NOT NULL,
  status            varchar(16) NOT NULL CHECK (status IN ('uploading','completed','expired','cancelled')),
  completed_at      timestamptz,
  CHECK ((status = 'completed') = (completed_at IS NOT NULL))
);
CREATE INDEX upload_sessions_task_live ON evidence_upload_sessions (task_id, submission_type, status);

CREATE TABLE task_objections (
  id             varchar(36) PRIMARY KEY,
  task_id        varchar(36) NOT NULL REFERENCES tasks (id),
  user_id        varchar(36) NOT NULL REFERENCES users (id),
  review_round   smallint NOT NULL CHECK (review_round IN (1,2)),
  reason_type    varchar(32) NOT NULL,
  reason_detail  text NOT NULL,
  created_at     timestamptz NOT NULL,
  withdrawn_at   timestamptz,
  UNIQUE (task_id, review_round)
);
CREATE INDEX objections_objector ON task_objections (user_id, created_at DESC);

CREATE TABLE posts (
  id          varchar(36) PRIMARY KEY,
  task_id     varchar(36) NOT NULL REFERENCES tasks (id),
  user_id     varchar(36) NOT NULL REFERENCES users (id),
  post_type   varchar(16) NOT NULL CHECK (post_type IN ('created','reported','failed')),
  created_at  timestamptz NOT NULL,
  UNIQUE (task_id, post_type)
);
CREATE INDEX posts_user_created ON posts (user_id, created_at DESC);

CREATE TABLE reactions (
  id             varchar(80) PRIMARY KEY,
  post_id        varchar(36) NOT NULL REFERENCES posts (id),
  user_id        varchar(36) NOT NULL REFERENCES users (id),
  reaction_type  varchar(16) NOT NULL CHECK (reaction_type IN ('support','fire','congrats','laugh')),
  created_at     timestamptz NOT NULL,
  updated_at     timestamptz NOT NULL,
  UNIQUE (post_id, user_id)
);

CREATE TABLE notifications (
  id                 varchar(36) PRIMARY KEY,
  user_id            varchar(36) NOT NULL REFERENCES users (id),
  type               varchar(40) NOT NULL,
  title              text NOT NULL,
  body               text NOT NULL,
  related_task_id    varchar(36) REFERENCES tasks (id),
  read_at            timestamptz,
  created_at         timestamptz NOT NULL,
  deduplication_key  varchar(200) NOT NULL UNIQUE
);
CREATE INDEX notifications_user_created ON notifications (user_id, created_at DESC);
CREATE INDEX notifications_user_unread ON notifications (user_id) WHERE read_at IS NULL;

CREATE TABLE idempotency_requests (
  id               varchar(200) PRIMARY KEY,
  user_id          varchar(36) NOT NULL REFERENCES users (id),
  operation        varchar(64) NOT NULL,
  idempotency_key  varchar(128) NOT NULL,
  request_hash     varchar(64) NOT NULL,
  response_status  integer,
  response_body    text,
  created_at       timestamptz NOT NULL,
  UNIQUE (user_id, operation, idempotency_key)
);
