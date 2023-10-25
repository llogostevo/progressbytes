// src/api/createSchoolUser/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {

  const { userEmail, password, firstname, lastname, type, schoolid } = await req.json()

  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const service_role_key = process.env.SERVICE_ROLE_KEY as string

  const supabase = createClient(supabase_url, service_role_key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { data: user, error: userError } = await supabase.auth.admin.createUser({
    email: userEmail,
    password: password,
    user_metadata: {
      schoolid: schoolid,
      firstname: firstname,
      lastname: lastname,
      type: type
    },
    email_confirm: true
  })

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }
  // get the returned user so can access the id
  const newUser = user.user;
 
  // insert corresponding record into the profile table using values from the created user
  const { data: profileData, error: profileError } = await supabase
    .from('profilestable')
    .insert({
      profileid: newUser.id,
      email: userEmail,
      schoolid: schoolid,
      profiletype: 'student',
      admin: true,
    });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ user, profile: profileData });

}
