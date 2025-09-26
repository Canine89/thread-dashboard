/**
 * Threads API Token 수명 관리 유틸리티
 * Long-lived Token 변환 및 만료 감지
 */

export interface TokenInfo {
  access_token: string;
  expires_in?: number;
  token_type: string;
}

export interface TokenDebugInfo {
  app_id: string;
  type: string;
  application: string;
  data_access_expires_at: number;
  expires_at: number;
  is_valid: boolean;
  scopes: string[];
}

/**
 * Short-lived Token을 Long-lived Token으로 변환
 * @param shortToken 현재 Short-lived Token
 * @param appId Facebook App ID
 * @param appSecret Facebook App Secret
 * @returns Long-lived Token 정보
 */
export async function exchangeForLongLivedToken(
  shortToken: string,
  appId: string,
  appSecret: string
): Promise<TokenInfo> {
  const url = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
  url.searchParams.set('grant_type', 'fb_exchange_token');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('client_secret', appSecret);
  url.searchParams.set('fb_exchange_token', shortToken);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  }

  return data as TokenInfo;
}

/**
 * 토큰 정보 및 만료 시간 확인
 * @param accessToken 확인할 Access Token
 * @returns 토큰 디버그 정보
 */
export async function debugAccessToken(accessToken: string): Promise<TokenDebugInfo> {
  const url = new URL('https://graph.facebook.com/debug_token');
  url.searchParams.set('input_token', accessToken);
  url.searchParams.set('access_token', accessToken);

  const response = await fetch(url.toString());
  const result = await response.json();

  if (!response.ok || !result.data) {
    throw new Error(`Token debug failed: ${JSON.stringify(result)}`);
  }

  return result.data as TokenDebugInfo;
}

/**
 * 토큰 만료까지 남은 시간 계산 (일 단위)
 * @param accessToken 확인할 Access Token
 * @returns 남은 일 수 (만료된 경우 음수)
 */
export async function getTokenDaysRemaining(accessToken: string): Promise<number> {
  try {
    const debugInfo = await debugAccessToken(accessToken);

    if (!debugInfo.is_valid) {
      return -1; // 이미 만료됨
    }

    if (!debugInfo.expires_at) {
      return Infinity; // 만료되지 않음 (영구 토큰)
    }

    const expiresAt = new Date(debugInfo.expires_at * 1000);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch {
    return -1; // 오류 발생 시 만료된 것으로 간주
  }
}

/**
 * 토큰 만료 임박 확인 (7일 이내)
 * @param accessToken 확인할 Access Token
 * @returns 갱신 필요 여부
 */
export async function isTokenRefreshNeeded(accessToken: string): Promise<boolean> {
  const daysRemaining = await getTokenDaysRemaining(accessToken);
  return daysRemaining <= 7 && daysRemaining > 0;
}

/**
 * 환경변수에서 토큰 정보 가져오기
 */
export function getTokenFromEnv(): string | null {
  return process.env.THREADS_ACCESS_TOKEN || null;
}

/**
 * 토큰 상태 요약 정보
 */
export async function getTokenStatus(accessToken?: string): Promise<{
  token: string | null;
  isValid: boolean;
  daysRemaining: number;
  needsRefresh: boolean;
  expiresAt: string | null;
}> {
  const token = accessToken || getTokenFromEnv();

  if (!token) {
    return {
      token: null,
      isValid: false,
      daysRemaining: 0,
      needsRefresh: true,
      expiresAt: null,
    };
  }

  try {
    const debugInfo = await debugAccessToken(token);
    const daysRemaining = await getTokenDaysRemaining(token);
    const needsRefresh = await isTokenRefreshNeeded(token);

    return {
      token,
      isValid: debugInfo.is_valid,
      daysRemaining,
      needsRefresh,
      expiresAt: debugInfo.expires_at
        ? new Date(debugInfo.expires_at * 1000).toISOString()
        : null,
    };
  } catch {
    return {
      token,
      isValid: false,
      daysRemaining: -1,
      needsRefresh: true,
      expiresAt: null,
    };
  }
}