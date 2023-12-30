import StreakTracker from "@/components/StreakTracker";
import { allUnitTopics } from "@/lib/database.queries";
import { UnitTopics } from "@/lib/database.types";
import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic'

export default async function TeacherQuestions() {
    // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })

    // get the users sessions
    const { data: {user}} = await supabase.auth.getUser()
    
    // check if user is logged in and redirect to page if they are
    if (!user){
        redirect("/")
    }

    // CHANGE THIS WITH THE RLS AND POLICIES LATER
    // check the user role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_id', user.id )
        
    
        // if not at the correct role then redirect to the unauthorised page
    if (!profile){
        redirect("/unauthorised")
    }

    const { data: questions_completed, error: questionsError } = await supabase
        .from('questions_completed')
        .select('*')

    return (
        <div>
            <Link className="inline-block border mt-10 mb-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200" href={`/questions/addquestions`}>Add Question</Link>
            <div>
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold mb-4">Questions Completed</h1>
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="w-1/6 px-4 py-2 text-center">Student Name</th>
                                <th className="w-1/6 px-4 py-2 text-center">Number Of Marks</th>
                                <th className="w-1/6 px-4 py-2 text-center">Marks Available</th>
                                <th className="w-1/6 px-4 py-2 text-center">Date Answered</th>
                                <th className="w-1/6 px-4 py-2 text-center">Assessed By</th>
                                <th className="w-1/6 px-4 py-2 text-center">Student</th>
                                <th className="w-1/6 px-4 py-2 text-center">Topic</th>
                                <th className="w-1/6 px-4 py-2 text-center">Percent</th>

                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {questions_completed?.map((question, index) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2 text-center">{question.id}</td>
                                    <td className="border px-4 py-2 text-center">{question.no_of_marks}</td>
                                    <td className="border px-4 py-2 text-center">{question.marks_available}</td>
                                    <td className="border px-4 py-2 text-center">{question.date_answered}</td>
                                    <td className="border px-4 py-2 text-center">{question.assessed_by}</td>
                                    <td className="border px-4 py-2 text-center">{question.studentid}</td>
                                    <td className="border px-4 py-2 text-center">{question.topic_id}</td>
                                    <td className="border px-4 py-2 text-center">{`${Math.round((question.no_of_marks/question.marks_available)*100)}`}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>


    )
}