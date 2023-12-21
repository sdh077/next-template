'use client'
import { useEffect, useState } from "react";
import useCapture, { initCapture } from "@/app/hooks/useCapture";

export default function TableExam() {
    const [loading, item, setItem] = useCapture('capture', 1);
    return (
        <div>
            {loading && <div>{item} <button onClick={() => setItem(item + 1)}>+</button></div>}
        </div>
    )
}
