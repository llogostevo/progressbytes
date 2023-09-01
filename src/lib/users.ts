import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";


export async function usersCheck() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user;
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