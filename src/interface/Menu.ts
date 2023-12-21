export default interface Menu {
    menuId: number
    menuNm: string
    menuUrl: string
    upperMenuId: number
    menuLevel: number
    menuIcon: string
    snbYn: string
    sortOrder: number
    loginYn: string
    deleteYn: string
    childYn?: string
}