import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ByteMark() {
    // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })

    // get the users sessions
    const { data: { user } } = await supabase.auth.getUser()

    // check if user is logged in and redirect to page if they are not
    if (!user) {
        redirect("/")
    }

    // check if profile exists in DB
    const { data: profile, error: profileError } = await supabase
        .from('profilestable')
        .select('*')
        .eq('profileid', user.id)

    // check if profile exists in DB, if not redirect to unauthorised
    // if not at the correct role then redirect to the unauthorised page
    if (!profile) {
        redirect("/unauthorised")
    }

    const { data: assessments, error: assessmentError } = await supabase
    .from('assessmenttable')
    .select(`
        assessmentid,
        assessmentdate, 
        assessmentname, 
        questiontable (
            questionid, 
            assessmentid,
            answertable (answerid, questionid)
        )
    `);

    if (assessmentError) {
        console.error('Error:', assessmentError);
    }


    return (
        <div>
            <div className="flex items-center">
                <button className="px-2 py-1 text-xs bg-secondaryColor hover:bg-nonphotblue text-white rounded">
                    <Link href={`/questions/`}><span>All</span></Link>
                </button>
            </div>

            <Link className="inline-block border mt-10 mb-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200" href={`/bytemark/assessment`}>Create New Assessment</Link>

            <section className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">


                {/* Standard Card */}
                <div>
                    {assessments?.map((assessment) => (
                        <div key={assessment.assessmentid} className="bg-white flex flex-col gap-1 p-3 justify-between rounded-lg shadow-lg mb-2">
                            <h2 className="sm:text-base md:text-md lg:text-lg font-semibold mb-2">{assessment.assessmentname} - {assessment.assessmentdate}</h2>
                            <p className="text-sm">{assessment.assessmentdate}</p>
                            <Link href={`./bytemark/${assessment.assessmentid}`} className="text-xs inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-3 py-1 transition duration-200">Edit Assessment</Link>
                        </div>
                    ))}
                </div>
                {/* ...other cards... */}

            </section>


        </div>
    )
}
