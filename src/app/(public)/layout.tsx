import { Providers } from '@/redux/provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Sidebar from '@/layout/component/Sidebar'
const inter = Inter({ subsets: ['latin'] })
import Script from 'next/script'
import Modal from '@/components/Modal'
import Menu from '@/layout/component/Menu'
import Alert from '@/components/Alert'


export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Providers>
                <Menu />
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
                <Alert />
            </Providers>
        </>
    )
}
