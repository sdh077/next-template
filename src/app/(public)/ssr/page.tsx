import { revalidatePath } from "next/cache"
import { cookies, headers } from 'next/headers'

const getData = async (i) => {
    return fetch('http://localhost:5173/api/projectboard/info/1034?bbsKindCd=P_QNA&viewCountYn=Y&id=1034')
        .then(response => response.json())
}
export default async function SSR() {
    const data = await getData(1)
    // console.log(data)
    return (
        <div>
            {/* {data.data} */}
        </div>
    )
}
