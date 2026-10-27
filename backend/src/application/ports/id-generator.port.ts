export interface IdGenerator {
  uuid(): string;
  /** 招待リンク用の推測困難なトークン */
  inviteToken(): string;
}
export const ID_GENERATOR = Symbol("IdGenerator");
