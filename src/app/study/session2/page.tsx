import Pagination from "./Pagination";


async function getData(page: number) {
  return Array.from({ length: 20 }, (_, index) => ({ id: index, name: `Item ${index+1}` }));
}

export default async function Page(p: { searchParams: { page: number } }) {
  const data = await getData(p.searchParams.page ?? 1);
  return (
    <div>
      <Pagination data={data} />
    </div>
  );
};

