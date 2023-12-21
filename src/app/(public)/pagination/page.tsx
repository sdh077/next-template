import Pagination from "./Pagination";


async function getData(page) {
    // const url = new URL(input.toString());
    // const page = url.searchParams.get('page') || '1';

    return Array.from({ length: 20 }, (_, index) => ({ id: index + Number(page), name: `Item ${index + Number(page)}` }));
}

export default async function Page(p)  {
  const data = await getData(p.searchParams.page);
  console.log(data)
  return (
    <div>
      <Pagination data={data}/>
    </div>
  );
};

