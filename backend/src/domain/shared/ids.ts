declare const brand: unique symbol;
type Brand<T, B> = T & { readonly [brand]: B };

export type UserId = Brand<string, "UserId">;
export type TaskId = Brand<string, "TaskId">;
export type EvidenceId = Brand<string, "EvidenceId">;
export type UploadSessionId = Brand<string, "UploadSessionId">;
export type ObjectionId = Brand<string, "ObjectionId">;
export type FriendshipId = Brand<string, "FriendshipId">;
export type PostId = Brand<string, "PostId">;
export type NotificationId = Brand<string, "NotificationId">;
