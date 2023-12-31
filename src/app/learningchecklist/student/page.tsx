import TooltipModalButton from '@/components/tooltipModal/TooltipModalButton';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link';
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic'

interface Unit {
    unitid: string;
    courseid: string;
    unittitle: string;
    unitnumber: string;
    // ... other unit properties ...
}

interface Course {
    courseid: string;
    subjectname: string;
    level: string;
    examboard: string;
    // ... other course properties ...
}

interface CourseGroup {
    courseid: string;
    subjectname: string;
    level: string;
    examboard: string;
    units: Unit[];
}


export default async function coursejudgements() {
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
            firstname,
            studentid
            )
    `)
        .eq('profileid', user.id);

    
        const { data: teacherData, error: teacherDataError } = await supabase
        .from('profilestable')
        .select(`
        profileid, 
        teachertable(
            profileid,
            teacherid
            )
    `)
        .eq('profileid', user.id);


    let studentId: number;
    let studentFirstName: string;


    if (
        profilesData &&
        profilesData.length > 0 &&
        profilesData[0].studenttable &&
        profilesData[0].studenttable.length > 0 &&
        profilesData[0].studenttable[0].studentid
    ) {
        studentId = profilesData[0].studenttable[0].studentid;
        studentFirstName = profilesData[0].studenttable[0].firstname;
    
        // console.log("Student ID for logged in user:", studentId);
    } else if (
        teacherData &&
        teacherData.length > 0 &&
        teacherData[0].teachertable &&
        teacherData[0].teachertable.length > 0 &&
        teacherData[0].teachertable[0].teacherid
    ){
        console.log("teacher")
        redirect("/bytemark/staff");
    }  else {
        console.log("No matching student record found");
        redirect("/admin");
    }

    // check if student profile exists in DB, if not redirect to unauthorised
    // if not at the correct role then redirect to the unauthorised page
    if (!profilesData) {
        redirect("/unauthorised")
    }

    // Fetch the enrollments for that studentid from the enrollmenttable:

    const { data: enrollments } = await supabase
        .from('enrollmenttable')
        .select('courseid')
        .eq('studentid', studentId)
        .eq('offroll', false);


    // Extract the courseid values from the enrollment data:
    const courseIds = enrollments?.map(enrollment => enrollment.courseid);

    if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map(enrollment => enrollment.courseid);

        if (courseIds && courseIds.length > 0) {
            const { data: courses } = await supabase
                .from('coursetable')
                .select()
                .in('courseid', courseIds);

            const { data: units } = await supabase
                .from('unittable')
                .select()
                .in('courseid', courseIds);

            const groupedData = courses?.map(course => ({
                ...course,
                units: units?.filter(unit => unit.courseid === course.courseid)
            }));




            return (
                <div className="">

                    <h2 className="text-4xl mb-4 font-bold text-gray-800">Personalised Learning Checklists</h2>
                    <div className="bg-white p-4 mb-4 gap-3 border border-gray-300 mt-2 rounded-lg">
                        <h2 className="text-3xl mb-4 font-semibold">{studentFirstName}</h2>
                        <TooltipModalButton toolTitle="Learning Checklists:" toolDetails="Click on the corresponding unit below to access the learning checklists for your courses" />
                    {/* Iterate over each course-group */}
                    {groupedData?.map((group: CourseGroup) => (
                        <div key={group.courseid} >
                            <div className="bg-white p-4 mb-4">
                                <h2 className="text-2xl mb-4 font-bold text-gray-800">{group.subjectname}</h2>
                                <h3 className="text-lg mb-4 text-gray-700">{group.level} {group.examboard}</h3>
                            </div>
                            <section className="grid grid-cols-1 sm: md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                                {group.units.map((unit: Unit) => (
                                    <Link href={`/learningchecklist/student/${unit.unitid}`} key={unit.unitid}>
                                        <div className="bg-white ml-1 md:ml-10 flex flex-col gap-1 p-5 rounded-lg shadow-lg mb-2 min-h-[200px] overflow-y-auto transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-300">
                                            <h4 className="sm:text-base md:text-md lg:text-lg font-semibold mb-2">
                                                {unit.unitnumber} {group.subjectname} {group.level} ({group.examboard})
                                            </h4>
                                            <h5 className="sm:text-base md:text-md lg:text-lg mb-2">
                                                {unit.unittitle}
                                            </h5>
                                        </div>
                                    </Link>
                                ))}
                            </section>
                        </div>
                    ))}
                </div>

                </div>
            )
        }
    } else {
        console.log("No enrollments found for this student.");
        <p>No enrollments found: Please contact your teacher to enroll you to a course</p>
    }
}