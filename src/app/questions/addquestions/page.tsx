import QuestionForm from "@/components/QuestionForm"
import { usersCheck } from "@/lib/users";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";


export const dynamic = 'force-dynamic'

export default async function addquestions() {
     // Create a Supabase client configured to use cookies
     const supabase = createServerComponentClient({ cookies })

     // get the users sessions
     const { data: {user}} = await supabase.auth.getUser()
     
     // check if user is logged in and redirect to page if they are
     if (!user){
         redirect("/")
     }
 
    //  THIS ALLOWS YOU TO CHECK ROLE OF USER BEFORE THEY ACCESS THE BELOW!
     // check the user role
     const { data: profiles, error: profileError } = await supabase
         .from('profiles')
         .select('*')
         .eq('profile_id', user.id )
         .eq('role', "Student")
         .single()

         console.log(profileError)
         
    console.log(profiles)
     
         // if not at the correct role then redirect to the unauthorised page
     if (!profiles){
         redirect("/unauthorised")
     }


    return (
        <>
            {user && (
                <div>
                    <QuestionForm />
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