'use client'
import usePagination from '@/hooks/usePagination';
export default function Pagination({ data }: { data: { id: number, name: string }[] }) {
    const itemsPerPage = 5;
    const { currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(data.length, itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage ;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = data.slice(startIndex, endIndex);

    return (
        <div>
            <ul>
                {currentItems.map((item) => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
            <div>
                <button onClick={prevPage} disabled={currentPage === 1}>
                    Previous Page
                </button>
                <span> Page {currentPage} of {totalPages} </span>
                <button onClick={nextPage} disabled={currentPage === totalPages}>
                    Next Page
                </button>
                <input
                    type="number"
                    value={currentPage}
                    onChange={(e) => goToPage(Number(e.target.value))}
                    min="1"
                    max={totalPages}
                />
                <button onClick={() => goToPage(currentPage)}>Go</button>
            </div>
        </div>
    );
};

