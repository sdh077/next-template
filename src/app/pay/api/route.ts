import { Request, Response, NextFunction } from "express";
import axios from "axios";
import * as dotenv from "dotenv";

export async function POST(req: Request, res: Response) {
    const { imp_uid, merchant_uid } = req.body;

    try {
        const getToken = await axios({
            url: "https://api.iamport.kr/users/getToken",
            method: "post", // POST method
            headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
            data: {
                imp_key: process.env.IAMPORT_API_KEY, // REST API키
                imp_secret: process.env.IAMPORT_API_SECRET, // API SECRET 키
            },
        });
        const { access_token } = getToken.data.response;

        const getPaymentData = await axios({
            // imp_uid 전달
            url: `https://api.iamport.kr/payments/${imp_uid}`,
            // GET method
            method: "get",
            // 인증 토큰 Authorization header에 추가
            headers: { Authorization: access_token },
        });

        const paymentData = getPaymentData.data.response;

        console.log("paymentData : ", paymentData);

        // ... 이후 비즈니스 로직

    } catch (error) {
        console.log(error);
    }

    return res.json({ message: "message" });
}