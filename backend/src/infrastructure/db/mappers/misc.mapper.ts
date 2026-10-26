import { POST_TYPES, REACTION_TYPES } from "../../../domain/feed/post.ts";
import type { Post } from "../../../domain/feed/post.ts";
import type { FriendInvite } from "../../../domain/friendship/friend-invite.ts";
import { NOTIFICATION_TYPES } from "../../../domain/notification/notification.ts";
import type { Notification } from "../../../domain/notification/notification.ts";
import type { Nickname, User } from "../../../domain/user/user.ts";
import { parseNickname } from "../../../domain/user/user.ts";
import type { FriendInvitesTable, NotificationsTable, PostsTable, Row, UsersTable } from "../schema.ts";
import { flag, oneOf } from "./common.ts";
import { notificationId, postId, taskId, userId } from "./ids.ts";

export function rowToUser(row: Row<UsersTable>): User {
  const nickname: Nickname = parseNickname(row.nickname);
  return { id: userId(row.id), nickname, createdAt: row.created_at, updatedAt: row.updated_at };
}

export function rowToPost(row: Row<PostsTable>): Post {
  return {
    id: postId(row.id),
    taskId: taskId(row.task_id),
    userId: userId(row.user_id),
    postType: oneOf(POST_TYPES, row.post_type, "posts", "post_type"),
    createdAt: row.created_at,
  };
}

export const asReactionType = (s: string): (typeof REACTION_TYPES)[number] =>
  oneOf(REACTION_TYPES, s, "reactions", "reaction_type");

export function rowToNotification(row: Row<NotificationsTable>): Notification {
  return {
    id: notificationId(row.id),
    userId: userId(row.user_id),
    type: oneOf(NOTIFICATION_TYPES, row.type, "notifications", "type"),
    title: row.title,
    body: row.body,
    relatedTaskId: row.related_task_id === null ? null : taskId(row.related_task_id),
    readAt: row.read_at,
    createdAt: row.created_at,
    deduplicationKey: row.deduplication_key,
  };
}

export function rowToInvite(row: Row<FriendInvitesTable>): FriendInvite {
  return {
    id: row.id,
    inviterId: userId(row.inviter_id),
    token: row.token,
    isActive: flag(row.is_active),
    createdAt: row.created_at,
  };
}
