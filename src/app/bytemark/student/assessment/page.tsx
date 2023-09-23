import formatDateToCustom from "@/lib/dates";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import AddAssessmentForm from "./AddAssessementForm";


export default async function ByteMarkStudent() {


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
    `)
        .order('assessmentdate', { ascending: false });


    if (assessmentError) {
        console.error('Error:', assessmentError);
    }


    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Actual hidden radio inputs */}
                        <input
                            type="radio"
                            id="sortByDate"
                            name="sortOrder"
                            value="assessmentdate"
                            className="hidden"
                            
                        />

                        <input
                            type="radio"
                            id="sortByName"
                            name="sortOrder"
                            value="assessmentname"
                            className="hidden"
                            
                        />

                        {/* Labels styled as buttons */}
                        <label
                            htmlFor="sortByDate"
                            className={`px-2 py-1 text-xs rounded cursor-pointer ${false ? 'bg-secondaryColor text-white' : 'bg-white border border-secondaryColor hover:bg-nonphotblue hover:text-white'}`}
                        >
                            Sort by Date
                        </label>

                        <label
                            htmlFor="sortByName"
                            className={`px-2 py-1 text-xs rounded cursor-pointer ${true ? 'bg-secondaryColor text-white' : 'bg-white border border-secondaryColor hover:bg-nonphotblue hover:text-white'}`}
                        >
                            Sort by Name
                        </label>
                    </div>
                </div>

                
            </div>


            <div className="flex items-center justify-between">


            </div>

            <AddAssessmentForm />

            {/* <Link className="inline-block border mt-10 mb-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200" href={`/bytemark/assessment`}>Create New Assessment</Link> */}

            <section className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">


                {/* Standard Card */}
                <div>
                    {assessments?.map((assessment) => (
                        <div key={assessment.assessmentid} className="bg-white flex flex-col gap-1 p-3 justify-between rounded-lg shadow-lg mb-2">
                            <h2 className="sm:text-base md:text-md lg:text-lg font-semibold mb-2">
                                {assessment.assessmentname}
                            </h2>
                            <p className="text-sm">{formatDateToCustom(assessment.assessmentdate)}</p>

                            <Link href={`./assessment/${assessment.assessmentid}`} className="text-xs inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-3 py-1 transition duration-200">Edit Assessment</Link>
                        </div>
                    ))}
                </div>
                {/* ...end card... */}

            </section>


        </div>
    )
}
