const getData = async (id: number) => {
    return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
        .then(response => response.json())
}
const page = async ({ params }: { params: { id: string } }) => {
    const data = await getData(Number(params.id))
    return (
        <div>
            {data.id}
            {data.title}
        </div>
    );
}

export default page