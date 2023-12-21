import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const url = new URL(request.url)
    const cookieStore = cookies()
    const token = cookieStore.get('dtverseMember')
    console.log(cookieStore)
    return await fetch(`http://localhost:3080${url.pathname}${url.search}`, {
        headers: {
            "accept": "application/json, text/plain, */*",
            'authorization': `Bearer ${token?.value}`,
        },
    })
}