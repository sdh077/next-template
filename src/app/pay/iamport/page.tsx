"use client";

export default function Payments() {
    const paymentHandler = () => {
        if (!window.IMP) return;
        /* 1. 가맹점 식별하기 */
        const { IMP } = window;
        IMP.init('imp12710143')//process.env.NEXT_PUBLIC_IAMPORT_IMP); // 가맹점 식별코드

        /* 2. 결제 데이터 정의하기 */
        const data = {
            pg: "kcp", // PG사 코드표 참조
            pay_method: "card",
            // 주문번호는 결제창 요청 시 항상 고유 값으로 채번 되어야 합니다.
            // 결제 완료 이후 결제 위변조 대사 작업시 주문번호를 이용하여 검증이 필요하므로 주문번호는 가맹점 서버에서 고유하게(unique)채번하여 DB 상에 저장해주세요
            merchant_uid: `mid_${new Date().getTime()}`, // 주문번호
            name: "노르웨이",
            amount: 100, // 숫자 타입
            buyer_email: "gildong@gmail.com",
            buyer_name: "홍길동",
            notice_url: "http//localhost:5173/pay/api",
        };
        console.log(data)
        /* 4. 결제 창 호출하기 */
        IMP.request_pay(data, callback);
    };

    async function callback(rsp: any) {
        const { success, error_msg, merchant_uid, imp_uid } = rsp;

        console.log("imp_uid : ", imp_uid);

        if (success) {
            const res = await fetch("ENDPOINT", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imp_uid: imp_uid,
                    merchant_uid: merchant_uid,
                }),
            });

            const data = await res.json();

            console.log("data : ", data);
        } else {
            alert(`결제 실패: ${error_msg}`);
        }
    }

    return (
        <>
            <button onClick={paymentHandler}>
                결제하기
            </button>
        </>
    );
}