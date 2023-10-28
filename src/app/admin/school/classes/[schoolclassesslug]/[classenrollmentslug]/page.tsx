import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import RealTimeEnrollments from './RealTimeEnrollments'
import EnrollStudentForm from './EnrollStudentForm'

export default async function Courses({ params }: { params: { classenrollmentslug: string } }) {
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
  const { data: classtable, error } = await supabase
    .from('classtable')
    .select('*')
    .eq('classid', decodeURIComponent(params.classenrollmentslug))


    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollmenttable')
      .select(`enrollmentid, 
                studentid,
                classid,
                courseid,
                startdate,
                enddate,
                offroll,
                student: studentid (firstname, lastname, profileid),
                course: courseid (examboard, subjectname, level)`
    )
    .eq('classid', decodeURIComponent(params.classenrollmentslug))



  // @ts-ignore
  const className = classtable[0].classname

  return (
    <div>

      <h1 className="text-4xl font-semibold mb-4">Class Enrollments</h1>
      <h2 className="text-xl font-semibold mb-4">{className}</h2>

      <EnrollStudentForm slug={`${params.classenrollmentslug}`} />

      <RealTimeEnrollments enrollments={enrollments} />
  
    </div>

  )
}

