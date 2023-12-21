import Link from "next/link"

const getData = async () => {
    return fetch('https://jsonplaceholder.typicode.com/posts')
        .then(response => response.json())
}
export default async function SSR() {
    const data = await getData()
    return (
        <div>{data.map((post: {id: number, title: string}) =>
            <div key={post.id}>
                <Link href={`/study/session3/${post.id}`}>{post.title}</Link>
            </div>
        )}</div>
    )
}
