import StreakTracker from "@/components/StreakTracker";
import { allUnitTopics } from "@/lib/database.queries";
import { UnitTopics } from "@/lib/database.types";
import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { notFound } from 'next/navigation'


export const dynamic = 'force-dynamic'

export default async function QuestionTopics({ params }: { params: { topics: string } }) {
    // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })

    // get the users sessions
    const { data: { user } } = await supabase.auth.getUser()

    // check if user is logged in and redirect to page if they are
    if (!user) {
        redirect("/")
    }

    const { data: questions_completed, error: questionsError } = await supabase
        .from('questions_completed')
        .select(`
      no_of_marks,
      marks_available,
      date_answered,
      assessed_by,
      topic_id: topics (  
        topic_id, 
        topic_name,
        unit_id: units (  
          unit_id,
          unit_name
        )
      ),
      student_id: profiles (
        profile_id,
        first_name,
        last_name
      )
    `);

    // Created a filter to pull out only the identified types in the db

    //@ts-ignore
    const filteredTopics = questions_completed?.filter(question => question.topic_id.topic_name === decodeURIComponent(params.topics));
   

    const { data: topics } = await supabase.from('topics').select(`topic_name`)

    const topicCategories = topics?.map((topic) => {
        return (topic.topic_name)
    })

    return (
        <div>
            <div>
                <h2 className="text-xl font-bold mb-4">Filter by Topic</h2>
                <div>
                    <div className="flex flex-wrap gap-4"> {/* Added flex-wrap for responsiveness */}
                        <div className="flex items-center">
                            <button className="px-2 py-1 text-xs bg-primaryColor hover:bg-secondaryColor text-white rounded">
                                <Link href={`/questions/`}><span>All</span></Link>
                            </button>
                        </div>
                        {topicCategories?.map((topic) => {
                            const truncatedTopic = topic.length > 10 ? topic.substring(0, 10) + "..." : topic; // Truncate topic if it's longer than 20 characters
                            const buttonColor = topic === decodeURIComponent(params.topics) ? 'bg-secondaryColor' : 'bg-primaryColor';

                            return (
                                <div key={topic} className="flex items-center">
                                    <button className={`px-2 py-1 text-xs ${buttonColor} hover:bg-secondaryColor text-white rounded`}>
                                        <Link href={`/questions/${topic}`}><span className="truncate max-w-[80px]">{`${truncatedTopic}`}</span></Link>
                                        {/* Added truncate and max-w-[80px] to truncate text */}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>


            <Link className="inline-block border mt-10 mb-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200" href={`/questions/addquestions`}>Add Question</Link>
            <div>
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold mb-4">Questions Completed</h1>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-800 text-white text-center ">
                                <tr>
                                    <th className="  w-1/6 px-4 py-2 bg-gray-800">Student</th>
                                    <th className="  w-1/6 px-4 py-2 bg-gray-800">Topic</th>
                                    <th className="  w-1/6 px-4 py-2 bg-gray-800">Date Answered</th>
                                    <th className="  w-1/6 px-4 py-2 bg-gray-800">Marks Available</th>
                                    <th className="  w-1/6 px-4 py-2 bg-gray-800">Number Of Marks</th>
                                    <th className="  w-1/6 px-4 py-2 bg-gray-800">Percent</th>
                                    <th className="  w-1/6 px-4 py-2 bg-gray-800">Assessed By</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {filteredTopics?.map((question, index) => (
                                    <tr key={index}>
                                        {/* @ts-ignore */}
                                        <td className="border px-4 py-2 text-center">{question.student_id.first_name} {question.student_id.last_name}</td>
                                        {/* @ts-ignore */}
                                        <td className="border px-4 py-2 text-center">{question.topic_id.topic_name}</td>
                                        <td className="border px-4 py-2 text-center">{question.date_answered}</td>
                                        <td className="border px-4 py-2 text-center">{question.no_of_marks}</td>
                                        <td className="border px-4 py-2 text-center">{question.marks_available}</td>
                                        <td className="border px-4 py-2 text-center">{`${Math.round((question.no_of_marks / question.marks_available) * 100)}`}</td>
                                        <td className="border px-4 py-2 text-center">{question.assessed_by}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>


    )
}