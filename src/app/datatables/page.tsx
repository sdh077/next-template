import dynamic from "next/dynamic";

export default function Page() {
    const Datatables = dynamic(() => import("./Datatables"), { ssr: false })
    return (
        <div><Datatables /></div>
    )
}
