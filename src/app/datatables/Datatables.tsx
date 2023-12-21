'use client'
import DataTable from 'datatables.net-dt';
import 'datatables.net-responsive-dt';
// import 'datatables.net-dt/css/jquery.dataTables.min.css';
// import 'datatables.net-responsive-dt/css/responsive.dataTables.min.css';
import { useEffect, useRef } from 'react';

export default function Datatables() {
    const tableRef = useRef();
    useEffect(() => {
        const table = new DataTable(tableRef.current, {
            // config options...
        });
    
        // 언마운트 시 destroy
        return () => {
          table.destroy();
        };
      }, []);
    return (
        <>
        <table className="display" ref={tableRef}>
            <thead>
                <tr>
                    <th>Column 1</th>
                    <th>Column 2</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Row 1 Data 1</td>
                    <td>Row 1 Data 2</td>
                </tr>
                <tr>
                    <td>Row 2 Data 1</td>
                    <td>Row 2 Data 2</td>
                </tr>
            </tbody>
        </table>
        <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/dataTables.tailwindcss.min.css" type="text/css" />
        </>
    )
}
