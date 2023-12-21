import * as cookiesNext from 'cookies-next'
import { cookies } from 'next/headers';
// const handleSetCookie = () => setCookie('client-cookie', 'mock client value')

export const getCookie = (name: string) => cookiesNext.getCookie(name, { cookies })
export const hasCookie = (name: string) => cookiesNext.hasCookie(name, { cookies })
export const deleteCookie = (name: string) => cookiesNext.deleteCookie(name, { cookies })
export const setCookie = (name: string, value: string) => cookiesNext.setCookie(name, value, { cookies })