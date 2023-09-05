import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function Unauthenticated() {
    
    
    // create a supabase client
    const supabase = createServerComponentClient({cookies})
    // get the users sessions
    const { data: {user}} = await supabase.auth.getUser()
    
    // check if user is logged in and redirect to page if they are
    if (user){
        redirect("/questions")
    }

  return (
    <div>You must be logged in to view this page</div>
  )
}
