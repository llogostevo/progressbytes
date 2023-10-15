import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import AddUnitForm from './AddUnitForm'
import RealTimeUnits from './RealTimeUnits'

export default async function Units({ params }: { params: { courseunitsslug: number } }) {
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

  let { data: unittable, error } = await supabase
    .from('unittable')
    .select('*')
    .eq('courseid', params.courseunitsslug)

    let { data: course, error: uniterror } = await supabase
    .from('coursetable')
    .select('*')
    .eq('courseid', params.courseunitsslug)

    // @ts-ignore
    let subject = course[0].subjectname
    // @ts-ignore
    let level = course[0].level
    // @ts-ignore
    let examboard = course[0].examboard
    
  return (
    <div>
      
      <h1 className="text-4xl font-semibold mb-4">Units</h1>
      <h1 className="text-xl font-semibold mb-4">{level} {examboard}  {subject}</h1>

      <AddUnitForm slug={`${params.courseunitsslug}`} />
      
      <RealTimeUnits units={unittable} />

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unittable?.map((unit) => (
          <div key={unit.unitid} className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
            <h3 className="text-2xl font-semibold mb-4">{unit.unitnumber}</h3>
            <h3 className="text-1xl font-semibold mb-4">{unit.unittitle}</h3>

            <Link
              href={`${params.courseunitsslug}/${unit.unitid}`}
              className="inline-block border mt-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
            >
              View
            </Link>
          </div>
        ))}
      </div> */}
    </div>

  )
}

