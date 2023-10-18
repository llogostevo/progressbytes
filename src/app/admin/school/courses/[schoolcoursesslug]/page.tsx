import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'
import AddCourseForm from './AddCourseForm'
import RealTimeCourses from './RealTimeCourses'

export default async function Courses({ params }: { params: { schoolcoursesslug: number } }) {
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

  // get course information
  let { data: coursetable, error } = await supabase
    .from('coursetable')
    .select('*')
    .eq('schoolid', params.schoolcoursesslug)


    let { data: school, error: schoolerror } = await supabase
    .from('schooltable')
    .select('*')
    .eq('schoolid', params.schoolcoursesslug)

    // @ts-ignore
    let schoolName = school[0].schoolname

  return (
    <div>

      <h1 className="text-4xl font-semibold mb-4">Courses</h1>
      <h1 className="text-xl font-semibold mb-4">{schoolName}</h1>

      <AddCourseForm slug={`${params.schoolcoursesslug}`} />
      
      <RealTimeCourses courses={coursetable} />
    </div>

  )
}

