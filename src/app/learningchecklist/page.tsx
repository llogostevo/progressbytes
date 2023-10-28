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

    // This assumes you have a `todos` table in Supabase. Check out
    // the `Create Table and seed with data` section of the README 👇
    // https://github.com/vercel/next.js/blob/canary/examples/with-supabase/README.md
    const { data: units } = await supabase.from('unittable').select()
    const { data: course } = await supabase.from('coursetable').select()

    const groupedData = course?.map(c => ({
        ...c,
        units: units?.filter(u => u.courseid === c.courseid)
    }));


    return (
        <div className="p-4 bg-gray-100">
            {/* <div className="bg-white p-4 rounded-md shadow-sm mb-4">
                <h2 className="text-xl mb-4 font-semibold">Learning Checklists</h2>
            </div> */}

            {/* Iterate over each course-group */}
            {groupedData?.map((group: CourseGroup) => (
                <div key={group.courseid} >
                    <div className="bg-white p-4 rounded-md shadow-sm mb-4">
                        <h2 className="text-2xl mb-4 font-semibold">{group.subjectname}</h2>
                        <h2 className="text-2sm mb-4 ">{group.level} {group.examboard}</h2>
                    </div>
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {group.units.map((unit: Unit) => (
                            <Link href={`/learningchecklist/${unit.unitid}`} key={unit.unitid}>
                                <div className="bg-white flex flex-col gap-1 p-3 rounded-lg shadow-lg mb-2 min-h-[200px] overflow-y-auto transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                                    <h3 className="sm:text-base md:text-md lg:text-lg font-semibold mb-2">
                                        {unit.courseid}: {unit.unitnumber}
                                    </h3>
                                    <h4 className="sm:text-base md:text-md lg:text-lg mb-2">
                                        {unit.unittitle}
                                    </h4>
                                </div>
                            </Link>
                        ))}
                    </section>
                </div>
            ))}

        </div>
    )
}    