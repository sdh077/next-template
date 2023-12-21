'use client';

import { Sidebar } from 'flowbite-react';
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiViewBoards } from 'react-icons/hi';

export default function DefaultSidebar() {
    return (
        <Sidebar aria-label="Default sidebar example">
            <Sidebar.Items>
                <Sidebar.ItemGroup>
                    {[1, 2, 3, 4].map(i =>

                        <Sidebar.Item
                            key={i}
                            href={`/study/session${i}`}
                        >
                            <p>
                                {i}
                            </p>
                        </Sidebar.Item>
                    )}
                </Sidebar.ItemGroup>
            </Sidebar.Items>
        </Sidebar>
    )
}


