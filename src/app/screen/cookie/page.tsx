import { getCookie } from '@/utils/cookie';
import dynamic from 'next/dynamic';
const CSR = dynamic(() => import('./csr'), { ssr: false })

const Home = () => {
    const d = getCookie('dtverse-id')
    return (
        <div>
            <h1>ssr {d}</h1>
            <CSR/>
        </div>
    )
}
export default Home;