import Script from "next/script";

export default function Page({ children }: { children: React.ReactNode }) {
    return (
        <div>
            {children}
            <Script src="https://cdn.iamport.kr/v1/iamport.js" />
        </div>
    )
}
