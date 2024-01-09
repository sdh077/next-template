'use client'
import './style.css'
import { useRef } from 'react'
export default function Page() {
    const ref = useRef(null)
    const refOverlay = useRef(null)
    const mouseMove = (e) => {
        if (ref.current && refOverlay.current) {
            const x = e.pageX
            const y = e.pageY
            const rotateY = -1 / 25 * (x - 200)
            const rotateX = 1 / 25 * (y - 200)

            refOverlay.current.style.backgroundPosition = `${x / 5 - y / 5}%`
            refOverlay.current.style.filter = `opacity(${x / 100}) brightness(1.2)`
            ref.current.style = `transform: perspective(350px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        }
    }
    const mouseOut = (e) => {
        if (ref.current && refOverlay.current) {
            refOverlay.current.style.filter = `opacity(0)`
            ref.current.style = `transform : perspective(350px) rotateY(0deg) rotateX(0deg)`
        }
    }
    return (
        <>
            <div className='container' onMouseMove={mouseMove} onMouseOut={mouseOut} ref={ref}>
                <div className='overlay' ref={refOverlay}></div>
                <div className="card"></div>
            </div>
        </>
    )
}
