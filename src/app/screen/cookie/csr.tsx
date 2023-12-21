'use client'
import { getCookie } from 'cookies-next'
import { useState, useEffect } from 'react'
const CSR = () => {
    const [isClient, setIsClient] = useState(false)
    useEffect(() => {
        setIsClient(true)
    }, [])
    const d = getCookie('dtverse-id')
    
    if (!isClient) return <div></div>
    return (
        <div>
            <h1>csr {d}</h1>
        </div>
    )
}
export default CSR;