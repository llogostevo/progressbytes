import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Assessments from "./Assessments";
import React from 'react';


interface AnswerEntry {
    questionid: number;
    studentid: number;
}

export default async function ClassAssessments({ params }: { params: { classAssessmentSlug: string } }) {

    const classId = decodeURIComponent(params.classAssessmentSlug);

    // Create a Supabase client configured to use cookies
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
    if (!profile || profile[0].admin == false) {
        redirect("/unauthorised")
    }

    const { data: classStudents, error: classStudentsError } = await supabase
        .from('classtable')
        .select(`
            classid,
            enrollmenttable (
                classid, studentid
            )
        `)
        .eq('classid', classId)

    if (classStudentsError) {
        console.error(classStudentsError);
        // Handle the error appropriately
    }

    // Assuming classStudents is an array of objects, each with an enrollmenttable array
    let uniqueStudentIds = new Set<number>(); // or new Set<string>() if your IDs are strings

    classStudents?.forEach(classItem => {
        if (classItem.enrollmenttable && Array.isArray(classItem.enrollmenttable)) {
            classItem.enrollmenttable.forEach(enrollment => {
                if (enrollment.studentid) {
                    uniqueStudentIds.add(enrollment.studentid);
                }
            });
        }
    });


    // Convert the Set to an array if necessary
    const uniqueStudentIdsArray = Array.from(uniqueStudentIds);
    console.log(uniqueStudentIds)

    const { data: answerEntries, error: answerError } = await supabase
        .from('answertable')
        .select('questionid, studentid')
        .in('studentid', uniqueStudentIdsArray);

    let uniqueQuestionIds = new Set<number>(); // Adjust the type to match your IDs

    answerEntries?.forEach(answer => {
        uniqueQuestionIds.add(answer.questionid);
    });

    const uniqueQuestionIdsArray = Array.from(uniqueQuestionIds);
    console.log('uniqueQuestions:', uniqueQuestionIdsArray);


    // Fetch all the relevant assessment details using the combined IDs
    const { data: questions, error: questionerror } = await supabase
        .from('questiontable')
        .select(`
            questionid, 
            assessmentid
        `)
        .in('questionid', uniqueQuestionIdsArray);


    let assessmentIds = new Set<number>(); // Adjust the type to match your IDs

    questions?.forEach(question => {
        assessmentIds.add(question.assessmentid);
    });

    const uniqueAssessmentIds = Array.from(assessmentIds);
    console.log("Assessment ID", uniqueAssessmentIds)

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
            assessmentid
        )
    `)
        .in('assessmentid', uniqueAssessmentIds)
        .order('assessmentdate', { ascending: false })


   
    return (
        <>
            <Assessments
                // @ts-ignore
                studentAssessment={assessments}
                classId={classId}
            />
        </>
    );
}