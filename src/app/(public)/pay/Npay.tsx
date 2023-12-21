'use client'
import Script from 'next/script'
export default function Npay() {
    
    return (
        <>
            <input type="button" id="naverPayBtn" value="네이버페이 결제 버튼"></input>
            <Script src="https://nsp.pay.naver.com/sdk/js/naverpay.min.js"
                onError={(e: Error) => {
                    console.error('Script failed to load', e)
                }}
                onReady={() => {
                    const oPay = Naver.Pay.create({ //SDK Parameters를 참고 바랍니다.
                        "mode": "production",
                        "clientId": "u86j4ripEt8LRfPGzQ8",
                        "chainId": "TDZSUHBoVGRFS2l"
                    });
                    var elNaverPayBtn = document.getElementById("naverPayBtn");

                    elNaverPayBtn.addEventListener("click", function () {
                        oPay.open({ // Pay Reserve Parameters를 참고 바랍니다.
                            "merchantUserKey": "{#_merchantUserKey}",
                            "merchantPayKey": "{#_merchantPayKey}",
                            "productName": "{#_productName}",
                            "totalPayAmount": 1000,
                            "taxScopeAmount": 1000,
                            "taxExScopeAmount": 0,
                            "returnUrl": "{#_returnUrl}"
                        });
                    });
                }}
            ></Script>
        </>
    )
}
