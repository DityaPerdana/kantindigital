export interface Order {
  orderid: number
  quantity: number
  message: string
  orderedat: string
  menu_id: number
  user_id: string
  status_id: number
  // Relations
  menu?: Menu
  user?: User
  status?: Status
}

export interface Menu {
  menuid: number
  menuname: string
  stok: number
  price: number
  category_id: number
  image_url: string
}

export interface User {
  userid: string
  username: string
  email: string
  role_id: number
}

export interface Status {
  statusid: number
  statusname: string
}

export interface Role {
  roleid: number
  rolename: string
}