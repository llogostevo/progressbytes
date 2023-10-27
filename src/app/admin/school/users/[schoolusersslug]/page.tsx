import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AddUserForm from './AddUserForm'
import RealTimeProfiles from './RealTimeProfiles'

export default async function AddSchoolUsers({ params }: { params: { schoolusersslug: number } }) {
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
  // if not at the correct role i.e. admin then redirect to the unauthorised page
  if (!profile || profile[0].admin == false) {
    redirect("/unauthorised")
  }

  const { data: schoolProfiles, error: schoolProfilesError } = await supabase
    .from('profilestable')
    .select('*')
    .eq('schoolid', params.schoolusersslug)

    console.log(schoolProfilesError)

  let { data: school, error: schoolerror } = await supabase
    .from('schooltable')
    .select('*')
    .eq('schoolid', params.schoolusersslug)

  // @ts-ignore
  let schoolName = school[0].schoolname

  return (
    <div>

      <h1 className="text-4xl font-semibold mb-4">School Users</h1>
      <h2 className="ml-5 text-xl font-semibold mb-4">Add New Users:</h2>
      <h3 className="ml-10 text font-semibold mb-4">{schoolName}</h3>


      <AddUserForm slug={params.schoolusersslug} />


      <RealTimeProfiles schoolProfiles={schoolProfiles} />
    </div>

  )
}

