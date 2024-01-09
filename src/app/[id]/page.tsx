import Link from "next/link";
import axios from 'axios';


interface BooksProps {
    id: number;
    title: string;
    description: string;
}

export default async function Books({ params }: { params: { id: string } }) {
    const { data } = await axios.get("http://localhost:4000/books");

    return (
        <>
            {data?.map(({ id, title, description }) => (
                <Link href={`/books/${id}`} key={id}>
                    <div style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid black" }}>
                        <span style={{ marginRight: "10px" }}>{title}</span>
                        <span>{description}</span>
                    </div>
                </Link>
            ))}
        </>
    );
}

export async function generateStaticParams() {
    try {
        const { data } = await axios.get("http://localhost:4000/books");
        return [{ id: '1' }, { id: '2' }, { id: '3' }]
    } catch (err) {
        return {
            notFound: true,
        };
    }
}