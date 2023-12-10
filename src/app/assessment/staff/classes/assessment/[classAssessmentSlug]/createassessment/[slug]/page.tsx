import { redirect } from "next/navigation";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from "next/headers";
import AddAssessmentForm from "./AddAssessementForm";

type Student = {
    studentid: number;
    firstname: string;
    lastname: string;
};

type Students = {
    classid: string;
    studentid: number;
    studenttable: Student;
}[];

export default async function CreateAssessment({ params }: { params: {slug: string } }) {
    const classId = decodeURIComponent(params.slug);

    const supabase = createServerComponentClient({ cookies })

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
    // if not at the correct role i.e. admin then redirect to the unauthorised page
    if (!profile || profile[0].admin == false) {
        redirect("/unauthorised")
    }

    // get students from the class, to populate the form checkboxes
    const { data: students, error: studentserror } = await supabase
        .from('enrollmenttable')
        .select(`studentid, 
                courseid, 
                studenttable(
                    studentid, 
                    firstname, 
                    lastname)`)
        .eq('classid', classId);

    return (
        <>
            <h1 className="mb-5 text-2xl text-black">{classId}</h1>
            {/* @ts-ignore */}
            <AddAssessmentForm students={students} />
        </>
    )

}