import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function usersCheck() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user;
}


export async function studentTrueCheck() {

  const user = await usersCheck()

  const supabase = createServerComponentClient({ cookies })

  // check if logged in
  if (!user) {
    return
  }

  // check if teacher logged in
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('type, profile_id').eq('profile_id', `${user?.id}`).eq('type', 'Student')
  if (profiles) {
    return true
  } else {
    return false
  }

}

export async function adminCheck() {

  const user = await usersCheck()

  const supabase = createServerComponentClient({ cookies })

  // check if logged in
  if (!user) {
    return
  }

  // check if teacher logged in
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('type, profile_id').eq('profile_id', `${user?.id}`).eq('type', 'Admin')
  if (profiles) {
    return true
  } else {
    return false
  }

}

export async function teacherCheck() {

  const user = await usersCheck()

  const supabase = createServerComponentClient({ cookies })

  // check if logged in
  if (!user) {
    return
  }

  // check if teacher logged in
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('type, profile_id').eq('profile_id', `${user?.id}`).eq('type', 'Teacher')
  if (profiles) {
    return true
  } else {
    return false
  }

}

export async function profileCheck() {

      // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })

    // get the users sessions
    const { data: { user } } = await supabase.auth.getUser()

    // check if user is logged in and redirect to page if they are not
    if (!user) {
        redirect("/")
    }

    // check if profile exists in DB
    const { data: profile, error: profileError } = await supabase
        .from('profilestable')
        .select('*')
        .eq('profileid', user.id)

        if (profile) {
          return profile[0].profileid as string;
      }
      return ""; 
}

export async function studentCheck() {
  const supabase = createServerComponentClient({ cookies })

  const profile = await profileCheck();

  const { data: student, error: studentError } = await supabase
  .from('studenttable')
  .select('*')
  .eq('profileid', profile)

  if (student) {
    return student[0].profileid as string;
}
return "";
}

