'use client'

import Button from "@/components/Button"
import { useEffect, useState } from "react"

export default function CSR() {
    const [i, set] = useState(1)
    const [data, setData] = useState({
        "userId": 0,
        "id": 0,
        "title": "",
        "completed": false
    })
    useEffect(() => {
        fetch(`https://jsonplaceholder.typicode.com/todos/${i}`, { headers: { 'Authorization': '123' }, cache: 'no-cache' })
            .then(response => response.json())
            .then(json => setData(json))
    }, [i])
    return (
        <div>{i} - {data.title}<Button onClick={() => set(i => i + 1)}>+</Button></div>
    )
}
