import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Assessments from "./Assessments";


export default async function ByteMarkStudent() {


    // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })

    // get the users sessions
    const { data: { user } } = await supabase.auth.getUser()

    // check if user is logged in and redirect to page if they are not
    if (!user) {
        redirect("/")
    }

    // FIND OUT THE STUDENT ID OF THE LOGGED IN PROFILE
    const { data: profilesData, error: profilesDataError } = await supabase
        .from('profilestable')
        .select(`
            profileid, 
            studenttable(
                profileid,
                studentid
                ), 
            teachertable(
                profileid,
                teacherid
                    )
        `)
        .eq('profileid', user.id);

    let studentId: number;
    let teacherId: number;

    console.log(profilesData)

    if (profilesData && profilesData.length > 0
        && profilesData[0].studenttable
        && profilesData[0].studenttable.length > 0
        && profilesData[0].studenttable[0].studentid) {
        studentId = profilesData[0].studenttable[0].studentid;
        // console.log("Student ID for logged in user:", studentId);
    } else if (profilesData && profilesData.length > 0
        && profilesData[0].teachertable
        && profilesData[0].teachertable.length > 0
        && profilesData[0].teachertable[0].teacherid) {
        teacherId = profilesData[0].teachertable[0].teacherid;
        console.log("Teacer ID for logged in user:", teacherId);
        redirect("../staff/assessment/")
    } else {
        // console.log("No matching student record found");
        redirect("/")
    }

    // check if student profile exists in DB, if not redirect to unauthorised
    // if not at the correct role then redirect to the unauthorised page
    if (!profilesData) {
        redirect("/unauthorised")
    }

    // 1. Fetch assessments created by the logged-in user
    const { data: createdByUser, error: createdByError } = await supabase
        .from('assessmenttable')
        .select('assessmentid')
        .eq('created_by', user.id);


    // 2. Fetch assessments that are associated with student's answers 
    // but are not created by the logged-in user
    const { data: answeredByStudent, error: answeredByError } = await supabase
        .from('assessmenttable')
        .select('assessmentid')
        .not('created_by', 'eq', user.id) // not created by the user
        .in('questiontable.answertable.studentid', [studentId]);  // but have answers by the student

    // // Handle any errors
    // if (answeredByError) {
    //     console.error('Error fetching assessments answered by student:', answeredByError);
    //     // Handle error
    // }

    // Combine and deduplicate ids
    const combinedIds = Array.from(new Set([
        ...(createdByUser?.map(a => a.assessmentid) || []),
        ...(answeredByStudent?.map(a => a.assessmentid) || [])
    ]));

    // Fetch all the relevant assessment details using the combined IDs
    const { data: assessments, error: assessmentError } = await supabase
        .from('assessmenttable')
        .select(`
        assessmentid,
        assessmentdate, 
        assessmentname,
        assessmenttype,
        created_by, 
        questiontable (
            questionid, 
            assessmentid,
            answertable (
                answerid, 
                questionid,
                studentid
            )
        )
    `)
        .in('assessmentid', combinedIds)
        .order('assessmentdate', { ascending: false });

    // // Handle any errors
    // if (assessmentError) {
    //     console.error('Error fetching assessments:', assessmentError);
    //     // Handle error
    // }


    // if (assessmentError) {
    //     console.error('Error:', assessmentError);
    // }

    return (
        <>
            <Assessments
                // @ts-ignore
                studentAssessment={assessments}
                user={user}
            />
        </>
    );
}