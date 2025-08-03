export interface Order {
  orderid: number
  message: string
  orderedat: string
  user_id: string
  status_id: number
  total_amount: number
  // Relations
  order_items?: OrderItem[]
  user?: User
  status?: Status
}

export interface OrderItem {
  order_id: number
  menu_id: number
  quantity: number
  price: number
  subtotal: number
  created_at: string
  // Relations
  menu?: Menu
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