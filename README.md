## rule

1. Page, getData 형식을 유지하고 pagination이 필요할대 fetcher를 이용한다.
2. client에서 데이터 동기화를 할때는 useSWR을 이용한다.
3. 라우팅은 next/link의 <Link/>를 이용한다.
4. fetch 된 데이터는 res로 하고 getData는 data로 통일한다