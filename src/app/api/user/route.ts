import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const role_id = parseInt(formData.get('role_id') as string);

        const supabase = await createClient();
        const { error } = await supabase.from('users').insert([{
            username,
            email,
            role_id,
        }]);

        if (error) {
            console.log("Database error: ", error);
            return NextResponse.json({ error: "Failed to add user" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal server err' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { username } = await request.json();
        const supabase = await createClient();
        const { error } = await supabase.from('users').delete().eq("username", username);

        if (error) {
            console.log('error', error);
            return NextResponse.json({ error: 'Failed to delete User' }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { username, email, role_id, originalUsername } = await request.json();

        const supabase = await createClient();
        const { error } = await supabase
            .from('users')
            .update({
                username,
                email,
                role_id
            })
            .eq('username', originalUsername);

        if (error) {
            console.log(error);
            return NextResponse.json({ error: "Failed to edit user" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server err" }, { status: 500 });
    }
}