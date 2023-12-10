import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function StaffPage() {

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

  const { data: schools, error: schoolsError } = await supabase
    .from('schooltable')
    .select('*')


  return (
    <div>
      <h1 className="text-4xl font-semibold mb-4">Teacher Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools?.map((school) => (
          <div key={school.schoolname} className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
            <h3 className="text-2xl font-semibold mb-4">{school.schoolname}</h3>
            <Link
              href={`/bytemark/staff/classes/${school.schoolid}`}
              className="inline-block border mt-10 border-primaryColor hover:bg-primaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
            >
              Class Dashboards
            </Link>

            <Link
              href={`/admin/school/courses/${school.schoolid}`}
              className="inline-block border mt-10 border-tertiaryColor hover:bg-tertiaryColor hover:text-white hover:border-white text-tertiaryColor rounded px-4 py-2 transition duration-200"
            >
              Admin
            </Link>


          </div>
        ))}
      </div>
    </div>
  )
}
