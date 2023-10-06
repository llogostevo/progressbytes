// TODO: Duplicate or move this file outside the `_examples` folder to make it a route

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link';
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic'

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

    // This assumes you have a `todos` table in Supabase. Check out
    // the `Create Table and seed with data` section of the README 👇
    // https://github.com/vercel/next.js/blob/canary/examples/with-supabase/README.md
    const { data: units } = await supabase.from('unittable').select()

    return (

        <div className="p-4 bg-gray-100"> {/* Added a light gray background for contrast */}

            <div className="bg-white p-4 rounded-md shadow-sm mb-4"> {/* Container for the cards */}
                <h2 className="text-xl mb-4 font-semibold">Learning Checklists</h2>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {units?.map((unit) => (
                    <Link href={`/learningchecklist/${unit.unitid}`}>
                    <div
                        key={unit.unittitle}
                        className="bg-white flex flex-col gap-1 p-3 rounded-lg shadow-lg mb-2 max-h-[200px] overflow-y-auto transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                    >
                        <h2 className="sm:text-base md:text-md lg:text-lg font-semibold mb-2">
                            {unit.courseid}: {unit.unitnumber}
                        </h2>
                        <h2 className="sm:text-base md:text-md lg:text-lg mb-2">
                            {unit.unittitle}
                        </h2>
                        {/* Other elements and code... */}
                    </div>
                    </Link>
                ))}
            </section>

        </div>
    )
}
