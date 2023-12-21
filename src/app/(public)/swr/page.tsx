'use client'
import fetcher from '@/utils/fetcher'
import Menu from '@/interface/Menu'
import useSWR from 'swr'

export default function Page() {

    const { data, error, isLoading } = useSWR<{ data: Menu[] }>('https://stgmanage.dtverse.net/api/common/menu-list', fetcher)
    if (error) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>
    // 데이터 렌더링
    return <div>
        {data.data.filter((m: Menu) => m.upperMenuId === null).map(menu =>
            <Child menu={menu} key={menu.menuId} menus={data.data} />
        )}
    </div>
}
function Child({ menu, menus }: { menu: Menu, menus: Menu[] }) {
    return <>
        <>
            {menu.menuNm}
            {menus.filter(m => m.upperMenuId === menu.menuId).map(m =>
                <div key={m.menuId}>---<Child menu={m} menus={menus} /></div>
            )}
        </></>
}


