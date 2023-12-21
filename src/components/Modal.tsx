'use client'
import { closeModal } from '@/redux/features/modalSlice';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Button, Modal } from 'flowbite-react';
import Alert from './Alert';

const ModalComponent = () => {
    const dispatch = useDispatch();
    const isOpen = useAppSelector((state) => state.modalReducer.isOpen);
    const modalType = useAppSelector((state) => state.modalReducer.modalType);
    const content = useAppSelector((state) => state.modalReducer.content);
    const callback = useAppSelector((state) => state.modalReducer.callback);

    const handleClose = () => {
        dispatch(closeModal());
    };

    const handleConfirm = () => {
        if (callback) {
            callback();
        }
        dispatch(closeModal());
    };

    if (modalType === 1)
        return (
            <Modal dismissible show={isOpen} onClose={() => handleClose()}>
                <Modal.Header>Terms of Service</Modal.Header>
                <Modal.Body>
                    {content}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => handleConfirm()}>I accept</Button>
                    <Button color="gray" onClick={() => handleClose()}>
                        Decline
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    if (modalType === 2)
        return (
            <Modal show={isOpen} size="md" onClose={() => handleClose()} popup>
                <Modal.Header />
                <Modal.Body>
                    {content}
                    <div className="flex justify-center gap-4">
                        <Button color="failure" onClick={() => handleConfirm()}>
                            {"Yes, I'm sure"}
                        </Button>
                        <Button color="gray" onClick={() => handleClose()}>
                            No, cancel
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        )
};

export default ModalComponent;
