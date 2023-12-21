'use client'
import { useState } from 'react';

export default function Stopwatch() {
    const [startTime, setStartTime] = useState(null);
    const [now, setNow] = useState(null);

    function handleStart() {
        // Start counting.
        setStartTime(Date.now());
        setNow(Date.now());

        setInterval(() => {
            // Update the current time every 10ms.
            setNow(Date.now());
        }, 10);
    }

    const secondsPassed = startTime != null && now != null ? (now - startTime) / 1000 : 0

    return (
        <>
            <h1>Time passed: {secondsPassed.toFixed(3)}</h1>
            <button onClick={handleStart}>
                Start
            </button>
        </>
    );
}
