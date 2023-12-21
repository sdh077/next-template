import CSR from "./csr/page";
import SSR from "./ssr/page";

export default function page({ searchParams }: { searchParams: { p: string } }) {
  return (
    <div>
      csr
      <CSR />
      ssr
      <SSR searchParams={searchParams} />
    </div>
  )
}
