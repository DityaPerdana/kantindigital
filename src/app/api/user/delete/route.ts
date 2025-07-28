import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userid } = await request.json()
    
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq("userid", userid)

    if (error) {
      console.log('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
