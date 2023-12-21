'use client'
import Script from 'next/script'
import Npay from './Npay'
import Link from 'next/link'
import { Button } from '@/components/flowbite'
import Nlogin from './Nlogin'
import Nmap from './Nmap'

export default function Page() {
    return (
        <>
            <Npay/>
            <Nlogin/>
            <Button><Link href="/kakao/login">카카오</Link></Button>
            <Nmap/>
        </>
    )
}
