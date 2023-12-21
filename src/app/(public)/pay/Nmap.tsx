'use client'
import Script from 'next/script'
import { useRef } from 'react';

export type NaverMap = naver.maps.Map;

export default function Nmap() {
    const mapRef = useRef<NaverMap | null>(null);
    const initializeMap = () => {
        const mapOptions = {
            center: new window.naver.maps.LatLng(37.3595704, 127.105399),
            zoom: 10,
            minZoom: 9,
            scaleControl: false,
            mapDataControl: false,
            logoControlOptions: {
                position: naver.maps.Position.BOTTOM_LEFT,
            },
        };
        mapRef.current = new window.naver.maps.Map('map', mapOptions);
    }
    return (
        <>
            <Script
                strategy="afterInteractive"
                type="text/javascript"
                src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NC_ID}`}
                onReady={initializeMap}
            />
            <div id='map' style={{ width: '500px', height: '500px' }} />
        </>
    )
}
