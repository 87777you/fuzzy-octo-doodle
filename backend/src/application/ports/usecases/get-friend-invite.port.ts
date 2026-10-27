
/** GetFriendInviteUseCase.execute の入力。コントローラが検証し、必要な値を名目型に変換して渡す。 */
export interface GetFriendInviteInput {
  /** URL の :token から得る招待 token。パス値として受け取り、該当する有効招待の有無を repository で確認する。 */
  token: string;
}
