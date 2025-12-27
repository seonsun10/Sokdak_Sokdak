import { supabase } from '../lib/supabase';

/**
 * Supabase 인증 후 돌아오는 URL을 해석하여 세션을 설정합니다.
 */
export const handleAuthRedirect = async (url: string | null) => {
  if (!url) return;

  try {
    const normalizedUrl = url.replace('#', '?');
    const queryString = normalizedUrl.includes('?') ? normalizedUrl.split('?')[1] : '';
    if (!queryString) return;

    const params = new URLSearchParams(queryString);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const code = params.get('code');
    const error = params.get('error') || params.get('error_description');

    if (error) {
      console.error("❌ Auth Redirect Error:", error);
      return;
    }

    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token });
    } else if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  } catch (err) {
    console.error("❗ Redirect 처리 중 예외:", err);
  }
};
