import { createClient } from "@/utils/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const id = parseInt(formData.get('id') as string)
    const menuname = formData.get('menuname') as string
    const stok = parseInt(formData.get('stok') as string)
    const priceInput = formData.get('price') as string
    const category_id = parseInt(formData.get('category_id') as string)
    const image_url = formData.get('image_url') as string

    const price = parseFloat(priceInput)
    
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Invalid price value' }, { status: 400 })
    }
    
    if (price > 99999.99) {
      return NextResponse.json({ error: 'Price cannot exceed Rp 99,999.99' }, { status: 400 })
    }

    const formattedPrice = Math.round(price * 100) / 100

    const supabase = await createClient()
    
    const { error } = await supabase
      .from('menu')
      .update({
        menuname,
        stok,
        price: formattedPrice,
        category_id,
        image_url
      })
      .eq('menuid', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
