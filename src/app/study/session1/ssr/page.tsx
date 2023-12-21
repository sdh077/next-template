import Button from "@/components/Button"
import { revalidatePath } from "next/cache"
import { cookies, headers } from 'next/headers'
import Link from "next/link"
import Phone from "./phone"

const getData = async (i: number) => {
    const cookieStore = cookies()
    const dtverseMember = cookieStore.get('dtverseMember')?.value ?? ''
    return fetch(`https://jsonplaceholder.typicode.com/todos/${i}`, { headers: { 'Authorization': dtverseMember } })
        .then(response => response.json())
}
export default async function SSR({ searchParams }: { searchParams: { p: string } }) {
    const pageNo = Number(searchParams.p ?? 1)
    const data = await getData(pageNo)
    return (
        <div>
            <Phone />
            {pageNo} - {data.title}
            <Link href={`/study/session1?p=${pageNo + 1}`}><Button>+</Button></Link>
        </div>
    )
}
