import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { POST_REPOSITORY } from "../../../application/ports/feed.repository.ts";
import type { PostRepository } from "../../../application/ports/feed.repository.ts";
import { REACTION_REPOSITORY } from "../../../application/ports/feed.repository.ts";
import type { ReactionRepository } from "../../../application/ports/feed.repository.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface RemoveReactionInput {
  userId: UserId;
  postId: string;
}

export type RemoveReactionOutput = null;

/**
 * DELETE /api/posts/{id}/reaction。findFeedItem で見られる投稿か確認 → ReactionRepository.remove。204。
 */
@Injectable()
export class RemoveReactionUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly posts: PostRepository;
  protected readonly reactions: ReactionRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(POST_REPOSITORY) posts: PostRepository,
    @Inject(REACTION_REPOSITORY) reactions: ReactionRepository,
  ) {
    this.uow = uow;
    this.posts = posts;
    this.reactions = reactions;
  }

  execute(_input: RemoveReactionInput): Promise<RemoveReactionOutput> {
    return todo("RemoveReactionUseCase");
  }
}
