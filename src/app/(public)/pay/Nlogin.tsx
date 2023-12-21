'use client'
import naver from 'naver-id-login'
//npm i naver-id-login
export default async function page() {
    const login = async () => {
        const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
        const callbackUrl = 'http://localhost:5173/naver/callback'
        await naver.login(clientId, callbackUrl)
    }
    return (
        <>
            <div id="naver_id_login" onClick={login}>네이버 로그인</div>
        </>
    )
}
