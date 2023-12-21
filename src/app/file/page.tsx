import Link from "next/link"

const getData = async (i: string) => {
    return fetch(`https://jsonplaceholder.typicode.com/todos/${i}`)
        .then(response => response.json())
}
export default async function SSR({ searchParams }: { searchParams: { q: string } }) {
    const data = await getData(searchParams.q ?? '1')
    return (
        <div>
            <div>
                {data.userId}
            </div>
            <div>
                {data.title}
            </div>
            <Link href={`/file?q=${Number(searchParams.q) + 1}`}>next</Link>
        </div>
    )
}
