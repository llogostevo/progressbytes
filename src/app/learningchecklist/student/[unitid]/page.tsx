import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LearningChecklist from './LearningChecklist'

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


export default async function UnitChecklist({ params }: { params: { unitid: number } }) {
    // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })

    const confidenceLevels = ["Needs Significant Study",
        "Requires Revision",
        "Almost Secure",
        "Fully Secure"];

    const confidenceLevelColors: ConfidenceLevelColors = {
        "Needs Significant Study": "bg-red-300",
        "Requires Revision": "bg-yellow-300",
        "Almost Secure": "bg-green-200",
        "Fully Secure": "bg-green-500"
    };


    // get the users sessions
    const { data: { user } } = await supabase.auth.getUser()

    // check if user is logged in and redirect to page if they are not
    if (!user) {
        redirect("./login")
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

    if ((profilesData && profilesData.length > 0) && profilesData[0].studenttable[0].studentid) {
        studentId = profilesData[0].studenttable[0].studentid;
    } else {
        console.log("No matching student record found");
        redirect("./login")
    }

    // check if student profile exists in DB, if not redirect to unauthorised
    // if not at the correct role then redirect to the unauthorised page
    if (!profilesData) {
        redirect("/unauthorised")
    }

    const { data: courses } = await supabase
        .from('unittable')
        .select('*')
        .eq('unitid', params.unitid)


    let courseId: string;
    let unitTitle: string;
    let unitNumber: string;

    if (courses && courses.length > 0) {
        courseId = courses[0].courseid;
        unitTitle = courses[0].unittitle;
        unitNumber = courses[0].unitnumber;

    } else {
        redirect("/learningchecklist")
    }


    const { data: enrollments } = await supabase
        .from('enrollmenttable')
        .select('courseid')
        .eq('courseid', courseId)
        .eq('studentid', studentId)
        .eq('offroll', false);

    if (!(enrollments && enrollments.length > 0)) {
        console.log("Student not enrolled");
        redirect("/learningchecklist")
    }

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
            <div className="space-y-6">
                <h1 className="text-4xl mb-4 font-semibold">Personalised Learning</h1>

                <LearningChecklist
                    topics={topics as Topic[]}
                    unitTitle={unitTitle }
                    unitNumber={unitNumber}
                    unitId={params.unitid}
                    studentId={studentId}
                    confidenceLevelColors={confidenceLevelColors}
                    confidenceLevels={confidenceLevels}
                />
            </div>
        </>
    )
}
