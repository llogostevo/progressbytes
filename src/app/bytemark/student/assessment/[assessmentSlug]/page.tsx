import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import AddQuestionMark from "./AddQuestionMark";
import { getAlevelGrade, getGCSEGrade } from "@/lib/gradeBoundaries";

// Type Definitions
interface Student {
    studentid: number;
    firstname: string;
    lastname: string;
}

interface Answer {
    answerid: number;
    questionid: number;
    studentid: number;
    mark: number;
    studenttable: Student;
}

interface Unit {
    unittitle: string;
    unitnumber: number;
    unitid: number;
}

interface Topic {
    topictitle: string;
    topicid: number;
    unittable: Unit;
}

interface Subtopic {
    subtopictitle: string;
    subtopicid: number;
    topictable: Topic;
}

interface QuestionSubtopicLink {
    subtopictable: Subtopic;
}

interface Question {
    questionid: number;
    assessmentid: string;
    questionnumber: string;
    questionorder: number;
    noofmarks: number;
    questionsubtopictable: QuestionSubtopicLink[];  // Since it's an array of objects
    answertable: Answer[];
}

interface Assessment {
    assessmentid: string;
    assessmentdate: string;
    assessmentname: string;
    assessmenttype: string;
    questiontable: Question[];
}

interface StudentEntry {
    id: number;
    name: string;
}


function extractInitials(name: string): string {
    const splitName = name.split(' ');
    return splitName.map(n => n.charAt(0)).join('');
}

export const dynamic = 'force-dynamic'

export default async function StudentAssessmentView({ params }: { params: { assessmentSlug: string } }) {
    const supabase = createServerComponentClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id;

    if (!user) {
        redirect("/")
    }

    const decodedSlug = decodeURIComponent(params.assessmentSlug)

    // FIND OUT THE STUDENT ID OF THE LOGGED IN PROFILE
    const { data: profilesData, error: profilesDataError } = await supabase
        .from('profilestable')
        .select(`
            profileid, 
            studenttable(
                profileid,
                studentid, 
                assessmentedit
                )
        `)
        .eq('profileid', userId);

    let studentId: number;

    if ((profilesData && profilesData.length > 0) && profilesData[0].studenttable[0].studentid) {
        studentId = profilesData[0].studenttable[0].studentid;
        // console.log("Student ID for logged in user:", studentId);
    } else {
        console.log("No matching student record found");
        redirect("/")
    }

    const { data: assessmentData, error: assessmentDataError } = await supabase
        .from('assessmenttable')
        .select(`
    assessmentid,
    assessmentdate, 
    assessmentname,
    assessmenttype, 
    questiontable (
        questionid, 
        assessmentid, 
        questionnumber, 
        questionorder, 
        noofmarks,
        questionsubtopictable (
            subtopictable (
                subtopictitle, 
                subtopicid,
                topictable (
                    topictitle,
                    topicid,
                    unittable (
                        unittitle, 
                        unitnumber, 
                        unitid
                    )
                )
            )
            ),
            answertable (
                answerid, 
                questionid, 
                studentid, 
                mark,
                studenttable (
                    studentid, 
                    firstname, 
                    lastname,
                    assessmentedit,
                    profilestable(
                        profileid
                    )
                )
            )
        )
    )
`)
        .eq('assessmentid', decodedSlug)
    // .eq('answertable.studenttable.profiletable.profileid', `${userId}`);

    // Handle the error
    if (assessmentDataError) {
        console.log(assessmentDataError)
    }

    if (!assessmentData) {
        return (
            <div>
                <p>No Assessment Found for this user</p>
            </div>
        )
    }

    // @ts-ignore
    const assessment: Assessment = assessmentData[0];

    console.log(assessment)

    const maxMarks = assessment.questiontable.reduce((acc, question) => acc + question.noofmarks, 0);
    const studentsProfileIDs = assessment.questiontable
    // Calculate the student's total marks
    const studentTotalMarks = assessment.questiontable.reduce((acc, question) => {
        const studentAnswer = question.answertable.find(ans => ans.studentid === studentId);
        return acc + (studentAnswer ? studentAnswer.mark : 0);
    }, 0);

    // Calculate Percentage for the student
    const studentRawPercentage = ((studentTotalMarks / maxMarks) * 100).toFixed(2);
    const studentPercentage = `${studentRawPercentage}%`;

    const gcseGrade = getGCSEGrade(Number(studentRawPercentage))
    const aLevelGrade = getAlevelGrade(Number(studentRawPercentage))

    // check if this is an assessment component and whether it should be hidden from edits. 
    const hideComponents = assessmentData && assessmentData.length > 0 &&
        assessment.assessmenttype === 'Assessment' &&
        profilesData[0].studenttable[0].assessmentedit == false

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{assessment.assessmentname}</h1>

            <div className="bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300">
                <div className="my-4">
                    <span className="font-bold">Total Marks: </span>{studentTotalMarks}
                </div>
                <div className="my-4">
                    <span className="font-bold">Max Possible Marks: </span>{maxMarks}
                </div>
                <div className="my-4">
                    <span className="font-bold">Percentage: </span>{studentPercentage}
                </div>
                <div className="my-4">
                    <span className="font-bold">GCSE Grade Equivalent: </span>{gcseGrade}
                </div>
                <div className="my-4">
                    <span className="font-bold">A level Grade Equivalent: </span>{aLevelGrade}
                </div>
            </div>
            {!hideComponents && (
                <div className="bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300">
                    <AddQuestionMark slug={assessment.assessmentid} studentId={studentId} />
                </div>
            )}

            <h2 className="text-xl font-semibold mt-8 mb-4">Your Questions</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border-collapse text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border px-2 py-1 font-bold">Order Number</th>
                            <th className="border px-2 py-1 font-bold">Topic</th>
                            <th className="border px-2 py-1 font-bold">Question</th>
                            <th className="border px-2 py-1 font-bold">Mark</th>
                            <th className="border px-2 py-1 font-bold">Total Marks</th>
                            <th className="border px-2 py-1 font-bold">Percentage</th>
                            <th className="border px-2 py-1 font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assessment.questiontable.sort((a, b) => a.questionorder - b.questionorder).map(question => {
                            let studentAnswerMark = question.answertable.find(ans => ans.studentid === studentId)?.mark;
                            if (studentAnswerMark === undefined || studentAnswerMark === null) {
                                studentAnswerMark = NaN;
                            } const maxMarks = question.noofmarks;
                            const percentage = ((studentAnswerMark / maxMarks) * 100).toFixed(2);
                            const topicTitle = question.questionsubtopictable[0].subtopictable?.subtopictitle;
                            return (
                                <tr key={question.questionid}>
                                    <td className="border px-2 py-1">{question.questionorder}</td>
                                    <td className="border px-2 py-1">{topicTitle}</td>
                                    <td className="border px-2 py-1">{question.questionnumber}</td>
                                    <td className="border px-2 py-1">{studentAnswerMark}</td>
                                    <td className="border px-2 py-1">{maxMarks}</td>
                                    <td className="border px-2 py-1">{percentage}% <div className="mt-1">Grade:{getGCSEGrade(Number(percentage))}/{getAlevelGrade(Number(percentage))}</div></td>
                                    {!hideComponents && (
                                        <td className="border px-2 py-1">
                                            <Link href={`${assessment.assessmentid}/editassessmentquestion/${question.questionid}`}>
                                                Edit Marks
                                            </Link>
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    )
}