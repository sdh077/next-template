"use client"
import '@tldraw/tldraw/tldraw.css'
import dynamic from 'next/dynamic'

export default async function () {
    const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, { ssr: false })

	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw />
		</div>
	)
}