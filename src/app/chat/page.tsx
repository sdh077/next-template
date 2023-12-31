'use client'
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

interface Message {
    created_at: string
    id: number
    message: string
}
export default function Page() {
    useEffect(() => {
        const load = async () => {
            const { data, error } = await supabase
                .from('test')
                .select()
            if (data) setMessages(data)
        }
        const channel = supabase.channel('room1')
        channel
            .on('presence', { event: 'sync' }, () => {
                console.log('Synced presence state: ', channel.presenceState())
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString() })
                }
            })
        load()
    }, [])
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const sendMessage = async () => {
        const { data, error } = await supabase
            .from('test')
            .insert([
                { message },
            ])
            .select()
        if (data) setMessages(m => [...m, ...data])
    }
    return (
        <>
            <div className="flex h-screen bg-white dark:bg-zinc-800">
                <aside className="w-80 border-r dark:border-zinc-700">
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Messages</h2>
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={24}
                                    height={24}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-6 h-6"
                                >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                </svg>
                            </button>
                        </div>
                        <div className="relative">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="absolute left-2.5 top-3 h-4 w-4 text-zinc-500 dark:text-zinc-400"
                            >
                                <circle cx={11} cy={11} r={8} />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                            <input
                                type="search"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8"
                                placeholder="Search messages..."
                            />
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 absolute right-2.5 top-3" />
                        </div>
                        <div className="space-y-2">
                            <div
                                className="rounded-lg border bg-card text-card-foreground shadow-sm p-2"
                                data-v0-t="card"
                            >
                                <div className="p-6">
                                    <h3 className="font-semibold">Contact Name</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Last message...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
                <section className="flex flex-col w-full">
                    <header className="border-b dark:border-zinc-700 p-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="flex shrink-0 rounded-full relative overflow-visible w-10 h-10">
                                <span className="absolute right-0 top-0 flex h-3 w-3 rounded-full bg-green-600" />
                                <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                                    U
                                </span>
                            </span>
                            <div>
                                Contact Name
                                <span className="text-xs text-green-600 block">Online</span>
                            </div>
                        </h2>
                    </header>
                    <main className="flex-1 overflow-auto p-4">
                        <div className="space-y-4">
                            {messages.map(m =>
                                <div className="flex items-end gap-2">
                                    <div className="rounded-lg bg-zinc-200 dark:bg-zinc-700 p-2">
                                        <p className="text-sm">{m.id} - {m.message}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                    <footer className="border-t dark:border-zinc-700 p-4">
                        <div className="flex items-center gap-2">
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={24}
                                    height={24}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-6 h-6"
                                >
                                    <circle cx={12} cy={12} r={10} />
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                    <line x1={9} x2="9.01" y1={9} y2={9} />
                                    <line x1={15} x2="15.01" y1={9} y2={9} />
                                </svg>
                            </button>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                                placeholder="Type a message..."
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button
                                onClick={sendMessage}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                Send
                            </button>
                        </div>
                    </footer>
                </section>
            </div>
        </>
    )
}
