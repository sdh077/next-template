'use client'
import { openModal } from '@/redux/features/modalSlice';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'flowbite-react';
import { openAlert } from '@/redux/features/alertSlice';
import ButtonComponent from '@/components/Button';
import { HiOutlineArrowRight, HiShoppingCart } from 'react-icons/hi';

const Modal = () => {
  const dispatch = useDispatch();

  const handleOpenModal = (type: number) => {
    const content = (
      <div>
        <p>Are you sure you want to confirm?</p>
      </div>
    );

    const callbackFunction = () => {
      console.log('Confirmed!');
      // 여기에 확인 버튼을 눌렀을 때 실행하고자 하는 함수를 넣으면 됩니다.
    };

    dispatch(openModal({ content, callback: callbackFunction, modalType: type }));
  };

  const handleOpenAlert = (type: number) => {
    const content = (
      <div>
        <p>Are you sure you want to confirm?</p>
      </div>
    );

    dispatch(openAlert({ content, alertType: type }));
  };
  return (
    <div>
      {/* <Button onClick={() => handleOpenModal(1)}>Open Modal1</Button>
      <Button onClick={() => handleOpenModal(2)}>Open Modal2</Button>
      <Button onClick={() => handleOpenAlert(3)}>Open Alert</Button> */}
      <ButtonComponent piil={true} color={'gray'} icon={{ direction: 'right', Icon: HiOutlineArrowRight }} />
      <ButtonComponent tooltip='qwe'/>
    </div>
  );
};

export default Modal;
