export function generateStaticParams() {
    return [{ id: '1' }, { id: '2' }, { id: '3' }]
  }
   
  // Three versions of this page will be statically generated
  // using the `params` returned by `generateStaticParams`
  // - /product/1
  // - /product/2
  // - /product/3
  export default function Page({ params }: { params: { id: string } }) {
    const { id } = params
    // ...
  }

  let item: {child: string} = {child: '123'}