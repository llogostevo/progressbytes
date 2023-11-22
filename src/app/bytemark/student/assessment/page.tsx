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
                studentid, 
                assessmentedit
                ), 
            teachertable(
                profileid,
                teacherid
                    )
        `)
        .eq('profileid', user.id);

    let studentId: number;
    let teacherId: number;


    if (profilesData && profilesData.length > 0
        && profilesData[0].studenttable
        && profilesData[0].studenttable.length > 0
        && profilesData[0].studenttable[0].studentid) {
        studentId = profilesData[0].studenttable[0].studentid;
    } else if (profilesData && profilesData.length > 0
        && profilesData[0].teachertable
        && profilesData[0].teachertable.length > 0
        && profilesData[0].teachertable[0].teacherid) {
        teacherId = profilesData[0].teachertable[0].teacherid;
        redirect("../staff/assessment/")
    } else {
        console.log("No matching student record found");
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



    const { data: answers, error: answersError } = await supabase
        .from('answertable')
        .select('questionid') // Select all fields or specify the fields you need
        .eq('studentid', studentId); // Filter to match the studentid

    if (answersError) {
        console.error('Error fetching answers:', answersError);
        // Handle the error accordingly
    }

    const questionIds = answers?.map(answer => answer.questionid);

    console.log("questionids", questionIds)

    const { data: questions, error: questionsError } = await supabase
        .from('questiontable')
        .select('assessmentid') // Select all fields or specify the fields you need
        .in('questionid', questionIds as any[]); // Filter to match the studentid


    const assessmentIds = questions?.map(question => question.assessmentid) ?? [];
    const createdByAssessmentIds = createdByUser?.map(assessment => assessment.assessmentid) ?? [];

    const combinedAssessmentIds = [...createdByAssessmentIds, ...assessmentIds]
        .filter((value, index, self) => self.indexOf(value) === index);

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
        .in('assessmentid', combinedAssessmentIds as any[])
        .order('assessmentdate', { ascending: false });

    // check if this is an assessment component and whether it should be hidden from edits. 
    const disableAssessment = (profilesData[0].studenttable[0].assessmentedit === false)

    return (
        <>
            <Assessments
                // @ts-ignore
                studentAssessment={assessments}
                user={user}
                disableAssessment={disableAssessment}
            />
        </>
    );
}