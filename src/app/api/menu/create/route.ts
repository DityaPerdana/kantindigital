import { createClient } from "@/utils/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const menuname = formData.get('menuname') as string
    const stok = parseInt(formData.get('stok') as string)
    const price = parseFloat(formData.get('price') as string)
    const category_id = parseInt(formData.get('category_id') as string)
    const image_url = formData.get('image_url') as string

    const supabase = await createClient()
    
    const { error } = await supabase
      .from('menu')
      .insert([{
        menuname,
        stok,
        price,
        category_id,
        image_url
      }])

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}