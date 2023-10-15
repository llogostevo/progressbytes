import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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
  console.log(subtopictable)
  return (
    <div className="max-w-screen-lg overflow-auto mx-auto p-4">
      <h1 className="text-4xl font-semibold mb-4">SubTopics</h1>
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
          {subtopictable?.map((subtopic) => (
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
          ))}
        </tbody>
      </table>
    </div>

  )
}

