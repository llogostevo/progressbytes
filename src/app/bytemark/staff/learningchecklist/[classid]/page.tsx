import TooltipModalButton from '@/components/tooltipModal/TooltipModalButton';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Judgement {
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
    judgementtable?: Judgement[];
}

interface Topic {
    topicid: number;
    topicnumber: string;
    topictitle: string;
    subtopictable: Subtopic[];
    [key: string]: any;
}

interface Student {
    studentid: number;
    firstname: string;
    lastname: string;
    gcsetargetgrade: string | null;
    aleveltargetgrade: string | null;
}


interface Subtopic {
    subtopicid: number;
    // ... other fields
    subtopictitle: string;
}

interface Topic {
    unitid: number;
    topicid: number;
    topictitle: string;
    subtopictable: Subtopic[];
}

interface Unit {
    unitid: number;
    unitnumber: string;
    topics: Topic[];
}


interface ConfidenceLevelColors {
    [key: string]: string;
}

function getJudgement(studentId: number, subtopicId: number, judgements: Judgement[]): string {
    const judgement = judgements.find(j => j.studentid === studentId && j.subtopicid === subtopicId);
    return judgement ? judgement.judgment : 'No Judgment';
}

function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
}




export default async function classid({ params }: { params: { classid: string } }) {
    // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })
    const classId = decodeURIComponent(params.classid);
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

    // FIND OUT THE ID OF THE LOGGED IN PROFILE
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

    if (profilesData && profilesData.length > 0) {
        // check if student and redirect if they are to student learningchecklist page
        if ((profilesData[0].studenttable.length > 0) && (profilesData[0].studenttable[0].studentid)) {
            redirect("../../../learningchecklist")
        }
        // 
    } else {
        console.log("No matching record found");
        redirect("./login")
    }

    // if not at the correct role then redirect to the unauthorised page
    if (!profilesData) {
        redirect("/unauthorised")
    }

    // get all enrolled students from a class
    const { data: enrollments } = await supabase
        .from('enrollmenttable')
        .select('studentid, courseid')
        .eq('classid', classId)
        .eq('offroll', false);

    console.log(enrollments)

    const studentIds = enrollments?.map(student => student.studentid) || [];

    // return no students if none are enrolled
    if (!(enrollments && enrollments.length > 0)) {
        return <p>No Students Enrolled</p>
    }

    // get the courseid of the student, there is only one course for each student in a class. 
    const courseid = enrollments[0].courseid

    // get all the topics
    const { data: courses, error: courseserror } = await supabase
        .from('coursetable')
        .select(`courseid,
                unittable (
                    courseid, 
                    unitid, 
                    unitnumber
                    )
                `)
        .eq('courseid', courseid);

    const unitIds = courses?.[0].unittable.map(unit => unit.unitid) || [];

    // get all enrolled students from a class
    const { data: studentData } = await supabase
        .from('studenttable')
        .select('studentid, firstname, lastname, gcsetargetgrade, aleveltargetgrade')
        .in('studentid', studentIds);

    const students = studentData || [];


    const { data: topics } = await supabase
        .from('topictable')
        .select(`*,
            subtopictable:subtopictable (*)`)
        .in('unitid', unitIds)

    const { data: judgementData } = await supabase
        .from('judgementtable')
        .select(`*`)
        .in('studentid', studentIds)

    const judgements = judgementData || [];


    const unSortedUnitsWithTopics: Unit[] = courses?.[0].unittable.map(unit => ({
        ...unit,
        topics: topics?.filter(topic => topic.unitid === unit.unitid) || []
    })) || [];

    const sortedUnitsWithTopics = unSortedUnitsWithTopics.sort((a, b) => a.unitnumber.localeCompare(b.unitnumber));

    const unitsWithSortedTopics = sortedUnitsWithTopics.map(unit => ({
        ...unit,
        topics: unit.topics.sort((a, b) => a.topicnumber.localeCompare(b.topicnumber))
    }));

    const unitsWithTopics = unitsWithSortedTopics.map(unit => ({
        ...unit,
        topics: unit.topics.map(topic => ({
            ...topic,
            subtopictable: topic.subtopictable.sort((a, b) => a.subtopicnumber.localeCompare(b.subtopicnumber))
        }))
    }));


    return (
        <>
            <div className="block overflow-x-auto">

                <table className="m-0 md:ml-1 lg:ml-10 table-auto border border-gray-900 overflow-x-auto">
                    <thead className="sticky top-0 bg-gray-400 z-10">
                        <tr className="text-black border border-gray-900">
                            <th className="px-1 text-xs lg:px-4 py-2 border-r border border-gray-900" colSpan={2}>Units / Topics / Subtopics</th>
                            {students?.map(student => (
                                <th key={student.studentid} className="px-1 text-xs lg:px-4 py-2 border-r border border-gray-900" title={`${student.firstname} ${student.lastname}`}>
                                    {getInitials(student.firstname, student.lastname)}
                                </th>
                            ))}
                        </tr>
                    </thead>


                    <tbody>
                        {unitsWithTopics?.map(unit => (
                            <>
                                <tr className="border border-gray-900">
                                    <td colSpan={students.length + 2} className="bg-gray-200 px-1 text-xs lg:px-4 py-2 border-r border sticky left-0 border-gray-900 sm:text-sm">{unit.unitnumber}</td>
                                </tr>
                                {unit.topics?.map(topic => (
                                    <>
                                        <tr className="border border-gray-900">
                                            <td colSpan={students.length + 2} className=" bg-gray-100 px-1 text-xs lg:px-4 py-2 border-r border border-gray-900 sm:text-sm">{topic.topicnumber} {topic.topictitle}</td>
                                        </tr>
                                        {topic.subtopictable.map((subtopic, subtopicIndex) => (
                                            <tr key={subtopicIndex} className="border border-gray-900">
                                                <td className="px-1 text-xs lg:px-4 py-2 border-r border border-gray-900 sm:text-sm">{subtopic.subtopicnumber}</td>
                                                <td className="flex justify-center items-center mt-1">
                                                    <TooltipModalButton toolTitle={subtopic.subtopictitle} toolDetails={subtopic.subtopicdescription} />
                                                </td>

                                                {students.map(student => {
                                                    const judgementValue = getJudgement(student.studentid, subtopic.subtopicid, judgements);
                                                    const bgColorClass = confidenceLevelColors[judgementValue] || '';
                                                    return (
                                                        <td key={`${subtopic.subtopicid}-${student.studentid}`} className={`${bgColorClass} px-1 text-xs lg:px-4 py-2 border-r border border-gray-900 sm:text-sm`} title={`${student.firstname} ${student.lastname}`}>
                                                            {/* Judgement Value can be displayed here if needed */}
                                                            
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </>
                                ))}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
