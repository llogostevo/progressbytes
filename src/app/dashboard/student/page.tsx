import StudentGradeActivity from "@/app/dashboard/dashboardComponents/StudentGradeActivity"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"


const StudentDashboardPage = async () => {
    const supabase = createServerComponentClient({ cookies })

    // get the users sessions
    const { data: { user } } = await supabase.auth.getUser()

    // check if user is logged in and redirect to page if they are not
    if (!user) {
        redirect("/")
    }

    // check if profile exists in DB
    const { data: profilesData, error: profilesDataError } = await supabase
        .from('profilestable')
        .select(`
    profileid, 
    studenttable(
        profileid,
        studentid,
        firstname, 
        lastname
        )
`)
        .eq('profileid', user.id);

    if (!profilesData) {
        redirect("/unauthorised")
    }
    let studentId: number;

    if ((profilesData && profilesData.length > 0) && profilesData[0].studenttable[0].studentid) {
        studentId = profilesData[0].studenttable[0].studentid;
    } else {
        console.log("No matching student record found");
        redirect("./login")
    }


    return (
        <>
            <h1 className="text-4xl mb-4 font-bold text-gray-800">{profilesData[0].studenttable[0].firstname} {profilesData[0].studenttable[0].lastname} - Dashboard</h1>
            <StudentGradeActivity studentId={studentId} />


            <div>PLC Confidence Levels Chart
                <div>Unit 1 PLC Chart</div>
                <div>Unit 2 PLC Chart</div>
            </div>
        </>
    )
}

export default StudentDashboardPage;