import { Providers } from '@/redux/provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import Script from 'next/script'
import Modal from '@/components/Modal'
import Sidebar from './Sidebar';


export default function Layout({
    children
}: {
    children: React.ReactNode,
}) {
    return (
        <>
            <Providers>
                {/* <DarkThemeToggle /> */}
                <div className='flex justify-between px-4 mx-auto max-w-8xl'>
                    <div className='hidden mb-6 xl:block lg:w-80'>
                        <Sidebar />
                    </div>
                    <div className='w-full mx-auto'>
                        {children}
                    </div>
                </div>
                <Modal />
            </Providers>
        </>
    )
}