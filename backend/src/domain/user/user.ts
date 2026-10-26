import { DomainError } from "../shared/errors.ts";
import type { UserId } from "../shared/ids.ts";

export const NICKNAME_MAX = 20;

export interface UserProps {
  id: UserId;
  nickname: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;
  private constructor(props: UserProps) {
    this.props = props;
  }

  static register(id: UserId, nickname: string, now: Date): User {
    return new User({ id, nickname: User.validateNickname(nickname), createdAt: now, updatedAt: now });
  }
  static reconstitute(props: UserProps): User {
    return new User({ ...props });
  }

  static validateNickname(raw: string): string {
    const v = raw.trim();
    if (v.length < 1 || v.length > NICKNAME_MAX) {
      throw new DomainError(
        "VALIDATION_ERROR",
        `ニックネームは1〜${String(NICKNAME_MAX)}文字で入力してください`,
      );
    }
    return v;
  }

  changeNickname(nickname: string, now: Date): void {
    this.props.nickname = User.validateNickname(nickname);
    this.props.updatedAt = now;
  }

  get id(): UserId {
    return this.props.id;
  }
  get nickname(): string {
    return this.props.nickname;
  }
  snapshot(): Readonly<UserProps> {
    return { ...this.props };
  }
}

export interface UserStats {
  successCount: number;
  failedCount: number;
  indeterminateCount: number;
}

/** 達成率 = 達成 ÷ (達成 + 未達成) × 100。判定不能は対象外。分母0なら null（UIは「—」） */
export function successRate(s: UserStats): number | null {
  const denom = s.successCount + s.failedCount;
  return denom === 0 ? null : Math.round((s.successCount / denom) * 100);
}
