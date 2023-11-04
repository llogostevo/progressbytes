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
            studentid
            )
    `)
        .eq('profileid', user.id);


    let studentId: number;

    if ((profilesData && profilesData.length > 0) && profilesData[0].studenttable[0].studentid) {
        studentId = profilesData[0].studenttable[0].studentid;
        // console.log("Student ID for logged in user:", studentId);
    } else {
        console.log("No matching student record found");
        redirect("/")
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
        <div className="p-">
            {/* <div className="bg-white p-4 rounded-md shadow-sm mb-4">
                <h2 className="text-xl mb-4 font-semibold">Learning Checklists</h2>
            </div> */}

            {/* Iterate over each course-group */}
            {groupedData?.map((group: CourseGroup) => (
                <div key={group.courseid} >
                    <div className="bg-white p-4 mb-4">
                        <h2 className="text-3xl mb-4 font-bold text-gray-800">{group.subjectname}</h2>
                        <h3 className="text-lg mb-4 text-gray-700">{group.level} {group.examboard}</h3>
                    </div>
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {group.units.map((unit: Unit) => (
                            <Link href={`/learningchecklist/${unit.unitid}`} key={unit.unitid}>
                                <div className="bg-white ml-10 flex flex-col gap-1 p-5 rounded-lg shadow-lg mb-2 min-h-[200px] overflow-y-auto transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-300">
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
    )
}  
}  else {
    console.log("No enrollments found for this student.");
    <p>No enrollments found: Please contact your teacher to enroll you to a course</p>
    // Optionally, you could redirect to another page or render an empty state
}
}