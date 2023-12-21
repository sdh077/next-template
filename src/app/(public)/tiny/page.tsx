'use client'
import { useEffect, useState } from 'react';
import Tiny from './Tiny';

export default function Page() {
    const [load, setLoad] = useState(false)
    useEffect(() => setLoad(true))
    return (
        <>
            {load && <Tiny />}
        </>
    );
}