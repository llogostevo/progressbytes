import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
// import LastActivity from "../dashboardComponents/LastLogin"
import GradeActivity from "../dashboardComponents/GradeActivity"
import LastLogin from "../dashboardComponents/LastLogin"

const TeacherDashboardPage = async () => {

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
    } else if (profile[0].profiletype != "Teacher") {
        redirect("/dashboard")
    }

    return (
        <div>
            <h1 className = "text-6xl font-semibold">Teacher Dashboard</h1>
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                        <GradeActivity course="GCSE" />
                    </div>
                    <div className="flex-1">
                        <GradeActivity course="A level" />
                    </div>
                    <div className="mt-4">
                        <LastLogin />
                    </div>
                </div>

            </div>


            <div>Dashboard Card 1 - graph of grades GCSE Groups</div>
            <div>Dashboard Card 1 - graph of grades A level Groups</div>
            <div>Dashboard Card 2 - Classes TG Last Teacher Assessment Grade Avg Grade</div>
            <div>Dashboard Card 4 - Top 5 Topic List GCSE Avg / Bottom 5 Topic List GCSE Avg</div>
            <div>Dashboard Card 4 - Top 5 Topic List A level Avg / Bottom 5 Topic List A level Avg</div>



            <div>Dashboard Card 5</div>
            <div>Dashboard Card 6</div>




        </div>
    )
}

export default TeacherDashboardPage;