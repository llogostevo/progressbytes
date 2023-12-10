import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const LearningchecklistStaffPage = async () => {
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

    // check if profile exists in DB, if not redirect to unauthorised
    // if not at the correct role i.e. admin then redirect to the unauthorised page
    if (!profile) {
        redirect("/unauthorised")
    } else if (profile[0].profiletype == "Student") {
        redirect(`./learningchecklist/student/`)
    } else if (profile[0].profiletype == "Teacher") {
        redirect(`./learningchecklist/staff/classes/${profile[0].schoolid}`)
    } else if (profile[0].profiletype == "Admin") {
        redirect("/admin")
    } else {
        redirect("/unauthorised")
    }

    return (
        <div>Loading...</div>
    )
}

export default LearningchecklistStaffPage;