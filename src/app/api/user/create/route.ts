import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const username = formData.get('username') as string
    const email = formData.get('email') as string
    const role_id = parseInt(formData.get('role_id') as string)

    const supabase = await createClient();
    
    const { error } = await supabase
      .from('users')
      .insert([{
        username,
        email,
        role_id,
      }]);

    if (error) {
      console.log("Database error: ", error);
      return NextResponse.json({ error: "Failed to add user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
