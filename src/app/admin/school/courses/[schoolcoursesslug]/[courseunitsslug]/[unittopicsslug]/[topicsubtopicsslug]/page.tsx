import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import RealTimeSubTopics from './RealTimeSubTopics'
import AddSubTopicForm from './AddSubTopicForm'

export default async function SubTopics({ params }: { params: { topicsubtopicsslug: number } }) {
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

  let { data: subtopictable, error } = await supabase
    .from('subtopictable')
    .select('*')
    .eq('topicid', params.topicsubtopicsslug)
    .order('subtopicnumber', { ascending: true })


    let { data: topictable } = await supabase
    .from('topictable')
    .select('*')
    .eq('topicid', params.topicsubtopicsslug)
    .order('topicnumber', { ascending: true })


    // @ts-ignore
    let topicName = topictable[0].topictitle
    // @ts-ignore
    let topicNumber = topictable[0].topicnumber
    // @ts-ignore
    let unitID = topictable[0].unitid


    let { data: unitDetails } = await supabase
    .from('unittable')
    .select('unittitle, unitnumber')
    .eq('unitid', unitID)

    console.log(unitDetails)

    return (
    <div className="max-w-screen-lg overflow-auto mx-auto p-4">
      <h1 className="text-4xl font-semibold mb-4">SubTopics</h1>
      <h2 className="text-xl font-semibold mb-4">Unit {unitDetails?.[0].unitnumber}: {unitDetails?.[0].unittitle}</h2>
      <h3 className="text-xl font-semibold mb-4">{topicNumber} : {topicName}</h3>
      <AddSubTopicForm slug={params.topicsubtopicsslug}/>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">SubTopic Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">SubTopic Title</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* {subtopictable?.map((subtopic) => (
            <tr key={subtopic.subtopicid}>
              <td className="px-6 py-4 text-center  whitespace-nowrap">{subtopic.subtopicnumber}</td>
              <td className="px-6 py-4 overflow-hidden overflow-ellipsis">{subtopic.subtopictitle}</td>
              <td className="px-6 py-4 overflow-hidden overflow-ellipsis">{subtopic.subtopicdescription}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  href={`/${subtopic.subtopicid}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  View
                </Link>
              </td>
            </tr>
          ))} */}
          <RealTimeSubTopics subtopics={subtopictable} />
        </tbody>
      </table>
    </div>

  )
}

