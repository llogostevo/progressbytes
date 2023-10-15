import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import RealTimeTopics from './RealTimeTopics'
import AddTopicForm from './AddTopicForm'

export default async function Units({ params }: { params: { unittopicsslug: number } }) {
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

  let { data: topictable, error } = await supabase
    .from('topictable')
    .select('*')
    .eq('unitid', params.unittopicsslug)
    .order('topicnumber', { ascending: true })

    let { data: unit, error: uniterror } = await supabase
    .from('unittable')
    .select('*')
    .eq('unitid', params.unittopicsslug)

    // @ts-ignore
    let unitName = unit[0].unittitle
    // @ts-ignore
    let unitNumber = unit[0].unitnumber


  console.log(unitName)
  return (
    <div className="max-w-screen-lg overflow-auto mx-auto p-4">
    <h1 className="text-4xl font-semibold mb-4">Topics</h1>
    <h2 className="text-xl font-semibold mb-4">{unitNumber}: {unitName}</h2>

    
    <AddTopicForm slug={params.unittopicsslug}/>
    <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Topic Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Topic Title</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Action</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            <RealTimeTopics topics={topictable}/>
        </tbody>
    </table>
</div>

  )
}

