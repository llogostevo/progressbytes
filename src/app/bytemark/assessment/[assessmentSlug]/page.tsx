import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
/*

amins data update

*/
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

export default async function AddAssessmentQuestions({ params }: { params: { assessmentSlug: string } }) {


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

    // if not at the correct role then redirect to the unauthorised page
    if (!profile) {
        redirect("/unauthorised")
    }

    const decodedSlug = decodeURIComponent(params.assessmentSlug)

    const { data: assessmentData, error: assessmentDataError } = await supabase
        .from('assessmenttable')
        .select(`
            assessmentid,
            assessmentdate, 
            assessmentname, 
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
                    studenttable(studentid, firstname, lastname)
                )
            )
        `).eq('assessmentid', decodedSlug)

    if (assessmentDataError) {
        console.log(assessmentDataError)
    }

    // @ts-ignore
    const assessment: Assessment = assessmentData[0];

    const uniqueStudentsMap = new Map<number, StudentEntry>();


    assessment.questiontable.forEach(question => {
        question.answertable.forEach(answer => {
            uniqueStudentsMap.set(answer.studenttable.studentid, {
                id: answer.studenttable.studentid,
                name: `${answer.studenttable.firstname} ${answer.studenttable.lastname}`
            });
        });
    });

    const studentsArray = Array.from(uniqueStudentsMap.values());
    // Sort studentsArray by last name
    studentsArray.sort((a, b) => a.name.split(" ")[1].localeCompare(b.name.split(" ")[1]));

    // Calculate Max Possible Marks
    const maxMarks = assessment.questiontable.reduce((acc, question) => acc + question.noofmarks, 0);

    // Calculate Total Marks for each student
    const studentTotalMarks: Record<string, number> = {};

    studentsArray.forEach(student => {
        studentTotalMarks[student.id] = assessment.questiontable.reduce((acc, question) => {
            const studentAnswer = question.answertable.find(ans => ans.studenttable.studentid === student.id);
            return acc + (studentAnswer ? studentAnswer.mark : 0);
        }, 0);
    });

    // Calculate Percentage for each student
    const studentPercentages: Record<number, string> = {};
    for (let id in studentTotalMarks) {
        // @ts-ignore
        studentPercentages[id] = `${((studentTotalMarks[id] / maxMarks) * 100).toFixed(2)}%`;
    }
    return (
        <div className="container mx-auto overflow-x-auto">
            <h1 className="text-2xl font-bold mb-4">{assessment.assessmentname}</h1>
            <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-800 text-center text-white">
                    <tr>
                        <th className="w-1/15 px-2 py-1">Order</th>
                        <th className="w-1/15 px-2 py-1">Label</th>
                        <th className="w-1/15 px-2 py-1">Max Mark</th>
                        <th className="w-1/30 truncate px-2 py-1">Topic</th>
                        <th className="w-1/30 truncate px-2 py-1">Subtopic</th>
                        {studentsArray.map(student => (
                            <th key={student.id} className="w-1/15 truncate px-2 py-1" title={student.name}>{extractInitials(student.name)}</th>
                        ))}
                        <th className="w-1/30 truncate px-2 py-1">Edit</th>

                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {assessment.questiontable.map(question => (
                        <tr key={question.questionid}>
                            <td className="border px-2 py-1 text-center">{question.questionorder}</td>
                            <td className="border px-2 py-1 text-center">{question.questionnumber}</td>
                            <td className="border px-2 py-1 text-center">{question.noofmarks}</td>
                            <td title={question.questionsubtopictable[0].subtopictable.topictable.unittable.unitnumber + " " + question.questionsubtopictable[0].subtopictable.topictable.topictitle} className="border px-2 py-1 truncate">
                                {
                                    (question.questionsubtopictable[0].subtopictable.topictable.unittable.unitnumber + " " + question.questionsubtopictable[0].subtopictable.topictable.topictitle).length > 10
                                        ? (question.questionsubtopictable[0].subtopictable.topictable.unittable.unitnumber + " " + question.questionsubtopictable[0].subtopictable.topictable.topictitle).substring(0, 10) + "..."
                                        : question.questionsubtopictable[0].subtopictable.topictable.unittable.unitnumber + " " + question.questionsubtopictable[0].subtopictable.topictable.topictitle
                                }
                            </td>
                            <td title={question.questionsubtopictable[0].subtopictable.subtopictitle} className="border px-2 py-1 truncate">
                                {
                                    question.questionsubtopictable[0].subtopictable.subtopictitle.length > 10
                                        ? question.questionsubtopictable[0].subtopictable.subtopictitle.substring(0, 10) + "..."
                                        : question.questionsubtopictable[0].subtopictable.subtopictitle
                                }
                            </td>
                        
                            {/* use percentages to calculate the colours */}
                            {studentsArray.map(student => {
                                const studentAnswer = question.answertable.find(ans => ans.studenttable.studentid === student.id);
                                const percentage = studentAnswer ? Math.round((studentAnswer.mark / question.noofmarks) * 100) : 0;
                                const bgColor = percentage >= 90 ? 'bg-green-700' :
                                    percentage >= 75 ? 'bg-green-500' :
                                        percentage >= 65 ? 'bg-green-200' :
                                            percentage >= 55 ? 'bg-yellow-400' :
                                                percentage >= 45 ? 'bg-orange-300' :
                                                    percentage < 45 && percentage >= 35 ? 'bg-orange-500' :
                                                        'bg-red-500';
                                return (
                                    <td
                                        key={student.id}
                                        title={`${percentage}% - ${question.questionsubtopictable[0].subtopictable.subtopictitle}`}
                                        className={`border px-2 py-1 text-center ${bgColor}`}>
                                        {studentAnswer ? studentAnswer.mark : '-'}
                                    </td>
                                );
                            })}
                            <td title="Edit Question" className="border px-2 py-1 font-bold text-center hover:cursor-pointer hover:bg-primaryColor bg-white">
                            <Link href={`${assessment.assessmentid}/assessmentquestion/${question.questionid}`}>📝</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
                {/* Summary Section */}
                <tbody className="text-gray-700 bg-gray-200">
                    <tr>
                        <td className="border px-2 py-1 text-right font-bold" colSpan={5}>Total Marks</td>
                        {studentsArray.map(student => (
                            <td key={student.id} className="border px-2 py-1 text-center">{studentTotalMarks[student.id]}</td>
                        ))}
                        <td title="Add new question" className="border px-2 py-1 font-bold text-center hover:cursor-pointer text-xl text-mutedText hover:text-primaryColor  bg-white">+</td>
                    </tr>
                    <tr>
                        <td className="border px-2 py-1 text-right font-bold" colSpan={5}>Max Possible Marks</td>
                        {studentsArray.map(student => (
                            <td key={student.id} className="border px-2 py-1 text-center">{maxMarks}</td>
                        ))}
                    </tr>
                    <tr>
                        <td className="border px-2 py-1 text-right font-bold" colSpan={5}>Percentage</td>
                        {studentsArray.map(student => (
                            <td key={student.id} className="border px-2 py-1 text-center">{studentPercentages[student.id]}</td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>


    )
}
