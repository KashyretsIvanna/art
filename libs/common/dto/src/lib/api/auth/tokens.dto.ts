export class TokensRes {
  accessToken: string;
  refreshToken: string;
}

export class AdminTokensRes {
  tokens: TokensRes;
  id: number;
}
