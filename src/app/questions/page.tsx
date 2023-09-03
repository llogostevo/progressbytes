import StreakTracker from "@/components/StreakTracker";
import { allUnitTopics } from "@/lib/database.queries";
import { UnitTopics } from "@/lib/database.types";
import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";

export const dynamic = 'force-dynamic'

export default async function Questions() {
    // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })

    const { data: questions_completed, error } = await supabase
        .from('questions_completed')
        .select('*')

    return (
        <div>
            <Link href={`/questions/addquestions`}>Add Question</Link>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>


    )
}