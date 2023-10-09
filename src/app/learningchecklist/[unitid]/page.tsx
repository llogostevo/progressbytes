import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import JudgmentComponent from './JudgementComponent'

export const dynamic = 'force-dynamic'

interface Judgment {
    subtopicid: number;
    studentid: number;
    judgment: string;
    id: number;
    created_at: Date;
    judgementdate: Date;

}

interface Subtopic {
    subtopicid: number;
    topicid: number;
    subtopicnumber: string;
    subtopictitle: string;
    subtopicdescription: string;
    created_at: Date;
    updated_at: Date;
    judgementtable?: Judgment[];
}

interface Topic {
    topicid: number;
    topicnumber: string;
    topictitle: string;
    subtopictable: Subtopic[];
    [key: string]: any;
}

interface ConfidenceLevelColors {
    [key: string]: string;
}





export default async function UnitChecklist({ params }: { params: { unitid: string } }) {
    // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })

    const confidenceLevels = ["Needs Significant Support",
        "Requires Some Assistance",
        "Almost Independent",
        "Fully Independent"];

    const confidenceLevelColors: ConfidenceLevelColors = {
        "Needs Significant Support": "bg-red-300",
        "Requires Some Assistance": "bg-yellow-300",
        "Almost Independent": "bg-green-200",
        "Fully Independent": "bg-green-500"
    };


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
            )
    `)
        .eq('profileid', user.id);

    let studentId: number;
    console.log(profilesData)

    if ((profilesData && profilesData.length > 0) && profilesData[0].studenttable[0].studentid) {
        studentId = profilesData[0].studenttable[0].studentid;
        // console.log("Student ID for logged in user:", studentId);
    } else {
        // console.log("No matching student record found");
        redirect("/")
    }

    // check if student profile exists in DB, if not redirect to unauthorised
    // if not at the correct role then redirect to the unauthorised page
    if (!profilesData) {
        redirect("/unauthorised")
    }

    const { data: unittopics, error } = await supabase
        .from('unittable')
        .select(`
        *,
        topictable:topictable ( 
            *,
            subtopictable:subtopictable (
                *,
                judgementtable:judgementtable (*)
            )
        )
    `)
        .eq('unitid', params.unitid);

    const { data: topics } = await supabase
        .from('topictable')
        .select(`*,
            subtopictable:subtopictable (
                *,
                judgementtable:judgementtable (*)
            )
    `)
        .eq('unitid', params.unitid);


    return (
        <>
            <div className="space-y-8">  {/* Adjust vertical space between each topic section */}
                {topics?.map((topic) => (
                    <section key={topic.topicid} className="space-y-4">  {/* Adjust vertical space between heading and table */}
                        <h2 className="text-2xl font-bold mb-2">  {/* Optionally, additional bottom margin from heading to table */}
                            {topic.topicnumber} - {topic.topictitle}
                        </h2>
                        <table className="min-w-full table-auto border border-gray-900">
                            <thead>
                                <tr className="bg-gray-400 text-black border border-gray-900">
                                    <th className="px-4 py-2 border-r border border-gray-900">Subtopic Number</th>
                                    <th className="px-4 py-2 border-r border border-gray-900">Subtopic Title</th>
                                    <th className="px-4 py-2 border-r border-gray-900">Judgment</th>
                                </tr>

                            </thead>
                            <tbody>
                                {topic.subtopictable.sort((a: Subtopic, b: Subtopic) => {
                                    if (!isNaN(Number(a.subtopicnumber)) && !isNaN(Number(b.subtopicnumber))) {
                                        return Number(a.subtopicnumber) - Number(b.subtopicnumber);
                                    }
                                    return a.subtopicnumber.localeCompare(b.subtopicnumber);
                                }).map((subtopic: Subtopic) => {
                                    // Get judgement THIS IS WHAT IS CAUSING THE ERROR
                                    const judgment: string = subtopic.judgementtable?.find(j => j.studentid === studentId)?.judgment ?? "";
                                    console.log("Retrieved judgment:", judgment);
                                    console.log("studentId:", studentId);

                                    const judgmentColor = confidenceLevelColors[judgment as keyof typeof confidenceLevelColors] || '';

                                    return (
                                        <tr key={subtopic.subtopicid} className={`${judgmentColor}`}>
                                            <td className="px-4 py-2 border-r border border-gray-900">{subtopic.subtopicnumber}</td>
                                            <td className="px-4 py-2 border-r border border-gray-900">{subtopic.subtopictitle}</td>
                                            <td className="px-4 py-2 border-r border border-gray-900">
                                                <JudgmentComponent
                                                    studentId={studentId}
                                                    subtopic={subtopic}
                                                    confidenceLevels={confidenceLevels}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}

                            </tbody>
                        </table>

                    </section>
                ))}
            </div>

        </>
    )
}
