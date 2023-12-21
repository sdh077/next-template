import { getCookie } from "./cookie";

const fetcher = (input: RequestInfo, init?: RequestInit, pageOption = false) => {
    const url = new URL(input.toString());
    if (pageOption) {
        // Set default values or get values from the URL
        const pageSize = url.searchParams.get('pageSize') || '5';
        const page = url.searchParams.get('page') || '1';
        const searchKwd = url.searchParams.get('searchKwd') || '';
        const searchType = url.searchParams.get('searchType') || '';

        url.searchParams.set('pageSize', pageSize);
        url.searchParams.set('page', page);
        url.searchParams.set('searchKwd', searchKwd);
        url.searchParams.set('searchType', searchType);
    }
    init = {
        ...init,
        headers: {
            Authorization: getCookie('dtverseMember')
        }
    }
    
    return fetch(url.href, init).then(res => res.json());
}

export default fetcher
