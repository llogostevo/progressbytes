import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import GradeActivity from "../dashboardComponents/GradeActivity"
import LastLogin from "../dashboardComponents/LastLogin"
import LastActivity from "../dashboardComponents/LastActivity"
import PLC from "../dashboardComponents/PLC"
import SchoolClasses from "../dashboardComponents/SchoolClasses"

interface StudentTable {
    firstname: string;
    lastname: string;
    studentid: number;
}

interface SchoolClassEnrollment {
    studentid: number;
    classid: string;
    studenttable: StudentTable;
}

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

    const schoolId = profile[0].schoolid

    let { data: studenttable, error: studenttableerror } = await supabase
        .from('profilestable')
        .select(`
                profileid, 
                studenttable(
                profileid,
                studentid,
                firstname, 
                lastname,
                schoolid
                )
                `)
        .eq('studenttable.schoolid', schoolId)
        
    let schoolStudentIds
    if (studenttable) {
        schoolStudentIds = studenttable?.flatMap(profile => profile.studenttable.map(student => student.studentid)) || [];
    } else {
        console.log(studenttableerror)
        schoolStudentIds = []
    }


    let { data: schoolClassEnrollments, error } = await supabase
        .from('enrollmenttable')
        .select(`
                studentid, 
                classid,
                studenttable(studentid, firstname, lastname) 
                `)
        .eq('offroll', false)
        .in('studentid', schoolStudentIds)


    return (
        <div>
            <h1 className="text-6xl font-semibold">Overall Dashboard Data</h1>
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
                        <LastActivity />
                        <div> Last Updated PLC</div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <PLC />
                </div>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    
                    {/* @ts-ignore */}
                    <SchoolClasses schoolClasses={schoolClassEnrollments || []} />
                </div>


            </div>


        </div>

    )
}

export default TeacherDashboardPage;
