import { Inject, Injectable } from "@nestjs/common";
import { todo } from "../../../application/shared/todo.ts";
import { UNIT_OF_WORK } from "../../../application/ports/unit-of-work.port.ts";
import type { UnitOfWork } from "../../../application/ports/unit-of-work.port.ts";
import { CLOCK } from "../../../application/ports/clock.port.ts";
import type { Clock } from "../../../application/ports/clock.port.ts";
import { POST_REPOSITORY } from "../../../application/ports/feed.repository.ts";
import type { PostRepository } from "../../../application/ports/feed.repository.ts";
import { REACTION_REPOSITORY } from "../../../application/ports/feed.repository.ts";
import type { ReactionRepository } from "../../../application/ports/feed.repository.ts";
import type { ReactionType } from "../../../domain/feed/post.ts";
import type { UserId } from "../../../domain/shared/ids.ts";

export interface SetReactionInput {
  userId: UserId;
  postId: string;
  type: ReactionType;
}

export type SetReactionOutput = null;

/**
 * PUT /api/posts/{id}/reaction。findFeedItem で見られる投稿か確認 → ReactionRepository.upsert。204。
 */
@Injectable()
export class SetReactionUseCase {
  protected readonly uow: UnitOfWork;
  protected readonly clock: Clock;
  protected readonly posts: PostRepository;
  protected readonly reactions: ReactionRepository;

  constructor(
    @Inject(UNIT_OF_WORK) uow: UnitOfWork,
    @Inject(CLOCK) clock: Clock,
    @Inject(POST_REPOSITORY) posts: PostRepository,
    @Inject(REACTION_REPOSITORY) reactions: ReactionRepository,
  ) {
    this.uow = uow;
    this.clock = clock;
    this.posts = posts;
    this.reactions = reactions;
  }

  execute(_input: SetReactionInput): Promise<SetReactionOutput> {
    return todo("SetReactionUseCase");
  }
}
