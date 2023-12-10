import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import TeacherRealTimeClasses from './TeacherRealTimeClasses'

export default async function TeacherChecklistClasses({ params }: { params: { schoolclassesslug: number } }) {
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
  let { data: classtable, error } = await supabase
    .from('classtable')
    .select('*')
    .eq('schoolid', params.schoolclassesslug)


    let { data: school, error: schoolerror } = await supabase
    .from('schooltable')
    .select('*')
    .eq('schoolid', params.schoolclassesslug)

    // @ts-ignore
    let schoolName = school[0].schoolname

  return (
    <div>

      <h1 className="text-4xl font-semibold mb-4">Class Learning Checklists</h1>
      <h1 className="text-xl font-semibold mb-4">{schoolName}</h1>
      
      <TeacherRealTimeClasses classes={classtable} />
    </div>

  )
}

