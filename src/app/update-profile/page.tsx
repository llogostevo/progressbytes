import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"
import UpdateProfileDetails from "@/app/update-profile/UpdateProfileDetails"

export default async function UpdateProfile() {
    // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })

    // get the users sessions
    const { data: { user } } = await supabase.auth.getUser()

    // check if user is logged in and redirect to page if they are
    if (!user) {
        redirect("/")
    }
  return (
    <>
    {user && (
        <div>
            <UpdateProfileDetails />
        </div>
    )}

    {!user && (
        <div>
             <Link className="hover:underline" href="/login">Please login to see the form.</Link> 
        </div>
    )}
</>
  )
}
