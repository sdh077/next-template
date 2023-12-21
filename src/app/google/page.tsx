'use client'
import { supabase } from '../study/session5/lib/api';

export default async function Page() {
    async function signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google", // kakao도 가능하다!
        });
      }
    return (
        <div>
            <button onClick={signInWithGoogle}>구글 로그인</button>
        </div>
    )
}
