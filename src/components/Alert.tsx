'use client'
import { useDispatch } from "react-redux";
import { Alert } from "./flowbite";
import { closeModal } from "@/redux/features/modalSlice";
import { useAppSelector } from "@/redux/hooks";
import { closeAlert } from "@/redux/features/alertSlice";
import { useEffect } from "react";

export default function AlertComponent() {
    const dispatch = useDispatch();
    const alerts = useAppSelector((state) => state.alertReducer);

    useEffect(() => {
        if (alerts.length > 0) {
            console.log(alerts)
            const timer = setTimeout(() => {
                dispatch(closeAlert());
            }, alerts[0].timeout);
            return () => {
                clearTimeout(timer);
            };
        }
    })


    return (
        <>
            {alerts.map(a =>
                <Alert key={a.id} color="success" onDismiss={() => alert('Alert dismissed!')}>
                    <span className="font-medium">Info alert!</span> {a.content}
                </Alert>
            )}
        </>
    );
}